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
        ${_loadingStats()}
      </div>

      <!-- Member grid -->
      <div class="fold-grid" data-bind="members" role="list">
        <div class="life-empty">Loading members…</div>
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
  const grid  = root.querySelector('[data-bind="members"]');
  const stats = root.querySelector('[data-bind="stats"]');
  if (!grid) return;
  if (!V?.flock?.members?.list) {
    grid.innerHTML = '<div class="life-empty">Directory backend not loaded.</div>';
    if (stats) stats.innerHTML = _loadingStats();
    return;
  }
  grid.innerHTML = '<div class="life-empty">Loading members…</div>';
  try {
    const res  = await V.flock.members.list({ limit: 500 });
    const all  = _rows(res);
    // Filter client-side: keep active/non-inactive members
    const rows = all.filter(r => {
      const s = String(r.status || r.active || r.Status || '').toLowerCase();
      return s !== 'inactive' && s !== 'false' && s !== '0' && s !== 'archived';
    });
    if (!rows.length) {
      grid.innerHTML = '<div class="life-empty">No members found yet. Click “Add Person” to begin.</div>';
      if (stats) stats.innerHTML = _loadingStats();
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
    grid.innerHTML = '<div class="life-empty">Could not load members right now.</div>';
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

function _loadingStats() {
  return ['Total','Members','Visitors','Leaders'].map((label) => `
    <div class="fold-stat-chip">
      <span class="fold-stat-dot" style="background:var(--ink-muted,#7a7f96)"></span>
      <strong>—</strong> <span>${label}</span>
    </div>
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
        <!-- Personal details -->
        <div class="fold-form-row">
          <div class="life-sheet-field">
            <div class="life-sheet-label">Date of Birth</div>
            <input class="life-sheet-input" data-field="birthDate" type="date" value="${_e(person.birthDate || person.birthdate || '')}">
          </div>
          <div class="life-sheet-field">
            <div class="life-sheet-label">Gender</div>
            <select class="life-sheet-input" data-field="gender">
              <option value="">— Select —</option>
              ${['Male','Female','Non-binary','Prefer not to say'].map(g => `<option value="${_e(g)}"${(person.gender||'') === g ? ' selected' : ''}>${_e(g)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Join Date</div>
          <input class="life-sheet-input" data-field="joinDate" type="date" value="${_e(person.joinDate || person.memberSince || '')}">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Notes</div>
          <textarea class="life-sheet-input" data-field="notes" rows="2" style="resize:vertical" placeholder="Pastoral notes, household info, etc.">${_e(person.notes || '')}</textarea>
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
        <button class="flock-icon-btn flock-icon-btn--warn" data-archive title="Archive member" aria-label="Archive member" style="margin-right:6px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><path d="M10 12h4"/></svg>
        </button>
        <button class="flock-icon-btn flock-icon-btn--danger" data-delete title="Delete member permanently" aria-label="Delete member permanently" style="margin-right:auto;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6"/><path d="M10 11v6M14 11v6"/></svg>
        </button>
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
      birthDate:  sheet.querySelector('[data-field="birthDate"]').value || undefined,
      gender:     sheet.querySelector('[data-field="gender"]').value || undefined,
      joinDate:   sheet.querySelector('[data-field="joinDate"]').value || undefined,
      notes:      sheet.querySelector('[data-field="notes"]').value.trim() || undefined,
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
      alert(err?.message || 'Could not save member changes.');
    }
  });

  // Archive (soft — hide from directory)
  sheet.querySelector('[data-archive]').addEventListener('click', async () => {
    const ok = confirm(`Archive ${name}?\n\nThey will be hidden from the directory but their records are preserved. You can restore them later.`);
    if (!ok) return;
    const btn = sheet.querySelector('[data-archive]');
    btn.disabled = true;
    try {
      // Soft archive: flip status to Inactive (preserves all records)
      await V.flock.members.update({ id: uid, status: 'Inactive' });
      _closeMemberSheet();
      onReload?.();
    } catch (err) {
      console.error('[TheFold] member archive error:', err);
      btn.disabled = false;
      alert(err?.message || 'Could not archive this person.');
    }
  });

  // Delete (hard — destructive, type-to-confirm)
  sheet.querySelector('[data-delete]').addEventListener('click', async () => {
    const typed = prompt(
      `⚠️ PERMANENT DELETE\n\nThis will permanently remove ${name} and cannot be undone.\n\nType the first name ("${first || name.split(' ')[0] || name}") to confirm:`
    );
    if (typed == null) return;
    const expected = (first || name.split(' ')[0] || name).trim().toLowerCase();
    if (typed.trim().toLowerCase() !== expected) {
      alert('Name did not match. Delete cancelled.');
      return;
    }
    const btn = sheet.querySelector('[data-delete]');
    btn.disabled = true;
    try {
      await V.flock.members.delete({ id: uid });
      _closeMemberSheet();
      onReload?.();
    } catch (err) {
      console.error('[TheFold] member delete error:', err);
      btn.disabled = false;
      alert(err?.message || 'Could not delete this person.');
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
        <!-- Personal details -->
        <div class="fold-form-row">
          <div class="life-sheet-field">
            <div class="life-sheet-label">Date of Birth</div>
            <input class="life-sheet-input" data-field="birthDate" type="date">
          </div>
          <div class="life-sheet-field">
            <div class="life-sheet-label">Gender</div>
            <select class="life-sheet-input" data-field="gender">
              <option value="">— Select —</option>
              ${['Male','Female','Non-binary','Prefer not to say'].map(g => `<option value="${_e(g)}">${_e(g)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Notes</div>
          <textarea class="life-sheet-input" data-field="notes" rows="2" style="resize:vertical" placeholder="Any additional notes…"></textarea>
        </div>
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

  sheet.querySelector('[data-save]').addEventListener('click', async () => {
    const firstName = sheet.querySelector('[data-field="firstName"]').value.trim();
    const errEl     = sheet.querySelector('[data-error]');
    if (!firstName) { errEl.textContent = 'First name is required.'; errEl.style.display = ''; return; }
    if (!V?.flock?.members?.create) { errEl.textContent = 'Directory backend not loaded — cannot add.'; errEl.style.display = ''; return; }
    errEl.style.display = 'none';
    const btn = sheet.querySelector('[data-save]');
    btn.disabled = true; btn.textContent = 'Adding…';
    const payload = {
      firstName,
      lastName:   sheet.querySelector('[data-field="lastName"]').value.trim(),
      email:      sheet.querySelector('[data-field="email"]').value.trim(),
      phone:      sheet.querySelector('[data-field="phone"]').value.trim(),
      memberType: sheet.querySelector('[data-field="memberType"]').value,
      birthDate:  sheet.querySelector('[data-field="birthDate"]').value || undefined,
      gender:     sheet.querySelector('[data-field="gender"]').value || undefined,
      notes:      sheet.querySelector('[data-field="notes"]').value.trim() || undefined,
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
