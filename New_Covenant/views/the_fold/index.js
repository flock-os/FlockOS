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

  // Member card click → open detail (stub)
  root.querySelectorAll('.fold-card').forEach((card) => {
    card.addEventListener('click', () => {
      // TODO: open person detail sheet
    });
  });

  return () => {};
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
