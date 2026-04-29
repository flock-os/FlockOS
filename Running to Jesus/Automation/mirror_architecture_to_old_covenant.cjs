#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function resolveFromWorkspace(relPath) {
  return path.resolve(process.cwd(), relPath);
}

function fileSha256(content) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(content).digest('hex');
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readUtf8IfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
  };
}

function syncFiles(options) {
  const mappings = [
    {
      src: 'Architechtural Docs/New Covenant/Architecture/B-Master Code.md',
      dest: 'Architechtural Docs/Old Covenant/Architecture/L-Master Code.md',
      reason: 'Canonical master code flows New -> Old.',
    },
    {
      src: 'Architechtural Docs/New Covenant/Architecture/C-Master FirestoreSync.md',
      dest: 'Architechtural Docs/Old Covenant/Architecture/M-Master FirestoreSync.md',
      reason: 'Canonical Firestore sync contract flows New -> Old.',
    },
    {
      src: 'Architechtural Docs/New Covenant/Architecture/D-Master SyncHandler.md',
      dest: 'Architechtural Docs/Old Covenant/Architecture/N-Master SyncHandler.md',
      reason: 'Canonical sync handler map flows New -> Old.',
    },
    {
      src: 'Architechtural Docs/New Covenant/Architecture/E-Master CamelCase.md',
      dest: 'Architechtural Docs/Old Covenant/Architecture/O-Master CamelCase.md',
      reason: 'Canonical field map flows New -> Old.',
    },
    {
      src: 'Architechtural Docs/New Covenant/Architecture/New Covenant Schema.sql',
      dest: 'Architechtural Docs/Old Covenant/Architecture/New Covenant Schema.sql',
      reason: 'Canonical SQL schema is mirrored for continuity in Old Covenant.',
    },
    {
      src: 'Architechtural Docs/New Covenant/Architecture/Z-Variance.md',
      dest: 'Architechtural Docs/Old Covenant/Architecture/Z-Variance.md',
      reason: 'Current schema audit report flows New -> Old.',
    },
  ];

  let changed = 0;
  let unchanged = 0;

  for (const mapping of mappings) {
    const srcPath = resolveFromWorkspace(mapping.src);
    const destPath = resolveFromWorkspace(mapping.dest);

    if (!fs.existsSync(srcPath)) {
      throw new Error('Missing source file: ' + mapping.src);
    }

    const srcContent = fs.readFileSync(srcPath, 'utf8');
    const destContent = readUtf8IfExists(destPath);

    if (destContent !== null && fileSha256(destContent) === fileSha256(srcContent)) {
      unchanged += 1;
      console.log('[Mirror] Unchanged: ' + mapping.dest);
      continue;
    }

    if (options.dryRun) {
      changed += 1;
      console.log('[Mirror] [dry-run] Would sync: ' + mapping.src + ' -> ' + mapping.dest);
      continue;
    }

    ensureDir(destPath);
    fs.writeFileSync(destPath, srcContent);
    changed += 1;
    console.log('[Mirror] Synced: ' + mapping.src + ' -> ' + mapping.dest);
    console.log('         Reason: ' + mapping.reason);
  }

  return { changed, unchanged, total: mappings.length };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = syncFiles(options);

  console.log('');
  console.log('[Mirror] Complete');
  console.log('[Mirror] Total mappings: ' + result.total);
  console.log('[Mirror] Changed: ' + result.changed);
  console.log('[Mirror] Unchanged: ' + result.unchanged);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error('[Mirror] ERROR:', err.message);
    process.exit(1);
  }
}

module.exports = {
  syncFiles,
};
