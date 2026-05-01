# Notes About The Views

## Overview

This folder contains all view modules for FlockOS New Covenant. Each subfolder is a self-contained view loaded dynamically by the router (`the_scribes`). Every view exposes an `index.js` with at minimum a `render()` and `mount()` export. The shared layout shell (`_frame.js`) is used by all views.

---

## Shared Shell

| File | Purpose |
|------|---------|
| `_frame.js` | Shared layout wrapper used by every view. Not a route — a utility. |

---

## Core App Views

These views are the primary feature surfaces of FlockOS New Covenant, registered in `the_ark.js`.

| Folder | Route | Description |
|--------|-------|-------------|
| `the_good_shepherd/` | `the_good_shepherd` | Home dashboard — flock feed, counts, next steps, and the call |
| `the_invitation/` | `the_invitation` | Sign-in / authentication surface |
| `the_wall/` | `the_wall` | Admin panel |
| `the_great_commission/` | `the_great_commission` | Missions |
| `the_pentecost/` | `the_pentecost` | Events |
| `the_generations/` | `the_generations` | Church history |
| `the_anatomy_of_worship/` | `the_anatomy_of_worship` | Worship |
| `the_call_to_forgive/` | `the_call_to_forgive` | Reconciliation |
| `the_gift_drift/` | `the_gift_drift` | Giving / stewardship |
| `the_weavers_plan/` | `the_weavers_plan` | Strategy |
| `prayerful_action/` | `prayerful_action` | Prayer journal |
| `quarterly_worship/` | `quarterly_worship` | Worship planning |
| `software_deployment_referral/` | `software_deployment_referral` | Church software deployment referral |
| `fishing_for_men/` | `fishing_for_men` | Outreach |
| `fishing_for_data/` | `fishing_for_data` | Analytics |
| `bezalel/` | `bezalel` | Bezalel codex / design tools |
| `about_flockos/` | `about_flockos` | About FlockOS |
| `learn_more/` | `learn_more` | Learn more / marketing |

---

## Communication Views

| Folder | Route | Description |
|--------|-------|-------------|
| `the_fellowship/` | `the_fellowship` | Fellowship — member directory and connection |
| `the_announcements/` | `the_announcements` | Church announcements |
| `the_prayer_chain/` | `the_prayer_chain` | Prayer chain |
| `the_upper_room/` | `the_upper_room` | Real-time chat (FlockChat integration) |

---

## Care & Life Views

| Folder | Route | Description |
|--------|-------|-------------|
| `the_fold/` | `the_fold` | The Fold — member care and follow-up |
| `the_life/` | `the_life` | Pastoral care |
| `the_seasons/` | `the_seasons` | Liturgical seasons / calendar |

---

## Mission Views

| Folder | Route | Description |
|--------|-------|-------------|
| `the_harvest/` | `the_harvest` | Harvest — evangelism and conversions |
| `the_way/` | `the_way` | The Way — discipleship pathways |
| `the_truth/` | `the_truth` | Content / media library |

---

## Discipleship & Growth Views — Origin: A Touch of the Gospel

The following views are registered in the router and folders exist, but they originated from **A Touch of the Gospel** — a standalone discipleship and biblical study application concept. They have been carried into New Covenant but their full implementation is ongoing.

| Folder | Route | Description |
|--------|-------|-------------|
| `the_growth/` | `the_growth` | Grow — discipleship dashboard hub |
| `the_gospel_courses/` | `the_gospel_courses` | Courses |
| `the_gospel_quizzes/` | `the_gospel_quizzes` | Quizzes |
| `the_gospel_reading/` | `the_gospel_reading` | Reading plans |
| `the_gospel_theology/` | `the_gospel_theology` | Theology |
| `the_gospel_lexicon/` | `the_gospel_lexicon` | Biblical lexicon |
| `the_gospel_library/` | `the_gospel_library` | The Word library |
| `the_gospel_devotionals/` | `the_gospel_devotionals` | Devotionals |
| `the_gospel_apologetics/` | `the_gospel_apologetics` | Apologetics |
| `the_gospel_counseling/` | `the_gospel_counseling` | Biblical counseling |
| `the_gospel_heart/` | `the_gospel_heart` | Heart check |
| `the_gospel_genealogy/` | `the_gospel_genealogy` | Biblical genealogy |
| `the_gospel_journal/` | `the_gospel_journal` | Personal journal |
| `the_gospel_certificates/` | `the_gospel_certificates` | Certificates of completion |
| `the_gospel_analytics/` | `the_gospel_analytics` | Learning analytics |
