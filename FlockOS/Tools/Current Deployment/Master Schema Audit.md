# FlockOS — Complete Table/Tab Schema Audit

## DOMAIN 1: FLOCK (Main CRM)

82 tabs created by `setupFlockOS()` in **Single.gs**

---

### GROUP 1 — Pastoral Core

#### 1. Members — 51 cols (A–AY)

| Col | Header |
|-----|--------|
| A | ID |
| B | First Name |
| C | Last Name |
| D | Preferred Name |
| E | Suffix |
| F | Date of Birth |
| G | Gender |
| H | Photo URL |
| I | Primary Email |
| J | Secondary Email |
| K | Cell Phone |
| L | Home Phone |
| M | Work Phone |
| N | Preferred Contact |
| O | Street Address 1 |
| P | Street Address 2 |
| Q | City |
| R | State |
| S | ZIP Code |
| T | Country |
| U | Membership Status |
| V | Member Since |
| W | How They Found Us |
| X | Baptism Date |
| Y | Salvation Date |
| Z | Date of Death |
| AA | Household ID |
| AB | Family Role |
| AC | Marital Status |
| AD | Spouse Name |
| AE | Emergency Contact |
| AF | Emergency Phone |
| AG | Ministry Teams |
| AH | Volunteer Roles |
| AI | Spiritual Gifts |
| AJ | Small Group |
| AK | Pastoral Notes |
| AL | Last Contact Date |
| AM | Next Follow-Up |
| AN | Follow-Up Priority |
| AO | Assigned To |
| AP | Tags |
| AQ | Archived |
| AR | Archive Reason |
| AS | Created By |
| AT | Created At |
| AU | Updated By |
| AV | Updated At |
| AW | Website Link |
| AX | Color Scheme |
| AY | BG Scheme |

#### 2. PrayerRequests — 18 cols (A–R)

| Col | Header |
|-----|--------|
| A | ID |
| B | Member ID |
| C | Submitter Name |
| D | Submitter Email |
| E | Submitter Phone |
| F | Prayer Text |
| G | Category |
| H | Is Confidential |
| I | Follow-Up Requested |
| J | Status |
| K | Admin Notes |
| L | Assigned To |
| M | Submitted At |
| N | Last Updated |
| O | Updated By |
| P | Archived |
| Q | Auto Log |
| R | Group ID |

#### 3. JournalEntries — 10 cols (A–J)

| Col | Header |
|-----|--------|
| A | ID |
| B | User Email |
| C | Title |
| D | Entry |
| E | Category |
| F | Scripture Ref |
| G | Mood |
| H | Private |
| I | Created At |
| J | Updated At |

#### 4. ContactLog — 12 cols (A–L)

| Col | Header |
|-----|--------|
| A | ID |
| B | Member ID |
| C | Contact Date |
| D | Contact Type |
| E | Direction |
| F | Subject |
| G | Details |
| H | Follow-Up Needed |
| I | Follow-Up Date |
| J | Follow-Up Completed |
| K | Contacted By |
| L | Created At |

#### 5. PastoralNotes — 8 cols (A–H)

| Col | Header |
|-----|--------|
| A | ID |
| B | Member ID |
| C | Note Date |
| D | Category |
| E | Note Text |
| F | Created By |
| G | Created At |
| H | Group ID |

#### 6. Milestones — 7 cols (A–G)

| Col | Header |
|-----|--------|
| A | ID |
| B | Member ID |
| C | Milestone Type |
| D | Milestone Date |
| E | Description |
| F | Recorded By |
| G | Created At |

#### 7. Households — 11 cols (A–K)

| Col | Header |
|-----|--------|
| A | Household ID |
| B | Household Name |
| C | Street Address 1 |
| D | Street Address 2 |
| E | City |
| F | State |
| G | ZIP Code |
| H | Country |
| I | Primary Contact ID |
| J | Notes |
| K | Created At |

#### 8. ToDo — 19 cols (A–S)

| Col | Header |
|-----|--------|
| A | ID |
| B | Title |
| C | Description |
| D | Assigned To |
| E | Assigned Member ID |
| F | Due Date |
| G | Priority |
| H | Status |
| I | Category |
| J | Entity Type |
| K | Entity ID |
| L | Recurring |
| M | Recurrence Rule |
| N | Notes |
| O | Auto Log |
| P | Created By |
| Q | Created At |
| R | Updated By |
| S | Updated At |

---

### GROUP 2 — Attendance & Events

#### 9. Attendance — 9 cols (A–I)

| Col | Header |
|-----|--------|
| A | ID |
| B | Date |
| C | Service Type |
| D | Adults |
| E | Children |
| F | Total |
| G | Notes |
| H | Recorded By |
| I | Created At |

#### 10. Events — 22 cols (A–V)

| Col | Header |
|-----|--------|
| A | ID |
| B | Title |
| C | Description |
| D | Event Type |
| E | Location |
| F | Start Date |
| G | End Date |
| H | Start Time |
| I | End Time |
| J | Recurring |
| K | Recurring Until |
| L | Capacity |
| M | RSVP Required |
| N | Ministry Team |
| O | Contact Person |
| P | Status |
| Q | Visibility |
| R | Notes |
| S | Created By |
| T | Created At |
| U | Updated By |
| V | Updated At |

#### 11. EventRSVPs — 8 cols (A–H)

| Col | Header |
|-----|--------|
| A | ID |
| B | Event ID |
| C | Member ID |
| D | Response |
| E | Guest Count |
| F | Notes |
| G | Responded At |
| H | Updated At |

---

### GROUP 3 — Small Groups

#### 12. SmallGroups — 16 cols (A–P)

| Col | Header |
|-----|--------|
| A | ID |
| B | Group Name |
| C | Description |
| D | Group Type |
| E | Leader ID |
| F | Co-Leader ID |
| G | Meeting Day |
| H | Meeting Time |
| I | Meeting Location |
| J | Capacity |
| K | Status |
| L | Semester |
| M | Notes |
| N | Created By |
| O | Created At |
| P | Updated At |

#### 13. SmallGroupMembers — 9 cols (A–I)

| Col | Header |
|-----|--------|
| A | ID |
| B | Group ID |
| C | Member ID |
| D | Role |
| E | Joined Date |
| F | Left Date |
| G | Status |
| H | Notes |
| I | Created At |

---

### GROUP 4 — Giving

#### 14. Giving — 15 cols (A–O)

| Col | Header |
|-----|--------|
| A | ID |
| B | Member ID |
| C | Donor Name |
| D | Amount |
| E | Currency |
| F | Date |
| G | Fund |
| H | Method |
| I | Check Number |
| J | Transaction Ref |
| K | Is Tax Deductible |
| L | Notes |
| M | Recorded By |
| N | Created At |
| O | Updated At |

#### 15. GivingPledges — 14 cols (A–N)

| Col | Header |
|-----|--------|
| A | ID |
| B | Member ID |
| C | Fund |
| D | Pledge Amount |
| E | Frequency |
| F | Start Date |
| G | End Date |
| H | Total Pledged |
| I | Total Given |
| J | Status |
| K | Notes |
| L | Created By |
| M | Created At |
| N | Updated At |

---

### GROUP 5 — Volunteers

#### 16. VolunteerSchedule — 13 cols (A–M)

| Col | Header |
|-----|--------|
| A | ID |
| B | Member ID |
| C | Ministry Team |
| D | Role |
| E | Scheduled Date |
| F | Service Type |
| G | Status |
| H | Swap Requested |
| I | Swap With |
| J | Notes |
| K | Scheduled By |
| L | Created At |
| M | Updated At |

---

### GROUP 6 — Communications

#### 17. Communications — 13 cols (A–M)

| Col | Header |
|-----|--------|
| A | ID |
| B | Type |
| C | Subject |
| D | Body |
| E | Audience |
| F | Audience Filter |
| G | Sent At |
| H | Sent By |
| I | Recipient Count |
| J | Status |
| K | Scheduled For |
| L | Notes |
| M | Created At |

#### 18. CommsMessages — 22 cols (A–V)

| Col | Header |
|-----|--------|
| A | ID |
| B | Thread ID |
| C | Sender ID |
| D | Sender Name |
| E | Sender Email |
| F | Recipient Type |
| G | Recipient ID |
| H | Recipient Name |
| I | Message Type |
| J | Subject |
| K | Body |
| L | Priority |
| M | Attachment URL |
| N | Attachment Name |
| O | Reply-To ID |
| P | Status |
| Q | Sent At |
| R | Edited At |
| S | Read Count |
| T | Flagged |
| U | Created At |
| V | Updated At |

#### 19. CommsThreads — 18 cols (A–R)

| Col | Header |
|-----|--------|
| A | ID |
| B | Subject |
| C | Thread Type |
| D | Creator ID |
| E | Creator Name |
| F | Participant IDs |
| G | Participant Names |
| H | Participant Count |
| I | Message Count |
| J | Last Message At |
| K | Last Message By |
| L | Last Snippet |
| M | Status |
| N | Pinned |
| O | Muted By |
| P | Channel ID |
| Q | Created At |
| R | Updated At |

#### 20. CommsNotifications — 20 cols (A–T)

| Col | Header |
|-----|--------|
| A | ID |
| B | Recipient ID |
| C | Recipient Name |
| D | Recipient Email |
| E | Title |
| F | Body |
| G | Notification Type |
| H | Priority |
| I | Entity Type |
| J | Entity ID |
| K | Action URL |
| L | Icon |
| M | Status |
| N | Read At |
| O | Dismissed At |
| P | Sent Via |
| Q | Sender Email |
| R | Expires At |
| S | Created At |
| T | Updated At |

#### 21. CommsNotificationPrefs — 16 cols (A–P)

| Col | Header |
|-----|--------|
| A | ID |
| B | Member ID |
| C | Member Email |
| D | Email Enabled |
| E | Email Digest |
| F | In-App Enabled |
| G | Quiet Hours Start |
| H | Quiet Hours End |
| I | Notif Messages |
| J | Notif Announcements |
| K | Notif Events |
| L | Notif Prayer |
| M | Notif Care |
| N | Notif System |
| O | Created At |
| P | Updated At |

#### 22. CommsChannels — 18 cols (A–R)

| Col | Header |
|-----|--------|
| A | ID |
| B | Channel Name |
| C | Slug |
| D | Description |
| E | Channel Type |
| F | Icon |
| G | Color Hex |
| H | Creator ID |
| I | Creator Name |
| J | Subscriber Count |
| K | Message Count |
| L | Visibility |
| M | Post Permission |
| N | Pinned Message ID |
| O | Status |
| P | Sort Order |
| Q | Created At |
| R | Updated At |

#### 23. CommsTemplates — 16 cols (A–P)

| Col | Header |
|-----|--------|
| A | ID |
| B | Template Name |
| C | Template Type |
| D | Subject |
| E | Body |
| F | Body HTML |
| G | Category |
| H | Variables |
| I | Use Count |
| J | Last Used At |
| K | Visibility |
| L | Status |
| M | Created By |
| N | Created By Name |
| O | Created At |
| P | Updated At |

#### 24. CommsReadReceipts — 10 cols (A–J)

| Col | Header |
|-----|--------|
| A | ID |
| B | Message ID |
| C | Thread ID |
| D | Reader ID |
| E | Reader Name |
| F | Reader Email |
| G | Read At |
| H | Device |
| I | Created At |
| J | Updated At |

#### 25. CommsBroadcastLog — 18 cols (A–R)

| Col | Header |
|-----|--------|
| A | ID |
| B | Type |
| C | Subject |
| D | Body |
| E | Body HTML |
| F | Audience |
| G | Audience Filter |
| H | Template ID |
| I | Channel ID |
| J | Sent At |
| K | Sent By |
| L | Sent By Name |
| M | Recipient Count |
| N | Delivered Count |
| O | Failed Count |
| P | Status |
| Q | Scheduled For |
| R | Created At |

---

### GROUP 7 — Check-In

#### 26. CheckInSessions — 10 cols (A–J)

| Col | Header |
|-----|--------|
| A | ID |
| B | Event ID |
| C | Session Name |
| D | Date |
| E | Opened At |
| F | Closed At |
| G | Total Check-Ins |
| H | Opened By |
| I | Notes |
| J | Created At |

---

### GROUP 8 — Ministries

#### 27. Ministries — 17 cols (A–Q)

| Col | Header |
|-----|--------|
| A | ID |
| B | Ministry Name |
| C | Category |
| D | Description |
| E | Ministry Lead ID |
| F | Co-Lead ID |
| G | Contact Email |
| H | Meeting Day |
| I | Meeting Time |
| J | Meeting Location |
| K | Budget Allocated |
| L | Status |
| M | Reporting To |
| N | Notes |
| O | Created By |
| P | Created At |
| Q | Updated At |

#### 28. MinistryMembers — 10 cols (A–J)

| Col | Header |
|-----|--------|
| A | ID |
| B | Ministry ID |
| C | Member ID |
| D | Role |
| E | Start Date |
| F | End Date |
| G | Status |
| H | Hours Per Month |
| I | Notes |
| J | Created At |

---

### GROUP 9 — Service Planning

#### 29. ServicePlans — 14 cols (A–N)

| Col | Header |
|-----|--------|
| A | ID |
| B | Service Date |
| C | Service Type |
| D | Theme |
| E | Scripture Focus |
| F | Sermon Title |
| G | Preacher ID |
| H | Worship Leader ID |
| I | Status |
| J | Notes |
| K | Created By |
| L | Created At |
| M | Updated By |
| N | Updated At |

#### 30. ServicePlanItems — 10 cols (A–J)

| Col | Header |
|-----|--------|
| A | ID |
| B | Plan ID |
| C | Order |
| D | Item Type |
| E | Title |
| F | Description |
| G | Duration Minutes |
| H | Assigned To ID |
| I | Notes |
| J | Created At |

---

### GROUP 10 — Songs & Music

#### 31. Songs — 18 cols (A–R)

| Col | Header |
|-----|--------|
| A | ID |
| B | Title |
| C | Artist |
| D | CCLI Number |
| E | Default Key |
| F | Tempo BPM |
| G | Time Signature |
| H | Duration Minutes |
| I | Genre |
| J | Tags |
| K | Lyrics |
| L | Notes |
| M | Active |
| N | Drive File ID |
| O | Created By |
| P | Created At |
| Q | Updated By |
| R | Updated At |

#### 32. SongArrangements — 14 cols (A–N)

| Col | Header |
|-----|--------|
| A | ID |
| B | Song ID |
| C | Name |
| D | Key |
| E | Capo |
| F | Chord Chart |
| G | Lyrics With Chords |
| H | Instrument |
| I | Vocal Range |
| J | Drive File ID |
| K | Notes |
| L | Created By |
| M | Created At |
| N | Updated At |

#### 33. SetlistSongs — 10 cols (A–J)

| Col | Header |
|-----|--------|
| A | ID |
| B | Plan ID |
| C | Plan Item ID |
| D | Song ID |
| E | Arrangement ID |
| F | Key Override |
| G | Notes |
| H | Created By |
| I | Created At |
| J | Updated At |

---

### GROUP 11 — Spiritual Care

#### 34. SpiritualCareCases — 19 cols (A–S)

| Col | Header |
|-----|--------|
| A | ID |
| B | Member ID |
| C | Care Type |
| D | Priority |
| E | Status |
| F | Summary |
| G | Assigned Team ID |
| H | Primary Caregiver ID |
| I | Secondary Caregiver ID |
| J | Opened Date |
| K | Target Resolve Date |
| L | Resolved Date |
| M | Referral Info |
| N | Confidential |
| O | Notes |
| P | Created By |
| Q | Created At |
| R | Updated By |
| S | Updated At |

#### 35. SpiritualCareInteractions — 12 cols (A–L)

| Col | Header |
|-----|--------|
| A | ID |
| B | Case ID |
| C | Interaction Date |
| D | Type |
| E | Caregiver ID |
| F | Duration Minutes |
| G | Summary |
| H | Follow-Up Needed |
| I | Follow-Up Date |
| J | Follow-Up Done |
| K | Confidential |
| L | Created At |

#### 36. SpiritualCareAssignments — 11 cols (A–K)

| Col | Header |
|-----|--------|
| A | ID |
| B | Caregiver ID |
| C | Member ID |
| D | Ministry ID |
| E | Role |
| F | Start Date |
| G | End Date |
| H | Status |
| I | Notes |
| J | Created By |
| K | Created At |

---

### GROUP 12 — Outreach

#### 37. OutreachContacts — 22 cols (A–V)

| Col | Header |
|-----|--------|
| A | ID |
| B | First Name |
| C | Last Name |
| D | Email |
| E | Phone |
| F | Address |
| G | City |
| H | State |
| I | Zip |
| J | Source |
| K | Campaign ID |
| L | Status |
| M | Interest Level |
| N | Notes |
| O | Member ID |
| P | Assigned To |
| Q | Last Contact Date |
| R | Next Follow-Up Date |
| S | Tags |
| T | Created By |
| U | Created At |
| V | Updated At |

#### 38. OutreachCampaigns — 19 cols (A–S)

| Col | Header |
|-----|--------|
| A | ID |
| B | Campaign Name |
| C | Type |
| D | Description |
| E | Start Date |
| F | End Date |
| G | Location |
| H | Ministry ID |
| I | Lead ID |
| J | Budget |
| K | Goal Reached |
| L | Actual Reached |
| M | Decisions |
| N | Status |
| O | Notes |
| P | Tags |
| Q | Created By |
| R | Created At |
| S | Updated At |

#### 39. OutreachFollowUps — 12 cols (A–L)

| Col | Header |
|-----|--------|
| A | ID |
| B | Contact ID |
| C | Date |
| D | Type |
| E | By ID |
| F | Summary |
| G | Response |
| H | Follow-Up Needed |
| I | Next Date |
| J | Follow-Up Done |
| K | Notes |
| L | Created At |

---

### GROUP 13 — Photos

> ⚠️ **Planned / Not Yet Implemented** — tab constants and `ensureTab` entries are defined in the schema below, but the backend action handlers (`photos.*`) are commented out in `Single.gs`. Do not create UI until the backend is wired.

#### 40. Photos — 15 cols (A–O)

| Col | Header |
|-----|--------|
| A | ID |
| B | Drive File ID |
| C | URL |
| D | Thumbnail URL |
| E | Filename |
| F | Caption |
| G | Entity Type |
| H | Entity ID |
| I | Album ID |
| J | Uploaded By |
| K | Visibility |
| L | Tags |
| M | File Size |
| N | Created At |
| O | Updated At |

#### 41. PhotoAlbums — 12 cols (A–L)

| Col | Header |
|-----|--------|
| A | ID |
| B | Album Name |
| C | Description |
| D | Entity Type |
| E | Entity ID |
| F | Cover Photo ID |
| G | Visibility |
| H | Tags |
| I | Created By |
| J | Created At |
| K | Updated At |
| L | Photo Count |

---

### GROUP 14 — Sermons

#### 42. Sermons — 22 cols (A–V)

| Col | Header |
|-----|--------|
| A | ID |
| B | Title |
| C | Preacher ID |
| D | Preacher Name |
| E | Date |
| F | Service Type |
| G | Series ID |
| H | Series Order |
| I | Scripture Refs |
| J | Topic Tags |
| K | Summary |
| L | Drive File ID |
| M | File URL |
| N | Filename |
| O | File Type |
| P | Audio Drive ID |
| Q | Video Drive ID |
| R | Status |
| S | Visibility |
| T | Created By |
| U | Created At |
| V | Updated At |

#### 43. SermonSeries — 12 cols (A–L)

| Col | Header |
|-----|--------|
| A | ID |
| B | Series Name |
| C | Description |
| D | Theme Scripture |
| E | Start Date |
| F | End Date |
| G | Preacher ID |
| H | Status |
| I | Cover Image URL |
| J | Sermon Count |
| K | Created At |
| L | Updated At |

#### 44. SermonReviews — 9 cols (A–I)

| Col | Header |
|-----|--------|
| A | ID |
| B | Sermon ID |
| C | Reviewer ID |
| D | Reviewer Name |
| E | Decision |
| F | Feedback |
| G | Reviewed At |
| H | Private Notes |
| I | Created At |

---

### GROUP 15 — Compassion / Benevolence

#### 45. CompassionRequests — 21 cols (A–U)

| Col | Header |
|-----|--------|
| A | ID |
| B | Requester Name |
| C | Phone |
| D | Email |
| E | Is Member |
| F | Member ID |
| G | Request Type |
| H | Description |
| I | Urgency |
| J | Amount Requested |
| K | Amount Approved |
| L | Status |
| M | Assigned Team |
| N | Assigned To |
| O | Follow-Up Date |
| P | Resolution Notes |
| Q | Confidential |
| R | Submitted By |
| S | Approved By |
| T | Created At |
| U | Updated At |

#### 46. CompassionResources — 12 cols (A–L)

| Col | Header |
|-----|--------|
| A | ID |
| B | Resource Name |
| C | Category |
| D | Description |
| E | Quantity On Hand |
| F | Unit |
| G | Reorder Level |
| H | Location |
| I | Donated By |
| J | Status |
| K | Created At |
| L | Updated At |

#### 47. CompassionTeamLog — 12 cols (A–L)

| Col | Header |
|-----|--------|
| A | ID |
| B | Request ID |
| C | Date |
| D | Activity Type |
| E | Team Member ID |
| F | Team Member Name |
| G | Description |
| H | Resources Used |
| I | Amount Disbursed |
| J | Follow-Up Needed |
| K | Notes |
| L | Created At |

---

### GROUP 16 — Discipleship

#### 48. DiscipleshipPaths — 18 cols (A–R)

| Col | Header |
|-----|--------|
| A | ID |
| B | Name |
| C | Description |
| D | Category |
| E | Target Audience |
| F | Difficulty Level |
| G | Estimated Weeks |
| H | Total Steps |
| I | Prerequisite Path ID |
| J | Required For Leadership |
| K | Facilitator Guide URL |
| L | Student Guide URL |
| M | Status |
| N | Visibility |
| O | Created By |
| P | Approved By |
| Q | Created At |
| R | Updated At |

#### 49. DiscipleshipSteps — 18 cols (A–R)

| Col | Header |
|-----|--------|
| A | ID |
| B | Path ID |
| C | Step Order |
| D | Title |
| E | Description |
| F | Step Type |
| G | Duration Minutes |
| H | Scripture Refs |
| I | Learning Objectives |
| J | Content URL |
| K | Video URL |
| L | Homework Description |
| M | Assessment Required |
| N | Passing Score |
| O | Facilitator Notes |
| P | Resource IDs |
| Q | Created At |
| R | Updated At |

#### 50. DiscipleshipEnrollments — 22 cols (A–V)

| Col | Header |
|-----|--------|
| A | ID |
| B | Member ID |
| C | Member Name |
| D | Path ID |
| E | Path Name |
| F | Enrolled Date |
| G | Target Completion |
| H | Actual Completion |
| I | Current Step ID |
| J | Steps Completed |
| K | Total Steps |
| L | Percent Complete |
| M | Status |
| N | Facilitator ID |
| O | Facilitator Name |
| P | Group Cohort |
| Q | Meeting Day |
| R | Meeting Time |
| S | Notes |
| T | Enrolled By |
| U | Created At |
| V | Updated At |

#### 51. DiscipleshipMentoring — 18 cols (A–R)

| Col | Header |
|-----|--------|
| A | ID |
| B | Mentor ID |
| C | Mentor Name |
| D | Mentee ID |
| E | Mentee Name |
| F | Relationship Type |
| G | Focus Area |
| H | Start Date |
| I | End Date |
| J | Meeting Frequency |
| K | Meeting Day |
| L | Meeting Location |
| M | Status |
| N | Goals |
| O | Notes |
| P | Created By |
| Q | Created At |
| R | Updated At |

#### 52. DiscipleshipMeetings — 16 cols (A–P)

| Col | Header |
|-----|--------|
| A | ID |
| B | Mentoring ID |
| C | Meeting Date |
| D | Meeting Time |
| E | Duration Minutes |
| F | Location |
| G | Meeting Type |
| H | Topics Covered |
| I | Scripture Discussed |
| J | Homework Assigned |
| K | Homework Completed |
| L | Prayer Requests |
| M | Action Items |
| N | Notes |
| O | Created At |
| P | Updated At |

#### 53. DiscipleshipAssessments — 22 cols (A–V)

| Col | Header |
|-----|--------|
| A | ID |
| B | Member ID |
| C | Member Name |
| D | Assessment Type |
| E | Assessment Name |
| F | Description |
| G | Date Taken |
| H | Assessed By |
| I | Score Total |
| J | Score Max |
| K | Score Percent |
| L | Results JSON |
| M | Top Gifts |
| N | Top Strengths |
| O | Growth Areas |
| P | Recommendations |
| Q | Enrollment ID |
| R | Path ID |
| S | Status |
| T | Notes |
| U | Created At |
| V | Updated At |

#### 54. DiscipleshipResources — 16 cols (A–P)

| Col | Header |
|-----|--------|
| A | ID |
| B | Title |
| C | Description |
| D | Resource Type |
| E | Author |
| F | URL |
| G | Drive File ID |
| H | Category |
| I | Topic Tags |
| J | Difficulty Level |
| K | Estimated Time |
| L | Path IDs |
| M | Step IDs |
| N | Visibility |
| O | Created At |
| P | Updated At |

#### 55. DiscipleshipMilestones — 16 cols (A–P)

| Col | Header |
|-----|--------|
| A | ID |
| B | Member ID |
| C | Member Name |
| D | Milestone Type |
| E | Milestone Name |
| F | Description |
| G | Date Achieved |
| H | Verified By |
| I | Enrollment ID |
| J | Path ID |
| K | Certificate ID |
| L | Ceremony Date |
| M | Witness |
| N | Notes |
| O | Created At |
| P | Updated At |

#### 56. DiscipleshipGoals — 20 cols (A–T)

| Col | Header |
|-----|--------|
| A | ID |
| B | Member ID |
| C | Member Name |
| D | Goal Category |
| E | Goal Title |
| F | Description |
| G | Target Date |
| H | Completion Date |
| I | Status |
| J | Progress Percent |
| K | Measurement Type |
| L | Target Value |
| M | Current Value |
| N | Accountability Partner ID |
| O | Accountability Partner Name |
| P | Review Frequency |
| Q | Last Reviewed |
| R | Notes |
| S | Created At |
| T | Updated At |

#### 57. DiscipleshipCertificates — 14 cols (A–N)

| Col | Header |
|-----|--------|
| A | ID |
| B | Member ID |
| C | Member Name |
| D | Path ID |
| E | Path Name |
| F | Enrollment ID |
| G | Certificate Number |
| H | Issue Date |
| I | Issued By |
| J | Expiry Date |
| K | Status |
| L | Notes |
| M | Created At |
| N | Updated At |

---

### GROUP 17 — Learning (Sermon-Based Education)

#### 58. LearningTopics — 16 cols (A–P)

| Col | Header |
|-----|--------|
| A | ID |
| B | Topic Name |
| C | Slug |
| D | Description |
| E | Parent Topic ID |
| F | Level |
| G | Sort Order |
| H | Icon URL |
| I | Color Hex |
| J | Featured |
| K | Sermon Count |
| L | Subscriber Count |
| M | Status |
| N | Created By |
| O | Created At |
| P | Updated At |

#### 59. LearningPlaylists — 22 cols (A–V)

| Col | Header |
|-----|--------|
| A | ID |
| B | Title |
| C | Description |
| D | Cover Image URL |
| E | Curator ID |
| F | Curator Name |
| G | Topic IDs |
| H | Topic Names |
| I | Preacher Filter |
| J | Scripture Filter |
| K | Difficulty Level |
| L | Estimated Hours |
| M | Item Count |
| N | Subscriber Count |
| O | Visibility |
| P | Featured |
| Q | Sort Order |
| R | Tags |
| S | Status |
| T | Created By |
| U | Created At |
| V | Updated At |

#### 60. LearningPlaylistItems — 16 cols (A–P)

| Col | Header |
|-----|--------|
| A | ID |
| B | Playlist ID |
| C | Sermon ID |
| D | Sermon Title |
| E | Preacher Name |
| F | Scripture Refs |
| G | Sort Order |
| H | Section Label |
| I | Notes for Learner |
| J | Duration Mins |
| K | Required |
| L | Bonus |
| M | Discussion Questions |
| N | Added By |
| O | Created At |
| P | Updated At |

#### 61. LearningProgress — 20 cols (A–T)

| Col | Header |
|-----|--------|
| A | ID |
| B | Member ID |
| C | Member Name |
| D | Sermon ID |
| E | Sermon Title |
| F | Playlist ID |
| G | Playlist Title |
| H | Status |
| I | Progress Percent |
| J | Last Position Secs |
| K | Total Duration Secs |
| L | Started At |
| M | Completed At |
| N | Listen Count |
| O | Last Listened At |
| P | Rating |
| Q | Device |
| R | Notes |
| S | Created At |
| T | Updated At |

#### 62. LearningNotes — 16 cols (A–P)

| Col | Header |
|-----|--------|
| A | ID |
| B | Member ID |
| C | Member Name |
| D | Sermon ID |
| E | Sermon Title |
| F | Playlist ID |
| G | Note Type |
| H | Title |
| I | Content |
| J | Timestamp Secs |
| K | Scripture Ref |
| L | Highlight Text |
| M | Shared |
| N | Pinned |
| O | Created At |
| P | Updated At |

#### 63. LearningBookmarks — 14 cols (A–N)

| Col | Header |
|-----|--------|
| A | ID |
| B | Member ID |
| C | Member Name |
| D | Sermon ID |
| E | Sermon Title |
| F | Preacher Name |
| G | Collection |
| H | Tags |
| I | Notes |
| J | Position Secs |
| K | Priority |
| L | Reminder Date |
| M | Created At |
| N | Updated At |

#### 64. LearningRecommendations — 18 cols (A–R)

| Col | Header |
|-----|--------|
| A | ID |
| B | Member ID |
| C | Member Name |
| D | Sermon ID |
| E | Sermon Title |
| F | Preacher Name |
| G | Reason Type |
| H | Reason Text |
| I | Topic Match |
| J | Scripture Match |
| K | Score |
| L | Priority |
| M | Status |
| N | Dismissed At |
| O | Recommended By |
| P | Recommended By Name |
| Q | Created At |
| R | Updated At |

#### 65. LearningQuizzes — 18 cols (A–R)

| Col | Header |
|-----|--------|
| A | ID |
| B | Sermon ID |
| C | Sermon Title |
| D | Playlist ID |
| E | Title |
| F | Description |
| G | Difficulty |
| H | Pass Percent |
| I | Questions JSON |
| J | Question Count |
| K | Time Limit Mins |
| L | Attempts Allowed |
| M | Topic Tags |
| N | Scripture Refs |
| O | Status |
| P | Created By |
| Q | Created At |
| R | Updated At |

#### 66. LearningQuizResults — 18 cols (A–R)

| Col | Header |
|-----|--------|
| A | ID |
| B | Quiz ID |
| C | Quiz Title |
| D | Member ID |
| E | Member Name |
| F | Sermon ID |
| G | Attempt Number |
| H | Started At |
| I | Completed At |
| J | Time Taken Secs |
| K | Answers JSON |
| L | Correct Count |
| M | Total Questions |
| N | Score Percent |
| O | Passed |
| P | Feedback |
| Q | Created At |
| R | Updated At |

#### 67. LearningCertificates — 16 cols (A–P)

| Col | Header |
|-----|--------|
| A | ID |
| B | Member ID |
| C | Member Name |
| D | Certificate Type |
| E | Playlist ID |
| F | Playlist Title |
| G | Quiz ID |
| H | Quiz Title |
| I | Certificate Number |
| J | Issue Date |
| K | Issued By |
| L | Expiry Date |
| M | Status |
| N | Notes |
| O | Created At |
| P | Updated At |

---

### GROUP 18 — Theology

#### 68. TheologyCategories — 12 cols (A–L)

| Col | Header |
|-----|--------|
| A | ID |
| B | Category ID |
| C | Title |
| D | Subtitle |
| E | Intro |
| F | Icon |
| G | Color Var |
| H | Sort Order |
| I | Visible |
| J | Status |
| K | Created At |
| L | Updated At |

#### 69. TheologySections — 16 cols (A–P)

| Col | Header |
|-----|--------|
| A | ID |
| B | Category Row ID |
| C | Section ID |
| D | Title |
| E | Content |
| F | Summary |
| G | Scripture Refs |
| H | Keywords |
| I | Sort Order |
| J | Visible |
| K | Approved By |
| L | Approved At |
| M | Version |
| N | Status |
| O | Created At |
| P | Updated At |

#### 70. TheologyScriptures — 12 cols (A–L)

| Col | Header |
|-----|--------|
| A | ID |
| B | Section Row ID |
| C | Reference |
| D | Text |
| E | Translation |
| F | Context Note |
| G | Sort Order |
| H | Is Primary |
| I | Status |
| J | Created By |
| K | Created At |
| L | Updated At |

#### 71. TheologyRevisions — 10 cols (A–J)

| Col | Header |
|-----|--------|
| A | ID |
| B | Section Row ID |
| C | Version |
| D | Previous Title |
| E | Previous Content |
| F | Changed By |
| G | Change Reason |
| H | Approved By |
| I | Status |
| J | Created At |

---

### GROUP 19 — Member Cards

#### 72. MemberCards — 30 cols (A–AD)

| Col | Header |
|-----|--------|
| A | ID |
| B | Member Number |
| C | Email |
| D | First Name |
| E | Last Name |
| F | Preferred Name |
| G | Suffix |
| H | Photo URL |
| I | Card Title |
| J | Card Bio |
| K | Ministry |
| L | Small Group |
| M | Phone |
| N | Phone Visible |
| O | Email Visible |
| P | Website URL |
| Q | Schedule URL |
| R | Color Scheme |
| S | BG Scheme |
| T | Card Icon |
| U | Show Daily Bread |
| V | Show Prayer Ticker |
| W | Card Footer |
| X | Visibility |
| Y | View Count |
| Z | Active |
| AA | Status |
| AB | Created By |
| AC | Created At |
| AD | Updated At |

#### 73. MemberCardLinks — 12 cols (A–L)

| Col | Header |
|-----|--------|
| A | ID |
| B | Card Row ID |
| C | Link Type |
| D | Label |
| E | Icon |
| F | URL |
| G | Sort Order |
| H | Visible |
| I | Platform |
| J | Status |
| K | Created At |
| L | Updated At |

#### 74. MemberCardViews — 8 cols (A–H)

| Col | Header |
|-----|--------|
| A | ID |
| B | Card Row ID |
| C | Member Number |
| D | Viewer Email |
| E | View Source |
| F | User Agent |
| G | IP Hash |
| H | Viewed At |

---

### GROUP 20 — Auth & Config

#### 75. AuthUsers — 10 cols (A–J)

| Col | Header |
|-----|--------|
| A | Email |
| B | Passcode |
| C | Passcode Hash |
| D | Salt |
| E | First Name |
| F | Last Name |
| G | Role |
| H | Status |
| I | Created At |
| J | Updated At |

#### 76. UserProfiles — 10 cols (A–J)

| Col | Header |
|-----|--------|
| A | Email |
| B | Display Name |
| C | Photo URL |
| D | Phone |
| E | Bio |
| F | Timezone |
| G | Language |
| H | Notifications |
| I | Theme |
| J | Updated At |

#### 77. AccessControl — 8 cols (A–H)

| Col | Header |
|-----|--------|
| A | Email |
| B | Role |
| C | Display Name |
| D | Groups |
| E | Active |
| F | Notes |
| G | Created At |
| H | Updated At |

#### 78. Permissions — 6 cols (A–F)

| Col | Header |
|-----|--------|
| A | Email |
| B | Module |
| C | Access |
| D | GrantedBy |
| E | GrantedAt |
| F | Notes |

#### 79. CalendarEvents — 18 cols (A–R)

| Col | Header |
|-----|--------|
| A | EventID |
| B | Email |
| C | Title |
| D | Description |
| E | StartDateTime |
| F | EndDateTime |
| G | Location |
| H | Attendees |
| I | Color |
| J | IsAllDay |
| K | RecurrenceRule |
| L | Visibility |
| M | SharedWith |
| N | DelegatedTo |
| O | CreatedAt |
| P | CreatedBy |
| Q | UpdatedAt |
| R | UpdatedBy |

#### 79a. CalendarDelegation — 7 cols (A–G)

> Allows one user to grant another view/edit access to their personal calendar. Full CRUD handlers: `handleDelegationList`, `handleDelegationGrant`, `handleDelegationRevoke`. No `ensureTab` entry — tab must be created manually or added to Setup.

| Col | Header |
|-----|--------|
| A | ID |
| B | Owner Email |
| C | Delegate Email |
| D | Permission |
| E | Granted At |
| F | Expires At |
| G | Status |

#### 80. AuthAudit — 4 cols (A–D)

| Col | Header |
|-----|--------|
| A | Timestamp |
| B | Event |
| C | Email |
| D | Details |

#### 81. AuditLog — 7 cols (A–G)

| Col | Header |
|-----|--------|
| A | Timestamp |
| B | Email |
| C | Role |
| D | Action |
| E | Tab |
| F | Row Ref |
| G | Details |

#### 82. AppConfig — 6 cols (A–F)

| Col | Header |
|-----|--------|
| A | Key |
| B | Value |
| C | Description |
| D | Category |
| E | Updated By |
| F | Updated At |

---

## DOMAIN 2: MISSIONS (Missions Domain in Single.gs)

8 tabs defined via column maps in **Missions section of Single.gs** (headers derived from column-map constants)

---

#### 83. MissionsRegistry — 28 cols (A–AB)

| Col | Header |
|-----|--------|
| A | ID |
| B | Country Name |
| C | ISO Code |
| D | Icon |
| E | Tab Name |
| F | Region 1040 |
| G | Continent |
| H | Population |
| I | Capital |
| J | Official Language |
| K | Dominant Religion |
| L | Persecution Rank |
| M | Persecution Score |
| N | Persecution Level |
| O | Gospel Access |
| P | Unreached People Groups |
| Q | Total People Groups |
| R | Pct Evangelical |
| S | Pct Christian |
| T | Freedom Index |
| U | Region Count |
| V | City Count |
| W | Partner Count |
| X | Last Update At |
| Y | Status |
| Z | Sort Order |
| AA | Created At |
| AB | Updated At |

#### 84. MissionsRegions — 24 cols (A–X)

| Col | Header |
|-----|--------|
| A | ID |
| B | Country ID |
| C | Region Name |
| D | Region Type |
| E | Population |
| F | Coordinates |
| G | Color Hex |
| H | Dominant Religion |
| I | Pct Christian |
| J | Literacy Rate |
| K | Persecution Level |
| L | Gospel Access |
| M | Unreached Groups |
| N | Security Threat |
| O | Humanitarian Need |
| P | Media Restriction |
| Q | Church Presence |
| R | Missionary Access |
| S | Primary Hurdle |
| T | Notes |
| U | Status |
| V | Sort Order |
| W | Created At |
| X | Updated At |

#### 85. MissionsCities — 30 cols (A–AD)

| Col | Header |
|-----|--------|
| A | ID |
| B | Country ID |
| C | Region ID |
| D | City Name |
| E | City Type |
| F | Population |
| G | Coordinates |
| H | Color Hex |
| I | Literacy Rate |
| J | Dominant Religion |
| K | Pct Christian |
| L | Persecution Level |
| M | Violence Level |
| N | Church Life |
| O | National Life |
| P | Social Life |
| Q | Private Life |
| R | Family Life |
| S | Gospel Access |
| T | Media Restriction |
| U | Security Threat |
| V | Humanitarian Need |
| W | Missionary Access |
| X | Church Presence |
| Y | Primary Hurdle |
| Z | Prayer Focus |
| AA | Notes |
| AB | Status |
| AC | Created At |
| AD | Updated At |

#### 86. MissionsPartners — 20 cols (A–T)

| Col | Header |
|-----|--------|
| A | ID |
| B | Organization Name |
| C | Partner Type |
| D | Country IDs |
| E | Contact Name |
| F | Contact Email |
| G | Contact Phone |
| H | Website |
| I | Focus Area |
| J | Description |
| K | Workers Count |
| L | Relationship Status |
| M | Financial Support |
| N | Prayer Support |
| O | Last Contact At |
| P | Security Level |
| Q | Notes |
| R | Status |
| S | Created At |
| T | Updated At |

#### 87. MissionsPrayerFocus — 16 cols (A–P)

| Col | Header |
|-----|--------|
| A | ID |
| B | Country ID |
| C | City ID |
| D | Title |
| E | Description |
| F | Scripture |
| G | Start Date |
| H | End Date |
| I | Priority |
| J | People Group |
| K | Prayer Points |
| L | Responses Count |
| M | Created By |
| N | Status |
| O | Created At |
| P | Updated At |

#### 88. MissionsUpdates — 16 cols (A–P)

| Col | Header |
|-----|--------|
| A | ID |
| B | Country ID |
| C | City ID |
| D | Title |
| E | Body |
| F | Update Type |
| G | Severity |
| H | Source |
| I | Verified |
| J | Security Level |
| K | Published |
| L | Published By |
| M | Attachment URL |
| N | Notes |
| O | Created At |
| P | Updated At |

#### 89. MissionsTeams — 20 cols (A–T)

| Col | Header |
|-----|--------|
| A | ID |
| B | Team Name |
| C | Country ID |
| D | Team Lead ID |
| E | Team Lead Name |
| F | Member IDs |
| G | Member Names |
| H | Member Count |
| I | Trip Type |
| J | Start Date |
| K | End Date |
| L | Budget |
| M | Raised |
| N | Objectives |
| O | Partner ID |
| P | Trip Status |
| Q | Debrief Notes |
| R | Notes |
| S | Created At |
| T | Updated At |

#### 90. MissionsMetrics — 20 cols (A–T)

| Col | Header |
|-----|--------|
| A | ID |
| B | Country ID |
| C | Year |
| D | Persecution Rank |
| E | Persecution Score |
| F | Violence Score |
| G | Pressure Score |
| H | Church Life Score |
| I | National Life Score |
| J | Social Life Score |
| K | Private Life Score |
| L | Family Life Score |
| M | Population |
| N | Pct Christian |
| O | Pct Evangelical |
| P | Unreached Groups |
| Q | Source |
| R | Notes |
| S | Created At |
| T | Updated At |

---

## DOMAIN 3: EXTRA / STATISTICS (Extra Domain in Single.gs)

3 tabs defined via column maps in **Statistics section of Single.gs** (headers derived from column-map constants)

---

#### 91. StatisticsConfig — 18 cols (A–R)

| Col | Header |
|-----|--------|
| A | ID |
| B | Slot |
| C | Label |
| D | Description |
| E | Category |
| F | Source Tab |
| G | Source Column |
| H | Calc Type |
| I | Filter Field |
| J | Filter Value |
| K | Date Field |
| L | Format Type |
| M | Unit Label |
| N | Display Order |
| O | Widget Type |
| P | Active |
| Q | Created At |
| R | Updated At |

#### 92. StatisticsSnapshots — 58 cols (A–BF)

| Col | Header |
|-----|--------|
| A | ID |
| B | Snapshot Date |
| C | Period Type |
| D | Period Label |
| E | h1 |
| F | h2 |
| G | h3 |
| H | h4 |
| I | h5 |
| J | h6 |
| K | h7 |
| L | h8 |
| M | h9 |
| N | h10 |
| O | h11 |
| P | h12 |
| Q | h13 |
| R | h14 |
| S | h15 |
| T | h16 |
| U | h17 |
| V | h18 |
| W | h19 |
| X | h20 |
| Y | h21 |
| Z | h22 |
| AA | h23 |
| AB | h24 |
| AC | h25 |
| AD | h26 |
| AE | h27 |
| AF | h28 |
| AG | h29 |
| AH | h30 |
| AI | h31 |
| AJ | h32 |
| AK | h33 |
| AL | h34 |
| AM | h35 |
| AN | h36 |
| AO | h37 |
| AP | h38 |
| AQ | h39 |
| AR | h40 |
| AS | h41 |
| AT | h42 |
| AU | h43 |
| AV | h44 |
| AW | h45 |
| AX | h46 |
| AY | h47 |
| AZ | h48 |
| BA | h49 |
| BB | h50 |
| BC | Notes |
| BD | Created By |
| BE | Created At |
| BF | Status |

#### 93. StatisticsCustomViews — 14 cols (A–N)

| Col | Header |
|-----|--------|
| A | ID |
| B | View Name |
| C | Description |
| D | Layout Type |
| E | Slots Included |
| F | Chart Type |
| G | Period Type |
| H | Date Range |
| I | Role Required |
| J | Is Default |
| K | Sort By |
| L | Created By |
| M | Created At |
| N | Updated At |

---

## MULTI-CHURCH (Master Spreadsheet)

1 tab defined in **Expansions.gs** (manual creation — no `ensureTab`)

---

#### 94. ChurchRegistry — 6 cols (A–F)

| Col | Header |
|-----|--------|
| A | ChurchID |
| B | SheetID |
| C | Name |
| D | Plan |
| E | Status |
| F | CreatedAt |

---

## Summary

| Domain | Tab Count | Total Columns |
|-------------|-----------|---------------|
| FLOCK (main CRM) | 82 | 1,183 |
| MISSIONS | 8 | 174 |
| EXTRA (Statistics) | 3 | 90 |
| Multi-Church | 1 | 6 |
| **TOTAL** | **94** | **1,453** |

> All domains reside in a single Google Sheet, managed by a single GAS Web App (`Single.gs`).

### Notes for PostgreSQL Schema Generation

1. **Primary Keys**: Most tables use `ID` (UUID). Exceptions: `AuthUsers`/`UserProfiles`/`AccessControl`/`Permissions` use `Email` as PK; `Households` uses `Household ID`; `AppConfig` uses `Key`; `CalendarEvents` uses `EventID`.
2. **Foreign Keys**: FK relationships are documented in Setup.gs comments (e.g., `Member ID → Members.ID`).
3. **Denormalized fields**: Many tables include `_Name` columns alongside `_ID` FK columns for display convenience (e.g., `Member Name` + `Member ID`).
4. **JSON columns**: `Results JSON`, `Answers JSON`, `Questions JSON` store structured data as JSON strings.
5. **Comma-separated columns**: Fields like `Tags`, `Ministry Teams`, `Participant IDs`, `Country IDs` store comma-separated lists (consider array or junction tables in PostgreSQL).
6. **Boolean columns**: Stored as `TRUE`/`FALSE` text in Sheets — map to `BOOLEAN` in PostgreSQL.
7. **StatisticsSnapshots h1–h50**: Generic metric slots (dynamic schema) — consider `JSONB` or a key-value table in PostgreSQL instead of 50 fixed columns.
8. **No ensureTab for Missions/Statistics/ChurchRegistry**: Column names for tables 83–94 are derived from GAS column-map constants, not from literal header arrays.
