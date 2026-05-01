/* ══════════════════════════════════════════════════════════════════════════════
   THE LEGACY BRIDGE — Adapter to the legacy global-namespace modules
   "I am not come to destroy, but to fulfil." — Matthew 5:17

   The new shell ships ahead of the file splits. Every existing module
   (TheShepherd, TheFold, …) currently lives on `window` from the legacy
   bundle. This bridge gives the new ES-module world a single, predictable
   way to reach them — and a single place to swap when each module is
   actually split into files.

   Public API:
     bridge(globalName, fallback?)  — returns the live legacy export
     when(globalName)               — Promise that resolves once it appears
     callWhen(globalName, method, …args) — call the legacy method when ready

   Each split-module shim (Scripts/the_shepherd/index.js, etc.) imports from
   here. When a real split lands, the shim replaces its bridge() call with
   real exports — call sites don't change.
   ══════════════════════════════════════════════════════════════════════════════ */

const _waiters = new Map(); // globalName -> Promise

export function bridge(globalName, fallback = null) {
  return globalThis[globalName] || fallback;
}

export function when(globalName, { timeoutMs = 8000, intervalMs = 50 } = {}) {
  if (globalThis[globalName]) return Promise.resolve(globalThis[globalName]);
  if (_waiters.has(globalName)) return _waiters.get(globalName);
  const p = new Promise((resolve, reject) => {
    const t0 = Date.now();
    const tick = () => {
      if (globalThis[globalName]) return resolve(globalThis[globalName]);
      if (Date.now() - t0 > timeoutMs) return reject(new Error(`legacy '${globalName}' never appeared`));
      setTimeout(tick, intervalMs);
    };
    tick();
  });
  _waiters.set(globalName, p);
  return p;
}

export async function callWhen(globalName, method, ...args) {
  const M = await when(globalName);
  if (!M || typeof M[method] !== 'function') {
    throw new Error(`legacy '${globalName}.${method}' not callable`);
  }
  return M[method](...args);
}
