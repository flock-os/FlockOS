/* ══════════════════════════════════════════════════════════════════════════════
   THE PAGANS — Dormant / Parked FlockOS Code
   "Go therefore and make disciples of all nations…" — Matthew 28:19

   This file holds code that is not currently active in FlockOS but is
   preserved for potential future use. Nothing in this file is loaded at
   runtime — all script tags have been removed from the HTML.

   ══════════════════════════════════════════════════════════════════════════════ */


/* ──────────────────────────────────────────────────────────────────────────────
   PARKED: TheWell (Google Drive Sync Layer)
   Originally in: the_well.js
   Parked on: 2025-01-XX
   Reason: Replaced with backup/restore/template system. Drive sync may be
           re-activated in a future release once OAuth2 deployment is simpler.
   ────────────────────────────────────────────────────────────────────────────── */

/*
const TheWell_DriveSync = (() => {
  'use strict';

  const LS_CONFIG_KEY  = 'flock_well_config';
  const LS_SYNC_KEY    = 'flock_well_last_sync';
  const SCOPES         = 'https://www.googleapis.com/auth/drive.file';
  const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3/files';
  const DRIVE_UPLOAD   = 'https://www.googleapis.com/upload/drive/v3/files';
  const XLSX_MIME      = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  const SPRING_FILES = {
    app:      { pattern: /matthew|app|content/i,  fallback: 'Flock_Content.xlsx' },
    flock:    { pattern: /john|flock|crm/i,       fallback: 'Flock_CRM.xlsx' },
    missions: { pattern: /mark|missions/i,        fallback: 'Flock_Missions.xlsx' },
    extra:    { pattern: /luke|extra|statistics/i, fallback: 'Flock_Statistics.xlsx' },
  };

  let _config = _loadConfig();
  let _accessToken = null;
  let _tokenExpiry = 0;
  let _tokenClient = null;
  let _syncing = false;
  let _syncInterval = null;
  let _fileMap = {};
  let _dirtyFlags = {};

  function _loadConfig() {
    try { return JSON.parse(localStorage.getItem(LS_CONFIG_KEY) || '{}'); }
    catch (_) { return {}; }
  }
  function _saveConfig() { localStorage.setItem(LS_CONFIG_KEY, JSON.stringify(_config)); }
  function configure(opts) {
    if (opts.folderId)    _config.folderId    = opts.folderId;
    if (opts.clientId)    _config.clientId    = opts.clientId;
    if (opts.syncMinutes) _config.syncMinutes = opts.syncMinutes;
    _saveConfig();
  }

  function _gisLoaded() { return typeof google !== 'undefined' && google.accounts && google.accounts.oauth2; }
  function _loadGIS() {
    return new Promise((resolve, reject) => {
      if (_gisLoaded()) { resolve(); return; }
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.onload = () => resolve(); s.onerror = () => reject(new Error('GIS load failed'));
      document.head.appendChild(s);
    });
  }

  async function authorize() {
    if (!_config.clientId) throw new Error('TheWell: clientId not configured');
    await _loadGIS();
    return new Promise((resolve, reject) => {
      _tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: _config.clientId, scope: SCOPES,
        callback: (resp) => {
          if (resp.error) { reject(new Error('Auth failed: ' + resp.error)); return; }
          _accessToken = resp.access_token;
          _tokenExpiry = Date.now() + (resp.expires_in * 1000) - 60000;
          resolve(_accessToken);
        },
      });
      _tokenClient.requestAccessToken();
    });
  }

  async function _ensureToken() {
    if (_accessToken && Date.now() < _tokenExpiry) return _accessToken;
    return authorize();
  }

  function deauthorize() {
    if (_accessToken && _gisLoaded()) google.accounts.oauth2.revoke(_accessToken);
    _accessToken = null; _tokenExpiry = 0; _stopAutoSync();
  }

  async function _driveGet(url, opts) {
    const token = await _ensureToken();
    const resp = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token, ...((opts && opts.headers) || {}) }, ...(opts || {}) });
    if (!resp.ok) throw new Error('Drive API error ' + resp.status);
    return resp;
  }

  async function _listFiles() {
    if (!_config.folderId) throw new Error('TheWell: folderId not configured');
    const q = encodeURIComponent("'" + _config.folderId + "' in parents and trashed=false and mimeType='" + XLSX_MIME + "'");
    const resp = await _driveGet(DRIVE_API_BASE + '?q=' + q + '&fields=files(id,name,modifiedTime,size)&orderBy=name');
    return (await resp.json()).files || [];
  }

  async function _downloadFile(fileId) {
    return (await _driveGet(DRIVE_API_BASE + '/' + encodeURIComponent(fileId) + '?alt=media')).arrayBuffer();
  }

  async function _uploadFile(fileId, blob) {
    const token = await _ensureToken();
    const resp = await fetch(DRIVE_UPLOAD + '/' + encodeURIComponent(fileId) + '?uploadType=media',
      { method: 'PATCH', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': XLSX_MIME }, body: blob });
    if (!resp.ok) throw new Error('Upload failed: ' + resp.status);
    return resp.json();
  }

  async function _createFile(fileName, blob) {
    const token = await _ensureToken();
    const metadata = { name: fileName, mimeType: XLSX_MIME, parents: [_config.folderId] };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);
    const resp = await fetch(DRIVE_UPLOAD + '?uploadType=multipart&fields=id,name,modifiedTime',
      { method: 'POST', headers: { 'Authorization': 'Bearer ' + token }, body: form });
    if (!resp.ok) throw new Error('Create file failed: ' + resp.status);
    return resp.json();
  }

  function _mapFilesToSprings(files) {
    const map = {};
    for (const [spring, info] of Object.entries(SPRING_FILES)) {
      const match = files.find(f => info.pattern.test(f.name));
      if (match) map[spring] = { fileId: match.id, name: match.name, modifiedTime: match.modifiedTime };
    }
    return map;
  }

  async function sync(opts) { // ... full sync logic preserved above in original the_well.js ... }
  async function push(opts) { // ... full push logic preserved above in original the_well.js ... }

  function _startAutoSync() { _stopAutoSync(); const m = _config.syncMinutes || 15; _syncInterval = setInterval(() => { if (!navigator.onLine) return; sync().catch(() => {}); }, m * 60 * 1000); }
  function _stopAutoSync() { if (_syncInterval) { clearInterval(_syncInterval); _syncInterval = null; } }

  function status() {
    return { configured: !!(_config.clientId && _config.folderId), authorized: !!_accessToken && Date.now() < _tokenExpiry,
      syncing: _syncing, autoSync: !!_syncInterval, lastSync: _getLastSync(), fileMap: Object.keys(_fileMap).length ? _fileMap : null, dirty: Object.keys(_dirtyFlags) };
  }

  async function enable(opts) { await authorize(); const r = await sync({ force: opts && opts.force }); _startAutoSync(); return r; }
  function disable() { deauthorize(); _stopAutoSync(); _dirtyFlags = {}; _fileMap = {}; }

  return Object.freeze({ configure, status, authorize, deauthorize, sync, push, enable, disable, SPRING_FILES });
})();
*/
