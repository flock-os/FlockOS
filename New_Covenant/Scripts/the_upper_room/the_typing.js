/* ══════════════════════════════════════════════════════════════════════════════
   THE TYPING — Typing indicators via RTDB
   "A word fitly spoken is like apples of gold in pictures of silver." — Pr 25:11

   Each composer call ping() at most once per 1.5s. Listeners get a
   throttled list of uids currently typing in the channel.
   ══════════════════════════════════════════════════════════════════════════════ */

const _lastPing = new Map(); // channelId -> ts
const PING_GAP = 1500;

export async function ping(channelId) {
  const now = Date.now();
  const last = _lastPing.get(channelId) || 0;
  if (now - last < PING_GAP) return;
  _lastPing.set(channelId, now);
  try { await window.UpperRoom?.setTyping?.(channelId, true); } catch (_) {}
}

export async function watch(channelId, onChange) {
  const M = window.UpperRoom ?? {};
  if (typeof M.listenTyping === 'function') {
    M.listenTyping(channelId, (uids) => {
      try { onChange(Array.isArray(uids) ? uids : []); } catch (_) {}
    });
    return () => {
      try {
        const key = 'typing_' + channelId;
        const unsub = M._listeners && M._listeners[key];
        if (typeof unsub === 'function') unsub();
        if (M._listeners) delete M._listeners[key];
      } catch (_) {}
    };
  }
  onChange([]);
  return () => {};
}
