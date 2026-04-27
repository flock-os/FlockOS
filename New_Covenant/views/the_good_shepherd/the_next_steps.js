/* ══════════════════════════════════════════════════════════════════════════════
   THE NEXT STEPS — Today’s top three pastoral tasks
   "Whatsoever thy hand findeth to do, do it with thy might." — Ecclesiastes 9:10

   Reads TheLife.careCases() (or compassionList as fallback), surfaces up to
   three rows on the home page with a one-click jump to that person.
   ══════════════════════════════════════════════════════════════════════════════ */

import { draw } from '../../Scripts/the_manna.js';
import { careCases, compassionList } from '../../Scripts/the_life/index.js';

export function mountNextSteps(host, ctx) {
  if (!host) return () => {};
  let cancelled = false;

  draw('shepherd:next', _fetch, { ttl: 30_000 })
    .then((rows = []) => {
      if (cancelled || !host.isConnected) return;
      if (!rows.length) {
        host.innerHTML = `<div style="color: var(--ink-muted, #7a7f96);">Nothing on your plate today.</div>`;
        return;
      }
      host.innerHTML = rows.slice(0, 3).map(_row).join('');
      host.querySelectorAll('[data-pid]').forEach((el) => {
        el.addEventListener('click', () => ctx.go && ctx.go('the_life', { person: el.dataset.pid }));
      });
    })
    .catch(() => {
      if (cancelled || !host.isConnected) return;
      host.innerHTML = `<div style="color: var(--ink-muted, #7a7f96);">Pastoral backend unavailable right now.</div>`;
    });

  return () => { cancelled = true; };
}

async function _fetch() {
  try {
    const c = await careCases();
    if (Array.isArray(c) && c.length) return c;
  } catch (_) {}
  try {
    const c = await compassionList();
    if (Array.isArray(c)) return c;
  } catch (_) {}
  return [];
}

function _row(p) {
  const name = p.name || p.fullName || p.displayName || p.memberName || 'A sheep';
  const why  = p.reason || p.note || p.summary
             || [p.careType || p.type, p.status].filter(Boolean).join(' — ')
             || '';
  const pid  = p.id || p.uid || p.caseId || '';
  return `
    <button type="button" data-pid="${_e(pid)}"
      style="display:flex; gap:10px; align-items:center; width:100%;
             padding:8px 4px; background:transparent; border:0; cursor:pointer;
             border-bottom:1px solid var(--line,#e5e7ef); text-align:left;">
      <div style="width:8px; height:8px; border-radius:50%; background:var(--accent,#e8a838); flex-shrink:0;"></div>
      <div style="flex:1; min-width:0;">
        <div style="font-weight:600; color:var(--ink,#1b264f); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${_e(name)}</div>
        <div style="color:var(--ink-muted,#7a7f96); font-size:0.85rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${_e(why)}</div>
      </div>
    </button>`;
}
function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
