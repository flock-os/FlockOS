/* ══════════════════════════════════════════════════════════════════════════════
   THE LIVING WATER — Service worker registration
   "Whosoever drinketh of the water that I shall give him shall never thirst." — John 4:14

   Registers the New Covenant service worker (sibling to index.html) so the
   shell ships with offline + push parity from boot. The SW MUST live next to
   index.html for its scope to cover the entire New_Covenant app — registering
   a SW from a different folder (e.g. ../Covenant/Nations/FlockOS/) restricts
   scope to that folder and silently leaves these pages uncached.

   Resolution order for the SW URL:
     1. window.FLOCK_SW_URL          (build-injected override)
     2. './the_living_water.js'      (LOCAL sibling — scope = New_Covenant/)
     3. '/the_living_water.js'       (Firebase root deploy)
   ══════════════════════════════════════════════════════════════════════════════ */

// Resolve the local SW URL relative to THIS module's location so we always
// hit the SW that sits next to index.html, regardless of where the app is
// mounted (GitHub Pages subpath, Firebase root, custom domain, etc.).
const LOCAL_SW_URL = new URL('../the_living_water.js', import.meta.url).href;

export async function register() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return { ok: false, reason: 'no-service-worker-support' };
  }
  if (location.protocol === 'file:') {
    return { ok: false, reason: 'file-protocol' };
  }

  const candidates = [];
  if (typeof window !== 'undefined' && window.FLOCK_SW_URL) candidates.push(window.FLOCK_SW_URL);
  candidates.push(LOCAL_SW_URL);
  candidates.push('/the_living_water.js');

  let lastErr = null;
  for (const url of candidates) {
    try {
      // Pre-flight: skip URLs that 404 to keep the console clean
      const probe = await fetch(url, { method: 'HEAD', cache: 'no-store' }).catch(() => null);
      if (!probe || !probe.ok) continue;
      // updateViaCache:'none' so the browser ALWAYS revalidates the SW script
      // itself (otherwise the HTTP cache can serve a stale SW for hours).
      const reg = await navigator.serviceWorker.register(url, { updateViaCache: 'none' });

      // ── Auto-update flow ────────────────────────────────────────────────
      // Force a check on every page load so a fresh deploy installs the new
      // SW within seconds instead of waiting for the browser's lazy 24h check.
      try { reg.update(); } catch (_) {}

      // When the new SW finishes installing, tell it to skipWaiting so it
      // becomes the active SW immediately (without requiring a tab close).
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            // A previous SW is controlling — politely ask the new one to take over.
            try { sw.postMessage({ type: 'SKIP_WAITING' }); } catch (_) {}
          }
        });
      });

      // When the controller actually swaps to the new SW, force a one-time
      // page reload so the user runs the new bundle, not the cached one.
      let _reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (_reloaded) return;
        _reloaded = true;
        window.location.reload();
      });

      return { ok: true, url, scope: reg.scope };
    } catch (err) { lastErr = err; }
  }
  return { ok: false, reason: 'register-failed', error: lastErr && lastErr.message };
}

export async function unregister() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return false;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((r) => r.unregister().catch(() => false)));
  return true;
}

/* ──────────────────────────────────────────────────────────────────────────────
   forceRefresh()
   Call this to wipe all SW caches and reload from the network. Useful after a
   deployment when you want users to get the latest version immediately without
   waiting for the browser's 24-hour SW update cycle.

   From DevTools console: FlockSW.forceRefresh()
   From a URL param:      add ?flock_refresh=1 to any page URL
   ────────────────────────────────────────────────────────────────────────── */
export async function forceRefresh() {
  // 1. Delete every cache entry this origin owns.
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  } catch (_) {}

  // 2. Unregister the SW so it re-installs cleanly on next load
  //    (the new SW will re-precache everything on install).
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister().catch(() => {})));
  } catch (_) {}

  // 3. Hard-reload from network, stripping ?flock_refresh=1 to avoid an
  //    infinite reload loop if this function was triggered by the URL param.
  const reloadUrl = new URL(location.href);
  reloadUrl.searchParams.delete('flock_refresh');
  location.replace(reloadUrl.href);
}

/* Expose on window so forceRefresh() is callable from DevTools without imports */
if (typeof window !== 'undefined') {
  window.FlockSW = { forceRefresh, unregister };
}

/* Auto-trigger if page was opened with ?flock_refresh=1 */
if (typeof location !== 'undefined' &&
    new URLSearchParams(location.search).get('flock_refresh') === '1') {
  forceRefresh();
}
