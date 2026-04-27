/* ══════════════════════════════════════════════════════════════════════════════
   THE CALL — Primary CTA strip
   "Many are called, but few are chosen." — Matthew 22:14

   One clear next step on the home page. Decides between:
     • Sign in (no profile)
     • Open Fellowship (default for signed-in users)
   ══════════════════════════════════════════════════════════════════════════════ */

import { profile, enter } from '../../Scripts/the_priesthood/index.js';

export function renderCall(ctx) {
  const wrap = document.createElement('div');
  wrap.style.cssText = `margin-top: 22px; display: flex; gap: 10px; flex-wrap: wrap;`;
  const me = profile();

  if (!me) {
    wrap.innerHTML = `<flock-button tone="primary" size="lg">Sign in</flock-button>`;
    wrap.querySelector('flock-button').addEventListener('click', () => enter());
    return wrap;
  }

  wrap.innerHTML = `
    <flock-button tone="primary" size="lg" data-act="fellowship">Open Fellowship</flock-button>
    <flock-button tone="ghost"   size="lg" data-act="care">Pastoral Care</flock-button>
  `;
  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('flock-button[data-act]');
    if (!btn) return;
    const act = btn.getAttribute('data-act');
    if (act === 'fellowship') ctx.go('the_fellowship');
    if (act === 'care')        ctx.go('the_life');
  });
  return wrap;
}
