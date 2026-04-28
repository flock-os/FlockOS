# NOTES (v1.0 as-built)

As of Covenant v1.0 (April 2026):
- All documentation, deployment, and build processes have been updated to reflect the as-built state of the repo and deployment pipeline.
- For canonical architecture, deployment, and build process, see the 'Covenant As-Built v1.0' sections in A-Table of Contents.md, D-Deployment and Connection.md, E-Bezalel Dependencies.md, H-End to End Plan.md, and V-Covenant-v1.0-Release.md.
- This file is maintained for reference and historical context.

## TOPOLOGY RULE (April 2026)

**Firestore is the lead when Firestore is on. GAS remains authoritative for email + auth, and remains the full backend for GAS-only deployments.**

Two write paths exist and BOTH must be kept working:

1. **Firestore-direct path (preferred when `window.UpperRoom.isReady() === true`)**
   Client → `UpperRoom.*` → Firestore write → Cloud Function trigger → POST `?action=sync.write&syncSecret=…` → `handleSyncWrite()` (this file) → Sheet row mirror.
   - Instant client write (~100ms), supports hard delete, supports offline queue, supports real-time listeners.
   - GAS is ONLY consulted for sync.write, email send, and auth/token issuance.

2. **GAS-direct path (fallback, and the only path on legacy GAS-only deploys)**
   Client → `TheVine.*` → GAS handler in `L-Master Code.md` → Sheet row write.
   - Slower (~500–3000ms) but self-contained. No Firestore required.

**Authoring rule:** Any new collection/field/feature MUST be added to BOTH:
- The Firestore path: `UpperRoom` verb in `the_upper_room.js` + Firestore Security Rules + (if needed) `SYNC_TAB_MAP` and `FIELD_REVERSE_MAP` in this file.
- The GAS path: handler + dispatcher line in `L-Master Code.md` (and `O-Master CamelCase.md` for header mapping if applicable).

The view layer (e.g. `the_great_commission/index.js`) routes via a small adapter that prefers UpperRoom when ready and falls back to TheVine otherwise. **Never remove the GAS handlers**: they are the contract for GAS-only deployments and the safety net when Firestore is unavailable.

---

/**
 * FlockOS — GAS Sync Handler (sync.write)
 * ════════════════════════════════════════════════════════════════════════
 *
 * Receives Firestore → Sheets sync calls from the Cloud Function.
 * Paste this entire file into each church's GAS project (Code.gs or a
 * new SyncHandler.gs file).
 *
 * The Cloud Function POSTs:
 *   ?action=sync.write&syncSecret=<secret>
 *   Body: { collection, operation, docId, data, parentId? }
 *
 * This handler:
 *   1. Validates the syncSecret against the SYNC_SECRET property
 *   2. Maps the Firestore collection name to the Sheet tab name
 *   3. Finds or creates the row by docId (column A = "id")
 *   4. Creates / updates / deletes the row
 *
 * SETUP (per church GAS project):
 *   1. File → Project properties → Script properties
 *      Add: SYNC_SECRET = <the same secret stored in Firestore settings/sync>
 *   2. Paste this file into the project
 *   3. In your existing doGet/doPost router, add the sync.write case
 *      (see INTEGRATION POINT below)
 *
 * ════════════════════════════════════════════════════════════════════════
 */


// ── Collection → Sheet Tab mapping ─────────────────────────────────────
var SYNC_TAB_MAP = {
  // App Content (Matthew)
  "books":        "Books",
  "genealogy":    "Genealogy",
  "counseling":   "Counseling",
  "devotionals":  "Devotionals",
  "reading":      "Reading",
  "words":        "Words",
  "heart":        "Heart",
  "mirror":       "Mirror",
  "theology":     "Theology",
  "quiz":         "Quiz",
  "apologetics":  "Apologetics",
  "config":       "Config",

  // Missions (Mark)
  "missionsRegistry":    "MissionsRegistry",
  "missionsRegions":     "MissionsRegions",
  "missionsCities":      "MissionsCities",
  "missionsPartners":    "MissionsPartners",
  "missionsPrayerFocus": "MissionsPrayerFocus",
  "missionsUpdates":     "MissionsUpdates",
  "missionsTeams":       "MissionsTeams",
  "missionsMetrics":     "MissionsMetrics",

  // Statistics (Luke)
  "statisticsConfig":    "StatisticsConfig",
  "statisticsSnapshots": "StatisticsSnapshots",
  "statisticsViews":     "StatisticsCustomViews",

  // Pastoral Core (John)
  "members":        "Members",
  "prayers":        "PrayerRequests",
  "journal":        "JournalEntries",
  "contactLog":     "ContactLog",
  "pastoralNotes":  "PastoralNotes",
  "milestones":     "Milestones",
  "households":     "Households",
  "todos":          "ToDo",

  // Events & Attendance
  "attendance":      "Attendance",
  "events":          "Events",
  "rsvps":           "EventRSVPs",
  "calendarEvents":  "CalendarEvents",
  "checkinSessions": "CheckInSessions",

  // Groups
  "groups":        "SmallGroups",
  "groupMembers":  "SmallGroupMembers",

  // Finance
  "giving":   "Giving",
  "pledges":  "GivingPledges",

  // Volunteers
  "volunteers": "VolunteerSchedule",

  // Communications
  "conversations":  "CommsThreads",
  "messages":       "CommsMessages",
  "notifications":  "CommsNotifications",
  "templates":      "CommsTemplates",
  "broadcasts":     "CommsBroadcastLog",

  // Ministries
  "ministries": "Ministries",

  // Service Planning & Music
  "servicePlans": "ServicePlans",
  "songs":        "Songs",
  "albums":       "Albums",

  // Sermons
  "sermons":       "Sermons",
  "sermonSeries":  "SermonSeries",
  "sermonReviews": "SermonReviews",

  // Spiritual Care
  "careCases":        "SpiritualCareCases",
  "careInteractions": "SpiritualCareInteractions",
  "careAssignments":  "SpiritualCareAssignments",

  // Compassion
  "compassionRequests":  "CompassionRequests",
  "compassionLogs":      "CompassionTeamLog",
  "compassionResources": "CompassionResources",

  // Outreach
  "outreachContacts":  "OutreachContacts",
  "outreachCampaigns": "OutreachCampaigns",
  "outreachFollowUps": "OutreachFollowUps",

  // Discipleship
  "discipleshipPaths":        "DiscipleshipPaths",
  "discipleshipSteps":        "DiscipleshipSteps",
  "discipleshipEnrollments":  "DiscipleshipEnrollments",
  "discipleshipMentoring":    "DiscipleshipMentoring",
  "discipleshipMeetings":     "DiscipleshipMeetings",
  "discipleshipAssessments":  "DiscipleshipAssessments",
  "discipleshipMilestones":   "DiscipleshipMilestones",
  "discipleshipGoals":        "DiscipleshipGoals",
  "discipleshipCertificates": "DiscipleshipCertificates",

  // Learning
  "learningTopics":          "LearningTopics",
  "learningPlaylists":       "LearningPlaylists",
  "learningPlaylistItems":   "LearningPlaylistItems",
  "learningProgress":        "LearningProgress",
  "learningNotes":           "LearningNotes",
  "learningBookmarks":       "LearningBookmarks",
  "learningRecommendations": "LearningRecommendations",
  "learningQuizzes":         "LearningQuizzes",
  "learningQuizResults":     "LearningQuizResults",
  "learningCertificates":    "LearningCertificates",

  // Theology (admin)
  "theologyCategories": "TheologyCategories",
  "theologySections":   "TheologySections",

  // Member Cards
  "memberCards":     "MemberCards",
  "cardLinks":       "MemberCardLinks",
  "memberCardViews": "MemberCardViews",

  // Auth / System
  "users":         "AuthUsers",
  "accessControl": "AccessControl",
  "permissions":   "Permissions",

  // Settings (notification prefs stored as settings/notifPrefs_*)
  "settings": "Settings"
};


// ── Firestore camelCase → GAS Title Case header map (per collection) ──
// DEFINED IN: CamelCase.gs  (source: O-Master CamelCase.md)
// This file is a separate GAS module that must be pasted alongside SyncHandler.gs.
// It contains FIELD_REVERSE_MAP for ALL ~60 collections — auto-generated from
// L-Master Code.md column constants.  Do NOT redefine FIELD_REVERSE_MAP here.
//
// Retained below: the original small set of read-only Truth-content collections
// (books, genealogy, counseling, etc.) that were hand-authored before the
// auto-generation approach.  CamelCase.gs supersedes these for all Pastoral tabs.
var FIELD_REVERSE_MAP = {
  "books": {
    "bookName": "Book Name", "testament": "Testament", "genre": "Genre",
    "summary": "Summary", "coreTheology": "Core Theology",
    "practicalApplication": "Practical Application"
    // booknum maps to itself — no alias needed
  },
  "genealogy": {
    "name": "Name", "title": "Title", "lifespan": "Lifespan",
    "meaning": "Meaning", "reference": "Reference", "bio": "Bio",
    "children": "Children", "personId": "ID"
  },
  "counseling": {
    "title": "Title", "icon": "Icon", "color": "Color",
    "definition": "Definition", "scriptures": "Scriptures",
    "steps": "Steps", "topicId": "ID"
  },
  "devotionals": {
    "date": "Date", "title": "Title", "theme": "Theme",
    "scripture": "Scripture", "reflection": "Reflection",
    "question": "Question", "prayer": "Prayer"
  },
  "words": {
    "english": "English", "strongs": "Strong's", "original": "Original",
    "transliteration": "Transliteration", "definition": "Definition",
    "nuance": "Nuance", "testament": "Testament", "theme": "Theme",
    "usageCount": "Usage Count", "verses": "Verses"
  },
  "heart": {
    "questionId": "Question ID", "category": "Category",
    "chartAxis": "Chart Axis", "question": "Question",
    "prescription": "Prescription", "verseReference": "Verse Reference"
  },
  "mirror": {
    "categoryId": "Category ID", "categoryTitle": "Category Title",
    "color": "Color", "chartLabel": "Chart Label",
    "questionId": "Question ID", "question": "Question",
    "prescription": "Prescription", "scripture": "Scripture", "slug": "Slug"
  },
  "quiz": {
    "quizId": "ID", "question": "Question",
    "optionA": "Option A", "optionB": "Option B",
    "optionC": "Option C", "optionD": "Option D",
    "correctAnswer": "Correct Answer", "reference": "Reference",
    "category": "Category", "difficulty": "Difficulty"
  },
  "apologetics": {
    "categoryId": "Category ID", "categoryTitle": "Category Title",
    "categoryColor": "Category Color", "categoryIntro": "Category Intro",
    "questionId": "Question ID", "questionTitle": "Question Title",
    "shortTitle": "Short Title", "answerContent": "Answer Content",
    "quoteText": "Quote Text", "referenceText": "Reference Text",
    "referenceUrl": "Reference URL"
  },
  "theology": {
    "categoryId": "Category ID", "categoryTitle": "Category Title",
    "categoryIntro": "Category Intro", "sectionId": "Section ID",
    "sectionTitle": "Section Title", "content": "Content"
  },
  "reading": {
    "oldTestament": "Old Testament", "newTestament": "New Testament",
    "psalms": "Psalms", "proverbs": "Proverbs"
  },

  // Spiritual Care Cases — camelCase Firestore keys → Title Case sheet headers
  "careCases": {
    "memberId":             "Member ID",
    "careType":             "Care Type",
    "priority":             "Priority",
    "status":               "Status",
    "summary":              "Summary",
    "assignedTeamId":       "Assigned Team ID",
    "primaryCaregiverId":   "Primary Caregiver ID",
    "secondaryCaregiverId": "Secondary Caregiver ID",
    "openedDate":           "Opened Date",
    "targetResolveDate":    "Target Resolve Date",
    "resolvedDate":         "Resolved Date",
    "referralInfo":         "Referral Info",
    "confidential":         "Confidential",
    "notes":                "Notes",
    "riskLevel":            "Risk Level",
    "supportPresence":      "Support Presence",
    "spiritualState":       "Spiritual State",
    "trend":                "Trend",
    "linkedCaseId":         "Linked Case ID",
    "nextReviewDate":       "Next Review Date",
    "createdBy":            "Created By",
    "createdAt":            "Created At",
    "updatedBy":            "Updated By",
    "updatedAt":            "Updated At"
  },

  // Members — memberPin surfaces as "ID" in column A;
  // firestoreId (internal) is used for row matching.
  // Other camelCase → Title Case mappings so columns stay clean.
  "members": {
    "memberPin":         "ID",
    "firstName":         "First Name",
    "lastName":          "Last Name",
    "preferredName":     "Preferred Name",
    "suffix":            "Suffix",
    "dateOfBirth":       "Date of Birth",
    "gender":            "Gender",
    "photoUrl":          "Photo URL",
    "primaryEmail":      "Primary Email",
    "secondaryEmail":    "Secondary Email",
    "cellPhone":         "Cell Phone",
    "homePhone":         "Home Phone",
    "workPhone":         "Work Phone",
    "preferredContact":  "Preferred Contact",
    "address1":          "Street Address 1",
    "address2":          "Street Address 2",
    "city":              "City",
    "state":             "State",
    "zip":               "ZIP Code",
    "country":           "Country",
    "membershipStatus":  "Membership Status",
    "memberSince":       "Member Since",
    "howTheyFoundUs":    "How They Found Us",
    "baptismDate":       "Baptism Date",
    "salvationDate":     "Salvation Date",
    "dateOfDeath":       "Date of Death",
    "householdId":       "Household ID",
    "familyRole":        "Family Role",
    "maritalStatus":     "Marital Status",
    "spouseName":        "Spouse Name",
    "emergencyContact":  "Emergency Contact",
    "emergencyPhone":    "Emergency Phone",
    "ministryTeams":     "Ministry Teams",
    "volunteerRoles":    "Volunteer Roles",
    "spiritualGifts":    "Spiritual Gifts",
    "smallGroup":        "Small Group",
    "pastoralNotes":     "Pastoral Notes",
    "lastContactDate":   "Last Contact Date",
    "nextFollowUp":      "Next Follow-Up",
    "followUpPriority":  "Follow-Up Priority",
    "assignedTo":        "Assigned To",
    "tags":              "Tags",
    "archived":          "Archived",
    "archiveReason":     "Archive Reason",
    "createdBy":         "Created By",
    "createdAt":         "Created At",
    "updatedBy":         "Updated By",
    "updatedAt":         "Updated At",
    "website":           "Website Link",
    "colorScheme":       "Color Scheme",
    "bgScheme":          "BG Scheme",
    "memberNumber":      "Member Number",
    "memberPin":         "ID"
  }
};


// ── Firestore Timestamp → readable string ──────────────────────────────
function _ts(val) {
  if (!val) return val;
  var secs;
  // Object form: { _seconds, _nanoseconds } (older SDK) or { seconds, nanoseconds } (newer SDK)
  if (val._seconds !== undefined) secs = val._seconds;
  else if (val.seconds !== undefined) secs = val.seconds;
  // String form: "Timestamp(seconds=1776410856, nanoseconds=491000000)"
  else if (typeof val === "string") {
    var m = val.match(/Timestamp\(seconds=(\d+)/);
    if (m) secs = parseInt(m[1], 10);
  }
  if (secs !== undefined) {
    var d = new Date(secs * 1000);
    var mo = d.getMonth() + 1;
    var dy = d.getDate();
    var yr = d.getFullYear();
    var hh = d.getHours();
    var mm = d.getMinutes();
    var ss = d.getSeconds();
    return (mo < 10 ? "0" + mo : mo) + "/" +
           (dy < 10 ? "0" + dy : dy) + "/" + yr + " " +
           (hh < 10 ? "0" + hh : hh) + ":" +
           (mm < 10 ? "0" + mm : mm) + ":" +
           (ss < 10 ? "0" + ss : ss);
  }
  // Already an ISO string or other date string → reformat
  if (typeof val === "string" && val.match(/^\d{4}-/)) {
    var d2 = new Date(val);
    if (!isNaN(d2.getTime())) {
      var mo2 = d2.getMonth() + 1;
      var dy2 = d2.getDate();
      var yr2 = d2.getFullYear();
      var hh2 = d2.getHours();
      var mm2 = d2.getMinutes();
      var ss2 = d2.getSeconds();
      return (mo2 < 10 ? "0" + mo2 : mo2) + "/" +
             (dy2 < 10 ? "0" + dy2 : dy2) + "/" + yr2 + " " +
             (hh2 < 10 ? "0" + hh2 : hh2) + ":" +
             (mm2 < 10 ? "0" + mm2 : mm2) + ":" +
             (ss2 < 10 ? "0" + ss2 : ss2);
    }
    return val;
  }
  return String(val);
}

// ── Flatten nested objects for Sheet columns ───────────────────────────
function _flattenData(data, collection) {
  if (!data) return {};
  var reverseMap = (collection && FIELD_REVERSE_MAP[collection]) || {};
  var flat = {};
  for (var key in data) {
    var val = data[key];
    // Remap camelCase key to GAS Title Case header if mapping exists
    var mappedKey = reverseMap[key] || key;
    if (val === null || val === undefined) {
      flat[mappedKey] = "";
    } else if (val._seconds !== undefined || val.seconds !== undefined) {
      flat[mappedKey] = _ts(val);
    } else if (Array.isArray(val)) {
      flat[mappedKey] = JSON.stringify(val);
    } else if (typeof val === "object") {
      flat[mappedKey] = JSON.stringify(val);
    } else {
      flat[mappedKey] = val;
    }
  }
  return flat;
}


// ════════════════════════════════════════════════════════════════════════
// MAIN HANDLER — call this from your doPost router
// ════════════════════════════════════════════════════════════════════════

/**
 * Handle a sync.write request from the Cloud Function.
 *
 * @param {Object} params - URL params (must include syncSecret)
 * @param {Object} body   - Parsed JSON body: { collection, operation, docId, data, parentId? }
 * @returns {Object}      - { ok: true } or { ok: false, error: "..." }
 */
function handleSyncWrite(params, body) {
  // ── Auth check ──────────────────────────────────────────────────────
  var expectedSecret = PropertiesService.getScriptProperties().getProperty("SYNC_SECRET");
  if (!expectedSecret || params.syncSecret !== expectedSecret) {
    return { ok: false, error: "Invalid or missing syncSecret" };
  }

  var collection = body.collection;
  var operation  = body.operation;   // "create" | "update" | "delete"
  var docId      = body.docId;
  var data       = body.data || {};
  var parentId   = body.parentId || "";

  // ── Resolve Sheet tab ───────────────────────────────────────────────
  var tabName = SYNC_TAB_MAP[collection];
  if (!tabName) {
    // Unknown collection — skip silently (might be ephemeral/internal)
    return { ok: true, skipped: true, reason: "unmapped collection: " + collection };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(tabName);

  // Members collection: column A = "ID" (memberPin), "firestoreId" for matching.
  // All other collections: column A = "ID" (Firestore docId) for matching.
  var isMembersTab = (collection === "members");
  var matchColName = isMembersTab ? "firestoreId" : "ID";

  // Auto-create tab if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    if (isMembersTab) {
      // Members tab: col A = "ID" (human-readable pin), col B = "firestoreId" (internal)
      sheet.getRange(1, 1).setValue("ID");
      sheet.getRange(1, 2).setValue("firestoreId");
    } else {
      sheet.getRange(1, 1).setValue("ID");
      if (parentId) sheet.getRange(1, 2).setValue("parentId");
    }
  }

  // ── Get headers ─────────────────────────────────────────────────────
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0]
    .map(function(h) { return String(h).trim(); });

  // Ensure the match column exists in headers
  var matchCol = headers.indexOf(matchColName);
  if (matchCol === -1) {
    var hasAnyHeader = headers.some(function(h) { return h !== ""; });
    if (!hasAnyHeader) {
      if (isMembersTab) {
        sheet.getRange(1, 1).setValue("ID");
        sheet.getRange(1, 2).setValue("firestoreId");
        headers = ["ID", "firestoreId"];
      } else {
        sheet.getRange(1, 1).setValue("ID");
        headers = ["ID"];
      }
      matchCol = isMembersTab ? 1 : 0;
    } else {
      if (isMembersTab) {
        // Members sheet exists but no "firestoreId" yet — append it
        var nextCol = headers.length + 1;
        sheet.getRange(1, nextCol).setValue("firestoreId");
        headers.push("firestoreId");
        matchCol = headers.length - 1;
        // Also ensure "ID" header exists in col A (rename "id" → "ID" if needed)
        if (headers[0] === "id") {
          sheet.getRange(1, 1).setValue("ID");
          headers[0] = "ID";
        } else if (headers.indexOf("ID") === -1) {
          // Prepend "ID" column
          sheet.insertColumnBefore(1);
          sheet.getRange(1, 1).setValue("ID");
          headers.unshift("ID");
          matchCol = headers.indexOf("firestoreId");
        }
      } else {
        // Rename existing lowercase "id" header to "ID" if needed
        if (headers[0] === "id") {
          sheet.getRange(1, 1).setValue("ID");
          headers[0] = "ID";
        } else if (headers.indexOf("ID") === -1) {
          sheet.insertColumnBefore(1);
          sheet.getRange(1, 1).setValue("ID");
          headers.unshift("ID");
        }
        matchCol = 0;
      }
    }
  }

  // ── Find existing row by docId ──────────────────────────────────────
  var lastRow = sheet.getLastRow();
  var existingRow = -1;

  if (lastRow > 1) {
    var idValues = sheet.getRange(2, matchCol + 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < idValues.length; i++) {
      if (String(idValues[i][0]).trim() === String(docId).trim()) {
        existingRow = i + 2;  // 1-indexed, skip header
        break;
      }
    }
  }

  // ── DELETE ──────────────────────────────────────────────────────────
  if (operation === "delete") {
    if (existingRow > 0) {
      sheet.deleteRow(existingRow);
      return { ok: true, operation: "delete", tab: tabName, row: existingRow };
    }
    return { ok: true, operation: "delete", tab: tabName, skipped: true, reason: "row not found" };
  }

  // ── Flatten data ────────────────────────────────────────────────────
  var flat = _flattenData(data, collection);
  if (isMembersTab) {
    // "ID" (col A) = memberPin; "firestoreId" = Firestore docId (internal match key)
    flat["ID"] = (data && data.memberPin) ? data.memberPin : (flat["ID"] || "");
    flat["firestoreId"] = docId;
    // Remove raw camelCase duplicate — already mapped to "ID" via FIELD_REVERSE_MAP
    delete flat["memberPin"];
  } else {
    flat["ID"] = docId;
  }
  if (parentId) flat["parentId"] = parentId;

  // ── Normalize any remaining camelCase keys to existing headers ────────
  // Safety net: if FIELD_REVERSE_MAP didn't map a field (e.g., new or unknown
  // collection), try matching by stripping spaces and lowercasing both sides.
  // This prevents bare camelCase fields from creating new columns when the
  // Title Case header already exists (e.g. "serviceType" → "Service Type").
  var _norm = function(s) { return String(s).replace(/\s+/g, '').toLowerCase(); };
  var _headerNormMap = {};
  headers.forEach(function(h) { _headerNormMap[_norm(h)] = h; });
  var flatNormalized = {};
  for (var fk in flat) {
    var canonical = _headerNormMap[_norm(fk)];
    flatNormalized[canonical || fk] = flat[fk];
  }
  flat = flatNormalized;

  // ── Ensure all data keys exist as headers ───────────────────────────
  var newHeaders = [];
  for (var key in flat) {
    if (headers.indexOf(key) === -1) {
      newHeaders.push(key);
    }
  }
  if (newHeaders.length > 0) {
    var startCol = headers.length + 1;
    for (var j = 0; j < newHeaders.length; j++) {
      sheet.getRange(1, startCol + j).setValue(newHeaders[j]);
      headers.push(newHeaders[j]);
    }
  }

  // ── Build row values ────────────────────────────────────────────────
  var rowValues = headers.map(function(h) {
    return flat.hasOwnProperty(h) ? flat[h] : "";
  });

  // ── CREATE or UPDATE ────────────────────────────────────────────────
  if (existingRow > 0) {
    // Update existing row
    sheet.getRange(existingRow, 1, 1, rowValues.length).setValues([rowValues]);
    return { ok: true, operation: "update", tab: tabName, row: existingRow };
  } else {
    // Append new row
    var newRow = lastRow + 1;
    sheet.getRange(newRow, 1, 1, rowValues.length).setValues([rowValues]);
    return { ok: true, operation: "create", tab: tabName, row: newRow };
  }
}


// ════════════════════════════════════════════════════════════════════════
// INTEGRATION POINT
// ════════════════════════════════════════════════════════════════════════
//
// In your existing doPost(e) or doGet(e) router, add this case:
//
//   case "sync.write":
//     return _json(handleSyncWrite(params, JSON.parse(e.postData.contents)));
//
// Where _json() is your standard ContentService JSON helper:
//
//   function _json(obj) {
//     return ContentService
//       .createTextOutput(JSON.stringify(obj))
//       .setMimeType(ContentService.MimeType.JSON);
//   }
//
// ════════════════════════════════════════════════════════════════════════
