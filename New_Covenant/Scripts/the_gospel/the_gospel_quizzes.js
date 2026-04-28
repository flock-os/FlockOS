/* ══════════════════════════════════════════════════════════════════════════════
   THE GOSPEL · QUIZZES — Bible challenges & course assessments.
   "Examine yourselves to see whether you are in the faith." — 2 Corinthians 13:5
   ══════════════════════════════════════════════════════════════════════════════ */

import { ur, vine, rows, esc, snip, emptyState, backendOffline, loadingCards, chip } from './the_gospel_shared.js';

export const name        = 'the_gospel_quizzes';
export const title       = 'Quizzes';
export const description = 'Bible challenges, course assessments, and self-checks — track what you know and where to grow.';
export const icon        = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4"/><circle cx="12" cy="17" r=".6" fill="currentColor"/></svg>`;
export const accent      = '#0ea5e9';

let _state = { rows: [] };

export function render() {
  return /* html */`
    <section class="grow-page" data-grow="quizzes">
      <header class="grow-hero" style="--grow-accent:${accent}">
        <div class="grow-hero-icon">${icon}</div>
        <div class="grow-hero-text">
          <h1 class="grow-hero-title">${title}</h1>
          <p class="grow-hero-sub">${esc(description)}</p>
        </div>
      </header>

      <div class="grow-grid grow-grid--quizzes" data-bind="grid">${loadingCards(4)}</div>
    </section>
  `;
}

export function mount(root) {
  _load(root.querySelector('[data-bind="grid"]'));
  return () => {};
}

async function _load(grid) {
  const U = ur(); const V = vine();
  if (!U && !V) { grid.innerHTML = backendOffline('Quiz catalogue not loaded.'); return; }
  try {
    const res = U
      ? await U.listLrnQuizzes({ limit: 200 })
      : await V.flock.call('learning.quizzes.list', { limit: 200 }, { skipAuth: true });
    _state.rows = rows(res);
    if (!_state.rows.length) {
      grid.innerHTML = emptyState({ icon: '❓', title: 'No quizzes yet', body: 'Quizzes appear here as your shepherd publishes them.' });
      return;
    }
    grid.innerHTML = _state.rows.map(_card).join('');
  } catch (e) {
    console.error('[gospel/quizzes] load:', e);
    grid.innerHTML = emptyState({ icon: '⚠️', title: 'Could not load quizzes', body: e.message || String(e) });
  }
}

function _card(q) {
  const diff = q.difficulty ? chip(q.difficulty, 'level') : '';
  const time = q.timeLimitMins ? chip(q.timeLimitMins + ' min', 'neutral') : '';
  const cnt  = q.questionCount ? chip(q.questionCount + ' qs', 'neutral') : '';
  return /* html */`
    <article class="grow-card grow-card--quiz" data-id="${esc(q.id || '')}" tabindex="0">
      <div class="grow-card-cover grow-card-cover--placeholder" style="--grow-accent:${accent}">
        <div class="grow-card-cover-icon">${icon}</div>
      </div>
      <div class="grow-card-body">
        <div class="grow-card-tags">${diff}${cnt}${time}</div>
        <h3 class="grow-card-title">${esc(q.title || 'Untitled quiz')}</h3>
        ${q.description ? `<p class="grow-card-desc">${esc(snip(q.description, 140))}</p>` : ''}
      </div>
    </article>
  `;
}
