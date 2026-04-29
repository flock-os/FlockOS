/* ══════════════════════════════════════════════════════════════════════════════
   THE DEVOTIONAL — Today's reflection
   "Sanctify them through thy truth: thy word is truth." — John 17:17

   Pulls today's devotional from UpperRoom (Firestore) with TheVine fallback,
   renders Scripture / Reflection / Question / Prayer cards, and offers a
   "Save to Journal" capture so the reader can respond in writing.

   Also lists recent devotionals — up to the 30 most recent entries dated on
   or before yesterday — for quick re-reading.
   ══════════════════════════════════════════════════════════════════════════════ */

import { draw, swr } from '../../Scripts/the_manna.js';
import { buildAdapter } from '../../Scripts/the_living_water_adapter.js';
const TTL = 30 * 60_000; // 30 min — devotionals change once a day
const KEY = 'upperRoom:devotionals';

export function mountDevotional(host, ctx) {
  if (!host) return () => {};
  let cancelled = false;

  const render = (rows) => {
    if (cancelled || !host.isConnected) return;
    const list = Array.isArray(rows) ? rows : [];
    if (!list.length) {
      host.innerHTML = `<div class="ur-empty">No devotionals are available yet. Ask your pastor to publish today's reflection.</div>`;
      return;
    }
    const today = _today();
    const yesterday = _shiftDays(today, -1);
    const todayDevo = list.find(d => _date(d) === today)
                  || list.slice().sort((a, b) => (_date(b) || '').localeCompare(_date(a) || ''))[0];
    // Recent = up to the 30 most recent devotionals dated on or before yesterday.
    const recent    = list
      .filter(d => {
        const dt = _date(d);
        return dt && dt <= yesterday;
      })
      .sort((a, b) => (_date(b) || '').localeCompare(_date(a) || ''))
      .slice(0, 30);

    host.innerHTML = `
      <article class="ur-devo-card">
        ${_devotionalCard(todayDevo)}
      </article>
      <div class="ur-section-title">Recent Devotionals</div>
      <ul class="ur-recent-list">
        ${recent.length
          ? recent.map(_recentRow).join('')
          : `<li class="ur-empty-soft">No previous entries.</li>`}
      </ul>
    `;

    // Click a recent row → swap the hero card.
    host.querySelectorAll('[data-ur-recent]').forEach((row) => {
      row.addEventListener('click', () => {
        const id = row.dataset.urRecent;
        const sel = list.find(d => String(d.id || d.Date || d.date) === id);
        if (sel) {
          host.querySelector('.ur-devo-card').innerHTML = _devotionalCard(sel);
          _wireSave(host, ctx, sel);
          host.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
    _wireSave(host, ctx, todayDevo);
  };

  const cached = swr(KEY, _fetch, render, { ttl: TTL });
  if (cached !== undefined) {
    render(cached);
  } else {
    draw(KEY, _fetch, { ttl: TTL })
      .then(render)
      .catch(() => {
        if (!cancelled && host.isConnected) {
          host.innerHTML = `<div class="ur-empty">Devotionals are unavailable right now. Try again in a moment.</div>`;
        }
      });
  }

  return () => { cancelled = true; };
}

/* ── Data ─────────────────────────────────────────────────────────────────── */

async function _fetch() {
  // 1. Static bundle (regenerated from Firestore via export_devotionals_to_js.py).
  try {
    const mod = await import('../../Data/devotionals.js');
    const rows = mod.default || [];
    if (Array.isArray(rows) && rows.length) return rows;
  } catch (_) { /* fall through */ }
  // 2. Firestore fallback (only if bundle missing/empty).
  const UR = window.UpperRoom;
  if (UR && UR.isReady && UR.isReady() && typeof UR.listAppContent === 'function') {
    try {
      const fsRows = await UR.listAppContent('devotionals', { skipDateFilter: true });
      if (Array.isArray(fsRows) && fsRows.length) return fsRows;
    } catch (_) { /* fall through */ }
  }
  // 3. GAS fallback.
  const V = window.TheVine;
  const MX = buildAdapter('app.devotionals', V);
  try {
    const res  = await MX.list();
    const rows = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
    return rows;
  } catch (_) { /* fall through */ }
  return [];
}

function _date(d) {
  if (!d) return '';
  const raw = d.date || d.Date || '';
  return String(raw).slice(0, 10);
}

function _today() {
  const d = new Date();
  const p = (n) => (n < 10 ? '0' + n : '' + n);
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function _shiftDays(ymd, delta) {
  const [y, m, d] = String(ymd).split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, (d || 1));
  dt.setDate(dt.getDate() + delta);
  const p = (n) => (n < 10 ? '0' + n : '' + n);
  return dt.getFullYear() + '-' + p(dt.getMonth() + 1) + '-' + p(dt.getDate());
}

/* ── Render ───────────────────────────────────────────────────────────────── */

function _devotionalCard(d) {
  if (!d) return `<div class="ur-empty">No devotional selected.</div>`;
  const date  = _date(d);
  const pretty = _pretty(date);
  const title = d.title || d.Title || 'Today\'s Reflection';
  const theme = d.theme || d.Theme || '';
  const scrip = d.scripture || d.Scripture || '';
  const refl  = d.reflection || d.Reflection || '';
  const ques  = d.question || d.Question || '';
  const pray  = d.prayer || d.Prayer || '';

  return `
    <header class="ur-devo-head">
      <div class="ur-devo-meta">
        <span class="ur-devo-date">${_e(pretty)}</span>
        ${theme ? `<span class="ur-devo-theme">${_e(theme)}</span>` : ''}
      </div>
      <h2 class="ur-devo-title">${_e(title)}</h2>
    </header>
    ${scrip ? `<blockquote class="ur-devo-scripture">${_e(scrip)}</blockquote>` : ''}
    ${refl  ? `<div class="ur-devo-body">${_safeHtml(refl)}</div>` : ''}
    <div class="ur-devo-blocks">
      ${ques ? `
        <section class="ur-devo-block ur-devo-question">
          <h4>Reflect</h4>
          <p>${_safeHtml(ques)}</p>
        </section>` : ''}
      ${pray ? `
        <section class="ur-devo-block ur-devo-prayer">
          <h4>Pray</h4>
          <p>${_safeHtml(pray)}</p>
        </section>` : ''}
    </div>
    <footer class="ur-devo-foot">
      <button type="button" class="flock-btn flock-btn--primary" data-ur-save>
        ✍️ Save to Journal
      </button>
      <span class="ur-save-status" data-ur-save-status></span>
    </footer>
  `;
}

function _recentRow(d) {
  const date  = _date(d);
  const id    = String(d.id || d.Date || d.date || date);
  const title = d.title || d.Title || 'Reflection';
  const theme = d.theme || d.Theme || '';
  return `
    <li>
      <button type="button" class="ur-recent-row" data-ur-recent="${_e(id)}">
        <span class="ur-recent-date">${_e(_pretty(date))}</span>
        <span class="ur-recent-title">${_e(title)}</span>
        ${theme ? `<span class="ur-recent-theme">${_e(theme)}</span>` : ''}
      </button>
    </li>`;
}

function _wireSave(host, ctx, devo) {
  const btn = host.querySelector('[data-ur-save]');
  const status = host.querySelector('[data-ur-save-status]');
  if (!btn || !devo) return;
  btn.addEventListener('click', async () => {
    const UR = window.UpperRoom;
    if (!UR || typeof UR.createJournal !== 'function') {
      status.textContent = 'Journal unavailable.';
      return;
    }
    btn.disabled = true; status.textContent = 'Saving…';
    try {
      await UR.createJournal({
        title: (devo.title || 'Devotional reflection') + ' — ' + _pretty(_date(devo)),
        entry: '',
        category: 'Devotional',
        scripture: devo.scripture || devo.Scripture || '',
        private: true,
      });
      status.textContent = 'Saved to your journal.';
      btn.textContent = '✔ Saved';
    } catch (e) {
      btn.disabled = false;
      status.textContent = 'Could not save — please try again.';
    }
  }, { once: true });
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function _pretty(ymd) {
  if (!ymd) return '';
  const d = new Date(ymd + 'T00:00:00');
  if (isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Allow a tiny safe HTML subset (paragraphs, line breaks, italics, bold).
function _safeHtml(s) {
  const txt = String(s ?? '');
  // Strip script/style tags & on* attrs first.
  const cleaned = txt
    .replace(/<\/?(script|style|iframe|object|embed)[^>]*>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '');
  return cleaned;
}
