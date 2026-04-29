/* ══════════════════════════════════════════════════════════════════════════════
   THE CHANNELS — Channel CRUD + real-time list
   "And the multitude of them that believed were of one heart and of one soul." — Acts 4:32

   Phase I: thin facade that delegates to the legacy TheUpperRoom global,
   exposed under a clean ES-module surface. Phase II will replace the body
   with direct Firestore SDK calls scoped via the_tenant.fsPath().
   ══════════════════════════════════════════════════════════════════════════════ */

import { callWhen, when } from '../the_legacy_bridge.js';

const NAME = 'TheUpperRoom';

export const ready = () => when(NAME);

/** List all channels in the current church. Returns an array of channel objects. */
export const list = (...a) => callWhen(NAME, 'channels', ...a);

/** Subscribe to channel-list changes. Returns an unsubscribe function. */
export async function watch(onChange) {
  const M = await when(NAME);
  if (typeof M.watchChannels === 'function') return M.watchChannels(onChange);
  // Fallback: polling at 8s if the legacy IIFE has no watcher yet.
  let cancelled = false;
  (async function tick() {
    try { onChange(await list()); } catch (_) {}
    if (!cancelled) setTimeout(tick, 8000);
  })();
  return () => { cancelled = true; };
}

/** Create a channel. payload: { name, description?, private?, members? } */
export const create = (payload) => callWhen(NAME, 'createChannel', payload);

/** Patch a channel by id. */
export const update = (id, patch) => callWhen(NAME, 'updateChannel', id, patch);

/** Soft-delete (or archive) a channel. */
export const archive = (id) => callWhen(NAME, 'archiveChannel', id);
