# FlockOS Action Items — Backend/Frontend Gap
_Prioritized highest to lowest. Each item = one scoped implementation task._
_Last updated: 2026-04-02 · FlockOS v3.5_

---

## Open Items

---

### 31. Theology Explorer — Verify theology.flat Fields in Production
The `app-theology` module was rewritten to use `TheVine.flock.theology.flat()` and handles three field-name variants (snake_case, camelCase, spaced). Verify in production that `theology.flat` returns the expected rows and that category ordering matches the spreadsheet sort order.

---

### 32. Apologetics — Reference URL Field Dropped
`Reference URL` (column K of Apologetics sheet) is no longer rendered after the pill refactor. If external source links are needed, re-add as a secondary link inside the Scripture card or as a separate card.

---

---

## ~~Completed (Session — April 2, 2026, Part 2)~~

---

### ~~35. Care Notification Emails — Broken Emoji in Subject Lines~~
~~`\u{1F6A8}` (ES6 Unicode escape) used in `handleCareCreate` and `careFollowUpReminder` subject lines rendered as black question marks in GAS email clients. Replaced with surrogate pair `\uD83D\uDEA8`, then confirmed surrogate pairs also failed in subject lines via email clients. Final fix: removed all emoji from notification subject lines entirely and replaced with plain-text bracket labels:~~
- ~~`[New Care Case] Action Required`~~
- ~~`[Follow-Up Needed] CareType (Priority) — ChurchName`~~
- ~~`[Escalation] Care Case — No Contact in X Days`~~
- ~~`ChurchName Daily Summary — Date | X Urgent`~~
~~Commit: `1aaaefa`~~

---

### ~~36. Care Notification Emails — CHURCH_APP_URL Footer~~
~~All notification email footers showed a generic footer or a GAS auto-linked mailer URL — not the church-specific FlockOS app URL. Added `CHURCH_APP_URL` AppConfig key (seeded in `setupFlockOS()` defaults, category: General). All notification email footers now append the church's TheVine front-end URL if set:~~
- ~~`notifyPastorsOnly_()` — footer appends URL~~
- ~~`notifyPastorsAndAdmins_()` — footer appends URL~~
- ~~`notifyCareAssignment_()` — footer appends URL~~
- ~~`careFollowUpReminder()` — follow-up body appends URL~~
- ~~`dailyPastoralSummary()` — footer appends URL~~
~~Commit: `dc5bb2c`. Setup: add church's TheVine GitHub Pages URL to `CHURCH_APP_URL` in AppConfig (not the GAS backend URL).~~

---

## ~~Completed (Session — April 2, 2026, Part 1)~~

---

### ~~33. Missions — Dashboard Shortcut Tile~~
~~Added a Missions shortcut tile to the My Flock hub dashboard in `the_life.js`:~~
- ~~`_appCard('\u2708', 'Missions', ...)` added in the Holy Place zone alongside People, Love in Action, The Fold, and Activity Feed~~
- ~~`openApp` switch: `case 'missions'` calls global `navigate('missions')` — matching the pattern used throughout the codebase (`navigate('journal')`, `navigate('users')`, etc.). Prior attempt used `Modules.navigate()` which does not exist~~

---

### ~~34. Prayer Focus Tab — Accordion Cards~~
~~Converted the Prayer Focus tab in Missions from flat always-expanded cards to collapsible accordion cards:~~
- ~~**Collapsed state:** title, location/people group metadata, priority badge, and ▼ chevron on one clickable header row~~
- ~~**Expanded state:** uses `.dev-feed-body` / `.dev-feed-open` CSS class toggle (matching exact devotional expand/collapse pattern from `fine_linen.js`); `max-height` animation~~
- ~~Root cause of "no data" bug: previous implementation used `display:none` on an outer wrapper — the inner `.dev-feed-body` never received `.dev-feed-open` so CSS held it at `max-height:0`~~
- ~~**Theme:** now uses `dev-feed-card`, `dev-feed-header`, `dev-section-card` CSS classes to match devotional visual language exactly~~
- ~~**Sections:** Description (blue/accent), Scripture (gold, `_bibleLink()`-linked), Prayer Points (mint, bullet list from newline-split string or array), footer bar with location · people group · response count · "Pray for This" button (lilac)~~
- ~~**No truncation:** full description and prayer points text displayed~~

---


## ~~Completed~~

---

### ~~16. Ministry Members Roster~~
~~`ministryMembers` namespace is completely unbuilt in the UI:~~
- ~~`ministryMembers.add` / `remove` / `list` / `update` / `forMember`~~
- ~~`ministries.summary` / `ministries.tree` — summary stats and hierarchy view~~

---

### ~~16a. Ministry Members — API Field Audit~~
~~Full field-level audit against `API Code.md`. Fixed:~~
- ~~List guard: was calling `ministryMembers.list` with no `ministryId` (required param → server error). Now shows "Select a Ministry First" empty state when `_activeMinistrId` is null~~
- ~~Table columns corrected: added `hoursPerMonth`, `endDate`; removed `ministryName` (not returned by list endpoint)~~
- ~~`_minAddMember`: `email` → `memberId`; added `hoursPerMonth`, `notes`; resolves `ministryName` display → `ministryId` in save~~
- ~~`_minEditMember`: added `hoursPerMonth`, `endDate`, `notes` (all in API schema, all missing from original)~~
- ~~`_minRemoveMember`: was sending `{id}` — API requires `{ministryId, memberId}`. Now looks up cached row to get both~~

---

### ~~17. Giving — Pledges and Member Statement~~
- ~~`giving.pledges.list` / `giving.pledges.create` — pledge tracking~~
- ~~`giving.memberStatement` — generate/display an individual giving statement~~

---

### ~~17a. Giving — API Field Audit~~
~~Full field-level audit against `API Code.md`. Fixed:~~
- ~~Pledges table: `amount`→`pledgeAmount`, `fulfilled`→`totalGiven`, `period`→`frequency`; added `startDate`, `endDate` columns~~
- ~~`_givingNewPledge`: `email`→`memberId`, `amount`→`pledgeAmount`, `period`→`frequency` (Monthly/Weekly/Annual/One-Time/Campaign); added `startDate`, `endDate`, `totalPledged`~~
- ~~`_givingStatement`: was sending `{member}` — API requires `{memberId}`. Now resolves display name → memberId from member directory. Was parsing `{statement:{gifts:[]}}` — API actually returns `{memberId, year, totalGiven, records[]}`. Table corrected to `date`, `fund`, `method`, `amount`, `isTaxDeductible`, `notes`~~
- ~~Gifts table: corrected 'Member' column to `r.donorName || _memberName(r.memberId)`; 'Type'→'Method' using `r.method`; added 'Check #' column~~
- ~~`newGift`: `email`→`memberId`; `type`→`method` (Cash/Check/Online-ACH/Card/Venmo/Zelle/Other); added `donorName`, `checkNumber`, `isTaxDeductible`~~
- ~~`editGift`: all API fields mapped including `currency`, `transactionRef`, `isTaxDeductible`~~

---

### ~~18. Volunteers — Schedule and Swap~~
- ~~`volunteers.schedule` — display a volunteer's upcoming schedule~~
- ~~`volunteers.swap` — swap a volunteer slot between two people~~

---

### ~~18a. Volunteers — API Field Audit~~
~~Full field-level audit against `API Code.md`. Fixed:~~
- ~~`_volSchedule`: was calling `volunteers.schedule({id,...})` — `volunteers.schedule` is a LIST endpoint (`dateFrom`/`dateTo`). Corrected to `volunteers.update({id, scheduledDate, serviceType, ministryTeam, role, status, notes})`~~
- ~~`_volSwap`: completely redesigned. Was a global modal sending `{from, to}` names. Now per-row (accepts `volId`); shows member picker; calls `volunteers.swap({id: volId, swapWith: memberIdOrEmail})`. Global "⇌ Swap" header button removed~~

---

### ~~19. Sermons — Reviews~~
- ~~`sermonReviews.create` / `sermonReviews.list` — peer/staff review system for sermons~~

---

### ~~19a. Sermon Reviews — API Field Audit~~
~~Full field-level audit against `API Code.md`. Fixed:~~
- ~~List call was `sermonReviews.list({limit:60})` with no `sermonId` — API REQUIRES `sermonId`. Replaced display block with sermon picker dropdown; reviews only fetched after a sermon is selected~~
- ~~Was displaying `rating`/stars — not in API schema. Now shows `decision` badge (Approved=green, Needs Revision=orange, Feedback Only=blue), `feedback` text, `privateNotes` (gutter, pastor-only)~~
- ~~`_sermonReviewNew`: was sending `{rating, reviewText}` — corrected to `{sermonId, decision, feedback, reviewerName, privateNotes}`. Decision options: Approved/Needs Revision/Feedback Only~~
- ~~Added `_reviewPickSermon(id)` helper function; exposed in public return statement~~

---

### ~~20. Albums~~
~~No UI for the albums module:~~
- ~~`albums.create` / `albums.get` / `albums.list` / `albums.update` / `albums.delete`~~
- ~~Added to cornerstone ACTIONS, TheVine flock branch, nav registry~~

---

### ~~21. Bulk Import / Export~~
- ~~`bulk.dataExport` — export spreadsheet of member data~~
- ~~`bulk.membersImport` — bulk import members from CSV~~

---

### ~~21a. Bulk Import / Export — API Field Audit~~
~~Full field-level audit against `API Code.md`. Fixed:~~
- ~~`_bulkImport`: was sending `{ csv: text }` — API requires `{ records: JSON.stringify(arr) }`. Now parses CSV client-side (header row → camelCase field map → object array), validates `firstName`/`lastName` presence, sends JSON-stringified records array~~
- ~~`_bulkExport`: was sending `{ type: 'all' }` — API requires `{ tab: 'Members' }` (exact tab name). Rewrote with `tabMap` (members→Members, giving→Giving, pledges→GivingPledges, volunteers→VolunteerSchedule, attendance→Attendance). Response `{ tab, headers, rows[] }` now converted to CSV blob and auto-downloaded. Removed non-existent "Full Export (ZIP)" button; replaced with Members/Giving/Pledges/Attendance buttons~~

---

### ~~23. Church Registry~~
- ~~`church.create` / `church.list` — multi-church / church plant registry~~

---

### ~~23a. Church Registry — API Field Audit~~
~~Full field-level audit against `API Code.md`. Fixed:~~
- ~~Church list table: was using `r.name`, `r.shortName`, `r.adminEmail` (not returned by API). Corrected to `r.churchName`, `r.plan`, `r.status`, `r.createdAt`. Edit IDs corrected from `r.id` to `r.churchId`~~
- ~~`_churchCreate`: modal sent `name`, `shortName`, `adminEmail`, `adminName`, `timezone` — API `handleChurchCreate` only reads `params.churchName` and `params.plan`. Modal simplified to those two fields; plan options corrected to Standard/Premium~~

---

### ~~1. Discipleship Hub — Full UI Build~~
~~The entire discipleship module is implemented in the backend but has no corresponding UI beyond `paths.list/create/update/get`. The following are unbuilt:~~
- ~~`discipleship.enrollments.*` — enroll members, advance steps, mark complete~~
- ~~`discipleship.steps.*` — add/edit/reorder steps within a path~~
- ~~`discipleship.goals.*` — create, track, and review spiritual goals per member~~
- ~~`discipleship.meetings.*` — log discipleship/mentor meetings~~
- ~~`discipleship.mentoring.*` — assign/end/track mentor relationships~~
- ~~`discipleship.milestones.*` — create and record spiritual milestones~~
- ~~`discipleship.assessments.*` — create, assign, and score assessments~~
- ~~`discipleship.resources.*` — attach resources to paths and steps~~
- ~~`discipleship.certificates.*` — issue and revoke discipleship certificates~~
- ~~`discipleship.paths.archive` / `discipleship.paths.publish` — path lifecycle~~
- ~~`discipleship.dashboard` — summary stats panel~~

---

### ~~2. Reports Dashboard~~
~~Five report types exist on the backend with no frontend UI at all:~~
- ~~`reports.attendanceTrend`~~
- ~~`reports.givingSummary`~~
- ~~`reports.memberGrowth`~~
- ~~`reports.prayerOverview`~~
- ~~`reports.dashboard`~~

---

### ~~3. Comms — Notification Center~~
~~Notification infrastructure is completely unrendered:~~
- ~~`comms.notifications.list` — list all notifications for the user~~
- ~~`comms.notifications.markRead` — mark as read~~
- ~~`comms.notifications.dismiss` — dismiss a notification~~
- ~~`comms.notifications.broadcast` — admin broadcast~~
- ~~`comms.notifPrefs.get` / `comms.notifPrefs.update` — user notification preferences~~

---

### ~~4. Comms — Channels, Templates, and Thread Management~~
~~Several comms sub-systems are wired on the backend but have no UI:~~
- ~~`comms.channels.create` / `update` / `delete` / `post` — channel admin and posting~~
- ~~`comms.templates.create/get/list/update/delete/use` — reusable message templates~~
- ~~`comms.threads.archive` / `mute` / `unmute` / `addParticipant` — thread management~~
- ~~`comms.broadcast.list` / `send` — track and send broadcasts~~
- ~~`comms.readReceipts.forMessage` — view who has read a message~~

---

### ~~5. Sermons — Workflow, Upload, Series CRUD~~
~~Sermon submission/approval flow and series editing have no UI:~~
- ~~`sermons.submit` / `sermons.approve` / `sermons.deliver` — sermon lifecycle states~~
- ~~`sermons.upload` — attach audio or video file to a sermon~~
- ~~`sermons.delete` — delete a sermon~~
- ~~`sermons.dashboard` — now cached via `_fetch('sermons-dashboard', ...)` with 5-min TTL~~
- ~~`sermonSeries.create` / `sermonSeries.get` / `sermonSeries.update` — only `.list` is used; no create/edit~~

---

### ~~6. Statistics Dashboard~~
~~Full statistics engine exists on the backend with no frontend:~~
- ~~`statistics.compute` / `statistics.dashboard` / `statistics.export` / `statistics.trends`~~
- ~~`statistics.snapshots.create/get/list/delete`~~
- ~~`statistics.views.create/get/list/update/delete`~~
- ~~`statistics.config.*` — configure which metrics to track~~

---

### ~~7. Worship Service Planning Suite~~
~~Entire worship planning layer is implemented but never rendered:~~
- ~~`serviceItems.create/list/update/delete/reorder` — items within a service plan~~
- ~~`setlistSongs.add/list/update/remove` — songs within a service setlist~~
- ~~`musicStand.get` — real-time music stand view for musicians~~
- ~~`arrangements.create/get/list/update/delete` — song arrangements~~

---

### ~~8. Photo Library~~
~~Only `photos.upload` is used; the full library is unbuilt:~~
- ~~`photos.list` / `photos.get` / `photos.update` / `photos.delete`~~
- ~~`photos.forEntity` — photos attached to a member/event/group~~
- ~~`photos.bulkUpload` — batch photo import~~
- ~~`photos.dashboard` — photo library overview~~

---

### ~~9. Outreach — Campaign CRUD and Contact Workflow~~
~~Only list/create/update/get contacts and create/list follow-ups are used:~~
- ~~`outreach.campaigns.create` / `outreach.campaigns.get` / `outreach.campaigns.update`~~
- ~~`outreach.contacts.convert` — promote an outreach contact to a full member~~
- ~~`outreach.followUps.done` — mark a follow-up as completed~~
- ~~`outreach.followUps.due` — surface overdue follow-ups~~
- ~~`outreach.dashboard`~~

---

### ~~10. Learning — Topic Admin and Course Lifecycle~~
~~The topics taxonomy and several course management actions are unrendered:~~
- ~~`learning.topics.create` / `update` / `delete` / `get` / `tree` — topic admin~~
- ~~`learning.playlists.delete` — delete a course~~
- ~~`learning.playlists.subscribe` — subscribe a member to a course~~
- ~~`learning.dashboard` — learning summary stats~~
- ~~`learning.quizzes.create` / `update` / `delete` / `publish` — admin quiz builder~~

---

### ~~11. Learning — Recommendations Engine~~
~~Recommendation workflow has no UI:~~
- ~~`learning.recommendations.list` — already called but result not rendered in detail~~
- ~~`learning.recommendations.generate` — AI/rule-based recommendation trigger~~
- ~~`learning.recommendations.accept` / `dismiss`~~
- ~~`learning.recommendations.create` — admin-created recommendations~~

---

### ~~12. Learning — Sermon Search for Course Building~~
~~Sermon search helpers are unused during course/lesson creation:~~
- ~~`learning.sermons.search` — search sermons to add as lessons~~
- ~~`learning.sermons.preachers` — filter list by preacher~~
- ~~`learning.sermons.scriptures` — filter by scripture~~
- ~~`learning.sermons.topics` — filter by topic~~

---

### ~~13. Care — Assignment and Follow-Up Management~~
~~Migrated into Love in Action (Assignments + Follow-Ups tabs). Pastoral Care module removed from the app entirely.~~
- ~~`care.assignments.list` — rendered in Love in Action Assignments tab (lazy-loaded)~~
- ~~`care.assignments.forMember` — used by reassign flow~~
- ~~`care.assignments.reassign` — implemented~~
- ~~`care.assignments.end` — implemented~~
- ~~`care.interactions.followUpDone` — implemented in Follow-Ups tab~~

---

### ~~14. Compassion — Resource Inventory and Logging~~
~~Resource management and distribution logging are now rendered:~~
- ~~`compassion.log.create` / `compassion.log.list` / `compassion.log.recent` — all rendered, log-recent cached at 30s TTL~~
- ~~`compassion.resources.create` / `compassion.resources.update` / `compassion.resources.low` — all rendered, cached~~
- ~~`compassion.requests.resolve` — resolve button in Requests tab~~
- ~~`compassion.dashboard` — dashboard tab rendered, stats + low-stock + recent distributions~~
- ~~`compassion.log.delete` — frontend delete button removed; resolved via status-based filtering (`_filterClosed`, status `deleted` in `_TERMINAL_STATUSES`) — see item 27~~

---

### ~~15. MemberCards — Digital Card Management~~
~~Several card features have no UI:~~
- ~~`memberCards.mine` — view own digital card~~
- ~~`memberCards.byNumber` — look up a card by its number~~
- ~~`memberCards.links.create/list/update/delete` — manage QR/share links on a card~~
- ~~`memberCards.views.list` / `memberCards.views.mine` — card view analytics~~
- ~~`memberCards.archive` / `memberCards.bulkProvision` / `memberCards.dashboard`~~

---

### ~~22. Access Control UI~~
- ~~`access.list` / `access.set` / `access.remove` — role-based access control admin panel~~

---

### ~~24. Songs — Get and Delete~~
~~Minor gap: `songs.get` and `songs.delete` are routed on the backend but never called:~~
- ~~`songs.get` — called at the_shofar.js:517 + the_tabernacle.js:1969~~
- ~~`songs.delete` — called at the_shofar.js:854~~

---

### ~~25. Audit: _filterClosed on Remaining Modules~~
~~Modules 1–7 use `_fetch()` with TTL cache. Evaluated which secondary tabs still need `_filterClosed()`:~~
- ~~`sermons` list tab — `_filterClosed(_rows(res))` added (tabernacle.js ~1458)~~
- ~~`sermons` series tab — `_filterClosed(_rows(res))` added (tabernacle.js ~1428)~~
- ~~`services` plans tab — `_filterClosed(_rows(res))` added (tabernacle.js ~1546)~~
- ~~`discipleship` paths/enrollments tabs — intentional client-side status dropdowns, N/A~~
- ~~`comms` threads/channels tabs — no open/closed lifecycle, N/A~~

---

### ~~26. Delete Buttons — Remaining Modules~~
~~Modules 1–7 audited for tables with Edit but no Delete/Archive action:~~
- ~~`services` → service plan items — `_svcItemDelete` at tabernacle.js:1712 with confirm()~~
- ~~`sermons` → series table — `_sermonSeriesDelete` added with confirm() and cache invalidation~~
- ~~`statistics` → config entries — delete button gated to `_isSeedAdmin()` only~~
- ~~`songs` → delete via `_arrDelete` for arrangements + `songs.delete` via the_shofar.js~~

---

### ~~27. Compassion Log — Hard Delete API~~
~~`compassion.log.delete` backend not present in Single.gs. Resolution: frontend delete button removed from Compassion Log; soft-delete via `_filterClosed` (status `deleted` in `_TERMINAL_STATUSES`).~~

---

### ~~28. Outreach Contact Archive → Real Status Field~~
~~`_outContactArchive` calls `.update({ id, status: 'archived' })`. Verified: Single.gs `handleOutreachContactsUpdate` (line 18823) explicitly handles `params.status`. The `archived` value is filtered by `_filterClosed` (`archived` is in `_TERMINAL_STATUSES`). Backend fully supports this.~~

---

### ~~29. API Cache~~
~~All items routed through `TheVine.nurture()` TTL cache:~~
- ~~Upper Room: `devotionals`, `reading` (10-min ref TTL)~~
- ~~Upper Room: `journal`, `prayer`, `care`, `compassion`, `contacts` (5-min CRM TTL)~~
- ~~Directory module: `_ensureMemberDir()` → `_fetch('memberDir')` — debug `console.log`s and rogue promise dedup removed~~
- ~~Compassion: all tabs cached (`compassion`, `compassion-dashboard`, `compassion-resources-low`, `compassion-log-recent`, `compassion-resources`, `compassion-log`)~~
- ~~Sermons dashboard tab: `_fetch('sermons-dashboard', ..., _TTL.crm)`~~

---

### ~~30. Public Content Pages — Formatting Consistency~~
~~Brought to consistent typography (Noto Serif italic 1.1rem / 1.9 line-height, `browse-detail-head/body` card structure, `_paras()` paragraph rendering, `_biblePill()` scripture references):~~
- ~~Bible Books (`library`) — type-colored pills per category~~
- ~~Theology Explorer (`app-theology`) — fixed broken API call, fixed camelCase field names, added stats bar~~
- ~~Apologetics — questions as accordions, category pills color-coded, scripture pills linking to bible.com~~
- ~~Biblical Counseling — Noto Serif italic 1.1rem / 1.9; section labels normalized~~


---

## 1. Discipleship Hub — Full UI Build ✅
The entire discipleship module is implemented in the backend but has no corresponding UI beyond `paths.list/create/update/get`. The following are unbuilt:
- `discipleship.enrollments.*` ✅ — enroll members, advance steps, mark complete
- `discipleship.steps.*` ✅ — add/edit/reorder steps within a path
- `discipleship.goals.*` ✅ — create, track, and review spiritual goals per member
- `discipleship.meetings.*` ✅ — log discipleship/mentor meetings
- `discipleship.mentoring.*` ✅ — assign/end/track mentor relationships
- `discipleship.milestones.*` ✅ — create and record spiritual milestones
- `discipleship.assessments.*` ✅ — create, assign, and score assessments
- `discipleship.resources.*` ✅ — attach resources to paths and steps
- `discipleship.certificates.*` ✅ — issue and revoke discipleship certificates
- `discipleship.paths.archive` / `discipleship.paths.publish` ✅ — path lifecycle
- `discipleship.dashboard` ✅ — summary stats panel

---

## 2. Reports Dashboard ✅
Five report types exist on the backend with no frontend UI at all:
- `reports.attendanceTrend` ✅
- `reports.givingSummary` ✅
- `reports.memberGrowth` ✅
- `reports.prayerOverview` ✅
- `reports.dashboard` ✅

---

## 3. Comms — Notification Center ✅
Notification infrastructure is completely unrendered:
- `comms.notifications.list` ✅ — list all notifications for the user
- `comms.notifications.markRead` ✅ — mark as read
- `comms.notifications.dismiss` ✅ — dismiss a notification
- `comms.notifications.broadcast` ✅ — admin broadcast
- `comms.notifPrefs.get` / `comms.notifPrefs.update` ✅ — user notification preferences

---

## 4. Comms — Channels, Templates, and Thread Management ✅
Several comms sub-systems are wired on the backend but have no UI:
- `comms.channels.create` / `update` / `delete` / `post` ✅ — channel admin and posting
- `comms.templates.create/get/list/update/delete/use` ✅ — reusable message templates
- `comms.threads.archive` / `mute` / `unmute` / `addParticipant` ✅ — thread management
- `comms.broadcast.list` / `send` ✅ — track and send broadcasts
- `comms.readReceipts.forMessage` ✅ — view who has read a message

---

## 5. Sermons — Workflow, Upload, Series CRUD ✅
Sermon submission/approval flow and series editing have no UI:
- `sermons.submit` / `sermons.approve` / `sermons.deliver` ✅ — sermon lifecycle states
- `sermons.upload` ✅ — attach audio or video file to a sermon
- `sermons.delete` ✅ — delete a sermon
- ~~`sermons.dashboard`~~ ✅ — now cached via `_fetch('sermons-dashboard', ...)` with 5-min TTL
- `sermonSeries.create` / `sermonSeries.get` / `sermonSeries.update` ✅ — only `.list` is used; no create/edit

---

## 6. Statistics Dashboard ✅
Full statistics engine exists on the backend with no frontend:
- `statistics.compute` / `statistics.dashboard` / `statistics.export` / `statistics.trends` ✅
- `statistics.snapshots.create/get/list/delete` ✅
- `statistics.views.create/get/list/update/delete` ✅
- `statistics.config.*` ✅ — configure which metrics to track

---

## 7. Worship Service Planning Suite ✅
Entire worship planning layer is implemented but never rendered:
- `serviceItems.create/list/update/delete/reorder` ✅ — items within a service plan
- `setlistSongs.add/list/update/remove` ✅ — songs within a service setlist
- `musicStand.get` ✅ — real-time music stand view for musicians
- `arrangements.create/get/list/update/delete` ✅ — song arrangements

---

## 8. Photo Library ✅
Only `photos.upload` is used; the full library is unbuilt:
- `photos.list` / `photos.get` / `photos.update` / `photos.delete` ✅
- `photos.forEntity` ✅ — photos attached to a member/event/group
- `photos.bulkUpload` ✅ — batch photo import
- `photos.dashboard` ✅ — photo library overview

---

## 9. Outreach — Campaign CRUD and Contact Workflow ✅
Only list/create/update/get contacts and create/list follow-ups are used:
- `outreach.campaigns.create` / `outreach.campaigns.get` / `outreach.campaigns.update` ✅
- `outreach.contacts.convert` ✅ — promote an outreach contact to a full member
- `outreach.followUps.done` ✅ — mark a follow-up as completed
- `outreach.followUps.due` ✅ — surface overdue follow-ups
- `outreach.dashboard` ✅

---

## 10. Learning — Topic Admin and Course Lifecycle ✅
The topics taxonomy and several course management actions are unrendered:
- `learning.topics.create` / `update` / `delete` / `get` / `tree` ✅ — topic admin
- `learning.playlists.delete` ✅ — delete a course
- `learning.playlists.subscribe` ✅ — subscribe a member to a course
- `learning.dashboard` ✅ — learning summary stats
- `learning.quizzes.create` / `update` / `delete` / `publish` ✅ — admin quiz builder

---

## 11. Learning — Recommendations Engine ✅
Recommendation workflow has no UI:
- `learning.recommendations.list` ✅ — already called but result not rendered in detail
- `learning.recommendations.generate` ✅ — AI/rule-based recommendation trigger
- `learning.recommendations.accept` / `dismiss` ✅
- `learning.recommendations.create` ✅ — admin-created recommendations

---

## 12. Learning — Sermon Search for Course Building ✅
Sermon search helpers are unused during course/lesson creation:
- `learning.sermons.search` ✅ — search sermons to add as lessons
- `learning.sermons.preachers` ✅ — filter list by preacher
- `learning.sermons.scriptures` ✅ — filter by scripture
- `learning.sermons.topics` ✅ — filter by topic

---

## 13. Care — Assignment and Follow-Up Management ✅
~~Migrated into Love in Action (Assignments + Follow-Ups tabs). Pastoral Care module removed from the app entirely.~~
- `care.assignments.list` ✅ — rendered in Love in Action Assignments tab (lazy-loaded)
- `care.assignments.forMember` ✅ — used by reassign flow
- `care.assignments.reassign` ✅ — implemented
- `care.assignments.end` ✅ — implemented
- `care.interactions.followUpDone` ✅ — implemented in Follow-Ups tab

---

## 14. Compassion — Resource Inventory and Logging ✅
Resource management and distribution logging are now rendered. Remaining:
- ~~`compassion.log.create` / `compassion.log.list` / `compassion.log.recent`~~ ✅ — all rendered, log-recent cached at 30s TTL
- ~~`compassion.resources.create` / `compassion.resources.update` / `compassion.resources.low`~~ ✅ — all rendered, cached
- ~~`compassion.requests.resolve`~~ ✅ — resolve button in Requests tab
- ~~`compassion.dashboard`~~ ✅ — dashboard tab rendered, stats + low-stock + recent distributions

**Remaining gap:** See item 27 re: `compassion.log.delete` backend verification.

---

## 15. MemberCards — Digital Card Management ✅
Several card features have no UI:
- `memberCards.mine` ✅ — view own digital card
- `memberCards.byNumber` ✅ — look up a card by its number
- `memberCards.links.create/list/update/delete` ✅ — manage QR/share links on a card
- `memberCards.views.list` / `memberCards.views.mine` ✅ — card view analytics
- `memberCards.archive` / `memberCards.bulkProvision` / `memberCards.dashboard` ✅

---

## 16. Ministry Members Roster
`ministryMembers` namespace is completely unbuilt in the UI:
- `ministryMembers.add` / `remove` / `list` / `update` / `forMember`
- `ministries.summary` / `ministries.tree` — summary stats and hierarchy view

---

## 17. Giving — Pledges and Member Statement
- `giving.pledges.list` / `giving.pledges.create` — pledge tracking
- `giving.memberStatement` — generate/display an individual giving statement

---

## 18. Volunteers — Schedule and Swap
- `volunteers.schedule` — display a volunteer's upcoming schedule
- `volunteers.swap` — swap a volunteer slot between two people

---

## 19. Sermons — Reviews
- `sermonReviews.create` / `sermonReviews.list` — peer/staff review system for sermons

---

## 20. Albums
No UI for the albums module:
- `albums.create` / `albums.get` / `albums.list` / `albums.update` / `albums.delete`

---

## 21. Bulk Import / Export
- `bulk.dataExport` — export spreadsheet of member data
- `bulk.membersImport` — bulk import members from CSV

---

## 22. Access Control UI ✅
- `access.list` / `access.set` / `access.remove` ✅ — role-based access control admin panel

---

## 23. Church Registry
- `church.create` / `church.list` — multi-church / church plant registry

---

## 24. Songs — Get and Delete ✅
Minor gap: `songs.get` and `songs.delete` are routed on the backend but never called:
- `songs.get` — retrieve a single song record ✅ called at the_shofar.js:517 + the_tabernacle.js:1969
- `songs.delete` — delete a song ✅ called at the_shofar.js:854

---

## 25. Audit: _filterClosed on remaining modules ✅
Modules 1–7 (Discipleship, Reports, Comms, Sermons, Services, Statistics, Worship) use `_fetch()` with TTL cache. Evaluate which secondary tabs still need `_filterClosed()` applied, particularly:
- `sermons` list tab ✅ `_filterClosed(_rows(res))` added (tabernacle.js ~1458)
- `sermons` series tab ✅ `_filterClosed(_rows(res))` added (tabernacle.js ~1428)
- `services` plans tab ✅ `_filterClosed(_rows(res))` added (tabernacle.js ~1546)
- `discipleship` paths/enrollments tabs ✅ intentional client-side status dropdowns — OK
- `comms` threads/channels tabs — no open/closed lifecycle, N/A

---

## 26. Delete buttons — Remaining Modules ✅
Modules 1–7 still need audit for tables that have Edit but no Delete/Archive action:
- `services` → service plan items ✅ `_svcItemDelete` at tabernacle.js:1712 with confirm()
- `sermons` → series table ✅ `_sermonSeriesDelete` added with confirm() and cache invalidation
- `statistics` → config entries ✅ delete button gated to `_isSeedAdmin()` only
- `songs` → no delete button in songs table ✅ delete via `_arrDelete` for arrangements + `songs.delete` via the_shofar.js

---

## 27. Compassion Log — Hard Delete API ✅
`compassion.log.delete` — **backend NOT present** in Single.gs (only `compassion.log.create/list/recent` are routed at line 5273-5275). Frontend `_cmpLogDelete` at tabernacle.js:10402-10408 calls this endpoint. Implemented soft-delete: send `status:'deleted'` via `compassion.log.update` or remove the button until the endpoint is added.

**Resolution:** Frontend delete button removed from Compassion Log. Use status-based filtering via `_filterClosed` (status `deleted` is in `_TERMINAL_STATUSES`).

---

## 28. Outreach Contact Archive → Real Status Field ✅
`_outContactArchive` calls `.update({ id, status: 'archived' })`. **Verified**: Single.gs `handleOutreachContactsUpdate` (line 18823) explicitly handles `params.status` → `existing[OC.STATUS]`. The `archived` value will be filtered by `_filterClosed` (`archived` is in `_TERMINAL_STATUSES`). Backend fully supports this.

---

## 29. API Cache — Completed This Session ✅
All items below were cold direct API calls; now routed through `TheVine.nurture()` TTL cache:
- ✅ Upper Room: `devotionals`, `reading` (10-min ref TTL) — shared with Devotionals module
- ✅ Upper Room: `journal`, `prayer`, `care`, `compassion`, `contacts` (5-min CRM TTL) — shared with My Flock hub
- ✅ Directory module: now calls `_ensureMemberDir()` → `_fetch('memberDir')` — removed debug `console.log`s and rogue promise dedup
- ✅ Compassion: all 4 tabs cached (`compassion`, `compassion-dashboard`, `compassion-resources-low`, `compassion-log-recent`, `compassion-resources`, `compassion-log`)
- ✅ Sermons dashboard tab: `_fetch('sermons-dashboard', ..., _TTL.crm)`

---

## 30. Public Content Pages — Formatting Consistency ✅
The following public-facing learning modules have been brought to consistent typography (Noto Serif italic 1.1rem / 1.9 line-height, `browse-detail-head/body` card structure, `_paras()` paragraph rendering, `_biblePill()` scripture references):
- ✅ Bible Books (`library`) — type-colored pills per category (Law/History/Poetry/Prophets/Gospels/Epistles/Apocalyptic)
- ✅ Theology Explorer (`app-theology`) — fixed broken API call (`TheVine.app.theology()` → `TheVine.flock.theology.flat()`), fixed camelCase field names, added stats bar
- ✅ Apologetics — questions as accordions (not categories), category pills color-coded per spreadsheet hex, scripture pills inside Scripture card linking to bible.com
- ✅ Biblical Counseling — definition, verse text, step text all updated to Noto Serif italic 1.1rem / 1.9; section labels normalized

---

## 31. Theology Explorer — Verify theology.flat Fields in Production
The `app-theology` module was rewritten to use `TheVine.flock.theology.flat()` and handles three field-name variants (snake_case, camelCase, spaced). Verify in production that `theology.flat` returns the expected rows and that category ordering matches the spreadsheet sort order.

---

## 32. Apologetics — Reference URL Field Dropped
`Reference URL` (column K of Apologetics sheet) is no longer rendered after the pill refactor. If external source links are needed, re-add as a secondary link inside the Scripture card or as a separate card.
