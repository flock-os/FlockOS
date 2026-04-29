/* ══════════════════════════════════════════════════════════════════════════════
   THE LIFE — Pastoral command-hub: care, prayer, compassion, outreach, etc.
   "In him was life; and the life was the light of men." — John 1:4
   ══════════════════════════════════════════════════════════════════════════════ */

import { bridge, when, callWhen } from '../the_legacy_bridge.js';

const NAME = 'TheLife';

export const ready = () => when(NAME);
export const live  = () => bridge(NAME);

/* ── TheVine-backed data accessors ────────────────────────────────────────── */

function _rows(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.rows)) return res.rows;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

const _TERMINAL = new Set(['resolved','closed','archived','cancelled','denied','completed','answered','inactive','deleted']);

export async function careCases() {
  const V = window.TheVine;
  if (!V) return [];
  // Fetch all cases — don't filter by status on the API side because field
  // values vary ('Open', 'In Progress', 'Follow-Up', not 'Active').
  const res = await V.flock.care.list({});
  return _rows(res).filter(r => !_TERMINAL.has((r.status || '').toLowerCase()));
}

export async function prayerRequests() {
  // UpperRoom (Firestore) is the authoritative backend for prayer requests.
  // allUsers:true so pastors see everyone's requests, not just their own.
  const UR = window.UpperRoom;
  if (UR && typeof UR.listPrayers === 'function') {
    try {
      const rows = await UR.listPrayers({ allUsers: true, limit: 100 });
      return Array.isArray(rows) ? rows : _rows(rows);
    } catch (_) {}
  }
  // TheVine fallback (GAS-backed churches)
  const V = window.TheVine;
  if (!V) return [];
  const res = await V.flock.prayer?.list({ limit: 100 }) ?? [];
  return _rows(res);
}

export async function compassionList() {
  const V = window.TheVine;
  if (!V) return [];
  // Try the dedicated follow-ups endpoint first; fall back to the active care queue.
  try {
    const res = await V.flock.care.followUps?.due();
    const rows = _rows(res);
    if (rows.length) return rows;
  } catch (_) {}
  return careCases();
}

export async function pendingCount() {
  // If the eager warm-up has already received a count, return it instantly
  // — no awaiting backend, no round-trip. This is what makes the badge
  // appear the moment the sidebar paints after login.
  if (_warmCount !== null) return _warmCount;
  // Wait briefly for a backend (Firestore via UpperRoom, or GAS via TheVine)
  // so a fresh login doesn't return 0 and leave the badge hidden until the
  // next sidebar tick.
  await _awaitBackend(15_000);
  const UR = window.UpperRoom;
  // Firestore-first: use the dedicated careCasesRef so we don't pull the GAS
  // queue, which is often slower / stale on fresh sessions.
  if (UR && typeof UR.isReady === 'function' && UR.isReady() && typeof UR.careCasesRef === 'function') {
    try {
      // Match the view's ordered query so the count agrees with the queue.
      const ref = UR.careCasesRef();
      const query = (typeof ref.orderBy === 'function')
        ? ref.orderBy('createdAt', 'desc')
        : ref;
      const snap = await query.get();
      let open = 0;
      snap.forEach((doc) => {
        const d = doc.data() || {};
        const s = String(d.status || d.Status || '').trim().toLowerCase();
        if (!_TERMINAL.has(s)) open++;
      });
      return open;
    } catch (_) { /* fall through to GAS */ }
  }
  const rows = await careCases();
  return rows.length;
}

/* Real-time open-case count via Firestore onSnapshot.
   Returns an unsubscribe function. Falls back to a one-shot count + 60s
   polling if Firestore isn't available. The_pillars subscribes once at
   mount so the Pastoral Care badge stays accurate without polling.       */
export function subscribeOpenCareCount(cb) {
  if (typeof cb !== 'function') return () => {};
  let unsub = () => {};
  let cancelled = false;
  const _t0 = Date.now();
  console.log('[CARE-BADGE] subscribeOpenCareCount() entry');

  (async () => {
    await _awaitBackend(15_000);
    if (cancelled) return;
    const UR = window.UpperRoom;
    const fsReady = !!(UR && typeof UR.isReady === 'function' && UR.isReady());
    console.log('[CARE-BADGE] _awaitBackend resolved in ' + (Date.now() - _t0) + 'ms — fsReady=' + fsReady + ', hasUR=' + !!UR + ', hasCareCasesRef=' + !!(UR && UR.careCasesRef));

    // Firestore real-time path
    if (fsReady && typeof UR.careCasesRef === 'function') {
      try {
        console.log('[CARE-BADGE] attaching onSnapshot…');
        // IMPORTANT: order by createdAt to match the query used by the
        // Pastoral Care view (UR.listCareCases → orderBy('createdAt','desc')).
        // Without this, the badge counts docs missing `createdAt` that the
        // view's ordered query silently excludes — producing a count that
        // disagrees with the visible queue (e.g. badge=21, tiles=19).
        const ref = UR.careCasesRef();
        const query = (typeof ref.orderBy === 'function')
          ? ref.orderBy('createdAt', 'desc')
          : ref;
        unsub = query.onSnapshot((snap) => {
          let open = 0;
          const openRows = [];
          snap.forEach((doc) => {
            const d = doc.data() || {};
            const s = String(d.status || d.Status || '').trim().toLowerCase();
            if (!_TERMINAL.has(s)) {
              open++;
              openRows.push(Object.assign({ id: doc.id }, d));
            }
          });
          console.log('[CARE-BADGE] snapshot fired: ' + snap.size + ' total docs, ' + open + ' open (' + (Date.now() - _t0) + 'ms since subscribe)');
          // Keep the warm row cache in sync so the Pastoral Care view can
          // render instantly on first mount (no 2-second listMembers+listCases
          // round-trip blocking paint).
          _warmRows = openRows;
          _warmRowSubscribers.forEach((rcb) => { try { rcb(openRows); } catch (_) {} });
          try { cb(open); } catch (_) {}
        }, (_err) => { /* swallow — listener may be torn down on logout */ });
        // Emit an initial value immediately so the badge isn't blank while
        // the first snapshot is in-flight (Firestore listener fires within
        // a tick, but onSnapshot doesn't guarantee a synchronous initial cb).
        return;
      } catch (_) { /* fall through to polling */ }
    }

    // Polling fallback (GAS-only deploys or Firestore listener unavailable)
    try { cb(await pendingCount()); } catch (_) {}
    const tick = setInterval(async () => {
      if (cancelled) return clearInterval(tick);
      try { cb(await pendingCount()); } catch (_) {}
    }, 60_000);
    unsub = () => clearInterval(tick);
  })();

  return () => { cancelled = true; try { unsub(); } catch (_) {} };
}

// Wait up to `ms` for either Firestore (UpperRoom) or GAS (TheVine) to be ready.
// Actively kicks off UpperRoom.init() + .authenticate() if Firebase is loaded
// but nothing else has triggered them yet — without this, the badge waits
// passively for some other module (Tabernacle) to lazy-init UpperRoom, which
// can take a long time on a fresh login.
let _ensureAuthPromise = null;
function _ensureUpperRoomAuth() {
  if (_ensureAuthPromise) return _ensureAuthPromise;
  _ensureAuthPromise = (async () => {
    const UR = window.UpperRoom;
    if (!UR || typeof UR.init !== 'function' || typeof UR.authenticate !== 'function') return;
    if (typeof UR.isReady === 'function' && UR.isReady()) return;
    try { await UR.init(); } catch (_) {}
    try { await UR.authenticate(); } catch (_) {}
  })();
  return _ensureAuthPromise;
}

function _awaitBackend(ms = 15_000) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    let prodded = false;
    // If Firebase config is present, this is a Firestore church and we MUST
    // wait for it specifically — TheVine becoming available first would
    // otherwise short-circuit us into the 60s GAS polling path.
    const isFirestoreChurch = !!(
      typeof window !== 'undefined' &&
      (window.FLOCK_FIREBASE_CONFIG || window.UpperRoom)
    );
    const check = () => {
      const UR = window.UpperRoom;
      const V  = window.TheVine;
      const fsReady = !!(UR && typeof UR.isReady === 'function' && UR.isReady());
      if (fsReady) return resolve();
      // Only accept TheVine as "ready" on GAS-only churches that have no
      // Firebase config at all.
      if (!isFirestoreChurch && V) return resolve();
      // Once UpperRoom appears, actively prod it. (Firebase SDK scripts use
      // `defer` so UpperRoom may not exist on the very first poll.) We only
      // need to do this once — _ensureUpperRoomAuth is memoized.
      if (!prodded && UR && typeof UR.init === 'function') {
        prodded = true;
        _ensureUpperRoomAuth();
      }
      if (Date.now() - t0 >= ms) return resolve();
      setTimeout(check, 100);
    };
    check();
  });
}

/* ── Eager warm-up ───────────────────────────────────────────────────────────
   Start watching the open-case count the moment this module loads — well
   before the sidebar mounts. The instant auth completes (whether persisted
   session or post-login mint), the Firestore listener fires and the count
   is cached. By the time the_pillars subscribes, it gets an immediate hit
   from the warmed cache instead of waiting on a fresh round-trip.            */
let _warmCount = null;
let _warmRows = null;             // last-seen array of open care rows
const _warmSubscribers = new Set();
const _warmRowSubscribers = new Set();
let _warmStarted = false;

function _emitWarm(n) {
  _warmCount = n;
  _warmSubscribers.forEach((cb) => { try { cb(n); } catch (_) {} });
}

/* Public: authoritative override — when the Pastoral Care view tallies the
   exact rows it's about to render, it calls this so the sidebar badge is
   guaranteed to match the on-screen tiles. Single source of truth. */
export function setOpenCareCount(n, rows) {
  if (typeof n !== 'number' || n < 0) return;
  _warmCount = n;
  if (Array.isArray(rows)) _warmRows = rows;
  _warmSubscribers.forEach((cb) => { try { cb(n); } catch (_) {} });
  if (Array.isArray(rows)) {
    _warmRowSubscribers.forEach((rcb) => { try { rcb(rows); } catch (_) {} });
  }
}

/* Public: read the cached open-care rows (may be null until first snapshot). */
export function getWarmCareRows() {
  return _warmRows;
}

/* Public: subscribe to live open-care rows. Emits the current cache on
   subscribe (if available) and again every snapshot. Returns unsubscribe. */
export function subscribeOpenCareRows(cb) {
  if (typeof cb !== 'function') return () => {};
  _warmRowSubscribers.add(cb);
  if (_warmRows) { try { cb(_warmRows); } catch (_) {} }
  return () => { _warmRowSubscribers.delete(cb); };
}

function _startWarmUp() {
  if (_warmStarted) return;
  _warmStarted = true;
  console.log('[CARE-BADGE] warm-up starting at module load');
  // Deliberately fire-and-forget; subscribeOpenCareCount handles the
  // backend-readiness wait and Firestore subscription.
  subscribeOpenCareCount((n) => {
    console.log('[CARE-BADGE] warm-up emit: ' + n);
    _emitWarm(n);
  });
}

// Kick it off as soon as the module loads. If UpperRoom isn't ready yet,
// _awaitBackend polls until it is — so this cost nothing when run early
// and is ready the instant the user finishes login.
if (typeof window !== 'undefined') {
  console.log('[CARE-BADGE] Scripts/the_life/index.js module loaded — invoking _startWarmUp()');
  _startWarmUp();
}


/* ── Legacy bridge stubs (used when window global supports them) ─────────── */
export const outreachList    = (...a) => callWhen(NAME, 'outreachList', ...a);
export const discipleshipFor = (...a) => callWhen(NAME, 'discipleshipFor', ...a);
export const commsLog        = (...a) => callWhen(NAME, 'commsLog', ...a);
export const notesFor        = (...a) => callWhen(NAME, 'notesFor', ...a);
