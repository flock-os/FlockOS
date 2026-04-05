# FlockOS Project Documents

A comprehensive index of all files in the FlockOS master project. Changes should be made ONLY in the master/root copy (`/FlockOS/`). Use this file as a checklist when doing site-wide updates.

_Last audited: April 3, 2026 — FlockOS v3.5_

---

## Root Files (/)

These files live at the root of the repo and are the public-facing entry points.

| File | Description |
|------|-------------|
| `index.html` | Public marketing/landing page (title: "FlockOS") — includes Google Analytics |
| `About_FlockOS.html` | Public "The Why" page (title: "FlockOS — The Why") — vision & purpose |
| `manifest.json` | PWA manifest — `start_url` points to `FlockOS/Pages/the_good_shepherd.html` |
| `the_living_water.js` | Service worker at root scope — cache-first static, network-first API, offline fallback |
| `README.md` | Project readme |
| `LICENSE` | Project license |
| `.gitignore` | Git ignore rules (see Master Git Ignore.md for canonical reference) |
| `.nojekyll` | Disables GitHub Pages Jekyll processing so paths are served as-is |

---

## FlockOS/Pages/ — HTML Pages

> ⚠️ `the_good_shepherd.html` and `index.html` (root) are both master CSS/HTML files. **Always update them together.**

| File | Title | Description |
|------|-------|-------------|
| `index.html` | FlockOS | Redirect shell — routes into the app |
| `About_FlockOS.html` | FlockOS — The Why | The Why / vision page (mirrors root `About_FlockOS.html`) |
| `Learn More.html` | FlockOS — Learn More | Feature overview / learn more marketing page |
| `fishing-for-men.html` | FlockOS — Value Proposition | Value proposition / evangelism pitch page |
| `prayerful_action.html` | Prayerful Action | Teaching: prayerful action in ministry |
| `the_anatomy_of_worship.html` | The Anatomy of Worship | Teaching: anatomy of worship |
| `the_call_to_forgive.html` | The Call to Forgive: A Deep Dive | Teaching: deep dive on forgiveness |
| `the_generations.html` | Generational Dynamics in the Evangelical Church (2026) | Teaching: generational dynamics in evangelicalism |
| `the_gift_drift.html` | Spiritual Gifts: A Rigorous Teaching Framework | Teaching: spiritual gifts framework |
| `the_good_shepherd.html` | FlockOS — Admin | **Main app shell** — primary authenticated UI, master CSS/HTML file |
| `the_invitation.html` | A Hope-Filled View of Jesus Christ | Teaching: vision of Christ / the invitation to faith |
| `the_pentecost.html` | FlockOS — Deployment & Project Guide | Internal deployment & project guide page |
| `the_wall.html` | FlockOS — The Wall | Internal: The Wall — project status / milestone board |
| `the_weavers_plan.html` | The Weaver's Plan — The Story of Joseph | Teaching: The Weaver's Plan, the story of Joseph |

---

## FlockOS/Scripts/ — JavaScript Modules

| File | JS Object | Description |
|------|-----------|-------------|
| `fine_linen.js` | `Adornment` | Design system & theme engine — 8 pastel themes (4 light / 4 dark), auto dark mode, pill components; syncs to TheVine or localStorage |
| `firm_foundation.js` | `Nehemiah` | Auth module — gate check, login, logout, register, forgot/reset password, route guard, role enforcement |
| `love_in_action.js` | `LoveInAction` | Pastoral care hub — care, prayer, compassion, and outreach; delegates full-page editing to TheLife |
| `the_commission.js` | `Blueprint` | Master deployment guide — runtime-queryable phases, checklist, test matrix (21 cases), RBAC table, URL map, feature inventory, troubleshooting |
| `the_cornerstone.js` | `Temple` | Architecture registry — every API, action, route, and role; drives TheVine, Nehemiah, and the tabernacle |
| `the_fold.js` | `TheFold` | Groups & attendance — small groups, Bible studies, attendance tracking |
| `the_harvest.js` | `TheHarvest` | Ministry hub — events, sermons, service plans, songs, ministry teams, and volunteer scheduling |
| `the_life.js` | `TheLife` | Pastoral command hub — care, prayer, compassion, outreach, discipleship, communications, and pastoral notes with full-page editors. My Flock dashboard includes shortcut tiles for People, Love in Action, The Fold, Activity Feed, and Missions. **Care case editor includes universal per-type guide panels** — all 13 care types (Crisis, Grief, Marriage, Addiction, Hospital Visit, New Believer, Restoration, Counseling, Discipleship, Family, Financial, Shepherding, Elder Care) each have a `_CFG` entry with icon, accent color, default priority, stage list, and notes template. `_applyCareType()` fires on care type dropdown change: renders the guide panel, elevates priority, and injects the notes template. |
| `the_living_water.js` | _(service worker)_ | Service worker — cache v`flockos-v3.3`; pre-caches app shell on install, purges stale on activate, cache-first static / network-first API |
| `the_pagans.js` | _(none)_ | **Parked / dormant code** — not loaded at runtime; preserves code for future use (e.g. original Google Drive sync layer) |
| `the_scrolls.js` | `TheScrolls` | Unified interaction ledger — every touch, call, text, email, visit, note, prayer, and pastoral action; searchable timeline per person and globally |
| `the_seasons.js` | `TheSeason` | Calendar, tasks & check-in hub — church events, personal calendar, iCal feeds, task management, and attendance check-in |
| `the_shepherd.js` | `TheShepherd` | People engine — unified search, profile view, multi-table save, permissions, member & card creation, interaction logging |
| `the_shofar.js` | `musicStandAppState` | Song manager & live chord view — song CRUD, arrangement CRUD, setlist assignment, Music Stand chord-chart view, PDF lead-sheet export |
| `the_tabernacle.js` | `Modules` | Module views — LiveData UI for every sidebar module in the app shell; renders skeletons, calls TheVine, populates tables/dashboards. Prayer Focus tab uses collapsible accordion cards matching the devotional theme (Description, Scripture, Prayer Points sections; full text, no truncation) |
| `the_true_vine.js` | `TheVine` | Centralized API client — 4 branches: Matthew (app/content), Mark (missions), Luke (analytics), John (flock/CRM); all API calls flow through here |
| `the_trumpet.js` | `Trumpet` | Phone & device integration — Web Share, clipboard, tel/SMS dialers, Web Notifications, PWA badge, fullscreen, camera, image resize, QR code, geolocation |
| `the_truth.js` | `TheTruth` | Content Editor — full CRUD interface for all Matthew (APP) public-content tabs: Devotionals, Apologetics, Counseling, Lexicon, Books, Genealogy, Heart Check, Mirror, Quiz, and Reading Plan. Restricted to Pastor and Admin roles only. "Sanctify them by the truth; your word is truth." — John 17:17 |
| `the_way.js` | `TheWay` | Learning hub — courses, quizzes, reading plans, theology, lexicon, apologetics, counseling, devotionals, certificates, and analytics |
| `the_well.js` | `TheWell` | Backup, restore & template system — generates blank .xlsx templates, backs up live data from TheVine to .xlsx, restores rows from uploaded .xlsx files |
| `the_wellspring.js` | `TheWellspring` | Local data layer — runs FlockOS entirely from a local .xlsx loaded via IndexedDB; hooks TheVine's resolver so all 200 tabs are served offline with no backend |

---

## FlockOS/Images/ — Image Assets

| File | Description |
|------|-------------|
| `Favicon.png` | App favicon |
| `FlockOS_Blue.png` | Logo — Blue variant |
| `FlockOS_Green.png` | Logo — Green variant |
| `FlockOS_Midnight.png` | Logo — Midnight variant |
| `FlockOS_Orange.png` | Logo — Orange variant |
| `FlockOS_Pink.png` | Logo — Pink variant |
| `FlockOS_White.png` | Logo — White variant |
| `FlockOS_Wide.jpeg` | Wide / banner logo |

---

## FlockOS/Tools/Current Deployment/ — Reference Documents

| File | Description |
|------|-------------|
| `Project Documents.md` | **This file** — master index of all project files |
| `Action Items.md` | Prioritized backend/frontend gap items — v1.3, updated 2026-04-02 |
| `API Code.md` | Google Apps Script source code — `Single.gs` (unified FlockOS API, ~25,300 lines). Includes: full care notification system (new case, assignment, follow-up reminder, escalation, daily 6 AM pastoral summary); all 13 care type workflow support; `CHURCH_APP_URL` AppConfig key; all notification email subject lines use plain-text labels (no emoji) |
| `Backup API Code.md` | Backup copy of `API Code.md` |
| `Custom Links.md` | Complete reference of all hash deep links and standalone page URLs for FlockOS church deployments |
| `Database Backup Manager.md` | Single database backup manager code and procedures |
| `Deployment Guide.md` | Exact step-by-step guide to deploying a new FlockOS instance from scratch (primary DB, backup DB, bidirectional sync, peer registration). Includes full AppConfig key reference |
| `Master Git Ignore.md` | Canonical `.gitignore` reference — v1.3; copy contents to repo root |
| `Master Schema Audit.md` | Complete table/tab schema audit across all 4 domains (82 tabs in FLOCK + all others) |
| `Permissions Audit.md` | Role-level permissions audit across all API actions |
| `Schema Audit Report.md` | Detailed schema verification report |
| `Single File Application.md` | Single-sheet architecture analysis — ✅ COMPLETED March 27, 2026; all 4 sheets and GAS projects consolidated into `Single.gs` (~24,965 lines) |
| `Workflows.md` | Complete care workflow library — 13 care type workflows (Crisis, Grief, Marriage, Addiction, Hospital Visit, New Believer, Restoration, Counseling, Discipleship, Family, Financial, Shepherding, Elder Care); each with stage-by-stage instructions, FlockOS steps, and scriptural anchors |

---

## FlockOS/Tools/Active Deployments/ — Church Deployment Configs

| File | Description |
|------|-------------|
| `ChurchTemplate.json` | Blank template config for provisioning a new church deployment |
| `flockos-default.json` | Config for the FlockOS Default deployment (id: `FlockOS-Default`) |
| `flockos-tbc.json` | Config for the TBC church deployment |
| `flockos-test.json` | Config for the Test church deployment |

---

## FlockOS/Tools/Development Scripts/ — Build & Dev Tools

| File | Description |
|------|-------------|
| `build.sh` | Master build script — assembles the root deployment |
| `build_churches.sh` | Multi-church deployer — reads JSON configs and writes branded output to `Church/<shortName>/` |
| `minify.py` | Python minification script |
| `minify.sh` | Shell minification wrapper |
| `test_regex.py` | Regex test utility |
| `Commands.md` | Terminal commands reference — run from repo root `/Users/greg.granger/Desktop/FlockOS/Software` |
| `flockos_project_notes.md` | Consolidated project notes — combined from 13 internal .txt files; single-source architecture, deployment, config, and planning reference |

---

## FlockOS/Tools/Master Deployment/ — Master Deployment Docs

| File | Description |
|------|-------------|
| `Instructions for Master.md` | Multi-church deployment as-built reference — ✅ IMPLEMENTED v1.3 (March 31, 2026); describes single-codebase + build-script model |
| `The Why.md` | Vision document — "This Was Never About Software" |
| `Training and Use.md` | Master training guide — end-user documentation for all roles, modules, workflows, common tasks, notifications, auto-refresh behavior, and admin procedures |

---

## Church Deployments (Read-Only — Do Not Edit Directly)

> Generated by `build_churches.sh` from the master. **Always edit master files only.**

| Folder | Deployment |
|--------|------------|
| `Church/FlockOS/` | FlockOS Default church |
| `Church/TBC/` | TBC church |
| `Church/Test/` | Test church |
