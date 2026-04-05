/* ══════════════════════════════════════════════════════════════════════════════
   LOVE IN ACTION  — Care · Prayer · Compassion · Outreach
   Unified pastoral care hub that delegates full-page editing to TheLife.

   "Dear children, let us not love with words or speech but with actions
    and in truth." — 1 John 3:18

   Depends on: TheVine (the_true_vine.js), TheLife (the_life.js),
               TheScrolls (the_scrolls.js), Nehemiah (firm_foundation.js)
   ══════════════════════════════════════════════════════════════════════════════ */

const LoveInAction = (() => {
  'use strict';

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
  function _statusBadge(val) {
    var t = String(val || '').toUpperCase();
    if (['TRUE','ACTIVE','OPEN','PUBLISHED','ANSWERED','YES','APPROVED','COMPLETE'].includes(t))
      return _badge(val, 'success');
    if (['FALSE','INACTIVE','CLOSED','ARCHIVED','CANCELLED','DENIED','NO'].includes(t))
      return _badge(val, 'warn');
    if (['URGENT','HIGH','PENDING','DRAFT','NEW','CRITICAL'].includes(t))
      return _badge(val, 'danger');
    return _badge(val, 'info');
  }
  function _spinner() {
    return '<div style="text-align:center;padding:80px 20px;color:var(--ink-muted);">'
      + '<div class="spinner" style="margin:0 auto 16px;width:32px;height:32px;border:3px solid var(--line);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite;"></div>'
      + 'Loading\u2026</div>';
  }
  function _empty(icon, msg) {
    return '<div class="flock-empty"><div class="flock-empty-icon">' + icon + '</div>' + _e(msg) + '</div>';
  }
  // ── Seed-admin / Lead Pastor visibility gate ───────────────────────────
  var _TERMINAL_STATUSES = ['resolved','closed','archived','cancelled','denied','completed','answered','inactive','deleted'];
  function _isSeedAdmin() {
    try { var s = TheVine.session(); return !!(s && s.isSeed); } catch(e) { return false; }
  }
  function _isLeadPastor() {
    try { return Nehemiah.hasGroup('Lead Pastor'); } catch(e) { return false; }
  }
  function _canViewNotes() {
    return _isSeedAdmin() || _isLeadPastor();
  }
  function _filterClosed(rows, statusKey) {
    if (_canViewNotes()) {
      // Lead Pastors / seed admins: active cases always; terminal statuses only within 7 days.
      var sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      return rows.filter(function(r) {
        var s = String(statusKey ? r[statusKey] : (r.status || r['Status'] || r.stage || '')).toLowerCase();
        if (_TERMINAL_STATUSES.indexOf(s) === -1) return true; // active — always show
        var ts = r.updatedAt || r.resolvedAt || r.closedAt || r.createdAt || '';
        if (!ts) return false;
        return new Date(ts).getTime() >= sevenDaysAgo;
      });
    }
    return rows.filter(function(r) {
      var s = String(statusKey ? r[statusKey] : (r.status || r['Status'] || r.stage || '')).toLowerCase();
      return _TERMINAL_STATUSES.indexOf(s) === -1;
    });
  }
  function _rows(res) {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.rows)) return res.rows;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.results)) return res.results;
    if (Array.isArray(res.items)) return res.items;
    return [];
  }
  function _memberName(id) {
    if (typeof TheLife !== 'undefined' && TheLife._memberName) return TheLife._memberName(id);
    return id || '';
  }

  // ── Card renderer (matches TheLife's flock-card pattern) ──────────────
  function _card(opts) {
    var priCls = '';
    var pri = (opts.priority || '').toLowerCase();
    if (pri === 'critical' || pri === 'high') priCls = ' priority-high';
    else if (pri === 'urgent') priCls = ' priority-urgent';
    var h = '<div class="flock-card' + priCls + '"' + (opts.onclick ? ' onclick="' + opts.onclick + '"' : '') + '>';
    h += '<div class="flock-card-head"><span class="flock-card-name">' + (opts.name || '') + '</span>';
    h += '<div class="flock-card-pills">' + (opts.pills || '') + '</div></div>';
    if (opts.body) h += '<div class="flock-card-body">' + opts.body + '</div>';
    var foot = [];
    if (opts.assigned) foot.push('<span class="assigned">' + _e(opts.assigned) + '</span>');
    if (opts.date)     foot.push('<span>' + _e(opts.date) + '</span>');
    if (opts.extra)    foot.push(opts.extra);
    if (foot.length) h += '<div class="flock-card-foot">' + foot.join(' \u00B7 ') + '</div>';
    h += '</div>';
    return h;
  }

  // ── State ───────────────────────────────────────────────────────────────
  var _container  = null;
  var _activeTab  = 'care';
  var _cache      = { care: [], prayer: [], compassion: [], outreach: [], assignments: [], followups: [] };
  var _lazyLoading = { assignments: false, followups: false };

  // ── TTL-aware fetch — shares TheVine's in-memory cache with renderHub ──
  // Uses the same 'tab:*' keys as the_tabernacle.js _fetch(), so data loaded
  // by renderHub (care, prayer, compassion, outreach) is served instantly
  // from memory on the first Love in Action render — zero extra network calls.
  var _TTL_CRM = 300000; // 5 min — matches _TTL.crm in the_tabernacle.js
  function _nurture(key, fetcher) {
    if (typeof TheVine !== 'undefined' && TheVine.nurture)
      return TheVine.nurture('tab:' + key, fetcher, { ttl: _TTL_CRM });
    return fetcher();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MAIN APP — tabs + card grids, delegates to TheLife for full-page edits
  // ══════════════════════════════════════════════════════════════════════════

  async function renderApp(container, opts) {
    _container = container;
    opts = opts || {};
    if (opts.tab) _activeTab = opts.tab;
    container.innerHTML = _spinner();

    // Parallel-load 4 core data sources via the shared TheVine cache.
    // assignments + followups are lazy-loaded on first tab click.
    try {
      var res = await Promise.allSettled([
        _nurture('care',       () => TheVine.flock.care.list({ limit: 100 })),
        _nurture('prayer',     () => TheVine.flock.prayer.list({ limit: 100 })),
        _nurture('compassion', () => TheVine.flock.compassion.requests.list({ limit: 50 })),
        _nurture('outreach',   () => TheVine.flock.outreach.contacts.list({ limit: 50 })),
      ]);
      _cache.care        = _filterClosed(_rows(res[0].status === 'fulfilled' ? res[0].value : []));
      _cache.prayer      = _filterClosed(_rows(res[1].status === 'fulfilled' ? res[1].value : []), 'Status');
      _cache.compassion  = _filterClosed(_rows(res[2].status === 'fulfilled' ? res[2].value : []));
      _cache.outreach    = _filterClosed(_rows(res[3].status === 'fulfilled' ? res[3].value : []));
      // Reset lazy-tab state so they always fetch fresh data on this renderApp call
      _cache.assignments = [];
      _cache.followups   = [];
      _lazyLoading.assignments = false;
      _lazyLoading.followups   = false;
    } catch (_) {}

    var h = '';

    // ← Return to Dashboard
    if (!opts.embedded) {
        h += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;">';
      h += '<button onclick="TheLife.backToHub()" style="background:none;border:1px solid var(--line);border-radius:6px;padding:6px 14px;cursor:pointer;color:var(--ink);font-size:0.84rem;">\u2190 Return to Dashboard</button>';
      h += '<h2 style="font-size:1.1rem;color:var(--accent);margin:0;">\u2764\uFE0F Love in Action</h2>';
      h += '</div>';
    }

    // KPI ribbon
    var nCare = _cache.care.length;
    var nOpen = _cache.care.filter(function(c) { return c.status === 'open' || c.status === 'in-progress'; }).length;
    var nPray = _cache.prayer.length;
    var nComp = _cache.compassion.length;
    var nPend = _cache.compassion.filter(function(c) { return c.status === 'pending'; }).length;
    var nOut  = _cache.outreach.length;
    var nAsgn = _cache.assignments.length;
    var nFU   = _cache.followups.filter(function(f) { return !/^(done|completed|complete)$/i.test(f.status || ''); }).length;

    h += '<div class="flock-dashboard-strip" style="margin-bottom:14px;">';
    h += '<div class="flock-dash-item"><span class="flock-dash-val">' + nCare + '</span><span class="flock-dash-label">Care Cases</span></div>';
    h += '<div class="flock-dash-item"><span class="flock-dash-val" style="color:var(--danger);">' + nOpen + '</span><span class="flock-dash-label">Open</span></div>';
    h += '<div class="flock-dash-item"><span class="flock-dash-val">' + nPray + '</span><span class="flock-dash-label">Prayers</span></div>';
    h += '<div class="flock-dash-item"><span class="flock-dash-val">' + nComp + '</span><span class="flock-dash-label">Compassion</span></div>';
    if (nPend) h += '<div class="flock-dash-item"><span class="flock-dash-val" style="color:var(--warn);">' + nPend + '</span><span class="flock-dash-label">Pending</span></div>';
    h += '<div class="flock-dash-item"><span class="flock-dash-val">' + nOut + '</span><span class="flock-dash-label">Outreach</span></div>';
    h += '<div class="flock-dash-item"><span class="flock-dash-val">' + nAsgn + '</span><span class="flock-dash-label">Assignments</span></div>';
    if (nFU) h += '<div class="flock-dash-item"><span class="flock-dash-val" style="color:var(--danger);">' + nFU + '</span><span class="flock-dash-label">Follow-Ups Due</span></div>';
    h += '</div>';

    // Search bar
    h += '<div style="margin-bottom:14px;">';
    h += '<input id="lia-q" type="search" placeholder="Search cases, names, notes\u2026"'
       + ' oninput="LoveInAction._search(this.value)"'
       + ' style="width:100%;max-width:480px;background:rgba(255,255,255,0.07);border:1px solid var(--line);border-radius:6px;padding:8px 12px;color:var(--ink);font-size:0.88rem;font-family:inherit;">';
    h += '</div>';

    // Tab bar
    h += '<div style="display:flex;gap:2px;border-bottom:2px solid var(--line);margin-bottom:16px;overflow-x:auto;-webkit-overflow-scrolling:touch;">';
    ['care', 'prayer', 'compassion', 'outreach', 'assignments', 'followups'].forEach(function(key) {
      var labels = { care: '\u2764\uFE0F Care', prayer: '\uD83D\uDE4F Prayer', compassion: '\u2665 Compassion', outreach: '\u261E Outreach', assignments: '\uD83D\uDC65 Assignments', followups: '\u23F0 Follow-Ups' };
      var counts = { care: nCare, prayer: nPray, compassion: nComp, outreach: nOut, assignments: nAsgn, followups: nFU };
      var active = key === _activeTab;
      h += '<button class="flock-tab' + (active ? ' active' : '') + '" data-liatab="' + key + '"'
         + ' onclick="LoveInAction.switchTab(\'' + key + '\')"'
         + ' style="padding:10px 18px;border:none;background:' + (active ? 'var(--accent)' : 'transparent')
         + ';color:' + (active ? 'var(--ink-inverse)' : 'var(--ink)')
         + ';border-radius:8px 8px 0 0;font-weight:' + (active ? '700' : '500')
         + ';font-size:0.84rem;cursor:pointer;font-family:inherit;transition:all .15s;">'
         + labels[key] + ' <span style="font-size:0.72rem;opacity:0.7;">(' + counts[key] + ')</span></button>';
    });
    h += '</div>';

    // Panel container
    h += '<div id="lia-panels">';
    h += '<div class="lia-panel' + (_activeTab === 'care' ? ' active' : '') + '" id="lia-p-care">' + _buildCare() + '</div>';
    h += '<div class="lia-panel' + (_activeTab === 'prayer' ? ' active' : '') + '" id="lia-p-prayer" style="' + (_activeTab !== 'prayer' ? 'display:none;' : '') + '">' + _buildPrayer() + '</div>';
    h += '<div class="lia-panel' + (_activeTab === 'compassion' ? ' active' : '') + '" id="lia-p-compassion" style="' + (_activeTab !== 'compassion' ? 'display:none;' : '') + '">' + _buildCompassion() + '</div>';
    h += '<div class="lia-panel' + (_activeTab === 'outreach' ? ' active' : '') + '" id="lia-p-outreach" style="' + (_activeTab !== 'outreach' ? 'display:none;' : '') + '">' + _buildOutreach() + '</div>';
    h += '<div class="lia-panel' + (_activeTab === 'assignments' ? ' active' : '') + '" id="lia-p-assignments" style="' + (_activeTab !== 'assignments' ? 'display:none;' : '') + '"></div>';
    h += '<div class="lia-panel' + (_activeTab === 'followups' ? ' active' : '') + '" id="lia-p-followups" style="' + (_activeTab !== 'followups' ? 'display:none;' : '') + '"></div>';
    h += '</div>';

    container.innerHTML = h;

    // Hide inactive panels
    ['care','prayer','compassion','outreach','assignments','followups'].forEach(function(k) {
      var p = document.getElementById('lia-p-' + k);
      if (p) p.style.display = k === _activeTab ? '' : 'none';
    });

    // Log
    if (typeof TheScrolls !== 'undefined') {
      TheScrolls.log(TheScrolls.TYPES.APP_OPEN, '', 'Opened Love in Action');
    }
  }

  // ── Tab switcher ────────────────────────────────────────────────────────
  function switchTab(key) {
    _activeTab = key;
    document.querySelectorAll('[data-liatab]').forEach(function(t) {
      var active = t.getAttribute('data-liatab') === key;
      t.classList.toggle('active', active);
      t.style.background = active ? 'var(--accent)' : 'transparent';
      t.style.color = active ? 'var(--ink-inverse)' : 'var(--ink)';
      t.style.fontWeight = active ? '700' : '500';
    });
    ['care','prayer','compassion','outreach','assignments','followups'].forEach(function(k) {
      var p = document.getElementById('lia-p-' + k);
      if (p) p.style.display = k === key ? '' : 'none';
    });
    // Always refresh assignments/followups on tab click
    if ((key === 'assignments' || key === 'followups') && !_lazyLoading[key]) {
      _lazyLoadTab(key);
    }
  }

  // ── Lazy tab loader — fetches and renders assignments or followups ──────
  async function _lazyLoadTab(key) {
    _lazyLoading[key] = true;
    var panel = document.getElementById('lia-p-' + key);
    if (panel) panel.innerHTML = _spinner();
    try {
      if (key === 'assignments') {
        var r = await TheVine.flock.care.assignments.list({ limit: 80 });
        _cache.assignments = _filterClosed(_rows(r));
        if (panel) panel.innerHTML = _buildAssignments();
      } else {
        var r2 = await TheVine.flock.care.interactions.list({ limit: 80, type: 'followup' });
        _cache.followups = _rows(r2);
        if (panel) panel.innerHTML = _buildFollowUps();
      }
    } catch (e) {
      if (panel) panel.innerHTML = '<div style="padding:20px;color:var(--danger);font-size:0.88rem;">Failed to load: ' + _e(e.message) + '</div>';
    }
    _lazyLoading[key] = false;
  }

  // ── Search across all panels ────────────────────────────────────────────
  function _search(q) {
    q = (q || '').toLowerCase().trim();
    document.querySelectorAll('.lia-card-row').forEach(function(r) {
      r.style.display = (!q || (r.dataset.search || '').indexOf(q) >= 0) ? '' : 'none';
    });
    if (q && typeof TheScrolls !== 'undefined') {
      TheScrolls.log(TheScrolls.TYPES.SEARCH, '', 'Love in Action search: ' + q);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PANEL BUILDERS — card grids for each tab
  // ══════════════════════════════════════════════════════════════════════════

  function _buildCare() {
    var rows = _cache.care;
    if (!rows.length) return _empty('\u2764', 'No care cases.');

    var h = '<div class="flock-actions" style="margin-bottom:14px;">'
      + '<button class="primary" onclick="TheLife.openCareCase()" style="background:var(--accent);color:var(--ink-inverse);border:none;border-radius:6px;padding:8px 16px;cursor:pointer;font-weight:600;font-size:0.84rem;">+ New Care Case</button>'
      + '</div>';
    h += '<div class="flock-card-grid">';
    rows.forEach(function(c) {
      var name = _memberName(c.memberId) || c.memberName || c.memberId || '';
      var search = (name + ' ' + (c.careType || '') + ' ' + (c.summary || '') + ' ' + (c.notes || '') + ' ' + (c.status || '')).toLowerCase();
      h += '<div class="lia-card-row" data-search="' + _e(search) + '">';
      h += _card({
        name: _e(name),
        pills: _statusBadge(c.priority || 'Normal') + ' ' + _statusBadge(c.status),
        body: _e((c.careType || '') + (c.summary ? ' \u2014 ' + c.summary.substring(0, 120) : '')),
        assigned: _memberName(c.primaryCaregiverId) || c.assignedName || '',
        date: c.createdAt || '',
        priority: c.priority,
        onclick: "TheLife.openCareCase('" + _e(c.id) + "')"
      });
      h += '</div>';
    });
    h += '</div>';
    return h;
  }

  function _buildPrayer() {
    var rows = _cache.prayer;
    if (!rows.length) return _empty('\uD83D\uDE4F', 'No prayer requests. All caught up!');

    var h = '<div class="flock-card-grid">';
    rows.forEach(function(r) {
      var rid    = _e(String(r.id || r.ID || ''));
      var name   = r.submitterName || r['Submitter Name'] || 'Anonymous';
      var prayer = r.prayerText || r['Prayer Text'] || '';
      var cat    = r.category || r['Category'] || '';
      var isConf = String(r.isConfidential || r['Is Confidential'] || '').toUpperCase() === 'TRUE';
      var isFU   = String(r.followUpRequested || r['Follow-Up Requested'] || '').toUpperCase() === 'TRUE';
      var status = r.status || r['Status'] || 'New';
      var assigned = _memberName(r.assignedTo || r['Assigned To']) || '';
      var date   = r.submittedAt || r['Submitted At'] || '';

      var pills = _statusBadge(status);
      if (cat) pills += ' ' + _badge(cat, 'info');
      if (isConf) pills += ' <span class="badge badge-warn">\uD83D\uDD12 Confidential</span>';
      if (isFU) pills += ' <span class="badge badge-danger">Follow-up</span>';

      var search = (name + ' ' + prayer + ' ' + cat + ' ' + status).toLowerCase();
      h += '<div class="lia-card-row" data-search="' + _e(search) + '">';
      h += _card({
        name: _e(name),
        pills: pills,
        body: _e(prayer.length > 200 ? prayer.substring(0, 200) + '\u2026' : prayer),
        assigned: assigned,
        date: date,
        onclick: "TheLife.openPrayer('" + rid + "')"
      });
      h += '</div>';
    });
    h += '</div>';
    return h;
  }

  function _buildCompassion() {
    var rows = _cache.compassion;
    if (!rows.length) return _empty('\u2665', 'No compassion requests.');

    var h = '<div class="flock-actions" style="margin-bottom:14px;">'
      + '<button class="primary" onclick="TheLife.openCompassion()" style="background:var(--accent);color:var(--ink-inverse);border:none;border-radius:6px;padding:8px 16px;cursor:pointer;font-weight:600;font-size:0.84rem;">+ New Request</button>'
      + '</div>';
    h += '<div class="flock-card-grid">';
    rows.forEach(function(r) {
      var amt = r.amountRequested || r.amount ? '$' + Number(r.amountRequested || r.amount || 0).toFixed(2) : '';
      var name = r.requesterName || r.memberName || r.name || '';
      var search = (name + ' ' + (r.requestType || '') + ' ' + (r.description || '') + ' ' + (r.status || '')).toLowerCase();
      h += '<div class="lia-card-row" data-search="' + _e(search) + '">';
      h += _card({
        name: _e(name),
        pills: _statusBadge(r.status) + (r.urgency ? ' ' + _statusBadge(r.urgency) : ''),
        body: _e((r.requestType || r.type || '') + (amt ? ' \u2014 ' + amt : '')
          + (r.description ? ' \u2014 ' + r.description.substring(0, 100) : '')),
        assigned: _memberName(r.assignedTo) || r.assignedName || '',
        date: r.createdAt || '',
        priority: r.urgency,
        onclick: "TheLife.openCompassion('" + _e(r.id) + "')"
      });
      h += '</div>';
    });
    h += '</div>';
    return h;
  }

  function _buildOutreach() {
    var rows = _cache.outreach;
    var h = '<div class="flock-actions" style="margin-bottom:14px;">'
      + '<button class="primary" onclick="TheLife.openOutreach()" style="background:var(--accent);color:var(--ink-inverse);border:none;border-radius:6px;padding:8px 16px;cursor:pointer;font-weight:600;font-size:0.84rem;">+ Add Contact</button>'
      + '</div>';
    if (!rows.length) return h + _empty('\u261E', 'No outreach contacts yet. Tap \u201C+ Add Contact\u201D to get started.');
    h += '<div class="flock-card-grid">';
    rows.forEach(function(r) {
      var name = r.name || [r.firstName, r.lastName].filter(Boolean).join(' ');
      var search = (name + ' ' + (r.source || '') + ' ' + (r.campaignName || '') + ' ' + (r.notes || '') + ' ' + (r.status || r.stage || '')).toLowerCase();
      h += '<div class="lia-card-row" data-search="' + _e(search) + '">';
      h += _card({
        name: _e(name),
        pills: _statusBadge(r.stage || r.status || ''),
        body: _e((r.source ? 'Source: ' + r.source : '')
          + (r.campaignName ? ' \u00B7 Campaign: ' + r.campaignName : '')),
        assigned: _memberName(r.assignedTo) || '',
        date: r.createdAt || '',
        onclick: "TheLife.openOutreach('" + _e(r.id) + "')"
      });
      h += '</div>';
    });
    h += '</div>';
    return h;
  }

  // ── Assignments panel builder ───────────────────────────────────────────
  function _buildAssignments() {
    var rows = _cache.assignments;
    var h = '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center;">';
    h += '<label style="font-size:0.8rem;color:var(--ink-muted);">Filter by member:</label>';
    h += '<input id="lia-asgn-member" type="text" placeholder="Member ID or email"'
      + ' style="padding:6px 10px;border:1px solid var(--line);border-radius:6px;'
      + 'background:rgba(255,255,255,0.07);color:var(--ink);font-size:0.8rem;font-family:inherit;min-width:180px;">';
    h += '<button onclick="LoveInAction._searchAssignments()"'
      + ' style="background:var(--accent);color:var(--ink-inverse);border:none;border-radius:6px;'
      + 'padding:6px 14px;font-size:0.8rem;cursor:pointer;font-family:inherit;">Search</button>';
    h += '</div>';
    if (!rows.length) return h + _empty('\uD83D\uDC65', 'No care assignments found.');
    h += '<div style="overflow-x:auto;"><table class="data-table"><thead><tr>';
    ['Member', 'Caregiver', 'Type', 'Status', 'Assigned On', 'Actions'].forEach(function(col) {
      h += '<th>' + _e(col) + '</th>';
    });
    h += '</tr></thead><tbody>';
    rows.forEach(function(r) {
      var id     = _e(String(r.id || ''));
      var isOpen = !/^(ended|closed|complete)$/i.test(r.status || '');
      h += '<tr>';
      h += '<td>' + _e(r.memberName || r.member || '') + '</td>';
      h += '<td>' + _e(r.caregiverName || r.caregiver || r.assignedTo || '') + '</td>';
      h += '<td>' + _e(r.type || r.careType || '') + '</td>';
      h += '<td>' + _statusBadge(r.status || 'Active') + '</td>';
      h += '<td>' + _e(r.assignedAt || r.createdAt || '') + '</td>';
      h += '<td>' + (isOpen
        ? '<button onclick="LoveInAction._reassignCase(\'' + id + '\')"'
          + ' style="background:none;border:1px solid var(--line);border-radius:5px;padding:3px 7px;'
          + 'font-size:0.73rem;cursor:pointer;margin-right:3px;font-family:inherit;">Reassign</button>'
          + '<button onclick="LoveInAction._endAssignment(\'' + id + '\')"'
          + ' style="background:var(--danger);color:#fff;border:none;border-radius:5px;padding:3px 7px;'
          + 'font-size:0.73rem;cursor:pointer;font-family:inherit;">End</button>'
        : '<span style="color:var(--ink-muted);font-size:0.76rem;">Closed</span>') + '</td>';
      h += '</tr>';
    });
    h += '</tbody></table></div>';
    return h;
  }

  // ── Follow-Ups panel builder ────────────────────────────────────────────
  function _buildFollowUps() {
    var rows = _cache.followups;
    if (!rows.length) return _empty('\u23F0', 'No pending follow-up interactions.');
    var h = '<div style="overflow-x:auto;"><table class="data-table"><thead><tr>';
    ['Member', 'Caregiver', 'Due / Date', 'Notes', 'Status', 'Action'].forEach(function(col) {
      h += '<th>' + _e(col) + '</th>';
    });
    h += '</tr></thead><tbody>';
    rows.forEach(function(r) {
      var id    = _e(String(r.id || ''));
      var done  = /^(done|completed|complete)$/i.test(r.status || '');
      var notes = (r.notes || r.summary || '');
      h += '<tr>';
      h += '<td>' + _e(r.memberName || r.member || '') + '</td>';
      h += '<td>' + _e(r.caregiverName || r.caregiver || r.createdBy || '') + '</td>';
      h += '<td>' + _e(r.followUpDate || r.date || '') + '</td>';
      h += '<td>' + _e(notes.length > 60 ? notes.substring(0, 60) + '\u2026' : notes) + '</td>';
      h += '<td>' + _statusBadge(r.status || 'Pending') + '</td>';
      h += '<td>' + (done
        ? '<span style="color:var(--ink-muted);font-size:0.76rem;">Done</span>'
        : '<button onclick="LoveInAction._followUpDone(\'' + id + '\')"'
          + ' style="background:var(--success);color:#fff;border:none;border-radius:5px;'
          + 'padding:3px 10px;font-size:0.76rem;cursor:pointer;font-family:inherit;">Done</button>') + '</td>';
      h += '</tr>';
    });
    h += '</tbody></table></div>';
    return h;
  }

  // ── Assignment & follow-up actions ─────────────────────────────────────
  async function _searchAssignments() {
    var inp = document.getElementById('lia-asgn-member');
    var memberId = inp ? inp.value.trim() : '';
    if (!memberId) return;
    try {
      var res = await TheVine.flock.care.assignments.forMember({ memberId: memberId });
      _cache.assignments = _rows(res);
      var panel = document.getElementById('lia-p-assignments');
      if (panel) panel.innerHTML = _buildAssignments();
    } catch (e) { alert('Search failed: ' + (e.message || e)); }
  }

  function _reassignCase(id) {
    var newCaregiver = prompt('New caregiver ID or email:');
    if (!newCaregiver || !newCaregiver.trim()) return;
    var notes = prompt('Reason / notes (optional):') || '';
    TheVine.flock.care.assignments.reassign({ id: id, caregiverId: newCaregiver.trim(), notes: notes })
      .then(function() {
        return TheVine.flock.care.assignments.list({ limit: 80 });
      })
      .then(function(res) {
        _cache.assignments = _filterClosed(_rows(res));
        var panel = document.getElementById('lia-p-assignments');
        if (panel) panel.innerHTML = _buildAssignments();
      })
      .catch(function(e) { alert('Reassign failed: ' + (e.message || e)); });
  }

  async function _endAssignment(id) {
    var cached = (_cache.assignments || []).find(function(r) { return String(r.id) === String(id); }) || {};
    var name = cached.memberName || cached.member || 'this member';
    if (!confirm('End care assignment for ' + name + '?')) return;
    try {
      await TheVine.flock.care.assignments.end({ id: id });
      _cache.assignments = _cache.assignments.filter(function(r) { return String(r.id) !== String(id); });
      var panel = document.getElementById('lia-p-assignments');
      if (panel) panel.innerHTML = _buildAssignments();
    } catch (e) { alert('Failed: ' + (e.message || e)); }
  }

  async function _followUpDone(id) {
    try {
      await TheVine.flock.care.interactions.followUpDone({ id: id });
      _cache.followups = _cache.followups.map(function(r) {
        return String(r.id) === String(id) ? Object.assign({}, r, { status: 'done' }) : r;
      });
      var panel = document.getElementById('lia-p-followups');
      if (panel) panel.innerHTML = _buildFollowUps();
    } catch (e) { alert('Failed: ' + (e.message || e)); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════════════════
  return {
    renderApp:          renderApp,
    switchTab:          switchTab,
    _search:            _search,
    _searchAssignments: _searchAssignments,
    _reassignCase:      _reassignCase,
    _endAssignment:     _endAssignment,
    _followUpDone:      _followUpDone,
  };
})();
