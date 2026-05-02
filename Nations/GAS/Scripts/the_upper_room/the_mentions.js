/* ══════════════════════════════════════════════════════════════════════════════
   THE MENTIONS — @mention parsing + highlight
   "He calleth his own sheep by name." — John 10:3

   Two jobs:
     1. parse(text)        — return a list of mentioned handles
     2. render(text, members) — return safe HTML with <mark>@handle</mark>
   ══════════════════════════════════════════════════════════════════════════════ */

const RX = /(^|[\s(])@([A-Za-z0-9_.\-]{2,})/g;

export function parse(text) {
  if (!text) return [];
  const out = new Set();
  String(text).replace(RX, (_, _pre, handle) => { out.add(handle.toLowerCase()); return _; });
  return Array.from(out);
}

export function render(text, members = []) {
  const set = new Set(members.map((m) => String(m.handle || m.id).toLowerCase()));
  return _esc(text).replace(RX, (m, pre, handle) => {
    const known = set.has(handle.toLowerCase());
    const cls = known ? 'mention mention-known' : 'mention';
    return `${pre}<mark class="${cls}">@${_esc(handle)}</mark>`;
  });
}

function _esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
