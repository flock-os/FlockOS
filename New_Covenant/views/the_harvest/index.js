/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE HARVEST — Missions & Kingdom Growth
   "The harvest is plentiful but the workers are few." — Matthew 9:37
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'the_harvest';
export const title = 'Harvest';

const YEAR = 2026;

const STATS = [
  { label: 'Decisions for Christ', n: 34,  delta: '+8 this quarter',  icon: '✝️',  color: 'var(--c-violet)' },
  { label: 'Baptisms',             n: 19,  delta: '+5 this quarter',  icon: '💧',  color: 'var(--c-sky)'    },
  { label: 'New Members',          n: 41,  delta: '+11 this quarter', icon: '🌱',  color: 'var(--c-emerald)'},
  { label: 'Gospel Contacts',      n: 287, delta: 'This year',        icon: '🌍',  color: 'var(--gold)'     },
];

const MISSIONARIES = [
  { name: 'Thomas & Grace Adu',  region: 'West Africa',       org: 'SIM',           giving: 1200, goal: 1500, supported: true  },
  { name: 'Rafael Mendes',       region: 'Amazonian Brazil',  org: 'ABWE',          giving:  800, goal:  800, supported: true  },
  { name: 'Sophie & Jean Blanc', region: 'North Africa',      org: 'OM',            giving:  600, goal:  900, supported: true  },
  { name: 'Deborah Nwachukwu',   region: 'Middle East',       org: 'Frontiers',     giving:    0, goal: 1000, supported: false },
];

const OUTREACH = [
  { title: 'Downtown Gospel Rally',   date: 'May 17',   team: 12, contacts: '~80 expected',  status: 'upcoming' },
  { title: 'Prison Ministry Visit',   date: 'May 3',    team: 6,  contacts: 'Brookfield CI',  status: 'upcoming' },
  { title: 'Neighborhood Bible Club', date: 'Weekly',   team: 8,  contacts: 'Oak Ave / kids', status: 'active'   },
  { title: 'Easter Outreach',         date: 'Apr 5',    team: 24, contacts: '143 gospel conversations', status: 'complete' },
];

export function render() {
  return /* html */`
    <section class="harvest-view">
      ${pageHero({
        title:    'Harvest',
        subtitle: `Missions, evangelism, baptisms, and kingdom growth — ${YEAR} at a glance.`,
        scripture: 'The harvest is plentiful but the workers are few. — Matthew 9:37',
      })}

      <!-- Kingdom stats -->
      <div class="harvest-stats">
        ${STATS.map(s => `
          <div class="harvest-stat-card">
            <div class="harvest-stat-icon">${s.icon}</div>
            <div class="harvest-stat-n" style="color:${s.color}">${s.n}</div>
            <div class="harvest-stat-label">${_e(s.label)}</div>
            <div class="harvest-stat-delta">${_e(s.delta)}</div>
          </div>
        `).join('')}
      </div>

      <!-- Missionaries -->
      <div class="way-section-header" style="margin-top:28px;">
        <h2 class="way-section-title">Supported Missionaries</h2>
        <button class="flock-btn flock-btn--ghost">Manage Support</button>
      </div>
      <div class="harvest-missionaries">
        ${MISSIONARIES.map(_missionCard).join('')}
      </div>

      <!-- Local Outreach -->
      <div class="way-section-header" style="margin-top:28px;">
        <h2 class="way-section-title">Local Outreach</h2>
        <button class="flock-btn flock-btn--primary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          New Effort
        </button>
      </div>
      <div class="harvest-outreach">
        ${OUTREACH.map(_outreachRow).join('')}
      </div>
    </section>
  `;
}

export function mount() { return () => {}; }

function _missionCard(m) {
  const pct  = Math.min(100, Math.round((m.giving / m.goal) * 100));
  const initials = m.name.split(/[&\s]+/).filter(Boolean).map(w => w[0] || '').slice(0,2).join('').toUpperCase();
  return /* html */`
    <article class="harvest-mission-card${m.supported ? '' : ' harvest-mission--needs'}">
      <div class="harvest-mission-avatar">${initials}</div>
      <div class="harvest-mission-body">
        <div class="harvest-mission-name">${_e(m.name)}</div>
        <div class="harvest-mission-meta">
          <span>${_e(m.region)}</span>
          <span>·</span>
          <span>${_e(m.org)}</span>
        </div>
        <div class="harvest-giving-bar">
          <div class="harvest-giving-fill" style="width:${pct}%"></div>
        </div>
        <div class="harvest-giving-label">$${m.giving}/mo of $${m.goal}/mo goal (${pct}%)</div>
      </div>
      ${!m.supported ? '<div class="harvest-needs-badge">Needs Support</div>' : ''}
    </article>
  `;
}

function _outreachRow(o) {
  const statusColor = o.status === 'complete' ? '#059669' : o.status === 'active' ? '#0ea5e9' : '#e8a838';
  const statusBg    = o.status === 'complete' ? 'rgba(5,150,105,0.10)' : o.status === 'active' ? 'rgba(14,165,233,0.10)' : 'rgba(232,168,56,0.13)';
  return /* html */`
    <article class="harvest-outreach-row" tabindex="0">
      <div class="harvest-outreach-body">
        <div class="harvest-outreach-title">${_e(o.title)}</div>
        <div class="harvest-outreach-meta">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          ${_e(o.date)}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="margin-left:8px"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          ${o.team} team
          <span style="margin-left:8px; color:var(--ink-muted);">${_e(o.contacts)}</span>
        </div>
      </div>
      <span class="harvest-outreach-status" style="color:${statusColor}; background:${statusBg}">${o.status}</span>
    </article>
  `;
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
