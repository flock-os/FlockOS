/* ══════════════════════════════════════════════════════════════════════════════
   THE DMS — Direct-message threads
   "Now we see through a glass, darkly; but then face to face." — 1 Cor 13:12

   DM threads are their own document tree; participants are always exactly
   two uids. Thread id is deterministic: the two uids sorted + joined by '_'.

   Public API:
     threadIdFor(uidA, uidB)  — deterministic id
     list()                    — all DM threads I am part of
     watch(onChange)           — subscribe; returns unsubscribe
     openWith(uid)             — ensure a thread exists, return its id
     messages(threadId, opts)  — list of messages
     send(threadId, body)      — send a message
   ══════════════════════════════════════════════════════════════════════════════ */

import { callWhen, when } from '../the_legacy_bridge.js';

const NAME = 'TheUpperRoom';

export const ready = () => when(NAME);

export function threadIdFor(uidA, uidB) {
  return [String(uidA), String(uidB)].sort().join('_');
}

export const list      = (...a) => callWhen(NAME, 'dms', ...a);
export const messages  = (threadId, opts) => callWhen(NAME, 'dmMessages', threadId, opts);
export const send      = (threadId, body) => callWhen(NAME, 'sendDm', threadId, body);
export const openWith  = (uid)  => callWhen(NAME, 'openDm', uid);

export async function watch(onChange) {
  const M = await when(NAME);
  if (typeof M.watchDms === 'function') return M.watchDms(onChange);
  let cancelled = false;
  (async function tick() {
    try { onChange(await M.dms()); } catch (_) {}
    if (!cancelled) setTimeout(tick, 8000);
  })();
  return () => { cancelled = true; };
}
