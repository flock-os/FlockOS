/* ══════════════════════════════════════════════════════════════════════════════
   THE EMOJI — Tiny emoji picker
   "A merry heart doeth good like a medicine." — Proverbs 17:22

   A small curated set keeps the bundle tiny. Apps that need a full set can
   swap in a heavier picker later — surface stays the same.
   ══════════════════════════════════════════════════════════════════════════════ */

const SETS = {
  faces:   ['😀','😃','😄','😁','😊','🙂','😉','😍','🥹','😢','😭','😤','😎','🤗','🤔'],
  heart:   ['❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','💖','💘'],
  hands:   ['🙏','🙌','👏','🤝','👍','👎','✊','✌️','🤞','🫶'],
  faith:   ['✝️','✡️','☪️','🕊️','🛐','📖','🕯️'],
  things:  ['☕','🍞','🍇','🌾','🌿','🌳','🔥','💧','✨','⭐','🌟'],
};

export function categories() { return Object.keys(SETS); }
export function symbolsFor(cat) { return SETS[cat] || []; }
export function all() { return Object.values(SETS).flat(); }

/** Open a tiny picker as a popover anchored to `anchorEl`. Returns Promise<emoji|null>. */
export function pick(anchorEl) {
  return new Promise((resolve) => {
    const root = document.createElement('div');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Pick an emoji');
    root.style.cssText = `
      position: fixed; z-index: 9300;
      background: var(--bg-raised, #fff); color: var(--ink, #1b264f);
      border: 1px solid var(--line, #e5e7ef); border-radius: 12px;
      box-shadow: 0 12px 36px rgba(0,0,0,0.18);
      padding: 10px; max-width: 280px;
      font: 1.1rem 'Noto Sans', sans-serif;
    `;
    root.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; gap:6px; max-height:220px; overflow-y:auto;">
        ${all().map((e) => `<button type="button" data-e="${e}"
          style="font-size:1.2rem; line-height:1; padding:6px; border:0; background:transparent; cursor:pointer; border-radius:6px;">${e}</button>`).join('')}
      </div>
    `;
    const r = anchorEl.getBoundingClientRect();
    root.style.left = `${Math.max(8, r.left)}px`;
    root.style.top  = `${r.bottom + 6}px`;

    function close(val) {
      if (root.parentNode) root.parentNode.removeChild(root);
      document.removeEventListener('mousedown', outside, true);
      resolve(val);
    }
    function outside(ev) { if (!root.contains(ev.target)) close(null); }

    root.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-e]');
      if (b) close(b.dataset.e);
    });
    document.addEventListener('mousedown', outside, true);
    document.body.appendChild(root);
  });
}
