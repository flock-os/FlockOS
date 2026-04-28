/* ══════════════════════════════════════════════════════════════════════════════
   THE GOSPEL · READING — Bible reading plans + streak heatmap.
   "Blessed is the one who reads aloud the words of this prophecy." — Revelation 1:3
   ══════════════════════════════════════════════════════════════════════════════ */

import { esc, sectionHead } from './the_gospel_shared.js';

export const name        = 'the_gospel_reading';
export const title       = 'Reading Plans';
export const description = 'Daily reading plans with a personal streak — keep your hand to the plow without losing your place.';
export const icon        = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6.5A2.5 2.5 0 0 1 4.5 4H10v16H4.5A2.5 2.5 0 0 1 2 17.5z"/><path d="M22 6.5A2.5 2.5 0 0 0 19.5 4H14v16h5.5a2.5 2.5 0 0 0 2.5-2.5z"/></svg>`;
export const accent      = '#059669';

const PLANS = [
  { id: 'm-pro', title: 'Proverbs in a Month', days: 31, category: 'Wisdom', description: 'A chapter of Proverbs for every day of the month.' },
  { id: 'gospels-90', title: 'Gospels in 90 Days', days: 90, category: 'Gospels', description: 'Walk through Matthew, Mark, Luke, and John in three months.' },
  { id: 'psalms-150', title: 'Psalms in 150 Days', days: 150, category: 'Psalms', description: 'A psalm a day for the seasons of the heart.' },
  { id: 'b-year', title: 'The Bible in a Year', days: 365, category: 'Whole Bible', description: 'A balanced OT/NT/Psalms reading every day for a full year.' },
  { id: 'nt-90', title: 'New Testament in 90 Days', days: 90, category: 'NT', description: 'A focused walk through the apostolic witness.' },
];

const STORAGE = 'tw_reading_progress';

export function render() {
  return /* html */`
    <section class="grow-page" data-grow="reading">
      <header class="grow-hero" style="--grow-accent:${accent}">
        <div class="grow-hero-icon">${icon}</div>
        <div class="grow-hero-text">
          <h1 class="grow-hero-title">${title}</h1>
          <p class="grow-hero-sub">${esc(description)}</p>
        </div>
      </header>

      ${sectionHead('Your reading streak')}
      <div class="grow-streak" data-bind="streak"></div>

      ${sectionHead('Choose a plan')}
      <div class="grow-grid grow-grid--reading" data-bind="plans"></div>

      ${sectionHead('Today')}
      <div class="grow-today" data-bind="today"></div>
    </section>
  `;
}

export function mount(root) {
  const planEl   = root.querySelector('[data-bind="plans"]');
  const streakEl = root.querySelector('[data-bind="streak"]');
  const todayEl  = root.querySelector('[data-bind="today"]');

  const progress = _load();
  planEl.innerHTML   = PLANS.map((p) => _planCard(p, progress[p.id])).join('');
  streakEl.innerHTML = _renderStreak(progress);
  todayEl.innerHTML  = _renderToday(progress);

  planEl.querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-toggle');
      const p  = _load();
      p[id] = p[id] || { days: {}, started: new Date().toISOString() };
      const k = new Date().toISOString().slice(0, 10);
      p[id].days[k] = !p[id].days[k];
      _save(p);
      planEl.innerHTML   = PLANS.map((pl) => _planCard(pl, p[pl.id])).join('');
      streakEl.innerHTML = _renderStreak(p);
      todayEl.innerHTML  = _renderToday(p);
      mount(root); // re-bind
    });
  });

  return () => {};
}

function _load() { try { return JSON.parse(localStorage.getItem(STORAGE) || '{}'); } catch (_) { return {}; } }
function _save(p) { try { localStorage.setItem(STORAGE, JSON.stringify(p)); } catch (_) {} }

function _planCard(p, prog) {
  const done = prog ? Object.values(prog.days || {}).filter(Boolean).length : 0;
  const pct  = Math.min(100, Math.round((done / p.days) * 100));
  return /* html */`
    <article class="grow-card grow-card--plan" data-id="${esc(p.id)}">
      <div class="grow-card-body">
        <div class="grow-card-tags">${esc(p.category)} · ${p.days} days</div>
        <h3 class="grow-card-title">${esc(p.title)}</h3>
        <p class="grow-card-desc">${esc(p.description)}</p>
        <div class="grow-progress"><div class="grow-progress-fill" style="width:${pct}%; background:${accent}"></div></div>
        <div class="grow-card-foot">
          <span class="grow-card-meta">${done} / ${p.days} days · ${pct}%</span>
          <button class="grow-btn grow-btn--ghost" data-toggle="${esc(p.id)}">Mark today</button>
        </div>
      </div>
    </article>
  `;
}

function _renderStreak(progress) {
  // 12-week heatmap (84 cells) — count any plan checked on the day.
  const cells = [];
  const today = new Date();
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    let count = 0;
    for (const pid in progress) {
      if (progress[pid] && progress[pid].days && progress[pid].days[k]) count++;
    }
    const lvl = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3;
    cells.push(`<i class="grow-heat grow-heat--${lvl}" title="${k}: ${count} read"></i>`);
  }
  return `<div class="grow-heat-grid">${cells.join('')}</div>`;
}

function _renderToday(progress) {
  const k = new Date().toISOString().slice(0, 10);
  const today = PLANS.filter((p) => progress[p.id] && progress[p.id].days && progress[p.id].days[k]);
  if (!today.length) return `<p class="grow-muted">No reading checked off yet today.</p>`;
  return `<p class="grow-muted">✓ Today: ${today.map((p) => esc(p.title)).join(', ')}</p>`;
}
