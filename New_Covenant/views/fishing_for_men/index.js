/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: FISHING FOR MEN — Outreach & Evangelism
   "Follow me, and I will make you fishers of men." — Matthew 4:19
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'fishing_for_men';
export const title = 'Outreach';

const FUNNEL = [
  { stage: 'Gospel Contacts',   n: 287, color: 'var(--c-sky)',     pct: 100 },
  { stage: 'Follow-up Made',    n: 143, color: 'var(--c-violet)',   pct: 50  },
  { stage: 'Interested',        n:  72, color: 'var(--gold)',       pct: 25  },
  { stage: 'Attending Church',  n:  38, color: 'var(--c-emerald)',  pct: 13  },
  { stage: 'Decisions',         n:  34, color: '#dc2626',           pct: 12  },
];

const CONTACTS = [
  { name: 'Noah Williams',    source: 'Street Outreach',   date: 'Apr 24', stage: 'Attending Church', assigned: 'Elijah M.' },
  { name: 'Aisha Kamara',     source: 'Friend Referral',   date: 'Apr 22', stage: 'Interested',       assigned: 'James O.'  },
  { name: 'Dario Ferreira',   source: 'Community Event',   date: 'Apr 19', stage: 'Follow-up Made',   assigned: 'Unassigned' },
  { name: 'Mei-Ling Zhao',    source: 'FlockChat Invite',  date: 'Apr 17', stage: 'Interested',       assigned: 'Priya N.'  },
  { name: 'Kwame Asante',     source: 'Prison Ministry',   date: 'Apr 10', stage: 'Attending Church', assigned: 'Pastor Mike' },
  { name: 'Beatrice Olawale', source: 'Mothers Day Event', date: 'Apr  6', stage: 'Gospel Contacts',  assigned: 'Unassigned' },
  { name: 'Sven Larsson',     source: 'Community Outreach',date: 'Mar 28', stage: 'Decisions',        assigned: 'Elder Sarah' },
];

const STAGE_COLOR = {
  'Gospel Contacts':  { color: 'var(--c-sky)',    bg: 'rgba(14,165,233,0.10)'  },
  'Follow-up Made':   { color: 'var(--c-violet)', bg: 'rgba(124,58,237,0.10)' },
  'Interested':       { color: 'var(--gold)',      bg: 'rgba(232,168,56,0.13)' },
  'Attending Church': { color: 'var(--c-emerald)', bg: 'rgba(5,150,105,0.10)'  },
  'Decisions':        { color: '#dc2626',          bg: 'rgba(220,38,38,0.10)'  },
};

export function render() {
  return /* html */`
    <section class="fish-view">
      ${pageHero({
        title:    'Outreach',
        subtitle: 'Track every gospel contact from first conversation to new life in Christ.',
        scripture: 'Follow me, and I will make you fishers of men. — Matthew 4:19',
      })}

      <!-- Funnel -->
      <div class="way-section-header">
        <h2 class="way-section-title">Evangelism Funnel — 2026</h2>
      </div>
      <div class="fish-funnel">
        ${FUNNEL.map(f => `
          <div class="fish-funnel-row">
            <div class="fish-funnel-label">${_e(f.stage)}</div>
            <div class="fish-funnel-bar-wrap">
              <div class="fish-funnel-bar" style="width:${f.pct}%; background:${f.color}"></div>
            </div>
            <div class="fish-funnel-n" style="color:${f.color}">${f.n}</div>
          </div>
        `).join('')}
      </div>

      <!-- Contacts list -->
      <div class="way-section-header" style="margin-top:24px;">
        <h2 class="way-section-title">Recent Gospel Contacts</h2>
        <button class="flock-btn flock-btn--primary" style="display:flex; align-items:center; gap:6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Log Contact
        </button>
      </div>
      <div class="fish-contacts">
        ${CONTACTS.map(_contactRow).join('')}
      </div>
    </section>
  `;
}

export function mount() { return () => {}; }

function _contactRow(c) {
  const sc = STAGE_COLOR[c.stage] || { color: 'var(--ink-muted)', bg: 'var(--bg-base)' };
  const initials = c.name.split(' ').map(w => w[0] || '').slice(0, 2).join('').toUpperCase();
  const unassigned = c.assigned === 'Unassigned';
  return /* html */`
    <article class="fish-contact-row" tabindex="0">
      <div class="fold-avatar" style="background: linear-gradient(135deg,#0ea5e9,#7c3aed); width:38px; height:38px; font-size:.78rem;">${initials}</div>
      <div class="fish-contact-body">
        <div class="fish-contact-name">${_e(c.name)}</div>
        <div class="fish-contact-meta">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          ${_e(c.source)} · ${_e(c.date)}
        </div>
      </div>
      <span class="fish-stage-badge" style="color:${sc.color}; background:${sc.bg}">${_e(c.stage)}</span>
      <div class="fish-assigned${unassigned ? ' fish-assigned--empty' : ''}">${_e(c.assigned)}</div>
    </article>
  `;
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

