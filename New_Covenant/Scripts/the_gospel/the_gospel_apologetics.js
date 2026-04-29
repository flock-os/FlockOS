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
    console.warn('[gospel/apologetics] live backend failed, will try static bundle:', e.message);
  }
  _state.rows = rows(res);

  // ── Fallback: static bundle (New_Covenant/Data/apologetics.js) ─────────
  if (!_state.rows.length) {
    try {
      const mod = await import('../../Data/apologetics.js');
      _state.rows = mod.default || [];
    } catch (e) {
      console.error('[gospel/apologetics] static bundle failed:', e);
    }
  }

  if (!_state.rows.length) {
    if (!U && !V) { list.innerHTML = backendOffline('Apologetics not loaded.'); return; }
    list.innerHTML = emptyState({ icon: '⚖️', title: 'No apologetics yet' });
    return;
  }

  // Group by category (handle both bundle and live shapes)
  const groups = {};
  _state.rows.forEach((q) => {
    const k = q['Category Title'] || q.categoryTitle || q.category || 'General';
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
  const title  = q['Question Title']  || q.questionTitle || q.question || '';
  const answer = q['Answer Content']  || q.answerContent || '';
  const quote  = q['Quote Text']      || q.quoteText     || '';
  const refTxt = q['Reference Text']  || q.referenceText || '';
  return /* html */`
    <article class="grow-card grow-card--apo">
      <h3 class="grow-card-title">${esc(title)}</h3>
      ${answer ? `<p class="grow-card-desc">${esc(snip(answer, 700))}</p>` : ''}
      ${quote ? `<blockquote class="grow-quote">${esc(quote)}${refTxt ? ` <cite>— ${esc(refTxt)}</cite>` : ''}</blockquote>` : ''}
    </article>
  `;
}
