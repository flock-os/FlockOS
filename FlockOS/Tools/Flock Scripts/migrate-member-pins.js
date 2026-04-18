/**
 * migrate-member-pins.js
 *
 * Formats all member pins in Firestore across all church deployments to xxx-xx-xxxx.
 * Also ensures flockos.notify@gmail.com has the SAME pin on every deployment.
 *
 * Run: node "FlockOS/Tools/Flock Scripts/migrate-member-pins.js"
 */

const admin = require('firebase-admin');
const path  = require('path');

const SECRETS = path.join(__dirname, '../Flock Secrets');

const PROJECTS = [
  { name: 'GAS (flockos-notify)',     key: path.join(SECRETS, 'flockos-notify-firebase-adminsdk-fbsvc-69aa3dcf79.json') },
  { name: 'TheForest',                key: path.join(SECRETS, 'flockos-theforest-firebase-adminsdk-fbsvc-1317741aea.json') },
  { name: 'TBC (flockos-trinity)',     key: path.join(SECRETS, 'flockos-trinity-firebase-adminsdk-fbsvc-c8e8ee9c05.json') },
];

const ANCHOR_EMAIL = 'flockos.notify@gmail.com';

function formatPin(raw) {
  const s = String(raw).trim();
  if (/^\d{3}-\d{2}-\d{4}$/.test(s)) return s;        // already formatted
  if (/^\d{9}$/.test(s)) return `${s.slice(0,3)}-${s.slice(3,5)}-${s.slice(5)}`;
  return null; // unexpected format — leave alone
}

function genPin() {
  const n = String(Math.floor(Math.random() * 900000000) + 100000000);
  return `${n.slice(0,3)}-${n.slice(3,5)}-${n.slice(5)}`;
}

async function processProject(proj, sharedAnchorPin) {
  const app = admin.initializeApp({
    credential: admin.credential.cert(require(proj.key)),
  }, proj.name);

  const db = admin.firestore(app);
  const snap = await db.collection('members').get();

  let updated = 0, skipped = 0, anchorPin = null;
  const batch = db.batch();

  for (const doc of snap.docs) {
    const data = doc.data();
    const email = (data.primaryEmail || data.email || '').toLowerCase().trim();
    const currentPin = data.memberPin || '';

    if (email === ANCHOR_EMAIL) {
      // Use the shared anchor pin — assign if needed
      const target = sharedAnchorPin;
      if (currentPin !== target) {
        batch.update(doc.ref, { memberPin: target });
        console.log(`  [${proj.name}] ANCHOR ${email}: ${currentPin || '(none)'} → ${target}`);
        updated++;
      } else {
        console.log(`  [${proj.name}] ANCHOR ${email}: already ${target} ✓`);
        skipped++;
      }
      anchorPin = target;
      continue;
    }

    if (!currentPin) {
      // No pin at all — generate one
      const pin = genPin();
      batch.update(doc.ref, { memberPin: pin });
      console.log(`  [${proj.name}] ${email || doc.id}: (none) → ${pin}`);
      updated++;
      continue;
    }

    const formatted = formatPin(currentPin);
    if (formatted === null) {
      console.log(`  [${proj.name}] SKIP ${email || doc.id}: unexpected pin format "${currentPin}"`);
      skipped++;
    } else if (formatted !== currentPin) {
      batch.update(doc.ref, { memberPin: formatted });
      console.log(`  [${proj.name}] ${email || doc.id}: ${currentPin} → ${formatted}`);
      updated++;
    } else {
      skipped++;
    }
  }

  await batch.commit();
  console.log(`  [${proj.name}] Done: ${updated} updated, ${skipped} skipped.\n`);
  await app.delete();
  return anchorPin;
}

async function main() {
  // Step 1: Find the anchor member's existing pin across all projects (use first found)
  let sharedAnchorPin = null;

  console.log('=== Phase 1: Find anchor pin for ' + ANCHOR_EMAIL + ' ===\n');
  for (const proj of PROJECTS) {
    const app = admin.initializeApp({
      credential: admin.credential.cert(require(proj.key)),
    }, proj.name + '-probe');
    const db = admin.firestore(app);
    const snap = await db.collection('members')
      .where('primaryEmail', '==', ANCHOR_EMAIL).limit(1).get();
    if (!snap.empty) {
      const pin = snap.docs[0].data().memberPin;
      if (pin && /^\d{3}-\d{2}-\d{4}$/.test(pin)) {
        sharedAnchorPin = pin;
        console.log(`Found existing formatted anchor pin on [${proj.name}]: ${sharedAnchorPin}`);
      } else if (pin && /^\d{9}$/.test(pin)) {
        sharedAnchorPin = formatPin(pin);
        console.log(`Found unformatted anchor pin on [${proj.name}]: ${pin} → ${sharedAnchorPin}`);
      }
    }
    await app.delete();
    if (sharedAnchorPin) break;
  }

  if (!sharedAnchorPin) {
    sharedAnchorPin = genPin();
    console.log(`No existing pin found for anchor — generated new: ${sharedAnchorPin}`);
  }
  console.log(`\nAnchor pin to use across all deployments: ${sharedAnchorPin}\n`);

  // Step 2: Process all projects
  console.log('=== Phase 2: Format all member pins ===\n');
  for (const proj of PROJECTS) {
    console.log(`Processing [${proj.name}]...`);
    await processProject(proj, sharedAnchorPin);
  }

  console.log('=== Migration complete ===');
  console.log(`flockos.notify@gmail.com pin on all deployments: ${sharedAnchorPin}`);
}

main().catch(e => { console.error(e); process.exit(1); });
