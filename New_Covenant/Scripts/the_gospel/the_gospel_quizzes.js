/* ══════════════════════════════════════════════════════════════════════════════
   THE GOSPEL · QUIZZES — Bible challenges & course assessments.
   "Examine yourselves to see whether you are in the faith." — 2 Corinthians 13:5
   ══════════════════════════════════════════════════════════════════════════════ */

import {
  esc, snip, emptyState, loadingCards, chip,
} from './the_gospel_shared.js';
  helpButton, wireHelp,
} from './the_gospel_shared.js';

export const name        = 'the_gospel_quizzes';
export const title       = 'Quizzes';
export const description = 'Bible challenges, course assessments, and self-checks — track what you know and where to grow.';
export const icon        = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4"/><circle cx="12" cy="17" r=".6" fill="currentColor"/></svg>`;
export const accent      = '#0ea5e9';

let _state = {
  course:  [],   // course-level quizzes from learning system
  bible:   [],   // app-level Bible Q&A from Matthew
  picked:  [],
  idx:     0,
  answers: {},
  mode:    'lobby',  // 'lobby' | 'taking' | 'results'
};

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
      <div data-bind="root">${loadingCards(4)}</div>
    </section>
  `;
}

export function mount(root) {
  _load(root);
  return () => {};
}

async function _load(root) {
  const view = root.querySelector('[data-bind="root"]');
  // Load bible quiz questions from static bundle (regenerated via export_quiz_to_js.py)
  // Course/structured quizzes are user-created content — not yet bundled
  try {
    const mod = await import('../../Data/quiz.js');
    _state.bible  = mod.default || [];
    _state.course = [];
  } catch (e) {
    console.error('[gospel/quizzes] static bundle failed:', e);
    view.innerHTML = emptyState({ icon: '⚠️', title: 'Could not load quizzes', body: e.message || String(e) });
    return;
  }
  _state.mode = 'lobby';
  _paintLobby(root);
}

function _paintLobby(root) {
  const view = root.querySelector('[data-bind="root"]');
  let html = '';

  if (_state.bible.length) {
    html += `
      <div class="grow-section-head"><h2 class="grow-section-title">Bible Quiz Challenge</h2></div>
      <div class="grow-card" style="padding:18px; cursor:default; --grow-accent:${accent};">
        <p class="grow-card-desc" style="margin:0 0 10px;">${_state.bible.length} questions from across the Bible. Test your knowledge!</p>
        <button type="button" class="grow-btn" data-start-bible>▶ Start Bible Quiz</button>
      </div>
    `;
  }

  if (_state.course.length) {
    html += `
      <div class="grow-section-head" style="margin-top:24px;"><h2 class="grow-section-title">Course Quizzes</h2></div>
      <div class="grow-grid grow-grid--quizzes">${_state.course.map(_courseCard).join('')}</div>
    `;
  }

  if (!_state.bible.length && !_state.course.length) {
    html = emptyState({ icon: '❓', title: 'No quizzes yet', body: 'Quizzes appear here as your shepherd publishes them.' });
  }

  view.innerHTML = html;
  const startBtn = view.querySelector('[data-start-bible]');
  if (startBtn) startBtn.addEventListener('click', () => _startBible(root));
}

function _courseCard(q) {
  const diff = q.difficulty ? chip(q.difficulty, 'level') : '';
  const cnt  = q.questionCount ? chip(q.questionCount + ' qs', 'neutral') : '';
  const time = q.timeLimitMins ? chip(q.timeLimitMins + ' min', 'neutral') : '';
  return /* html */`
    <article class="grow-card grow-card--quiz" tabindex="0" style="--grow-accent:${accent};">
      <div class="grow-card-cover grow-card-cover--placeholder">
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

/* ── Bible quiz flow ─────────────────────────────────────────────────── */

function _startBible(root) {
  const all = _state.bible.slice().sort(() => Math.random() - 0.5);
  _state.picked  = all.slice(0, Math.min(10, all.length));
  _state.idx     = 0;
  _state.answers = {};
  _state.mode    = 'taking';
  _paintQ(root);
}

function _paintQ(root) {
  const view  = root.querySelector('[data-bind="root"]');
  const total = _state.picked.length;
  const i     = _state.idx;
  const q     = _state.picked[i];
  if (!q) return;

  const opts = ['A', 'B', 'C', 'D'].map((k) => q['Option ' + k]).filter(Boolean);
  const saved = _state.answers[i] || '';
  const pct   = Math.round(((i + 1) / total) * 100);

  let html = '';
  html += `<div style="margin-bottom:14px;">
    <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--ink-muted, #7a7f96); margin-bottom:4px;">
      <span>Question ${i + 1} of ${total}</span><span>${Object.keys(_state.answers).length} answered</span>
    </div>
    <div class="grow-progress"><div class="grow-progress-fill" style="width:${pct}%; background:${accent};"></div></div>
  </div>`;

  html += `<div class="grow-card" style="padding:18px; cursor:default; --grow-accent:${accent};">
    <h3 class="grow-card-title" style="margin:0 0 12px;">${i + 1}. ${esc(q.Question || '')}</h3>`;
  if (q.Category || q.Difficulty) {
    html += `<div style="margin-bottom:10px;">`;
    if (q.Category)   html += chip(q.Category, 'neutral') + ' ';
    if (q.Difficulty) html += chip(q.Difficulty, q.Difficulty === 'Hard' ? 'danger' : q.Difficulty === 'Medium' ? 'warn' : 'good');
    html += `</div>`;
  }
  opts.forEach((opt, oi) => {
    const letter = String.fromCharCode(97 + oi);
    const checked = saved === letter;
    html += `<label style="display:block; padding:10px 12px; margin:4px 0; border-radius:8px; cursor:pointer; border:1px solid var(--line, #e5e7ef); background:${checked ? 'color-mix(in srgb,' + accent + ' 12%, transparent)' : 'var(--bg-raised,#fff)'}; color:var(--ink,#1b264f); font-size:14px;">
      <input type="radio" name="q_current" value="${letter}" ${checked ? 'checked' : ''} style="margin-right:10px;">
      <strong>${letter.toUpperCase()}.</strong> ${esc(opt)}
    </label>`;
  });
  html += `</div>`;

  html += `<div style="display:flex; justify-content:space-between; gap:12px; margin-top:16px;">
    ${i > 0 ? '<button type="button" class="grow-btn grow-btn--ghost" data-nav="-1">◀ Previous</button>' : '<span></span>'}
    ${i < total - 1
      ? '<button type="button" class="grow-btn" data-nav="1">Next ▶</button>'
      : '<button type="button" class="grow-btn" data-score>Score Quiz ✓</button>'}
  </div>`;

  view.innerHTML = html;
  view.querySelectorAll('input[name="q_current"]').forEach((inp) => {
    inp.addEventListener('change', () => { _state.answers[i] = inp.value; });
  });
  view.querySelectorAll('[data-nav]').forEach((b) => {
    b.addEventListener('click', () => {
      const sel = view.querySelector('input[name="q_current"]:checked');
      if (sel) _state.answers[i] = sel.value;
      _state.idx = Math.max(0, Math.min(total - 1, i + Number(b.dataset.nav)));
      _paintQ(root);
    });
  });
  const scoreBtn = view.querySelector('[data-score]');
  if (scoreBtn) scoreBtn.addEventListener('click', () => {
    const sel = view.querySelector('input[name="q_current"]:checked');
    if (sel) _state.answers[i] = sel.value;
    _paintResults(root);
  });
}

function _paintResults(root) {
  const view = root.querySelector('[data-bind="root"]');
  let correct = 0;
  const wrong = [];
  _state.picked.forEach((q, i) => {
    const ans = String(_state.answers[i] || '').toLowerCase().trim();
    const right = String(q['Correct Answer'] || '').toLowerCase().trim();
    if (ans && ans === right) correct++;
    else wrong.push({ q, ans });
  });
  const pct = Math.round((correct / _state.picked.length) * 100);
  const tone = pct >= 80 ? '#0a7c3e' : pct >= 60 ? '#8a5a00' : '#9a2317';

  let html = `<div class="grow-card" style="padding:24px; text-align:center; cursor:default; --grow-accent:${accent};">
    <div style="font-size:48px; font-weight:700; color:${tone};">${pct}%</div>
    <p class="grow-muted" style="margin:6px 0 0;">${correct} of ${_state.picked.length} correct</p>
    <div style="display:flex; gap:8px; justify-content:center; margin-top:16px;">
      <button type="button" class="grow-btn" data-retry>Take another</button>
      <button type="button" class="grow-btn grow-btn--ghost" data-back>Back to lobby</button>
    </div>
  </div>`;

  if (wrong.length) {
    html += `<div class="grow-section-head" style="margin-top:18px;"><h2 class="grow-section-title">Review</h2></div>`;
    html += `<div class="grow-list">`;
    wrong.forEach(({ q, ans }) => {
      const right = String(q['Correct Answer'] || '').toUpperCase();
      html += `<div class="grow-card" style="padding:14px; cursor:default;">
        <p style="margin:0 0 6px; font-weight:600;">${esc(q.Question || '')}</p>
        <p class="grow-muted" style="margin:0;">Your answer: <strong>${esc((ans || '—').toUpperCase())}</strong> · Correct: <strong style="color:#0a7c3e;">${esc(right)}</strong></p>
        ${q.Reference ? `<p class="grow-muted" style="margin:6px 0 0; font-style:italic;">${esc(q.Reference)}</p>` : ''}
      </div>`;
    });
    html += `</div>`;
  }

  html += helpButton({ label: 'Ask a pastor for prayer + study help', dataAttr: 'help-quiz' });

  view.innerHTML = html;
  view.querySelector('[data-retry]').addEventListener('click', () => _startBible(root));
  view.querySelector('[data-back]').addEventListener('click',  () => { _state.mode = 'lobby'; _paintLobby(root); });
  wireHelp(view, () => {
    return `I just took the Bible Quiz and scored ${pct}% (${correct}/${_state.picked.length}).` +
      (wrong.length ? ` I'd value prayer and study guidance on these areas: ${wrong.slice(0, 5).map((w) => w.q.Category || w.q.Question).filter(Boolean).join('; ')}` : '');
  }, { category: 'Discipleship: Bible Quiz', source: 'Bible Quiz', confidential: false });
}
