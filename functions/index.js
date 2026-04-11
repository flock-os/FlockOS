/**
 * FlockOS — Firestore → Google Sheets Sync
 *
 * Real-time Cloud Functions that mirror every Firestore write back to the
 * corresponding Google Sheet tab via the church's GAS endpoint.
 *
 * Architecture:
 *   Each church has its OWN Firebase project. Collections live at the root
 *   of that project — no churches/{churchId}/ nesting needed.
 *
 *   1. Firestore trigger fires on create/update/delete under
 *      {collection}/{docId}  (and subcollections)
 *   2. Function looks up the GAS endpoint URL + sync secret from
 *      settings/sync  (root-level document in this project)
 *   3. POSTs to GAS: ?action=sync.write&syncSecret=...
 *      Body: { collection, operation, docId, data, parentId? }
 *   4. GAS sync.write handler validates the secret, routes to the correct
 *      sheet tab, and performs the row write/update/delete.
 *
 * Setup (per church Firebase project):
 *   Firestore doc  settings/sync  must contain:
 *     {
 *       gasEndpoint: "https://script.google.com/macros/s/.../exec",
 *       syncSecret:  "<shared-secret>"
 *     }
 *   Run setupFirestoreSync() from the church's GAS project to write this.
 *
 * Deploy to each church's project:
 *   firebase use <project-id>
 *   firebase deploy --only functions
 */

const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { initializeApp }     = require("firebase-admin/app");
const { getFirestore }      = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

// ── Config cache ───────────────────────────────────────────────────────
// Reads settings/sync once and caches for 5 min.
let _configCache = null;
let _configTs    = 0;
const CONFIG_TTL = 5 * 60000;

async function _getConfig() {
  if (_configCache && Date.now() - _configTs < CONFIG_TTL) return _configCache;

  const doc = await db.collection("settings").doc("sync").get();
  if (!doc.exists) return null;
  const data = doc.data();
  if (!data.gasEndpoint || !data.syncSecret) return null;

  _configCache = { gasEndpoint: data.gasEndpoint, syncSecret: data.syncSecret };
  _configTs    = Date.now();
  return _configCache;
}

// ── GAS call helper ────────────────────────────────────────────────────
async function _pushToGAS(config, payload) {
  const url = config.gasEndpoint
    + "?action=sync.write"
    + "&syncSecret=" + encodeURIComponent(config.syncSecret);

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });

  if (!resp.ok) {
    throw new Error("GAS returned HTTP " + resp.status);
  }
  const json = await resp.json();
  if (json && json.error) {
    throw new Error("GAS error: " + (json.error || json.message));
  }
  return json;
}

// ── Determine operation type from the write event ──────────────────────
function _opType(change) {
  if (!change.before.exists && change.after.exists)  return "create";
  if (change.before.exists  && change.after.exists)  return "update";
  if (change.before.exists  && !change.after.exists) return "delete";
  return null;
}

// ── Collections to SKIP syncing (ephemeral / real-time only) ───────────
const SKIP_COLLECTIONS = new Set([
  "typing",           // ephemeral typing indicators
  "appConfig",        // local config, not in sheets
  "preferences",      // per-user UI prefs
  "auditLog",         // server-generated, read-only
  "users",            // auth data — GAS-only, never sync (contains hashed passwords)
  "accessControl",    // RBAC — GAS-only
  "permissions",      // per-user overrides — GAS-only
]);

// ── Map Firestore camelCase fields back to Sheet header names ──────────
// (inverse of _fieldAliases in the_tabernacle.js — only needed for
//  Truth content collections that were imported with camelCase)
const TRUTH_COLLECTIONS = new Set([
  "devotionals", "reading", "books", "genealogy", "counseling",
  "words", "heart", "mirror", "quiz", "theology", "apologetics",
]);

// ── Main trigger: top-level collections ────────────────────────────────
// Path: {collection}/{docId}  (root-level — each project IS a church)
exports.syncToSheets = onDocumentWritten(
  {
    document: "{collection}/{docId}",
    region: "us-central1",
  },
  async (event) => {
    const { collection, docId } = event.params;

    if (SKIP_COLLECTIONS.has(collection)) return;

    const op = _opType(event.data);
    if (!op) return;

    const config = await _getConfig();
    if (!config) return;  // no sync config → skip silently

    const data = op === "delete" ? null : event.data.after.data();

    try {
      await _pushToGAS(config, { collection, operation: op, docId, data });
    } catch (err) {
      console.error(`[sync] ${collection}/${docId} ${op} FAILED:`, err.message);
    }
  }
);

// ── Subcollection trigger: conversation messages ───────────────────────
exports.syncMessages = onDocumentWritten(
  {
    document: "conversations/{convoId}/messages/{msgId}",
    region: "us-central1",
  },
  async (event) => {
    const { convoId, msgId } = event.params;

    const op = _opType(event.data);
    if (!op) return;

    const config = await _getConfig();
    if (!config) return;

    const data = op === "delete" ? null : event.data.after.data();

    try {
      await _pushToGAS(config, {
        collection: "messages",
        operation: op,
        docId: msgId,
        parentId: convoId,
        data,
      });
    } catch (err) {
      console.error(`[sync] conversations/${convoId}/messages/${msgId} ${op} FAILED:`, err.message);
    }
  }
);

// ── Subcollection trigger: group members ───────────────────────────────
exports.syncGroupMembers = onDocumentWritten(
  {
    document: "groups/{groupId}/members/{memberId}",
    region: "us-central1",
  },
  async (event) => {
    const { groupId, memberId } = event.params;

    const op = _opType(event.data);
    if (!op) return;

    const config = await _getConfig();
    if (!config) return;

    const data = op === "delete" ? null : event.data.after.data();

    try {
      await _pushToGAS(config, {
        collection: "groupMembers",
        operation: op,
        docId: memberId,
        parentId: groupId,
        data,
      });
    } catch (err) {
      console.error(`[sync] groups/${groupId}/members/${memberId} ${op} FAILED:`, err.message);
    }
  }
);

// ── Subcollection trigger: member card links ───────────────────────────
exports.syncCardLinks = onDocumentWritten(
  {
    document: "memberCards/{cardId}/links/{linkId}",
    region: "us-central1",
  },
  async (event) => {
    const { cardId, linkId } = event.params;

    const op = _opType(event.data);
    if (!op) return;

    const config = await _getConfig();
    if (!config) return;

    const data = op === "delete" ? null : event.data.after.data();

    try {
      await _pushToGAS(config, {
        collection: "cardLinks",
        operation: op,
        docId: linkId,
        parentId: cardId,
        data,
      });
    } catch (err) {
      console.error(`[sync] memberCards/${cardId}/links/${linkId} ${op} FAILED:`, err.message);
    }
  }
);
