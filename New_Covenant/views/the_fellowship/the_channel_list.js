/* ══════════════════════════════════════════════════════════════════════════════
   THE CHANNEL LIST — Firebase channels pane
   "There is one body, and one Spirit." — Ephesians 4:4
   ══════════════════════════════════════════════════════════════════════════════ */

import { channels, unread, seeding } from '../../Scripts/the_upper_room/index.js';
import { renderThread } from './the_thread.js';

export function renderChannelsPane(host /*, ctx */) {
  if (!host) return () => {};
  host.style.cssText = `display:grid; grid-template-columns: 220px 1fr; gap: 16px; min-height: 60vh;`;
  host.innerHTML = `
    <aside class="ch-list" style="border-right:1px solid var(--line,#e5e7ef); padding-right:10px;"></aside>
    <div class="ch-thread"></div>
  `;
  const list   = host.querySelector('.ch-list');
  const thread = host.querySelector('.ch-thread');
  list.innerHTML = `<flock-skeleton rows="5"></flock-skeleton>`;
  thread.innerHTML = `<div style="color:var(--ink-muted,#7a7f96); padding:24px 8px;">Pick a channel to begin.</div>`;

  let stopThread = null;
  let activeId   = null;

  function paint(rows = []) {
    list.innerHTML = rows.length ? rows.map(_row).join('') :
      `<div style="color:var(--ink-muted,#7a7f96); padding:8px;">No channels yet.</div>`;
    list.querySelectorAll('[data-ch]').forEach((el) => {
      el.addEventListener('click', () => {
        if (activeId === el.dataset.ch) return;
        activeId = el.dataset.ch;
        list.querySelectorAll('[data-ch]').forEach((n) => n.style.background = 'transparent');
        el.style.background = 'var(--bg,#f7f8fb)';
        if (stopThread) try { stopThread(); } catch (_) {}
        unread.mark(activeId);
        stopThread = renderThread(thread, { channelId: activeId });
      });
    });
  }

  // Seed defaults idempotently then watch.
  seeding.seed().catch(() => {});
  let unwatch = () => {};
  channels.watch(paint).then((u) => { unwatch = u; }).catch(() => {
    list.innerHTML = `<div style="color:var(--ink-muted,#7a7f96); padding:8px;">Comms backend not loaded.</div>`;
  });

  return () => { try { unwatch(); } catch (_) {} if (stopThread) try { stopThread(); } catch (_) {} };
}

function _row(c) {
  const badge = c && c.unread ? `<span style="background:var(--accent,#e8a838); color:#fff; padding:1px 6px; border-radius:10px; font-size:0.72rem;">${c.unread}</span>` : '';
  return `
    <button data-ch="${_e(c.id)}" type="button"
      style="display:flex; align-items:center; gap:8px; width:100%; padding:8px 10px;
             border:0; background:transparent; cursor:pointer; border-radius:8px;
             color:var(--ink,#1b264f); text-align:left; font:500 0.92rem 'Noto Sans',sans-serif;">
      <span style="color:var(--ink-muted,#7a7f96);">#</span>
      <span style="flex:1;">${_e(c.name || c.id)}</span>
      ${badge}
    </button>`;
}
function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
