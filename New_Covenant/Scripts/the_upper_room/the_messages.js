/* ══════════════════════════════════════════════════════════════════════════════
   THE MESSAGES — Message stream, send, edit, delete, react
   "How forcible are right words!" — Job 6:25

   Same approach as the_channels: facade today, direct Firestore tomorrow.
   ══════════════════════════════════════════════════════════════════════════════ */

/** Stream messages for a channel. onChange receives an array (oldest-first).
 *  Returns an unsubscribe function. */
export async function watch(channelId, onChange, { limit = 100 } = {}) {
  const M = window.UpperRoom ?? {};

  if (typeof M.listenMessages === 'function') {
    M.listenMessages(channelId, (rows) => {
      try { onChange(Array.isArray(rows) ? rows : []); } catch (_) {}
    });
    return () => {
      try {
        const key = 'msgs_' + channelId;
        const unsub = M._listeners && M._listeners[key];
        if (typeof unsub === 'function') unsub();
        if (M._listeners) delete M._listeners[key];
      } catch (_) {}
    };
  }

  // Polling fallback (one-shot via getMessages).
  let cancelled = false;
  (async function tick() {
    try { onChange(await list(channelId, limit)); } catch (_) {}
    if (!cancelled) setTimeout(tick, 4000);
  })();
  return () => { cancelled = true; };
}

export const list   = (channelId, limit) => window.UpperRoom?.getMessages?.(channelId, limit);
export const send   = (channelId, body) => window.UpperRoom?.sendMessage?.(channelId, body);
export const remove = (channelId, messageId) => window.UpperRoom?.deleteMessage?.(channelId, messageId);
// edit / react are not in the legacy surface yet — expose stubs that throw
// rather than silently no-op so callers get a clear error.
export const edit   = () => { throw new Error('editMessage not implemented'); };
export const react  = () => { throw new Error('reactToMessage not implemented'); };
