/* ══════════════════════════════════════════════════════════════════════════════
   THE FRAME — Shared helpers for view stubs
   "Behold, I have engraved you on the palms of my hands; your walls
    are continually before me." — Isaiah 49:16

   Tiny helpers used by every view in /views/. Keeps stubs declarative.

   Public API:
     pageHero({ title, subtitle, scripture? })  — header strip HTML
     placeholder({ title, body, action? })       — empty/coming-soon block
     ensureVessels(...names)                     — lazy-load vessel components
   ══════════════════════════════════════════════════════════════════════════════ */

export function pageHero({ title, subtitle, scripture } = {}) {
  return `
    <div class="page-hero">
      <h1 class="page-hero-title">${_e(title || '')}</h1>
      ${subtitle  ? `<p class="page-hero-sub">${_e(subtitle)}</p>` : ''}
      ${scripture ? `<p class="page-hero-scripture">${_e(scripture)}</p>` : ''}
    </div>
  `;
}

export function placeholder({ title = 'Coming soon', body = '', action } = {}) {
  return `
    <div style="
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      gap:10px; padding:48px 24px; text-align:center;
      border:1px dashed var(--line, #e5e7ef); border-radius:14px;
      color:var(--ink, #1b264f); background:var(--bg-raised, #fff);">
      <div style="font:600 1.05rem 'Noto Serif', Georgia, serif;">${_e(title)}</div>
      ${body ? `<div style="color:var(--ink-muted, #7a7f96); max-width:520px;">${_e(body)}</div>` : ''}
      ${action ? `<div data-bind="action" style="margin-top:10px;">${action}</div>` : ''}
    </div>
  `;
}

export function ensureVessels(...names) {
  for (const n of names) {
    import(`../Scripts/vessels/${n}.js`).catch(() => {});
  }
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
