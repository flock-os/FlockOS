/* ══════════════════════════════════════════════════════════════════════════════
   THE READING — Daily reading plan (through the Bible in a year)
   "Thy word have I hid in mine heart, that I might not sin against thee."
   — Psalm 119:11

   Loads the 365-row reading plan from UpperRoom (Firestore) with TheVine
   fallback. Today's row is featured at the top; the rest is a paginated
   table. A small navigator lets the reader scrub forward / backward.
   ══════════════════════════════════════════════════════════════════════════════ */

import { draw, swr } from '../../Scripts/the_manna.js';
import { buildAdapter } from '../../Scripts/the_living_water_adapter.js';
const TTL = 60 * 60_000; // 1 hour — reading plan rarely changes

export function mountReading(host /*, ctx */) {
  if (!host) return () => {};
  let cancelled = false;
  let _rows     = [];
  let _cursor   = _todayDoy();

  const render = (rows) => {
    if (cancelled || !host.isConnected) return;
    _rows = Array.isArray(rows) ? rows : [];
    if (!_rows.length) {
      host.innerHTML = `<div class="ur-empty">No reading plan is available yet.</div>`;
      return;
    }
    host.innerHTML = `
      <article class="ur-read-hero" data-ur-read-hero></article>
      <div class="ur-read-controls">
        <button type="button" class="flock-btn flock-btn--ghost" data-ur-read-prev>← Yesterday</button>
        <button type="button" class="flock-btn flock-btn--ghost" data-ur-read-today>Today</button>
        <button type="button" class="flock-btn flock-btn--ghost" data-ur-read-next>Tomorrow →</button>
      </div>
      <div class="ur-section-title">The Year at a Glance</div>
      <div class="ur-read-table" data-ur-read-table></div>
    `;
    host.querySelector('[data-ur-read-prev]').addEventListener('click', () => _move(-1));
    host.querySelector('[data-ur-read-next]').addEventListener('click', () => _move(+1));
    host.querySelector('[data-ur-read-today]').addEventListener('click', () => { _cursor = _todayDoy(); _paint(); });
    _paint();
  };

  const _move = (delta) => {
    _cursor = Math.max(1, Math.min(_rows.length, _cursor + delta));
    _paint();
  };

  const _paint = () => {
    const heroEl  = host.querySelector('[data-ur-read-hero]');
    const tableEl = host.querySelector('[data-ur-read-table]');
    if (heroEl)  heroEl.innerHTML  = _heroCard(_rows[_cursor - 1], _cursor);
    if (tableEl) tableEl.innerHTML = _table(_rows, _cursor);

    // Click any table row to jump.
    tableEl.querySelectorAll('[data-ur-day]').forEach((el) => {
      el.addEventListener('click', () => {
        _cursor = +el.dataset.urDay;
        _paint();
        host.querySelector('[data-ur-read-hero]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
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
          host.innerHTML = `<div class="ur-empty">Reading plan is unavailable right now.</div>`;
        }
      });
  }

  return () => { cancelled = true; };
}

/* ── Data ─────────────────────────────────────────────────────────────────── */

async function _fetch() {
  const UR = window.UpperRoom;
  if (UR && UR.isReady && UR.isReady() && typeof UR.listAppContent === 'function') {
    try {
      const fsRows = await UR.listAppContent('reading', { skipDateFilter: true });
      if (Array.isArray(fsRows) && fsRows.length) return _normalise(fsRows);
    } catch (_) { /* fall through */ }
  }
  const V = window.TheVine;
  const MX = buildAdapter('app.reading', V);
  try {
    const res = await MX.list();
    const rows = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
    return _normalise(rows);
  } catch (_) {}
  return [];
}

function _normalise(rows) {
  return rows.map((r, i) => ({
    day:        r.day || r.Day || (i + 1),
    ot:         r.ot || r.OT || r['Old Testament'] || r.oldTestament || '',
    nt:         r.nt || r.NT || r['New Testament'] || r.newTestament || '',
    psalms:     r.psalms || r.Psalms || '',
    proverbs:   r.proverbs || r.Proverbs || '',
  })).sort((a, b) => (a.day || 0) - (b.day || 0));
}

/* ── Render ───────────────────────────────────────────────────────────────── */

function _heroCard(row, day) {
  if (!row) return `<div class="ur-empty">Day ${day} has no reading on file.</div>`;
  const date = _dateForDoy(day);
  return `
    <div class="ur-read-day">
      <span class="ur-read-day-num">Day ${day}</span>
      <span class="ur-read-day-date">${_e(date)}</span>
    </div>
    <div class="ur-read-grid">
      ${_passage('Old Testament', row.ot,        '#7c3aed')}
      ${_passage('New Testament', row.nt,        '#0ea5e9')}
      ${_passage('Psalms',         row.psalms,    '#059669')}
      ${_passage('Proverbs',       row.proverbs,  '#d97706')}
    </div>
  `;
}

function _passage(label, ref, color) {
  if (!ref) return '';
  return `
    <div class="ur-passage" style="--ur-accent:${color}">
      <div class="ur-passage-label">${_e(label)}</div>
      <div class="ur-passage-ref">${_e(ref)}</div>
    </div>`;
}

function _table(rows, cursor) {
  // Show a window of 14 rows centred around the cursor.
  const start = Math.max(1, Math.min(rows.length - 13, cursor - 6));
  const slice = rows.slice(start - 1, start - 1 + 14);
  return `
    <table class="ur-read-tbl">
      <thead>
        <tr><th>Day</th><th>Old Testament</th><th>New Testament</th><th>Psalms</th><th>Proverbs</th></tr>
      </thead>
      <tbody>
        ${slice.map(r => `
          <tr class="${r.day === cursor ? 'is-active' : ''}" data-ur-day="${r.day}">
            <td>${r.day}</td>
            <td>${_e(r.ot)}</td>
            <td>${_e(r.nt)}</td>
            <td>${_e(r.psalms)}</td>
            <td>${_e(r.proverbs)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function _todayDoy() {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = (d - start) + ((start.getTimezoneOffset() - d.getTimezoneOffset()) * 60_000);
  return Math.max(1, Math.min(365, Math.floor(diff / 86_400_000)));
}

function _dateForDoy(doy) {
  const d = new Date(new Date().getFullYear(), 0, 1);
  d.setDate(d.getDate() + (doy - 1));
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
