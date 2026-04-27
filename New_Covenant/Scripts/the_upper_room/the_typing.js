/* ══════════════════════════════════════════════════════════════════════════════
   THE TYPING — Typing indicators via RTDB
   "A word fitly spoken is like apples of gold in pictures of silver." — Pr 25:11

   Each composer call ping() at most once per 1.5s. Listeners get a
   throttled list of uids currently typing in the channel.
   ══════════════════════════════════════════════════════════════════════════════ */

import { callWhen, when } from '../the_legacy_bridge.js';

const NAME = 'TheUpperRoom';

const _lastPing = new Map(); // channelId -> ts
const PING_GAP = 1500;

export async function ping(channelId) {
  const now = Date.now();
  const last = _lastPing.get(channelId) || 0;
  if (now - last < PING_GAP) return;
  _lastPing.set(channelId, now);
  try { await callWhen(NAME, 'typing', channelId); } catch (_) {}
}

export async function watch(channelId, onChange) {
  const M = await when(NAME);
  if (typeof M.watchTyping === 'function') return M.watchTyping(channelId, onChange);
  onChange([]);
  return () => {};
}
