#!/usr/bin/env node
/**
 * FlockOS — Backup all church Firestore data to flockos-truth
 * 
 * Copies every document from each church project into flockos-truth
 * under: backup/{projectId}/{collection}/{docId}
 * 
 * Skips truth collections (already in flockos-truth).
 * Does NOT delete existing backup data — overwrites docs with same ID.
 * 
 * Usage:  node FlockOS/Tools/backup_to_truth.js
 */

const admin = require('firebase-admin');
const path  = require('path');

const SECRETS = path.join(__dirname, '..', 'Flock Secrets');

// ── Source projects (churches) ──────────────────────────────────────────────
const SOURCES = [
  { id: 'flockos-notify',    sa: 'flockos-notify-firebase-adminsdk-fbsvc-69aa3dcf79.json' },
  { id: 'flockos-trinity',   sa: 'flockos-trinity-firebase-adminsdk-fbsvc-c8e8ee9c05.json' },
  { id: 'flockos-theforest', sa: 'flockos-theforest-firebase-adminsdk-fbsvc-1317741aea.json' },
];

// ── Destination ─────────────────────────────────────────────────────────────
const DEST_SA = 'flockos-truth-firebase-adminsdk-fbsvc-21aa89bf70.json';

// ── Collections to back up (all church collections from the_upper_room.js) ──
const COLLECTIONS = [
  'accessControl', 'albums', 'appConfig', 'attendance', 'auditLog',
  'broadcasts', 'calendarEvents', 'careAssignments', 'careCases',
  'careInteractions', 'checkinSessions', 'compassionLogs',
  'compassionRequests', 'compassionResources', 'contactLog',
  'conversations', 'discipleshipAssessments', 'discipleshipCertificates',
  'discipleshipEnrollments', 'discipleshipGoals', 'discipleshipMeetings',
  'discipleshipMentoring', 'discipleshipMilestones', 'discipleshipPaths',
  'discipleshipSteps', 'events', 'giving', 'groups', 'households',
  'journal', 'learningCertificates', 'learningNotes',
  'learningPlaylistItems', 'learningPlaylists', 'learningProgress',
  'learningQuizResults', 'learningQuizzes', 'learningRecommendations',
  'learningTopics', 'links', 'memberCardViews', 'memberCards', 'members',
  'milestones', 'ministries', 'notifications', 'outreachCampaigns',
  'outreachContacts', 'outreachFollowUps', 'pastoralNotes', 'permissions',
  'pledges', 'prayers', 'preferences', 'rsvps', 'sermonReviews',
  'sermonSeries', 'sermons', 'servicePlans', 'settings',
  'songArrangements', 'songs', 'statisticsConfig', 'statisticsSnapshots',
  'statisticsViews', 'templates', 'theologyCategories', 'theologySections',
  'todos', 'users', 'volunteers',
  // Cloud Functions / admin collections
  'churches', 'churchVault', 'deployConfigs', 'masterConfig', 'problems',
  'pushTokens', 'scheduledReports',
];

// ── Subcollections to also copy ─────────────────────────────────────────────
const SUBCOLLECTIONS = {
  conversations: ['messages', 'typing'],
  groups:        ['members'],
  memberCards:   ['links'],
  learningPlaylists: ['subscribers'],
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function initApp(name, saFile) {
  const sa = require(path.join(SECRETS, saFile));
  return admin.initializeApp({
    credential: admin.credential.cert(sa),
    projectId: sa.project_id,
  }, name);
}

const BATCH_LIMIT = 450; // stay under Firestore 500-write batch limit

async function copyCollection(srcDb, destDb, srcPath, destPath) {
  const snap = await srcDb.collection(srcPath).get();
  if (snap.empty) return 0;

  let batch = destDb.batch();
  let count = 0;
  let batchCount = 0;

  for (const doc of snap.docs) {
    const destRef = destDb.doc(`${destPath}/${doc.id}`);
    batch.set(destRef, doc.data());
    count++;
    batchCount++;

    if (batchCount >= BATCH_LIMIT) {
      await batch.commit();
      batch = destDb.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) await batch.commit();
  return count;
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  FlockOS — Backup Church Data to flockos-truth');
  console.log('═══════════════════════════════════════════════════\n');

  // Init destination
  const destApp = initApp('truth-dest', DEST_SA);
  const destDb  = destApp.firestore();

  let grandTotal = 0;

  for (const source of SOURCES) {
    console.log(`\n┌─ ${source.id}`);
    console.log('│');

    const srcApp = initApp(source.id, source.sa);
    const srcDb  = srcApp.firestore();
    let projectTotal = 0;

    for (const col of COLLECTIONS) {
      const destPath = `backup/${source.id}/${col}`;

      try {
        const n = await copyCollection(srcDb, destDb, col, destPath);
        if (n > 0) {
          console.log(`│  ✓ ${col}: ${n} docs → ${destPath}`);
          projectTotal += n;

          // Copy subcollections if defined
          if (SUBCOLLECTIONS[col]) {
            const parentSnap = await srcDb.collection(col).get();
            for (const parentDoc of parentSnap.docs) {
              for (const sub of SUBCOLLECTIONS[col]) {
                const subSrc  = `${col}/${parentDoc.id}/${sub}`;
                const subDest = `backup/${source.id}/${col}/${parentDoc.id}/${sub}`;
                const sn = await copyCollection(srcDb, destDb, subSrc, subDest);
                if (sn > 0) {
                  console.log(`│    ↳ ${sub}: ${sn} docs (${parentDoc.id})`);
                  projectTotal += sn;
                }
              }
            }
          }
        }
      } catch (err) {
        // Permission denied or collection doesn't exist — skip silently
        if (err.code === 7 || err.code === 'permission-denied') continue;
        console.log(`│  ✗ ${col}: ${err.message}`);
      }
    }

    console.log('│');
    console.log(`└─ ${source.id}: ${projectTotal} docs backed up`);
    grandTotal += projectTotal;

    // Clean up source app
    await srcApp.delete();
  }

  // Write backup metadata
  await destDb.collection('backup').doc('_meta').set({
    lastRun: admin.firestore.FieldValue.serverTimestamp(),
    sources: SOURCES.map(s => s.id),
    totalDocs: grandTotal,
  });

  console.log('\n═══════════════════════════════════════════════════');
  console.log(`  Done. ${grandTotal} total docs backed up to flockos-truth`);
  console.log('  Structure: backup/{projectId}/{collection}/{docId}');
  console.log('═══════════════════════════════════════════════════\n');

  await destApp.delete();
  process.exit(0);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
