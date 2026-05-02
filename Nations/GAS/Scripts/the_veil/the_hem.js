/* ══════════════════════════════════════════════════════════════════════════════
   THE HEM — Footer (the_veil)
   "If I may but touch the hem of his garment, I shall be whole." — Matthew 9:21
   ══════════════════════════════════════════════════════════════════════════════ */

import { churchId } from '../the_upper_room/index.js';

export function mountHem(host) {
  if (!host) return;
  host.classList.add('veil-foot');
  const year = new Date().getFullYear();
  let cid = '';
  try { cid = churchId(); } catch (_) {}
  host.innerHTML = `
    <span>FlockOS · ${year}</span>
    <span>·</span>
    <span>${cid ? `Church: <strong style="color:var(--ink,#1b264f); font-weight:600;">${_e(cid)}</strong>` : ''}</span>
    <div class="veil-foot-spacer"></div>
    <a href="?view=about_flockos">About</a>
    <span>·</span>
    <a href="?view=learn_more">Help</a>
    <span>·</span>
    <span>Built for the body of Christ.</span>
  `;
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
