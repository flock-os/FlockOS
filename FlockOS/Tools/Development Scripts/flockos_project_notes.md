# FlockOS — Consolidated Project Notes

> **Generated:** Consolidated from 13 internal .txt files across 4-John/ and Revelation/
> **Purpose:** Single-source reference for all architecture, deployment, configuration, and planning documentation
> **Status:** Living document — update as the project evolves
> **Security:** This file contains sensitive project details. Do NOT commit to public repositories.

> **⚠️ AS-BUILT NOTE (v1.3 — March 31, 2026):** FlockOS now runs on a **unified architecture**:
> - **1 Google Sheet** (200 tabs) · **1 GAS Web App** (`Single.gs`, ~25,000 lines) · **1 endpoint** (`DATABASE_URL`)
> - **21 JS files** (39,770 lines) · **13 HTML pages** (7,944 lines) · **6 logo variants** in `FlockOS/Images/`
> - **Multi-church build system**: 3 active deployments (FlockOS, TBC, Test) built from JSON configs in `FlockOS/Tools/Active Deployments/`
> - **Build command**: `bash FlockOS/Tools/Development\ Scripts/build_churches.sh` → generates `Church/<shortName>/`
> - The folder `FlockOS-GS/` has been renamed to `FlockOS/`
> - Historical entries below reference the original 4-sheet / 4-API / 4-project architecture as it existed at the time of writing.
> - For the current AS-BUILT architecture, see the root `README.md`, `Deployment Guide.md`, and `Instructions for Master.md`.

---

## Table of Contents

- [1. Identity & Vision — The Thematic Approach](#1-identity-vision-the-thematic-approach)
- [2. Architecture & Configuration — Complete Module Reference](#2-architecture-configuration-complete-module-reference)
- [3. Master Deployment Guide — 10-Phase Deployment](#3-master-deployment-guide-10-phase-deployment)
- [4. Cloud SQL — Exact Deployment Instructions](#4-cloud-sql-exact-deployment-instructions)
- [5. API Load Distribution — Step-by-Step Guide](#5-api-load-distribution-step-by-step-guide)
- [6. Complete Worksheet Reference — All 201 Tabs](#6-complete-worksheet-reference-all-201-tabs)
- [7. Frontend-Backend Wiring Audit](#7-frontend-backend-wiring-audit)
- [8. Navigation & Permissions Audit](#8-navigation-permissions-audit)
- [9. Calendar Implementation Plan](#9-calendar-implementation-plan)
- [10. TheWell — Google Drive Offline Sync](#10-thewell-google-drive-offline-sync)
- [11. Performance Optimization — Action Items](#11-performance-optimization-action-items)
- [12. Critical Configuration & Data Integrity](#12-critical-configuration-data-integrity)
- [13. Infrastructure — GCP Project Details](#13-infrastructure-gcp-project-details)

---

# 1. Identity & Vision — The Thematic Approach

> *Source: Revelation/9_Thematic_Approach.txt*

```
════════════════════════════════════════════════════════════════════════════════
  FLOCKos — THE THEMATIC APPROACH
  Shepherding the Flock of God, Willingly, Not Under Compulsion
  1 Peter 5:2
════════════════════════════════════════════════════════════════════════════════

  "Shepherd the flock of God that is among you, exercising oversight,
   not under compulsion, but willingly, as God would have you."
                                                    — 1 Peter 5:2 (ESV)


  This document describes the deliberate, scripture-rooted naming
  convention that shapes every layer of the FlockOS Church CRM—from
  folder structure to filenames to runtime objects—and explains why
  the decision to build a church management platform as a living
  biblical metaphor is itself an act of ministry.


═══════════════════════════════════════════════════════════════════════════════
  1. WHY A THEMATIC APPROACH
═══════════════════════════════════════════════════════════════════════════════

  Most software projects name their files after what the code does.
  config.js. auth.js. styles.css. The names are functional,
  forgettable, and interchangeable with any project in any industry.
  There is nothing wrong with that convention. It works.

  FlockOS takes a different path. Every file, every folder, every
  major namespace carries a name drawn from Scripture—not as
  decoration, but as declaration. The names are chosen to reflect the
  spiritual purpose of what the code actually accomplishes, anchoring
  each technical component to the biblical calling it serves.

  The reasoning is simple. If the software exists to shepherd the
  flock of God, then the software itself should speak that language.
  A developer opening the_good_shepherd.html knows immediately that
  this is the admin dashboard—the place where the shepherd oversees
  the congregation. A developer opening firm_foundation.js
  understands that this code guards the gate, protecting who enters
  and who is turned away. The metaphors are not arbitrary. They are
  instructive.

  This approach serves three purposes:

  1. CLARITY — Biblical names create instant mental models for anyone
     familiar with Scripture. "The Vine" connecting to four branches
     is immediately understood as a central hub feeding multiple
     endpoints. "The Wall" is obviously a security boundary.

  2. INTENTIONALITY — Naming forces the developer to ask: "What is
     the spiritual analog of what I am building?" That question
     keeps the project's ministry purpose at the center of every
     technical decision.

  3. WITNESS — The codebase itself becomes a form of testimony. Every
     file header carries a verse. Every folder echoes a book of the
     Bible. The source code declares its purpose before a single line
     of logic executes.


═══════════════════════════════════════════════════════════════════════════════
  2. THE SEVEN FOLDERS — A NEW TESTAMENT PROGRESSION
═══════════════════════════════════════════════════════════════════════════════

  The project is organized into seven folders, each named after a
  book of the New Testament. The progression mirrors the narrative
  arc of the early church: teaching, mission, record-keeping,
  shepherding, action, doctrine, and revelation.

  1-Matthew    PUBLIC TEACHING & INSTRUCTION
  ─────────────────────────────────────────────────────────────────
  Matthew's Gospel is the great book of instruction—the Sermon on
  the Mount, the parables, the Great Commission. This folder holds
  the APP API: public content endpoints that serve devotionals,
  theology, lexicon entries, and Bible study tools. Just as Matthew
  recorded Christ's teachings for all who would listen, this API
  delivers spiritual content to anyone who asks.

  2-Mark       GOING TO THE NATIONS
  ─────────────────────────────────────────────────────────────────
  Mark is the Gospel of urgency and movement—"immediately" appears
  over forty times. This folder holds the MISSIONS API: 56 tabs
  covering global missions, persecution data, country dossiers, and
  team management. Mark's breathless pace matches the call to go
  quickly to the ends of the earth.

  3-Luke       THE CAREFUL RECORD
  ─────────────────────────────────────────────────────────────────
  Luke was the physician, the historian, the one who "investigated
  everything carefully from the beginning" (Luke 1:3). This folder
  holds the EXTRA API: analytics, statistics, metrics, and growth
  tracking. Luke's meticulous nature is the model for a system that
  counts, measures, and reports with precision.

  4-John       SHEPHERDING THE FLOCK
  ─────────────────────────────────────────────────────────────────
  John is the Gospel of intimacy—the Good Shepherd who knows his
  sheep by name (John 10:3). This is the largest folder, holding
  26 files and the FLOCK API: member management, pastoral care,
  communications, services, songs, giving, discipleship, and
  everything that touches the daily life of the congregation. John's
  emphasis on relationship and personal knowledge defines what this
  API does: it knows every member, tracks every interaction, and
  facilitates every act of care.

  Acts       THE CHURCH IN ACTION
  ─────────────────────────────────────────────────────────────────
  Acts records the early church moving from upper room to the known
  world—powered by the Spirit, organized for mission. This folder
  holds all nineteen frontend JavaScript modules. These are the files
  that make the application live and move: rendering views, guarding
  gates, connecting to APIs, playing music, applying themes, and
  enabling offline access for those without reliable internet. Acts
  is where doctrine becomes action, and this folder is where backend
  data becomes a living, breathing interface.

  Romans     DOCTRINAL FOUNDATIONS
  ─────────────────────────────────────────────────────────────────
  Romans is Paul's most systematic doctrinal letter—laying out the
  foundations of faith with care and precision. This folder holds
  the Learn More pages, one per folder, explaining the purpose and
  architecture of each section. Just as Romans teaches the "why"
  behind the faith, these pages teach the "why" behind the code.

  Revelation COMPLETE ARCHITECTURE REVEALED
  ─────────────────────────────────────────────────────────────────
  Revelation pulls back the curtain on the full scope of God's plan.
  This folder is the project's reference library: deployment guides,
  configuration documentation, API references, wiring audits, and
  the admin dashboard itself. Everything that was built across the
  other six folders is documented, mapped, and explained here. The
  architecture is revealed in full.


═══════════════════════════════════════════════════════════════════════════════
  3. THE NINETEEN SCRIPTS — INSTRUMENTS OF THE TABERNACLE
═══════════════════════════════════════════════════════════════════════════════

  Within Acts, nineteen JavaScript files carry the entire frontend.
  Each is named for a biblical artifact, figure, or concept that
  mirrors what the code does.

  the_true_vine.js — John 15:5
  "I am the vine; you are the branches."
  ─────────────────────────────────────────────────────────────────
  The centralized API client that connects every frontend action to
  all four backend branches (Matthew, Mark, Luke, John). Just as
  every branch draws life from the vine, every API call flows
  through TheVine. It is the single source of connectivity—remove
  it, and every module withers.

  firm_foundation.js — 1 Corinthians 3:11
  "For no one can lay a foundation other than that which is laid,
   which is Jesus Christ."
  ─────────────────────────────────────────────────────────────────
  The authentication guard. Login, logout, session management, role
  enforcement. This is the foundation on which every secure
  interaction rests. Without it, the application has no identity,
  no permissions, no trust. Named also for Nehemiah, who rebuilt the
  wall and guarded the gates of Jerusalem against those who would
  enter without authority.

  fine_linen.js — Revelation 19:8
  "Fine linen, bright and clean, was given her to wear."
  ─────────────────────────────────────────────────────────────────
  The CSS theme system. Thirteen visual themes—light and dark—
  injected dynamically into every page. Health pills, Interface
  Studio overrides, responsive layouts, and the entire visual
  identity of the application. Fine linen is the garment of the
  bride of Christ, and this file clothes the interface in beauty,
  clarity, and purpose. The themes themselves carry evocative names:
  Dayspring, Meadow, Lavender, Rosewood, Vesper, Evergreen,
  Twilight, Obsidian.

  the_tabernacle.js — Exodus 25:8-9
  "Let them make me a sanctuary, that I may dwell in their midst."
  ─────────────────────────────────────────────────────────────────
  The module rendering engine—over 9,600 lines defining 48+ views.
  Every sidebar module, every data table, every edit modal, every
  navigation route. The Tabernacle was the dwelling place of God
  among His people, and this file is the dwelling place of every
  feature the congregation interacts with. It is the sanctuary where
  data becomes ministry: where a row in a spreadsheet becomes a
  member's name on a prayer list, a song in a setlist, a note in a
  pastoral care record.

  the_shofar.js — Psalm 150:3
  "Praise Him with the sound of the trumpet."
  ─────────────────────────────────────────────────────────────────
  The song manager and live chord view. Song CRUD, arrangement
  management, ChordPro rendering, setlist navigation, and PDF lead
  sheet export. The shofar—the ram's horn trumpet—was sounded to
  call Israel to worship, to mark feast days, and to rally the
  congregation. This file calls the worship team together, equipping
  them with charts, keys, and lyrics for corporate praise.

  the_truth.js — John 8:32
  "You will know the truth, and the truth will set you free."
  ─────────────────────────────────────────────────────────────────
  Reserved placeholder for a future truth/doctrine module. Currently
  empty, awaiting its calling.

  the_cornerstone.js — Ephesians 2:20
  "Christ Jesus himself being the cornerstone."
  ─────────────────────────────────────────────────────────────────
  The architecture registry. A runtime-queryable map of every API
  action, every route, every role, every permission. The cornerstone
  is the reference point from which every other stone is measured.
  This file is the reference point from which every other component
  aligns: if the_cornerstone.js says an action requires a pastor
  role, every other file respects that declaration.

  the_life.js — John 10:10
  "I came that they may have life and have it abundantly."
  ─────────────────────────────────────────────────────────────────
  The My Flock Portal—the pastoral heart of the application. Where
  every other file manages systems, this one manages souls. It is
  the space where a shepherd opens a care case, reaches out to a
  struggling member, records a prayer, tracks a compassion request,
  and adds a new sheep to the fold. The name is drawn from Christ's
  own words in John 10:10: He came not to maintain a database of
  names, but to give life—and to give it abundantly. The_life.js
  is built to make that calling practical: every interaction logged,
  every follow-up scheduled, every member known by name.

  the_wellspring.js — John 4:14
  "Whoever drinks the water I give them will never thirst. Indeed,
   the water I give them will become in them a spring of water
   welling up to eternal life."
  ─────────────────────────────────────────────────────────────────
  The local data layer. When internet access is unreliable or
  unavailable, TheWellspring allows FlockOS to run entirely from
  local .xls/.xlsx files loaded through the browser and stored in
  IndexedDB. TheVine's resolver hook routes API calls through
  TheWellspring instead of fetching from remote endpoints—the
  cloud-hosted interface remains unchanged; only the data source
  changes. Four springs correspond to the four databases (Matthew,
  Mark, Luke, John), and the Settings Data Source panel provides
  import, export, and status controls. The wellspring metaphor
  captures what this file does: it provides a local, ever-present
  source of data that never runs dry, ensuring that churches
  without reliable internet connections can still access, and use,
  FlockOS.

  the_way.js — John 14:6
  "I am the way, the truth, and the life."
  ─────────────────────────────────────────────────────────────────
  The Learning Hub. A consolidated growth portal encompassing
  courses, quizzes, reading plans, theology, lexicon, apologetics,
  counseling, devotionals, certificates, and analytics. Just as
  Christ declared Himself the way to the Father, this module charts
  the path of discipleship—guiding each believer through study,
  reflection, and spiritual formation. Its dashboard mirrors the
  Ministry Hub format: KPI ribbon, 2-column activity cards, donut
  charts, and quick-action launchers across 16 learning tabs.

  the_harvest.js — Matthew 9:37
  "The harvest is plentiful but the workers are few."
  ─────────────────────────────────────────────────────────────────
  The Ministry Hub. Events, sermons, service plans, songs, ministry
  teams, and volunteer scheduling consolidated into one rich
  dashboard. The harvest is the work of the church gathered: every
  Sunday planned, every sermon cataloged, every volunteer
  scheduled, every song arranged. This file equips the workers.

  the_scrolls.js — Nehemiah 8:8
  "They read from the Book of the Law of God, making it clear."
  ─────────────────────────────────────────────────────────────────
  The Interaction Ledger. Every meaningful touchpoint—visits, calls,
  prayers, care notes, follow-ups—flows through TheScrolls. Just as
  the scrolls of Nehemiah's day recorded the covenant acts of God's
  people, this module records every act of pastoral care, ensuring
  nothing is forgotten and every member's story is preserved.

  the_shepherd.js — John 10:14
  "I am the good shepherd; I know my sheep and my sheep know me."
  ─────────────────────────────────────────────────────────────────
  The People Engine. Search, filter, and manage every member of the
  flock—profiles with 12 collapsible sections, 3-step save
  (account → member → card), permissions enforcement, and
  approve/deny workflows. The shepherd knows each sheep by name;
  this module ensures the undershepherd can do the same.

  love_in_action.js — 1 John 3:18
  "Let us not love with words or speech but with actions and in
   truth."
  ─────────────────────────────────────────────────────────────────
  The Care Hub. Four tabs—Care, Prayer, Compassion, and Outreach—
  each delegating full-page editing to TheLife's specialized
  editors. Love in action is the practical outworking of pastoral
  concern: tracking care cases, managing prayer chains, coordinating
  compassion resources, and following up on outreach contacts.

  the_fold.js — John 10:16
  "I have other sheep that are not of this sheep pen. I must bring
   them also … and there shall be one flock and one shepherd."
  ─────────────────────────────────────────────────────────────────
  The Groups & Attendance module. Two tabs—Groups and Attendance—
  with searchable tables, summary views, and inline editing that
  delegates to the Tabernacle's modal system. The fold is where
  the scattered are gathered: small groups formed, attendance
  tracked, and every gathering accounted for.

  the_seasons.js — Ecclesiastes 3:1
  "For everything there is a season, and a time for every matter
   under heaven."
  ─────────────────────────────────────────────────────────────────
  The Calendar, Tasks & Check-In Hub. Church life runs on seasons—
  liturgical, academic, agricultural, personal. This module manages
  calendar events, task lists, and attendance check-in with full
  date-range navigation, recurrence support, and visual timeline
  views. Each season has its rhythm; this file keeps the rhythm
  visible and the work organized.

  the_well.js — Genesis 26:18-19
  "Isaac dug again the wells of water that had been dug in the days
   of Abraham his father."
  ─────────────────────────────────────────────────────────────────
  Google Drive sync for offline churches. When a congregation has
  no reliable internet, TheWell draws from a different source—
  .xls/.xlsx files stored in Google Drive, synced locally, and
  served through TheWellspring's IndexedDB layer. Isaac re-dug the
  wells his father had opened; this file re-opens the data source
  for churches that cannot reach the cloud.

  the_trumpet.js — Numbers 10:2
  "Make two silver trumpets … for summoning the congregation."
  ─────────────────────────────────────────────────────────────────
  The notification system. Alerts, announcements, and status
  messages delivered to the congregation through the application.
  The silver trumpets of Numbers were sounded to gather the people
  and to signal movement; this file gathers attention and signals
  what matters now.

  the_truth.js — John 8:32
  "You will know the truth, and the truth will set you free."
  ─────────────────────────────────────────────────────────────────
  Reserved placeholder for a future truth/doctrine module. Currently
  empty, awaiting its calling.

  the_pagans.js — Matthew 5:47
  "And if you greet only your own people, what are you doing more
   than others? Do not even pagans do that?"
  ─────────────────────────────────────────────────────────────────
  Public-facing content helpers. Functions that serve content to
  unauthenticated visitors—those outside the fold—ensuring that even
  those who have not yet entered the gate encounter something of
  value. The name is drawn from Christ's challenge to extend grace
  beyond the familiar circle.


═══════════════════════════════════════════════════════════════════════════════
  4. THE PAGES — PLACES OF ENCOUNTER
═══════════════════════════════════════════════════════════════════════════════

  The HTML pages that users interact with are named for biblical
  scenes and callings:

  the_good_shepherd.html — The admin dashboard. John 10:11 says,
  "I am the good shepherd. The good shepherd lays down his life for
  the sheep." This is the page where the church administrator—the
  undershepherd—oversees every aspect of congregational life.

  the_wall.html — The login page. Nehemiah rebuilt the wall of
  Jerusalem to protect the city from its enemies. This page is the
  wall: no one enters the admin dashboard without proper credentials.

  the_pentecost.html — The deployment guide. Acts 2 records the
  moment when the Holy Spirit descended and the church was born in
  power. This guide is the moment when FlockOS comes alive—deployed,
  configured, and ready to serve.

  fishing-for-men.html — The value proposition document. Luke 5:10
  records Jesus telling Simon Peter, "From now on you will catch
  men." This page makes the case for FlockOS as a tool for ministry,
  casting the vision for what the platform can accomplish.


═══════════════════════════════════════════════════════════════════════════════
  5. THE MODULES — ACTS OF MINISTRY
═══════════════════════════════════════════════════════════════════════════════

  Within the application itself, several modules carry names rooted
  in Scripture and church tradition:

  • Daily Bread — The devotional module. "Give us this day our daily
    bread" (Matthew 6:11). Scripture, reflection, prayer focus, and
    a reading plan delivered fresh each day.

  • The Upper Room — The unified spiritual dashboard. Acts 1:13-14
    describes the disciples gathered in the upper room, praying
    together before Pentecost. This module gathers devotions,
    journaling, prayer, care records, and spiritual pulse into one
    place of encounter.

  • The Shepherd's Mirror — A self-assessment tool for church
    leaders, reflecting the biblical call to examine oneself
    (2 Corinthians 13:5) in the context of pastoral responsibility.

  These are not marketing names. They are ministry names. Each one
  connects the act of clicking a button or filling in a form to the
  larger story of what the church is called to do.


═══════════════════════════════════════════════════════════════════════════════
  6. THE DEEPER PATTERN — WILLINGLY, NOT UNDER COMPULSION
═══════════════════════════════════════════════════════════════════════════════

  Peter wrote his instruction to the elders of the early church at a
  time when leadership was costly. Shepherding was not a career path;
  it was a calling that could lead to persecution, poverty, and
  death. His words—"willingly, not under compulsion"—are a reminder
  that ministry flows from love, not obligation.

  FlockOS exists because that same calling persists. Every church
  needs to track its members, schedule its services, equip its
  worship team, communicate with its volunteers, and care for its
  hurting. The tools that enable those tasks should not feel like
  corporate software grudgingly adapted for church use. They should
  feel like what they are: instruments of ministry.

  When a pastor opens the_good_shepherd.html, the name itself is a
  quiet reminder of who the true Shepherd is and whose example the
  pastor follows. When a worship leader loads the_shofar.js, the
  name connects the act of preparing a chord chart to the ancient
  practice of sounding the trumpet to call God's people together.
  When a volunteer views their tasks in the_tabernacle.js, the name
  connects their service to the careful, loving construction of
  the place where God chose to dwell among His people.

  None of this makes the code run faster. None of it reduces bugs or
  improves performance. What it does is something no linter or
  compiler can measure: it keeps the purpose visible.

  Software for the church should reflect the character of the church.
  A codebase named after profit centers and product features speaks
  the language of commerce. A codebase named after Scripture speaks
  the language of calling. FlockOS chooses the latter—not because it
  is required, but because it is fitting.

  Willingly. Not under compulsion.


═══════════════════════════════════════════════════════════════════════════════
  7. THE COMPLETE THEMATIC MAP
═══════════════════════════════════════════════════════════════════════════════

  For reference, the full thematic inventory:

  FOLDERS
  ───────────────────────────────────────────────────────────────────────────
  1-Matthew ........... Public teaching         (Matthew 28:19-20)
  2-Mark .............. Global missions         (Mark 16:15)
  3-Luke .............. Analytics & records      (Luke 1:3)
  4-John .............. Shepherding the flock    (John 10:3, 10:11)
  Acts .............. Frontend in action       (Acts 1:8)
  Romans ............ Doctrinal foundations    (Romans 1:16-17)
  Revelation ........ Architecture revealed    (Revelation 1:1)

  SCRIPTS (Acts) — 19 files
  ───────────────────────────────────────────────────────────────────────────
  the_true_vine.js .... API hub / connectivity   (John 15:5)
  firm_foundation.js .. Auth guard / gateway     (1 Corinthians 3:11)
  fine_linen.js ....... CSS themes / beauty      (Revelation 19:8)
  the_tabernacle.js ... Module renderers         (Exodus 25:8-9)
  the_life.js ......... My Flock Portal          (John 10:10)
  the_shofar.js ....... Music / worship tools    (Psalm 150:3)
  the_truth.js ........ Reserved placeholder     (John 8:32)
  the_cornerstone.js .. Architecture registry    (Ephesians 2:20)
  the_wellspring.js ... Local data / offline     (John 4:14)
  the_way.js .......... Learning Hub             (John 14:6)
  the_harvest.js ...... Ministry Hub             (Matthew 9:37)
  the_scrolls.js ...... Interaction Ledger       (Nehemiah 8:8)
  the_shepherd.js ..... People Engine            (John 10:14)
  love_in_action.js ... Care Hub                 (1 John 3:18)
  the_fold.js ......... Groups & Attendance      (John 10:16)
  the_seasons.js ...... Calendar & Check-In Hub  (Ecclesiastes 3:1)
  the_well.js ......... Google Drive sync        (Genesis 26:18-19)
  the_trumpet.js ...... Notification system      (Numbers 10:2)
  the_pagans.js ....... Public content helpers   (Matthew 5:47)

  PAGES (Revelation)
  ───────────────────────────────────────────────────────────────────────────
  the_good_shepherd ... Admin dashboard          (John 10:11)
  the_wall ............ Login page               (Nehemiah 2:17)
  the_pentecost ....... Deployment guide         (Acts 2:1-4)
  fishing-for-men ..... Value proposition        (Luke 5:10)

  MODULES (in-app)
  ───────────────────────────────────────────────────────────────────────────
  Daily Bread ......... Devotional               (Matthew 6:11)
  The Upper Room ...... Spiritual dashboard      (Acts 1:13-14)
  The Shepherd's Mirror Leadership self-check    (2 Corinthians 13:5)


═══════════════════════════════════════════════════════════════════════════════
  8. CLOSING WORD
═══════════════════════════════════════════════════════════════════════════════

  "Be shepherds of God's flock that is under your care, watching
   over them—not because you must, but because you are willing, as
   God wants you to be; not pursuing dishonest gain, but eager to
   serve; not lording it over those entrusted to you, but being
   examples to the flock."
                                              — 1 Peter 5:2-3 (NIV)

  FlockOS is software written in that spirit. Every filename is a
  small confession of purpose. Every folder is a chapter in a larger
  story. The thematic approach is not ornamentation—it is
  orientation. It points every line of code, every deployment step,
  and every administrative action back toward the calling that
  started it all: to shepherd the flock of God, willingly, as God
  would have you, eager to serve.


════════════════════════════════════════════════════════════════════════════════
  Document: 9_Thematic_Approach
  Project:  FlockOS Church CRM
  Date:     March 2026 (Updated March 24, 2026)
════════════════════════════════════════════════════════════════════════════════
```

---

# 2. Architecture & Configuration — Complete Module Reference

> *Source: Revelation/2_Config.txt*

```
╔══════════════════════════════════════════════════════════════════════════════╗
║            FlockOS CHURCH CRM — EXPANSION PACK CONFIGURATION INFO            ║
║                         Complete Module Reference                            ║
╚══════════════════════════════════════════════════════════════════════════════╝

Generated: March 24, 2026
Platform:  Google Apps Script + Google Sheets
Auth:      Self-contained (email + passcode, SHA-256 hashed, RBAC)


════════════════════════════════════════════════════════════════════════════════
                            ALL INSTALLED MODULES
════════════════════════════════════════════════════════════════════════════════

 #   Module                   File(s)                  Sheet Tab(s)
 ──  ───────────────────────  ───────────────────────── ───────────────────────

 ─── PASTORAL CORE (7 tabs — created by setup.gs) ────────────────────────
     Core member & pastoral data. API routes in pastoral-server-v2.

 P1  Members (51 col)         setup.gs                  Members
 P2  Prayer Requests          setup.gs                  PrayerRequests
 P3  Contact Log              setup.gs                  ContactLog
 P4  Pastoral Notes           setup.gs                  PastoralNotes
 P5  Milestones               setup.gs                  Milestones
 P6  Households               setup.gs                  Households
 P7  To-Do Tasks              setup.gs                  ToDo

 ─── CONTENT & REFERENCE (8 tabs — created by setup.gs) ──────────────────
     Public content data. Served via MASTER_API tab-based queries.
     Country Mission Dossiers → separate Missions API (not in this sheet).

 C1  Books of the Bible       setup.gs                  Books
 C2  Genealogy / Characters   setup.gs                  Genealogy
 C3  Counseling / Wisdom      setup.gs                  Counseling
 C4  Devotionals              setup.gs                  Devotionals
 C5  Reading Plan             setup.gs                  Reading
 C6  Words / Lexicon          setup.gs                  Words
 C7  Heart Diagnostic         setup.gs                  Heart
 C8  Mirror / Triage          setup.gs                  Mirror

 ─── EXPANSION MODULES (81 tabs) ─────────────────────────────────────────

  1  Authentication & Auth    auth.gs                   AuthUsers
                                                        UserProfiles
                                                        AccessControl
                                                        AuthAudit

  2  Application Config       auth.gs / setup.gs        AppConfig

  3  Audit Logging            auth.gs (writes)          AuditLog

  4  Attendance Tracking      database.gs               Attendance

  5  Events & RSVPs           database.gs               Events
                                                        EventRSVPs

  6  Small Groups             database.gs               SmallGroups
                                                        SmallGroupMembers

  7  Giving / Contributions   database.gs               Giving
                                                        GivingPledges

  8  Volunteer Scheduling     database.gs               VolunteerSchedule

  9  Communications (legacy)   database.gs               Communications

 10  Communications Hub       communications.gs         CommsMessages
                                                        CommsThreads
                                                        CommsNotifications
                                                        CommsNotificationPrefs
                                                        CommsChannels
                                                        CommsTemplates
                                                        CommsReadReceipts
                                                        CommsBroadcastLog

 11  Check-In Sessions        database.gs               CheckInSessions

 12  Ministries (20+ teams)   ministries.gs             Ministries
                                                        MinistryMembers

 13  Service Planning          service-planning.gs      ServicePlans
                                                        ServicePlanItems

 13b Songs & Music Stand        songs.gs                 Songs
                                                        SongArrangements
                                                        SetlistSongs

 14  Spiritual Care            spiritual-care.gs        SpiritualCareCases
                                                        SpiritualCareInteractions
                                                        SpiritualCareAssignments

 15  Outreach & Evangelism     outreach.gs              OutreachContacts
                                                        OutreachCampaigns
                                                        OutreachFollowUps

 16  Photo Storage & Sharing   photos.gs                Photos
                                                        PhotoAlbums

 17  Sermons / Preaching       sermons.gs               Sermons
                                                        SermonSeries
                                                        SermonReviews

 18  Compassion / Benevolence  compassion.gs            CompassionRequests
                                                        CompassionResources
                                                        CompassionTeamLog

 19  Discipleship & Growth     discipleship.gs           DiscipleshipPaths
                                                        DiscipleshipSteps
                                                        DiscipleshipEnrollments
                                                        DiscipleshipMentoring
                                                        DiscipleshipMeetings
                                                        DiscipleshipAssessments
                                                        DiscipleshipResources
                                                        DiscipleshipMilestones
                                                        DiscipleshipGoals
                                                        DiscipleshipCertificates

 20  Learning (Sermon-Based)   learning.gs               LearningTopics
                                                        LearningPlaylists
                                                        LearningPlaylistItems
                                                        LearningProgress
                                                        LearningNotes
                                                        LearningBookmarks
                                                        LearningRecommendations
                                                        LearningQuizzes
                                                        LearningQuizResults
                                                        LearningCertificates

 21  World Missions            world-missions.gs         MissionsRegistry
                                                        MissionsRegions
                                                        MissionsCities
                                                        MissionsPartners
                                                        MissionsPrayerFocus
                                                        MissionsUpdates
                                                        MissionsTeams
                                                        MissionsMetrics

 22  Theology (Statement of   theology.gs               TheologyCategories
     Faith & Doctrine)                                  TheologySections
                                                        TheologyScriptures
                                                        TheologyRevisions

 23  Member Cards (Dynamic    member-cards.gs           MemberCards
     Contact Cards)                                     MemberCardLinks
                                                        MemberCardViews

 24  Statistics (Customizable  statistics.gs             StatisticsConfig
     Analytics & Metrics)                               StatisticsSnapshots
                                                        StatisticsCustomViews

 25  Reports & Analytics       utilities.gs             (reads from other tabs)

 26  Multi-Church Support      4-FlockOS-Expansions.gs  ChurchRegistry

 27  Scheduled Triggers        4-FlockOS-Expansions.gs  (time-driven)

 28  Batch Operations          4-FlockOS-Expansions.gs  (bulk import/export)

 29  Journal / Personal        database.gs               JournalEntries
     Devotions


 ─── Combined Deployment Files (March 25, 2026) ───────────────────────────
  Each API project now ships as a SINGLE combined .gs file.
  Paste as Code.gs in the GAS editor — one file per project.

  •  Database/Matthew_Combined.gs  — APP API (332 lines)
  •  Database/Mark_Combined.gs      — MISSIONS API (803 lines)
  •  Database/Luke_Combined.gs      — EXTRA API (528 lines)
  •  Database/John_Combined.gs      — FLOCK API (23,899 lines)

  All combined files live alongside the schema and project notes in
  the Database/ folder.

  John_Combined.gs includes (in order): John.gs, Hash.gs, Auth.gs,
  Database.gs, Api.gs, Setup.gs, Utilities.gs, Cards.gs, Care.gs,
  Communications.gs, Compassion.gs, Create_First_Admin.gs,
  Discipleship.gs, Expansions.gs, Learning.gs, Ministries.gs,
  Missions.gs, Outreach.gs, Photos.gs, ResetUserData.gs, Sermons.gs,
  Services.gs, Songs.gs, Sql.gs, Statistics.gs, Theology.gs, Todo.gs


════════════════════════════════════════════════════════════════════════════════
 TOTAL GOOGLE SHEET TABS CREATED BY setupExpansion()  —  96 tabs
════════════════════════════════════════════════════════════════════════════════

 ─── Pastoral Core (7 tabs) ────────────────────────────────────────────────
  Members                  (51 columns)
  PrayerRequests           (17 columns)
  ContactLog               (12 columns)
  PastoralNotes             (7 columns)
  Milestones                (7 columns)
  Households               (11 columns)
  ToDo                     (15 columns)

 ─── Content & Reference (8 tabs) ─────────────────────────────────────────
  Books                     (7 columns)
  Genealogy                 (8 columns)
  Counseling                (7 columns)
  Devotionals               (7 columns)
  Reading                   (4 columns)
  Words                     (6 columns)
  Heart                     (6 columns)
  Mirror                    (9 columns)

 ─── Expansion Modules (80 tabs) ──────────────────────────────────────────
  1.  Attendance                (9 columns)
  2.  Events                   (21 columns)
  3.  EventRSVPs                (8 columns)
  4.  SmallGroups              (16 columns)
  5.  SmallGroupMembers         (9 columns)
  6.  Giving                   (15 columns)
  7.  GivingPledges            (14 columns)
  8.  VolunteerSchedule        (13 columns)
  9.  Communications           (13 columns)
 10.  CheckInSessions          (10 columns)
 11.  Ministries               (17 columns)
 12.  MinistryMembers          (10 columns)
 13.  ServicePlans             (14 columns)
 14.  ServicePlanItems         (10 columns)
 15.  SpiritualCareCases       (19 columns)
 16.  SpiritualCareInteractions(12 columns)
 17.  SpiritualCareAssignments (11 columns)
 18.  OutreachContacts         (22 columns)
 19.  OutreachCampaigns        (19 columns)
 20.  OutreachFollowUps        (12 columns)
 21.  Photos                   (15 columns)
 22.  PhotoAlbums              (12 columns)
 23.  Sermons                  (22 columns)
 24.  SermonSeries             (12 columns)
 25.  SermonReviews             (9 columns)
 26.  CompassionRequests       (21 columns)
 27.  CompassionResources      (12 columns)
 28.  CompassionTeamLog        (12 columns)
 29.  DiscipleshipPaths        (18 columns)
 30.  DiscipleshipSteps        (18 columns)
 31.  DiscipleshipEnrollments  (22 columns)
 32.  DiscipleshipMentoring    (18 columns)
 33.  DiscipleshipMeetings     (16 columns)
 34.  DiscipleshipAssessments  (22 columns)
 35.  DiscipleshipResources    (16 columns)
 36.  DiscipleshipMilestones   (16 columns)
 37.  DiscipleshipGoals        (20 columns)
 38.  DiscipleshipCertificates (14 columns)
 39.  LearningTopics           (16 columns)
 40.  LearningPlaylists        (22 columns)
 41.  LearningPlaylistItems    (16 columns)
 42.  LearningProgress         (20 columns)
 43.  LearningNotes            (16 columns)
 44.  LearningBookmarks        (14 columns)
 45.  LearningRecommendations  (18 columns)
 46.  LearningQuizzes          (18 columns)
 47.  LearningQuizResults      (18 columns)
 48.  LearningCertificates     (16 columns)
 49.  MissionsRegistry         (28 columns)
 50.  MissionsRegions          (24 columns)
 51.  MissionsCities           (30 columns)
 52.  MissionsPartners         (20 columns)
 53.  MissionsPrayerFocus      (16 columns)
 54.  MissionsUpdates          (16 columns)
 55.  MissionsTeams            (20 columns)
 56.  MissionsMetrics          (20 columns)
 57.  TheologyCategories       (12 columns)
 58.  TheologySections         (16 columns)
 59.  TheologyScriptures       (12 columns)
 60.  TheologyRevisions        (10 columns)
 61.  MemberCards              (30 columns)
 62.  MemberCardLinks          (12 columns)
 63.  MemberCardViews           (8 columns)
 64.  StatisticsConfig         (18 columns)
 65.  StatisticsSnapshots      (58 columns)
 66.  StatisticsCustomViews    (14 columns)
 67.  CommsMessages            (22 columns)
 68.  CommsThreads             (18 columns)
 69.  CommsNotifications       (20 columns)
 70.  CommsNotificationPrefs   (16 columns)
 71.  CommsChannels            (18 columns)
 72.  CommsTemplates           (16 columns)
 73.  CommsReadReceipts        (10 columns)
 74.  CommsBroadcastLog        (18 columns)
 75.  AuthUsers                (10 columns)
 76.  UserProfiles             (10 columns)
 77.  AccessControl             (8 columns)
 78.  AuthAudit                 (4 columns)
 79.  AuditLog                  (7 columns)
 80.  AppConfig                 (6 columns)
 81.  JournalEntries           (10 columns)


════════════════════════════════════════════════════════════════════════════════
 ROLE HIERARCHY (RBAC)
════════════════════════════════════════════════════════════════════════════════

  Level  Role        Capabilities
  ─────  ──────────  ──────────────────────────────────────────────────────
    0    readonly    View member names

    1    volunteer   View directory, log outreach follow-ups,
                     view events, view attendance

    2    care        Spiritual Care Team — assigned ~12 members to
                     shepherd. Can create/update/resolve care cases,
                     view care dashboard, manage prayer requests,
                     log interactions, see assignments list.
                     "My Flock" personal dashboard.

    3    leader      Create/edit events, attendance, groups, outreach
                     campaigns, volunteer schedules, service plans,
                     convert outreach contacts to members,
                     create/end/reassign care assignments,
                     view reports & config, view spiritual care (non-conf)

    4    pastor      All leader permissions PLUS confidential spiritual
                     care cases, pastoral notes, full member details

    5    admin       Everything — user management, access control,
                     AppConfig, audit logs, giving records, data
                     export, multi-church management, bulk imports


════════════════════════════════════════════════════════════════════════════════
 DEPLOYMENT INSTRUCTIONS
════════════════════════════════════════════════════════════════════════════════

  STEP 1: Create a Google Apps Script project
  ─────────────────────────────────────────────
  1.  Go to https://script.google.com
  2.  Create a new project (or open your existing pastoral-server-v2 project)
  3.  Create a new Google Sheet (this will be your CRM database)
  4.  Copy the Sheet ID from the URL:
        https://docs.google.com/spreadsheets/d/XXXXXXXXX/edit
                                               ^^^^^^^^^
                                               This is your SHEET_ID

  STEP 2: Add the combined .gs file to the project
  ─────────────────────────────────────────────────
  As of March 25, 2026, each API project uses a SINGLE combined .gs file.
  Open the GAS Script Editor → paste the contents of the combined file
  into Code.gs (replace the default contents).

  ┌─────────────────────────────────────────────────────────────────────┐
  │  API Project    │  Combined File              │  Lines   │  Size   │
  │─────────────────│─────────────────────────────│──────────│─────────│
  │  Matthew (APP)  │  Database/Matthew_Combined.gs   │    332   │  20K    │
  │  Mark (MISSIONS)│  Database/Mark_Combined.gs      │    803   │  40K    │
  │  Luke (EXTRA)   │  Database/Luke_Combined.gs      │    528   │  28K    │
  │  John (FLOCK)   │  Database/John_Combined.gs      │ 23,899   │  1.0M   │
  └─────────────────────────────────────────────────────────────────────┘

  Each combined file includes section banners (// ═══ Auth.gs ═══) so
  you can Ctrl+F to locate specific modules within the file.

  The doGet/doPost entry points are already included — no wrapper needed.

  STEP 3: Set Script Properties
  ─────────────────────────────
  Go to Project Settings > Script Properties and add:

    Key                     Value
    ─────────────────────── ──────────────────────────────────────
    SHEET_ID                [your Google Sheet ID from Step 1]

  STEP 4: Run setup
  ─────────────────
  1.  Open the Script Editor
  2.  Select the function: setupExpansion
  3.  Click Run (▶)
  4.  Authorize when prompted
  5.  Check your Google Sheet — all 87 tabs should now exist with
      headers and dropdown validations pre-configured

  STEP 5: Create the first admin user
  ────────────────────────────────────
  In your Google Sheet, manually add one row to these tabs:

  AuthUsers tab:
    Email             | Passcode | Passcode Hash | Salt | First Name | Last Name | Role  | Status
    you@example.com   |          | [SHA-256 hash] |      | Your       | Name      | admin | active

  To generate the SHA-256 hash of your passcode, you can run this in the
  Apps Script editor:

      function hashMyPasscode() {
        Logger.log(sha256Hex_('your-passcode-here'));
      }

  OR — just put the passcode in the "Passcode" column in plain text:
    you@example.com   | mypasscode123 |  |  | Your | Name | admin | active

  AccessControl tab:
    Email             | Role  | Display Name | Groups | Active | Notes
    you@example.com   | admin | Your Name    |        | TRUE   | Initial admin

  STEP 6: Deploy as Web App
  ─────────────────────────
  1.  Deploy > New deployment
  2.  Select type: Web app
  3.  Execute as: Me
  4.  Who has access: Anyone
  5.  Click Deploy
  6.  Copy the deployment URL — this is your API endpoint

  STEP 7: Test
  ─────────────
  Open a browser and visit:
    [YOUR_DEPLOYMENT_URL]?action=health

  You should see:
    {"ok":true,"message":"ATOG Church CRM Expansion is running.","version":"1.0.0","modules":{...}}

  To log in:
    [YOUR_DEPLOYMENT_URL]?action=auth.login&email=you@example.com&passcode=mypasscode123


════════════════════════════════════════════════════════════════════════════════
 MODULE CONFIGURATION (via AppConfig tab)
════════════════════════════════════════════════════════════════════════════════

  The AppConfig tab is automatically seeded with default settings when you
  run setupExpansion(). Admin users can change these via the API or directly
  in the Google Sheet.

  ─── General Settings ─────────────────────────────────────────────────────

  Key                  Default          Description
  ──────────────────── ──────────────── ─────────────────────────────────────
  CHURCH_NAME          (blank)          Your church name — displayed in
                                        reports and notifications
  CHURCH_TIMEZONE      America/New_York IANA timezone for date formatting
  ITEMS_PER_PAGE       50               Default list query page size
  DATE_FORMAT          YYYY-MM-DD       Display date format preference

  ─── Auth Settings ────────────────────────────────────────────────────────

  Key                  Default          Description
  ──────────────────── ──────────────── ─────────────────────────────────────
  SESSION_TTL_HOURS    6                Login session lifespan (hours)
  MIN_PASSCODE_LENGTH  6                Minimum passcode character count
  ALLOW_SELF_REGISTER  FALSE            Allow new users to self-register
                                        (set to TRUE to enable)
  ALLOW_CUSTOM_THEMES  TRUE             Allow members to personalize themes
                                        via the Themes module. When FALSE,
                                        Themes module shows locked message
                                        and Interface Studio is disabled.

  ─── Module Toggles ───────────────────────────────────────────────────────

  Set any of these to FALSE to disable the module.
  Disabled modules will still have their tabs but API actions will be gated.

  Key                         Default   Module Controlled
  ─────────────────────────── ──────── ──────────────────────────────────
  MODULE_ATTENDANCE            TRUE     Attendance tracking
  MODULE_EVENTS                TRUE     Events & RSVPs
  MODULE_SMALL_GROUPS          TRUE     Small Groups
  MODULE_GIVING                TRUE     Giving / Contributions
  MODULE_VOLUNTEERS            TRUE     Volunteer Scheduling
  MODULE_COMMUNICATIONS        TRUE     Communications log & sending (legacy)
  MODULE_COMMS_HUB             TRUE     Communications Hub (messaging, notifs, channels)
  MODULE_CHECKIN               TRUE     Check-In Sessions
  MODULE_MINISTRIES            TRUE     Ministry team tracking (20+ teams)
  MODULE_SERVICE_PLANS         TRUE     Weekly service order builder
  MODULE_SONGS                 TRUE     Songs catalog & Music Stand
  MODULE_SPIRITUAL_CARE        TRUE     Shepherding & pastoral care cases
  MODULE_OUTREACH              TRUE     Outreach, evangelism, visitor tracking
  MODULE_PHOTOS                TRUE     Photo storage, albums, sharing
  MODULE_SERMONS               TRUE     Sermons / preaching module
  MODULE_COMPASSION            TRUE     Compassion / benevolence teams
  MODULE_DISCIPLESHIP          TRUE     Discipleship & spiritual growth
  MODULE_LEARNING              TRUE     Learning (sermon-based education)
  MODULE_WORLD_MISSIONS        TRUE     World Missions (persecution data & 10/40 Window)
  MODULE_THEOLOGY              TRUE     Theology (statement of faith & doctrine)
  MODULE_MEMBER_CARDS          TRUE     Member Cards (dynamic contact cards)
  MODULE_STATISTICS            TRUE     Statistics (customizable analytics)
  MODULE_JOURNAL               TRUE     Journal / personal devotions

  Note: Country Mission Dossier tabs are managed by a SEPARATE Missions
  API deployment (not created by this sheet's setupExpansion).

  ─── Photo Settings ───────────────────────────────────────────────────────

  Key                      Default   Description
  ──────────────────────── ──────── ─────────────────────────────────────
  PHOTO_DRIVE_FOLDER_ID    (blank)  Google Drive folder ID for photo
                                    storage. If blank, a folder called
                                    "Church CRM Photos" is auto-created
                                    on first upload.
  PHOTO_MAX_SIZE_MB        10       Maximum upload size per photo (MB).
                                    Hard cap: 25 MB.

  ─── Sermon Settings ──────────────────────────────────────────────────────

  Key                      Default   Description
  ──────────────────────── ──────── ─────────────────────────────────────
  SERMON_DRIVE_FOLDER_ID   (blank)  Google Drive folder ID for sermon
                                    file storage. If blank, a folder
                                    called "Church CRM Sermons" is
                                    auto-created on first upload.
  SERMON_MAX_SIZE_MB       50       Maximum upload size per sermon file
                                    (MB). Hard cap: 100 MB.

  ─── Notification Settings ────────────────────────────────────────────────

  Key                      Default   Description
  ──────────────────────── ──────── ─────────────────────────────────────
  NOTIFY_NEW_MEMBER        TRUE     Email admin when new member is added
  NOTIFY_PRAYER_REQUEST    TRUE     Email admin on new prayer request
  ADMIN_EMAIL              (blank)  Email address for system notifications


════════════════════════════════════════════════════════════════════════════════
 MODULE DETAILS & API ACTIONS
════════════════════════════════════════════════════════════════════════════════

  All API calls use the pattern:
    [DEPLOYMENT_URL]?action=ACTION_NAME&token=TOKEN&param1=value1&param2=value2

  ─── 1. AUTHENTICATION (auth.gs) ──────────────────────────────────────────

  Action                     Role Required   Description
  ────────────────────────── ──────────────  ──────────────────────────────
  auth.login                 (none)          Log in with email + passcode
  auth.profile               any             Get current user profile
  auth.refresh               any             Extend session expiry
  auth.logout                any             End session
  auth.changePasscode        any             Change own passcode

  Parameters for auth.login:
    email        — user's email address
    passcode     — user's passcode

  ─── 2. USER MANAGEMENT (auth.gs) ─────────────────────────────────────────

  Action                     Role Required   Description
  ────────────────────────── ──────────────  ──────────────────────────────
  users.list                 admin           List all users
  users.create               admin           Create new user account
  users.update               admin           Update user details/role
  users.deactivate           admin           Deactivate user account
  users.resetPasscode        admin           Reset a user's passcode
  access.list                admin           List access control entries
  access.set                 admin           Set/update user role
  access.remove              admin           Deactivate user access

  ─── 3. APP CONFIG (auth.gs) ──────────────────────────────────────────────

  Action                     Role Required   Description
  ────────────────────────── ──────────────  ──────────────────────────────
  config.list                leader          List all config settings
  config.get                 leader          Get a single config value
  config.set                 admin           Create or update a setting

  ─── 4. ATTENDANCE (database.gs) ──────────────────────────────────────────

  Action                     Role Required   Description
  ────────────────────────── ──────────────  ──────────────────────────────
  attendance.list            leader          List attendance records
  attendance.create          leader          Record single attendance
  attendance.bulkCreate      leader          Record multiple member check-ins
  attendance.summary         leader          Aggregated counts by date/type

  Filter params: memberId, dateFrom, dateTo, serviceType
  Service types: Sunday AM, Sunday PM, Wednesday, Special, Small Group, Other

  ─── 5. EVENTS & RSVPs (database.gs) ─────────────────────────────────────

  Action                     Role Required   Description
  ────────────────────────── ──────────────  ──────────────────────────────
  events.list                readonly        List events
  events.get                 readonly        Get single event
  events.create              leader          Create event
  events.update              leader          Update event
  events.cancel              leader          Cancel event
  events.rsvp                volunteer       Submit RSVP
  events.rsvpList            leader          List RSVPs for an event

  Event types: Service, Bible Study, Fellowship, Outreach, Meeting,
               Conference, Other
  Recurring: None, Weekly, Biweekly, Monthly, Yearly

  ─── 6. SMALL GROUPS (database.gs) ───────────────────────────────────────

  Action                     Role Required   Description
  ────────────────────────── ──────────────  ──────────────────────────────
  groups.list                readonly        List groups
  groups.get                 readonly        Get group details
  groups.create              leader          Create group
  groups.update              leader          Update group
  groups.addMember           leader          Add member to group
  groups.removeMember        leader          Remove member from group
  groups.members             leader          List members in a group

  Group types: Bible Study, Prayer, Fellowship, Youth, Women, Men,
               Couples, Other

  ─── 7. GIVING / CONTRIBUTIONS (database.gs) ─────────────────────────────

  Action                     Role Required   Description
  ────────────────────────── ──────────────  ──────────────────────────────
  giving.list                admin           List giving records
  giving.create              admin           Record a contribution
  giving.update              admin           Update a record
  giving.summary             admin           Aggregated giving by fund/period
  giving.memberStatement     admin           Individual giving statement
  giving.pledges.list        admin           List pledges
  giving.pledges.create      admin           Create a pledge

  Funds: General, Missions, Building, Benevolence, Youth, Special, Other
  Methods: Cash, Check, Online, Zelle, Venmo, Card, Other

  ─── 8. VOLUNTEER SCHEDULING (database.gs) ───────────────────────────────

  Action                     Role Required   Description
  ────────────────────────── ──────────────  ──────────────────────────────
  volunteers.list            leader          List schedule
  volunteers.schedule        leader          List upcoming schedule
  volunteers.create          leader          Schedule a volunteer
  volunteers.update          leader          Update schedule entry
  volunteers.swap            leader          Initiate a schedule swap

  Ministry teams: Worship, Greeting, Sound, Children, Youth, Outreach, Other

  ─── 9. COMMUNICATIONS — Legacy (database.gs) ────────────────────────────

  Action                     Role Required   Description
  ────────────────────────── ──────────────  ──────────────────────────────
  comms.list                 leader          List communications
  comms.create               leader          Draft a communication
  comms.send                 leader          Send a communication

  Types: Email, SMS, Push, Announcement
  Audiences: All, Active Members, Small Group, Ministry Team, Custom

  ─── 10. COMMUNICATIONS HUB (communications.gs) ──────────────────────────

  ┌─ Messages ─────────────────────────────────────────────────────────────┐
  Action                              Role Required   Description
  ──────────────────────────────────  ──────────────  ────────────────────
  comms.messages.list                 readonly        List messages (filtered)
  comms.messages.get                  readonly        Get single message
  comms.messages.send                 readonly        Send message (auto-thread)
  comms.messages.update               readonly        Edit own message
  comms.messages.delete               readonly        Soft-delete own message
  comms.messages.inbox                readonly        Inbox: messages for me
  comms.messages.sent                 readonly        My sent messages

  ┌─ Threads ──────────────────────────────────────────────────────────────┐
  comms.threads.list                  readonly        List my threads
  comms.threads.get                   readonly        Thread + messages
  comms.threads.create                readonly        Create conversation
  comms.threads.update                readonly        Update thread metadata
  comms.threads.archive               readonly        Archive thread
  comms.threads.mute                  readonly        Mute a thread
  comms.threads.unmute                readonly        Unmute a thread
  comms.threads.addParticipant        volunteer       Add person to thread

  ┌─ Notifications ────────────────────────────────────────────────────────┐
  comms.notifications.list            readonly        My notifications
  comms.notifications.unreadCount     readonly        Number of unread
  comms.notifications.markRead        readonly        Mark read (single/all)
  comms.notifications.dismiss         readonly        Dismiss notification
  comms.notifications.create          leader          Create notification
  comms.notifications.broadcast       leader          Notify all members

  ┌─ Notification Preferences ─────────────────────────────────────────────┐
  comms.notifPrefs.get                readonly        My notification prefs
  comms.notifPrefs.update             readonly        Update my prefs

  ┌─ Channels ─────────────────────────────────────────────────────────────┐
  comms.channels.list                 readonly        List channels
  comms.channels.get                  readonly        Channel + threads
  comms.channels.create               leader          Create channel
  comms.channels.update               leader          Update channel
  comms.channels.delete               pastor          Delete channel
  comms.channels.post                 volunteer       Post to channel

  ┌─ Templates ────────────────────────────────────────────────────────────┐
  comms.templates.list                volunteer       List templates
  comms.templates.get                 volunteer       Get template
  comms.templates.create              leader          Create template
  comms.templates.update              leader          Update template
  comms.templates.delete              pastor          Delete template
  comms.templates.use                 volunteer       Send using template

  ┌─ Read Receipts ────────────────────────────────────────────────────────┐
  comms.readReceipts.create           readonly        Record read receipt
  comms.readReceipts.forMessage       volunteer       Receipts for a message

  ┌─ Broadcast Log ────────────────────────────────────────────────────────┐
  comms.broadcast.list                leader          List broadcasts
  comms.broadcast.create              leader          Draft broadcast
  comms.broadcast.send                pastor          Send broadcast email

  ┌─ Dashboard ────────────────────────────────────────────────────────────┐
  comms.dashboard                     readonly        Comms stats overview

  ┌─ User Preferences (theme sync) ────────────────────────────────────────┐
  user.preferences.get                readonly        Get theme + settings
  user.preferences.update             readonly        Save theme + settings

  ┌─ Auth (profile update — auth.gs) ──────────────────────────────────────┐
  auth.profileUpdate                  readonly        Update display name,
                                                      photo, theme, language,
                                                      timezone, notifications

  Channel Types: Announcement, Discussion, Prayer Chain, Ministry, Staff, Custom
  Visibility: Public, Leaders Only, Members Only
  Post Permission: Anyone, Leaders, Pastors, Admins
  Template Variables: Use {{name}}, {{date}}, etc. in template body
  Theme Sync: Theme preference stored in UserProfiles and returned on login.
              Frontend calls user.preferences.update to persist theme changes.
              On app load, call user.preferences.get to apply saved theme.

  ─── 11. CHECK-IN SESSIONS (database.gs) ─────────────────────────────────

  Action                     Role Required   Description
  ────────────────────────── ──────────────  ──────────────────────────────
  checkin.open               leader          Open a check-in session
  checkin.close              leader          Close a check-in session
  checkin.record             volunteer       Record a single check-in
  checkin.sessions           leader          List sessions

  ─── 12. MINISTRIES (ministries.gs) ──────────────────────────────────────

  Action                     Role Required   Description
  ────────────────────────── ──────────────  ──────────────────────────────
  ministries.list            readonly        List all ministries
  ministries.get             readonly        Get single ministry + members
  ministries.create          leader          Create new ministry
  ministries.update          leader          Update ministry details
  ministries.tree            readonly        Hierarchical ministry tree
  ministries.summary         leader          Member counts per ministry
  ministryMembers.list       volunteer       List members in a ministry
  ministryMembers.forMember  volunteer       All ministries a person
                                             belongs to
  ministryMembers.add        leader          Add person to a ministry
  ministryMembers.update     leader          Update membership details
  ministryMembers.remove     leader          Remove from ministry

  Ministry categories: Pastoral, Worship, Children & Youth, Life Stage,
                       Outreach, Missions, Education, Operations,
                       Community, Prayer, Counseling, Recovery, Other
  Member roles: Member, Team Lead, Coordinator, Trainer, Volunteer,
                Intern, Advisor
  Supports sub-ministries via the ReportingTo field (parent ministry ID).

  ─── 13. SERVICE PLANNING (service-planning.gs) ──────────────────────────

  Action                     Role Required   Description
  ────────────────────────── ──────────────  ──────────────────────────────
  servicePlans.list          volunteer       List service plans
  servicePlans.get           volunteer       Get plan + all items
  servicePlans.create        leader          Create new plan
  servicePlans.update        leader          Update plan
  servicePlans.duplicate     leader          Clone plan + items to new date
  serviceItems.list          volunteer       List items for a plan
  serviceItems.create        leader          Add item to plan
  serviceItems.update        leader          Update item
  serviceItems.delete        leader          Remove item
  serviceItems.reorder       leader          Reorder items (JSON array)

  Service types: Sunday AM, Sunday PM, Wednesday, Special, Good Friday,
                 Easter, Christmas, Other
  Item types: Song, Scripture Reading, Prayer, Sermon, Offering,
              Announcement, Special Music, Video, Communion,
              Benediction, Transition, Other

  Special feature: servicePlans.duplicate clones an entire service order
  (plan + all items) to a new date for quick weekly setup.

  ─── 13b. SONGS & MUSIC STAND (songs.gs) ─────────────────────────────────

  Action                     Role Required   Description
  ────────────────────────── ──────────────  ──────────────────────────────
  songs.list                 volunteer       List / search songs (filter by genre, tag, query)
  songs.get                  volunteer       Get song + all arrangements
  songs.create               leader          Add song to master catalog
  songs.update               leader          Update song metadata / lyrics
  songs.delete               pastor          Remove song from catalog
  arrangements.list          volunteer       List arrangements for a song
  arrangements.get           volunteer       Get arrangement (chords, key, capo)
  arrangements.create        leader          Add arrangement (key-specific chart)
  arrangements.update        leader          Update arrangement
  arrangements.delete        pastor          Remove arrangement
  setlistSongs.list          volunteer       List linked songs for a service plan
  setlistSongs.add           leader          Link song + arrangement to plan item
  setlistSongs.update        leader          Change arrangement or key override
  setlistSongs.remove        leader          Unlink song from plan item
  musicStand.get             volunteer       Full setlist with chords/lyrics/key/tempo

  Tabs: Songs (18 cols), SongArrangements (14 cols), SetlistSongs (10 cols)

  Song genres: Hymn, Contemporary, Gospel, Chorus, Christmas, Easter, Other
  Musical keys: C, C#, Db, D … through Bm (all major + minor)
  Instruments: Guitar, Piano, Bass, Drums, Vocals, Other
  Time signatures: 4/4, 3/4, 6/8, 2/4, 12/8, 2/2, Other

  Chord storage: Two formats supported per arrangement:
    • Chord Chart (col F) — simple chord sequence: "C  G  Am  F"
    • Lyrics With Chords (col G) — ChordPro-style: "[C]Amazing [G]grace"

  Music Stand: musicStand.get returns the full service plan with every
  song item enriched with its linked arrangement, chord chart, lyrics,
  key & tempo — ready for display on tablets/phones for the worship band.

  ─── 13c. MUSIC STAND FRONTEND (FlockOS-Scripts/the_shofar.js) ───────────

  Location: backend/FlockOS/FlockOS-Scripts/the_shofar.js (~1,591 lines)
  Entry:    window.openMusicStandApp()
  CSS:      ms- prefix, injected <style id="ms-styles">
  Endpoint: PASTORAL_DB_V2_ENDPOINT (FLOCK API)
  Auth:     atogen_secure_vault_v1 (token + email)

  Song Library tab:
    Song list (searchable by title/artist, filterable)
    Song CRUD: title, artist, CCLI#, defaultKey, tempoBpm, timeSignature,
               durationMin, genre, tags, lyrics, notes
    Song detail view: metadata badges + lyrics panel + arrangements list
    Arrangement CRUD: name, key, capo, instrument, vocalRange,
                      lyricsWithChords (ChordPro), chordChart, notes
    Arrangement viewer: modal with rendered ChordPro notation
    PDF export: single arrangement → jsPDF (title, meta, chord lines)

  Music Stand tab:
    Plan loader: enter planId → musicStand.get → enriched setlist
    Card display: song title, artist, key/BPM/timeSig/capo/instrument badges
    Chord view: ChordPro rendered (chords above lyrics, section headers)
    Navigation: prev/next buttons + arrow key support
    Full setlist sidebar: all items with current-song highlight
    PDF export: entire setlist → multi-page jsPDF with page numbers

  ChordPro format:
    [G]Amazing [C]grace → chord line "G       C" above lyric "Amazing grace"
    {comment: Bridge} → italic section header
    {title: Song Name} → bold header

  jsPDF: lazy-loaded from CDN (cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2)

  ─── 14. SPIRITUAL CARE (spiritual-care.gs) ──────────────────────────────

  Action                     Role Required   Description
  ────────────────────────── ──────────────  ──────────────────────────────
  care.list                  volunteer       List care cases
  care.get                   volunteer       Get case + interactions
  care.create                leader          Open new care case
  care.update                leader          Update case details
  care.resolve               leader          Mark case resolved
  care.interactions.list     volunteer       List interactions for a case
  care.interactions.create   volunteer       Log a care interaction
  care.interactions.followUpDone  volunteer  Mark follow-up complete
  care.followUps.due         volunteer       All overdue follow-ups
  care.assignments.list      volunteer       List care assignments
  care.assignments.forMember volunteer       Who is shepherding a person
  care.assignments.myFlock   volunteer       Members assigned to you
  care.assignments.create    leader          Create assignment
  care.assignments.end       leader          End assignment
  care.assignments.reassign  leader          Reassign to new caregiver
  care.dashboard             leader          Summary dashboard

  Care types: Shepherding, Crisis, Grief, Marriage, Addiction,
              Hospital Visit, New Believer, Restoration, Counseling,
              Discipleship, Family, Financial, Other
  Assignment roles: Shepherd, Prayer Partner, Mentor,
                    Accountability Partner, Deacon, Elder, Lay Counselor
  Priority levels: Low, Normal, High, Urgent
  Confidentiality: Cases flagged confidential are only visible to
                   users with pastor role or higher.

  ─── 15. OUTREACH & EVANGELISM (outreach.gs) ─────────────────────────────

  Action                         Role Required   Description
  ────────────────────────────── ──────────────  ─────────────────────────
  outreach.contacts.list         volunteer       List outreach contacts
  outreach.contacts.get          volunteer       Get contact + follow-ups
  outreach.contacts.create       volunteer       Add new community contact
  outreach.contacts.update       volunteer       Update contact info
  outreach.contacts.convert      leader          Convert contact → member
  outreach.campaigns.list        volunteer       List campaigns
  outreach.campaigns.get         volunteer       Get campaign details
  outreach.campaigns.create      leader          Create campaign
  outreach.campaigns.update      leader          Update campaign
  outreach.followUps.list        volunteer       Follow-ups for a contact
  outreach.followUps.create      volunteer       Log a follow-up interaction
  outreach.followUps.done        volunteer       Mark follow-up completed
  outreach.followUps.due         volunteer       All overdue follow-ups
  outreach.dashboard             leader          Outreach summary dashboard

  Contact sources: Walk-In, Door-to-Door, Event, Referral, Online,
                   Social Media, Flyer, Community Service, Other
  Contact statuses: New → Contacted → Engaged → Visiting →
                    Regular Visitor → Converted | Inactive | Declined
  Campaign types: Door-to-Door, Community Event, Service Project,
                  Media Campaign, Mission Trip, Revival, VBS,
                  Sports Camp, Food Drive, Health Fair, Concert, Other
  Follow-up types: Phone, Text, Email, Visit, Event Invite, Meal,
                   Door-Knock, Other

  The "Convert" action links an outreach contact to a newly created
  member record, tracking the full evangelism pipeline.

  ─── 16. PHOTO STORAGE & SHARING (photos.gs) ─────────────────────────────

  Action                     Role Required   Description
  ────────────────────────── ──────────────  ──────────────────────────────
  photos.upload              volunteer       Upload a photo (base64 POST)
  photos.bulkUpload          volunteer       Upload multiple photos at once
  photos.list                readonly        List photos (with filters)
  photos.get                 readonly        Get single photo metadata
  photos.update              leader          Update caption/tags/visibility
  photos.delete              leader          Delete photo + Drive file
  photos.forEntity           readonly        All photos for an entity
  photos.dashboard           leader          Photo storage summary
  albums.list                readonly        List albums
  albums.get                 readonly        Get album + its photos
  albums.create              volunteer       Create new album
  albums.update              leader          Update album details
  albums.delete              pastor          Delete album (+ optionally
                                             all photos in it)

  Upload parameters (POST body):
    base64Data   — base64-encoded image content (required)
    mimeType     — e.g. image/jpeg, image/png (required)
    filename     — original filename
    caption      — description / caption text
    entityType   — Member / Ministry / Event / Campaign / Group / General
    entityId     — FK to associated entity
    albumId      — FK to PhotoAlbums.ID
    visibility   — Public / Members Only / Leaders Only
    tags         — comma-separated tags

  Supported formats: JPEG, PNG, GIF, WebP, BMP, SVG, HEIC
  Visibility: Public (anyone), Members Only (volunteer+), Leaders Only (leader+)
  Storage: Google Drive (shared via anyone-with-link view access)
  Auto-features: Thumbnails generated via Drive thumbnail API,
                 album photo counts auto-maintained,
                 Drive folder auto-created if not configured

  ─── 17. SERMONS / PREACHING (sermons.gs) ────────────────────────────────

  Action                     Role Required   Description
  ────────────────────────── ──────────────  ──────────────────────────────
  sermons.list               volunteer       List sermons (with filters)
  sermons.get                volunteer       Get sermon + reviews
  sermons.create             leader          Create sermon metadata
  sermons.upload             leader          Upload manuscript (base64 POST)
  sermons.update             leader          Update sermon details
  sermons.submit             leader          Submit for review (Draft →
                                             Under Review)
  sermons.approve            pastor          Approve sermon
  sermons.deliver            leader          Mark as delivered
  sermons.delete             pastor          Delete sermon + Drive files
  sermons.dashboard          leader          Sermon analytics summary
  sermonSeries.list          volunteer       List sermon series
  sermonSeries.get           volunteer       Get series + sermons
  sermonSeries.create        leader          Create a series
  sermonSeries.update        leader          Update series details
  sermonReviews.create       pastor          Submit a review / feedback
  sermonReviews.list         volunteer       List reviews for a sermon

  Status workflow: Draft → Under Review → Approved / Revision Requested
                   → Delivered
  Supported file types: PDF, DOCX, PPTX, TXT, RTF
  Audio formats: MP3, M4A, WAV, OGG
  Video formats: MP4, WebM, MOV
  Max file size: 50 MB default (configurable, hard cap 100 MB)
  Storage: Google Drive (auto-creates "Church CRM Sermons" folder)
  Visibility: Public / Members Only / Leaders Only

  ─── 18. COMPASSION / BENEVOLENCE (compassion.gs) ────────────────────────

  Action                         Role Required   Description
  ────────────────────────────── ──────────────  ─────────────────────────
  compassion.requests.list       volunteer       List benevolence requests
  compassion.requests.get        volunteer       Get request details
  compassion.requests.create     volunteer       Submit new request
  compassion.requests.update     leader          Update request details
  compassion.requests.approve    pastor          Approve request
  compassion.requests.deny       pastor          Deny request
  compassion.requests.resolve    leader          Mark request resolved
  compassion.followUps.due       volunteer       Overdue follow-ups
  compassion.resources.list      volunteer       List resource inventory
  compassion.resources.create    leader          Add resource item
  compassion.resources.update    leader          Update resource item
  compassion.resources.low       leader          Low-stock resource alerts
  compassion.log.create          volunteer       Log team activity
  compassion.log.list            volunteer       List logs for a request
  compassion.log.recent          leader          Recent team activity
  compassion.dashboard           leader          Compassion summary

  Request types: Financial, Food, Clothing, Housing, Medical,
                 Transportation, Utility, Other
  Urgency levels: Low, Normal, High, Urgent
  Status workflow: Submitted → Under Review → Approved/Denied →
                   In Progress → Resolved → Closed
  Activity types: Visit, Delivery, Phone Call, Meeting,
                  Resource Pickup, Other
  Confidentiality: Requests flagged confidential are only visible
                   to users with pastor role or higher.
  Resource categories: Food, Clothing, Financial, Household,
                       Medical, Gift Cards, Other

  ─── 19. DISCIPLESHIP & SPIRITUAL GROWTH (discipleship.gs) ───────────────

  Action                                Role Required   Description
  ────────────────────────────────────  ──────────────  ──────────────────
  discipleship.paths.list               readonly        List pathways
  discipleship.paths.get                readonly        Get path + steps
  discipleship.paths.create             leader          Create pathway
  discipleship.paths.update             leader          Update pathway
  discipleship.paths.publish            pastor          Publish (Draft →
                                                        Active)
  discipleship.paths.archive            pastor          Archive pathway
  discipleship.steps.list               readonly        Steps for a path
  discipleship.steps.get                readonly        Get single step
  discipleship.steps.create             leader          Add step to path
  discipleship.steps.update             leader          Update step
  discipleship.steps.delete             pastor          Remove step
  discipleship.steps.reorder            leader          Reorder steps
  discipleship.enrollments.list         volunteer       List enrollments
  discipleship.enrollments.get          volunteer       Get enrollment
  discipleship.enrollments.create       leader          Enroll member
  discipleship.enrollments.update       leader          Update enrollment
  discipleship.enrollments.advance      leader          Advance one step
  discipleship.enrollments.forMember    volunteer       All paths for a
                                                        member
  discipleship.enrollments.complete     leader          Mark complete
  discipleship.mentoring.list           volunteer       List pairings
  discipleship.mentoring.get            volunteer       Get pairing +
                                                        meetings
  discipleship.mentoring.create         leader          Create pairing
  discipleship.mentoring.update         leader          Update pairing
  discipleship.mentoring.end            leader          End relationship
  discipleship.mentoring.forMentor      volunteer       All mentees for
                                                        a mentor
  discipleship.meetings.list            volunteer       Meetings for a
                                                        pairing
  discipleship.meetings.create          volunteer       Log meeting
  discipleship.meetings.update          volunteer       Update meeting
  discipleship.assessments.list         volunteer       List assessments
  discipleship.assessments.get          volunteer       Get assessment
  discipleship.assessments.create       leader          Record assessment
  discipleship.assessments.update       leader          Update assessment
  discipleship.assessments.forMember    volunteer       All assessments
                                                        for a member
  discipleship.resources.list           readonly        List resources
  discipleship.resources.get            readonly        Get resource
  discipleship.resources.create         leader          Add resource
  discipleship.resources.update         leader          Update resource
  discipleship.milestones.list          volunteer       List milestones
  discipleship.milestones.forMember     volunteer       Milestones for
                                                        a member
  discipleship.milestones.create        leader          Record milestone
  discipleship.milestones.update        leader          Update milestone
  discipleship.goals.list               volunteer       List goals
  discipleship.goals.forMember          volunteer       Goals for member
  discipleship.goals.create             volunteer       Set new goal
  discipleship.goals.update             volunteer       Update goal
  discipleship.goals.complete           volunteer       Complete goal
  discipleship.goals.review             volunteer       Log review /
                                                        accountability
  discipleship.goals.overdue            leader          Overdue goals
  discipleship.certificates.list        volunteer       List certificates
  discipleship.certificates.forMember   volunteer       Certs for member
  discipleship.certificates.issue       leader          Issue certificate
  discipleship.certificates.revoke      pastor          Revoke certificate
  discipleship.dashboard                leader          Full dashboard

  Path categories: Foundations, Baptism, Membership, Leadership,
                   Bible Study, Theology, Marriage, Parenting,
                   Recovery, Missions, Youth, Custom
  Target audiences: All, New Believers, Youth, Men, Women, Couples,
                    Leaders, Seniors
  Step types: Lesson, Workshop, Activity, Quiz, Discussion, Project,
              Reading, Video, Field Trip, Mentoring Session, Other
  Enrollment statuses: Enrolled, In Progress, Completed, Paused,
                       Dropped, Transferred
  Mentoring types: Discipleship, Accountability, Coaching, Pastoral,
                   Peer, Other
  Focus areas: General Spiritual Growth, Bible Study, Prayer Life,
               Ministry Skills, Leadership, Marriage, Recovery, Other
  Assessment types: Spiritual Gifts, Maturity, Bible Knowledge,
                    Personality, Leadership, Calling, Custom
  Goal categories: Spiritual Discipline, Bible Reading, Prayer,
                   Evangelism, Serving, Giving, Character,
                   Relationship, Knowledge, Leadership, Health, Custom
  Milestone types: Salvation, Baptism, Membership, First Serve,
                   Leadership, Graduation, Testimony, Ordination,
                   Mission Trip, Teaching, Mentoring, Custom
  Certificate format: CERT-YYYYMMDD-XXXX (auto-generated)

  ─── 20. LEARNING — SERMON-BASED EDUCATION (learning.gs) ─────────────────

  Action                                 Role Required   Description
  ─────────────────────────────────────  ──────────────  ──────────────────
  learning.topics.list                   readonly        List learning topics
  learning.topics.get                    readonly        Get single topic
  learning.topics.create                 leader          Create topic
  learning.topics.update                 leader          Update topic
  learning.topics.delete                 pastor          Delete topic
  learning.topics.tree                   readonly        Hierarchical topic tree
  learning.playlists.list                readonly        List playlists
  learning.playlists.get                 readonly        Get playlist + items
  learning.playlists.create              volunteer       Create playlist
  learning.playlists.update              volunteer       Update playlist
  learning.playlists.delete              leader          Delete playlist
  learning.playlists.subscribe           readonly        Subscribe to playlist
  learning.playlistItems.list            readonly        Items in a playlist
  learning.playlistItems.create          volunteer       Add item to playlist
  learning.playlistItems.update          volunteer       Update item
  learning.playlistItems.delete          leader          Remove item
  learning.playlistItems.reorder         volunteer       Reorder items
  learning.progress.list                 readonly        List progress records
  learning.progress.get                  readonly        Get progress record
  learning.progress.update               readonly        Update / auto-create
                                                         progress
  learning.progress.complete             readonly        Mark sermon completed
  learning.progress.stats                readonly        Member learning stats
  learning.notes.list                    readonly        List notes
  learning.notes.get                     readonly        Get single note
  learning.notes.create                  readonly        Create note
  learning.notes.update                  readonly        Update note
  learning.notes.delete                  readonly        Delete own note
  learning.bookmarks.list                readonly        List bookmarks
  learning.bookmarks.create              readonly        Create bookmark
  learning.bookmarks.update              readonly        Update bookmark
  learning.bookmarks.delete              readonly        Delete own bookmark
  learning.recommendations.list          readonly        List recommendations
  learning.recommendations.create        volunteer       Create recommendation
  learning.recommendations.dismiss       readonly        Dismiss recommendation
  learning.recommendations.accept        readonly        Accept recommendation
  learning.recommendations.generate      volunteer       Auto-generate recs
                                                         based on history
  learning.quizzes.list                  readonly        List quizzes
  learning.quizzes.get                   readonly        Get quiz + questions
  learning.quizzes.create                leader          Create quiz
  learning.quizzes.update                leader          Update quiz
  learning.quizzes.publish               leader          Publish quiz
  learning.quizzes.delete                pastor          Delete quiz
  learning.quizResults.list              readonly        List quiz results
  learning.quizResults.submit            readonly        Submit quiz answers
                                                         (auto-graded)
  learning.certificates.list             readonly        List certificates
  learning.certificates.forMember        readonly        Certs for member
  learning.certificates.issue            leader          Issue certificate
  learning.certificates.revoke           pastor          Revoke certificate
  learning.sermons.search                readonly        Multi-faceted sermon
                                                         search (topic,
                                                         preacher, scripture,
                                                         date, keyword)
  learning.sermons.topics                readonly        Unique sermon topics
                                                         with counts
  learning.sermons.preachers             readonly        Unique preachers
                                                         with counts
  learning.sermons.scriptures            readonly        Unique scripture
                                                         refs with counts
  learning.dashboard                     readonly        Full learning
                                                         dashboard stats

  52 API actions total.

  Topic hierarchy: Root topics → child topics → grandchild topics
                   (via ParentTopicId)
  Playlist difficulty: Beginner / Intermediate / Advanced / All Levels
  Playlist visibility: Public / Private / Members Only
  Note types: General, Key Point, Question, Application, Quote,
              Reflection
  Bookmark collections: Watch Later, Favourites, Study, Share, Custom
  Recommendation types: Manual, Auto-Generated, Topic Match,
                        Preacher Match, Series Continuation
  Quiz difficulty: Beginner / Intermediate / Advanced
  Questions format: JSON [{question, options[], correctAnswer}]
  Auto-grading: Answers checked against correctAnswer per question
  Attempt limits: Configurable per quiz (0 = unlimited)
  Certificate format: LCERT-YYYYMMDD-XXXX (auto-generated)
  Certificate types: Playlist Completion, Quiz Mastery, Topic Mastery,
                     Custom

  Key features:
  • Multi-faceted sermon search by topic, preacher, scripture, series,
    date range, and keyword
  • Curated playlists with ordered, sectioned sermon lists
  • Per-user progress tracking with auto-completion at 100%
  • Personal notes with timestamp-linked annotations
  • Auto-generated recommendations based on listening history
  • Quiz engine with JSON question banks & auto-grading
  • Certificate issuance on playlist/quiz completion

  ─── 21. WORLD MISSIONS — PERSECUTION DATA & 10/40 WINDOW ──────────────
       (world-missions.gs)

  Action                                 Role Required   Description
  ─────────────────────────────────────  ──────────────  ──────────────────
  missions.registry.list                 readonly        List all tracked countries
  missions.registry.get                  readonly        Get single country entry
  missions.registry.create               leader          Add country to registry
  missions.registry.update               leader          Update country metadata
  missions.registry.delete               pastor          Archive country entry
  missions.registry.1040                 readonly        List 10/40 Window countries
  missions.regions.list                  readonly        List all regions/states
  missions.regions.get                   readonly        Get single region
  missions.regions.create                leader          Create region
  missions.regions.update                leader          Update region
  missions.regions.delete                pastor          Archive region
  missions.regions.forCountry            readonly        All regions for a country
  missions.cities.list                   readonly        List cities
  missions.cities.get                    readonly        Get single city dossier
  missions.cities.create                 leader          Create city
  missions.cities.update                 leader          Update city
  missions.cities.delete                 pastor          Archive city
  missions.cities.forCountry             readonly        Full country dossier
                                                         (country + regions + cities)
  missions.partners.list                 volunteer       List partners/orgs
  missions.partners.get                  volunteer       Get partner details
  missions.partners.create               leader          Create partner
  missions.partners.update               leader          Update partner
  missions.partners.delete               pastor          Archive partner
  missions.prayerFocus.list              readonly        List prayer targets
  missions.prayerFocus.create            volunteer       Create prayer focus
  missions.prayerFocus.update            volunteer       Update prayer focus
  missions.prayerFocus.respond           readonly        Record prayer response
  missions.updates.list                  readonly        List field updates
                                                         (published only < leader)
  missions.updates.get                   readonly        Get single update
  missions.updates.create                leader          Create field update
  missions.updates.publish               leader          Publish update
  missions.teams.list                    volunteer       List mission teams
  missions.teams.get                     volunteer       Get team details
  missions.teams.create                  leader          Create team
  missions.teams.update                  leader          Update team
  missions.metrics.list                  readonly        List metrics
  missions.metrics.create                leader          Record year metrics
  missions.metrics.update                leader          Update metrics
  missions.metrics.compare               readonly        Year-over-year compare
  missions.dashboard                     readonly        Aggregate mission stats

  45 API actions total.

  Architecture: "Table of Contents" pattern
  ──────────────────────────────────────────
  MissionsRegistry is the master index — one row per tracked country.
  Each country has sub-data in MissionsRegions (states/provinces),
  MissionsCities (individual cities), and cross-references to partners,
  prayer focuses, updates, teams, and metrics.

  Data model:
    Country → Regions → Cities  (hierarchical)
    Country → Partners           (many-to-many via comma-separated IDs)
    Country → PrayerFocus        (one-to-many)
    Country → Updates            (one-to-many)
    Country → Teams              (one-to-many)
    Country → Metrics            (one-to-many, per year)

  10/40 Window: The registry is pre-seeded with 65 countries via
  seedMissionsRegistry_(). All Asian and African nations are auto-tagged
  as 10/40 Window countries. The registry.1040 endpoint returns only
  these countries, sorted by persecution rank.

  Persecution scoring follows the Open Doors World Watch List model:
    - Persecution Level: Extreme / Very High / High / Medium / Low
    - City-level pressure spheres: Church Life, National Life,
      Social Life, Private Life, Family Life (0-16.7 each)
    - Violence Score: 0-16.7
    - Pressure Score: 0-83.3 (sum of 5 spheres)
    - Total Score: 0-100 (violence + pressure)

  Security levels for updates:
    - Standard: visible to all authenticated users
    - Sensitive: visible to leaders+
    - Restricted: visible to pastors+ only

  Designed to be deployable as its OWN separate Web App / API
  due to the volume of country-level data sheets.

  ─── 22. THEOLOGY — STATEMENT OF FAITH & DOCTRINE (theology.gs) ─────────

  Stores the church's theological positions in the master CRM database.
  The frontend (Theology.js) fetches the theology.flat endpoint and
  gets the same flat row format it currently expects.

  Sheet Tabs (4 tabs, columns 12/16/12/10):
  ──────────────────────────────────────────
  TheologyCategories   12 col  Groupings (Core Doctrine, Applied, etc.)
  TheologySections     16 col  Individual doctrinal statements
  TheologyScriptures   12 col  Supporting scripture references
  TheologyRevisions    10 col  Audit trail when positions change

  Action                                 Role Required   Description
  ────────────────────────────────────── ──────────────  ──────────────────────────────
  theology.categories.list               readonly        List theology categories
  theology.categories.get                readonly        Get single category
  theology.categories.create             pastor          Create new category
  theology.categories.update             pastor          Update category
  theology.categories.delete             admin           Archive category
  theology.categories.reorder            pastor          Reorder categories
  theology.sections.list                 readonly        List doctrinal statements
  theology.sections.get                  readonly        Get single section
  theology.sections.create               pastor          Create doctrinal statement
  theology.sections.update               pastor          Update statement (auto-versions)
  theology.sections.delete               admin           Archive section
  theology.sections.approve              pastor          Mark section as officially adopted
  theology.sections.reorder              pastor          Reorder sections
  theology.sections.forCategory          readonly        Get all sections in a category
  theology.scriptures.list               readonly        List scripture references
  theology.scriptures.create             pastor          Add scripture reference
  theology.scriptures.update             pastor          Update scripture
  theology.scriptures.delete             pastor          Archive scripture
  theology.revisions.list                leader          List revision history
  theology.revisions.get                 leader          Get single revision
  theology.flat                          readonly        Frontend-compatible flat rows
  theology.full                          readonly        Full tree (cats→sections→scriptures)
  theology.search                        readonly        Full-text search across content
  theology.dashboard                     readonly        Summary stats

  26 API actions total.

  Architecture: Normalized categories + sections with flat compatibility
  ────────────────────────────────────────────────────────────────────────
  TheologyCategories stores groupings (Core Doctrine, Applied Theology,
  Marriage & Covenant, Salvation, Ecclesiology, Eschatology, Pneumatology,
  Bibliology). Pre-seeded with 8 categories via seedTheologyCategories_().

  TheologySections stores the actual doctrinal statements, linked to a
  category by categoryRowId. Each section has a version number that
  auto-increments on content changes, with the old content saved to
  TheologyRevisions for audit.

  TheologyScriptures stores supporting Bible references per section,
  with the actual text quoted and a context note explaining relevance.

  The theology.flat endpoint returns denormalized rows matching the
  existing frontend format:
    { category_id, category_title, category_intro,
      section_id, section_title, content }

  The theology.full endpoint returns the structured tree:
    Category → Sections → Scriptures

  Editing requires pastor+ role. Archiving categories requires admin.
  Revision history is viewable by leader+ to maintain accountability.

  ─── 23. MEMBER CARDS — DYNAMIC CONTACT CARDS (member-cards.gs) ─────────

  Every member gets a unique member number (ATOG-0001, ATOG-0002, …) that
  drives a shareable, dynamic contact card. The frontend calls
  /card?m=ATOG-0042 which triggers memberCards.public and renders a
  contact card dynamically. No auth required for public-visibility cards;
  authenticated viewers get richer data based on their role.

  Members control which fields appear on their card via memberCards.update.

  Sheet Tabs (3 tabs, columns 30/12/8):
  ──────────────────────────────────────────
  MemberCards          30 col  Public card profile per member (identity, bio,
                               photo, contact info, visibility, appearance)
  MemberCardLinks      12 col  Action buttons & social links per card
                               (call, text, email, website, schedule, social)
  MemberCardViews       8 col  View analytics — who viewed which card when

  Action                                 Role Required   Description
  ────────────────────────────────────── ──────────────  ──────────────────────────────
  memberCards.list                       volunteer       List all active cards
  memberCards.get                        readonly        Get single card by ID
  memberCards.byNumber                   readonly        Lookup card by ATOG-xxxx number
  memberCards.create                     leader          Create a new member card
  memberCards.update                     self/leader     Update card (own card or leader+)
  memberCards.archive                    pastor          Archive a card
  memberCards.mine                       readonly        Get own card by auth email
  memberCards.search                     readonly        Search cards by name/number
  memberCards.bulkProvision              pastor          Mass-create cards from member array
  memberCards.public                     (none)          Public card view (no auth for public cards)
  memberCards.publicFull                 (none)          Card + visible links in one call
  memberCards.vcard                      (none)          Download .vcf contact file
  memberCards.directory                  readonly        Card-based member directory
  memberCards.links.list                 readonly        List links for a card
  memberCards.links.create               self/leader     Add link to card (own or leader+)
  memberCards.links.update               self/leader     Update link (own card or leader+)
  memberCards.links.delete               self/leader     Remove link (own card or leader+)
  memberCards.views.list                 leader          View analytics for any card
  memberCards.views.mine                 readonly        View stats for own card
  memberCards.dashboard                  volunteer       Card summary statistics

  21 API actions total.

  Architecture: Member numbers + visibility levels + self-service editing
  ────────────────────────────────────────────────────────────────────────
  Member numbers are auto-assigned sequentially (ATOG-0001, ATOG-0002, …)
  via nextMemberNumber_() which scans existing numbers to find the max.
  Numbers are never reused.

  Each card has a visibility level:
    • public        — viewable by anyone (no auth needed)
    • authenticated — viewable by any logged-in user (default)
    • private       — only the card owner + leaders can view

  Members edit their own card by matching auth.email to the card's email
  field. Leaders+ can edit any card. Status/Active changes always require
  leader+ role regardless of ownership.

  MemberCardLinks stores action buttons (phone, SMS, email, website,
  schedule booking, social media) as separate rows per card for flexible
  ordering and management. Link types: phone, sms, email, website,
  schedule, social, custom.

  MemberCardViews records every view with timestamp, viewer identity,
  view source (direct/qr/directory/share), and hashed IP for privacy.
  The card's VIEW_COUNT field auto-increments on each public access.

  The memberCards.vcard endpoint generates a standards-compliant .vcf
  file with name, phone, email, website, photo URL, and member number.

  The memberCards.bulkProvision endpoint accepts a members array and
  creates cards for any member who doesn't already have one. Useful for
  initial migration from pastoral-server-v2 member data.

  ─── 24. STATISTICS — CUSTOMIZABLE ANALYTICS & METRICS (statistics.gs) ──

  A fully customizable statistics framework with 50 generic metric slots
  (h1–h50) that can be mapped to ANY data source in the CRM. Admins define
  what each slot means; the system computes snapshots on demand.

  Sheet Tabs (3 tabs, columns 18/58/14):
  ──────────────────────────────────────────
  StatisticsConfig       18 col  Metric definitions — what h1–h50 mean
  StatisticsSnapshots    58 col  Computed data rows (ID + metadata + h1–h50 + notes)
  StatisticsCustomViews  14 col  Saved dashboard layouts & report configurations

  Action                                 Role Required   Description
  ────────────────────────────────────── ──────────────  ──────────────────────────────
  statistics.config.list                 leader          List metric definitions
  statistics.config.get                  leader          Get single config entry
  statistics.config.create               admin           Define a new metric slot
  statistics.config.update               admin           Update metric definition
  statistics.config.delete               admin           Deactivate a metric
  statistics.snapshots.list              leader          List all snapshots
  statistics.snapshots.get               leader          Get single snapshot
  statistics.snapshots.create            leader          Manually create a snapshot
  statistics.snapshots.delete            admin           Archive a snapshot
  statistics.snapshots.latest            leader          Get most recent snapshot
  statistics.compute                     leader          Auto-compute all configured metrics
  statistics.views.list                  readonly        List saved dashboard views
  statistics.views.get                   readonly        Get single view configuration
  statistics.views.create                leader          Create a saved view
  statistics.views.update                leader          Update a saved view
  statistics.views.delete                admin           Delete a view
  statistics.dashboard                   leader          Combined statistics overview
  statistics.trends                      leader          Time-series data for specific slots
  statistics.export                      admin           Export all snapshot data with labels

  19 API actions total.

  Architecture: Customization-first with compute engine
  ────────────────────────────────────────────────────────────────────────
  StatisticsConfig maps each slot (h1–h50) to a data source:
    • sourceTab    — which Google Sheet tab to pull from
    • sourceColumn — which column (by name or 0-based index)
    • calcType     — count / sum / avg / min / max / countDistinct / latest
    • filterField  — optional column to filter rows by
    • filterValue  — value to match in the filter field
    • dateField    — column with dates for time-scoped calculations
    • formatType   — how to display: number / percent / currency / text
    • widgetType   — frontend hint: number / bar / line / pie / gauge / table

  The statistics.compute endpoint reads all active configs, pulls data
  from each source tab, applies the calculation, and stores a new
  StatisticsSnapshots row. Supports dateFrom/dateTo parameters for
  period-scoped computation. Tab data is cached per-request to avoid
  redundant reads.

  StatisticsSnapshots stores one row per snapshot with all 50 metric
  values. Each snapshot has a periodType (daily/weekly/monthly/quarterly/
  yearly/custom) and auto-generated periodLabel.

  StatisticsCustomViews stores saved dashboard layouts specifying which
  metric slots to display, chart types, date ranges, and role-gated
  visibility. Multiple views can coexist (e.g., "Pastor Dashboard",
  "Weekly Overview", "Giving Report").

  The statistics.trends endpoint returns time-series data for specific
  slots across all snapshots, enabling chart-based trend visualization.

  The statistics.export endpoint bundles all snapshot data with slot
  labels for external reporting or backup.

  ─── 25. REPORTS & ANALYTICS (utilities.gs) ──────────────────────────────

  Action                     Role Required   Description
  ────────────────────────── ──────────────  ──────────────────────────────
  reports.attendanceTrend    leader          Weekly attendance trends
  reports.givingSummary      admin           Monthly giving by fund
  reports.memberGrowth       leader          New members per month
  reports.prayerOverview     leader          Prayer request statistics
  reports.dashboard          leader          Combined snapshot dashboard

  All reports accept dateFrom/dateTo parameters.

  ─── 26. ADVANCED — MULTI-CHURCH (4-FlockOS-Expansions.gs) ───────────────

  Action                     Role Required   Description
  ────────────────────────── ──────────────  ──────────────────────────────
  church.create              admin           Register a new church
  church.list                admin           List all churches

  Each church gets its own Google Sheet. A central ChurchRegistry tab
  stores the mapping. Activate by creating the ChurchRegistry tab.

  ─── 27. ADVANCED — BATCH OPERATIONS (4-FlockOS-Expansions.gs) ───────────

  Action                     Role Required   Description
  ────────────────────────── ──────────────  ──────────────────────────────
  bulk.membersImport         admin           Import up to 200 members
  bulk.dataExport            admin           Export tab data as JSON

  ─── 28. SCHEDULED TRIGGERS (4-FlockOS-Expansions.gs) ────────────────────

  Run installScheduledTriggers() once from the Script Editor to enable:

  Trigger         Schedule              Action
  ──────────────  ────────────────────  ──────────────────────────────────
  Daily (6 AM)    Every day             Auto-close stale check-in sessions
  Weekly (Mon 8)  Every Monday          Send volunteer schedule reminders
  Monthly (1st)   1st of each month     Membership snapshot to audit log
                                        Update pledge progress totals


════════════════════════════════════════════════════════════════════════════════
 MANAGING USERS (Admin Guide)
════════════════════════════════════════════════════════════════════════════════

  Option A — Via API:

    Create user:
      ?action=users.create&token=ADMIN_TOKEN
       &targetEmail=jane@church.org&passcode=securepass123
       &firstName=Jane&lastName=Doe&role=volunteer

    Change role:
      ?action=users.update&token=ADMIN_TOKEN
       &targetEmail=jane@church.org&role=leader

    Deactivate:
      ?action=users.deactivate&token=ADMIN_TOKEN
       &targetEmail=jane@church.org

    Reset passcode:
      ?action=users.resetPasscode&token=ADMIN_TOKEN
       &targetEmail=jane@church.org&newPasscode=newpass456

  Option B — Directly in the Google Sheet:

    1. Open the AuthUsers tab
    2. Add/edit a row with email, passcode, role, status
    3. Also ensure a matching row exists in AccessControl with Active=TRUE


════════════════════════════════════════════════════════════════════════════════
 END-USER CONFIGURATION (via AppConfig tab or API)
════════════════════════════════════════════════════════════════════════════════

  End users with admin role can adjust settings without touching code:

  Via API:
    ?action=config.set&token=ADMIN_TOKEN&key=CHURCH_NAME&value=Grace Community

  Via Google Sheet:
    Open the AppConfig tab and edit the Value column directly.

  To disable a module:
    ?action=config.set&token=ADMIN_TOKEN&key=MODULE_OUTREACH&value=FALSE

  To change session duration:
    ?action=config.set&token=ADMIN_TOKEN&key=SESSION_TTL_HOURS&value=12

  To update API endpoint URL:
    Control Panel → Provisioning (admin only), or via localStorage:
    localStorage.setItem('flock_provisioning', JSON.stringify({
      DATABASE_URL: 'https://...primary/exec'
    }));


════════════════════════════════════════════════════════════════════════════════
 PROVISIONING REFERENCE  (Single Unified API)
════════════════════════════════════════════════════════════════════════════════

  Location:  Control Panel → Provisioning (admin only)
  Files:     the_tabernacle.js (UI + save/test), the_true_vine.js (runtime config)
  Storage:   localStorage key "flock_provisioning" (JSON) + AppConfig key
             "PROVISIONING_URLS" (JSON string, category: System)
  Mechanism: TheVine.configure() updates _config at runtime, overriding
             the hardcoded URLs in the_true_vine.js. _loadProvisioning()
             runs on module init to apply saved URLs automatically.

  ─── ENDPOINT URL FIELD ───────────────────────────────────────────────────

  FlockOS uses a single unified API endpoint (DATABASE_URL) that serves
  all domains. The legacy 4-API architecture (Matthew/Mark/Luke/John) has
  been consolidated into Single.gs. All four endpoint arrays now draw
  from the same DATABASE_URL.

  Config Key         Purpose
  ────────────────── ────────────────────────────────────────────────────────
  DATABASE_URL       Single unified FlockOS API endpoint (Single.gs)

  When DATABASE_URL is set, TheVine auto-populates all internal endpoint
  arrays (APP_ENDPOINTS, FLOCK_ENDPOINTS, MISSIONS_ENDPOINTS,
  EXTRA_ENDPOINTS) from this single URL for backward compatibility.
  prov-RANDOMIZE       RANDOMIZE        OFF      Randomize URL selection from
                                                  the enabled-tier pool (OFF =
                                                  use first available)

  ─── LOAD-BALANCING BEHAVIOR ──────────────────────────────────────────────

  _resolveUrl(key):
    1. Builds a URL pool from all tiers whose toggle is ON
    2. If RANDOMIZE is ON → picks a random URL from the pool
    3. If RANDOMIZE is OFF → picks the first URL in the pool

  _appTab() (tab-based queries):
    1. Builds the same enabled-tier pool
    2. Tries each URL sequentially (failover on error)
    3. Returns the first successful response

  ─── BUTTONS ──────────────────────────────────────────────────────────────

  Save Provisioning   — Writes DATABASE_URL to localStorage,
                        calls TheVine.configure() to update runtime config,
                        and persists to backend AppConfig as
                        PROVISIONING_URLS (JSON).
  Test Endpoint       — Sends ?action=health to the configured URL
                        (8-second timeout). Shows green ✅ / red ❌
                        result with error message on failure.

  ─── AUTO-LOAD ────────────────────────────────────────────────────────────

  On Modules IIFE init, _loadProvisioning() reads from localStorage
  and calls TheVine.configure() so saved URLs take effect immediately
  on every page load, overriding the hardcoded defaults in
  the_true_vine.js. This means:
    1. First deploy: paste URLs in the_true_vine.js _config block
    2. After that: update URLs via Settings → Provisioning
    3. localStorage values always win over hardcoded _config values

  ─── PERSISTENCE ──────────────────────────────────────────────────────────

  Key                  Storage          Format       Category
  ──────────────────── ──────────────── ────────────  ──────────
  flock_provisioning   localStorage     JSON          Client
  PROVISIONING_URLS    AppConfig (API)  JSON string   System

  JSON structure:
    {
      "DATABASE_URL": "https://.../exec"
    }


════════════════════════════════════════════════════════════════════════════════
 FILE MANIFEST
════════════════════════════════════════════════════════════════════════════════

  File                      Purpose                              Lines
  ────────────────────────  ─────────────────────────────────────  ─────
  setup.gs                  Unified CRM setup: pastoral core +      ~2340
                            expansion modules (87 tabs total)
  auth.gs                   Self-contained auth: login, sessions,  ~800
                            RBAC, user mgmt, config, profiles,
                            profile update + theme persistence
  api.gs                    Central action router for all modules   ~570
  database.gs               CRUD for Attendance, Events, RSVPs,    ~700
                            Groups, Giving, Pledges, Volunteers,
                            Comms (legacy), CheckIn
  utilities.gs              Helpers: audience resolution, dates,    ~400
                            validation, report generators
  ministries.gs             Ministry tracking + hierarchy           ~320
  service-planning.gs       Service order builder + duplication     ~280
  spiritual-care.gs         Cases, interactions, assignments        ~420
  outreach.gs               Contacts, campaigns, follow-ups         ~400
  photos.gs                 Photo storage, albums, Drive integration ~480
  sermons.gs                Sermons, series, reviews, Drive upload  ~530
  compassion.gs             Benevolence requests, resources, team   ~500
                            log, dashboard
  discipleship.gs           Paths, steps, enrollments, mentoring,  ~1600
                            meetings, assessments, resources,
                            milestones, goals, certificates
  learning.gs               Topics, playlists, progress, notes,    ~1200
                            bookmarks, recommendations, quizzes,
                            quiz results, certificates, search
  communications.gs         Communications Hub: messages, threads, ~1100
                            notifications, notif prefs, channels,
                            templates, read receipts, broadcasts,
                            dashboard, user preferences sync
  world-missions.gs         World Missions: registry, regions,     ~1100
                            cities, partners, prayer focus, updates,
                            teams, metrics, dashboard, seeder
  theology.gs               Theology: categories, sections,         ~580
                            scriptures, revisions, flat/full
                            endpoints, search, dashboard, seeder
  member-cards.gs           Member Cards: dynamic contact cards,    ~590
                            member numbers (ATOG-xxxx), links,
                            public endpoint, vCard, directory, bulk
  statistics.gs             Statistics: customizable metrics (h1–   ~530
                            h50), compute engine, snapshots,
                            custom views, trends, export
  4-FlockOS-Expansions.gs    Multi-church, triggers, batch, export   ~400


════════════════════════════════════════════════════════════════════════════════
 FRONTEND FEATURES (the_tabernacle.js + the_good_shepherd.html — March 22, 2026)
════════════════════════════════════════════════════════════════════════════════

  the_tabernacle.js (~8400+ lines) renders 44+ module views in the admin dashboard.
  Key frontend capabilities implemented:

  FORMS & DATA ENTRY
  ─────────────────────────────────────────────────────────────────────────────
  • Member Name Dropdowns — All assignment and member-email fields across
    9 create/edit forms (Care, Compassion, Messages, Giving, Prayer) use
    member directory select dropdowns instead of raw email text inputs.
  • Shared Helpers — _ensureMemberDir() loads directory once and caches.
    _memberOpts(dir) builds select options. _memberLookup(dir) builds
    email→name map. _memberName(emailOrId) resolves a single value.
  • Generic _modal() — Responsive create/edit form with field types:
    text, email, tel, number, date, select, textarea. Per-field rows
    override for textareas (default 5 rows, messages get 6).
  • Generic _edit() — Fetches existing record, pre-fills _modal fields.

  DISPLAY & TABLES
  ─────────────────────────────────────────────────────────────────────────────
  • Name Resolution — Care, Compassion, Prayer-admin, and Care Follow-ups
    tables resolve assignedTo emails to member names via _memberName().
  • Prayer Admin Card Grid — Card-based layout with full prayer text
    displayed prominently. Metadata (status, category, confidential,
    follow-up, assigned, date) shown as pills at the bottom of each card.
    Reply button per card. Hover accent border effect.
  • Tasks Card Grid — Filterable by status/priority/category. Complete,
    archive, delete actions. Priority badges and category pills.
  • Messages Card Inbox — Complete card-based Inbox/Sent views. Each
    message card shows avatar initials (deterministic color), sender/
    recipient name, subject, body preview, time-ago date, and unread
    indicator. Full message detail view with back navigation, read
    receipts marked on open, Reply/Forward/Delete buttons.
  • Modal Enhancements — New type: 'html' field for read-only content
    (quoted replies). Custom submit button labels per modal ("Send
    Message", "Send Reply", "Forward", etc.). Progress state shows
    "Sending…" instead of "Saving…". Title supports HTML entities.
  • Daily Bread — Unified daily spiritual life page replacing separate
    devotionals and reading plan modules. Single-card date navigation
    with prev/next arrows, native date picker, and Today button.
    Hero header with gradient, title, date, and theme pill. Colorful
    section cards: Scripture (gold), Reflection (accent), Reflect (mint),
    Prayer Focus (lilac), Daily Reading (peach) with vertical grid layout.
    Inline journal entry (members only) with title, mood selector, and
    save to TheVine.flock.journal.create. Prayer request submission form
    with name, text, category, confidential toggle, and submit via
    prayer.submit (skipAuth). All content for one day in a single view.

  NOTIFICATIONS (the_good_shepherd.html — March 22, 2026)
  ─────────────────────────────────────────────────────────────────────────────
  • Notification Bell — Topbar bell icon with unread count badge and
    dot indicator. Dropdown panel shows subject, body preview, and
    time-ago per notification. Dismiss individual or mark all read.
  • 30-Second Polling — Unread count refreshes every 30 seconds via
    comms.notifications.unreadCount API.
  • Click-to-Navigate Routing — Smart router maps 20+ notification
    types/categories to the correct module view. Message notifications
    open the specific message detail view after 600ms delay.
  • Mobile Responsive — Panel goes full-width fixed below topbar at
    ≤600px. At ≤768px: role badge hidden, username truncated, tighter
    gaps, smaller bell and logout button.

  UI / UX POLISH
  ─────────────────────────────────────────────────────────────────────────────
  • iOS Zoom Prevention — All inputs/selects/textareas globally set to
    16px font-size to prevent Safari auto-zoom on focus.
  • Input Background — Modal inputs use rgba(255,255,255,0.07) for subtle
    contrast against the dark modal background.
  • Modal Padding — Overlay padding 40px top/bottom for mobile comfort.
  • Topbar Greeting — Shows "Hello, [First Name]" from session profile.
  • Public Site Link — Moved to sidebar under Dashboard.
  • Bible.com ESV Links — Scripture references link to bible.com ESV
    (version 59) via complete book→abbreviation map.
  • iOS Font Scaling — Root html uses font-size: 100% (not fixed 16px)
    so iOS/Safari user font size preferences propagate through all rem
    units. Added -webkit-text-size-adjust: 100%.
  • Control Panel (formerly Settings) — Admin panel with 8 collapsible
    accordion sections (all closed by default). Each <details> trigger
    shows an icon, label, and live summary count/status. Sections:
    Security, Identity & Branding, Display Preferences, Theme
    Administration, Favorites, Visible Apps, API Health, Provisioning.
  • Theme Administration — Control Panel section with foundational theme
    dropdown + compact swatch row + Allow Custom Themes toggle.
    Admin override sets the global church theme; the toggle controls
    whether members can personalize themes via the Themes module.
    Priority chain: admin global → user preference → localStorage → default.
  • Themes Module (Public) — Dedicated module in Growth nav group.
    Personal theme swatch picker (checks ALLOW_CUSTOM_THEMES). Full
    Interface Studio: fonts, font sizes (28 sliders), padding (13 sliders),
    corners & shadows, custom CSS. Live preview, save, reset, restore.
    Replaces the old admin-only Interface Studio inside Settings.
  • API Health Dashboard — Control Panel section with colored health
    pills per branch (Flock, App, Missions, Extra). Run Diagnostics
    calls TheVine.manifest.diagnostics(), displays latency + online/
    offline status. Pills: .health-pill-ok (green, pulsing),
    .health-pill-warn (yellow), .health-pill-fail (red).
  • Health Pill CSS — fine_linen.js: .health-pill, .health-dot (8px
    circle), .health-pill-ok/warn/fail/unknown, @keyframes health-pulse.
    Also .prov-url-field (monospace, ellipsis, accent focus ring).
  • Login Return Home — the_wall.html login screen includes "Return Home"
    link below "Forgot passcode?" and "Request access".
  • Dual Font Scale — Separate desktop and mobile font-size sliders in
    Control Panel. Desktop uses flock_font_scale, mobile uses
    flock_font_scale_mobile. IIFE uses matchMedia('(max-width: 768px)')
    to apply the correct scale per viewport.
  • Provisioning — Control Panel section for editing all four GAS
    deployment URLs (Flock/John, App/Matthew, Missions/Mark,
    Extra/Luke). 12 URL fields (.prov-url-field class) + 4 tier
    toggles. Save persists to localStorage + backend AppConfig.
    Health pills per API card updated by Run Diagnostics.
    Auto-loads on init via TheVine.configure(). See PROVISIONING
    REFERENCE below.

  MODULES WITH FULL CRUD
  ─────────────────────────────────────────────────────────────────────────────
  Tasks, Care, Compassion, Messages, Giving, Prayer, Discipleship,
  Outreach, Photos, Sermons, Songs, Services, Learning, Theology,
  Missions, Member Cards, Statistics, Volunteers, Ministries,
  Small Groups, Events, Attendance, Journal, Reading Plan, Check-In.


════════════════════════════════════════════════════════════════════════════════
 INTERFACE STUDIO CONTROL REFERENCE
════════════════════════════════════════════════════════════════════════════════

  Location:  Themes module → Interface Studio (accessible to all users;
             respects ALLOW_CUSTOM_THEMES admin toggle)
  Files:     the_tabernacle.js (UI + logic), fine_linen.js (override injection)
  Storage:   localStorage key "flock_interface_overrides" + AppConfig key
             "INTERFACE_OVERRIDES" (JSON blob)
  Mechanism: Adornment.applyOverrides({vars, fonts, sizes, pads, custom})
             injects a <style id="adornment-overrides"> element that wins
             over theme CSS by source order.

  BUTTONS:
    Save All               — Persist current slider/dropdown/textarea values
                             to localStorage + backend config.
    Reset to Defaults      — Clear ALL overrides (local + backend). Requires
                             confirmation. Reloads Themes module view.
    Restore Visuals to     — Revert live preview to last SAVED state without
      Default                clearing saved data. Useful for undoing unsaved
                             slider experimentation.

  ─── 6A: FONTS ────────────────────────────────────────────────────────────

  Control ID              Type        Default         Description
  ──────────────────────  ──────────  ──────────────  ─────────────────────
  studio-font-body        dropdown    (Default/Inter) Body font — all regular
                                                      text, menus, tables
  studio-font-heading     dropdown    (Default/Inter) Heading font — page
                                                      titles, section headers,
                                                      welcome hero, modals

  Available fonts (loaded via Google Fonts @import):
    Inter, Lora, Merriweather, Montserrat, Nunito, Open Sans, Poppins,
    Playfair Display, PT Serif, Raleway, Roboto, Roboto Slab,
    Source Sans 3, Work Sans, Noto Serif, Georgia, Courier New

  ─── 6B: FONT SIZES ──────────────────────────────────────────────────────

  All sliders output values in rem. Live preview via oninput event.

  Slider ID (DOM)                        CSS Selector               Default  Range
  ─────────────────────────────────────  ─────────────────────────  ───────  ──────────
  PAGE & HEADINGS
  sz--page-header-h1                     .page-header h1            1.4rem   0.8 – 3
  sz--page-header-p                      .page-header p             0.85rem  0.6 – 1.5
  sz--welcome-hero-h1                    .welcome-hero h1           2rem     1 – 4
  sz--welcome-hero--subtitle             .welcome-hero .subtitle    1rem     0.7 – 2
  sz--welcome-hero--verse                .welcome-hero .verse       0.82rem  0.6 – 1.5

  NAVIGATION
  sz--nav-item                           .nav-item                  0.86rem  0.6 – 1.3
  sz--nav-item--icon                     .nav-item .icon            1rem     0.7 – 2
  sz--nav-group-label                    .nav-group-label           0.68rem  0.5 – 1

  CARDS
  sz--card--card-icon                    .card .card-icon           1.6rem   0.8 – 3
  sz--card--card-title                   .card .card-title          0.92rem  0.6 – 1.5
  sz--card--card-desc                    .card .card-desc           0.78rem  0.5 – 1.3

  TABLES
  sz--data-table                         .data-table                0.85rem  0.6 – 1.3
  sz--data-table-th                      .data-table th             0.74rem  0.5 – 1.2

  BUTTONS & PILLS
  sz--btn                                .btn                       0.875rem 0.6 – 1.3
  sz--btn-sm                             .btn-sm                    0.75rem  0.5 – 1.1
  sz--pill                               .pill                      0.75rem  0.5 – 1.1
  sz--badge                              .badge                     0.72rem  0.5 – 1.1

  FORMS
  sz--label                              .label                     0.8125rem 0.6 – 1.2
  sz--settings-input                     .settings-input            0.9rem   0.7 – 1.3

  MODALS & ALERTS
  sz--modal-title                        .modal-title               1.1rem   0.8 – 2
  sz--alert                              .alert                     0.85rem  0.6 – 1.3
  sz--toast                              .toast                     0.875rem 0.6 – 1.3

  EMPTY STATES & MISC
  sz--empty-state-icon                   .empty-state-icon          2.5rem   1 – 5
  sz--empty-state-title                  .empty-state-title         1rem     0.7 – 2
  sz--empty-state-p                      .empty-state p             0.85rem  0.6 – 1.3
  sz--settings-section-title             .settings-section-title    1.05rem  0.7 – 1.8
  sz--settings-card-label                .settings-card-label       0.85rem  0.6 – 1.3
  sz--settings-card-hint                 .settings-card-hint        0.8rem   0.5 – 1.2

  BROWSE CARDS (Lexicon, Doctrine, Library)
  sz--browse-item-title                  .browse-item-title         0.9rem   0.6 – 1.5
  sz--browse-item-sub                    .browse-item-sub           0.78rem  0.5 – 1.2
  sz--browse-detail-label                .browse-detail-label       0.72rem  0.5 – 1.1
  sz--browse-detail-card-p               .browse-detail-card p      0.88rem  0.6 – 1.3

  ─── 6C: PADDING & SPACING ───────────────────────────────────────────────

  Simple (single value):

  Slider ID (DOM)                        CSS Selector               Default  Unit   Range
  ─────────────────────────────────────  ─────────────────────────  ───────  ─────  ──────
  pad--card                              .card                      1.25     rem    0.5 – 3
  pad--card-header                       .card-header               1        rem    0.25 – 2
  pad--card-body                         .card-body                 1.25     rem    0.5 – 3
  pad--settings-card                     .settings-card             18       px     8 – 40
  pad--modal-body                        .modal-body                1.25     rem    0.5 – 3

  Split V/H pairs (combined into "padding: V H" on save):

  V Slider              H Slider              CSS Selector(s)                               V Def   H Def  Unit   V Range      H Range
  ────────────────────  ────────────────────  ────────────────────────────────────────────  ──────  ──────  ─────  ───────────  ───────────
  pad--btn-v            pad--btn-h            .btn                                          0.5     1.25   rem    0.2 – 1.5    0.5 – 3
  pad--pill-v           pad--pill-h           .pill                                         0.25    0.75   rem    0.1 – 1      0.25 – 2
  pad--nav-item-v       pad--nav-item-h       .nav-item                                     8       20     px     2 – 20       8 – 40
  pad--table-cell-v     pad--table-cell-h     .data-table th, .data-table td                10      14     px     2 – 24       4 – 30
  pad--input-v          pad--input-h          .settings-input, textarea, select              0.6     0.85   rem    0.2 – 1.5    0.3 – 2

  ─── 6D: CORNERS & SHADOWS ───────────────────────────────────────────────

  Corner Radius Sliders:

  Slider ID (DOM)                        CSS Variable       Default  Unit   Range
  ─────────────────────────────────────  ─────────────────  ───────  ─────  ──────
  corner---radius-sm                     --radius-sm        6        px     0 – 20
  corner---radius-md                     --radius-md        12       px     0 – 30
  corner---radius-lg                     --radius-lg        20       px     0 – 40

  Shadow Intensity Dropdown (id: studio-shadow):

  Value                                      Label
  ─────────────────────────────────────────  ───────────────────────────
  (empty)                                    Default (theme shadows)
  none                                       None (flat)
  0 1px 2px rgba(0,0,0,0.04)                Subtle
  0 1px 3px rgba(0,0,0,0.06)                Light (default)
  0 2px 6px rgba(0,0,0,0.10)                Medium
  0 4px 12px rgba(0,0,0,0.15)               Heavy

  When a shadow value is selected, --shadow-sm is set to that value.
  --shadow-md and --shadow-lg are scaled up proportionally.
  "None" sets all three shadow variables to "none".

  ─── 6E: CUSTOM CSS ──────────────────────────────────────────────────────

  Control ID: studio-custom-css
  Type:       <textarea> (monospace, 6 rows)
  Default:    (empty)
  Purpose:    Raw CSS injected last in the override stylesheet.
              Overrides everything above. Accepts any valid CSS.

  ─── PERSISTENCE ──────────────────────────────────────────────────────────

  Key                      Storage          Format      Category
  ──────────────────────── ──────────────── ──────────  ──────────
  flock_interface_overrides localStorage     JSON        Client
  INTERFACE_OVERRIDES      AppConfig (API)  JSON string Display
  FONT_SCALE               AppConfig (API)  integer %   Display
  FONT_SCALE_MOBILE        AppConfig (API)  integer %   Display
  ALLOW_CUSTOM_THEMES      AppConfig (API)  boolean     Auth

  Note: When ALLOW_CUSTOM_THEMES is FALSE, the Themes module shows a
  locked message and all Interface Studio controls are disabled. The
  admin foundational theme in Control Panel → Theme Administration
  still applies regardless of this toggle.

  The JSON object stored under these keys has the structure:
    {
      vars:   { "--radius-sm": "4px", "--shadow-sm": "none", ... },
      fonts:  { body: "'Lora', serif", heading: "'Montserrat', sans-serif" },
      sizes:  { ".btn": "0.9rem", ".card .card-title": "1rem", ... },
      pads:   { ".card": "1.5rem", ".btn": "0.6rem 1.5rem", ... },
      custom: ".card { box-shadow: none; }"
    }


════════════════════════════════════════════════════════════════════════════════
 FRONTEND ARCHITECTURE (Acts — 15 JavaScript Modules)
════════════════════════════════════════════════════════════════════════════════

 ─── Script Load Order (the_good_shepherd.html) ──────────────────────────

  #   File                  IIFE            Purpose
  ──  ────────────────────  ──────────────  ──────────────────────────────
  1   fine_linen.js         Adornment       CSS theme engine (13 themes)
  2   the_true_vine.js      TheVine         Centralized API client (4 branches)
  3   xlsx.full.min.js      (vendor)        Excel parser for offline mode
  4   the_wellspring.js     TheWellspring   Local data / offline layer
  5   the_well.js           TheWell         Google Drive sync layer
  6   firm_foundation.js    Nehemiah        Auth guard / session / RBAC
  7   the_tabernacle.js     Modules         Master module renderer (44+ views)
  8   the_life.js           TheLife         My Flock Dashboard
  9   the_scrolls.js        TheScrolls      Interaction Ledger
  10  the_shepherd.js       TheShepherd     People Engine
  11  love_in_action.js     LoveInAction    Care Hub (4 tabs)
  12  the_fold.js           TheFold         Groups & Attendance
  13  the_way.js            TheWay          Learning Hub (16 tabs)
  14  the_harvest.js        TheHarvest      Ministry Hub (7 tabs)
  15  the_shofar.js         TheShofar       Song manager / ChordPro
  16  the_trumpet.js        TheTrumpet      Notifications engine
  17  the_commission.js     TheCommission   Deployment guide renderer
  18  the_cornerstone.js    TheCornerstone  Architecture registry

 ─── Dashboard-of-Apps Pattern ───────────────────────────────────────────

  Three hubs use the Dashboard-of-Apps pattern:

  TheLife (My Flock)    — KPI ribbon + 4 app launcher cards
                          Apps: TheShepherd, LoveInAction, TheFold, TheScrolls
                          Delegation guards in the_tabernacle.js route
                          directory/users → TheShepherd, groups/attendance → TheFold

  TheWay (Learning)     — KPI ribbon + 2-col activity cards + donut charts
                          + Quick Actions bar across 16 learning tabs

  TheHarvest (Ministry) — KPI ribbon + 2-col cards (events/sermons)
                          + donut charts + Quick Actions bar across 7 tabs

 ─── Sidebar Navigation (7 groups) ───────────────────────────────────────

  Group        Items
  ───────────  ──────────────────────────────────────────────────────
  Home         Dashboard
  My Flock     Flock Dashboard (bold), People, Groups, Attendance
  Ministry     Ministry Hub (bold), Calendar, The Upper Room
  Growth       Learning Hub (bold), Prayer Request
  Outreach     Messages, Missions, Giving
  My Account   Profile, My Requests, My Giving, Themes
  Admin        People, Statistics, Reports, Settings, Audit Log,
               Public Site, Deployment Guide


════════════════════════════════════════════════════════════════════════════════
 QUICK-START CHECKLIST
════════════════════════════════════════════════════════════════════════════════

  [ ] 1. Create Google Sheet for CRM data
  [ ] 2. Create Google Apps Script project
  [ ] 3. Paste combined .gs file as Code.gs (one file per API project)
  [ ] 4. Set SHEET_ID in Script Properties
  [ ] 5. Run setupExpansion() to create all 87 tabs
  [ ] 6. Add your first admin user to AuthUsers + AccessControl
  [ ] 7. Deploy as Web App (Execute as: Me, Access: Anyone)
  [ ] 8. Test health endpoint: ?action=health
  [ ] 9. Test login: ?action=auth.login&email=...&passcode=...
  [ ] 10. Set CHURCH_NAME in AppConfig
  [ ] 11. Create volunteer/leader accounts for your team
  [ ] 12. (Optional) Run installScheduledTriggers() for automation
  [ ] 13. (Optional) Disable unneeded modules via AppConfig
  [ ] 14. (Optional) Set PHOTO_DRIVE_FOLDER_ID or let it auto-create
  [ ] 15. (Optional) Set SERMON_DRIVE_FOLDER_ID or let it auto-create
  [ ] 16. (Optional) Create discipleship paths and populate step content
  [ ] 17. (Optional) Create learning topics and curate sermon playlists
  [ ] 18. (Optional) Create communication channels (Announcements, Prayer Chain, etc.)
  [ ] 19. (Optional) Create message templates for common outreach emails
  [ ] 20. (Optional) Configure notification preferences for leadership team
  [ ] 21. (Optional) Review pre-seeded MissionsRegistry (65 countries)
  [ ] 22. (Optional) Add region/city persecution data for priority countries
  [ ] 23. (Optional) Review pre-seeded TheologyCategories (8 categories)
  [ ] 24. (Optional) Add doctrinal sections and supporting scriptures
  [ ] 25. (Optional) Bulk-provision member cards from existing member data
  [ ] 26. (Optional) Configure member card visibility defaults (public/authenticated/private)
  [ ] 27. (Optional) Define statistics metric slots (h1–h50) in StatisticsConfig
  [ ] 28. (Optional) Create custom statistics dashboard views

╔══════════════════════════════════════════════════════════════════════════════╗
║                               END OF DOCUMENT                                ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

# 3. Master Deployment Guide — 10-Phase Deployment

> *Source: Revelation/3_Deployment.txt*

```
══════════════════════════════════════════════════════════════════════════════════
 FLOCKOS — MASTER DEPLOYMENT GUIDE
 Complete deployment of every single thing.
 Generated: 2026-03-24
══════════════════════════════════════════════════════════════════════════════════


 TABLE OF CONTENTS
──────────────────────────────────────────────────────────────────────────────────

  PHASE 1 — PRE-FLIGHT
    1.1  What You Need Before Starting
    1.2  Architecture Overview
    1.3  File Inventory

  PHASE 2 — BACKEND: FLOCK API (John)
    2.1  Create Google Sheet
    2.2  Create Google Apps Script Project
    2.3  Add All .gs Files
    2.4  Set Script Properties (EXACT VALUES)
    2.5  Run setupExpansion()
    2.6  Run initPepper()
    2.7  Seed First Admin User
    2.8  Deploy as Web App
    2.9  Test Health Endpoint

  PHASE 3 — BACKEND: EXTRA API (Luke)
    3.1  Create Google Sheet
    3.2  Create GAS Project
    3.3  Add Files & Set Properties
    3.4  Run setupExtraApi()
    3.5  Deploy & Test

  PHASE 4 — BACKEND: APP API (Matthew)
    4.1  Create Google Sheet
    4.2  Create GAS Project
    4.3  Add Files & Populate Content
    4.4  Deploy & Test

  PHASE 5 — BACKEND: MISSIONS API (Mark)
    5.1  Create Google Sheet
    5.2  Create GAS Project
    5.3  Add Files & Run Setup
    5.4  Deploy & Test

  PHASE 6 — FRONTEND: STATIC SITE
    6.1  Repository Setup
    6.2  Configure the-vine.js (EXACT VALUES)
    6.3  Site Folder Structure
    6.4  CSS / Adornment Theme System
    6.5  Script Loading Chain
    6.6  Build Pages
    6.7  Deploy to GitHub Pages

  PHASE 7 — DATA MIGRATION
    7.1  Migrate from pastoral-server-v2
    7.2  Migrate from todo-server
    7.3  Migrate Passwords (salt-pepper-hash)

  PHASE 8 — POST-DEPLOYMENT VERIFICATION
    8.1  Health Check All 4 APIs
    8.2  End-to-End Test Matrix
    8.3  RBAC Verification
    8.4  Cross-API Data Flow Test

  PHASE 9 — LINK ARCHITECTURE & SITE MAP
    9.1  Complete URL Map
    9.2  Page-to-API Mapping
    9.3  Navigation Structure
    9.4  Feature Inventory (P1-P21, A1-A7, F1-F25)

  PHASE 10 — MASTER TROUBLESHOOTING GUIDE
    10.1   API Returns "Unknown action"
    10.2   CORS / Cross-Origin Errors
    10.3   "Access denied" / 403
    10.4   Session Expired / Login Loop
    10.5   setupExpansion() Fails
    10.6   Tabs Not Created / Missing Columns
    10.7   Password Hashing Issues
    10.8   Pepper Lost
    10.9   the-vine.js Failover Not Working
    10.10  Google Apps Script Quotas
    10.11  GitHub Pages 404
    10.12  Stale Cache / Old Data
    10.13  Photos / Sermons Upload Fails
    10.14  Member Cards Not Loading
    10.15  Statistics Dashboard Empty

  APPENDIX A — ALL SCRIPT PROPERTIES (Every API)
  APPENDIX B — ALL APPCONFIG DEFAULTS (32 Keys)
  APPENDIX C — COMPLETE .gs FILE MANIFEST
  APPENDIX D — COMPLETE FRONTEND FILE MANIFEST


══════════════════════════════════════════════════════════════════════════════════
 PHASE 1 — PRE-FLIGHT
══════════════════════════════════════════════════════════════════════════════════


── 1.1  WHAT YOU NEED BEFORE STARTING ──────────────────────────────────────────

  □ Google Account with Google Workspace or personal Gmail
  □ 4 empty Google Sheets (one per API database)
  □ Ability to create Google Apps Script projects (script.google.com)
  □ GitHub account for GitHub Pages hosting
  □ Git installed locally
  □ A text editor (VS Code recommended)
  □ The entire /backend/expansion/ folder from the workspace
  □ The /scripts/ folder from the workspace
  □ The /pages/ folder from the workspace

  NAMING CONVENTION:
    Sheet 1:  "Flock CRM"            → FLOCK API (John)
    Sheet 2:  "Flock Statistics"      → EXTRA API (Luke)
    Sheet 3:  "Flock Content"         → APP API (Matthew)
    Sheet 4:  "Flock Missions"        → MISSIONS API (Mark)


── 1.2  ARCHITECTURE OVERVIEW ──────────────────────────────────────────────────

  ┌─────────────────────────────────────────────────────────────────┐
  │                    FLOCKOS ARCHITECTURE                         │
  │                                                                 │
  │  GitHub Pages (Static Site)                                     │
  │  ┌───────────────────────────────────────────────────────┐      │
  │  │  index.html                                           │      │
  │  │  pages/  scripts/  css/  assets/                      │      │
  │  │                                                       │      │
  │  │  the-vine.js ← ALL API CALLS GO THROUGH HERE          │      │
  │  └──────────────────┬──────┬──────┬──────┬───────────────┘      │
  │                     │      │      │      │                      │
  │            ┌────────┘      │      │      └────────┐             │
  │            ▼               ▼      ▼               ▼             │
  │  ┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
  │  │  APP API     │ │ FLOCK API│ │MISSIONS  │ │ EXTRA API│        │
  │  │  (Matthew)   │ │ (John)   │ │  (Mark)  │ │  (Luke)  │        │
  │  │  Public      │ │ Church   │ │ Global   │ │ Stats &  │        │
  │  │  Content     │ │ CRM+Auth │ │ Missions │ │ Future   │        │
  │  │  12 tabs     │ │ 79 tabs  │ │ 56 tabs  │ │ 53 tabs  │        │
  │  └──────────────┘ └──────────┘ └──────────┘ └──────────┘        │
  │   Google Sheet     Google Sheet  Google Sheet  Google Sheet     │
  │   + GAS Web App    + GAS Web App + GAS Web App + GAS Web App    │
  └─────────────────────────────────────────────────────────────────┘

  Total: 200 tabs across 4 Google Sheets, ~4,214 columns
  See 7-FlockOS-References.txt for the complete per-tab column inventory.


── 1.3  FILE INVENTORY ─────────────────────────────────────────────────────────

  FLOCK API — 26 .gs files to deploy:
  ──────────────────────────────────────
   1. auth.gs              Authentication, sessions, RBAC, doGet/doPost
   2. setup.gs             Creates 79 tabs + seeds AppConfig defaults
   3. api.gs               Route dispatcher ($action → handler)
   4. database.gs          Attendance, Events, RSVPs, Groups, Giving, Volunteers
   5. utilities.gs         Shared helpers (date, UUID, pagination, validation)
   6. 3-FlockOS-SaltPepperHash.gs  Password hashing: pepper, salt, migration
   7. todo.gs              Cross-entity task management (11 endpoints)
   8. communications.gs    Comms Hub: messages, threads, notifications, channels
   9. compassion.gs        Benevolence requests, resources, team logs
  10. discipleship.gs      Growth paths, mentoring, assessments, milestones
  11. learning.gs          Sermon-based education: topics, playlists, quizzes
  12. member-cards.gs      Dynamic member contact cards, directory
  13. ministries.gs        Ministry teams, hierarchical structure
  14. outreach.gs          Outreach contacts, campaigns, follow-ups
  15. photos.gs            Drive-backed photo storage & albums
  16. sermons.gs           Sermon metadata, series, manuscripts
  17. service-planning.gs  Weekly service order builder
  18. spiritual-care.gs    Shepherding cases, care interactions
  19. statistics.gs        Analytics metrics & snapshots
  20. theology.gs          Statement of faith, doctrine, revisions
  21. world-missions.gs    Missions registry, teams, metrics
      4-FlockOS-Expansions.gs  (Optional: multi-church, batch, scheduling)

  EXTRA API — 1 .gs file:
  ────────────────────────
   1. ExtraAPI-setup.gs    (in expansion/ folder)

  APP API — ✅ BUILT (Matthew_Combined.gs — 332 lines)
  MISSIONS API — ✅ BUILT (Mark_Combined.gs — 803 lines)


══════════════════════════════════════════════════════════════════════════════════
 PHASE 2 — BACKEND: FLOCK API (John)
 "Feed my sheep." — John 21:17
══════════════════════════════════════════════════════════════════════════════════


── 2.1  CREATE GOOGLE SHEET ────────────────────────────────────────────────────

  1. Go to sheets.google.com
  2. Create a new blank spreadsheet
  3. Name it: "Flock CRM"
  4. Copy the SHEET ID from the URL bar:

     https://docs.google.com/spreadsheets/d/ XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX /edit
                                              ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                                              THIS IS YOUR SHEET_ID — COPY IT

  5. Save this ID — you will need it in Step 2.4.

  EXAMPLE SHEET_ID:
     1aBcDeFgHiJkLmNoPqRsTuVwXyZ_0123456789abc


── 2.2  CREATE GOOGLE APPS SCRIPT PROJECT ──────────────────────────────────────

  1. Go to script.google.com
  2. Click "New project"
  3. Name it: "Flock CRM API"
  4. Delete the default Code.gs content (you'll replace it)


── 2.3  PASTE THE COMBINED .gs FILE ────────────────────────────────────────────

  As of March 25, 2026, each API project ships as a SINGLE combined file.
  No multi-file setup required.

  In the GAS Script Editor:
    1. Open the default Code.gs file
    2. Select all → delete
    3. Paste the ENTIRE contents of John_Combined.gs (from Database/)
    4. Save (Ctrl+S)

  That's it. The combined file includes doGet/doPost entry points,
  all utilities, all module handlers, and setup functions.

  Source file: FlockOS-GS/Database/John_Combined.gs (23,899 lines)


── 2.4  SET SCRIPT PROPERTIES (EXACT VALUES) ───────────────────────────────────

  In the GAS Script Editor:
    1. Click the gear icon (⚙ Project Settings) in the left sidebar
    2. Scroll down to "Script Properties"
    3. Click "Add script property"

  ┌──────────────────────┬───────────────────────────────────────────────┐
  │  Property Name       │  Value                                        │
  ├──────────────────────┼───────────────────────────────────────────────┤
  │  SHEET_ID            │  (paste your Sheet ID from Step 2.1)          │
  └──────────────────────┴───────────────────────────────────────────────┘

  That's the ONLY manual property — the pepper gets auto-generated in Step 2.6.

  DO NOT manually set FLOCK_AUTH_PEPPER — initPepper() handles it.
  DO NOT manually set exp.session.* — these are created automatically at login.


── 2.5  RUN setupExpansion() ───────────────────────────────────────────────────

  1. In the GAS Script Editor, select "Setup" from the file list
  2. In the function dropdown at top, select "setupExpansion"
  3. Click ▶ Run
  4. On first run, Google will ask for authorization — click "Review Permissions"
     → Choose your Google account
     → Click "Advanced" → "Go to Flock CRM API (unsafe)" → "Allow"
  5. Wait for execution to complete (may take 30-90 seconds)
  6. Check the Logger (View → Logs) for output:

     EXPECTED OUTPUT:
       ✅ Tab "Members" — created (51 columns)
       ✅ Tab "PrayerRequests" — created (18 columns)
       ✅ Tab "ContactLog" — created (12 columns)
       ... (79 tabs total)
       ✅ Tab "AppConfig" — created + seeded 32 defaults
       ✅ Setup complete — 79 tabs created.

  7. Open the Google Sheet and verify tabs are visible
  8. Check the AppConfig tab has 32 pre-populated rows

  WHAT GETS CREATED:
    Core (7):      Members, PrayerRequests, ContactLog, PastoralNotes,
                   Milestones, Households, ToDo
    Auth (6):      AuthUsers, UserProfiles, AccessControl, AuthAudit,
                   AuditLog, AppConfig
    Modules (63):  Attendance, Events, EventRSVPs, SmallGroups,
                   SmallGroupMembers, Giving, GivingPledges,
                   VolunteerSchedule, Communications, CommsMessages,
                   CommsThreads, CommsNotifications, CommsNotifPrefs,
                   CommsChannels, CommsTemplates, CommsReadReceipts,
                   CommsBroadcastLog, CheckInSessions, Ministries,
                   MinistryMembers, ServicePlans, ServicePlanItems,
                   SpiritualCareCases, SpiritualCareInteractions,
                   SpiritualCareAssignments, OutreachContacts,
                   OutreachCampaigns, OutreachFollowUps,
                   Photos, PhotoAlbums,
                   Sermons, SermonSeries, SermonReviews,
                   CompassionRequests, CompassionResources, CompassionLog,
                   DiscipleshipPaths, DiscipleshipSteps,
                   DiscipleshipEnrollments, DiscipleshipMentoring,
                   DiscipleshipMeetings, DiscipleshipAssessments,
                   DiscipleshipResources, DiscipleshipMilestones,
                   DiscipleshipGoals, DiscipleshipCertificates,
                   LearningTopics, LearningPlaylists, LearningPlaylistItems,
                   LearningProgress, LearningNotes, LearningBookmarks,
                   LearningRecommendations, LearningQuizzes,
                   LearningQuizResults, LearningCertificates,
                   MissionsRegistry, MissionsRegions, MissionsCities,
                   MissionsPartners, MissionsPrayerFocus, MissionsUpdates,
                   MissionsTeams, MissionsMetrics,
                   TheologyCategories, TheologySections,
                   TheologyScriptures, TheologyRevisions,
                   MemberCards, MemberCardLinks, MemberCardViews
                   Songs, SongArrangements, SetlistSongs
    TOTAL: 79 tabs


── 2.6  RUN initPepper() ──────────────────────────────────────────────────────

  1. In the GAS Script Editor, select "SaltPepperHash" from the file list
  2. In the function dropdown, select "initPepper"
  3. Click ▶ Run
  4. Check Logger output:

     EXPECTED OUTPUT:
       Pepper created and stored in Script Properties (64 chars).

  5. Verify: Go to ⚙ Project Settings → Script Properties
     You should now see TWO properties:

     ┌──────────────────────┬──────────────────────────────────────────┐
     │  Property Name       │  Value                                   │
     ├──────────────────────┼──────────────────────────────────────────┤
     │  SHEET_ID            │  1aBcDeFg...  (your sheet ID)            │
     │  FLOCK_AUTH_PEPPER   │  a7f3b2c1...  (64-char hex, auto-gen)   │
     └──────────────────────┴──────────────────────────────────────────┘

  ⚠ CRITICAL: Do NOT share, copy, or screenshot the pepper value.
     If lost, ALL passwords must be reset. There is no recovery.


── 2.7  SEED FIRST ADMIN USER ─────────────────────────────────────────────────

  In the Google Sheet, go to the "AuthUsers" tab.
  Add a row (row 2) with these values:

  ┌─────┬──────────────────────────────────────────────────────────────┐
  │ Col │  Value                                                       │
  ├─────┼──────────────────────────────────────────────────────────────┤
  │  A  │  admin@yourchurch.org  (your actual email)                   │
  │  B  │  YourChosenPasscode    (temporary — will be hashed)          │
  │  C  │  (leave blank — will be auto-filled on first login)          │
  │  D  │  (leave blank — salt auto-generated)                         │
  │  E  │  Admin                                                       │
  │  F  │  Setup                                                       │
  │  G  │  admin                                                       │
  │  H  │  active                                                      │
  │  I  │  2026-03-19T00:00:00.000Z                                    │
  │  J  │  2026-03-19T00:00:00.000Z                                    │
  └─────┴──────────────────────────────────────────────────────────────┘

  Then go to the "AccessControl" tab and add:

  ┌─────┬──────────────────────────────────────────────────────────────┐
  │ Col │  Value                                                       │
  ├─────┼──────────────────────────────────────────────────────────────┤
  │  A  │  admin@yourchurch.org                                        │
  │  B  │  admin                                                       │
  │  C  │  Admin Setup                                                 │
  │  D  │  Deployment                                                  │
  │  E  │  approved                                                    │
  │  F  │  (leave blank)                                               │
  │  G  │  2026-03-19T00:00:00.000Z                                    │
  │  H  │  2026-03-19T00:00:00.000Z                                    │
  └─────┴──────────────────────────────────────────────────────────────┘

  THEN run migrateAllPasswords() to hash the plain-text password:
    1. Select "SaltPepperHash" from files
    2. Select "migrateAllPasswords" from function dropdown
    3. Click ▶ Run
    4. Logger output: "Migrated (plain→hash): admin@yourchurch.org"

  VERIFY: Go back to AuthUsers tab:
    - Col B should now be BLANK (plain text cleared)
    - Col C should have a 64-char hex hash
    - Col D should have a 32-char hex salt


── 2.8  DEPLOY AS WEB APP ─────────────────────────────────────────────────────

  1. In the GAS Script Editor, click "Deploy" → "New deployment"
  2. Click the gear icon next to "Select type" → choose "Web app"
  3. Configure:
     ┌────────────────────────┬────────────────────────────────────────┐
     │  Description           │  Flock CRM API v1.0                    │
     │  Execute as            │  Me (your-email@gmail.com)             │
     │  Who has access        │  Anyone                                │
     └────────────────────────┴────────────────────────────────────────┘
  4. Click "Deploy"
  5. Click "Authorize access" → follow prompts
  6. COPY THE DEPLOYMENT URL:

     https://script.google.com/macros/s/AKfycbx.../exec
                                        ^^^^^^^^^^^^^^^^
                                        THIS IS YOUR FLOCK_URL

  ⚠ SAVE THIS URL — you need it for the-vine.js configuration.

  NOTE: "Execute as: Me" means the script runs with YOUR Google account
  permissions. "Who has access: Anyone" means any website can call it
  (required for GitHub Pages to reach it).


── 2.9  TEST HEALTH ENDPOINT ──────────────────────────────────────────────────

  Open a browser and navigate to:

    https://script.google.com/macros/s/AKfycbx.../exec?action=health

  EXPECTED RESPONSE:
    {
      "ok": true,
      "message": "ATOG Church CRM Expansion is running.",
      "version": "1.0.0",
      "modules": { ... }
    }

  If you see this JSON, the FLOCK API is live. ✅


══════════════════════════════════════════════════════════════════════════════════
 PHASE 3 — BACKEND: EXTRA API (Luke)
 "…an orderly account…" — Luke 1:3
══════════════════════════════════════════════════════════════════════════════════


── 3.1  CREATE GOOGLE SHEET ────────────────────────────────────────────────────

  1. Create new Google Sheet, name it: "Flock Statistics"
  2. Copy the SHEET_ID from the URL bar


── 3.2  CREATE GAS PROJECT ─────────────────────────────────────────────────────

  1. Go to script.google.com → New project
  2. Name it: "Flock Statistics API"


── 3.3  ADD FILES & SET PROPERTIES ─────────────────────────────────────────────

  FILES TO ADD:
   1. Code.gs    (entry point — same pattern as FLOCK)
   2. Setup.gs   (paste from expansion/ExtraAPI-setup.gs)

  Code.gs contents:
  ┌─────────────────────────────────────────────────────────────────────┐
  │  function doGet(e) {                                                │
  │    var action = (e && e.parameter) ? e.parameter.action : '';       │
  │    if (action === 'health') {                                       │
  │      return ContentService.createTextOutput(JSON.stringify({        │
  │        ok: true,                                                    │
  │        message: 'Flock Statistics API (EXTRA/Luke) is running.',    │
  │        tabs: { statistics: 3, futureSlots: 50, total: 53 }          │
  │      })).setMimeType(ContentService.MimeType.JSON);                 │
  │    }                                                                │
  │    // Route to statistics handlers here                             │
  │    return ContentService.createTextOutput(JSON.stringify({          │
  │      ok: false, error: 'Unknown action: ' + action                  │
  │    })).setMimeType(ContentService.MimeType.JSON);                   │
  │  }                                                                  │
  └─────────────────────────────────────────────────────────────────────┘

  SCRIPT PROPERTIES:
  ┌──────────────────────┬───────────────────────────────────────────────┐
  │  Property Name       │  Value                                        │
  ├──────────────────────┼───────────────────────────────────────────────┤
  │  SHEET_ID            │  (your "Flock Statistics" sheet ID)           │
  └──────────────────────┴───────────────────────────────────────────────┘


── 3.4  RUN setupExtraApi() ────────────────────────────────────────────────────

  1. Select "Setup" file → "setupExtraApi" function → ▶ Run
  2. Authorize when prompted
  3. Creates 53 tabs:
     - StatisticsConfig (18 columns)
     - StatisticsSnapshots (58 columns: ID + date + period + h1–h50 + meta)
     - StatisticsCustomViews (14 columns)
     - Extra_01 through Extra_50 (50 columns each: c01–c50)


── 3.5  DEPLOY & TEST ─────────────────────────────────────────────────────────

  1. Deploy → New deployment → Web app
     - Execute as: Me
     - Who has access: Anyone
  2. Copy the deployment URL → this is your EXTRA_URL
  3. Test: https://script.google.com/macros/s/.../exec?action=health


══════════════════════════════════════════════════════════════════════════════════
 PHASE 4 — BACKEND: APP API (Matthew)
 "…the book of the genealogy…" — Matthew 1:1
══════════════════════════════════════════════════════════════════════════════════


── 4.1  CREATE GOOGLE SHEET ────────────────────────────────────────────────────

  1. Create new Google Sheet, name it: "Flock Content"
  2. Copy the SHEET_ID


── 4.2  CREATE GAS PROJECT ─────────────────────────────────────────────────────

  1. New GAS project, name it: "Flock Content API"


── 4.3  ADD FILES & RUN SETUP ──────────────────────────────────────────────────

  ✅ Truth.gs — APP API setup script (FlockOS-GS/Truth.gs)
     Contains setupAppApi() which creates all 12 tabs with headers & dropdowns.

  FILES TO ADD:
    1. Truth.gs  → contains setupAppApi(), ensureTab(), addDropdowns()
    2. Code.gs   → doGet(e) entry point, health endpoint, tab reader

  RUN:  setupAppApi()
    Creates 12 tabs (~82 columns total):
    Books (7), Genealogy (8), Counseling (7), Devotionals (7),
    Reading (4), Words (10), Heart (6), Mirror (9),
    Theology (6), Config (2), Quiz (10), Apologetics (11)

  Code.gs provides:
    - doGet(e) entry point
    - ?action=health endpoint
    - ?tab=Books (etc.) read-only tab reader
    - No authentication (public content)
    - Failover-compatible (3 APP_ENDPOINTS in the-vine.js)

  SCRIPT PROPERTIES:
  ┌──────────────────────┬───────────────────────────────────────────────┐
  │  Property Name       │  Value                                        │
  ├──────────────────────┼───────────────────────────────────────────────┤
  │  SHEET_ID            │  (your "Flock Content" sheet ID)              │
  └──────────────────────┴───────────────────────────────────────────────┘

  CONTENT POPULATION:
    Each tab is populated with your church's content data:
    - Books → 66 rows (one per Bible book + metadata)
    - Genealogy → family tree data
    - Devotionals → daily devotional content
    - etc.


── 4.4  DEPLOY & TEST ─────────────────────────────────────────────────────────

  Same deployment pattern as FLOCK:
    Execute as: Me / Who has access: Anyone
  Copy URL → this is your primary APP_ENDPOINTS[0]

  For failover, you can deploy the same project multiple times or
  create duplicate GAS projects pointing to the same sheet.

  Test: https://script.google.com/macros/s/.../exec?action=health


══════════════════════════════════════════════════════════════════════════════════
 PHASE 5 — BACKEND: MISSIONS API (Mark)
 "Go into all the world…" — Mark 16:15
══════════════════════════════════════════════════════════════════════════════════


── 5.1  CREATE GOOGLE SHEET ────────────────────────────────────────────────────

  1. Create new Google Sheet, name it: "Flock Missions"
  2. Copy the SHEET_ID


── 5.2  CREATE GAS PROJECT ─────────────────────────────────────────────────────

  1. New GAS project, name it: "Flock Missions API"


── 5.3  ADD FILES & RUN SETUP ──────────────────────────────────────────────────

  ✅ Gospel.gs — MISSIONS API setup script (FlockOS-GS/Gospel.gs)
     Contains setupMissionsApi() which creates all 56 tabs with headers & dropdowns.

  FILES TO ADD:
    1. Gospel.gs → contains setupMissionsApi(), ensureTab(), addDropdowns()
    2. Code.gs   → doGet(e) entry point, health endpoint, RBAC routing

  RUN:  setupMissionsApi()
    Creates 56 tabs (~462 columns total):
    Structured (8): MissionsRegistry (28), MissionsRegions (24),
      MissionsCities (30), MissionsPartners (20), MissionsPrayerFocus (16),
      MissionsUpdates (16), MissionsTeams (20), MissionsMetrics (20)
    Country Dossiers (48): 6 columns each

  PLANNED TABS (56):
    Structured (8):  MissionsRegistry, MissionsRegions, MissionsCities,
                     MissionsPartners, MissionsPrayerFocus, MissionsUpdates,
                     MissionsTeams, MissionsMetrics
    Country Dossiers (48):  Afghanistan, Algeria, Bangladesh, ...
                            (see 7-FlockOS-References.txt for full list)

  SCRIPT PROPERTIES:
  ┌──────────────────────┬───────────────────────────────────────────────┐
  │  Property Name       │  Value                                        │
  ├──────────────────────┼───────────────────────────────────────────────┤
  │  SHEET_ID            │  (your "Flock Missions" sheet ID)             │
  └──────────────────────┴───────────────────────────────────────────────┘


── 5.4  DEPLOY & TEST ─────────────────────────────────────────────────────────

  Same pattern. Copy URL → this is your MISSIONS_URL.
  Test: https://script.google.com/macros/s/.../exec?action=health


══════════════════════════════════════════════════════════════════════════════════
 PHASE 6 — FRONTEND: STATIC SITE
══════════════════════════════════════════════════════════════════════════════════


── 6.1  REPOSITORY SETUP ──────────────────────────────────────────────────────

  1. Create a GitHub repository (e.g., "flock-os" or your church name)
  2. Clone it locally:
       git clone https://github.com/yourorg/flock-os.git
       cd flock-os

  3. Add .nojekyll to root (disables Jekyll processing):
       touch .nojekyll

  4. (Optional) Add CNAME for custom domain:
       echo "church.yourchurch.org" > CNAME


── 6.2  CONFIGURE the-vine.js (EXACT VALUES) ──────────────────────────────────

  Open scripts/the-vine.js and find the _config block (lines 17-35).
  Fill in your 4 deployment URLs from Phases 2-5:

  ┌─────────────────────────────────────────────────────────────────────┐
  │  const _config = {                                                  │
  │                                                                     │
  │    APP_ENDPOINTS: [                                                 │
  │      'https://script.google.com/macros/s/AKfycby.../exec',          │
  │      'https://script.google.com/macros/s/AKfycbz.../exec',          │
  │      'https://script.google.com/macros/s/AKfycbw.../exec',          │
  │    ],                                                               │
  │                                                                     │
  │    FLOCK_URL:    'https://script.google.com/macros/s/AKfycbx../exec'│
  │    MISSIONS_URL: 'https://script.google.com/macros/s/AKfycbm../exec'│
  │    EXTRA_URL:    'https://script.google.com/macros/s/AKfycbl../exec'│
  │                                                                     │
  │    SESSION_KEY:  'flock_auth_session',     // ← keep default        │
  │    PROFILE_KEY:  'flock_auth_profile',     // ← keep default        │
  │    VAULT_KEY:    'flock_secure_vault',      // ← keep default       │
  │    SESSION_TTL:  6 * 60 * 60 * 1000,       // ← 6 hours, keep       │
  │                                                                     │
  │    TIMEOUT_MS:   12000,                    // ← keep default        │
  │    FAILOVER_PROBE_MS: 4500,                // ← keep default        │
  │  };                                                                 │
  └─────────────────────────────────────────────────────────────────────┘

  ALTERNATIVELY, call configure() at runtime:

    TheVine.configure({
      APP_ENDPOINTS: ['https://...', 'https://...', 'https://...'],
      FLOCK_URL:     'https://...',
      MISSIONS_URL:  'https://...',
      EXTRA_URL:     'https://...',
    });


── 6.3  SITE FOLDER STRUCTURE ─────────────────────────────────────────────────

  RECOMMENDED (from the_cornerstone.js):

  flock-os/
  ├── index.html                    Landing / router page
  ├── .nojekyll                     Disable Jekyll processing
  ├── CNAME                         Custom domain (optional)
  │
  ├── css/
  │   ├── adornment.css             13-theme design system (from 6-FlockOS-AdornmentCSS.txt)
  │   ├── global.css                Design system: variables, reset, typography
  │   └── components.css            Shared UI components: cards, modals, tables
  │
  ├── scripts/
  │   ├── the-vine.js               ALL API calls (1,155 lines)
  │   ├── config.js                 Static configuration constants
  │   ├── Main.js                   App controller & page router
  │   ├── Scripts.js                Script manifest & dynamic loader
  │   ├── Secure.js                 Auth UI (login/logout)
  │   ├── Settings.js               Theme & profile settings
  │   ├── AdminProvision.js         User management UI
  │   ├── MemberPortal.js           Member portal UI
  │   ├── Pastoral.js               Pastoral dashboard UI
  │   ├── PrayerService.js          Prayer management UI
  │   ├── PublicPrayer.js            Public prayer request form
  │   ├── Todo.js                   Task manager UI
  │   ├── Contact.js                Contact log UI
  │   ├── Explorer.js               Bible books explorer
  │   ├── Characters.js             Character genealogy
  │   ├── Bread.js                  Daily devotional
  │   ├── Words.js                  Biblical lexicon
  │   ├── Heart.js                  Heart diagnostic quiz
  │   ├── Mirror.js                 Shepherd's mirror diagnostic
  │   ├── Counseling.js             Counseling wisdom cards
  │   ├── Theology.js               Theology reference
  │   ├── BibleQuiz.js              Bible quiz
  │   ├── Apologetics.js            Apologetics Q&A
  │   ├── Missions.js               Missions directory
  │   ├── Focus.js                  Daily focus country
  │   ├── Worship.js                Worship study
  │   ├── Psalms.js                 Psalms meditation
  │   ├── Family.js                 Family ministry
  │   ├── Invitation.js             Church invitation
  │   ├── Disclaimer.js             Mission/about
  │   ├── Statistics.js             Analytics dashboard
  │   ├── Analysis.js               Analysis tools
  │   ├── Posture.js                Posture/outreach
  │   ├── Outreach.js               Outreach management
  │   └── tbc_care.js               Care ministry
  │
  ├── backend/FlockOS/FlockOS-Scripts/   (NOT git-tracked)
  │   └── the_shofar.js             Song library, chord charts, Music Stand, PDF export
  │
  ├── pages/
  │   ├── public/                   NO LOGIN REQUIRED
  │   │   ├── books.html            P1  Books Explorer
  │   │   ├── characters.html       P2  Character Genealogy
  │   │   ├── counseling.html       P3  Counseling Wisdom
  │   │   ├── bread.html            P4  Daily Bread
  │   │   ├── lexicon.html          P5  Biblical Lexicon
  │   │   ├── heart.html            P6  Heart Diagnostic
  │   │   ├── mirror.html           P7  Shepherd's Mirror
  │   │   ├── theology.html         P8  Theology
  │   │   ├── quiz.html             P9  Bible Quiz
  │   │   ├── apologetics.html      P10 Apologetics
  │   │   ├── missions.html         P11 Missions Directory
  │   │   ├── focus.html            P12 Daily Focus Country
  │   │   ├── prayer-request.html   P13 Prayer Request Form
  │   │   ├── worship.html          P14 Worship Study
  │   │   ├── psalms.html           P15 Psalms Meditation
  │   │   ├── family.html           P16 Family Ministry
  │   │   ├── invitation.html       P17 Church Invitation
  │   │   ├── about.html            P18 Disclaimer/Mission
  │   │   ├── analytics.html        P19 Church Analytics
  │   │   ├── statistics.html       P20 Live Statistics
  │   │   └── card.html             P21 Public Member Card
  │   │
  │   ├── portal/                   LOGIN REQUIRED (volunteer+)
  │   │   ├── dashboard.html        A1  Member Portal
  │   │   ├── directory.html        A2  Member Directory
  │   │   ├── prayer.html           A4  Prayer Management
  │   │   ├── tasks.html            A5  Task Manager
  │   │   └── settings.html         A6  Settings
  │   │
  │   ├── pastoral/                 LOGIN REQUIRED (leader+)
  │   │   ├── members.html          A3  Pastoral Dashboard
  │   │   └── notes.html                Pastoral Notes
  │   │
  │   └── admin/                    LOGIN REQUIRED (admin)
  │       ├── users.html            A7  Admin Provisioning
  │       ├── config.html               App Configuration
  │       └── audit.html                Audit Log
  │
  └── assets/
      ├── icons/                    Lucide icons (CDN) + custom
      ├── images/                   Church photos, backgrounds
      └── fonts/                    Google Fonts (CDN)


── 6.4  CSS / ADORNMENT THEME SYSTEM ──────────────────────────────────────────

  The theme system lives in backend/expansion/6-FlockOS-AdornmentCSS.txt.
  To deploy it:

    1. Copy 6-FlockOS-AdornmentCSS.txt → css/adornment.css (rename to .css)
    2. Add to every HTML page <head>:
         <link rel="stylesheet" href="/css/adornment.css">

  THEMES AVAILABLE (13 + Auto):
    Light:  Dayspring, Meadow, Lavender, Rosewood
    Dark:   Vesper, Evergreen, Twilight, Obsidian
    Flag (Light):  America, Guatemala, Mexico
    Flag (Dark):   Germany, Afghanistan
    Auto:   Uses OS preference (prefers-color-scheme)

  FLAG THEME PALETTES:
    America     — Old Glory Blue accent (#3c3b6e), OG Red highlights,
                  navy ink on light bg. Light mode.
    Guatemala   — Maya Blue accent (#4997d0), white bg, soft green mint.
                  Light mode.
    Mexico      — Verde accent (#006847), Rojo danger/peach, sage-tinted
                  surfaces. Light mode.
    Germany     — Schwarz bg (#14120e), Rot accent (#dd0000), Gold links
                  and warning (#ffcc00). Dark mode.
    Afghanistan — Black bg (#0e100c), Green accent (#007a3d), Red peach/
                  danger (#d32011), gold tertiary. Dark mode.

  Theme switching is handled by fine_linen.js which writes
  a data-theme attribute on <html>.

  THEME PRIORITY CHAIN:
    1. Admin global override (GLOBAL_THEME in AppConfig)
    2. User preference (user.preferences.get)
    3. localStorage
    4. DEFAULT_THEME (dayspring)

  Admin can set a church-wide override via Control Panel → Theme Administration.
  The "Allow Custom Themes" toggle controls whether members can personalize.
  Members pick a personal theme via the Themes module (Growth nav group),
  which includes a swatch grid and the full Interface Studio (fonts, sizes,
  padding, corners, shadows, custom CSS). When Allow Custom Themes is OFF,
  the Themes module shows a locked message and all personal customizations
  are disabled — the admin's foundational theme is enforced for everyone.


── 6.5  SCRIPT LOADING CHAIN ──────────────────────────────────────────────────

  Pages load scripts via a dynamic loader in aos1p.html:

    1. Google Analytics (async, non-blocking)
    2. Inline GTM config
    3. Dynamic loader injects Scripts.js with cache-bust tokens
    4. Scripts.js defines the AOS1P_HEAD_SCRIPTS manifest:

       LOAD ORDER:
         CDN → lucide.js (icons)
               tailwindcss (utility CSS)
               chart.js (charts)
         Core → config.js
                Main.js
         Modules → (30+ feature .js files in sequence)

    5. Scripts.js dynamically loads each script in order
    6. FOOTER: Invitation.js loads after main content

  IMPORTANT: the-vine.js is loaded by Main.js or config.js, NOT directly
  in the manifest. Verify that the-vine.js is included in your load chain.


── 6.6  BUILD PAGES ───────────────────────────────────────────────────────────

  Currently the app runs as a single-page app inside aos1p.html.
  Each "page" is a JS module that renders into a content container.

  CURRENT ARCHITECTURE (single-shell SPA):
    aos1p.html → Scripts.js → Main.js (router) → Feature .js modules

  RECOMMENDED ARCHITECTURE (multi-page for GitHub Pages):
    Each page in the site structure (6.3) loads its own minimal
    script set. the-vine.js + the page's specific .js module.

  For either approach, every authenticated page needs:
    <script src="/scripts/the-vine.js"></script>
    <script>
      TheVine.configure({ FLOCK_URL: '...', /* etc */ });
      TheVine.lifecycle.start();
    </script>


── 6.7  DEPLOY TO GITHUB PAGES ────────────────────────────────────────────────

  1. Push your code:
       git add -A
       git commit -m "FlockOS v1.0 — initial deployment"
       git push origin main

  2. In GitHub → Repository Settings → Pages:
     - Source: "Deploy from a branch"
     - Branch: main  /  (root)
     - Click Save

  3. Wait 1-5 minutes for deployment
  4. Your site is live at: https://yourorg.github.io/flock-os/
     (or your custom domain if CNAME is set)


══════════════════════════════════════════════════════════════════════════════════
 PHASE 7 — DATA MIGRATION
══════════════════════════════════════════════════════════════════════════════════


── 7.1  MIGRATE FROM PASTORAL-SERVER-V2 ────────────────────────────────────────

  The old pastoral-server-v2/ has these files that are NOW SUPERSEDED:
    DeployedAuth.gs  → replaced by expansion/auth.gs
    Pastoral.gs      → replaced by expansion/database.gs
    code.gs          → replaced by expansion entry points
    contacts.gs      → replaced by expansion/database.gs
    members.gs       → replaced by expansion/database.gs
    prayer.gs        → replaced by expansion/database.gs
    setup.gs         → replaced by expansion/setup.gs
    todo.gs          → replaced by expansion/todo.gs

  MIGRATION STEPS:
    1. Open your OLD pastoral Google Sheet
    2. For each tab with data (Members, PrayerRequests, ContactLog,
       PastoralNotes, Milestones, ToDo):
       a. Select all data rows (NOT the header row)
       b. Copy
       c. Open the NEW "Flock CRM" Google Sheet
       d. Go to the corresponding tab
       e. Paste into row 2 (below the header)

  ⚠ COLUMN MAPPING: If the old sheet had fewer columns,
     the new columns will just be blank — that's fine.
     The new ToDo tab has 19 columns (was 15 in old system).
     Old data will fill A-O; new columns J-M (Entity Type,
     Entity ID, Recurring, Recurrence Rule) will be blank.


── 7.2  MIGRATE FROM TODO-SERVER ───────────────────────────────────────────────

  The old todo-server/code.gs was a standalone task manager.
  Its data maps to the new ToDo tab in the FLOCK sheet.

  Simply copy the data rows from the old sheet to the new ToDo tab.
  The old 13-column format maps to columns A-M of the new 19-column layout
  with some reordering needed — check column headers.


── 7.3  MIGRATE PASSWORDS (SALT-PEPPER-HASH) ──────────────────────────────────

  If you have existing users with plain-text or unsalted passwords:

  1. Ensure initPepper() has already run (Step 2.6)
  2. In GAS Script Editor, select "SaltPepperHash" file
  3. Select "migrateAllPasswords" function
  4. Click ▶ Run
  5. Check Logger output:

     EXPECTED OUTPUT:
       Migrated (plain→hash): user1@church.org
       Migrated (plain→hash): user2@church.org
       Migrated (added salt): user3@church.org
       Migration complete: 15 migrated, 0 skipped, 0 errors.

  WHAT IT DOES:
    - Plain-text password in col B → hashed with salt+pepper → col C+D, col B cleared
    - Existing hash in col C but no salt in col D → salt generated → col D populated
    - Already has hash + salt → skipped (already secure)

  Users can keep logging in with their same password — the legacy
  fallback in verifyPasscode() handles all old hash formats.


══════════════════════════════════════════════════════════════════════════════════
 PHASE 8 — POST-DEPLOYMENT VERIFICATION
══════════════════════════════════════════════════════════════════════════════════


── 8.1  HEALTH CHECK ALL 4 APIs ────────────────────────────────────────────────

  Open each URL in a browser with ?action=health:

  ┌─────────────┬─────────────────────────────────────────────────────┐
  │  API        │  URL                                                │
  ├─────────────┼─────────────────────────────────────────────────────┤
  │  FLOCK      │  https://script.google.com/.../exec?action=health   │
  │  EXTRA      │  https://script.google.com/.../exec?action=health   │
  │  APP        │  https://script.google.com/.../exec?action=health   │
  │  MISSIONS   │  https://script.google.com/.../exec?action=health   │
  └─────────────┴─────────────────────────────────────────────────────┘

  Each should return { "ok": true, ... }


── 8.2  END-TO-END TEST MATRIX ─────────────────────────────────────────────────

  Test each action class:

  ┌─────┬──────────────────────────┬─────────┬───────────────────────┐
  │  #  │  Test                    │  API    │  Expected Result      │
  ├─────┼──────────────────────────┼─────────┤───────────────────────┤
  │  1  │  Health check            │  FLOCK  │  { ok: true }         │
  │  2  │  Login (admin)           │  FLOCK  │  { token, profile }   │
  │  3  │  List members            │  FLOCK  │  { rows: [...] }      │
  │  4  │  Create prayer request   │  FLOCK  │  { row: {...} }       │
  │  5  │  Create todo (linked)    │  FLOCK  │  { row: {...} }       │
  │  6  │  My tasks                │  FLOCK  │  { rows: [...] }      │
  │  7  │  Todo for entity         │  FLOCK  │  { rows: [...] }      │
  │  8  │  Complete recurring todo │  FLOCK  │  { row, nextOcc }     │
  │  9  │  Todo dashboard          │  FLOCK  │  { total, byStatus }  │
  │ 10  │  Public book list        │  APP    │  [ ...books ]         │
  │ 11  │  Statistics dashboard    │  EXTRA  │  { ok: true }         │
  │ 12  │  Missions registry       │  FLOCK* │  { rows: [...] }      │
  │ 13  │  Theme preference save   │  FLOCK  │  { ok: true }         │
  │ 14  │  Session logout          │  FLOCK  │  { ok: true }         │
  │ 15  │  Self-register (public)  │  FLOCK  │  { ok, message }      │
  │ 16  │  Forgot password         │  FLOCK  │  { ok, message }      │
  │ 17  │  Reset with code         │  FLOCK  │  { ok, message }      │
  │ 18  │  List pending users      │  FLOCK  │  { rows: [...] }      │
  │ 19  │  Approve pending user    │  FLOCK  │  { ok, message }      │
  │ 20  │  Deny pending user       │  FLOCK  │  { ok, message }      │
  │ 21  │  Change own passcode     │  FLOCK  │  { ok, message }      │
  └─────┴──────────────────────────┴─────────┴───────────────────────┘

  * Missions routes are in FLOCK until MISSIONS API is separated.

  REGISTRATION & APPROVAL WORKFLOW:
    1. Set AppConfig ALLOW_SELF_REGISTER = TRUE
    2. User calls auth.register → status='pending', AccessControl.Active='FALSE'
    3. Admin email notified (if ADMIN_EMAIL set in AppConfig)
    4. Pastor/admin calls users.pending → sees pending list
    5. Pastor/admin calls users.approve (with optional role override) → active
    6. User receives approval email, can now log in

  FORGOT PASSWORD WORKFLOW:
    1. User calls auth.forgotPassword with email
    2. 6-digit reset code emailed (1-hour TTL, stored in Script Properties)
    3. User calls auth.resetWithToken with email + resetCode + newPasscode
    4. Password updated via salt+pepper scheme, token consumed


── 8.3  RBAC VERIFICATION ─────────────────────────────────────────────────────

  Test with accounts at each role level:

  ┌─────────────┬──────────────────────────────────────────────────────┐
  │  Role       │  Should Be Able To                                   │
  ├─────────────┼──────────────────────────────────────────────────────┤
  │  (none)     │  Register, forgot password, reset with code          │
  │  readonly   │  View own profile, submit prayer requests            │
  │  volunteer  │  + Create/view own tasks, view non-confidential data │
  │  leader     │  + View all tasks, view all members, manage groups   │
  │  pastor     │  + View pending users, approve/deny registrations    │
  │  admin      │  + User management, config, audit, bulk operations   │
  └─────────────┴──────────────────────────────────────────────────────┘


── 8.4  CROSS-API DATA FLOW TEST ──────────────────────────────────────────────

  1. Create a member in FLOCK → note the Member ID
  2. Create a prayer request linked to that member → note the PR ID
  3. Create a task linked to that prayer request:
       action=todo.create
       title=Follow up on prayer
       entityType=PrayerRequests
       entityId=[PR ID from step 2]
  4. Verify: action=todo.forEntity&entityType=PrayerRequests&entityId=[PR ID]
     Should return the task from step 3.


══════════════════════════════════════════════════════════════════════════════════
 PHASE 9 — LINK ARCHITECTURE & SITE MAP
══════════════════════════════════════════════════════════════════════════════════


── 9.1  COMPLETE URL MAP ──────────────────────────────────────────────────────

  ROUTE                  PAGE FILE                    AUTH    DATA SOURCE
  ─────────────────────  ──────────────────────────   ──────  ────────────────
  /                      index.html                   None    —
  /books                 pages/public/books.html      None    APP: tab=Books
  /characters            pages/public/characters.html None    APP: tab=Genealogy
  /counseling            pages/public/counseling.html None    APP: tab=Counseling
  /bread                 pages/public/bread.html      None    APP: Devotionals+Reading+Words
  /lexicon               pages/public/lexicon.html    None    APP: tab=Words
  /heart                 pages/public/heart.html      None    APP: tab=Heart
  /mirror                pages/public/mirror.html     None    APP: tab=Mirror
  /theology              pages/public/theology.html   None    FLOCK: theology.*
  /quiz                  pages/public/quiz.html       None    APP: tab=Quiz
  /apologetics           pages/public/apologetics.html None   APP: tab=Apologetics
  /missions              pages/public/missions.html   None    MISSIONS: registry.*
  /focus                 pages/public/focus.html      None    MISSIONS: countries
  /prayer-request        pages/public/prayer-request  None    Google Forms / FLOCK
  /worship               pages/public/worship.html    None    (hardcoded)
  /psalms                pages/public/psalms.html     None    (hardcoded)
  /family                pages/public/family.html     None    (hardcoded)
  /invitation            pages/public/invitation.html None    (hardcoded)
  /about                 pages/public/about.html      None    (hardcoded)
  /analytics             pages/public/analytics.html  None    (hardcoded)
  /statistics            pages/public/statistics.html None    (hardcoded)
  /card?m=ATOG-xxxx      pages/public/card.html       None    FLOCK: memberCards.public

  /portal                pages/portal/dashboard.html  Auth    FLOCK: members, prayer, todo
  /directory             pages/portal/directory.html  Auth    FLOCK: memberCards.directory
  /prayer/manage         pages/portal/prayer.html     Auth    FLOCK: prayer.*
  /tasks                 pages/portal/tasks.html      Auth    FLOCK: todo.*
  /settings              pages/portal/settings.html   Auth    FLOCK: user.preferences.*

  /pastoral              pages/pastoral/members.html  Leader  FLOCK: members.list
  /pastoral/notes        pages/pastoral/notes.html    Pastor  FLOCK: notes.*

  /admin                 pages/admin/users.html       Admin   FLOCK: users.*, auth.*
  /admin/config          pages/admin/config.html      Admin   FLOCK: config.*
  /admin/audit           pages/admin/audit.html       Admin   FLOCK: audit logs


── 9.2  PAGE-TO-API MAPPING ───────────────────────────────────────────────────

  ┌──────────────────┬───────────┬─────────────────────────────────────┐
  │  Page            │  API      │  Actions Called                     │
  ├──────────────────┼───────────┼─────────────────────────────────────┤
  │  Books           │  APP      │  tab=Books                          │
  │  Characters      │  APP      │  tab=Genealogy                      │
  │  Counseling      │  APP      │  tab=Counseling                     │
  │  Daily Bread     │  APP      │  tab=Devotionals, Reading, Words    │
  │  Lexicon         │  APP      │  tab=Words                          │
  │  Heart           │  APP      │  tab=Heart                          │
  │  Mirror          │  APP      │  tab=Mirror                         │
  │  Theology        │  FLOCK    │  theology.categories.list           │
  │                  │           │  theology.sections.list             │
  │                  │           │  theology.full                      │
  │  Quiz            │  APP      │  tab=Quiz                           │
  │  Apologetics     │  APP      │  tab=Apologetics                    │
  │  Missions        │  FLOCK*   │  missions.registry.list             │
  │  Focus           │  FLOCK*   │  missions.prayerFocus.list          │
  │  Prayer Form     │  FLOCK    │  prayer.publicSubmit                │
  │  Member Card     │  FLOCK    │  memberCards.public                 │
  │  Statistics      │  EXTRA    │  statistics.dashboard               │
  │                  │           │                                     │
  │  Portal          │  FLOCK    │  members.search, prayer.list,       │
  │                  │           │  todo.myTasks                       │
  │  Directory       │  FLOCK    │  memberCards.directory              │
  │  Prayer Manage   │  FLOCK    │  prayer.list, prayer.update         │
  │  Tasks           │  FLOCK    │  todo.list, todo.create,            │
  │                  │           │  todo.update, todo.complete,        │
  │                  │           │  todo.forEntity, todo.myTasks,      │
  │                  │           │  todo.overdue, todo.dashboard       │
  │  Settings        │  FLOCK    │  user.preferences.get/update        │
  │                  │           │                                     │
  │  Pastoral        │  FLOCK    │  members.list, notes.*              │
  │  Admin           │  FLOCK    │  users.*, auth.*, config.*          │
  └──────────────────┴───────────┴─────────────────────────────────────┘

  * Missions routes currently in FLOCK API; will move to MISSIONS when built.


── 9.3  NAVIGATION STRUCTURE ──────────────────────────────────────────────────

  TOP-LEVEL NAVIGATION:

    EXPLORE (public)
    ├── Books Explorer
    ├── Character Genealogy
    ├── Biblical Lexicon
    ├── Counseling Wisdom
    └── Apologetics

    GROW (public)
    ├── Daily Bread
    ├── Heart Diagnostic
    ├── Shepherd's Mirror
    ├── Bible Quiz
    └── Theology

    WORSHIP (public)
    ├── Worship Study
    ├── Psalms Meditation
    └── Family Ministry

    REACH (public)
    ├── Missions Directory
    ├── Daily Focus Country
    ├── Prayer Request
    ├── Church Invitation
    └── Live Statistics

    MY PORTAL (auth required)
    ├── Dashboard
    ├── Prayer Management
    ├── My Tasks
    ├── Member Directory
    └── Settings

    PASTORAL (leader+)
    ├── Member Dashboard
    └── Pastoral Notes

    ADMIN (admin only)
    ├── User Management
    ├── App Configuration
    └── Audit Log

  MEMBER CARD:
    /card?m=ATOG-xxxx → public, no auth


── 9.4  FEATURE INVENTORY (P1-P21, A1-A7, F1-F25) ────────────────────────────

  PUBLIC FEATURES (no login required):
  ──────────────────────────────────────
  P1   Books Explorer          APP: tab=Books
  P2   Character Genealogy     APP: tab=Genealogy
  P3   Counseling Wisdom       APP: tab=Counseling
  P4   Daily Bread             APP: Devotionals + Reading + Words
  P5   Biblical Lexicon        APP: tab=Words
  P6   Heart Diagnostic        APP: tab=Heart
  P7   Shepherd's Mirror       APP: tab=Mirror
  P8   Theology                FLOCK: theology.*
  P9   Bible Quiz              APP: tab=Quiz
  P10  Apologetics             APP: tab=Apologetics
  P11  Missions Directory      MISSIONS: registry, countries
  P12  Daily Focus Country     MISSIONS: rotating country dossier
  P13  Prayer Request Form     FLOCK: prayer.publicSubmit
  P14  Worship Study           (hardcoded content)
  P15  Psalms Meditation       (hardcoded content)
  P16  Family Ministry         (hardcoded content)
  P17  Church Invitation       (hardcoded content)
  P18  Disclaimer/Mission      (hardcoded content)
  P19  Church Analytics        (hardcoded charts)
  P20  Live Statistics         (hardcoded counters)
  P21  Member Card (public)    FLOCK: memberCards.public

  AUTHENTICATED FEATURES (login required):
  ──────────────────────────────────────────
  A1   Member Portal           FLOCK: members, prayer, todo
  A2   Member Directory        FLOCK: memberCards.directory
  A3   Pastoral Dashboard      FLOCK: members.list (leader+)
  A4   Prayer Management       FLOCK: prayer.* (volunteer+)
  A5   Task Manager            FLOCK: todo.* (volunteer+)
  A6   Settings                FLOCK: user.preferences
  A7   Admin Provisioning      FLOCK: users.*, auth.*, config.* (admin)

  EXPANSION MODULES (tabs + API built, frontend TBD):
  ────────────────────────────────────────────────────
  F1   Attendance Tracking     FLOCK: attendance.*
  F2   Events & RSVPs          FLOCK: events.*
  F3   Small Groups            FLOCK: groups.*
  F4   Giving / Finance        FLOCK: giving.*
  F5   Volunteer Scheduling    FLOCK: volunteers.*
  F6   Communications Hub      FLOCK: comms.*
       — Card-based Inbox/Sent with avatar initials, time-ago dates,
         unread indicators, subject preview, and body excerpt
       — Full message detail view with read receipts on open
       — Reply with quoted original (styled blockquote), Forward, SMS
       — Custom modal submit labels ("Send Message", "Send Reply", etc.)
       — Delete with confirmation dialog
  F7   Check-In Sessions       FLOCK: checkin.*
  F8   Ministry Teams          FLOCK: ministries.*
  F9   Service Planning        FLOCK: servicePlans.*
  F10  Spiritual Care          FLOCK: care.*
  F11  Outreach                FLOCK: outreach.*
  F12  Photos & Albums         FLOCK: photos.*, albums.*
  F13  Sermons & Preaching     FLOCK: sermons.*
  F14  Compassion              FLOCK: compassion.*
  F15  Discipleship            FLOCK: discipleship.*
  F16  Learning Center         FLOCK: learning.*
  F17  Statistics Dashboard    EXTRA: statistics.*
  F18  Multi-Church            FLOCK: church.*
  F19  Bulk Import/Export      FLOCK: bulk.*
  F20  Music Stand Frontend    FlockOS-Scripts/the_shofar.js
       — Song library: searchable song list, song CRUD, arrangement CRUD
       — ChordPro rendering: [Chord]lyric → chords-above-lyrics display
       — Music Stand view: load service plan, navigate songs, chord charts
       — PDF export: single arrangement or full setlist via jsPDF
       — Entry: window.openMusicStandApp(), CSS prefix: ms-
       — API: Songs & Music Stand (15 actions) via FLOCK endpoint
  F21  Notification Bell        the_good_shepherd.html
       — Topbar bell icon with unread count badge and dot indicator
       — Dropdown panel: subject, body preview, time-ago per notification
       — Dismiss individual or mark all read
       — 30-second unread count polling via comms.notifications.unreadCount
       — Click-to-navigate routing: 20+ type/category→module view mappings
       — Message notifications open specific message detail view
       — Mobile: full-width panel at ≤600px, condensed topbar at ≤768px
  F22  Daily Bread (Unified)    the_tabernacle.js
       — Single-card date navigation: prev/next arrows, date picker, Today button
       — Hero header with gradient, title, date, theme pill
       — Colorful section cards: Scripture (gold), Reflection (accent),
         Reflect (mint), Prayer Focus (lilac), Daily Reading (peach)
       — Reading plan as vertical grid (OT/NT/Ps/Pr) with bible.com ESV links
       — Inline journal entry (members only): title, mood, save to journal API
       — Prayer request form: name, text, category, confidential, submit (skipAuth)
       — Devotionals + reading plan fetched in parallel via Promise.all
  F23  Theme Picker            the_tabernacle.js + fine_linen.js
       — Church Theme: admin global override dropdown + color swatch preview
       — My Theme: personal clickable swatch grid, instant apply
       — Priority chain: admin global → user preference → localStorage → default
       — THEME_META object with label/bg/accent/mode for all 8 themes
       — Admin override dims personal picker with warning message
  F24  Branding Rename          All files
       — "Flock OS" → "FlockOS" across all 12+ files (titles, headers,
         comments, product strings, email fallbacks, git commit messages)
  F25  Login Return Home        the_wall.html
       — "Return Home" link on login screen below forgot/register links
       — Links back to public homepage (index.html)
  F26  Dual Font Scale          the_tabernacle.js
       — Separate desktop and mobile font-size percentage sliders in Control Panel
       — IIFE uses matchMedia('(max-width: 768px)') to apply correct scale
       — Persisted: localStorage (flock_font_scale / flock_font_scale_mobile)
         + backend AppConfig (FONT_SCALE / FONT_SCALE_MOBILE)
  F27  Interface Studio         the_tabernacle.js + fine_linen.js
       — Themes module → Interface Studio (accessible to all users,
         respects ALLOW_CUSTOM_THEMES admin toggle) — 5 accordion panels
       — 6A Fonts: body + heading font picker (18 Google Fonts + Default)
       — 6B Font Sizes: 9 groups, 32 range sliders covering every text element
         Page & Headings (5), Navigation (3), Cards (3), Tables (2),
         Buttons & Pills (4), Forms (2), Modals & Alerts (3),
         Empty States & Misc (6), Browse Cards (4)
       — 6C Padding & Spacing: 6 groups, 12 sliders including V/H split pairs
         Cards & Containers (4), Buttons & Pills (4), Navigation (2),
         Tables (2), Forms (2), Modals (1)
       — 6D Corners & Shadows: 3 radius sliders (--radius-sm/md/lg) +
         shadow intensity dropdown (None/Subtle/Light/Medium/Heavy)
       — 6E Custom CSS: monospace textarea, injected last, overrides all
       — Live preview: every slider/dropdown fires _studioPreview() which
         collects all values and calls Adornment.applyOverrides()
       — Save All: persists JSON to localStorage + backend AppConfig
       — Reset to Defaults: clears all overrides (local + backend)
       — Restore Visuals to Default: reverts unsaved changes to last saved
       — Override mechanism: applyOverrides() injects <style id="adornment-overrides">
       — Init: loadOverrides() called on page load to re-apply saved state
       — Full control reference: Config.txt → INTERFACE STUDIO CONTROL REFERENCE
  F28  Provisioning              the_tabernacle.js + the_true_vine.js
       — Control Panel → Provisioning (admin only)
       — Multi-endpoint load balancing: 4 APIs × 3 tiers = 12 URL fields
         DOM IDs: prov-{API}-{0|1|2}  (e.g., prov-FLOCK-0, prov-APP-2)
         Config keys: FLOCK_ENDPOINTS[3], APP_ENDPOINTS[3],
           MISSIONS_ENDPOINTS[3], EXTRA_ENDPOINTS[3]
       — 4 tier toggles:
         Primary App Scripts:  ON/OFF  (default ON)   prov-TIER_PRIMARY
         Secondary App Scripts: ON/OFF (default OFF)  prov-TIER_SECONDARY
         Tertiary App Scripts: ON/OFF  (default OFF)  prov-TIER_TERTIARY
         Randomization of GAS: ON/OFF  (default OFF)  prov-RANDOMIZE
       — _resolveUrl(key): builds pool from enabled tiers, picks randomly
         or first depending on RANDOMIZE toggle
       — _appTab(): same pool, sequential failover on error
       — Save Provisioning: writes 12 URLs + 4 toggles to localStorage
         + backend AppConfig
       — Test All Endpoints: sends ?action=health to each URL
       — Auto-load: _loadProvisioning() runs on init, calls
         TheVine.configure() so saved URLs override hardcoded defaults
       — Persistence: localStorage "flock_provisioning" + AppConfig
         "PROVISIONING_URLS" (JSON, category: System)
       — Full reference: Config.txt → PROVISIONING REFERENCE


══════════════════════════════════════════════════════════════════════════════════
 PHASE 10 — MASTER TROUBLESHOOTING GUIDE
══════════════════════════════════════════════════════════════════════════════════


── 10.1  API RETURNS "Unknown action" ──────────────────────────────────────────

  SYMPTOM:  { "ok": false, "error": "Unknown action: todo.list" }

  CAUSE:  The routing layer in api.gs doesn't recognize the action.

  FIX:
    1. Verify the action is spelled correctly (case-sensitive)
    2. Check api.gs — does it have an `if (action === 'todo.list')` line?
    3. If the route exists but still fails, check the integration block:
       - If using Code.gs as entry point, the action prefix must be listed
         in the integration comment block at the bottom of api.gs
       - Make sure `action.startsWith('todo.')` is in the routing chain
    4. Re-deploy the Web App after adding routes (Deploy → Manage → pencil icon)

  COMMON MISTAKE: Forgetting to re-deploy after code changes.
  Apps Script caches the DEPLOYED version — editing code alone doesn't update it.
  You MUST create a new deployment version or update the existing one.


── 10.2  CORS / CROSS-ORIGIN ERRORS ───────────────────────────────────────────

  SYMPTOM:  Console shows "Access-Control-Allow-Origin" errors

  CAUSE:  Google Apps Script deployment misconfiguration.

  FIX:
    1. Verify deployment is set to "Who has access: Anyone"
       (not "Anyone with Google account" or "Only myself")
    2. Verify deployment is set to "Execute as: Me"
    3. Calls must use the /exec URL, NOT /dev URL
    4. If using POST, the request body should be JSON stringified
       in the `e.postData.contents` parameter
    5. Try the URL directly in a browser — if it returns JSON, CORS is fine
    6. GitHub Pages uses HTTPS — your GAS URL must also be HTTPS (it always is)

  NOTE: GAS Web Apps automatically handle CORS when deployed with
  "Anyone" access. You do NOT need to add CORS headers manually.


── 10.3  "Access denied" / 403 ────────────────────────────────────────────────

  SYMPTOM:  { "ok": false, "error": "Access denied." }

  CAUSE:  The user's RBAC role is too low for the requested action.

  FIX:
    1. Check the user's role in AuthUsers tab (column G)
    2. Check the user's role in AccessControl tab (column B)
    3. Verify the action's required role:
       - todo.list → volunteer+
       - todo.delete → leader+
       - todo.dashboard → leader+
       - members.list → leader+
       - config.* → admin
    4. New registration/approval routes:
       - users.pending → pastor+
       - users.approve → pastor+
       - users.deny → pastor+
    5. If the role is correct but still failing, check if the session token
       has expired (default: 6 hours). User needs to re-login.
    6. Check AuthUsers.Status — must be "active" (not "inactive", "suspended", or "pending")


── 10.4  SESSION EXPIRED / LOGIN LOOP ─────────────────────────────────────────

  SYMPTOM:  User keeps getting redirected to login, or token is rejected.

  CAUSE:  Session token expired or was cleared.

  FIX:
    1. Sessions last 6 hours (configurable in AppConfig: SESSION_TTL_HOURS)
    2. Sessions are stored in GAS Script Properties with prefix "exp.session."
    3. If Script Properties are getting full, old sessions may have been cleared
    4. Check browser sessionStorage:
       - Key: "flock_auth_session" should contain a token
       - Key: "flock_auth_profile" should contain user profile JSON
    5. If stuck, clear sessionStorage and re-login:
         sessionStorage.removeItem('flock_auth_session');
         sessionStorage.removeItem('flock_auth_profile');
    6. To increase session TTL, edit AppConfig tab:
       Key=SESSION_TTL_HOURS, Value=12 (or desired hours)

  SCRIPT PROPERTY CLEANUP:
    Google Script Properties have a 500KB total limit.
    Old sessions are cleaned up on login, but if many concurrent users
    login without logging out, properties can accumulate.
    To manually clean: Run the session cleanup function in auth.gs.


── 10.5  setupExpansion() FAILS ────────────────────────────────────────────────

  SYMPTOM:  Setup function errors out partway through.

  COMMON CAUSES:

  a) "You do not have permission to call SpreadsheetApp"
     FIX: You haven't authorized yet. Re-run and click through the
     authorization prompts. Choose your account → Advanced → Allow.

  b) "Spreadsheet not found"
     FIX: SHEET_ID in Script Properties is wrong or missing.
     Go to ⚙ Project Settings → verify SHEET_ID is set and matches
     the sheet URL.

  c) "Exceeded maximum execution time"
     FIX: Google imposes a 6-minute execution limit for GAS.
     The setup creates 79 tabs which may hit this limit.
     Solution: Split the setup into batches or run it again —
     ensureTab() skips existing tabs, so it's safe to re-run.

  d) "Service Spreadsheets failed while accessing document"
     FIX: The Google Sheet may be in a different Google account.
     Verify you're logged into the correct Google account in the
     Script Editor. The sheet must be owned by or shared with the
     account running the script.


── 10.6  TABS NOT CREATED / MISSING COLUMNS ────────────────────────────────────

  SYMPTOM:  Some tabs are missing, or have wrong columns after setup.

  FIX:
    1. ensureTab() only creates tabs that DON'T already exist
    2. If a tab exists but has wrong columns, you must manually
       delete the tab first, then re-run setupExpansion()
    3. Dropdowns are applied after tab creation — if the tab existed
       before setup ran, dropdowns may be missing. Delete and re-create.
    4. Check the Logger output for any "skipped" or "error" messages


── 10.7  PASSWORD HASHING ISSUES ──────────────────────────────────────────────

  SYMPTOM:  User can't log in after migration / password change.

  FIX:
    1. Check AuthUsers for the user's row:
       - Col B (Passcode): should be BLANK after migration
       - Col C (Passcode Hash): should be 64-char hex string
       - Col D (Salt): should be 32-char hex string
    2. If col B still has plain text, migrateAllPasswords() didn't process it
       → Run migrateAllPasswords() again
    3. If col C has a hash but col D is empty, the legacy fallback should
       still work — but run migrateAllPasswords() to add a salt
    4. If nothing works, manually reset the password:
       In GAS Script Editor, run:
         setSecurePassword('user@email.com', 'newPassword123')
    5. Verify the pepper exists: check Script Properties for FLOCK_AUTH_PEPPER


── 10.8  PEPPER LOST ──────────────────────────────────────────────────────────

  SYMPTOM:  FLOCK_AUTH_PEPPER was deleted from Script Properties.

  IMPACT:  ALL existing password hashes are now unverifiable.
  The primary hash formula is SHA-256(pepper + salt + passcode).
  Without the pepper, the formula can't reproduce the same hash.

  RECOVERY OPTIONS:
    a) If you have a backup of Script Properties → restore the pepper value
    b) If not → ALL users must have their passwords reset:
       1. Run initPepper() (creates a new pepper)
       2. For each user, have them "forgot password" or manually run
          setSecurePassword() for each email

  PREVENTION: After running initPepper(), write down the pepper value
  and store it in a secure, offline location (e.g., password manager,
  printed in a sealed envelope in a safe).

  TO VIEW PEPPER VALUE:
    In GAS Script Editor, run this in any .gs file:
      function showPepper() {
        Logger.log(PropertiesService.getScriptProperties().getProperty('FLOCK_AUTH_PEPPER'));
      }
    Check View → Logs for the value. Record it securely. Delete this function.


── 10.9  the-vine.js FAILOVER NOT WORKING ─────────────────────────────────────

  SYMPTOM:  APP API calls fail even though backup endpoints exist.

  HOW FAILOVER WORKS:
    the-vine.js tries APP_ENDPOINTS[0] first with a 4500ms probe timeout.
    If it fails, tries [1], then [2]. If all fail, throws an error.

  FIX:
    1. Verify all 3 APP_ENDPOINTS URLs are correct and deployed
    2. Each URL must be independently deployable (separate GAS projects
       or same project with multiple deployments)
    3. The FAILOVER_PROBE_MS (4500ms) may be too short for cold-start GAS.
       Google Apps Script can take 3-8 seconds on cold start.
       Consider increasing to 8000ms:
         TheVine.configure({ FAILOVER_PROBE_MS: 8000 });
    4. Only the APP API has failover. FLOCK, MISSIONS, EXTRA use single URLs.


── 10.10  GOOGLE APPS SCRIPT QUOTAS ───────────────────────────────────────────

  KEY LIMITS (free tier / Google Workspace):

  ┌────────────────────────────────┬──────────┬─────────────────────────┐
  │  Resource                      │  Limit   │  Impact                 │
  ├────────────────────────────────┼──────────┼─────────────────────────┤
  │  Script runtime                │  6 min   │  Long setup may timeout │
  │  Triggers total runtime/day    │  90 min  │  Scheduled tasks        │
  │  URL Fetch calls/day           │  20,000  │  External API calls     │
  │  Script Properties total size  │  500 KB  │  Session storage limit  │
  │  Spreadsheet cells             │  10M     │  200 tabs × data rows   │
  │  Concurrent executions         │  30      │  Busy church hours      │
  │  Properties read/write per run │  unlimited│  No per-call limit     │
  │  Content size (response)       │  50 MB   │  Large data exports     │
  └────────────────────────────────┴──────────┴─────────────────────────┘

  SESSION STORAGE WARNING:
    Each login creates an "exp.session.*" entry in Script Properties.
    With 500KB limit and ~200 bytes per session, you can store ~2,500
    concurrent sessions. Orphaned sessions are cleaned up on login,
    but very high traffic could hit this limit.


── 10.11  GITHUB PAGES 404 ────────────────────────────────────────────────────

  SYMPTOM:  Pages return 404 on GitHub Pages.

  FIX:
    1. Verify GitHub Pages is enabled: Repository → Settings → Pages
    2. Check the branch and folder are correct (usually main / root)
    3. File names are case-sensitive on GitHub Pages
       "Pages/Books.html" ≠ "pages/books.html"
    4. If using a custom domain, verify CNAME file is in the root
    5. Add a 404.html for graceful error handling
    6. Add .nojekyll to root if you have folders/files starting with "_"
    7. After pushing, wait 1-5 minutes for deployment to propagate
    8. Check Actions tab in GitHub for deployment status/errors


── 10.12  STALE CACHE / OLD DATA ──────────────────────────────────────────────

  SYMPTOM:  Frontend shows old data even after updating the spreadsheet.

  CAUSE:  the-vine.js Root System has a caching layer with TTL.

  FIX:
    1. Each grove has per-key TTL (time-to-live):
       - Members: 120 seconds
       - Prayer: 60 seconds
       - Tasks: 30 seconds
       Wait for the TTL to expire, or:
    2. Force refresh a grove:
         const g = TheVine.groves.pastoral();
         g.refreshAll();  // immediately fetches fresh data
    3. Clear all cache:
         TheVine.cache.invalidate();  // clears everything
    4. For development, reduce TTLs:
         TheVine.configure({ /* no cache config */ });
         // Or modify grove definitions in the-vine.js


── 10.13  PHOTOS / SERMONS UPLOAD FAILS ────────────────────────────────────────

  SYMPTOM:  Upload fails or returns error.

  FIX:
    1. Check AppConfig keys:
       - PHOTO_DRIVE_FOLDER_ID — if blank, auto-creates a folder
       - PHOTO_MAX_SIZE_MB — default 10, hard cap 25
       - SERMON_DRIVE_FOLDER_ID — if blank, auto-creates
       - SERMON_MAX_SIZE_MB — default 50, hard cap 100
    2. The GAS account must have Google Drive access
    3. Files are stored as base64 in the POST body — very large files
       may exceed GAS's 50MB response limit or POST body limit
    4. Google Drive storage quota may be full


── 10.14  MEMBER CARDS NOT LOADING ─────────────────────────────────────────────

  SYMPTOM:  /card?m=ATOG-xxxx shows empty or error.

  FIX:
    1. Verify the member number exists in MemberCards tab (column D)
    2. Member card must have Status = "active" (column L)
    3. The memberCards.public action requires NO auth — if it's returning
       "Access denied", check that the route isn't behind a requireRole() call
    4. Member number format is case-sensitive: "ATOG-0001" ≠ "atog-0001"


── 10.15  STATISTICS DASHBOARD EMPTY ───────────────────────────────────────────

  SYMPTOM:  Statistics page shows no data.

  FIX:
    1. Statistics require configuration in StatisticsConfig tab
       Each row defines one metric: source tab, column, calculation type
    2. If StatisticsConfig is empty, no metrics are computed
    3. Snapshots are created by running statistics.compute action
    4. The EXTRA API must be deployed and its URL set in the-vine.js
    5. Check that EXTRA_URL is correct in the-vine.js _config


── 10.16  SELF-REGISTRATION NOT WORKING ────────────────────────────────────────

  SYMPTOM:  auth.register returns error or user never becomes active.

  FIX:
    1. Check AppConfig: ALLOW_SELF_REGISTER must be "TRUE" (string, not boolean)
       If set to FALSE, registration returns an error.
    2. After registration, the user's status is "pending" and
       AccessControl.Active is "FALSE" — they CANNOT log in yet.
    3. A pastor+ or admin must call users.pending to see the queue,
       then users.approve to activate the account.
    4. If ADMIN_EMAIL is set in AppConfig, a notification email is
       sent via GmailApp to alert the admin of the pending registration.
       If no email arrives, check GmailApp daily send quota (100/day free).
    5. After approval, the user receives an email notification and can log in.
    6. If users.approve fails, check that the approving user has role pastor+.


── 10.17  PASSWORD RESET CODE NOT ARRIVING ─────────────────────────────────────

  SYMPTOM:  User calls auth.forgotPassword but never receives the email.

  FIX:
    1. Verify the email address exists in AuthUsers (exact match, case-insensitive)
    2. Reset codes are sent via GmailApp from the GAS account owner's email.
       Check GmailApp daily send quota (100/day for free accounts).
    3. The code is a 6-digit number with a 1-hour TTL, stored in
       Script Properties with prefix "exp.reset."
    4. After 1 hour the code expires — the user must request a new one.
    5. Each new forgotPassword call replaces the previous code.
    6. If the user enters the wrong code 3+ times, consider rate-limiting
       (not yet implemented — manual monitoring via AuthAudit tab).
    7. After successful reset (auth.resetWithToken), the token is consumed
       and the password is updated using the salt+pepper scheme.


══════════════════════════════════════════════════════════════════════════════════
 APPENDIX A — ALL SCRIPT PROPERTIES (Every API)
══════════════════════════════════════════════════════════════════════════════════

  ─── FLOCK API (John) ─────────────────────────────────────────────────────

  ┌──────────────────────┬──────────┬──────────────────────────────────────┐
  │  Property Key        │  Set By  │  Value / Format                      │
  ├──────────────────────┼──────────┼──────────────────────────────────────┤
  │  SHEET_ID            │  Manual  │  Google Sheet ID string              │
  │  FLOCK_AUTH_PEPPER   │  Auto    │  64-char hex (via initPepper())      │
  │  exp.session.*       │  Auto    │  JSON session objects (many keys)    │
  └──────────────────────┴──────────┴──────────────────────────────────────┘

  Total Manual Properties: 1 (SHEET_ID)
  Total Auto Properties: 1 per login session + 1 pepper

  ─── EXTRA API (Luke) ─────────────────────────────────────────────────────

  ┌──────────────────────┬──────────┬──────────────────────────────────────┐
  │  Property Key        │  Set By  │  Value / Format                      │
  ├──────────────────────┼──────────┼──────────────────────────────────────┤
  │  SHEET_ID            │  Manual  │  Google Sheet ID string              │
  └──────────────────────┴──────────┴──────────────────────────────────────┘

  ─── APP API (Matthew) ────────────────────────────────────────────────────

  ┌──────────────────────┬──────────┬──────────────────────────────────────┐
  │  Property Key        │  Set By  │  Value / Format                      │
  ├──────────────────────┼──────────┼──────────────────────────────────────┤
  │  SHEET_ID            │  Manual  │  Google Sheet ID string              │
  └──────────────────────┴──────────┴──────────────────────────────────────┘

  ─── MISSIONS API (Mark) ──────────────────────────────────────────────────

  ┌──────────────────────┬──────────┬──────────────────────────────────────┐
  │  Property Key        │  Set By  │  Value / Format                      │
  ├──────────────────────┼──────────┼──────────────────────────────────────┤
  │  SHEET_ID            │  Manual  │  Google Sheet ID string              │
  └──────────────────────┴──────────┴──────────────────────────────────────┘


══════════════════════════════════════════════════════════════════════════════════
 APPENDIX B — ALL APPCONFIG DEFAULTS (32 Keys)
══════════════════════════════════════════════════════════════════════════════════

  These are seeded by setupExpansion() into the AppConfig tab.
  Edit values directly in the Google Sheet. Changes take effect immediately.

  ┌──────────────────────────────┬──────────────────────┬────────────────┐
  │  Key                         │  Default Value       │  Category      │
  ├──────────────────────────────┼──────────────────────┼────────────────┤
  │  CHURCH_NAME                 │  (blank)             │  General       │
  │  CHURCH_TIMEZONE             │  America/New_York    │  General       │
  │  PHOTO_DRIVE_FOLDER_ID       │  (blank)             │  General       │
  │  PHOTO_MAX_SIZE_MB           │  10                  │  General       │
  │  SERMON_DRIVE_FOLDER_ID      │  (blank)             │  General       │
  │  SERMON_MAX_SIZE_MB          │  50                  │  General       │
  ├──────────────────────────────┼──────────────────────┼────────────────┤
  │  SESSION_TTL_HOURS           │  6                   │  Auth          │
  │  MIN_PASSCODE_LENGTH         │  6                   │  Auth          │
  │  ALLOW_SELF_REGISTER         │  FALSE               │  Auth          │
  │  ADMIN_EMAIL                 │  (blank)             │  Auth          │
  ├──────────────────────────────┼──────────────────────┼────────────────┤
  │  MODULE_ATTENDANCE           │  TRUE                │  Modules       │
  │  MODULE_EVENTS               │  TRUE                │  Modules       │
  │  MODULE_SMALL_GROUPS         │  TRUE                │  Modules       │
  │  MODULE_GIVING               │  TRUE                │  Modules       │
  │  MODULE_VOLUNTEERS           │  TRUE                │  Modules       │
  │  MODULE_COMMUNICATIONS       │  TRUE                │  Modules       │
  │  MODULE_COMMS_HUB            │  TRUE                │  Modules       │
  │  MODULE_CHECKIN              │  TRUE                │  Modules       │
  │  MODULE_MINISTRIES           │  TRUE                │  Modules       │
  │  MODULE_SERVICE_PLANS        │  TRUE                │  Modules       │
  │  MODULE_SPIRITUAL_CARE       │  TRUE                │  Modules       │
  │  MODULE_OUTREACH             │  TRUE                │  Modules       │
  │  MODULE_PHOTOS               │  TRUE                │  Modules       │
  │  MODULE_SERMONS              │  TRUE                │  Modules       │
  │  MODULE_COMPASSION           │  TRUE                │  Modules       │
  │  MODULE_DISCIPLESHIP         │  TRUE                │  Modules       │
  │  MODULE_LEARNING             │  TRUE                │  Modules       │
  │  MODULE_THEOLOGY             │  TRUE                │  Modules       │
  │  MODULE_MEMBER_CARDS         │  TRUE                │  Modules       │
  ├──────────────────────────────┼──────────────────────┼────────────────┤
  │  NOTIFY_NEW_MEMBER           │  TRUE                │  Notifications │
  │  NOTIFY_PRAYER_REQUEST       │  TRUE                │  Notifications │
  │  ADMIN_EMAIL                 │  (blank)             │  Notifications │
  ├──────────────────────────────┼──────────────────────┼────────────────┤
  │  ITEMS_PER_PAGE              │  50                  │  Display       │
  │  DATE_FORMAT                 │  YYYY-MM-DD          │  Display       │
  ├──────────────────────────────┼──────────────────────┼────────────────┤
  │  FONT_SCALE                  │  100                 │  Display       │
  │  FONT_SCALE_MOBILE           │  100                 │  Display       │
  │  INTERFACE_OVERRIDES         │  (empty JSON)        │  Display       │
  ├──────────────────────────────┼──────────────────────┼────────────────┤
  │  PROVISIONING_URLS           │  (empty JSON)        │  System        │
  └──────────────────────────────┴──────────────────────┴────────────────┘

  FONT_SCALE / FONT_SCALE_MOBILE:
    Integer percentage (default 100). Sets html font-size on desktop/mobile
    respectively. Viewport detected via matchMedia('(max-width: 768px)').
    Managed by the dual font-scale sliders in Control Panel.

  INTERFACE_OVERRIDES:
    JSON blob produced by the Interface Studio in the Themes module. Contains
    CSS variable overrides (vars), font-family selections (fonts),
    per-selector font-size overrides (sizes), per-selector padding
    overrides (pads), and raw custom CSS (custom). Applied via
    Adornment.applyOverrides() which injects a <style> element.
    See Config.txt → INTERFACE STUDIO CONTROL REFERENCE for the
    complete mapping of every control ID, CSS selector, and default.


══════════════════════════════════════════════════════════════════════════════════
 APPENDIX C — COMPLETE .gs FILE MANIFEST
══════════════════════════════════════════════════════════════════════════════════

  ─── FLOCK API (John) — 22 files ──────────────────────────────────────────

   #  GAS Name          Source File                        Purpose
   ─  ────────────────  ─────────────────────────────────  ──────────────────
   1  Code              (hand-written entry point)         doGet/doPost wrapper
   2  Auth              expansion/auth.gs                  Login, sessions, RBAC
   3  Setup             expansion/setup.gs                 79 tabs + AppConfig
   4  Api               expansion/api.gs                   Route dispatcher
   5  Database          expansion/database.gs              Core CRUD handlers
   6  Utilities         expansion/utilities.gs             Shared helpers
   7  SaltPepperHash    expansion/3-FlockOS-SaltPepperHash.gs  Password security
   8  Todo              expansion/todo.gs                  Cross-entity tasks
   9  Communications    expansion/communications.gs        Comms Hub (8 tabs)
  10  Compassion        expansion/compassion.gs            Benevolence ministry
  11  Discipleship      expansion/discipleship.gs          Growth paths (10 tabs)
  12  Learning          expansion/learning.gs              Education (10 tabs)
  13  MemberCards       expansion/member-cards.gs          Contact cards
  14  Ministries        expansion/ministries.gs            Ministry teams
  15  Outreach          expansion/outreach.gs              Evangelism & outreach
  16  Photos            expansion/photos.gs                Drive-backed photos
  17  Sermons           expansion/sermons.gs               Sermon repository
  18  ServicePlanning   expansion/service-planning.gs      Service order builder
  19  SpiritualCare     expansion/spiritual-care.gs        Shepherding & care
  20  Statistics        expansion/statistics.gs            Analytics framework
  21  Theology          expansion/theology.gs              Doctrine reference
  22  WorldMissions     expansion/world-missions.gs        Missions data

  ─── EXTRA API (Luke) — 2 files ───────────────────────────────────────────

   1  Code              (hand-written entry point)         doGet wrapper
   2  Setup             expansion/ExtraAPI-setup.gs        53 tabs

  ─── APP API (Matthew) — ✅ COMPLETE ──────────────────────────────────────

   1  Matthew_Combined.gs (332 lines)  All 12 public content tabs — Books, Lexicon, Heart, Mirror, Quiz, etc.

  ─── MISSIONS API (Mark) — ✅ COMPLETE ────────────────────────────────────

   1  Mark_Combined.gs (803 lines)     Registry, regions, cities, partners, prayer focus, teams, metrics


══════════════════════════════════════════════════════════════════════════════════
 APPENDIX D — COMPLETE FRONTEND FILE MANIFEST
══════════════════════════════════════════════════════════════════════════════════

  CDN DEPENDENCIES (loaded from CDN, no local files needed):
    https://unpkg.com/lucide@0.474.0/dist/umd/lucide.js     (icon library)
    https://cdn.tailwindcss.com                                (utility CSS)
    https://cdn.jsdelivr.net/npm/chart.js                      (charts)
    Google Fonts: Merriweather, Inter, Fira Code

  LOCAL FILES:
  ──────────────────────────────────────────────────────────────────────────

   #  File                        Purpose
   ─  ──────────────────────────  ────────────────────────────────────────
   CORE:
   1  scripts/the-vine.js         ALL API calls + Root System (1,155 lines)
   2  scripts/config.js           Static configuration constants
   3  scripts/Main.js             App controller & page router
   4  scripts/Scripts.js          Script manifest & dynamic loader
   5  scripts/Secure.js           Auth UI (login/logout/register)
   6  scripts/Settings.js         Theme selection + profile settings

   FEATURE MODULES:
   7  scripts/AdminProvision.js   User management UI
   8  scripts/Analysis.js         Analysis tools
   9  scripts/Apologetics.js      Apologetics Q&A explorer
  10  scripts/BibleQuiz.js        Interactive Bible quiz
  11  scripts/Bread.js            Daily devotional page
  12  scripts/Characters.js       Character genealogy trees
  13  scripts/Contact.js          Contact log UI
  14  scripts/Counseling.js       Counseling wisdom cards
  15  scripts/Disclaimer.js       Mission statement / about
  16  scripts/Explorer.js         Bible books explorer
  17  scripts/Family.js           Family ministry page
  18  scripts/Focus.js            Daily focus country
  19  scripts/Heart.js            Heart diagnostic quiz
  20  scripts/Invitation.js       Church invitation page
  21  scripts/MemberPortal.js     Member portal dashboard
  22  scripts/Mirror.js           Shepherd's mirror diagnostic
  23  scripts/Missions.js         Missions directory
  24  scripts/Outreach.js         Outreach management
  25  scripts/Pastoral.js         Pastoral dashboard
  26  scripts/Posture.js          Posture/outreach page
  27  scripts/PrayerService.js    Prayer management UI
  28  scripts/PublicPrayer.js      Public prayer request form
  29  scripts/Psalms.js           Psalms meditation page
  30  scripts/Statistics.js       Analytics dashboard
  31  scripts/Theology.js         Theology reference
  32  scripts/Todo.js             Task manager UI
  33  scripts/Words.js            Biblical lexicon
  34  scripts/Worship.js          Worship study page
  35  scripts/tbc_care.js         Care ministry page

   FLOCKOS-SCRIPTS (backend/FlockOS/FlockOS-Scripts/ — NOT git-tracked):
  36  the_shofar.js               Song library, chord charts, Music Stand, PDF export

   HTML PAGES:
  36  index.html                  Landing / main entry
  37  index-local.html            Local development variant
  38  pages/aos1p.html            Production working file (SPA shell)
  39  pages/AOS1L.html            Legacy variant
  40  pages/AOSa.html             Stable archive A
  41  pages/AOSb.html             Stable archive B
  42  pages/AOSc.html             Stable archive C
  43  pages/developer.html        Developer tools
  44  pages/tbc_care.html         Care ministry page
  45  pages/tap/dev.html          TAP development page

   CSS / THEMES:
  46  css/adornment.css           8-theme design system
                                  (source: expansion/6-FlockOS-AdornmentCSS.txt)

  TOTAL: 46 tracked files + 1 FlockOS-Scripts file (not git-tracked)


══════════════════════════════════════════════════════════════════════════════════
 END OF MASTER DEPLOYMENT GUIDE
 200 tabs · 4 databases · 4 APIs · 46+ frontend files + FlockOS-Scripts
 "I am the vine; you are the branches." — John 15:5
══════════════════════════════════════════════════════════════════════════════════
```

---

# 4. Cloud SQL — Exact Deployment Instructions

> *Source: 4-John/Exact_Deployment_Instructions.txt*

```
═══════════════════════════════════════════════════════════════════════════════
  FlockOS Cloud SQL — Exact Deployment Instructions
  Step-by-step from the Google Cloud Console to a working database
═══════════════════════════════════════════════════════════════════════════════

PREREQUISITES:
  • A Google Cloud account (the same one that owns your GAS projects)
  • A credit card on your GCP billing account (required even for free tier)
  • Your FlockOS GAS project open in another tab

COST ESTIMATE:
  • db-f1-micro (shared core, 0.6 GB RAM, 10 GB storage) ≈ $7–9/month
  • First $300 of GCP credit is free for new accounts (90-day trial)
  • You will NOT need Enterprise Plus

═══════════════════════════════════════════════════════════════════════════════
STEP 1: CREATE THE CLOUD SQL INSTANCE
═══════════════════════════════════════════════════════════════════════════════

1. Go to: https://console.cloud.google.com/sql
   (If prompted, select your existing GCP project — the same one your GAS uses)

2. Click "CREATE INSTANCE"

3. Choose "PostgreSQL"

4. ON THE EDITION SCREEN (where you are now):
   ┌─────────────────────────────────────────┐
   │  SELECT: Enterprise                      │
   │  (The $7-9/month option)                 │
   │                                          │
   │  DO NOT pick Enterprise Plus             │
   │  (That's $100+/month — overkill)         │
   └─────────────────────────────────────────┘

5. Click "Continue" or the edition card to proceed.

6. ON THE PRESET SCREEN (if shown):
   ┌─────────────────────────────────────────┐
   │  SELECT: Sandbox                         │
   │  (Cheapest option, perfect for start)    │
   └─────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
STEP 2: CONFIGURE THE INSTANCE
═══════════════════════════════════════════════════════════════════════════════

Fill in these fields:

  Instance ID:          flockos-db
  Password:             [Create a strong password — WRITE IT DOWN]
  Database version:     PostgreSQL 15  (or 16 if available)
  Region:               Choose the region closest to you:
                          • us-central1  (Iowa — good default)
                          • us-east1     (South Carolina)
                          • us-west1     (Oregon)
                        Pick the SAME region as your other GCP services
  Zonal availability:   Single zone  (cheaper, fine for a church)

MACHINE CONFIGURATION (click "Show Configuration Options" if collapsed):

  Machine shapes:       Shared core
  Machine type:         db-f1-micro  (1 vCPU, 0.6 GB RAM)
                        This is the cheapest option — ~$7/month
                        Handles a church of up to ~500 members easily

  Storage:
    Storage type:       SSD
    Storage capacity:   10 GB  (minimum, can grow later)
    Enable auto storage increase: ✓ Yes

  Connections:
    Public IP:          ✓ Enabled  (required for GAS JDBC)
    Private IP:         Leave unchecked (not needed)

  Data Protection:
    Automated backups:              ✓ Enabled
    Enable point-in-time recovery:  ✓ Enabled
    Recovery window:                7 days (default)

  LEAVE EVERYTHING ELSE AS DEFAULT.

7. Click "CREATE INSTANCE"

   ⏳ This takes 5-10 minutes. Wait for the green checkmark.



═══════════════════════════════════════════════════════════════════════════════
STEP 3: NOTE YOUR INSTANCE CONNECTION NAME
═══════════════════════════════════════════════════════════════════════════════

After the instance is created:

1. You'll land on the instance overview page
2. Look for "Connection name" — yours is:

    flockos-777:us-central1:flockos-db   ← YOUR ACTUAL INSTANCE

3. COPY THIS EXACTLY. You'll need it for Step 6.
   (It's also shown under "Connect to this instance" section)

═══════════════════════════════════════════════════════════════════════════════
STEP 4: CREATE THE DATABASE AND USER
═══════════════════════════════════════════════════════════════════════════════

OPTION A — Using the Google Cloud Console UI (easiest):

  CREATE THE DATABASE:
  1. In the left sidebar of your instance page, click "Databases"
  2. Click "CREATE DATABASE"
  3. Database name:  flockos
  4. Click "CREATE"

  CREATE THE USER:
  1. In the left sidebar, click "Users"
  2. Click "ADD USER ACCOUNT"
  3. User name:      flockos_app
  4. Password:       [Create another strong password — WRITE IT DOWN]
                     (This is the SQL_PASSWORD you'll use in GAS)
  5. Click "ADD"

OPTION B — Using Cloud Shell (if you prefer command line):

  1. Click the "Cloud Shell" icon (>_) in the top-right of the console
  2. Run these commands:

     gcloud sql databases create flockos --instance=flockos-db

     gcloud sql users create flockos_app \
       --instance=flockos-db \
       --password=YOUR_STRONG_PASSWORD

═══════════════════════════════════════════════════════════════════════════════
STEP 5: RUN THE FLOCKOS SCHEMA
═══════════════════════════════════════════════════════════════════════════════

1. Click the "Cloud Shell" icon (>_) in the top-right of the console

2. Connect to your database:

     gcloud sql connect flockos-db --user=flockos_app --database=flockos

   (It will prompt for the flockos_app password you created in Step 4)
   (First time may take a moment — it authorizes your Cloud Shell IP)

3. You should now see a PostgreSQL prompt:
     flockos=>

4. You need to get the schema file into Cloud Shell. Easiest way:

   OPTION A — Upload the file:
     • In Cloud Shell, click the three-dot menu (⋮) → "Upload"
     • Upload the file: FlockOS-GS/Database/flockos_schema.sql
     • Then in the psql prompt, run:
       \i /home/YOUR_USERNAME/flockos_schema.sql

   OPTION B — Paste it directly:
     • Open flockos_schema.sql in VS Code
     • Select All (Cmd+A), Copy (Cmd+C)
     • Paste into the psql prompt (Cmd+V)
     • Press Enter

   You'll see output like:
     CREATE EXTENSION
     CREATE TABLE
     CREATE TABLE
     CREATE INDEX
     ... (many lines)
     CREATE VIEW

5. Verify it worked:

     \dt

   This should list all 106 tables. You can also run:

     SELECT COUNT(*) FROM information_schema.tables
     WHERE table_schema = 'public';

   Should return: 106

6. Exit psql:

     \q

═══════════════════════════════════════════════════════════════════════════════
STEP 6: ENABLE THE CLOUD SQL ADMIN API
═══════════════════════════════════════════════════════════════════════════════

This is REQUIRED for GAS JDBC to connect to Cloud SQL.

1. Go to: https://console.cloud.google.com/apis/library/sqladmin.googleapis.com

2. Click "ENABLE"

   (If it says "API enabled" you're already good)

═══════════════════════════════════════════════════════════════════════════════
STEP 7: CONFIGURE YOUR GAS PROJECT
═══════════════════════════════════════════════════════════════════════════════

1. Open your FLOCK API (4-John) Apps Script project:
   https://script.google.com

2. Add Sql.gs:
   • Click the "+" next to "Files" → "Script"
   • Name it: Sql
   • Paste the entire contents of FlockOS-GS/4-John/Sql.gs
   • Click Save (Ctrl+S / Cmd+S)

3. Update Auth.gs:
   • Find the section with config.list / config.get / config.set routes
   • Add these two lines right after config.set:

     if (action === 'sql.test')             return asJson(handleSqlTest_(params, auth));
     if (action === 'sql.status')           return asJson(handleSqlStatus_(params, auth));

4. Set the SQL password in Script Properties:
   • Go to Project Settings (gear icon ⚙️ in left sidebar)
   • Scroll down to "Script Properties"
   • Click "Add script property"
   • Property:  SQL_PASSWORD
   • Value:     [the flockos_app password from Step 4]
   • Click Save

5. Deploy a new version:
   • Click "Deploy" → "Manage deployments"
   • Click the pencil icon (✏️) on your active deployment
   • Under "Version", select "New version"
   • Click "Deploy"

═══════════════════════════════════════════════════════════════════════════════
STEP 8: UPDATE YOUR FRONTEND FILES
═══════════════════════════════════════════════════════════════════════════════

These are the JS files that changed — update them wherever they're hosted:

1. the_tabernacle.js  — Section 11 (Cloud SQL) added to Control Panel
2. the_cornerstone.js — sql.test and sql.status routes registered

(No HTML file changes needed)

═══════════════════════════════════════════════════════════════════════════════
STEP 9: TEST FROM THE CONTROL PANEL
═══════════════════════════════════════════════════════════════════════════════

1. Open the admin dashboard (the_good_shepherd.html)
2. Navigate to Config / Control Panel
3. Scroll down (or open) Section 11: "Database — Cloud SQL"
4. Fill in:
     Instance Connection Name:  flockos-777:us-central1:flockos-db
     Database Name:             flockos
     Database User:             flockos_app
5. Click "Save Connection"
6. Click "Test Connection"

   ✓ If you see "Connection successful" with the PostgreSQL version
     and latency — you're ready!

   ✗ If it fails, check:
     • Is the Cloud SQL Admin API enabled? (Step 6)
     • Is the instance running? (Check the Cloud SQL console)
     • Is SQL_PASSWORD correct in Script Properties? (Step 7.4)
     • Is the instance connection name exactly right? (Step 3)

7. When ready, flip the "Use Cloud SQL as Primary Database" toggle.

═══════════════════════════════════════════════════════════════════════════════
STEP 10: VERIFY
═══════════════════════════════════════════════════════════════════════════════

After enabling SQL:

1. The Control Panel badge should say "SQL Primary"
2. The test should still pass
3. Your app continues to work normally (existing handlers still use
   Sheets until they're migrated — SQL is ready for Phase 2)

═══════════════════════════════════════════════════════════════════════════════
WHAT'S NEXT (PHASE 2 — LATER)
═══════════════════════════════════════════════════════════════════════════════

Once the database is running and tested:

• Migrate handlers one module at a time (e.g., start with Members)
• Each handler checks FlockSQL.isEnabled() → if true, use SQL; else Sheets
• Frontend code does NOT change at all
• You can migrate gradually — some tables on SQL, some still on Sheets

No rush on Phase 2. The database is provisioned, the schema is deployed,
the connector is wired up. When you're ready, we migrate handlers.

═══════════════════════════════════════════════════════════════════════════════
QUICK REFERENCE
═══════════════════════════════════════════════════════════════════════════════

  Cloud SQL Console:     https://console.cloud.google.com/sql
  Cloud SQL Admin API:   https://console.cloud.google.com/apis/library/sqladmin.googleapis.com
  GAS Script Editor:     https://script.google.com
  Schema file:           FlockOS-GS/Database/flockos_schema.sql
  Connector file:        FlockOS-GS/4-John/Sql.gs

  AppConfig keys set by the Control Panel:
    SQL_ENABLED    = TRUE / FALSE
    SQL_INSTANCE   = project:region:instance
    SQL_DATABASE   = flockos
    SQL_USER       = flockos_app

  Script Properties (set manually in GAS):
    SQL_PASSWORD   = (your database password)

═══════════════════════════════════════════════════════════════════════════════
```

---

# 5. API Load Distribution — Step-by-Step Guide

> *Source: Revelation/1_StepByStep_Config.txt*

```
════════════════════════════════════════════════════════════════════════════════
  FLOCKOS — API LOAD DISTRIBUTION: STEP-BY-STEP DEPLOYMENT GUIDE
  Moving Missions → Mark  |  Moving Statistics → Luke  |  Lightening John
════════════════════════════════════════════════════════════════════════════════

OVERVIEW
────────
  Before:  John handles 358 actions alone. Mark & Luke are empty shells.
  After:   John handles ~300 core actions.
           Mark handles 40 missions actions (its own GAS execution environment).
           Luke handles 19 statistics actions (its own GAS execution environment).

  All three share the SAME master spreadsheet (same SHEET_ID).
  Mark & Luke validate auth tokens by calling John's new auth.validate endpoint.
  Valid tokens are cached locally for 5 minutes to minimize cross-service calls.

FILES CHANGED / CREATED
───────────────────────
  NEW:     2-Mark/Code.gs        — Missions API router + auth validation
  NEW:     2-Mark/Shared.gs      — Shared utility functions for Mark
  MOVE:    4-John/Missions.gs    → 2-Mark/Missions.gs  (copy to Mark project)

  NEW:     3-Luke/Code.gs        — Statistics API router + auth validation
  NEW:     3-Luke/Shared.gs      — Shared utility functions for Luke
  MOVE:    4-John/Statistics.gs   → 3-Luke/Statistics.gs (copy to Luke project)

  EDITED:  4-John/Auth.gs        — Added auth.validate public endpoint (1 line)
  EDITED:  4-John/Api.gs         — Remove missions.* & statistics.* routes
  EDITED:  Acts/the_true_vine.js — Missions→_m(), Statistics→_x()


════════════════════════════════════════════════════════════════════════════════
  STEP 1: DEPLOY JOHN (add auth.validate endpoint)
════════════════════════════════════════════════════════════════════════════════

  This must go first because Mark & Luke depend on it for auth validation.

  1a. Open John's GAS project in the Script Editor.

  1b. Open Auth.gs. Find the public auth actions section (near line ~130).
      ADD this line right after the 'system.lockdown' line:

        if (action === 'auth.validate')        return asJson(expRequireAuth_(params));

      It should look like:
        if (action === 'system.lockdown')      return asJson(jsonOk({...}));
        if (action === 'auth.validate')        return asJson(expRequireAuth_(params));
        // ── Public member-card actions ...

  1c. Open Api.gs. COMMENT OUT (do not delete yet) the missions and
      statistics route blocks. This is lines ~385-440 (missions) and
      ~507-533 (statistics). Wrap them:

        // ── [MOVED TO MARK] ──────────────────────────────────────────────
        // if (action === 'missions.registry.list')  ...
        //   ... all 40 missions routes ...
        // if (action === 'missions.dashboard')      ...
        // ── [END MOVED TO MARK] ──────────────────────────────────────────

        // ── [MOVED TO LUKE] ──────────────────────────────────────────────
        // if (action === 'statistics.config.list')   ...
        //   ... all 19 statistics routes ...
        // if (action === 'statistics.export')        ...
        // ── [END MOVED TO LUKE] ──────────────────────────────────────────

      TIP: Comment out instead of deleting for now. If anything goes wrong
      you can uncomment them to restore the old behavior instantly.

  1d. Deploy John: Manage Deployments → Edit → New version → Deploy.
      Copy John's deployed URL if you don't already have it.

  1e. TEST: Open a browser and go to:
        <John URL>?action=auth.validate&token=<your valid token>
      You should get:  { "ok": true, "email": "...", "role": "...", ... }


════════════════════════════════════════════════════════════════════════════════
  STEP 2: DEPLOY MARK (Missions API)
════════════════════════════════════════════════════════════════════════════════

  2a. Open Mark's GAS project in the Script Editor.

  2b. DELETE the old Code.gs file content (the dumb tab reader).
      REPLACE it with the contents of:  2-Mark/Code.gs

  2c. DELETE the old Gospel.gs file (setup script — only needed once, already ran).
      If you want to keep it for reference, just leave it — it won't conflict.

  2d. CREATE a new file called "Shared" (no .gs extension in the editor).
      Paste the contents of:  2-Mark/Shared.gs

  2e. CREATE a new file called "Missions".
      Paste the contents of:  4-John/Missions.gs
      (This is the EXACT same handler code already running in John.)

  2f. Set Script Properties (Project Settings → Script Properties):
        SHEET_ID   = <same value as John's SHEET_ID — the master spreadsheet>
        FLOCK_URL  = <John's deployed web app URL>

  2g. Deploy Mark: Manage Deployments → New Deployment → Web App
      - Execute as: Me
      - Who has access: Anyone
      → Deploy → Copy the Mark deployment URL.

  2h. TEST: Open a browser and go to:
        <Mark URL>?action=health
      Expect:  { "ok": true, "message": "Flock Missions API (MISSIONS/Mark)..." }

      Then test an authenticated action:
        <Mark URL>?action=missions.registry.list&token=<your valid token>
      Expect:  { "ok": true, ... } with missions data.


════════════════════════════════════════════════════════════════════════════════
  STEP 3: DEPLOY LUKE (Statistics API)
════════════════════════════════════════════════════════════════════════════════

  3a. Open Luke's GAS project in the Script Editor.

  3b. DELETE the old Luke.gs and Extra.gs file contents.
      REPLACE Code.gs (or Luke.gs renamed to Code) with:  3-Luke/Code.gs

  3c. CREATE a new file called "Shared".
      Paste the contents of:  3-Luke/Shared.gs

  3d. CREATE a new file called "Statistics".
      Paste the contents of:  4-John/Statistics.gs
      (Same exact handler code.)

  3e. Set Script Properties (Project Settings → Script Properties):
        SHEET_ID   = <same value as John's SHEET_ID>
        FLOCK_URL  = <John's deployed web app URL>

  3f. Deploy Luke: Manage Deployments → New Deployment → Web App
      - Execute as: Me
      - Who has access: Anyone
      → Deploy → Copy the Luke deployment URL.

  3g. TEST: Open a browser and go to:
        <Luke URL>?action=health
      Expect:  { "ok": true, "message": "Flock Statistics API (EXTRA/Luke)..." }

      Then test:
        <Luke URL>?action=statistics.config.list&token=<your valid token>


════════════════════════════════════════════════════════════════════════════════
  STEP 4: UPDATE FRONTEND URLs
════════════════════════════════════════════════════════════════════════════════

  The frontend needs to know the new Mark & Luke deployment URLs.

  4a. Find where MISSIONS_URL and EXTRA_URL are configured.
      This is typically in your HTML file or in the_true_vine.js config section.
      Look for _resolveUrl or URL constants near the top of the_true_vine.js.

  4b. Set:
        MISSIONS_URL = <Mark's deployed web app URL from Step 2g>
        EXTRA_URL    = <Luke's deployed web app URL from Step 3f>

  4c. The frontend routing has already been updated in the_true_vine.js:
      - Missions routes now use _m() → resolves to MISSIONS_URL (Mark)
      - Statistics routes now use _x() → resolves to EXTRA_URL (Luke)

  4d. Upload the updated the_true_vine.js to your hosting.


════════════════════════════════════════════════════════════════════════════════
  STEP 5: VERIFY END-TO-END
════════════════════════════════════════════════════════════════════════════════

  5a. Log in to FlockOS normally.

  5b. Navigate to Missions — should load data from Mark (not John).
      Open browser DevTools → Network tab. Confirm requests go to
      your Mark URL, not your John/FLOCK URL.

  5c. Navigate to Statistics — should load data from Luke (not John).
      Same DevTools check — requests should go to Luke URL.

  5d. Navigate to other modules (People, Calendar, Communications, etc.)
      — these should still work via John as before.

  5e. Try creating/editing a mission entry, a statistics config, etc.
      Confirm writes work correctly.


════════════════════════════════════════════════════════════════════════════════
  STEP 6: CLEANUP (after everything works)
════════════════════════════════════════════════════════════════════════════════

  Once you've verified everything works for a few days:

  6a. In John's Api.gs, DELETE the commented-out missions.* and statistics.*
      route blocks (from Step 1c).

  6b. Optionally remove Missions.gs and Statistics.gs from John's project
      entirely. They're now living in Mark and Luke respectively.
      (Keep them as backup if you prefer — dead code won't hurt anything.)

  6c. Redeploy John one more time.


════════════════════════════════════════════════════════════════════════════════
  ROLLBACK PLAN (if something goes wrong)
════════════════════════════════════════════════════════════════════════════════

  If Mark or Luke aren't working correctly:

  1. In the_true_vine.js, change missions back to _f() and statistics back
     to _f(). This routes everything through John again.
  2. In John's Api.gs, uncomment the missions.* and statistics.* routes.
  3. Redeploy John and re-upload the_true_vine.js.

  This instantly restores the old behavior while you debug.


════════════════════════════════════════════════════════════════════════════════
  ARCHITECTURE SUMMARY
════════════════════════════════════════════════════════════════════════════════

  ┌─────────────────────────────────────────────────────────────┐
  │                    FRONTEND (Browser)                       │
  │                     the_true_vine.js                        │
  │                                                             │
  │  _appTab() ──→ Matthew (public tab reader, no auth)        │
  │  _f()      ──→ John (core: auth, members, calendar, ...)   │
  │  _m()      ──→ Mark (missions: registry, teams, metrics)   │
  │  _x()      ──→ Luke (statistics: config, snapshots, views) │
  └─────────────────────────────────────────────────────────────┘
           │              │              │              │
           ▼              ▼              ▼              ▼
  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐
  │ Matthew  │  │    John      │  │   Mark   │  │   Luke   │
  │ (APP)    │  │   (FLOCK)    │  │(MISSIONS)│  │ (EXTRA)  │
  │          │  │              │  │          │  │          │
  │ Tab      │  │ Auth         │◄─│ Token    │  │ Token    │
  │ reader   │  │ Members      │  │ validate │  │ validate │
  │ (public) │  │ Calendar     │  │ via John │  │ via John │
  │          │  │ Care, Comms  │  │          │  │          │
  │          │  │ Discipleship │  │ 40 routes│  │ 19 routes│
  │          │  │ Learning     │  │ 1,411 LOC│  │  738 LOC │
  │          │  │ + 12 more    │  │          │  │          │
  │          │  │ ~300 routes  │  │          │  │          │
  └──────────┘  └──────────────┘  └──────────┘  └──────────┘
                        │                │              │
                        ▼                ▼              ▼
                 ┌──────────────────────────────────────────┐
                 │       SHARED MASTER SPREADSHEET          │
                 │  (same SHEET_ID across all 3 projects)   │
                 │                                          │
                 │  Users, AccessControl, Members, Events,  │
                 │  MissionsRegistry, StatisticsConfig, ... │
                 └──────────────────────────────────────────┘


  Auth Flow (Mark & Luke):
  ┌──────────┐  1. Request with token  ┌──────────┐
  │ Browser  │ ──────────────────────→ │  Mark    │
  │          │                         │  /Luke   │
  │          │                         │          │
  │          │                         │ 2. Cache │
  │          │                         │    hit?  │──→ YES → use cached auth
  │          │                         │          │
  │          │                         │ 3. Call  │
  │          │                         │    John: │
  │          │                         │  auth.   │
  │          │                         │  validate│
  │          │                         │          │──→ John validates token
  │          │                         │ 4. Cache │     against PropertiesService
  │          │  5. Response             │    result│     and AccessControl tab
  │          │ ◄────────────────────── │ (5 min)  │
  └──────────┘                         └──────────┘
```

---

# 6. Complete Worksheet Reference — All 201 Tabs

> *Source: Revelation/5_References.txt*

```
══════════════════════════════════════════════════════════════════════════════════
 FLOCKOS — COMPLETE WORKSHEET REFERENCE
 Every tab across all 4 databases, with exact column headers.
 Generated 2026-03-24 · 201 total tabs · ~5,470 total columns
══════════════════════════════════════════════════════════════════════════════════


 GRAND SUMMARY
──────────────────────────────────────────────────────────────────────────────────

  Database (Google Sheet)   API / Gospel    Status     Tabs   Columns
  ────────────────────────  ─────────────  ────────   ─────  ───────
  FLOCK CRM                 FLOCK / John   ✅ Built     79   ~1,100
  Statistics & Extra        EXTRA / Luke   ✅ Built     53   ~2,590
  Missions                  MISSIONS/Mark  ✅ Built     56   ~462
  MASTER_API                APP / Matthew  ✅ Built     12   ~82
  ────────────────────────  ─────────────  ────────   ─────  ───────
  TOTAL                                                200   ~4,214

  Files:
   • expansion/setup.gs       → FLOCK database (1,996 lines, 79 ensureTab calls)
   • expansion/ExtraAPI-setup.gs → EXTRA database (175 lines, 53 ensureTab calls)
   • missions-api/Gospel.gs   → MISSIONS database (56 ensureTab calls, ~462 columns)
   • app-api/Truth.gs          → APP database (12 ensureTab calls, ~82 columns)


════════════════════════════════════════════════════════════════════════════════
 DATABASE 1 — FLOCK CRM  (FLOCK API / John)
 "Feed my sheep." — John 21:17
 Auth: RBAC · 79 tabs · expansion/setup.gs
════════════════════════════════════════════════════════════════════════════════


─── PASTORAL CORE (7 tabs) ─────────────────────────────────────────────────────

 1. Members (51 columns)
    A  ID
    B  First Name
    C  Last Name
    D  Preferred Name
    E  Suffix
    F  Date of Birth
    G  Gender
    H  Photo URL
    I  Primary Email
    J  Secondary Email
    K  Cell Phone
    L  Home Phone
    M  Work Phone
    N  Preferred Contact
    O  Street Address 1
    P  Street Address 2
    Q  City
    R  State
    S  ZIP Code
    T  Country
    U  Membership Status
    V  Member Since
    W  How They Found Us
    X  Baptism Date
    Y  Salvation Date
    Z  Date of Death
    AA Household ID
    AB Family Role
    AC Marital Status
    AD Spouse Name
    AE Emergency Contact
    AF Emergency Phone
    AG Ministry Teams
    AH Volunteer Roles
    AI Spiritual Gifts
    AJ Small Group
    AK Pastoral Notes
    AL Last Contact Date
    AM Next Follow-Up
    AN Follow-Up Priority
    AO Assigned To
    AP Tags
    AQ Archived
    AR Archive Reason
    AS Created By
    AT Created At
    AU Updated By
    AV Updated At
    AW Website Link
    AX Color Scheme
    AY BG Scheme

 2. PrayerRequests (18 columns)
    A  ID
    B  Member ID              ← FK to Members.ID
    C  Submitter Name
    D  Submitter Email
    E  Submitter Phone
    F  Prayer Text
    G  Category               ← Dropdown: Health / Family / Financial / Spiritual / Grief / Praise / Other
    H  Is Confidential        ← TRUE / FALSE
    I  Follow-Up Requested    ← TRUE / FALSE
    J  Status                 ← Dropdown: New / In Progress / Answered / Closed
    K  Admin Notes
    L  Assigned To
    M  Submitted At
    N  Last Updated
    O  Updated By
    P  Archived               ← TRUE / FALSE
    Q  Auto Log
    R  Group ID               ← FK to SmallGroups.ID (leader visibility)

 3. ContactLog (12 columns)
    A  ID
    B  Member ID              ← FK to Members.ID
    C  Contact Date
    D  Contact Type           ← Dropdown: Phone Call / Text / Email / Home Visit / Office Visit / Video Call / Other
    E  Direction              ← Dropdown: Outbound / Inbound
    F  Subject
    G  Details
    H  Follow-Up Needed       ← TRUE / FALSE
    I  Follow-Up Date
    J  Follow-Up Completed    ← TRUE / FALSE
    K  Contacted By
    L  Created At

 4. PastoralNotes (8 columns)
    A  ID
    B  Member ID              ← FK to Members.ID
    C  Note Date
    D  Category               ← Dropdown: General / Counseling / Concern / Praise / Confidential
    E  Note Text
    F  Created By
    G  Created At
    H  Group ID               ← FK to SmallGroups.ID (leader visibility)

 5. Milestones (7 columns)
    A  ID
    B  Member ID              ← FK to Members.ID
    C  Milestone Type         ← Dropdown: Salvation / Baptism / Membership / Marriage / Ordination / Other
    D  Milestone Date
    E  Description
    F  Recorded By
    G  Created At

 6. Households (11 columns)
    A  Household ID
    B  Household Name
    C  Street Address 1
    D  Street Address 2
    E  City
    F  State
    G  ZIP Code
    H  Country
    I  Primary Contact ID     ← FK to Members.ID
    J  Notes
    K  Created At

 7. ToDo (19 columns)
    A  ID
    B  Title
    C  Description
    D  Assigned To
    E  Assigned Member ID     ← FK to Members.ID
    F  Due Date
    G  Priority               ← Dropdown: Low / Medium / High / Urgent
    H  Status                 ← Dropdown: Not Started / In Progress / Done / Archived
    I  Category               ← Dropdown: Follow-Up / Visit / Phone Call / Admin / Event / Other
    J  Entity Type            ← Dropdown: Members / PrayerRequests / PastoralNotes / Events /
                                 SmallGroups / SpiritualCareCases / OutreachContacts /
                                 OutreachCampaigns / CompassionRequests / Ministries / Sermons /
                                 DiscipleshipEnrollments / DiscipleshipMentoring / Giving /
                                 Attendance / VolunteerSchedule / ServicePlans /
                                 LearningPlaylists / MissionsRegistry / Households /
                                 Milestones / Other
    K  Entity ID              ← FK to the row ID in the linked entity's tab
    L  Recurring              ← Dropdown: TRUE / FALSE
    M  Recurrence Rule        ← Dropdown: Daily / Weekly / Biweekly / Monthly / Quarterly / Yearly
    N  Notes
    O  Auto Log
    P  Created By
    Q  Created At
    R  Updated By
    S  Updated At


─── ATTENDANCE & EVENTS (4 tabs) ───────────────────────────────────────────────

 8. Attendance (9 columns)
    A  ID
    B  Member ID              ← FK to Members.ID
    C  Service Date
    D  Service Type           ← Dropdown: Sunday AM / Sunday PM / Wednesday / Special / Event
    E  Check-In Time
    F  Check-In Method        ← Dropdown: Manual / Kiosk / App / QR
    G  Notes
    H  Recorded By
    I  Created At

 9. Events (21 columns)
    A  ID
    B  Title
    C  Description
    D  Event Type             ← Dropdown: Worship / Fellowship / Outreach / Training / Meeting / Conference / Other
    E  Location
    F  Start Date
    G  End Date
    H  Start Time
    I  End Time
    J  Recurring              ← Dropdown: None / Weekly / Biweekly / Monthly / Quarterly / Annually
    K  Recurring Until
    L  Capacity
    M  RSVP Required          ← TRUE / FALSE
    N  Ministry Team
    O  Contact Person
    P  Status                 ← Dropdown: Draft / Published / Cancelled / Completed
    Q  Notes
    R  Created By
    S  Created At
    T  Updated By
    U  Updated At

 10. EventRSVPs (8 columns)
    A  ID
    B  Event ID               ← FK to Events.ID
    C  Member ID              ← FK to Members.ID
    D  Response               ← Dropdown: Going / Maybe / Not Going
    E  Guest Count
    F  Notes
    G  Responded At
    H  Updated At

 11. CheckInSessions (10 columns)
    A  ID
    B  Event ID               ← FK to Events.ID
    C  Session Name
    D  Date
    E  Opened At
    F  Closed At
    G  Total Check-Ins
    H  Opened By
    I  Notes
    J  Created At


─── GROUPS & GIVING (4 tabs) ───────────────────────────────────────────────────

 12. SmallGroups (16 columns)
    A  ID
    B  Group Name
    C  Description
    D  Group Type             ← Dropdown: Bible Study / Prayer / Fellowship / Recovery / Youth / Men / Women / Mixed
    E  Leader ID              ← FK to Members.ID
    F  Co-Leader ID           ← FK to Members.ID
    G  Meeting Day            ← Dropdown: Mon / Tue / Wed / Thu / Fri / Sat / Sun
    H  Meeting Time
    I  Meeting Location
    J  Capacity
    K  Status                 ← Dropdown: Active / Paused / Closed / Forming
    L  Semester
    M  Notes
    N  Created By
    O  Created At
    P  Updated At

 13. SmallGroupMembers (9 columns)
    A  ID
    B  Group ID               ← FK to SmallGroups.ID
    C  Member ID              ← FK to Members.ID
    D  Role                   ← Dropdown: Leader / Co-Leader / Member / Host
    E  Joined Date
    F  Left Date
    G  Status                 ← Dropdown: Active / Inactive / Left
    H  Notes
    I  Created At

 14. Giving (15 columns)
    A  ID
    B  Member ID              ← FK to Members.ID
    C  Donor Name
    D  Amount
    E  Currency
    F  Date
    G  Fund                   ← Dropdown: General / Missions / Building / Youth / Benevolence / Other
    H  Method                 ← Dropdown: Cash / Check / Card Online / ACH / Other
    I  Check Number
    J  Transaction Ref
    K  Is Tax Deductible      ← TRUE / FALSE
    L  Notes
    M  Recorded By
    N  Created At
    O  Updated At

 15. GivingPledges (14 columns)
    A  ID
    B  Member ID              ← FK to Members.ID
    C  Fund
    D  Pledge Amount
    E  Frequency              ← Dropdown: Weekly / Biweekly / Monthly / Quarterly / Annually / One-Time
    F  Start Date
    G  End Date
    H  Total Pledged
    I  Total Given
    J  Status                 ← Dropdown: Active / Completed / Cancelled
    K  Notes
    L  Created By
    M  Created At
    N  Updated At


─── VOLUNTEERING & MINISTRY (5 tabs) ──────────────────────────────────────────

 16. VolunteerSchedule (13 columns)
    A  ID
    B  Member ID              ← FK to Members.ID
    C  Ministry Team
    D  Role
    E  Scheduled Date
    F  Service Type
    G  Status                 ← Dropdown: Confirmed / Tentative / Declined / Swapped / No-Show
    H  Swap Requested         ← TRUE / FALSE
    I  Swap With
    J  Notes
    K  Scheduled By
    L  Created At
    M  Updated At

 17. Ministries (17 columns)
    A  ID
    B  Ministry Name
    C  Category               ← Dropdown: Worship / Education / Youth / Children / Outreach / Admin / Care / Other
    D  Description
    E  Ministry Lead ID       ← FK to Members.ID
    F  Co-Lead ID             ← FK to Members.ID
    G  Contact Email
    H  Meeting Day
    I  Meeting Time
    J  Meeting Location
    K  Budget Allocated
    L  Status                 ← Dropdown: Active / Planning / Paused / Archived
    M  Reporting To
    N  Notes
    O  Created By
    P  Created At
    Q  Updated At

 18. MinistryMembers (10 columns)
    A  ID
    B  Ministry ID            ← FK to Ministries.ID
    C  Member ID              ← FK to Members.ID
    D  Role                   ← Dropdown: Lead / Co-Lead / Coordinator / Volunteer / Apprentice / Emeritus
    E  Start Date
    F  End Date
    G  Status                 ← Dropdown: Active / On Leave / Inactive / Alumni
    H  Hours Per Month
    I  Notes
    J  Created At

 19. ServicePlans (14 columns)
    A  ID
    B  Service Date
    C  Service Type
    D  Theme
    E  Scripture Focus
    F  Sermon Title
    G  Preacher ID            ← FK to Members.ID
    H  Worship Leader ID      ← FK to Members.ID
    I  Status                 ← Dropdown: Draft / Ready / Live / Completed / Cancelled
    J  Notes
    K  Created By
    L  Created At
    M  Updated By
    N  Updated At

 20. ServicePlanItems (10 columns)
    A  ID
    B  Plan ID                ← FK to ServicePlans.ID
    C  Order
    D  Item Type              ← Dropdown: Song / Prayer / Scripture / Sermon / Offering / Announcement / Transition / Video / Other
    E  Title
    F  Description
    G  Duration Minutes
    H  Assigned To ID         ← FK to Members.ID
    I  Notes
    J  Created At


─── SONGS & MUSIC STAND (3 tabs) ───────────────────────────────────────────────

 21. Songs (18 columns)
    A  ID
    B  Title
    C  Artist
    D  CCLI Number
    E  Default Key            ← Dropdown: C / C# / Db / D / … / Bm
    F  Tempo BPM
    G  Time Signature          ← Dropdown: 4/4 / 3/4 / 6/8 / 2/4 / 12/8 / 2/2 / Other
    H  Duration Minutes
    I  Genre                   ← Dropdown: Hymn / Contemporary / Gospel / Chorus / Christmas / Easter / Other
    J  Tags                    ← comma-separated (Worship, Praise, Communion, Opening, Closing …)
    K  Lyrics                  ← full lyrics (plain text)
    L  Notes
    M  Active                  ← Dropdown: TRUE / FALSE
    N  Drive File ID           ← Google Drive ID for lead sheet PDF/image
    O  Created By
    P  Created At
    Q  Updated By
    R  Updated At

 22. SongArrangements (14 columns)
    A  ID
    B  Song ID                 ← FK to Songs.ID
    C  Name                    ← arrangement label ("Default", "Acoustic", "Simplified")
    D  Key                     ← Dropdown: C / C# / Db / D / … / Bm
    E  Capo                    ← fret number (0 = none)
    F  Chord Chart             ← chord progression text ("C  G  Am  F")
    G  Lyrics With Chords      ← ChordPro-style: "[C]Amazing [G]grace"
    H  Instrument              ← Dropdown: Guitar / Piano / Bass / Drums / Vocals / Other
    I  Vocal Range             ← e.g. "Bb3–E5"
    J  Drive File ID           ← Google Drive ID for arrangement PDF/image
    K  Notes
    L  Created By
    M  Created At
    N  Updated At

 23. SetlistSongs (10 columns)
    A  ID
    B  Plan ID                 ← FK to ServicePlans.ID
    C  Plan Item ID            ← FK to ServicePlanItems.ID
    D  Song ID                 ← FK to Songs.ID
    E  Arrangement ID          ← FK to SongArrangements.ID (optional)
    F  Key Override            ← override the arrangement key for this service
    G  Notes
    H  Created By
    I  Created At
    J  Updated At

  FRONTEND: the_shofar.js (backend/FlockOS/FlockOS-Scripts/)
    Entry: window.openMusicStandApp()  |  CSS prefix: ms-
    Consumes all 3 tabs above via FLOCK API (PASTORAL_DB_V2_ENDPOINT).
    Features: song CRUD, arrangement CRUD (ChordPro), Music Stand live
    chord view, setlist navigation, single & full-setlist PDF export.
    ~1,591 lines  |  Not git-tracked (covered by backend/FlockOS/ rule)


─── COMMUNICATIONS (9 tabs) ────────────────────────────────────────────────────

 24. Communications (13 columns)
    A  ID
    B  Type                   ← Dropdown: Email / SMS / Push / In-App / Announcement
    C  Subject
    D  Body
    E  Audience
    F  Audience Filter
    G  Sent At
    H  Sent By
    I  Recipient Count
    J  Status                 ← Dropdown: Draft / Scheduled / Sent / Failed
    K  Scheduled For
    L  Notes
    M  Created At

 22. CommsMessages (22 columns)
    A  ID
    B  Thread ID              ← FK to CommsThreads.ID
    C  Sender ID              ← FK to Members.ID or AuthUsers.Email
    D  Sender Name
    E  Sender Email
    F  Recipient Type         ← Dropdown: Member / Group / Ministry / All
    G  Recipient ID
    H  Recipient Name
    I  Message Type           ← Dropdown: Text / Image / File / System
    J  Subject
    K  Body
    L  Priority               ← Dropdown: Normal / High / Urgent
    M  Attachment URL
    N  Attachment Name
    O  Reply-To ID            ← FK to CommsMessages.ID
    P  Status                 ← Dropdown: Sent / Delivered / Read / Failed / Deleted
    Q  Sent At
    R  Edited At
    S  Read Count
    T  Flagged                ← TRUE / FALSE
    U  Created At
    V  Updated At

 23. CommsThreads (18 columns)
    A  ID
    B  Subject
    C  Thread Type            ← Dropdown: Direct / Group / Ministry / Announcement
    D  Creator ID
    E  Creator Name
    F  Participant IDs
    G  Participant Names
    H  Participant Count
    I  Message Count
    J  Last Message At
    K  Last Message By
    L  Last Snippet
    M  Status                 ← Dropdown: Active / Archived / Closed
    N  Pinned                 ← TRUE / FALSE
    O  Muted By
    P  Channel ID             ← FK to CommsChannels.ID
    Q  Created At
    R  Updated At

 24. CommsNotifications (20 columns)
    A  ID
    B  Recipient ID
    C  Recipient Name
    D  Recipient Email
    E  Title
    F  Body
    G  Notification Type      ← Dropdown: Message / Announcement / Event / Prayer / Care / System / Reminder
    H  Priority               ← Dropdown: Low / Normal / High / Urgent
    I  Entity Type            ← source tab (Events, PrayerRequests, etc.)
    J  Entity ID
    K  Action URL
    L  Icon
    M  Status                 ← Dropdown: Pending / Sent / Read / Dismissed / Expired
    N  Read At
    O  Dismissed At
    P  Sent Via               ← Dropdown: In-App / Email / Push / SMS
    Q  Sender Email
    R  Expires At
    S  Created At
    T  Updated At

 25. CommsNotificationPrefs (16 columns)
    A  ID
    B  Member ID              ← FK to Members.ID
    C  Member Email
    D  Email Enabled          ← TRUE / FALSE
    E  Email Digest           ← Dropdown: Immediate / Daily / Weekly / Off
    F  In-App Enabled         ← TRUE / FALSE
    G  Quiet Hours Start
    H  Quiet Hours End
    I  Notif Messages         ← TRUE / FALSE
    J  Notif Announcements    ← TRUE / FALSE
    K  Notif Events           ← TRUE / FALSE
    L  Notif Prayer           ← TRUE / FALSE
    M  Notif Care             ← TRUE / FALSE
    N  Notif System           ← TRUE / FALSE
    O  Created At
    P  Updated At

 26. CommsChannels (18 columns)
    A  ID
    B  Channel Name
    C  Slug
    D  Description
    E  Channel Type           ← Dropdown: Announcements / Ministry / Prayer / Discussion / Leadership / General
    F  Icon
    G  Color Hex
    H  Creator ID
    I  Creator Name
    J  Subscriber Count
    K  Message Count
    L  Visibility             ← Dropdown: Public / Members / Leaders / Private
    M  Post Permission        ← Dropdown: Anyone / Leaders / Admins
    N  Pinned Message ID      ← FK to CommsMessages.ID
    O  Status                 ← Dropdown: Active / Archived / Locked
    P  Sort Order
    Q  Created At
    R  Updated At

 27. CommsTemplates (16 columns)
    A  ID
    B  Template Name
    C  Template Type          ← Dropdown: Email / SMS / Push / In-App
    D  Subject
    E  Body
    F  Body HTML
    G  Category               ← Dropdown: Welcome / Follow-Up / Event / Prayer / Care / Admin / Custom
    H  Variables
    I  Use Count
    J  Last Used At
    K  Visibility             ← Dropdown: All / Leaders / Admins
    L  Status                 ← Dropdown: Active / Draft / Archived
    M  Created By
    N  Created By Name
    O  Created At
    P  Updated At

 28. CommsReadReceipts (10 columns)
    A  ID
    B  Message ID             ← FK to CommsMessages.ID
    C  Thread ID              ← FK to CommsThreads.ID
    D  Reader ID
    E  Reader Name
    F  Reader Email
    G  Read At
    H  Device
    I  Created At
    J  Updated At

 29. CommsBroadcastLog (18 columns)
    A  ID
    B  Type
    C  Subject
    D  Body
    E  Body HTML
    F  Audience
    G  Audience Filter
    H  Template ID            ← FK to CommsTemplates.ID
    I  Channel ID             ← FK to CommsChannels.ID
    J  Sent At
    K  Sent By
    L  Sent By Name
    M  Recipient Count
    N  Delivered Count
    O  Failed Count
    P  Status                 ← Dropdown: Pending / Sending / Sent / Partial / Failed
    Q  Scheduled For
    R  Created At


─── CARE & OUTREACH (6 tabs) ──────────────────────────────────────────────────

 30. SpiritualCareCases (19 columns)
    A  ID
    B  Member ID              ← FK to Members.ID
    C  Care Type              ← Dropdown: Grief / Marriage / Addiction / Health / Financial / Spiritual Crisis / Family / Other
    D  Priority               ← Dropdown: Low / Normal / High / Critical
    E  Status                 ← Dropdown: Open / Active / Pending / Resolved / Closed / Referred
    F  Summary
    G  Assigned Team ID       ← FK to Ministries.ID
    H  Primary Caregiver ID   ← FK to Members.ID
    I  Secondary Caregiver ID ← FK to Members.ID
    J  Opened Date
    K  Target Resolve Date
    L  Resolved Date
    M  Referral Info
    N  Confidential           ← TRUE / FALSE
    O  Notes
    P  Created By
    Q  Created At
    R  Updated By
    S  Updated At

 31. SpiritualCareInteractions (12 columns)
    A  ID
    B  Case ID                ← FK to SpiritualCareCases.ID
    C  Interaction Date
    D  Type                   ← Dropdown: Visit / Call / Counseling / Prayer / Resource / Referral / Check-In
    E  Caregiver ID           ← FK to Members.ID
    F  Duration Minutes
    G  Summary
    H  Follow-Up Needed       ← TRUE / FALSE
    I  Follow-Up Date
    J  Follow-Up Done         ← TRUE / FALSE
    K  Confidential           ← TRUE / FALSE
    L  Created At

 32. SpiritualCareAssignments (11 columns)
    A  ID
    B  Caregiver ID           ← FK to Members.ID
    C  Member ID              ← FK to Members.ID (the one being cared for)
    D  Ministry ID            ← FK to Ministries.ID
    E  Role                   ← Dropdown: Primary / Secondary / Support / Mentor / Deacon
    F  Start Date
    G  End Date
    H  Status                 ← Dropdown: Active / Paused / Ended
    I  Notes
    J  Created By
    K  Created At

 33. OutreachContacts (22 columns)
    A  ID
    B  First Name
    C  Last Name
    D  Email
    E  Phone
    F  Address
    G  City
    H  State
    I  Zip
    J  Source                  ← Dropdown: Event / Door-to-Door / Online / Referral / Card / Walk-In / Other
    K  Campaign ID            ← FK to OutreachCampaigns.ID
    L  Status                 ← Dropdown: New / Contacted / Interested / Visiting / Connected / Converted / Inactive
    M  Interest Level         ← Dropdown: Hot / Warm / Cool / Cold
    N  Notes
    O  Member ID              ← FK to Members.ID (if converted)
    P  Assigned To
    Q  Last Contact Date
    R  Next Follow-Up Date
    S  Tags
    T  Created By
    U  Created At
    V  Updated At

 34. OutreachCampaigns (19 columns)
    A  ID
    B  Campaign Name
    C  Type                   ← Dropdown: Door-to-Door / Event / Mailing / Digital / Community Service / Visitation
    D  Description
    E  Start Date
    F  End Date
    G  Location
    H  Ministry ID            ← FK to Ministries.ID
    I  Lead ID                ← FK to Members.ID
    J  Budget
    K  Goal Reached
    L  Actual Reached
    M  Decisions
    N  Status                 ← Dropdown: Planning / Active / Completed / Cancelled
    O  Notes
    P  Tags
    Q  Created By
    R  Created At
    S  Updated At

 35. OutreachFollowUps (12 columns)
    A  ID
    B  Contact ID             ← FK to OutreachContacts.ID
    C  Date
    D  Type                   ← Dropdown: Phone / Text / Email / Visit / Card
    E  By ID                  ← FK to Members.ID
    F  Summary
    G  Response
    H  Follow-Up Needed       ← TRUE / FALSE
    I  Next Date
    J  Follow-Up Done         ← TRUE / FALSE
    K  Notes
    L  Created At


─── MEDIA (5 tabs) ────────────────────────────────────────────────────────────

 36. Photos (15 columns)
    A  ID
    B  Drive File ID
    C  URL
    D  Thumbnail URL
    E  Filename
    F  Caption
    G  Entity Type            ← Dropdown: Member / Event / Ministry / Group / Sermon / General
    H  Entity ID
    I  Album ID               ← FK to PhotoAlbums.ID
    J  Uploaded By
    K  Visibility             ← Dropdown: Public / Members / Leaders / Private
    L  Tags
    M  File Size
    N  Created At
    O  Updated At

 37. PhotoAlbums (12 columns)
    A  ID
    B  Album Name
    C  Description
    D  Entity Type
    E  Entity ID
    F  Cover Photo ID         ← FK to Photos.ID
    G  Visibility             ← Dropdown: Public / Members / Leaders / Private
    H  Tags
    I  Created By
    J  Created At
    K  Updated At
    L  Photo Count

 38. Sermons (22 columns)
    A  ID
    B  Title
    C  Preacher ID            ← FK to Members.ID
    D  Preacher Name
    E  Date
    F  Service Type
    G  Series ID              ← FK to SermonSeries.ID
    H  Series Order
    I  Scripture Refs
    J  Topic Tags
    K  Summary
    L  Drive File ID
    M  File URL
    N  Filename
    O  File Type
    P  Audio Drive ID
    Q  Video Drive ID
    R  Status                 ← Dropdown: Draft / Submitted / Approved / Delivered / Archived
    S  Visibility             ← Dropdown: Public / Members / Leaders
    T  Created By
    U  Created At
    V  Updated At

 39. SermonSeries (12 columns)
    A  ID
    B  Series Name
    C  Description
    D  Theme Scripture
    E  Start Date
    F  End Date
    G  Preacher ID            ← FK to Members.ID
    H  Status                 ← Dropdown: Upcoming / Active / Completed
    I  Cover Image URL
    J  Sermon Count
    K  Created At
    L  Updated At

 40. SermonReviews (9 columns)
    A  ID
    B  Sermon ID              ← FK to Sermons.ID
    C  Reviewer ID            ← FK to Members.ID
    D  Reviewer Name
    E  Decision               ← Dropdown: Approved / Needs Revision / Rejected
    F  Feedback
    G  Reviewed At
    H  Created At
    I  Updated At


─── COMPASSION / BENEVOLENCE (3 tabs) ─────────────────────────────────────────

 41. CompassionRequests (21 columns)
    A  ID
    B  Requester Name
    C  Phone
    D  Email
    E  Is Member              ← TRUE / FALSE
    F  Member ID              ← FK to Members.ID
    G  Request Type           ← Dropdown: Food / Rent / Utilities / Medical / Transportation / Clothing / Other
    H  Description
    I  Urgency                ← Dropdown: Low / Normal / High / Emergency
    J  Amount Requested
    K  Amount Approved
    L  Status                 ← Dropdown: Submitted / Under Review / Approved / Partially Fulfilled / Fulfilled / Denied / Closed
    M  Assigned Team
    N  Assigned To
    O  Follow-Up Date
    P  Resolution Notes
    Q  Confidential           ← TRUE / FALSE
    R  Submitted By
    S  Approved By
    T  Created At
    U  Updated At

 42. CompassionResources (12 columns)
    A  ID
    B  Resource Name
    C  Category               ← Dropdown: Food / Clothing / Financial / Gift Cards / Household / Medical / Custom
    D  Description
    E  Quantity On Hand
    F  Unit
    G  Reorder Level
    H  Location
    I  Donated By
    J  Status                 ← Dropdown: Available / Low / Out of Stock / Discontinued
    K  Created At
    L  Updated At

 43. CompassionTeamLog (12 columns)
    A  ID
    B  Request ID             ← FK to CompassionRequests.ID
    C  Date
    D  Activity Type          ← Dropdown: Visit / Delivery / Call / Purchase / Referral / Follow-Up
    E  Team Member ID         ← FK to Members.ID
    F  Team Member Name
    G  Description
    H  Resources Used
    I  Amount Disbursed
    J  Follow-Up Needed       ← TRUE / FALSE
    K  Notes
    L  Created At


─── DISCIPLESHIP (10 tabs) ────────────────────────────────────────────────────

 44. DiscipleshipPaths (18 columns)
    A  ID
    B  Name
    C  Description
    D  Category               ← Dropdown: Foundations / Growth / Leadership / Specialty / Recovery / Youth
    E  Target Audience
    F  Difficulty Level        ← Dropdown: Beginner / Intermediate / Advanced
    G  Estimated Weeks
    H  Total Steps
    I  Prerequisite Path ID   ← FK to DiscipleshipPaths.ID
    J  Required For Leadership ← TRUE / FALSE
    K  Facilitator Guide URL
    L  Student Guide URL
    M  Status                 ← Dropdown: Draft / Published / Archived
    N  Visibility             ← Dropdown: Public / Members / Leaders
    O  Created By
    P  Approved By
    Q  Created At
    R  Updated At

 45. DiscipleshipSteps (18 columns)
    A  ID
    B  Path ID                ← FK to DiscipleshipPaths.ID
    C  Step Order
    D  Title
    E  Description
    F  Step Type              ← Dropdown: Lesson / Video / Reading / Discussion / Activity / Assessment / Reflection
    G  Duration Minutes
    H  Scripture Refs
    I  Learning Objectives
    J  Content URL
    K  Video URL
    L  Homework Description
    M  Assessment Required    ← TRUE / FALSE
    N  Passing Score
    O  Facilitator Notes
    P  Resource IDs
    Q  Created At
    R  Updated At

 46. DiscipleshipEnrollments (22 columns)
    A  ID
    B  Member ID              ← FK to Members.ID
    C  Member Name
    D  Path ID                ← FK to DiscipleshipPaths.ID
    E  Path Name
    F  Enrolled Date
    G  Target Completion
    H  Actual Completion
    I  Current Step ID        ← FK to DiscipleshipSteps.ID
    J  Steps Completed
    K  Total Steps
    L  Percent Complete
    M  Status                 ← Dropdown: Active / Paused / Completed / Dropped / Transferred
    N  Facilitator ID         ← FK to Members.ID
    O  Facilitator Name
    P  Group Cohort
    Q  Meeting Day
    R  Meeting Time
    S  Notes
    T  Enrolled By
    U  Created At
    V  Updated At

 47. DiscipleshipMentoring (18 columns)
    A  ID
    B  Mentor ID              ← FK to Members.ID
    C  Mentor Name
    D  Mentee ID              ← FK to Members.ID
    E  Mentee Name
    F  Relationship Type      ← Dropdown: One-on-One / Group / Peer / Pastoral
    G  Focus Area
    H  Start Date
    I  End Date
    J  Meeting Frequency      ← Dropdown: Weekly / Biweekly / Monthly / As Needed
    K  Meeting Day
    L  Meeting Location
    M  Status                 ← Dropdown: Active / Paused / Completed / Ended
    N  Goals
    O  Notes
    P  Created By
    Q  Created At
    R  Updated At

 48. DiscipleshipMeetings (16 columns)
    A  ID
    B  Mentoring ID           ← FK to DiscipleshipMentoring.ID
    C  Meeting Date
    D  Meeting Time
    E  Duration Minutes
    F  Location
    G  Meeting Type           ← Dropdown: In Person / Phone / Video / Hybrid
    H  Topics Covered
    I  Scripture Discussed
    J  Homework Assigned
    K  Homework Completed     ← TRUE / FALSE
    L  Prayer Requests
    M  Action Items
    N  Notes
    O  Created At
    P  Updated At

 49. DiscipleshipAssessments (22 columns)
    A  ID
    B  Member ID              ← FK to Members.ID
    C  Member Name
    D  Assessment Type         ← Dropdown: Gifts / Strengths / Growth / Readiness / Self / Peer / Facilitator
    E  Assessment Name
    F  Description
    G  Date Taken
    H  Assessed By
    I  Score Total
    J  Score Max
    K  Score Percent
    L  Results JSON
    M  Top Gifts
    N  Top Strengths
    O  Growth Areas
    P  Recommendations
    Q  Enrollment ID          ← FK to DiscipleshipEnrollments.ID
    R  Path ID                ← FK to DiscipleshipPaths.ID
    S  Status                 ← Dropdown: Completed / Pending / Expired
    T  Notes
    U  Created At
    V  Updated At

 50. DiscipleshipResources (16 columns)
    A  ID
    B  Title
    C  Description
    D  Resource Type          ← Dropdown: Book / Article / Video / Podcast / Worksheet / Guide / External
    E  Author
    F  URL
    G  Drive File ID
    H  Category
    I  Topic Tags
    J  Difficulty Level       ← Dropdown: Beginner / Intermediate / Advanced
    K  Estimated Time
    L  Path IDs
    M  Step IDs
    N  Visibility             ← Dropdown: Public / Members / Leaders
    O  Created At
    P  Updated At

 51. DiscipleshipMilestones (16 columns)
    A  ID
    B  Member ID              ← FK to Members.ID
    C  Member Name
    D  Milestone Type         ← Dropdown: Path Completed / Step Completed / Assessment Passed / Certificate Earned / Mentoring Completed / Custom
    E  Milestone Name
    F  Description
    G  Date Achieved
    H  Verified By
    I  Enrollment ID          ← FK to DiscipleshipEnrollments.ID
    J  Path ID                ← FK to DiscipleshipPaths.ID
    K  Certificate ID         ← FK to DiscipleshipCertificates.ID
    L  Ceremony Date
    M  Witness
    N  Notes
    O  Created At
    P  Updated At

 52. DiscipleshipGoals (20 columns)
    A  ID
    B  Member ID              ← FK to Members.ID
    C  Member Name
    D  Goal Category          ← Dropdown: Spiritual / Ministry / Education / Service / Personal / Leadership
    E  Goal Title
    F  Description
    G  Target Date
    H  Completion Date
    I  Status                 ← Dropdown: Active / Completed / Paused / Overdue / Abandoned
    J  Progress Percent
    K  Measurement Type       ← Dropdown: Percentage / Count / Yes-No / Scale
    L  Target Value
    M  Current Value
    N  Accountability Partner ID ← FK to Members.ID
    O  Accountability Partner Name
    P  Review Frequency       ← Dropdown: Weekly / Biweekly / Monthly / Quarterly
    Q  Last Reviewed
    R  Notes
    S  Created At
    T  Updated At

 53. DiscipleshipCertificates (14 columns)
    A  ID
    B  Member ID              ← FK to Members.ID
    C  Member Name
    D  Path ID                ← FK to DiscipleshipPaths.ID
    E  Path Name
    F  Enrollment ID          ← FK to DiscipleshipEnrollments.ID
    G  Certificate Number
    H  Issue Date
    I  Issued By
    J  Expiry Date
    K  Status                 ← Dropdown: Active / Expired / Revoked
    L  Notes
    M  Created At
    N  Updated At


─── LEARNING (12 tabs) ────────────────────────────────────────────────────────

 54. LearningTopics (16 columns)
    A  ID
    B  Topic Name
    C  Slug
    D  Description
    E  Parent Topic ID        ← FK to LearningTopics.ID (self-reference for nesting)
    F  Level
    G  Sort Order
    H  Icon URL
    I  Color Hex
    J  Featured               ← TRUE / FALSE
    K  Sermon Count
    L  Subscriber Count
    M  Status                 ← Dropdown: Active / Draft / Archived
    N  Created By
    O  Created At
    P  Updated At

 55. LearningPlaylists (22 columns)
    A  ID
    B  Title
    C  Description
    D  Cover Image URL
    E  Curator ID             ← FK to Members.ID
    F  Curator Name
    G  Topic IDs
    H  Topic Names
    I  Preacher Filter
    J  Scripture Filter
    K  Difficulty Level       ← Dropdown: Beginner / Intermediate / Advanced / Mixed
    L  Estimated Hours
    M  Item Count
    N  Subscriber Count
    O  Visibility             ← Dropdown: Public / Members / Leaders
    P  Featured               ← TRUE / FALSE
    Q  Sort Order
    R  Tags
    S  Status                 ← Dropdown: Published / Draft / Archived
    T  Created By
    U  Created At
    V  Updated At

 56. LearningPlaylistItems (16 columns)
    A  ID
    B  Playlist ID            ← FK to LearningPlaylists.ID
    C  Sermon ID              ← FK to Sermons.ID
    D  Sermon Title
    E  Preacher Name
    F  Scripture Refs
    G  Sort Order
    H  Section Label
    I  Notes for Learner
    J  Duration Mins
    K  Required               ← TRUE / FALSE
    L  Bonus                  ← TRUE / FALSE
    M  Discussion Questions
    N  Added By
    O  Created At
    P  Updated At

 57. LearningProgress (20 columns)
    A  ID
    B  Member ID              ← FK to Members.ID
    C  Member Name
    D  Sermon ID              ← FK to Sermons.ID
    E  Sermon Title
    F  Playlist ID            ← FK to LearningPlaylists.ID
    G  Playlist Title
    H  Status                 ← Dropdown: Not Started / In Progress / Completed
    I  Progress Percent
    J  Last Position Secs
    K  Total Duration Secs
    L  Started At
    M  Completed At
    N  Listen Count
    O  Last Listened At
    P  Rating                 ← 1–5
    Q  Device
    R  Notes
    S  Created At
    T  Updated At

 58. LearningNotes (16 columns)
    A  ID
    B  Member ID              ← FK to Members.ID
    C  Member Name
    D  Sermon ID              ← FK to Sermons.ID
    E  Sermon Title
    F  Playlist ID            ← FK to LearningPlaylists.ID
    G  Note Type              ← Dropdown: Note / Highlight / Question / Reflection / Quote
    H  Title
    I  Content
    J  Timestamp Secs
    K  Scripture Ref
    L  Highlight Text
    M  Shared                 ← TRUE / FALSE
    N  Pinned                 ← TRUE / FALSE
    O  Created At
    P  Updated At

 59. LearningBookmarks (14 columns)
    A  ID
    B  Member ID              ← FK to Members.ID
    C  Member Name
    D  Sermon ID              ← FK to Sermons.ID
    E  Sermon Title
    F  Preacher Name
    G  Collection
    H  Tags
    I  Notes
    J  Position Secs
    K  Priority               ← Dropdown: High / Normal / Low
    L  Reminder Date
    M  Created At
    N  Updated At

 60. LearningRecommendations (18 columns)
    A  ID
    B  Member ID              ← FK to Members.ID
    C  Member Name
    D  Sermon ID              ← FK to Sermons.ID
    E  Sermon Title
    F  Preacher Name
    G  Reason Type            ← Dropdown: Listening History / Topic Match / Scripture / Popular / Staff Pick / AI
    H  Reason Text
    I  Topic Match
    J  Scripture Match
    K  Score
    L  Priority
    M  Status                 ← Dropdown: Pending / Accepted / Dismissed
    N  Dismissed At
    O  Recommended By
    P  Recommended By Name
    Q  Created At
    R  Updated At

 61. LearningQuizzes (18 columns)
    A  ID
    B  Sermon ID              ← FK to Sermons.ID
    C  Sermon Title
    D  Playlist ID            ← FK to LearningPlaylists.ID
    E  Title
    F  Description
    G  Difficulty             ← Dropdown: Easy / Medium / Hard
    H  Pass Percent
    I  Questions JSON
    J  Question Count
    K  Time Limit Mins
    L  Attempts Allowed
    M  Topic Tags
    N  Scripture Refs
    O  Status                 ← Dropdown: Draft / Published / Archived
    P  Created By
    Q  Created At
    R  Updated At

 62. LearningQuizResults (18 columns)
    A  ID
    B  Quiz ID                ← FK to LearningQuizzes.ID
    C  Quiz Title
    D  Member ID              ← FK to Members.ID
    E  Member Name
    F  Sermon ID              ← FK to Sermons.ID
    G  Attempt Number
    H  Started At
    I  Completed At
    J  Time Taken Secs
    K  Answers JSON
    L  Correct Count
    M  Total Questions
    N  Score Percent
    O  Passed                 ← TRUE / FALSE
    P  Feedback
    Q  Created At
    R  Updated At

 63. LearningCertificates (16 columns)
    A  ID
    B  Member ID              ← FK to Members.ID
    C  Member Name
    D  Certificate Type       ← Dropdown: Playlist Completion / Quiz Mastery / Topic Mastery / Custom
    E  Playlist ID            ← FK to LearningPlaylists.ID
    F  Playlist Title
    G  Quiz ID                ← FK to LearningQuizzes.ID
    H  Quiz Title
    I  Certificate Number
    J  Issue Date
    K  Issued By
    L  Expiry Date
    M  Status                 ← Dropdown: Active / Expired / Revoked
    N  Notes
    O  Created At
    P  Updated At


─── THEOLOGY (4 tabs) ─────────────────────────────────────────────────────────

 64. TheologyCategories (12 columns)
    A  ID
    B  Category ID
    C  Title
    D  Subtitle
    E  Intro
    F  Icon
    G  Color Var
    H  Sort Order
    I  Visible                ← TRUE / FALSE
    J  Status                 ← Dropdown: Active / Draft / Archived
    K  Created At
    L  Updated At

 65. TheologySections (16 columns)
    A  ID
    B  Category Row ID        ← FK to TheologyCategories.ID
    C  Section ID
    D  Title
    E  Content
    F  Summary
    G  Scripture Refs
    H  Keywords
    I  Sort Order
    J  Visible                ← TRUE / FALSE
    K  Approved By
    L  Approved At
    M  Version
    N  Status                 ← Dropdown: Published / Draft / Under Review / Archived
    O  Created At
    P  Updated At

 66. TheologyScriptures (12 columns)
    A  ID
    B  Section Row ID         ← FK to TheologySections.ID
    C  Reference
    D  Text
    E  Translation
    F  Context Note
    G  Sort Order
    H  Is Primary             ← TRUE / FALSE
    I  Status                 ← Dropdown: Active / Archived
    J  Created By
    K  Created At
    L  Updated At

 67. TheologyRevisions (10 columns)
    A  ID
    B  Section Row ID         ← FK to TheologySections.ID
    C  Version
    D  Previous Title
    E  Previous Content
    F  Changed By
    G  Change Reason
    H  Approved By
    I  Status                 ← Dropdown: Applied / Pending / Rejected
    J  Created At


─── MEMBER CARDS (3 tabs) ─────────────────────────────────────────────────────

 68. MemberCards (30 columns)
    A  ID
    B  Member Number
    C  Email
    D  First Name
    E  Last Name
    F  Preferred Name
    G  Suffix
    H  Photo URL
    I  Card Title
    J  Card Bio
    K  Ministry
    L  Small Group
    M  Phone
    N  Phone Visible          ← TRUE / FALSE
    O  Email Visible          ← TRUE / FALSE
    P  Website URL
    Q  Schedule URL
    R  Color Scheme
    S  BG Scheme
    T  Card Icon
    U  Show Daily Bread       ← TRUE / FALSE
    V  Show Prayer Ticker     ← TRUE / FALSE
    W  Card Footer
    X  Visibility             ← Dropdown: Public / Members / Private
    Y  View Count
    Z  Active                 ← TRUE / FALSE
    AA Status                 ← Dropdown: Active / Pending / Disabled
    AB Created By
    AC Created At
    AD Updated At

 69. MemberCardLinks (12 columns)
    A  ID
    B  Card Row ID            ← FK to MemberCards.ID
    C  Link Type              ← Dropdown: Social / Ministry / Personal / Custom
    D  Label
    E  Icon
    F  URL
    G  Sort Order
    H  Visible                ← TRUE / FALSE
    I  Platform
    J  Status                 ← Dropdown: Active / Hidden
    K  Created At
    L  Updated At

 70. MemberCardViews (8 columns)
    A  ID
    B  Card Row ID            ← FK to MemberCards.ID
    C  Member Number
    D  Viewer Email
    E  View Source
    F  User Agent
    G  IP Hash
    H  Viewed At


─── AUTH & CONFIG (6 tabs) ────────────────────────────────────────────────────

 71. AuthUsers (10 columns)
    A  Email
    B  Passcode
    C  Passcode Hash
    D  Salt
    E  First Name
    F  Last Name
    G  Role                   ← Dropdown: readonly / volunteer / care / leader / pastor / admin
    H  Status                 ← Dropdown: active / inactive / suspended / pending
    I  Created At
    J  Updated At

 72. UserProfiles (10 columns)
    A  Email
    B  Display Name
    C  Photo URL
    D  Phone
    E  Bio
    F  Timezone
    G  Language
    H  Notifications
    I  Theme
    J  Updated At

 73. AccessControl (8 columns)
    A  Email
    B  Role
    C  Display Name
    D  Groups
    E  Active                 ← TRUE / FALSE
    F  Notes
    G  Created At
    H  Updated At

 74. AuthAudit (4 columns)
    A  Timestamp
    B  Event
    C  Email
    D  Details

 75. AuditLog (7 columns)
    A  Timestamp
    B  Email
    C  Role
    D  Action
    E  Tab
    F  Row Ref
    G  Details

 76. AppConfig (6 columns)
    A  Key
    B  Value
    C  Description
    D  Category
    E  Updated By
    F  Updated At

    Notable Display keys stored in AppConfig:
      FONT_SCALE             — Desktop font-size percentage (default 100)
      FONT_SCALE_MOBILE      — Mobile font-size percentage (default 100)
      INTERFACE_OVERRIDES    — JSON blob from Interface Studio containing:
                                vars (CSS variables), fonts (body/heading),
                                sizes (per-selector font-size), pads (per-
                                selector padding), custom (raw CSS)
                               See Config.txt → INTERFACE STUDIO CONTROL
                               REFERENCE for the full mapping.
      PROVISIONING_URLS       — JSON blob from Provisioning panel containing:
                                FLOCK_ENDPOINTS[3], APP_ENDPOINTS[3],
                                MISSIONS_ENDPOINTS[3], EXTRA_ENDPOINTS[3]
                                (4 APIs × 3 tiers = 12 URLs), plus toggles:
                                TIER_PRIMARY (default ON), TIER_SECONDARY
                                (default OFF), TIER_TERTIARY (default OFF),
                                RANDOMIZE (default OFF).
                               See Config.txt → PROVISIONING REFERENCE.


════════════════════════════════════════════════════════════════════════════════
 DATABASE 2 — STATISTICS & EXTRA  (EXTRA API / Luke)
 "I myself have carefully investigated everything." — Luke 1:3–4
 Auth: RBAC · 53 tabs · expansion/ExtraAPI-setup.gs
════════════════════════════════════════════════════════════════════════════════


─── STATISTICS (3 tabs) ────────────────────────────────────────────────────────

 77. StatisticsConfig (18 columns)
    A  ID
    B  Slot                   ← h1–h50 mapping
    C  Label
    D  Description
    E  Category
    F  Source Tab
    G  Source Column
    H  Calc Type              ← Dropdown: Count / Sum / Average / Min / Max / Custom
    I  Filter Field
    J  Filter Value
    K  Date Field
    L  Format Type            ← Dropdown: Number / Percent / Currency / Date
    M  Unit Label
    N  Display Order
    O  Widget Type            ← Dropdown: Card / Chart / Table / Gauge
    P  Active                 ← TRUE / FALSE
    Q  Created At
    R  Updated At

 78. StatisticsSnapshots (58 columns)
    A  ID
    B  Snapshot Date
    C  Period Type             ← Dropdown: Daily / Weekly / Monthly / Quarterly / Annual
    D  Period Label
    E–BB  h1 through h50      ← 50 computed metric slots (mapped via StatisticsConfig)
    BC Notes
    BD Created By
    BE Created At
    BF Status                 ← Dropdown: Auto / Manual / Draft

 79. StatisticsCustomViews (14 columns)
    A  ID
    B  View Name
    C  Description
    D  Layout Type            ← Dropdown: Grid / List / Dashboard
    E  Slots Included
    F  Chart Type             ← Dropdown: Bar / Line / Pie / Radar / Table
    G  Period Type
    H  Date Range
    I  Role Required          ← Dropdown: leader / pastor / admin
    J  Is Default             ← TRUE / FALSE
    K  Sort By
    L  Created By
    M  Created At
    N  Updated At


 80. JournalEntries (10 columns)
    A  ID
    B  User Email
    C  Title
    D  Entry
    E  Category               ← e.g. Devotion, Reflection, Prayer, Gratitude
    F  Scripture Reference
    G  Mood                   ← e.g. Peaceful, Grateful, Struggling, Hopeful
    H  Private                ← TRUE / FALSE
    I  Created At
    J  Updated At


─── FUTURE FEATURE SLOTS (49 tabs) ────────────────────────────────────────────

 81–129. Extra_01 through Extra_49 (50 columns each)
    Each tab has generic columns: c01, c02, c03, c04, c05 … c50
    Rename tabs and columns as new features are built.
    49 tabs × 50 columns = 2,450 reserved columns.


════════════════════════════════════════════════════════════════════════════════
 DATABASE 3 — MISSIONS  (MISSIONS API / Mark)
 "Go into all the world and preach the gospel." — Mark 16:15
 Auth: RBAC · 56 tabs · missions-api/Gospel.gs (✅ BUILT)
════════════════════════════════════════════════════════════════════════════════


─── STRUCTURED TABS (8 tabs) ──────────────────────────────────────────────────

 130. MissionsRegistry (28 columns)
    A  ID
    B  Country Name
    C  ISO Code
    D  Icon
    E  Tab Name               ← Exact worksheet tab name for this country
    F  10/40 Window           ← TRUE / FALSE
    G  Continent
    H  Population
    I  Capital
    J  Official Language
    K  Dominant Religion
    L  Persecution Rank
    M  Persecution Score
    N  Persecution Level      ← Dropdown: Extreme / Very High / High / Moderate
    O  Gospel Access           ← Dropdown: Unreached / Limited / Restricted / Open
    P  Unreached People Groups
    Q  Total People Groups
    R  % Evangelical
    S  % Christian
    T  Freedom Index
    U  Region Count
    V  City Count
    W  Partner Count
    X  Last Update At
    Y  Status                 ← Dropdown: Active / Monitoring / Archived
    Z  Sort Order
    AA Created At
    AB Updated At

 131. MissionsRegions (24 columns)
    A  ID
    B  Country ID             ← FK to MissionsRegistry.ID
    C  Region Name
    D  Region Type            ← Dropdown: State / Province / Territory / District
    E  Population
    F  Coordinates
    G  Color Hex
    H  Dominant Religion
    I  % Christian
    J  Literacy Rate
    K  Persecution Level      ← Dropdown: Extreme / Very High / High / Moderate / Low
    L  Gospel Access
    M  Unreached Groups
    N  Security Threat        ← Dropdown: Critical / High / Moderate / Low
    O  Humanitarian Need      ← Dropdown: Critical / High / Moderate / Low
    P  Media Restriction      ← Dropdown: Total / Severe / Moderate / Minimal
    Q  Church Presence         ← Dropdown: None / Underground / Scattered / Growing / Established
    R  Missionary Access      ← Dropdown: Closed / Restricted / Limited / Open
    S  Primary Hurdle
    T  Notes
    U  Status
    V  Sort Order
    W  Created At
    X  Updated At

 132. MissionsCities (30 columns)
    A  ID
    B  Country ID             ← FK to MissionsRegistry.ID
    C  Region ID              ← FK to MissionsRegions.ID
    D  City Name
    E  City Type              ← Dropdown: Capital / Major City / City / Town / Village
    F  Population
    G  Coordinates
    H  Color Hex
    I  Literacy Rate
    J  Dominant Religion
    K  % Christian
    L  Persecution Level
    M  Violence Level         ← Dropdown: Extreme / High / Moderate / Low
    N  Church Life
    O  National Life
    P  Social Life
    Q  Private Life
    R  Family Life
    S  Gospel Access
    T  Media Restriction
    U  Security Threat
    V  Humanitarian Need
    W  Missionary Access
    X  Church Presence
    Y  Primary Hurdle
    Z  Prayer Focus
    AA Notes
    AB Status
    AC Created At
    AD Updated At

 133. MissionsPartners (20 columns)
    A  ID
    B  Organization Name
    C  Partner Type            ← Dropdown: Sending Agency / Field Team / Translation / Media / Humanitarian / Church Network
    D  Country IDs
    E  Contact Name
    F  Contact Email
    G  Contact Phone
    H  Website
    I  Focus Area
    J  Description
    K  Workers Count
    L  Relationship Status    ← Dropdown: Active / Exploring / Paused / Ended
    M  Financial Support      ← TRUE / FALSE
    N  Prayer Support         ← TRUE / FALSE
    O  Last Contact At
    P  Security Level         ← Dropdown: Open / Sensitive / Restricted / Classified
    Q  Notes
    R  Status
    S  Created At
    T  Updated At

 134. MissionsPrayerFocus (16 columns)
    A  ID
    B  Country ID             ← FK to MissionsRegistry.ID
    C  City ID                ← FK to MissionsCities.ID
    D  Title
    E  Description
    F  Scripture
    G  Start Date
    H  End Date
    I  Priority               ← Dropdown: Urgent / High / Normal
    J  People Group
    K  Prayer Points
    L  Responses Count
    M  Created By
    N  Status                 ← Dropdown: Active / Completed / Upcoming
    O  Created At
    P  Updated At

 135. MissionsUpdates (16 columns)
    A  ID
    B  Country ID             ← FK to MissionsRegistry.ID
    C  City ID                ← FK to MissionsCities.ID
    D  Title
    E  Body
    F  Update Type            ← Dropdown: Situation Report / Prayer Alert / Victory Report / Analysis / Breaking
    G  Severity               ← Dropdown: Critical / High / Moderate / Informational
    H  Source
    I  Verified               ← TRUE / FALSE
    J  Security Level         ← Dropdown: Open / Sensitive / Restricted
    K  Published              ← TRUE / FALSE
    L  Published By
    M  Attachment URL
    N  Notes
    O  Created At
    P  Updated At

 136. MissionsTeams (20 columns)
    A  ID
    B  Team Name
    C  Country ID             ← FK to MissionsRegistry.ID
    D  Team Lead ID           ← FK to Members.ID (FLOCK CRM)
    E  Team Lead Name
    F  Member IDs
    G  Member Names
    H  Member Count
    I  Trip Type              ← Dropdown: Short-Term / Long-Term / Survey / Prayer Journey / Humanitarian / Training
    J  Start Date
    K  End Date
    L  Budget
    M  Raised
    N  Objectives
    O  Partner ID             ← FK to MissionsPartners.ID
    P  Trip Status            ← Dropdown: Planning / Fundraising / Ready / On Field / Completed / Debriefing / Cancelled
    Q  Debrief Notes
    R  Notes
    S  Created At
    T  Updated At

 137. MissionsMetrics (20 columns)
    A  ID
    B  Country ID             ← FK to MissionsRegistry.ID
    C  Year
    D  Persecution Rank
    E  Persecution Score
    F  Violence Score
    G  Pressure Score
    H  Church Life Score
    I  National Life Score
    J  Social Life Score
    K  Private Life Score
    L  Family Life Score
    M  Population
    N  % Christian
    O  % Evangelical
    P  Unreached Groups
    Q  Source
    R  Notes
    S  Created At
    T  Updated At


─── COUNTRY DOSSIER TABS (48 tabs) ───────────────────────────────────────────

 Each country tab has 6 columns:
    A  Region
    B  Population
    C  Literacy
    D  Coordinates
    E  Color
    F  Risk Level

 138. Afghanistan            162. Libya
 139. Algeria                163. Malaysia
 140. Bangladesh             164. Maldives
 141. Belarus                165. Mali
 142. Bhutan                 166. Mauritania
 143. Cambodia               167. Mexico
 144. China                  168. Morocco
 145. Colombia               169. Myanmar
 146. Djibouti               170. Nepal
 147. Egypt                  171. Nigeria
 148. Eritrea                172. NKorea
 149. France                 173. Oman
 150. Germany                174. Pakistan
 151. Guatemala              175. Qatar
 152. India                  176. Russia
 153. Iran                   177. Saudi
 154. Iraq                   178. Somalia
 155. Japan                  179. Sri
 156. Kuwait                 180. Sudan
 157. Laos                   181. Syria
 158. Tajikstan              182. Thailand
 159. Turkey                 183. Turkmenistan
 160. UK                     184. Uzbekistan
 161. Vietnam                185. Yemen


════════════════════════════════════════════════════════════════════════════════
 DATABASE 4 — MASTER_API  (APP API / Matthew)
 "Go and make disciples of all nations, teaching them…" — Matt 28:19
 Auth: None (public) · 12 tabs · app-api/Truth.gs (✅ BUILT)
════════════════════════════════════════════════════════════════════════════════


 186. Books (7 columns)
    A  Book Name              ← e.g. "Genesis"
    B  Testament              ← Old / New
    C  Genre                  ← Historical / Law / Poetry / Prophetic / Gospel / Epistle / Apocalyptic
    D  Summary
    E  Core Theology
    F  Practical Application
    G  ID / Book Number

 187. Genealogy (8 columns)
    A  Name                   ← Character name
    B  Title                  ← Role (e.g. "King of Israel")
    C  Lifespan               ← Years / dates
    D  Meaning                ← Etymology of name
    E  Reference              ← Scripture passage
    F  Bio                    ← Life summary
    G  Children               ← Comma-separated
    H  ID

 188. Counseling (7 columns)
    A  Title                  ← Protocol name (e.g. "Grief Support")
    B  Icon                   ← Emoji or icon code
    C  Color                  ← Hex color
    D  Definition             ← What the protocol addresses
    E  Scriptures             ← Bible passages
    F  Steps                  ← Tactical guidance
    G  ID

 189. Devotionals (7 columns)
    A  Date                   ← Calendar date
    B  Title                  ← Devotional name
    C  Theme                  ← Daily focus
    D  Scripture              ← Bible passage for the day
    E  Reflection             ← Meditative content
    F  Question               ← Reflection prompt
    G  Prayer                 ← Closing prayer

 190. Reading (4 columns)
    A  Old Testament          ← OT reading passage
    B  New Testament          ← NT reading passage
    C  Psalms                 ← Psalm reading
    D  Proverbs               ← Proverbs reading

 191. Words (10 columns)
    A  English                ← English term
    B  Strong's               ← Strong's Concordance ID
    C  Original               ← Hebrew/Greek root
    D  Transliteration
    E  Definition
    F  Nuance                 ← Contextual significance
    G  Testament              ← Old / New
    H  Theme                  ← Theological category
    I  Usage Count
    J  Verses                 ← Key passage references

 192. Heart (6 columns)
    A  Question ID
    B  Category               ← Spiritual dimension (e.g. "Prayer Life")
    C  Chart Axis             ← Label for diagnostic radar chart
    D  Question               ← Diagnostic question text
    E  Prescription           ← Faith response / action
    F  Verse Reference        ← Supporting Scripture

 193. Mirror (9 columns)
    A  Category ID
    B  Category Title
    C  Color                  ← Hex color code
    D  Chart Label            ← Radar chart axis label
    E  Question ID
    F  Question               ← Triage question
    G  Prescription           ← Recommended action
    H  Scripture              ← Bible verse
    I  Slug                   ← URL-safe identifier

 194. Theology (6 columns)
    A  Category ID
    B  Category Title
    C  Category Intro         ← Overview paragraph
    D  Section ID
    E  Section Title
    F  Content                ← Full theological explanation

 195. Config (2 columns)
    A  Key
    B  Value

 196. Quiz (10 columns)
    A  ID
    B  Question               ← Quiz question text
    C  Option A
    D  Option B
    E  Option C
    F  Option D
    G  Correct Answer         ← a / b / c / d
    H  Reference              ← Scripture or source
    I  Category               ← Subject area
    J  Difficulty              ← Easy / Medium / Hard

 197. Apologetics (11 columns)
    A  Category ID
    B  Category Title
    C  Category Color         ← Hex color
    D  Category Intro
    E  Question ID
    F  Question Title
    G  Short Title
    H  Answer Content         ← Biblical answer paragraph
    I  Quote Text             ← Key biblical quote
    J  Reference Text         ← Citation
    K  Reference URL          ← Link to source


════════════════════════════════════════════════════════════════════════════════
 FOREIGN KEY MAP — Cross-Tab Relationships
════════════════════════════════════════════════════════════════════════════════

 WITHIN FLOCK CRM:

   Members.ID ────────────► PrayerRequests.Member ID
                          ► ContactLog.Member ID
                          ► PastoralNotes.Member ID
                          ► Milestones.Member ID
                          ► ToDo.Assigned Member ID
                          ► ToDo.Entity ID  (when Entity Type = 'Members')
                          ► Attendance.Member ID
                          ► EventRSVPs.Member ID
                          ► SmallGroupMembers.Member ID
                          ► Giving.Member ID
                          ► GivingPledges.Member ID
                          ► VolunteerSchedule.Member ID
                          ► CommsMessages.Sender ID
                          ► CommsNotificationPrefs.Member ID
                          ► SpiritualCareCases.Member ID
                          ► SpiritualCareCases.Primary Caregiver ID
                          ► SpiritualCareCases.Secondary Caregiver ID
                          ► SpiritualCareInteractions.Caregiver ID
                          ► SpiritualCareAssignments.Caregiver ID
                          ► SpiritualCareAssignments.Member ID
                          ► OutreachContacts.Member ID (converted)
                          ► OutreachCampaigns.Lead ID
                          ► OutreachFollowUps.By ID
                          ► Photos.Uploaded By
                          ► Sermons.Preacher ID
                          ► SermonSeries.Preacher ID
                          ► SermonReviews.Reviewer ID
                          ► CompassionRequests.Member ID
                          ► CompassionTeamLog.Team Member ID
                          ► DiscipleshipEnrollments.Member ID
                          ► DiscipleshipEnrollments.Facilitator ID
                          ► DiscipleshipMentoring.Mentor ID
                          ► DiscipleshipMentoring.Mentee ID
                          ► DiscipleshipAssessments.Member ID
                          ► DiscipleshipMilestones.Member ID
                          ► DiscipleshipGoals.Member ID
                          ► DiscipleshipGoals.Accountability Partner ID
                          ► DiscipleshipCertificates.Member ID
                          ► Learning*.Member ID (all 12 learning tabs)
                          ► MemberCards.Email
                          ► AuthUsers.Email
                          ► UserProfiles.Email
                          ► Ministries.Ministry Lead ID
                          ► Ministries.Co-Lead ID
                          ► MinistryMembers.Member ID
                          ► ServicePlans.Preacher ID
                          ► ServicePlans.Worship Leader ID
                          ► ServicePlanItems.Assigned To ID

   SmallGroups.ID ────────► SmallGroupMembers.Group ID
                          ► PrayerRequests.Group ID
                          ► PastoralNotes.Group ID

   Events.ID ────────────► EventRSVPs.Event ID
                          ► CheckInSessions.Event ID

   Households.Household ID ► Members.Household ID

   Ministries.ID ────────► MinistryMembers.Ministry ID
                          ► SpiritualCareAssignments.Ministry ID
                          ► SpiritualCareCases.Assigned Team ID
                          ► OutreachCampaigns.Ministry ID

   ServicePlans.ID ──────► ServicePlanItems.Plan ID

   CommsThreads.ID ──────► CommsMessages.Thread ID
                          ► CommsReadReceipts.Thread ID

   CommsChannels.ID ─────► CommsThreads.Channel ID
                          ► CommsBroadcastLog.Channel ID

   CommsTemplates.ID ────► CommsBroadcastLog.Template ID

   CommsMessages.ID ─────► CommsMessages.Reply-To ID (self-ref)
                          ► CommsReadReceipts.Message ID
                          ► CommsChannels.Pinned Message ID

   Sermons.ID ──────────► SermonReviews.Sermon ID
                          ► LearningPlaylistItems.Sermon ID
                          ► LearningProgress.Sermon ID
                          ► LearningNotes.Sermon ID
                          ► LearningBookmarks.Sermon ID
                          ► LearningRecommendations.Sermon ID
                          ► LearningQuizzes.Sermon ID
                          ► LearningQuizResults.Sermon ID

   SermonSeries.ID ──────► Sermons.Series ID

   PhotoAlbums.ID ───────► Photos.Album ID

   Photos.ID ────────────► PhotoAlbums.Cover Photo ID

   CompassionRequests.ID ► CompassionTeamLog.Request ID

   DiscipleshipPaths.ID ─► DiscipleshipPaths.Prerequisite Path ID (self-ref)
                          ► DiscipleshipSteps.Path ID
                          ► DiscipleshipEnrollments.Path ID
                          ► DiscipleshipAssessments.Path ID
                          ► DiscipleshipMilestones.Path ID
                          ► DiscipleshipCertificates.Path ID

   DiscipleshipSteps.ID ─► DiscipleshipEnrollments.Current Step ID

   DiscipleshipEnrollments.ID ► DiscipleshipAssessments.Enrollment ID
                               ► DiscipleshipMilestones.Enrollment ID
                               ► DiscipleshipCertificates.Enrollment ID

   DiscipleshipMentoring.ID ► DiscipleshipMeetings.Mentoring ID

   DiscipleshipCertificates.ID ► DiscipleshipMilestones.Certificate ID

   LearningTopics.ID ────► LearningTopics.Parent Topic ID (self-ref)

   LearningPlaylists.ID ► LearningPlaylistItems.Playlist ID
                          ► LearningProgress.Playlist ID
                          ► LearningNotes.Playlist ID
                          ► LearningCertificates.Playlist ID

   LearningQuizzes.ID ──► LearningQuizResults.Quiz ID
                          ► LearningCertificates.Quiz ID

   TheologyCategories.ID ► TheologySections.Category Row ID

   TheologySections.ID ──► TheologyScriptures.Section Row ID
                          ► TheologyRevisions.Section Row ID

   MemberCards.ID ───────► MemberCardLinks.Card Row ID
                          ► MemberCardViews.Card Row ID

   OutreachCampaigns.ID ► OutreachContacts.Campaign ID

   OutreachContacts.ID ──► OutreachFollowUps.Contact ID


 POLYMORPHIC FK (ToDo.Entity Type + ToDo.Entity ID):

   ToDo links tasks to ANY entity in the system. Entity Type names the tab,
   Entity ID references the row ID. Supported Entity Types:
     Members, PrayerRequests, PastoralNotes, Events, SmallGroups,
     SpiritualCareCases, OutreachContacts, OutreachCampaigns,
     CompassionRequests, Ministries, Sermons, DiscipleshipEnrollments,
     DiscipleshipMentoring, Giving, Attendance, VolunteerSchedule,
     ServicePlans, LearningPlaylists, MissionsRegistry, Households,
     Milestones, Other


 CROSS-DATABASE FK:

   Members.ID (FLOCK) ──► MissionsTeams.Team Lead ID (MISSIONS)
     ↳ Small group leaders, pastors who lead mission trips have their
       member record in FLOCK CRM but are referenced by ID in MISSIONS.


════════════════════════════════════════════════════════════════════════════════
 END OF REFERENCE · 201 tabs · 4 databases
══════════════════════════════════════════════════════════════════════════════════
```

---

# 7. Frontend-Backend Wiring Audit

> *Source: Revelation/8_Wiring.txt*

```
═══════════════════════════════════════════════════════════════════════════════
  FLOCKOS WIRING AUDIT — Frontend ↔ Backend Parameter Contracts
  Last Updated: 2026-03-24
═══════════════════════════════════════════════════════════════════════════════

This document maps every frontend-to-backend connection in FlockOS. It serves
as the single source of truth for parameter naming, the definitive list of
known issues, and the conventions that prevent future wiring bugs.


═══════════════════════════════════════════════════════════════════════════════
  1. CORE CONVENTION: ID-BASED LOOKUPS
═══════════════════════════════════════════════════════════════════════════════

RULE: All update/delete operations MUST identify records by `params.id` (UUID).
Never use `params.rowIndex` — row numbers shift when rows are inserted/deleted.

Frontend pattern (the_tabernacle.js _edit() at ~L360):
  data.id = id;          // UUID from column A
  updateFn(data);        // calls TheVine.flock.<module>.update(data)

Backend pattern (correct):
  var hit = findRowById(db(), TAB_NAME, NUM_COLS, params.id);
  if (!hit) return jsonErr('Record not found.');
  var rowIndex = hit.rowIndex;
  var existing = hit.vals;

findRowById() is defined in Utilities.gs (L65):
  function findRowById(ss, tabName, numCols, id)
  → Returns { rowIndex: Number, vals: Array } or null


═══════════════════════════════════════════════════════════════════════════════
  2. MODULES VERIFIED CORRECT (✅)
═══════════════════════════════════════════════════════════════════════════════

These modules correctly accept params.id and use findRowById() or equivalent:

  Module              File                    Pattern Used
  ──────────────────  ──────────────────────  ─────────────────────────────
  Cards (Directory)   Cards.gs                findRowById()
  Care                Care.gs                 findRowById() — fixed 2026-03-21
  Communications      Communications.gs       findRowById()
  Discipleship        Discipleship.gs         ID scan loop
  Learning            Learning.gs             findRowById()
  Outreach            Outreach.gs             Dual-mode (accepts both id & rowIndex)
  Statistics          Statistics.gs           findRowById()
  Theology            Theology.gs             findRowById()
  Todo                Todo.gs                 ID scan loop
  Database (Prayer)   Database.gs             ID scan loop
  Database (Journal)  Database.gs             ID scan loop
  Database (Members)  Database.gs             Strict ID-first — fixed 2026-03-22
  Auth                Auth.gs                 Email-based (no row lookup needed)
  Notifications       Communications.gs       findRowById()


═══════════════════════════════════════════════════════════════════════════════
  3. MODULES WITH BROKEN WIRING — ALL FIXED 2026-03-21
═══════════════════════════════════════════════════════════════════════════════

All handlers below have been converted from params.rowIndex to findRowById().
Zero remaining params.rowIndex references outside the intentional dual-mode
resolver in Outreach.gs resolveOutreachContactRow_().

─── Songs.gs ──────────────────────────────────────────────────────────────────

  HANDLER                         LINE    TAB                    SEVERITY
  handleSongsUpdate()             ~136    Songs                  CRITICAL
  handleSongsDelete()             ~169    Songs                  CRITICAL
  handleArrangementsUpdate()      ~292    SongArrangements       CRITICAL
  handleArrangementsDelete()      ~319    SongArrangements       CRITICAL
  handleSetlistSongsUpdate()      ~412    SetlistSongs           CRITICAL

  Frontend calls:
    TheVine.flock.songs.update(params)       → sends { id: "uuid", ... }
    TheVine.flock.songs.delete(params)       → sends { id: "uuid" }
    TheVine.flock.songs.arrangements.update  → sends { id: "uuid", ... }
    TheVine.flock.songs.arrangements.delete  → sends { id: "uuid" }
    TheVine.flock.songs.setlistSongs.update  → sends { id: "uuid", ... }

  Fix: Replace rowIndex pattern with findRowById(db(), TAB, NUM_COLS, params.id)

─── Photos.gs ─────────────────────────────────────────────────────────────────

  HANDLER                         LINE    TAB                    SEVERITY
  handlePhotosUpdate()            ~303    Photos                 CRITICAL
  handlePhotosDelete()            ~338    Photos                 CRITICAL
  handleAlbumsUpdate()            ~514    PhotoAlbums            CRITICAL
  handleAlbumsDelete()            ~541    PhotoAlbums            CRITICAL

  Frontend calls:
    TheVine.flock.photos.update(params)      → sends { id: "uuid", ... }
    TheVine.flock.photos.delete(params)      → sends { id: "uuid" }
    TheVine.flock.photos.albums.update       → sends { id: "uuid", ... }
    TheVine.flock.photos.albums.delete       → sends { id: "uuid" }

  Fix: Replace rowIndex pattern with findRowById(db(), TAB, NUM_COLS, params.id)

─── Sermons.gs ────────────────────────────────────────────────────────────────

  HANDLER                         LINE    TAB                    SEVERITY
  handleSermonsUpdate()           ~369    Sermons                CRITICAL
  handleSermonsDelete()           ~472    Sermons                CRITICAL
  handleSermonSeriesUpdate()      ~568    SermonSeries           CRITICAL

  Frontend calls:
    TheVine.flock.sermons.update(params)     → sends { id: "uuid", ... }
    TheVine.flock.sermons.delete(params)     → sends { id: "uuid" }
    TheVine.flock.sermons.series.update      → sends { id: "uuid", ... }

  Fix: Replace rowIndex pattern with findRowById(db(), TAB, NUM_COLS, params.id)

─── Services.gs ───────────────────────────────────────────────────────────────

  HANDLER                         LINE    TAB                    SEVERITY
  handleServicePlansUpdate()      ~119    ServicePlans           HIGH
  handleServiceItemsUpdate()      ~323    ServicePlanItems       HIGH
  handleServiceItemsDelete()      ~346    ServicePlanItems       HIGH

  Frontend calls:
    TheVine.flock.services.plans.update      → sends { id: "uuid", ... }
    TheVine.flock.services.items.update      → sends { id: "uuid", ... }
    TheVine.flock.services.items.delete      → sends { id: "uuid" }

  Fix: Replace rowIndex pattern with findRowById(db(), TAB, NUM_COLS, params.id)

─── Ministries.gs ─────────────────────────────────────────────────────────────

  HANDLER                         LINE    TAB                    SEVERITY
  handleMinistriesUpdate()        ~126    Ministries             HIGH
  handleMinistryMembersUpdate()   ~300    MinistryMembers        HIGH

  Frontend calls:
    TheVine.flock.ministries.update(params)  → sends { id: "uuid", ... }
    TheVine.flock.ministries.members.update  → sends { id: "uuid", ... }

  Fix: Replace rowIndex pattern with findRowById(db(), TAB, NUM_COLS, params.id)

─── Compassion.gs ─────────────────────────────────────────────────────────────

  HANDLER                              LINE    TAB                    SEVERITY
  handleCompassionRequestsUpdate()     ~223    CompassionRequests     CRITICAL

  Frontend calls:
    TheVine.flock.compassion.requests.update → sends { id: "uuid", ... }

  Fix: Replace rowIndex pattern with findRowById(db(), TAB, NUM_COLS, params.id)


═══════════════════════════════════════════════════════════════════════════════
  4. FIX HISTORY (All params.rowIndex → findRowById Conversions)
═══════════════════════════════════════════════════════════════════════════════

  DATE        MODULE          HANDLERS FIXED                          COUNT
  ──────────  ──────────────  ────────────────────────────────────    ─────
  2026-03-21  Care.gs         handleCareUpdate                         5
                              handleCareResolve
                              handleCareInteractionsFollowUpDone
                              handleCareAssignmentsEnd
                              handleCareAssignmentsReassign

  2026-03-21  Songs.gs        handleSongsUpdate                        6
                              handleSongsDelete
                              handleArrangementsUpdate
                              handleArrangementsDelete
                              handleSetlistSongsUpdate
                              handleSetlistSongsRemove

  2026-03-21  Photos.gs       handlePhotosUpdate                       4
                              handlePhotosDelete
                              handleAlbumsUpdate
                              handleAlbumsDelete

  2026-03-21  Sermons.gs      handleSermonsUpload                      7
                              handleSermonsUpdate
                              handleSermonsSubmit
                              handleSermonsApprove
                              handleSermonsDeliver
                              handleSermonsDelete
                              handleSermonSeriesUpdate

  2026-03-21  Services.gs     handleServicePlansUpdate                 3
                              handleServiceItemsUpdate
                              handleServiceItemsDelete

  2026-03-21  Ministries.gs   handleMinistriesUpdate                   2
                              handleMinistryMembersUpdate

  2026-03-21  Compassion.gs   handleCompassionRequestsUpdate           5
                              handleCompassionRequestsApprove
                              handleCompassionRequestsDeny
                              handleCompassionRequestsResolve
                              handleCompassionResourcesUpdate

  2026-03-21  Outreach.gs     handleOutreachCampaignsUpdate            2
                              handleOutreachFollowUpsDone

  2026-03-21  Database.gs     handleEventsGet (simplified)             9
                              handleEventsUpdate
                              handleEventsCancel
                              handleGroupsUpdate
                              handleGivingUpdate
                              handleVolunteersUpdate
                              handleVolunteersSwap
                              handleCommsSend
                              handleCheckInClose

  2026-03-21  Notifications   notifClick() field mapping fix           —
              (admin HTML)    _notifIcon() expansion
                              renderNotifPanel() unread check

  2026-03-21  UI Rename       "Prayer Wall" → "Prayer Request"         13
              (6 files)       index.html (nav, card, viewTitles)
                              the_tabernacle.js (meta, shell, buttons, links)
                              the_good_shepherd.html (nav)
                              README.md

  2026-03-21  Genealogy       Click-to-navigate for Children & Parents   —
              (the_tabernacle.js)  _geneJumpTo() helper: opens A-Z detail card
                              Children links: clickable → jump to child
                              Parents row: reverse-lookup → jump to parent
                              Lineage Path: node names clickable → A-Z card

  2026-03-22  the_life.js     My Flock Portal extracted (2,176 lines)    —
              (Acts)        Pastoral hub: role-aware member/care display
                              openAddMember / saveMember full-page editor
                              Admin account creation section (new members)
                              Auto-create care assignment on member add
                              _audit() for all save operations
                              Lazy tab rendering + parallelize _ensureDir

  2026-03-22  the_life.js     _memberOpts UUID-first fix                  1
              (Acts)        Changed: value: m.email || m.id
                           →  value: m.id || m.email
                              Ensures UUID is used as the dropdown value
                              when a Members-table record is available.

  2026-03-22  the_life.js     _fpMemberId pinned to server UUID           1
              (Acts)        openAddMember() now updates _fpMemberId to
                              rec.id (UUID) after members.get resolves.
                              Even if editing was initiated via email,
                              update always sends the correct row UUID.

  2026-03-22  Database.gs     handleMembersGet — strict ID-first match    1
              (4-John)        Old: (id && MEM.ID===id) || (email && EMAIL===email)
                              New: (id && MEM.ID===id) || (!id && email && EMAIL===email)
                              Prevents email fallback from matching wrong
                              row when ID is provided but not found.

  2026-03-22  Database.gs     handleMembersUpdate — strict ID-first       1
              (4-John)        Same OR→guarded fix as handleMembersGet.
                              Critical: without this, members.update with
                              an ID could silently overwrite a different
                              member's row via the email fallback path.
                              Root cause of admin lockout bug.


═══════════════════════════════════════════════════════════════════════════════
  5. FIELD NAME CONTRACTS
═══════════════════════════════════════════════════════════════════════════════

Backend RowToObject()    Frontend Expects     Notes
────────────────────     ──────────────────   ──────────────────────────────
.id                      .id                  UUID string — always present
.index                   .index               Row number (for display only)
.status                  .status              Capitalized: "Active", "Unread"
.createdAt               .createdAt           ISO date string
.updatedAt               .updatedAt           ISO date string
.notifType               .notifType           NOT .type — fixed 2026-03-21
.entityType              .entityType          NOT .category — fixed 2026-03-21
.entityId                .entityId            Related record UUID
.title                   .title               Notification title
.body                    .body                Notification body text


═══════════════════════════════════════════════════════════════════════════════
  6. CONVENTIONS TO PREVENT FUTURE WIRING BUGS
═══════════════════════════════════════════════════════════════════════════════

1. BACKEND: Always accept params.id for record lookups.
   Use findRowById(db(), TAB, NUM_COLS, params.id) from Utilities.gs.
   Never accept params.rowIndex for new handlers.

2. BACKEND: RowToObject functions must use exact field names.
   The frontend consumes these objects directly — no renaming.

3. FRONTEND: _edit() sets data.id automatically.
   Module renderers should never set data.rowIndex.

4. FRONTEND: API calls must go through TheVine.
   Never call google.script.run or fetch() directly.

5. DOM: Module containers must be id="view-{moduleName}".
   The navigate() function looks up: document.getElementById('view-' + name)

6. MODULE IDS: Must match across 4 locations:
   a. _def('name', ...) in the_tabernacle.js
   b. _moduleMeta.name in the_tabernacle.js
   c. <div id="view-name"> in the HTML app
   d. <a data-view="name"> in the nav sidebar

7. NOTIFICATIONS: When creating notifications with createNotification_(),
   always set entityType to a value from the viewMap in notifClick():
   message, broadcast, prayer, task, event, care, volunteer, giving,
   mission, sermon, song, service, group, attendance, discipleship,
   outreach, learning, journal, directory, photos, audit, system,
   theology, statistics

8. BEFORE ADDING A NEW HANDLER: Check this document for the correct
   pattern. Update this document when adding new handlers.


═══════════════════════════════════════════════════════════════════════════════
  7. AUDIT SUMMARY
═══════════════════════════════════════════════════════════════════════════════

  Total backend handlers audited:     98+
  Total params.rowIndex converted:    43  (Care 5 + Songs 6 + Photos 4 +
                                           Sermons 7 + Services 3 +
                                           Ministries 2 + Compassion 5 +
                                           Outreach 2 + Database 9)
  Strict ID-first fixes (Mar 22):      2  (handleMembersGet + handleMembersUpdate)
  Frontend ID fixes (Mar 22):          2  (_memberOpts + openAddMember)
  Remaining params.rowIndex:           1  (Outreach dual-mode resolver — safe)
  DOM structure:                      100% verified
  Module registry:                    100% verified
  Status:                             ALL CLEAR ✓

═══════════════════════════════════════════════════════════════════════════════
  END OF WIRING AUDIT
═══════════════════════════════════════════════════════════════════════════════
```

---

# 8. Navigation & Permissions Audit

> *Source: Revelation/NAV_Detail.txt*

```
════════════════════════════════════════════════════════════════════════
  FLOCKOS NAVBAR RESTRUCTURE — REQUEST & IMPLEMENTATION DETAILS
════════════════════════════════════════════════════════════════════════

Requested: March 2026
Status:    COMPLETED (all items implemented)


──────────────────────────────────────────────────────────────────────
1. NEW NAVIGATION STRUCTURE
──────────────────────────────────────────────────────────────────────

Home (Navbar Group)
├── Dashboard (Welcome Screen)
├── The Upper Room (Devotional/Prayer)
├── Calendar

Ministry Hub (Navbar Group)
├── Ministry Hub (App) — the_harvest.js
├── The Flock — the_life.js
├── Messages — Communications/Comms
├── People — Members list
├── Groups — Small Groups
├── Missions
├── Request Prayer

Discipleship (Navbar Group)
├── Learning Hub — the_way.js
├── Service Hub (FUTURE — placeholder button/icon only)

Account (Navbar Group)
├── Profile (NEEDS MAJOR FIX — "page SUCKS")
├── Requests (Prayer Requests — add/edit functions needed)
├── Giving
├── About FlockOS

Settings — Visible to all, click blocked for non-admins (no gray, normal look)

Admin (Navbar Group — Visible only to Admins)
├── Admin Dashboard (GO BIG — scratchpad notes, quick-add tasks, stats,
│   reports, theme/font/size config, fix font selector,
│   size dropdowns: 75/90/100/110/125/150%)
├── People (keep as-is)

Deployment Guide — Visible to all, accessible to Admin + Pastor + deploymentGuide flag

Tools — Launchpad showing only apps user has access to


──────────────────────────────────────────────────────────────────────
2. KEY DECISIONS
──────────────────────────────────────────────────────────────────────

 1. Admin notes = separate lightweight scratchpad (NOT the ToDo system)
 2. Admin stats = hybrid: existing Luke module + admin-focused (users, logins, audit)
 3. Deployment Guide = new "deploymentGuide" permission flag, separate from role
 4. Settings = normal-looking for all users, blocked on click for non-admins
 5. Disable apps = frontend defaults to off, backend code stays as-is
 6. Favorites = REMOVE entirely (broken, not needed)
 7. Disabled by default: Giving (full), Outreach, Compassion, Spiritual Care, Theology
 8. Tools page = launchpad showing user-accessible apps only
 9. Remove People from Admin (duplicate)
10. Well/Wellspring/export functions available to Pastor+ in Settings
11. Service Hub = future, just icon/button placeholder for now


──────────────────────────────────────────────────────────────────────
3. IMPLEMENTATION STATUS
──────────────────────────────────────────────────────────────────────

✅ Sidebar HTML restructured with all 8 nav groups
✅ 16 new module-view divs added
✅ Favorites system fully removed (HTML, JS config section, saveFavorites fn)
✅ 6 new modules registered: about, service-hub, deployment-guide, tools,
   admin-dashboard, my-giving/my-profile (already existed)
✅ Admin Dashboard: KPI ribbon, scratchpad (localStorage), quick tasks,
   font size dropdowns (75/90/100/110/125/150%), quick action links
✅ Tools launchpad: card grid of 27 apps, only shows enabled modules
✅ Deployment Guide: 5-step accordion (GAS setup, first admin, API config,
   hosting, go-live checklist), permission-gated (admin/pastor/deploymentGuide flag)
✅ About FlockOS: features list, description
✅ Service Hub: "Coming Soon" placeholder
✅ Nav access control: Settings blocked for non-admins (alert), Admin group
   hidden for non-admins, admin group revealed via TheVine.hasRole
✅ Default-disabled modules: giving, outreach, compassion, care, theology,
   mirror, discipleship, attendance, checkin, audit, reports, statistics,
   journal, prayer-admin
✅ _isModuleEnabled updated to support default-disabled + explicit override
✅ Site Modules toggles in Settings updated to use _isModuleEnabled() for
   accurate state
✅ Protected modules expanded: dashboard, config, my-profile, about, tools,
   admin-dashboard, deployment-guide, service-hub
✅ _moduleMeta and _moduleCategories updated with new modules + Account category
✅ Zero errors in both files after implementation

── Post-Launch Updates (March 24, 2026) ──
✅ Learning Hub converted from tab system → tile-grid + full-page nav
✅ Ministry Hub converted from tab system → tile-grid + full-page nav
✅ _hubChildren object maps hub → child modules; _shell() auto-injects
   "← Hub Name" back link for all child modules
✅ Groups Hub: TheFold.renderApp redirects removed from groups/attendance
✅ My Profile login redirect: public portal → the_wall.html?returnTo →
   login → index.html?view=my-profile (auto-navigate on load)
✅ Genealogy: Jesus/Christ pinned to top of A–Z list with ★ section,
   sort priority, and auto-select on module load
✅ Added 6 missing view containers to admin portal: genealogy, counseling,
   heart, app-theology, quiz, apologetics
✅ Biblical Counseling: _parseScriptures rewritten from split() to exec()
   loop — fixes numbered-book parsing (e.g. "1 Peter 5:7")
✅ my-giving and my-requests added to _defaultDisabled
✅ "My Account" nav group added to public portal with My Profile
✅ Auto-navigate IIFE supports ?view= query param (return-from-login)
✅ Messages enabled by default: comms removed from _defaultDisabled,
   nav item moved from Outreach group to My Flock group
✅ Upper Room public/private split: devotional + reading + prayer always
   available; journal + pulse + prayer history require login
✅ Onboarding: new member wizard (onboardMember) — 3-step visitor intake
   with auto-assign to caregiver's flock
✅ Onboarding: first-time login welcome (showWelcome) — 3-page tour +
   optional preferred name, localStorage-tracked completion


──────────────────────────────────────────────────────────────────────
4. MODULE CATEGORIES (mirrors sidebar)
──────────────────────────────────────────────────────────────────────

People:       directory, groups, attendance
Ministry:     ministry, events, sermons, services, songs, ministries,
              volunteers
Shepherding:  my-flock, care, compassion, discipleship, outreach, mirror,
              prayer-admin
Growth:       upper-room, devotionals, reading, prayer, my-requests,
              library, words, app-theology, genealogy, apologetics,
              counseling, heart, quiz, themes
Content:      learning, theology, journal
Reach:        comms, missions, giving
Tools:        todo, checkin, calendar
Insights:     statistics, reports
Account:      my-profile, my-giving, about
System:       users, audit, dashboard, config, admin-dashboard,
              deployment-guide, tools, service-hub


──────────────────────────────────────────────────────────────────────
5. FILES MODIFIED
──────────────────────────────────────────────────────────────────────

• index.html — Sidebar HTML restructured, module-view divs added,
               navigate() updated (hub re-render, my-profile auth
               redirect, module guard), favorites removed, My Account
               nav group added, ?view= auto-navigate IIFE
• the_good_shepherd.html — Sidebar restructured, view containers
                           added (incl. ministry, genealogy, counseling,
                           heart, app-theology, quiz, apologetics),
                           navigate() updated for hub re-render
• the_tabernacle.js — 54 module _def() registrations, _hubChildren
                      hub mapping, _isModuleEnabled updated,
                      _moduleMeta/_moduleCategories expanded, ministry
                      hub module added, _parseScriptures rewritten,
                      genealogy Jesus/Christ pinning
• the_harvest.js — Ministry Hub tile-grid renderer, navigate()-based
                   tile clicks, back button replaces tabs,
                   resetHome() export
• the_wall.html — returnTo query param support in handleLogin()
• firm_foundation.js — Nehemiah auth guard, local bypass, role checks


──────────────────────────────────────────────────────────────────────
6. REMAINING / FUTURE WORK
──────────────────────────────────────────────────────────────────────

• Service Hub — full implementation (currently placeholder)
• Admin Dashboard — can be expanded with more analytics/reports


──────────────────────────────────────────────────────────────────────
7. HUB ARCHITECTURE
──────────────────────────────────────────────────────────────────────

Hub modules use tile-grid dashboards instead of tab bars.
Clicking a tile calls navigate() to show the child module full-page.
Child modules get an auto-injected "← Hub Name" back link via _shell().

_hubChildren (the_tabernacle.js ~line 219):
  learning:  { label: 'Learning Hub',  children: [theology, library,
               genealogy, counseling, devotionals, reading, words,
               heart, app-theology, quiz, apologetics, journal] }
  ministry:  { label: 'Ministry Hub',  children: [events, sermons,
               services, songs, ministries, volunteers] }

Learning Hub renderer:  _def('learning')  → TheWay.renderHub()
Ministry Hub renderer:  _def('ministry')  → TheHarvest.renderHub()

navigate() clears the hub container's loaded flag so the tile
dashboard always re-renders when navigating back to the hub.

Hub child modules render standalone (no redirects). The old
TheHarvest.renderHub/switchTab and TheFold.renderApp redirects
have been removed from events, sermons, services, songs,
ministries, volunteers, groups, and attendance.


──────────────────────────────────────────────────────────────────────
8. MY PROFILE LOGIN REDIRECT FLOW
──────────────────────────────────────────────────────────────────────

Public portal (index.html) has no login flow. When an unauthenticated
user clicks "My Profile":

  1. navigate('my-profile') detects no TheVine.session()
  2. Redirects to: FlockOS-GS/Revelation/the_wall.html?returnTo=my-profile
  3. User logs in on the_wall.html
  4. handleLogin() reads returnTo param from URL
  5. Redirects to: ../../index.html?view=my-profile
  6. Auto-navigate IIFE reads ?view= param and calls navigate('my-profile')
  7. Profile renders with valid session

Files involved:
  • index.html navigate()       — session check + redirect (line ~597)
  • the_wall.html handleLogin() — returnTo param handling
  • index.html IIFE             — ?view= auto-navigate (line ~710)


──────────────────────────────────────────────────────────────────────
9. GENEALOGY — JESUS CHRIST PINNING
──────────────────────────────────────────────────────────────────────

The Genealogy module (the_tabernacle.js ~line 1686) ensures Jesus
Christ appears first:

  1. Sort priority: /jesus|christ/i entries sort to position 0
  2. Pinned ★ section: A starred entry appears at the very top of
     the A–Z name list, above all letter groups
  3. Auto-select: Detail panel auto-loads Jesus/Christ on module open
     (sorted.find with /jesus|christ/i regex)


──────────────────────────────────────────────────────────────────────
10. ONBOARDING FLOWS
──────────────────────────────────────────────────────────────────────

Two onboarding flows were added (the_tabernacle.js):

A. NEW MEMBER ONBOARDING — onboardMember()
   Purpose: Friendly 3-step wizard for welcoming a visitor/new person.
   Designed for care+ roles (not admin-only). Does NOT create a login
   account — focused on pastoral intake.

   Step 1: "Who's visiting?" — firstName*, lastName*, email, phone,
           how they found us
   Step 2: "A little more" — preferred name, DOB, gender, membership
           status (defaults to Visitor), marital status, address
   Step 3: "Connect them" — spouse name, family role, emergency
           contact, pastoral notes, checkbox to auto-assign to
           current user's care list (checked by default)

   API calls:
     1. TheVine.flock.members.create({...})
     2. TheVine.flock.care.assignments.create({...})  (if checkbox)

   Entry points:
     • Dashboard quick card: "Welcome a Visitor" (care+ roles)
     • Directory page header: button before "+ New Person"
     • My Flock hub header: primary button before "+ Add Member"
     Exposed as Modules.onboardMember()

B. FIRST-TIME LOGIN WELCOME — showWelcome(session)
   Purpose: Multi-step welcome overlay shown on first admin login.
   Uses localStorage key 'flock_onboarded' to track completion.

   Page 1: Welcome greeting (time-of-day + first name), intro text
   Page 2: Quick tour — My Flock, Upper Room, Learning Hub,
           Messages & Calendar (4 feature cards)
   Page 3: "One quick thing" — optional preferred name field;
           saves via members.update if provided

   Triggered: the_good_shepherd.html init block, after quick cards
              are built. Calls Modules.showWelcome(session).
              Silently no-ops if already onboarded.

   Files modified:
     • the_tabernacle.js  — onboardMember(), showWelcome(), exports
     • the_good_shepherd.html — Welcome Visitor card, showWelcome trigger
     • the_life.js — Welcome Visitor button in My Flock hub header



════════════════════════════════════════════════════════════════════════
  FULL PERMISSIONS & NAV FUNCTION AUDIT
════════════════════════════════════════════════════════════════════════

Audited: March 24, 2026

Role Levels:  0=readonly  1=volunteer  2=care  3=leader  4=pastor  5=admin


──────────────────────────────────────────────────────────────────────
A.  BACKEND MODULE_PERMISSIONS  (Auth.gs, lines 45-88)
    These control server-side access via computePermissionsMap_()
──────────────────────────────────────────────────────────────────────

LEVEL 0 — Public / Readonly (10 modules)
  dashboard           Dashboard
  daily-bread         Daily Bread
  upper-room          Upper Room
  reading-plan        Reading Plan
  devotionals         Devotionals
  prayer              Prayer Request
  words               Lexicon
  themes              Themes
  sermons             Sermons

LEVEL 1 — Volunteer (9 modules)
  songs               Songs
  calendar            Calendar
  events              Events
  services            Services
  ministries          Ministries
  volunteers          Volunteers
  todo                Tasks
  checkin             Check-In
  journal             Journal
  my-requests         My Requests
  photos              Photos

LEVEL 2 — Care (7 modules)
  directory           Directory
  members             Members
  care                Pastoral Care
  my-flock            My Flock
  prayer-admin        Prayer Admin
  compassion          Compassion
  mirror              Mirror

LEVEL 3 — Leader (5 modules)
  groups              Groups
  attendance          Attendance
  giving              Giving
  discipleship        Discipleship
  outreach            Outreach
  reports             Reports

LEVEL 4 — Pastor (6 modules)
  learning            Learning
  theology            Theology
  library             The Word
  comms               Messages
  missions            Missions
  statistics          Statistics

LEVEL 5 — Admin (4 modules)
  users               User Management
  config              Settings
  audit               Audit Log
  interface-studio    Interface Studio

TOTAL BACKEND: 44 modules


──────────────────────────────────────────────────────────────────────
B.  FRONTEND _def() REGISTRATIONS  (the_tabernacle.js)
    These are the actual renderers that execute when you navigate
──────────────────────────────────────────────────────────────────────

 #  Module Key          Line    Description
 1  card                 982    Public member card page
 2  directory           1171    Member cards/contacts → TheShepherd
 3  groups              1207    Small groups / life groups
 4  attendance          1232    Weekly attendance tracking
 5  ministry            1258    Ministry Hub (tile dashboard → TheHarvest)
 6  events              1270    Services / events / activities
 7  sermons             1299    Sermon library
 8  services            1325    Service planning
 9  songs               1350    Worship song catalog
10  ministries          1376    Ministry departments
11  volunteers          1401    Volunteer schedule
12  care                1444    Pastoral care cases
13  compassion          1471    Benevolence / aid
14  discipleship        1498    Growth paths / mentoring
15  outreach            1523    Community contacts
16  learning            1549    Learning Hub (tile dashboard → TheWay)
17  theology            1580    Doctrinal articles
18  library             1605    66 Books of Bible
19  genealogy           1686    Biblical characters (split-panel, ★ Jesus pin)
20  counseling          1855    Wisdom protocols (exec-loop scripture parse)
21  devotionals         1950    Daily devotional content
22  reading             2356    Reading plan
23  words               2438    Greek/Hebrew lexicon (split-panel)
24  heart               2670    Heart check-in
25  mirror              2909    Self-assessment tools
26  app-theology        3021    Doctrine browse
27  quiz                3077    Bible quiz
28  apologetics         3414    Apologetics arguments
29  comms               3652    Message center → TheCommunications
30  missions            3924    Mission coordination
31  giving              4266    Giving dashboard
32  todo                4293    Task management → TheSeason
33  checkin             4294    Check-in sessions → TheSeason
34  statistics          4301    Analytics dashboard
35  reports             4332    Report generation
36  users               4363    User/member/card management → TheShepherd
37  config              4960    Site settings / control panel
38  audit               5918    Audit log viewer
39  prayer              5940    Prayer request (public)
40  my-requests         6014    My prayer requests
41  upper-room          6171    Personal devotional / Upper Room
42  journal             6698    Journal entries
43  prayer-admin        6740    Admin prayer dashboard
44  my-flock            6804    My assigned members → TheLife
45  themes              6815    Organizational themes / Interface Studio
46  calendar            6867    Event calendar → TheSeason
47  my-profile          9159    User profile (view + edit)
48  my-giving           9324    My giving history
49  about               9444    About FlockOS
50  service-hub         9478    Service hub (placeholder)
51  deployment-guide    9492    Deployment docs (accordion)
52  tools               9607    Tools launchpad (card grid)
53  admin-dashboard     9633    Admin dashboard (KPI + scratchpad)

TOTAL FRONTEND: 53 modules


──────────────────────────────────────────────────────────────────────
C.  SIDEBAR NAV ITEMS — index.html (Public Portal)
──────────────────────────────────────────────────────────────────────

Home
  dashboard           Welcome (active default)
  upper-room          The Upper Room
  calendar            Calendar

Discipleship
  learning            Learning Hub

My Account
  my-profile          My Profile (redirects to login if not authenticated)

TOTAL ITEMS: 5 nav items across 3 groups
NO auth-gated groups. Same appearance logged-in or not.
My Profile click → the_wall.html?returnTo=my-profile → login →
index.html?view=my-profile (redirected back automatically)


──────────────────────────────────────────────────────────────────────
D.  SIDEBAR NAV ITEMS — the_good_shepherd.html (Admin Portal)
──────────────────────────────────────────────────────────────────────

Home
  dashboard           Dashboard (active default)
  calendar            Calendar

My Flock
  my-flock            My Flock
  directory           Directory
  groups              Groups
  attendance          Attendance

Ministry
  ministry            Ministry Hub (tile grid)
  upper-room          The Upper Room

Growth
  learning            Learning Hub (tile grid)
  prayer              Prayer

Outreach
  comms               Messages
  missions            Missions
  giving              Giving

My Account
  my-profile          My Profile
  my-requests         My Requests
  my-giving           My Giving

Admin
  users               People
  statistics          Statistics
  reports             Reports
  config              Settings
  audit               Audit Log

Portal Links
  Back to Public      ../../index.html
  Pentecost           the_pentecost.html


──────────────────────────────────────────────────────────────────────
E.  PROTECTED MODULES  (cannot be disabled)
──────────────────────────────────────────────────────────────────────

dashboard, config, my-profile, about, tools,
admin-dashboard, deployment-guide, service-hub,
learning, upper-room, calendar

Total: 11 protected modules


──────────────────────────────────────────────────────────────────────
F.  DEFAULT-DISABLED MODULES  (off until admin enables)
──────────────────────────────────────────────────────────────────────

giving, outreach, mirror, discipleship,
attendance, checkin, audit, reports, statistics,
ministry, comms, missions,
themes, todo, my-giving, my-requests

Total: 16 default-disabled modules

NOTE: compassion, care, theology, journal, prayer-admin were
REMOVED from _defaultDisabled (now enabled by default).
ministry, comms, missions, themes, todo, my-giving, my-requests
were ADDED.


──────────────────────────────────────────────────────────────────────
G.  ⚠️  OVERLAP & REDUNDANCY ISSUES
──────────────────────────────────────────────────────────────────────

ISSUE 1 — Backend modules with NO frontend _def() renderer
  These exist in MODULE_PERMISSIONS but have no _def():
  ✅ daily-bread        REMOVED from MODULE_PERMISSIONS (2026-03-24)
  ✅ reading-plan       RENAMED to "reading" in MODULE_PERMISSIONS (2026-03-24)
  • photos             No renderer — was removed from UI in prior session
                       KEPT in MODULE_PERMISSIONS (gates Photos.gs backend endpoints)
  ✅ members            REMOVED from MODULE_PERMISSIONS (2026-03-25) — "directory" covers it
  ✅ interface-studio   REMOVED from MODULE_PERMISSIONS (2026-03-25) — "config" covers it

ISSUE 2 — Frontend modules with NO backend permission entry
  These have _def() but no MODULE_PERMISSIONS check:
  • card               Public member card — open, no server gate
  • ministry           Ministry Hub tile dashboard — open, no server gate
  • heart              Heart check-in — open, no server gate
  • genealogy          Biblical genealogy — open, no server gate
  • counseling         Wisdom protocols — open, no server gate
  • quiz               Bible quiz — open, no server gate
  • apologetics        Apologetics — open, no server gate
  • my-profile         User profile — open, no server gate
  • my-giving          User giving — open, no server gate
  • about              About page — open, no server gate
  • service-hub        Placeholder — open, no server gate
  • deployment-guide   Has custom permission check, not in MODULE_PERMISSIONS
  • tools              Launchpad — open, no server gate
  • admin-dashboard    Has custom role check, not in MODULE_PERMISSIONS

ISSUE 3 — Probable duplicates / aliases
  • "prayer" (level 0) vs "prayer-admin" (level 2)
      → prayer = public submit; prayer-admin = manage all requests
      → These are NOT duplicates; they serve different roles. KEEP BOTH.
  ✅ "members" (level 2) vs "directory" (level 2)
      → "members" REMOVED from MODULE_PERMISSIONS (2026-03-25)
  ✅ "daily-bread" (level 0) vs "devotionals" (level 0)
      → "daily-bread" REMOVED from MODULE_PERMISSIONS (2026-03-24)
  ✅ "reading-plan" (level 0) vs "reading" (has _def)
      → reading-plan RENAMED to "reading" (2026-03-24)
  ✅ "interface-studio" (level 5) vs "themes" (level 0)
      → "interface-studio" REMOVED from MODULE_PERMISSIONS (2026-03-25)

ISSUE 4 — Permission level mismatches to review
  • learning       Level 4 (pastor) — Should volunteers access Learning Hub? (All should have access to VIEW, only Pastor + can modify content.)
  • library        Level 4 (pastor) — Should the Bible be pastor-gated? (Same as above.)
  • groups         Level 3 (leader) — Public portal shows it under Ministry Hub
  • theology       Level 4 (pastor) — Doctrine articles pastor-only? (All can view)
  • comms          Level 4 (pastor) — Messages requires pastor? (User+)
  • missions       Level 4 (pastor) — Missions requires pastor? (Deacon+ can modify, members+ can view)


══════════════════════════════════════════════════════════════════════
  DEMO OPTIMIZATION — March 24, 2026 Presentation
══════════════════════════════════════════════════════════════════════

Goal:  Lean, focused demo. Only show modules relevant to the
       pastoral care / people management story. Everything else
       hidden by default — admin must manually re-enable.
       Remove "themes" from end-user access permanently.


──────────────────────────────────────────────────────────────────────
H.  MODULES TO KEEP ENABLED  (visible in demo)
──────────────────────────────────────────────────────────────────────

CORE PASTORAL WORKFLOW:
  dashboard           Welcome screen (protected — always on)
  my-flock            My Flock — assigned members view
  care                Pastoral care cases
  compassion          Compassion / benevolence
  prayer              Prayer request (submit)
  prayer-admin        Prayer admin (manage all requests)
  my-requests         My prayer requests

PEOPLE MANAGEMENT:
  directory           People / member directory
  users               User management (admin)
  groups              Small groups

ESSENTIAL NAVIGATION:
  my-profile          User profile (protected — always on)
  config              Settings (protected — always on)
  admin-dashboard     Admin dashboard (protected — always on)
  about               About FlockOS (protected — always on)
  tools               Tools launchpad (protected — always on)
  calendar            Calendar (keep for scheduling context)

TOTAL VISIBLE: 16 modules


──────────────────────────────────────────────────────────────────────
I.  MODULES TO DISABLE  (hidden from everyone, including admin)
──────────────────────────────────────────────────────────────────────

Already disabled (stays disabled):
  giving              outreach          theology
  mirror              discipleship      attendance
  checkin             audit             reports
  statistics          journal

NEWLY disabled for demo:
  events              Church events listing
  sermons             Sermon library
  services            Service planning
  songs               Worship song catalog
  ministries          Ministry departments
  volunteers          Volunteer schedule
  learning            Learning Hub
  library             The Word (66 books)
  genealogy           Biblical genealogy
  counseling          Wisdom protocols
  devotionals         Daily devotional
  reading             Reading plan
  words               Lexicon
  heart               Heart check-in
  app-theology        Doctrine browse
  quiz                Bible quiz
  apologetics         Apologetics arguments
  comms               Messages
  missions            Mission coordination
  upper-room          The Upper Room
  themes              Themes (PERMANENTLY removed from users)
  todo                Task management

TOTAL DISABLED: 33 modules


──────────────────────────────────────────────────────────────────────
J.  "THEMES" CHANGE
──────────────────────────────────────────────────────────────────────

  • Remove "themes" nav item from the_good_shepherd.html sidebar
  • Add "themes" to _defaultDisabled in the_tabernacle.js
  • Admin sets themes via Settings tab only (config module)
  • Themes functionality stays in code — just not user-navigable


══════════════════════════════════════════════════════════════════════
  PUBLIC PORTAL CLEANUP — March 24, 2026
══════════════════════════════════════════════════════════════════════

Goal:  Public side (index.html) looks the SAME for all users,
       logged in or not. No auth-gated nav items. Continuity for
       training and demos. Learning Hub open to everyone.


──────────────────────────────────────────────────────────────────────
K.  PUBLIC SIDEBAR — FINAL STATE (index.html)
──────────────────────────────────────────────────────────────────────

Home
  dashboard           Dashboard
  upper-room          The Upper Room
  calendar            Calendar

Discipleship
  learning            Learning Hub

My Account
  my-profile          My Profile (login-redirect if unauthenticated)

TOTAL ITEMS: 5
NO auth-gated groups. NO data-auth attributes.
Same appearance regardless of login status.
My Profile redirects to the_wall.html?returnTo=my-profile on click
if no session; after login, returns to index.html?view=my-profile.

REMOVED from public sidebar:
  • Ministry Hub group (events, my-flock, comms, directory, groups,
    missions, prayer) — all now admin-portal-only
  • Account group (my-profile, my-requests, my-giving, about)
  • Settings, Admin, Deployment Guide, Tools groups
  • Service Hub placeholder


──────────────────────────────────────────────────────────────────────
L.  PERMISSION LEVEL CHANGES (Auth.gs MODULE_PERMISSIONS)
──────────────────────────────────────────────────────────────────────

Lowered to Level 0 (public):
  learning            Was level 4 (pastor) → now level 0
  theology            Was level 4 (pastor) → now level 0
  library             Was level 4 (pastor) → now level 0

Renamed / Removed:
  reading-plan        RENAMED to "reading" (matches frontend _def key)
  daily-bread         REMOVED (no frontend renderer existed)
  themes              REMOVED from MODULE_PERMISSIONS
                      (admin-only via Settings, not a navigable module)

Rationale:
  Learning Hub and all its sub-content (theology, lexicon/words,
  counseling, library/Bible, genealogy, apologetics, etc.) should
  be accessible to all users. The Upper Room depends on the Reading
  Plan (TheVine.app.reading()), which must also be public.


──────────────────────────────────────────────────────────────────────
M.  UPPER ROOM / READING PLAN DEPENDENCY
──────────────────────────────────────────────────────────────────────

  The Upper Room renderer (the_tabernacle.js ~line 6100) fetches:
    TheVine.app.reading()     → Reading Plan rows (Bible.com refs)
    TheVine.app.devotionals() → Daily devotional rows

  It uses day-of-year index to pick "today's" reading:
    todayRead = readRows[todayIdx]

  The "reading" module (_def at ~line 2266) renders the full
  Reading Plan table with date picker and pagination.

  Both are now level 0 in MODULE_PERMISSIONS — accessible to all.

```

---

# 9. Calendar Implementation Plan

> *Source: Revelation/6_CalenderImplementPlan.txt*

```
# Calendar Implementation Plan

## Insertion Points
- **_moduleMeta**: line 306-354, add `calendar` entry after `checkin`
- **_moduleCategories**: line 356-366, add `calendar` to Tools modules array  
- **_def('calendar')**: Insert after themes _def (around line 4960) as section 31
- **newEvent/editEvent**: Add `visibility` field (public/private) - lines 5082/6434
- **Events renderer**: Add Visibility column - line 690
- **Control Panel**: After Provisioning accordion (ends ~line 3710), add Section 8: Calendar Settings
- **Nav HTML**: Add calendar item in Tools group (the_good_shepherd.html ~line 486)
- **Module view div**: Add `<div class="module-view" id="view-calendar"></div>` after audit view div (~line 605)
- **Exports**: Add calendar functions to the Modules return object (~line 6850+)

## Calendar Module Design
- Month/week/day/agenda views with visual calendar grid
- Color-coded event types
- Public/private badge overlay
- External iCal URL sync display
- Cross-module aggregation: events + services + attendance markers
- Pastor schedule sections
- Quick-add from any date cell

## Control Panel Calendar Settings (Section 8)
- Default calendar view (month/week/day/agenda)
- Working hours start/end
- Week start day (Sun/Mon)
- Show weekends toggle
- External iCal URL fields (up to 3 feeds)
- Module integration toggles (show services, attendance, missions)
- Public calendar visibility toggle

## Events Module Enhancement
- Add `visibility` field: select with Public/Private options
- Add `endTime` field for duration
- Add `recurrence` field for future use
- Display visibility badge in events list
```

---

# 10. TheWell — Google Drive Offline Sync

> *Source: Revelation/Instructions_for_the_well.txt*

```
==============================================================================
  INSTRUCTIONS FOR THE WELL — FlockOS Google Drive Sync
  "Everyone who drinks this water will be thirsty again, but whoever drinks
   the water I give them will never thirst." — John 4:13-14
==============================================================================


╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   PART 1 — DEVELOPER / ADMIN ACTIVATION GUIDE                             ║
║   (For the person setting up TheWell for a church or region)               ║
║                                                                            ║
╚══════════════════════════════════════════════════════════════════════════════╝


OVERVIEW
--------
TheWell connects FlockOS to Google Drive so church data can be stored as
Excel (.xlsx) files in a shared Google Drive folder. This lets the app work
completely offline — it downloads the files once, then serves everything from
the local device. Edits sync back to Drive when a connection is available.

TheWell sits on top of TheWellspring (the local IndexedDB engine). You do NOT
need to configure TheWellspring separately — TheWell activates it automatically.

The existing GAS (Google Apps Script) pipeline is completely unaffected.
TheWell is an alternative data source for places where GAS is blocked or
there is no reliable internet.


STEP 1 — CREATE A GOOGLE CLOUD PROJECT
---------------------------------------
1. Go to https://console.cloud.google.com
2. Click the project dropdown at the top → "New Project"
3. Name it something like "FlockOS Drive Sync"
4. Click "Create"
5. Wait for it to finish, then select the new project

STEP 2 — ENABLE THE GOOGLE DRIVE API
--------------------------------------
1. In the Cloud Console, go to: APIs & Services → Library
2. Search for "Google Drive API"
3. Click on it → click "Enable"

STEP 3 — CREATE AN OAUTH 2.0 CLIENT ID
----------------------------------------
1. Go to: APIs & Services → Credentials
2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
3. If prompted to configure a consent screen first:
   a. Choose "External" user type
   b. App name: "FlockOS"
   c. Support email: your email
   d. Add the scope: https://www.googleapis.com/auth/drive.file
   e. Add your email as a test user
   f. Save
4. Back in Credentials → Create OAuth client ID:
   a. Application type: "Web application"
   b. Name: "FlockOS Well"
   c. Under "Authorized JavaScript origins" add ALL domains where the
      app will run. The FlockOS project already has these configured:
        - http://localhost                  (local testing)
        - http://localhost:8080             (local dev server)
        - https://flockos.github.io         (primary GitHub Pages)
        - https://tbc.github.io             (secondary GitHub Pages)
      Add more origins here if you deploy to other domains or
      need file:// access for SD card deployments.
   d. Click "Create"

   The FlockOS project already has a Client ID:
   263169170629-1jkgp5rc7kpl40v1hbbrs76sae7l1spm.apps.googleusercontent.com

   Project ID: flockos

   ⚠️  The client_secret is NOT needed for TheWell (browser-only OAuth).
      Never put the client_secret in any file that ships to users.
      Keep it safe — it is only used for server-side flows.

STEP 4 — SET UP THE GOOGLE DRIVE FOLDER
-----------------------------------------
1. In Google Drive (https://drive.google.com), create a new folder.
   Name it whatever you like (e.g., "FlockOS Church Data")
2. Share the folder with all users/devices that need access:
   - Click the folder → Share → add emails, or get a link
3. COPY the Folder ID from the URL. When you open the folder, the URL is:
   https://drive.google.com/drive/folders/XXXXXXXXXXXXXXXXXXXXXXXXX
   The part after "folders/" is the Folder ID.
4. Put 4 Excel (.xlsx) files in the folder with these names:

   ┌──────────────────────────┬──────────────────────────────────────────┐
   │ File Name (case ignored) │ What It Contains                         │
   ├──────────────────────────┼──────────────────────────────────────────┤
   │ Flock_Content.xlsx       │ Public content: Heart, Mirror,           │
   │  (or "matthew" or "app") │ Theology, Todo, Songs, Sermons, etc.     │
   ├──────────────────────────┼──────────────────────────────────────────┤
   │ Flock_CRM.xlsx           │ Church management: Members, Groups,      │
   │  (or "john" or "flock")  │ Giving, Services, Events, Calendar, etc. │
   ├──────────────────────────┼──────────────────────────────────────────┤
   │ Flock_Missions.xlsx      │ Missions data: Missionaries, Fields,     │
   │  (or "mark" or "missions")│ Reports, Prayer, Support, etc.          │
   ├──────────────────────────┼──────────────────────────────────────────┤
   │ Flock_Statistics.xlsx     │ Extra/statistics data: Attendance,      │
   │  (or "luke" or "extra")  │ Outreach stats, Community metrics, etc.  │
   └──────────────────────────┴──────────────────────────────────────────┘

   Each .xlsx file should have multiple sheets (tabs) matching the tab
   names that TheVine/GAS uses. Each sheet's first row must be headers.

   TIP: If you already have a working GAS backend, export each Google
   Sheet as .xlsx and put it in the Drive folder.

STEP 5 — ACTIVATE THE WELL (BROWSER CONSOLE OR CONFIG UI)
-----------------------------------------------------------
Open the FlockOS app in a browser. Open Developer Tools (F12) → Console.
Run these commands:

   // 1. Tell TheWell where to find data
   TheWell.configure({
     clientId: '263169170629-1jkgp5rc7kpl40v1hbbrs76sae7l1spm.apps.googleusercontent.com',
     folderId: '19o58REiEwL2RAIi-pvVeQXixlst6uTg5',
     syncMinutes: 15                     // optional, default is 15
   });

   // 2. Full activation — authorize + download + start auto-sync
   TheWell.enable();

   // A Google sign-in popup will appear. Sign in and grant access.
   // TheWell will download all 4 .xlsx files, parse them into IndexedDB,
   // and activate TheWellspring. From this point on, the app works offline.

STEP 6 — VERIFY
-----------------
In the browser console, run:

   TheWell.status();

You should see:
   {
     configured: true,
     authorized: true,
     syncing: false,
     autoSync: true,
     lastSync: { app: 1679..., flock: 1679..., missions: 1679..., extra: 1679... },
     dirty: [],
     config: { folderId: "...", clientId: "***xxxxxx", syncMinutes: 15 }
   }

Also check:
   TheWellspring.status();

You should see:
   {
     active: true,
     springs: { app: true, flock: true, missions: true, extra: true }
   }


STEP 7 — OFFLINE VAULT (OPTIONAL)
-----------------------------------
If users need to log in while offline, set up the PIN vault. This encrypts
their session credentials in IndexedDB using AES-256-GCM so they can unlock
without an internet connection.

   // While still online and logged in:
   TheWellspring.vault.setup('123456', sessionData);

   // Later, offline:
   TheWellspring.vault.unlock('123456');
   // Returns the decrypted session — user is "logged in" locally


MANUAL SYNC COMMANDS (IF NEEDED)
----------------------------------
   TheWell.sync();                      // Pull latest from Drive
   TheWell.sync({ force: true });       // Force re-download everything
   TheWell.push();                      // Push local changes to Drive
   TheWell.push({ springs: ['flock'] });// Push only one spring
   TheWell.disable();                   // Stop sync, revoke token
   TheWell.deauthorize();               // Just revoke token, keep config


TROUBLESHOOTING
-----------------
Problem: "clientId not configured"
  → Run TheWell.configure({...}) with your Client ID and Folder ID first.

Problem: Auth popup is blocked
  → The browser blocked the popup. Allow popups for this site, then retry.

Problem: "Drive API error 403"
  → The Google Drive API is not enabled. Go to Cloud Console → APIs → enable it.

Problem: "Drive API error 404"
  → The folder ID is wrong, or the folder was deleted/unshared.

Problem: No .xlsx files found
  → Files must be in the exact folder. Check they are actual .xlsx (not
    Google Sheets — those need to be exported as .xlsx first).

Problem: Data loads but tabs are empty
  → Sheet names inside the .xlsx must match the tab names TheVine expects.
    Check the first row has proper column headers.

Problem: Auth works but sync stalls
  → Check internet connection. Run TheWell.sync({ force: true }) manually.

Problem: Changes don't push back
  → Run TheWell.push() manually. Check TheWell.status().dirty for which
    springs have unpushed changes.


==============================================================================


╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   PART 2 — FIELD USER GUIDE                                               ║
║   (Simple instructions for end users. Translate as needed.)                ║
║                                                                            ║
╚══════════════════════════════════════════════════════════════════════════════╝


────────────────────────────────
  HOW TO USE THE CHURCH APP
  WITHOUT INTERNET
────────────────────────────────

Your church leader gave you this app on a phone, tablet, or SD card.
It works without internet after first setup.


FIRST TIME SETUP (you need internet for this one time)
-------------------------------------------------------

1.  Open the app.

2.  Your church leader will give you TWO codes:
      • A long code called "Client ID"
      • A shorter code called "Folder ID"

3.  Enter both codes where the app asks for them.

4.  Tap "Connect" or "Enable."

5.  A Google sign-in window will open.
    Sign in with the Google account your leader told you to use.
    Tap "Allow" when asked for permission.

6.  Wait. The app will download the church data.
    This may take a few minutes depending on your connection.

7.  When it says "Ready" or "Synced," you are done.
    You can now close the internet.


USING THE APP EVERY DAY
-------------------------

•  Open the app. Everything works from your device.
   No internet is needed.

•  You can view members, songs, sermons, events — everything.

•  If you make changes (add a member, update a record), the app
   saves them on your device.


WHEN YOU GET INTERNET AGAIN
-----------------------------

•  The app will automatically send your changes and download
   any new data from your church. You do not need to do anything.

•  If it does not sync automatically, open the app and look for
   a "Sync" button. Tap it once.


IF SOMETHING GOES WRONG
--------------------------

•  App shows no data?
   → You need to do the first-time setup again. Ask your leader.

•  Sign-in window does not open?
   → Allow pop-ups in your browser settings. Try again.

•  App is very slow?
   → Close other apps. Restart the app.

•  Data looks old?
   → Connect to internet. Tap "Sync" to get the latest.

•  Need help?
   → Ask your church leader or the person who gave you the app.


IMPORTANT REMINDERS
---------------------

•  You need internet ONLY for the first setup and for syncing changes.

•  After first setup, the app works fully offline.

•  Your data is saved safely on your device. Do not delete the app
   or clear browser data, or you will need to set up again.

•  If you use a PIN to log in offline, do not forget your PIN.
   There is no way to recover it.


──────────────────────────────────────────────────────────────────────
   "Jesus answered, 'Everyone who drinks this water will be thirsty
    again, but whoever drinks the water I give them will never thirst.
    Indeed, the water I give them will become in them a spring of water
    welling up to eternal life.'" — John 4:13-14
──────────────────────────────────────────────────────────────────────
```

---

# 11. Performance Optimization — Action Items

> *Source: 4-John/ActionItems.txt*

```
Performance — The Big Win
Fix	File	Before	After
getTab() caches spreadsheet + sheet refs	John.gs:32	3 RPCs per call (getScriptProperties + openById + getSheetByName) — called 15+ times per login	0 RPCs on repeat calls (1 on first)
cascadeUpdate_() batch writes + reuses cached SS	Auth.gs:1943	~46 RPCs (cell-by-cell across 7 sheets)	~14 RPCs (1 read + 1 write per sheet)
handleUsersUpdate_() batch write	Auth.gs:1025	6 individual setValue() calls	1 setValues() call
handleExpProfileUpdate_() batch write	Auth.gs:905	9 individual setValue() calls	1 read + 1 setValues() call
handleMembersUpdate() batch write	Database.gs:2200	Up to 48 individual setValue() calls	1 setValues() call
handleCalendarEventsUpdate() batch write	Database.gs:1930	16 individual setValue() calls	1 setValues() call
handleCheckInClose() eliminate redundant reads	Database.gs:1744	3 extra RPCs (re-read row it already had)	0 extra RPCs
handleAttendanceBulkCreate() batch insert	Database.gs:296	2N RPCs for N members (100+ for 50 people)	1 setValues() call
Impact Summary
The getTab() cache alone eliminates roughly 60-70% of all Google Sheets RPCs across the entire backend. Combined with the batch writes, a typical "Save All Changes" on a person's profile drops from ~70+ RPCs to ~10. Bulk Sunday check-in for 50 people drops from ~100 RPCs to ~1.

Files to Redeploy
John.gs — getTab() cache
Auth.gs — batch writes in profile update, user update, cascade
Database.gs — batch writes in members update, calendar update, check-in, bulk attendance
the_true_vine.js — approve/deny/pending verbs
the_tabernacle.js — openThread fix + prior email fix
the_way.js — quiz timer cleanup
Noted But Not Changed (would require larger restructuring)
✅ Discipleship.gs: VERIFIED 2026-03-25 — all 18 update handlers already use single setValues() batch writes. No changes needed.
8 files share the findRowById(db()) + getTab() double-open pattern
_call() injects params.email from session even when not intended — ideally should only set authEmail
_ppOpen() makes 5 uncached API calls per click (could cache permissions.list)
Claude Opus 4.6 • 3x

Here's what was happening, in plain terms:

Before the fix, every single time the code needed to look at a spreadsheet tab (like "Members" or "AuthUsers"), it did three things from scratch:

Asked Google for the spreadsheet ID — like looking up a building's address in a phone book
Opened the entire spreadsheet — like driving to that building and walking through the front door
Found the specific tab — like walking down the hall to the right room
The problem? getTab() gets called 15+ times during a single login (once for AuthUsers, once for AccessControl, once for UserProfiles, once for Permissions, once for the audit log, etc.). That meant the code was driving to the same building, walking through the same front door, and finding the same rooms over and over again — every single time anyone did anything.

Each of those three steps is a round-trip to Google's servers (roughly 100-300ms each). So 15 calls × 3 round-trips = ~45 trips to Google's servers just to figure out which tabs to look at, before any actual data reading even happens.

After the fix, the code remembers the building address and keeps the doors open:

_ssCache = "I already opened this spreadsheet, here it is" (no need to look up the address and drive there again)
_sheetCache = "I already found the Members tab, here it is" (no need to walk down the hall again)
So the first call still does the work, but every call after that is instant — zero trips to Google. A login that was making ~45 unnecessary server round-trips now makes ~5.

Claude Opus 4.6 • 3x
```

---

# 12. Critical Configuration & Data Integrity

> *Source: Revelation/4_Planning.txt*

> *Note: This section overlaps significantly with Section 2 (2_Config.txt). Included for completeness — key unique content is the Google Sheet IDs and data integrity notes.*

```
╔══════════════════════════════════════════════════════════════════════════════╗
║         FlockOS — CRITICAL CONFIGURATION & DATA INTEGRITY NOTES             ║
╚══════════════════════════════════════════════════════════════════════════════╝

Updated: March 24, 2026


════════════════════════════════════════════════════════════════════════════════
 GOOGLE SHEET IDs (per API branch)
════════════════════════════════════════════════════════════════════════════════

  Branch    Sheet ID
  ────────  ────────────────────────────────────────────────────────────
  MATTHEW   1D_otIhNOJ8gFfIOMmIZvIUHZ0FJJtqllgmEkRvERqEA
  MARK      1EcvU_7napPGpjrZ-UfVlQC6ncoVjLixHWXRO_PKVny4
  LUKE      1QC_sHIvqMbgNB2PZPPfPR4opc_Bx5uPK0h3pYAExznI
  JOHN      1582YPZwYtxJqoQC6cD5gpMpjpZJcsUDQf_PLua2I2ck


════════════════════════════════════════════════════════════════════════════════
 DATA INTEGRITY — MEMBERS TABLE
════════════════════════════════════════════════════════════════════════════════

  STRICT ID-FIRST MATCHING (Database.gs — March 22, 2026 fix):
  ─────────────────────────────────────────────────────────────────
  handleMembersGet and handleMembersUpdate now use:
    (id && MEM.ID===id) || (!id && email && EMAIL===email)

  Previously the email-fallback could match a different member's row
  when editing by ID. The !id guard prevents this entirely.

  MEMBERS TABLE WARNING (Flock CRM Google Sheet):
  ─────────────────────────────────────────────────────────────────
  • Do NOT trim/delete blank rows below data in the Members sheet.
  • appendRow() is safe, but a trimmed sheet causes confusion if
    any code attempts positional writes. Keep header row intact.
  • To clean up, use the Archive field (archived=TRUE) instead.


════════════════════════════════════════════════════════════════════════════════
 THREE-TABLE IDENTITY MODEL (FLOCK API — John)
════════════════════════════════════════════════════════════════════════════════

  Table         Purpose                                  Manager
  ────────────  ───────────────────────────────────────── ──────────────────
  AuthUsers     Login credentials + role (10 cols)        users.create/update
  Members       Pastoral roster (51 cols)                 members.create/update
  MemberCards   Public directory (30 cols)                memberCards.*

  • A person can exist in AuthUsers WITHOUT a Members row (staff-only login).
  • The_life.js _ensureDir() merges members.list + users.list for the
    full directory view.
  • TheShepherd.js manages the 3-step save: account → member → card.


════════════════════════════════════════════════════════════════════════════════
 PRAYER REQUEST ROUTING
════════════════════════════════════════════════════════════════════════════════

  Prayer belongs in FLOCK (John):
  • PrayerRequests tab (18 columns) + PrayerUpdates tab
  • Created by setup.gs as part of the 76-tab FLOCK expansion
  • Frontend routes through TheVine.flock (prayer.submit, prayer.list)
  • Old form-based submission removed — now API-first via prayer.submit
```

---

# 13. Infrastructure — GCP Project Details

> *Source: Revelation/SQL_Database.txt*

```
Number: 469379193288
ID: flockos-777
```

---

# 14. Performance Optimization & Dashboard Updates (March 25, 2026)

## Frontend Performance
- All `<script>` tags now have `defer` attribute — browser downloads JS in parallel during HTML parse
- All 5 HTML files (index, the_good_shepherd, the_wall, the_pentecost, fishing-for-men) updated
- Inline init code wrapped in `DOMContentLoaded` listener for defer safety
- Global functions (`navigate`, `toggleSidebar`, etc.) exported to `window` for onclick handlers
- Service worker (the_living_water.js) cache bumped to v3 — all 17 JS files pre-cached (was missing 7)

## JS Minification

Every JavaScript file in Acts (plus the service worker `the_living_water.js`) is shipped in two forms:

| Form | Example | Role |
|------|---------|------|
| Source (`.js`) | `the_tabernacle.js` | Human-readable, fully commented — the file you edit and debug |
| Minified (`.min.js`) | `the_tabernacle.min.js` | Whitespace, comments, and redundant syntax removed — loaded by HTML pages |

**Results:** All 18 JS files minified via rjsmin (Python): **1.57 MB → 1.10 MB (~30% reduction)**.

### Purpose & Performance Gains

- **~30% load-time savings** — Smaller files download and parse faster. The 30% byte reduction maps closely to a 30% improvement in page load time, especially on bandwidth-constrained connections common in mission-field deployments.
- **Consistent cross-platform loads** — Reduced file sizes smooth out performance variability between desktop Chrome, mobile Safari (iOS), Android WebView, and lower-powered devices. Smaller payloads mean less divergence in parse/compile time across engines.
- **Troubleshoot-friendly source** — The readable `.js` files are preserved in the repository and remain the single source of truth. Developers see clear variable names, section comments, and logical formatting. Browser DevTools can also map back to the source for debugging.
- **No framework overhead** — The build uses a single Python package (`rjsmin`) inside a lightweight venv. No npm, Webpack, or bundler toolchain is required.

### Build Workflow

```
./minify.sh          # from FlockOS project root
```

This activates `.venv/` and runs `minify.py`, which:
1. Iterates every `.js` in `FlockOS-GS/Acts/` (skipping `.min.js`)
2. Minifies `the_living_water.js` (service worker) at the project root
3. Writes each `.min.js` sibling alongside its source
4. Prints per-file and total size/reduction stats

Run after any JavaScript code change. HTML pages already reference `.min.js`, so no further edits are needed.

## My Flock Dashboard — All Open / My Open KPI
- Pastor+ roles now see two KPI rows on the My Flock dashboard:
  - **ALL OPEN** (gold header): counts for the entire flock (care cases, prayers, compassion, outreach)
  - **MY OPEN** (muted header): counts filtered to the current user's assignments
- Non-pastor roles still see original single-row view with personal counts only
- File: the_life.js, renderHub() function

---

# 15. Recent Feature Updates (March 26, 2026)

## HTML Minification Pipeline
- `minify.py` now minifies standalone HTML pages in addition to JavaScript
- Uses `minify_html` (Rust-backed Python package) with `minify_js=True, minify_css=True`
- Currently minifies 3 HTML pages: `the_generations.html`, `the_anatomy_of_worship.html`, `the_gift_drift.html`
- HTML pages produce `.min.html` variants loaded by default in the Learning Hub
- Build output now covers **19 JS files + 3 HTML pages**, total reduction: ~1.68 MB → ~1.17 MB (30%)

## Minification & Long-Term Reliability

Minified code improves not only site performance but also long-term reliability:

- **Reduced attack surface** — Minified files strip comments, variable names, and formatting clues. While not a security measure on its own, it raises the barrier for casual code inspection by potential bad actors, especially on public GitHub Pages deployments.
- **Deterministic builds** — Every `./minify.sh` run produces identical output from identical source. Source files are the single point of truth; `.min.*` files are regenerated artifacts. This eliminates drift between what developers edit and what users load.
- **Fewer parse errors in production** — Minifiers validate syntax during processing. A broken semicolon or unclosed string in the source file will cause the minifier to fail rather than silently shipping broken code. This acts as a lightweight lint gate on every build.
- **Cache efficiency** — Smaller files mean the service worker (the_living_water.js) can cache the entire app shell in less storage. On mobile devices and mission-field hardware with limited cache budgets, this keeps the full app available offline.
- **Version-safe deployments** — Because HTML pages reference `.min.js` and `.min.html`, a developer can safely edit source files mid-session without accidentally serving half-written code. The production artifact only changes when the build is explicitly run.

## Spiritual Gifts Curriculum Page (the_gift_drift.html)
- ✅ Created `FlockOS-GS/Revelation/the_gift_drift.html` — "Correcting the Gift-Drift"
- ✅ 4-phase interactive teaching framework: Exegetical Grounding, Tracing the Drift, Permanent Gifts in Action, Discovery & Deployment
- ✅ Chart.js doughnut for speaking/serving gift balance
- ✅ Inline ministry inclination assessment prototype
- ✅ Integrated into Learning Hub via the_way.js scrolls zone card
- ✅ Added to service worker cache (the_living_water.js)
- ✅ Rethemed from slate/rose to stone/teal/amber (America theme alignment)
- ✅ HTML minification produces the_gift_drift.min.html (35% smaller)

## Heart Check Logic Fix
- ✅ Fixed reversed Yes/No scoring logic in both the_way.js and the_tabernacle.js
- ✅ "Yes" now correctly maps to RED (danger) — indicates a problem area
- ✅ "No" now correctly maps to GREEN (success) — indicates a healthy area
- ✅ Card borders, button colors, SVG bar chart, condition labels, and prescriptions all updated
- ✅ Diagnostic questions are phrased as "Are you struggling with…" so Yes = concern

## Course Quiz 12-Question Sampling
- ✅ `_startCourseQuiz()` in the_way.js now shuffles all questions and picks `Math.min(12, total)`
- ✅ Matches existing `_startAppQuiz()` pattern
- ✅ Header displays "12 of 50 questions" so students know it is a randomized sample

## Silent Diagnostic Logging & Pastoral Prayer Context
- ✅ Bible Quiz and Heart Check scores are silently logged to `localStorage` for authenticated users
- ✅ Logged data: `flock_diag_quiz` (title, correct, total, pct, date) and `flock_diag_heart` (pct, label, flagged categories, date)
- ✅ When a prayer request is submitted via `submitPrayer()`, recent diagnostic data is automatically appended as a `--- Spiritual Context (auto) ---` block
- ✅ Pastoral staff see Heart Check health % with flagged areas and latest Bible Quiz score alongside the prayer text
- ✅ Fully client-side — no backend schema changes required

## Public/Admin Navigation Routing
- ✅ All 5 standalone Learning Hub HTML pages updated with smart `?from=` parameter routing
- ✅ "Back to Learning Hub" link correctly routes public users to `index.html?view=learning` and admin users to `the_good_shepherd.html?view=learning`
- ✅ Fallback uses `document.referrer` detection for direct navigation

## Emoji Standardization
- ✅ Replaced all 5 instances of yin/yang ☯ (`&#9775;`) across 4 files
- ✅ Doctrine references → 📚 (`&#128218;`), branding → ✝ (`&#10013;`)

---

*End of consolidated project notes.*
