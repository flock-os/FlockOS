/* ══════════════════════════════════════════════════════════════════════════════
   THE FLOCK FEED — Recent interactions strip on the home page
   "And the books were opened." — Revelation 20:12

   Pulls the last few entries from the unified comms façade
   (Scripts/the_comms.js summary()) which spans GAS / Firebase / FlockChat,
   and renders them as a compact list. Click a row → jump to Fellowship.
   ══════════════════════════════════════════════════════════════════════════════ */

import { draw } from '../../Scripts/the_manna.js';
import { summary } from '../../Scripts/the_comms.js';

export function mountFlockFeed(host, ctx) {
  if (!host) return () => {};
  let cancelled = false;

  draw('shepherd:feed', () => summary(), { ttl: 20_000 })
    .then((s) => {
      if (cancelled || !host.isConnected) return;
      const rows = (s && s.recentInteractions) || [];
      if (!rows.length) {
        host.innerHTML = `<div style="color: var(--ink-muted, #7a7f96);">No recent interactions yet.</div>`;
        return;
      }
      host.innerHTML = rows.slice(0, 6).map(_row).join('');
      host.querySelectorAll('[data-jump]').forEach((el) => {
        el.addEventListener('click', () => ctx.go && ctx.go('the_fellowship'));
      });
    })
    .catch(() => {
      if (cancelled || !host.isConnected) return;
      host.innerHTML = `<div style="color: var(--ink-muted, #7a7f96);">Pastoral ledger unavailable right now.</div>`;
    });

  return () => { cancelled = true; };
}

function _row(r) {
  return `
    <button type="button" data-jump class="feed-row">
      <div class="feed-row-icon">${_e(r.icon || '·')}</div>
      <div class="feed-row-body">
        <div class="feed-row-label">${_e(r.label || r.type || 'Interaction')}</div>
        <div class="feed-row-detail">${_e(r.detail || '')}</div>
      </div>
      <div class="feed-row-time">${_when(r.ts || r.timestamp)}</div>
    </button>`;
}
function _when(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts), now = Date.now(), delta = (now - d.getTime()) / 1000;
    if (delta < 60)        return 'just now';
    if (delta < 3600)      return `${Math.floor(delta / 60)}m`;
    if (delta < 86400)     return `${Math.floor(delta / 3600)}h`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (_) { return ''; }
}
function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
