/* ══════════════════════════════════════════════════════════════════════════════
   THE MESSAGES — Message stream, send, edit, delete, react
   "How forcible are right words!" — Job 6:25

   Same approach as the_channels: facade today, direct Firestore tomorrow.
   ══════════════════════════════════════════════════════════════════════════════ */

import { callWhen, when } from '../the_legacy_bridge.js';

const NAME = 'TheUpperRoom';

export const ready = () => when(NAME);

/** Stream messages for a channel. onChange receives an array (oldest-first).
 *  Returns an unsubscribe function. */
export async function watch(channelId, onChange, { limit = 100 } = {}) {
  const M = await when(NAME);
  if (typeof M.watchMessages === 'function') return M.watchMessages(channelId, onChange, { limit });
  // Polling fallback.
  let cancelled = false;
  (async function tick() {
    try { onChange(await M.messages(channelId, { limit })); } catch (_) {}
    if (!cancelled) setTimeout(tick, 4000);
  })();
  return () => { cancelled = true; };
}

export const list   = (channelId, opts) => callWhen(NAME, 'messages', channelId, opts);
export const send   = (channelId, body) => callWhen(NAME, 'sendMessage', channelId, body);
export const edit   = (channelId, messageId, patch) => callWhen(NAME, 'editMessage', channelId, messageId, patch);
export const remove = (channelId, messageId) => callWhen(NAME, 'deleteMessage', channelId, messageId);
export const react  = (channelId, messageId, emoji) => callWhen(NAME, 'reactToMessage', channelId, messageId, emoji);
