/* ══════════════════════════════════════════════════════════════════════════════
   THE SHEPHERD  — People Engine
   Complete person management: unified search, profile view, multi-table save,
   permissions, member/card creation — all with interaction logging.

   Depends on: Modules (the_tabernacle.js), TheVine (the_true_vine.js),
               Nehemiah (firm_foundation.js), TheScrolls (the_scrolls.js)

   "I am the good shepherd; I know my sheep and my sheep know me." — John 10:14
   ══════════════════════════════════════════════════════════════════════════════ */

const TheShepherd = (() => {
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
    if (['TRUE','ACTIVE','OPEN','PUBLISHED','COMPLETE','YES','APPROVED','ANSWERED'].includes(t))
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
  function _errHtml(msg) {
    return '<div style="padding:30px;text-align:center;color:var(--danger);">'
      + '<p style="font-size:1rem;font-weight:600;">Error</p>'
      + '<p style="font-size:0.85rem;">' + _e(msg) + '</p></div>';
  }
  function _empty(icon, msg) {
    return '<div style="padding:40px;text-align:center;color:var(--ink-muted);">'
      + '<div style="font-size:2rem;margin-bottom:8px;">' + icon + '</div>'
      + '<p style="font-size:0.88rem;">' + _e(msg) + '</p></div>';
  }
  function _toast(msg, type) {
    if (typeof Modules !== 'undefined' && Modules._toast) { Modules._toast(msg, type); return; }
    var d = document.createElement('div');
    d.textContent = msg;
    d.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:12px 24px;'
      + 'border-radius:8px;font-size:0.88rem;z-index:9999;color:#fff;'
      + 'background:' + (type === 'success' ? 'var(--success)' : type === 'danger' ? 'var(--danger)' : 'var(--accent)') + ';';
    document.body.appendChild(d);
    setTimeout(function() { d.remove(); }, 3000);
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

  // ── Form field / section renderers ──────────────────────────────────────
  function _ppF(label, name, val, type, opts) {
    var sid = 'pp-' + name;
    var h = '<div style="margin-bottom:12px;">'
      + '<label for="' + sid + '" style="display:block;font-size:0.72rem;color:var(--ink-muted);margin-bottom:3px;">' + _e(label) + '</label>';
    var base = ' id="' + sid + '" data-field="' + _e(name) + '"'
      + ' style="width:100%;background:rgba(255,255,255,0.07);border:1px solid var(--line);border-radius:6px;padding:7px 10px;color:var(--ink);font-size:max(0.92rem,16px);font-family:inherit;"';
    if (type === 'select' && opts) {
      h += '<select' + base + '>';
      (opts || []).forEach(function(o) {
        var ov = typeof o === 'object' ? o.value : o;
        var ol = typeof o === 'object' ? o.label : o;
        h += '<option value="' + _e(ov) + '"' + (String(val) === String(ov) ? ' selected' : '') + '>' + _e(ol) + '</option>';
      });
      h += '</select>';
    } else if (type === 'textarea') {
      h += '<textarea' + base + ' rows="3">' + _e(val || '') + '</textarea>';
    } else {
      h += '<input' + base + ' type="' + _e(type || 'text') + '" value="' + _e(val || '') + '">';
    }
    return h + '</div>';
  }
  function _pp2(a, b) {
    return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 12px;">' + a + b + '</div>';
  }
  function _ppSec(title, id, content, isOpen) {
    var open = (isOpen === false) ? '' : ' open';
    return '<details class="pp-section"' + open + ' style="margin-bottom:16px;border:1px solid var(--line);border-radius:8px;overflow:hidden;">'
      + '<summary style="padding:12px 16px;background:rgba(255,255,255,0.04);cursor:pointer;font-weight:700;font-size:0.82rem;color:var(--accent);user-select:none;">' + _e(title) + '</summary>'
      + '<div style="padding:16px;" id="pp-sec-' + id + '">' + content + '</div></details>';
  }
  // Renders a closed <details> whose content is fetched the first time it's opened.
  // loaderCall: JS expression to evaluate on first open (e.g. "TheShepherd._loadPerms('email')")
  function _ppSecLazy(title, id, loaderCall) {
    return '<details class="pp-section" style="margin-bottom:16px;border:1px solid var(--line);border-radius:8px;overflow:hidden;"'
      + ' ontoggle="if(this.open&&!this.dataset.loaded){this.dataset.loaded=1;' + loaderCall + '}">'
      + '<summary style="padding:12px 16px;background:rgba(255,255,255,0.04);cursor:pointer;font-weight:700;font-size:0.82rem;color:var(--accent);user-select:none;">' + _e(title) + '</summary>'
      + '<div style="padding:16px;" id="pp-sec-' + id + '"><span style="color:var(--ink-muted);font-size:0.84rem;">\u23F3 Loading\u2026</span></div></details>';
  }

  var _ROLE_LEVELS = {
    readonly: 0, volunteer: 1, care: 2, deacon: 2,
    leader: 3, treasurer: 3, pastor: 4, admin: 5
  };

  // ── State ───────────────────────────────────────────────────────────────
  var _container = null;     // current render target
  var _ppData    = {};       // merged people map keyed by lower-case email
  var _allPeople = null;     // cached merged array for client-side pagination
  var _openEmail = '';       // currently open profile email
  var _openMemId = '';       // member record ID (if exists)
  var _openCardId = '';      // card record ID (if exists)
  var _hasMember = false;
  var _hasCard   = false;

  // ── Firebase mode check ─────────────────────────────────────────────────
  function _isFB() {
    return typeof Modules !== 'undefined' && typeof Modules._isFirebaseComms === 'function' && Modules._isFirebaseComms();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PEOPLE LIST — search, filter, table
  // ══════════════════════════════════════════════════════════════════════════

  async function renderApp(container, opts) {
    _container = container;
    opts = opts || {};
    // Derive the pager/reload ID from the container element (e.g. 'view-directory' → 'directory').
    // This is critical: when TheShepherd is mounted inside 'directory' or 'my-flock', pagination
    // buttons must call _reload('directory'), not _reload('users'), otherwise Next/Prev silently
    // re-renders a hidden element and nothing changes on screen.
    var _pgId = (container.id || 'users').replace(/^view-/, '') || 'users';
    console.log('[SHEPHERD-DEBUG] renderApp() start — containerId=' + (container.id||'?') + ', _allPeople=' + (_allPeople ? _allPeople.length : 'null'));
    container.innerHTML = _spinner();

    try {
      // Re-use cached data on paginate / reload; fetch fresh on first load
      if (!_allPeople) {
        // Clear stale search/filter state when loading fresh data
        _searchQ = '';
        _filterVal = 'all';
        // Load ALL users, members, cards (high limit bypasses _DEFAULT_PAGE 25)
        var fbAll = { limit: 9999 };
        var res = await Promise.allSettled([
          TheVine.flock.users.list(),
          _isFB() ? UpperRoom.listMembers(fbAll)      : TheVine.flock.members.list(),
          _isFB() ? UpperRoom.listMemberCards(fbAll)   : TheVine.flock.memberCards.directory(),
        ]);
        var users   = _rows(res[0].status === 'fulfilled' ? res[0].value : []);
        var members = _rows(res[1].status === 'fulfilled' ? res[1].value : []);
        var cards   = _rows(res[2].status === 'fulfilled' ? res[2].value : []);

        // Merge 3 sources by email
        var map = {};
        users.forEach(function(u) {
          var k = (u.email || '').toLowerCase(); if (!k) return;
          map[k] = map[k] || { email: k }; map[k].user = u;
        });
        members.forEach(function(m) {
          var k = (m.primaryEmail || m.email || '').toLowerCase();
          if (!k) k = '_mid_' + (m.id || m.memberId || ('idx' + Math.random().toString(36).slice(2,8))).toLowerCase();
          map[k] = map[k] || { email: k }; map[k].member = m;
        });
        cards.forEach(function(c) {
          var k = (c.email || '').toLowerCase(); if (!k) return;
          map[k] = map[k] || { email: k }; map[k].card = c;
        });
        _ppData = map;
        _allPeople = Object.values(map);
        console.log('[SHEPHERD-DEBUG] renderApp() — fetched & merged: users=' + users.length + ', members=' + members.length + ', cards=' + cards.length + ', total=' + _allPeople.length);
      }

      var people = _allPeople;

      // ── Client-side pagination via Modules pager state ──────────────
      var pg = (typeof Modules !== 'undefined' && Modules._pgState)
             ? Modules._pgState(_pgId) : null;
      var pageSlice = people;
      if (pg) {
        var start = pg.page * pg.size;
        pageSlice = people.slice(start, start + pg.size);
        pg.count   = pageSlice.length;
        pg.hasMore = start + pg.size < people.length;
        pg.total   = people.length;
      }

      var nU = people.filter(function(p) { return p.user; }).length;
      var nM = people.filter(function(p) { return p.member; }).length;
      var nC = people.filter(function(p) { return p.card; }).length;
      var nP = people.filter(function(p) { return p.user && p.user.status === 'pending'; }).length;

      var h = '';
      // ← Return to Dashboard
      if (!opts.embedded) {
        h += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;">';
        h += '<button onclick="TheLife.backToHub()" style="background:none;border:1px solid var(--line);border-radius:6px;padding:6px 14px;cursor:pointer;color:var(--ink);font-size:0.84rem;">\u2190 Return to Dashboard</button>';
        h += '<h2 style="font-size:1.1rem;color:var(--accent);margin:0;">\uD83D\uDC64 People</h2>';
        h += '<button onclick="Modules.newUser()" style="background:var(--accent);color:var(--ink-inverse);border:none;border-radius:6px;padding:7px 15px;cursor:pointer;font-weight:600;font-size:0.83rem;margin-left:auto;">+ New Person</button>';
        h += '</div>';
      }

      // search + filter bar
      h += '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:14px;">';
      h += '<input id="shep-q" type="search" placeholder="Search name, email, phone\u2026"'
         + ' oninput="TheShepherd._search(this.value)"'
         + ' value="' + _e(_searchQ) + '"'
         + ' style="flex:1;min-width:200px;background:rgba(255,255,255,0.07);border:1px solid var(--line);border-radius:6px;padding:8px 12px;color:var(--ink);font-size:0.88rem;font-family:inherit;">';
      h += '<select id="shep-filter" onchange="TheShepherd._filter(this.value)"'
         + ' style="background:rgba(255,255,255,0.07);border:1px solid var(--line);border-radius:6px;padding:8px 12px;color:var(--ink);font-size:0.84rem;font-family:inherit;">'
         + '<option value="all"' + (_filterVal === 'all' ? ' selected' : '') + '>All People</option>'
         + '<option value="user"' + (_filterVal === 'user' ? ' selected' : '') + '>Users Only</option>'
         + '<option value="member"' + (_filterVal === 'member' ? ' selected' : '') + '>Members Only</option>'
         + '<option value="both"' + (_filterVal === 'both' ? ' selected' : '') + '>Users + Members</option>'
         + '<option value="card"' + (_filterVal === 'card' ? ' selected' : '') + '>Has Card</option>'
         + '<option value="pending"' + (_filterVal === 'pending' ? ' selected' : '') + '>Pending Approval</option></select>';
      h += '</div>';

      // stat pills
      h += '<div style="display:flex;gap:16px;margin-bottom:14px;font-size:0.76rem;color:var(--ink-muted);">';
      h += '<span>' + people.length + ' people</span>';
      h += '<span>' + nU + ' users</span><span>' + nM + ' members</span><span>' + nC + ' cards</span>';
      if (nP) h += '<span style="color:var(--danger);">' + nP + ' pending</span>';
      h += '</div>';

      // table (paginated slice) + pager bar
      h += '<div id="shep-tbl">' + _buildTable(pageSlice) + '</div>';
      if (pg && typeof Modules !== 'undefined' && Modules._pagerBar) {
        h += Modules._pagerBar(_pgId);
      }
      container.innerHTML = h;
      console.log('[SHEPHERD-DEBUG] renderApp() — container set to list, containerId=' + (container.id||'?'));
      var _m = document.getElementById('main'); if (_m) _m.scrollTop = 0;
    } catch (e) { console.error('[SHEPHERD-DEBUG] renderApp() ERROR:', e); container.innerHTML = _errHtml(e.message); }
  }

  function _buildTable(list) {
    if (!list.length) return _empty('\uD83D\uDC64', 'No people found.');
    var t = '<table class="data-table"><thead><tr><th>Name</th><th>Email</th><th>Type</th><th>Role</th><th>Status</th><th></th></tr></thead><tbody>';
    var mc = '';  // mobile cards
    list.forEach(function(p) {
      var u = p.user || {}, m = p.member || {}, c = p.card || {};
      var name = ((u.firstName || m.firstName || c.firstName || '') + ' ' + (u.lastName || m.lastName || c.lastName || '')).trim()
        || u.displayName || m.name || c.name || 'Unknown';
      var types = [];
      if (p.user) types.push('User');
      if (p.member) types.push('Member');
      if (p.card) types.push('Card');
      var role   = u.role || '\u2014';
      var status = u.status || m.membershipStatus || c.status || '\u2014';
      var isPending = u.status === 'pending';
      var isMidKey = (p.email || '').indexOf('_mid_') === 0;
      var eid = _e(p.email);
      var dataAttrs = ' data-email="' + eid + '"'
        + ' data-search="' + _e((name + ' ' + (isMidKey ? '' : p.email) + ' ' + (u.phone || m.cellPhone || c.phone || '')).toLowerCase()) + '"'
        + ' data-tu="' + (p.user ? 1 : 0) + '" data-tm="' + (p.member ? 1 : 0) + '" data-tc="' + (p.card ? 1 : 0) + '"'
        + ' data-pend="' + (isPending ? 1 : 0) + '"';

      // Desktop table row
      t += '<tr class="shep-row"' + dataAttrs
         + ' style="cursor:pointer;" onclick="TheShepherd.openProfile(\'' + eid + '\')">';
      t += '<td data-label="Name"><strong>' + _e(name) + '</strong></td>';
      t += '<td data-label="Email" style="font-size:0.82rem;">' + (isMidKey ? '<em style="color:var(--ink-muted);">No email</em>' : _e(p.email)) + '</td>';
      t += '<td data-label="Type">' + _badge(types.join('+') || '\u2014', types.length >= 2 ? 'success' : 'info') + '</td>';
      t += '<td data-label="Role">' + _badge(role, role === 'admin' ? 'danger' : (role === 'pastor' || role === 'leader') ? 'warn' : 'info') + '</td>';
      t += '<td data-label="Status">' + _statusBadge(status) + (isPending ? ' ' + _badge('\u23F3', 'danger') : '') + '</td>';
      t += '<td>';
      if (isPending) {
        t += '<button onclick="event.stopPropagation();TheShepherd._approve(\'' + eid + '\')" style="background:var(--success);color:#fff;border:none;border-radius:4px;padding:3px 8px;font-size:0.72rem;cursor:pointer;margin-right:4px;">Approve</button>';
        t += '<button onclick="event.stopPropagation();TheShepherd._deny(\'' + eid + '\')" style="background:var(--danger);color:#fff;border:none;border-radius:4px;padding:3px 8px;font-size:0.72rem;cursor:pointer;">Deny</button>';
      }
      t += '</td></tr>';

      // Mobile card (name + role only)
      var typeLabel = role !== '\u2014' ? _e(role) : (types.join(' \u00B7 ') || '\u2014');
      mc += '<div class="shep-row"' + dataAttrs
          + ' style="cursor:pointer;" onclick="TheShepherd.openProfile(\'' + eid + '\')">'
          + '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;'
          + 'background:var(--bg-raised);border:1px solid var(--line);border-radius:8px;margin-bottom:8px;">'
          + '<div>'
          + '<div style="font-weight:600;font-size:0.95rem;">' + _e(name) + '</div>'
          + '<div style="font-size:0.8rem;color:var(--ink-muted);margin-top:2px;">' + typeLabel + '</div>'
          + '</div>';
      if (isPending) {
        mc += '<div style="display:flex;gap:6px;">'
            + '<button onclick="event.stopPropagation();TheShepherd._approve(\'' + eid + '\')" style="background:var(--success);color:#fff;border:none;border-radius:4px;padding:4px 10px;font-size:0.75rem;cursor:pointer;">Approve</button>'
            + '<button onclick="event.stopPropagation();TheShepherd._deny(\'' + eid + '\')" style="background:var(--danger);color:#fff;border:none;border-radius:4px;padding:4px 10px;font-size:0.75rem;cursor:pointer;">Deny</button>'
            + '</div>';
      } else {
        mc += '<span style="color:var(--accent);font-size:1.1rem;">\u203A</span>';
      }
      mc += '</div></div>';
    });
    return '<div class="hide-mobile">' + t + '</tbody></table></div>'
         + '<div class="show-mobile">' + mc + '</div>';
  }

  // ── Search & filter ─────────────────────────────────────────────────────
  // _searchQ tracks current query; _filterVal tracks current type filter
  var _searchQ   = '';
  var _filterVal = 'all';

  function _search(q) {
    _searchQ = (q || '').toLowerCase().trim();
    _renderFiltered();
    if (_searchQ && typeof TheScrolls !== 'undefined') {
      TheScrolls.log(TheScrolls.TYPES.SEARCH, '', 'People search: ' + _searchQ);
    }
  }
  function _filter(val) {
    _filterVal = val || 'all';
    _renderFiltered();
  }

  // Re-render the table from _allPeople using current search + filter state.
  // When a query is active we show ALL matches (no pagination) so users can
  // find anyone regardless of which page they are on.
  function _renderFiltered() {
    var tbl = document.getElementById('shep-tbl');
    if (!tbl || !_allPeople) return;
    var q   = _searchQ;
    var val = _filterVal;
    var list = _allPeople.filter(function(p) {
      // type filter
      if      (val === 'user')    { if (!p.user) return false; }
      else if (val === 'member')  { if (!p.member) return false; }
      else if (val === 'both')    { if (!p.user || !p.member) return false; }
      else if (val === 'card')    { if (!p.card) return false; }
      else if (val === 'pending') { if (!(p.user && p.user.status === 'pending')) return false; }
      // text search
      if (q) {
        var u = p.user || {}, m = p.member || {}, c = p.card || {};
        var name = ((u.firstName || m.firstName || c.firstName || '') + ' ' + (u.lastName || m.lastName || c.lastName || '')).trim();
        var haystack = (name + ' ' + (p.email || '') + ' ' + (u.phone || m.cellPhone || c.phone || '')).toLowerCase();
        if (haystack.indexOf(q) < 0) return false;
      }
      return true;
    });

    // When searching, bypass pagination and show all matches.
    // When not searching, re-apply the current page slice.
    var showList = list;
    if (!q) {
      var pg = (typeof Modules !== 'undefined' && Modules._pgState && _container)
        ? Modules._pgState((_container.id || 'users').replace(/^view-/, '') || 'users') : null;
      if (pg) {
        var start = pg.page * pg.size;
        showList = list.slice(start, start + pg.size);
        pg.count   = showList.length;
        pg.hasMore = start + pg.size < list.length;
        pg.total   = list.length;
      }
    }
    tbl.innerHTML = _buildTable(showList);
  }

  // ── Lazy section loaders ────────────────────────────────────────────────

  async function _loadPerms(email) {
    var el = document.getElementById('pp-sec-permissions');
    if (!el) return;
    var canEditPerms = false;
    try {
      if (typeof Nehemiah !== 'undefined' && (Nehemiah.can('users.permissions') || Nehemiah.can('users.edit'))) {
        canEditPerms = true;
      }
    } catch (_) {}
    if (!canEditPerms) {
      try {
        var s = TheVine.session ? TheVine.session() : null;
        var role = String((s && s.role) || '').toLowerCase();
        canEditPerms = !!(s && ((s.roleLevel || 0) >= 4 || role === 'pastor' || role === 'admin'));
      } catch (_) {}
    }
    if (!canEditPerms) {
      el.innerHTML = '<p style="color:var(--ink-muted);font-size:0.84rem;">You do not have permission to edit user permissions.</p>';
      return;
    }
    var isMidKey = (email || '').indexOf('_mid_') === 0;
    var p = _ppData[(email || '').toLowerCase()] || {};
    var u = p.user || {};
    var eid = _e(email);
    var currentGrants = [];
    try {
      var res = await Promise.allSettled([
        isMidKey ? Promise.resolve(null) : (_isFB() ? UpperRoom.getPermissions(email) : TheVine.flock.call('permissions.get', { targetEmail: email })),
      ]);
      var permData = (res[0].status === 'fulfilled' && res[0].value) || {};
      if (Array.isArray(permData.grants)) {
        currentGrants = permData.grants;
      } else if (Array.isArray(permData.overrides)) {
        permData.overrides.forEach(function(o) { if (o && o.module && String(o.access || '') === 'grant') currentGrants.push(o.module); });
      }
    } catch (_) {}

    var currentSet = new Set(currentGrants);

    // Initialize templates once on window (used by _selectPreset)
    if (!window._shepPermTemplates) {
      window._shepPermTemplates = {
        member: [],
        leader: ['my-flock', 'care', 'care.create', 'care.edit', 'care.interactions', 'care.follow-ups', 'prayer-admin.public', 'compassion', 'compassion.resources', 'groups', 'groups.manage', 'attendance', 'attendance.record', 'outreach', 'outreach.contacts', 'outreach.follow-ups', 'discipleship', 'discipleship.paths', 'volunteers', 'volunteers.manage', 'events.rsvp-list', 'sermons.upload', 'albums', 'albums.manage', 'calendar.create', 'calendar.edit', 'calendar.share', 'songs.setlist'],
        deacon: ['my-flock', 'care', 'care.create', 'care.edit', 'care.interactions', 'care.follow-ups', 'care.view-all', 'prayer-admin.public', 'prayer-admin.confidential', 'compassion', 'compassion.resources', 'compassion.approve', 'compassion.amount', 'compassion.log', 'compassion.log.create', 'directory', 'directory.contact-details', 'groups', 'groups.manage', 'attendance', 'attendance.record', 'outreach', 'outreach.contacts', 'outreach.contacts.edit', 'outreach.follow-ups', 'discipleship', 'discipleship.paths', 'giving', 'giving.pledges', 'volunteers', 'volunteers.manage', 'volunteers.swap', 'events.rsvp-list', 'events.edit', 'sermons.upload', 'sermons.series', 'albums', 'albums.manage', 'calendar.create', 'calendar.edit', 'calendar.share', 'songs', 'songs.edit', 'songs.setlist', 'services.edit', 'comms.send-group', 'memberCards.directory', 'memberCards.scan', 'checkin.manage', 'checkin.sessions'],
        care: ['my-flock', 'care', 'care.create', 'care.edit', 'care.interactions', 'care.follow-ups', 'care.view-all', 'prayer-admin.public', 'prayer-admin.confidential', 'compassion', 'compassion.resources', 'compassion.log', 'compassion.approve', 'compassion.amount', 'outreach.contacts', 'outreach.follow-ups'],
        elder: ['my-flock', 'care', 'care.create', 'care.edit', 'care.interactions', 'care.follow-ups', 'care.view-all', 'care.edit-all', 'care.reassign', 'care.close', 'care.assignments', 'prayer-admin.public', 'prayer-admin.confidential', 'compassion', 'compassion.resources', 'compassion.approve', 'compassion.amount', 'compassion.log', 'compassion.log.create', 'compassion.notes', 'compassion.resources.edit', 'directory', 'directory.contact-details', 'groups', 'groups.manage', 'groups.create', 'attendance', 'attendance.record', 'attendance.edit-past', 'outreach', 'outreach.contacts', 'outreach.contacts.edit', 'outreach.campaigns', 'outreach.campaigns.edit', 'outreach.follow-ups', 'discipleship', 'discipleship.paths', 'discipleship.enroll', 'discipleship.advance', 'discipleship.mentoring.edit', 'discipleship.assessments', 'discipleship.certificates', 'giving', 'giving.individual', 'giving.pledges', 'volunteers', 'volunteers.manage', 'volunteers.swap', 'events.rsvp-list', 'events.edit', 'sermons.upload', 'sermons.series', 'albums', 'albums.manage', 'calendar.create', 'calendar.edit', 'calendar.delete', 'calendar.share', 'songs', 'songs.edit', 'songs.setlist', 'services.edit', 'comms.send-group', 'memberCards.directory', 'memberCards.scan', 'checkin.manage', 'checkin.sessions', 'reports', 'statistics', 'ministry'],
        timothy: ['my-flock', 'my-flock.full-directory', 'my-flock.add-edit-members', 'directory', 'directory.contact-details', 'care', 'care.create', 'care.edit', 'care.view-all', 'care.edit-all', 'care.close', 'care.reassign', 'care.interactions', 'care.follow-ups', 'care.assignments', 'prayer-admin', 'prayer-admin.public', 'prayer-admin.confidential', 'compassion', 'compassion.approve', 'compassion.amount', 'compassion.resources', 'compassion.resources.edit', 'compassion.log', 'compassion.log.create', 'groups', 'groups.manage', 'groups.create', 'attendance', 'attendance.record', 'attendance.edit-past', 'giving', 'giving.individual', 'giving.pledges', 'discipleship', 'discipleship.paths', 'discipleship.paths.edit', 'discipleship.enroll', 'discipleship.advance', 'discipleship.mentoring.edit', 'discipleship.assessments', 'discipleship.certificates', 'discipleship.certificates.issue', 'discipleship.resources.edit', 'outreach', 'outreach.contacts', 'outreach.contacts.edit', 'outreach.campaigns', 'outreach.campaigns.edit', 'outreach.follow-ups', 'missions', 'missions.registry', 'missions.registry.edit', 'missions.partners', 'missions.partners.edit', 'missions.regions', 'missions.prayer', 'missions.prayer.edit', 'missions.updates', 'missions.updates.edit', 'comms', 'comms.send-individual', 'comms.send-group', 'comms.channels', 'comms.templates', 'content-admin', 'content-admin.publish', 'sermons.edit', 'sermons.upload', 'sermons.approve', 'sermons.series', 'albums', 'albums.manage', 'calendar.create', 'calendar.edit', 'calendar.delete', 'calendar.share', 'events.edit', 'events.rsvp-list', 'services.edit', 'volunteers', 'volunteers.manage', 'volunteers.swap', 'memberCards', 'memberCards.directory', 'memberCards.create', 'memberCards.edit', 'memberCards.scan', 'checkin.manage', 'checkin.sessions', 'reports', 'reports.sensitive', 'statistics', 'ministry', 'songs', 'songs.edit', 'songs.setlist'],
        pastor: ['my-flock', 'my-flock.full-directory', 'my-flock.add-edit-members', 'my-flock.remove-members', 'directory', 'directory.contact-details', 'directory.export', 'care', 'care.create', 'care.edit', 'care.view-all', 'care.edit-all', 'care.close', 'care.reassign', 'care.interactions', 'care.follow-ups', 'care.assignments', 'care.notes', 'prayer-admin', 'prayer-admin.public', 'prayer-admin.confidential', 'prayer-admin.notes', 'compassion', 'compassion.approve', 'compassion.amount', 'compassion.notes', 'compassion.resources', 'compassion.resources.edit', 'compassion.log', 'compassion.log.create', 'groups', 'groups.manage', 'groups.create', 'attendance', 'attendance.record', 'attendance.edit-past', 'giving', 'giving.individual', 'giving.enter', 'giving.statements', 'giving.pledges', 'giving.pledges.edit', 'discipleship', 'discipleship.paths', 'discipleship.paths.edit', 'discipleship.enroll', 'discipleship.advance', 'discipleship.mentoring.edit', 'discipleship.assessments', 'discipleship.certificates', 'discipleship.certificates.issue', 'discipleship.resources.edit', 'outreach', 'outreach.contacts', 'outreach.contacts.edit', 'outreach.campaigns', 'outreach.campaigns.edit', 'outreach.follow-ups', 'missions', 'missions.registry', 'missions.registry.edit', 'missions.partners', 'missions.partners.edit', 'missions.regions', 'missions.prayer', 'missions.prayer.edit', 'missions.updates', 'missions.updates.edit', 'comms', 'comms.send-individual', 'comms.send-group', 'comms.send-all', 'comms.channels', 'comms.templates', 'content-admin', 'content-admin.publish', 'sermons.edit', 'sermons.upload', 'sermons.approve', 'sermons.series', 'albums', 'albums.manage', 'calendar.create', 'calendar.edit', 'calendar.delete', 'calendar.share', 'events.edit', 'events.rsvp-list', 'services.edit', 'volunteers', 'volunteers.manage', 'volunteers.swap', 'memberCards', 'memberCards.directory', 'memberCards.create', 'memberCards.edit', 'memberCards.scan', 'checkin.manage', 'checkin.sessions', 'reports', 'reports.sensitive', 'statistics', 'ministry', 'songs', 'songs.edit', 'songs.setlist', 'audit', 'users.edit', 'users.permissions'],
        admin: ['my-flock', 'my-flock.full-directory', 'my-flock.add-edit-members', 'my-flock.remove-members', 'directory', 'directory.contact-details', 'directory.export', 'care', 'care.create', 'care.edit', 'care.view-all', 'care.edit-all', 'care.close', 'care.reassign', 'care.interactions', 'care.follow-ups', 'care.assignments', 'care.notes', 'prayer-admin', 'prayer-admin.public', 'prayer-admin.confidential', 'prayer-admin.notes', 'compassion', 'compassion.approve', 'compassion.amount', 'compassion.notes', 'compassion.resources', 'compassion.resources.edit', 'compassion.log', 'compassion.log.create', 'groups', 'groups.manage', 'groups.create', 'attendance', 'attendance.record', 'attendance.edit-past', 'giving', 'giving.individual', 'giving.enter', 'giving.edit', 'giving.statements', 'giving.pledges', 'giving.pledges.edit', 'discipleship', 'discipleship.paths', 'discipleship.paths.edit', 'discipleship.enroll', 'discipleship.advance', 'discipleship.mentoring.edit', 'discipleship.assessments', 'discipleship.certificates', 'discipleship.certificates.issue', 'discipleship.resources.edit', 'outreach', 'outreach.contacts', 'outreach.contacts.edit', 'outreach.campaigns', 'outreach.campaigns.edit', 'outreach.follow-ups', 'missions', 'missions.registry', 'missions.registry.edit', 'missions.partners', 'missions.partners.edit', 'missions.regions', 'missions.prayer', 'missions.prayer.edit', 'missions.updates', 'missions.updates.edit', 'comms', 'comms.send-individual', 'comms.send-group', 'comms.send-all', 'comms.channels', 'comms.templates', 'comms.delete', 'content-admin', 'content-admin.publish', 'sermons.edit', 'sermons.upload', 'sermons.approve', 'sermons.series', 'albums', 'albums.manage', 'calendar.create', 'calendar.edit', 'calendar.delete', 'calendar.share', 'calendar.delegate', 'events.edit', 'events.rsvp-list', 'services.edit', 'volunteers', 'volunteers.manage', 'volunteers.swap', 'memberCards', 'memberCards.directory', 'memberCards.create', 'memberCards.edit', 'memberCards.archive', 'memberCards.links', 'memberCards.views', 'memberCards.bulk', 'memberCards.scan', 'checkin.manage', 'checkin.sessions', 'reports', 'reports.sensitive', 'reports.export', 'statistics', 'ministry', 'songs', 'songs.edit', 'songs.setlist', 'audit', 'users', 'users.create', 'users.edit', 'users.deactivate', 'users.delete', 'users.permissions', 'config', 'config.edit', 'access', 'access.approve', 'bulk', 'bulk.import', 'bulk.export', 'church', 'church.edit'],
        'church-office': ['my-flock', 'my-flock.full-directory', 'my-flock.add-edit-members', 'directory', 'directory.contact-details', 'care', 'prayer-admin.public', 'compassion', 'memberCards', 'memberCards.directory', 'memberCards.create', 'memberCards.edit', 'memberCards.scan', 'memberCards.archive', 'memberCards.links', 'memberCards.views', 'calendar.create', 'calendar.edit', 'calendar.delete', 'calendar.share', 'events.edit', 'events.rsvp-list', 'services.edit', 'volunteers', 'volunteers.manage', 'volunteers.swap', 'checkin.manage', 'checkin.sessions', 'attendance', 'attendance.record', 'attendance.edit-past', 'groups', 'groups.manage', 'groups.create', 'comms', 'comms.send-individual', 'comms.send-group', 'comms.channels', 'comms.templates', 'comms.delete', 'users', 'users.create', 'users.edit', 'users.permissions', 'reports', 'statistics'],
        worship: ['songs', 'songs.edit', 'songs.setlist', 'services.edit', 'sermons.upload', 'sermons.series', 'albums', 'albums.manage', 'calendar.create', 'calendar.edit', 'calendar.share', 'events.rsvp-list', 'comms.send-group', 'volunteers', 'volunteers.manage', 'volunteers.swap', 'attendance', 'attendance.record'],
        children: ['checkin.manage', 'checkin.sessions', 'groups', 'groups.manage', 'attendance', 'attendance.record', 'calendar.create', 'calendar.edit', 'calendar.share', 'events.rsvp-list', 'comms.send-group', 'volunteers', 'volunteers.manage'],
        media: ['content-admin', 'content-admin.publish', 'sermons.upload', 'sermons.approve', 'sermons.series', 'albums', 'albums.manage', 'comms.channels', 'comms.templates', 'calendar.create', 'calendar.share', 'events.rsvp-list'],
        tech: ['config', 'config.edit', 'audit', 'church', 'church.edit', 'bulk', 'bulk.import', 'bulk.export'],
        finance: ['giving', 'giving.individual', 'giving.enter', 'giving.edit', 'giving.statements', 'giving.pledges', 'giving.pledges.edit', 'memberCards', 'memberCards.directory', 'reports', 'reports.sensitive', 'reports.export', 'statistics', 'directory'],
      };
    }
    var templates = window._shepPermTemplates;

    // Detect if existing grants match any known template exactly
    var detectedTemplate = '';
    Object.keys(templates).forEach(function(tkey) {
      var tkeys = templates[tkey];
      if (tkeys.length === currentGrants.length && tkeys.every(function(k) { return currentSet.has(k); })) {
        detectedTemplate = tkey;
      }
    });

    // Advanced individual overrides — the high-impact permissions worth controlling explicitly
    var ADV_PERMS = [
      { key: 'giving',                    label: 'View Giving Records',       risk: 'critical' },
      { key: 'giving.enter',              label: 'Enter Giving',              risk: 'critical' },
      { key: 'giving.individual',         label: 'Individual Giving Details', risk: 'critical' },
      { key: 'care.view-all',             label: 'View All Care Cases',       risk: 'high'     },
      { key: 'care.notes',                label: 'Pastoral Care Notes',       risk: 'critical' },
      { key: 'prayer-admin.confidential', label: 'Confidential Prayer',       risk: 'high'     },
      { key: 'comms.send-all',            label: 'Send to All Members',       risk: 'high'     },
      { key: 'reports.sensitive',         label: 'Sensitive Reports',         risk: 'high'     },
      { key: 'directory.export',          label: 'Export Directory',          risk: 'high'     },
      { key: 'audit',                     label: 'Audit Log',                 risk: 'medium'   },
      { key: 'users',                     label: 'User Management',           risk: 'critical' },
      { key: 'users.permissions',         label: 'Edit Permissions',          risk: 'critical' },
      { key: 'config',                    label: 'System Settings',           risk: 'critical' },
      { key: 'bulk.import',               label: 'Bulk Import',               risk: 'critical' },
      { key: 'bulk.export',               label: 'Bulk Export',               risk: 'critical' },
    ];
    var _rc = { low: '#16a34a', medium: '#b45309', high: '#ea580c', critical: '#dc2626' };

    var ph = '';

    // ── Step 1: Role Preset ─────────────────────────────────────────────
    ph += '<div style="margin-bottom:20px;">';
    ph += '<div style="font-size:0.80rem;color:var(--ink-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">Step 1 — Pick a Role Preset</div>';
    var PRESETS = [
      { val: 'member',        label: 'Member'       },
      { val: 'leader',        label: 'Leader'       },
      { val: 'deacon',        label: 'Deacon'       },
      { val: 'elder',         label: 'Elder'        },
      { val: 'timothy',       label: 'Timothy'      },
      { val: 'pastor',        label: 'Pastor'       },
      { val: 'church-office', label: 'Church Office'},
      { val: 'admin',         label: 'Admin'        },
    ];
    ph += '<div style="display:flex;gap:8px;flex-wrap:wrap;">';
    PRESETS.forEach(function(t) {
      var isActive = (detectedTemplate === t.val);
      ph += '<button type="button" id="shep-preset-' + t.val + '" onclick="TheShepherd._selectPreset(\'' + t.val + '\')"'
         + ' style="border-radius:8px;padding:8px 16px;cursor:pointer;font-size:0.84rem;font-family:inherit;font-weight:700;'
         + (isActive
           ? 'background:var(--accent);color:var(--ink-inverse);border:2px solid var(--accent);'
           : 'background:none;color:var(--ink);border:2px solid var(--line);')
         + '">' + _e(t.label) + '</button>';
    });
    ph += '<button type="button" onclick="TheShepherd._selectPreset(\'none\')"'
       + ' style="background:none;border:2px solid var(--line);border-radius:8px;padding:8px 16px;cursor:pointer;color:var(--ink-muted);font-size:0.84rem;font-family:inherit;">Clear All</button>';
    ph += '</div>';
    ph += '<input type="hidden" id="shep-template-key" value="' + _e(detectedTemplate) + '">';
    if (!detectedTemplate && currentGrants.length > 0) {
      ph += '<div style="margin-top:8px;font-size:0.78rem;color:var(--ink-muted);font-style:italic;">This user has custom permissions. Pick a preset to replace them, or adjust individually below.</div>';
    }
    ph += '</div>';

    // ── Step 2: Advanced Overrides ──────────────────────────────────────
    ph += '<details style="margin-bottom:16px;">'
       + '<summary style="cursor:pointer;user-select:none;font-size:0.80rem;color:var(--ink-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.06em;padding:8px 0;list-style:none;display:flex;align-items:center;gap:6px;">'
       + '&#9881; Advanced Overrides'
       + '<span style="font-weight:400;font-style:italic;font-size:0.78rem;text-transform:none;letter-spacing:0;">&nbsp;— add or remove specific sensitive permissions from the preset</span>'
       + '</summary>';
    ph += '<div style="margin-top:10px;border:1px solid var(--line);border-radius:8px;overflow:hidden;">';
    ADV_PERMS.forEach(function(item, i) {
      var isChecked = currentSet.has(item.key);
      var selId = 'shep-adv-' + item.key.replace(/\./g, '-');
      var rc = _rc[item.risk] || '#6b7280';
      ph += '<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;'
         + (i > 0 ? 'border-top:1px solid var(--line);' : '') + '">'
         + '<input type="checkbox" id="' + selId + '" class="shep-adv-chk" data-perm-key="' + _e(item.key) + '" data-risk="' + _e(item.risk) + '"'
         + (isChecked ? ' checked' : '')
         + ' onchange="TheShepherd._onAdvChkChange(this)" style="width:18px;height:18px;flex-shrink:0;accent-color:' + rc + ';cursor:pointer;">'
         + '<label for="' + selId + '" style="flex:1;cursor:pointer;font-weight:600;color:var(--ink);font-size:0.84rem;">' + _e(item.label) + '</label>'
         + '<span style="font-size:0.70rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding:2px 8px;border-radius:12px;'
         + 'background:' + rc + '18;color:' + rc + ';border:1px solid ' + rc + '44;flex-shrink:0;">' + _e(item.risk) + '</span>'
         + '</div>';
    });
    ph += '</div></details>';

    // ── Critical confirm ────────────────────────────────────────────────
    ph += '<div id="shep-crit-confirm" style="display:none;border:2px solid #dc2626;border-radius:10px;background:#dc262610;padding:16px 18px;margin:12px 0;">'
       + '<div style="font-weight:800;color:#dc2626;font-size:0.8rem;letter-spacing:0.06em;margin-bottom:10px;">\uD83D\uDD34 CRITICAL PERMISSION \u2014 CONFIRMATION REQUIRED</div>'
       + '<p style="font-size:0.84rem;color:var(--ink);margin:0 0 12px;">One or more critical overrides are selected. Please confirm before saving.</p>'
       + '<label style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;cursor:pointer;">'
       + '<input type="checkbox" id="shep-crit-chk" style="margin-top:2px;accent-color:#dc2626;">'
       + '<span style="font-size:0.84rem;color:var(--ink);">I understand this grants critical-level access to this person</span></label>'
       + '<input type="text" id="shep-crit-txt" placeholder="Type Yes to confirm"'
       + ' style="border:1px solid #dc262666;border-radius:6px;padding:6px 12px;font-size:0.84rem;background:var(--bg);color:var(--ink);font-family:inherit;width:200px;"></div>';

    // ── Save button ─────────────────────────────────────────────────────
    ph += '<div style="margin-top:14px;display:flex;align-items:center;gap:12px;">'
       + '<button type="button" onclick="TheShepherd._savePerms(\'' + eid + '\')" style="background:var(--accent);color:var(--ink-inverse);border:none;border-radius:6px;padding:9px 22px;cursor:pointer;font-weight:700;font-size:0.86rem;font-family:inherit;">Save Permissions</button>'
       + '<span id="shep-perm-status" style="font-size:0.82rem;color:var(--ink-muted);"></span></div>';

    el.innerHTML = ph;
    _syncAdvCritConfirm();
  }


  async function _loadVolunteers(email) {
    var el = document.getElementById('pp-sec-volunteers');
    if (!el) return;
    var p = _ppData[(email || '').toLowerCase()] || {};
    var u = p.user || {};
    var volRows = [];
    try {
      var res = await TheVine.flock.call('volunteers.list', {});
      var aVol = (res && res.rows) || [];
      volRows = aVol.filter(function(v) {
        return (v.memberId || '').toLowerCase() === email.toLowerCase()
          || (v.memberName || '').toLowerCase().indexOf((u.firstName || '').toLowerCase()) >= 0;
      });
    } catch (_) {}
    var vh = '';
    if (volRows.length) {
      vh += '<table style="width:100%;font-size:0.78rem;border-collapse:collapse;">'
          + '<tr style="border-bottom:1px solid var(--line);"><th style="text-align:left;padding:6px;">Ministry</th>'
          + '<th style="text-align:left;padding:6px;">Role</th><th style="text-align:left;padding:6px;">Date</th>'
          + '<th style="text-align:left;padding:6px;">Status</th></tr>';
      volRows.forEach(function(v) {
        vh += '<tr style="border-top:1px solid var(--line);">'
            + '<td style="padding:4px 6px;">' + _e(v.ministryTeam || '') + '</td>'
            + '<td style="padding:4px 6px;">' + _e(v.role || '') + '</td>'
            + '<td style="padding:4px 6px;">' + _e(v.scheduledDate || '') + '</td>'
            + '<td style="padding:4px 6px;">' + _e(v.status || '') + '</td></tr>';
      });
      vh += '</table>';
    } else {
      vh = '<p style="color:var(--ink-muted);font-size:0.84rem;">No volunteer assignments found.</p>';
    }
    el.innerHTML = vh;
  }

  function _loadHistory(email) {
    var el = document.getElementById('pp-sec-scrolls');
    if (!el) return;
    if (typeof TheScrolls !== 'undefined') {
      el.innerHTML = TheScrolls.renderPersonTimeline(email);
    } else {
      el.innerHTML = '<p style="color:var(--ink-muted);font-size:0.84rem;">Interaction history unavailable.</p>';
    }
  }

  // ── Approve / Deny ──────────────────────────────────────────────────────
  async function _approve(email) {
    if (!confirm('Approve ' + email + ' for membership?')) return;
    try {
      await TheVine.flock.users.approve({ email: email });
      _toast('Approved!', 'success');
      if (typeof TheScrolls !== 'undefined') TheScrolls.log(TheScrolls.TYPES.APPROVAL, email, 'Approved registration', { personName: email });
      _allPeople = null; renderApp(_container);
    } catch (e) { alert('Failed: ' + (e.message || e)); }
  }
  async function _deny(email) {
    if (!confirm('Deny registration for ' + email + '?')) return;
    try {
      await TheVine.flock.users.deny({ email: email });
      _toast('Denied.', 'danger');
      if (typeof TheScrolls !== 'undefined') TheScrolls.log(TheScrolls.TYPES.DENIAL, email, 'Denied registration', { personName: email });
      _allPeople = null; renderApp(_container);
    } catch (e) { alert('Failed: ' + (e.message || e)); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PROFILE VIEW — full-page person editor with all sections
  // ══════════════════════════════════════════════════════════════════════════

  async function openProfile(email) {
    if (!_container) return;
    _container.innerHTML = _spinner();

    var isMidKey = (email || '').indexOf('_mid_') === 0;
    var midId    = isMidKey ? email.slice(5) : '';

    // Log view
    if (typeof TheScrolls !== 'undefined') {
      TheScrolls.log(TheScrolls.TYPES.PROFILE_VIEW, email, 'Opened profile', { personName: email });
    }

    var p = _ppData[(email || '').toLowerCase()] || {};
    var u = p.user || {};
    var eid = _e(email);
    var viewer = null;
    var viewerRole = '';
    try {
      viewer = TheVine.session ? TheVine.session() : null;
      viewerRole = String((viewer && viewer.role) || '').toLowerCase();
    } catch (_) {}
    var canManageUsers = !!(viewer && ((viewer.roleLevel || 0) >= 4 || viewerRole === 'pastor' || viewerRole === 'admin'));
    var canEditPerms = canManageUsers;
    if (typeof Nehemiah !== 'undefined') {
      try {
        if (Nehemiah.can('users.edit') || Nehemiah.can('users.permissions')) canManageUsers = true;
        if (Nehemiah.can('users.permissions') || Nehemiah.can('users.edit')) canEditPerms = true;
      } catch (_) {}
    }

    // Use already-cached member and card records from the directory load.
    // Permissions and volunteer data are lazy-loaded when those sections are opened.
    var memberRec = p.member || null;
    var cardRec   = isMidKey ? null : (p.card || null);
    _openEmail = email;
    _openMemId = memberRec ? (memberRec.id || '') : '';
    _openCardId = cardRec ? (cardRec.id || '') : '';
    _hasMember = !!memberRec;
    _hasCard   = !!cardRec;

    var name = ((u.firstName || (memberRec && memberRec.firstName) || '') + ' ' + (u.lastName || (memberRec && memberRec.lastName) || '')).trim()
      || u.displayName || (memberRec && memberRec.name) || (cardRec && cardRec.name)
      || (isMidKey ? 'Member (no email)' : email);
    var html = '';

    // ── Navigation bar ──────────────────────────────────────────────────
    html += '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:12px;">';
    html += '<button onclick="TheShepherd.backToList()" style="background:none;border:1px solid var(--line);border-radius:6px;padding:6px 14px;cursor:pointer;color:var(--ink);font-size:0.84rem;">\u2190 Back to People</button>';
    html += '<button onclick="TheLife.backToHub()" style="background:none;border:1px solid var(--line);border-radius:6px;padding:6px 14px;cursor:pointer;color:var(--ink);font-size:0.78rem;">\u2190 Return to Dashboard</button>';
    html += '</div>';

    // ── Header ──────────────────────────────────────────────────────────
    html += '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-bottom:18px;">';
    html += '<div style="flex:1;min-width:0;"><h2 style="margin:0;font-size:1.1rem;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + _e(name) + '</h2>';
    html += '<span style="font-size:0.76rem;color:var(--ink-muted);">' + (isMidKey ? '<em>No email on file</em>' : eid) + '</span></div>';
    if (p.user)                html += _badge('User', 'info');
    if (p.member || memberRec) html += _badge('Member', 'success');
    if (p.card || cardRec)     html += _badge('Card', 'warn');
    if (u.status === 'pending') html += _badge('\u23F3 Pending', 'danger');
    html += '</div>';

    // ── Sticky Save bar ─────────────────────────────────────────────────
    html += '<div id="pp-save-bar" style="position:sticky;top:0;z-index:10;background:var(--bg);padding:10px 0 14px;border-bottom:1px solid var(--line);margin-bottom:16px;display:flex;gap:10px;align-items:center;">';
    html += '<button id="pp-save-btn" type="button" onclick="TheShepherd.saveAll()"'
         + ' style="background:var(--accent);color:var(--ink-inverse);border:none;border-radius:8px;'
         + 'padding:10px 28px;font-weight:700;cursor:pointer;font-size:0.92rem;font-family:inherit;">'
         + '\uD83D\uDCBE Save All Changes</button>';
    html += '<span id="pp-save-status" style="font-size:0.82rem;color:var(--ink-muted);"></span>';
    html += '</div>';

    // ── Pending-approval banner ─────────────────────────────────────────
    if (u.status === 'pending') {
      html += '<div style="background:rgba(248,113,113,0.1);border:1px solid var(--danger);border-radius:8px;padding:14px 16px;margin-bottom:16px;display:flex;flex-wrap:wrap;align-items:center;gap:12px;">';
      html += '<span style="font-size:0.88rem;font-weight:600;color:var(--danger);">Self-registration pending approval</span>';
      html += '<button onclick="TheShepherd._approve(\'' + eid + '\')" style="background:var(--success);color:#fff;border:none;border-radius:6px;padding:6px 16px;font-weight:600;cursor:pointer;">Approve</button>';
      html += '<button onclick="TheShepherd._deny(\'' + eid + '\')" style="background:var(--danger);color:#fff;border:none;border-radius:6px;padding:6px 16px;font-weight:600;cursor:pointer;">Deny</button>';
      html += '</div>';
    }

    // ═══ SECTION: Identity ═══
    var idSec = '';
    idSec += _pp2(
      _ppF('First Name', 'id_firstName', u.firstName || (memberRec && memberRec.firstName) || (cardRec && cardRec.firstName), 'text'),
      _ppF('Last Name',  'id_lastName',  u.lastName  || (memberRec && memberRec.lastName)  || (cardRec && cardRec.lastName),  'text'));
    idSec += _pp2(
      _ppF('Preferred Name', 'id_preferredName', (memberRec && memberRec.preferredName) || '', 'text'),
      _ppF('Phone', 'id_phone', u.phone || (memberRec && memberRec.cellPhone) || (cardRec && cardRec.phone), 'tel'));
    idSec += _ppF('Email', 'id_email', isMidKey ? '' : email, 'email');
    idSec += _ppF('Photo URL', 'id_photoUrl', u.photoUrl || (memberRec && memberRec.photoUrl) || (cardRec && cardRec.photoUrl), 'text');
    html += _ppSec('Identity', 'identity', idSec, true);

    // ═══ SECTION: Account (AuthUsers) ═══
    if (u && Object.keys(u).length) {
      var acc = '';
      acc += _pp2(
        _ppF('Role', 'acct_role', u.role || 'readonly', 'select', ['readonly','volunteer','leader','deacon','treasurer','pastor','admin']),
        _ppF('Status', 'acct_status', u.status || 'active', 'select', ['active','pending','suspended','disabled'])
      );
      html += _ppSec('Account', 'account', acc, false);
    } else if (!isMidKey) {
      html += _ppSec('Account', 'account-none',
        '<p style="color:var(--ink-muted);font-size:0.84rem;">No login account exists for this person.</p>'
        + (canManageUsers
          ? ('<button type="button" onclick="TheShepherd._createUserAccount(\'' + eid + '\')"'
            + ' style="background:var(--accent);color:var(--ink-inverse);border:none;border-radius:6px;padding:8px 16px;font-weight:600;cursor:pointer;font-size:0.84rem;">+ Create User Account</button>')
          : ''), false);
    }

    // ═══ MEMBER SECTIONS ═══
    if (memberRec) {
      var mid = '<input type="hidden" id="pp-mem_id" value="' + _e(memberRec.id || '') + '">';

      // ── Member ID bar (read-only PIN for physical card) ──
      var _pin = memberRec.memberPin || '';
      html += '<div style="display:flex;align-items:center;gap:12px;background:var(--bg-raised,var(--surface));border:1px solid var(--line);border-radius:8px;padding:10px 16px;margin-bottom:14px;flex-wrap:wrap;">';
      html += '<span style="font-size:0.75rem;color:var(--ink-muted);white-space:nowrap;">&#128272; Member ID</span>';
      if (_pin) {
        html += '<span style="font-family:monospace;font-size:1.05rem;letter-spacing:0.12em;font-weight:700;color:var(--accent);">' + _e(_pin) + '</span>';
        html += '<button type="button" onclick="navigator.clipboard.writeText(\'' + _e(_pin) + '\').then(function(){var b=this;b.textContent=\'Copied!\';setTimeout(function(){b.textContent=\'Copy\';},1500);}.bind(this))"'
          + ' style="margin-left:auto;background:none;border:1px solid var(--line);border-radius:5px;padding:3px 10px;cursor:pointer;font-size:0.77rem;color:var(--ink-muted);">Copy</button>';
      } else {
        html += '<span style="color:var(--ink-muted);font-size:0.83rem;">Not yet assigned</span>';
        html += '<span style="margin-left:auto;font-size:0.75rem;color:var(--ink-muted);">Generate from the admin panel</span>';
      }
      html += '</div>';

      // ── Address ──
      var adr = '';
      adr += _ppF('Street', 'mem_address1', memberRec.address1, 'text');
      adr += _pp2(
        _ppF('City',  'mem_city',  memberRec.city,  'text'),
        _ppF('State', 'mem_state', memberRec.state, 'text'));
      adr += _pp2(
        _ppF('ZIP', 'mem_zip', memberRec.zip, 'text'),
        _ppF('Country', 'mem_country', memberRec.country, 'text'));
      html += _ppSec('Address', 'address', adr, false);

      // ── Membership ──
      var mbr = '';
      mbr += _pp2(
        _ppF('Status', 'mem_membershipStatus', memberRec.membershipStatus, 'select',
          ['Active','Inactive','Visitor','Prospect','Former','Transferred','Deceased']),
        _ppF('Member Since', 'mem_memberSince', (memberRec.memberSince || '').substring(0,10), 'date'));
      mbr += _pp2(
        _ppF('Date of Birth', 'mem_dateOfBirth', (memberRec.dateOfBirth || '').substring(0,10), 'date'),
        _ppF('Gender', 'mem_gender', memberRec.gender, 'select', ['','Male','Female','Other']));
      mbr += _pp2(
        _ppF('Marital Status', 'mem_maritalStatus', memberRec.maritalStatus, 'select',
          ['','Single','Married','Divorced','Widowed','Separated']),
        _ppF('How Found Us', 'mem_howTheyFoundUs', memberRec.howTheyFoundUs, 'select',
          ['','Website','Friend','Event','Social Media','Walk-In','Mailer','Other']));
      mbr += _pp2(
        _ppF('Emergency Contact', 'mem_emergencyContact', memberRec.emergencyContact, 'text'),
        _ppF('Emergency Phone',   'mem_emergencyPhone',   memberRec.emergencyPhone, 'tel'));
      mbr += mid;
      html += _ppSec('Membership', 'membership', mbr, false);

      // ── Spiritual ──
      var spr = '';
      spr += _pp2(
        _ppF('Baptism Date',   'mem_baptismDate',   (memberRec.baptismDate   || '').substring(0,10), 'date'),
        _ppF('Salvation Date', 'mem_salvationDate', (memberRec.salvationDate || '').substring(0,10), 'date'));
      spr += _ppF('Pastoral Notes', 'mem_pastoralNotes', memberRec.pastoralNotes, 'textarea');
      html += _ppSec('Spiritual', 'spiritual', spr, false);

    } else {
      html += _ppSec('Member Record', 'member-none',
        '<p style="color:var(--ink-muted);font-size:0.84rem;">No member record linked to this account.</p>'
        + '<button type="button" onclick="TheShepherd._createMember(\'' + eid + '\')"'
        + ' style="background:var(--accent);color:var(--ink-inverse);border:none;border-radius:6px;padding:8px 16px;font-weight:600;cursor:pointer;font-size:0.84rem;">+ Create Member Record</button>', false);
    }

    // ═══ SECTION: Contact Card ═══
    if (cardRec) {
      var cd = '';
      cd += _pp2(
        _ppF('Card Title', 'card_cardTitle', cardRec.cardTitle || '', 'text'),
        _ppF('Ministry', 'card_ministry', cardRec.ministry || '', 'text')
      );
      cd += _pp2(
        _ppF('Status', 'card_status', cardRec.status || 'Active', 'select', ['Active','Inactive','Archived']),
        _ppF('Visibility', 'card_visibility', cardRec.visibility || 'public', 'select', ['public','authenticated','private'])
      );
      cd += _ppF('Bio', 'card_cardBio', cardRec.cardBio || cardRec.bio || '', 'textarea');
      cd += '<input type="hidden" id="pp-card_id" value="' + _e(cardRec.id || '') + '">';
      html += _ppSec('Contact Card', 'card', cd, false);
    } else if (!isMidKey) {
      html += _ppSec('Contact Card', 'card-none',
        '<p style="color:var(--ink-muted);font-size:0.84rem;">No contact card linked to this person.</p>'
        + '<button type="button" onclick="TheShepherd._createCard(\'' + eid + '\')"'
        + ' style="background:var(--accent);color:var(--ink-inverse);border:none;border-radius:6px;padding:8px 16px;font-weight:600;cursor:pointer;font-size:0.84rem;">+ Create Contact Card</button>', false);
    }

    // ═══ SECTION: Permissions (lazy loaded) ═══
    if (canEditPerms && !isMidKey) {
      html += _ppSecLazy('Permissions', 'permissions', 'TheShepherd._loadPerms(' + JSON.stringify(email) + ')');
    }

    // ═══ SECTION: Admin Actions ═══
    if (canManageUsers && !isMidKey) {
      var as = '';
      as += '<div style="display:flex;gap:10px;flex-wrap:wrap;">';
      as += '<button type="button" onclick="TheShepherd._resetPasscode(\'' + eid + '\')"'
         + ' style="background:none;border:1px solid var(--line);color:var(--ink);border-radius:6px;padding:8px 14px;cursor:pointer;font-weight:600;font-size:0.83rem;">Reset Passcode</button>';
      if (memberRec) {
        as += '<button type="button" onclick="TheShepherd._deleteMember(\'' + _e(memberRec.id || '') + '\',\'' + eid + '\')"'
           + ' style="background:none;border:1px solid var(--line);color:var(--danger);border-radius:6px;padding:8px 14px;cursor:pointer;font-weight:600;font-size:0.83rem;">Delete Member Record</button>';
      }
      as += '<button type="button" onclick="TheShepherd._deleteUser(\'' + eid + '\')"'
         + ' style="background:var(--danger);border:1px solid var(--danger);color:#fff;border-radius:6px;padding:8px 14px;cursor:pointer;font-weight:700;font-size:0.83rem;">Delete User</button>';
      as += '</div>';
      as += '<p style="margin-top:10px;font-size:0.76rem;color:var(--ink-muted);">Delete User performs a full account wipe (Auth, access, permissions, and related records).</p>';
      html += _ppSec('Admin Actions', 'admin-actions', as, false);
    }

    // ── Bottom Save ─────────────────────────────────────────────────────
    html += '<div style="margin-top:20px;padding:16px 0;border-top:1px solid var(--line);display:flex;gap:10px;align-items:center;">';
    html += '<button type="button" onclick="TheShepherd.saveAll()"'
         + ' style="background:var(--accent);color:var(--ink-inverse);border:none;border-radius:8px;'
         + 'padding:10px 28px;font-weight:700;cursor:pointer;font-size:0.92rem;font-family:inherit;">'
         + '\uD83D\uDCBE Save All Changes</button>';
    html += '<span id="pp-save-status2" style="font-size:0.82rem;color:var(--ink-muted);"></span>';
    html += '</div>';


    _container.innerHTML = html;
    var _m = document.getElementById('main'); if (_m) _m.scrollTop = 0;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SAVE ALL — 3-step save (Account → Member → Card)
  // ══════════════════════════════════════════════════════════════════════════

  async function saveAll() {
    var email = _openEmail;
    if (!email) { alert('No person loaded.'); return; }
    var btn = document.getElementById('pp-save-btn');
    var st1 = document.getElementById('pp-save-status');
    var st2 = document.getElementById('pp-save-status2');
    function _stat(msg) { if (st1) st1.textContent = msg; if (st2) st2.textContent = msg; }
    if (btn) { btn.disabled = true; btn.textContent = 'Saving\u2026'; }
    _stat('');
    var errors = [];

    var _v = function(id) { var e = document.getElementById('pp-' + id); return e ? e.value : ''; };
    var idFirst     = _v('id_firstName');
    var idLast      = _v('id_lastName');
    var idPreferred = _v('id_preferredName');
    var idSuffix    = _v('id_suffix');
    var idEmail     = _v('id_email');
    var idPhone     = _v('id_phone');
    var idPhoto     = _v('id_photoUrl');

    // 1. Account (skip for members with no email — no AuthUsers row)
    var isMidKey = (email || '').indexOf('_mid_') === 0;
    if (!isMidKey) {
      try {
        var acct = { targetEmail: email, firstName: idFirst, lastName: idLast, phone: idPhone, photoUrl: idPhoto };
        document.querySelectorAll('#pp-sec-account [data-field]').forEach(function(el) {
          var f = el.getAttribute('data-field');
          if (f.indexOf('acct_') === 0) acct[f.substring(5)] = el.value;
        });
        _stat('Saving account\u2026');
        await TheVine.flock.users.update(acct);
      } catch (e) { errors.push('Account: ' + (e.message || e)); }
    }

    // 2. Member
    if (_hasMember) {
      try {
        var mem = { firstName: idFirst, lastName: idLast, preferredName: idPreferred,
          suffix: idSuffix, primaryEmail: idEmail, cellPhone: idPhone, photoUrl: idPhoto };
        document.querySelectorAll('.pp-section [data-field]').forEach(function(el) {
          var f = el.getAttribute('data-field');
          if (f.indexOf('mem_') === 0) mem[f.substring(4)] = el.value;
        });
        var memId = _openMemId || (document.getElementById('pp-mem_id') || {}).value;
        if (memId) {
          mem.id = memId;
          _stat('Saving member record\u2026');
          await (_isFB() ? UpperRoom.updateMember(mem) : TheVine.flock.call('members.update', mem));
        }
      } catch (e) { errors.push('Member: ' + (e.message || e)); }
    }

    // 3. Card
    if (_hasCard) {
      try {
        var card = { firstName: idFirst, lastName: idLast, preferredName: idPreferred,
          suffix: idSuffix, email: idEmail, phone: idPhone, photoUrl: idPhoto };
        document.querySelectorAll('#pp-sec-card [data-field]').forEach(function(el) {
          var f = el.getAttribute('data-field');
          if (f.indexOf('card_') === 0) card[f.substring(5)] = el.value;
        });
        var cardId = _openCardId || (document.getElementById('pp-card_id') || {}).value;
        if (cardId) {
          card.id = cardId;
          _stat('Saving contact card\u2026');
          await (_isFB() ? UpperRoom.updateMemberCard(card) : TheVine.flock.memberCards.update(card));
        }
      } catch (e) { errors.push('Card: ' + (e.message || e)); }
    }

    if (btn) { btn.disabled = false; btn.textContent = '\uD83D\uDCBE Save All Changes'; }
    if (errors.length) {
      _stat('');
      alert('Some saves failed:\n\n' + errors.join('\n'));
    } else {
      _toast('All changes saved!', 'success');
      _stat('Saved \u2713');
      if (typeof TheScrolls !== 'undefined') {
        TheScrolls.log(TheScrolls.TYPES.PROFILE_SAVE, email, 'Saved profile changes', { personName: idFirst + ' ' + idLast });
      }
      try { await openProfile(email); } catch (_) {}
    }
  }

  // ── Create member / card helpers ────────────────────────────────────────
  async function _createMember(email) {
    var p = _ppData[(email || '').toLowerCase()] || {};
    var u = p.user || {};
    // Redirect to the canonical Add Member form (TheLife) so all member creation
    // goes through one consistent workflow — including auto-care-assignment.
    var prefill = {
      primaryEmail: email,
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      cellPhone: u.phone || '',
      photoUrl: u.photoUrl || ''
    };
    var target = document.getElementById('view-my-flock');
    if (target) {
      document.querySelectorAll('.module-view').forEach(function(v) { v.classList.remove('active'); });
      target.classList.add('active');
      document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
      var nav = document.querySelector('.nav-item[data-view="my-flock"]');
      if (nav) nav.classList.add('active');
    }
    if (typeof TheLife !== 'undefined') TheLife.openAddMember('', prefill);
  }

  async function _deleteMember(memberId, email) {
    if (!memberId && !email) return;
    var label = email && email.indexOf('_mid_') !== 0 ? email : (memberId || 'this member');
    if (!confirm('Permanently DELETE the member record for ' + label + '?\n\nThis removes their record from Members. The login account (if any) is NOT deleted.\n\nThis cannot be undone.')) return;
    try {
      await (_isFB() ? UpperRoom.deleteMember(memberId || email) : TheVine.flock.call('members.delete', { id: memberId, targetEmail: email && email.indexOf('_mid_') !== 0 ? email : '' }));
      _toast('Member record deleted.', 'success');
      if (typeof TheScrolls !== 'undefined') TheScrolls.log(TheScrolls.TYPES.ADMIN_ACTION, email, 'Deleted member record', { memberId: memberId });
      // Return to people list since the profile no longer has a member record
      _allPeople = null; renderApp(_container);
    } catch (e) { alert('Failed: ' + (e.message || e)); }
  }

  async function _createCard(email) {
    var p = _ppData[(email || '').toLowerCase()] || {};
    var u = p.user || {};
    try {
      await (_isFB() ? UpperRoom.createMemberCard({
        email: email, firstName: u.firstName || '', lastName: u.lastName || '',
        phone: u.phone || '', photoUrl: u.photoUrl || '', status: 'Active'
      }) : TheVine.flock.memberCards.create({
        email: email, firstName: u.firstName || '', lastName: u.lastName || '',
        phone: u.phone || '', photoUrl: u.photoUrl || '', status: 'Active'
      }));
      _toast('Contact card created!', 'success');
      if (typeof TheScrolls !== 'undefined') TheScrolls.log(TheScrolls.TYPES.CARD_CREATE, email, 'Created contact card');
      openProfile(email);
    } catch (e) { alert('Failed: ' + (e.message || e)); }
  }

  // ── Permission helpers (simplified UI) ────────────────────────────────

  /* Select a preset: highlight the button, apply its permission list + keep adv overrides */
  function _selectPreset(templateKey) {
    var templates = window._shepPermTemplates || {};
    var baseKeys = templateKey === 'none' ? [] : (templates[templateKey] || []);
    var baseSet = new Set(baseKeys);

    // Highlight the selected preset button, deselect others
    document.querySelectorAll('[id^="shep-preset-"]').forEach(function(btn) {
      var isActive = btn.id === 'shep-preset-' + templateKey;
      btn.style.background = isActive ? 'var(--accent)' : 'none';
      btn.style.color      = isActive ? 'var(--ink-inverse)' : 'var(--ink)';
      btn.style.border     = isActive ? '2px solid var(--accent)' : '2px solid var(--line)';
    });

    // Store selected template key
    var tkey = document.getElementById('shep-template-key');
    if (tkey) tkey.value = templateKey;

    // Apply advanced overrides: keep checked if in base OR if manually checked
    document.querySelectorAll('.shep-adv-chk').forEach(function(chk) {
      var key = chk.getAttribute('data-perm-key');
      chk.checked = baseSet.has(key);
    });

    _syncAdvCritConfirm();
  }

  /* When an advanced override checkbox changes, sync the crit confirm box */
  function _onAdvChkChange() {
    _syncAdvCritConfirm();
  }

  function _syncAdvCritConfirm() {
    var anyCrit = false;
    document.querySelectorAll('.shep-adv-chk').forEach(function(c) {
      if (c.getAttribute('data-risk') === 'critical' && c.checked) anyCrit = true;
    });
    var box = document.getElementById('shep-crit-confirm');
    if (box) {
      box.style.display = anyCrit ? '' : 'none';
      if (!anyCrit) {
        var ck  = document.getElementById('shep-crit-chk');
        var txt = document.getElementById('shep-crit-txt');
        if (ck)  ck.checked = false;
        if (txt) txt.value  = '';
      }
    }
  }

  async function _savePerms(targetEmail) {
    var canEditPerms = false;
    try {
      if (typeof Nehemiah !== 'undefined' && (Nehemiah.can('users.permissions') || Nehemiah.can('users.edit'))) {
        canEditPerms = true;
      }
    } catch (_) {}
    if (!canEditPerms) {
      try {
        var s = TheVine.session ? TheVine.session() : null;
        var role = String((s && s.role) || '').toLowerCase();
        canEditPerms = !!(s && ((s.roleLevel || 0) >= 4 || role === 'pastor' || role === 'admin'));
      } catch (_) {}
    }
    if (!canEditPerms) {
      _toast('You do not have permission to edit permissions.', 'danger');
      return;
    }
    var hasCritChecked = Array.from(document.querySelectorAll('.shep-adv-chk'))
      .some(function(c) { return c.checked && c.getAttribute('data-risk') === 'critical'; });
    if (hasCritChecked) {
      var critChk = document.getElementById('shep-crit-chk');
      var critTxt = document.getElementById('shep-crit-txt');
      if (!critChk || !critChk.checked || !critTxt || critTxt.value.trim() !== 'Yes') {
        if (typeof _toast === 'function') _toast('Please confirm critical permissions: check the box and type \u201cYes\u201d before saving.', 'warning');
        else alert('Please confirm all critical permissions before saving.');
        var critBox = document.getElementById('shep-crit-confirm');
        if (critBox) critBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    var st = document.getElementById('shep-perm-status');
    if (st) st.textContent = 'Saving\u2026';

    // Build final grants: start from preset, then apply adv overrides
    var tkey = document.getElementById('shep-template-key');
    var templateKey = tkey ? tkey.value : '';
    var templates = window._shepPermTemplates || {};
    var baseKeys = templateKey && templateKey !== 'none' ? (templates[templateKey] || []) : [];
    var baseSet = new Set(baseKeys);

    // Advanced overrides: add checked ones, remove unchecked ones from base
    document.querySelectorAll('.shep-adv-chk').forEach(function(chk) {
      var key = chk.getAttribute('data-perm-key');
      if (chk.checked) { baseSet.add(key); }
      else { baseSet.delete(key); }
    });

    var grants = Array.from(baseSet);
    try {
      await (_isFB() ? UpperRoom.setPermissions(targetEmail, grants, []) : TheVine.flock.call('permissions.setAll', { targetEmail: targetEmail, grants: grants, denies: [] }));
      if (st) { st.textContent = '\u2713 Saved'; setTimeout(function() { if (st) st.textContent = ''; }, 2000); }
    } catch (e) {
      if (st) st.textContent = 'Error: ' + (e.message || e);
    }
  }

  // ── Delete / Wipe User (admin) ────────────────────────────────────────
  async function _deleteUser(email) {
    var canDeleteUsers = false;
    try {
      if (typeof Nehemiah !== 'undefined' && (Nehemiah.can('users.delete') || Nehemiah.can('users.deactivate') || Nehemiah.can('users.edit'))) {
        canDeleteUsers = true;
      }
    } catch (_) {}
    if (!canDeleteUsers) {
      try {
        var s = TheVine.session ? TheVine.session() : null;
        var role = String((s && s.role) || '').toLowerCase();
        canDeleteUsers = !!(s && ((s.roleLevel || 0) >= 5 || role === 'admin'));
      } catch (_) {}
    }
    if (!canDeleteUsers) {
      _toast('Only admins can delete users.', 'danger');
      return;
    }
    if (!email) return;
    var confirmed = confirm(
      'PERMANENTLY DELETE & WIPE this user?\n\n' + email +
      '\n\nThis will remove ALL their data from:\n' +
      '• AuthUsers / AccessControl / Permissions\n' +
      '• Members / MemberCards / UserProfiles\n' +
      '• Journal, Prayer Requests, To-Do items\n' +
      '• Giving, Pledges, Volunteer records\n' +
      '• Contact Log, Pastoral Notes, Milestones\n' +
      '• Spiritual Care, Compassion, Outreach\n' +
      '• Discipleship, Learning, Quiz Results\n' +
      '• Conversations, Notifications, Calendar\n' +
      '• Small Group memberships\n' +
      '\nData is wiped from BOTH GAS and Firestore.\n\n' +
      'This action CANNOT be undone.'
    );
    if (!confirmed) return;
    var doubleConfirm = confirm('Are you absolutely sure? Type OK to confirm FULL WIPE of ' + email);
    if (!doubleConfirm) return;

    _toast('Wiping user data…', 'info');

    var gasOk = false, fbOk = false, fbResult = null;

    // 1. GAS wipe — deletes AuthUsers + AccessControl + Permissions rows
    try {
      await TheVine.flock.users.delete({ targetEmail: email });
      gasOk = true;
    } catch (e) {
      console.warn('[Shepherd] GAS delete failed:', e);
    }

    // 2. Firestore cascade wipe — all collections
    try {
      if (typeof TheUpperRoom !== 'undefined' && TheUpperRoom.deleteUserCascade) {
        fbResult = await TheUpperRoom.deleteUserCascade(email);
        fbOk = true;
      }
    } catch (e) {
      console.warn('[Shepherd] Firestore cascade failed:', e);
    }

    // === Build result summary ===
    var parts = [];
    if (gasOk) parts.push('GAS ✓');
    else parts.push('GAS ✗');
    if (fbOk && fbResult) {
      var total = (fbResult.totalDeleted || 0) + (fbResult.totalUpdated || 0);
      parts.push('Firestore ✓ (' + total + ' records)');
    } else if (!fbOk && typeof TheUpperRoom !== 'undefined') {
      parts.push('Firestore ✗');
    }

    if (gasOk || fbOk) {
      _toast('User wiped: ' + email + ' — ' + parts.join(', '), 'success');
      if (typeof TheScrolls !== 'undefined') {
        TheScrolls.log(TheScrolls.TYPES.ADMIN_ACTION, email, 'Admin wiped user (full cascade)', {
          personName: email,
          gasDeleted: gasOk,
          firestoreResult: fbResult ? fbResult.summary : null
        });
      }
    } else {
      alert('Wipe failed for both backends. Check console for details.');
    }

    _allPeople = null; renderApp(_container);
  }

  async function _resetPasscode(email) {
    if (typeof Modules !== 'undefined' && Modules._modal) {
      Modules._modal('Reset Passcode', [
        { name: 'newPasscode', label: 'New Passcode (6+ characters)', type: 'text', required: true },
      ], async function(data) {
        if (!data.newPasscode || data.newPasscode.length < 6) {
          alert('Passcode must be at least 6 characters.'); return;
        }
        try {
          await TheVine.flock.users.resetPasscode({ targetEmail: email, newPasscode: data.newPasscode });
          _toast('Passcode reset for ' + email, 'success');
          if (typeof TheScrolls !== 'undefined') TheScrolls.log(TheScrolls.TYPES.ADMIN_ACTION, email, 'Admin reset passcode', { personName: email });
        } catch (e) { alert('Failed: ' + (e.message || e)); }
      });
    } else {
      var np = prompt('Enter new passcode for ' + email + ' (6+ characters):');
      if (!np) return;
      if (np.length < 6) { alert('Passcode must be at least 6 characters.'); return; }
      try {
        await TheVine.flock.users.resetPasscode({ targetEmail: email, newPasscode: np });
        _toast('Passcode reset for ' + email, 'success');
        if (typeof TheScrolls !== 'undefined') TheScrolls.log(TheScrolls.TYPES.ADMIN_ACTION, email, 'Admin reset passcode', { personName: email });
      } catch (e) { alert('Failed: ' + (e.message || e)); }
    }
  }

  // ── Create User Account (for members without login) ─────────────────────
  async function _createUserAccount(email) {
    var p = _ppData[(email || '').toLowerCase()] || {};
    var m = p.member || {};
    var firstName = m.firstName || '';
    var lastName = m.lastName || '';
    if (typeof Modules !== 'undefined' && Modules._modal) {
      Modules._modal('Create User Account', [
        { name: 'role', label: 'Role', type: 'select', options: [
          { value: 'readonly', label: 'Readonly' },
          { value: 'volunteer', label: 'Volunteer' },
          { value: 'leader', label: 'Leader' },
          { value: 'deacon', label: 'Deacon' },
          { value: 'treasurer', label: 'Treasurer' },
          { value: 'pastor', label: 'Pastor' },
          { value: 'admin', label: 'Admin' },
        ], required: true },
        { name: 'passcode', label: 'Temporary Passcode (6+ chars)', type: 'text', required: true },
      ], async function(data) {
        if (!data.passcode || data.passcode.length < 6) {
          alert('Passcode must be at least 6 characters.'); return;
        }
        try {
          var _userData = {
            email: email, firstName: firstName, lastName: lastName,
            displayName: (firstName + ' ' + lastName).trim(),
            role: data.role, passcode: data.passcode
          };
          await TheVine.flock.users.create(_userData);
          _toast('User account created for ' + email, 'success');
          if (typeof TheScrolls !== 'undefined') TheScrolls.log(TheScrolls.TYPES.ADMIN_ACTION, email, 'Created user account', { personName: firstName + ' ' + lastName });
          openProfile(email);
        } catch (e) { alert('Failed: ' + (e.message || e)); }
      });
    } else {
      var role = prompt('Role (readonly, volunteer, leader, deacon, treasurer, pastor, admin):');
      if (!role) return;
      var passcode = prompt('Temporary passcode (6+ characters):');
      if (!passcode || passcode.length < 6) { alert('Passcode must be at least 6 characters.'); return; }
      try {
        var _userData2 = {
          email: email, firstName: firstName, lastName: lastName,
          displayName: (firstName + ' ' + lastName).trim(),
          role: role, passcode: passcode
        };
        await TheVine.flock.users.create(_userData2);
        _toast('User account created for ' + email, 'success');
        if (typeof TheScrolls !== 'undefined') TheScrolls.log(TheScrolls.TYPES.ADMIN_ACTION, email, 'Created user account', { personName: firstName + ' ' + lastName });
        openProfile(email);
      } catch (e) { alert('Failed: ' + (e.message || e)); }
    }
  }

  // ── Navigation ──────────────────────────────────────────────────────────
  function backToList() {
    _allPeople = null;  // force fresh data on return to list
    if (_container) renderApp(_container);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════════════════
  return {
    renderApp:    renderApp,
    openProfile:  openProfile,
    saveAll:      saveAll,
    backToList:   backToList,
    _search:      _search,
    _filter:      _filter,
    _approve:     _approve,
    _deny:        _deny,
    _createMember: _createMember,
    _createCard:   _createCard,
    _selectPreset:       _selectPreset,
    _onAdvChkChange:    _onAdvChkChange,
    _savePerms:         _savePerms,
    _loadPerms:         _loadPerms,
    _loadVolunteers:    _loadVolunteers,
    _loadHistory:       _loadHistory,
    _deleteUser: _deleteUser,
    _deleteMember: _deleteMember,
    _resetPasscode: _resetPasscode,
    _createUserAccount: _createUserAccount,
  };
})();
