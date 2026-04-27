/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE LIFE — Pastoral Care
   "Shepherd the flock of God that is among you." — 1 Peter 5:2
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'the_life';
export const title = 'Pastoral Care';

const PRIORITY = {
  urgent: { label: 'Urgent',  color: '#dc2626', bg: 'rgba(220,38,38,0.10)' },
  high:   { label: 'High',    color: '#e8a838', bg: 'rgba(232,168,56,0.13)' },
  normal: { label: 'Normal',  color: '#0ea5e9', bg: 'rgba(14,165,233,0.10)' },
};

const CARE_TYPES = {
  prayer:     { icon: '🙏', label: 'Prayer Request' },
  visit:      { icon: '🏥', label: 'Hospital Visit'  },
  followup:   { icon: '📞', label: 'Follow-up Call'  },
  grief:      { icon: '🕊️', label: 'Grief Support'   },
  counseling: { icon: '💬', label: 'Counseling'       },
  welcome:    { icon: '👋', label: 'New Visitor'      },
  milestone:  { icon: '🎉', label: 'Life Milestone'   },
};

const QUEUE = [
  { id: 1, name: 'Dorothy Kaplan',  type: 'visit',      priority: 'urgent', assignee: 'Pastor Mike', note: 'Hip surgery recovery — admitted Wednesday',             days: 1 },
  { id: 2, name: 'Marcus Webb',     type: 'grief',      priority: 'urgent', assignee: 'Elder Sarah',  note: 'Lost father last week — needs bereavement support',    days: 2 },
  { id: 3, name: 'Lena Boateng',    type: 'counseling', priority: 'high',   assignee: 'Pastor Mike', note: 'Family conflict — 3rd session scheduled for Thursday',  days: 4 },
  { id: 4, name: 'Robert Simmons',  type: 'followup',   priority: 'high',   assignee: 'Deacon James', note: 'Missed 3 Sundays — last contact 2 weeks ago',          days: 7 },
  { id: 5, name: 'Amara Diallo',    type: 'prayer',     priority: 'high',   assignee: 'Unassigned',  note: 'Anxious about job loss — requested prayer',             days: 3 },
  { id: 6, name: 'Thomas & Sue Park', type: 'milestone', priority: 'normal', assignee: 'Elder Sarah', note: '40th wedding anniversary — send gift + call',          days: 6 },
  { id: 7, name: 'Ben Osei',        type: 'welcome',    priority: 'normal', assignee: 'Unassigned',  note: 'First-time visitor 2 Sundays ago — needs welcome card', days: 5 },
  { id: 8, name: 'Carol Nguyen',    type: 'prayer',     priority: 'normal', assignee: 'Deacon James', note: 'Submitted prayer request via FlockChat',                days: 1 },
];

export function render() {
  const urgent = QUEUE.filter(c => c.priority === 'urgent');
  const high   = QUEUE.filter(c => c.priority === 'high');
  const normal = QUEUE.filter(c => c.priority === 'normal');

  return /* html */`
    <section class="life-view">
      ${pageHero({
        title:    'Pastoral Care',
        subtitle: 'Follow-ups, prayer requests, visits, and life moments — nobody falls through the cracks.',
        scripture: 'Shepherd the flock of God that is among you. — 1 Peter 5:2',
      })}

      <!-- Quick stats -->
      <div class="life-stats">
        <div class="life-stat-card life-stat--urgent">
          <div class="life-stat-n">${urgent.length}</div>
          <div class="life-stat-label">Urgent</div>
        </div>
        <div class="life-stat-card life-stat--high">
          <div class="life-stat-n">${high.length}</div>
          <div class="life-stat-label">High Priority</div>
        </div>
        <div class="life-stat-card life-stat--normal">
          <div class="life-stat-n">${normal.length}</div>
          <div class="life-stat-label">Normal</div>
        </div>
        <div class="life-stat-card life-stat--total">
          <div class="life-stat-n">${QUEUE.length}</div>
          <div class="life-stat-label">Total Open</div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="life-toolbar">
        <div class="fold-filters">
          <button class="fold-filter is-active" data-life-filter="all">All</button>
          <button class="fold-filter" data-life-filter="urgent">Urgent</button>
          <button class="fold-filter" data-life-filter="prayer">Prayer</button>
          <button class="fold-filter" data-life-filter="visit">Visits</button>
          <button class="fold-filter" data-life-filter="followup">Follow-ups</button>
        </div>
        <button class="flock-btn flock-btn--primary" style="margin-left:auto;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          New Care Item
        </button>
      </div>

      <!-- Queue -->
      <div class="life-queue" data-bind="queue">
        ${QUEUE.map(_careCard).join('')}
      </div>
    </section>
  `;
}

export function mount(root) {
  root.querySelectorAll('[data-life-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('[data-life-filter]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const f = btn.dataset.lifeFilter;
      root.querySelectorAll('.life-card').forEach((card) => {
        const show = f === 'all' || card.dataset.type === f || card.dataset.priority === f;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  root.querySelectorAll('[data-care-complete]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.life-card');
      if (card) { card.style.opacity = '0.4'; card.style.pointerEvents = 'none'; }
    });
  });
  return () => {};
}

function _careCard(c) {
  const p    = PRIORITY[c.priority];
  const t    = CARE_TYPES[c.type] || { icon: '·', label: c.type };
  const unassigned = c.assignee === 'Unassigned';
  const daysAgo = c.days === 1 ? 'Yesterday' : `${c.days}d ago`;

  return /* html */`
    <article class="life-card" data-type="${_e(c.type)}" data-priority="${_e(c.priority)}" tabindex="0">
      <div class="life-card-icon">${t.icon}</div>
      <div class="life-card-body">
        <div class="life-card-top">
          <span class="life-card-name">${_e(c.name)}</span>
          <span class="life-priority-badge" style="color:${p.color}; background:${p.bg}">${p.label}</span>
          <span class="life-type-badge">${t.label}</span>
        </div>
        <div class="life-card-note">${_e(c.note)}</div>
        <div class="life-card-foot">
          <span class="life-assignee${unassigned ? ' life-assignee--empty' : ''}">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            ${_e(c.assignee)}
          </span>
          <span class="life-days">${daysAgo}</span>
        </div>
      </div>
      <div class="life-card-actions">
        <button class="life-action-btn" title="Mark complete" data-care-complete="${c.id}" aria-label="Complete">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
        <button class="life-action-btn" title="Add note" aria-label="Note">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
        </button>
      </div>
    </article>
  `;
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
