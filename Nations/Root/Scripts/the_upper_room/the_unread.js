/* ══════════════════════════════════════════════════════════════════════════════
   THE UNREAD — Unread badge math
   "Watch ye and pray, lest ye enter into temptation." — Mark 14:38

   Tracks the user's per-channel "last read" timestamp and computes badge
   counts. Persisted in localStorage so badges don't reset on reload.

   Public API:
     mark(channelId)                     — set last-read to now
     count(channelId, latestMessageTs)   — 1 if latestTs > lastRead else 0
                                           (we don't keep per-message counts in
                                           Phase I — that comes when we have
                                           a real Firestore stream)
     totalFor(channels[])                — sum of badge counts
   ══════════════════════════════════════════════════════════════════════════════ */

import { churchId } from './the_tenant.js';

const KEY = () => `flock_unread_lastread:${churchId()}`;

function _read() {
  try { return JSON.parse(localStorage.getItem(KEY()) || '{}') || {}; }
  catch (_) { return {}; }
}
function _write(map) {
  try { localStorage.setItem(KEY(), JSON.stringify(map)); }
  catch (_) { /* graceful */ }
}

export function mark(channelId) {
  const m = _read();
  m[channelId] = Date.now();
  _write(m);
}

export function lastRead(channelId) {
  return _read()[channelId] || 0;
}

export function count(channelId, latestMessageTs = 0) {
  return latestMessageTs > lastRead(channelId) ? 1 : 0;
}

export function totalFor(channels = []) {
  let n = 0;
  for (const c of channels) {
    const ts = c && (c.lastMessageTs || c.updatedAt || 0);
    n += count(c.id, ts);
  }
  return n;
}
