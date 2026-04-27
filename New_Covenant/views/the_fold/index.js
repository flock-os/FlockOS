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

  return () => {};
}

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
    // Filter client-side: keep active/non-inactive members (matches 'active', true, 'Active', '1')
    const rows = all.filter(r => {
      const s = String(r.status || r.active || r.Status || '').toLowerCase();
      return s !== 'inactive' && s !== 'false' && s !== '0' && s !== 'archived';
    });
    if (!rows.length) {
      grid.innerHTML = '<div style="padding:32px;text-align:center;color:var(--ink-muted,#7a7f96)">No members found.</div>';
      return;
    }
    grid.innerHTML = rows.map(_liveCard).join('');
    if (stats) stats.innerHTML = _liveStats(rows);
    // Re-wire card clicks on live cards
    grid.querySelectorAll('.fold-card').forEach((card) => {
      card.addEventListener('click', () => { /* TODO: open person detail sheet */ });
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
  return `
    <article class="fold-card" role="listitem" tabindex="0"
             data-name="${_e(name.toLowerCase())}" data-role="${_e(role)}">
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

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
