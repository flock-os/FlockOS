/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE PENTECOST — Special Services & Spiritual Milestones
   "And suddenly there came a sound from heaven as of a rushing mighty wind." — Acts 2:2
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'the_pentecost';
export const title = 'The Pentecost';

const _e = s => String(s ?? '').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const SPECIAL_TYPES = new Set(['baptism','revival','special','retreat','conference','ordination','communion','memorial','dedication']);

const EVENTS = [
  { title: 'Baptism Sunday',            date: 'May 4, 2026',    type: 'baptism',    candidates: 7,  status: 'upcoming', notes: '7 candidates prepared — family & friends invited'      },
  { title: 'Spring Revival Night',      date: 'May 16–18, 2026',type: 'revival',    candidates: 0,  status: 'upcoming', notes: 'Guest speaker: Dr. A. Osei. Evening services 7 PM'       },
  { title: 'Leadership Retreat',        date: 'May 30, 2026',   type: 'retreat',    candidates: 0,  status: 'upcoming', notes: 'Elder board + deacons. Hosted at Camp Bethel'            },
  { title: 'Pentecost Sunday Service',  date: 'Jun 1, 2026',    type: 'special',    candidates: 0,  status: 'upcoming', notes: 'Celebration of the outpouring. Joint morning + evening'  },
  { title: 'Easter Sunday',             date: 'Apr 5, 2026',    type: 'special',    candidates: 0,  status: 'complete', notes: '143 gospel conversations. Largest service this year'     },
  { title: 'Baptism (Winter)',          date: 'Jan 19, 2026',   type: 'baptism',    candidates: 4,  status: 'complete', notes: '4 baptized — full immersion'                             },
];

const TYPE_META = {
  baptism:     { color: '#0ea5e9', bg: 'rgba(14,165,233,0.11)',  icon: '💧', label: 'Baptism'      },
  revival:     { color: '#7c3aed', bg: 'rgba(124,58,237,0.11)', icon: '🔥', label: 'Revival'      },
  retreat:     { color: '#059669', bg: 'rgba(5,150,105,0.11)',   icon: '⛺', label: 'Retreat'      },
  special:     { color: '#e8a838', bg: 'rgba(232,168,56,0.13)',  icon: '✝️', label: 'Special'      },
  conference:  { color: '#6366f1', bg: 'rgba(99,102,241,0.11)', icon: '🎤', label: 'Conference'   },
  ordination:  { color: '#1b264f', bg: 'rgba(27,38,79,0.10)',   icon: '🙌', label: 'Ordination'   },
  communion:   { color: '#dc2626', bg: 'rgba(220,38,38,0.10)',  icon: '🍞', label: 'Communion'    },
  memorial:    { color: '#6b7280', bg: 'rgba(107,114,128,0.10)',icon: '🕯️', label: 'Memorial'     },
  dedication:  { color: '#c05818', bg: 'rgba(192,88,24,0.11)',  icon: '🌹', label: 'Dedication'   },
};

const UPCOMING = EVENTS.filter(e => e.status === 'upcoming');
const PAST     = EVENTS.filter(e => e.status === 'complete');

export function render() {
  return /* html */`
    <section class="pent-view">
      ${pageHero({
        title:    'The Pentecost',
        subtitle: 'Baptisms, revivals, retreats, and special services — Spirit-led moments in the life of the church.',
        scripture: 'And suddenly there came a sound from heaven as of a rushing mighty wind. — Acts 2:2',
      })}

      <!-- Upcoming special services -->
      <div class="way-section-header">
        <h2 class="way-section-title">Upcoming Special Services</h2>
        <button class="flock-btn flock-btn--primary" style="display:flex;align-items:center;gap:6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Schedule Event
        </button>
      </div>
      <div class="pent-list" data-bind="upcoming">
        ${UPCOMING.map(_eventCard).join('')}
      </div>

      <!-- Past milestones -->
      <div class="way-section-header" style="margin-top:28px;">
        <h2 class="way-section-title">Past Milestones</h2>
      </div>
      <div class="pent-list pent-list--past" data-bind="past">
        ${PAST.map(_eventCard).join('')}
      </div>
    </section>
  `;
}

export function mount(root) {
  _loadPentecost(root);
  return () => {};
}

function _rows(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.rows)) return res.rows;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

async function _loadPentecost(root) {
  const V = window.TheVine;
  if (!V) return;

  try {
    const res  = await V.flock.events.list({ limit: 100 });
    const all  = _rows(res);
    const special = all.filter(ev => {
      const t = (ev.type || ev.eventType || ev.category || '').toLowerCase();
      return SPECIAL_TYPES.has(t) || t.includes('baptism') || t.includes('revival') || t.includes('retreat') || t.includes('special');
    });
    if (!special.length) return;

    const now = new Date(); now.setHours(0,0,0,0);
    special.sort((a, b) => new Date(a.startDate || a.date) - new Date(b.startDate || b.date));
    const upcoming = special.filter(ev => new Date(ev.startDate || ev.date) >= now);
    const past     = special.filter(ev => new Date(ev.startDate || ev.date) < now).reverse();

    const upEl  = root.querySelector('[data-bind="upcoming"]');
    const pastEl = root.querySelector('[data-bind="past"]');
    if (upEl && upcoming.length)  upEl.innerHTML  = upcoming.map(_liveEventCard).join('');
    if (pastEl && past.length)    pastEl.innerHTML = past.map(_liveEventCard).join('');
  } catch (err) {
    console.error('[ThePentecost] events.list error:', err);
  }
}

function _liveEventCard(ev) {
  const title    = ev.title || ev.name || 'Event';
  const rawType  = (ev.type || ev.eventType || ev.category || 'special').toLowerCase();
  const type     = Object.keys(TYPE_META).find(k => rawType.includes(k)) || 'special';
  const meta     = TYPE_META[type];
  const dateMs   = ev.startDate || ev.date ? new Date(ev.startDate || ev.date).getTime() : 0;
  const date     = dateMs ? new Date(dateMs).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  const notes    = ev.description || ev.notes || '';
  const now      = new Date(); now.setHours(0,0,0,0);
  const isPast   = dateMs && new Date(dateMs) < now;
  return _cardHTML({ title, date, type, meta, notes, candidates: 0, isPast });
}

function _eventCard(ev) {
  const meta  = TYPE_META[ev.type] || TYPE_META.special;
  const isPast = ev.status === 'complete';
  return _cardHTML({ title: ev.title, date: ev.date, type: ev.type, meta, notes: ev.notes, candidates: ev.candidates, isPast });
}

function _cardHTML({ title, date, type, meta, notes, candidates, isPast }) {
  return /* html */`
    <article class="pent-card${isPast ? ' pent-card--past' : ''}" tabindex="0">
      <div class="pent-card-icon" style="background:${meta.bg};color:${meta.color}">${meta.icon}</div>
      <div class="pent-card-body">
        <div class="pent-card-title">${_e(title)}</div>
        <div class="pent-card-meta">
          <span class="pent-type-badge" style="color:${meta.color};background:${meta.bg}">${meta.label}</span>
          ${date ? `<span class="pent-date">${_e(date)}</span>` : ''}
          ${candidates > 0 ? `<span class="pent-candidates">💧 ${candidates} candidates</span>` : ''}
          ${isPast ? '<span class="pent-past-badge">Complete</span>' : ''}
        </div>
        ${notes ? `<div class="pent-notes">${_e(notes)}</div>` : ''}
      </div>
    </article>`;
}

