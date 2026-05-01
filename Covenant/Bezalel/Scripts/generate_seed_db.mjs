#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════════
   generate_seed_db.mjs — Complete FlockOS Firestore seed JSON generator
   ══════════════════════════════════════════════════════════════════════════════
   Reads all New_Covenant/Data/*.js content files + the SQL schema collection
   list, then outputs a single FlockOS-Firestore-JSON-v1 JSON file covering
   all 93 Firestore collections.

   Usage:
     node Covenant/Bezalel/Scripts/generate_seed_db.mjs
     node Covenant/Bezalel/Scripts/generate_seed_db.mjs --no-strongs
     node Covenant/Bezalel/Scripts/generate_seed_db.mjs --out custom-name.json

   Output: New_Covenant/Data/seed_database.json  (default)

   Flags:
     --no-strongs   Omit Strong's Greek/Hebrew (saves ~3 MB; app works without)
     --out <path>   Custom output path
   ══════════════════════════════════════════════════════════════════════════════ */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dir  = dirname(fileURLToPath(import.meta.url));
const ROOT   = resolve(__dir, '../../..');
const DATA   = resolve(ROOT, 'New_Covenant/Data');

// ── CLI flags ─────────────────────────────────────────────────────────────
const args       = process.argv.slice(2);
const noStrongs  = args.includes('--no-strongs');
const outIdx     = args.indexOf('--out');
const outPath    = outIdx >= 0 ? resolve(process.cwd(), args[outIdx + 1])
                               : resolve(DATA, 'seed_database.json');

// ── Helpers ───────────────────────────────────────────────────────────────
function load(file) {
  return import(`${DATA}/${file}`).then(m => m.default || m);
}

// Ensure every record has a string _id. Prefers existing _id / _docId / id
// then falls back to natural key fields per collection.
function normalise(records, idStrategy) {
  return records.map((r, i) => {
    const id = String(
      r._id     ||
      r._docId  ||
      idStrategy(r, i)
    ).trim();
    const { _id: _, _docId: __, ...rest } = r;
    return { _id: id, ...rest };
  });
}

function slug(str = '') {
  return String(str).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

// ── All 93 empty church-side operational collections ──────────────────────
// These start empty for a fresh church; format: [collectionName]
const EMPTY_CHURCH_COLLECTIONS = [
  'members','prayers','journal','contactLog','pastoralNotes','milestones',
  'households','todos','attendance','events','rsvps','calendarEvents',
  'checkinSessions','groups','groupMembers','giving','pledges','volunteers',
  'conversations','messages','notifications','templates','broadcasts',
  'ministries','servicePlans','songs','albums','sermons','sermonSeries',
  'sermonReviews','careCases','careInteractions','careAssignments',
  'compassionRequests','compassionLogs','compassionResources',
  'outreachContacts','outreachCampaigns','outreachFollowUps',
  'discipleshipPaths','discipleshipSteps','discipleshipEnrollments',
  'discipleshipMentoring','discipleshipMeetings','discipleshipAssessments',
  'discipleshipMilestones','discipleshipGoals','discipleshipCertificates',
  'learningTopics','learningPlaylists','learningPlaylistItems',
  'learningProgress','learningNotes','learningBookmarks',
  'learningRecommendations','learningQuizzes','learningQuizResults',
  'learningCertificates','theologyCategories','theologySections',
  'memberCards','cardLinks','memberCardViews',
  'statisticsConfig','statisticsSnapshots','statisticsViews',
  'strategicGoals','strategicInitiatives','strategicKeyDates',
  'accessControl','permissions',
];

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('FlockOS Seed DB Generator');
  console.log('══════════════════════════');

  const churchId = 'FlockOS';

  // ── Load all content data files ─────────────────────────────────────────
  console.log('Loading Data files…');

  const [
    books, genealogy, counseling, devotionals, heart, mirror,
    theology, quiz, apologetics, missions, oneYearBible, readingPlans,
    greekStrongs, hebrewStrongs,
  ] = await Promise.all([
    load('books-of-the-bible.js'),
    load('genealogy.js'),
    load('counseling.js'),
    load('devotionals.js'),
    load('heart.js'),
    load('mirror.js'),
    load('theology.js'),
    load('quiz.js'),
    load('apologetics.js'),
    load('missions.js'),
    load('one_year_bible.js'),
    load('reading-plans.js'),
    noStrongs ? Promise.resolve([]) : load('strongs-greek.js'),
    noStrongs ? Promise.resolve([]) : load('strongs-hebrew.js'),
  ]);

  console.log(`  books          ${books.length}`);
  console.log(`  genealogy      ${genealogy.length}`);
  console.log(`  counseling     ${counseling.length}`);
  console.log(`  devotionals    ${devotionals.length}`);
  console.log(`  heart          ${heart.length}`);
  console.log(`  mirror         ${mirror.length}`);
  console.log(`  theology       ${theology.length}`);
  console.log(`  quiz           ${quiz.length}`);
  console.log(`  apologetics    ${apologetics.length}`);
  console.log(`  missions       ${missions.length}`);
  console.log(`  one_year_bible ${oneYearBible.length}`);
  console.log(`  reading_plans  ${Object.keys(readingPlans).length} plans`);
  if (!noStrongs) {
    console.log(`  strongs_greek  ${greekStrongs.length}`);
    console.log(`  strongs_hebrew ${hebrewStrongs.length}`);
  } else {
    console.log(`  strongs        (skipped — use --no-strongs omits ~3 MB)`);
  }

  // ── Normalise each collection ───────────────────────────────────────────
  const collections = {};

  // Church root (backend-only, included for reference, skipped on import)
  collections.churches = [
    { _id: churchId, name: churchId, setupComplete: false, createdAt: null },
  ];

  // Default sub-collections under churches/{churchId}
  collections.channels = [
    { _id: 'general',         name: 'general',         slug: 'general',         type: 'channel', description: 'General discussion',   createdAt: null, messageCount: 0, sortOrder: 1 },
    { _id: 'announcements',   name: 'announcements',   slug: 'announcements',   type: 'channel', description: 'Church announcements',  createdAt: null, messageCount: 0, sortOrder: 2 },
    { _id: 'prayer-requests', name: 'prayer-requests', slug: 'prayer-requests', type: 'channel', description: 'Prayer requests',       createdAt: null, messageCount: 0, sortOrder: 3 },
  ];
  collections.config = [
    { _id: 'general', setupComplete: false, createdAt: null },
  ];
  collections.settings = [
    { _id: 'notifications', emailEnabled: true, inAppEnabled: true,
      quietHoursStart: '22:00', quietHoursEnd: '07:00', createdAt: null },
  ];
  collections.users = []; // populated by auth backend

  // Content collections (top-level in Firestore, not under churches/)
  collections.books = normalise(books, (r, i) =>
    r.bookName ? slug(r.bookName) : `book_${i + 1}`
  );

  collections.genealogy = normalise(genealogy, (r, i) =>
    r.name ? slug(r.name) + `_${i}` : `person_${i}`
  );

  collections.counseling = normalise(counseling, (r, i) =>
    r.topicId || r.title ? slug(r.topicId || r.title) : `topic_${i}`
  );

  collections.devotionals = normalise(devotionals, (r, i) =>
    r.date || r.Date ? slug(String(r.date || r.Date)) : `devo_${i}`
  );

  collections.heart = normalise(heart, (r, i) =>
    r['Question ID'] || r.questionId || `hc_${i}`
  );

  collections.mirror = normalise(mirror, (r, i) =>
    r['Question ID'] || r.questionId || `sm_${i}`
  );

  // theology — flatten if it's a nested structure
  const theologyFlat = Array.isArray(theology)
    ? theology
    : Object.values(theology).flat();
  collections.theology = normalise(theologyFlat, (r, i) =>
    r.sectionTitle ? slug(r.sectionTitle) + `_${i}` : `theology_${i}`
  );

  collections.quiz = normalise(quiz, (r, i) =>
    r.quizId || r.id || `q_${i}`
  );

  collections.apologetics = normalise(apologetics, (r, i) =>
    r.questionId || r.id || `apol_${i}`
  );

  // missions — top-level collection
  collections.missionsRegistry = normalise(missions, (r, i) =>
    r.isoCode || r.countryName ? slug(r.isoCode || r.countryName) : `country_${i}`
  );

  // reading / one_year_bible — store both
  collections.reading = normalise(
    Array.isArray(oneYearBible) ? oneYearBible : Object.values(oneYearBible).flat(),
    (r, i) => r.date || r.day || `day_${i + 1}`
  );
  // reading-plans — keyed object { planId: [{ day, passages }] }
  // Flatten into { _id: `${planId}_day_${day}`, plan: planId, ...dayData }
  const readingPlanRows = [];
  for (const [planId, days] of Object.entries(readingPlans)) {
    for (const day of (Array.isArray(days) ? days : [])) {
      readingPlanRows.push({ _id: `${planId}_day_${day.day}`, plan: planId, ...day });
    }
  }
  collections.readingPlans = readingPlanRows;

  // Strong's concordances (optionally included)
  if (!noStrongs) {
    collections.wordsGreek = normalise(greekStrongs, (r, i) =>
      r.strongs || r.strongsNumber || r.number || `g${i}`
    );
    collections.wordsHebrew = normalise(hebrewStrongs, (r, i) =>
      r.strongs || r.strongsNumber || r.number || `h${i}`
    );
  }

  // All empty operational church-side collections
  for (const name of EMPTY_CHURCH_COLLECTIONS) {
    collections[name] = [];
  }

  // ── Assemble output ─────────────────────────────────────────────────────
  const totalDocs = Object.values(collections).reduce((s, a) => s + a.length, 0);
  const output = {
    __meta: {
      exportedAt:   new Date().toISOString(),
      generator:    'Covenant/Bezalel/Scripts/generate_seed_db.mjs',
      churchId,
      format:       'FlockOS-Firestore-JSON-v1',
      version:      'seed-2.0',
      collections:  Object.keys(collections).length,
      totalDocs,
      includesStrongs: !noStrongs,
      note: [
        'Complete seed database for a fresh FlockOS church deployment.',
        'Import via: Admin → Church Audit → ⬆ Import .json',
        '"churches" collection is backend-only — skipped on import.',
        'Content collections (books, theology, missions, etc.) are top-level Firestore collections.',
        'Church-operational collections (members, sermons, etc.) start empty.',
        noStrongs
          ? 'Strong\'s concordances omitted (run without --no-strongs to include).'
          : 'Includes Strong\'s Greek + Hebrew concordances (~3 MB of reference data).',
      ].join(' '),
    },
    collections,
  };

  // ── Write ───────────────────────────────────────────────────────────────
  console.log('\nWriting output…');
  const json = JSON.stringify(output, null, 2);
  writeFileSync(outPath, json, 'utf8');

  const mb = (Buffer.byteLength(json, 'utf8') / 1024 / 1024).toFixed(2);
  console.log(`\n✓ Done!`);
  console.log(`  Output:      ${outPath}`);
  console.log(`  Collections: ${Object.keys(collections).length}`);
  console.log(`  Total docs:  ${totalDocs.toLocaleString()}`);
  console.log(`  File size:   ${mb} MB`);
  console.log('');
  if (!noStrongs) {
    console.log('Tip: run with --no-strongs to produce a smaller seed (~3 MB smaller)');
    console.log('     for general use. Strong\'s data is reference-only and the app');
    console.log('     reads it from the local Data/ files, not Firestore.');
  }
}

main().catch(err => {
  console.error('Generator failed:', err);
  process.exit(1);
});
