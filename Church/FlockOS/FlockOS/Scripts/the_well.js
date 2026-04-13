/* ══════════════════════════════════════════════════════════════════════════════
   THE WELL — FlockOS Backup, Restore & Template System
   "Jesus answered, 'Everyone who drinks this water will be thirsty again,
    but whoever drinks the water I give them will never thirst.'" — John 4:13-14

   Provides three core capabilities:
     1. TEMPLATE — Generate blank .xlsx files with correct tab names & headers
        for the unified FlockOS database. Hand these to a new church so they can
        import into Google Sheets and be up and running immediately.
     2. BACKUP  — Pull live data from the unified API through TheVine and package
        every namespace into downloadable .xlsx workbooks.
     3. RESTORE — Parse uploaded .xlsx files and push rows back into the
        system through TheVine's create/bulk endpoints.

   Requires: SheetJS (XLSX) loaded via CDN, TheVine API surface.

   Usage:
     TheWell.template('flock')     // Download blank Flock CRM template
     TheWell.templateAll()         // Download all templates
     TheWell.backup('flock')       // Backup live Flock data to .xlsx
     TheWell.backupAll()           // Backup all data
     TheWell.restore('flock', file)// Restore from uploaded .xlsx
     TheWell.schema()              // View full schema
   ══════════════════════════════════════════════════════════════════════════════ */

const TheWell = (() => {
  'use strict';

  function _isFB() {
    return typeof Modules !== 'undefined' && Modules._isFirebaseComms && Modules._isFirebaseComms();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. SCHEMA — Complete tab definitions for the unified FlockOS database
  //    Format: [TabName, [header1, header2, ...]]
  // ═══════════════════════════════════════════════════════════════════════════

  const SCHEMA = {

    // ── MATTHEW (App / Content) ──────────────────────────────────────────
    app: {
      label: 'Matthew — Content',
      file:  'FlockOS_Matthew_Content.xlsx',
      tabs: [
        ['Books', ['Book Name','Testament','Genre','Summary','Core Theology','Practical Application','booknum']],
        ['Genealogy', ['Name','Title','Lifespan','Meaning','Reference','Bio','Children','ID']],
        ['Counseling', ['Title','Icon','Color','Definition','Scriptures','Steps','ID']],
        ['Devotionals', ['Date','Title','Theme','Scripture','Reflection','Question','Prayer']],
        ['Reading', ['Old Testament','New Testament','Psalms','Proverbs']],
        ['Words', ['English','Strong\'s','Original','Transliteration','Definition','Nuance','Testament','Theme','Usage Count','Verses']],
        ['Heart', ['Question ID','Category','Chart Axis','Question','Prescription','Verse Reference']],
        ['Mirror', ['Category ID','Category Title','Color','Chart Label','Question ID','Question','Prescription','Scripture','Slug']],
        ['Theology', ['Category ID','Category Title','Category Intro','Section ID','Section Title','Content']],
        ['Config', ['Key','Value']],
        ['Quiz', ['ID','Question','Option A','Option B','Option C','Option D','Correct Answer','Reference','Category','Difficulty']],
        ['Apologetics', ['Category ID','Category Title','Category Color','Category Intro','Question ID','Question Title','Short Title','Answer Content','Quote Text','Reference Text','Reference URL']],
      ]
    },

    // ── MARK (Missions) ──────────────────────────────────────────────────
    missions: {
      label: 'Mark — Missions',
      file:  'FlockOS_Mark_Missions.xlsx',
      tabs: [
        ['MissionsRegistry', ['ID','Country Name','ISO Code','Icon','Tab Name','10/40 Window','Continent','Population','Capital','Official Language','Dominant Religion','Persecution Rank','Persecution Score','Persecution Level','Gospel Access','Unreached People Groups','Total People Groups','% Evangelical','% Christian','Freedom Index','Region Count','City Count','Partner Count','Last Update At','Status','Sort Order','Created At','Updated At']],
        ['MissionsRegions', ['ID','Country ID','Region Name','Region Type','Population','Coordinates','Color Hex','Dominant Religion','% Christian','Literacy Rate','Persecution Level','Gospel Access','Unreached Groups','Security Threat','Humanitarian Need','Media Restriction','Church Presence','Missionary Access','Primary Hurdle','Notes','Status','Sort Order','Created At','Updated At']],
        ['MissionsCities', ['ID','Country ID','Region ID','City Name','City Type','Population','Coordinates','Color Hex','Literacy Rate','Dominant Religion','% Christian','Persecution Level','Violence Level','Church Life','National Life','Social Life','Private Life','Family Life','Gospel Access','Media Restriction','Security Threat','Humanitarian Need','Missionary Access','Church Presence','Primary Hurdle','Prayer Focus','Notes','Status','Created At','Updated At']],
        ['MissionsPartners', ['ID','Organization Name','Partner Type','Country IDs','Contact Name','Contact Email','Contact Phone','Website','Focus Area','Description','Workers Count','Relationship Status','Financial Support','Prayer Support','Last Contact At','Security Level','Notes','Status','Created At','Updated At']],
        ['MissionsPrayerFocus', ['ID','Country ID','City ID','Title','Description','Scripture','Start Date','End Date','Priority','People Group','Prayer Points','Responses Count','Created By','Status','Created At','Updated At']],
        ['MissionsUpdates', ['ID','Country ID','City ID','Title','Body','Update Type','Severity','Source','Verified','Security Level','Published','Published By','Attachment URL','Notes','Created At','Updated At']],
        ['MissionsTeams', ['ID','Team Name','Country ID','Team Lead ID','Team Lead Name','Member IDs','Member Names','Member Count','Trip Type','Start Date','End Date','Budget','Raised','Objectives','Partner ID','Trip Status','Debrief Notes','Notes','Created At','Updated At']],
        ['MissionsMetrics', ['ID','Country ID','Year','Persecution Rank','Persecution Score','Violence Score','Pressure Score','Church Life Score','National Life Score','Social Life Score','Private Life Score','Family Life Score','Population','% Christian','% Evangelical','Unreached Groups','Source','Notes','Created At','Updated At']],
      ]
    },

    // ── LUKE (Extra / Statistics) ────────────────────────────────────────
    extra: {
      label: 'Luke — Statistics',
      file:  'FlockOS_Luke_Statistics.xlsx',
      tabs: [
        ['StatisticsConfig', ['ID','Slot','Label','Description','Category','Source Tab','Source Column','Calc Type','Filter Field','Filter Value','Date Field','Format Type','Unit Label','Display Order','Widget Type','Active','Created At','Updated At']],
        ['StatisticsSnapshots', ['ID','Snapshot Date','Period Type','Period Label'].concat(_genCols('h', 50)).concat(['Notes','Created By','Created At','Status'])],
        ['StatisticsCustomViews', ['ID','View Name','Description','Layout Type','Slots Included','Chart Type','Period Type','Date Range','Role Required','Is Default','Sort By','Created By','Created At','Updated At']],
      ]
    },

    // ── JOHN (Flock CRM) ─────────────────────────────────────────────────
    flock: {
      label: 'John — Flock CRM',
      file:  'FlockOS_John_Flock.xlsx',
      tabs: [
        // Pastoral Core
        ['Members', ['ID','First Name','Last Name','Preferred Name','Suffix','Date of Birth','Gender','Photo URL','Primary Email','Secondary Email','Cell Phone','Home Phone','Work Phone','Preferred Contact','Street Address 1','Street Address 2','City','State','ZIP Code','Country','Membership Status','Member Since','How They Found Us','Baptism Date','Salvation Date','Date of Death','Household ID','Family Role','Marital Status','Spouse Name','Emergency Contact','Emergency Phone','Ministry Teams','Volunteer Roles','Spiritual Gifts','Small Group','Pastoral Notes','Last Contact Date','Next Follow-Up','Follow-Up Priority','Assigned To','Tags','Archived','Archive Reason','Created By','Created At','Updated By','Updated At','Website Link','Color Scheme','BG Scheme']],
        ['PrayerRequests', ['ID','Member ID','Submitter Name','Submitter Email','Submitter Phone','Prayer Text','Category','Is Confidential','Follow-Up Requested','Status','Admin Notes','Assigned To','Submitted At','Last Updated','Updated By','Archived','Auto Log','Group ID']],
        ['JournalEntries', ['ID','User Email','Title','Entry','Category','Scripture Ref','Mood','Private','Created At','Updated At']],
        ['ContactLog', ['ID','Member ID','Contact Date','Contact Type','Direction','Subject','Details','Follow-Up Needed','Follow-Up Date','Follow-Up Completed','Contacted By','Created At']],
        ['PastoralNotes', ['ID','Member ID','Note Date','Category','Note Text','Created By','Created At','Group ID']],
        ['Milestones', ['ID','Member ID','Milestone Type','Milestone Date','Description','Recorded By','Created At']],
        ['Households', ['Household ID','Household Name','Street Address 1','Street Address 2','City','State','ZIP Code','Country','Primary Contact ID','Notes','Created At']],
        ['ToDo', ['ID','Title','Description','Assigned To','Assigned Member ID','Due Date','Priority','Status','Category','Entity Type','Entity ID','Recurring','Recurrence Rule','Notes','Auto Log','Created By','Created At','Updated By','Updated At']],
        // Expansion: Events & Attendance
        ['Attendance', ['ID','Date','Service Type','Adults','Children','Total','Notes','Recorded By','Created At']],
        ['Events', ['ID','Title','Description','Event Type','Location','Start Date','End Date','Start Time','End Time','Recurring','Recurring Until','Capacity','RSVP Required','Ministry Team','Contact Person','Status','Notes','Created By','Created At','Updated By','Updated At']],
        ['EventRSVPs', ['ID','Event ID','Member ID','Response','Guest Count','Notes','Responded At','Updated At']],
        // Groups
        ['SmallGroups', ['ID','Group Name','Description','Group Type','Leader ID','Co-Leader ID','Meeting Day','Meeting Time','Meeting Location','Capacity','Status','Semester','Notes','Created By','Created At','Updated At']],
        ['SmallGroupMembers', ['ID','Group ID','Member ID','Role','Joined Date','Left Date','Status','Notes','Created At']],
        // Finance
        ['Giving', ['ID','Member ID','Donor Name','Amount','Currency','Date','Fund','Method','Check Number','Transaction Ref','Is Tax Deductible','Notes','Recorded By','Created At','Updated At']],
        ['GivingPledges', ['ID','Member ID','Fund','Pledge Amount','Frequency','Start Date','End Date','Total Pledged','Total Given','Status','Notes','Created By','Created At','Updated At']],
        // Volunteers
        ['VolunteerSchedule', ['ID','Member ID','Ministry Team','Role','Scheduled Date','Service Type','Status','Swap Requested','Swap With','Notes','Scheduled By','Created At','Updated At']],
        // Communications
        ['Communications', ['ID','Type','Subject','Body','Audience','Audience Filter','Sent At','Sent By','Recipient Count','Status','Scheduled For','Notes','Created At']],
        ['CommsMessages', ['ID','Thread ID','Sender ID','Sender Name','Sender Email','Recipient Type','Recipient ID','Recipient Name','Message Type','Subject','Body','Priority','Attachment URL','Attachment Name','Reply-To ID','Status','Sent At','Edited At','Read Count','Flagged','Created At','Updated At']],
        ['CommsThreads', ['ID','Subject','Thread Type','Creator ID','Creator Name','Participant IDs','Participant Names','Participant Count','Message Count','Last Message At','Last Message By','Last Snippet','Status','Pinned','Muted By','Channel ID','Created At','Updated At']],
        ['CommsNotifications', ['ID','Recipient ID','Recipient Name','Recipient Email','Title','Body','Notification Type','Priority','Entity Type','Entity ID','Action URL','Icon','Status','Read At','Dismissed At','Sent Via','Sender Email','Expires At','Created At','Updated At']],
        ['CommsNotificationPrefs', ['ID','Member ID','Member Email','Email Enabled','Email Digest','In-App Enabled','Quiet Hours Start','Quiet Hours End','Notif Messages','Notif Announcements','Notif Events','Notif Prayer','Notif Care','Notif System','Created At','Updated At']],
        ['CommsChannels', ['ID','Channel Name','Slug','Description','Channel Type','Icon','Color Hex','Creator ID','Creator Name','Subscriber Count','Message Count','Visibility','Post Permission','Pinned Message ID','Status','Sort Order','Created At','Updated At']],
        ['CommsTemplates', ['ID','Template Name','Template Type','Subject','Body','Body HTML','Category','Variables','Use Count','Last Used At','Visibility','Status','Created By','Created By Name','Created At','Updated At']],
        ['CommsReadReceipts', ['ID','Message ID','Thread ID','Reader ID','Reader Name','Reader Email','Read At','Device','Created At','Updated At']],
        ['CommsBroadcastLog', ['ID','Type','Subject','Body','Body HTML','Audience','Audience Filter','Template ID','Channel ID','Sent At','Sent By','Sent By Name','Recipient Count','Delivered Count','Failed Count','Status','Scheduled For','Created At']],
        // Check-In
        ['CheckInSessions', ['ID','Event ID','Session Name','Date','Opened At','Closed At','Total Check-Ins','Opened By','Notes','Created At']],
        // Ministries
        ['Ministries', ['ID','Ministry Name','Category','Description','Ministry Lead ID','Co-Lead ID','Contact Email','Meeting Day','Meeting Time','Meeting Location','Budget Allocated','Status','Reporting To','Notes','Created By','Created At','Updated At']],
        ['MinistryMembers', ['ID','Ministry ID','Member ID','Role','Start Date','End Date','Status','Hours Per Month','Notes','Created At']],
        // Service Plans
        ['ServicePlans', ['ID','Service Date','Service Type','Theme','Scripture Focus','Sermon Title','Preacher ID','Worship Leader ID','Status','Notes','Created By','Created At','Updated By','Updated At']],
        ['ServicePlanItems', ['ID','Plan ID','Order','Item Type','Title','Description','Duration Minutes','Assigned To ID','Notes','Created At']],
        // Songs
        ['Songs', ['ID','Title','Artist','CCLI Number','Default Key','Tempo BPM','Time Signature','Duration Minutes','Genre','Tags','Lyrics','Notes','Active','Drive File ID','Created By','Created At','Updated By','Updated At']],
        ['SongArrangements', ['ID','Song ID','Name','Key','Capo','Chord Chart','Lyrics With Chords','Instrument','Vocal Range','Drive File ID','Notes','Created By','Created At','Updated At']],
        ['SetlistSongs', ['ID','Plan ID','Plan Item ID','Song ID','Arrangement ID','Key Override','Notes','Created By','Created At','Updated At']],
        // Spiritual Care
        ['SpiritualCareCases', ['ID','Member ID','Care Type','Priority','Status','Summary','Assigned Team ID','Primary Caregiver ID','Secondary Caregiver ID','Opened Date','Target Resolve Date','Resolved Date','Referral Info','Confidential','Notes','Created By','Created At','Updated By','Updated At']],
        ['SpiritualCareInteractions', ['ID','Case ID','Interaction Date','Type','Caregiver ID','Duration Minutes','Summary','Follow-Up Needed','Follow-Up Date','Follow-Up Done','Confidential','Created At']],
        ['SpiritualCareAssignments', ['ID','Caregiver ID','Member ID','Ministry ID','Role','Start Date','End Date','Status','Notes','Created By','Created At']],
        // Outreach
        ['OutreachContacts', ['ID','First Name','Last Name','Email','Phone','Address','City','State','Zip','Source','Campaign ID','Status','Interest Level','Notes','Member ID','Assigned To','Last Contact Date','Next Follow-Up Date','Tags','Created By','Created At','Updated At']],
        ['OutreachCampaigns', ['ID','Campaign Name','Type','Description','Start Date','End Date','Location','Ministry ID','Lead ID','Budget','Goal Reached','Actual Reached','Decisions','Status','Notes','Tags','Created By','Created At','Updated At']],
        ['OutreachFollowUps', ['ID','Contact ID','Date','Type','By ID','Summary','Response','Follow-Up Needed','Next Date','Follow-Up Done','Notes','Created At']],
        // Sermons
        ['Sermons', ['ID','Title','Preacher ID','Preacher Name','Date','Service Type','Series ID','Series Order','Scripture Refs','Topic Tags','Summary','Drive File ID','File URL','Filename','File Type','Audio Drive ID','Video Drive ID','Status','Visibility','Created By','Created At','Updated At']],
        ['SermonSeries', ['ID','Series Name','Description','Theme Scripture','Start Date','End Date','Preacher ID','Status','Cover Image URL','Sermon Count','Created At','Updated At']],
        ['SermonReviews', ['ID','Sermon ID','Reviewer ID','Reviewer Name','Decision','Feedback','Reviewed At','Created At','Updated At']],
        // Compassion
        ['CompassionRequests', ['ID','Requester Name','Phone','Email','Is Member','Member ID','Request Type','Description','Urgency','Amount Requested','Amount Approved','Status','Assigned Team','Assigned To','Follow-Up Date','Resolution Notes','Confidential','Submitted By','Approved By','Created At','Updated At']],
        ['CompassionResources', ['ID','Resource Name','Category','Description','Quantity On Hand','Unit','Reorder Level','Location','Donated By','Status','Created At','Updated At']],
        ['CompassionTeamLog', ['ID','Request ID','Date','Activity Type','Team Member ID','Team Member Name','Description','Resources Used','Amount Disbursed','Follow-Up Needed','Notes','Created At']],
        // Discipleship
        ['DiscipleshipPaths', ['ID','Name','Description','Category','Target Audience','Difficulty Level','Estimated Weeks','Total Steps','Prerequisite Path ID','Required For Leadership','Facilitator Guide URL','Student Guide URL','Status','Visibility','Created By','Approved By','Created At','Updated At']],
        ['DiscipleshipSteps', ['ID','Path ID','Step Order','Title','Description','Step Type','Duration Minutes','Scripture Refs','Learning Objectives','Content URL','Video URL','Homework Description','Assessment Required','Passing Score','Facilitator Notes','Resource IDs','Created At','Updated At']],
        ['DiscipleshipEnrollments', ['ID','Member ID','Member Name','Path ID','Path Name','Enrolled Date','Target Completion','Actual Completion','Current Step ID','Steps Completed','Total Steps','Percent Complete','Status','Facilitator ID','Facilitator Name','Group Cohort','Meeting Day','Meeting Time','Notes','Enrolled By','Created At','Updated At']],
        ['DiscipleshipMentoring', ['ID','Mentor ID','Mentor Name','Mentee ID','Mentee Name','Relationship Type','Focus Area','Start Date','End Date','Meeting Frequency','Meeting Day','Meeting Location','Status','Goals','Notes','Created By','Created At','Updated At']],
        ['DiscipleshipMeetings', ['ID','Mentoring ID','Meeting Date','Meeting Time','Duration Minutes','Location','Meeting Type','Topics Covered','Scripture Discussed','Homework Assigned','Homework Completed','Prayer Requests','Action Items','Notes','Created At','Updated At']],
        ['DiscipleshipAssessments', ['ID','Member ID','Member Name','Assessment Type','Assessment Name','Description','Date Taken','Assessed By','Score Total','Score Max','Score Percent','Results JSON','Top Gifts','Top Strengths','Growth Areas','Recommendations','Enrollment ID','Path ID','Status','Notes','Created At','Updated At']],
        ['DiscipleshipResources', ['ID','Title','Description','Resource Type','Author','URL','Drive File ID','Category','Topic Tags','Difficulty Level','Estimated Time','Path IDs','Step IDs','Visibility','Created At','Updated At']],
        ['DiscipleshipMilestones', ['ID','Member ID','Member Name','Milestone Type','Milestone Name','Description','Date Achieved','Verified By','Enrollment ID','Path ID','Certificate ID','Ceremony Date','Witness','Notes','Created At','Updated At']],
        ['DiscipleshipGoals', ['ID','Member ID','Member Name','Goal Category','Goal Title','Description','Target Date','Completion Date','Status','Progress Percent','Measurement Type','Target Value','Current Value','Accountability Partner ID','Accountability Partner Name','Review Frequency','Last Reviewed','Notes','Created At','Updated At']],
        ['DiscipleshipCertificates', ['ID','Member ID','Member Name','Path ID','Path Name','Enrollment ID','Certificate Number','Issue Date','Issued By','Expiry Date','Status','Notes','Created At','Updated At']],
        // Learning
        ['LearningTopics', ['ID','Topic Name','Slug','Description','Parent Topic ID','Level','Sort Order','Icon URL','Color Hex','Featured','Sermon Count','Subscriber Count','Status','Created By','Created At','Updated At']],
        ['LearningPlaylists', ['ID','Title','Description','Cover Image URL','Curator ID','Curator Name','Topic IDs','Topic Names','Preacher Filter','Scripture Filter','Difficulty Level','Estimated Hours','Item Count','Subscriber Count','Visibility','Featured','Sort Order','Tags','Status','Created By','Created At','Updated At']],
        ['LearningPlaylistItems', ['ID','Playlist ID','Sermon ID','Sermon Title','Preacher Name','Scripture Refs','Sort Order','Section Label','Notes for Learner','Duration Mins','Required','Bonus','Discussion Questions','Added By','Created At','Updated At']],
        ['LearningProgress', ['ID','Member ID','Member Name','Sermon ID','Sermon Title','Playlist ID','Playlist Title','Status','Progress Percent','Last Position Secs','Total Duration Secs','Started At','Completed At','Listen Count','Last Listened At','Rating','Device','Notes','Created At','Updated At']],
        ['LearningNotes', ['ID','Member ID','Member Name','Sermon ID','Sermon Title','Playlist ID','Note Type','Title','Content','Timestamp Secs','Scripture Ref','Highlight Text','Shared','Pinned','Created At','Updated At']],
        ['LearningBookmarks', ['ID','Member ID','Member Name','Sermon ID','Sermon Title','Preacher Name','Collection','Tags','Notes','Position Secs','Priority','Reminder Date','Created At','Updated At']],
        ['LearningRecommendations', ['ID','Member ID','Member Name','Sermon ID','Sermon Title','Preacher Name','Reason Type','Reason Text','Topic Match','Scripture Match','Score','Priority','Status','Dismissed At','Recommended By','Recommended By Name','Created At','Updated At']],
        ['LearningQuizzes', ['ID','Sermon ID','Sermon Title','Playlist ID','Title','Description','Difficulty','Pass Percent','Questions JSON','Question Count','Time Limit Mins','Attempts Allowed','Topic Tags','Scripture Refs','Status','Created By','Created At','Updated At']],
        ['LearningQuizResults', ['ID','Quiz ID','Quiz Title','Member ID','Member Name','Sermon ID','Attempt Number','Started At','Completed At','Time Taken Secs','Answers JSON','Correct Count','Total Questions','Score Percent','Passed','Feedback','Created At','Updated At']],
        ['LearningCertificates', ['ID','Member ID','Member Name','Certificate Type','Playlist ID','Playlist Title','Quiz ID','Quiz Title','Certificate Number','Issue Date','Issued By','Expiry Date','Status','Notes','Created At','Updated At']],
        // Theology
        ['TheologyCategories', ['ID','Category ID','Title','Subtitle','Intro','Icon','Color Var','Sort Order','Visible','Status','Created At','Updated At']],
        ['TheologySections', ['ID','Category Row ID','Section ID','Title','Content','Summary','Scripture Refs','Keywords','Sort Order','Visible','Approved By','Approved At','Version','Status','Created At','Updated At']],
        ['TheologyScriptures', ['ID','Section Row ID','Reference','Text','Translation','Context Note','Sort Order','Is Primary','Status','Created By','Created At','Updated At']],
        ['TheologyRevisions', ['ID','Section Row ID','Version','Previous Title','Previous Content','Changed By','Change Reason','Approved By','Status','Created At']],
        // Member Cards
        ['MemberCards', ['ID','Member Number','Email','First Name','Last Name','Preferred Name','Suffix','Photo URL','Card Title','Card Bio','Ministry','Small Group','Phone','Phone Visible','Email Visible','Website URL','Schedule URL','Color Scheme','BG Scheme','Card Icon','Show Daily Bread','Show Prayer Ticker','Card Footer','Visibility','View Count','Active','Status','Created By','Created At','Updated At']],
        ['MemberCardLinks', ['ID','Card Row ID','Link Type','Label','Icon','URL','Sort Order','Visible','Platform','Status','Created At','Updated At']],
        ['MemberCardViews', ['ID','Card Row ID','Member Number','Viewer Email','View Source','User Agent','IP Hash','Viewed At']],
        // Auth / Config / System
        ['AuthUsers', ['Email','Passcode','Passcode Hash','Salt','First Name','Last Name','Role','Status','Created At','Updated At']],
        ['UserProfiles', ['Email','Display Name','Photo URL','Phone','Bio','Timezone','Language','Notifications','Theme','Updated At']],
        ['AccessControl', ['Email','Role','Display Name','Groups','Active','Notes','Created At','Updated At']],
        ['Permissions', ['Email','Module','Access','GrantedBy','GrantedAt','Notes']],
        ['CalendarEvents', ['EventID','Email','Title','Description','StartDateTime','EndDateTime','Location','Attendees','Color','IsAllDay','RecurrenceRule','Visibility','SharedWith','DelegatedTo','CreatedAt','CreatedBy','UpdatedAt','UpdatedBy']],
        ['AuthAudit', ['Timestamp','Event','Email','Details']],
        ['AuditLog', ['Timestamp','Email','Role','Action','Tab','Row Ref','Details']],
        ['AppConfig', ['Key','Value','Description','Category','Updated By','Updated At']],
      ]
    },
  };


  // ── Backup namespace → TheVine API path mapping ────────────────────────
  // Only namespaces that support .list() are included.

  // Row limit for flock backup routes — overridden from AppConfig.BACKUP_ROW_LIMIT
  var _BACKUP_LIMIT = 500;

  const BACKUP_ROUTES = {
    app: [
      // App API content is largely static seed data; backup via template is sufficient.
      // If live backups are needed, add routes here.
    ],
    missions: [
      { tab: 'MissionsRegistry',   call: () => _isFB() ? UpperRoom.listMissionsRegistry() : TheVine.missions.registry.list() },
      { tab: 'MissionsPartners',   call: () => _isFB() ? UpperRoom.listMissionsPartners() : TheVine.missions.partners.list() },
      { tab: 'MissionsPrayerFocus',call: () => _isFB() ? UpperRoom.listMissionsPrayerFocus() : TheVine.missions.prayerFocus.list() },
      { tab: 'MissionsUpdates',    call: () => _isFB() ? UpperRoom.listMissionsUpdates() : TheVine.missions.updates.list() },
      { tab: 'MissionsTeams',      call: () => _isFB() ? UpperRoom.listMissionsTeams() : TheVine.missions.teams.list() },
    ],
    extra: [
      { tab: 'StatisticsConfig',   call: () => _isFB() ? UpperRoom.listStatsConfig() : TheVine.extra.statistics.config.list() },
      { tab: 'StatisticsSnapshots',call: () => _isFB() ? UpperRoom.listStatsSnapshots() : TheVine.extra.statistics.snapshots.list() },
    ],
    flock: [
      { tab: 'Members',                 call: () => _isFB() ? UpperRoom.listMembers({ limit: _BACKUP_LIMIT }) : TheVine.flock.members.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'PrayerRequests',          call: () => _isFB() ? UpperRoom.listPrayers({ limit: _BACKUP_LIMIT, allUsers: true }) : TheVine.flock.prayer.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'JournalEntries',          call: () => _isFB() ? UpperRoom.listJournal({ limit: _BACKUP_LIMIT, allUsers: true }) : TheVine.flock.journal.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'ContactLog',              call: () => _isFB() ? UpperRoom.listContacts({ limit: _BACKUP_LIMIT }) : TheVine.flock.contacts.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'PastoralNotes',           call: () => _isFB() ? UpperRoom.listPastoralNotes({ limit: _BACKUP_LIMIT }) : TheVine.flock.notes.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'Milestones',              call: () => _isFB() ? UpperRoom.listMilestones({ limit: _BACKUP_LIMIT }) : TheVine.flock.milestones.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'Households',              call: () => _isFB() ? UpperRoom.listHouseholds({ limit: _BACKUP_LIMIT }) : TheVine.flock.households.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'ToDo',                    call: () => _isFB() ? UpperRoom.listTodos({ limit: _BACKUP_LIMIT }) : TheVine.flock.todo.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'Attendance',              call: () => _isFB() ? UpperRoom.listAttendance({ limit: _BACKUP_LIMIT }) : TheVine.flock.attendance.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'Events',                  call: () => _isFB() ? UpperRoom.listEvents({ limit: _BACKUP_LIMIT }) : TheVine.flock.events.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'SmallGroups',             call: () => _isFB() ? UpperRoom.listGroups({ limit: _BACKUP_LIMIT }) : TheVine.flock.groups.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'Giving',                  call: () => _isFB() ? UpperRoom.listGiving({ limit: _BACKUP_LIMIT }) : TheVine.flock.giving.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'VolunteerSchedule',       call: () => _isFB() ? UpperRoom.listVolunteers({ limit: _BACKUP_LIMIT }) : TheVine.flock.volunteers.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'CommsMessages',           call: () => _isFB() ? UpperRoom.listConversations('dm') : TheVine.flock.comms.messages.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'CommsThreads',            call: () => _isFB() ? UpperRoom.listConversations('thread') : TheVine.flock.comms.threads.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'Ministries',              call: () => _isFB() ? UpperRoom.listMinistries({ limit: _BACKUP_LIMIT }) : TheVine.flock.ministries.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'ServicePlans',            call: () => _isFB() ? UpperRoom.listServicePlans({ limit: _BACKUP_LIMIT }) : TheVine.flock.servicePlans.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'Songs',                    call: () => _isFB() ? UpperRoom.listSongs({ limit: _BACKUP_LIMIT }) : TheVine.flock.songs.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'SpiritualCareCases',      call: () => _isFB() ? UpperRoom.listCareCases({ limit: _BACKUP_LIMIT }) : TheVine.flock.care.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'OutreachContacts',        call: () => _isFB() ? UpperRoom.listOutreachContacts({ limit: _BACKUP_LIMIT }) : TheVine.flock.outreach.contacts.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'OutreachCampaigns',       call: () => _isFB() ? UpperRoom.listOutreachCampaigns({ limit: _BACKUP_LIMIT }) : TheVine.flock.outreach.campaigns.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'Sermons',                 call: () => _isFB() ? UpperRoom.listSermons({ limit: _BACKUP_LIMIT }) : TheVine.flock.sermons.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'SermonSeries',            call: () => _isFB() ? UpperRoom.listSermonSeries({ limit: _BACKUP_LIMIT }) : TheVine.flock.sermonSeries.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'CompassionRequests',      call: () => _isFB() ? UpperRoom.listCompassionRequests({ limit: _BACKUP_LIMIT }) : TheVine.flock.compassion.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'DiscipleshipPaths',       call: () => _isFB() ? UpperRoom.listDiscPaths({ limit: _BACKUP_LIMIT }) : TheVine.flock.discipleship.paths.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'DiscipleshipEnrollments', call: () => _isFB() ? UpperRoom.listDiscEnrollments({ limit: _BACKUP_LIMIT }) : TheVine.flock.discipleship.enrollments.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'LearningPlaylists',       call: () => _isFB() ? UpperRoom.listLrnPlaylists({ limit: _BACKUP_LIMIT }) : TheVine.flock.learning.playlists.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'TheologyCategories',      call: () => _isFB() ? UpperRoom.listTheologyCategories({ limit: _BACKUP_LIMIT }) : TheVine.flock.theology.categories.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'TheologySections',        call: () => _isFB() ? UpperRoom.listTheologySections({ limit: _BACKUP_LIMIT }) : TheVine.flock.theology.sections.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'MemberCards',             call: () => _isFB() ? UpperRoom.listMemberCards({ limit: _BACKUP_LIMIT }) : TheVine.flock.memberCards.list({ limit: _BACKUP_LIMIT }) },
      { tab: 'AppConfig',               call: () => _isFB() ? UpperRoom.listAppConfig() : TheVine.flock.config.list() },
      { tab: 'AuditLog',                call: () => _isFB() ? UpperRoom.listAudit({ limit: _BACKUP_LIMIT }) : TheVine.flock.audit.list({ limit: _BACKUP_LIMIT }) },
    ],
  };


  // ═══════════════════════════════════════════════════════════════════════════
  // 2. HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  function _genCols(prefix, n) {
    var cols = [];
    for (var i = 1; i <= n; i++) cols.push(prefix + i);
    return cols;
  }

  function _log(msg) { if (localStorage.getItem('FLOCKOS_DEBUG')) console.log('[TheWell] ' + msg); }

  function _rows(res) {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (res.rows) return res.rows;
    if (res.data) return Array.isArray(res.data) ? res.data : [];
    return [];
  }

  function _timestamp() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
         + '-' + String(d.getDate()).padStart(2, '0') + '_'
         + String(d.getHours()).padStart(2, '0')
         + String(d.getMinutes()).padStart(2, '0');
  }

  function _download(blob, filename) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() { URL.revokeObjectURL(a.href); a.remove(); }, 200);
  }

  function _xlsxBlob(wb) {
    var data = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // 3. TEMPLATE — Generate blank .xlsx with correct headers
  // ═══════════════════════════════════════════════════════════════════════════

  function template(api) {
    if (typeof XLSX === 'undefined') throw new Error('TheWell: SheetJS (XLSX) library not loaded');
    var def = SCHEMA[api];
    if (!def) throw new Error('TheWell: Unknown API "' + api + '". Use: app, missions, extra, flock');

    _log('Generating template for ' + def.label + ' (' + def.tabs.length + ' tabs)...');
    var wb = XLSX.utils.book_new();

    def.tabs.forEach(function(t) {
      var sheet = XLSX.utils.aoa_to_sheet([t[1]]);
      // Auto-width: set column widths based on header length
      sheet['!cols'] = t[1].map(function(h) { return { wch: Math.max(h.length + 2, 12) }; });
      XLSX.utils.book_append_sheet(wb, sheet, t[0]);
    });

    var blob = _xlsxBlob(wb);
    _download(blob, def.file);
    _log('Template downloaded: ' + def.file);
    return { api: api, file: def.file, tabs: def.tabs.length };
  }

  function templateAll() {
    var results = [];
    Object.keys(SCHEMA).forEach(function(api) {
      results.push(template(api));
    });
    _log('All ' + results.length + ' templates downloaded.');
    return results;
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // 4. BACKUP — Pull live data via TheVine → download .xlsx
  // ═══════════════════════════════════════════════════════════════════════════

  async function backup(api) {
    if (typeof XLSX === 'undefined') throw new Error('TheWell: SheetJS not loaded');
    if (typeof TheVine === 'undefined') throw new Error('TheWell: TheVine not loaded');
    var def = SCHEMA[api];
    if (!def) throw new Error('TheWell: Unknown API "' + api + '"');
    var routes = BACKUP_ROUTES[api];
    if (!routes || !routes.length) throw new Error('TheWell: No backup routes for "' + api + '"');

    // Read configurable row limit from AppConfig (flock API only)
    if (api === 'flock') {
      try {
        var cfgRes = await (_isFB() ? UpperRoom.listAppConfig() : TheVine.flock.config.list());
        var cfgRows = _rows(cfgRes);
        var limitRow = cfgRows.find(function(r) { return r['Key'] === 'BACKUP_ROW_LIMIT'; });
        if (limitRow && parseInt(limitRow['Value'], 10) > 0) {
          _BACKUP_LIMIT = parseInt(limitRow['Value'], 10);
        }
      } catch (e) { /* keep default */ }
      _log('  Row limit: ' + _BACKUP_LIMIT);
    }

    _log('Backing up ' + def.label + ' (' + routes.length + ' namespaces)...');
    var wb = XLSX.utils.book_new();
    var result = { api: api, tabs: [], errors: [] };

    for (var i = 0; i < routes.length; i++) {
      var route = routes[i];
      try {
        _log('  ' + route.tab + '...');
        var res = await route.call();
        var rows = _rows(res);

        // Find headers from schema, or derive from data
        var tabDef = def.tabs.find(function(t) { return t[0] === route.tab; });
        var headers = tabDef ? tabDef[1] : (rows.length ? Object.keys(rows[0]) : []);

        // Build sheet with headers row + data rows
        var aoa = [headers];
        rows.forEach(function(row) {
          aoa.push(headers.map(function(h) {
            // Try exact match, then camelCase match
            if (row[h] !== undefined) return row[h];
            var camel = h.replace(/\s+(.)/g, function(_, c) { return c.toUpperCase(); })
                         .replace(/^\w/, function(c) { return c.toLowerCase(); });
            return row[camel] !== undefined ? row[camel] : '';
          }));
        });

        var sheet = XLSX.utils.aoa_to_sheet(aoa);
        sheet['!cols'] = headers.map(function(h) { return { wch: Math.max(h.length + 2, 14) }; });
        XLSX.utils.book_append_sheet(wb, sheet, route.tab);

        result.tabs.push({ tab: route.tab, rows: rows.length });
        _log('  ' + route.tab + ': ' + rows.length + ' rows');
      } catch (e) {
        result.errors.push({ tab: route.tab, error: e.message });
        _log('  ' + route.tab + ': ERROR — ' + e.message);
        // Add empty sheet with headers so structure is preserved
        if (def.tabs.find(function(t) { return t[0] === route.tab; })) {
          var emptyHeaders = def.tabs.find(function(t) { return t[0] === route.tab; })[1];
          var emptySheet = XLSX.utils.aoa_to_sheet([emptyHeaders]);
          XLSX.utils.book_append_sheet(wb, emptySheet, route.tab);
        }
      }
    }

    var filename = def.file.replace('.xlsx', '_Backup_' + _timestamp() + '.xlsx');
    _download(_xlsxBlob(wb), filename);
    _log('Backup complete: ' + filename + ' (' + result.tabs.length + ' tabs, ' + result.errors.length + ' errors)');
    return result;
  }

  async function backupAll() {
    var results = [];
    for (var api of Object.keys(BACKUP_ROUTES)) {
      if (!BACKUP_ROUTES[api].length) continue;
      try {
        results.push(await backup(api));
      } catch (e) {
        results.push({ api: api, error: e.message });
        _log(api + ' backup failed: ' + e.message);
      }
    }
    _log('Full backup complete.');
    return results;
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // 5. RESTORE — Parse uploaded .xlsx → push rows via TheVine
  // ═══════════════════════════════════════════════════════════════════════════

  // Tab name → TheVine bulk/create route (only for restorable tabs)
  var RESTORE_ROUTES = {
    // Flock CRM — primary restore targets
    Members:                function(rows) { return _isFB() ? UpperRoom.bulkCreate({ tab: 'Members', rows: rows }) : TheVine.flock.bulk.create({ tab: 'Members', rows: rows }); },
    Events:                 function(rows) { return _isFB() ? UpperRoom.bulkCreate({ tab: 'Events', rows: rows }) : TheVine.flock.bulk.create({ tab: 'Events', rows: rows }); },
    SmallGroups:            function(rows) { return _isFB() ? UpperRoom.bulkCreate({ tab: 'SmallGroups', rows: rows }) : TheVine.flock.bulk.create({ tab: 'SmallGroups', rows: rows }); },
    Giving:                 function(rows) { return _isFB() ? UpperRoom.bulkCreate({ tab: 'Giving', rows: rows }) : TheVine.flock.bulk.create({ tab: 'Giving', rows: rows }); },
    Ministries:             function(rows) { return _isFB() ? UpperRoom.bulkCreate({ tab: 'Ministries', rows: rows }) : TheVine.flock.bulk.create({ tab: 'Ministries', rows: rows }); },
    Songs:                  function(rows) { return _isFB() ? UpperRoom.bulkCreate({ tab: 'Songs', rows: rows }) : TheVine.flock.bulk.create({ tab: 'Songs', rows: rows }); },
    Sermons:                function(rows) { return _isFB() ? UpperRoom.bulkCreate({ tab: 'Sermons', rows: rows }) : TheVine.flock.bulk.create({ tab: 'Sermons', rows: rows }); },
    SermonSeries:           function(rows) { return _isFB() ? UpperRoom.bulkCreate({ tab: 'SermonSeries', rows: rows }) : TheVine.flock.bulk.create({ tab: 'SermonSeries', rows: rows }); },
    DiscipleshipPaths:      function(rows) { return _isFB() ? UpperRoom.bulkCreate({ tab: 'DiscipleshipPaths', rows: rows }) : TheVine.flock.bulk.create({ tab: 'DiscipleshipPaths', rows: rows }); },
    TheologyCategories:     function(rows) { return _isFB() ? UpperRoom.bulkCreate({ tab: 'TheologyCategories', rows: rows }) : TheVine.flock.bulk.create({ tab: 'TheologyCategories', rows: rows }); },
    TheologySections:       function(rows) { return _isFB() ? UpperRoom.bulkCreate({ tab: 'TheologySections', rows: rows }) : TheVine.flock.bulk.create({ tab: 'TheologySections', rows: rows }); },
    LearningPlaylists:      function(rows) { return _isFB() ? UpperRoom.bulkCreate({ tab: 'LearningPlaylists', rows: rows }) : TheVine.flock.bulk.create({ tab: 'LearningPlaylists', rows: rows }); },
    MemberCards:            function(rows) { return _isFB() ? UpperRoom.bulkCreate({ tab: 'MemberCards', rows: rows }) : TheVine.flock.bulk.create({ tab: 'MemberCards', rows: rows }); },
    AppConfig:              function(rows) { return _isFB() ? UpperRoom.bulkCreate({ tab: 'AppConfig', rows: rows }) : TheVine.flock.bulk.create({ tab: 'AppConfig', rows: rows }); },
    // Missions
    MissionsRegistry:       function(rows) { return _isFB() ? UpperRoom.missionsBulkCreate({ tab: 'MissionsRegistry', rows: rows }) : TheVine.missions.bulk.create({ tab: 'MissionsRegistry', rows: rows }); },
  };

  async function restore(api, file) {
    if (typeof XLSX === 'undefined') throw new Error('TheWell: SheetJS not loaded');
    if (typeof TheVine === 'undefined') throw new Error('TheWell: TheVine not loaded');
    if (!file) throw new Error('TheWell: No file provided');

    // Scope restores to the declared API namespace (prevents cross-API tab bleed)
    var allowedTabs = null;
    if (api) {
      var schemaDef = SCHEMA[api];
      if (!schemaDef) throw new Error('TheWell: Unknown API "' + api + '". Use: app, missions, extra, flock');
      allowedTabs = new Set(schemaDef.tabs.map(function(t) { return t[0]; }));
    }

    _log('Parsing uploaded file: ' + (file.name || 'unknown'));
    var buffer = await file.arrayBuffer();
    var wb = XLSX.read(buffer, { type: 'array' });

    var result = { file: file.name, api: api || 'all', restored: [], skipped: [], errors: [] };
    var sheetNames = wb.SheetNames;

    for (var i = 0; i < sheetNames.length; i++) {
      var tabName = sheetNames[i];

      // Skip tabs outside the declared API scope
      if (allowedTabs && !allowedTabs.has(tabName)) {
        result.skipped.push(tabName);
        _log('  ' + tabName + ': skipped (not in "' + api + '" scope)');
        continue;
      }

      var restoreFn = RESTORE_ROUTES[tabName];

      if (!restoreFn) {
        result.skipped.push(tabName);
        _log('  ' + tabName + ': skipped (no restore route)');
        continue;
      }

      try {
        var sheet = wb.Sheets[tabName];
        var rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!rows.length) {
          result.skipped.push(tabName);
          _log('  ' + tabName + ': empty — skipped');
          continue;
        }

        _log('  ' + tabName + ': restoring ' + rows.length + ' rows...');

        // Batch in chunks of 100 to avoid timeouts
        var BATCH = 100;
        for (var b = 0; b < rows.length; b += BATCH) {
          var chunk = rows.slice(b, b + BATCH);
          await restoreFn(chunk);
        }

        result.restored.push({ tab: tabName, rows: rows.length });
        _log('  ' + tabName + ': ✓ ' + rows.length + ' rows restored');
      } catch (e) {
        result.errors.push({ tab: tabName, error: e.message });
        _log('  ' + tabName + ': ERROR — ' + e.message);
      }
    }

    _log('Restore complete: ' + result.restored.length + ' tabs restored, '
         + result.skipped.length + ' skipped, ' + result.errors.length + ' errors');
    return result;
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // 6. STATUS & SCHEMA INSPECTION
  // ═══════════════════════════════════════════════════════════════════════════

  function schema(api) {
    if (api) {
      var def = SCHEMA[api];
      if (!def) return null;
      return {
        api: api, label: def.label, file: def.file,
        tabs: def.tabs.map(function(t) { return { name: t[0], columns: t[1].length, headers: t[1] }; }),
        totalTabs: def.tabs.length,
      };
    }
    // Return summary of all APIs
    var summary = {};
    Object.keys(SCHEMA).forEach(function(k) {
      summary[k] = { label: SCHEMA[k].label, tabs: SCHEMA[k].tabs.length };
    });
    return summary;
  }

  function status() {
    return {
      xlsxLoaded: typeof XLSX !== 'undefined',
      vineLoaded: typeof TheVine !== 'undefined',
      apis:       Object.keys(SCHEMA),
      backupable: Object.keys(BACKUP_ROUTES).filter(function(k) { return BACKUP_ROUTES[k].length > 0; }),
      restorable: Object.keys(RESTORE_ROUTES),
      schema:     schema(),
    };
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC SURFACE
  // ═══════════════════════════════════════════════════════════════════════════

  return Object.freeze({
    // Templates
    template:    template,
    templateAll: templateAll,

    // Backup
    backup:      backup,
    backupAll:   backupAll,

    // Restore
    restore:     restore,

    // Inspection
    schema:      schema,
    status:      status,

    // Schema constant (for external tools)
    SCHEMA:      SCHEMA,
  });

})();
