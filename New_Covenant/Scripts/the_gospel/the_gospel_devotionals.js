/* ══════════════════════════════════════════════════════════════════════════════
   THE GOSPEL · DEVOTIONALS — Daily devotions to feed the soul.
   "Man shall not live by bread alone, but by every word from God." — Matthew 4:4
   ══════════════════════════════════════════════════════════════════════════════ */

import { esc, snip, fmtDate, emptyState, loadingCards, chip } from './the_gospel_shared.js';

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
  const list = root.querySelector('[data-bind="list"]');
  _load(list);
  // Mobile WebViews (iOS Capacitor) sometimes don't toggle <details> when the
  // click lands on a block descendant of <summary> (e.g. an <h3>). Wire a
  // delegated handler so taps anywhere on the head reliably toggle the card.
  const onTap = (e) => {
    const head = e.target.closest('.grow-devo-head');
    if (!head) return;
    const det = head.parentElement;
    if (!det || det.tagName !== 'DETAILS') return;
    e.preventDefault();
    if (det.hasAttribute('open')) det.removeAttribute('open');
    else det.setAttribute('open', '');
  };
  list.addEventListener('click', onTap);
  return () => { list.removeEventListener('click', onTap); };
}

async function _load(list) {
  // Load from static bundle (regenerated from Firestore via export_devotionals_to_js.py)
  try {
    const mod = await import('../../Data/devotionals.js');
    _state.rows = mod.default || [];
  } catch (e) {
    console.error('[gospel/devotionals] static bundle failed:', e);
    list.innerHTML = emptyState({ icon: '⚠️', title: 'Could not load devotionals', body: e.message || String(e) });
    return;
  }
  if (!_state.rows.length) { list.innerHTML = emptyState({ icon: '🌅', title: 'No devotionals yet' }); return; }
  list.innerHTML = _state.rows.map(_card).join('');
}

function _card(d) {
  const date       = fmtDate(d.Date || d.date);
  const theme      = d.Theme      || d.theme;
  const title      = d.Title      || d.title || 'Devotional';
  const scripture  = d.Scripture  || d.scripture;
  const reflection = d.Reflection || d.reflection;
  const question   = d.Question   || d.question;
  const prayer     = d.Prayer     || d.prayer;
  return /* html */`
    <details class="grow-devo">
      <summary class="grow-devo-head">
        <div class="grow-devo-meta">${date ? chip(date, 'neutral') : ''}${theme ? chip(theme, 'topic') : ''}</div>
        <h3 class="grow-devo-title">${esc(title)}</h3>
        ${scripture ? `<p class="grow-devo-scripture">${esc(scripture)}</p>` : ''}
      </summary>
      <div class="grow-devo-body">
        ${reflection ? `<p>${esc(snip(reflection, 1200))}</p>` : ''}
        ${question   ? `<blockquote class="grow-quote">${esc(question)}</blockquote>` : ''}
        ${prayer     ? `<p class="grow-prayer"><em>${esc(prayer)}</em></p>` : ''}
      </div>
    </details>
  `;
}
