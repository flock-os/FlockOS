/* ══════════════════════════════════════════════════════════════════════════════
   THE GOSPEL · COUNSELING — Biblical counsel for ordinary trials.
   "Cast all your anxiety on him, because he cares for you." — 1 Peter 5:7
   ══════════════════════════════════════════════════════════════════════════════ */

import { ur, vine, rows, esc, snip, emptyState, backendOffline, loadingCards, chip } from './the_gospel_shared.js';

export const name        = 'the_gospel_counseling';
export const title       = 'Counseling';
export const description = 'Biblical counsel for the trials we all face — anxiety, grief, marriage, addiction, parenting, and more.';
export const icon        = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.6a5.5 5.5 0 0 0-7.78 0L12 5.66l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21l8.84-8.62a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
export const accent      = '#16a34a';

let _state = { rows: [], openId: null };

export function render() {
  return /* html */`
    <section class="grow-page" data-grow="counseling">
      <header class="grow-hero" style="--grow-accent:${accent}">
        <div class="grow-hero-icon">${icon}</div>
        <div class="grow-hero-text">
          <h1 class="grow-hero-title">${title}</h1>
          <p class="grow-hero-sub">${esc(description)}</p>
        </div>
      </header>

      <div class="grow-grid grow-grid--counseling" data-bind="grid">${loadingCards(6)}</div>
      <div class="grow-detail" data-bind="detail" hidden></div>
    </section>
  `;
}

export function mount(root) {
  _load(root);
  return () => {};
}

async function _load(root) {
  const grid = root.querySelector('[data-bind="grid"]');
  const U = ur(); const V = vine();
  try {
    let res = null;
    if (U && typeof U.getAppContent === 'function') {
      const cat = await U.getAppContent('counseling', '_catalog').catch(() => null);
      if (cat && cat.topics) res = { rows: cat.topics };
      else res = await U.listAppContent('counseling');
    } else if (V && V.app && V.app.counseling) {
      res = await V.app.counseling();
    } else {
      grid.innerHTML = backendOffline('Counseling library not loaded.'); return;
    }
    _state.rows = rows(res);
  } catch (e) {
    console.error('[gospel/counseling] load:', e);
    grid.innerHTML = emptyState({ icon: '⚠️', title: 'Could not load counseling', body: e.message || String(e) });
    return;
  }
  if (!_state.rows.length) { grid.innerHTML = emptyState({ icon: '💚', title: 'No topics yet' }); return; }
  grid.innerHTML = _state.rows.map(_card).join('');
  grid.querySelectorAll('[data-id]').forEach((el) => el.addEventListener('click', () => _open(root, el.getAttribute('data-id'))));
}

function _card(t) {
  const color = t.Color || t.color || accent;
  const ico   = t.Icon  || t.icon  || '🌿';
  return /* html */`
    <button class="grow-card grow-card--counsel" data-id="${esc(t.id || t.Title || '')}" style="--grow-accent:${esc(color)}">
      <div class="grow-counsel-icon" aria-hidden="true">${esc(ico)}</div>
      <h3 class="grow-card-title">${esc(t.Title || t.title || 'Topic')}</h3>
      ${t.Subtitle || t.subtitle ? `<p class="grow-card-desc">${esc(snip(t.Subtitle || t.subtitle, 120))}</p>` : ''}
    </button>
  `;
}

async function _open(root, id) {
  const det = root.querySelector('[data-bind="detail"]');
  det.hidden = false;
  det.innerHTML = `<p class="grow-muted">Loading…</p>`;
  const U = ur();
  let full = _state.rows.find((t) => (t.id || t.Title) === id);
  try {
    if (U && typeof U.getAppContent === 'function') {
      const r = await U.getAppContent('counseling', id);
      if (r) full = { ...full, ...r };
    }
  } catch (_) {}
  if (!full) { det.innerHTML = `<p class="grow-muted">Topic not found.</p>`; return; }
  det.innerHTML = /* html */`
    <div class="grow-detail-hd">
      <h2 class="grow-detail-title">${esc(full.Title || full.title || '')}</h2>
      <button class="grow-btn grow-btn--ghost" data-close>Close</button>
    </div>
    ${full.References ? `<p class="grow-muted">${esc(full.References)}</p>` : ''}
    <div class="grow-detail-body">${full.Content ? esc(snip(full.Content, 4000)) : '<p class="grow-muted">No content yet.</p>'}</div>
  `;
  det.querySelector('[data-close]').addEventListener('click', () => { det.hidden = true; det.innerHTML = ''; });
  det.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
