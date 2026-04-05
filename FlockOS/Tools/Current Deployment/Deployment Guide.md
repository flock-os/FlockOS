# FlockOS — Exact Deployment Guide
> "I am the vine; you are the branches." — John 15:5

This document covers deploying a **new FlockOS instance from scratch** — primary database, backup database, bidirectional sync, and peer registration. Follow every step in order.

---

## Prerequisites

- A Google account (used for both Google Sheets and Google Apps Script)
- The `Single.gs` source file
- The `Backup_Single.gs` source file

---

## PART 1 — PRIMARY DATABASE SETUP

### Step 1 — Create the Primary Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) → **Blank spreadsheet**.
2. Name it something like `FlockOS — [Church Name]`.
3. Copy the **Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/  <<< THIS PART >>>  /edit
   ```
   Save it. You will need it in the next step.

---

### Step 2 — Create the Primary GAS Project

1. Go to [script.google.com](https://script.google.com) → **New project**.
2. Name it `FlockOS — [Church Name] Primary`.
3. Delete all default code in `Code.gs`.
4. Paste the entire contents of `Single.gs` into `Code.gs`.
5. Click **Save** (Ctrl+S / Cmd+S).

---

### Step 3 — Set the SHEET_ID Script Property

1. In the GAS editor: **Project Settings** (gear icon on left) → **Script Properties**.
2. Click **Add script property**.
3. Property: `SHEET_ID`
4. Value: *(the Sheet ID you copied in Step 1)*
5. Click **Save script properties**.

---

### Step 4 — Run setupFlockOS()

1. In the function dropdown at the top, select `setupFlockOS`.
2. Click **Run**.
3. When prompted, click **Review permissions** → authorize **Google Sheets** and **Google Drive** access.
4. Wait for it to finish (~60–90 seconds). The Execution Log will print a full numbered deployment sequence when complete.

> This creates all ~200 tabs and seeds the AppConfig tab with default values.

---

### Step 5 — Initialize the Auth Pepper

1. Select `initPepper` from the function dropdown.
2. Click **Run**.
3. The Execution Log will confirm: `Pepper created and stored in Script Properties`.

> **This must run before any user can log in.** If the pepper is lost, all passwords must be reset.

---

### Step 6 — Create the First Admin User

1. In `Code.gs`, scroll to the `createFirstAdmin` function (or `seedFirstAdmin`).
2. Fill in the four constants at the top of the function:
   ```js
   var email     = 'your@email.com';
   var password  = 'YourSecurePassword123!';
   var firstName = 'Your';
   var lastName  = 'Name';
   ```
3. Select `createFirstAdmin` (or `seedFirstAdmin`) from the function dropdown.
4. Click **Run**.
5. Verify the Execution Log confirms the admin was created.

> **SECURITY — MANDATORY:** Immediately after running, **clear the `password` value** from the code:
> ```js
> var password = '';   // ← clear this immediately
> ```
> Never leave plain-text credentials in source code.

---

### Step 7 — Deploy as Web App (Primary)

1. Click **Deploy** → **New deployment**.
2. Click the gear icon next to "Type" → select **Web app**.
3. Set:
   - **Description:** `FlockOS Primary v1`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
4. Click **Deploy**.
5. Copy the **Web App URL** displayed. This is your `DATABASE_URL` (also called the primary endpoint).

> Save this URL. It goes into `the_true_vine.js` as `DATABASE_URL`.

---

### Step 8 — Configure Church Settings in AppConfig

1. Open the primary Google Sheet.
2. Find the **AppConfig** tab.
3. Set the following values:

| Key | Value | Notes |
|-----|-------|-------|
| `CHURCH_NAME` | Your church's full name | Used in all notification email subjects and footers |
| `ADMIN_EMAIL` | The admin's email | Receives registration alerts and system notifications |
| `CHURCH_APP_URL` | Full URL pastors use to open FlockOS | Appended to all notification email footers as a clickable link. Use the TheVine front-end URL (GitHub Pages URL), **not** the GAS backend URL |
| `LEAD_PASTOR_MEMBER_ID` | Member ID of the lead pastor | Auto-assigned as Primary Caregiver on new care cases |
| `CARE_FOLLOWUP_DAYS` | `3` (default) | Days without a logged interaction before a follow-up reminder is emailed to the caregiver |
| `NOTIFY_CARE_CASE` | `TRUE` | Send pastor notification when a new care case is opened |
| `NOTIFY_CARE_ASSIGNMENT` | `TRUE` | Send direct email to caregiver when a care case is assigned or reassigned |
| `DAILY_SUMMARY_ENABLED` | `TRUE` | Send daily 6 AM pastoral summary email to all active pastors |

> All AppConfig keys are seeded with safe defaults by `setupFlockOS()`. You only need to set the ones above manually.

---

### Step 8a — Install Care Notification Triggers

Two time-triggered GAS functions send automated pastoral emails. Install them after deploying the primary GAS project:

1. In the primary GAS project: **Triggers** (clock icon, left sidebar) → **Add Trigger**.
2. Install **`careFollowUpReminder`**:
   - Function: `careFollowUpReminder`
   - Event source: **Time-driven**
   - Type: **Day timer**
   - Time: any time (runs daily)
3. Install **`dailyPastoralSummary`**:
   - Function: `dailyPastoralSummary`
   - Event source: **Time-driven**
   - Type: **Day timer**
   - Time: **6am to 7am**
4. Set the GAS project timezone to **America/Los\_Angeles** (Project Settings → Time zone).

**What these send:**

| Trigger | Recipients | Subject format | Condition |
|---------|------------|----------------|-----------|
| `careFollowUpReminder` | Assigned caregiver | `[Follow-Up Needed] CareType (Priority) — ChurchName` | No logged interaction in `CARE_FOLLOWUP_DAYS` days |
| `careFollowUpReminder` (escalation) | All pastors | `[Escalation] Care Case — No Contact in X Days` | No contact in 2× `CARE_FOLLOWUP_DAYS` days |
| `dailyPastoralSummary` | All active pastors | `ChurchName Daily Summary — Date \| X Urgent` | Runs daily at 6 AM Pacific |

---

## PART 2 — BACKUP DATABASE SETUP

### Step 9 — Create the Backup Manager GAS Project

1. Go to [script.google.com](https://script.google.com) → **New project**.
2. Name it `FlockOS — [Church Name] Backup Manager`.
3. Delete all default code in `Code.gs`.
4. Paste the entire contents of `Backup_Single.gs` into `Code.gs`.
5. Click **Save**.

---

### Step 10 — Set the Source Sheet ID

In `Code.gs`, find `BACKUP_CONFIG` near the top and fill in:

```js
var BACKUP_CONFIG = {
  SOURCE_SHEET_ID: '<paste your primary Sheet ID here>',
  ...
};
```

---

### Step 11 — Run createBackupSheet()

1. Select `createBackupSheet` from the function dropdown.
2. Click **Run**.
3. Authorize Google Drive + Sheets access when prompted.
4. When it finishes, the Execution Log will print the new **BACKUP_SHEET_ID**.
   Copy it. You will use it in the next steps.

> The backup Sheet ID is also saved automatically in this project's Script Properties.

---

### Step 12 — Open the Backup Sheet and Add Single.gs

1. Go to [sheets.google.com](https://sheets.google.com). You will see a new sheet named `FlockOS — Live Backup`.
2. Open it → **Extensions** → **Apps Script**.
3. A new GAS project opens (this is the backup's own GAS project, separate from the Backup Manager).
4. Delete all default code in `Code.gs`.
5. Paste the entire contents of `Single.gs` into `Code.gs`.
6. Click **Save**.

---

### Step 13 — Set SHEET_ID on the Backup GAS Project

1. In the backup's GAS project: **Project Settings** → **Script Properties**.
2. Add:
   - Property: `SHEET_ID`
   - Value: *(the BACKUP_SHEET_ID from Step 11)*
3. Click **Save script properties**.

---

### Step 14 — Deploy the Backup as a Web App

1. Click **Deploy** → **New deployment**.
2. Gear icon → **Web app**.
3. Set:
   - **Description:** `FlockOS Backup v1`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
4. Click **Deploy**.
5. Copy the **backup Web App URL**.

> Save this URL. It becomes the backup `DATABASE_URL` in `the_true_vine.js`, and TheVine will auto-discover it via peer registration.

---

### Step 15 — Mark the Backup Instance in AppConfig

1. Open the **backup** Google Sheet (not the primary).
2. Find the **AppConfig** tab.
3. Set:

| Key | Value |
|-----|-------|
| `IS_BACKUP_INSTANCE` | `TRUE` |

> This tells TheVine this endpoint is the failover, not the primary.

---

## PART 3 — PEER REGISTRATION

### Step 16 — Register the Backup in the Primary

1. Go back to the **primary GAS project** (the one with `Single.gs` you set up in Steps 2–3).
2. Open `Code.gs` and run `registerPeer` from the Script Editor console:

```js
registerPeer('<BACKUP_SHEET_ID>', '<backup Web App URL>')
```

Replace both values with the actual backup sheet ID (from Step 11) and the backup Web App URL (from Step 14).

To run it:
1. Add a temporary wrapper function:
   ```js
   function _runRegisterPeer() {
     registerPeer('1BxiM...backupSheetId', 'https://script.google.com/macros/s/.../exec');
   }
   ```
2. Select `_runRegisterPeer` from the dropdown → **Run**.
3. The Execution Log will confirm both values were written.
4. Delete the wrapper function afterward.

> `registerPeer()` writes `PEER_SHEET_ID` and `PEER_WEB_APP_URL` into AppConfig and caches the backup URL in Script Properties. TheVine then auto-discovers the backup URL via `?action=system.peerUrl` — no URL hardcoding needed in `the_living_water.js` per church.

---

## PART 4 — HOURLY SYNC

### Step 17 — Install the Sync Trigger

Choose **one** of the two options below:

#### Option A — Real-time (recommended for most churches)

1. Go to the **Backup Manager GAS project**.
2. Select `installOnChangeTrigger` from the function dropdown.
3. Click **Run**.

`syncOnChange_()` fires immediately on every write to the primary sheet (every API call that modifies data). A `LockService` guard prevents parallel fires from stacking — if a sync is already running when the trigger fires, the new fire is silently dropped (the in-progress sync captures the change anyway).

> **When to use this:** Normal church deployments. Response time is seconds, not minutes.
>
> **When NOT to use this:** If you expect extremely high write volume (100+ simultaneous API calls/minute), use Option B to avoid hitting GAS execution quotas.

#### Option B — Scheduled every 5 minutes (high-traffic or large datasets)

1. Go to the **Backup Manager GAS project**.
2. Select `installHourlyTrigger` from the function dropdown.
3. Click **Run**.

This calls `syncSheets()` every 5 minutes regardless of activity. You can pass a custom interval (in minutes) by calling `installHourlyTrigger(10)` from the Script Editor console.

> **Switching between options:** Running either install function automatically removes the other trigger first. No manual cleanup needed.

---

## PART 5 — VERIFICATION

### Step 18 — Run deploymentChecklist()

1. Go back to the **primary GAS project**.
2. Select `deploymentChecklist` from the function dropdown.
3. Click **Run**.
4. Review the Execution Log. All 7 checks should show ✅:

| # | Check | Remediation if ⚠️ |
|---|-------|-------------------|
| 1 | `SHEET_ID` script property is set | Re-run Step 3 |
| 2 | Auth pepper initialized | Run `initPepper()` |
| 3 | At least 1 active admin exists | Run `createFirstAdmin()` |
| 4 | `CHURCH_NAME` configured | Set in AppConfig tab |
| 5 | `ADMIN_EMAIL` configured | Set in AppConfig tab |
| 6 | Backup peer registered (`PEER_SHEET_ID` + `PEER_WEB_APP_URL`) | Run `registerPeer()` per Step 16 |
| 7 | `IS_BACKUP_INSTANCE` = FALSE on primary | Check AppConfig — should be FALSE or blank on primary |

---

### Step 19 — Verify Backup Status

1. Go to the **Backup Manager GAS project**.
2. Select `checkBackupStatus` from the dropdown → **Run**.
3. Execution Log will show:
   - Source ID
   - Backup ID
   - Last sync timestamp
   - Last sync direction
   - Whether the hourly trigger is active

---

## PART 6 — CONNECT THE FRONTEND

### Step 20 — Create a Church Config File

1. Navigate to `FlockOS/Tools/Active Deployments/`.
2. Copy `ChurchTemplate.json` → `flockos-yourchurch.json`.
3. Fill in all fields:

```json
{
  "id": "flockos-yourchurch",
  "name": "Your Church Name",
  "shortName": "YCN",
  "brandName": "Your Church Name | FlockOS",
  "tagline": "Church Management & Ministry Platform",
  "logo": "FlockOS_Blue.png",
  "themeColor": "#e8a838",
  "backgroundColor": "#1a1a2e",
  "databaseUrl": "<paste your Web App URL from Step 7>",
  "adminEmail": "admin@yourchurch.org",
  "analyticsId": "",
  "version": "1.3"
}
```

**Field reference:**

| Field | Required | Purpose |
|-------|----------|---------|
| `id` | Yes | URL-safe unique identifier (lowercase, hyphens only) |
| `name` | Yes | Full church name — used in `<title>`, meta tags, offline page, login wall |
| `shortName` | Yes | Abbreviated name — used as output folder name and PWA `short_name` |
| `brandName` | Yes | Text shown in the top navigation bar (e.g. "My Church \| FlockOS") |
| `tagline` | Yes | App description / `og:description` meta |
| `logo` | No | Logo filename in `FlockOS/Images/`. Leave empty to keep default (`FlockOS_Midnight.png`) |
| `themeColor` | Yes | PWA theme color (browser chrome) |
| `backgroundColor` | Yes | PWA background / splash screen color |
| `databaseUrl` | Yes | Google Apps Script Web App URL from Step 7 |
| `adminEmail` | Yes | Admin notification email address |
| `analyticsId` | No | Google Analytics Measurement ID (e.g. `G-XXXXXXXXXX`) |
| `version` | Yes | FlockOS version this deployment runs |

> If you have a custom logo, place it in `FlockOS/Images/` and set the `logo` field to its filename.

---

### Step 21 — Build the Church Deployment

1. From the repo root, run:
   ```bash
   bash FlockOS/Tools/Development\ Scripts/build_churches.sh
   ```
2. The script will output:
   ```
   Building N church deployment(s)…
     → YCN (Your Church Name)
       → Church/YCN/
   ```
3. Verify the output in `Church/YCN/`:
   - `Church/YCN/index.html` — should show your church name in `<title>`
   - `Church/YCN/manifest.json` — should show your church name and logo
   - `Church/YCN/the_living_water.js` — offline page should reference your church name
   - `Church/YCN/FlockOS/Scripts/the_true_vine.js` — should contain your `databaseUrl`

---

### Step 22 — Commit and Deploy

1. `git add -A && git commit -m "Add [Church Name] deployment"`
2. `git push origin main`
3. Your church is now live at:
   ```
   https://flock-os.github.io/FlockOS/Church/YCN/
   ```

> **Note:** The root deployment at `https://flock-os.github.io/FlockOS/` serves the default FlockOS source. Each church gets its own branded copy under `Church/<shortName>/`.

---

## Maintenance Reference

| Task | Where | Function |
|------|-------|----------|
| Add a new deployment | Primary GAS | `Deploy → New deployment` |
| Check deployment health | Primary GAS | `deploymentChecklist()` |
| Sync now (manual) | Backup Manager GAS | `syncSheets()` |
| Check backup status | Backup Manager GAS | `checkBackupStatus()` |
| Reset hourly trigger | Backup Manager GAS | `removeAllTriggers()` → `installHourlyTrigger()` |
| Switch to real-time sync | Backup Manager GAS | `installOnChangeTrigger()` |
| Switch to scheduled sync | Backup Manager GAS | `installHourlyTrigger()` or `installHourlyTrigger(5)` |
| Update peer URL | Primary GAS | `registerPeer(sheetId, newUrl)` |
| Migrate passwords after restoring | Primary GAS | `migrateAllPasswords()` |
| Reset a user's password | Admin dashboard | `users.resetPasscode` API |

---

## Security Checklist

- [ ] `ADMIN_PASSWORD` cleared from source code after `createFirstAdmin()` ran
- [ ] Pepper confirmed present in Script Properties (never in the Sheet)
- [ ] Backup `IS_BACKUP_INSTANCE = TRUE` in AppConfig
- [ ] Primary `IS_BACKUP_INSTANCE = FALSE` (or blank) in AppConfig
- [ ] Web App deployed as "Execute as: Me" — never as the user
- [ ] `CHURCH_NAME` and `ADMIN_EMAIL` set in AppConfig
- [ ] `CHURCH_APP_URL` set to the TheVine front-end URL (not the GAS backend URL)
- [ ] `LEAD_PASTOR_MEMBER_ID` set in AppConfig
- [ ] `careFollowUpReminder` GAS trigger installed (Day timer)
- [ ] `dailyPastoralSummary` GAS trigger installed (Day timer, 6am–7am, America/Los\_Angeles)
- [ ] Hourly trigger confirmed active via `checkBackupStatus()`

---

*"Built on the firm foundation." — Matthew 7:24*
