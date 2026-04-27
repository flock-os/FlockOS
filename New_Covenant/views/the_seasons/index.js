/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE SEASONS — Events calendar
   "To everything there is a season, and a time for every purpose under heaven."
   — Ecclesiastes 3:1
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'the_seasons';
export const title = 'Seasons';

// ── Demo events data ─────────────────────────────────────────────────────────
const TODAY = new Date(2026, 3, 26); // April 26, 2026

const EVENTS = [
  { id: 1, title: 'Sunday Worship Service',   date: new Date(2026,3,26), time:'10:00 AM', type:'service',   loc:'Main Sanctuary',       rsvp: 0 },
  { id: 2, title: 'Prayer & Intercession',     date: new Date(2026,3,28), time:'7:00 PM',  type:'prayer',    loc:'Chapel',               rsvp: 18 },
  { id: 3, title: 'Youth Group Night',         date: new Date(2026,3,29), time:'6:30 PM',  type:'ministry',  loc:'Fellowship Hall',       rsvp: 34 },
  { id: 4, title: 'Sunday Worship Service',   date: new Date(2026,4, 3), time:'10:00 AM', type:'service',   loc:'Main Sanctuary',       rsvp: 0 },
  { id: 5, title: 'Elder Board Meeting',       date: new Date(2026,4, 5), time:'6:00 PM',  type:'admin',     loc:'Conference Room',       rsvp: 7 },
  { id: 6, title: 'Community Outreach Day',    date: new Date(2026,4, 9), time:'9:00 AM',  type:'outreach',  loc:'City Park',             rsvp: 62 },
  { id: 7, title: 'Sunday Worship Service',   date: new Date(2026,4,10), time:'10:00 AM', type:'service',   loc:'Main Sanctuary',       rsvp: 0 },
  { id: 8, title: 'Mothers\' Day Brunch',      date: new Date(2026,4,10), time:'12:00 PM', type:'special',   loc:'Fellowship Hall',       rsvp: 41 },
  { id: 9, title: 'Small Group Leaders Training', date: new Date(2026,4,14), time:'7:00 PM', type:'training', loc:'Room 204',            rsvp: 15 },
  { id:10, title: 'Sunday Worship Service',   date: new Date(2026,4,17), time:'10:00 AM', type:'service',   loc:'Main Sanctuary',       rsvp: 0 },
  { id:11, title: 'Marriage Enrichment Night', date: new Date(2026,4,22), time:'7:00 PM',  type:'ministry',  loc:'Fireside Lounge',      rsvp: 24 },
  { id:12, title: 'Sunday Worship Service',   date: new Date(2026,4,24), time:'10:00 AM', type:'service',   loc:'Main Sanctuary',       rsvp: 0 },
];

const TYPE_META = {
  service:  { label: 'Service',   color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
  prayer:   { label: 'Prayer',    color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
  ministry: { label: 'Ministry',  color: '#059669', bg: 'rgba(5,150,105,0.12)'  },
  outreach: { label: 'Outreach',  color: '#e8a838', bg: 'rgba(232,168,56,0.14)' },
  admin:    { label: 'Admin',     color: '#6b7280', bg: 'rgba(107,114,128,0.12)'},
  special:  { label: 'Special',   color: '#db2777', bg: 'rgba(219,39,119,0.12)' },
  training: { label: 'Training',  color: '#c05818', bg: 'rgba(192,88,24,0.12)'  },
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export function render() {
  const upcoming = EVENTS.filter(e => e.date >= new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()));

  return /* html */`
    <section class="seasons-view">
      ${pageHero({
        title: 'Seasons',
        subtitle: 'Upcoming services, gatherings, and ministry events — all in one place.',
        scripture: 'To everything there is a season, and a time for every purpose under heaven. — Ecclesiastes 3:1',
      })}

      <div class="seasons-layout">
        <!-- Left: upcoming list -->
        <div class="seasons-list-col">
          <div class="seasons-list-header">
            <h2 class="seasons-list-title">Upcoming Events</h2>
            <button class="flock-btn flock-btn--primary seasons-add-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
              New Event
            </button>
          </div>

          <div class="seasons-list">
            ${upcoming.map(_eventCard).join('')}
          </div>
        </div>

        <!-- Right: mini calendar -->
        <div class="seasons-calendar-col">
          ${_miniCalendar(2026, 3)}
          ${_miniCalendar(2026, 4)}
        </div>
      </div>
    </section>
  `;
}

export function mount(root) {
  // Type filter chips
  root.querySelectorAll('[data-type-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.typeFilter;
      root.querySelectorAll('.seasons-card').forEach((card) => {
        card.style.display = (!type || card.dataset.type === type) ? '' : 'none';
      });
    });
  });
  return () => {};
}

// ── Builders ─────────────────────────────────────────────────────────────────
function _eventCard(ev) {
  const meta  = TYPE_META[ev.type] || TYPE_META.service;
  const isToday = _sameDay(ev.date, TODAY);
  const dStr  = _fmtDate(ev.date, isToday);
  const rsvpStr = ev.rsvp > 0 ? `<span class="seasons-rsvp">${ev.rsvp} attending</span>` : '';

  return /* html */`
    <article class="seasons-card${isToday ? ' is-today' : ''}" data-type="${_e(ev.type)}" tabindex="0">
      <div class="seasons-card-date">
        <div class="seasons-card-day">${ev.date.getDate()}</div>
        <div class="seasons-card-mon">${MONTHS[ev.date.getMonth()].slice(0,3).toUpperCase()}</div>
      </div>
      <div class="seasons-card-body">
        <div class="seasons-card-title">${_e(ev.title)}</div>
        <div class="seasons-card-meta">
          <span class="seasons-type-badge" style="color:${meta.color}; background:${meta.bg}">${meta.label}</span>
          <span class="seasons-time">${_e(ev.time)}</span>
          <span class="seasons-loc">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            ${_e(ev.loc)}
          </span>
          ${rsvpStr}
        </div>
      </div>
      ${isToday ? '<div class="seasons-today-dot"></div>' : ''}
    </article>
  `;
}

function _miniCalendar(year, month) {
  const label     = `${MONTHS[month]} ${year}`;
  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMo  = new Date(year, month + 1, 0).getDate();
  const eventDays = new Set(EVENTS.filter(e => e.date.getFullYear() === year && e.date.getMonth() === month).map(e => e.date.getDate()));

  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += '<div class="cal-empty"></div>';
  for (let d = 1; d <= daysInMo; d++) {
    const isToday = year === TODAY.getFullYear() && month === TODAY.getMonth() && d === TODAY.getDate();
    const hasEv   = eventDays.has(d);
    cells += `<div class="cal-day${isToday ? ' cal-today' : ''}${hasEv ? ' cal-has-event' : ''}">${d}</div>`;
  }

  return /* html */`
    <div class="mini-cal">
      <div class="mini-cal-header">${label}</div>
      <div class="mini-cal-grid">
        ${DAYS.map(d => `<div class="cal-label">${d}</div>`).join('')}
        ${cells}
      </div>
    </div>
  `;
}

function _sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function _fmtDate(d) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
