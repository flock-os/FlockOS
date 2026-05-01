/* ══════════════════════════════════════════════════════════════════════════════
   THE WELLSPRING — FlockOS Local Data Layer
   "Whoever drinks the water I give them will never thirst.
    Indeed, the water I give them will become in them a spring of water
    welling up to eternal life." — John 4:14

   Enables FlockOS to run from a single local .xls/.xlsx file loaded via the
   browser, stored in IndexedDB, and served through TheVine's resolver hook —
   no backend server required.

   EXPORTS:
     enable()         — Activate local mode
     disable()        — Return to cloud mode
     isActive()       — boolean
     load(file)       — Import .xls/.xlsx into IndexedDB
     exportDB()       — Download all data as .xlsx
     resolve(a,p)     — TheVine resolver hook
     getTab(name)     — Read all rows from a tab
     findById(t,id)   — Find row by ID
     appendRow(t,row) — Append a row
     updateRow(t,id,u)— Update a row
     deleteRow(t,id)  — Delete a row
     status()         — { active, loaded, ... }
     clearAll()       — Wipe IndexedDB
     vault            — { setup, unlock, exists, destroy }
   ══════════════════════════════════════════════════════════════════════════════ */

// ── Constants ─────────────────────────────────────────────────────────────────
const DB_NAME    = 'FlockOS_Wellspring';
const DB_VERSION = 2;
const STORE_NAME = 'sheets';
const META_STORE = 'meta';
const META_KEY   = 'database';
const LS_KEY     = 'flock_wellspring_mode';

let _db = null;
let _active = false;


// ── IndexedDB Setup ───────────────────────────────────────────────────────────

function _openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      for (const name of db.objectStoreNames) db.deleteObjectStore(name);
      db.createObjectStore(STORE_NAME);
      db.createObjectStore(META_STORE);
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(new Error('Wellspring: IndexedDB open failed'));
  });
}

function _tx(storeName, mode) {
  return _db.transaction(storeName, mode).objectStore(storeName);
}

function _put(storeName, key, value) {
  return new Promise((resolve, reject) => {
    const req = _tx(storeName, 'readwrite').put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function _get(storeName, key) {
  return new Promise((resolve, reject) => {
    const req = _tx(storeName, 'readonly').get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function _del(storeName, key) {
  return new Promise((resolve, reject) => {
    const req = _tx(storeName, 'readwrite').delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function _allKeys(storeName) {
  return new Promise((resolve, reject) => {
    const req = _tx(storeName, 'readonly').getAllKeys();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}


// ── .xls/.xlsx Parser (SheetJS) ───────────────────────────────────────────────

/**
 * Parse an Excel file and store all worksheets into IndexedDB.
 * @param {File} file
 * @returns {Promise<{ tabs: string[], rowCounts: Object, totalRows: number }>}
 */
export async function load(file) {
  if (typeof XLSX === 'undefined') throw new Error('Wellspring: SheetJS (XLSX) library not loaded.');
  await _openDB();

  const existingKeys = await _allKeys(STORE_NAME);
  for (const key of existingKeys) await _del(STORE_NAME, key);

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  const tabs = workbook.SheetNames;
  const rowCounts = {};
  let totalRows = 0;

  for (const tabName of tabs) {
    const sheet = workbook.Sheets[tabName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    await _put(STORE_NAME, tabName, rows);
    rowCounts[tabName] = rows.length;
    totalRows += rows.length;
  }

  await _put(META_STORE, META_KEY, {
    loadedAt: new Date().toISOString(),
    fileName: file.name,
    fileSize: file.size,
    tabCount: tabs.length,
    totalRows,
    tabs,
    rowCounts,
  });

  return { tabs, rowCounts, totalRows };
}


// ── Data Access ───────────────────────────────────────────────────────────────

/** Read all rows from a tab. */
export async function getTab(tabName) {
  await _openDB();
  return (await _get(STORE_NAME, tabName)) || [];
}

/** Find a row by its ID field. */
export async function findById(tabName, id) {
  const rows = await getTab(tabName);
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowId = row.id || row.Id || row.ID || Object.values(row)[0];
    if (String(rowId) === String(id)) return { rowIndex: i, row };
  }
  return null;
}

/** Append a row to a tab. */
export async function appendRow(tabName, rowData) {
  const rows = await getTab(tabName);
  rows.push(rowData);
  await _put(STORE_NAME, tabName, rows);
  return rowData;
}

/** Update a row by ID. */
export async function updateRow(tabName, id, updates) {
  const rows = await getTab(tabName);
  for (let i = 0; i < rows.length; i++) {
    const rowId = rows[i].id || rows[i].Id || rows[i].ID || Object.values(rows[i])[0];
    if (String(rowId) === String(id)) {
      Object.assign(rows[i], updates);
      await _put(STORE_NAME, tabName, rows);
      return rows[i];
    }
  }
  return null;
}

/** Delete a row by ID. */
export async function deleteRow(tabName, id) {
  const rows = await getTab(tabName);
  const filtered = rows.filter(row => {
    const rowId = row.id || row.Id || row.ID || Object.values(row)[0];
    return String(rowId) !== String(id);
  });
  if (filtered.length === rows.length) return false;
  await _put(STORE_NAME, tabName, filtered);
  return true;
}


// ── Action Resolver ───────────────────────────────────────────────────────────

/**
 * TheVine resolver. Register via TheVine.configure({ LOCAL_RESOLVER: resolve }).
 * @param {string} action
 * @param {Object} params
 * @returns {Promise<Object|undefined>} — undefined falls through to cloud
 */
export async function resolve(action, params = {}) {
  if (action === 'app.tab') {
    if (!params.tab) return { ok: false, error: 'Missing tab name' };
    return getTab(params.tab);
  }
  if (action === 'health') {
    return { ok: true, mode: 'local', source: 'TheWellspring', timestamp: new Date().toISOString() };
  }

  const parts = action.split('.');
  const entity = parts.length > 1 ? parts.slice(0, -1).join('.') : parts[0];
  const verb   = parts[parts.length - 1];
  const tabName = _entityToTab(entity);
  if (!tabName) return undefined;

  switch (verb) {
    case 'list': {
      let rows = await getTab(tabName);
      rows = _applyFilters(rows, params);
      return { ok: true, data: rows, count: rows.length };
    }
    case 'get': {
      if (!params.id) return { ok: false, error: 'Missing id' };
      const found = await findById(tabName, params.id);
      if (!found) return { ok: false, error: 'Not found' };
      return { ok: true, data: found.row };
    }
    case 'create': {
      if (!params.id) params.id = _uuid();
      params.createdAt = params.createdAt || new Date().toISOString();
      params.updatedAt = params.updatedAt || params.createdAt;
      return { ok: true, data: await appendRow(tabName, params) };
    }
    case 'update': {
      if (!params.id) return { ok: false, error: 'Missing id' };
      params.updatedAt = new Date().toISOString();
      const updated = await updateRow(tabName, params.id, params);
      if (!updated) return { ok: false, error: 'Not found' };
      return { ok: true, data: updated };
    }
    case 'delete': {
      if (!params.id) return { ok: false, error: 'Missing id' };
      const deleted = await deleteRow(tabName, params.id);
      return { ok: deleted, message: deleted ? 'Deleted' : 'Not found' };
    }
    case 'search': {
      let rows = await getTab(tabName);
      if (params.q) {
        const q = String(params.q).toLowerCase();
        rows = rows.filter(r => JSON.stringify(Object.values(r)).toLowerCase().includes(q));
      }
      return { ok: true, data: rows, count: rows.length };
    }
    case 'summary':
    case 'dashboard': {
      const rows = await getTab(tabName);
      return { ok: true, data: rows, count: rows.length, source: 'local' };
    }
    default:
      return undefined;
  }
}


// ── Entity → Tab Name mapping ─────────────────────────────────────────────────

function _entityToTab(entity) {
  const MAP = {
    'auth': 'AuthUsers', 'users': 'AuthUsers', 'access': 'AccessControl',
    'config': 'AppConfig', 'members': 'Members', 'prayer': 'PrayerRequests',
    'journal': 'JournalEntries', 'contacts': 'ContactLog', 'notes': 'PastoralNotes',
    'milestones': 'Milestones', 'households': 'Households', 'todo': 'ToDo',
    'attendance': 'Attendance', 'events': 'Events', 'groups': 'SmallGroups',
    'audit': 'AuditLog', 'giving': 'Giving', 'giving.pledges': 'GivingPledges',
    'volunteers': 'VolunteerSchedule',
    'comms': 'CommsMessages', 'comms.messages': 'CommsMessages',
    'comms.threads': 'CommsThreads', 'comms.notifications': 'CommsNotifications',
    'comms.channels': 'CommsChannels', 'comms.templates': 'CommsTemplates',
    'comms.broadcast': 'CommsBroadcasts', 'checkin': 'CheckInSessions',
    'ministries': 'Ministries', 'ministryMembers': 'MinistryMembers',
    'servicePlans': 'ServicePlans', 'serviceItems': 'ServicePlanItems',
    'care': 'SpiritualCareCases', 'care.interactions': 'SpiritualCareInteractions',
    'care.followUps': 'SpiritualCareCases', 'care.assignments': 'CareAssignments',
    'outreach': 'OutreachContacts', 'outreach.contacts': 'OutreachContacts',
    'outreach.campaigns': 'OutreachCampaigns', 'outreach.followUps': 'OutreachContacts',
    'sermons': 'Sermons', 'sermonSeries': 'SermonSeries', 'sermonReviews': 'SermonReviews',
    'songs': 'Songs',
    'compassion': 'CompassionRequests', 'compassion.requests': 'CompassionRequests',
    'compassion.resources': 'CompassionResources',
    'discipleship': 'DiscipleshipPaths', 'discipleship.paths': 'DiscipleshipPaths',
    'discipleship.steps': 'DiscipleshipSteps', 'discipleship.enrollments': 'DiscipleshipEnrollments',
    'discipleship.mentoring': 'DiscipleshipMentoring', 'discipleship.meetings': 'DiscipleshipMeetings',
    'discipleship.assessments': 'DiscipleshipAssessments', 'discipleship.resources': 'DiscipleshipResources',
    'discipleship.milestones': 'DiscipleshipMilestones', 'discipleship.goals': 'DiscipleshipGoals',
    'discipleship.certificates': 'DiscipleshipCertificates',
    'learning': 'LearningTopics', 'learning.topics': 'LearningTopics',
    'learning.playlists': 'LearningPlaylists', 'learning.playlistItems': 'LearningPlaylistItems',
    'learning.progress': 'LearningProgress', 'learning.notes': 'LearningNotes',
    'learning.bookmarks': 'LearningBookmarks', 'learning.recommendations': 'LearningRecommendations',
    'learning.quizzes': 'LearningQuizzes', 'learning.quizResults': 'LearningQuizResults',
    'learning.certificates': 'LearningCertificates', 'learning.sermons': 'Sermons',
    'theology': 'TheologyCategories', 'theology.categories': 'TheologyCategories',
    'theology.sections': 'TheologySections', 'theology.scriptures': 'TheologyScriptures',
    'theology.revisions': 'TheologyRevisions',
    'memberCards': 'MemberCards', 'memberCards.links': 'MemberCardLinks',
    'memberCards.views': 'MemberCardViews', 'reports': 'Members',
    'user.preferences': 'UserProfiles', 'church': 'AppConfig', 'bulk': 'Members',
    'missions': 'MissionsRegistry', 'missions.registry': 'MissionsRegistry',
    'missions.regions': 'MissionsRegions', 'missions.cities': 'MissionsCities',
    'missions.partners': 'MissionsPartners', 'missions.prayerFocus': 'MissionsPrayerFocus',
    'missions.updates': 'MissionsUpdates', 'missions.teams': 'MissionsTeams',
    'missions.metrics': 'MissionsMetrics',
    'statistics': 'StatisticsConfig', 'statistics.config': 'StatisticsConfig',
    'statistics.snapshots': 'StatisticsSnapshots', 'statistics.views': 'StatisticsViews',
  };
  return MAP[entity] || null;
}

function _applyFilters(rows, params) {
  const skip = new Set(['action', 'token', 'authEmail', 'email', '_', 'limit', 'offset']);
  const filters = {};
  for (const k of Object.keys(params)) {
    if (!skip.has(k) && params[k] !== '' && params[k] != null) {
      filters[k] = String(params[k]).toLowerCase();
    }
  }
  if (!Object.keys(filters).length) return rows;
  return rows.filter(row => {
    for (const [key, val] of Object.entries(filters)) {
      const rowVal = row[key];
      if (rowVal == null || String(rowVal).toLowerCase() !== val) return false;
    }
    return true;
  });
}

function _uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}


// ── Enable / Disable ──────────────────────────────────────────────────────────

export async function enable() {
  await _openDB();
  _active = true;
  localStorage.setItem(LS_KEY, 'true');
  if (typeof TheVine !== 'undefined') TheVine.configure({ LOCAL_RESOLVER: resolve });
  if (localStorage.getItem('FLOCKOS_DEBUG')) console.log('[Wellspring] Local data mode ENABLED');
}

export function disable() {
  _active = false;
  localStorage.removeItem(LS_KEY);
  if (typeof TheVine !== 'undefined') TheVine.configure({ LOCAL_RESOLVER: null });
  if (localStorage.getItem('FLOCKOS_DEBUG')) console.log('[Wellspring] Local data mode DISABLED');
}

export function isActive() { return _active; }


// ── Export DB ─────────────────────────────────────────────────────────────────

export async function exportDB() {
  if (typeof XLSX === 'undefined') throw new Error('Wellspring: SheetJS not loaded.');
  await _openDB();
  const meta = await _get(META_STORE, META_KEY);
  if (!meta || !meta.tabs) throw new Error('No local data loaded. Import a database file first.');

  const workbook = XLSX.utils.book_new();
  for (const tabName of meta.tabs) {
    const rows = await getTab(tabName);
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), tabName);
  }
  const fileName = 'FlockOS_Database_' + new Date().toISOString().slice(0, 10) + '.xlsx';
  XLSX.writeFile(workbook, fileName);
  return fileName;
}


// ── Status / Clear ────────────────────────────────────────────────────────────

export async function status() {
  await _openDB();
  const meta = await _get(META_STORE, META_KEY);
  if (meta) {
    return { active: _active, loaded: true, fileName: meta.fileName,
             fileSize: meta.fileSize, tabCount: meta.tabCount,
             totalRows: meta.totalRows, loadedAt: meta.loadedAt };
  }
  return { active: _active, loaded: false };
}

export async function clearAll() {
  await _openDB();
  for (const key of await _allKeys(STORE_NAME)) await _del(STORE_NAME, key);
  await _del(META_STORE, META_KEY);
}


// ── Auto-enable on page load ──────────────────────────────────────────────────
if (localStorage.getItem(LS_KEY) === 'true') {
  setTimeout(() => enable().catch(e => console.warn('[Wellspring] Auto-enable failed:', e)), 0);
}


/* ═══════════════════════════════════════════════════════════════════════════
   OFFLINE VAULT — AES-GCM encrypted credential store
   PIN → PBKDF2 key → AES-GCM encrypt/decrypt session blob in IndexedDB.
   PIN is NEVER stored. Brute-force mitigated by PBKDF2 cost (100k iter).
   ═══════════════════════════════════════════════════════════════════════════ */

const VAULT_STORE      = 'vault';
const VAULT_KEY        = 'credentials';
const VAULT_ITERATIONS = 100000;

function _ensureVaultStore() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION + 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(VAULT_STORE)) db.createObjectStore(VAULT_STORE);
    };
    req.onsuccess = () => { _db = req.result; resolve(); };
    req.onerror = () => reject(new Error('Vault store init failed'));
  });
}

async function _deriveKey(pin, salt) {
  const raw = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: VAULT_ITERATIONS, hash: 'SHA-256' },
    raw, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}

async function _vaultSetup(pin, sessionData) {
  if (!pin || pin.length < 6) throw new Error('PIN must be at least 6 characters');
  await _ensureVaultStore();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12));
  const key  = await _deriveKey(pin, salt);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key,
    new TextEncoder().encode(JSON.stringify(sessionData)));
  const blob = {
    salt: Array.from(salt), iv: Array.from(iv),
    cipher: Array.from(new Uint8Array(cipher)),
    createdAt: Date.now(), expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };
  return new Promise((resolve, reject) => {
    const tx = _db.transaction(VAULT_STORE, 'readwrite');
    tx.objectStore(VAULT_STORE).put(blob, VAULT_KEY);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(new Error('Vault write failed'));
  });
}

async function _vaultUnlock(pin) {
  await _ensureVaultStore();
  const blob = await new Promise((resolve, reject) => {
    const tx = _db.transaction(VAULT_STORE, 'readonly');
    const req = tx.objectStore(VAULT_STORE).get(VAULT_KEY);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new Error('Vault read failed'));
  });
  if (!blob) throw new Error('No vault found — set up offline access first');
  if (blob.expiresAt && Date.now() > blob.expiresAt) {
    await _vaultDestroy();
    throw new Error('Vault expired — please log in online to re-enable offline access');
  }
  const key = await _deriveKey(pin, new Uint8Array(blob.salt));
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(blob.iv) }, key, new Uint8Array(blob.cipher));
    const session = JSON.parse(new TextDecoder().decode(plain));
    session.offline = true;
    session.offlineUnlockedAt = Date.now();
    return session;
  } catch (_) {
    throw new Error('Invalid PIN');
  }
}

async function _vaultExists() {
  try {
    await _ensureVaultStore();
    const blob = await new Promise((resolve) => {
      const tx = _db.transaction(VAULT_STORE, 'readonly');
      const req = tx.objectStore(VAULT_STORE).get(VAULT_KEY);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
    return !!blob && (!blob.expiresAt || Date.now() < blob.expiresAt);
  } catch (_) { return false; }
}

async function _vaultDestroy() {
  await _ensureVaultStore();
  return new Promise((resolve, reject) => {
    const tx = _db.transaction(VAULT_STORE, 'readwrite');
    tx.objectStore(VAULT_STORE).delete(VAULT_KEY);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(new Error('Vault delete failed'));
  });
}

export const vault = Object.freeze({
  setup:   _vaultSetup,
  unlock:  _vaultUnlock,
  exists:  _vaultExists,
  destroy: _vaultDestroy,
});
