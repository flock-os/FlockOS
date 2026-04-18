# FlockOS

> *"I am the vine; you are the branches."* — John 15:5

A ministry operating system built on Google Apps Script and Google Sheets — portable, offline-capable, and free to deploy. No subscriptions, no server, no infrastructure. One Google Sheet, one GAS Web App, and a static front-end on GitHub Pages.

---

## What It Is

FlockOS is a full-featured, multi-church ministry platform. A single codebase powers unlimited church deployments, each with independent branding and a separate backend. One unified API endpoint — backed by a 200-tab Google Sheet — handles members, pastoral care, prayer, giving, attendance, events, songs, missions, discipleship, and more.

The front-end is a progressive web app hosted on GitHub Pages. A companion real-time messaging app (**FlockChat**) is hosted separately on Firebase.

---

## Architecture

| Layer | Technology | Details |
|-------|-----------|---------|
| **Database** | Google Sheets | 200 tabs, one Sheet per church |
| **API** | Google Apps Script | One unified Web App endpoint per church |
| **Front-end** | HTML + Vanilla JS | GitHub Pages, no build step |
| **Messaging** | Firebase (Firestore + RTDB) | FlockChat — real-time rooms, DMs, presence |
| **Auth (FlockOS)** | SHA-256 + salt + pepper | RBAC — 6 permission levels |
| **Auth (FlockChat)** | Firebase Auth | Email/password |
| **Offline** | Service Worker + IndexedDB | Full offline capability via TheWellspring |

### API Domains

| Domain | Codename | Tabs | Purpose |
|--------|----------|-----:|---------|
| **FLOCK** | John | 79 | Members, auth, pastoral care, services, songs, communications |
| **EXTRA** | Luke | 53 | Analytics, metrics, expansion slots |
| **APP** | Matthew | 12 | Public content — devotionals, lexicon, quiz, theology |
| **MISSIONS** | Mark | 56 | Persecution data, country dossiers, mission teams |

**Total: 200 tabs · 1 Google Sheet · 1 GAS Web App endpoint per church**

---

## Folder Structure

```
FlockOS/
│
├── index.html                    Public landing page (GitHub Pages root)
├── manifest.json                 PWA manifest
├── the_living_water.js           Root service worker
├── FlockChat.html                FlockChat source (deployed to Firebase)
├── firebase.json                 Firebase hosting config
├── LICENSE
└── README.md
│
├── Church/                       ← Generated church deployments (build output)
│   └── <shortName>/              One folder per active church (built by A-Build_Churches.sh)
│       ├── index.html
│       ├── manifest.json
│       ├── the_living_water.js
│       └── FlockOS/              Branded copy of source
│
├── FlockChat/                    FlockChat assets (source)
│   ├── the_word.js               All FlockChat client logic
│   ├── manifest.json             PWA manifest for FlockChat
│   └── Images/                   FlockChat icons
│
├── flockchat-functions/          Firebase Cloud Functions
│   └── index.js                  FCM push notification dispatcher
│
└── FlockOS/                      ← SOURCE — edit here only
    ├── Images/                   Logo variants (Blue/Green/Midnight/Orange/Pink/White/Wide)
    ├── Pages/                    17 HTML pages (app shell + public teaching pages)
    ├── Scripts/                  21 JavaScript modules (~55,550 lines)
    └── Tools/
        ├── Flock Deployments/    Church JSON configs + build templates
        ├── Flock Scripts/        A-Build_Churches.sh (multi-church build)
        ├── Flock Docs/           Planning & architecture documents
        └── Flock Secrets/        (gitignored) API keys, credentials
```

> Church deployments in `Church/` are generated — never edit them directly.
> FlockChat source is `FlockChat.html` + `FlockChat/the_word.js`. Deploy with `firebase deploy --only hosting --project flockos-comms`.

---

## Source Files

### Pages (`FlockOS/Pages/`)

| File | Lines | Description |
|------|------:|-------------|
| `the_good_shepherd.html` | 2,423 | **Main app shell** — primary authenticated UI |
| `the_great_commission.html` | 2,410 | Admin Hub — deployment, permissions, audit, config |
| `the_pentecost.html` | 2,057 | Comprehensive as-built & deployment guide |
| `bezalel.html` | 1,786 | Bezalel Matrix — interactive architecture map |
| `quarterly_worship.html` | 1,716 | Quarterly Worship planner |
| `fishing-for-men.html` | 824 | Value proposition / evangelism pitch |
| `index.html` | 800 | App redirect shell |
| `the_wall.html` | 635 | Login page |
| `the_gift_drift.html` | 527 | Spiritual Gifts — 4-phase curriculum |
| `the_anatomy_of_worship.html` | 493 | Teaching — Anatomy of Worship |
| `the_call_to_forgive.html` | 480 | Teaching — The Call to Forgive |
| `the_generations.html` | 460 | Teaching — Generational Dynamics |
| `the_weavers_plan.html` | 408 | Teaching — The Weaver's Plan (Joseph) |
| `prayerful_action.html` | 387 | Teaching — Prayerful Action |
| `the_invitation.html` | 370 | Teaching — The Invitation |
| `About_FlockOS.html` | 327 | Vision / The Why page |
| `Learn More.html` | 175 | Feature overview marketing page |

### Scripts (`FlockOS/Scripts/`)

| File | Lines | JS Object | Role |
|------|------:|-----------|------|
| `the_tabernacle.js` | 21,646 | `Modules` | Core renderer — 48+ module UIs, Themes, Interface Studio |
| `fine_linen.js` | 6,271 | `Adornment` | CSS theme system — 13 themes + Interface Studio styles |
| `the_upper_room.js` | 4,919 | `UpperRoom` | Firebase Firestore comms — DMs, channels, notifications |
| `the_life.js` | 4,499 | `TheLife` | My Flock Portal — pastoral care, prayer, care cases, compassion |
| `the_way.js` | 3,551 | `TheWay` | Learning Hub — 16-tab education dashboard |
| `the_seasons.js` | 2,519 | `TheSeason` | Calendar, Tasks & Check-In Hub |
| `the_shofar.js` | 2,102 | `musicStandAppState` | Song library, chord charts, Music Stand, PDF export |
| `the_true_vine.js` | 1,410 | `TheVine` | Centralized API client — 4 domains (John/Luke/Matthew/Mark) |
| `the_shepherd.js` | 1,377 | `TheShepherd` | People Engine — member search, profile, 3-step save |
| `the_commission.js` | 1,334 | `Blueprint` | Deployment automation blueprint |
| `the_harvest.js` | 951 | `TheHarvest` | Ministry Hub — events, sermons, service plans |
| `the_cornerstone.js` | 807 | `Temple` | Architecture registry (runtime-queryable) |
| `the_truth.js` | 756 | `TheTruth` | Content Editor — full CRUD for all public content tabs |
| `the_wellspring.js` | 752 | `TheWellspring` | Local data layer — IndexedDB offline mode |
| `firm_foundation.js` | 581 | `Nehemiah` | Auth guard — login, logout, RBAC, route guard |
| `the_well.js` | 579 | `TheWell` | Google Drive sync for offline churches |
| `the_trumpet.js` | 486 | `Trumpet` | Phone, share, notifications, QR, geolocation |
| `the_scrolls.js` | 316 | `TheScrolls` | Interaction Ledger — 30+ pastoral touchpoint types |
| `the_fold.js` | 302 | `TheFold` | Groups & Attendance |
| `the_living_water.js` | 232 | _(service worker)_ | Service worker source |
| `the_pagans.js` | 160 | — | Parked / dormant code |

**Total: ~55,550 lines of JavaScript across 21 files**

### FlockChat

| File | Lines | Role |
|------|------:|------|
| `FlockChat.html` | 1,457 | Single-page app shell — Firebase config, CSS, HTML structure |
| `FlockChat/the_word.js` | 1,567 | All client logic — auth, channels, DMs, roles, admin dashboard |
| `flockchat-functions/index.js` | 166 | Cloud Function — FCM push notification dispatcher |

**Deployed to:** `https://flockos-comms.web.app` (serves all churches via `?church=` URL param)

---

## FlockChat — Role & Permission System

FlockChat uses the same 6-level role hierarchy as FlockOS:

| Role | Level | Permissions |
|------|------:|-------------|
| `readonly` | 0 | Read-only access to visible channels |
| `volunteer` | 1 | Post messages, join public channels |
| `care` | 2 | Same as volunteer |
| `leader` | 3 | Create channels (public, private, role-gated) |
| `pastor` | 4 | Admin dashboard — manage users & rooms |
| `admin` | 5 | Full access |

### Channel Access Types

| Type | Behavior |
|------|---------|
| **Public** | Any member can join |
| **Private** | Invite-only; non-members see a "contact an admin" message |
| **Role-Gated** | Requires minimum role; channel is hidden from users below the threshold |

The admin dashboard (Pastor+) has two tabs: **Users** (assign roles, remove members) and **Rooms** (change access type, set minimum role, invite to private channels).

---

## Multi-Church Build System

Each church deployment is driven by a JSON config file in `FlockOS/Tools/Flock Deployments/`.

### Config schema (`ChurchTemplate.json`)

```json
{
  "id": "",
  "name": "",
  "shortName": "",
  "brandName": "",
  "tagline": "Church Management & Ministry Platform",
  "favicon": "",
  "portrait": "",
  "themeColor": "#e8a838",
  "backgroundColor": "#1a1a2e",
  "databaseUrl": "",
  "photosUrl": "",
  "adminEmail": "",
  "analyticsId": "",
  "version": "3.0"
}
```

### Build command

```bash
bash "FlockOS/Tools/Flock Scripts/A-Build_Churches.sh"
```

### What it does

1. Reads each `.json` config in `Flock Deployments/` (skips `ChurchTemplate.json`)
2. Fetches live church configs from the master API and regenerates the Bezalel codex files
3. Copies the source tree into `Church/<shortName>/`
4. Replaces database URL, tagline, theme/background colors, title, brand text, and manifest per-church

### Active Deployments

| Short Name | Church | URL |
|------------|--------|-----|
| `FlockOS` | FlockOS (default) | [Church/FlockOS/](https://flock-os.github.io/FlockOS/Church/FlockOS/) |
| `GAS` | Grace Apostolic Sanctuary | [Church/GAS/](https://flock-os.github.io/FlockOS/Church/GAS/) |
| `TBC` | Trinity Baptist Church | [Church/TBC/](https://flock-os.github.io/FlockOS/Church/TBC/) |
| `TheForest` | The Forest | [Church/TheForest/](https://flock-os.github.io/FlockOS/Church/TheForest/) |

### Adding a new church

1. Copy `ChurchTemplate.json` → `flockos-yourchurch.json` in `Flock Deployments/`
2. Fill in all fields
3. Optionally add a logo to `FlockOS/Images/`
4. Run `A-Build_Churches.sh`
5. Commit and push — church is live at `Church/<shortName>/`

---

## Deploying a New Church Backend

Full step-by-step instructions are in `FlockOS/Pages/the_pentecost.html`. Short version:

### 1. Create the Google Sheet

Create a Google Sheet named **FlockOS — [Church Name]**. Copy the Sheet ID from the URL.

### 2. Deploy the GAS backend

1. Open the project from within the Sheet (Extensions → Apps Script)
2. Paste `Master Code.gs` as `Code.gs`
3. Set `churchName` and `timezone` at the top of the file
4. Run **`setupFlockOS`** — builds all 200 tabs, seeds content, creates the admin account, and installs care email triggers in one run
5. Deploy → **New Deployment → Web App** (Execute as: Me, Who has access: Anyone)
6. Copy the Web App URL into `DEPLOY_CONFIG.churchAppUrl`, then run **`registerChurchUrl`**

### 3. Connect the front-end

Add the Web App URL as `databaseUrl` in the church's JSON config, then run `A-Build_Churches.sh`.

---

## Authentication

| Property | Value |
|----------|-------|
| Method | Email + passcode |
| Hashing | SHA-256 · per-user salt · server-side pepper |
| Session TTL | 6 hours (configurable in AppConfig) |
| RBAC levels | `readonly` (0) · `volunteer` (1) · `care` (2) · `leader` (3) · `pastor` (4) · `admin` (5) |

---

## Key Features

- **Member Management** — Full CRUD with pastoral notes, tags, contact masking
- **Member Cards** — Sequential card numbers with configurable prefix
- **Pastoral Care** — 13 care types with per-type workflow guides, interaction logging, follow-up scheduling, and daily pastoral summary emails. Resolve checklist per care type. Convert prayer requests directly to care cases.
- **Prayer** — Public submission + admin management, status tracking, assignment, pastoral reply, one-click conversion to spiritual care case (with non-member name support)
- **Compassion & Outreach** — Benevolence fund, needs tracking, campaigns
- **Discipleship** — Growth paths, milestones, courses, quizzes
- **Daily Devotional** — Scripture, reflection, reading plan, journal, prayer
- **Learning Hub** — 16-tab education portal: courses, quizzes, theology, lexicon, apologetics, counseling, devotionals, reading plans, certificates
- **World Missions** — 48 country dossiers, partner tracking, prayer focus, team management
- **Music Stand** — Song CRUD, ChordPro charts, arrangement management, live setlist, PDF export
- **Calendar** — Month/week/day/agenda, personal events, iCal feeds, recurrence, task management
- **Service Planning** — Order builder with item scheduling
- **Attendance & Check-In** — Small groups, Bible studies, event check-in
- **Communications** — Email/SMS templates, campaign tracking, delivery logs
- **Volunteers** — Scheduling, team assignments, vCard download
- **Statistics** — Attendance, giving, growth analytics dashboards
- **Themes** — 13 built-in themes, personal theme picker, Interface Studio (30+ controls)
- **Audit Logging** — All interactions tracked with user, action, timestamp
- **Offline Mode (TheWellspring)** — Full offline capability via IndexedDB — import an `.xlsx` snapshot, all 200 tabs served locally
- **Google Drive Sync (TheWell)** — Auto-sync church data backed by Drive `.xlsx` files
- **Automated Pastoral Emails** — Care follow-up reminders, escalation alerts, daily 6 AM pastoral summary
- **Module Permissions** — Per-user GRANT/DENY overrides via Permissions sheet
- **iOS Ready** — All inputs 16px min, responsive modals, root font-size: 100% for user scaling
- **FlockChat** — Real-time church messaging with role-gated channels, private rooms, DMs, presence indicators, push notifications, and a full admin dashboard
- **Multi-Church** — Unlimited church deployments from one codebase, each with independent branding and database

---

## License

**Proprietary — All Rights Reserved.**

All contents of this repository — including all source code, scripts, pages, assets, build tools, and documentation — are the exclusive intellectual property of Greg Granger.

No portion of this software may be used, copied, modified, distributed, or deployed in any form without **express prior written permission** from the copyright holder. This applies to all components without exception, including the CRM software, FlockChat, learning modules, and all build and deployment tooling.

Licensing for churches, organizations, and developers is available upon request.

See [LICENSE](LICENSE) for full terms.


---
