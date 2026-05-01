/* ══════════════════════════════════════════════════════════════════════════════
   THE MEMBER PANE — Right-side member list (presence + open DM)
   "Be of one mind, live in peace." — 2 Corinthians 13:11

   Optional pane that views can render alongside a thread. Included now so
   the import path exists; not mounted by default in Phase I.
   ══════════════════════════════════════════════════════════════════════════════ */

import { presence, dms } from '../../Scripts/the_upper_room/index.js';

export function renderMemberPane(host, { members = [] } = {}) {
  if (!host) return () => {};
  host.style.cssText = `display:flex; flex-direction:column; gap:6px; padding:8px;`;
  host.innerHTML = members.map(_row).join('') ||
    `<div style="color:var(--ink-muted,#7a7f96); padding:8px;">No one to show.</div>`;

  let unwatch = () => {};
  presence.watch(members.map((m) => m.uid).filter(Boolean), (map) => {
    host.querySelectorAll('[data-uid]').forEach((el) => {
      const p = map[el.dataset.uid];
      const dot = el.querySelector('.dot');
      if (dot) dot.style.background = p && p.state === 'online' ? '#15803d' : '#cdd2dd';
    });
  }).then((u) => { unwatch = u; }).catch(() => {});

  host.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-uid]');
    if (!t) return;
    try { await dms.openWith(t.dataset.uid); } catch (_) {}
  });

  return () => { try { unwatch(); } catch (_) {} };
}

function _row(m) {
  return `
    <button type="button" data-uid="${_e(m.uid || '')}"
      style="display:flex; align-items:center; gap:8px; padding:6px 8px; border:0;
             background:transparent; cursor:pointer; border-radius:8px; text-align:left;
             color:var(--ink,#1b264f); font:500 0.9rem 'Noto Sans',sans-serif;">
      <span class="dot" style="width:8px;height:8px;border-radius:50%; background:#cdd2dd;"></span>
      <span>${_e(m.name || m.uid || '?')}</span>
    </button>`;
}
function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
