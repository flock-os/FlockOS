/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE FOLD — Member directory
   "I am the good shepherd; I know my sheep and my sheep know me." — John 10:14
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'the_fold';
export const title = 'The Fold';

export function render() {
  return /* html */`
    <section class="fold-view">
      ${pageHero({
        title: 'The Fold',
        subtitle: 'Everyone in your congregation — members, visitors, and families.',
        scripture: 'I am the good shepherd; I know my sheep and my sheep know me. — John 10:14',
      })}

      <!-- Toolbar: search + filters + actions -->
      <div class="fold-toolbar">
        <div class="fold-search-wrap">
          <svg class="fold-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input class="fold-search" type="search" placeholder="Search by name, email, or phone…" aria-label="Search members" data-bind="search">
        </div>
        <div class="fold-filters">
          <button class="fold-filter is-active" data-filter="all">All</button>
          <button class="fold-filter" data-filter="member">Members</button>
          <button class="fold-filter" data-filter="visitor">Visitors</button>
          <button class="fold-filter" data-filter="leader">Leaders</button>
        </div>
        <button class="flock-btn flock-btn--primary fold-add-btn" data-act="add-person">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Add Person
        </button>
      </div>

      <!-- Stats strip -->
      <div class="fold-stats" data-bind="stats">
        ${_statsStrip()}
      </div>

      <!-- Member grid -->
      <div class="fold-grid" data-bind="members" role="list">
        ${_demoCards()}
      </div>
    </section>
  `;
}

export function mount(root) {
  // Filter buttons
  root.querySelectorAll('.fold-filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('.fold-filter').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      _applyFilter(root, btn.dataset.filter);
    });
  });

  // Live search
  const searchEl = root.querySelector('[data-bind="search"]');
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      const q = searchEl.value.toLowerCase().trim();
      root.querySelectorAll('.fold-card').forEach((card) => {
        const name = (card.dataset.name || '').toLowerCase();
        card.style.display = (!q || name.includes(q)) ? '' : 'none';
      });
    });
  }

  // Load live members — replaces demo grid when backend is ready
  _loadMembers(root);

  // Add Person button
  const addBtn = root.querySelector('[data-act="add-person"]');
  if (addBtn) addBtn.addEventListener('click', () => _openNewMemberSheet(() => _loadMembers(root)));

  return () => { _closeMemberSheet(); };
}

let _personMap = {};
let _activeFoldSheet = null;

async function _loadMembers(root) {
  const V = window.TheVine;
  if (!V) return;
  const grid  = root.querySelector('[data-bind="members"]');
  const stats = root.querySelector('[data-bind="stats"]');
  if (!grid) return;
  grid.innerHTML = '<div style="padding:32px;text-align:center;color:var(--ink-muted,#7a7f96)">Loading members…</div>';
  try {
    const res  = await V.flock.members.list({ limit: 500 });
    const all  = _rows(res);
    // Filter client-side: keep active/non-inactive members
    const rows = all.filter(r => {
      const s = String(r.status || r.active || r.Status || '').toLowerCase();
      return s !== 'inactive' && s !== 'false' && s !== '0' && s !== 'archived';
    });
    if (!rows.length) {
      grid.innerHTML = '<div style="padding:32px;text-align:center;color:var(--ink-muted,#7a7f96)">No members found.</div>';
      return;
    }
    // Build lookup map
    _personMap = {};
    rows.forEach(r => {
      const key = r.id || r.memberNumber || r.email || '';
      if (key) _personMap[key] = r;
    });
    grid.innerHTML = rows.map(_liveCard).join('');
    if (stats) stats.innerHTML = _liveStats(rows);
    // Wire card clicks
    grid.querySelectorAll('.fold-card').forEach((card) => {
      const open = () => {
        const person = _personMap[card.dataset.id];
        if (person) _openMemberSheet(person, V, () => _loadMembers(root));
      };
      card.addEventListener('click', open);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    });
  } catch (err) {
    console.error('[TheFold] members.list error:', err);
    grid.innerHTML = '<div style="padding:32px;text-align:center;color:var(--ink-muted,#7a7f96)">Could not load members right now.</div>';
  }
}

function _rows(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.rows)) return res.rows;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

const _AVATAR_COLORS = ['#7c3aed','#0ea5e9','#059669','#c05818','#db2777','#6366f1','#0891b2','#b45309','#be185d','#4f46e5'];

function _liveCard(p) {
  const first    = p.firstName || '';
  const last     = p.lastName  || '';
  const name     = p.displayName || p.name || `${first} ${last}`.trim() || 'Unknown';
  const role     = (p.role || p.memberType || 'member').toLowerCase();
  const initials = (first ? first[0] : (name[0] || '')) + (last ? last[0] : (name[1] || ''));
  const yr       = p.joinDate ? new Date(p.joinDate).getFullYear() : (p.createdAt ? new Date(p.createdAt).getFullYear() : '');
  const color    = _AVATAR_COLORS[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % _AVATAR_COLORS.length];
  const uid      = p.id || p.memberNumber || p.email || '';
  return `
    <article class="fold-card" role="listitem" tabindex="0"
             data-name="${_e(name.toLowerCase())}" data-role="${_e(role)}" data-id="${_e(uid)}">
      <div class="fold-avatar" style="background:${color}">${_e(initials.toUpperCase().slice(0,2))}</div>
      <div class="fold-card-body">
        <div class="fold-name">${_e(name)}</div>
        <div class="fold-meta">
          <span class="fold-role-badge fold-role-${_e(role)}">${_e(role)}</span>
          ${yr ? `<span class="fold-joined">Since ${yr}</span>` : ''}
        </div>
      </div>
      <svg class="fold-card-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m9 18 6-6-6-6"/></svg>
    </article>`;
}

function _liveStats(rows) {
  const total    = rows.length;
  const leaders  = rows.filter(r => ['leader','elder','deacon','pastor','admin'].includes((r.role || r.memberType || '').toLowerCase())).length;
  const visitors = rows.filter(r => (r.role || r.memberType || '').toLowerCase() === 'visitor').length;
  const members  = total - leaders - visitors;
  return [
    { label: 'Total',    n: total,    color: 'var(--c-violet)' },
    { label: 'Members',  n: members,  color: 'var(--c-sky)' },
    { label: 'Visitors', n: visitors, color: 'var(--c-emerald)' },
    { label: 'Leaders',  n: leaders,  color: 'var(--gold)' },
  ].map((s) => `
    <div class="fold-stat-chip">
      <span class="fold-stat-dot" style="background:${s.color}"></span>
      <strong>${s.n}</strong> <span>${s.label}</span>
    </div>`).join('');
}

function _applyFilter(root, filter) {
  root.querySelectorAll('.fold-card').forEach((card) => {
    const role = card.dataset.role || 'member';
    card.style.display = (filter === 'all' || role === filter) ? '' : 'none';
  });
}

function _statsStrip() {
  const stats = [
    { label: 'Total',    n: 247, color: 'var(--c-violet)' },
    { label: 'Members',  n: 184, color: 'var(--c-sky)' },
    { label: 'Visitors', n:  43, color: 'var(--c-emerald)' },
    { label: 'Leaders',  n:  20, color: 'var(--gold)' },
  ];
  return stats.map((s) => `
    <div class="fold-stat-chip">
      <span class="fold-stat-dot" style="background:${s.color}"></span>
      <strong>${s.n}</strong> <span>${s.label}</span>
    </div>
  `).join('');
}

const DEMO = [
  { name: 'Sarah Mitchell',  role: 'leader',  status: 'active',    joined: 'Jan 2019', avatar: 'SM', color: '#7c3aed' },
  { name: 'James Okafor',    role: 'member',  status: 'active',    joined: 'Mar 2021', avatar: 'JO', color: '#0ea5e9' },
  { name: 'Priya Nair',      role: 'member',  status: 'active',    joined: 'Aug 2022', avatar: 'PN', color: '#059669' },
  { name: 'David Chen',      role: 'leader',  status: 'active',    joined: 'Feb 2018', avatar: 'DC', color: '#c05818' },
  { name: 'Maria Santos',    role: 'member',  status: 'active',    joined: 'Nov 2023', avatar: 'MS', color: '#db2777' },
  { name: 'Thomas Wright',   role: 'visitor', status: 'new',       joined: 'Apr 2026', avatar: 'TW', color: '#6366f1' },
  { name: 'Grace Kimura',    role: 'member',  status: 'active',    joined: 'Jun 2020', avatar: 'GK', color: '#0891b2' },
  { name: 'Elijah Mensah',   role: 'leader',  status: 'active',    joined: 'Sep 2017', avatar: 'EM', color: '#b45309' },
  { name: 'Leah Andersen',   role: 'member',  status: 'active',    joined: 'Jan 2024', avatar: 'LA', color: '#be185d' },
  { name: 'Noah Williams',   role: 'visitor', status: 'new',       joined: 'Mar 2026', avatar: 'NW', color: '#4f46e5' },
  { name: 'Ruth Adebayo',    role: 'member',  status: 'active',    joined: 'Oct 2021', avatar: 'RA', color: '#047857' },
  { name: 'Caleb Torres',    role: 'member',  status: 'inactive',  joined: 'May 2020', avatar: 'CT', color: '#9ca3af' },
];

function _demoCards() {
  return DEMO.map((p) => `
    <article class="fold-card" role="listitem" tabindex="0"
             data-name="${_e(p.name.toLowerCase())}" data-role="${_e(p.role)}">
      <div class="fold-avatar" style="background:${p.color}">${_e(p.avatar)}</div>
      <div class="fold-card-body">
        <div class="fold-name">${_e(p.name)}</div>
        <div class="fold-meta">
          <span class="fold-role-badge fold-role-${_e(p.role)}">${_e(p.role)}</span>
          <span class="fold-joined">Since ${_e(p.joined)}</span>
        </div>
      </div>
      <svg class="fold-card-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m9 18 6-6-6-6"/></svg>
    </article>
  `).join('');
}

// ── Member detail sheet ──────────────────────────────────────────────────────
const MEMBER_TYPES = ['Visitor','Member','Volunteer','Leader','Deacon','Elder','Pastor','Admin'];
const ACCESS_ROLES = [
  { value: 'readonly',  label: 'Read Only — view-only access' },
  { value: 'volunteer', label: 'Volunteer — serving areas only' },
  { value: 'care',      label: 'Care Worker — pastoral care access' },
  { value: 'leader',   label: 'Leader — ministry leadership' },
  { value: 'pastor',   label: 'Pastor — full ministry access' },
  { value: 'admin',    label: 'Admin — complete access' },
];

function _closeMemberSheet(el) {
  const target = el || _activeFoldSheet;
  if (!target) return;
  const overlay = target.querySelector('.life-sheet-overlay');
  const panel   = target.querySelector('.life-sheet-panel');
  if (overlay) overlay.classList.remove('is-open');
  if (panel)   panel.classList.remove('is-open');
  setTimeout(() => { target.remove(); if (_activeFoldSheet === target) _activeFoldSheet = null; }, 320);
}

function _openMemberSheet(person, V, onReload) {
  _closeMemberSheet();
  const first   = person.firstName || '';
  const last    = person.lastName  || '';
  const name    = person.displayName || person.name || `${first} ${last}`.trim() || 'Unknown';
  const role    = (person.role || person.memberType || 'member');
  const uid     = person.id || person.memberNumber || person.email || '';
  const initials = (first ? first[0] : (name[0] || '')) + (last ? last[0] : (name[1] || ''));
  const color   = _AVATAR_COLORS[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % _AVATAR_COLORS.length];

  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  sheet.innerHTML = /* html */`
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel" role="dialog" aria-label="Edit Member — ${_e(name)}">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="fold-avatar" style="background:${color};width:38px;height:38px;font-size:0.88rem;flex-shrink:0;">${_e(initials.toUpperCase().slice(0,2))}</div>
          <div class="life-sheet-hd-info">
            <div class="life-sheet-hd-name">${_e(name)}</div>
            <div class="life-sheet-hd-meta">${_e(role)}</div>
          </div>
        </div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">
        <!-- ID row -->
        <div class="fold-id-row">
          <span class="fold-id-label">Member ID</span>
          <code class="fold-id-code">${_e(uid || '—')}</code>
          <button class="fold-copy-btn" data-copy="${_e(uid)}" title="Copy ID" ${uid ? '' : 'disabled'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy ID
          </button>
        </div>
        <!-- Name -->
        <div class="fold-form-row">
          <div class="life-sheet-field">
            <div class="life-sheet-label">First Name</div>
            <input class="life-sheet-input" data-field="firstName" type="text" value="${_e(first)}" placeholder="First name">
          </div>
          <div class="life-sheet-field">
            <div class="life-sheet-label">Last Name</div>
            <input class="life-sheet-input" data-field="lastName" type="text" value="${_e(last)}" placeholder="Last name">
          </div>
        </div>
        <!-- Contact -->
        <div class="life-sheet-field">
          <div class="life-sheet-label">Email</div>
          <input class="life-sheet-input" data-field="email" type="email" value="${_e(person.email || person.primaryEmail || '')}" placeholder="Email address">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Phone</div>
          <input class="life-sheet-input" data-field="phone" type="tel" value="${_e(person.phone || person.primaryPhone || person.mobilePhone || '')}" placeholder="Phone number">
        </div>
        <!-- Member Type -->
        <div class="life-sheet-field">
          <div class="life-sheet-label">Member Type</div>
          <select class="life-sheet-input" data-field="memberType">
            ${MEMBER_TYPES.map(t => `<option value="${_e(t.toLowerCase())}"${role.toLowerCase() === t.toLowerCase() ? ' selected' : ''}>${_e(t)}</option>`).join('')}
          </select>
        </div>
        <!-- Permissions -->
        <div class="fold-perm-section">
          <div class="fold-perm-section-title">🔐 FlockOS Access Level</div>
          <div class="fold-perm-section-sub">Controls what this person can see and do inside FlockOS.</div>
          <select class="life-sheet-input" data-field="accessRole" style="margin-top:8px;">
            <option value="">— No access (not a FlockOS user) —</option>
            ${ACCESS_ROLES.map(r => `<option value="${_e(r.value)}">${_e(r.label)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="life-sheet-foot">
        <button class="flock-btn flock-btn--danger" data-delete style="margin-right:auto">Archive</button>
        <button class="flock-btn" data-cancel>Cancel</button>
        <button class="flock-btn flock-btn--primary" data-save>Save Changes</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  _activeFoldSheet = sheet;
  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
  });

  // Load current permissions
  if (V && uid) {
    V.flock.permissions.get({ memberId: uid }).then(res => {
      const currentRole = (res && (res.role || res.accessRole || res.level || '')) || '';
      const sel = sheet.querySelector('[data-field="accessRole"]');
      if (sel && currentRole) sel.value = currentRole.toLowerCase();
    }).catch(() => {});
  }

  // Copy ID
  sheet.querySelector('[data-copy]')?.addEventListener('click', async (e) => {
    const id = e.currentTarget.dataset.copy;
    if (!id) return;
    try {
      await navigator.clipboard.writeText(id);
      const btn = e.currentTarget;
      const orig = btn.innerHTML;
      btn.textContent = '✅ Copied!';
      setTimeout(() => { btn.innerHTML = orig; }, 1800);
    } catch {
      prompt('Copy this member ID:', id);
    }
  });

  // Close
  sheet.querySelector('[data-cancel]').addEventListener('click', () => _closeMemberSheet());
  sheet.querySelector('.life-sheet-close').addEventListener('click', () => _closeMemberSheet());
  sheet.querySelector('.life-sheet-overlay').addEventListener('click', () => _closeMemberSheet());

  // Save
  sheet.querySelector('[data-save]').addEventListener('click', async () => {
    const btn = sheet.querySelector('[data-save]');
    btn.disabled = true; btn.textContent = 'Saving…';
    const updates = {
      id:         uid,
      firstName:  sheet.querySelector('[data-field="firstName"]').value.trim(),
      lastName:   sheet.querySelector('[data-field="lastName"]').value.trim(),
      email:      sheet.querySelector('[data-field="email"]').value.trim(),
      phone:      sheet.querySelector('[data-field="phone"]').value.trim(),
      memberType: sheet.querySelector('[data-field="memberType"]').value,
    };
    const accessRole = sheet.querySelector('[data-field="accessRole"]').value;
    try {
      await V.flock.members.update(updates);
      if (accessRole && uid) {
        await V.flock.permissions.set({ memberId: uid, role: accessRole }).catch(() => {});
      }
      _closeMemberSheet();
      onReload?.();
    } catch (err) {
      console.error('[TheFold] member update error:', err);
      btn.disabled = false; btn.textContent = 'Save Changes';
    }
  });

  // Delete / archive
  sheet.querySelector('[data-delete]').addEventListener('click', async () => {
    const ok = confirm(`Archive ${name}? They will be hidden from the directory but their records are preserved.`);
    if (!ok) return;
    const btn = sheet.querySelector('[data-delete]');
    btn.disabled = true; btn.textContent = 'Archiving…';
    try {
      await V.flock.members.delete({ id: uid });
      _closeMemberSheet();
      onReload?.();
    } catch (err) {
      console.error('[TheFold] member delete error:', err);
      btn.disabled = false; btn.textContent = 'Archive';
    }
  });
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ── Add new member sheet ──────────────────────────────────────────────────────
function _openNewMemberSheet(onReload) {
  _closeMemberSheet();
  const V = window.TheVine;
  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  sheet.innerHTML = /* html */`
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel" role="dialog" aria-label="Add New Person">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="fold-avatar" style="background:var(--c-violet);width:38px;height:38px;font-size:1.2rem;flex-shrink:0;">✝</div>
          <div class="life-sheet-hd-info">
            <div class="life-sheet-hd-name">Add New Person</div>
            <div class="life-sheet-hd-meta">New member, visitor, or leader</div>
          </div>
        </div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">
        <!-- Name -->
        <div class="fold-form-row">
          <div class="life-sheet-field">
            <div class="life-sheet-label">First Name <span style="color:#dc2626">*</span></div>
            <input class="life-sheet-input" data-field="firstName" type="text" placeholder="First name" autofocus>
          </div>
          <div class="life-sheet-field">
            <div class="life-sheet-label">Last Name</div>
            <input class="life-sheet-input" data-field="lastName" type="text" placeholder="Last name">
          </div>
        </div>
        <!-- Contact -->
        <div class="life-sheet-field">
          <div class="life-sheet-label">Email</div>
          <input class="life-sheet-input" data-field="email" type="email" placeholder="Email address">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Phone</div>
          <input class="life-sheet-input" data-field="phone" type="tel" placeholder="Phone number">
        </div>
        <!-- Member Type -->
        <div class="life-sheet-field">
          <div class="life-sheet-label">Member Type</div>
          <select class="life-sheet-input" data-field="memberType">
            ${MEMBER_TYPES.map(t => `<option value="${_e(t.toLowerCase())}"${t === 'Visitor' ? ' selected' : ''}>${_e(t)}</option>`).join('')}
          </select>
        </div>
        <!-- FlockOS Access -->
        <div class="fold-perm-section">
          <div class="fold-perm-section-title">🔐 FlockOS Access Level</div>
          <div class="fold-perm-section-sub">Optional — grant access so they can log in to FlockOS.</div>
          <select class="life-sheet-input" data-field="accessRole" style="margin-top:8px;">
            <option value="">— No access —</option>
            ${ACCESS_ROLES.map(r => `<option value="${_e(r.value)}">${_e(r.label)}</option>`).join('')}
          </select>
        </div>
        <!-- Error slot -->
        <div class="fold-form-error" data-error style="display:none;color:#dc2626;font-size:.85rem;margin-top:8px"></div>
      </div>
      <div class="life-sheet-foot">
        <button class="flock-btn" data-cancel>Cancel</button>
        <button class="flock-btn flock-btn--primary" data-save>Add Person</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  _activeFoldSheet = sheet;
  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
    sheet.querySelector('[data-field="firstName"]')?.focus();
  });

  sheet.querySelector('[data-cancel]').addEventListener('click', () => _closeMemberSheet());
  sheet.querySelector('.life-sheet-close').addEventListener('click', () => _closeMemberSheet());
  sheet.querySelector('.life-sheet-overlay').addEventListener('click', () => _closeMemberSheet());

  sheet.querySelector('[data-save]').addEventListener('click', async () => {
    const firstName = sheet.querySelector('[data-field="firstName"]').value.trim();
    const errEl     = sheet.querySelector('[data-error]');
    if (!firstName) { errEl.textContent = 'First name is required.'; errEl.style.display = ''; return; }
    errEl.style.display = 'none';
    const btn = sheet.querySelector('[data-save]');
    btn.disabled = true; btn.textContent = 'Adding…';
    const payload = {
      firstName,
      lastName:   sheet.querySelector('[data-field="lastName"]').value.trim(),
      email:      sheet.querySelector('[data-field="email"]').value.trim(),
      phone:      sheet.querySelector('[data-field="phone"]').value.trim(),
      memberType: sheet.querySelector('[data-field="memberType"]').value,
    };
    const accessRole = sheet.querySelector('[data-field="accessRole"]').value;
    try {
      const res = await V.flock.members.create(payload);
      const newId = res?.id || res?.memberId || res?.memberNumber;
      if (accessRole && newId) {
        await V.flock.permissions.set({ memberId: newId, role: accessRole }).catch(() => {});
      }
      _closeMemberSheet();
      onReload?.();
    } catch (err) {
      console.error('[TheFold] member create error:', err);
      errEl.textContent = err?.message || 'Could not create member. Please try again.';
      errEl.style.display = '';
      btn.disabled = false; btn.textContent = 'Add Person';
    }
  });
}
