/* ══════════════════════════════════════════════════════════════════════════════
   THE WORD — Today's devotional, on the home dashboard
   "In the beginning was the Word, and the Word was with God,
    and the Word was God." — John 1:1

   Compact card. Shows today's reflection (title, theme, scripture, opening
   line) and links into the full Upper Room view. Uses the same Manna cache
   key as the_devotional.js so they share fetched data.
   ══════════════════════════════════════════════════════════════════════════════ */

import { draw, swr } from '../../Scripts/the_manna.js';

const KEY = 'upperRoom:devotionals';      // shared with the_upper_room/the_devotional.js
const TTL = 30 * 60_000;

export function mountTodayWord(host, ctx) {
  if (!host) return () => {};
  let cancelled = false;

  const render = (rows) => {
    if (cancelled || !host.isConnected) return;
    const list = Array.isArray(rows) ? rows : [];
    if (!list.length) {
      host.innerHTML = `
        <div class="devo-dark-card word-card--empty">
          <div class="word-body">
            <div class="word-eyebrow devo-dark-eyebrow">Today's Word</div>
            <div class="word-title devo-dark-title">Open the Word together</div>
            <p class="word-tease devo-dark-tease">When your church publishes a devotional it will appear here each morning.</p>
            <button type="button" class="flock-btn flock-btn--ghost devo-dark-btn" data-word-jump>Visit The Upper Room →</button>
          </div>
        </div>`;
      _wireJump(host, ctx);
      return;
    }
    const today = _today();
    const devo  = list.find(d => _date(d) === today)
               || list.slice().sort((a, b) => (_date(b) || '').localeCompare(_date(a) || ''))[0];

    const title = devo.title || devo.Title || 'Today\'s Reflection';
    const theme = devo.theme || devo.Theme || '';
    const scrip = devo.scripture || devo.Scripture || '';
    const refl  = (devo.reflection || devo.Reflection || '').toString();
    // Plain-text first ~180 chars as the tease.
    const tease = refl.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);

    host.innerHTML = `
      <div class="devo-dark-card">
        <div class="word-body">
          <div class="word-eyebrow devo-dark-eyebrow">
            <span>Today's Word</span>
            ${theme ? `<span class="word-theme devo-dark-theme">${_e(theme)}</span>` : ''}
          </div>
          <div class="word-title devo-dark-title">${_e(title)}</div>
          ${scrip ? `<div class="word-scrip devo-dark-scrip">${_e(scrip)}</div>` : ''}
          ${tease ? `<p class="word-tease devo-dark-tease">${_e(tease)}${refl.length > 200 ? '…' : ''}</p>` : ''}
          <button type="button" class="flock-btn flock-btn--ghost devo-dark-btn" data-word-jump>Read &amp; reflect →</button>
        </div>
      </div>`;
    _wireJump(host, ctx);
  };

  const cached = swr(KEY, _fetch, render, { ttl: TTL });
  if (cached !== undefined) {
    render(cached);
  } else {
    draw(KEY, _fetch, { ttl: TTL })
      .then(render)
      .catch(() => {
        if (!cancelled && host.isConnected) {
          host.innerHTML = `<div class="empty-soft">Devotional unavailable right now.</div>`;
        }
      });
  }

  return () => { cancelled = true; };
}

function _wireJump(host, ctx) {
  host.querySelectorAll('[data-word-jump]').forEach((btn) => {
    btn.addEventListener('click', () => ctx && ctx.go && ctx.go('the_upper_room'));
  });
  // Whole card is clickable too.
  const card = host.querySelector('.word-card');
  if (card) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return; // let button handler run
      if (ctx && ctx.go) ctx.go('the_upper_room');
    });
  }
}

async function _fetch() {
  const UR = window.UpperRoom;
  if (UR && UR.isReady && UR.isReady() && typeof UR.listAppContent === 'function') {
    try {
      const fsRows = await UR.listAppContent('devotionals', { skipDateFilter: true });
      if (Array.isArray(fsRows) && fsRows.length) return fsRows;
    } catch (_) { /* fall through */ }
  }
  const V = window.TheVine;
  if (V && V.app && typeof V.app.devotionals === 'function') {
    try {
      const res  = await V.app.devotionals();
      return Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
    } catch (_) {}
  }
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

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
