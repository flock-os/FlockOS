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

/** List DM threads I'm part of. Backed by listConversations('dm'). */
export const list      = () => callWhen(NAME, 'listConversations', 'dm');
/** Messages in a DM thread are stored under conversations/{id}/messages
 *  — same shape as channel messages. */
export const messages  = (threadId, limit) => callWhen(NAME, 'getMessages', threadId, limit);
/** Send a DM message — sendMessage handles all conversation types. */
export const send      = (threadId, body)  => callWhen(NAME, 'sendMessage', threadId, body);
/** Ensure a DM thread exists with the given peer (email/uid). */
export const openWith  = (peerEmail) => callWhen(NAME, 'createDM', peerEmail);

export async function watch(onChange) {
  const M = await when(NAME);

  if (typeof M.listenConversations === 'function') {
    M.listenConversations('dm', (rows) => {
      try { onChange(Array.isArray(rows) ? rows : []); } catch (_) {}
    });
    return () => {
      try {
        const unsub = M._listeners && M._listeners['list_dm'];
        if (typeof unsub === 'function') unsub();
        if (M._listeners) delete M._listeners['list_dm'];
      } catch (_) {}
    };
  }

  let cancelled = false;
  (async function tick() {
    try { onChange(await list()); } catch (_) {}
    if (!cancelled) setTimeout(tick, 8000);
  })();
  return () => { cancelled = true; };
}
