// ══════════════════════════════════════════════════════════════════════════════
// FlockOS — SINGLE DATABASE BACKUP MANAGER
// "I am the vine; you are the branches." — John 15:5
//
// PURPOSE:
//   1. createBackupSheet()    — One-time: copies the live Google Sheet to a new
//                               backup sheet (tabs + all data). Run once to set up.
//   2. syncSheets()           — Hourly trigger target: BIDIRECTIONAL sync.
//                               Compares which copy was written to most recently
//                               and syncs in the correct direction automatically:
//                                 • Normally:  primary → backup
//                                 • Failover active: backup → primary
//                               No changes to Single.gs required.
//   3. installHourlyTrigger() — Installs the time-based trigger on syncSheets.
//   4. removeAllTriggers()    — Removes all Script triggers (cleanup).
//   5. checkBackupStatus()    — Logs IDs, last sync time, last sync direction.
//
// ── HOW TO SET UP ─────────────────────────────────────────────────────────────
//
//   STEP 1 — Initial copy
//     a. Create a new standalone GAS project (script.google.com → New project).
//     b. Paste this file as Code.gs.
//     c. Fill in BACKUP_CONFIG below: SOURCE_SHEET_ID at minimum.
//     d. Run → createBackupSheet()
//        • Authorise Google Drive + Sheets access when prompted.
//        • Check Execution Log for the new BACKUP_SHEET_ID.
//        • The backup sheet ID is also saved in Script Properties automatically.
//
//   STEP 2 — Deploy the backup as a second API endpoint
//     a. Open the NEW backup Google Sheet → Extensions → Apps Script.
//     b. Paste your entire Single.gs code into that project.
//     c. Project Settings → Script Properties → add:
//          SHEET_ID = <BACKUP_SHEET_ID from the log>
//     d. Deploy → New Deployment → Web App
//          Execute as: Me    |    Who has access: Anyone
//     e. Copy the backup Web App URL.
//
//   STEP 3 — Register the backup URL in TheVine
//     In the_true_vine.js (or your Config sheet), set the backup DATABASE_URL.
//     TheVine will automatically fall back to the backup if the primary times out.
//
//   STEP 4 — Install the hourly sync
//     Back in this (backup manager) GAS project:
//     Run → installHourlyTrigger()
//     Every 60 minutes syncSheets() runs and figures out the direction itself.
//
// ── HOW BIDIRECTIONAL SYNC WORKS ──────────────────────────────────────────────
//
//   Google Drive automatically tracks the last-modified timestamp of every
//   Google Sheet (even when updated via API). This script uses that to decide
//   which direction to sync without requiring any changes to Single.gs:
//
//     1. Before syncing, record backupLastModified = Drive.getLastUpdated(backupId)
//     2. Compare to LAST_SYNC (the timestamp this script finished its last run)
//     3. If  backupLastModified > LAST_SYNC:
//             → The backup was written to by the GAS API since our last sync
//               (i.e. users were hitting the failover URL while primary was down)
//             → Sync direction: BACKUP → PRIMARY
//        Else:
//             → Primary has the newest data (normal case)
//             → Sync direction: PRIMARY → BACKUP
//     4. After syncing, record LAST_SYNC = now
//
//   Next run, the newly-synced destination's modifiedDate will equal LAST_SYNC,
//   so the condition stays clean and returns to normal direction automatically.
//
// ── SAFETY NOTES ──────────────────────────────────────────────────────────────
//   • syncSheets() overwrites tab data but never deletes tabs.
//   • AuditLog is skipped by default (append-only, can be huge — see SKIP_TABS).
//   • If a tab exists in the destination but not in the source it is left untouched.
//   • Script stops early with a warning if approaching the 6-minute GAS limit.
//   • Running createBackupSheet() a second time creates a NEW copy (does not
//     overwrite the last backup). Old ID stays in Script Properties until updated.
//
// ══════════════════════════════════════════════════════════════════════════════


// ┌────────────────────────────────────────────────────────────────────────────┐
// │                        C O N F I G U R A T I O N                           │
// └────────────────────────────────────────────────────────────────────────────┘

var BACKUP_CONFIG = {

  // ── The live production Google Sheet ID ─────────────────────────────────
  // The long token from: https://docs.google.com/spreadsheets/d/<THIS_PART>/edit
  SOURCE_SHEET_ID: '',        // ← REQUIRED: paste your live Single.gs sheet ID here

  // ── Backup Google Sheet ID ───────────────────────────────────────────────
  // Leave blank on first run — createBackupSheet() will fill this in automatically
  // via Script Properties. You can also hard-code it after the first run.
  BACKUP_SHEET_ID: '',        // ← auto-populated by createBackupSheet()

  // ── Optional: Google Drive Folder ID to put the backup in ────────────────
  // Leave blank to place the backup in the same Drive root as the source.
  BACKUP_FOLDER_ID: '',       // ← optional

  // ── Name for the backup sheet ────────────────────────────────────────────
  BACKUP_NAME: 'FlockOS — Live Backup',

  // ── Tabs to SKIP during hourly sync (too large or append-only) ───────────
  SKIP_TABS: ['AuditLog'],

  // ── Stop syncing if execution has been running longer than this (seconds) ─
  // GAS hard limit is 360s. We stop at 300s to leave headroom.
  MAX_EXEC_SECONDS: 300
};


// ══════════════════════════════════════════════════════════════════════════════
//   STEP 1 — ONE-TIME INITIAL COPY
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Creates a full copy of the live sheet (all tabs + all data) and saves the
 * backup sheet ID in Script Properties. Run this ONCE to set up the backup.
 *
 * ▶ Run this function first.
 */
function createBackupSheet() {
  _requireSourceId_();

  Logger.log('╔══════════════════════════════════════════════════════════════╗');
  Logger.log('║     FlockOS BACKUP — CREATING INITIAL COPY                  ║');
  Logger.log('╚══════════════════════════════════════════════════════════════╝');

  var t0 = new Date();

  // Open source to verify access
  var sourceFile = DriveApp.getFileById(BACKUP_CONFIG.SOURCE_SHEET_ID);
  Logger.log('   Source: ' + sourceFile.getName() + ' (' + BACKUP_CONFIG.SOURCE_SHEET_ID + ')');

  // Build the copy name with a datestamp
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  var copyName = BACKUP_CONFIG.BACKUP_NAME + ' — ' + stamp;

  // Copy the file
  var newFile;
  if (BACKUP_CONFIG.BACKUP_FOLDER_ID) {
    var folder = DriveApp.getFolderById(BACKUP_CONFIG.BACKUP_FOLDER_ID);
    newFile = sourceFile.makeCopy(copyName, folder);
    Logger.log('   Folder: ' + folder.getName());
  } else {
    newFile = sourceFile.makeCopy(copyName);
  }

  var backupId = newFile.getId();
  Logger.log('   Backup sheet created: ' + copyName);
  Logger.log('   BACKUP_SHEET_ID: ' + backupId);

  // Persist ID so syncToBackup() can find it automatically
  PropertiesService.getScriptProperties().setProperty('BACKUP_SHEET_ID', backupId);
  PropertiesService.getScriptProperties().setProperty('LAST_SYNC', new Date().toISOString());

  var elapsed = ((new Date() - t0) / 1000).toFixed(1);

  Logger.log('');
  Logger.log('╔══════════════════════════════════════════════════════════════╗');
  Logger.log('║   COPY COMPLETE  (' + elapsed + 's)                                   ║');
  Logger.log('╠══════════════════════════════════════════════════════════════╣');
  Logger.log('║   BACKUP_SHEET_ID = ' + backupId);
  Logger.log('╠══════════════════════════════════════════════════════════════╣');
  Logger.log('║   NEXT STEPS:                                               ║');
  Logger.log('║   1. Open the backup sheet → Extensions → Apps Script       ║');
  Logger.log('║   2. Paste Single.gs as Code.gs in that project             ║');
  Logger.log('║   3. Script Properties → add:  SHEET_ID = ' + backupId.substring(0,15) + '…');
  Logger.log('║   4. Deploy → New Deployment → Web App (Execute as: Me, Access: Anyone)     ║');
  Logger.log('║   5. Copy the backup Web App URL                            ║');
  Logger.log('║   6. Back in the PRIMARY GAS project, run:                  ║');
  Logger.log('║         registerPeer(\'<BACKUP_SHEET_ID>\', \'<backup Web App URL>\')    ║');
  Logger.log('║      This writes both values into AppConfig and enables      ║');
  Logger.log('║      TheVine to auto-discover the failover URL. No URL       ║');
  Logger.log('║      needs to be hardcoded in the_living_water.js.          ║');
  Logger.log('║   7. On the backup, set AppConfig: IS_BACKUP_INSTANCE=TRUE  ║');
  Logger.log('║   8. Run installHourlyTrigger() in this (backup mgr) project ║');
  Logger.log('║   9. Run deploymentChecklist() on the primary to verify all  ║');
  Logger.log('╚══════════════════════════════════════════════════════════════╝');
}


// ══════════════════════════════════════════════════════════════════════════════
//   STEP 4 — HOURLY BIDIRECTIONAL SYNC  (runs on the time-based trigger)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Bidirectional sync — runs every hour.
 * Determines the correct sync direction automatically:
 *   • Normally (primary is live):   primary → backup
 *   • During/after a failover:      backup  → primary
 *
 * Uses Google Drive's built-in lastModified timestamp on each sheet file
 * to detect which copy has newer writes. No changes to Single.gs required.
 *
 * ▶ Called automatically by the hourly trigger. Safe to run manually.
 */
function syncSheets() {
  var t0 = new Date();
  var props = PropertiesService.getScriptProperties();

  var backupId = BACKUP_CONFIG.BACKUP_SHEET_ID || props.getProperty('BACKUP_SHEET_ID');
  if (!backupId) {
    Logger.log('ERROR: No BACKUP_SHEET_ID found. Run createBackupSheet() first.');
    return;
  }

  _requireSourceId_();

  // ── Determine sync direction ──────────────────────────────────────────────
  //
  // After every sync this script sets LAST_SYNC = now.
  // If the backup file's lastModified is AFTER LAST_SYNC, that means something
  // wrote to it via the GAS API (users hitting the failover URL) — so we reverse.
  //
  var lastSyncRaw = props.getProperty('LAST_SYNC');
  var lastSyncTime = lastSyncRaw ? new Date(lastSyncRaw) : new Date(0);
  var backupLastModified = DriveApp.getFileById(backupId).getLastUpdated();

  var toBackup   = backupLastModified <= lastSyncTime; // normal direction
  var direction  = toBackup ? 'PRIMARY → BACKUP' : 'BACKUP → PRIMARY (failover detected)';

  var fromSS = toBackup
    ? SpreadsheetApp.openById(BACKUP_CONFIG.SOURCE_SHEET_ID)
    : SpreadsheetApp.openById(backupId);
  var toSS = toBackup
    ? SpreadsheetApp.openById(backupId)
    : SpreadsheetApp.openById(BACKUP_CONFIG.SOURCE_SHEET_ID);

  Logger.log('━━━ FlockOS SYNC — ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss') + ' ━━━');
  Logger.log('   Direction: ' + direction);
  Logger.log('   Backup last modified: ' + backupLastModified.toISOString());
  Logger.log('   Last sync completed:  ' + (lastSyncRaw || 'never'));

  // ── Sync tabs ─────────────────────────────────────────────────────────────
  var fromSheets = fromSS.getSheets();
  var skipSet = {};
  (BACKUP_CONFIG.SKIP_TABS || []).forEach(function(t) { skipSet[t] = true; });

  var synced = 0, skipped = 0, created = 0, errors = 0;

  for (var i = 0; i < fromSheets.length; i++) {
    // Execution time guard
    var elapsed = (new Date() - t0) / 1000;
    if (elapsed > BACKUP_CONFIG.MAX_EXEC_SECONDS) {
      Logger.log('⚠️  Stopping early — approaching GAS time limit (' + elapsed.toFixed(0) + 's). '
               + (fromSheets.length - i) + ' tabs not yet synced.');
      Logger.log('   Sync direction was: ' + direction);
      Logger.log('   The next hourly trigger will continue.');
      break;
    }

    var srcSheet = fromSheets[i];
    var name = srcSheet.getName();

    if (skipSet[name]) {
      skipped++;
      continue;
    }

    try {
      var lastRow = srcSheet.getLastRow();
      var lastCol = srcSheet.getLastColumn();

      var destSheet = toSS.getSheetByName(name);
      if (!destSheet) {
        destSheet = toSS.insertSheet(name);
        created++;
        Logger.log('   + Created new tab in destination: ' + name);
      }

      if (lastRow === 0 || lastCol === 0) {
        destSheet.clearContents();
        synced++;
        continue;
      }

      var data = srcSheet.getRange(1, 1, lastRow, lastCol).getValues();
      destSheet.clearContents();
      destSheet.getRange(1, 1, data.length, data[0].length).setValues(data);
      synced++;

    } catch (e) {
      errors++;
      Logger.log('   ✗ Error syncing tab [' + name + ']: ' + e.message);
    }
  }

  SpreadsheetApp.flush();

  var totalElapsed = ((new Date() - t0) / 1000).toFixed(1);

  // Record completed sync time and direction
  props.setProperty('LAST_SYNC', new Date().toISOString());
  props.setProperty('LAST_SYNC_TABS', String(synced));
  props.setProperty('LAST_SYNC_DIRECTION', direction);

  Logger.log('');
  Logger.log('━━━ SYNC COMPLETE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log('   Direction: ' + direction);
  Logger.log('   Synced:    ' + synced + ' tabs');
  Logger.log('   Created:   ' + created + ' new tab(s) in destination');
  Logger.log('   Skipped:   ' + skipped + ' tabs (AuditLog / excluded)');
  if (errors) Logger.log('   Errors:    ' + errors + ' tabs failed (see above)');
  Logger.log('   Time:      ' + totalElapsed + 's');
}

// Alias: old name kept so any manually bookmarked runs still work
var syncToBackup = syncSheets;


// ══════════════════════════════════════════════════════════════════════════════
//   TRIGGER MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Installs a time-based trigger that calls syncSheets() every 5 minutes (default).
 * The sync is bidirectional — it detects which copy is newer and syncs accordingly.
 * Run this ONCE after createBackupSheet() is complete.
 *
 * For real-time sync on every write, use installOnChangeTrigger() instead.
 *
 * @param {number} [intervalMinutes=5] — how often to sync (1, 5, 10, 15, 30, 60)
 * ▶ Run → installHourlyTrigger()
 */
function installHourlyTrigger(intervalMinutes) {
  var interval = Number(intervalMinutes) || 5;

  // Remove any existing triggers for this function first (prevent duplicates)
  _removeTriggersByFunction_('syncSheets');
  _removeTriggersByFunction_('syncToBackup'); // clean up old name if present
  _removeTriggersByFunction_('syncOnChange_');

  ScriptApp.newTrigger('syncSheets')
    .timeBased()
    .everyMinutes(interval)
    .create();

  Logger.log('✅ Time-based trigger installed → syncSheets() will run every ' + interval + ' minutes.');
  Logger.log('   Sync is bidirectional: primary→backup normally, backup→primary if failover detected.');
  Logger.log('   For real-time sync instead, run: installOnChangeTrigger()');
  Logger.log('   To remove: run removeAllTriggers()');
}


/**
 * Installs an onChange trigger on the PRIMARY sheet so syncSheets() fires
 * immediately on every write (appendRow, setValues, etc. from the GAS API).
 * Uses LockService so concurrent fires don't stack.
 *
 * ⚠ Use this for low-to-moderate traffic deployments.
 *   On very busy days (many simultaneous API writes) prefer installHourlyTrigger(5).
 *
 * ▶ Run → installOnChangeTrigger()
 */
function installOnChangeTrigger() {
  _requireSourceId_();

  // Remove all existing sync triggers (time-based or onChange)
  _removeTriggersByFunction_('syncSheets');
  _removeTriggersByFunction_('syncToBackup');
  _removeTriggersByFunction_('syncOnChange_');

  ScriptApp.newTrigger('syncOnChange_')
    .forSpreadsheet(BACKUP_CONFIG.SOURCE_SHEET_ID)
    .onChange()
    .create();

  Logger.log('✅ onChange trigger installed → syncOnChange_() fires on every write to the primary sheet.');
  Logger.log('   Concurrent fires are guarded by LockService (at most one sync at a time).');
  Logger.log('   For scheduled sync instead, run: installHourlyTrigger() or installHourlyTrigger(5)');
  Logger.log('   To remove: run removeAllTriggers()');
}


/**
 * onChange trigger target — wraps syncSheets() with a concurrency lock.
 * If a sync is already running when the trigger fires, the new fire is
 * silently skipped (the in-progress sync will capture the change anyway).
 *
 * Do NOT rename this function — the installed trigger references it by name.
 */
function syncOnChange_(e) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(0)) {
    // Another sync is already in progress — skip this fire
    return;
  }
  try {
    syncSheets();
  } finally {
    lock.releaseLock();
  }
}

/**
 * Removes ALL time-based triggers from this project. Use with caution.
 */
function removeAllTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(t) { ScriptApp.deleteTrigger(t); });
  Logger.log('Removed ' + triggers.length + ' trigger(s).');
}

/**
 * Shows the current backup config and last sync info in the Execution Log.
 */
function checkBackupStatus() {
  var props = PropertiesService.getScriptProperties();
  var backupId = BACKUP_CONFIG.BACKUP_SHEET_ID || props.getProperty('BACKUP_SHEET_ID') || '(not set — run createBackupSheet())';
  var lastSync = props.getProperty('LAST_SYNC') || '(never)';
  var lastTabs = props.getProperty('LAST_SYNC_TABS') || '—';

  Logger.log('╔══════════════════════════════════════════════════════════════╗');
  Logger.log('║     FlockOS BACKUP STATUS                                   ║');
  Logger.log('╠══════════════════════════════════════════════════════════════╣');
  Logger.log('║  Source (live):  ' + (BACKUP_CONFIG.SOURCE_SHEET_ID || '(not set)'));
  Logger.log('║  Backup sheet:   ' + backupId);
  var lastDir  = props.getProperty('LAST_SYNC_DIRECTION') || '—';

  Logger.log('║  Last sync:      ' + lastSync);
  Logger.log('║  Tabs synced:    ' + lastTabs);
  Logger.log('║  Last direction: ' + lastDir);

  // Show peer registration on the primary (informational — this script runs on the backup manager)
  var backupId = BACKUP_CONFIG.BACKUP_SHEET_ID || props.getProperty('BACKUP_SHEET_ID') || '';
  Logger.log('║');
  Logger.log('║  Peer reg status: open the PRIMARY GAS project and run:');
  Logger.log('║    registerPeer(\'' + (backupId || '<BACKUP_SHEET_ID>') + '\', \'<backup Web App URL>\')');

  // Show installed triggers
  var triggers = ScriptApp.getProjectTriggers();
  var syncTrigger = triggers.filter(function(t) {
    var fn = t.getHandlerFunction();
    return fn === 'syncSheets' || fn === 'syncToBackup' || fn === 'syncOnChange_';
  });
  if (syncTrigger.length) {
    var triggerType = syncTrigger[0].getHandlerFunction() === 'syncOnChange_' ? 'onChange (real-time)' : 'time-based';
    Logger.log('║  Sync trigger:   ✅ ACTIVE — ' + triggerType + ' (' + syncTrigger.length + ' installed)');
  } else {
    Logger.log('║  Hourly trigger: ⚠️  NOT INSTALLED — run installHourlyTrigger()');
  }
  Logger.log('╚══════════════════════════════════════════════════════════════╝');
}


// ══════════════════════════════════════════════════════════════════════════════
//   INTERNAL HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function _requireSourceId_() {
  if (!BACKUP_CONFIG.SOURCE_SHEET_ID) {
    throw new Error(
      'BACKUP_CONFIG.SOURCE_SHEET_ID is empty.\n' +
      'Paste your live Single.gs Google Sheet ID into the BACKUP_CONFIG at the top of this file.'
    );
  }
}

function _removeTriggersByFunction_(fnName) {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === fnName) ScriptApp.deleteTrigger(t);
  });
}
