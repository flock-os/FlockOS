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
const { defineSecret }      = require("firebase-functions/params");
const { onCall }            = require("firebase-functions/v2/https");

const GITHUB_TOKEN = defineSecret("GITHUB_TOKEN");

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
  "problems",         // issue tracker — has its own GitHub sync (syncProblems)
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

// ── Problems → GitHub Issues sync ────────────────────────────────────
// On create  → opens a new GitHub Issue and writes back the issue number.
// On update  → patches the title/body/state of the existing issue.
// On delete  → closes the issue.
exports.syncProblems = onDocumentWritten(
  {
    document: "problems/{docId}",
    region:   "us-central1",
    secrets:  [GITHUB_TOKEN],
  },
  async (event) => {
    const token = GITHUB_TOKEN.value();
    if (!token) return;

    const { docId } = event.params;
    const op = _opType(event.data);
    if (!op) return;

    const REPO   = "flock-os/FlockOS";
    const API    = "https://api.github.com";
    const headers = {
      "Authorization":        "Bearer " + token,
      "Accept":               "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type":         "application/json",
    };

    // ── DELETE: close the linked issue ───────────────────────────────
    if (op === "delete") {
      const before = event.data.before.data();
      const issueNum = before && before.githubIssueNumber;
      if (!issueNum) return;
      await fetch(`${API}/repos/${REPO}/issues/${issueNum}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ state: "closed", state_reason: "not_planned" }),
      });
      return;
    }

    const data = event.data.after.data();
    if (!data) return;

    // ── UPDATE: skip the write-back echo triggered by syncProblems itself ─
    if (op === "update") {
      const before = event.data.before.data() || {};
      // If before had no issueNumber and after has one, this is the write-back — skip
      if (!before.githubIssueNumber && data.githubIssueNumber) return;
    }

    const title  = data.title || "(Untitled Problem)";
    const body   = _buildProblemBody(data);
    const labels = _buildProblemLabels(data);
    const state  = data.status === "Closed" ? "closed" : "open";

    // ── CREATE: open a new issue ──────────────────────────────────────
    if (op === "create") {
      const resp = await fetch(`${API}/repos/${REPO}/issues`, {
        method: "POST",
        headers,
        body: JSON.stringify({ title, body, labels }),
      });
      if (!resp.ok) {
        console.error(`[problems] GitHub create failed: HTTP ${resp.status}`, await resp.text());
        return;
      }
      const issue = await resp.json();
      // Write back the issue number so the dashboard can link to it.
      // This triggers a second update event which is filtered above.
      await db.collection("problems").doc(docId).update({
        githubIssueNumber: issue.number,
        githubIssueUrl:    issue.html_url,
      });
      return;
    }

    // ── UPDATE: patch the existing issue ──────────────────────────────
    const issueNum = data.githubIssueNumber;
    if (!issueNum) return; // created before sync was deployed
    const patchResp = await fetch(`${API}/repos/${REPO}/issues/${issueNum}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ title, body, labels, state }),
    });
    if (!patchResp.ok) {
      console.error(`[problems] GitHub patch failed: HTTP ${patchResp.status}`, await patchResp.text());
    }
  }
);

function _buildProblemBody(data) {
  const lines = [];
  if (data.description) lines.push(data.description, "");
  lines.push("---");
  lines.push(`**Priority:** ${data.priority || "Medium"}`);
  lines.push(`**Status:** ${data.status || "Open"}`);
  if (data.assignedTo) lines.push(`**Assigned To:** ${data.assignedTo}`);
  if (data.createdBy)  lines.push(`**Reported By:** ${data.createdBy}`);
  lines.push("", "*Synced from FlockOS Admin Dashboard*");
  return lines.join("\n");
}

function _buildProblemLabels(data) {
  const labels = [];
  if (data.priority) labels.push("priority:" + data.priority.toLowerCase());
  const status = (data.status || "open").toLowerCase().replace(/\s+/g, "-");
  labels.push("status:" + status);
  return labels;
}

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

// ── Master Config → All Churches push ─────────────────────────────────
//
// Triggered whenever a masterConfig/{key} doc is written in the
// flockos-notify (master) Firebase project.
//
// For each active church in the churches/ collection:
//   1. POSTs action=config.set to the church's GAS endpoint
//   2. GAS writes the value to the AppConfig sheet + church Firestore
//
// Churches must have MASTER_SYNC_SECRET set as a GAS Script Property
// matching the syncSecret stored in churches/{id} here.
//
// To push a single key:  write to masterConfig/{KEY} in flockos-notify
// To push all keys:      call the pushAllMasterConfig callable function
//
exports.syncMasterConfig = onDocumentWritten(
  {
    document: "masterConfig/{key}",
    region:   "us-central1",
  },
  async (event) => {
    const { key } = event.params;
    const op = _opType(event.data);
    if (!op || op === "delete") return;

    const data = event.data.after.data();
    if (!data) return;

    const value       = data.value       ?? "";
    const description = data.description ?? "";
    const category    = data.category    ?? "";

    await _pushConfigKeyToAllChurches(key, value, description, category);
  }
);

// ── Callable: push ALL master config keys to all churches ──────────────
// Called from the Admin Dashboard "Push to All Churches" button.
// Returns { results: [{ churchId, name, status, error? }] }
//
exports.pushAllMasterConfig = onCall(
  { region: "us-central1" },
  async (request) => {
    // Require caller to be authenticated (admin check done client-side;
    // the function itself only writes config values so the risk is low,
    // but we at least require a signed-in user).
    if (!request.auth) {
      throw new Error("unauthenticated");
    }

    // Load all masterConfig keys from Firestore
    const snap = await db.collection("masterConfig").get();
    if (snap.empty) {
      return { results: [], message: "No masterConfig keys found." };
    }

    const results = [];

    for (const doc of snap.docs) {
      const data        = doc.data();
      const key         = doc.id;
      const value       = data.value       ?? "";
      const description = data.description ?? "";
      const category    = data.category    ?? "";

      const churchResults = await _pushConfigKeyToAllChurches(key, value, description, category);
      results.push(...churchResults);
    }

    // Aggregate by church
    const byChurch = {};
    for (const r of results) {
      if (!byChurch[r.churchId]) byChurch[r.churchId] = { churchId: r.churchId, name: r.name, ok: 0, fail: 0, errors: [] };
      if (r.ok) byChurch[r.churchId].ok++;
      else {
        byChurch[r.churchId].fail++;
        byChurch[r.churchId].errors.push(r.key + ": " + r.error);
      }
    }

    return { results: Object.values(byChurch) };
  }
);

// ── Helper: push a single config key to every active church ───────────
async function _pushConfigKeyToAllChurches(key, value, description, category) {
  // Load church registry from flockos-notify
  const churchSnap = await db.collection("churches").where("active", "==", true).get();
  if (churchSnap.empty) {
    console.warn("[masterConfig] No active churches found in churches/ collection.");
    return [];
  }

  const results = [];

  await Promise.allSettled(
    churchSnap.docs.map(async (churchDoc) => {
      const church = churchDoc.data();
      const churchId = church.id || churchDoc.id;

      if (!church.databaseUrl) {
        results.push({ churchId, name: church.name, key, ok: false, error: "No databaseUrl" });
        return;
      }

      const syncSecret = church.syncSecret || "";
      const url = church.databaseUrl
        + "?action=config.set"
        + "&syncSecret=" + encodeURIComponent(syncSecret);

      try {
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({ key, value, description, category }),
          redirect: "follow",
        });

        if (!resp.ok) {
          throw new Error("HTTP " + resp.status);
        }

        const json = await resp.json().catch(() => ({}));
        if (json && json.error) throw new Error(json.error);

        console.log(`[masterConfig] ✓ ${churchId} — ${key}=${value}`);
        results.push({ churchId, name: church.name, key, ok: true });
      } catch (err) {
        console.error(`[masterConfig] ✗ ${churchId} — ${key}: ${err.message}`);
        results.push({ churchId, name: church.name, key, ok: false, error: err.message });
      }
    })
  );

  return results;
}
