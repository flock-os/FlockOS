/* ══════════════════════════════════════════════════════════════════════════════
   THE SCROLLS  — Unified Interaction Ledger
   Every touch, call, text, email, visit, note, prayer and pastoral action
   tracked in a searchable, filterable timeline — per person and globally.

   Depends on: Nehemiah (firm_foundation.js), TheVine (the_true_vine.js)

   "In the scroll of the book it is written of me." — Psalm 40:7
   ══════════════════════════════════════════════════════════════════════════════ */

const TheScrolls = (() => {
  'use strict';

  // ── Storage ─────────────────────────────────────────────────────────────
  var STORE_KEY  = 'flock_scrolls';
  var MAX_ENTRIES = 2000;
  var _entries = [];
  var _loaded  = false;

  // ── Interaction types ───────────────────────────────────────────────────
  var TYPES = {
    PROFILE_VIEW:      'profile_view',
    PROFILE_SAVE:      'profile_save',
    CALL:              'call',
    TEXT:              'text',
    EMAIL:             'email',
    VISIT:             'visit',
    NOTE:              'note',
    PRAYER:            'prayer',
    PRAYER_REPLY:      'prayer_reply',
    CARE_CREATE:       'care_create',
    CARE_UPDATE:       'care_update',
    CARE_RESOLVE:      'care_resolve',
    CARE_INTERACTION:  'care_interaction',
    COMPASSION_CREATE: 'compassion_create',
    COMPASSION_UPDATE: 'compassion_update',
    COMPASSION_APPROVE:'compassion_approve',
    COMPASSION_DENY:   'compassion_deny',
    OUTREACH_CREATE:   'outreach_create',
    OUTREACH_UPDATE:   'outreach_update',
    OUTREACH_FOLLOWUP: 'outreach_followup',
    MEMBER_CREATE:     'member_create',
    CARD_CREATE:       'card_create',
    GROUP_CREATE:      'group_create',
    GROUP_UPDATE:      'group_update',
    ATTENDANCE:        'attendance',
    APPROVAL:          'approval',
    DENIAL:            'denial',
    MESSAGE_SENT:      'message_sent',
    FOLLOW_UP:         'follow_up',
    CHECK_IN:          'check_in',
    SEARCH:            'search',
  };

  // ── Type metadata (icon, label, colour) ─────────────────────────────────
  var META = {
    profile_view:      { icon: '\uD83D\uDC64', label: 'Viewed Profile',     color: 'info' },
    profile_save:      { icon: '\uD83D\uDCBE', label: 'Saved Profile',      color: 'success' },
    call:              { icon: '\uD83D\uDCDE', label: 'Phone Call',          color: 'accent' },
    text:              { icon: '\uD83D\uDCAC', label: 'Text Message',        color: 'accent' },
    email:             { icon: '\uD83D\uDCE7', label: 'Email',              color: 'accent' },
    visit:             { icon: '\uD83C\uDFE0', label: 'Visit',              color: 'success' },
    note:              { icon: '\uD83D\uDCDD', label: 'Note',               color: 'info' },
    prayer:            { icon: '\uD83D\uDE4F', label: 'Prayer',             color: 'accent' },
    prayer_reply:      { icon: '\uD83D\uDE4F', label: 'Prayer Reply',       color: 'success' },
    care_create:       { icon: '\u2764\uFE0F', label: 'Care Case Opened',   color: 'warn' },
    care_update:       { icon: '\u2764\uFE0F', label: 'Care Updated',       color: 'info' },
    care_resolve:      { icon: '\u2705',       label: 'Care Resolved',      color: 'success' },
    care_interaction:  { icon: '\u2764\uFE0F', label: 'Care Interaction',   color: 'accent' },
    compassion_create: { icon: '\uD83D\uDC9D', label: 'Compassion Request', color: 'warn' },
    compassion_update: { icon: '\uD83D\uDC9D', label: 'Compassion Updated', color: 'info' },
    compassion_approve:{ icon: '\u2705',       label: 'Compassion Approved',color: 'success' },
    compassion_deny:   { icon: '\u274C',       label: 'Compassion Denied',  color: 'danger' },
    outreach_create:   { icon: '\u261E',       label: 'Outreach Contact',   color: 'accent' },
    outreach_update:   { icon: '\u261E',       label: 'Outreach Updated',   color: 'info' },
    outreach_followup: { icon: '\u261E',       label: 'Outreach Follow-Up', color: 'warn' },
    member_create:     { icon: '\uD83D\uDC64', label: 'Member Created',     color: 'success' },
    card_create:       { icon: '\uD83E\uDEAA', label: 'Card Created',       color: 'success' },
    group_create:      { icon: '\uD83D\uDC65', label: 'Group Created',      color: 'success' },
    group_update:      { icon: '\uD83D\uDC65', label: 'Group Updated',      color: 'info' },
    attendance:        { icon: '\uD83D\uDCCB', label: 'Attendance',         color: 'info' },
    approval:          { icon: '\u2705',       label: 'Approved',           color: 'success' },
    denial:            { icon: '\u274C',       label: 'Denied',             color: 'danger' },
    message_sent:      { icon: '\u2709\uFE0F', label: 'Message Sent',       color: 'accent' },
    follow_up:         { icon: '\uD83D\uDD14', label: 'Follow-Up',          color: 'warn' },
    check_in:          { icon: '\u2714',       label: 'Check-In',           color: 'success' },
    search:            { icon: '\uD83D\uDD0D', label: 'Search',             color: 'info' },
  };

  // ── Helpers ─────────────────────────────────────────────────────────────
  function _e(s) {
    if (s == null) return '';
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(String(s)));
    return d.innerHTML;
  }
  function _badge(text, cls) {
    return '<span class="badge badge-' + (cls || 'info') + '">' + _e(text) + '</span>';
  }
  function _relTime(ts) {
    if (!ts) return '';
    var s = String(ts);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += 'T00:00:00';
    var ms = Date.now() - new Date(s).getTime();
    if (ms < 60000)     return 'just now';
    if (ms < 3600000)   return Math.floor(ms / 60000) + 'm ago';
    if (ms < 86400000)  return Math.floor(ms / 3600000) + 'h ago';
    if (ms < 604800000) return Math.floor(ms / 86400000) + 'd ago';
    return ts.substring(0, 10);
  }

  // ── Persistence (localStorage) ──────────────────────────────────────────
  function _load() {
    if (_loaded) return;
    try {
      var raw = localStorage.getItem(STORE_KEY);
      _entries = raw ? JSON.parse(raw) : [];
    } catch (_) { _entries = []; }
    _loaded = true;
  }
  function _save() {
    try {
      if (_entries.length > MAX_ENTRIES) _entries = _entries.slice(-MAX_ENTRIES);
      localStorage.setItem(STORE_KEY, JSON.stringify(_entries));
    } catch (_) {}
  }

  // ── Core: log an interaction ────────────────────────────────────────────
  function log(type, personId, detail, extra) {
    _load();
    var session = (typeof Nehemiah !== 'undefined' && Nehemiah.getSession)
      ? Nehemiah.getSession() : {};
    var entry = {
      id:         Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      ts:         new Date().toISOString(),
      type:       type,
      user:       (session && session.email) || '?',
      personId:   personId || '',
      personName: (extra && extra.personName) || '',
      detail:     detail || '',
      extra:      extra || {},
    };
    _entries.push(entry);
    _save();
    _syncBackend(entry);
    return entry;
  }

  // ── Fire-and-forget backend sync ────────────────────────────────────────
  function _syncBackend(entry) {
    try {
      if (typeof TheVine !== 'undefined' && TheVine.luke && TheVine.luke.statistics) {
        TheVine.luke.statistics.createSnapshot({
          metricName: 'flock.scroll.' + entry.type,
          h1: entry.user,
          h2: entry.personId,
          h3: entry.detail,
          h4: entry.personName,
          h5: entry.ts,
        }).catch(function() {});
      }
    } catch (_) {}
  }

  // ── Queries ─────────────────────────────────────────────────────────────
  function timeline(personId, limit) {
    _load();
    var key = (personId || '').toLowerCase();
    var out = _entries.filter(function(e) {
      return (e.personId || '').toLowerCase() === key;
    });
    out.sort(function(a, b) { return (b.ts || '').localeCompare(a.ts || ''); });
    return limit ? out.slice(0, limit) : out;
  }

  function feed(limit) {
    _load();
    var out = _entries.slice();
    out.sort(function(a, b) { return (b.ts || '').localeCompare(a.ts || ''); });
    return out.slice(0, limit || 100);
  }

  function search(query) {
    _load();
    var q = (query || '').toLowerCase().trim();
    if (!q) return feed(100);
    return _entries.filter(function(e) {
      return (e.personName || '').toLowerCase().indexOf(q) >= 0
        || (e.personId || '').toLowerCase().indexOf(q) >= 0
        || (e.detail || '').toLowerCase().indexOf(q) >= 0
        || (e.type || '').toLowerCase().indexOf(q) >= 0
        || (e.user || '').toLowerCase().indexOf(q) >= 0;
    }).sort(function(a, b) { return (b.ts || '').localeCompare(a.ts || ''); });
  }

  function stats() {
    _load();
    var today = new Date().toISOString().substring(0, 10);
    var todayCount = _entries.filter(function(e) { return e.ts && e.ts.substring(0, 10) === today; }).length;
    var typeCts = {};
    _entries.forEach(function(e) {
      typeCts[e.type] = (typeCts[e.type] || 0) + 1;
    });
    return { total: _entries.length, today: todayCount, byType: typeCts };
  }

  // ── HTML renderers ──────────────────────────────────────────────────────
  function renderTimeline(entries) {
    if (!entries || !entries.length)
      return '<div style="padding:40px;text-align:center;color:var(--ink-muted);">'
        + '<div style="font-size:2rem;margin-bottom:8px;">\uD83D\uDCDC</div>'
        + 'No interactions recorded yet.</div>';
    var h = '<div class="scroll-timeline" style="max-width:800px;">';
    entries.forEach(function(e) {
      var m = META[e.type] || { icon: '\u2022', label: e.type, color: 'info' };
      h += '<div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--line);">';
      h += '<div style="font-size:1.2rem;width:28px;text-align:center;flex-shrink:0;padding-top:2px;">' + m.icon + '</div>';
      h += '<div style="flex:1;min-width:0;">';
      h += '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">';
      h += '<span>' + _badge(m.label, m.color) + '</span>';
      h += '<span style="font-size:0.72rem;color:var(--ink-muted);white-space:nowrap;">' + _e(_relTime(e.ts)) + '</span>';
      h += '</div>';
      h += '<div style="font-size:0.84rem;margin-top:3px;">';
      if (e.personName) h += '<strong>' + _e(e.personName) + '</strong> \u00B7 ';
      h += _e(e.detail);
      h += '</div>';
      h += '<div style="font-size:0.7rem;color:var(--ink-muted);margin-top:2px;">' + _e(e.user) + '</div>';
      h += '</div></div>';
    });
    h += '</div>';
    return h;
  }

  function renderPersonTimeline(personId) {
    return renderTimeline(timeline(personId, 50));
  }

  // ── Dashboard app ───────────────────────────────────────────────────────
  function renderApp(container, opts) {
    opts = opts || {};
    _load();

    var h = '';
    if (!opts.embedded) {
      h += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;">';
      h += '<button onclick="TheLife.backToHub()" style="background:none;border:1px solid var(--line);border-radius:6px;padding:6px 14px;cursor:pointer;color:var(--ink);font-size:0.84rem;">\u2190 Return to Dashboard</button>';
      h += '<h2 style="font-size:1.1rem;color:var(--accent);margin:0;">\uD83D\uDCDC The Scrolls \u2014 Activity Log</h2>';
      h += '</div>';
    }

    // search + filter bar
    h += '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:14px;">';
    h += '<input id="scroll-q" type="search" placeholder="Search interactions\u2026"'
       + ' oninput="TheScrolls._appSearch(this.value)"'
       + ' style="flex:1;min-width:200px;background:rgba(255,255,255,0.07);border:1px solid var(--line);border-radius:6px;padding:8px 12px;color:var(--ink);font-size:0.88rem;font-family:inherit;">';
    h += '<select id="scroll-tf" onchange="TheScrolls._appFilter(this.value)"'
       + ' style="background:rgba(255,255,255,0.07);border:1px solid var(--line);border-radius:6px;padding:8px 12px;color:var(--ink);font-size:0.84rem;font-family:inherit;">'
       + '<option value="">All Types</option>';
    Object.keys(META).forEach(function(k) {
      h += '<option value="' + k + '">' + META[k].icon + ' ' + META[k].label + '</option>';
    });
    h += '</select></div>';

    // stat pills
    var st = stats();
    h += '<div style="display:flex;gap:16px;margin-bottom:14px;font-size:0.76rem;color:var(--ink-muted);flex-wrap:wrap;">';
    h += '<span>' + st.total + ' total interactions</span>';
    h += '<span>' + st.today + ' today</span>';
    h += '</div>';

    // feed
    h += '<div id="scroll-feed">' + renderTimeline(feed(50)) + '</div>';
    container.innerHTML = h;
  }

  function _appSearch(q) {
    var el = document.getElementById('scroll-feed');
    if (el) el.innerHTML = renderTimeline(q ? search(q).slice(0, 50) : feed(50));
  }
  function _appFilter(type) {
    _load();
    var list = type
      ? _entries.filter(function(e) { return e.type === type; })
          .sort(function(a, b) { return (b.ts || '').localeCompare(a.ts || ''); }).slice(0, 50)
      : feed(50);
    var el = document.getElementById('scroll-feed');
    if (el) el.innerHTML = renderTimeline(list);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════════════════
  return {
    TYPES:   TYPES,
    META:    META,
    log:     log,
    timeline: timeline,
    feed:    feed,
    search:  search,
    stats:   stats,
    renderApp:             renderApp,
    renderTimeline:        renderTimeline,
    renderPersonTimeline:  renderPersonTimeline,
    _appSearch:  _appSearch,
    _appFilter:  _appFilter,
  };
})();
