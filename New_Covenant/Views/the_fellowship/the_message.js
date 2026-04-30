/* ══════════════════════════════════════════════════════════════════════════════
   THE MESSAGE — Single message renderer
   "Let your speech be alway with grace, seasoned with salt." — Colossians 4:6
   ══════════════════════════════════════════════════════════════════════════════ */

import { render as renderMentions } from '../../Scripts/the_upper_room/the_mentions.js';

export function renderMessage(m) {
  if (!m) return '';
  // Firestore stores senderName/sentAt; legacy/GAS uses authorName/author/ts
  const author = _e(m.senderName || m.authorName || m.author || 'Unknown');
  const rawTs  = m.sentAt || m.ts;
  const ts     = rawTs ? _time(rawTs) : '';
  const initials = _initials(author);
  const body  = renderMentions(String(m.body || m.text || ''), m.knownMembers || []);
  return `
    <div class="msg" style="display:flex; gap:10px; align-items:flex-start; padding:6px 4px;">
      <div style="width:32px; height:32px; flex:none; border-radius:50%;
                  background:var(--accent,#e8a838); color:#fff;
                  display:flex; align-items:center; justify-content:center;
                  font:600 0.8rem 'Noto Sans',sans-serif;">${initials}</div>
      <div style="min-width:0;">
        <div style="display:flex; align-items:baseline; gap:8px;">
          <span style="font-weight:600; color:var(--ink,#1b264f);">${author}</span>
          <span style="font-size:0.78rem; color:var(--ink-muted,#7a7f96);">${ts}</span>
        </div>
        <div style="white-space:pre-wrap; color:var(--ink,#1b264f);">${body}</div>
      </div>
    </div>`;
}

function _initials(s) {
  return String(s).trim().split(/\s+/).slice(0, 2).map((p) => p[0] || '').join('').toUpperCase() || '?';
}
function _time(ts) {
  try {
    // Firestore Timestamp objects have a .seconds property
    const ms = ts?.seconds ? ts.seconds * 1000 : new Date(ts).getTime();
    if (!ms || isNaN(ms)) return '';
    return new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  catch (_) { return ''; }
}
function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
