/* ══════════════════════════════════════════════════════════════════════════════
   THE GOSPEL · APOLOGETICS — Reasons for the hope that is in you.
   "Always be prepared to give an answer to everyone who asks you to give the
    reason for the hope that you have." — 1 Peter 3:15
   ══════════════════════════════════════════════════════════════════════════════ */

import { ur, vine, rows, esc, snip, emptyState, backendOffline, loadingCards, chip } from './the_gospel_shared.js';

export const name        = 'the_gospel_apologetics';
export const title       = 'Apologetics';
export const description = 'Common objections to the faith — answered with scripture, reason, and a steady tone.';
export const icon        = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M3 7l9 3 9-3"/><path d="M3 17l9-3 9 3"/></svg>`;
export const accent      = '#475569';

let _state = { rows: [] };

export function render() {
  return /* html */`
    <section class="grow-page" data-grow="apologetics">
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
    if (U && typeof U.listAppContent === 'function')        res = await U.listAppContent('apologetics');
    else if (V && V.app && V.app.apologetics)               res = await V.app.apologetics();
  } catch (e) {
    console.error('[gospel/apologetics] load:', e);
    list.innerHTML = emptyState({ icon: '⚠️', title: 'Could not load apologetics', body: e.message || String(e) });
    return;
  }
  if (!U && !V) { list.innerHTML = backendOffline('Apologetics not loaded.'); return; }
  _state.rows = rows(res);
  if (!_state.rows.length) { list.innerHTML = emptyState({ icon: '⚖️', title: 'No apologetics yet' }); return; }

  // Group by category
  const groups = {};
  _state.rows.forEach((q) => {
    const k = q['Category Title'] || q.category || 'General';
    (groups[k] = groups[k] || []).push(q);
  });
  list.innerHTML = Object.entries(groups).map(([cat, items]) => /* html */`
    <details class="grow-apo-group" open>
      <summary class="grow-apo-cat">${esc(cat)} <span class="grow-apo-count">${items.length}</span></summary>
      <div class="grow-list">${items.map(_card).join('')}</div>
    </details>
  `).join('');
}

function _card(q) {
  return /* html */`
    <article class="grow-card grow-card--apo">
      <h3 class="grow-card-title">${esc(q['Question Title'] || q.question || '')}</h3>
      ${q['Answer Content'] ? `<p class="grow-card-desc">${esc(snip(q['Answer Content'], 700))}</p>` : ''}
      ${q['Quote Text'] ? `<blockquote class="grow-quote">${esc(q['Quote Text'])}${q['Reference Text'] ? ` <cite>— ${esc(q['Reference Text'])}</cite>` : ''}</blockquote>` : ''}
    </article>
  `;
}
