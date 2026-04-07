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
      var ovList = permData.overrides || [];
      var ovMap = {};
      ovList.forEach(function(o) { if (o && o.module) ovMap[o.module] = String(o.access || 'none').toLowerCase(); });
      var memberRole = u.role || permData.role || '';

      var PERM_ROWS = [
        { group: 'People & Directory', items: [
          { key: 'my-flock',                label: 'My Flock Access',        desc: 'View assigned flock list and basic member profiles.',                         risk: 'low' },
          { key: 'my-flock.full-directory',  label: 'Full Flock Directory',   desc: 'View all member contact details including addresses and phone numbers.',      risk: 'medium' },
          { key: 'my-flock.add-edit-members',label: 'Add / Edit Members',     desc: 'Create new member records and modify existing ones.',                         risk: 'high' },
          { key: 'my-flock.remove-members',  label: 'Remove Members',         desc: 'Delete or archive member records permanently.',                               risk: 'critical' },
          { key: 'directory',                label: 'Directory Access',        desc: 'View the church member directory.',                                           risk: 'low' },
          { key: 'directory.contact-details',label: 'Directory Contact Details', desc: 'See phone numbers, emails, and addresses in the directory.',               risk: 'medium' },
          { key: 'directory.export',         label: 'Export Directory',        desc: 'Download the directory as a spreadsheet.',                                    risk: 'high' },
        ]},
        { group: 'Pastoral Care', items: [
          { key: 'care',              label: 'Care Cases — Own Assigned', desc: 'View and update care cases assigned to this user.',               risk: 'low' },
          { key: 'care.create',       label: 'Create Care Cases',        desc: 'Open new care cases for members.',                                risk: 'low' },
          { key: 'care.edit',         label: 'Edit Own Care Cases',      desc: 'Modify details on care cases assigned to this user.',              risk: 'low' },
          { key: 'care.view-all',     label: 'View All Care Cases',      desc: 'See every active care case across the church.',                   risk: 'high' },
          { key: 'care.edit-all',     label: 'Edit All Care Cases',      desc: 'Modify any care case, not just assigned ones.',                   risk: 'high' },
          { key: 'care.reassign',     label: 'Reassign Care Cases',      desc: 'Transfer care cases between caregivers.',                         risk: 'high' },
          { key: 'care.close',        label: 'Close Care Cases',         desc: 'Mark care cases as resolved or completed.',                       risk: 'medium' },
          { key: 'care.notes',        label: 'Pastoral Care Notes',      desc: 'Read and write sensitive pastoral notes on care cases.',           risk: 'critical' },
          { key: 'care.interactions',  label: 'Care Interactions',        desc: 'Log and view interactions on assigned care cases.',               risk: 'low' },
          { key: 'care.follow-ups',    label: 'Care Follow-Ups',          desc: 'Schedule and manage follow-up tasks on care cases.',              risk: 'low' },
          { key: 'care.assignments',   label: 'Care Assignments',         desc: 'View and manage caregiver assignment lists.',                    risk: 'medium' },
        ]},
        { group: 'Prayer', items: [
          { key: 'prayer-admin',              label: 'Prayer Admin — Full Control', desc: 'Full management of all prayer requests: edit, delete, reassign.',  risk: 'high' },
          { key: 'prayer-admin.public',       label: 'Prayer — Non-Confidential',  desc: 'View prayer requests marked as shareable with the team.',          risk: 'low' },
          { key: 'prayer-admin.confidential', label: 'Prayer — Confidential',      desc: 'Access private prayer requests shared in confidence.',             risk: 'high' },
          { key: 'prayer-admin.notes',        label: 'Prayer Notes',               desc: 'Read and write private pastoral notes on prayer requests.',        risk: 'critical' },
        ]},
        { group: 'Compassion & Benevolence', items: [
          { key: 'compassion',                label: 'Compassion Fund Access',      desc: 'View compassion requests and assistance tracking.',               risk: 'medium' },
          { key: 'compassion.approve',         label: 'Approve Requests',            desc: 'Approve or deny compassion fund requests.',                      risk: 'medium' },
          { key: 'compassion.amount',          label: 'View Amounts',                desc: 'See financial amounts on compassion cases.',                     risk: 'medium' },
          { key: 'compassion.notes',           label: 'Compassion Notes',            desc: 'Read and write sensitive notes on compassion cases.',             risk: 'critical' },
          { key: 'compassion.resources',       label: 'Compassion Resources',        desc: 'View available compassion resources and referrals.',             risk: 'low' },
          { key: 'compassion.resources.edit',  label: 'Edit Resources',              desc: 'Add, modify, or remove compassion resources.',                   risk: 'medium' },
          { key: 'compassion.log',             label: 'Compassion Log',              desc: 'View the compassion activity log.',                              risk: 'low' },
          { key: 'compassion.log.create',      label: 'Create Log Entries',          desc: 'Add new entries to the compassion log.',                         risk: 'low' },
        ]},
        { group: 'Groups, Attendance & Check-In', items: [
          { key: 'groups',             label: 'Small Groups',           desc: 'View small group rosters, schedules, and assignments.',             risk: 'low' },
          { key: 'groups.manage',      label: 'Manage Groups',          desc: 'Edit group details, rosters, and schedules.',                      risk: 'low' },
          { key: 'groups.create',      label: 'Create Groups',          desc: 'Create new small groups.',                                         risk: 'medium' },
          { key: 'attendance',         label: 'Attendance',             desc: 'Record and view attendance for services and events.',               risk: 'low' },
          { key: 'attendance.record',  label: 'Record Attendance',      desc: 'Mark attendance for services and events.',                         risk: 'low' },
          { key: 'attendance.edit-past',label: 'Edit Past Attendance',  desc: 'Modify attendance records for previous dates.',                    risk: 'medium' },
          { key: 'checkin.manage',     label: 'Check-In Management',   desc: 'Manage the check-in system for services and events.',              risk: 'medium' },
          { key: 'checkin.sessions',   label: 'Check-In Sessions',     desc: 'Create and manage check-in sessions.',                             risk: 'medium' },
        ]},
        { group: 'Outreach', items: [
          { key: 'outreach',                label: 'Outreach',               desc: 'Manage community outreach programs and engagement.',             risk: 'low' },
          { key: 'outreach.contacts',        label: 'Outreach Contacts',      desc: 'View outreach contact records.',                               risk: 'low' },
          { key: 'outreach.contacts.edit',   label: 'Edit Outreach Contacts', desc: 'Add and modify outreach contact records.',                     risk: 'medium' },
          { key: 'outreach.campaigns',       label: 'Outreach Campaigns',     desc: 'View outreach campaign details.',                              risk: 'medium' },
          { key: 'outreach.campaigns.edit',  label: 'Edit Campaigns',         desc: 'Create and modify outreach campaigns.',                        risk: 'medium' },
          { key: 'outreach.follow-ups',      label: 'Outreach Follow-Ups',    desc: 'Manage outreach follow-up tasks.',                             risk: 'low' },
        ]},
        { group: 'Giving & Finance', items: [
          { key: 'giving',              label: 'Giving Records',       desc: 'Access giving history. Sensitive financial data.',                  risk: 'critical' },
          { key: 'giving.individual',    label: 'Individual Giving',    desc: 'View individual member giving records.',                           risk: 'critical' },
          { key: 'giving.enter',         label: 'Enter Giving',         desc: 'Record new giving transactions.',                                  risk: 'critical' },
          { key: 'giving.edit',          label: 'Edit Giving',          desc: 'Modify or delete existing giving records.',                        risk: 'critical' },
          { key: 'giving.statements',    label: 'Giving Statements',    desc: 'Generate and view giving statements for members.',                 risk: 'high' },
          { key: 'giving.pledges',       label: 'View Pledges',         desc: 'View pledge commitments.',                                         risk: 'medium' },
          { key: 'giving.pledges.edit',  label: 'Edit Pledges',         desc: 'Create and modify pledge records.',                                risk: 'high' },
        ]},
        { group: 'Discipleship & Growth', items: [
          { key: 'discipleship',                   label: 'Discipleship',           desc: 'Access discipleship pathways and progress tracking.',           risk: 'low' },
          { key: 'discipleship.paths',             label: 'View Pathways',          desc: 'Browse available discipleship pathways.',                       risk: 'low' },
          { key: 'discipleship.paths.edit',        label: 'Edit Pathways',          desc: 'Create and modify discipleship pathways.',                      risk: 'medium' },
          { key: 'discipleship.enroll',            label: 'Enroll Members',         desc: 'Enroll members into discipleship programs.',                    risk: 'low' },
          { key: 'discipleship.advance',           label: 'Advance Members',        desc: 'Move members through discipleship stages.',                     risk: 'medium' },
          { key: 'discipleship.mentoring.edit',    label: 'Edit Mentoring',         desc: 'Manage mentor-mentee assignments.',                            risk: 'medium' },
          { key: 'discipleship.assessments',       label: 'Assessments',            desc: 'View and manage discipleship assessments.',                     risk: 'medium' },
          { key: 'discipleship.certificates',      label: 'Certificates',           desc: 'View discipleship completion certificates.',                    risk: 'low' },
          { key: 'discipleship.certificates.issue',label: 'Issue Certificates',     desc: 'Issue certificates for completed pathways.',                    risk: 'medium' },
          { key: 'discipleship.resources.edit',    label: 'Edit Resources',         desc: 'Manage discipleship learning resources.',                       risk: 'medium' },
        ]},
        { group: 'Worship & Media', items: [
          { key: 'songs',               label: 'Song Library',          desc: 'View the worship song library.',                                    risk: 'low' },
          { key: 'songs.edit',          label: 'Edit Songs',            desc: 'Add and modify songs in the library.',                              risk: 'low' },
          { key: 'songs.setlist',       label: 'Set Lists',             desc: 'Create and manage worship set lists.',                              risk: 'low' },
          { key: 'services.edit',       label: 'Edit Services',         desc: 'Manage service schedules and details.',                             risk: 'medium' },
          { key: 'sermons.edit',        label: 'Edit Sermons',          desc: 'Add, edit, or remove sermon records.',                              risk: 'medium' },
          { key: 'sermons.upload',      label: 'Upload Sermons',        desc: 'Upload sermon audio and video files.',                              risk: 'low' },
          { key: 'sermons.approve',     label: 'Approve Sermons',       desc: 'Review and approve sermons for publication.',                       risk: 'medium' },
          { key: 'sermons.series',      label: 'Sermon Series',         desc: 'Manage sermon series and categories.',                              risk: 'low' },
          { key: 'albums',              label: 'Albums',                desc: 'View media albums.',                                                risk: 'low' },
          { key: 'albums.manage',       label: 'Manage Albums',         desc: 'Create and edit media albums.',                                     risk: 'low' },
          { key: 'content-admin',       label: 'Content Editor',        desc: 'Edit and publish app content.',                                     risk: 'medium' },
          { key: 'content-admin.publish',label: 'Publish Content',      desc: 'Approve and publish content to all members.',                       risk: 'medium' },
        ]},
        { group: 'Calendar, Events & Volunteers', items: [
          { key: 'calendar.create',   label: 'Create Events',          desc: 'Add new events to the calendar.',                                   risk: 'low' },
          { key: 'calendar.edit',     label: 'Edit Events',            desc: 'Modify existing calendar events.',                                  risk: 'low' },
          { key: 'calendar.delete',   label: 'Delete Events',          desc: 'Remove events from the calendar.',                                  risk: 'medium' },
          { key: 'calendar.share',    label: 'Share Events',           desc: 'Share events with groups or members.',                               risk: 'low' },
          { key: 'calendar.delegate', label: 'Delegate Calendar',      desc: 'Grant calendar management to others.',                               risk: 'high' },
          { key: 'events.edit',       label: 'Edit Event Details',     desc: 'Modify event registration and details.',                             risk: 'medium' },
          { key: 'events.rsvp-list',  label: 'View RSVP Lists',       desc: 'See who has registered for events.',                                 risk: 'low' },
          { key: 'volunteers',        label: 'Volunteer Access',       desc: 'View volunteer rosters and schedules.',                              risk: 'low' },
          { key: 'volunteers.manage', label: 'Manage Volunteers',      desc: 'Assign and schedule volunteers.',                                   risk: 'low' },
          { key: 'volunteers.swap',   label: 'Swap Volunteers',        desc: 'Reassign volunteer shifts between people.',                          risk: 'medium' },
        ]},
        { group: 'Communications', items: [
          { key: 'comms',                label: 'Communications Hub',    desc: 'Access the communications system.',                                risk: 'high' },
          { key: 'comms.send-individual',label: 'Send to Individuals',  desc: 'Send messages to individual members.',                             risk: 'medium' },
          { key: 'comms.send-group',     label: 'Send to Groups',       desc: 'Send messages to groups and teams.',                               risk: 'medium' },
          { key: 'comms.send-all',       label: 'Send to All',          desc: 'Send church-wide announcements to all members.',                   risk: 'high' },
          { key: 'comms.channels',       label: 'Manage Channels',      desc: 'Create and configure communication channels.',                     risk: 'high' },
          { key: 'comms.templates',      label: 'Message Templates',    desc: 'Create and manage message templates.',                              risk: 'medium' },
          { key: 'comms.delete',         label: 'Delete Messages',      desc: 'Permanently delete sent messages.',                                 risk: 'critical' },
        ]},
        { group: 'Missions', items: [
          { key: 'missions',               label: 'Missions Hub',          desc: 'Access mission trips, partnerships, and initiatives.',            risk: 'low' },
          { key: 'missions.registry',      label: 'Mission Registry',      desc: 'View the missions registry.',                                    risk: 'low' },
          { key: 'missions.registry.edit', label: 'Edit Registry',         desc: 'Add and modify mission registry entries.',                       risk: 'medium' },
          { key: 'missions.partners',      label: 'Mission Partners',      desc: 'View mission partner details.',                                  risk: 'low' },
          { key: 'missions.partners.edit', label: 'Edit Partners',         desc: 'Manage mission partner records.',                                risk: 'medium' },
          { key: 'missions.regions',       label: 'Mission Regions',       desc: 'View and manage mission regions.',                               risk: 'low' },
          { key: 'missions.prayer',        label: 'Mission Prayer',        desc: 'View mission prayer requests.',                                  risk: 'low' },
          { key: 'missions.prayer.edit',   label: 'Edit Mission Prayer',   desc: 'Manage mission prayer requests.',                                risk: 'medium' },
          { key: 'missions.updates',       label: 'Mission Updates',       desc: 'View mission field updates.',                                    risk: 'low' },
          { key: 'missions.updates.edit',  label: 'Edit Mission Updates',  desc: 'Post and manage mission updates.',                               risk: 'medium' },
        ]},
        { group: 'Member Cards', items: [
          { key: 'memberCards',           label: 'Member Cards Hub',       desc: 'Access the member cards system.',                                risk: 'medium' },
          { key: 'memberCards.directory', label: 'Card Directory',         desc: 'Browse the member card directory.',                              risk: 'low' },
          { key: 'memberCards.create',    label: 'Create Cards',           desc: 'Issue new member cards.',                                        risk: 'high' },
          { key: 'memberCards.edit',      label: 'Edit Cards',             desc: 'Modify existing member card records.',                           risk: 'high' },
          { key: 'memberCards.archive',   label: 'Archive Cards',          desc: 'Archive or deactivate member cards.',                            risk: 'critical' },
          { key: 'memberCards.links',     label: 'Card Links',             desc: 'Manage linked accounts on member cards.',                        risk: 'high' },
          { key: 'memberCards.views',     label: 'Card Views',             desc: 'Access advanced card viewing modes.',                            risk: 'medium' },
          { key: 'memberCards.bulk',      label: 'Bulk Card Operations',   desc: 'Perform bulk actions on member cards.',                          risk: 'critical' },
          { key: 'memberCards.scan',      label: 'Scan Cards',             desc: 'Scan member cards for check-in and verification.',               risk: 'low' },
        ]},
        { group: 'Reports & Analytics', items: [
          { key: 'reports',           label: 'Reports',                desc: 'Generate and view church-wide reports.',                             risk: 'medium' },
          { key: 'reports.sensitive', label: 'Sensitive Reports',      desc: 'Access reports containing PII and financial data.',                  risk: 'high' },
          { key: 'reports.export',    label: 'Export Reports',         desc: 'Download report data as spreadsheets.',                              risk: 'critical' },
          { key: 'statistics',        label: 'Statistics & Analytics', desc: 'View aggregate statistical dashboards.',                             risk: 'low' },
          { key: 'ministry',          label: 'Ministry Hub',           desc: 'Access the ministry management dashboard.',                          risk: 'medium' },
        ]},
        { group: 'Administration', items: [
          { key: 'audit',              label: 'Activity & Audit Log',  desc: 'View the complete log of all system actions.',                      risk: 'medium' },
          { key: 'users',              label: 'User Management',       desc: 'Access the user management system.',                                risk: 'critical' },
          { key: 'users.create',       label: 'Create Users',          desc: 'Create new user accounts.',                                         risk: 'critical' },
          { key: 'users.edit',         label: 'Edit Users',            desc: 'Modify user account details and roles.',                             risk: 'high' },
          { key: 'users.deactivate',   label: 'Deactivate Users',     desc: 'Disable user accounts.',                                             risk: 'critical' },
          { key: 'users.permissions',  label: 'Edit Permissions',      desc: 'Modify other users\' permission grants.',                           risk: 'critical' },
          { key: 'config',             label: 'System Settings',       desc: 'Access church-wide configuration.',                                  risk: 'critical' },
          { key: 'config.edit',        label: 'Edit Settings',         desc: 'Modify system settings \u2014 incorrect changes can break the app.', risk: 'critical' },
          { key: 'access',             label: 'Access Requests',       desc: 'View pending access requests.',                                      risk: 'high' },
          { key: 'access.approve',     label: 'Approve Access',        desc: 'Approve or deny access requests.',                                   risk: 'critical' },
          { key: 'bulk',               label: 'Bulk Operations',       desc: 'Access bulk data operations.',                                       risk: 'critical' },
          { key: 'bulk.import',        label: 'Bulk Import',           desc: 'Import data in bulk from files.',                                    risk: 'critical' },
          { key: 'bulk.export',        label: 'Bulk Export',           desc: 'Export data in bulk to files.',                                      risk: 'critical' },
          { key: 'church',             label: 'Church Profile',        desc: 'View church profile and settings.',                                   risk: 'high' },
          { key: 'church.edit',        label: 'Edit Church Profile',   desc: 'Modify church profile information.',                                  risk: 'critical' },
        ]},
      ];

      var _riskMeta = {
        low:      { label: 'Low Risk',    color: '#16a34a', bg: '#16a34a18' },
        medium:   { label: 'Medium Risk', color: '#b45309', bg: '#b4530918' },
        high:     { label: 'High Risk',   color: '#ea580c', bg: '#ea580c18' },
        critical: { label: 'Critical',    color: '#dc2626', bg: '#dc262618' },
      };
      var _roleMeta = {
        readonly:       { label: 'Read Only',      color: '#6b7280' },
        member:         { label: 'Member',         color: '#6b7280' },
        volunteer:      { label: 'Volunteer',      color: '#7c6f3e' },
        care:           { label: 'Care Team',      color: '#2d7d9a' },
        deacon:         { label: 'Deacon',         color: '#5a6e3a' },
        leader:         { label: 'Leader',         color: '#7c3aed' },
        elder:          { label: 'Elder',          color: '#1d6f5f' },
        timothy:        { label: 'Timothy',        color: '#8b5e3c' },
        pastor:         { label: 'Pastor',         color: '#b45309' },
        admin:          { label: 'Admin',          color: '#dc2626' },
        tech:           { label: 'Tech',           color: '#4f46e5' },
        finance:        { label: 'Finance',        color: '#0e7490' },
        'church-office': { label: 'Church Office', color: '#9333ea' },
      };
      var _rm = _roleMeta[(memberRole || '').toLowerCase()] || { label: memberRole || 'No Role', color: '#6b7280' };

      window._shepPermTemplates = {
        member: [],
        leader: ['my-flock', 'care', 'care.create', 'care.edit', 'care.interactions', 'care.follow-ups', 'prayer-admin.public', 'compassion', 'compassion.resources', 'groups', 'groups.manage', 'attendance', 'attendance.record', 'outreach', 'outreach.contacts', 'outreach.follow-ups', 'discipleship', 'discipleship.paths', 'volunteers', 'volunteers.manage', 'events.rsvp-list', 'sermons.upload', 'albums', 'albums.manage', 'calendar.create', 'calendar.edit', 'calendar.share', 'songs.setlist'],
        deacon: ['my-flock', 'care', 'care.create', 'care.edit', 'care.interactions', 'care.follow-ups', 'care.view-all', 'prayer-admin.public', 'prayer-admin.confidential', 'compassion', 'compassion.resources', 'compassion.approve', 'compassion.amount', 'compassion.log', 'compassion.log.create', 'directory', 'directory.contact-details', 'groups', 'groups.manage', 'attendance', 'attendance.record', 'outreach', 'outreach.contacts', 'outreach.contacts.edit', 'outreach.follow-ups', 'discipleship', 'discipleship.paths', 'giving', 'giving.pledges', 'volunteers', 'volunteers.manage', 'volunteers.swap', 'events.rsvp-list', 'events.edit', 'sermons.upload', 'sermons.series', 'albums', 'albums.manage', 'calendar.create', 'calendar.edit', 'calendar.share', 'songs', 'songs.edit', 'songs.setlist', 'services.edit', 'comms.send-group', 'memberCards.directory', 'memberCards.scan', 'checkin.manage', 'checkin.sessions'],
        care: ['my-flock', 'care', 'care.create', 'care.edit', 'care.interactions', 'care.follow-ups', 'care.view-all', 'prayer-admin.public', 'prayer-admin.confidential', 'compassion', 'compassion.resources', 'compassion.log', 'compassion.approve', 'compassion.amount', 'outreach.contacts', 'outreach.follow-ups'],
        elder: ['my-flock', 'care', 'care.create', 'care.edit', 'care.interactions', 'care.follow-ups', 'care.view-all', 'care.edit-all', 'care.reassign', 'care.close', 'care.assignments', 'prayer-admin.public', 'prayer-admin.confidential', 'compassion', 'compassion.resources', 'compassion.approve', 'compassion.amount', 'compassion.log', 'compassion.log.create', 'compassion.notes', 'compassion.resources.edit', 'directory', 'directory.contact-details', 'groups', 'groups.manage', 'groups.create', 'attendance', 'attendance.record', 'attendance.edit-past', 'outreach', 'outreach.contacts', 'outreach.contacts.edit', 'outreach.campaigns', 'outreach.campaigns.edit', 'outreach.follow-ups', 'discipleship', 'discipleship.paths', 'discipleship.enroll', 'discipleship.advance', 'discipleship.mentoring.edit', 'discipleship.assessments', 'discipleship.certificates', 'giving', 'giving.individual', 'giving.pledges', 'volunteers', 'volunteers.manage', 'volunteers.swap', 'events.rsvp-list', 'events.edit', 'sermons.upload', 'sermons.series', 'albums', 'albums.manage', 'calendar.create', 'calendar.edit', 'calendar.delete', 'calendar.share', 'songs', 'songs.edit', 'songs.setlist', 'services.edit', 'comms.send-group', 'memberCards.directory', 'memberCards.scan', 'checkin.manage', 'checkin.sessions', 'reports', 'statistics', 'ministry'],
        timothy: ['my-flock', 'my-flock.full-directory', 'my-flock.add-edit-members', 'directory', 'directory.contact-details', 'care', 'care.create', 'care.edit', 'care.view-all', 'care.edit-all', 'care.close', 'care.reassign', 'care.interactions', 'care.follow-ups', 'care.assignments', 'prayer-admin', 'prayer-admin.public', 'prayer-admin.confidential', 'compassion', 'compassion.approve', 'compassion.amount', 'compassion.resources', 'compassion.resources.edit', 'compassion.log', 'compassion.log.create', 'groups', 'groups.manage', 'groups.create', 'attendance', 'attendance.record', 'attendance.edit-past', 'giving', 'giving.individual', 'giving.pledges', 'discipleship', 'discipleship.paths', 'discipleship.paths.edit', 'discipleship.enroll', 'discipleship.advance', 'discipleship.mentoring.edit', 'discipleship.assessments', 'discipleship.certificates', 'discipleship.certificates.issue', 'discipleship.resources.edit', 'outreach', 'outreach.contacts', 'outreach.contacts.edit', 'outreach.campaigns', 'outreach.campaigns.edit', 'outreach.follow-ups', 'missions', 'missions.registry', 'missions.registry.edit', 'missions.partners', 'missions.partners.edit', 'missions.regions', 'missions.prayer', 'missions.prayer.edit', 'missions.updates', 'missions.updates.edit', 'comms', 'comms.send-individual', 'comms.send-group', 'comms.channels', 'comms.templates', 'content-admin', 'content-admin.publish', 'sermons.edit', 'sermons.upload', 'sermons.approve', 'sermons.series', 'albums', 'albums.manage', 'calendar.create', 'calendar.edit', 'calendar.delete', 'calendar.share', 'events.edit', 'events.rsvp-list', 'services.edit', 'volunteers', 'volunteers.manage', 'volunteers.swap', 'memberCards', 'memberCards.directory', 'memberCards.create', 'memberCards.edit', 'memberCards.scan', 'checkin.manage', 'checkin.sessions', 'reports', 'reports.sensitive', 'statistics', 'ministry', 'songs', 'songs.edit', 'songs.setlist'],
        pastor: ['my-flock', 'my-flock.full-directory', 'my-flock.add-edit-members', 'my-flock.remove-members', 'directory', 'directory.contact-details', 'directory.export', 'care', 'care.create', 'care.edit', 'care.view-all', 'care.edit-all', 'care.close', 'care.reassign', 'care.interactions', 'care.follow-ups', 'care.assignments', 'care.notes', 'prayer-admin', 'prayer-admin.public', 'prayer-admin.confidential', 'prayer-admin.notes', 'compassion', 'compassion.approve', 'compassion.amount', 'compassion.notes', 'compassion.resources', 'compassion.resources.edit', 'compassion.log', 'compassion.log.create', 'groups', 'groups.manage', 'groups.create', 'attendance', 'attendance.record', 'attendance.edit-past', 'giving', 'giving.individual', 'giving.enter', 'giving.statements', 'giving.pledges', 'giving.pledges.edit', 'discipleship', 'discipleship.paths', 'discipleship.paths.edit', 'discipleship.enroll', 'discipleship.advance', 'discipleship.mentoring.edit', 'discipleship.assessments', 'discipleship.certificates', 'discipleship.certificates.issue', 'discipleship.resources.edit', 'outreach', 'outreach.contacts', 'outreach.contacts.edit', 'outreach.campaigns', 'outreach.campaigns.edit', 'outreach.follow-ups', 'missions', 'missions.registry', 'missions.registry.edit', 'missions.partners', 'missions.partners.edit', 'missions.regions', 'missions.prayer', 'missions.prayer.edit', 'missions.updates', 'missions.updates.edit', 'comms', 'comms.send-individual', 'comms.send-group', 'comms.send-all', 'comms.channels', 'comms.templates', 'content-admin', 'content-admin.publish', 'sermons.edit', 'sermons.upload', 'sermons.approve', 'sermons.series', 'albums', 'albums.manage', 'calendar.create', 'calendar.edit', 'calendar.delete', 'calendar.share', 'events.edit', 'events.rsvp-list', 'services.edit', 'volunteers', 'volunteers.manage', 'volunteers.swap', 'memberCards', 'memberCards.directory', 'memberCards.create', 'memberCards.edit', 'memberCards.scan', 'checkin.manage', 'checkin.sessions', 'reports', 'reports.sensitive', 'statistics', 'ministry', 'songs', 'songs.edit', 'songs.setlist', 'audit', 'users.edit', 'users.permissions'],
        admin: ['my-flock', 'my-flock.full-directory', 'my-flock.add-edit-members', 'my-flock.remove-members', 'directory', 'directory.contact-details', 'directory.export', 'care', 'care.create', 'care.edit', 'care.view-all', 'care.edit-all', 'care.close', 'care.reassign', 'care.interactions', 'care.follow-ups', 'care.assignments', 'care.notes', 'prayer-admin', 'prayer-admin.public', 'prayer-admin.confidential', 'prayer-admin.notes', 'compassion', 'compassion.approve', 'compassion.amount', 'compassion.notes', 'compassion.resources', 'compassion.resources.edit', 'compassion.log', 'compassion.log.create', 'groups', 'groups.manage', 'groups.create', 'attendance', 'attendance.record', 'attendance.edit-past', 'giving', 'giving.individual', 'giving.enter', 'giving.edit', 'giving.statements', 'giving.pledges', 'giving.pledges.edit', 'discipleship', 'discipleship.paths', 'discipleship.paths.edit', 'discipleship.enroll', 'discipleship.advance', 'discipleship.mentoring.edit', 'discipleship.assessments', 'discipleship.certificates', 'discipleship.certificates.issue', 'discipleship.resources.edit', 'outreach', 'outreach.contacts', 'outreach.contacts.edit', 'outreach.campaigns', 'outreach.campaigns.edit', 'outreach.follow-ups', 'missions', 'missions.registry', 'missions.registry.edit', 'missions.partners', 'missions.partners.edit', 'missions.regions', 'missions.prayer', 'missions.prayer.edit', 'missions.updates', 'missions.updates.edit', 'comms', 'comms.send-individual', 'comms.send-group', 'comms.send-all', 'comms.channels', 'comms.templates', 'comms.delete', 'content-admin', 'content-admin.publish', 'sermons.edit', 'sermons.upload', 'sermons.approve', 'sermons.series', 'albums', 'albums.manage', 'calendar.create', 'calendar.edit', 'calendar.delete', 'calendar.share', 'calendar.delegate', 'events.edit', 'events.rsvp-list', 'services.edit', 'volunteers', 'volunteers.manage', 'volunteers.swap', 'memberCards', 'memberCards.directory', 'memberCards.create', 'memberCards.edit', 'memberCards.archive', 'memberCards.links', 'memberCards.views', 'memberCards.bulk', 'memberCards.scan', 'checkin.manage', 'checkin.sessions', 'reports', 'reports.sensitive', 'reports.export', 'statistics', 'ministry', 'songs', 'songs.edit', 'songs.setlist', 'audit', 'users', 'users.create', 'users.edit', 'users.deactivate', 'users.permissions', 'config', 'config.edit', 'access', 'access.approve', 'bulk', 'bulk.import', 'bulk.export', 'church', 'church.edit'],
        'church-office': ['my-flock', 'my-flock.full-directory', 'my-flock.add-edit-members', 'directory', 'directory.contact-details', 'care', 'prayer-admin.public', 'compassion', 'memberCards', 'memberCards.directory', 'memberCards.create', 'memberCards.edit', 'memberCards.scan', 'memberCards.archive', 'memberCards.links', 'memberCards.views', 'calendar.create', 'calendar.edit', 'calendar.delete', 'calendar.share', 'events.edit', 'events.rsvp-list', 'services.edit', 'volunteers', 'volunteers.manage', 'volunteers.swap', 'checkin.manage', 'checkin.sessions', 'attendance', 'attendance.record', 'attendance.edit-past', 'groups', 'groups.manage', 'groups.create', 'comms', 'comms.send-individual', 'comms.send-group', 'comms.channels', 'comms.templates', 'comms.delete', 'users', 'users.create', 'users.edit', 'users.permissions', 'reports', 'statistics'],
        worship: ['songs', 'songs.edit', 'songs.setlist', 'services.edit', 'sermons.upload', 'sermons.series', 'albums', 'albums.manage', 'calendar.create', 'calendar.edit', 'calendar.share', 'events.rsvp-list', 'comms.send-group', 'volunteers', 'volunteers.manage', 'volunteers.swap', 'attendance', 'attendance.record'],
        children: ['checkin.manage', 'checkin.sessions', 'groups', 'groups.manage', 'attendance', 'attendance.record', 'calendar.create', 'calendar.edit', 'calendar.share', 'events.rsvp-list', 'comms.send-group', 'volunteers', 'volunteers.manage'],
        media: ['content-admin', 'content-admin.publish', 'sermons.upload', 'sermons.approve', 'sermons.series', 'albums', 'albums.manage', 'comms.channels', 'comms.templates', 'calendar.create', 'calendar.share', 'events.rsvp-list'],
        tech: ['config', 'config.edit', 'audit', 'church', 'church.edit', 'bulk', 'bulk.import', 'bulk.export'],
        finance: ['giving', 'giving.individual', 'giving.enter', 'giving.edit', 'giving.statements', 'giving.pledges', 'giving.pledges.edit', 'memberCards', 'memberCards.directory', 'reports', 'reports.sensitive', 'reports.export', 'statistics', 'directory'],
      };

      var ph = '';

      // Role badge
      if (memberRole) {
        ph += '<div style="margin-bottom:18px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">';
        ph += '<span style="font-size:0.82rem;color:var(--ink-muted);">System Role:</span>';
        ph += '<span style="display:inline-block;padding:3px 12px;border-radius:20px;font-size:0.8rem;font-weight:700;letter-spacing:0.04em;'
           + 'background:' + _rm.color + '22;color:' + _rm.color + ';border:1px solid ' + _rm.color + '55;">'
           + _e(_rm.label) + '</span>';
        ph += '<span style="font-size:0.76rem;color:var(--ink-faint);font-style:italic;">The role is informational only — access is determined entirely by the selections below.</span>';
        ph += '</div>';
      }

      // Preset buttons
      ph += '<div style="margin-bottom:20px;">';
      ph += '<span style="font-size:0.82rem;color:var(--ink-muted);display:block;margin-bottom:8px;font-weight:600;">Quick Presets'
         + ' <span style="color:var(--ink-faint);font-weight:400;font-style:italic;"> — sets a standard starting point, then adjust individually below</span></span>';
      ph += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px;">';
      [
        { val: 'member', label: 'Member' },
        { val: 'leader', label: 'Leader' },
        { val: 'deacon', label: 'Deacon' },
        { val: 'care',   label: 'Care' },
        { val: 'elder',  label: 'Elder' },
        { val: 'timothy',label: 'Timothy' },
        { val: 'pastor', label: 'Pastor' },
        { val: 'admin',  label: 'Admin' },
      ].forEach(function(t) {
        ph += '<button type="button" onclick="TheShepherd._applyPermTemplate(\'' + t.val + '\')"'
           + ' style="background:none;border:1px solid var(--line);border-radius:6px;padding:6px 16px;'
           + 'cursor:pointer;color:var(--ink);font-size:0.82rem;font-family:inherit;font-weight:600;">'
           + _e(t.label) + '</button>';
      });
      ph += '</div>';
      ph += '<div style="display:flex;gap:8px;flex-wrap:wrap;">';
      [
        { val: 'church-office', label: 'Church Office' },
        { val: 'worship',       label: 'Worship' },
        { val: 'children',      label: 'Children' },
        { val: 'media',         label: 'Media' },
        { val: 'tech',          label: 'Tech' },
        { val: 'finance',       label: 'Finance' },
      ].forEach(function(t) {
        ph += '<button type="button" onclick="TheShepherd._applyPermTemplate(\'' + t.val + '\')"'
           + ' style="background:none;border:1px solid var(--line);border-radius:6px;padding:6px 14px;'
           + 'cursor:pointer;color:var(--ink-muted);font-size:0.78rem;font-family:inherit;font-weight:600;">'
           + _e(t.label) + '</button>';
      });
      ph += '<button type="button" onclick="TheShepherd._applyPermTemplate(\'none\')"'
         + ' style="background:none;border:1px solid var(--line);border-radius:6px;padding:6px 16px;'
         + 'cursor:pointer;color:var(--ink-muted);font-size:0.82rem;font-family:inherit;">Clear All</button>';
      ph += '</div></div>';

      // Matrix table — grouped by access level
      ph += '<table style="width:100%;border-collapse:collapse;font-size:0.83rem;">';
      ph += '<thead><tr style="border-bottom:2px solid var(--line);">';
      ph += '<th style="text-align:left;padding:8px 12px;color:var(--ink-muted);font-weight:600;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.04em;">Permission</th>';
      ph += '<th style="text-align:center;padding:8px 12px;color:var(--ink-muted);font-weight:600;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.04em;width:120px;">Access</th>';
      ph += '</tr></thead><tbody>';

      // Flatten PERM_ROWS into risk buckets: low → medium → high → critical
      var _riskGroups = { low: [], medium: [], high: [], critical: [] };
      PERM_ROWS.forEach(function(section) {
        section.items.forEach(function(item) {
          var lvl = item.risk || 'low';
          if (_riskGroups[lvl]) _riskGroups[lvl].push({ item: item, group: section.group });
        });
      });

      ['low', 'medium', 'high', 'critical'].forEach(function(lvl) {
        var entries = _riskGroups[lvl];
        if (!entries.length) return;
        var rm = _riskMeta[lvl];
        var headId = 'shep-grp-' + lvl;
        ph += '<tr><td style="padding:14px 12px 6px;border-top:2px solid var(--line);">';
        ph += '<span style="display:inline-block;padding:3px 14px;border-radius:20px;font-size:0.72rem;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;'
           + 'background:' + rm.bg + ';color:' + rm.color + ';border:1px solid ' + rm.color + '55;">'
           + _e(rm.label) + '</span>';
        ph += '</td>';
        ph += '<td style="text-align:center;padding:14px 12px 6px;border-top:2px solid var(--line);vertical-align:middle;">'
           + '<input type="checkbox" id="' + headId + '" class="shep-grp-chk" data-risk-group="' + lvl + '"'
           + ' onchange="TheShepherd._onGrpChkChange(this)"'
           + ' style="width:18px;height:18px;accent-color:' + rm.color + ';cursor:pointer;"'
           + ' title="Toggle all ' + rm.label + ' permissions">'
           + '</td>';
        ph += '</tr>';
        entries.forEach(function(e) {
          var item  = e.item;
          var group = e.group;
          var val   = ovMap[item.key] || 'none';
          var selId = 'spsel-' + item.key.replace(/\./g, '-');
          ph += '<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">';
          ph += '<td style="padding:10px 12px;vertical-align:top;">'
             + '<div style="font-weight:600;color:var(--ink);margin-bottom:2px;">' + _e(item.label) + '</div>'
             + '<div style="font-size:0.77rem;color:var(--ink-muted);line-height:1.45;margin-bottom:2px;">' + _e(item.desc) + '</div>'
             + '<div style="font-size:0.70rem;color:var(--ink-faint);font-style:italic;">' + _e(group) + '</div>'
             + '</td>';
          ph += '<td style="text-align:center;padding:10px 12px;vertical-align:middle;">'
             + '<input type="checkbox" id="' + selId + '" class="shep-perm-chk" data-perm-key="' + _e(item.key) + '" data-risk="' + _e(item.risk || 'low') + '"'
             + (val === 'grant' ? ' checked' : '')
             + ' onchange="TheShepherd._onPermChkChange(this)"'
             + ' style="width:18px;height:18px;accent-color:var(--accent);cursor:pointer;">'
             + '</td>';
          ph += '</tr>';
        });
      });

      ph += '</tbody></table>';

      // Single shared critical-permission confirmation box
      ph += '<div id="shep-crit-confirm" style="display:none;border:2px solid #dc2626;border-radius:10px;background:#dc262610;padding:16px 18px;margin:16px 0;">'
         + '<div style="font-weight:800;color:#dc2626;font-size:0.8rem;letter-spacing:0.06em;margin-bottom:10px;">'
         + '\uD83D\uDD34 CRITICAL PERMISSION \u2014 CONFIRMATION REQUIRED</div>'
         + '<p style="font-size:0.84rem;color:var(--ink);margin:0 0 12px;">One or more critical permissions are selected. Please confirm before saving.</p>'
         + '<label style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;cursor:pointer;">'
         + '<input type="checkbox" id="shep-crit-chk" style="margin-top:2px;accent-color:#dc2626;">'
         + '<span style="font-size:0.84rem;color:var(--ink);">I understand this grants critical-level system access to this person</span>'
         + '</label>'
         + '<input type="text" id="shep-crit-txt" placeholder="Type Yes to confirm"'
         + ' style="border:1px solid #dc262666;border-radius:6px;padding:6px 12px;font-size:0.84rem;'
         + 'background:var(--bg);color:var(--ink);font-family:inherit;width:200px;">'
         + '<div style="font-size:0.76rem;color:var(--ink-muted);font-style:italic;margin-top:10px;">'
         + '\uD83D\uDCE3 Pastoral leads will be notified when critical permissions are granted.</div>'
         + '</div>';

      ph += '<div style="margin-top:14px;display:flex;align-items:center;gap:12px;">';
      ph += '<button type="button" onclick="TheShepherd._savePerms(\'' + eid + '\')" style="background:var(--accent);color:var(--ink-inverse);border:none;border-radius:6px;padding:9px 22px;cursor:pointer;font-weight:700;font-size:0.86rem;font-family:inherit;">Save Permissions</button>';
      ph += '<span id="shep-perm-status" style="font-size:0.82rem;color:var(--ink-muted);"></span>';
      ph += '</div>';

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
  function _applyPermTemplate(templateKey) {
    var keys = templateKey === 'none' ? [] : ((window._shepPermTemplates && window._shepPermTemplates[templateKey]) || []);
    document.querySelectorAll('.shep-perm-chk').forEach(function(chk) {
      chk.checked = keys.indexOf(chk.getAttribute('data-perm-key')) !== -1;
    });
    _syncAllGrpHeaders();
    _syncCritConfirm();
  }

  /* ── Group header checkbox: toggle all child perms in that risk group ── */
  function _onGrpChkChange(grpChk) {
    var lvl = grpChk.getAttribute('data-risk-group');
    var isChecked = grpChk.checked;
    document.querySelectorAll('.shep-perm-chk').forEach(function(c) {
      if (c.getAttribute('data-risk') === lvl) c.checked = isChecked;
    });
    _syncCritConfirm();
  }

  /* ── Individual perm checkbox: sync parent group header + crit box ── */
  function _onPermChkChange(chk) {
    var lvl = chk.getAttribute('data-risk');
    _syncGrpHeader(lvl);
    _syncCritConfirm();
  }

  function _syncGrpHeader(lvl) {
    var grpChk = document.getElementById('shep-grp-' + lvl);
    if (!grpChk) return;
    var children = document.querySelectorAll('.shep-perm-chk[data-risk="' + lvl + '"]');
    var total = children.length, checked = 0;
    children.forEach(function(c) { if (c.checked) checked++; });
    grpChk.checked = (checked === total);
    grpChk.indeterminate = (checked > 0 && checked < total);
  }

  function _syncAllGrpHeaders() {
    ['low', 'medium', 'high', 'critical'].forEach(_syncGrpHeader);
  }

  function _syncCritConfirm() {
    var anyCritChecked = false;
    document.querySelectorAll('.shep-perm-chk').forEach(function(c) {
      if (c.getAttribute('data-risk') === 'critical' && c.checked) anyCritChecked = true;
    });
    var box = document.getElementById('shep-crit-confirm');
    if (box) {
      box.style.display = anyCritChecked ? '' : 'none';
      if (!anyCritChecked) {
        var ck  = document.getElementById('shep-crit-chk');
        var txt = document.getElementById('shep-crit-txt');
        if (ck)  ck.checked = false;
        if (txt) txt.value  = '';
      }
    }
  }

  async function _savePerms(targetEmail) {
    var hasCritChecked = Array.from(document.querySelectorAll('.shep-perm-chk'))
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
    var grants = [];
    document.querySelectorAll('.shep-perm-chk').forEach(function(chk) {
      if (chk.checked) grants.push(chk.getAttribute('data-perm-key'));
    });
    try {
      await TheVine.flock.call('permissions.setAll', { targetEmail: targetEmail, grants: grants, denies: [] });
      if (st) { st.textContent = '\u2713 Saved'; setTimeout(function() { if (st) st.textContent = ''; }, 2000); }
    } catch (e) {
      if (st) st.textContent = 'Error: ' + (e.message || e);
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
    _applyPermTemplate: _applyPermTemplate,
    _onPermChkChange:   _onPermChkChange,
    _onGrpChkChange:    _onGrpChkChange,
    _savePerms:         _savePerms,
    _resetPasscode: _resetPasscode,
    _createUserAccount: _createUserAccount,
  };
})();
