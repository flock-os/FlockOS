/* ══════════════════════════════════════════════════════════════════════════════
   THE GOSPEL · COUNSELING — Biblical counsel for ordinary trials.
   "Cast all your anxiety on him, because he cares for you." — 1 Peter 5:7
   ══════════════════════════════════════════════════════════════════════════════ */

import {
  esc, emptyState, loadingCards,
  bibleLink, helpButton, wireHelp,
} from './the_gospel_shared.js';

export const name        = 'the_gospel_counseling';
export const title       = 'Counseling';
export const description = 'Biblical counsel for the trials we all face — anxiety, grief, marriage, addiction, parenting, and more.';
export const icon        = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.6a5.5 5.5 0 0 0-7.78 0L12 5.66l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21l8.84-8.62a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
export const accent      = '#16a34a';

const _cache = {};      // id → full doc
let _stubs   = [];      // catalog stubs

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

      <input type="search" class="grow-search" data-bind="search" placeholder="🔍 Search topics…" />
      <div class="grow-grid grow-grid--counseling" data-bind="grid">${loadingCards(6)}</div>
    </section>
  `;
}

export function mount(root) {
  _load(root);
  const search = root.querySelector('[data-bind="search"]');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.toLowerCase().trim();
      root.querySelectorAll('.coun-card').forEach((el) => {
        const hay = (el.dataset.search || '').toLowerCase();
        el.style.display = !q || hay.includes(q) ? '' : 'none';
      });
    });
  }
  return () => {};
}

async function _load(root) {
  const grid = root.querySelector('[data-bind="grid"]');

  // Load from static bundle (regenerated from Firestore via export_counseling_to_js.py)
  _stubs = [];
  try {
    const mod = await import('../../Data/counseling.js');
    const arr = mod.default || [];
    arr.forEach((d) => {
      const id = d._id || d.id || d.topicId;
      if (!id) return;
      _cache[id] = d;
      _stubs.push({
        id,
        title: d.title || d.Title || id,
        icon:  d.icon  || d.Icon  || '🌿',
        color: d.color || d.Color || accent,
      });
    });
  } catch (e) {
    console.error('[gospel/counseling] static bundle failed:', e);
  }

  if (!_stubs.length) {
    grid.innerHTML = emptyState({ icon: '💚', title: 'Counseling resources coming soon', body: 'Biblical counseling wisdom and protocols will appear here.' });
    return;
  }

  grid.innerHTML = _stubs.map(_card).join('');
  grid.querySelectorAll('.coun-card').forEach((el) => {
    el.addEventListener('click', (ev) => {
      // Ignore clicks inside the open body (so links/buttons work normally)
      if (ev.target.closest('.coun-card-body')) return;
      _toggle(el, el.dataset.id);
    });
  });
}

function _card(s) {
  const safeTitle = esc(s.title);
  return /* html */`
    <div class="grow-card grow-card--counsel coun-card"
         data-id="${esc(s.id)}"
         data-search="${safeTitle.toLowerCase()}"
         style="--grow-accent:${esc(s.color)}; cursor:pointer;">
      <div class="coun-card-head" style="display:flex; align-items:center; gap:10px; padding:14px 14px;">
        <div class="grow-counsel-icon" style="font-size:22px; margin:0; color:${esc(s.color)}; line-height:1;">${esc(s.icon)}</div>
        <h3 class="grow-card-title" style="margin:0; flex:1; text-align:left; font-size:14px;">${safeTitle}</h3>
        <span class="coun-card-chevron" style="color:var(--ink-muted, #7a7f96); font-size:12px;">▼</span>
      </div>
      <div class="coun-card-body" style="display:none; padding:0 14px 14px;"></div>
    </div>
  `;
}

async function _toggle(cardEl, id) {
  const body = cardEl.querySelector('.coun-card-body');
  const chev = cardEl.querySelector('.coun-card-chevron');
  if (!body) return;
  if (body.style.display !== 'none') {
    body.style.display = 'none';
    cardEl.classList.remove('is-open');
    if (chev) chev.textContent = '▼';
    return;
  }
  // Close any other open card first (so only one is full-width at a time)
  cardEl.parentElement.querySelectorAll('.coun-card.is-open').forEach((other) => {
    if (other === cardEl) return;
    other.classList.remove('is-open');
    const ob = other.querySelector('.coun-card-body');
    const oc = other.querySelector('.coun-card-chevron');
    if (ob) ob.style.display = 'none';
    if (oc) oc.textContent = '▼';
  });
  cardEl.classList.add('is-open');
  if (chev) chev.textContent = '▲';
  body.style.display = 'block';

  if (!_cache[id]) {
    body.innerHTML = `<div class="grow-muted" style="color:var(--err, #c0392b); padding:8px 0;">Content not found in bundle.</div>`;
    return;
  }
  const item = _cache[id];
  if (!item) {
    body.innerHTML = `<div class="grow-muted" style="color:var(--err, #c0392b); padding:8px 0;">Could not load content.</div>`;
    return;
  }
  body.innerHTML = _detailHtml(item) + helpButton({ label: 'Send a prayer request', dataAttr: 'help-' + id });
  const stub = _stubs.find((s) => s.id === id) || {};
  wireHelp(body, () => _summary(stub, item), { category: 'Counseling: ' + (item.Title || stub.title || id), source: 'Counseling' });
}

function _detailHtml(item) {
  const color   = item.Color || item.color || accent;
  const def     = item.Definition || item.definition || '';
  const scrips  = _parseScriptures(item.Scriptures || item.scriptures || '');
  const steps   = _parseSteps(item.Steps || item.steps || '');
  let h = '';
  if (def) h += `<p class="grow-detail-body" style="margin:8px 0 14px;">${esc(def)}</p>`;
  if (scrips.length) {
    h += `<div class="grow-detail-h4" style="color:${esc(color)};">📖 Scripture Foundation</div>`;
    scrips.forEach((s) => {
      h += `<div style="padding:6px 0; border-top:1px solid var(--line, #e5e7ef);">`;
      if (s.ref)  h += `<div style="font-weight:600; color:${esc(color)}; font-size:13px;">${bibleLink(s.ref)}</div>`;
      if (s.text) h += `<div style="font-style:italic; color:var(--ink, #1b264f); font-size:13px; margin-top:2px;">“${esc(s.text)}”</div>`;
      h += `</div>`;
    });
  }
  if (steps.length) {
    h += `<div class="grow-detail-h4" style="color:${esc(color)}; margin-top:14px;">💡 Faith Response Steps</div>`;
    h += `<ol style="padding-left:18px; margin:6px 0; color:var(--ink, #1b264f); font-size:13px; line-height:1.6;">`;
    steps.forEach((s) => { h += `<li style="margin:4px 0;">${esc(s)}</li>`; });
    h += `</ol>`;
  }
  if (!h) h = `<div class="grow-muted" style="padding:8px 0;">No details available.</div>`;
  return h;
}

function _parseScriptures(raw) {
  if (!raw) return [];
  const parts = String(raw).split(/(?=(?:[123]?\s?[A-Z][a-z]+\s+\d+:\d+))/g);
  const out = [];
  parts.forEach((p) => {
    p = p.trim(); if (!p) return;
    const m = p.match(/^([123]?\s?[A-Za-z]+\s+\d+:\d+(?:-\d+)?):?\s*([\s\S]*)/);
    if (m) out.push({ ref: m[1].trim(), text: m[2].replace(/[.;,\s]+$/, '').trim() });
    else   out.push({ ref: '', text: p.replace(/[.;,\s]+$/, '').trim() });
  });
  return out;
}
function _parseSteps(raw) {
  if (!raw) return [];
  return String(raw).split(/[;\n]+/).map((s) => s.trim()).filter(Boolean);
}

function _summary(stub, item) {
  const title = item.Title || item.title || stub.title || 'Counseling topic';
  const def   = (item.Definition || item.definition || '').slice(0, 280);
  return `I'm working through "${title}" in the Counseling library and would value pastoral prayer and follow-up.${def ? '\n\nTopic summary: ' + def : ''}`;
}
