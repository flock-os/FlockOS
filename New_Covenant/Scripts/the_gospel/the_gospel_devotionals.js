/* ══════════════════════════════════════════════════════════════════════════════
   THE GOSPEL · DEVOTIONALS — Daily devotions to feed the soul.
   "Man shall not live by bread alone, but by every word from God." — Matthew 4:4
   ══════════════════════════════════════════════════════════════════════════════ */

import { ur, vine, rows, esc, snip, fmtDate, emptyState, backendOffline, loadingCards, chip } from './the_gospel_shared.js';

export const name        = 'the_gospel_devotionals';
export const title       = 'Devotionals';
export const description = 'Daily devotions — a passage of scripture, a reflection, a prayer. Feed the soul before the rush.';
export const icon        = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v3M5.6 5.6l2.1 2.1M2 12h3M5.6 18.4l2.1-2.1M12 22v-3M18.4 18.4l-2.1-2.1M22 12h-3M18.4 5.6l-2.1 2.1"/><circle cx="12" cy="12" r="3.5"/></svg>`;
export const accent      = '#e8a838';

let _state = { rows: [] };

export function render() {
  return /* html */`
    <section class="grow-page" data-grow="devotionals">
      <header class="grow-hero" style="--grow-accent:${accent}">
        <div class="grow-hero-icon">${icon}</div>
        <div class="grow-hero-text">
          <h1 class="grow-hero-title">${title}</h1>
          <p class="grow-hero-sub">${esc(description)}</p>
        </div>
      </header>

      <div class="grow-list" data-bind="list">${loadingCards(3)}</div>
    </section>
  `;
}

export function mount(root) {
  _load(root.querySelector('[data-bind="list"]'));
  return () => {};
}

async function _load(list) {
  const U = ur(); const V = vine();
  let res = null;
  try {
    if (U && typeof U.listAppContent === 'function')      res = await U.listAppContent('devotionals');
    else if (V && V.app && V.app.devotionals)             res = await V.app.devotionals();
  } catch (e) {
    console.error('[gospel/devotionals] load:', e);
    list.innerHTML = emptyState({ icon: '⚠️', title: 'Could not load devotionals', body: e.message || String(e) });
    return;
  }
  if (!U && !V) { list.innerHTML = backendOffline('Devotionals not loaded.'); return; }
  _state.rows = rows(res);
  if (!_state.rows.length) { list.innerHTML = emptyState({ icon: '🌅', title: 'No devotionals yet' }); return; }
  list.innerHTML = _state.rows.map(_card).join('');
}

function _card(d) {
  const date = fmtDate(d.Date || d.date);
  return /* html */`
    <details class="grow-devo">
      <summary class="grow-devo-head">
        <div class="grow-devo-meta">${date ? chip(date, 'neutral') : ''}${d.Theme ? chip(d.Theme, 'topic') : ''}</div>
        <h3 class="grow-devo-title">${esc(d.Title || d.title || 'Devotional')}</h3>
        ${d.Scripture ? `<p class="grow-devo-scripture">${esc(d.Scripture)}</p>` : ''}
      </summary>
      <div class="grow-devo-body">
        ${d.Reflection ? `<p>${esc(snip(d.Reflection, 1200))}</p>` : ''}
        ${d.Question   ? `<blockquote class="grow-quote">${esc(d.Question)}</blockquote>` : ''}
        ${d.Prayer     ? `<p class="grow-prayer"><em>${esc(d.Prayer)}</em></p>` : ''}
      </div>
    </details>
  `;
}
