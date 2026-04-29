/* ══════════════════════════════════════════════════════════════════════════════
   THE WATCHMEN — Telemetry & error reporting
   "I have set watchmen on your walls, O Jerusalem." — Isaiah 62:6

   Surfaces errors calmly to the user (via the_staff toast) and forwards to
   Nehemiah / TheVine for server-side logging when available. Never throws.

   Public API:
     report(err, ctx?) — log + toast (rate-limited)
     count()           — number of errors seen this session
   ══════════════════════════════════════════════════════════════════════════════ */

const MAX_TOASTS = 3;
let _seen = 0;

export function report(err, ctx = '') {
  _seen++;
  const message = _normalize(err);
  // Forward to TheVine if available — no hard dependency.
  try {
    if (window.TheVine && window.TheVine.john && window.TheVine.john.telemetry) {
      window.TheVine.john.telemetry.error({ message, ctx, ts: Date.now() }).catch(() => {});
    }
  } catch (_) { /* swallow */ }

  // User-facing toast (rate-limited).
  if (_seen <= MAX_TOASTS) _toast(message);

  // Console for devs.
  // eslint-disable-next-line no-console
  console.warn('[the_watchmen]', ctx, err);
}

export function count() { return _seen; }

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function _normalize(err) {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err.message) return err.message;
  try { return JSON.stringify(err); } catch (_) { return String(err); }
}

function _toast(msg) {
  // Lazy-load the toast vessel only when needed.
  import('./vessels/the_staff.js').then(({ raiseToast }) => {
    raiseToast({ tone: 'warn', message: msg });
  }).catch(() => { /* if toast fails, silent — never throw from watchmen */ });
}
