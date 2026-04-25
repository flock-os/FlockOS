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
const { onSchedule }       = require("firebase-functions/v2/scheduler");
const { initializeApp }     = require("firebase-admin/app");
const { getFirestore }      = require("firebase-admin/firestore");
const { getMessaging }      = require("firebase-admin/messaging");
const { defineSecret }      = require("firebase-functions/params");
const { onCall, onRequest } = require("firebase-functions/v2/https");

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
      // If this write came from the inbound GitHub sync, don't push back to GitHub
      if (data._syncSource === "github") return;
    }
    // Skip creates from the inbound GitHub sync
    if (op === "create" && data._syncSource === "github") return;

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

// ══════════════════════════════════════════════════════════════════════════
// PUSH NOTIFICATIONS — send push via FCM
// ══════════════════════════════════════════════════════════════════════════

/**
 * sendPushNotification — Callable Cloud Function
 * Sends push notification to specified user(s) or all subscribed users.
 * Reads FCM tokens from pushTokens/{email} collection.
 *
 * @param {object} data
 * @param {string} data.title   - notification title
 * @param {string} data.body    - notification body
 * @param {string[]} [data.recipients] - array of emails; omit for broadcast
 * @param {string} [data.icon]  - notification icon URL
 * @param {string} [data.click_action] - URL to open on click
 * @param {string} [data.tag]   - notification tag for dedup
 */
exports.sendPushNotification = onCall(async (request) => {
  const data = request.data || {};
  if (!data.title) throw new Error("title is required");

  const messaging = getMessaging();
  let tokens = [];

  if (data.recipients && Array.isArray(data.recipients) && data.recipients.length > 0) {
    // Send to specific users
    const snapshots = await Promise.all(
      data.recipients.map(email => db.collection("pushTokens").doc(email).get())
    );
    snapshots.forEach(snap => {
      if (snap.exists && snap.data().token) tokens.push(snap.data().token);
    });
  } else {
    // Broadcast to all subscribed users
    const allTokens = await db.collection("pushTokens").get();
    allTokens.forEach(doc => {
      if (doc.data().token) tokens.push(doc.data().token);
    });
  }

  if (!tokens.length) return { sent: 0, message: "No push tokens found" };

  const message = {
    notification: {
      title: data.title,
      body:  data.body || "",
    },
    data: {
      title:        data.title || "",
      body:         data.body  || "",
      click_action: data.click_action || "",
      tag:          data.tag   || "flockos-push",
    },
    tokens: tokens,
  };

  const result = await messaging.sendEachForMulticast(message);

  // Clean up invalid tokens
  if (result.failureCount > 0) {
    const invalidTokens = [];
    result.responses.forEach((resp, idx) => {
      if (!resp.success && resp.error &&
          (resp.error.code === "messaging/invalid-registration-token" ||
           resp.error.code === "messaging/registration-token-not-registered")) {
        invalidTokens.push(tokens[idx]);
      }
    });
    if (invalidTokens.length > 0) {
      const batch = db.batch();
      const allDocs = await db.collection("pushTokens").where("token", "in", invalidTokens).get();
      allDocs.forEach(doc => batch.delete(doc.ref));
      await batch.commit().catch(() => {});
    }
  }

  return { sent: result.successCount, failed: result.failureCount };
});

/**
 * Firestore trigger: auto-send push for high-priority care cases.
 * Fires when a care case is created with priority Critical or High.
 */
exports.pushOnCriticalCare = onDocumentWritten("care/{docId}", async (event) => {
  const after = event.data?.after?.data();
  const before = event.data?.before?.data();
  if (!after) return; // deleted

  // Only trigger on new cases or priority escalation to Critical/High
  const priority = (after.priority || "").toLowerCase();
  if (priority !== "critical" && priority !== "high" && priority !== "urgent") return;

  // Don't re-trigger if priority didn't change
  if (before && (before.priority || "").toLowerCase() === priority) return;

  const messaging = getMessaging();

  // Get all pastor+ role tokens (or fall back to all tokens)
  const allTokens = await db.collection("pushTokens").get();
  const tokens = [];
  allTokens.forEach(doc => {
    if (doc.data().token) tokens.push(doc.data().token);
  });

  if (!tokens.length) return;

  await messaging.sendEachForMulticast({
    notification: {
      title: "⚠️ " + (priority === "critical" || priority === "urgent" ? "URGENT" : "High Priority") + " Care Case",
      body:  (after.careType || "Care case") + " — " + (after.summary || "").substring(0, 80),
    },
    data: {
      click_action: "/FlockOS/Pages/the_good_shepherd.html",
      tag: "care-" + event.params.docId,
    },
    tokens: tokens,
  }).catch(err => console.error("[pushOnCriticalCare]", err.message));
});

// ══════════════════════════════════════════════════════════════════════════
// SCHEDULED EXPORTS — runs every Monday at 7 AM UTC
// Checks scheduledReports collection for due reports, fetches data via
// the church's GAS endpoint, and sends summary emails via push notification.
// ══════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════
// DAILY PASTORAL SUMMARY — runs every day at 14:00 UTC (≈6 AM Pacific)
// Calls the church's GAS endpoint with action=daily.summary + syncSecret,
// which triggers dailyPastoralSummary() on the GAS side and sends email
// to all configured pastoral slots via GmailApp.
//
// Requires settings/sync to have: { gasEndpoint, syncSecret }
// DAILY_SUMMARY_ENABLED (AppConfig) controls whether GAS sends the email.
// ══════════════════════════════════════════════════════════════════════════

exports.dailyPastoralSummaryTask = onSchedule("every day 14:00", async () => {
  const config = await _getConfig();
  if (!config || !config.gasEndpoint || !config.syncSecret) {
    console.log("[dailyPastoralSummaryTask] No GAS endpoint/syncSecret configured — skipping.");
    return;
  }

  const url = config.gasEndpoint + "?action=daily.summary&syncSecret=" + encodeURIComponent(config.syncSecret);
  try {
    const resp = await fetch(url, { method: "GET", redirect: "follow" });
    const body = await resp.json().catch(() => ({}));
    if (body.ok) {
      console.log("[dailyPastoralSummaryTask] ✓ Daily summary triggered successfully.");
    } else {
      console.warn("[dailyPastoralSummaryTask] GAS returned error:", body.error || JSON.stringify(body));
    }
  } catch (err) {
    console.error("[dailyPastoralSummaryTask]", err.message);
  }
});

exports.processScheduledReports = onSchedule("every monday 07:00", async () => {
  const now = new Date();
  const dayOfMonth = now.getDate();
  const month = now.getMonth();
  const weekOfYear = Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / (7 * 86400000));

  const snap = await db.collection("scheduledReports").where("enabled", "==", true).get();
  if (snap.empty) { console.log("[scheduledReports] No active schedules."); return; }

  for (const doc of snap.docs) {
    const sched = doc.data();
    const freq = (sched.frequency || "").toLowerCase();

    // Check if this schedule is due
    let isDue = false;
    if (freq === "weekly") isDue = true; // every Monday
    else if (freq === "biweekly") isDue = weekOfYear % 2 === 0;
    else if (freq === "monthly") isDue = dayOfMonth <= 7; // first Monday of month
    else if (freq === "quarterly") isDue = dayOfMonth <= 7 && (month % 3 === 0);

    if (!isDue) continue;

    const recipients = sched.recipients || [];
    if (!recipients.length) continue;

    console.log(`[scheduledReports] Processing: ${sched.reportType} → ${recipients.join(", ")}`);

    try {
      // Fetch report data from GAS endpoint
      const config = await _getConfig();
      if (!config || !config.gasEndpoint) {
        console.warn("[scheduledReports] No GAS endpoint configured.");
        continue;
      }

      const resp = await fetch(config.gasEndpoint + "?action=report." + sched.reportType + "&days=30", {
        method: "GET",
        redirect: "follow",
      });
      const reportData = await resp.json().catch(() => ({}));

      // Send push notification to each recipient with report summary
      const messaging = getMessaging();
      const tokens = [];
      for (const email of recipients) {
        const tokenDoc = await db.collection("pushTokens").doc(email).get();
        if (tokenDoc.exists && tokenDoc.data().token) tokens.push(tokenDoc.data().token);
      }

      if (tokens.length) {
        const reportName = sched.reportName || sched.reportType || "Report";
        const summary = reportData.summary || reportData.message || "Your scheduled report is ready.";
        await messaging.sendEachForMulticast({
          notification: {
            title: "📊 " + reportName,
            body: typeof summary === "string" ? summary.substring(0, 200) : "Report generated — open FlockOS to view.",
          },
          data: {
            click_action: "/FlockOS/Pages/the_good_shepherd.html",
            tag: "scheduled-" + doc.id,
          },
          tokens: tokens,
        });
      }

      // Update last-run timestamp
      await db.collection("scheduledReports").doc(doc.id).update({
        lastRun: new Date().toISOString(),
      });

      console.log(`[scheduledReports] ✓ ${sched.reportType} sent to ${tokens.length} devices`);
    } catch (err) {
      console.error(`[scheduledReports] ✗ ${sched.reportType}: ${err.message}`);
    }
  }
});

// ── GitHub Issues → Firestore sync (inbound) ────────────────────────────
// Runs every hour. Fetches all open issues from the GitHub repo and
// upserts them into the Firestore `problems` collection.  Also marks
// Firestore problems as "Closed" if the linked issue was closed on GitHub.
exports.syncGitHubInbound = onSchedule(
  {
    schedule:  "every 60 minutes",
    region:    "us-central1",
    secrets:   [GITHUB_TOKEN],
    timeoutSeconds: 120,
  },
  async () => {
    const token = GITHUB_TOKEN.value();
    if (!token) { console.warn("[syncGitHubInbound] No GITHUB_TOKEN"); return; }

    const REPO = "flock-os/FlockOS";
    const API  = "https://api.github.com";
    const headers = {
      "Authorization":        "Bearer " + token,
      "Accept":               "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    // 1. Fetch all open issues from GitHub (paginated)
    let ghIssues = [];
    let page = 1;
    while (true) {
      const resp = await fetch(
        `${API}/repos/${REPO}/issues?state=open&per_page=100&page=${page}`,
        { headers }
      );
      if (!resp.ok) {
        console.error(`[syncGitHubInbound] GitHub API error: ${resp.status}`);
        return;
      }
      const batch = await resp.json();
      // Filter out pull requests (GitHub API returns PRs in /issues too)
      ghIssues = ghIssues.concat(batch.filter(i => !i.pull_request));
      if (batch.length < 100) break;
      page++;
    }

    // 2. Build a map of existing Firestore problems keyed by githubIssueNumber
    const snap = await db.collection("problems").get();
    const byIssueNum = {};
    snap.docs.forEach(d => {
      const data = d.data();
      if (data.githubIssueNumber) byIssueNum[data.githubIssueNumber] = { id: d.id, data };
    });

    const openNums = new Set();

    // 3. Upsert GitHub issues into Firestore
    for (const issue of ghIssues) {
      openNums.add(issue.number);
      const existing = byIssueNum[issue.number];

      const priority = (issue.labels || []).find(l => l.name && l.name.startsWith("priority:"));
      const problemData = {
        title:             issue.title,
        description:       issue.body || "",
        status:            "Open",
        priority:          priority ? priority.name.replace("priority:", "").charAt(0).toUpperCase() + priority.name.replace("priority:", "").slice(1) : "Medium",
        githubIssueNumber: issue.number,
        githubIssueUrl:    issue.html_url,
        createdBy:         issue.user ? issue.user.login : "GitHub",
        updatedAt:         issue.updated_at,
        _syncSource:       "github",
      };

      if (existing) {
        // Only update if GitHub issue was modified after our last sync
        if (existing.data.updatedAt !== issue.updated_at) {
          await db.collection("problems").doc(existing.id).update(problemData);
        }
      } else {
        // New issue — create in Firestore
        problemData.createdAt = issue.created_at;
        await db.collection("problems").add(problemData);
      }
    }

    // 4. Close Firestore problems whose linked GitHub issue is no longer open
    for (const [num, entry] of Object.entries(byIssueNum)) {
      if (!openNums.has(Number(num)) && entry.data.status !== "Closed") {
        await db.collection("problems").doc(entry.id).update({
          status: "Closed",
          _syncSource: "github",
        });
      }
    }

    console.log(`[syncGitHubInbound] ✓ ${ghIssues.length} open issues synced, ${Object.keys(byIssueNum).length} existing tracked`);
  }
);

/**
 * serveCalendarICS — HTTP endpoint that returns an iCal (.ics) feed.
 *
 * Query parameters:
 *   token  — optional share token (from calendarTokens/{token}).
 *             If provided, the feed includes the token owner's personal
 *             events plus all public church events.
 *             If omitted, only public events are returned.
 *
 * Usage in iOS / Google Calendar:
 *   Subscribe to: https://us-central1-<projectId>.cloudfunctions.net/serveCalendarICS?token=<token>
 */
exports.serveCalendarICS = onRequest(
  { region: "us-central1", cors: true },
  async (req, res) => {
    const token = req.query.token || "";

    // ── 1. Resolve user email from share token (if provided) ──────────
    let userEmail = null;
    if (token) {
      const tokDoc = await db.collection("calendarTokens").doc(token).get();
      if (tokDoc.exists) {
        userEmail = tokDoc.data().email || null;
      }
    }

    // ── 2. Fetch public church events ─────────────────────────────────
    let pool = [];

    const evSnap = await db.collection("events")
      .where("visibility", "==", "public")
      .limit(300)
      .get();
    evSnap.forEach(function(doc) {
      const d = Object.assign({ id: doc.id }, doc.data());
      if ((d.status || "").toLowerCase() === "archived") return;
      if ((d.status || "").toLowerCase() === "cancelled") return;
      pool.push({
        uid:         d.id + "@flockos-event",
        summary:     d.title || d.name || "Event",
        dtstart:     _icsDatetime(d.date || d.startDate, d.time || d.startTime),
        dtend:       _icsDatetime(d.date || d.startDate, d.endTime),
        location:    d.location || "",
        description: d.description || "",
        allDay:      !(d.time || d.startTime),
      });
    });

    // ── 3. Fetch personal events for the token owner ──────────────────
    if (userEmail) {
      const calSnap = await db.collection("calendarEvents")
        .where("email", "==", userEmail)
        .limit(300)
        .get();
      calSnap.forEach(function(doc) {
        const d = Object.assign({ id: doc.id }, doc.data());
        // StartDateTime is stored as "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm"
        const startDt  = (typeof d.StartDateTime === "string") ? d.StartDateTime : "";
        const endDt    = (typeof d.EndDateTime   === "string") ? d.EndDateTime   : "";
        // Require at least a 10-char date prefix before extracting parts
        if (startDt.length < 10) return;
        const datePart = startDt.substring(0, 10);
        // Time part is expected to be "HH:mm" (5 chars at position 11)
        const timePart = d.IsAllDay ? "" : (startDt.length >= 16 ? startDt.substring(11, 16) : "");
        const endPart  = d.IsAllDay ? "" : (endDt.length   >= 16 ? endDt.substring(11, 16)   : "");
        pool.push({
          uid:         d.id + "@flockos-personal",
          summary:     d.Title || "Event",
          dtstart:     _icsDatetime(datePart, timePart),
          dtend:       _icsDatetime(datePart, endPart),
          location:    d.Location || "",
          description: d.Description || "",
          allDay:      !!(d.IsAllDay),
        });
      });
    }

    // ── 4. Generate iCal output ───────────────────────────────────────
    const dtstamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "").substring(0, 15) + "Z";
    let ical = "BEGIN:VCALENDAR\r\n";
    ical += "VERSION:2.0\r\n";
    ical += "PRODID:-//FlockOS//Church CRM Calendar//EN\r\n";
    ical += "CALSCALE:GREGORIAN\r\n";
    ical += "METHOD:PUBLISH\r\n";
    ical += "X-WR-CALNAME:FlockOS Calendar\r\n";

    pool.forEach(function(ev) {
      if (!ev.dtstart) return;
      ical += "BEGIN:VEVENT\r\n";
      ical += "UID:" + ev.uid + "\r\n";
      ical += "DTSTAMP:" + dtstamp + "\r\n";
      ical += "DTSTART" + (ev.allDay ? ";VALUE=DATE" : "") + ":" + ev.dtstart + "\r\n";
      ical += "DTEND"   + (ev.allDay ? ";VALUE=DATE" : "") + ":" + (ev.dtend || ev.dtstart) + "\r\n";
      ical += "SUMMARY:" + _icsEsc(ev.summary) + "\r\n";
      if (ev.location)    ical += "LOCATION:"    + _icsEsc(ev.location)    + "\r\n";
      if (ev.description) ical += "DESCRIPTION:" + _icsEsc(ev.description) + "\r\n";
      ical += "STATUS:CONFIRMED\r\n";
      ical += "END:VEVENT\r\n";
    });

    ical += "END:VCALENDAR\r\n";

    res.set("Content-Type", "text/calendar;charset=utf-8");
    res.set("Content-Disposition", "attachment; filename=\"flockos-calendar.ics\"");
    res.set("Cache-Control", "no-cache, no-store");
    res.status(200).send(ical);
  }
);

// ── iCal helpers ──────────────────────────────────────────────────────────

function _icsDatetime(datePart, timePart) {
  if (!datePart) return "";
  const d = datePart.replace(/-/g, "");
  if (!timePart) return d;                      // all-day: VALUE=DATE
  // timePart is expected as "HH:mm"; strip colon and pad seconds to "HHmmss"
  const t = timePart.replace(/:/g, "");
  const ts = t.length === 4 ? t + "00" : t;    // pad HHmm → HHmmss
  return d + "T" + ts;
}

function _icsEsc(s) {
  return String(s || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}
