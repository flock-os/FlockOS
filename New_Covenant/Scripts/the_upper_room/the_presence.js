/* ══════════════════════════════════════════════════════════════════════════════
   THE PRESENCE — Online / away / offline via RTDB onDisconnect
   "Lo, I am with you alway." — Matthew 28:20

   Presence model:
     online | away | offline
   Stored at presenceRtdb()/{uid}: { state, ts, view? }
   ══════════════════════════════════════════════════════════════════════════════ */

import { callWhen, when } from '../the_legacy_bridge.js';

const NAME = 'TheUpperRoom';

export const ready = () => when(NAME);

/** Set my own presence. */
export const setMine = (state, view)  => callWhen(NAME, 'setPresence', state, view);

/** Subscribe to presence for a list of uids; onChange receives a map { uid: presence }. */
export async function watch(uids, onChange) {
  const M = await when(NAME);
  if (typeof M.watchPresence === 'function') return M.watchPresence(uids, onChange);
  // Fallback: empty.
  onChange({});
  return () => {};
}

/** Read presence for one uid. */
export const read = (uid) => callWhen(NAME, 'readPresence', uid);
