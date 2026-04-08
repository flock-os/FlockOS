// the_commission.js — FlockOS Master Deployment Guide
// Source: FlockOS/Revelation/3_Deployment.txt
// "Go therefore and make disciples of all nations." — Matthew 28:19
// 200 tabs · 1 database · 1 API (Single.gs) · 46+ frontend files
//
// Usage:
//   Blueprint.phases                 → array of 10 phases with steps
//   Blueprint.checklist              → pre-flight checklist items
//   Blueprint.sheets                 → unified sheet (1 sheet, 4 domains, 200 tabs)
//   Blueprint.testMatrix             → 21 end-to-end test cases
//   Blueprint.rbac                   → role hierarchy & permissions
//   Blueprint.urlMap                 → route → { page, auth, api, actions }
//   Blueprint.navigation             → top-level nav groups
//   Blueprint.features               → P1–P21, A1–A7, F1–F20 inventory
//   Blueprint.troubleshoot(id)       → troubleshooting entry by id (e.g. '10.3')
//   Blueprint.appendix.scriptProperties  → per-API script property tables
//   Blueprint.appendix.appConfig         → 32 AppConfig default keys
//   Blueprint.appendix.gsFiles           → .gs file manifest per API
//   Blueprint.appendix.frontendFiles     → frontend file manifest

const Blueprint = (() => {

  // ─────────────────────────────────────────────────────────────────────────
  //  PHASE 1 — PRE-FLIGHT
  // ─────────────────────────────────────────────────────────────────────────

  const checklist = [
    'Google Account with Google Workspace or personal Gmail',
    '1 Google Sheet (FlockOS — 200 tabs across 4 domains)',
    'Ability to create a Google Apps Script project (script.google.com)',
    'GitHub account for GitHub Pages hosting',
    'Git installed locally',
    'A text editor (VS Code recommended)',
    'The entire /backend/expansion/ folder from the workspace',
    'The /scripts/ folder from the workspace',
    'The /pages/ folder from the workspace',
  ];

  const sheets = [
    { name: 'FlockOS',  api: 'UNIFIED', gospel: 'All', gasProject: 'FlockOS API', tabs: 200,
      note: 'Single Google Sheet with 200 tabs. Single GAS project with Single.gs (~25,000 lines). Domains: FLOCK (79), EXTRA (53), APP (12), MISSIONS (56).' },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  //  PHASE 2—5 DEPLOYMENT STEPS (per API)
  // ─────────────────────────────────────────────────────────────────────────

  const phases = [

    // ── PHASE 1 ──────────────────────────────────────────────────────────
    {
      id: 1,
      title: 'PRE-FLIGHT',
      quote: null,
      sections: [
        {
          id: '1.1',
          title: 'What You Need Before Starting',
          steps: checklist.map(item => ({ action: item })),
        },
        {
          id: '1.2',
          title: 'Architecture Overview',
          summary: '1 GAS Web App (Single.gs — 200 tabs across 4 domains: FLOCK 79, EXTRA 53, APP 12, MISSIONS 56) = 200 tabs, ~4,214 columns. All API calls route through the_true_vine.js on the GitHub Pages static frontend via a single DATABASE_URL.',
        },
        {
          id: '1.3',
          title: 'File Inventory',
          flockGsFiles: [
            'All backend code is unified in Database/Single.gs (~25,000 lines)',
            'Single.gs contains: Auth, Setup (setupFlockOS()), API routing, Database helpers, Utilities,',
            'SaltPepperHash, Todo, Communications, Compassion, Discipleship, Learning,',
            'MemberCards, Ministries, Outreach, Photos, Sermons, ServicePlanning,',
            'SpiritualCare, Statistics, Theology, WorldMissions, and Expansions',
          ],
          extraGsFiles: ['(unified in Single.gs — EXTRA domain)'],
          appGsFiles:   ['(unified in Single.gs — APP domain)'],
          missionsGsFiles: ['(unified in Single.gs — MISSIONS domain)'],
        },
      ],
    },

    // ── PHASE 2 — FLOCK API (John) ────────────────────────────────────────
    {
      id: 2,
      title: 'BACKEND: UNIFIED API (Single.gs)',
      quote: '"Feed my sheep." — John 21:17',
      sections: [
        {
          id: '2.1',
          title: 'Create Google Sheet',
          steps: [
            { action: 'Go to sheets.google.com' },
            { action: 'Create a new blank spreadsheet' },
            { action: 'Name it: "FlockOS"' },
            { action: 'Copy the SHEET_ID from the URL: https://docs.google.com/spreadsheets/d/SHEET_ID/edit' },
            { action: 'Save this ID — you will need it in Step 2.4' },
          ],
        },
        {
          id: '2.2',
          title: 'Create Google Apps Script Project',
          steps: [
            { action: 'Go to script.google.com' },
            { action: 'Click "New project"' },
            { action: 'Name it: "FlockOS API"' },
            { action: 'Delete the default Code.gs content (you\'ll replace it with Single.gs)' },
          ],
        },
        {
          id: '2.3',
          title: 'Paste Single.gs',
          note: 'In the GAS Script Editor: Replace Code.gs contents with the entire Database/Single.gs file (~25,000 lines).',
          codeFile: 'Code.gs (replaced by Single.gs)',
          codeContents: '// Paste the entire contents of Database/Single.gs here\n// This single file contains all domains: FLOCK, EXTRA, APP, MISSIONS',
          fileOrder: [
            { num: 1,  gasName: 'Code',           source: '(entry point wrapper — see 2.3a)' },
            { num: 2,  gasName: 'Auth',            source: 'backend/expansion/auth.gs' },
            { num: 3,  gasName: 'Setup',           source: 'backend/expansion/setup.gs' },
            { num: 4,  gasName: 'Api',             source: 'backend/expansion/api.gs' },
            { num: 5,  gasName: 'Database',        source: 'backend/expansion/database.gs' },
            { num: 6,  gasName: 'Utilities',       source: 'backend/expansion/utilities.gs' },
            { num: 7,  gasName: 'SaltPepperHash',  source: 'backend/expansion/3-FlockOS-SaltPepperHash.gs' },
            { num: 8,  gasName: 'Todo',            source: 'backend/expansion/todo.gs' },
            { num: 9,  gasName: 'Communications',  source: 'backend/expansion/communications.gs' },
            { num: 10, gasName: 'Compassion',      source: 'backend/expansion/compassion.gs' },
            { num: 11, gasName: 'Discipleship',    source: 'backend/expansion/discipleship.gs' },
            { num: 12, gasName: 'Learning',        source: 'backend/expansion/learning.gs' },
            { num: 13, gasName: 'MemberCards',     source: 'backend/expansion/member-cards.gs' },
            { num: 14, gasName: 'Ministries',      source: 'backend/expansion/ministries.gs' },
            { num: 15, gasName: 'Outreach',        source: 'backend/expansion/outreach.gs' },
            { num: 16, gasName: 'Sermons',         source: 'backend/expansion/sermons.gs' },
            { num: 18, gasName: 'ServicePlanning', source: 'backend/expansion/service-planning.gs' },
            { num: 19, gasName: 'SpiritualCare',   source: 'backend/expansion/spiritual-care.gs' },
            { num: 20, gasName: 'Statistics',      source: 'backend/expansion/statistics.gs' },
            { num: 21, gasName: 'Theology',        source: 'backend/expansion/theology.gs' },
            { num: 22, gasName: 'WorldMissions',   source: 'backend/expansion/world-missions.gs' },
          ],
        },
        {
          id: '2.4',
          title: 'Set Script Properties (EXACT VALUES)',
          instructions: 'In the GAS Script Editor: Click ⚙ Project Settings → scroll to "Script Properties" → "Add script property"',
          properties: [
            { key: 'SHEET_ID', value: '(paste your Sheet ID from Step 2.1)', setBy: 'Manual' },
          ],
          note: 'That\'s the ONLY manual property. FLOCK_AUTH_PEPPER is auto-generated in Step 2.6. Do NOT manually set exp.session.* — auto-created at login.',
        },
        {
          id: '2.5',
          title: 'Run setupFlockOS()',
          steps: [
            { action: 'In the function dropdown, select "setupFlockOS"' },
            { action: 'Click ▶ Run' },
            { action: 'On first run: Click "Review Permissions" → your account → "Advanced" → "Go to FlockOS API (unsafe)" → "Allow"' },
            { action: 'Wait 30–90 seconds for execution to complete' },
            { action: 'Check Logger (View → Logs) — expect 200 "✅ Tab ... created" lines' },
            { action: 'Open the Google Sheet and verify 200 tabs are visible' },
            { action: 'Check AppConfig tab has 32 pre-populated rows' },
          ],
          tabsCreated: {
            core: ['Members', 'PrayerRequests', 'ContactLog', 'PastoralNotes', 'Milestones', 'Households', 'ToDo'],
            auth: ['AuthUsers', 'UserProfiles', 'AccessControl', 'AuthAudit', 'AuditLog', 'AppConfig'],
            modules: [
              'Attendance', 'Events', 'EventRSVPs', 'SmallGroups', 'SmallGroupMembers',
              'Giving', 'GivingPledges', 'VolunteerSchedule',
              'Communications', 'CommsMessages', 'CommsThreads', 'CommsNotifications',
              'CommsNotifPrefs', 'CommsChannels', 'CommsTemplates', 'CommsReadReceipts',
              'CommsBroadcastLog', 'CheckInSessions', 'Ministries', 'MinistryMembers',
              'ServicePlans', 'ServicePlanItems',
              'SpiritualCareCases', 'SpiritualCareInteractions', 'SpiritualCareAssignments',
              'OutreachContacts', 'OutreachCampaigns', 'OutreachFollowUps',
              'Photos', 'PhotoAlbums', 'Sermons', 'SermonSeries', 'SermonReviews',
              'CompassionRequests', 'CompassionResources', 'CompassionLog',
              'DiscipleshipPaths', 'DiscipleshipSteps', 'DiscipleshipEnrollments',
              'DiscipleshipMentoring', 'DiscipleshipMeetings', 'DiscipleshipAssessments',
              'DiscipleshipResources', 'DiscipleshipMilestones', 'DiscipleshipGoals',
              'DiscipleshipCertificates', 'LearningTopics', 'LearningPlaylists',
              'LearningPlaylistItems', 'LearningProgress', 'LearningNotes',
              'LearningBookmarks', 'LearningRecommendations', 'LearningQuizzes',
              'LearningQuizResults', 'LearningCertificates',
              'MissionsRegistry', 'MissionsRegions', 'MissionsCities', 'MissionsPartners',
              'MissionsPrayerFocus', 'MissionsUpdates', 'MissionsTeams', 'MissionsMetrics',
              'TheologyCategories', 'TheologySections', 'TheologyScriptures', 'TheologyRevisions',
              'MemberCards', 'MemberCardLinks', 'MemberCardViews',
              'Songs', 'SongArrangements', 'SetlistSongs',
            ],
            total: 79,
          },
        },
        {
          id: '2.6',
          title: 'Run initPepper()',
          steps: [
            { action: 'Select "SaltPepperHash" file → "initPepper" function → ▶ Run' },
            { action: 'Check Logger: expect "Pepper created and stored in Script Properties (64 chars)."' },
            { action: 'Verify ⚙ Project Settings → Script Properties now shows TWO properties: SHEET_ID and FLOCK_AUTH_PEPPER' },
          ],
          warning: 'CRITICAL: Do NOT share, copy, or screenshot the pepper value. If lost, ALL passwords must be reset — there is no recovery. Back it up to an offline password manager.',
          afterProperties: [
            { key: 'SHEET_ID',          value: '1aBcDeFg...  (your sheet ID)',         setBy: 'Manual' },
            { key: 'FLOCK_AUTH_PEPPER', value: 'a7f3b2c1...  (64-char hex, auto-gen)', setBy: 'Auto'   },
          ],
        },
        {
          id: '2.7',
          title: 'Seed First Admin User',
          authUsersRow: {
            A: 'admin@yourchurch.org  (your actual email)',
            B: 'YourChosenPasscode  (temporary — will be hashed)',
            C: '(leave blank — auto-filled on first login)',
            D: '(leave blank — salt auto-generated)',
            E: 'Admin',
            F: 'Setup',
            G: 'admin',
            H: 'active',
            I: '2026-03-19T00:00:00.000Z',
            J: '2026-03-19T00:00:00.000Z',
          },
          accessControlRow: {
            A: 'admin@yourchurch.org',
            B: 'admin',
            C: 'Admin Setup',
            D: 'Deployment',
            E: 'approved',
            F: '(leave blank)',
            G: '2026-03-19T00:00:00.000Z',
            H: '2026-03-19T00:00:00.000Z',
          },
          thenRun: 'migrateAllPasswords() — Select "SaltPepperHash" → "migrateAllPasswords" → ▶ Run. Expect: "Migrated (plain→hash): admin@yourchurch.org"',
          verify: 'Go to AuthUsers: Col B should be BLANK, Col C = 64-char hex hash, Col D = 32-char hex salt.',
        },
        {
          id: '2.8',
          title: 'Deploy as Web App',
          steps: [
            { action: 'GAS Script Editor → "Deploy" → "New deployment"' },
            { action: 'Click the gear icon → choose "Web app"' },
            { action: 'Description: "Flock CRM API v1.0"; Execute as: Me; Who has access: Anyone' },
            { action: 'Click "Deploy" → "Authorize access" → follow prompts' },
            { action: 'COPY the deployment URL: https://script.google.com/macros/s/AKfycbx.../exec — this is your DATABASE_URL' },
          ],
          note: '"Execute as: Me" = runs with your Google account permissions. "Who has access: Anyone" = required for GitHub Pages cross-origin calls.',
        },
        {
          id: '2.9',
          title: 'Test Health Endpoint',
          url: 'https://script.google.com/macros/s/AKfycbx.../exec?action=health',
          expectedResponse: { ok: true, message: 'FlockOS Church CRM is running.', version: '1.0.0', modules: '{ ... }' },
        },
      ],
    },

    // ── PHASE 3 — EXTRA API (Luke) ────────────────────────────────────────
    {
      id: 3,
      title: 'BACKEND: EXTRA API (Luke)',
      quote: '"…an orderly account…" — Luke 1:3',
      sections: [
        {
          id: '3.1',
          title: 'Create Google Sheet',
          steps: [
            { action: 'Create new Google Sheet, name it: "Flock Statistics"' },
            { action: 'Copy the SHEET_ID from the URL' },
          ],
        },
        {
          id: '3.2',
          title: 'Create GAS Project',
          steps: [
            { action: 'Go to script.google.com → New project' },
            { action: 'Name it: "Flock Statistics API"' },
          ],
        },
        {
          id: '3.3',
          title: 'Add Files & Set Properties',
          files: ['Code.gs (entry point)', 'Setup.gs (paste from expansion/ExtraAPI-setup.gs)'],
          codeContents: `function doGet(e) {
  var action = (e && e.parameter) ? e.parameter.action : '';
  if (action === 'health') {
    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      message: 'Flock Statistics API (EXTRA/Luke) is running.',
      tabs: { statistics: 3, futureSlots: 50, total: 53 }
    })).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({
    ok: false, error: 'Unknown action: ' + action
  })).setMimeType(ContentService.MimeType.JSON);
}`,
          properties: [
            { key: 'SHEET_ID', value: '(your "Flock Statistics" sheet ID)', setBy: 'Manual' },
          ],
        },
        {
          id: '3.4',
          title: 'Run setupExtraApi()',
          steps: [
            { action: 'Select "Setup" file → "setupExtraApi" function → ▶ Run' },
            { action: 'Authorize when prompted' },
            { action: 'Creates 53 tabs: StatisticsConfig (18 cols), StatisticsSnapshots (58 cols), StatisticsCustomViews (14 cols), Extra_01–Extra_50 (50 cols each)' },
          ],
        },
        {
          id: '3.5',
          title: 'Deploy & Test',
          steps: [
            { action: 'Deploy → New deployment → Web app: Execute as Me, Who has access Anyone' },
            { action: 'Copy deployment URL → this is your DATABASE_URL (Extra domain included in unified API)' },
            { action: 'Test: https://script.google.com/macros/s/.../exec?action=health' },
          ],
        },
      ],
    },

    // ── PHASE 4 — APP API (Matthew) ───────────────────────────────────────
    {
      id: 4,
      title: 'BACKEND: APP API (Matthew)',
      quote: '"…the book of the genealogy…" — Matthew 1:1',
      sections: [
        {
          id: '4.1',
          title: 'Create Google Sheet',
          steps: [
            { action: 'Create new Google Sheet, name it: "Flock Content"' },
            { action: 'Copy the SHEET_ID' },
          ],
        },
        {
          id: '4.2',
          title: 'Create GAS Project',
          steps: [{ action: 'New GAS project, name it: "Flock Content API"' }],
        },
        {
          id: '4.3',
          title: 'Add Files & Run Setup',
          files: [
            'Truth.gs — FlockOS/Truth.gs — contains setupAppApi(), ensureTab(), addDropdowns()',
            'Code.gs — doGet(e) entry point, health endpoint, tab reader (no auth, public content)',
          ],
          setupFn: 'setupAppApi()',
          tabsCreated: [
            { name: 'Books',       columns: 7  },
            { name: 'Genealogy',   columns: 8  },
            { name: 'Counseling',  columns: 7  },
            { name: 'Devotionals', columns: 7  },
            { name: 'Reading',     columns: 4  },
            { name: 'Words',       columns: 10 },
            { name: 'Heart',       columns: 6  },
            { name: 'Mirror',      columns: 9  },
            { name: 'Theology',    columns: 6  },
            { name: 'Config',      columns: 2  },
            { name: 'Quiz',        columns: 10 },
            { name: 'Apologetics', columns: 11 },
          ],
          totalColumns: 82,
          failover: 'Failover-compatible: configure DATABASE_URL in the-vine.js pointing to the unified deployment.',
          properties: [
            { key: 'SHEET_ID', value: '(your "Flock Content" sheet ID)', setBy: 'Manual' },
          ],
        },
        {
          id: '4.4',
          title: 'Deploy & Test',
          steps: [
            { action: 'Deploy → New deployment → Web app: Execute as Me, Who has access Anyone' },
            { action: 'Copy URL → this is your DATABASE_URL (App domain included in unified API)' },
            { action: 'Test: https://script.google.com/macros/s/.../exec?action=health' },
          ],
          note: 'For failover, deploy same project multiple times or create duplicate GAS projects pointing to same sheet.',
        },
      ],
    },

    // ── PHASE 5 — MISSIONS API (Mark) ────────────────────────────────────
    {
      id: 5,
      title: 'BACKEND: MISSIONS API (Mark)',
      quote: '"Go into all the world…" — Mark 16:15',
      sections: [
        {
          id: '5.1',
          title: 'Create Google Sheet',
          steps: [
            { action: 'Create new Google Sheet, name it: "Flock Missions"' },
            { action: 'Copy the SHEET_ID' },
          ],
        },
        {
          id: '5.2',
          title: 'Create GAS Project',
          steps: [{ action: 'New GAS project, name it: "Flock Missions API"' }],
        },
        {
          id: '5.3',
          title: 'Add Files & Run Setup',
          files: [
            'Gospel.gs — FlockOS/Gospel.gs — contains setupMissionsApi(), ensureTab(), addDropdowns()',
            'Code.gs — doGet(e) entry point, health endpoint, RBAC routing',
          ],
          setupFn: 'setupMissionsApi()',
          tabsCreated: {
            structured: [
              { name: 'MissionsRegistry',   columns: 28 },
              { name: 'MissionsRegions',    columns: 24 },
              { name: 'MissionsCities',     columns: 30 },
              { name: 'MissionsPartners',   columns: 20 },
              { name: 'MissionsPrayerFocus',columns: 16 },
              { name: 'MissionsUpdates',    columns: 16 },
              { name: 'MissionsTeams',      columns: 20 },
              { name: 'MissionsMetrics',    columns: 20 },
            ],
            countryDossiers: 48,
            dossierColumns: 6,
            total: 56,
          },
          totalColumns: 462,
          properties: [
            { key: 'SHEET_ID', value: '(your "Flock Missions" sheet ID)', setBy: 'Manual' },
          ],
        },
        {
          id: '5.4',
          title: 'Deploy & Test',
          steps: [
            { action: 'Deploy → New deployment → Web app: Execute as Me, Who has access Anyone' },
            { action: 'Copy URL → this is your DATABASE_URL (Missions domain included in unified API)' },
            { action: 'Test: https://script.google.com/macros/s/.../exec?action=health' },
          ],
        },
      ],
    },

    // ── PHASE 6 — FRONTEND: STATIC SITE ──────────────────────────────────
    {
      id: 6,
      title: 'FRONTEND: STATIC SITE',
      sections: [
        {
          id: '6.1',
          title: 'Repository Setup',
          steps: [
            { action: 'Create a GitHub repository (e.g. "flock-os" or your church name)' },
            { action: 'Clone it locally: git clone https://github.com/yourorg/flock-os.git && cd flock-os' },
            { action: 'Add .nojekyll to root (disables Jekyll): touch .nojekyll' },
            { action: '(Optional) Add CNAME for custom domain: echo "church.yourchurch.org" > CNAME' },
          ],
        },
        {
          id: '6.2',
          title: 'Configure the_true_vine.js (DATABASE_URL)',
          instructions: 'Set your single deployment URL from Phase 2 via the Settings Provisioning panel or TheVine.configure().',
          configBlock: `// Set DATABASE_URL to your single deployment URL from Phase 2:
TheVine.configure({
  DATABASE_URL: 'https://script.google.com/macros/s/AKfycbx.../exec',
});`,
          alternative: 'Or set DATABASE_URL in the Settings Provisioning panel at runtime.',
        },
        {
          id: '6.3',
          title: 'Site Folder Structure',
          structure: {
            root: [
              'index.html — Landing / router page',
              '.nojekyll — Disable Jekyll processing',
              'CNAME — Custom domain (optional)',
            ],
            css: [
              'fine_linen.css — 8-theme design system',
              'global.css — variables, reset, typography',
              'components.css — cards, modals, tables',
            ],
            scripts: [
              'the-vine.js — ALL API calls (1,155 lines)',
              'config.js — Static configuration',
              'Main.js — App controller & page router',
              'Scripts.js — Script manifest & dynamic loader',
              'Secure.js — Auth UI (login/logout)',
              'Settings.js — Theme & profile settings',
              'AdminProvision.js', 'MemberPortal.js', 'Pastoral.js',
              'PrayerService.js', 'PublicPrayer.js', 'Todo.js',
              'Contact.js', 'Explorer.js', 'Characters.js',
              'Bread.js', 'Words.js', 'Heart.js', 'Mirror.js',
              'Counseling.js', 'Theology.js', 'BibleQuiz.js',
              'Apologetics.js', 'Missions.js', 'Focus.js',
              'Worship.js', 'Psalms.js', 'Family.js',
              'Invitation.js', 'Disclaimer.js', 'Statistics.js',
              'Analysis.js', 'Posture.js', 'Outreach.js', 'tbc_care.js',
            ],
            pages: {
              public: [
                'books.html — P1 Books Explorer',
                'characters.html — P2 Character Genealogy',
                'counseling.html — P3 Counseling Wisdom',
                'bread.html — P4 Daily Devotional',
                'lexicon.html — P5 Biblical Lexicon',
                'heart.html — P6 Heart Diagnostic',
                'mirror.html — P7 Shepherd\'s Mirror',
                'theology.html — P8 Theology',
                'quiz.html — P9 Bible Quiz',
                'apologetics.html — P10 Apologetics',
                'missions.html — P11 Missions Directory',
                'focus.html — P12 Daily Focus Country',
                'prayer-request.html — P13 Prayer Request Form',
                'worship.html — P14 Worship Study',
                'psalms.html — P15 Psalms Meditation',
                'family.html — P16 Family Ministry',
                'invitation.html — P17 Church Invitation',
                'about.html — P18 Disclaimer/Mission',
                'analytics.html — P19 Church Analytics',
                'statistics.html — P20 Live Statistics',
                'card.html — P21 Public Member Card',
              ],
              portal: [
                'dashboard.html — A1 Member Portal (auth)',
                'directory.html — A2 Member Directory (auth)',
                'prayer.html — A4 Prayer Management (auth)',
                'tasks.html — A5 Task Manager (auth)',
                'settings.html — A6 Settings (auth)',
              ],
              pastoral: [
                'members.html — A3 Pastoral Dashboard (leader+)',
                'notes.html — Pastoral Notes (pastor+)',
              ],
              admin: [
                'users.html — A7 Admin Provisioning (admin)',
                'config.html — App Configuration (admin)',
                'audit.html — Audit Log (admin)',
              ],
            },
          },
        },
        {
          id: '6.4',
          title: 'CSS / Fine Linen Theme System',
          themes: {
            light: ['Dayspring', 'Meadow', 'Lavender', 'Rosewood'],
            dark:  ['Vesper', 'Evergreen', 'Twilight', 'Obsidian'],
            auto:  'Uses OS preference (prefers-color-scheme)',
          },
          steps: [
            { action: 'Copy 6-FlockOS-AdornmentCSS.txt → css/fine_linen.css' },
            { action: 'Add to every HTML page <head>: <link rel="stylesheet" href="/css/fine_linen.css">' },
          ],
          note: 'Theme switching is handled by Settings.js which writes a data-theme attribute on <html>.',
        },
        {
          id: '6.5',
          title: 'Script Loading Chain',
          order: [
            '1. Google Analytics (async, non-blocking)',
            '2. Inline GTM config',
            '3. Dynamic loader injects Scripts.js with cache-bust tokens',
            '4. Scripts.js defines AOS1P_HEAD_SCRIPTS manifest: CDN (lucide.js, tailwindcss, chart.js) → Core (config.js, Main.js) → Modules (30+ feature .js files)',
            '5. Scripts.js dynamically loads each script in order',
            '6. FOOTER: Invitation.js loads after main content',
          ],
          important: 'the-vine.js is loaded by Main.js or config.js, NOT directly in the manifest. Verify it is included in your load chain.',
        },
        {
          id: '6.6',
          title: 'Build Pages',
          current: 'Single-page SPA: aos1p.html → Scripts.js → Main.js (router) → Feature .js modules',
          recommended: 'Multi-page for GitHub Pages: each page loads its own minimal script set (the-vine.js + the page\'s specific .js module).',
          authTemplate: `<!-- Every authenticated page needs: -->
<script src="/scripts/the-vine.js"></script>
<script>
  TheVine.configure({ DATABASE_URL: '...' });
  TheVine.lifecycle.start();
</script>`,
        },
        {
          id: '6.7',
          title: 'Deploy to GitHub Pages',
          steps: [
            { action: 'git add -A && git commit -m "FlockOS — initial deployment" && git push origin main' },
            { action: 'GitHub → Repository Settings → Pages → Source: "Deploy from a branch" → Branch: main / (root) → Save' },
            { action: 'Wait 1–5 minutes for deployment to propagate' },
            { action: 'Your site is live at: https://yourorg.github.io/flock-os/' },
          ],
        },
      ],
    },

    // ── PHASE 7 — DATA MIGRATION ──────────────────────────────────────────
    {
      id: 7,
      title: 'DATA MIGRATION',
      sections: [
        {
          id: '7.1',
          title: 'Migrate from pastoral-server-v2',
          superseded: {
            'DeployedAuth.gs': 'replaced by expansion/auth.gs',
            'Pastoral.gs':     'replaced by expansion/database.gs',
            'code.gs':         'replaced by expansion entry points',
            'contacts.gs':     'replaced by expansion/database.gs',
            'members.gs':      'replaced by expansion/database.gs',
            'prayer.gs':       'replaced by expansion/database.gs',
            'setup.gs':        'replaced by expansion/setup.gs',
            'todo.gs':         'replaced by expansion/todo.gs',
          },
          steps: [
            { action: 'Open your OLD pastoral Google Sheet' },
            { action: 'For each tab with data (Members, PrayerRequests, ContactLog, PastoralNotes, Milestones, ToDo): select all data rows (NOT the header), Copy' },
            { action: 'Open the NEW "Flock CRM" Google Sheet' },
            { action: 'Go to the corresponding tab, Paste into row 2 (below the header)' },
          ],
          note: 'If the old sheet had fewer columns, new columns will just be blank — that\'s fine. New ToDo tab has 19 columns (was 15). Old data fills A-O; new cols J-M (Entity Type/ID, Recurring, Recurrence Rule) will be blank.',
        },
        {
          id: '7.2',
          title: 'Migrate from todo-server',
          steps: [
            { action: 'Copy data rows from old todo sheet to new ToDo tab in FLOCK sheet' },
            { action: 'Old 13-column format maps to columns A-M of new 19-column layout with some reordering — check column headers' },
          ],
        },
        {
          id: '7.3',
          title: 'Migrate Passwords (Salt-Pepper-Hash)',
          steps: [
            { action: 'Ensure initPepper() has already run (Step 2.6)' },
            { action: 'Select "SaltPepperHash" file → "migrateAllPasswords" function → ▶ Run' },
            { action: 'Check Logger output — expect per-user migration report + "Migration complete: N migrated, 0 skipped, 0 errors."' },
          ],
          whatItDoes: [
            'Plain-text password in col B → hashed with salt+pepper → col C+D, col B cleared',
            'Existing hash in col C but no salt in col D → salt generated → col D populated',
            'Already has hash + salt → skipped (already secure)',
          ],
          note: 'Users can keep logging in with their same password — the legacy fallback in verifyPasscode() handles all old hash formats.',
        },
      ],
    },

    // ── PHASE 8 — POST-DEPLOYMENT VERIFICATION ────────────────────────────
    {
      id: 8,
      title: 'POST-DEPLOYMENT VERIFICATION',
      sections: [
        {
          id: '8.1',
          title: 'Health Check API',
          instructions: 'Open the URL in a browser with ?action=health. It should return { "ok": true, ... }',
          apis: ['UNIFIED'],
        },
        {
          id: '8.2',
          title: 'End-to-End Test Matrix',
          tests: [
            { num: 1,  test: 'Health check',            api: 'FLOCK',  expected: '{ ok: true }' },
            { num: 2,  test: 'Login (admin)',            api: 'FLOCK',  expected: '{ token, profile }' },
            { num: 3,  test: 'List members',             api: 'FLOCK',  expected: '{ rows: [...] }' },
            { num: 4,  test: 'Create prayer request',    api: 'FLOCK',  expected: '{ row: {...} }' },
            { num: 5,  test: 'Create todo (linked)',     api: 'FLOCK',  expected: '{ row: {...} }' },
            { num: 6,  test: 'My tasks',                 api: 'FLOCK',  expected: '{ rows: [...] }' },
            { num: 7,  test: 'Todo for entity',          api: 'FLOCK',  expected: '{ rows: [...] }' },
            { num: 8,  test: 'Complete recurring todo',  api: 'FLOCK',  expected: '{ row, nextOcc }' },
            { num: 9,  test: 'Todo dashboard',           api: 'FLOCK',  expected: '{ total, byStatus }' },
            { num: 10, test: 'Public book list',         api: 'APP',    expected: '[ ...books ]' },
            { num: 11, test: 'Statistics dashboard',     api: 'EXTRA',  expected: '{ ok: true }' },
            { num: 12, test: 'Missions registry',        api: 'FLOCK',  expected: '{ rows: [...] }' },
            { num: 13, test: 'Theme preference save',    api: 'FLOCK',  expected: '{ ok: true }' },
            { num: 14, test: 'Session logout',           api: 'FLOCK',  expected: '{ ok: true }' },
            { num: 15, test: 'Self-register (public)',   api: 'FLOCK',  expected: '{ ok, message }' },
            { num: 16, test: 'Forgot password',          api: 'FLOCK',  expected: '{ ok, message }' },
            { num: 17, test: 'Reset with code',          api: 'FLOCK',  expected: '{ ok, message }' },
            { num: 18, test: 'List pending users',       api: 'FLOCK',  expected: '{ rows: [...] }' },
            { num: 19, test: 'Approve pending user',     api: 'FLOCK',  expected: '{ ok, message }' },
            { num: 20, test: 'Deny pending user',        api: 'FLOCK',  expected: '{ ok, message }' },
            { num: 21, test: 'Change own passcode',      api: 'FLOCK',  expected: '{ ok, message }' },
          ],
          registrationWorkflow: [
            'Set AppConfig ALLOW_SELF_REGISTER = TRUE',
            'User calls auth.register → status="pending", AccessControl.Active="FALSE"',
            'Admin email notified (if ADMIN_EMAIL set in AppConfig)',
            'Pastor/admin calls users.pending → sees pending list',
            'Pastor/admin calls users.approve (with optional role override) → active',
            'User receives approval email, can now log in',
          ],
          forgotPasswordWorkflow: [
            'User calls auth.forgotPassword with email',
            '6-digit reset code emailed (1-hour TTL, stored in Script Properties)',
            'User calls auth.resetWithToken with email + resetCode + newPasscode',
            'Password updated via salt+pepper scheme, token consumed',
          ],
        },
        {
          id: '8.3',
          title: 'RBAC Verification',
          roles: [
            { role: '(none)',    can: 'Register, forgot password, reset with code' },
            { role: 'readonly', can: 'View own profile, submit prayer requests' },
            { role: 'volunteer',can: '+ Create/view own tasks, view non-confidential data' },
            { role: 'leader',   can: '+ View all tasks, view all members, manage groups' },
            { role: 'pastor',   can: '+ View pending users, approve/deny registrations' },
            { role: 'admin',    can: '+ User management, config, audit, bulk operations' },
          ],
        },
        {
          id: '8.4',
          title: 'Cross-API Data Flow Test',
          steps: [
            { action: 'Create a member in FLOCK → note the Member ID' },
            { action: 'Create a prayer request linked to that member → note the PR ID' },
            { action: 'Create a task: action=todo.create, title="Follow up on prayer", entityType=PrayerRequests, entityId=[PR ID]' },
            { action: 'Verify: action=todo.forEntity&entityType=PrayerRequests&entityId=[PR ID] → should return the task' },
          ],
        },
      ],
    },

    // ── PHASE 9 — LINK ARCHITECTURE & SITE MAP ───────────────────────────
    {
      id: 9,
      title: 'LINK ARCHITECTURE & SITE MAP',
      sections: [
        { id: '9.1', title: 'Complete URL Map', ref: 'See Blueprint.urlMap' },
        { id: '9.2', title: 'Page-to-API Mapping', ref: 'See Blueprint.urlMap[route].api and .actions' },
        { id: '9.3', title: 'Navigation Structure', ref: 'See Blueprint.navigation' },
        { id: '9.4', title: 'Feature Inventory (P1-P21, A1-A7, F1-F20)', ref: 'See Blueprint.features' },
      ],
    },

    // ── PHASE 10 — MASTER TROUBLESHOOTING ────────────────────────────────
    {
      id: 10,
      title: 'MASTER TROUBLESHOOTING GUIDE',
      sections: [{ ref: 'See Blueprint.troubleshoot(id) for all 18 entries' }],
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  //  TEST MATRIX (shortcut)
  // ─────────────────────────────────────────────────────────────────────────

  const testMatrix = phases[6].sections[1].tests; // Phase 8 section 8.2

  // ─────────────────────────────────────────────────────────────────────────
  //  RBAC HIERARCHY
  // ─────────────────────────────────────────────────────────────────────────

  const rbac = {
    levels: ['none', 'readonly', 'volunteer', 'leader', 'pastor', 'admin'],
    permissions: phases[6].sections[2].roles,
    actionMinRole: {
      'auth.login':           'none',
      'auth.register':        'none',
      'auth.forgotPassword':  'none',
      'auth.resetWithToken':  'none',
      'auth.logout':          'readonly',
      'prayer.publicSubmit':  'none',
      'memberCards.public':   'none',
      'todo.list':            'volunteer',
      'todo.create':          'volunteer',
      'todo.myTasks':         'volunteer',
      'todo.update':          'volunteer',
      'todo.complete':        'volunteer',
      'todo.forEntity':       'volunteer',
      'todo.overdue':         'volunteer',
      'todo.delete':          'leader',
      'todo.dashboard':       'leader',
      'members.list':         'leader',
      'notes.*':              'pastor',
      'users.pending':        'pastor',
      'users.approve':        'pastor',
      'users.deny':           'pastor',
      'config.*':             'admin',
      'users.*':              'admin',
    },
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  URL MAP — route → page/auth/api/actions
  // ─────────────────────────────────────────────────────────────────────────

  const urlMap = {
    '/':                    { page: 'index.html',                          auth: 'None',   api: '—',       actions: [] },
    '/books':               { page: 'pages/public/books.html',             auth: 'None',   api: 'APP',     actions: ['tab=Books'] },
    '/characters':          { page: 'pages/public/characters.html',        auth: 'None',   api: 'APP',     actions: ['tab=Genealogy'] },
    '/counseling':          { page: 'pages/public/counseling.html',        auth: 'None',   api: 'APP',     actions: ['tab=Counseling'] },
    '/bread':               { page: 'pages/public/bread.html',             auth: 'None',   api: 'APP',     actions: ['tab=Devotionals', 'tab=Reading', 'tab=Words'] },
    '/lexicon':             { page: 'pages/public/lexicon.html',           auth: 'None',   api: 'APP',     actions: ['tab=Words'] },
    '/heart':               { page: 'pages/public/heart.html',             auth: 'None',   api: 'APP',     actions: ['tab=Heart'] },
    '/mirror':              { page: 'pages/public/mirror.html',            auth: 'None',   api: 'APP',     actions: ['tab=Mirror'] },
    '/theology':            { page: 'pages/public/theology.html',          auth: 'None',   api: 'FLOCK',   actions: ['theology.categories.list', 'theology.sections.list', 'theology.full'] },
    '/quiz':                { page: 'pages/public/quiz.html',              auth: 'None',   api: 'APP',     actions: ['tab=Quiz'] },
    '/apologetics':         { page: 'pages/public/apologetics.html',       auth: 'None',   api: 'APP',     actions: ['tab=Apologetics'] },
    '/missions':            { page: 'pages/public/missions.html',          auth: 'None',   api: 'MISSIONS',actions: ['missions.registry.list'] },
    '/focus':               { page: 'pages/public/focus.html',             auth: 'None',   api: 'MISSIONS',actions: ['missions.prayerFocus.list'] },
    '/prayer-request':      { page: 'pages/public/prayer-request.html',    auth: 'None',   api: 'FLOCK',   actions: ['prayer.publicSubmit'] },
    '/worship':             { page: 'pages/public/worship.html',           auth: 'None',   api: '—',       actions: [] },
    '/psalms':              { page: 'pages/public/psalms.html',            auth: 'None',   api: '—',       actions: [] },
    '/family':              { page: 'pages/public/family.html',            auth: 'None',   api: '—',       actions: [] },
    '/invitation':          { page: 'pages/public/invitation.html',        auth: 'None',   api: '—',       actions: [] },
    '/about':               { page: 'pages/public/about.html',             auth: 'None',   api: '—',       actions: [] },
    '/analytics':           { page: 'pages/public/analytics.html',         auth: 'None',   api: '—',       actions: [] },
    '/statistics':          { page: 'pages/public/statistics.html',        auth: 'None',   api: '—',       actions: [] },
    '/card':                { page: 'pages/public/card.html',              auth: 'None',   api: 'FLOCK',   actions: ['memberCards.public'], note: 'Query: ?m=FlockOS-xxxx' },
    '/portal':              { page: 'pages/portal/dashboard.html',         auth: 'Auth',   api: 'FLOCK',   actions: ['members.search', 'prayer.list', 'todo.myTasks'] },
    '/directory':           { page: 'pages/portal/directory.html',         auth: 'Auth',   api: 'FLOCK',   actions: ['memberCards.directory'] },
    '/prayer/manage':       { page: 'pages/portal/prayer.html',            auth: 'Auth',   api: 'FLOCK',   actions: ['prayer.list', 'prayer.update'] },
    '/tasks':               { page: 'pages/portal/tasks.html',             auth: 'Auth',   api: 'FLOCK',   actions: ['todo.list', 'todo.create', 'todo.update', 'todo.complete', 'todo.forEntity', 'todo.myTasks', 'todo.overdue', 'todo.dashboard'] },
    '/settings':            { page: 'pages/portal/settings.html',          auth: 'Auth',   api: 'FLOCK',   actions: ['user.preferences.get', 'user.preferences.update'] },
    '/pastoral':            { page: 'pages/pastoral/members.html',         auth: 'Leader', api: 'FLOCK',   actions: ['members.list', 'notes.*'] },
    '/pastoral/notes':      { page: 'pages/pastoral/notes.html',           auth: 'Pastor', api: 'FLOCK',   actions: ['notes.*'] },
    '/admin':               { page: 'pages/admin/users.html',              auth: 'Admin',  api: 'FLOCK',   actions: ['users.*', 'auth.*', 'config.*'] },
    '/admin/config':        { page: 'pages/admin/config.html',             auth: 'Admin',  api: 'FLOCK',   actions: ['config.*'] },
    '/admin/audit':         { page: 'pages/admin/audit.html',              auth: 'Admin',  api: 'FLOCK',   actions: ['audit logs'] },
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  NAVIGATION STRUCTURE
  // ─────────────────────────────────────────────────────────────────────────

  const navigation = [
    {
      group: 'EXPLORE',
      auth: 'public',
      items: ['Books Explorer', 'Character Genealogy', 'Biblical Lexicon', 'Counseling Wisdom', 'Apologetics'],
    },
    {
      group: 'GROW',
      auth: 'public',
      items: ['Daily Devotional', 'Heart Diagnostic', 'Shepherd\'s Mirror', 'Bible Quiz', 'Theology'],
    },
    {
      group: 'WORSHIP',
      auth: 'public',
      items: ['Worship Study', 'Psalms Meditation', 'Family Ministry'],
    },
    {
      group: 'REACH',
      auth: 'public',
      items: ['Missions Directory', 'Daily Focus Country', 'Prayer Request', 'Church Invitation', 'Live Statistics'],
    },
    {
      group: 'MY PORTAL',
      auth: 'volunteer+',
      items: ['Dashboard', 'Prayer Management', 'My Tasks', 'Member Directory', 'Settings'],
    },
    {
      group: 'PASTORAL',
      auth: 'leader+',
      items: ['Member Dashboard', 'Pastoral Notes'],
    },
    {
      group: 'ADMIN',
      auth: 'admin',
      items: ['User Management', 'App Configuration', 'Audit Log'],
    },
    {
      group: 'MEMBER CARD',
      auth: 'public',
      note: '/card?m=FlockOS-xxxx → public, no auth',
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  //  FEATURE INVENTORY — P1–P21, A1–A7, F1–F20
  // ─────────────────────────────────────────────────────────────────────────

  const features = {
    public: [
      { id: 'P1',  name: 'Books Explorer',        api: 'APP',      action: 'tab=Books' },
      { id: 'P2',  name: 'Character Genealogy',    api: 'APP',      action: 'tab=Genealogy' },
      { id: 'P3',  name: 'Counseling Wisdom',      api: 'APP',      action: 'tab=Counseling' },
      { id: 'P4',  name: 'Daily Devotional',       api: 'APP',      action: 'tab=Devotionals, Reading, Words' },
      { id: 'P5',  name: 'Biblical Lexicon',       api: 'APP',      action: 'tab=Words' },
      { id: 'P6',  name: 'Heart Diagnostic',       api: 'APP',      action: 'tab=Heart' },
      { id: 'P7',  name: 'Shepherd\'s Mirror',     api: 'APP',      action: 'tab=Mirror' },
      { id: 'P8',  name: 'Theology',               api: 'FLOCK',    action: 'theology.*' },
      { id: 'P9',  name: 'Bible Quiz',             api: 'APP',      action: 'tab=Quiz' },
      { id: 'P10', name: 'Apologetics',            api: 'APP',      action: 'tab=Apologetics' },
      { id: 'P11', name: 'Missions Directory',     api: 'MISSIONS', action: 'missions.registry, countries' },
      { id: 'P12', name: 'Daily Focus Country',    api: 'MISSIONS', action: 'rotating country dossier' },
      { id: 'P13', name: 'Prayer Request Form',    api: 'FLOCK',    action: 'prayer.publicSubmit' },
      { id: 'P14', name: 'Worship Study',          api: '—',        action: 'hardcoded content' },
      { id: 'P15', name: 'Psalms Meditation',      api: '—',        action: 'hardcoded content' },
      { id: 'P16', name: 'Family Ministry',        api: '—',        action: 'hardcoded content' },
      { id: 'P17', name: 'Church Invitation',      api: '—',        action: 'hardcoded content' },
      { id: 'P18', name: 'Disclaimer/Mission',     api: '—',        action: 'hardcoded content' },
      { id: 'P19', name: 'Church Analytics',       api: '—',        action: 'hardcoded charts' },
      { id: 'P20', name: 'Live Statistics',        api: '—',        action: 'hardcoded counters' },
      { id: 'P21', name: 'Member Card (public)',   api: 'FLOCK',    action: 'memberCards.public' },
    ],
    authenticated: [
      { id: 'A1', name: 'Member Portal',        api: 'FLOCK', action: 'members, prayer, todo',                      minRole: 'volunteer' },
      { id: 'A2', name: 'Member Directory',     api: 'FLOCK', action: 'memberCards.directory',                      minRole: 'volunteer' },
      { id: 'A3', name: 'Pastoral Dashboard',   api: 'FLOCK', action: 'members.list',                               minRole: 'leader'    },
      { id: 'A4', name: 'Prayer Management',    api: 'FLOCK', action: 'prayer.*',                                   minRole: 'volunteer' },
      { id: 'A5', name: 'Task Manager',         api: 'FLOCK', action: 'todo.*',                                     minRole: 'volunteer' },
      { id: 'A6', name: 'Settings',             api: 'FLOCK', action: 'user.preferences',                           minRole: 'volunteer' },
      { id: 'A7', name: 'Admin Provisioning',   api: 'FLOCK', action: 'users.*, auth.*, config.*',                  minRole: 'admin'     },
    ],
    expansions: [
      { id: 'F1',  name: 'Attendance Tracking',   api: 'FLOCK', action: 'attendance.*' },
      { id: 'F2',  name: 'Events & RSVPs',        api: 'FLOCK', action: 'events.*' },
      { id: 'F3',  name: 'Small Groups',          api: 'FLOCK', action: 'groups.*' },
      { id: 'F4',  name: 'Giving / Finance',      api: 'FLOCK', action: 'giving.*' },
      { id: 'F5',  name: 'Volunteer Scheduling',  api: 'FLOCK', action: 'volunteers.*' },
      { id: 'F6',  name: 'Communications Hub',    api: 'FLOCK', action: 'comms.*' },
      { id: 'F7',  name: 'Check-In Sessions',     api: 'FLOCK', action: 'checkin.*' },
      { id: 'F8',  name: 'Ministry Teams',        api: 'FLOCK', action: 'ministries.*' },
      { id: 'F9',  name: 'Service Planning',      api: 'FLOCK', action: 'servicePlans.*' },
      { id: 'F10', name: 'Spiritual Care',        api: 'FLOCK', action: 'care.*' },
      { id: 'F11', name: 'Outreach',              api: 'FLOCK', action: 'outreach.*' },
      { id: 'F12', name: 'Sermons & Preaching',   api: 'FLOCK', action: 'sermons.*' },
      { id: 'F14', name: 'Compassion',            api: 'FLOCK', action: 'compassion.*' },
      { id: 'F15', name: 'Discipleship',          api: 'FLOCK', action: 'discipleship.*' },
      { id: 'F16', name: 'Learning Center',       api: 'FLOCK', action: 'learning.*' },
      { id: 'F17', name: 'Statistics Dashboard',  api: 'EXTRA', action: 'statistics.*' },
      { id: 'F18', name: 'Multi-Church',          api: 'FLOCK', action: 'church.*' },
      { id: 'F19', name: 'Bulk Import/Export',    api: 'FLOCK', action: 'bulk.*' },
      { id: 'F20', name: 'Music Stand Frontend',  api: 'FLOCK',
        action: 'FlockOS-Scripts/the_shofar.js',
        details: 'Song library, ChordPro rendering, Music Stand view, PDF export (jsPDF). Entry: window.openMusicStandApp(). CSS prefix: ms-. Actions: Songs & Music Stand (15) via FLOCK endpoint.'
      },
    ],
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  TROUBLESHOOTING GUIDE — 18 entries
  // ─────────────────────────────────────────────────────────────────────────

  const _troubleshootingEntries = [
    {
      id: '10.1',
      title: 'API Returns "Unknown action"',
      symptom: '{ "ok": false, "error": "Unknown action: todo.list" }',
      cause: 'The routing layer in api.gs doesn\'t recognize the action.',
      fix: [
        'Verify the action is spelled correctly (case-sensitive)',
        'Check api.gs — does it have an if (action === \'todo.list\') line?',
        'Check the integration block: action prefix must be listed (e.g. action.startsWith(\'todo.\'))',
        'Re-deploy the Web App after adding routes (Deploy → Manage → pencil icon)',
      ],
      tip: 'COMMON MISTAKE: Forgetting to re-deploy after code changes. Apps Script caches the DEPLOYED version — editing code alone doesn\'t update it.',
    },
    {
      id: '10.2',
      title: 'CORS / Cross-Origin Errors',
      symptom: 'Console shows "Access-Control-Allow-Origin" errors',
      cause: 'Google Apps Script deployment misconfiguration.',
      fix: [
        'Verify deployment is set to "Who has access: Anyone" (not "Anyone with Google account" or "Only myself")',
        'Verify deployment is set to "Execute as: Me"',
        'Calls must use the /exec URL, NOT /dev URL',
        'If using POST, the request body should be JSON stringified in e.postData.contents',
        'Try the URL directly in a browser — if it returns JSON, CORS is fine',
        'GitHub Pages uses HTTPS — your GAS URL is always HTTPS, so no issue there',
      ],
      tip: 'GAS Web Apps automatically handle CORS when deployed with "Anyone" access. You do NOT need to add CORS headers manually.',
    },
    {
      id: '10.3',
      title: '"Access denied" / 403',
      symptom: '{ "ok": false, "error": "Access denied." }',
      cause: 'The user\'s RBAC role is too low for the requested action.',
      fix: [
        'Check the user\'s role in AuthUsers tab (column G)',
        'Check the user\'s role in AccessControl tab (column B)',
        'Verify the action\'s required role: todo.list → volunteer+, todo.delete → leader+, todo.dashboard → leader+, members.list → leader+, config.* → admin',
        'New registration/approval routes: users.pending/approve/deny → pastor+',
        'If role is correct but still failing, check if session token has expired (default: 6 hours) — user needs to re-login',
        'Check AuthUsers.Status — must be "active" (not "inactive", "suspended", or "pending")',
      ],
    },
    {
      id: '10.4',
      title: 'Session Expired / Login Loop',
      symptom: 'User keeps getting redirected to login, or token is rejected.',
      cause: 'Session token expired or was cleared.',
      fix: [
        'Sessions last 6 hours (configurable in AppConfig: SESSION_TTL_HOURS)',
        'Sessions stored in GAS Script Properties with prefix "exp.session."',
        'Check browser sessionStorage: key "flock_auth_session" should contain a token; "flock_auth_profile" should contain user profile JSON',
        'If stuck: sessionStorage.removeItem(\'flock_auth_session\'); sessionStorage.removeItem(\'flock_auth_profile\'); then re-login',
        'To increase session TTL: edit AppConfig tab — Key=SESSION_TTL_HOURS, Value=12',
      ],
      tip: 'Script Properties have a 500KB limit. Old sessions are cleaned up on login, but high traffic can accumulate orphaned sessions. Run the session cleanup function in auth.gs manually if needed.',
    },
    {
      id: '10.5',
      title: 'setupFlockOS() Fails',
      symptom: 'Setup function errors out partway through.',
      causes: {
        'You do not have permission to call SpreadsheetApp': 'Not yet authorized. Re-run and click through authorization prompts.',
        'Spreadsheet not found': 'SHEET_ID in Script Properties is wrong or missing. Verify in ⚙ Project Settings → Script Properties.',
        'Exceeded maximum execution time': 'GAS has a 6-minute limit. 200 tabs may hit this. Solution: re-run — ensureTab() skips existing tabs safely.',
        'Service Spreadsheets failed while accessing document': 'The Google Sheet may be in a different Google account. Verify you\'re logged into the correct account in Script Editor.',
      },
    },
    {
      id: '10.6',
      title: 'Tabs Not Created / Missing Columns',
      symptom: 'Some tabs are missing, or have wrong columns after setup.',
      fix: [
        'ensureTab() only creates tabs that DON\'T already exist',
        'If a tab exists but has wrong columns, manually delete the tab first, then re-run setupFlockOS()',
        'Dropdowns are applied after tab creation — if tab existed before setup, dropdowns may be missing. Delete and re-create.',
        'Check Logger output for any "skipped" or "error" messages',
      ],
    },
    {
      id: '10.7',
      title: 'Password Hashing Issues',
      symptom: 'User can\'t log in after migration / password change.',
      fix: [
        'Check AuthUsers for the user\'s row: Col B (Passcode) should be BLANK; Col C (Hash) should be 64-char hex; Col D (Salt) should be 32-char hex',
        'If Col B still has plain text, migrateAllPasswords() didn\'t process it — re-run it',
        'If Col C has a hash but Col D is empty, legacy fallback should still work — but run migrateAllPasswords() to add a salt',
        'If nothing works, manually reset: run setSecurePassword(\'user@email.com\', \'newPassword123\') in GAS Script Editor',
        'Verify pepper exists: check Script Properties for FLOCK_AUTH_PEPPER',
      ],
    },
    {
      id: '10.8',
      title: 'Pepper Lost',
      symptom: 'FLOCK_AUTH_PEPPER was deleted from Script Properties.',
      impact: 'ALL existing password hashes are now unverifiable. Primary hash formula: SHA-256(pepper + salt + passcode). Without pepper, formula can\'t reproduce same hash.',
      recovery: [
        'If you have a backup → restore the pepper value in Script Properties',
        'If not → ALL users must reset passwords: 1. Run initPepper() (new pepper), 2. For each user: have them "forgot password" or manually run setSecurePassword()',
      ],
      prevention: 'After running initPepper(), write down the pepper value and store in a secure, offline location (password manager, printed in sealed envelope in a safe).',
      viewPepper: `function showPepper() {
  Logger.log(PropertiesService.getScriptProperties().getProperty('FLOCK_AUTH_PEPPER'));
}`,
    },
    {
      id: '10.9',
      title: 'Failover Not Working',
      symptom: 'API calls fail and no backup is available.',
      how: 'the_true_vine.js uses a single DATABASE_URL. If the endpoint is down, requests will fail.',
      fix: [
        'Verify your DATABASE_URL is correct and deployed',
        'GAS cold start can take 3–8 seconds — increase TIMEOUT_MS if needed: TheVine.configure({ TIMEOUT_MS: 15000 })',
        'Check that the Web App deployment is still active (not deleted or versioned out)',
      ],
    },
    {
      id: '10.10',
      title: 'Google Apps Script Quotas',
      symptom: 'Rate limits, timeouts, or quota errors.',
      limits: [
        { resource: 'Script runtime',               limit: '6 min',    impact: 'Long setup may timeout' },
        { resource: 'Triggers total runtime/day',   limit: '90 min',   impact: 'Scheduled tasks' },
        { resource: 'URL Fetch calls/day',          limit: '20,000',   impact: 'External API calls' },
        { resource: 'Script Properties total size', limit: '500 KB',   impact: 'Session storage limit' },
        { resource: 'Spreadsheet cells',            limit: '10M',      impact: '200 tabs × data rows' },
        { resource: 'Concurrent executions',        limit: '30',       impact: 'Busy church hours' },
        { resource: 'Content size (response)',      limit: '50 MB',    impact: 'Large data exports' },
      ],
      sessionWarning: 'Each login creates an "exp.session.*" entry in Script Properties. ~200 bytes per session → ~2,500 concurrent sessions max. Orphaned sessions cleaned up on login.',
    },
    {
      id: '10.11',
      title: 'GitHub Pages 404',
      symptom: 'Pages return 404 on GitHub Pages.',
      fix: [
        'Verify GitHub Pages is enabled: Repository → Settings → Pages',
        'Check branch and folder are correct (usually main / root)',
        'File names are case-sensitive on GitHub Pages: "Pages/Books.html" ≠ "pages/books.html"',
        'If using custom domain, verify CNAME file is in the root',
        'Add a 404.html for graceful error handling',
        'Add .nojekyll to root if you have folders/files starting with "_"',
        'After pushing, wait 1-5 minutes for deployment to propagate',
        'Check Actions tab in GitHub for deployment status/errors',
      ],
    },
    {
      id: '10.12',
      title: 'Stale Cache / Old Data',
      symptom: 'Frontend shows old data even after updating the spreadsheet.',
      cause: 'the-vine.js Root System has a caching layer with TTL.',
      ttls: { Members: '120 seconds', Prayer: '60 seconds', Tasks: '30 seconds' },
      fix: [
        'Wait for the TTL to expire, OR',
        'Force refresh: const g = TheVine.groves.pastoral(); g.refreshAll();',
        'Clear all cache: TheVine.cache.invalidate();',
      ],
    },
    {
      id: '10.13',
      title: 'Photos / Sermons Upload Fails',
      symptom: 'Upload fails or returns error.',
      fix: [
        'Check AppConfig: PHOTO_DRIVE_FOLDER_ID (blank = auto-creates), PHOTO_MAX_SIZE_MB (default 10, hard cap 25)',
        'Check AppConfig: SERMON_DRIVE_FOLDER_ID (blank = auto-creates), SERMON_MAX_SIZE_MB (default 50, hard cap 100)',
        'GAS account must have Google Drive access',
        'Files sent as base64 in POST body — very large files may exceed GAS 50MB response/POST body limit',
        'Check Google Drive storage quota',
      ],
    },
    {
      id: '10.14',
      title: 'Member Cards Not Loading',
      symptom: '/card?m=FlockOS-xxxx shows empty or error.',
      fix: [
        'Verify member number exists in MemberCards tab (column D)',
        'Member card must have Status = "active" (column L)',
        'memberCards.public requires NO auth — if returning "Access denied", check route doesn\'t have requireRole() call',
        'Member number format is case-sensitive: "FlockOS-0001" ≠ "flockos-0001"',
      ],
    },
    {
      id: '10.15',
      title: 'Statistics Dashboard Empty',
      symptom: 'Statistics page shows no data.',
      fix: [
        'Statistics require configuration in StatisticsConfig tab — each row defines one metric (source tab, column, calculation type)',
        'If StatisticsConfig is empty, no metrics are computed',
        'Snapshots are created by running statistics.compute action',
        'Statistics are handled by the unified API (EXTRA domain within Single.gs)',
        'Check that the DATABASE_URL is correct in the Settings Provisioning panel',
      ],
    },
    {
      id: '10.16',
      title: 'Self-Registration Not Working',
      symptom: 'auth.register returns error or user never becomes active.',
      fix: [
        'Check AppConfig: ALLOW_SELF_REGISTER must be "TRUE" (string, not boolean)',
        'After registration, user status is "pending" and AccessControl.Active is "FALSE" — they cannot log in yet',
        'A pastor+ or admin must call users.pending, then users.approve to activate the account',
        'If ADMIN_EMAIL is set, a notification email is sent via GmailApp (quota: 100/day free)',
        'After approval, user receives email notification and can log in',
        'If users.approve fails, check the approving user has role pastor+',
      ],
    },
    {
      id: '10.17',
      title: 'Password Reset Code Not Arriving',
      symptom: 'User calls auth.forgotPassword but never receives the email.',
      fix: [
        'Verify email address exists in AuthUsers (exact match, case-insensitive)',
        'Reset codes sent via GmailApp from GAS account owner\'s email. Check quota (100/day free).',
        'Code is a 6-digit number with 1-hour TTL, stored in Script Properties with prefix "exp.reset."',
        'After 1 hour the code expires — user must request a new one',
        'Each new forgotPassword call replaces the previous code',
        'After successful reset (auth.resetWithToken), token is consumed and password updated using salt+pepper scheme',
      ],
    },
    {
      id: '10.18',
      title: '"User Not Found" When Saving No-Email Member Profile',
      symptom: 'Admin adds a member without an email address, then opens their profile in the Shepherd directory and clicks Save All Changes. Error: "User not found."',
      fix: [
        'This was a frontend bug in the_shepherd.js saveAll() — now fixed.',
        'Members without email use a synthetic _mid_<memberId> key for frontend directory mapping.',
        'saveAll() step 1 (Account save) was sending the _mid_ key as targetEmail to users.update, which searched AuthUsers and found nothing.',
        'Fix: saveAll() now skips the Account save when the email is a _mid_ synthetic key — those members have no AuthUsers row.',
        'Member save (step 2) works correctly via UUID-based _openMemId lookup.',
        'If updating from an older version, replace the_shepherd.js with the latest Scripts copy.',
      ],
    },
  ];

  function troubleshoot(id) {
    return _troubleshootingEntries.find(e => e.id === String(id)) || null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  APPENDICES
  // ─────────────────────────────────────────────────────────────────────────

  const appendix = {

    // APPENDIX A — Script Properties per API
    scriptProperties: {
      UNIFIED: {
        manual:    [{ key: 'SHEET_ID',          value: 'Google Sheet ID string' }],
        automatic: [
          { key: 'FLOCK_AUTH_PEPPER', value: '64-char hex (via initPepper())' },
          { key: 'exp.session.*',     value: 'JSON session objects (one per logged-in user)' },
          { key: 'exp.reset.*',       value: '6-digit reset codes (1-hour TTL)' },
        ],
        note: 'Total manual: 1 (SHEET_ID). Total auto: 1 per login session + 1 pepper + reset codes. Single GAS project handles all domains.',
      },
    },

    // APPENDIX B — AppConfig Defaults (32 keys, seeded by setupFlockOS())
    appConfig: [
      // General
      { key: 'CHURCH_NAME',              default: '(blank)',            category: 'General'       },
      { key: 'CHURCH_TIMEZONE',          default: 'America/New_York',   category: 'General'       },
      { key: 'PHOTO_DRIVE_FOLDER_ID',    default: '(blank)',            category: 'General'       },
      { key: 'PHOTO_MAX_SIZE_MB',        default: '10',                 category: 'General'       },
      { key: 'SERMON_DRIVE_FOLDER_ID',   default: '(blank)',            category: 'General'       },
      { key: 'SERMON_MAX_SIZE_MB',       default: '50',                 category: 'General'       },
      // Auth
      { key: 'SESSION_TTL_HOURS',        default: '6',                  category: 'Auth'          },
      { key: 'MIN_PASSCODE_LENGTH',      default: '6',                  category: 'Auth'          },
      { key: 'ALLOW_SELF_REGISTER',      default: 'FALSE',              category: 'Auth'          },
      { key: 'ADMIN_EMAIL',              default: '(blank)',            category: 'Auth'          },
      // Modules
      { key: 'MODULE_ATTENDANCE',        default: 'TRUE',               category: 'Modules'       },
      { key: 'MODULE_EVENTS',            default: 'TRUE',               category: 'Modules'       },
      { key: 'MODULE_SMALL_GROUPS',      default: 'TRUE',               category: 'Modules'       },
      { key: 'MODULE_GIVING',            default: 'TRUE',               category: 'Modules'       },
      { key: 'MODULE_VOLUNTEERS',        default: 'TRUE',               category: 'Modules'       },
      { key: 'MODULE_COMMUNICATIONS',    default: 'TRUE',               category: 'Modules'       },
      { key: 'MODULE_COMMS_HUB',         default: 'TRUE',               category: 'Modules'       },
      { key: 'MODULE_CHECKIN',           default: 'TRUE',               category: 'Modules'       },
      { key: 'MODULE_MINISTRIES',        default: 'TRUE',               category: 'Modules'       },
      { key: 'MODULE_SERVICE_PLANS',     default: 'TRUE',               category: 'Modules'       },
      { key: 'MODULE_SPIRITUAL_CARE',    default: 'TRUE',               category: 'Modules'       },
      { key: 'MODULE_OUTREACH',          default: 'TRUE',               category: 'Modules'       },
      { key: 'MODULE_PHOTOS',            default: 'TRUE',               category: 'Modules'       },
      { key: 'MODULE_SERMONS',           default: 'TRUE',               category: 'Modules'       },
      { key: 'MODULE_COMPASSION',        default: 'TRUE',               category: 'Modules'       },
      { key: 'MODULE_DISCIPLESHIP',      default: 'TRUE',               category: 'Modules'       },
      { key: 'MODULE_LEARNING',          default: 'TRUE',               category: 'Modules'       },
      { key: 'MODULE_THEOLOGY',          default: 'TRUE',               category: 'Modules'       },
      { key: 'MODULE_MEMBER_CARDS',      default: 'TRUE',               category: 'Modules'       },
      // Notifications
      { key: 'NOTIFY_NEW_MEMBER',        default: 'TRUE',               category: 'Notifications' },
      { key: 'NOTIFY_PRAYER_REQUEST',    default: 'TRUE',               category: 'Notifications' },
      // Display
      { key: 'ITEMS_PER_PAGE',           default: '50',                 category: 'Display'       },
      { key: 'DATE_FORMAT',              default: 'YYYY-MM-DD',         category: 'Display'       },
    ],

    // APPENDIX C — .gs File Manifest
    gsFiles: {
      UNIFIED: [
        { num: 1,  gasName: 'Single.gs (Code.gs)', source: 'Database/Single.gs',           purpose: 'Unified backend — ~25,000 lines containing all domains' },
      ],
      note: 'All FLOCK, EXTRA, APP, and MISSIONS domain code is unified in Single.gs. No separate .gs files needed.',
      legacy: 'Previous architecture used 22 separate .gs files for FLOCK, 2 for EXTRA, 2 for APP, 2 for MISSIONS. All now consolidated.',
    },

    // APPENDIX D — Frontend File Manifest
    frontendFiles: {
      cdnDependencies: [
        'https://unpkg.com/lucide@0.474.0/dist/umd/lucide.js',
        'https://cdn.tailwindcss.com',
        'https://cdn.jsdelivr.net/npm/chart.js',
        'Google Fonts: Merriweather, Inter, Fira Code',
      ],
      core: [
        { num: 1, file: 'scripts/the-vine.js',  purpose: 'ALL API calls + Root System (1,155 lines)' },
        { num: 2, file: 'scripts/config.js',     purpose: 'Static configuration constants' },
        { num: 3, file: 'scripts/Main.js',       purpose: 'App controller & page router' },
        { num: 4, file: 'scripts/Scripts.js',    purpose: 'Script manifest & dynamic loader' },
        { num: 5, file: 'scripts/Secure.js',     purpose: 'Auth UI (login/logout/register)' },
        { num: 6, file: 'scripts/Settings.js',   purpose: 'Theme selection + profile settings' },
      ],
      modules: [
        { num: 7,  file: 'scripts/AdminProvision.js', purpose: 'User management UI' },
        { num: 8,  file: 'scripts/Analysis.js',       purpose: 'Analysis tools' },
        { num: 9,  file: 'scripts/Apologetics.js',    purpose: 'Apologetics Q&A explorer' },
        { num: 10, file: 'scripts/BibleQuiz.js',      purpose: 'Interactive Bible quiz' },
        { num: 11, file: 'scripts/Bread.js',          purpose: 'Daily devotional page' },
        { num: 12, file: 'scripts/Characters.js',     purpose: 'Character genealogy trees' },
        { num: 13, file: 'scripts/Contact.js',        purpose: 'Contact log UI' },
        { num: 14, file: 'scripts/Counseling.js',     purpose: 'Counseling wisdom cards' },
        { num: 15, file: 'scripts/Disclaimer.js',     purpose: 'Mission statement / about' },
        { num: 16, file: 'scripts/Explorer.js',       purpose: 'Bible books explorer' },
        { num: 17, file: 'scripts/Family.js',         purpose: 'Family ministry page' },
        { num: 18, file: 'scripts/Focus.js',          purpose: 'Daily focus country' },
        { num: 19, file: 'scripts/Heart.js',          purpose: 'Heart diagnostic quiz' },
        { num: 20, file: 'scripts/Invitation.js',     purpose: 'Church invitation page' },
        { num: 21, file: 'scripts/MemberPortal.js',   purpose: 'Member portal dashboard' },
        { num: 22, file: 'scripts/Mirror.js',         purpose: "Shepherd's mirror diagnostic" },
        { num: 23, file: 'scripts/Missions.js',       purpose: 'Missions directory' },
        { num: 24, file: 'scripts/Outreach.js',       purpose: 'Outreach management' },
        { num: 25, file: 'scripts/Pastoral.js',       purpose: 'Pastoral dashboard' },
        { num: 26, file: 'scripts/Posture.js',        purpose: 'Posture/outreach page' },
        { num: 27, file: 'scripts/PrayerService.js',  purpose: 'Prayer management UI' },
        { num: 28, file: 'scripts/PublicPrayer.js',   purpose: 'Public prayer request form' },
        { num: 29, file: 'scripts/Psalms.js',         purpose: 'Psalms meditation page' },
        { num: 30, file: 'scripts/Statistics.js',     purpose: 'Analytics dashboard' },
        { num: 31, file: 'scripts/Theology.js',       purpose: 'Theology reference' },
        { num: 32, file: 'scripts/Todo.js',           purpose: 'Task manager UI' },
        { num: 33, file: 'scripts/Words.js',          purpose: 'Biblical lexicon' },
        { num: 34, file: 'scripts/Worship.js',        purpose: 'Worship study page' },
        { num: 35, file: 'scripts/tbc_care.js',       purpose: 'Care ministry page' },
      ],
      flockOsScripts: [
        { num: 36, file: 'the_shofar.js', location: 'backend/FlockOS/FlockOS-Scripts/ (NOT git-tracked)', purpose: 'Song library, chord charts, Music Stand, PDF export' },
      ],
      pages: [
        { num: 36, file: 'index.html',              purpose: 'Landing / main entry' },
        { num: 37, file: 'index-local.html',         purpose: 'Local development variant' },
        { num: 38, file: 'pages/aos1p.html',         purpose: 'Production working file (SPA shell)' },
        { num: 39, file: 'pages/AOS1L.html',         purpose: 'Legacy variant' },
        { num: 40, file: 'pages/AOSa.html',          purpose: 'Stable archive A' },
        { num: 41, file: 'pages/AOSb.html',          purpose: 'Stable archive B' },
        { num: 42, file: 'pages/AOSc.html',          purpose: 'Stable archive C' },
        { num: 43, file: 'pages/developer.html',     purpose: 'Developer tools' },
        { num: 44, file: 'pages/tbc_care.html',      purpose: 'Care ministry page' },
        { num: 45, file: 'pages/tap/dev.html',       purpose: 'TAP development page' },
      ],
      css: [
        { num: 46, file: 'css/fine_linen.css', purpose: '8-theme design system (source: fine_linen.js)' },
      ],
      total: '46 tracked files + 1 FlockOS-Scripts file (not git-tracked)',
    },
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────

  return {
    phases,
    checklist,
    sheets,
    testMatrix,
    rbac,
    urlMap,
    navigation,
    features,
    troubleshoot,
    appendix,
    meta: {
      title:     'FlockOS Master Deployment Guide',
      generated: '2026-03-19',
      source:    'FlockOS/Revelation/3_Deployment.txt',
      summary:   '200 tabs · 1 database · 1 GAS API (Single.gs) · 46+ frontend files',
      totalPhases: 10,
      troubleshootingEntries: _troubleshootingEntries.length,
      scripture: '"I am the vine; you are the branches." — John 15:5',
    },
  };

})();
