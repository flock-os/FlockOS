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
  function _ppSec(title, id, content) {
    return '<details class="pp-section" open style="margin-bottom:16px;border:1px solid var(--line);border-radius:8px;overflow:hidden;">'
      + '<summary style="padding:12px 16px;background:rgba(255,255,255,0.04);cursor:pointer;font-weight:700;font-size:0.82rem;color:var(--accent);user-select:none;">' + _e(title) + '</summary>'
      + '<div style="padding:16px;" id="pp-sec-' + id + '">' + content + '</div></details>';
  }

  var _ROLE_LEVELS = {
    readonly: 0, volunteer: 1, care: 2, deacon: 2,
    leader: 3, treasurer: 3, pastor: 4, admin: 5
  };

  // ── State ───────────────────────────────────────────────────────────────
  var _container = null;     // current render target
  var _ppData    = {};       // merged people map keyed by lower-case email
  var _openEmail = '';       // currently open profile email
  var _openMemId = '';       // member record ID (if exists)
  var _openCardId = '';      // card record ID (if exists)
  var _hasMember = false;
  var _hasCard   = false;

  // ══════════════════════════════════════════════════════════════════════════
  // PEOPLE LIST — search, filter, table
  // ══════════════════════════════════════════════════════════════════════════

  async function renderApp(container, opts) {
    _container = container;
    opts = opts || {};
    container.innerHTML = _spinner();

    try {
      // Parallel-load users, members, cards (users.list may fail for non-admin)
      var res = await Promise.allSettled([
        TheVine.flock.users.list(),
        TheVine.flock.members.list(),
        TheVine.flock.memberCards.directory(),
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
        if (!k) k = '_mid_' + (m.id || m.memberId || ('idx' + Math.random().toString(36).slice(2,8)));
        map[k] = map[k] || { email: k }; map[k].member = m;
      });
      cards.forEach(function(c) {
        var k = (c.email || '').toLowerCase(); if (!k) return;
        map[k] = map[k] || { email: k }; map[k].card = c;
      });
      _ppData = map;

      var people = Object.values(map);
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
         + ' style="flex:1;min-width:200px;background:rgba(255,255,255,0.07);border:1px solid var(--line);border-radius:6px;padding:8px 12px;color:var(--ink);font-size:0.88rem;font-family:inherit;">';
      h += '<select id="shep-filter" onchange="TheShepherd._filter(this.value)"'
         + ' style="background:rgba(255,255,255,0.07);border:1px solid var(--line);border-radius:6px;padding:8px 12px;color:var(--ink);font-size:0.84rem;font-family:inherit;">'
         + '<option value="all">All People</option>'
         + '<option value="user">Users Only</option>'
         + '<option value="member">Members Only</option>'
         + '<option value="both">Users + Members</option>'
         + '<option value="card">Has Card</option>'
         + '<option value="pending">Pending Approval</option></select>';
      h += '</div>';

      // stat pills
      h += '<div style="display:flex;gap:16px;margin-bottom:14px;font-size:0.76rem;color:var(--ink-muted);">';
      h += '<span>' + people.length + ' people</span>';
      h += '<span>' + nU + ' users</span><span>' + nM + ' members</span><span>' + nC + ' cards</span>';
      if (nP) h += '<span style="color:var(--danger);">' + nP + ' pending</span>';
      h += '</div>';

      // table
      h += '<div id="shep-tbl">' + _buildTable(people) + '</div>';
      container.innerHTML = h;
    } catch (e) { container.innerHTML = _errHtml(e.message); }
  }

  function _buildTable(list) {
    if (!list.length) return _empty('\uD83D\uDC64', 'No people found.');
    var t = '<table class="data-table"><thead><tr><th>Name</th><th>Email</th><th>Type</th><th>Role</th><th>Status</th><th></th></tr></thead><tbody>';
    list.forEach(function(p) {
      var u = p.user || {}, m = p.member || {}, c = p.card || {};
      var name = ((u.firstName || m.firstName || c.firstName || '') + ' ' + (u.lastName || m.lastName || c.lastName || '')).trim() || u.displayName || 'Unknown';
      var types = [];
      if (p.user) types.push('User');
      if (p.member) types.push('Member');
      if (p.card) types.push('Card');
      var role   = u.role || '\u2014';
      var status = u.status || m.membershipStatus || c.status || '\u2014';
      var isPending = u.status === 'pending';
      var isMidKey = (p.email || '').indexOf('_mid_') === 0;
      var eid = _e(p.email);

      t += '<tr class="shep-row" data-email="' + eid + '"'
         + ' data-search="' + _e((name + ' ' + (isMidKey ? '' : p.email) + ' ' + (u.phone || m.cellPhone || c.phone || '')).toLowerCase()) + '"'
         + ' data-tu="' + (p.user ? 1 : 0) + '" data-tm="' + (p.member ? 1 : 0) + '" data-tc="' + (p.card ? 1 : 0) + '"'
         + ' data-pend="' + (isPending ? 1 : 0) + '"'
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
    });
    return t + '</tbody></table>';
  }

  // ── Search & filter ─────────────────────────────────────────────────────
  function _search(q) {
    q = (q || '').toLowerCase().trim();
    document.querySelectorAll('.shep-row').forEach(function(r) {
      r.style.display = (!q || (r.dataset.search || '').indexOf(q) >= 0) ? '' : 'none';
    });
    if (q && typeof TheScrolls !== 'undefined') {
      TheScrolls.log(TheScrolls.TYPES.SEARCH, '', 'People search: ' + q);
    }
  }
  function _filter(val) {
    document.querySelectorAll('.shep-row').forEach(function(r) {
      var show = true;
      if      (val === 'user')    show = r.dataset.tu === '1';
      else if (val === 'member')  show = r.dataset.tm === '1';
      else if (val === 'both')    show = r.dataset.tu === '1' && r.dataset.tm === '1';
      else if (val === 'card')    show = r.dataset.tc === '1';
      else if (val === 'pending') show = r.dataset.pend === '1';
      r.style.display = show ? '' : 'none';
    });
  }

  // ── Approve / Deny ──────────────────────────────────────────────────────
  async function _approve(email) {
    if (!confirm('Approve ' + email + ' for membership?')) return;
    try {
      await TheVine.flock.users.approve({ email: email });
      _toast('Approved!', 'success');
      if (typeof TheScrolls !== 'undefined') TheScrolls.log(TheScrolls.TYPES.APPROVAL, email, 'Approved registration', { personName: email });
      renderApp(_container);
    } catch (e) { alert('Failed: ' + (e.message || e)); }
  }
  async function _deny(email) {
    if (!confirm('Deny registration for ' + email + '?')) return;
    try {
      await TheVine.flock.users.deny({ email: email });
      _toast('Denied.', 'danger');
      if (typeof TheScrolls !== 'undefined') TheScrolls.log(TheScrolls.TYPES.DENIAL, email, 'Denied registration', { personName: email });
      renderApp(_container);
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

    // Parallel load detailed records
    var permData = { overrides: [], permissions: {} }, moduleMap = {};
    var memberRec = null, cardRec = null, volRows = [];
    try {
      var fetches = [
        isMidKey ? Promise.resolve(null) : TheVine.flock.call('permissions.get', { targetEmail: email }),
        TheVine.flock.call('permissions.list', {}),
        isMidKey ? TheVine.flock.call('members.get', { id: midId }) : TheVine.flock.call('members.get', { email: email }),
        isMidKey ? Promise.resolve([]) : TheVine.flock.memberCards.search({ q: email }),
        TheVine.flock.call('volunteers.list', {}),
      ];
      var f = await Promise.allSettled(fetches);
      permData  = (f[0].status === 'fulfilled' && f[0].value) || permData;
      moduleMap = (f[1].status === 'fulfilled' && f[1].value && f[1].value.modules) || {};
      memberRec = (f[2].status === 'fulfilled' && f[2].value && !f[2].value.error) ? f[2].value : null;
      var cArr  = (f[3].status === 'fulfilled' && Array.isArray(f[3].value)) ? f[3].value : [];
      cardRec   = isMidKey ? null : cArr.find(function(c) { return (c.email || '').toLowerCase() === email.toLowerCase(); }) || null;
      var aVol  = (f[4].status === 'fulfilled' && f[4].value && f[4].value.rows) || [];
      volRows   = aVol.filter(function(v) {
        return (v.memberId || '').toLowerCase() === email.toLowerCase()
          || (v.memberName || '').toLowerCase().indexOf((u.firstName || '').toLowerCase()) >= 0;
      });
    } catch (_) {}

    _openEmail = email;
    _openMemId = memberRec ? (memberRec.id || '') : '';
    _openCardId = cardRec ? (cardRec.id || '') : '';
    _hasMember = !!memberRec;
    _hasCard   = !!cardRec;

    var name = ((u.firstName || (memberRec && memberRec.firstName) || '') + ' ' + (u.lastName || (memberRec && memberRec.lastName) || '')).trim() || u.displayName || (isMidKey ? 'Unknown' : email);
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
    idSec += '<p style="font-size:0.72rem;color:var(--ink-muted);margin:0 0 12px;">Synced across Account, Member Record, and Contact Card.</p>';
    idSec += _pp2(
      _ppF('First Name', 'id_firstName', u.firstName || (memberRec && memberRec.firstName) || (cardRec && cardRec.firstName), 'text'),
      _ppF('Last Name',  'id_lastName',  u.lastName  || (memberRec && memberRec.lastName)  || (cardRec && cardRec.lastName),  'text'));
    idSec += _pp2(
      _ppF('Preferred Name', 'id_preferredName', (memberRec && memberRec.preferredName) || (cardRec && cardRec.preferredName), 'text'),
      _ppF('Suffix',         'id_suffix',        (memberRec && memberRec.suffix) || (cardRec && cardRec.suffix), 'text'));
    idSec += _pp2(
      _ppF('Email', 'id_email', email, 'email'),
      _ppF('Phone', 'id_phone', u.phone || (memberRec && memberRec.cellPhone) || (cardRec && cardRec.phone), 'tel'));
    idSec += _ppF('Photo URL', 'id_photoUrl', u.photoUrl || (memberRec && memberRec.photoUrl) || (cardRec && cardRec.photoUrl), 'text');
    html += _ppSec('Identity', 'identity', idSec);

    // ═══ SECTION: Account ═══
    if (p.user && !isMidKey) {
      var s1 = '';
      s1 += _pp2(
        _ppF('Role', 'acct_role', u.role, 'select',
          ['readonly','volunteer','leader','deacon','treasurer','pastor','admin']),
        _ppF('Status', 'acct_status', u.status, 'select',
          ['active','suspended','disabled','pending']));
      s1 += '<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:8px;">';
      s1 += '<button type="button" onclick="TheShepherd._resetPasscode(\'' + eid + '\')"'
         + ' style="background:var(--warning,#c98b2e);color:#fff;border:none;border-radius:6px;padding:6px 14px;font-weight:600;cursor:pointer;font-size:0.78rem;">'
         + '\uD83D\uDD11 Reset Passcode</button>';
      s1 += '</div>';
      html += _ppSec('Account', 'account', s1);
    } else if (!isMidKey) {
      html += _ppSec('Account', 'account',
        '<p style="color:var(--ink-muted);font-size:0.84rem;">This person does not have a login account.</p>'
        + '<button type="button" onclick="TheShepherd._createUserAccount(\'' + eid + '\')"'
        + ' style="background:var(--accent);color:var(--ink-inverse);border:none;border-radius:6px;padding:8px 16px;font-weight:600;cursor:pointer;font-size:0.84rem;">+ Create User Account</button>');
    }

    // ═══ MEMBER SECTIONS ═══
    if (memberRec) {
      var mid = '<input type="hidden" id="pp-mem_id" value="' + _e(memberRec.id || '') + '">';

      var dem = '';
      dem += _pp2(
        _ppF('Date of Birth', 'mem_dateOfBirth', (memberRec.dateOfBirth || '').substring(0,10), 'date'),
        _ppF('Gender', 'mem_gender', memberRec.gender, 'select', ['','Male','Female','Other']));
      dem += _pp2(
        _ppF('Marital Status', 'mem_maritalStatus', memberRec.maritalStatus, 'select',
          ['','Single','Married','Divorced','Widowed','Separated']),
        _ppF('Spouse Name', 'mem_spouseName', memberRec.spouseName, 'text'));
      dem += mid;
      html += _ppSec('Demographics', 'demographics', dem);

      var con = '';
      con += _pp2(
        _ppF('Secondary Email', 'mem_secondaryEmail', memberRec.secondaryEmail, 'email'),
        _ppF('Home Phone', 'mem_homePhone', memberRec.homePhone, 'tel'));
      con += _pp2(
        _ppF('Work Phone', 'mem_workPhone', memberRec.workPhone, 'tel'),
        _ppF('Preferred Contact', 'mem_preferredContact', memberRec.preferredContact, 'select',
          ['Email','Cell','Home','Work','Text']));
      html += _ppSec('Contact', 'contact', con);

      var adr = '';
      adr += _ppF('Street 1', 'mem_address1', memberRec.address1, 'text');
      adr += _ppF('Street 2', 'mem_address2', memberRec.address2, 'text');
      adr += _pp2(
        _ppF('City', 'mem_city', memberRec.city, 'text'),
        _ppF('State', 'mem_state', memberRec.state, 'text'));
      adr += _pp2(
        _ppF('ZIP', 'mem_zip', memberRec.zip, 'text'),
        _ppF('Country', 'mem_country', memberRec.country, 'text'));
      html += _ppSec('Address', 'address', adr);

      var mbr = '';
      mbr += _pp2(
        _ppF('Status', 'mem_membershipStatus', memberRec.membershipStatus, 'select',
          ['Active','Inactive','Visitor','Prospect','Former','Transferred','Deceased']),
        _ppF('Member Since', 'mem_memberSince', (memberRec.memberSince || '').substring(0,10), 'date'));
      mbr += _pp2(
        _ppF('How Found Us', 'mem_howTheyFoundUs', memberRec.howTheyFoundUs, 'select',
          ['','Website','Friend','Event','Social Media','Walk-In','Mailer','Other']),
        _ppF('Household ID', 'mem_householdId', memberRec.householdId, 'text'));
      mbr += _pp2(
        _ppF('Family Role', 'mem_familyRole', memberRec.familyRole, 'select',
          ['','Head','Spouse','Child','Dependent','Other']),
        _ppF('Death Date', 'mem_dateOfDeath', (memberRec.dateOfDeath || memberRec.deathDate || '').substring(0,10), 'date'));
      html += _ppSec('Membership', 'membership', mbr);

      var spr = '';
      spr += _pp2(
        _ppF('Baptism Date', 'mem_baptismDate', (memberRec.baptismDate || '').substring(0,10), 'date'),
        _ppF('Salvation Date', 'mem_salvationDate', (memberRec.salvationDate || '').substring(0,10), 'date'));
      spr += _pp2(
        _ppF('Spiritual Gifts', 'mem_spiritualGifts', memberRec.spiritualGifts, 'text'),
        _ppF('Small Group', 'mem_smallGroup', memberRec.smallGroup, 'text'));
      html += _ppSec('Spiritual', 'spiritual', spr);

      var emg = '';
      emg += _pp2(
        _ppF('Contact Name', 'mem_emergencyContact', memberRec.emergencyContact, 'text'),
        _ppF('Contact Phone', 'mem_emergencyPhone', memberRec.emergencyPhone, 'tel'));
      html += _ppSec('Emergency', 'emergency', emg);

      var min = '';
      min += _pp2(
        _ppF('Ministry Teams', 'mem_ministryTeams', memberRec.ministryTeams, 'text'),
        _ppF('Volunteer Roles', 'mem_volunteerRoles', memberRec.volunteerRoles, 'text'));
      min += _pp2(
        _ppF('Assigned To', 'mem_assignedTo', memberRec.assignedTo, 'text'),
        _ppF('Follow-Up Priority', 'mem_followUpPriority', memberRec.followUpPriority, 'select',
          ['','Low','Medium','High','Urgent']));
      min += _pp2(
        _ppF('Last Contact', 'mem_lastContactDate', (memberRec.lastContactDate || '').substring(0,10), 'date'),
        _ppF('Next Follow-Up', 'mem_nextFollowUp', (memberRec.nextFollowUp || '').substring(0,10), 'date'));
      min += _ppF('Pastoral Notes', 'mem_pastoralNotes', memberRec.pastoralNotes, 'textarea');
      min += _pp2(
        _ppF('Tags', 'mem_tags', memberRec.tags, 'text'),
        _ppF('Website', 'mem_website', memberRec.website, 'text'));
      html += _ppSec('Ministry & Follow-Up', 'ministry', min);
    } else {
      html += _ppSec('Member Record', 'member-none',
        '<p style="color:var(--ink-muted);font-size:0.84rem;">No member record linked to this account.</p>'
        + '<button type="button" onclick="TheShepherd._createMember(\'' + eid + '\')"'
        + ' style="background:var(--accent);color:var(--ink-inverse);border:none;border-radius:6px;padding:8px 16px;font-weight:600;cursor:pointer;font-size:0.84rem;">+ Create Member Record</button>');
    }

    // ═══ SECTION: Contact Card ═══
    if (cardRec) {
      var cd = '';
      cd += '<p style="font-size:0.72rem;color:var(--ink-muted);margin:0 0 8px;">Card #' + _e(cardRec.memberNumber || '') + '</p>';
      cd += _pp2(
        _ppF('Card Title', 'card_cardTitle', cardRec.cardTitle, 'text'),
        _ppF('Ministry', 'card_ministry', cardRec.ministry, 'text'));
      cd += _pp2(
        _ppF('Small Group', 'card_smallGroup', cardRec.smallGroup, 'text'),
        _ppF('Status', 'card_status', cardRec.status, 'select', ['Active','Inactive','Archived']));
      cd += _ppF('Bio', 'card_cardBio', cardRec.cardBio || cardRec.bio, 'textarea');
      cd += _pp2(
        _ppF('Website URL', 'card_websiteUrl', cardRec.websiteUrl, 'text'),
        _ppF('Schedule URL', 'card_scheduleUrl', cardRec.scheduleUrl, 'text'));
      cd += _pp2(
        _ppF('Color Scheme', 'card_colorScheme', cardRec.colorScheme, 'select',
          [{value:'',label:'Default'},'gold','cyan','magenta','emerald','coral','violet']),
        _ppF('Background', 'card_bgScheme', cardRec.bgScheme, 'select',
          [{value:'',label:'None'},'gradient','pattern','photo']));
      cd += _pp2(
        _ppF('Card Icon', 'card_cardIcon', cardRec.cardIcon, 'text'),
        _ppF('Visibility', 'card_visibility', cardRec.visibility, 'select',
          ['public','authenticated','private']));
      cd += _pp2(
        _ppF('Phone Visible', 'card_phoneVisible', cardRec.phoneVisible, 'select',
          [{value:'TRUE',label:'Yes'},{value:'FALSE',label:'No'}]),
        _ppF('Email Visible', 'card_emailVisible', cardRec.emailVisible, 'select',
          [{value:'TRUE',label:'Yes'},{value:'FALSE',label:'No'}]));
      cd += _pp2(
        _ppF('Show Daily Bread', 'card_showDailyBread', cardRec.showDailyBread, 'select',
          [{value:'TRUE',label:'Yes'},{value:'FALSE',label:'No'}]),
        _ppF('Show Prayer Ticker', 'card_showPrayerTicker', cardRec.showPrayerTicker, 'select',
          [{value:'TRUE',label:'Yes'},{value:'FALSE',label:'No'}]));
      cd += _ppF('Card Footer', 'card_cardFooter', cardRec.cardFooter, 'textarea');
      cd += '<input type="hidden" id="pp-card_id" value="' + _e(cardRec.id || '') + '">';
      html += _ppSec('Contact Card', 'card', cd);
    } else {
      html += _ppSec('Contact Card', 'card-none',
        '<p style="color:var(--ink-muted);font-size:0.84rem;">No contact card linked to this account.</p>'
        + '<button type="button" onclick="TheShepherd._createCard(\'' + eid + '\')"'
        + ' style="background:var(--accent);color:var(--ink-inverse);border:none;border-radius:6px;padding:8px 16px;font-weight:600;cursor:pointer;font-size:0.84rem;">+ Create Contact Card</button>');
    }

    // ═══ SECTION: Permissions ═══
    (function() {
      var om = {};
      (permData.overrides || []).forEach(function(o) { om[o.module] = o.access; });
      var rl = _ROLE_LEVELS[u.role || permData.role] || 0;
      var rlb = ['all','vol+','care+','leader+','pastor+','admin'];

      var ph = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">';
      ph += '<span style="font-size:0.78rem;font-weight:700;color:var(--accent);">Permission Overrides</span>';
      ph += '<button type="button" onclick="TheShepherd._permCopyFrom(\'' + eid + '\')" style="background:none;border:1px solid var(--line);border-radius:var(--radius);padding:4px 10px;cursor:pointer;color:var(--ink-muted);font-size:0.7rem;">Copy From\u2026</button>';
      ph += '</div>';
      ph += '<div style="font-size:0.68rem;color:var(--ink-muted);margin-bottom:8px;">Click Override to cycle: \u2014 \u2192 GRANT \u2192 DENY \u2192 \u2014</div>';
      ph += '<div style="max-height:400px;overflow-y:auto;border:1px solid var(--line);border-radius:var(--radius);">';
      ph += '<table style="width:100%;font-size:0.75rem;border-collapse:collapse;">';
      ph += '<tr style="background:var(--bg);position:sticky;top:0;z-index:1;"><th style="text-align:left;padding:6px 8px;">Module</th><th style="padding:6px;text-align:center;">Default</th><th style="padding:6px;text-align:center;">Override</th><th style="padding:6px;text-align:center;">Effective</th></tr>';

      Object.keys(moduleMap).sort(function(a, b) {
        return (moduleMap[a].label || a).localeCompare(moduleMap[b].label || b);
      }).forEach(function(key) {
        var mod = moduleMap[key];
        var def = rl >= mod.level;
        var ovr = om[key] || '';
        var eff = ovr === 'grant' ? true : ovr === 'deny' ? false : def;
        var dl  = rlb[mod.level] || 'lvl' + mod.level;
        var dc  = def ? '<span style="color:var(--success);">\u2713 ' + dl + '</span>'
                      : '<span style="color:var(--ink-muted);">\u2717 ' + dl + '</span>';
        var oc;
        if (ovr === 'grant')
          oc = '<span style="color:var(--success);font-weight:700;cursor:pointer;" onclick="TheShepherd._permToggle(\'' + eid + '\',\'' + key + '\',this)">GRANT</span>';
        else if (ovr === 'deny')
          oc = '<span style="color:var(--danger);font-weight:700;cursor:pointer;" onclick="TheShepherd._permToggle(\'' + eid + '\',\'' + key + '\',this)">DENY</span>';
        else
          oc = '<span style="color:var(--ink-muted);cursor:pointer;" onclick="TheShepherd._permToggle(\'' + eid + '\',\'' + key + '\',this)">\u2014</span>';
        var ec = eff ? '<span style="color:var(--success);">\u2713</span>'
                     : '<span style="color:var(--danger);">\u2717</span>';
        ph += '<tr style="border-top:1px solid var(--line);"><td style="padding:4px 8px;font-weight:500;">' + _e(mod.label || key) + '</td><td style="padding:4px 6px;text-align:center;">' + dc + '</td><td style="padding:4px 6px;text-align:center;">' + oc + '</td><td style="padding:4px 6px;text-align:center;">' + ec + '</td></tr>';
      });
      ph += '</table></div>';
      html += _ppSec('Permissions', 'permissions', ph);
    })();

    // ═══ SECTION: Volunteer Assignments ═══
    var vh = '';
    if (volRows.length) {
      vh += '<table style="width:100%;font-size:0.78rem;border-collapse:collapse;"><tr style="border-bottom:1px solid var(--line);"><th style="text-align:left;padding:6px;">Ministry</th><th style="text-align:left;padding:6px;">Role</th><th style="text-align:left;padding:6px;">Date</th><th style="text-align:left;padding:6px;">Status</th></tr>';
      volRows.forEach(function(v) {
        vh += '<tr style="border-top:1px solid var(--line);"><td style="padding:4px 6px;">' + _e(v.ministryTeam || '') + '</td><td style="padding:4px 6px;">' + _e(v.role || '') + '</td><td style="padding:4px 6px;">' + _e(v.scheduledDate || '') + '</td><td style="padding:4px 6px;">' + _e(v.status || '') + '</td></tr>';
      });
      vh += '</table>';
    } else {
      vh += '<p style="color:var(--ink-muted);font-size:0.84rem;">No volunteer assignments found.</p>';
    }
    html += _ppSec('Volunteer Assignments', 'volunteers', vh);

    // ═══ SECTION: Interaction History (TheScrolls) ═══
    if (typeof TheScrolls !== 'undefined') {
      var scrollHtml = TheScrolls.renderPersonTimeline(email);
      html += _ppSec('Interaction History', 'scrolls', scrollHtml);
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
          await TheVine.flock.call('members.update', mem);
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
          await TheVine.flock.memberCards.update(card);
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
    try {
      await TheVine.flock.call('members.create', {
        primaryEmail: email, firstName: u.firstName || '', lastName: u.lastName || '',
        cellPhone: u.phone || '', photoUrl: u.photoUrl || ''
      });
      _toast('Member record created!', 'success');
      if (typeof TheScrolls !== 'undefined') TheScrolls.log(TheScrolls.TYPES.MEMBER_CREATE, email, 'Created member record');
      openProfile(email);
    } catch (e) { alert('Failed: ' + (e.message || e)); }
  }

  async function _createCard(email) {
    var p = _ppData[(email || '').toLowerCase()] || {};
    var u = p.user || {};
    try {
      await TheVine.flock.memberCards.create({
        email: email, firstName: u.firstName || '', lastName: u.lastName || '',
        phone: u.phone || '', photoUrl: u.photoUrl || '', status: 'Active'
      });
      _toast('Contact card created!', 'success');
      if (typeof TheScrolls !== 'undefined') TheScrolls.log(TheScrolls.TYPES.CARD_CREATE, email, 'Created contact card');
      openProfile(email);
    } catch (e) { alert('Failed: ' + (e.message || e)); }
  }

  // ── Permission helpers ──────────────────────────────────────────────────
  async function _permToggle(email, moduleKey, el) {
    var current = el.textContent.trim();
    var next;
    if (current === '\u2014') next = 'grant';
    else if (current === 'GRANT') next = 'deny';
    else next = 'clear';
    try {
      el.textContent = '\u2026';
      await TheVine.flock.call('permissions.set', { targetEmail: email, module: moduleKey, access: next });
      if (next === 'grant') { el.textContent = 'GRANT'; el.style.color = 'var(--success)'; el.style.fontWeight = '700'; }
      else if (next === 'deny') { el.textContent = 'DENY'; el.style.color = 'var(--danger)'; el.style.fontWeight = '700'; }
      else { el.textContent = '\u2014'; el.style.color = 'var(--ink-muted)'; el.style.fontWeight = ''; }
      var effTd = el.closest('td').nextElementSibling;
      if (effTd) {
        if (next === 'grant') effTd.innerHTML = '<span style="color:var(--success);">\u2713</span>';
        else if (next === 'deny') effTd.innerHTML = '<span style="color:var(--danger);">\u2717</span>';
        else {
          var defTd = el.closest('td').previousElementSibling;
          effTd.innerHTML = (defTd && defTd.textContent.indexOf('\u2713') >= 0)
            ? '<span style="color:var(--success);">\u2713</span>'
            : '<span style="color:var(--danger);">\u2717</span>';
        }
      }
    } catch (e) { el.textContent = current; alert('Failed: ' + (e.message || e)); }
  }

  async function _permCopyFrom(targetEmail) {
    var people = Object.values(_ppData);
    var options = people
      .filter(function(p) { return p.email !== targetEmail && p.user; })
      .map(function(p) {
        var u = p.user || {};
        return { value: p.email, label: ((u.displayName || u.firstName || '') + ' (' + (u.role || '') + ')') };
      });
    if (typeof Modules !== 'undefined' && Modules._modal) {
      Modules._modal('Copy Permissions From', [
        { name: 'fromEmail', label: 'Source User', type: 'select', options: options, required: true },
      ], async function(data) {
        await TheVine.flock.call('permissions.copy', { fromEmail: data.fromEmail, toEmail: targetEmail });
        openProfile(targetEmail);
      });
    }
  }

  // ── Reset Passcode (admin) ──────────────────────────────────────────────
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
          await TheVine.flock.users.create({
            email: email, firstName: firstName, lastName: lastName,
            displayName: (firstName + ' ' + lastName).trim(),
            role: data.role, passcode: data.passcode
          });
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
        await TheVine.flock.users.create({
          email: email, firstName: firstName, lastName: lastName,
          displayName: (firstName + ' ' + lastName).trim(),
          role: role, passcode: passcode
        });
        _toast('User account created for ' + email, 'success');
        if (typeof TheScrolls !== 'undefined') TheScrolls.log(TheScrolls.TYPES.ADMIN_ACTION, email, 'Created user account', { personName: firstName + ' ' + lastName });
        openProfile(email);
      } catch (e) { alert('Failed: ' + (e.message || e)); }
    }
  }

  // ── Navigation ──────────────────────────────────────────────────────────
  function backToList() {
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
    _permToggle:   _permToggle,
    _permCopyFrom: _permCopyFrom,
    _resetPasscode: _resetPasscode,
    _createUserAccount: _createUserAccount,
  };
})();
