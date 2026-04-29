/* ══════════════════════════════════════════════════════════════════════════════
   THE CHANNELS — Channel CRUD + real-time list
   "And the multitude of them that believed were of one heart and of one soul." — Acts 4:32

   Thin facade over the legacy window.UpperRoom (Tabernacle) global.
   In TheUpperRoom, "channels" are conversations of type='channel' stored under
   churches/{cid}/conversations/{convoId}. Methods provided by the legacy IIFE:
     • browseChannels()                    — list all (non-archived) channels
     • listConversations('channel')        — list channels I subscribe to
     • listenConversations('channel', cb)  — real-time stream
     • createChannel(name, description)    — returns new channelId
     • updateConversation(id, patch)
     • archiveConversation(id)
   ══════════════════════════════════════════════════════════════════════════════ */

import { when } from '../the_legacy_bridge.js';

const NAME = 'TheUpperRoom';

export const ready = () => when(NAME);

/** List all channels visible in this church (non-archived). */
export async function list() {
  const M = await when(NAME);
  if (typeof M.browseChannels === 'function') return M.browseChannels();
  if (typeof M.listConversations === 'function') return M.listConversations('channel');
  return [];
}

/** Subscribe to channel-list changes. Returns an unsubscribe function. */
export async function watch(onChange) {
  const M = await when(NAME);

  // Real-time path: listenConversations writes results into a callback and
  // stashes the underlying onSnapshot unsub on M._listeners['list_channel'].
  if (typeof M.listenConversations === 'function') {
    M.listenConversations('channel', (rows) => {
      try { onChange(Array.isArray(rows) ? rows : []); } catch (_) {}
    });
    return () => {
      try {
        const unsub = M._listeners && M._listeners['list_channel'];
        if (typeof unsub === 'function') unsub();
        if (M._listeners) delete M._listeners['list_channel'];
      } catch (_) {}
    };
  }

  // Polling fallback.
  let cancelled = false;
  (async function tick() {
    try { onChange(await list()); } catch (_) {}
    if (!cancelled) setTimeout(tick, 8000);
  })();
  return () => { cancelled = true; };
}

/** Create a channel. payload: { name, description? } — returns new channelId. */
export async function create(payload = {}) {
  const M = await when(NAME);
  if (typeof M.createChannel !== 'function') throw new Error('createChannel unavailable');
  return M.createChannel(payload.name, payload.description || '');
}

/** Patch a channel by id. */
export async function update(id, patch) {
  const M = await when(NAME);
  if (typeof M.updateConversation !== 'function') throw new Error('updateConversation unavailable');
  return M.updateConversation(id, patch);
}

/** Soft-delete (or archive) a channel. */
export async function archive(id) {
  const M = await when(NAME);
  if (typeof M.archiveConversation !== 'function') throw new Error('archiveConversation unavailable');
  return M.archiveConversation(id);
}
