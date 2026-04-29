/* ══════════════════════════════════════════════════════════════════════════════
   THE GOSPEL · LIBRARY — A guided tour of the 66 books.
   "All Scripture is breathed out by God." — 2 Timothy 3:16
   ══════════════════════════════════════════════════════════════════════════════ */

import { vine, rows, esc, snip, emptyState, sectionHead, chip } from './the_gospel_shared.js';

export const name        = 'the_gospel_library';
export const title       = 'The Word';
export const description = 'A guided tour of the 66 books — author, summary, theology, and how each book points to Christ.';
export const icon        = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V6a2 2 0 0 1 2-2h13v15"/><path d="M6 17h13"/><path d="M6 21h13a2 2 0 0 0 0-4H6a2 2 0 0 0 0 4z"/></svg>`;
export const accent      = '#9333ea';

const FALLBACK_BOOKS = [
  { Book: 'Genesis', Testament: 'Old', Genre: 'Law',     Summary: 'Creation, fall, covenant — the seed of redemption.' },
  { Book: 'Exodus',  Testament: 'Old', Genre: 'Law',     Summary: 'God rescues His people and makes them a nation.' },
  { Book: 'Psalms',  Testament: 'Old', Genre: 'Wisdom',  Summary: 'The prayer-book of the redeemed.' },
  { Book: 'Isaiah',  Testament: 'Old', Genre: 'Prophet', Summary: 'A vision of the suffering Servant who saves.' },
  { Book: 'Matthew', Testament: 'New', Genre: 'Gospel',  Summary: 'Jesus, the long-promised King.' },
  { Book: 'John',    Testament: 'New', Genre: 'Gospel',  Summary: 'The Word made flesh, full of grace and truth.' },
  { Book: 'Romans',  Testament: 'New', Genre: 'Letter',  Summary: 'The gospel of God in Jesus Christ — explained.' },
  { Book: 'Revelation', Testament: 'New', Genre: 'Apocalypse', Summary: 'The Lamb who was slain reigns forever.' },
];

let _state = { rows: [], selected: null, test: 'all', q: '' };

export function render() {
  return /* html */`
    <section class="grow-page" data-grow="library">
      <header class="grow-hero" style="--grow-accent:${accent}">
        <div class="grow-hero-icon">${icon}</div>
        <div class="grow-hero-text">
          <h1 class="grow-hero-title">${title}</h1>
          <p class="grow-hero-sub">${esc(description)}</p>
        </div>
      </header>

      <div class="grow-toolbar">
        <input class="grow-search" data-q placeholder="Search a book…" type="search">
        <div class="grow-filters">
          <button class="grow-filter is-active" data-t="all">All 66</button>
          <button class="grow-filter" data-t="ot">Old Testament</button>
          <button class="grow-filter" data-t="nt">New Testament</button>
        </div>
      </div>

      <div class="grow-split grow-split--lib">
        <aside class="grow-split-aside">
          <div class="grow-book-list" data-bind="list"></div>
        </aside>
        <article class="grow-split-main" data-bind="detail">
          <p class="grow-muted">Pick a book to read its summary, key theology, and where it leads in the story of redemption.</p>
        </article>
      </div>
    </section>
  `;
}

export function mount(root) {
  const qEl = root.querySelector('[data-q]');
  qEl.addEventListener('input', () => { _state.q = qEl.value.trim().toLowerCase(); _paint(root); });
  root.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => {
    root.querySelectorAll('[data-t]').forEach((x) => x.classList.remove('is-active'));
    b.classList.add('is-active');
    _state.test = b.dataset.t;
    _paint(root);
  }));
  _load(root);
  return () => {};
}

async function _load(root) {
  const V = vine();
  try {
    const res = (V && V.app && V.app.books) ? await V.app.books() : null;
    _state.rows = rows(res).length ? rows(res) : FALLBACK_BOOKS;
  } catch (_) {
    _state.rows = FALLBACK_BOOKS;
  }
  _paint(root);
}

function _filtered() {
  return _state.rows.filter((b) => {
    if (_state.test !== 'all') {
      const t = (b.Testament || b.testament || '').toLowerCase();
      if (_state.test === 'ot' && !t.startsWith('old')) return false;
      if (_state.test === 'nt' && !t.startsWith('new')) return false;
    }
    if (_state.q) {
      const hay = ((b.Book || b.title || '') + ' ' + (b.Summary || '') + ' ' + (b.Genre || '')).toLowerCase();
      if (!hay.includes(_state.q)) return false;
    }
    return true;
  });
}

function _paint(root) {
  const list = _filtered();
  const listEl = root.querySelector('[data-bind="list"]');
  if (!list.length) { listEl.innerHTML = emptyState({ icon: '📖', title: 'No matches' }); return; }
  listEl.innerHTML = list.map((b, i) => `
    <button class="grow-book-row ${_state.selected === (b.Book || i) ? 'is-active' : ''}" data-b="${esc(String(b.Book || i))}">
      <span class="grow-book-name">${esc(b.Book || b.title || '')}</span>
      <span class="grow-book-genre">${esc(b.Genre || b.genre || '')}</span>
    </button>
  `).join('');
  listEl.querySelectorAll('[data-b]').forEach((btn) => btn.addEventListener('click', () => {
    _state.selected = btn.getAttribute('data-b');
    _paint(root); _paintDetail(root);
  }));
  _paintDetail(root);
}

function _paintDetail(root) {
  const det = root.querySelector('[data-bind="detail"]');
  if (!_state.selected) return;
  const list = _filtered();
  const b = list.find((x, i) => String(x.Book || i) === String(_state.selected));
  if (!b) return;
  det.innerHTML = /* html */`
    <h2 class="grow-detail-title">${esc(b.Book || b.title || '')}</h2>
    <div class="grow-lex-meta">
      ${b.Testament ? chip(b.Testament + ' Testament', 'level') : ''}
      ${b.Genre     ? chip(b.Genre, 'topic') : ''}
    </div>
    ${b.Summary ? `<h4 class="grow-detail-h4">Summary</h4><p class="grow-detail-body">${esc(snip(b.Summary, 800))}</p>` : ''}
    ${b['Core Theology'] ? `<h4 class="grow-detail-h4">Core Theology</h4><p class="grow-detail-body">${esc(snip(b['Core Theology'], 600))}</p>` : ''}
    ${b['Practical Application'] ? `<h4 class="grow-detail-h4">Application</h4><p class="grow-detail-body">${esc(snip(b['Practical Application'], 600))}</p>` : ''}
  `;
}
