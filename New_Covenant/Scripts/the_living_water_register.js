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
      // No explicit scope — defaults to the SW file's directory, which (because
      // the SW is a sibling of index.html) covers the entire app shell.
      const reg = await navigator.serviceWorker.register(url);
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
