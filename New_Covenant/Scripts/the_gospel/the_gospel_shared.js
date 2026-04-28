/* ══════════════════════════════════════════════════════════════════════════════
   THE GOSPEL — Shared helpers for every learning-hub module
   "Grow in the grace and knowledge of our Lord and Savior Jesus Christ." — 2 Peter 3:18

   Tiny utilities used by every module under Scripts/the_gospel/*. Nothing
   here touches the DOM directly — these are pure helpers + a single
   backend resolver that returns the active UpperRoom (Firestore) instance
   when authenticated, and the GAS-bridge fallback otherwise.
   ══════════════════════════════════════════════════════════════════════════════ */

/** Return the live Firestore-backed UpperRoom if it's ready; else null. */
export function ur() {
  const u = window.UpperRoom;
  if (u && typeof u.isReady === 'function' && u.isReady()) return u;
  return null;
}

/** Return the legacy TheVine backend (GAS RPC bridge) if present. */
export function vine() {
  return window.TheVine || null;
}

/** Current authenticated session ({email, displayName, …}) or empty {}. */
export function session() {
  try { return (window.TheVine && window.TheVine.session && window.TheVine.session()) || {}; }
  catch (_) { return {}; }
}

/** Normalise a backend response into a plain array of rows. */
export function rows(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.rows)) return res.rows;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.results)) return res.results;
  if (Array.isArray(res.items)) return res.items;
  return [];
}

/** HTML-escape any value safely. */
export function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Strip basic HTML for previews. */
export function stripHtml(s) {
  return String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

/** Truncate a string for card previews, ellipsising on word boundary. */
export function snip(s, n = 140) {
  const t = String(s == null ? '' : s).trim();
  if (t.length <= n) return t;
  return t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
}

/** Format a date / Firestore Timestamp / millis / ISO string for the UI. */
export function fmtDate(ts, opts) {
  if (!ts) return '';
  const o = opts || { month: 'short', day: 'numeric', year: 'numeric' };
  try {
    const d = new Date(typeof ts === 'object' && ts.seconds ? ts.seconds * 1000 : ts);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, o);
  } catch (_) { return ''; }
}

/** Time-ago (rough) — for activity strips. */
export function timeAgo(ts) {
  if (!ts) return '';
  const d = new Date(typeof ts === 'object' && ts.seconds ? ts.seconds * 1000 : ts);
  if (isNaN(d.getTime())) return '';
  const s = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1000));
  if (s < 60) return s + 's ago';
  const m = Math.floor(s / 60); if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60); if (h < 24) return h + 'h ago';
  const dy = Math.floor(h / 24); if (dy < 7) return dy + 'd ago';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Empty state — a polished placeholder used by every grow-module. */
export function emptyState({ icon, title, body, action } = {}) {
  return /* html */`
    <div class="grow-empty">
      ${icon ? `<div class="grow-empty-icon" aria-hidden="true">${icon}</div>` : ''}
      <div class="grow-empty-title">${esc(title || 'Nothing here yet')}</div>
      ${body ? `<div class="grow-empty-body">${esc(body)}</div>` : ''}
      ${action || ''}
    </div>
  `;
}

/** "Backend not loaded" message reused everywhere. */
export function backendOffline(label = 'Content backend not loaded.') {
  return emptyState({
    icon: '⛓️',
    title: label,
    body: 'Sign in to load live content from the church library.',
  });
}

/** Loading shimmer — a row-count of pulsing cards. */
export function loadingCards(n = 3) {
  return /* html */`
    <div class="grow-skel-grid">
      ${Array.from({ length: n }).map(() => `<div class="grow-skel-card"></div>`).join('')}
    </div>
  `;
}

/** Bible-link if the_bible_link helper is present; otherwise plain text. */
export function bibleLink(ref) {
  // the_scrolls/the_bible_link installs an idempotent observer that auto-links
  // any plain "John 3:16" text. So we just return the escaped string.
  return esc(ref);
}

/** Chip / pill tag (consistent across all modules). */
export function chip(text, variant = 'neutral') {
  return /* html */`<span class="grow-chip grow-chip--${variant}">${esc(text)}</span>`;
}

/** Section header used inside every grow-module. */
export function sectionHead(title, action) {
  return /* html */`
    <div class="grow-section-head">
      <h2 class="grow-section-title">${esc(title)}</h2>
      ${action || ''}
    </div>
  `;
}
