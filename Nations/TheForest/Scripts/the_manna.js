/* ══════════════════════════════════════════════════════════════════════════════
   THE MANNA — In-memory cache for view data
   "I will rain down bread from heaven for you." — Exodus 16:4

   Manna is daily bread: short-lived, plentiful, gathered fresh.
   This module is a small in-memory key/value cache with TTL + dedup of
   in-flight fetches. Sits in front of TheVine and the_upper_room.

   Public API:
     draw(key, fetcher, { ttl, persist })  — get from cache or run fetcher (deduped)
     swr(key, fetcher, onFresh, { ttl })
                                   — synchronous: return cached value (or
                                     undefined) immediately, refresh in
                                     background, call onFresh(value) when
                                     new data lands and differs.
     invalidate(keyOrPrefix?)      — clear one key, prefix, or everything
     peek(key)                     — synchronous get (or undefined)
     write(key, value, { ttl })    — manual put
     hydrate(map)                  — bulk-load { key: value } in-memory
     hydrateAll()                  — load ALL persisted manna:* keys from
                                     Cistern into memory at boot (instant
                                     warm cache for every view).
     wrap(prefix, target, opts)    — install auto-caching on every read
                                     method of an API namespace (e.g. wrap
                                     window.UpperRoom so all list/get/count
                                     calls cache + persist automatically).
   ══════════════════════════════════════════════════════════════════════════════ */

const DEFAULT_TTL = 60_000; // 1 minute
const _store = new Map();   // key -> { value, expires }
const _inflight = new Map(); // key -> Promise

export async function draw(key, fetcher, { ttl = DEFAULT_TTL, persist = false } = {}) {
  const hit = _store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  if (_inflight.has(key)) return _inflight.get(key);

  const p = Promise.resolve()
    .then(() => fetcher())
    .then((value) => {
      _store.set(key, { value, expires: Date.now() + ttl });
      _inflight.delete(key);
      if (persist && value !== undefined && value !== null) _persist(key, value);
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

/* ── Cistern persistence (lazy module ref to avoid circular import) ─────── */
let _cisternModP = null;
function _cistern() {
  if (!_cisternModP) _cisternModP = import('./the_cistern.js').catch(() => null);
  return _cisternModP;
}
function _persist(key, value) {
  _cistern().then((mod) => { if (mod) mod.write('manna:' + key, value).catch(() => {}); });
}

/**
 * Load every persisted manna:* key from Cistern into memory. Runs once at
 * boot before any view mounts so the FIRST read of any wrapped API call
 * resolves instantly from disk while a background refresh updates the cache.
 */
export async function hydrateAll() {
  const mod = await _cistern();
  if (!mod) return;
  try {
    const all = await mod.keys();
    const targets = (all || []).filter((k) => typeof k === 'string' && k.startsWith('manna:'));
    if (!targets.length) return;
    const pairs = await Promise.all(targets.map(async (k) => {
      try { return [k.slice(6), await mod.read(k)]; } catch (_) { return [k.slice(6), undefined]; }
    }));
    const map = {};
    for (const [k, v] of pairs) if (v !== undefined) map[k] = v;
    hydrate(map);
  } catch (_) { /* non-fatal */ }
}

/* ── API auto-wrap ──────────────────────────────────────────────────────── */

// Read-style method names: pure-data fetches that are safe to cache.
const _READ_RX = /^(list|get|count|search|browse|fetch|find|read|describe|all|own|my|today|next|upcoming|recent|due|pending|open|active|history|summary|stats|dashboard|care)/i;
// Listener / streaming methods — must bypass caching entirely.
const _LISTEN_RX = /^(listen|watch|on[A-Z]|subscribe|stream)/;
// Lifecycle / state accessors that should not be wrapped.
const _SKIP = new Set(['init','authenticate','signOut','isReady','detachAll','churchId','userEmail','live','ready']);

/**
 * Install auto-caching on every read method of an API namespace.
 *
 *   wrap('UR', window.UpperRoom);                 // 60s TTL default
 *   wrap('VINE.flock.members', vineMembers, { ttl: 5*60_000 });
 *
 * Read methods (list / get / count / etc.) are wrapped to:
 *   1. Build a stable cache key from method name + JSON-serialised args.
 *   2. Return cached value if fresh; otherwise call original + cache result.
 *   3. Persist result to Cistern under "manna:<prefix>:<method>:<args>".
 *
 * Listener methods (listen, watch, on-prefixed) and methods receiving function
 * args (callbacks) are passed through unchanged.
 *
 * Idempotent — calling wrap() twice on the same target is a no-op.
 */
export function wrap(prefix, target, { ttl = 5 * 60_000, ttlByMethod = {} } = {}) {
  if (!target || typeof target !== 'object') return;
  if (target.__mannaWrapped) return;
  try { Object.defineProperty(target, '__mannaWrapped', { value: true, enumerable: false }); }
  catch (_) { return; }

  for (const name of Object.keys(target)) {
    if (_SKIP.has(name)) continue;
    const fn = target[name];
    if (typeof fn !== 'function') continue;
    if (_LISTEN_RX.test(name)) continue;
    if (!_READ_RX.test(name)) continue;

    const methodTtl = ttlByMethod[name] != null ? ttlByMethod[name] : ttl;
    target[name] = function (...args) {
      // Skip cache when caller passes a callback (likely a listener).
      if (args.some((a) => typeof a === 'function')) return fn.apply(this, args);
      let argKey;
      try { argKey = args.length ? JSON.stringify(args) : ''; }
      catch (_) { return fn.apply(this, args); } // unserialisable args → bypass
      const key = prefix + ':' + name + (argKey ? ':' + argKey : '');
      return draw(key, () => fn.apply(target, args), { ttl: methodTtl, persist: true });
    };
  }
}
