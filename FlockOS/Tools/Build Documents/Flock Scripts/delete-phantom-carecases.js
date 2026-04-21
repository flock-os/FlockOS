/**
 * delete-phantom-carecases.js
 *
 * Finds and deletes any careCase documents whose memberId field
 * contains a header-string value (i.e. the literal text "Member ID"),
 * which indicates it was accidentally seeded from a duplicate header row.
 *
 * Usage:
 *   node "delete-phantom-carecases.js"          -- dry run (show what would be deleted)
 *   node "delete-phantom-carecases.js" --delete  -- actually delete
 */

const admin = require('firebase-admin');
const path  = require('path');
const fs    = require('fs');

const APPLY = process.argv.includes('--delete');

const PROJECTS = [
  { name: 'flockos-notify',    church: 'GAS',       key: 'flockos-notify-firebase-adminsdk-fbsvc-69aa3dcf79.json' },
  { name: 'flockos-trinity',   church: 'TBC',       key: 'flockos-trinity-firebase-adminsdk-fbsvc-c8e8ee9c05.json' },
  { name: 'flockos-theforest', church: 'TheForest', key: 'flockos-theforest-firebase-adminsdk-fbsvc-1317741aea.json' },
];

const SECRETS_DIR = path.join(__dirname, '..', 'Flock Secrets');

// Any value that looks like a sheet column header (not real data)
const HEADER_SENTINELS = new Set([
  'Member ID', 'Primary Caregiver ID', 'Secondary Caregiver ID',
  'ID', 'Care Type', 'Priority', 'Status', 'Summary',
]);

async function run() {
  for (const proj of PROJECTS) {
    const keyPath = path.join(SECRETS_DIR, proj.key);
    if (!fs.existsSync(keyPath)) {
      console.log(`\n[${proj.name}] No key file found — skipping`);
      continue;
    }

    const app = admin.initializeApp({
      credential: admin.credential.cert(require(keyPath)),
    }, proj.name);

    const db = admin.firestore(app);

    // careCases live at the root level (the project IS the church boundary)
    const collRef = db.collection('careCases');
    const snap    = await collRef.get();

    const phantoms = [];
    snap.forEach(doc => {
      const data = doc.data();
      const isPhantom = HEADER_SENTINELS.has(data.memberId) ||
                        HEADER_SENTINELS.has(data.id)       ||
                        HEADER_SENTINELS.has(data.careType);
      if (isPhantom) {
        phantoms.push({ id: doc.id, memberId: data.memberId, careType: data.careType });
      }
    });

    if (phantoms.length === 0) {
      console.log(`\n[${proj.name}] No phantom documents found ✓`);
    } else {
      console.log(`\n[${proj.name}] Found ${phantoms.length} phantom document(s):`);
      phantoms.forEach(p => console.log(`  doc: ${p.id}  memberId="${p.memberId}"  careType="${p.careType}"`));

      if (APPLY) {
        for (const p of phantoms) {
          await collRef.doc(p.id).delete();
          console.log(`  ✓ Deleted: ${p.id}`);
        }
      } else {
        console.log('  → Dry run. Pass --delete to remove them.');
      }
    }

    await app.delete();
  }

  console.log('\nDone.');
}

run().catch(err => { console.error(err); process.exit(1); });
