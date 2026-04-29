/* ══════════════════════════════════════════════════════════════════════════════
   THE TODAY — Today's events on the home page
   "This is the day which the LORD hath made; we will rejoice and be glad."
   — Psalm 118:24

   Pulls UpperRoom.listEvents() (Firestore — fast), filters by today's date,
   shows up to 4 with start time and location. Click → jump to the_seasons.
   ══════════════════════════════════════════════════════════════════════════════ */

import { draw, swr } from '../../Scripts/the_manna.js';

const TTL = 5 * 60_000; // 5 min cache — events change occasionally
const KEY = 'shepherd:today-events';

export function mountTodayEvents(host, ctx) {
  if (!host) return () => {};
  let cancelled = false;

  const render = (raw) => {
    if (cancelled || !host.isConnected) return;
    const rows = _filterToday(raw);
    if (!rows.length) {
      host.innerHTML = `<div class="empty-soft">Today is open — a quiet pasture.</div>`;
      return;
    }
    host.innerHTML = rows.map(_row).join('');
    host.querySelectorAll('[data-jump]').forEach((el) => {
      el.addEventListener('click', () => ctx.go && ctx.go('the_seasons'));
    });
  };

  const cached = swr(KEY, _fetch, render, { ttl: TTL });
  if (cached !== undefined) {
    render(cached);
  } else {
    draw(KEY, _fetch, { ttl: TTL })
      .then(render)
      .catch(() => {
        if (!cancelled && host.isConnected) {
          host.innerHTML = `<div class="empty-soft">Calendar unavailable right now.</div>`;
        }
      });
  }

  return () => { cancelled = true; };
}

async function _fetch() {
  const UR = window.UpperRoom;
  if (!UR || !UR.isReady || !UR.isReady() || !UR.listEvents) return [];
  const res = await UR.listEvents({ limit: 80 });
  return Array.isArray(res) ? res : (res?.results ?? []);
}

function _filterToday(events) {
  const today = new Date().toISOString().slice(0, 10);
  return (events || [])
    .filter(e => {
      const sd = e.startDate || '';
      const ed = e.endDate || sd;
      return sd <= today && ed >= today && e.status !== 'Cancelled';
    })
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
    .slice(0, 4);
}

function _row(ev) {
  const title    = ev.title || 'Untitled event';
  const location = ev.location || '';
  const time     = _fmtTime(ev.startTime);
  return `
    <button type="button" data-jump class="today-row">
      <div class="today-time">${_e(time || 'All day')}</div>
      <div class="today-body">
        <div class="today-title">${_e(title)}</div>
        ${location ? `<div class="today-loc">${_e(location)}</div>` : ''}
      </div>
    </button>`;
}

function _fmtTime(t) {
  if (!t) return '';
  // HH:MM (24h) → 12h with am/pm
  const m = String(t).match(/^(\d{1,2}):(\d{2})/);
  if (!m) return t;
  let h = +m[1]; const mins = m[2];
  const ap = h >= 12 ? 'pm' : 'am';
  h = h % 12; if (h === 0) h = 12;
  return mins === '00' ? `${h}${ap}` : `${h}:${mins}${ap}`;
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
