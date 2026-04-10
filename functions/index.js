/**
 * FlockOS — Firestore → Google Sheets Sync
 *
 * Real-time Cloud Functions that mirror every Firestore write back to the
 * corresponding Google Sheet tab via the church's GAS endpoint.
 *
 * Architecture:
 *   1. Firestore trigger fires on create/update/delete under
 *      churches/{churchId}/{collection}/{docId}  (and subcollections)
 *   2. Function looks up the church's GAS endpoint URL + sync secret from
 *      churches/{churchId}/settings/sync
 *   3. POSTs to GAS: ?action=sync.write&syncSecret=...
 *      Body: { collection, operation, docId, data, parentId? }
 *   4. GAS sync.write handler validates the secret, routes to the correct
 *      sheet tab, and performs the row write/update/delete.
 *
 * Setup (per church):
 *   Firestore doc  churches/{churchId}/settings/sync  must contain:
 *     {
 *       gasEndpoint: "https://script.google.com/macros/s/.../exec",
 *       syncSecret:  "<shared-secret>"
 *     }
 */

const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { defineSecret }      = require("firebase-functions/params");
const { initializeApp }     = require("firebase-admin/app");
const { getFirestore }      = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

// ── Config cache (per church) ──────────────────────────────────────────
// Avoids reading settings/sync on every single trigger.
const _configCache = {};          // { churchId: { gasEndpoint, syncSecret, ts } }
const CONFIG_TTL   = 5 * 60000;  // refresh every 5 min

async function _getChurchConfig(churchId) {
  const cached = _configCache[churchId];
  if (cached && Date.now() - cached.ts < CONFIG_TTL) return cached;

  const doc = await db.collection("churches").doc(churchId)
    .collection("settings").doc("sync").get();

  if (!doc.exists) return null;
  const data = doc.data();
  if (!data.gasEndpoint || !data.syncSecret) return null;

  const config = { gasEndpoint: data.gasEndpoint, syncSecret: data.syncSecret, ts: Date.now() };
  _configCache[churchId] = config;
  return config;
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
]);

// ── Map Firestore camelCase fields back to Sheet header names ──────────
// (inverse of _fieldAliases in the_tabernacle.js — only needed for
//  Truth content collections that were imported with camelCase)
const TRUTH_COLLECTIONS = new Set([
  "devotionals", "reading", "books", "genealogy", "counseling",
  "words", "heart", "mirror", "quiz", "theology", "apologetics",
]);

// ── Main trigger: top-level collections ────────────────────────────────
// Path: churches/{churchId}/{collection}/{docId}
exports.syncToSheets = onDocumentWritten(
  {
    document: "churches/{churchId}/{collection}/{docId}",
    region: "us-central1",
  },
  async (event) => {
    const { churchId, collection, docId } = event.params;

    if (SKIP_COLLECTIONS.has(collection)) return;

    const op = _opType(event.data);
    if (!op) return;

    const config = await _getChurchConfig(churchId);
    if (!config) return;  // no sync config → skip silently

    const data = op === "delete" ? null : event.data.after.data();

    try {
      await _pushToGAS(config, { collection, operation: op, docId, data });
    } catch (err) {
      console.error(`[sync] ${churchId}/${collection}/${docId} ${op} FAILED:`, err.message);
    }
  }
);

// ── Subcollection trigger: conversation messages ───────────────────────
exports.syncMessages = onDocumentWritten(
  {
    document: "churches/{churchId}/conversations/{convoId}/messages/{msgId}",
    region: "us-central1",
  },
  async (event) => {
    const { churchId, convoId, msgId } = event.params;

    const op = _opType(event.data);
    if (!op) return;

    const config = await _getChurchConfig(churchId);
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
      console.error(`[sync] ${churchId}/conversations/${convoId}/messages/${msgId} ${op} FAILED:`, err.message);
    }
  }
);

// ── Subcollection trigger: group members ───────────────────────────────
exports.syncGroupMembers = onDocumentWritten(
  {
    document: "churches/{churchId}/groups/{groupId}/members/{memberId}",
    region: "us-central1",
  },
  async (event) => {
    const { churchId, groupId, memberId } = event.params;

    const op = _opType(event.data);
    if (!op) return;

    const config = await _getChurchConfig(churchId);
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
      console.error(`[sync] ${churchId}/groups/${groupId}/members/${memberId} ${op} FAILED:`, err.message);
    }
  }
);

// ── Subcollection trigger: member card links ───────────────────────────
exports.syncCardLinks = onDocumentWritten(
  {
    document: "churches/{churchId}/memberCards/{cardId}/links/{linkId}",
    region: "us-central1",
  },
  async (event) => {
    const { churchId, cardId, linkId } = event.params;

    const op = _opType(event.data);
    if (!op) return;

    const config = await _getChurchConfig(churchId);
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
      console.error(`[sync] ${churchId}/memberCards/${cardId}/links/${linkId} ${op} FAILED:`, err.message);
    }
  }
);
