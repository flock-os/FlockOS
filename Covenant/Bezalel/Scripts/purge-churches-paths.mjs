/**
 * purge-churches-paths.mjs
 *
 * Deletes the orphaned `churches/{churchId}/...` tree from Firestore that was
 * created by the old import code before the flat-structure fix (May 2026).
 * After this runs, all data will live exclusively at the root-collection level
 * where the app actually reads from.
 *
 * Usage:
 *   node Covenant/Bezalel/Scripts/purge-churches-paths.mjs [--dry-run]
 *
 * --dry-run  Print what would be deleted without actually deleting anything.
 */

import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require   = createRequire(import.meta.url);
const admin     = require('firebase-admin');

const DRY_RUN   = process.argv.includes('--dry-run');
const KEY_PATH  = path.resolve(
  __dirname,
  '../../../Architechtural Docs/New Covenant/Secrets/Flock/flockos-notify-firebase-adminsdk-fbsvc-69aa3dcf79.json'
);
const BATCH_SIZE = 400; // Firestore batch write limit is 500; stay under

// ── Init ────────────────────────────────────────────────────────────────────

const serviceAccount = JSON.parse(readFileSync(KEY_PATH, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId:  serviceAccount.project_id,
});

const db = admin.firestore();

// ── Helpers ─────────────────────────────────────────────────────────────────

async function deleteCollection(colRef, label) {
  let total = 0;
  while (true) {
    const snap = await colRef.limit(BATCH_SIZE).get();
    if (snap.empty) break;

    const batch = db.batch();
    for (const doc of snap.docs) {
      if (DRY_RUN) {
        console.log(`  [DRY] would delete: ${doc.ref.path}`);
      } else {
        batch.delete(doc.ref);
      }
      total++;
    }
    if (!DRY_RUN) await batch.commit();
    if (snap.docs.length < BATCH_SIZE) break;
  }
  console.log(`  ${DRY_RUN ? '[DRY] ' : ''}${label}: ${total} docs`);
  return total;
}

async function deleteSubcollections(docRef) {
  const subCols = await docRef.listCollections();
  let total = 0;
  for (const col of subCols) {
    total += await deleteCollection(col, `  sub-collection: ${col.path}`);
  }
  return total;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n=== FlockOS: Purge orphaned churches/* paths ===`);
  console.log(`Project : ${serviceAccount.project_id}`);
  console.log(`Mode    : ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE — deleting data'}\n`);

  const churchesCol = db.collection('churches');
  const snap = await churchesCol.get();

  if (snap.empty) {
    console.log('No documents found in `churches/` collection. Nothing to do.');
    return;
  }

  let grandTotal = 0;

  for (const churchDoc of snap.docs) {
    console.log(`Church doc: ${churchDoc.ref.path}`);
    // Delete all sub-collections first
    grandTotal += await deleteSubcollections(churchDoc.ref);
    // Delete the church document itself
    if (DRY_RUN) {
      console.log(`  [DRY] would delete: ${churchDoc.ref.path}`);
    } else {
      await churchDoc.ref.delete();
    }
    grandTotal++;
  }

  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Total deleted: ${grandTotal} documents`);
  if (DRY_RUN) {
    console.log('\nRun without --dry-run to actually delete.\n');
  } else {
    console.log('\nDone. The `churches/` collection and all sub-collections are gone.\n');
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
