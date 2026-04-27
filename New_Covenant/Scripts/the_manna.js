/* ══════════════════════════════════════════════════════════════════════════════
   THE MANNA — In-memory cache for view data
   "I will rain down bread from heaven for you." — Exodus 16:4

   Manna is daily bread: short-lived, plentiful, gathered fresh.
   This module is a small in-memory key/value cache with TTL + dedup of
   in-flight fetches. Sits in front of TheVine and the_upper_room.

   Public API:
     draw(key, fetcher, { ttl })  — get from cache or run fetcher (deduped)
     swr(key, fetcher, onFresh, { ttl })
                                   — synchronous: return cached value (or
                                     undefined) immediately, refresh in
                                     background, call onFresh(value) when
                                     new data lands and differs.
     invalidate(keyOrPrefix?)      — clear one key, prefix, or everything
     peek(key)                     — synchronous get (or undefined)
     write(key, value, { ttl })    — manual put
     hydrate(map)                  — bulk-load { key: value } at boot
   ══════════════════════════════════════════════════════════════════════════════ */

const DEFAULT_TTL = 60_000; // 1 minute
const _store = new Map();   // key -> { value, expires }
const _inflight = new Map(); // key -> Promise

export async function draw(key, fetcher, { ttl = DEFAULT_TTL } = {}) {
  const hit = _store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  if (_inflight.has(key)) return _inflight.get(key);

  const p = Promise.resolve()
    .then(() => fetcher())
    .then((value) => {
      _store.set(key, { value, expires: Date.now() + ttl });
      _inflight.delete(key);
      return value;
    })
    .catch((err) => {
      _inflight.delete(key);
      throw err;
    });

  _inflight.set(key, p);
  return p;
}

/**
 * Stale-while-revalidate. Returns the cached value SYNCHRONOUSLY (or
 * undefined). Always kicks off a background refresh; calls onFresh(value)
 * when a new value lands that differs from the one returned. If the cache
 * is still fresh (within TTL), no refresh is fired.
 */
export function swr(key, fetcher, onFresh, { ttl = DEFAULT_TTL } = {}) {
  const hit = _store.get(key);
  const cached = hit ? hit.value : undefined;
  const fresh  = hit && hit.expires > Date.now();

  if (!fresh) {
    // Fire-and-forget refresh; dedup via draw().
    draw(key, fetcher, { ttl })
      .then((value) => {
        if (typeof onFresh === 'function' && !_shallowEqual(cached, value)) {
          try { onFresh(value); } catch (_) { /* swallow */ }
        }
      })
      .catch(() => { /* leave cached as-is */ });
  }

  return cached;
}

function _shallowEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a == null || b == null) return false;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    return false; // arrays: always treat as different (cheap and safe)
  }
  return false;
}

export function invalidate(keyOrPrefix) {
  if (keyOrPrefix == null) { _store.clear(); return; }
  if (_store.has(keyOrPrefix)) { _store.delete(keyOrPrefix); return; }
  for (const k of _store.keys()) {
    if (k.startsWith(keyOrPrefix)) _store.delete(k);
  }
}

export function peek(key) {
  const hit = _store.get(key);
  return hit ? hit.value : undefined;
}

export function write(key, value, { ttl = DEFAULT_TTL } = {}) {
  _store.set(key, { value, expires: Date.now() + ttl });
}

/**
 * Bulk-load cached values at boot (typically from Cistern). Loaded values
 * are inserted with a SHORT (1ms) expiry so swr() will trigger a refresh
 * on first read but peek() still returns them for instant first paint.
 */
export function hydrate(map) {
  if (!map) return;
  for (const [key, value] of Object.entries(map)) {
    if (value === undefined) continue;
    _store.set(key, { value, expires: 1 });
  }
}
