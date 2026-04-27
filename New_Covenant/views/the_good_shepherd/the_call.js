/* ══════════════════════════════════════════════════════════════════════════════
   THE CALL — Primary CTA strip
   "Many are called, but few are chosen." — Matthew 22:14
   ══════════════════════════════════════════════════════════════════════════════ */

import { whoAmI } from '../../Scripts/the_priesthood/index.js';

export async function renderCall(ctx) {
  await whoAmI(); // ensure auth state is resolved before rendering

  const wrap = document.createElement('div');
  wrap.style.cssText = `margin-top: 22px; display: flex; gap: 10px; flex-wrap: wrap;`;

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
