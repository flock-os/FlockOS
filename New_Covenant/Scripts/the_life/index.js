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
  // Wait briefly for a backend (Firestore via UpperRoom, or GAS via TheVine)
  // so a fresh login doesn't return 0 and leave the badge hidden until the
  // next sidebar tick.
  await _awaitBackend(15_000);
  const UR = window.UpperRoom;
  // Firestore-first: use the dedicated careCasesRef so we don't pull the GAS
  // queue, which is often slower / stale on fresh sessions.
  if (UR && typeof UR.isReady === 'function' && UR.isReady() && typeof UR.careCasesRef === 'function') {
    try {
      const snap = await UR.careCasesRef().get();
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

  (async () => {
    await _awaitBackend(15_000);
    if (cancelled) return;
    const UR = window.UpperRoom;
    const fsReady = !!(UR && typeof UR.isReady === 'function' && UR.isReady());

    // Firestore real-time path
    if (fsReady && typeof UR.careCasesRef === 'function') {
      try {
        unsub = UR.careCasesRef().onSnapshot((snap) => {
          let open = 0;
          snap.forEach((doc) => {
            const d = doc.data() || {};
            const s = String(d.status || d.Status || '').trim().toLowerCase();
            if (!_TERMINAL.has(s)) open++;
          });
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
function _awaitBackend(ms = 15_000) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const check = () => {
      const UR = window.UpperRoom;
      const V  = window.TheVine;
      const fsReady = !!(UR && typeof UR.isReady === 'function' && UR.isReady());
      if (fsReady || V) return resolve();
      if (Date.now() - t0 >= ms) return resolve();
      setTimeout(check, 200);
    };
    check();
  });
}

/* ── Legacy bridge stubs (used when window global supports them) ─────────── */
export const outreachList    = (...a) => callWhen(NAME, 'outreachList', ...a);
export const discipleshipFor = (...a) => callWhen(NAME, 'discipleshipFor', ...a);
export const commsLog        = (...a) => callWhen(NAME, 'commsLog', ...a);
export const notesFor        = (...a) => callWhen(NAME, 'notesFor', ...a);
