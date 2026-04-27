/* ══════════════════════════════════════════════════════════════════════════════
   THE DM DRAWER — Direct message threads
   "A friend loveth at all times." — Proverbs 17:17
   ══════════════════════════════════════════════════════════════════════════════ */

import { dms } from '../../Scripts/the_upper_room/index.js';
import { renderThread } from './the_thread.js';

export function renderDmsPane(host /*, ctx */) {
  if (!host) return () => {};
  host.style.cssText = `display:grid; grid-template-columns: 240px 1fr; gap:16px; min-height: 60vh;`;
  host.innerHTML = `
    <aside style="border-right:1px solid var(--line,#e5e7ef); padding-right:10px;" data-bind="list">
      <flock-skeleton rows="5"></flock-skeleton>
    </aside>
    <div data-bind="thread">
      <div style="color:var(--ink-muted,#7a7f96); padding:24px 8px;">Pick a conversation, or start one from a person’s profile.</div>
    </div>
  `;
  const list   = host.querySelector('[data-bind="list"]');
  const thread = host.querySelector('[data-bind="thread"]');

  let unwatch = () => {};
  let stop    = null;

  dms.watch((rows = []) => {
    list.innerHTML = rows.length ? rows.map(_row).join('') :
      `<div style="color:var(--ink-muted,#7a7f96); padding:8px;">No DMs yet.</div>`;
    list.querySelectorAll('[data-tid]').forEach((el) => {
      el.addEventListener('click', () => {
        if (stop) try { stop(); } catch (_) {}
        stop = renderThread(thread, { channelId: el.dataset.tid });
      });
    });
  }).then((u) => { unwatch = u; }).catch(() => {});

  return () => { try { unwatch(); } catch (_) {} if (stop) try { stop(); } catch (_) {} };
}

function _row(t) {
  const who = t.title || (t.participants || []).join(' & ');
  return `
    <button type="button" data-tid="${_e(t.id)}"
      style="display:flex; gap:8px; align-items:center; width:100%; padding:8px 10px;
             border:0; background:transparent; cursor:pointer; border-radius:8px;
             color:var(--ink,#1b264f); text-align:left; font:500 0.92rem 'Noto Sans',sans-serif;">
      <span style="color:var(--ink-muted,#7a7f96);">@</span>
      <span style="flex:1;">${_e(who)}</span>
    </button>`;
}
function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
