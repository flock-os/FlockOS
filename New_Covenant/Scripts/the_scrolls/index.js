/* ══════════════════════════════════════════════════════════════════════════════
   THE SCROLLS — Unified interaction ledger (touches, calls, texts, etc.)
   "And the books were opened: and another book was opened, which is the
    book of life." — Revelation 20:12
   ══════════════════════════════════════════════════════════════════════════════ */

import { bridge, when, callWhen } from '../the_legacy_bridge.js';

const NAME = 'TheScrolls';

export const ready = () => when(NAME);
export const live  = () => bridge(NAME);

/** Return the last N interaction records. Falls back to empty array gracefully. */
export async function timeline(personId, limit = 10) {
  const V = window.TheVine;
  if (V) {
    try {
      const ns = V.flock.interactions || V.flock.scrolls;
      if (ns) {
        const fn = personId ? () => ns.forPerson(personId, { limit }) : () => ns.list({ limit });
        const res = await fn();
        const rows = Array.isArray(res) ? res : (res && Array.isArray(res.rows) ? res.rows : []);
        if (rows.length) return rows;
      }
    } catch (_) {}
  }
  return [];
}

export const log       = (...a) => callWhen(NAME, 'log', ...a);
export const forPerson = (...a) => callWhen(NAME, 'forPerson', ...a);
export const types     = (...a) => callWhen(NAME, 'types', ...a);
export const filter    = (...a) => callWhen(NAME, 'filter', ...a);
