/* ══════════════════════════════════════════════════════════════════════════════
   THE GOSPEL · GENEALOGY — Faces and families of the redemption story.
   "These are the generations…" — Genesis 5:1
   ══════════════════════════════════════════════════════════════════════════════ */

import { vine, rows, esc, snip, emptyState, backendOffline, loadingCards, chip } from './the_gospel_shared.js';

export const name        = 'the_gospel_genealogy';
export const title       = 'Genealogy';
export const description = 'Faces and families across the redemption story — meaning of names, lifespans, and how each life moves the promise forward.';
export const icon        = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M12 9v3M9 18h6"/></svg>`;
export const accent      = '#a16207';

let _state = { rows: [], q: '', selected: null };

export function render() {
  return /* html */`
    <section class="grow-page" data-grow="genealogy">
      <header class="grow-hero" style="--grow-accent:${accent}">
        <div class="grow-hero-icon">${icon}</div>
        <div class="grow-hero-text">
          <h1 class="grow-hero-title">${title}</h1>
          <p class="grow-hero-sub">${esc(description)}</p>
        </div>
      </header>

      <div class="grow-toolbar">
        <input class="grow-search" data-q placeholder="Search a name…" type="search">
      </div>

      <div class="grow-split">
        <aside class="grow-split-aside">
          <div class="grow-gen-list" data-bind="list">${loadingCards(8)}</div>
        </aside>
        <article class="grow-split-main" data-bind="detail">
          <p class="grow-muted">Pick a name to read their story.</p>
        </article>
      </div>
    </section>
  `;
}

export function mount(root) {
  const qEl = root.querySelector('[data-q]');
  qEl.addEventListener('input', () => { _state.q = qEl.value.trim().toLowerCase(); _paint(root); });
  _load(root);
  return () => {};
}

async function _load(root) {
  const list = root.querySelector('[data-bind="list"]');
  const V = vine();
  if (!V || !V.app || !V.app.genealogy) { list.innerHTML = backendOffline('Genealogy not loaded.'); return; }
  try {
    const res = await V.app.genealogy();
    _state.rows = rows(res);
    _paint(root);
  } catch (e) {
    console.error('[gospel/genealogy] load:', e);
    list.innerHTML = emptyState({ icon: '⚠️', title: 'Could not load genealogy', body: e.message || String(e) });
  }
}

function _filtered() {
  if (!_state.q) return _state.rows;
  return _state.rows.filter((p) => ((p.Name || '') + ' ' + (p.Title || '') + ' ' + (p.Meaning || '')).toLowerCase().includes(_state.q));
}

function _paint(root) {
  const list = _filtered();
  const listEl = root.querySelector('[data-bind="list"]');
  if (!list.length) { listEl.innerHTML = emptyState({ icon: '🌳', title: 'No matches' }); return; }
  listEl.innerHTML = list.map((p, i) => `
    <button class="grow-gen-row ${_state.selected === (p.Name || i) ? 'is-active' : ''}" data-p="${esc(String(p.Name || i))}">
      <span class="grow-gen-name">${esc(p.Name || 'Unknown')}</span>
      <span class="grow-gen-meaning">${esc(p.Meaning || '')}</span>
    </button>
  `).join('');
  listEl.querySelectorAll('[data-p]').forEach((btn) => btn.addEventListener('click', () => {
    _state.selected = btn.dataset.p; _paint(root); _paintDetail(root);
  }));
  _paintDetail(root);
}

function _paintDetail(root) {
  const det = root.querySelector('[data-bind="detail"]');
  if (!_state.selected) return;
  const list = _filtered();
  const p = list.find((x, i) => String(x.Name || i) === String(_state.selected));
  if (!p) return;
  det.innerHTML = /* html */`
    <h2 class="grow-detail-title">${esc(p.Name || '')}</h2>
    <div class="grow-lex-meta">
      ${p.Title    ? chip(p.Title, 'topic') : ''}
      ${p.Lifespan ? chip(p.Lifespan, 'neutral') : ''}
      ${p.Reference ? chip(p.Reference, 'level') : ''}
    </div>
    ${p.Meaning ? `<p class="grow-muted">Name means: ${esc(p.Meaning)}</p>` : ''}
    ${p.Bio     ? `<p class="grow-detail-body">${esc(snip(p.Bio, 1200))}</p>` : ''}
    ${p.Children ? `<h4 class="grow-detail-h4">Children</h4><p class="grow-detail-body">${esc(p.Children)}</p>` : ''}
  `;
}
