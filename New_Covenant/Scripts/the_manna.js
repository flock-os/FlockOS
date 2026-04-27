/* ══════════════════════════════════════════════════════════════════════════════
   THE MANNA — In-memory cache for view data
   "I will rain down bread from heaven for you." — Exodus 16:4

   Manna is daily bread: short-lived, plentiful, gathered fresh.
   This module is a small in-memory key/value cache with TTL + dedup of
   in-flight fetches. Sits in front of TheVine and the_upper_room.

   Public API:
     draw(key, fetcher, { ttl })  — get from cache or run fetcher (deduped)
     invalidate(keyOrPrefix?)      — clear one key, prefix, or everything
     peek(key)                     — synchronous get (or undefined)
     write(key, value, { ttl })    — manual put
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

export function invalidate(keyOrPrefix) {
  if (keyOrPrefix == null) { _store.clear(); return; }
  if (_store.has(keyOrPrefix)) { _store.delete(keyOrPrefix); return; }
  for (const k of _store.keys()) {
    if (k.startsWith(keyOrPrefix)) _store.delete(k);
  }
}

export function peek(key) {
  const hit = _store.get(key);
  return hit && hit.expires > Date.now() ? hit.value : undefined;
}

export function write(key, value, { ttl = DEFAULT_TTL } = {}) {
  _store.set(key, { value, expires: Date.now() + ttl });
}
