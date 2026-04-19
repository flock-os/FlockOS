/* ══════════════════════════════════════════════════════════════════════════════
   THE CORNERSTONE — FlockOS Architecture Registry
   Runtime-queryable map of every API, action, route, and role in the system.

   USAGE:
     Temple.rbac.leader                   → 2
     Temple.can(action, roleLevel)         → true / false
     Temple.route('/books')               → { api, tabs, auth, features }
     Temple.actions['sermons.list']       → { api, minRole }
     Temple.app.tabs                      → ['Books', 'Genealogy', ...]
     Temple.flock.tabs                    → full tab list (79 tabs)
     Temple.session.AUTH                  → 'flock_auth_session'

   COMPANION FILES:
     the_true_vine.js     — API call engine (reads Temple.session, Temple.apis)
     firm_foundation.js   — Auth guard      (reads Temple.rbac, Temple.can())
     the_tabernacle.js    — Nav / routing   (reads Temple.routes)

   SOURCE: the_cornerstone.js (FlockOS/Acts/)
   Updated: March 2026
   ══════════════════════════════════════════════════════════════════════════════ */

const Temple = (() => {

  /* ─── RBAC LEVELS ─────────────────────────────────────────────────────────── */

  const RBAC = {
    none:      -1,   // public / unauthenticated
    readonly:   0,
    volunteer:  1,
    care:       2,   // spiritual care team — shepherds assigned members
    leader:     3,
    pastor:     4,
    admin:      5
  };

  /* ─── API IDENTIFIERS ────────────────────────────────────────────────────── */

  const APIS = {
    APP:      'app',
    FLOCK:    'flock',
    MISSIONS: 'missions',
    EXTRA:    'extra'
  };

  /* ─── SESSION STORAGE KEYS ────────────────────────────────────────────────── */

  const SESSION = {
    AUTH:     'flock_auth_session',   // Standard — 6 hours
    PROFILE:  'flock_auth_profile',   // Cache    — 6 hours
    VAULT:    'flock_secure_vault'    // Admin    — 1 year
  };

  /* ─── APP API TABS ────────────────────────────────────────────────────────── */
  // Public content — no auth, GET ?tab=TabName

  const APP_TABS = [
    'Books',        // 66 books — testament, genre, theology, application
    'Genealogy',    // Biblical characters — lineage, lifespan, meaning
    'Counseling',   // Clinical wisdom protocols — definition, scripture, steps
    'Devotionals',  // Daily devotions — date, title, scripture, reflection
    'Reading',      // Daily reading plan — OT, NT, Psalms, Proverbs
    'Words',        // Biblical lexicon — Greek/Hebrew, Strong's numbers
    'Heart',        // Spiritual vitality quiz — radar chart, prescriptions
    'Mirror',       // Shepherd's triage — radar intensity map, action plan
    'Theology',     // Statement of faith — categories, sections, content
    'Config',       // App config — key-value pairs
    'Quiz',         // Bible quiz — questions, options, answer, category
    'Apologetics'   // Apologetics Q&A — category, question, answer, refs
  ];

  /* ─── FLOCK API — TABS (79 tabs) ──────────────────────────────────────────── */

  const FLOCK_TABS = {
    pastoral: [
      'Members', 'PrayerRequests', 'ContactLog', 'PastoralNotes',
      'Milestones', 'Households', 'ToDo'
    ],
    auth: [
      'AuthUsers', 'UserProfiles', 'AccessControl',
      'AuthAudit', 'AuditLog', 'AppConfig'
    ],
    attendance: [
      'Attendance', 'Events', 'EventRSVPs', 'CheckInSessions'
    ],
    groups: [
      'SmallGroups', 'SmallGroupMembers', 'Giving', 'GivingPledges'
    ],
    volunteering: [
      'VolunteerSchedule', 'Ministries', 'MinistryMembers',
      'ServicePlans', 'ServicePlanItems'
    ],
    communications: [
      'Communications', 'CommsMessages', 'CommsThreads',
      'CommsNotifications', 'CommsNotificationPrefs', 'CommsChannels',
      'CommsTemplates', 'CommsReadReceipts', 'CommsBroadcastLog'
    ],
    care: [
      'SpiritualCareCases', 'SpiritualCareInteractions', 'SpiritualCareAssignments',
      'OutreachContacts', 'OutreachCampaigns', 'OutreachFollowUps'
    ],
    media: [
      'Sermons', 'SermonSeries', 'SermonReviews', 'Albums'
    ],
    compassion: [
      'CompassionRequests', 'CompassionResources', 'CompassionTeamLog'
    ],
    discipleship: [
      'DiscipleshipPaths', 'DiscipleshipSteps', 'DiscipleshipEnrollments',
      'DiscipleshipMentoring', 'DiscipleshipMeetings', 'DiscipleshipAssessments',
      'DiscipleshipResources', 'DiscipleshipMilestones', 'DiscipleshipGoals',
      'DiscipleshipCertificates'
    ],
    learning: [
      'LearningTopics', 'LearningPlaylists', 'LearningPlaylistItems',
      'LearningProgress', 'LearningNotes', 'LearningBookmarks',
      'LearningRecommendations', 'LearningQuizzes', 'LearningQuizResults',
      'LearningCertificates'
    ],
    theology: [
      'TheologyCategories', 'TheologySections',
      'TheologyScriptures', 'TheologyRevisions'
    ],
    memberCards: [
      'MemberCards', 'MemberCardLinks', 'MemberCardViews'
    ]
  };

  /* ─── MISSIONS API — TABS (56 tabs) ──────────────────────────────────────── */

  const MISSIONS_TABS = {
    structured: [
      'MissionsRegistry', 'MissionsRegions', 'MissionsCities',
      'MissionsPartners', 'MissionsPrayerFocus', 'MissionsUpdates',
      'MissionsTeams', 'MissionsMetrics'
    ],
    countries: [
      'Afghanistan', 'Algeria', 'Bangladesh', 'Belarus', 'Bhutan',
      'Cambodia', 'China', 'Colombia', 'Djibouti', 'Egypt', 'Eritrea',
      'France', 'Germany', 'Guatemala', 'India', 'Iran', 'Iraq', 'Japan',
      'Kuwait', 'Laos', 'Libya', 'Malaysia', 'Maldives', 'Mali',
      'Mauritania', 'Mexico', 'Morocco', 'Myanmar', 'Nepal', 'Nigeria',
      'NKorea', 'Oman', 'Pakistan', 'Qatar', 'Russia', 'Saudi', 'Somalia',
      'Sri', 'Sudan', 'Syria', 'Tajikstan', 'Thailand', 'Turkey',
      'Turkmenistan', 'UK', 'Uzbekistan', 'Vietnam', 'Yemen'
    ]
  };

  /* ─── EXTRA API — TABS (53 tabs) ──────────────────────────────────────────── */

  const EXTRA_TABS = {
    statistics: [
      'StatisticsConfig',    // Metric definitions (h1–h50 slot mapping)
      'StatisticsSnapshots', // Computed snapshot data
      'StatisticsCustomViews'// Saved dashboard layouts
    ],
    future: Array.from({ length: 50 }, (_, i) => `Extra_${String(i + 1).padStart(2, '0')}`)
  };

  /* ─── API ACTIONS ─────────────────────────────────────────────────────────── */
  // Format: { api: APIS.X, minRole: RBAC.X }
  // minRole: RBAC.none (-1) = public / no auth required

  const ACTIONS = {

    /* ── AUTH & USERS ─── */
    'auth.login':              { api: APIS.FLOCK, minRole: RBAC.none },
    'auth.profile':            { api: APIS.FLOCK, minRole: RBAC.readonly },
    'auth.refresh':            { api: APIS.FLOCK, minRole: RBAC.readonly },
    'auth.logout':             { api: APIS.FLOCK, minRole: RBAC.readonly },
    'auth.changePasscode':     { api: APIS.FLOCK, minRole: RBAC.readonly },
    'auth.profileUpdate':      { api: APIS.FLOCK, minRole: RBAC.readonly },
    'users.list':              { api: APIS.FLOCK, minRole: RBAC.pastor },
    'users.create':            { api: APIS.FLOCK, minRole: RBAC.pastor },
    'users.update':            { api: APIS.FLOCK, minRole: RBAC.pastor },
    'users.deactivate':        { api: APIS.FLOCK, minRole: RBAC.pastor },
    'users.delete':            { api: APIS.FLOCK, minRole: RBAC.pastor },
    'users.resetPasscode':     { api: APIS.FLOCK, minRole: RBAC.pastor },

    /* ── ACCESS & CONFIG ─── */
    'access.list':             { api: APIS.FLOCK, minRole: RBAC.pastor },
    'access.set':              { api: APIS.FLOCK, minRole: RBAC.pastor },
    'access.remove':           { api: APIS.FLOCK, minRole: RBAC.pastor },
    'config.list':             { api: APIS.FLOCK, minRole: RBAC.leader },
    'config.get':              { api: APIS.FLOCK, minRole: RBAC.leader },
    'config.set':              { api: APIS.FLOCK, minRole: RBAC.pastor },

    /* ── ATTENDANCE ─── */
    'attendance.list':         { api: APIS.FLOCK, minRole: RBAC.leader },
    'attendance.get':          { api: APIS.FLOCK, minRole: RBAC.leader },
    'attendance.create':       { api: APIS.FLOCK, minRole: RBAC.leader },
    'attendance.update':       { api: APIS.FLOCK, minRole: RBAC.leader },
    'attendance.bulkCreate':   { api: APIS.FLOCK, minRole: RBAC.leader },
    'attendance.summary':      { api: APIS.FLOCK, minRole: RBAC.leader },

    /* ── EVENTS ─── */
    'events.public':           { api: APIS.FLOCK, minRole: RBAC.none },     // unauthenticated — public events only
    'events.list':             { api: APIS.FLOCK, minRole: RBAC.readonly },
    'events.get':              { api: APIS.FLOCK, minRole: RBAC.readonly },
    'events.create':           { api: APIS.FLOCK, minRole: RBAC.leader },
    'events.update':           { api: APIS.FLOCK, minRole: RBAC.leader },
    'events.cancel':           { api: APIS.FLOCK, minRole: RBAC.leader },
    'events.rsvp':             { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'events.rsvpList':         { api: APIS.FLOCK, minRole: RBAC.leader },

    /* ── SMALL GROUPS ─── */
    'groups.list':             { api: APIS.FLOCK, minRole: RBAC.readonly },
    'groups.get':              { api: APIS.FLOCK, minRole: RBAC.readonly },
    'groups.create':           { api: APIS.FLOCK, minRole: RBAC.leader },
    'groups.update':           { api: APIS.FLOCK, minRole: RBAC.leader },
    'groups.addMember':        { api: APIS.FLOCK, minRole: RBAC.leader },
    'groups.removeMember':     { api: APIS.FLOCK, minRole: RBAC.leader },
    'groups.members':          { api: APIS.FLOCK, minRole: RBAC.leader },

    /* ── GIVING ─── */
    'giving.list':             { api: APIS.FLOCK, minRole: RBAC.pastor },
    'giving.create':           { api: APIS.FLOCK, minRole: RBAC.pastor },
    'giving.update':           { api: APIS.FLOCK, minRole: RBAC.pastor },
    'giving.summary':          { api: APIS.FLOCK, minRole: RBAC.pastor },
    'giving.memberStatement':  { api: APIS.FLOCK, minRole: RBAC.pastor },
    'giving.pledges.list':     { api: APIS.FLOCK, minRole: RBAC.pastor },
    'giving.pledges.create':   { api: APIS.FLOCK, minRole: RBAC.pastor },

    /* ── VOLUNTEERS ─── */
    'volunteers.list':         { api: APIS.FLOCK, minRole: RBAC.leader },
    'volunteers.schedule':     { api: APIS.FLOCK, minRole: RBAC.leader },
    'volunteers.create':       { api: APIS.FLOCK, minRole: RBAC.leader },
    'volunteers.update':       { api: APIS.FLOCK, minRole: RBAC.leader },
    'volunteers.swap':         { api: APIS.FLOCK, minRole: RBAC.leader },

    /* ── COMMUNICATIONS (legacy) ─── */
    'comms.list':              { api: APIS.FLOCK, minRole: RBAC.leader },
    'comms.create':            { api: APIS.FLOCK, minRole: RBAC.leader },
    'comms.send':              { api: APIS.FLOCK, minRole: RBAC.leader },

    /* ── COMMUNICATIONS HUB ─── */
    'comms.messages.list':             { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.messages.get':              { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.messages.send':             { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.messages.update':           { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.messages.delete':           { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.messages.inbox':            { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.messages.sent':             { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.threads.list':              { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.threads.get':               { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.threads.create':            { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.threads.update':            { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.threads.archive':           { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.threads.mute':              { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.threads.unmute':            { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.threads.addParticipant':    { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'comms.notifications.list':        { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.notifications.unreadCount': { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.notifications.markRead':    { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.notifications.dismiss':     { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.notifications.create':      { api: APIS.FLOCK, minRole: RBAC.leader },
    'comms.notifications.broadcast':   { api: APIS.FLOCK, minRole: RBAC.leader },
    'comms.notifPrefs.get':            { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.notifPrefs.update':         { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.channels.list':             { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.channels.get':              { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.channels.create':           { api: APIS.FLOCK, minRole: RBAC.leader },
    'comms.channels.update':           { api: APIS.FLOCK, minRole: RBAC.leader },
    'comms.channels.delete':           { api: APIS.FLOCK, minRole: RBAC.pastor },
    'comms.channels.post':             { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'comms.templates.list':            { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'comms.templates.get':             { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'comms.templates.create':          { api: APIS.FLOCK, minRole: RBAC.leader },
    'comms.templates.update':          { api: APIS.FLOCK, minRole: RBAC.leader },
    'comms.templates.delete':          { api: APIS.FLOCK, minRole: RBAC.pastor },
    'comms.templates.use':             { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'comms.readReceipts.create':       { api: APIS.FLOCK, minRole: RBAC.readonly },
    'comms.readReceipts.forMessage':   { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'comms.broadcast.list':            { api: APIS.FLOCK, minRole: RBAC.leader },
    'comms.broadcast.create':          { api: APIS.FLOCK, minRole: RBAC.leader },
    'comms.broadcast.send':            { api: APIS.FLOCK, minRole: RBAC.pastor },
    'comms.dashboard':                 { api: APIS.FLOCK, minRole: RBAC.readonly },

    /* ── FIREBASE (The Upper Room) ─── */
    'firebase.token':                  { api: APIS.FLOCK, minRole: RBAC.readonly },

    /* ── USER PREFERENCES ─── */
    'user.preferences.get':    { api: APIS.FLOCK, minRole: RBAC.readonly },
    'user.preferences.update': { api: APIS.FLOCK, minRole: RBAC.readonly },

    /* ── CHECK-IN ─── */
    'checkin.open':            { api: APIS.FLOCK, minRole: RBAC.leader },
    'checkin.close':           { api: APIS.FLOCK, minRole: RBAC.leader },
    'checkin.record':          { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'checkin.sessions':        { api: APIS.FLOCK, minRole: RBAC.leader },

    /* ── MINISTRIES ─── */
    'ministries.list':             { api: APIS.FLOCK, minRole: RBAC.readonly },
    'ministries.get':              { api: APIS.FLOCK, minRole: RBAC.readonly },
    'ministries.create':           { api: APIS.FLOCK, minRole: RBAC.leader },
    'ministries.update':           { api: APIS.FLOCK, minRole: RBAC.leader },
    'ministries.tree':             { api: APIS.FLOCK, minRole: RBAC.readonly },
    'ministries.summary':          { api: APIS.FLOCK, minRole: RBAC.leader },
    'ministryMembers.list':        { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'ministryMembers.forMember':   { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'ministryMembers.add':         { api: APIS.FLOCK, minRole: RBAC.leader },
    'ministryMembers.update':      { api: APIS.FLOCK, minRole: RBAC.leader },
    'ministryMembers.remove':      { api: APIS.FLOCK, minRole: RBAC.leader },

    /* ── SERVICE PLANNING ─── */
    'servicePlans.list':       { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'servicePlans.get':        { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'servicePlans.create':     { api: APIS.FLOCK, minRole: RBAC.leader },
    'servicePlans.update':     { api: APIS.FLOCK, minRole: RBAC.leader },
    'servicePlans.duplicate':  { api: APIS.FLOCK, minRole: RBAC.leader },
    'serviceItems.list':       { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'serviceItems.create':     { api: APIS.FLOCK, minRole: RBAC.leader },
    'serviceItems.update':     { api: APIS.FLOCK, minRole: RBAC.leader },
    'serviceItems.delete':     { api: APIS.FLOCK, minRole: RBAC.leader },
    'serviceItems.reorder':    { api: APIS.FLOCK, minRole: RBAC.leader },

    /* ── SONGS & MUSIC STAND ─── */
    'songs.list':                  { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'songs.get':                   { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'songs.create':                { api: APIS.FLOCK, minRole: RBAC.leader },
    'songs.update':                { api: APIS.FLOCK, minRole: RBAC.leader },
    'songs.delete':                { api: APIS.FLOCK, minRole: RBAC.pastor },
    'arrangements.list':           { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'arrangements.get':            { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'arrangements.create':         { api: APIS.FLOCK, minRole: RBAC.leader },
    'arrangements.update':         { api: APIS.FLOCK, minRole: RBAC.leader },
    'arrangements.delete':         { api: APIS.FLOCK, minRole: RBAC.pastor },
    'setlistSongs.list':           { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'setlistSongs.add':            { api: APIS.FLOCK, minRole: RBAC.leader },
    'setlistSongs.update':         { api: APIS.FLOCK, minRole: RBAC.leader },
    'setlistSongs.remove':         { api: APIS.FLOCK, minRole: RBAC.leader },
    'musicStand.get':              { api: APIS.FLOCK, minRole: RBAC.volunteer },

    /* ── SPIRITUAL CARE ─── */
    'care.list':                        { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'care.get':                         { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'care.create':                      { api: APIS.FLOCK, minRole: RBAC.care },
    'care.update':                      { api: APIS.FLOCK, minRole: RBAC.care },
    'care.resolve':                     { api: APIS.FLOCK, minRole: RBAC.care },
    'care.interactions.list':           { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'care.interactions.create':         { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'care.interactions.followUpDone':   { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'care.followUps.due':               { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'care.assignments.list':            { api: APIS.FLOCK, minRole: RBAC.care },
    'care.assignments.forMember':       { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'care.assignments.myFlock':         { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'care.assignments.create':          { api: APIS.FLOCK, minRole: RBAC.leader },
    'care.assignments.end':             { api: APIS.FLOCK, minRole: RBAC.leader },
    'care.assignments.reassign':        { api: APIS.FLOCK, minRole: RBAC.leader },
    'care.dashboard':                   { api: APIS.FLOCK, minRole: RBAC.care },

    /* ── OUTREACH ─── */
    'outreach.contacts.list':       { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'outreach.contacts.get':        { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'outreach.contacts.create':     { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'outreach.contacts.update':     { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'outreach.contacts.convert':    { api: APIS.FLOCK, minRole: RBAC.leader },
    'outreach.contacts.delete':     { api: APIS.FLOCK, minRole: RBAC.leader },
    'outreach.campaigns.list':      { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'outreach.campaigns.get':       { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'outreach.campaigns.create':    { api: APIS.FLOCK, minRole: RBAC.leader },
    'outreach.campaigns.update':    { api: APIS.FLOCK, minRole: RBAC.leader },
    'outreach.followUps.list':      { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'outreach.followUps.create':    { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'outreach.followUps.done':      { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'outreach.followUps.due':       { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'outreach.dashboard':           { api: APIS.FLOCK, minRole: RBAC.leader },
    'outreach.contacts.submit':     { api: APIS.FLOCK, minRole: RBAC.none },     // public — no auth required

    /* ── SERMONS ─── */
    'sermons.list':              { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'sermons.get':               { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'sermons.create':            { api: APIS.FLOCK, minRole: RBAC.leader },
    'sermons.upload':            { api: APIS.FLOCK, minRole: RBAC.leader },
    'sermons.update':            { api: APIS.FLOCK, minRole: RBAC.leader },
    'sermons.submit':            { api: APIS.FLOCK, minRole: RBAC.leader },
    'sermons.approve':           { api: APIS.FLOCK, minRole: RBAC.pastor },
    'sermons.deliver':           { api: APIS.FLOCK, minRole: RBAC.leader },
    'sermons.delete':            { api: APIS.FLOCK, minRole: RBAC.pastor },
    'sermons.dashboard':         { api: APIS.FLOCK, minRole: RBAC.leader },
    'sermonSeries.list':         { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'sermonSeries.get':          { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'sermonSeries.create':       { api: APIS.FLOCK, minRole: RBAC.leader },
    'sermonSeries.update':       { api: APIS.FLOCK, minRole: RBAC.leader },
    'sermonReviews.create':      { api: APIS.FLOCK, minRole: RBAC.pastor },
    'sermonReviews.list':        { api: APIS.FLOCK, minRole: RBAC.volunteer },

    /* ── ALBUMS ─── */
    'albums.list':               { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'albums.get':                { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'albums.create':             { api: APIS.FLOCK, minRole: RBAC.leader },
    'albums.update':             { api: APIS.FLOCK, minRole: RBAC.leader },
    'albums.delete':             { api: APIS.FLOCK, minRole: RBAC.pastor },

    /* ── COMPASSION ─── */
    'compassion.requests.list':     { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'compassion.requests.get':      { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'compassion.requests.create':   { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'compassion.requests.update':   { api: APIS.FLOCK, minRole: RBAC.leader },
    'compassion.requests.approve':  { api: APIS.FLOCK, minRole: RBAC.pastor },
    'compassion.requests.deny':     { api: APIS.FLOCK, minRole: RBAC.pastor },
    'compassion.requests.resolve':  { api: APIS.FLOCK, minRole: RBAC.leader },
    'compassion.followUps.due':     { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'compassion.resources.list':    { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'compassion.resources.create':  { api: APIS.FLOCK, minRole: RBAC.leader },
    'compassion.resources.update':  { api: APIS.FLOCK, minRole: RBAC.leader },
    'compassion.resources.low':     { api: APIS.FLOCK, minRole: RBAC.leader },
    'compassion.log.create':        { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'compassion.log.list':          { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'compassion.log.recent':        { api: APIS.FLOCK, minRole: RBAC.leader },
    'compassion.dashboard':         { api: APIS.FLOCK, minRole: RBAC.leader },

    /* ── DISCIPLESHIP ─── */
    'discipleship.paths.list':           { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.paths.get':            { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.paths.create':         { api: APIS.FLOCK, minRole: RBAC.leader },
    'discipleship.paths.update':         { api: APIS.FLOCK, minRole: RBAC.leader },
    'discipleship.paths.publish':        { api: APIS.FLOCK, minRole: RBAC.leader },
    'discipleship.paths.archive':        { api: APIS.FLOCK, minRole: RBAC.leader },
    'discipleship.steps.list':           { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.steps.get':            { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.steps.create':         { api: APIS.FLOCK, minRole: RBAC.leader },
    'discipleship.steps.update':         { api: APIS.FLOCK, minRole: RBAC.leader },
    'discipleship.steps.delete':         { api: APIS.FLOCK, minRole: RBAC.leader },
    'discipleship.steps.reorder':        { api: APIS.FLOCK, minRole: RBAC.leader },
    'discipleship.enrollments.list':     { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.enrollments.get':      { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.enrollments.create':   { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.enrollments.update':   { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.enrollments.advance':  { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.enrollments.forMember':{ api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.enrollments.complete': { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.mentoring.list':       { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.mentoring.get':        { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.mentoring.create':     { api: APIS.FLOCK, minRole: RBAC.leader },
    'discipleship.mentoring.update':     { api: APIS.FLOCK, minRole: RBAC.leader },
    'discipleship.mentoring.end':        { api: APIS.FLOCK, minRole: RBAC.leader },
    'discipleship.mentoring.forMentor':  { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.meetings.list':        { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.meetings.create':      { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.meetings.update':      { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.assessments.list':     { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.assessments.get':      { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.assessments.create':   { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.assessments.update':   { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.assessments.forMember':{ api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.resources.list':       { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.resources.get':        { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.resources.create':     { api: APIS.FLOCK, minRole: RBAC.leader },
    'discipleship.resources.update':     { api: APIS.FLOCK, minRole: RBAC.leader },
    'discipleship.milestones.list':      { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.milestones.forMember': { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.milestones.create':    { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.milestones.update':    { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.goals.list':           { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.goals.forMember':      { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.goals.create':         { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.goals.update':         { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.goals.complete':       { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.goals.review':         { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.goals.overdue':        { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.certificates.list':    { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.certificates.forMember':{ api: APIS.FLOCK, minRole: RBAC.volunteer },
    'discipleship.certificates.issue':   { api: APIS.FLOCK, minRole: RBAC.leader },
    'discipleship.certificates.revoke':  { api: APIS.FLOCK, minRole: RBAC.leader },
    'discipleship.dashboard':            { api: APIS.FLOCK, minRole: RBAC.leader },

    /* ── LEARNING ─── */
    'learning.topics.list':             { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.topics.get':              { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.topics.create':           { api: APIS.FLOCK, minRole: RBAC.leader },
    'learning.topics.update':           { api: APIS.FLOCK, minRole: RBAC.leader },
    'learning.topics.delete':           { api: APIS.FLOCK, minRole: RBAC.leader },
    'learning.topics.tree':             { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.playlists.list':          { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.playlists.get':           { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.playlists.create':        { api: APIS.FLOCK, minRole: RBAC.leader },
    'learning.playlists.update':        { api: APIS.FLOCK, minRole: RBAC.leader },
    'learning.playlists.delete':        { api: APIS.FLOCK, minRole: RBAC.leader },
    'learning.playlists.subscribe':     { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.playlistItems.list':      { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.playlistItems.create':    { api: APIS.FLOCK, minRole: RBAC.leader },
    'learning.playlistItems.update':    { api: APIS.FLOCK, minRole: RBAC.leader },
    'learning.playlistItems.delete':    { api: APIS.FLOCK, minRole: RBAC.leader },
    'learning.playlistItems.reorder':   { api: APIS.FLOCK, minRole: RBAC.leader },
    'learning.progress.list':           { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.progress.get':            { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.progress.update':         { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.progress.complete':       { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.progress.stats':          { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.notes.list':              { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.notes.get':               { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.notes.create':            { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.notes.update':            { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.notes.delete':            { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.bookmarks.list':          { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.bookmarks.create':        { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.bookmarks.update':        { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.bookmarks.delete':        { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.recommendations.list':    { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.recommendations.create':  { api: APIS.FLOCK, minRole: RBAC.leader },
    'learning.recommendations.dismiss': { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.recommendations.accept':  { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.recommendations.generate':{ api: APIS.FLOCK, minRole: RBAC.leader },
    'learning.quizzes.list':            { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.quizzes.get':             { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.quizzes.create':          { api: APIS.FLOCK, minRole: RBAC.leader },
    'learning.quizzes.update':          { api: APIS.FLOCK, minRole: RBAC.leader },
    'learning.quizzes.publish':         { api: APIS.FLOCK, minRole: RBAC.leader },
    'learning.quizzes.delete':          { api: APIS.FLOCK, minRole: RBAC.leader },
    'learning.quizResults.list':        { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.quizResults.submit':      { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.certificates.list':       { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.certificates.forMember':  { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.certificates.issue':      { api: APIS.FLOCK, minRole: RBAC.leader },
    'learning.certificates.revoke':     { api: APIS.FLOCK, minRole: RBAC.leader },
    'learning.sermons.search':          { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.sermons.topics':          { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.sermons.preachers':       { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.sermons.scriptures':      { api: APIS.FLOCK, minRole: RBAC.readonly },
    'learning.dashboard':               { api: APIS.FLOCK, minRole: RBAC.readonly },

    /* ── THEOLOGY ─── */
    'theology.categories.list':     { api: APIS.FLOCK, minRole: RBAC.readonly },
    'theology.categories.get':      { api: APIS.FLOCK, minRole: RBAC.readonly },
    'theology.categories.create':   { api: APIS.FLOCK, minRole: RBAC.leader },
    'theology.categories.update':   { api: APIS.FLOCK, minRole: RBAC.leader },
    'theology.categories.delete':   { api: APIS.FLOCK, minRole: RBAC.pastor },
    'theology.categories.reorder':  { api: APIS.FLOCK, minRole: RBAC.leader },
    'theology.sections.list':       { api: APIS.FLOCK, minRole: RBAC.readonly },
    'theology.sections.get':        { api: APIS.FLOCK, minRole: RBAC.readonly },
    'theology.sections.create':     { api: APIS.FLOCK, minRole: RBAC.leader },
    'theology.sections.update':     { api: APIS.FLOCK, minRole: RBAC.leader },
    'theology.sections.delete':     { api: APIS.FLOCK, minRole: RBAC.pastor },
    'theology.sections.approve':    { api: APIS.FLOCK, minRole: RBAC.pastor },
    'theology.sections.reorder':    { api: APIS.FLOCK, minRole: RBAC.leader },
    'theology.sections.forCategory':{ api: APIS.FLOCK, minRole: RBAC.readonly },
    'theology.scriptures.list':     { api: APIS.FLOCK, minRole: RBAC.readonly },
    'theology.scriptures.create':   { api: APIS.FLOCK, minRole: RBAC.leader },
    'theology.scriptures.update':   { api: APIS.FLOCK, minRole: RBAC.leader },
    'theology.scriptures.delete':   { api: APIS.FLOCK, minRole: RBAC.leader },
    'theology.revisions.list':      { api: APIS.FLOCK, minRole: RBAC.readonly },
    'theology.revisions.get':       { api: APIS.FLOCK, minRole: RBAC.readonly },
    'theology.flat':                { api: APIS.FLOCK, minRole: RBAC.readonly },
    'theology.full':                { api: APIS.FLOCK, minRole: RBAC.readonly },
    'theology.search':              { api: APIS.FLOCK, minRole: RBAC.readonly },
    'theology.dashboard':           { api: APIS.FLOCK, minRole: RBAC.readonly },

    /* ── MEMBER CARDS ─── */
    'memberCards.list':             { api: APIS.FLOCK, minRole: RBAC.volunteer },
    'memberCards.get':              { api: APIS.FLOCK, minRole: RBAC.readonly },
    'memberCards.byNumber':         { api: APIS.FLOCK, minRole: RBAC.readonly },
    'memberCards.create':           { api: APIS.FLOCK, minRole: RBAC.leader },
    'memberCards.update':           { api: APIS.FLOCK, minRole: RBAC.readonly },
    'memberCards.archive':          { api: APIS.FLOCK, minRole: RBAC.pastor },
    'memberCards.mine':             { api: APIS.FLOCK, minRole: RBAC.readonly },
    'memberCards.search':           { api: APIS.FLOCK, minRole: RBAC.readonly },
    'memberCards.bulkProvision':    { api: APIS.FLOCK, minRole: RBAC.pastor },
    'memberCards.public':           { api: APIS.FLOCK, minRole: RBAC.none },
    'memberCards.publicFull':       { api: APIS.FLOCK, minRole: RBAC.none },
    'memberCards.vcard':            { api: APIS.FLOCK, minRole: RBAC.none },
    'memberCards.directory':        { api: APIS.FLOCK, minRole: RBAC.readonly },
    'memberCards.links.list':       { api: APIS.FLOCK, minRole: RBAC.readonly },
    'memberCards.links.create':     { api: APIS.FLOCK, minRole: RBAC.readonly },
    'memberCards.links.update':     { api: APIS.FLOCK, minRole: RBAC.readonly },
    'memberCards.links.delete':     { api: APIS.FLOCK, minRole: RBAC.readonly },
    'memberCards.views.list':       { api: APIS.FLOCK, minRole: RBAC.leader },
    'memberCards.views.mine':       { api: APIS.FLOCK, minRole: RBAC.readonly },
    'memberCards.dashboard':        { api: APIS.FLOCK, minRole: RBAC.volunteer },

    /* ── REPORTS ─── */
    'reports.attendanceTrend':  { api: APIS.FLOCK, minRole: RBAC.leader },
    'reports.givingSummary':    { api: APIS.FLOCK, minRole: RBAC.pastor },
    'reports.memberGrowth':     { api: APIS.FLOCK, minRole: RBAC.leader },
    'reports.prayerOverview':   { api: APIS.FLOCK, minRole: RBAC.leader },
    'reports.dashboard':        { api: APIS.FLOCK, minRole: RBAC.leader },

    /* ── MULTI-CHURCH & BATCH ─── */
    'church.create':            { api: APIS.FLOCK, minRole: RBAC.pastor },
    'church.update':            { api: APIS.FLOCK, minRole: RBAC.pastor },
    'church.setup':             { api: APIS.FLOCK, minRole: RBAC.pastor },
    'church.configs':           { api: APIS.FLOCK, minRole: RBAC.pastor },
    'church.list':              { api: APIS.FLOCK, minRole: RBAC.pastor },
    'church.delete':            { api: APIS.FLOCK, minRole: RBAC.pastor },
    'bulk.membersImport':       { api: APIS.FLOCK, minRole: RBAC.pastor },
    'bulk.dataExport':          { api: APIS.FLOCK, minRole: RBAC.pastor },

    /* ── HEALTH (unified API) ─── */
    'health':                   { api: null, minRole: RBAC.none },

    /* ── MISSIONS DOMAIN ─── */
    'missions.registry.list':         { api: APIS.MISSIONS, minRole: RBAC.none },
    'missions.registry.get':          { api: APIS.MISSIONS, minRole: RBAC.none },
    'missions.registry.create':       { api: APIS.MISSIONS, minRole: RBAC.pastor },
    'missions.registry.update':       { api: APIS.MISSIONS, minRole: RBAC.pastor },
    'missions.registry.delete':       { api: APIS.MISSIONS, minRole: RBAC.pastor },
    'missions.registry.1040':         { api: APIS.MISSIONS, minRole: RBAC.none },
    'missions.regions.list':          { api: APIS.MISSIONS, minRole: RBAC.none },
    'missions.regions.get':           { api: APIS.MISSIONS, minRole: RBAC.none },
    'missions.regions.create':        { api: APIS.MISSIONS, minRole: RBAC.pastor },
    'missions.regions.update':        { api: APIS.MISSIONS, minRole: RBAC.pastor },
    'missions.regions.delete':        { api: APIS.MISSIONS, minRole: RBAC.pastor },
    'missions.regions.forCountry':    { api: APIS.MISSIONS, minRole: RBAC.none },
    'missions.cities.list':           { api: APIS.MISSIONS, minRole: RBAC.none },
    'missions.cities.get':            { api: APIS.MISSIONS, minRole: RBAC.none },
    'missions.cities.create':         { api: APIS.MISSIONS, minRole: RBAC.pastor },
    'missions.cities.update':         { api: APIS.MISSIONS, minRole: RBAC.pastor },
    'missions.cities.delete':         { api: APIS.MISSIONS, minRole: RBAC.pastor },
    'missions.cities.forCountry':     { api: APIS.MISSIONS, minRole: RBAC.none },
    'missions.partners.list':         { api: APIS.MISSIONS, minRole: RBAC.volunteer },
    'missions.partners.get':          { api: APIS.MISSIONS, minRole: RBAC.volunteer },
    'missions.partners.create':       { api: APIS.MISSIONS, minRole: RBAC.leader },
    'missions.partners.update':       { api: APIS.MISSIONS, minRole: RBAC.leader },
    'missions.partners.delete':       { api: APIS.MISSIONS, minRole: RBAC.pastor },
    'missions.prayerFocus.list':      { api: APIS.MISSIONS, minRole: RBAC.none },
    'missions.prayerFocus.create':    { api: APIS.MISSIONS, minRole: RBAC.leader },
    'missions.prayerFocus.update':    { api: APIS.MISSIONS, minRole: RBAC.leader },
    'missions.prayerFocus.respond':   { api: APIS.MISSIONS, minRole: RBAC.readonly },
    'missions.updates.list':          { api: APIS.MISSIONS, minRole: RBAC.none },
    'missions.updates.get':           { api: APIS.MISSIONS, minRole: RBAC.none },
    'missions.updates.create':        { api: APIS.MISSIONS, minRole: RBAC.leader },
    'missions.updates.publish':       { api: APIS.MISSIONS, minRole: RBAC.pastor },
    'missions.teams.list':            { api: APIS.MISSIONS, minRole: RBAC.volunteer },
    'missions.teams.get':             { api: APIS.MISSIONS, minRole: RBAC.volunteer },
    'missions.teams.create':          { api: APIS.MISSIONS, minRole: RBAC.leader },
    'missions.teams.update':          { api: APIS.MISSIONS, minRole: RBAC.leader },
    'missions.metrics.list':          { api: APIS.MISSIONS, minRole: RBAC.none },
    'missions.metrics.create':        { api: APIS.MISSIONS, minRole: RBAC.pastor },
    'missions.metrics.update':        { api: APIS.MISSIONS, minRole: RBAC.pastor },
    'missions.metrics.compare':       { api: APIS.MISSIONS, minRole: RBAC.none },
    'missions.dashboard':             { api: APIS.MISSIONS, minRole: RBAC.readonly },

    /* ── EXTRA / STATISTICS API ─── */
    'statistics.config.list':     { api: APIS.EXTRA, minRole: RBAC.leader },
    'statistics.config.get':      { api: APIS.EXTRA, minRole: RBAC.leader },
    'statistics.config.create':   { api: APIS.EXTRA, minRole: RBAC.pastor },
    'statistics.config.update':   { api: APIS.EXTRA, minRole: RBAC.pastor },
    'statistics.config.delete':   { api: APIS.EXTRA, minRole: RBAC.pastor },
    'statistics.snapshots.list':  { api: APIS.EXTRA, minRole: RBAC.leader },
    'statistics.snapshots.get':   { api: APIS.EXTRA, minRole: RBAC.leader },
    'statistics.snapshots.create':{ api: APIS.EXTRA, minRole: RBAC.leader },
    'statistics.snapshots.delete':{ api: APIS.EXTRA, minRole: RBAC.pastor },
    'statistics.snapshots.latest':{ api: APIS.EXTRA, minRole: RBAC.leader },
    'statistics.compute':         { api: APIS.EXTRA, minRole: RBAC.leader },
    'statistics.views.list':      { api: APIS.EXTRA, minRole: RBAC.leader },
    'statistics.views.get':       { api: APIS.EXTRA, minRole: RBAC.leader },
    'statistics.views.create':    { api: APIS.EXTRA, minRole: RBAC.leader },
    'statistics.views.update':    { api: APIS.EXTRA, minRole: RBAC.leader },
    'statistics.views.delete':    { api: APIS.EXTRA, minRole: RBAC.leader },
    'statistics.dashboard':       { api: APIS.EXTRA, minRole: RBAC.leader },
    'statistics.trends':          { api: APIS.EXTRA, minRole: RBAC.leader },
    'statistics.export':          { api: APIS.EXTRA, minRole: RBAC.pastor }
  };

  /* ─── PAGE ROUTES ─────────────────────────────────────────────────────────── */
  // auth: false = public, true = any login, or RBAC level number

  const ROUTES = {
    '/':                 { api: null,           auth: false },
    '/books':            { api: APIS.APP,       tabs: ['Books'],                           auth: false },
    '/characters':       { api: APIS.APP,       tabs: ['Genealogy'],                       auth: false },
    '/wisdom':           { api: APIS.APP,       tabs: ['Counseling'],                      auth: false },
    '/bread':            { api: APIS.APP,       tabs: ['Devotionals', 'Reading', 'Words'], auth: false },
    '/lexicon':          { api: APIS.APP,       tabs: ['Words'],                           auth: false },
    '/heart':            { api: APIS.APP,       tabs: ['Heart'],                           auth: false },
    '/mirror':           { api: APIS.APP,       tabs: ['Mirror'],                          auth: false },
    '/theology':         { api: APIS.APP,       tabs: ['Theology'],                        auth: false },
    '/quiz':             { api: APIS.APP,       tabs: ['Quiz'],                            auth: false },
    '/apologetics':      { api: APIS.APP,       tabs: ['Apologetics'],                     auth: false },
    '/missions':         { api: APIS.MISSIONS,  actions: ['missions.registry.list'],       auth: false },
    '/focus':            { api: APIS.MISSIONS,  actions: ['missions.prayerFocus.list'],    auth: false },
    '/prayer/request':   { api: null,           note: 'Google Form POST',                  auth: false },
    '/worship':          { api: null,           note: 'hardcoded',                         auth: false },
    '/psalms':           { api: null,           note: 'hardcoded',                         auth: false },
    '/family':           { api: null,           note: 'hardcoded',                         auth: false },
    '/invitation':       { api: null,           note: 'hardcoded',                         auth: false },
    '/about':            { api: null,           note: 'hardcoded',                         auth: false },
    '/statistics':       { api: null,           note: 'hardcoded live counters',           auth: false },
    '/card/:id':         { api: APIS.FLOCK,     actions: ['memberCards.public'],           auth: false },

    '/portal':           { api: APIS.FLOCK,     actions: ['members.search', 'prayer.list', 'todo.list'], auth: true },
    '/directory':        { api: APIS.FLOCK,     actions: ['memberCards.directory'],       auth: true },
    '/pastoral':         { api: APIS.FLOCK,     actions: ['members.list'],                auth: RBAC.pastor },
    '/prayer/manage':    { api: APIS.FLOCK,     actions: ['prayer.list', 'prayer.update'],auth: true },
    '/tasks':            { api: APIS.FLOCK,     actions: ['todo.list'],                   auth: true },
    '/settings':         { api: APIS.FLOCK,     actions: ['user.preferences.get'],        auth: true },
    '/admin':            { api: APIS.FLOCK,     actions: ['users.list', 'access.list'],   auth: RBAC.pastor }
  };

  /* ─── FEATURE INVENTORY ───────────────────────────────────────────────────── */

  const FEATURES = {
    public: [
      { id: 'P1',  name: 'Books Explorer',        route: '/books',        api: APIS.APP,      tab: 'Books' },
      { id: 'P2',  name: 'Character Genealogy',   route: '/characters',   api: APIS.APP,      tab: 'Genealogy' },
      { id: 'P3',  name: 'Counseling Wisdom',     route: '/wisdom',       api: APIS.APP,      tab: 'Counseling' },
      { id: 'P4',  name: 'Daily Devotional',      route: '/bread',        api: APIS.APP,      tab: 'Devotionals' },
      { id: 'P5',  name: 'Biblical Lexicon',      route: '/lexicon',      api: APIS.APP,      tab: 'Words' },
      { id: 'P6',  name: 'Heart Diagnostic',      route: '/heart',        api: APIS.APP,      tab: 'Heart' },
      { id: 'P7',  name: "Shepherd's Mirror",     route: '/mirror',       api: APIS.APP,      tab: 'Mirror' },
      { id: 'P8',  name: 'Theology',              route: '/theology',     api: APIS.APP,      tab: 'Theology' },
      { id: 'P9',  name: 'Bible Quiz',            route: '/quiz',         api: APIS.APP,      tab: 'Quiz' },
      { id: 'P10', name: 'Apologetics',           route: '/apologetics',  api: APIS.APP,      tab: 'Apologetics' },
      { id: 'P11', name: 'Missions Directory',    route: '/missions',     api: APIS.MISSIONS, tab: '[CountryName]' },
      { id: 'P12', name: 'Daily Focus Country',   route: '/focus',        api: APIS.MISSIONS, tab: 'rotating' },
      { id: 'P13', name: 'Prayer Request Form',   route: '/prayer/request', api: null },
      { id: 'P14', name: 'Worship Study',         route: '/worship',      api: null },
      { id: 'P15', name: 'Psalms Meditation',     route: '/psalms',       api: null },
      { id: 'P16', name: 'Family Ministry',       route: '/family',       api: null },
      { id: 'P17', name: 'Church Invitation',     route: '/invitation',   api: null },
      { id: 'P18', name: 'Disclaimer/Mission',    route: '/about',        api: null },
      { id: 'P19', name: 'Church Analytics',      route: '/statistics',   api: null },
      { id: 'P20', name: 'Live Statistics',       route: '/statistics',   api: null },
      { id: 'P21', name: 'Member Card (public)',  route: '/card/:id',     api: APIS.FLOCK, action: 'memberCards.public' }
    ],
    auth: [
      { id: 'A1', name: 'Member Portal',      route: '/portal',       minRole: RBAC.readonly },
      { id: 'A2', name: 'Member Directory',   route: '/directory',    minRole: RBAC.readonly },
      { id: 'A3', name: 'Pastoral Dashboard', route: '/pastoral',     minRole: RBAC.pastor },
      { id: 'A4', name: 'Prayer Management',  route: '/prayer/manage',minRole: RBAC.readonly },
      { id: 'A5', name: 'Todo / Task Manager',route: '/tasks',        minRole: RBAC.readonly },
      { id: 'A7', name: 'Admin Provisioning', route: '/admin',        minRole: RBAC.pastor }
    ],
    future: [
      { id: 'F1',  name: 'Attendance Tracking', api: APIS.FLOCK, namespace: 'attendance' },
      { id: 'F2',  name: 'Events & RSVPs',       api: APIS.FLOCK, namespace: 'events' },
      { id: 'F3',  name: 'Small Groups',         api: APIS.FLOCK, namespace: 'groups' },
      { id: 'F4',  name: 'Giving / Finance',     api: APIS.FLOCK, namespace: 'giving' },
      { id: 'F5',  name: 'Volunteer Scheduling', api: APIS.FLOCK, namespace: 'volunteers' },
      { id: 'F6',  name: 'Comms Hub',            api: APIS.FLOCK, namespace: 'comms' },
      { id: 'F7',  name: 'Check-In',             api: APIS.FLOCK, namespace: 'checkin' },
      { id: 'F8',  name: 'Ministry Teams',       api: APIS.FLOCK, namespace: 'ministries' },
      { id: 'F9',  name: 'Service Planning',     api: APIS.FLOCK, namespace: 'servicePlans' },
      { id: 'F10', name: 'Spiritual Care',       api: APIS.FLOCK, namespace: 'care' },
      { id: 'F11', name: 'Outreach',             api: APIS.FLOCK, namespace: 'outreach' },
      { id: 'F12', name: 'Sermons',              api: APIS.FLOCK, namespace: 'sermons' },
      { id: 'F14', name: 'Compassion',           api: APIS.FLOCK, namespace: 'compassion' },
      { id: 'F15', name: 'Discipleship',         api: APIS.FLOCK, namespace: 'discipleship' },
      { id: 'F16', name: 'Learning',             api: APIS.FLOCK, namespace: 'learning' },
      { id: 'F17', name: 'Stats Dashboard',      api: APIS.EXTRA, namespace: 'statistics' },
      { id: 'F18', name: 'Multi-Church',         api: APIS.FLOCK, namespace: 'church' },
      { id: 'F19', name: 'Bulk Import/Export',   api: APIS.FLOCK, namespace: 'bulk' }
    ]
  };

  /* ─── PUBLIC API ──────────────────────────────────────────────────────────── */

  /**
   * can(action, userRoleLevel)
   * Returns true if the given role level meets the minimum for that action.
   * Example: Temple.can('events.create', 2) → true (leader = 2, required = 2)
   */
  function can(action, userRoleLevel) {
    const def = ACTIONS[action];
    if (!def) return false;
    if (def.minRole === RBAC.none) return true;
    return userRoleLevel >= def.minRole;
  }

  /**
   * route(path)
   * Returns the route definition for a given path, or null if not found.
   */
  function route(path) {
    return ROUTES[path] || null;
  }

  /**
   * actionsForNamespace(ns)
   * Returns all actions whose key starts with ns.
   * Example: Temple.actionsForNamespace('sermons') → { 'sermons.list': ..., ... }
   */
  function actionsForNamespace(ns) {
    const prefix = ns + '.';
    return Object.fromEntries(
      Object.entries(ACTIONS).filter(([k]) => k === ns || k.startsWith(prefix))
    );
  }

  return {
    rbac:    RBAC,
    apis:    APIS,
    session: SESSION,
    actions: ACTIONS,
    routes:  ROUTES,
    features: FEATURES,
    app: {
      tabs: APP_TABS
    },
    flock: {
      tabs: FLOCK_TABS,
      allTabs: Object.values(FLOCK_TABS).flat()
    },
    missions: {
      tabs: MISSIONS_TABS,
      allTabs: [...MISSIONS_TABS.structured, ...MISSIONS_TABS.countries]
    },
    extra: {
      tabs: EXTRA_TABS,
      allTabs: [...EXTRA_TABS.statistics, ...EXTRA_TABS.future]
    },
    can,
    route,
    actionsForNamespace
  };

})();
