# Single-Sheet Architecture — Feasibility Analysis

> **Status:** ✅ **COMPLETED** — All 4 sheets consolidated into 1 Google Sheet; all 4 GAS projects consolidated into `Single.gs` (~24,965 lines)  
> **Date:** March 27, 2026 (analysis) · 2025 (implemented)  
> **Scope:** Consolidating all 4 Google Sheets into 1, with an expansion model for growth
>
> **⚠️ AS-BUILT NOTE:** This migration has been completed. The system now runs on 1 Google Sheet (200 tabs),
> 1 GAS Web App (`Single.gs`), and 1 endpoint (`DATABASE_URL`). The folder `FlockOS-GS/` is now `FlockOS/`.
> Historical analysis below reflects the pre-migration architecture.

---

## Original Architecture (4 Sheets, 4 GAS Projects) — Pre-Migration

> **Note:** This section describes the pre-migration state. See AS-BUILT note at top for current state.

| Gospel | Role | Tabs | Avg Cols | GAS File Lines |
|--------|------|------|----------|----------------|
| **John** (Flock) | CRM — Members, Care, Groups, etc. | 82 | ~14 | ~10,000 |
| **Mark** (Missions) | Missions & Persecution tracking | 8 | ~22 | ~6,500 |
| **Luke** (Extra) | Statistics & Analytics | 3 | ~30 | ~2,500 |
| **Matthew** (App) | Public Content (Devotionals, etc.) | 12 | ~10 | ~1,137 |
| **Total** | | **105** | ~15.5 | **~20,137** |

Each sheet had its own GAS project with a separate `doGet()` entry point and deployed Web App URL.  \nThe frontend (`TheVine`) routed to 4 separate endpoint branches. **This has been replaced by the unified architecture (see top).**

---

## What "Single Sheet" Means

**One Google Spreadsheet** containing all 105 tabs.  
**One GAS project** with one `doGet()` entry point.  
**One deployed Web App URL** that handles every API action.

---

## Google Sheets Limits That Matter

| Limit | Value | Our Usage (Estimated) |
|-------|-------|-----------------------|
| Cells per spreadsheet | **10,000,000** | ~1,627 cols × rows |
| Tabs per spreadsheet | **200** (soft) | **105** tabs (52% used) |
| Rows per tab (practical) | ~50,000–100,000 | Varies by church size |
| GAS execution time | **6 minutes** per call | Single reads: < 5 sec |
| GAS daily triggers | 90 min/day | N/A (Web App, no triggers) |
| Code.gs file size | No hard limit | ~20K lines combined |
| Deployed Web App URLs | 1 per project | **1** (down from 4) |

### Cell Budget Math

At **1,627 total columns** across 105 tabs:

| Rows per tab | Total Cells | % of 10M Limit |
|--------------|-------------|-----------------|
| 100 | 162,700 | 1.6% |
| 500 | 813,500 | 8.1% |
| 1,000 | 1,627,000 | 16.3% |
| 2,500 | 4,067,500 | 40.7% |
| 5,000 | 8,135,000 | **81.4%** |

**Bottom line:** A small-to-medium church (< 2,500 members) has plenty of room. A large church pushing 5,000+ rows per tab would hit the ceiling.

---

## What We Already Have That Makes This Easier

### 1. TheVine Action Routing (the_true_vine.js)

TheVine already maps every API call to an action string like `members.list`, `sermons.create`, `missions.trips.list`. Today it picks which *endpoint* (Matthew/Mark/Luke/John URL) to send it to. In a single-sheet world, all actions go to the same URL — **the routing simplifies**.

```
BEFORE:  TheVine → pick endpoint branch → send to 1 of 4 URLs
AFTER:   TheVine → send everything to 1 URL
```

### 2. The Wellspring — Unified Local + Sync Layer

Currently split across two files:
- **the_wellspring.js** — IndexedDB local data layer (offline CRUD, action resolver)
- **the_well.js** — Google Drive sync (backup/restore/template)

In the single-sheet architecture, these merge into **one file: `the_wellspring.js`** ("The Wellspring"). The combined module handles:

1. **Offline data** — IndexedDB storage + TheVine LOCAL_RESOLVER hook (existing Wellspring)
2. **Backup/Restore** — Export live data to `.xlsx`, import `.xlsx` back (existing Well)
3. **Template generation** — Create blank `.xlsx` with all tab headers (existing Well)
4. **Drive sync** — Pull/push single `.xlsx` to Google Drive (existing Well, simplified from 4 files to 1)
5. **Vault** — PIN-protected offline credential storage (existing Wellspring)

The 4-spring model (`app`, `flock`, `missions`, `extra`) collapses to **1 spring** — the entire database is one logical unit. IndexedDB store keys simplify from `flock:Members`, `app:Books` to just `1`, `2`, etc. (matching the numeric tab names).

```javascript
// BEFORE (two files, four springs)
TheWellspring.load('flock', file);    // one of 4 xlsx files
TheWell.sync({ springs: ['flock'] }); // sync one spring

// AFTER (one file, one spring)
TheWellspring.load(file);             // the one xlsx file
TheWellspring.sync();                 // sync everything
TheWellspring.backup();               // export everything
TheWellspring.template();             // blank xlsx with headers
```

**Cloud SQL removed.** The SQL settings UI (Section 11 in Control Panel), `sql.test` / `sql.status` API routes, `Sql.gs` handlers, and all `SQL_ENABLED` / `SQL_INSTANCE` / `SQL_DATABASE` / `SQL_USER` AppConfig keys are dropped. The schema file (`flockos_schema.sql`) is retained as reference documentation only.

### 4. Setup.gs Already Creates All Tabs Programmatically

`setupFlockOS()` (formerly `setupExpansion()`) in Single.gs creates all 200 tabs. The individual setup functions (`setupAppApi`, `setupMissionsApi`, `setupExtraApi`) are also included. Running `setupFlockOS()` once creates the entire unified database.

---

## The Unified doGet() — How It Would Work

One combined Code.gs (~20K lines) with a single router:

```javascript
function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  var action = String(params.action || '').trim();

  // Health check (no auth)
  if (action === 'health') return asJson({ status: 'ok', tabs: 105 });

  // Public actions (no auth required)
  if (action === 'app.tab')        return asJson(handleAppTab_(params));
  if (action === 'prayer.submit')  return asJson(handlePrayerSubmit_(params));
  if (action === 'prayer.listPublic') return asJson(handlePrayerListPublic_(params));

  // Everything else requires auth
  var auth = requireAuth_(params);

  // Route by prefix
  if (action.startsWith('missions.'))  return asJson(routeMissions_(action, params, auth));
  if (action.startsWith('stats.'))     return asJson(routeStatistics_(action, params, auth));

  // Default: FLOCK CRM actions (80% of traffic)
  return asJson(routeFlock_(action, params, auth));
}
```

**Key change:** Auth validation (`requireAuth_`) no longer cross-calls John's URL — it reads directly from the same spreadsheet. This **eliminates the network hop** that Mark and Luke currently make to validate tokens.

---

## The Expansion Model — "Loading" Additional Sheets

This is the most interesting part. When one sheet starts filling up, you don't migrate — you **add a shard**.

### How It Works

```
┌─────────────────────────────────────┐
│  PRIMARY SHEET (Sheet A)            │
│  • All 105 tabs                     │
│  • Active data (current year)       │
│  • All writes go here               │
│  • GAS Code.gs lives here           │
└──────────────┬──────────────────────┘
               │  When approaching limits...
               ▼
┌─────────────────────────────────────┐
│  ARCHIVE SHEET (Sheet B)            │
│  • Same 105-tab structure           │
│  • Older/archived data              │
│  • Read-only from GAS perspective   │
│  • Linked via ARCHIVE_SHEET_ID      │
└─────────────────────────────────────┘
               │  If Sheet B fills...
               ▼
┌─────────────────────────────────────┐
│  ARCHIVE SHEET (Sheet C)            │
│  • Same pattern continues           │
└─────────────────────────────────────┘
```

### Archive Configuration (Script Properties)

```
SHEET_ID          = "primary_sheet_id"         ← All writes
ARCHIVE_SHEET_IDS = "sheet_b_id,sheet_c_id"    ← Read-only shards
```

### Archive-Aware Reads

```javascript
function listMembers_(params, auth) {
  // 1. Read from primary sheet (current/active data)
  var primary = readTab_('Members', db());

  // 2. If archive sheets exist and params.includeArchive !== false
  var archives = getArchiveSheetIds_();
  if (archives.length && params.includeArchive !== false) {
    archives.forEach(function(sheetId) {
      var archiveDb = SpreadsheetApp.openById(sheetId);
      var older = readTab_('Members', archiveDb);
      primary = primary.concat(older);
    });
  }

  return { data: primary };
}
```

### Archive Lifecycle

| Phase | Trigger | Action |
|-------|---------|--------|
| **Green** | < 50% cell budget | Normal operation |
| **Yellow** | 50–75% cell budget | Dashboard warning, suggest archive |
| **Orange** | 75–90% cell budget | Auto-archive prompt in Control Panel |
| **Red** | > 90% cell budget | Block new row creation, force archive |

### What Gets Archived

Not all tabs grow equally. The heavy growers are:

| Tab | Why It Grows | Archive Strategy |
|-----|-------------|-----------------|
| AuditLog | Every action logged | Archive entries > 6 months |
| AuthAudit | Every login/auth event | Archive entries > 6 months |
| CommsMessages | Every message sent | Archive read/old threads > 1 year |
| InteractionLedger | Every pastoral touch | Archive entries > 1 year |
| Giving | Every donation | Archive by fiscal year |
| Attendance | Every check-in | Archive by calendar year |
| PrayerRequests | Every submission | Archive resolved > 6 months |
| ToDo | Every task | Archive completed > 3 months |

### The Archive Action

One button in Control Panel:

```
[Archive Data Older Than: [6 months ▾]]  [Preview]  [Archive Now]
```

1. **Preview** — Shows row counts that would move per tab
2. **Archive Now** — For each eligible tab:
   - Copy old rows to Archive Sheet (same tab name)
   - Delete old rows from Primary Sheet
   - Log the operation to AuditLog
3. Primary sheet cell count drops immediately

---

## Frontend Changes Required

### TheVine (the_true_vine.js)

```javascript
// BEFORE: 4 endpoint branches
const APP_ENDPOINTS = [{ PRIMARY: '...', SECONDARY: '...', TERTIARY: '...' }];
const FLOCK_ENDPOINTS = [{ PRIMARY: '...', SECONDARY: '...', TERTIARY: '...' }];
const MISSIONS_ENDPOINTS = [{ PRIMARY: '...', SECONDARY: '...', TERTIARY: '...' }];
const EXTRA_ENDPOINTS = [{ PRIMARY: '...', SECONDARY: '...', TERTIARY: '...' }];

// AFTER: 1 endpoint
const ENDPOINTS = [{ PRIMARY: '...', SECONDARY: '...', TERTIARY: '...' }];
```

Every `TheVine.flock()`, `TheVine.app()`, `TheVine.missions()`, `TheVine.extra()` call would go to the same URL. The action string already differentiates everything.

**Alternative:** Keep the 4 branch methods for code clarity but point them all at the same endpoint. Zero frontend refactoring needed beyond changing the URL constants.

### The Wellspring (the_wellspring.js — merged from the_wellspring.js + the_well.js)

**Two files become one.** The 4-spring model collapses to a single database. Drive sync goes from 4 `.xlsx` files to 1. IndexedDB keys use numeric tab names (`1`, `2`, ...) matching the backend. `the_well.js` is retired — all its capabilities (backup, restore, template, Drive sync) move into `the_wellspring.js`.

---

## What You Gain

| Benefit | Impact |
|---------|--------|
| **1 deployment** instead of 4 | One URL to manage, one GAS project to update |
| **No cross-project auth calls** | Mark/Luke currently call John to validate tokens — eliminated |
| **Simpler Wellspring sync** | 1 file instead of 4 |
| **Faster auth** | Token validation reads from same spreadsheet — no network hop |
| **Easier backup** | Copy 1 sheet instead of 4 |
| **Unified setup** | 1 `setupAll()` creates everything |
| **Single audit trail** | All AuditLog entries in one place |

## What You Lose

| Trade-off | Impact |
|-----------|--------|
| **Cell budget shared** | 10M cells across all 105 tabs instead of 10M × 4 |
| **Higher archive frequency** | Likely need to archive every 6–12 months for active churches |
| **Single point of failure** | If the sheet corrupts, everything is affected (mitigated by Drive versioning + Wellspring local backup) |
| **Larger Code.gs** | ~20K lines in one file — manageable but dense |
| **GAS quota concentration** | All API calls hit one project's quotas instead of spreading across 4 |
| **Concurrent edit risk** | GAS has a lock contention issue with many simultaneous writers to one sheet |

---

## Risk Assessment

### Low Risk
- Tab count (105 of 200 limit) — plenty of headroom
- Code size (~20K lines) — GAS handles this fine
- Setup complexity — already solved patterns

### Medium Risk
- Cell budget for large churches (> 2,000 members with years of history)
- Mitigated by the archive expansion model

### Higher Risk
- **Lock contention**: Google Sheets has row-level locking issues when multiple GAS executions write simultaneously. With 4 sheets, writes to Members don't block writes to Missions. With 1 sheet, they share a lock.
- **Mitigation**: Use `LockService.getScriptLock()` with short hold times, batch writes (already implemented in Discipleship.gs pattern), and the archive model to keep the primary sheet lean.

---

## Migration Path (If We Proceed)

### Phase 1: Merge the Code
1. Combine all 4 `.gs` files into one `FlockOS_Combined.gs`
2. Unify `doGet()` with prefix-based routing
3. Inline the auth validation (remove cross-project calls)
4. Merge all 4 `setup*()` functions into `setupAll()`

### Phase 2: Merge the Data  
1. Create new single spreadsheet
2. Run `setupAll()` to create all 105 tabs with headers
3. Copy data from existing 4 sheets into matching tabs
4. Deploy new Web App URL

### Phase 3: Update Frontend
1. Point all 4 endpoint branches at the new single URL
2. Update TheWell to sync 1 file
3. Update service worker cache version
4. Test every module end-to-end

### Phase 4: Add Archive System
1. Build `archiveData_()` function in Code.gs
2. Build `readWithArchive_()` wrapper for list handlers
3. Add Control Panel UI for archive management
4. Add cell budget health indicator to dashboard

---

## The "Load a Sheet" UX Concept

From the user's perspective in the Control Panel:

```
┌─────────────────────────────────────────────────────┐
│  DATABASE HEALTH                                    │
│                                                     │
│  Primary Sheet: FlockOS_Main                        │
│  Tabs: 105 / 200                                    │
│  Cell Usage: ████████░░ 3.2M / 10M (32%)           │
│  Status: ● HEALTHY                                  │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Archive Sheets:                                    │
│  ┌─────────────────────────────────────────────┐    │
│  │ 📦 FlockOS_Archive_2025                     │    │
│  │    Loaded: Jan 2026 | Rows: 14,200          │    │
│  │    Coverage: Jan 2024 – Dec 2025            │    │
│  │    Status: ● Read-Only                      │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  [+ Load Archive Sheet]  [Archive Old Data]         │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Archive Settings:                                  │
│  Auto-archive threshold: [75% ▾]                    │
│  Archive data older than: [6 months ▾]              │
│  Include in searches:     [✓ Yes]                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**"+ Load Archive Sheet"** opens a dialog:
1. Paste the Google Sheet ID of the archive
2. App validates it has the expected tab structure
3. Adds it to `ARCHIVE_SHEET_IDS` in Script Properties
4. Archive data is now searchable from the app

---

## Verdict

**It's very feasible.** The hardest work — unified action routing, local data resolution, setup automation — is already done. The main risk is lock contention for high-traffic churches, and the cell budget requires an archive discipline that doesn't exist in the current 4-sheet model (where you'd likely never hit 10M cells per sheet).

The archive expansion model ("load a sheet") is the right answer to the capacity constraint. It turns a limitation into a feature: churches *should* be archiving old data periodically, and this architecture makes that a first-class operation instead of an afterthought.

**Recommendation:** Worth pursuing. Start with Phase 1 (merge the code) as a proof of concept — it's reversible and reveals any hidden coupling between the 4 projects.

---

## Schema Redundancy Audit

### The Big Problem: 4 Tables Storing the Same Person

When a user is created or updated, `cascadeUpdate_()` atomically writes to **7 tables** to keep them in sync. The overlap is massive:

| Field | AuthUsers | AccessControl | Members | MemberCards | UserProfiles |
|-------|:---------:|:-------------:|:-------:|:-----------:|:------------:|
| Email | PK | PK | col I | col C | PK |
| First Name | ✓ | — | ✓ | ✓ | — |
| Last Name | ✓ | — | ✓ | ✓ | — |
| Display Name | — | ✓ (derived) | — | — | ✓ |
| Phone | — | — | ✓ (3 cols) | ✓ | ✓ |
| Photo URL | — | — | ✓ | ✓ | ✓ |
| Role | ✓ | ✓ | — | — | — |
| Status | ✓ | ✓ (Active) | ✓ (Membership) | ✓ (Active) | — |
| Bio | — | — | — | ✓ (Card Bio) | ✓ |
| Theme | — | — | ✓ (Color/BG) | ✓ (Color/BG) | ✓ |

**5 separate tables all store some version of the same person's identity.** The cascade function exists *because* of this redundancy — it's a band-aid, not a solution.

### Proposed: Collapse to 2 Core Tables

#### Table 1: `People` (replaces Members + MemberCards + UserProfiles + AccessControl)

Single source of truth for every person in the system:

| Col | Field | Source |
|-----|-------|--------|
| Col | Field | Source | Notes |
|-----|-------|--------|-------|
| A | ID | Members.ID | UUID primary key |
| B | Email | Members.Primary Email | Shared identity key |
| C | First Name | Members / AuthUsers | |
| D | Last Name | Members / AuthUsers | |
| E | Preferred Name | Members | |
| F | Suffix | Members | |
| G | Date of Birth | Members | |
| H | Gender | Members | |
| I | Photo URL | Members / MemberCards / UserProfiles | Single source now |
| J | Secondary Email | Members | Was col J — **preserved** |
| K | Cell Phone | Members | |
| L | Home Phone | Members | |
| M | Work Phone | Members | Was col M — **preserved** |
| N | Preferred Contact | Members | |
| O | Street Address 1 | Members | |
| P | Street Address 2 | Members | |
| Q | City | Members | |
| R | State | Members | |
| S | ZIP Code | Members | |
| T | Country | Members | |
| U | Household ID | Members | |
| V | Family Role | Members | |
| W | Marital Status | Members | |
| X | Spouse Name | Members | |
| Y | Emergency Contact | Members | |
| Z | Emergency Phone | Members | |
| AA | Membership Status | Members | |
| AB | Member Since | Members | |
| AC | How They Found Us | Members | |
| AD | Baptism Date | Members | |
| AE | Salvation Date | Members | |
| AF | Date of Death | Members | |
| AG | Ministry Teams | Members | Comma-separated |
| AH | Volunteer Roles | Members | Comma-separated |
| AI | Spiritual Gifts | Members | Comma-separated |
| AJ | Small Group | Members | |
| AK | Assigned To | Members | |
| AL | Tags | Members | |
| AM | Pastoral Notes | Members | |
| AN | Last Contact Date | Members | |
| AO | Next Follow-Up | Members | |
| AP | Follow-Up Priority | Members | |
| AQ | Website Link | Members | Was col AW — **preserved** |
| AR | Bio | UserProfiles / MemberCards | Unified |
| AS | Display Name | UserProfiles / AccessControl | Was separate — **preserved** |
| AT | Timezone | UserProfiles | |
| AU | Language | UserProfiles | |
| AV | Notification Prefs | UserProfiles | JSON string |
| AW | Role | AuthUsers / AccessControl | readonly–admin |
| AX | Groups | AccessControl | Comma-separated |
| AY | Admin Notes | AccessControl.Notes | Was col F — **preserved** |
| AZ | Active | AccessControl | Boolean |
| BA | Archived | Members | |
| BB | Archive Reason | Members | |
| BC | Created By | Members | |
| BD | Created At | Members | |
| BE | Updated By | Members | |
| BF | Updated At | Members | |
| BG | Passcode Hash | AuthUsers | Hash only — no cleartext |
| BH | Salt | AuthUsers | Per-user salt |
| BI | Auth Status | AuthUsers | active / suspended / pending |

**61 columns** replacing 5 separate tabs (Members 51 + MemberCards 30 + UserProfiles 10 + AccessControl 8 + AuthUsers 10 = **109 columns** across 5 tables → **61 columns** in 1 table).

**48 columns eliminated.** `cascadeUpdate_()` becomes entirely unnecessary.

Auth lives directly on the `People` row — no separate table needed. In Google Sheets there's no column-level access control, so a separate Auth tab provides zero security benefit. The cleartext `Passcode` column from AuthUsers is **not carried over** — hash-only.

> **Functionality Audit:** Every field from all 5 source tables is accounted for above.  
> Fields intentionally dropped: `Passcode` (cleartext — security risk), `Color Scheme` / `BG Scheme` on Members (moved to CardSettings where they belong — Members shouldn't own card theming).

#### What Happens to MemberCards?

MemberCards has card-specific display fields (Card Title, Card Bio, Card Footer, Show Daily Bread, Show Prayer Ticker, View Count, Card Icon, etc.) that don't belong on `People`. These become:

#### Table 2: `CardSettings` (replaces MemberCards display-only columns)

| Col | Field | Notes |
|-----|-------|-------|
| A | ID | |
| B | Person ID | FK → People |
| C | Member Number | e.g., ATOG-0042 |
| D | Card Title | |
| E | Card Bio | Card-specific bio (may differ from People.Bio) |
| F | Card Icon | |
| G | Card Footer | |
| H | Show Daily Bread | Boolean |
| I | Show Prayer Ticker | Boolean |
| J | Color Scheme | Moved from Members — card theming belongs here |
| K | BG Scheme | Moved from Members — card theming belongs here |
| L | Website URL | |
| M | Schedule URL | |
| N | Phone Visible | Was MemberCards col N — **preserved** |
| O | Email Visible | Was MemberCards col O — **preserved** |
| P | Visibility | public / private / unlisted |
| Q | View Count | |
| R | Active | Boolean |
| S | Status | Was MemberCards col AA — **preserved** |
| T | Created By | Was MemberCards col AB — **preserved** |
| U | Created At | |
| V | Updated At | |

**22 columns** — card presentation + visibility controls. No identity duplication.

> **Note:** `MemberCardLinks` (12 cols) and `MemberCardViews` (8 cols) are **retained as-is** — they reference CardSettings via Person ID / Card Row ID and have no redundancy. These are not candidates for merge.

### Net Result: Identity Tables

| Before | Cols | After | Cols | Savings |
|--------|------|-------|------|---------|
| Members | 51 | People | 61 | — |
| MemberCards | 30 | CardSettings | 22 | -8 |
| UserProfiles | 10 | *(merged into People)* | 0 | -10 |
| AccessControl | 8 | *(merged into People)* | 0 | -8 |
| AuthUsers | 10 | *(merged into People)* | 0 | -10 |
| MemberCardLinks | 12 | *(kept as-is)* | 12 | 0 |
| MemberCardViews | 8 | *(kept as-is)* | 8 | 0 |
| **Total** | **129** | | **103** | **-26 cols, -3 tabs** |

`cascadeUpdate_()` is eliminated entirely. One person = one row in `People`. Auth reads from the same row. One write, one table, done.

---

## Missions Schema Streamlining

### Current: Per-Country Tab References

The `MissionsRegistry` tab has a `Tab Name` column (col E) that points to country-specific sheet tabs. This means the system *can* create a new sheet tab per country — potentially dozens of extra tabs eating into the 200-tab budget.

### The Problem

- Each country tab duplicates the same column structure
- 195 countries recognized by the UN — if fully populated, that's 195 extra tabs
- The real data is already normalized: `MissionsRegions`, `MissionsCities`, and `MissionsPartners` all use `Country ID` as a foreign key
- The per-country tabs are **redundant** with the relational structure already in place

### Proposed: Drop Per-Country Tabs Entirely

The MissionsRegistry `Tab Name` column becomes unnecessary. All country data is already queryable via:

```
MissionsRegistry   → Country metadata (28 cols, 1 row per country)
MissionsRegions    → Regions within countries (24 cols, filtered by Country ID)
MissionsCities     → Cities within regions (30 cols, filtered by Country ID)
MissionsPartners   → Partners linked to countries (20 cols, filtered by Country IDs)
MissionsMetrics    → Year-over-year stats per country (20 cols, filtered by Country ID)
```

**The 8 Missions tabs already form a complete relational schema.** Per-country tabs are a denormalized holdover.

### Savings

- Remove `Tab Name` column from MissionsRegistry (27 cols instead of 28)
- Eliminate potential 195+ dynamic country tabs
- Tab budget stays at 105 instead of ballooning to 300+

---

## Write Contention — Jitter Strategy

### The Problem

In a single-sheet architecture, simultaneous writes from multiple users compete for Google Sheets' internal lock. GAS throws `"Service unavailable"` or `"Lock timeout"` errors when two executions try to write to the same spreadsheet within milliseconds.

### Solution: Randomized Write Delay (Jitter)

Add a small random delay before every write operation. This spreads simultaneous requests across a time window, dramatically reducing collision probability.

#### Backend Implementation (Code.gs)

```javascript
/**
 * Jittered write wrapper — adds 0–500ms random delay before writes.
 * Reduces lock contention when multiple users write simultaneously.
 */
function jitteredWrite_(fn) {
  var jitter = Math.floor(Math.random() * 500); // 0–500ms
  Utilities.sleep(jitter);
  
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // wait up to 10 sec for lock
    return fn();          // execute the actual write
  } finally {
    lock.releaseLock();
  }
}

// Usage in any handler:
function handleMembersUpdate_(params, auth) {
  return jitteredWrite_(function() {
    var sheet = db().getSheetByName('People');
    var rows = sheet.getDataRange().getValues();
    var row = findRowById(rows, params.id);
    // ... mutate row ...
    sheet.getRange(row.index + 1, 1, 1, PEOPLE_NUM_COLS).setValues([row.data]);
    writeAudit_(auth, 'people.update', 'People', params.id);
    return { ok: true };
  });
}
```

#### Why Jitter Alone Isn't Enough — Exponential Backoff

For high-contention scenarios (e.g., 20 people checking in simultaneously), add retry with exponential backoff:

```javascript
function resilientWrite_(fn, maxRetries) {
  maxRetries = maxRetries || 3;
  for (var attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return jitteredWrite_(fn);
    } catch (e) {
      if (attempt === maxRetries) throw e;
      // Exponential backoff: 1s, 2s, 4s + jitter
      var backoff = Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 500);
      Utilities.sleep(backoff);
    }
  }
}
```

#### Frontend Complementary Jitter (the_true_vine.js)

Optionally add client-side jitter so requests don't even *arrive* at the server simultaneously:

```javascript
// Before sending any write action:
async function jitteredSend(action, params) {
  if (isWriteAction(action)) {
    await new Promise(r => setTimeout(r, Math.random() * 300)); // 0–300ms
  }
  return TheVine.send(action, params);
}

function isWriteAction(action) {
  return /\.(create|update|delete|archive|approve|deny|resolve|send)$/.test(action);
}
```

#### Combined Effect

| Scenario | Without Jitter | With Jitter + Backoff |
|----------|---------------|----------------------|
| 2 simultaneous writes | ~30% collision rate | ~2% collision rate |
| 5 simultaneous writes | ~80% collision rate | ~8% collision rate |
| 20 check-ins at once | Nearly guaranteed failures | < 5% failure rate after retries |

The jitter window (0–500ms backend + 0–300ms frontend = up to 800ms spread) is imperceptible to users but dramatically reduces the probability of two `setValues()` calls hitting the same lock window.

---

## Additional Redundancies to Streamline

### 1. Denormalized Name Columns (Across 15+ Tables)

Many tables store `Member Name` alongside `Member ID`, or `Preacher Name` alongside `Preacher ID`. These are display conveniences that force cascading updates whenever someone changes their name.

**Current pattern (throughout schema):**
```
DiscipleshipEnrollments:  Member ID (B) + Member Name (C)
DiscipleshipMentoring:    Mentor ID (B) + Mentor Name (C), Mentee ID (D) + Mentee Name (E)
DiscipleshipAssessments:  Member ID (B) + Member Name (C)
DiscipleshipGoals:        Member ID (B) + Member Name (C)
DiscipleshipCertificates: Member ID (B) + Member Name (C)
LearningProgress:         Member ID (B) + Member Name (C)
LearningNotes:            Member ID (B) + Member Name (C)
LearningBookmarks:        Member ID (B) + Member Name (C)
LearningRecommendations:  Member ID (B) + Member Name (C)
LearningQuizResults:      Member ID (D) + Member Name (E)
LearningCertificates:     Member ID (B) + Member Name (C)
CommsMessages:            Sender ID (C) + Sender Name (D)
CommsThreads:             Creator ID (D) + Creator Name (E)
CommsNotifications:       Recipient ID (B) + Recipient Name (C)
SpiritualCareInteractions: Caregiver ID (E) — name looked up at render time
```

**Proposed:** Drop all `_Name` columns. Resolve names at read time by joining against `People` in the handler:

```javascript
function resolveName_(personId) {
  if (!personId) return '';
  var people = _fetch('people', function() { return readTab_('People'); }, 120);
  var person = people.find(function(p) { return p[0] === personId; });
  return person ? (person[4] || person[2]) + ' ' + person[3] : ''; // Preferred || First + Last
}
```

**Impact:** ~30 columns eliminated across 15+ tables. No more cascade bugs from name changes.

**Trade-off:** Slightly more compute at read time (a lookup per row), but the `People` tab will already be cached in memory via `_fetch()` for the duration of the request.

### 2. Duplicate Path/Playlist Name Columns

Same pattern — storing the name alongside the ID:

```
DiscipleshipEnrollments:  Path ID (D) + Path Name (E)
DiscipleshipMilestones:   Path ID (J) + — (name looked up)
DiscipleshipCertificates: Path ID (D) + Path Name (E)
LearningProgress:         Playlist ID (F) + Playlist Title (G)
LearningCertificates:     Playlist ID (E) + Playlist Title (F)
LearningQuizResults:      Quiz ID (B) + Quiz Title (C)
```

**~8 more columns** that can be resolved at read time.

### 3. ContactLog vs. InteractionLedger vs. SpiritualCareInteractions

Three separate tables logging almost the same thing — "someone contacted/interacted with a member":

| Table | Purpose | Cols |
|-------|---------|------|
| ContactLog (12 cols) | General contact tracking | Date, Type, Direction, Subject, Details |
| InteractionLedger (TheScrolls) | Pastoral interaction logging | 30+ types, timeline |
| SpiritualCareInteractions (12 cols) | Care case interactions | Date, Type, Duration, Summary |

**Proposed:** Merge into a single `InteractionLog` table with a `Context` column (general, care-case, pastoral) and an optional `Case ID` foreign key. This eliminates ContactLog entirely and folds SpiritualCareInteractions into the ledger with a case link.

The merged table preserves all fields from both sources:

| Col | Field | From |
|-----|-------|------|
| A | ID | All |
| B | Member ID | All |
| C | Context | NEW: general / care-case / pastoral |
| D | Case ID | SpiritualCareInteractions (nullable) |
| E | Interaction Date | All |
| F | Type | All (30+ types from InteractionLedger) |
| G | Direction | ContactLog |
| H | Subject | ContactLog |
| I | Details / Summary | All |
| J | Duration Minutes | SpiritualCareInteractions |
| K | Caregiver ID | SpiritualCareInteractions |
| L | Follow-Up Needed | ContactLog + SpiritualCareInteractions |
| M | Follow-Up Date | ContactLog + SpiritualCareInteractions |
| N | Follow-Up Done | ContactLog + SpiritualCareInteractions |
| O | Confidential | SpiritualCareInteractions |
| P | Contacted By | ContactLog / SpiritualCareInteractions |
| Q | Created At | All |

**17 columns** replaces ContactLog (12) + SpiritualCareInteractions (12) = **24 cols → 17 cols**, and all interactions are queryable from a single timeline regardless of context.

**Savings:** 7 columns and 2 tabs eliminated. Zero functionality lost — all fields preserved.

### 4. Communications vs. CommsBroadcastLog

`Communications` (13 cols) and `CommsBroadcastLog` (18 cols) both track sent communications. The Broadcast log has everything Communications has plus delivery metrics.

**Proposed:** Drop `Communications` tab. CommsBroadcastLog already handles broadcasts. Direct messages go through CommsMessages. The original Communications tab is a legacy artifact.

**Savings:** 13 columns / 1 tab.

### 5. StatisticsSnapshots h1–h50 Generic Slots

`StatisticsSnapshots` has **50 generic metric columns** (h1 through h50) mapped dynamically via `StatisticsConfig`. This takes 58 columns for what is essentially a key-value time series.

**Proposed:** Replace with a `StatisticsData` table:

| Col | Field |
|-----|-------|
| A | ID |
| B | Snapshot Date |
| C | Period Type |
| D | Slot |
| E | Value |
| F | Created At |

One row per metric per snapshot instead of one mega-row with 50 columns. More rows, but **52 fewer columns** per snapshot, and no artificial limit of 50 metrics.

---

## Revised Tab Count After Streamlining

| Action | Tabs Removed | Cols Saved |
|--------|-------------|------------|
| Merge Members + MemberCards + UserProfiles + AccessControl + AuthUsers → People + CardSettings | -3 | -26 |
| Drop denormalized _Name columns | 0 | ~38 |
| Drop per-country Missions tabs (keep Tab Name col unused) | 0–195 potential | 1 |
| Merge ContactLog + SpiritualCareInteractions → InteractionLog | -2 | 7 |
| Drop Communications (use CommsBroadcastLog) | -1 | 13 |
| Replace StatisticsSnapshots with StatisticsData | 0 | ~52 |
| **Total** | **-6 tabs** | **~137 cols** |

### New Totals

| Metric | Before | After |
|--------|--------|-------|
| Tabs | 105 | **105** (99 active + 2 system + 4 reserved) |
| Total columns | ~1,627 | **~1,490** |
| Cascade tables on name change | 7 | **0** |
| Identity sources of truth | 5 | **1** (People) |
| Auth table | Separate (AuthUsers) | **Inline** (3 cols on People) |

With 105 tabs (99 active + 2 system + 4 reserved empty) and ~1,490 active columns, the cell budget math improves:

| Rows per tab | Total Cells | % of 10M |
|--------------|-------------|----------|
| 1,000 | 1,490,000 | **14.9%** |
| 2,500 | 3,725,000 | **37.3%** |
| 5,000 | 7,450,000 | **74.5%** |

That's a meaningful improvement at every scale — and more importantly, the data is cleaner, writes are simpler, and cascade bugs become impossible. Login reads from the same `People` row — no cross-tab lookup for auth validation.

---

## Functionality Preservation Checklist

Every proposed change audited for zero functionality loss:

| Change | Features Preserved | Verification |
|--------|-------------------|---------------|
| Members → People | All 51 Members cols mapped (Secondary Email, Work Phone, Website Link all included) | Column-by-column audit above |
| AuthUsers → People (inline) | Hash + Salt + Auth Status preserved. Cleartext passcode intentionally dropped (security improvement, not loss) | Auth flow: read People row, check hash — same logic, fewer hops |
| UserProfiles → People | Display Name, Bio, Timezone, Language, Notification Prefs, Theme all preserved | Cols AS–AV |
| AccessControl → People | Role, Groups, Active status, Notes all preserved | Cols AW–AZ |
| MemberCards → CardSettings | All display fields preserved: Phone Visible, Email Visible, Status, Created By all included | 22-col table above |
| MemberCardLinks | **Unchanged** — kept as-is (12 cols) | Not a merge candidate |
| MemberCardViews | **Unchanged** — kept as-is (8 cols) | Not a merge candidate |
| ContactLog → InteractionLog | All 12 ContactLog fields mapped: Direction, Subject, Follow-Up chain intact | Merged table schema above |
| SpiritualCareInteractions → InteractionLog | Duration, Caregiver ID, Follow-Up chain, Confidential all preserved. Case ID links to SpiritualCareCases | Merged table schema above |
| Communications → dropped | CommsBroadcastLog already has Subject, Body, Audience, Sent At, Recipient Count + delivery metrics. Direct messages use CommsMessages. No orphaned feature. | Fields are a strict superset |
| StatisticsSnapshots → StatisticsData | All 50 metric slots preserved as rows instead of columns. No limit of 50 metrics anymore — **improvement**. StatisticsConfig unchanged. | Key-value model, same data |
| Denormalized _Name cols dropped | Names resolved at read time via `resolveName_()` helper. Frontend sees identical JSON — name field still present in API response. | Handler-level join against People |
| Per-country Missions tabs | All data already in relational tables (Registry, Regions, Cities, Partners, Metrics) with Country ID FK. Tab Name column unused. | 29 Missions handlers unaffected |
| Permissions tab | **Unchanged** — kept as-is (6 cols) | Not a merge candidate |
| All other tabs (75+) | **Unchanged** — no modifications proposed | Only identity/logging/stats tabs touched |

> **Nothing is removed that a user, pastor, or admin could previously do.** Every screen, every button, every export, every search works identically. The data just lives in fewer, better-organized places.

---

## Longevity: How Much Longer Before You Need an Archive?

Yes — fewer tabs and fewer columns directly extends the runway before hitting the 10M cell limit.

### Original Architecture (4 sheets, 40M total budget)\n\n> **Note:** Now consolidated into 1 sheet with 10M cell budget.\n\nWith 4 separate spreadsheets, each had its own 10M cell budget:

| Sheet | Tabs | Cols | Practical Budget |
|-------|------|------|------------------|
| John (Flock) | 82 | 1,183 | 10M cells |
| Mark (Missions) | 8 | 174 | 10M cells |
| Luke (Extra) | 3 | 90 | 10M cells |
| Matthew (App) | 12 | 82 | 10M cells |

But John consumes nearly all the growth — the other 3 barely use their budgets. You're effectively wasting ~25M cells of unused capacity on sheets that never fill up, while John (the one that grows) has only 10M.

### Streamlined Single-Sheet (1 sheet, 10M budget, 105 tabs, ~1,490 active cols)

The question is: **how many rows can you add per month before hitting 10M?**

Not all tabs grow. Here's the real growth model:

#### Tabs That Grow (Active Data)

| Tab Category | Tabs | Avg Cols | New Rows/Month (est.) | Cells/Month |
|-------------|------|----------|----------------------|-------------|
| People (members) | 1 | 61 | ~10 | 610 |
| Interactions / Logs | 3 | ~15 | ~200 | 3,000 |
| Attendance / Check-In | 2 | ~10 | ~50 | 500 |
| Giving | 2 | ~15 | ~100 | 1,500 |
| Communications | 5 | ~18 | ~150 | 2,700 |
| Discipleship | 10 | ~17 | ~50 | 850 |
| Learning Progress | 7 | ~16 | ~30 | 480 |
| Calendar / Events | 3 | ~16 | ~20 | 320 |
| Audit Logs | 2 | ~6 | ~500 | 3,000 |
| **Growth total** | | | **~1,110 rows/mo** | **~12,960 cells/mo** |

#### Tabs That Don't Grow (Reference / Config)

| Tab Category | Tabs | Avg Cols | Rows (fixed) | Cells (fixed) |
|-------------|------|----------|-------------|---------------|
| APP Content (Matthew) | 12 | ~7 | ~500 total | ~3,500 |
| Theology | 4 | ~13 | ~200 total | ~2,600 |
| Missions (reference) | 8 | ~22 | ~500 total | ~11,000 |
| Statistics Config | 2 | ~12 | ~100 total | ~1,200 |
| Songs / Sermons | 4 | ~14 | ~200 total | ~2,800 |
| AppConfig | 1 | 6 | ~50 | 300 |
| ChurchRegistry | 1 | 6 | ~1 | 6 |
| **Static total** | | | | **~21,400 cells** |

#### Runway Calculation

```
Available budget:    10,000,000 cells
Static overhead:        -21,400 cells
Usable budget:        9,978,600 cells

Monthly growth:         ~12,960 cells/month

Runway = 9,978,600 / 12,960 ≈ 770 months ≈ 64 years
```

That's for a **small church** (~100 members, modest activity).

For a **medium church** (~500 members, 5× activity):

```
Monthly growth:         ~64,800 cells/month
Runway = 9,978,600 / 64,800 ≈ 154 months ≈ 12.8 years
```

For a **large church** (~2,000 members, 20× activity):

```
Monthly growth:        ~259,200 cells/month
Runway = 9,978,600 / 259,200 ≈ 38 months ≈ 3.2 years
```

### Comparison: Current vs. Streamlined

| Church Size | Current (John only, 1,183 cols) | Streamlined (105 tabs, 1,490 cols) | Difference |
|-------------|-------------------------------|----------------------------------|------------|
| Small (~100) | Cell growth ~15,400/mo → **54 years** | Cell growth ~12,960/mo → **64 years** | **+10 years** |
| Medium (~500) | Cell growth ~77,000/mo → **10.8 years** | Cell growth ~64,800/mo → **12.8 years** | **+2 years** |
| Large (~2,000) | Cell growth ~308,000/mo → **2.7 years** | Cell growth ~259,200/mo → **3.2 years** | **+6 months** |

The streamlined schema extends the runway at every size because:
1. **Fewer columns per row** = fewer cells consumed per new record
2. **Eliminated _Name denormalization** = ~38 fewer columns across growth tabs
3. **StatisticsData key-value model** = 52 fewer columns per snapshot row

### With Archive System Active

If you archive data older than 12 months annually, the primary sheet never exceeds ~1 year of growth data. At that rate:

| Church Size | Annual Growth | After Archive | Effective Runway |
|-------------|-------------|---------------|------------------|
| Small | ~155K cells | Reset to ~21K | **Indefinite** |
| Medium | ~778K cells | Reset to ~21K | **Indefinite** |
| Large | ~3.1M cells | Reset to ~21K | **Indefinite** |

**With annual archiving, a single sheet runs indefinitely for any church size.** The archive sheets accumulate the history, and you "load" them when you need to search old data.

---

## Numeric Tab Names — Obfuscation Layer

### Concept

Instead of naming tabs `People`, `PrayerRequests`, `Giving`, etc., name them `1`, `2`, `3`. A mapping constant in Code.gs translates between numbers and logical names. The app works identically; the spreadsheet becomes opaque to casual observers.

### Implementation

#### The Tab Map (Code.gs)

```javascript
// ═══ Tab Registry ═══
// Single source of truth — every tab reference in the codebase uses this map.
// To reorder or rename, change ONLY this object.

var T = {
  1:  'People',
  2:  'Permissions',
  3:  'CardSettings',
  4:  'MemberCardLinks',
  5:  'MemberCardViews',
  6:  'Households',
  7:  'PrayerRequests',
  8:  'JournalEntries',
  9:  'InteractionLog',
  10: 'PastoralNotes',
  11: 'Milestones',
  12: 'ToDo',
  13: 'Attendance',
  14: 'Events',
  15: 'EventRSVPs',
  16: 'SmallGroups',
  17: 'SmallGroupMembers',
  18: 'Giving',
  19: 'GivingPledges',
  20: 'VolunteerSchedule',
  21: 'CommsMessages',
  22: 'CommsThreads',
  23: 'CommsNotifications',
  24: 'CommsNotificationPrefs',
  25: 'CommsChannels',
  26: 'CommsTemplates',
  27: 'CommsReadReceipts',
  28: 'CommsBroadcastLog',
  29: 'CheckInSessions',
  30: 'Ministries',
  31: 'MinistryMembers',
  32: 'ServicePlans',
  33: 'ServicePlanItems',
  34: 'Songs',
  35: 'SongArrangements',
  36: 'SetlistSongs',
  37: 'SpiritualCareCases',
  38: 'SpiritualCareAssignments',
  39: 'OutreachContacts',
  40: 'OutreachCampaigns',
  41: 'OutreachFollowUps',
  42: 'Photos',
  43: 'PhotoAlbums',
  44: 'Sermons',
  45: 'SermonSeries',
  46: 'SermonReviews',
  47: 'CompassionRequests',
  48: 'CompassionResources',
  49: 'CompassionTeamLog',
  50: 'DiscipleshipPaths',
  51: 'DiscipleshipSteps',
  52: 'DiscipleshipEnrollments',
  53: 'DiscipleshipMentoring',
  54: 'DiscipleshipMeetings',
  55: 'DiscipleshipAssessments',
  56: 'DiscipleshipResources',
  57: 'DiscipleshipMilestones',
  58: 'DiscipleshipGoals',
  59: 'DiscipleshipCertificates',
  60: 'LearningTopics',
  61: 'LearningPlaylists',
  62: 'LearningPlaylistItems',
  63: 'LearningProgress',
  64: 'LearningNotes',
  65: 'LearningBookmarks',
  66: 'LearningRecommendations',
  67: 'LearningQuizzes',
  68: 'LearningQuizResults',
  69: 'LearningCertificates',
  70: 'TheologyCategories',
  71: 'TheologySections',
  72: 'TheologyScriptures',
  73: 'TheologyRevisions',
  74: 'CalendarEvents',
  75: 'AuthAudit',
  76: 'AuditLog',
  77: 'AppConfig',
  // --- Missions (Mark) ---
  78: 'MissionsRegistry',
  79: 'MissionsRegions',
  80: 'MissionsCities',
  81: 'MissionsPartners',
  82: 'MissionsPrayerFocus',
  83: 'MissionsUpdates',
  84: 'MissionsTeams',
  85: 'MissionsMetrics',
  // --- Statistics (Luke) ---
  86: 'StatisticsConfig',
  87: 'StatisticsData',
  88: 'StatisticsCustomViews',
  // --- App Content (Matthew) ---
  89: 'Books',
  90: 'Genealogy',
  91: 'Counseling',
  92: 'Devotionals',
  93: 'Reading',
  94: 'Words',
  95: 'Heart',
  96: 'Mirror',
  97: 'Theology',
  98: 'Config',
  99: 'Quiz',
  100: 'Apologetics',
  // --- Multi-Church ---
  101: 'ChurchRegistry',
  // --- Reserved Expansion ---
  102: 'Reserved_1',   // e.g., Food Pantry / Benevolence Inventory
  103: 'Reserved_2',   // e.g., Bus Ministry / Transportation Roster
  104: 'Reserved_3',   // e.g., Building & Facilities Maintenance Log
  105: 'Reserved_4'    // e.g., Custom Church-Specific Module
};

// Reverse lookup: T.People → 1  (for audit logging)
var TAB_NUM = {};
Object.keys(T).forEach(function(k) { TAB_NUM[T[k]] = k; });
```

#### Usage Pattern

Every existing `getSheetByName('Members')` call becomes:

```javascript
// BEFORE
var sheet = db().getSheetByName('Members');

// AFTER
var sheet = db().getSheetByName(String(1)); // T[1] = 'People'
// Or with a helper:
function tab_(n) { return db().getSheetByName(String(n)); }
var sheet = tab_(1);
```

Audit logs use the reverse map for readable entries:

```javascript
writeAudit_(auth, 'people.update', T[1], params.id);
// AuditLog shows: "people.update | People | abc-123"
// But the actual tab in the spreadsheet is just "1"
```

#### Setup Function

```javascript
function setupAll() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(T).sort(function(a, b) { return +a - +b; }).forEach(function(num) {
    var existing = ss.getSheetByName(String(num));
    if (!existing) {
      var sheet = ss.insertSheet(String(num));
      var headers = getHeaders_(T[num]); // returns header array by logical name
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    }
  });
}
```

### What Someone Sees Opening the Spreadsheet

```
┌──────────────────────────────────────────────────────────────┐
│  Tab bar: [1] [2] [3] [4] [5] [6] ... [99] [100] [101]       │
│                                                              │
│  Tab "1" selected:                                           │
│  ┌────┬─────────┬──────────┬────────────┬─────────┬────┐     │
│  │ ID │ Email   │ First... │ Last Name  │ Pref... │ ...│     │
│  ├────┼─────────┼──────────┼────────────┼─────────┼────┤     │
│  │ a1 │ j@ch... │ John     │ Smith      │ Johnny  │ ...│     │
│  │ a2 │ m@ch... │ Mary     │ Johnson    │         │ ...│     │
│  └────┴─────────┴──────────┴────────────┴─────────┴────┘     │
│                                                              │
│  Column headers are still readable, but which tab is which?  │
│  Without the code, you'd have to guess.                      │
└──────────────────────────────────────────────────────────────┘
```

### What It Protects Against

| Threat | Named Tabs | Numeric Tabs |
|--------|:----------:|:------------:|
| Casual snooping (someone opens the sheet) | Immediately sees "Giving", "PastoralNotes" | Sees `18`, `10` — meaningless without the map |
| Column header reading | Data visible | Data still visible (same) |
| Someone with GAS Script Editor access | Full access | Full access (map is in code) |
| Automated scraping by tab name | Easy to target | Would need to scan all tabs |
| Export-by-name via Sheets API | `?sheet=Giving` works | Need to know `?sheet=18` |

### What It Doesn't Protect Against

- **Anyone with Editor access can still read all data** — this is a Google Sheets limitation
- **Column headers still reveal field names** — you could obfuscate these too (A, B, C...) but that makes the sheet completely unmanageable for debugging
- **The GAS source code contains the full mapping** — anyone with script access sees everything

### Practical Benefits Beyond Security

1. **Compact tab bar** — `1` through `101` vs. `DiscipleshipEnrollments`, `CommsNotificationPrefs`, etc. Much easier to scroll
2. **Stable references** — if you rename a logical entity (e.g., `Members` → `People`), you change the map value — the tab stays `1`. No broken references anywhere
3. **Consistent ordering** — tabs are always in numeric order. No accidental reordering
4. **Setup simplicity** — `setupAll()` creates tabs 1–101 in a clean loop. No string arrays to maintain
5. **Archive sheet compatibility** — archive sheets use the same numbering. Tab `1` in the archive = Tab `1` in primary = same entity

### Cost to Implement

**Zero performance cost.** `getSheetByName('1')` and `getSheetByName('People')` are identical operations.

**One-time code change:** Find-and-replace all `getSheetByName('TabName')` calls with `tab_(N)`. The `T` map makes this mechanical — search for each logical name in the map, replace with the number.

---

## Planned Modules & Reserved Space

### Modules Coming Online

| Module | Tab(s) Needed | Status | Notes |
|--------|:------------:|--------|-------|
| **the_truth.js** | 0 | Reserved file (empty) | Doctrine/theology module (John 8:32). Will render content from existing TheologyCategories/TheologySections/TheologyScriptures tabs (70–73). No new tabs needed — the data layer already exists. |
| **Multi-Church UI** | 0 | Backend only | `ChurchRegistry` tab (101) exists. Frontend management UI not yet built. No new tabs needed. |
| **Interactive Learning Pages** | 0 | Content files | the_generations.html, the_weavers_plan.html, etc. are standalone HTML — no database tabs required. |

**Key insight:** All planned modules use existing tabs. No new data domains are required. This is why 4 reserved expansion tabs (102–105) are sufficient — they cover the unlikely case of a genuinely new data type no one has anticipated.

### What Happened to the 50 Extra_ Slots?

The original EXTRA API (Luke) had 50 pre-allocated blank tabs (`Extra_01` through `Extra_50`) for custom church metrics. In the streamlined schema:

- **StatisticsData** (key-value model) replaces the fixed `h1–h50` column layout — new metrics are added as rows, not tabs
- Custom KPIs don't need their own tabs — they're rows in StatisticsConfig + StatisticsData
- **50 tabs eliminated**, replaced by 4 reserved slots for genuinely new data domains

### Files Retired in This Architecture

| File | Replacement | Reason |
|------|-------------|--------|
| `the_well.js` | Merged into `the_wellspring.js` | One file handles offline + sync + backup |
| `Sql.gs` (section in John_Combined) | Removed | Cloud SQL functionality dropped |
| SQL Settings UI (Control Panel §11) | Removed | No SQL backend |
| `sql.test` / `sql.status` routes | Removed | No SQL backend |
| `flockos_schema.sql` | **Kept as reference** | Documentation only — not deployed |

### Revised Final Tab Count

| Category | Tabs |
|----------|------|
| People & Identity (People, CardSettings, CardLinks, CardViews, Permissions, Households) | 6 |
| Pastoral Core (PrayerRequests, JournalEntries, InteractionLog, PastoralNotes, Milestones, ToDo) | 6 |
| Attendance & Events (Attendance, Events, EventRSVPs, CheckInSessions) | 4 |
| Groups (SmallGroups, SmallGroupMembers) | 2 |
| Giving (Giving, GivingPledges) | 2 |
| Volunteers (VolunteerSchedule) | 1 |
| Communications (Messages, Threads, Notifications, NotifPrefs, Channels, Templates, ReadReceipts, BroadcastLog) | 8 |
| Ministries (Ministries, MinistryMembers) | 2 |
| Service Planning (ServicePlans, ServicePlanItems) | 2 |
| Music (Songs, SongArrangements, SetlistSongs) | 3 |
| Spiritual Care (SpiritualCareCases, SpiritualCareAssignments) | 2 |
| Outreach (OutreachContacts, OutreachCampaigns, OutreachFollowUps) | 3 |
| Photos (Photos, PhotoAlbums) | 2 |
| Sermons (Sermons, SermonSeries, SermonReviews) | 3 |
| Compassion (CompassionRequests, CompassionResources, CompassionTeamLog) | 3 |
| Discipleship (Paths, Steps, Enrollments, Mentoring, Meetings, Assessments, Resources, Milestones, Goals, Certificates) | 10 |
| Learning (Topics, Playlists, PlaylistItems, Progress, Notes, Bookmarks, Recommendations, Quizzes, QuizResults, Certificates) | 10 |
| Theology (Categories, Sections, Scriptures, Revisions) | 4 |
| Calendar (CalendarEvents) | 1 |
| Audit & Config (AuthAudit, AuditLog, AppConfig) | 3 |
| Missions (Registry, Regions, Cities, Partners, PrayerFocus, Updates, Teams, Metrics) | 8 |
| Statistics (Config, Data, CustomViews) | 3 |
| App Content — Matthew (Books, Genealogy, Counseling, Devotionals, Reading, Words, Heart, Mirror, Theology, Config, Quiz, Apologetics) | 12 |
| Multi-Church (ChurchRegistry) | 1 |
| Reserved Expansion | 4 |
| **TOTAL** | **105** |

---

## Deliverable: Single Combined Code.gs

The four current GAS files:

| File | Lines | Role |
|------|------:|------|
| `John_Combined.gs` | 24,045 | CRM / Flock (82 tabs, 200+ routes) |
| `Mark_Combined.gs` | 2,445 | Missions (8 tabs, 29 handlers) |
| `Luke_Combined.gs` | 598 | Statistics / Extra (3 tabs) |
| `Matthew_Combined.gs` | 381 | App Content (12 public tabs) |
| **Total** | **27,469** | |

These merge into **one `Code.gs` file** bound to the single spreadsheet. This is the only script file in the project — no multi-file GAS project, no libraries, no external dependencies.

### Code.gs Structure (top to bottom)

```
┌─────────────────────────────────────────────┐
│  1. GLOBALS & CONFIG                        │
│     - T map (numeric tab lookup)            │
│     - tab_() helper                         │
│     - ss = SpreadsheetApp.getActive()       │
│     - CONFIG cache (from AppConfig tab)     │
│     - resolveName_() helper                 │
│     - jitter_() helper (0–500ms delay)      │
├─────────────────────────────────────────────┤
│  2. doGet(e) — UNIFIED ROUTER              │
│     - Auth validation (inline People tab)   │
│     - Action → handler dispatch             │
│     - All 300+ routes in one switch/map     │
│     - Error wrapper + audit logging         │
├─────────────────────────────────────────────┤
│  3. SHARED UTILITIES                        │
│     - CRUD helpers (getAll_, getById_,      │
│       create_, update_, delete_)            │
│     - Range/column helpers                  │
│     - Date/format helpers                   │
│     - Email/notification helpers            │
│     - Export/import helpers                 │
│     - cascadeUpdate_() for People names     │
├─────────────────────────────────────────────┤
│  4. DOMAIN HANDLERS — FLOCK (from John)     │
│     - People (merged identity)              │
│     - CardSettings, CardLinks, CardViews    │
│     - Households, Permissions               │
│     - Attendance, Events, Check-In          │
│     - Giving, Pledges                       │
│     - Groups, Volunteers                    │
│     - Communications (8 tabs)               │
│     - Ministries                            │
│     - Service Planning, Music               │
│     - Pastoral Care, Spiritual Care         │
│     - Outreach, Photos                      │
│     - Sermons, Compassion                   │
│     - Discipleship (10 tabs)                │
│     - Learning (10 tabs)                    │
│     - Theology (4 tabs)                     │
│     - Calendar                              │
│     - Auth, Audit                           │
├─────────────────────────────────────────────┤
│  5. DOMAIN HANDLERS — MISSIONS (from Mark)  │
│     - Registry, Regions, Cities             │
│     - Partners, PrayerFocus, Updates        │
│     - Teams, Metrics                        │
├─────────────────────────────────────────────┤
│  6. DOMAIN HANDLERS — STATS (from Luke)     │
│     - StatisticsConfig, StatisticsData      │
│     - StatisticsCustomViews                 │
├─────────────────────────────────────────────┤
│  7. DOMAIN HANDLERS — APP (from Matthew)    │
│     - Books, Genealogy, Counseling, etc.    │
│     - 12 public read-only content tabs      │
├─────────────────────────────────────────────┤
│  8. MULTI-CHURCH (future)                   │
│     - ChurchRegistry handlers               │
├─────────────────────────────────────────────┤
│  9. SETUP & ADMIN                           │
│     - setupAll_() — create 105 numeric tabs │
│     - migrate_() — copy data from old sheets│
│     - healthCheck_() — verify tab integrity │
└─────────────────────────────────────────────┘
```

### Estimated Size

| Source | Lines | After Merge (est.) |
|--------|------:|-------------------:|
| John handlers | 24,045 | ~20,000 (dedup shared utils, remove SQL, collapse auth) |
| Mark handlers | 2,445 | ~2,200 (remove per-country tab logic) |
| Luke handlers | 598 | ~400 (StatisticsData replaces 50-col layout) |
| Matthew handlers | 381 | ~350 (minimal change) |
| New shared layer | — | ~800 (T map, router, jitter, resolveName_, CRUD helpers) |
| Setup & migration | — | ~300 |
| **Total Code.gs** | | **~24,000 lines** |

The merged file is actually *smaller* than the current total (27,469) because:
- Duplicated utility functions across 4 files → one copy
- SQL handlers removed (~400 lines)
- Auth becomes 3 cols on People instead of a separate table + handlers
- Per-country mission tab logic eliminated
- Denormalized `_Name` write logic replaced by `resolveName_()` read helper

### GAS Limits Check

| Limit | Allowed | Code.gs (est.) | Status |
|-------|---------|-----------------|--------|
| Script file size | 2 MB | ~800 KB (~24K lines × ~33 bytes avg) | ✅ well under |
| Total project size | 50 MB | ~800 KB (single file) | ✅ |
| Execution time per call | 6 minutes | Typical: <5 seconds | ✅ |
| Simultaneous executions | 30 | Unchanged | ✅ |
| Properties store | 500 KB | Unused (config in AppConfig tab) | ✅ |

### Why One File, Not Multiple .gs Files?

Google Apps Script *does* support multiple `.gs` files in a project, but:

1. **All files share one global scope anyway** — GAS concatenates them at runtime. Separate files are purely organizational, not modular.
2. **Deployment is simpler** — one file to copy-paste or push via `clasp`. No file ordering issues.
3. **Search is easier** — `Ctrl+F` finds anything. No hunting across tabs in the GAS editor.
4. **Matches the current pattern** — each `*_Combined.gs` is already a single large file. This just combines the four into one.

If the file becomes unwieldy to navigate in the GAS editor, the built-in **function sidebar** (click the dropdown at top) lists every function alphabetically — with ~24K lines and well-named functions, this is sufficient.

---

## Phased Implementation Plan

### Phase 0: Test Harness (before any changes)
> **Goal:** Automated smoke test for every existing route so we can detect breakage instantly.

- [ ] Build a GAS test runner that hits every `doGet()` action across all 4 current endpoints
- [ ] Log: action name, HTTP status, response shape (keys present), latency
- [ ] Store baseline results in a test sheet
- [ ] This harness runs against the *current* live system — it becomes our regression suite

**Risk if skipped:** 300+ routes means silent failures are guaranteed without automated coverage.

### Phase 1: Build the Sheet (safe, no code changes)
> **Goal:** Create the destination spreadsheet with 105 numeric tabs, ready to receive data.

- [ ] Create new Google Sheet
- [ ] Run `setupAll_()` to create tabs 1–105 with correct headers
- [ ] Verify every tab has the right column count and names
- [ ] Deploy as Web App (no routes yet — just returns `{status: 'empty'}`)

**Rollback:** Delete the sheet. Zero impact on production.

### Phase 2: Merge Code.gs (offline, no deployment)
> **Goal:** Combine all 4 `.gs` files into one `Code.gs` with the new shared layer.

- [ ] Create `Code.gs` skeleton: T map, `tab_()`, `resolveName_()`, `jitter_()`
- [ ] Port John handlers → Section 4 (replace `getSheetByName` → `tab_()`)
- [ ] Port Mark handlers → Section 5
- [ ] Port Luke handlers → Section 6
- [ ] Port Matthew handlers → Section 7
- [ ] Build unified `doGet()` router combining all 4 action maps
- [ ] Remove SQL handlers and denormalized `_Name` write logic
- [ ] Inline auth (read Passcode Hash / Salt / Auth Status from People tab)
- [ ] Add `resolveName_()` calls where `_Name` columns were read

**Rollback:** Don't deploy. Old system untouched.

### Phase 3: Migrate Data
> **Goal:** Copy all production data from 4 sheets into the new single sheet.

- [ ] Run `migrate_()` — copies each source tab's data into the corresponding numeric tab
- [ ] Handle People merge (Members + AuthUsers + UserProfiles + AccessControl → one tab)
- [ ] Handle InteractionLog merge (ContactLog + SpiritualCareInteractions → one tab)
- [ ] Handle StatisticsData conversion (58 cols → key-value rows)
- [ ] Verify row counts match source: every tab, every row, every cell
- [ ] Run `healthCheck_()` — confirm all 105 tabs populated correctly

**Rollback:** Re-run migration from unchanged source sheets.

### Phase 4: Deploy & Cut Over
> **Goal:** Point the frontend at the new single endpoint.

- [ ] Deploy `Code.gs` as Web App on the new sheet
- [ ] Run the Phase 0 test harness against the *new* endpoint — compare results to baseline
- [ ] Fix any discrepancies (response shape, missing data, wrong values)
- [ ] Update `the_true_vine.js` — change 4 endpoint URLs to 1
- [ ] Update `the_wellspring.js` — collapse 4-spring model to 1, merge Well functions in
- [ ] Remove `the_well.js` from build
- [ ] Deploy frontend

**Rollback:** Revert `the_true_vine.js` to 4 endpoints. Old sheets + scripts are still live.

### Phase 5: Burn-In & Cleanup
> **Goal:** Run both old and new in parallel, then decommission old.

- [ ] Keep old 4 sheets read-only for 2 weeks as safety net
- [ ] Monitor audit log for errors, latency, failed writes
- [ ] Confirm offline mode, Drive backup/restore, template generation all work
- [ ] After burn-in: archive old sheets, delete old GAS deployments
- [ ] Update minified production files via build pipeline

### Phase Summary

| Phase | Risk | Reversible | Blocks Production |
|-------|------|------------|-------------------|
| 0 — Test Harness | None | N/A | No |
| 1 — Build Sheet | None | Delete sheet | No |
| 2 — Merge Code | None | Don't deploy | No |
| 3 — Migrate Data | Low | Re-run from source | No |
| 4 — Deploy & Cut Over | **Medium** | Revert frontend | **Yes — brief** |
| 5 — Burn-In | Low | Roll back to old | No |

> **The only moment production is at risk is Phase 4**, and it's reversible in under 2 minutes by pointing TheVine back to the old URLs.

---
---

# APPENDIX — Reference Data for Migration

Everything below is reference material extracted from the current codebase. This data is needed to build the single-sheet architecture without access to the original repo.

---

## A. Current Endpoint URLs (TheVine Config)

From `the_true_vine.js`:

```javascript
const _config = {
  APP_ENDPOINTS: [      // Matthew (app) — Public content, teaching
    'https://script.google.com/macros/s/AKfycbwzGpGTvFUrlHorhaq8rx-ZyNn5maITN8orust8WQRsOdF8iVhGDnfqui8N2uiO69z3/exec',
    '', ''  // SECONDARY, TERTIARY (load-balancing slots)
  ],
  FLOCK_ENDPOINTS: [    // John (flock) — Church management
    'https://script.google.com/macros/s/AKfycbyqma1-37ODHOZPUnys0zNVcuEGAWULD2VfISAwFk35mtKGzIPNFAhSlLzyfGr2ibzc/exec',
    '', ''
  ],
  MISSIONS_ENDPOINTS: [ // Mark (missions) — Global missions
    'https://script.google.com/macros/s/AKfycbzgGKXulonZM8WkUrwskqowAsENnpzTOjQwGkSZiV6RGC3gVVaVt1PAFddbAQZpB-_2/exec',
    '', ''
  ],
  EXTRA_ENDPOINTS: [    // Luke (extra) — Statistics, analytics
    'https://script.google.com/macros/s/AKfycbyNY3qTYZsdrf9EF1X5_4-4RY9qejc2TCf1E-8i4RiwvZHsTgq18pIXXFa3Aoa74do6Zg/exec',
    '', ''
  ],
};
```

Each array supports 3-tier load balancing (`TIER_PRIMARY`, `TIER_SECONDARY`, `TIER_TERTIARY`) with optional `RANDOMIZE`. In the single-sheet architecture, all 4 collapse to **one URL**.

---

## B. Script Properties per GAS Project

These are stored in the GAS editor under Project Settings → Script Properties. They move into the single project.

### John (Flock CRM)
| Key | Purpose |
|-----|---------|
| `SHEET_ID` | Flock CRM spreadsheet ID |
| `FLOCK_AUTH_PEPPER` | 64-char hex pepper for password hashing |
| `exp.session.<token>` | Server-side session storage (dynamic keys, prefix-based) |
| `reset_<email>` | Forgot-password reset codes (1-hour TTL) |

### Mark (Missions)
| Key | Purpose |
|-----|---------|
| `SHEET_ID` | Same master spreadsheet |
| `FLOCK_URL` | John's deployed URL (for `auth.validate` cross-service calls) |
| `auth_cache_<hash>` | Cached auth validation results (~5 min TTL) |

### Luke (Statistics/Extra)
| Key | Purpose |
|-----|---------|
| `SHEET_ID` | Same master spreadsheet |
| `FLOCK_URL` | John's deployed URL (for `auth.validate`) |
| `auth_cache_<hash>` | Cached auth validation results (~5 min TTL) |

### Matthew (App/Content)
| Key | Purpose |
|-----|---------|
| `SHEET_ID` | App/Content spreadsheet ID |

### After Migration (single project)
| Key | Purpose | Notes |
|-----|---------|-------|
| `SHEET_ID` | The one spreadsheet | Only one needed |
| `FLOCK_AUTH_PEPPER` | Password hashing pepper | From John |
| `exp.session.<token>` | Session tokens | From John |
| `reset_<email>` | Password reset codes | From John |
| ~~`FLOCK_URL`~~ | ~~Cross-service auth~~ | **Eliminated** — auth is local |
| ~~`auth_cache_<hash>`~~ | ~~Auth cache~~ | **Eliminated** — no cross-service calls |

---

## C. AppConfig Tab Keys

All keys read from the `AppConfig` tab via `getAppConfigValue_()`:

| Key | Default | Purpose |
|-----|---------|---------|
| `ADMIN_EMAIL` | `''` | Notification email for admin events |
| `ALLOW_SELF_REGISTER` | `'FALSE'` | Enable public self-registration |
| `CAL_SHARE_TOKEN` | `''` | Calendar sharing token |
| `CARD_PREFIX` | (none) | Member card number prefix (e.g., `ATOG`) |
| `CHURCH_NAME` | `'FlockOS'` | Display name in emails/UI |
| `LOCKDOWN` | `'FALSE'` | System lockdown toggle |
| `MIN_PASSCODE_LENGTH` | `'6'` | Minimum password length |
| `MODULE_<name>` | `'TRUE'` | Per-module enable/disable toggle |
| `ORG_NAME` | `'FlockOS Church'` | Organization name (calendar exports) |
| `PHOTO_DRIVE_FOLDER_ID` | (none) | Google Drive folder for photos |
| `PHOTO_MAX_SIZE_MB` | (none) | Photo upload size limit |
| `SERMON_DRIVE_FOLDER_ID` | (none) | Google Drive folder for sermons |
| `SERMON_MAX_SIZE_MB` | (none) | Sermon upload size limit |
| `SESSION_TTL_HOURS` | `'6'` | Session expiration in hours |
| `TWILIO_ENABLED` | (none) | Enable Twilio SMS gateway |

**Removed in single-sheet:** `SQL_ENABLED`, `SQL_INSTANCE`, `SQL_DATABASE`, `SQL_USER`, `SQL_PASSWORD` (Cloud SQL dropped).

---

## D. RBAC — Role Levels & Module Permissions

### Role Hierarchy

| Level | Role | Aliases | Can Do |
|:-----:|------|---------|--------|
| 0 | `readonly` | — | View own profile, submit prayer requests |
| 1 | `volunteer` | — | + Create/view own tasks, view non-confidential data |
| 2 | `care` | `deacon` | + View directory, pastoral care, spiritual care |
| 3 | `leader` | `treasurer` | + Groups, attendance, giving, discipleship, outreach, reports |
| 4 | `pastor` | — | + Messages, missions, statistics, approve/deny registrations |
| 5 | `admin` | — | + User management, config, audit, bulk operations |

`hasRole` uses `>=` — a pastor (4) can do everything a leader (3) can.

### MODULE_PERMISSIONS (44 modules)

| Module Key | Min Role | Label |
|------------|:--------:|-------|
| `dashboard` | 0 | Dashboard |
| `upper-room` | 0 | Upper Room |
| `reading` | 0 | Reading Plan |
| `devotionals` | 0 | Devotionals |
| `prayer` | 0 | Prayer Request |
| `my-requests` | 0 | My Requests |
| `words` | 0 | Lexicon |
| `sermons` | 0 | Sermons |
| `learning` | 0 | Learning |
| `theology` | 0 | Theology |
| `library` | 0 | The Word |
| `songs` | 1 | Songs |
| `calendar` | 1 | Calendar |
| `events` | 1 | Events |
| `services` | 1 | Services |
| `ministries` | 1 | Ministries |
| `volunteers` | 1 | Volunteers |
| `todo` | 1 | Tasks |
| `checkin` | 1 | Check-In |
| `journal` | 1 | Journal |
| `photos` | 1 | Photos |
| `directory` | 2 | Directory |
| `care` | 2 | Pastoral Care |
| `my-flock` | 2 | My Flock |
| `prayer-admin` | 2 | Prayer Admin |
| `compassion` | 2 | Compassion |
| `mirror` | 2 | Mirror |
| `groups` | 3 | Groups |
| `attendance` | 3 | Attendance |
| `giving` | 3 | Giving |
| `discipleship` | 3 | Discipleship |
| `outreach` | 3 | Outreach |
| `reports` | 3 | Reports |
| `comms` | 4 | Messages |
| `missions` | 4 | Missions |
| `statistics` | 4 | Statistics |
| `users` | 5 | User Management |
| `config` | 5 | Settings |
| `audit` | 5 | Audit Log |

Per-user overrides live in the **Permissions** tab (6 cols). `hasModuleAccess()` checks: per-user override → role default. Frontend: `Nehemiah.canAccess(moduleKey)`.

---

## E. Frontend File Inventory

### Entry Points (3 app shells)

| Production File | Source | Role |
|----------------|--------|------|
| `index.html` (root) | `Genesis/index.html` | Public-facing SPA |
| `Revelation/the_good_shepherd.min.html` | `Genesis/the_good_shepherd.html` | Authenticated admin dashboard (PWA start_url) |
| `Revelation/the_wall.min.html` | `Genesis/the_wall.html` | Login / auth page |

### JavaScript Modules (19 files)

| Module | File | Lines (approx) | Purpose |
|--------|------|:--------------:|---------|
| **TheVine** | `the_true_vine.js` | ~800 | API router — 4 endpoint branches + LOCAL_RESOLVER + caching (`nurture`/`grove`) |
| **The Wellspring** | `the_wellspring.js` | ~700 | IndexedDB offline layer — CRUD resolver, vault (AES-256-GCM) |
| **TheWell** | `the_well.js` | ~500 | Google Drive sync — backup/restore/template (merges into Wellspring) |
| **Nehemiah** | `firm_foundation.js` | ~300 | Auth guard — LOGIN_PAGE / APP_PAGE routing, session, RBAC |
| **Fine Linen** | `fine_linen.js` | ~600 | CSS theme system — 8+ themes, health pills, Interface Studio |
| **The Tabernacle** | `the_tabernacle.js` | ~9,500 | Module registry — 30+ `_def()` renderers, shared infrastructure |
| **TheLife** | `the_life.js` | ~2,200 | My Flock Dashboard — KPI ribbon, 4 app launchers, care editors |
| **TheWay** | `the_way.js` | ~2,400 | Learning Hub — 16 tabs, courses, quizzes, certificates |
| **TheHarvest** | `the_harvest.js` | ~1,000 | Ministry Hub — 7 tabs, events, sermons, services |
| **TheSeason** | `the_seasons.js` | ~2,000 | Calendar Hub — calendar/tasks/check-in, recurrence engine |
| **TheShepherd** | `the_shepherd.js` | ~500 | People Engine — search, profiles, 12 sections, 3-step save (`_mid_` guard skips Account step for no-email members) |
| **TheScrolls** | `the_scrolls.js` | ~250 | Interaction Ledger — 30+ types, timeline, localStorage+backend |
| **LoveInAction** | `love_in_action.js` | ~280 | Care Hub — 4-tab Care/Prayer/Compassion/Outreach |
| **TheFold** | `the_fold.js` | ~230 | Groups & Attendance — 2-tab interface |
| **TheShofar** | `the_shofar.js` | ~400 | Song library — chord charts, Music Stand, PDF export |
| **TheTrumpet** | `the_trumpet.js` | ~350 | Notifications & announcements |
| **ThePagans** | `the_pagans.js` | ~300 | Outreach contacts & campaigns |
| **TheCommission** | `the_commission.js` | ~200 | Deployment guide — 10 phases, static |
| **TheCornerstone** | `the_cornerstone.js` | ~150 | Architecture registry — runtime API/route/role map |

All `.js` source files live in `Genesis/`. Minified counterparts (`.min.js`) in `Acts/`. Build via `minify.sh`.

### Standalone HTML Pages (11 pages)

| Source (Genesis/) | Production (Revelation/) | Topic |
|-------------------|--------------------------|-------|
| `fishing-for-men.html` | `fishing-for-men.min.html` | Evangelism tool |
| `prayerful_action.html` | `prayerful_action.min.html` | Prayer action guide |
| `the_anatomy_of_worship.html` | `the_anatomy_of_worship.min.html` | Worship teaching |
| `the_call_to_forgive.html` | `the_call_to_forgive.min.html` | Forgiveness teaching |
| `the_generations.html` | `the_generations.min.html` | Generational genealogy (Tailwind + Chart.js) |
| `the_gift_drift.html` | `the_gift_drift.min.html` | Spiritual gifts assessment |
| `the_invitation.html` | `the_invitation.min.html` | Church invitation |
| `the_pentecost.html` | `the_pentecost.min.html` | Deployment/planning guide |
| `the_weavers_plan.html` | `the_weavers_plan.min.html` | God's plan teaching |
| `the_good_shepherd.html` | `the_good_shepherd.min.html` | Admin dashboard |
| `the_wall.html` | `the_wall.min.html` | Login page |

### Learn More Pages (Romans/)

| File | Content |
|------|---------|
| `1-Matthew.html` | Matthew (App/Content) docs |
| `2-Mark.html` | Mark (Missions) docs |
| `3-Luke.html` | Luke (Statistics) docs |
| `4-John.html` | John (Flock/CRM) docs |
| `5-Acts.html` | Acts (Frontend) docs |
| `6-Romans.html` | Romans folder docs |
| `7-Revelation.html` | Revelation folder docs |

---

## F. Service Worker (the_living_water.js)

```javascript
const CACHE_VERSION = 'flockos-v2.25';
const API_CACHE     = 'flockos-api-v1';
```

### Cached Files (APP_SHELL)

- `./`, `./index.html`, `./manifest.json`
- 11 minified HTML pages from Revelation/
- 2 icons: `FlockOS_White.png`, `FlockOS_Blue.png`
- 18 minified JS files from Acts/ + `the_commission.min.js`

### Cache Strategies

| Request Type | Strategy |
|-------------|----------|
| Static assets (APP_SHELL) | **Cache-first** — serve from cache, fallback to network |
| Google Fonts | **Cache-first** |
| GAS API calls (`script.google.com`) | **Network-first** — cache fallback, then 503 JSON offline response |
| Non-GET requests | Pass through (no caching) |

### After Migration
- Update APP_SHELL to remove `the_well.min.js`, keep `the_wellspring.min.js`
- Bump `CACHE_VERSION` to force re-cache on all clients
- GAS API cache pattern unchanged — just fewer origin URLs to match

---

## G. PWA Manifest

```json
{
  "name": "FlockOS",
  "short_name": "FlockOS",
  "description": "Church Management & Ministry Platform",
  "start_url": "FlockOS/Genesis/the_good_shepherd.html",
  "scope": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#e8a838",
  "orientation": "any",
  "icons": [
    { "src": "FlockOS/Genesis/FlockOS_White.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "FlockOS/Genesis/FlockOS_Blue.png", "sizes": "512x512", "type": "image/png", "purpose": "any" }
  ],
  "categories": ["productivity", "lifestyle"],
  "shortcuts": [
    { "name": "Dashboard", "url": "FlockOS/Genesis/the_good_shepherd.html#dashboard" },
    { "name": "Messages", "url": "FlockOS/Genesis/the_good_shepherd.html#comms" },
    { "name": "Directory", "url": "FlockOS/Genesis/the_good_shepherd.html#directory" }
  ]
}
```

---

## H. External Dependencies

| Dependency | Version | CDN URL | Used By |
|-----------|---------|---------|---------|
| **SheetJS** | 0.20.3 | `https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js` | TheWellspring, TheWell (Excel parsing) |
| **Google Identity Services** | latest | `https://accounts.google.com/gsi/client` | TheWell (OAuth2 popup) |
| **Google Fonts** | latest | `fonts.googleapis.com` / `fonts.gstatic.com` | Fine Linen (theme fonts) |
| **Tailwind CSS** | CDN | (inline in the_generations.html only) | Standalone page |
| **Chart.js** | CDN | (inline in the_generations.html only) | Standalone page |

No npm packages. No bundler. No build framework. Pure vanilla JS + GAS.

---

## I. localStorage / sessionStorage Keys

### sessionStorage (cleared on tab close)

| Key | Used By | Purpose |
|-----|---------|---------|
| `flock_auth_session` | TheVine, Nehemiah | Active auth session (token, role, TTL) |
| `flock_auth_profile` | TheVine, Nehemiah | User profile data |
| `flock_secure_vault` | TheVine | Vault reference (cleared on logout) |

### localStorage (persistent)

| Key | Used By | Purpose |
|-----|---------|---------|
| `flock_wellspring_mode` | TheWellspring | `'true'` = offline mode active |
| `flock_local_bypass` | Nehemiah | Local dev bypass flag |
| `flock_global_theme` | Fine Linen | Active theme name |
| `flock_font_scale` | Settings | Desktop font scale |
| `flock_font_scale_mobile` | Settings | Mobile font scale |
| `flock_allow_custom_themes` | Settings | Custom theme toggle |
| `flock_calendar_settings` | TheSeason | Calendar preferences |
| `flock_provisioning` | Admin | Provisioning state |
| `flock_quiz_size` | Quiz module | Quiz question count |
| `flock_diag_heart` | Heart diagnostic | Heart module state |
| `flock_diag_quiz` | Quiz diagnostic | Quiz module state |
| `flock_module_visibility` | Modules | Toggle switches per module |
| `flock_well_last_sync` | TheWell | Per-spring sync timestamps |
| `tw_reading_progress` | Reading module | Bible reading progress |

### IndexedDB

| Database | Store | Key Format | Purpose |
|----------|-------|-----------|---------|
| `FlockOS_Wellspring` | `sheets` | `spring:TabName` | Parsed Excel row data |
| `FlockOS_Wellspring` | `meta` | `spring` | Load metadata (timestamp, file size, tabs) |
| `FlockOS_Wellspring` | `vault` | `VAULT_KEY` | AES-256-GCM encrypted session (PIN-protected, 30-day TTL) |

---

## J. Build Pipeline

### minify.sh (run from repo root)

```bash
#!/bin/bash
cd "$(dirname "$0")"
.venv/bin/python FlockOS/Exodus/minify.py
```

### minify.py

Uses `rjsmin` (JS minification) and `minify_html` (HTML minification). Requires Python venv with both packages installed.

| Source | Output | Tool |
|--------|--------|------|
| `Genesis/*.js` (most) | `Acts/*.min.js` | `rjsmin.jsmin()` |
| `Genesis/the_living_water.js` | `./the_living_water.min.js` (repo root) | `rjsmin.jsmin()` |
| `Genesis/the_commission.js` | `Revelation/the_commission.min.js` | `rjsmin.jsmin()` |
| `Genesis/*.html` (11 pages) | `Revelation/*.min.html` | `minify_html.minify(minify_js=True, minify_css=True)` |
| `Genesis/index.html` | `./index.html` (repo root) | `minify_html.minify()` |
| `Genesis/Learn More.html` | `./Learn More.html` (repo root) | `minify_html.minify()` |

### After Migration
- Add `the_well.js` to skip list (retired)
- Output stays the same — `the_wellspring.min.js` is the only offline file

---

## K. Wiring Conventions

### Row Lookups
- ALL update/delete handlers use `findRowById(db(), TAB, NUM_COLS, params.id)`
- NEVER use `params.rowIndex` — row numbers shift on insert/delete
- Frontend `_edit()` sets `data.id` automatically — always a UUID
- One exception: `resolveOutreachContactRow_()` has a dual-mode resolver (intentional)

### Backend Handler Pattern
```javascript
function handleSomethingUpdate(params) {
  var ss = db();
  var sheet = ss.getSheetByName('TabName');  // → becomes tab_(N)
  var rows = sheet.getDataRange().getValues();
  var row = findRowById(ss, 'TabName', NUM_COLS, params.id);
  if (!row) return error_('Not found');
  
  // Mutate in memory
  row[COL_A] = params.fieldA;
  row[COL_B] = params.fieldB;
  
  // Single batch write
  sheet.getRange(row._rowNum, 1, 1, NUM_COLS).setValues([row.slice(0, NUM_COLS)]);
  
  writeAudit(params.email, 'something.update', params.id);
  return success_({ id: params.id });
}
```

### Frontend → Backend Contract
- Every API call is a GET request with query params: `?action=module.verb&token=...&param1=...`
- Response is always JSON: `{ success: true, data: ... }` or `{ success: false, error: '...' }`
- Token passed as query param (GAS Web Apps don't support custom headers)

### ID Generation
- `newId()` (Theology section) and `generateId()` (John section) both call `Utilities.getUuid()`
- All IDs are UUIDs stored in column A of every tab

---

## L. Script Loading Order

### the_good_shepherd.html (Admin Dashboard)

```
1.  fine_linen.min.js         — Themes & CSS
2.  the_true_vine.min.js      — API router
3.  SheetJS CDN               — Excel parsing
4.  the_wellspring.min.js     — IndexedDB offline
5.  the_well.min.js           — Drive sync (→ retired)
6.  the_tabernacle.min.js     — Module registry (~9,500 lines)
7.  the_cornerstone.min.js    — Architecture registry
8.  the_seasons.min.js        — Calendar Hub
9.  the_scrolls.min.js        — Interaction Ledger
10. the_shepherd.min.js       — People Engine
11. love_in_action.min.js     — Care Hub
12. the_fold.min.js           — Groups & Attendance
13. the_life.min.js           — My Flock Dashboard
14. the_harvest.min.js        — Ministry Hub
15. the_way.min.js            — Learning Hub
16. the_shofar.min.js         — Song Library / Music Stand
17. the_trumpet.min.js        — Notifications
18. the_pagans.min.js         — Outreach
19. firm_foundation.min.js    — Auth guard (LAST — gates everything)
```

### the_wall.html (Login Page)

```
1.  fine_linen.min.js
2.  the_true_vine.min.js
3.  SheetJS CDN
4.  the_wellspring.min.js
5.  the_well.min.js           — (→ retired)
6.  firm_foundation.min.js    — Auth guard
```

### index.html (Public SPA)
Same as admin dashboard — full script set.

---

## M. Folder Structure (Current → New Repo)

```
FlockOS/                          # Repo root
├── index.html                    # Public SPA (minified)
├── Learn More.html               # Info page (minified)
├── manifest.json                 # PWA manifest
├── the_living_water.min.js       # Service worker (minified)
├── LICENSE
├── README.md
└── FlockOS/
    ├── Acts/                     # Minified frontend JS (legacy, optional)
    ├── Database/                 # Backend GAS files + schema docs
    │   ├── Single.gs             # → Unified backend (~24,965 lines)
    │   ├── John_Combined.gs      # Legacy reference
    │   ├── Mark_Combined.gs      # Legacy reference
    │   ├── Luke_Combined.gs      # Legacy reference
    │   ├── Matthew_Combined.gs   # Legacy reference
    │   ├── Duplicate_Databases.gs
    │   ├── flockos_schema.sql    # PostgreSQL reference schema
    │   ├── flockos_project_notes.md
    │   ├── future_planning.md
    │   └── SCHEMA_AUDIT.md       # Column-level audit of all 94 tabs
    ├── Exodus/                   # Build tools
    │   ├── build.sh
    │   ├── minify.py
    │   └── minify.sh
    ├── Genesis/                  # Production source JS + HTML (served directly)
    │   ├── *.js                  # 19 JS source files
    │   ├── *.html                # 13 HTML source files
    │   ├── FlockOS_White.png     # 192×192 icon
    │   └── FlockOS_Blue.png      # 512×512 icon
    ├── Revelation/               # Legacy minified HTML (optional)
    │   └── *.min.html            # 11 minified HTML pages (not used in production)
    └── Romans/                   # Learn More documentation pages
        └── 1-Matthew.html through 7-Revelation.html
```

---

## N. Key Constants & Magic Numbers

| Constant | Value | Location | Purpose |
|----------|-------|----------|---------|
| `CACHE_VERSION` | `'flockos-v2.25'` | the_living_water.js | Service worker cache key |
| `DB_NAME` | `'FlockOS_Wellspring'` | the_wellspring.js | IndexedDB database |
| `DB_VERSION` | `1` | the_wellspring.js | IndexedDB schema version |
| `VAULT_ITERATIONS` | `100000` | the_wellspring.js | PBKDF2 cost (security) |
| `SESSION_TTL_HOURS` | `'6'` (AppConfig) | Single.gs | Session expiration |
| `CARD_PREFIX` | `'ATOG'` (AppConfig) | Single.gs | Member card prefix |
| `AUTO_SYNC_DEFAULT` | `15` (minutes) | the_well.js | Drive sync interval |
| `SCOPES` | `'drive.file'` | the_well.js | OAuth scope |
| `EXP_ROLE_LEVELS` | `{readonly:0...admin:5}` | Single.gs | RBAC hierarchy |

---

## O. Known Technical Debt & Gotchas

1. **Duplicate role constants** — `EXP_ROLE_LEVELS` in Single.gs, `ROLE_LEVELS` in firm_foundation.js, `_roleLevels` in the_seasons.js and the_shepherd.js. Single.gs has one canonical definition; frontend should have one.

2. **Two UUID generators** — `newId()` (Theology) and `generateId()` (John) both wrap `Utilities.getUuid()`. Consolidate to one.

3. **`slugify()` in Learning section** — only used there, but defined globally. Keep scoped.

4. **Renamed duplicates** — `compassionResourceToObj_()` vs `discipleshipResourceToObj_()` vs generic `resourceToObj_()`. Consolidate if signatures match.

5. **`resolveOutreachContactRow_()`** — only handler still using dual-mode `params.rowIndex` fallback. Migrate to pure `findRowById` during merge.

6. **Module visibility toggles** — stored in `localStorage` (`flock_module_visibility`), not synced to backend. Offline-safe but not multi-device.

7. **Token in query params** — GAS Web Apps don't support custom headers, so auth tokens are query params. This is a GAS platform limitation, not a bug, but means tokens appear in server logs.

8. **Session in Script Properties** — `exp.session.<token>` keys stored in Script Properties (500KB limit). For a large church with many concurrent sessions, this could fill up. Consider periodic cleanup.

9. **`_mid_` synthetic keys for no-email members** — `the_shepherd.js` merges AuthUsers + Members + MemberCards by email. Members without an email get a frontend-only key `_mid_<memberId>`. This key is never stored in the database. `saveAll()` skips the Account (users.update) step when it detects a `_mid_` prefix, since no AuthUsers row exists. The Member and MemberCard steps save by UUID and work normally.

---

## P. Twilio SMS Configuration

| Property | Location | Notes |
|----------|----------|-------|
| `TWILIO_ENABLED` | AppConfig tab | `'TRUE'` to enable |
| `TWILIO_SID` | Script Properties | Twilio Account SID |
| `TWILIO_TOKEN` | Script Properties | Twilio Auth Token |
| `TWILIO_NUMBER` | Script Properties | Twilio phone number |

When OFF: native `sms:` URI opens device messaging app.  
When ON: `TheVine.flock.sms.send()` → `handleSmsSend()` → Twilio REST API.  
Route: `sms.send`, requireRole `leader`. Control Panel Section 10.