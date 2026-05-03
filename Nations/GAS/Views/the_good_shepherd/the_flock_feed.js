/* ══════════════════════════════════════════════════════════════════════════════
   THE FLOCK FEED — Recent interactions strip on the home page
   "And the books were opened." — Revelation 20:12

   Pulls the last few entries from the unified comms façade
   (Scripts/the_comms.js summary()) which spans GAS / Firebase / FlockChat,
   and renders them as a compact list. Click a row → jump to Fellowship.
   ══════════════════════════════════════════════════════════════════════════════ */

import { draw, swr } from '../../Scripts/the_manna.js';
import { summary } from '../../Scripts/the_comms.js';

const KEY = 'shepherd:feed';
const TTL = 5 * 60_000; // align with pre-warm TTL — boot value stays valid

export function mountFlockFeed(host, ctx) {
  if (!host) return () => {};
  let cancelled = false;

  const render = (s) => {
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
  };

  const cached = swr(KEY, () => summary(), render, { ttl: TTL });
  if (cached !== undefined) {
    render(cached);
  } else {
    draw(KEY, () => summary(), { ttl: TTL })
      .then(render)
      .catch(() => {
        if (!cancelled && host.isConnected) {
          host.innerHTML = `<div style="color: var(--ink-muted, #7a7f96);">Pastoral ledger unavailable right now.</div>`;
        }
      });
  }

  return () => { cancelled = true; };
}

// Type metadata matching the_scrolls.js
const _TYPE_META = {
  profile_view:       { icon: '\uD83D\uDC64', label: 'Viewed Profile' },
  profile_save:       { icon: '\uD83D\uDCBE', label: 'Saved Profile' },
  call:               { icon: '\uD83D\uDCDE', label: 'Phone Call' },
  text:               { icon: '\uD83D\uDCAC', label: 'Text Message' },
  email:              { icon: '\uD83D\uDCE7', label: 'Email' },
  visit:              { icon: '\uD83C\uDFE0', label: 'Visit' },
  note:               { icon: '\uD83D\uDCDD', label: 'Note' },
  prayer:             { icon: '\uD83D\uDE4F', label: 'Prayer' },
  prayer_reply:       { icon: '\uD83D\uDE4F', label: 'Prayer Reply' },
  care_create:        { icon: '\u2764\uFE0F', label: 'Care Case Opened' },
  care_update:        { icon: '\u2764\uFE0F', label: 'Care Updated' },
  care_resolve:       { icon: '\u2705',       label: 'Care Resolved' },
  care_interaction:   { icon: '\u2764\uFE0F', label: 'Care Interaction' },
  member_create:      { icon: '\uD83D\uDC64', label: 'Member Created' },
  reconciliation:     { icon: '\uD83E\uDD1D', label: 'Reconciliation' },
};

function _row(r) {
  const meta   = _TYPE_META[r.type] || {};
  const icon   = meta.icon || r.icon || '\u00B7';
  const name   = r.personName || r.label || '';
  const detail = [meta.label || r.type, r.detail].filter(Boolean).join(' \u2014 ');
  return `
    <button type="button" data-jump class="feed-row">
      <div class="feed-row-icon">${_e(icon)}</div>
      <div class="feed-row-body">
        <div class="feed-row-label">${_e(name || detail)}</div>
        <div class="feed-row-detail">${_e(name ? detail : '')}</div>
      </div>
      <div class="feed-row-time">${_when(r.ts || r.timestamp)}</div>
    </button>`;
}
function _when(ts) {
  if (!ts) return '';
  try {
    // Handle Firestore Timestamp objects
    const ms  = ts?.seconds ? ts.seconds * 1000 : new Date(ts).getTime();
    if (!ms || isNaN(ms)) return '';
    const delta = (Date.now() - ms) / 1000;
    if (delta < 60)    return 'just now';
    if (delta < 3600)  return `${Math.floor(delta / 60)}m`;
    if (delta < 86400) return `${Math.floor(delta / 3600)}h`;
    return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (_) { return ''; }
}
function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
