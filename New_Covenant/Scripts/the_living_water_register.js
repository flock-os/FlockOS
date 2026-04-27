/* ══════════════════════════════════════════════════════════════════════════════
   THE LIVING WATER — Service worker registration
   "Whosoever drinketh of the water that I shall give him shall never thirst." — John 4:14

   Registers the existing FlockOS service worker so the new shell ships with
   offline + push parity from boot. Does NOT replace the SW source; it just
   wires up the registration call from the new shell's boot path.

   Resolution order for the SW URL:
     1. window.FLOCK_SW_URL                                (build-injected)
     2. '/the_living_water.js'                             (sibling at site root)
     3. '../Covenant/Nations/FlockOS/the_living_water.js'  (dev, served alongside this folder)
   ══════════════════════════════════════════════════════════════════════════════ */

export async function register() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return { ok: false, reason: 'no-service-worker-support' };
  }
  if (location.protocol === 'file:') {
    return { ok: false, reason: 'file-protocol' };
  }

  const candidates = [];
  if (typeof window !== 'undefined' && window.FLOCK_SW_URL) candidates.push(window.FLOCK_SW_URL);
  candidates.push('/the_living_water.js');
  candidates.push('../Covenant/Nations/FlockOS/the_living_water.js');

  let lastErr = null;
  for (const url of candidates) {
    try {
      // Pre-flight: skip URLs that 404 to keep the console clean
      const probe = await fetch(url, { method: 'HEAD', cache: 'no-store' }).catch(() => null);
      if (!probe || !probe.ok) continue;
      // No explicit scope — defaults to the SW file's directory, avoiding scope violations
      // when the app is served from a subpath (e.g. /FlockOS/Covenant/Nations/FlockOS/)
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
