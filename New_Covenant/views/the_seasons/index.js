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
const EVENT_TYPES = ['service','prayer','ministry','outreach','admin','special','training','other'];

let _activeSeasonSheet = null;
let _liveEventsMap     = {};

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
  // Type filter chips (for both demo and live cards)
  root.querySelectorAll('[data-type-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.typeFilter;
      root.querySelectorAll('.seasons-card').forEach((card) => {
        card.style.display = (!type || card.dataset.type === type) ? '' : 'none';
      });
    });
  });

  // New Event button
  const addBtn = root.querySelector('.seasons-add-btn');
  if (addBtn) addBtn.addEventListener('click', () => _openEventSheet(null, () => _loadEvents(root)));

  _loadEvents(root);
  return () => { _closeEventSheet(); };
}

async function _loadEvents(root) {
  const V = window.TheVine;
  if (!V) return;
  const listEl = root.querySelector('.seasons-list');
  const calCol = root.querySelector('.seasons-calendar-col');
  if (!listEl) return;

  listEl.innerHTML = '<div style="padding:32px;text-align:center;color:var(--ink-muted,#7a7f96)">Loading events…</div>';
  try {
    const res  = await V.flock.events.list();
    const rows = _rows(res);
    if (!rows.length) {
      listEl.innerHTML = '<div style="padding:32px;text-align:center;color:var(--ink-muted,#7a7f96)">No upcoming events found.</div>';
      return;
    }
    const now = new Date(); now.setHours(0,0,0,0);
    const upcoming = rows
      .map((ev) => ({ ...ev, _date: new Date(ev.startDate || ev.date || ev.createdAt) }))
      .filter((ev) => ev._date >= now)
      .sort((a, b) => a._date - b._date);

    listEl.innerHTML = upcoming.length
      ? upcoming.map(_liveEventCard).join('')
      : '<div style="padding:32px;text-align:center;color:var(--ink-muted,#7a7f96)">No upcoming events.</div>';

    // Build lookup and wire card clicks
    _liveEventsMap = {};
    upcoming.forEach(ev => { if (ev.id) _liveEventsMap[String(ev.id)] = ev; });
    const reload = () => _loadEvents(root);
    listEl.querySelectorAll('.seasons-card').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        const ev = _liveEventsMap[card.dataset.id];
        if (ev) _openEventSheet(ev, reload);
      });
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); } });
    });

    // Rebuild mini-calendars from live event dates
    if (calCol) {
      const eventDates = upcoming.map((ev) => ev._date);
      const months = _uniqueMonths(eventDates, 2);
      calCol.innerHTML = months.map(([y, m]) => _miniCalendarLive(y, m, eventDates)).join('');
    }
  } catch (err) {
    console.error('[TheSeasons] events.list error:', err);
    listEl.innerHTML = '<div style="padding:32px;text-align:center;color:var(--ink-muted,#7a7f96)">Could not load events right now.</div>';
  }
}

function _rows(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.rows)) return res.rows;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

function _uniqueMonths(dates, limit = 2) {
  const seen = new Set();
  const now  = new Date();
  // Always include current month
  seen.add(`${now.getFullYear()}-${now.getMonth()}`);
  for (const d of dates) {
    seen.add(`${d.getFullYear()}-${d.getMonth()}`);
    if (seen.size >= limit) break;
  }
  return [...seen].slice(0, limit).map((k) => k.split('-').map(Number));
}

function _liveEventCard(ev) {
  const d     = ev._date;
  const title = ev.title || ev.name || 'Event';
  const type  = (ev.type || ev.category || 'service').toLowerCase();
  const time  = ev.startTime || ev.time || '';
  const loc   = ev.location  || ev.loc  || '';
  const rsvp  = ev.rsvpCount || ev.attendees || 0;
  const meta  = TYPE_META[type] || TYPE_META.service;
  const now   = new Date(); now.setHours(0,0,0,0);
  const isToday = d.toDateString() === now.toDateString();
  const rsvpStr = rsvp > 0 ? `<span class="seasons-rsvp">${rsvp} attending</span>` : '';

  return /* html */`
    <article class="seasons-card${isToday ? ' is-today' : ''}" data-type="${_e(type)}" data-id="${_e(String(ev.id || ''))}" tabindex="0">
      <div class="seasons-card-date">
        <div class="seasons-card-day">${d.getDate()}</div>
        <div class="seasons-card-mon">${MONTHS[d.getMonth()].slice(0,3).toUpperCase()}</div>
      </div>
      <div class="seasons-card-body">
        <div class="seasons-card-title">${_e(title)}</div>
        <div class="seasons-card-meta">
          <span class="seasons-type-badge" style="color:${meta.color}; background:${meta.bg}">${meta.label}</span>
          ${time ? `<span class="seasons-time">${_e(time)}</span>` : ''}
          ${loc  ? `<span class="seasons-loc"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>${_e(loc)}</span>` : ''}
          ${rsvpStr}
        </div>
      </div>
      ${isToday ? '<div class="seasons-today-dot"></div>' : ''}
    </article>`;
}

function _miniCalendarLive(year, month, eventDates) {
  const label     = `${MONTHS[month]} ${year}`;
  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMo  = new Date(year, month + 1, 0).getDate();
  const eventDaySet = new Set(
    eventDates.filter((d) => d.getFullYear() === year && d.getMonth() === month).map((d) => d.getDate())
  );
  const now = new Date();
  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += '<div class="cal-empty"></div>';
  for (let d = 1; d <= daysInMo; d++) {
    const isToday = year === now.getFullYear() && month === now.getMonth() && d === now.getDate();
    const hasEv   = eventDaySet.has(d);
    cells += `<div class="cal-day${isToday ? ' cal-today' : ''}${hasEv ? ' cal-has-event' : ''}">${d}</div>`;
  }
  return /* html */`
    <div class="mini-cal">
      <div class="mini-cal-header">${label}</div>
      <div class="mini-cal-grid">
        ${DAYS.map(d => `<div class="cal-label">${d}</div>`).join('')}
        ${cells}
      </div>
    </div>`;
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

// ── Event sheet (create / edit) ──────────────────────────────────────────────
function _closeEventSheet() {
  if (!_activeSeasonSheet) return;
  const target = _activeSeasonSheet;
  target.querySelector('.life-sheet-overlay')?.classList.remove('is-open');
  target.querySelector('.life-sheet-panel')?.classList.remove('is-open');
  setTimeout(() => { target.remove(); if (_activeSeasonSheet === target) _activeSeasonSheet = null; }, 320);
}

function _isoDate(d) {
  if (!d) return '';
  try {
    const ms = d?.seconds ? d.seconds * 1000 : +new Date(d);
    if (isNaN(ms)) return '';
    const dt = new Date(ms);
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
  } catch { return ''; }
}

function _openEventSheet(ev, onReload) {
  _closeEventSheet();
  const V      = window.TheVine;
  const isNew  = !ev;
  const uid    = ev?.id   ? String(ev.id) : '';
  const title  = ev?.title || ev?.name    || '';
  const type   = (ev?.type || ev?.category || 'service').toLowerCase();
  const loc    = ev?.location || ev?.loc  || '';
  const sDate  = _isoDate(ev?._date || ev?.startDate || ev?.date);
  const sTime  = ev?.startTime || ev?.time || '';
  const desc   = ev?.description || ev?.notes || '';
  const rsvpN  = ev?.rsvpCount || ev?.rsvp || '';

  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  sheet.innerHTML = /* html */`
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel" role="dialog" aria-label="${isNew ? 'New Event' : 'Edit Event'}">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div class="life-sheet-hd-info">
          <div class="life-sheet-hd-name">${isNew ? 'New Event' : 'Edit Event'}</div>
          <div class="life-sheet-hd-meta">${isNew ? 'Add to the calendar' : _e(title)}</div>
        </div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">
        <div class="life-sheet-field">
          <div class="life-sheet-label">Event Title <span style="color:#dc2626">*</span></div>
          <input class="life-sheet-input" data-field="title" type="text" value="${_e(title)}" placeholder="e.g. Sunday Worship Service">
        </div>
        <div class="fold-form-row">
          <div class="life-sheet-field">
            <div class="life-sheet-label">Date <span style="color:#dc2626">*</span></div>
            <input class="life-sheet-input" data-field="startDate" type="date" value="${_e(sDate)}">
          </div>
          <div class="life-sheet-field">
            <div class="life-sheet-label">Time</div>
            <input class="life-sheet-input" data-field="startTime" type="time" value="${_e(sTime)}">
          </div>
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Location</div>
          <input class="life-sheet-input" data-field="location" type="text" value="${_e(loc)}" placeholder="Main Sanctuary, Chapel, Online…">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Event Type</div>
          <select class="life-sheet-input" data-field="type">
            ${EVENT_TYPES.map(t => `<option value="${_e(t)}"${t === type ? ' selected' : ''}>${_e(t.charAt(0).toUpperCase()+t.slice(1))}</option>`).join('')}
          </select>
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Description / Notes</div>
          <textarea class="life-sheet-input" data-field="description" rows="3" style="resize:vertical">${_e(desc)}</textarea>
        </div>
        <div class="fold-form-error" data-error style="display:none;color:#dc2626;font-size:.85rem;margin-top:8px"></div>
      </div>
      <div class="life-sheet-foot">
        ${!isNew ? '<button class="flock-btn flock-btn--danger" data-delete style="margin-right:auto">Cancel Event</button>' : ''}
        <button class="flock-btn" data-cancel>Close</button>
        <button class="flock-btn flock-btn--primary" data-save>${isNew ? 'Create Event' : 'Save Changes'}</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  _activeSeasonSheet = sheet;
  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
    if (isNew) sheet.querySelector('[data-field="title"]')?.focus();
  });

  const close = () => _closeEventSheet();
  sheet.querySelector('[data-cancel]').addEventListener('click', close);
  sheet.querySelector('.life-sheet-close').addEventListener('click', close);
  sheet.querySelector('.life-sheet-overlay').addEventListener('click', close);

  // Save / Create
  sheet.querySelector('[data-save]').addEventListener('click', async () => {
    const errEl    = sheet.querySelector('[data-error]');
    const titleVal = sheet.querySelector('[data-field="title"]').value.trim();
    const dateVal  = sheet.querySelector('[data-field="startDate"]').value;
    if (!titleVal) { errEl.textContent = 'Title is required.'; errEl.style.display = ''; return; }
    if (!dateVal)  { errEl.textContent = 'Date is required.'; errEl.style.display = ''; return; }
    errEl.style.display = 'none';
    const btn = sheet.querySelector('[data-save]');
    btn.disabled = true; btn.textContent = isNew ? 'Creating…' : 'Saving…';
    const payload = {
      title:       titleVal,
      startDate:   dateVal,
      startTime:   sheet.querySelector('[data-field="startTime"]').value,
      location:    sheet.querySelector('[data-field="location"]').value.trim(),
      type:        sheet.querySelector('[data-field="type"]').value,
      description: sheet.querySelector('[data-field="description"]').value.trim(),
    };
    if (!isNew) payload.id = uid;
    try {
      if (isNew) { await V.flock.events.create(payload); }
      else       { await V.flock.events.update(payload); }
      _closeEventSheet();
      onReload?.();
    } catch (err) {
      console.error('[TheSeasons] event save error:', err);
      errEl.textContent = err?.message || 'Could not save event. Please try again.';
      errEl.style.display = '';
      btn.disabled = false; btn.textContent = isNew ? 'Create Event' : 'Save Changes';
    }
  });

  // Cancel/Delete event
  sheet.querySelector('[data-delete]')?.addEventListener('click', async () => {
    const ok = confirm(`Cancel "${title}"? This will remove it from the calendar.`);
    if (!ok) return;
    const btn = sheet.querySelector('[data-delete]');
    btn.disabled = true; btn.textContent = 'Cancelling…';
    try {
      await V.flock.events.cancel({ id: uid });
      _closeEventSheet();
      onReload?.();
    } catch (err) {
      console.error('[TheSeasons] event cancel error:', err);
      btn.disabled = false; btn.textContent = 'Cancel Event';
    }
  });
}
