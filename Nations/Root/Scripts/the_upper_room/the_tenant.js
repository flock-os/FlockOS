/* ══════════════════════════════════════════════════════════════════════════════
   THE TENANT — Church-scoped Firestore + RTDB path helpers
   "Behold, how good and how pleasant it is for brethren to dwell together
    in unity!" — Psalm 133:1

   All chat data lives under churches/{churchId}/... in the church's own
   Firebase project. This module is the single place that decides "who am I
   talking to" — every other comms file calls into here.

   Resolution order for churchId:
     1. window.FLOCK_CHURCH_ID                (build-injected)
     2. ?church=<id> URL param                (override / dev)
     3. localStorage 'flock_church_id'        (last seen)
     4. 'flockos'                             (final fallback)

   Public API:
     churchId()             — resolved id
     fsPath(...segments)    — 'churches/{cid}/' + segments.join('/')
     rtdbPath(...segments)  — '/{cid}/' + segments.join('/')
     channelsCol()          — fsPath('channels')
     dmsCol()               — fsPath('dms')
     presenceRtdb()         — rtdbPath('presence')
   ══════════════════════════════════════════════════════════════════════════════ */

const STORE_KEY = 'flock_church_id';
let _cached = null;

export function churchId() {
  if (_cached) return _cached;
  if (typeof window !== 'undefined') {
    if (window.FLOCK_CHURCH_ID) { _cached = String(window.FLOCK_CHURCH_ID); return _cached; }
    try {
      const u = new URLSearchParams(location.search).get('church');
      if (u) { _cached = u; try { localStorage.setItem(STORE_KEY, u); } catch (_) {} return _cached; }
    } catch (_) { /* graceful */ }
    try {
      const ls = localStorage.getItem(STORE_KEY);
      if (ls) { _cached = ls; return _cached; }
    } catch (_) { /* graceful */ }
  }
  _cached = 'flockos';
  return _cached;
}

export function fsPath(...segments)   { return ['churches', churchId(), ...segments.filter(Boolean)].join('/'); }
export function rtdbPath(...segments) { return '/' + [churchId(), ...segments.filter(Boolean)].join('/'); }

export const channelsCol  = () => fsPath('channels');
export const dmsCol       = () => fsPath('dms');
export const presenceRtdb = () => rtdbPath('presence');
