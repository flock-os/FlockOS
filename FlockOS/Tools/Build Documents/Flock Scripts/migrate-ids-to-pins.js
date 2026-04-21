/**
 * migrate-ids-to-pins.js
 *
 * Replaces Firestore doc ID references in careCases, careAssignments, and prayers
 * with the corresponding member's memberPin (SSN-format: xxx-xx-xxxx).
 *
 * Fields updated:
 *   careCases:       memberId, primaryCaregiverId, secondaryCaregiverId
 *   careAssignments: memberId, caregiverId (only if it's a docId, not an email)
 *   prayers:         memberId (if present)
 *
 * Run with --apply to write changes. Default is dry-run.
 */

const admin = require('firebase-admin');
const path  = require('path');

const APPLY = process.argv.includes('--apply');
const SECRETS = path.join(__dirname, '..', 'Flock Secrets');

const PROJECTS = [
  { name: 'GAS (flockos-notify)',  key: path.join(SECRETS, 'flockos-notify-firebase-adminsdk-fbsvc-69aa3dcf79.json') },
  { name: 'TBC (flockos-trinity)', key: path.join(SECRETS, 'flockos-trinity-firebase-adminsdk-fbsvc-c8e8ee9c05.json') },
];

// Fields per collection that contain a member doc ID reference
const COLLECTION_FIELDS = {
  careCases:       ['memberId', 'primaryCaregiverId', 'secondaryCaregiverId'],
  careAssignments: ['memberId', 'caregiverId'],
  prayers:         ['memberId'],
};

function isDocId(val) {
  if (!val || typeof val !== 'string') return false;
  if (val.includes('@')) return false;          // email — skip
  if (/^\d{3}-\d{2}-\d{4}$/.test(val)) return false; // already a pin — skip
  if (val.trim() === '') return false;
  return true;
}

async function migrateProject(proj) {
  const app = admin.initializeApp({ credential: admin.credential.cert(require(proj.key)) }, proj.name);
  const db = admin.firestore(app);

  // Build docId → memberPin map
  console.log(`\n[${proj.name}] Building member pin map...`);
  const membersSnap = await db.collection('members').get();
  const pinMap = {};
  let missingPin = 0;
  membersSnap.docs.forEach(doc => {
    const pin = doc.data().memberPin;
    if (pin) pinMap[doc.id] = pin;
    else missingPin++;
  });
  console.log(`  ${Object.keys(pinMap).length} members mapped, ${missingPin} missing pins`);

  let totalUpdated = 0, totalSkipped = 0, totalUnresolved = 0;

  for (const [colName, fields] of Object.entries(COLLECTION_FIELDS)) {
    const snap = await db.collection(colName).get();
    if (snap.empty) { console.log(`  [${colName}] empty — skipping`); continue; }

    console.log(`\n  [${colName}] ${snap.size} docs`);
    const CHUNK = 450;
    let batch = db.batch();
    let batchCount = 0;

    for (const doc of snap.docs) {
      const data = doc.data();
      const updates = {};

      for (const field of fields) {
        const val = data[field];
        if (!isDocId(val)) continue;
        const pin = pinMap[val];
        if (pin) {
          updates[field] = pin;
          console.log(`    ${doc.id} | ${field}: ${val} → ${pin}`);
        } else {
          console.log(`    UNRESOLVED ${doc.id} | ${field}: "${val}" (no member found)`);
          totalUnresolved++;
        }
      }

      if (Object.keys(updates).length > 0) {
        if (APPLY) batch.update(doc.ref, updates);
        totalUpdated++;
        batchCount++;
        if (batchCount >= CHUNK) {
          if (APPLY) await batch.commit();
          batch = db.batch();
          batchCount = 0;
        }
      } else {
        totalSkipped++;
      }
    }

    if (APPLY && batchCount > 0) await batch.commit();
  }

  console.log(`\n  [${proj.name}] Summary: ${totalUpdated} docs updated, ${totalSkipped} skipped, ${totalUnresolved} unresolved`);
  await app.delete();
}

async function main() {
  console.log(APPLY ? '=== MODE: APPLY (writing to Firestore) ===' : '=== MODE: DRY RUN (no writes) ===');
  for (const proj of PROJECTS) await migrateProject(proj);
  console.log('\n=== Done ===');
}

main().catch(e => { console.error(e); process.exit(1); });
