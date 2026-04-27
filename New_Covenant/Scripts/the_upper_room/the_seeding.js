/* ══════════════════════════════════════════════════════════════════════════════
   THE SEEDING — Default channels seeded for every church
   "He which soweth bountifully shall reap also bountifully." — 2 Corinthians 9:6

   On first comms touch in a church, ensure these channels exist. Idempotent.
   ══════════════════════════════════════════════════════════════════════════════ */

import { callWhen, when } from '../the_legacy_bridge.js';

const NAME = 'TheUpperRoom';

export const SEEDS = [
  { id: 'general',        name: 'general',        description: 'For everyone in the church.' },
  { id: 'announcements',  name: 'announcements',  description: 'Read-only firehose.', readOnly: true },
  { id: 'prayer-chain',   name: 'prayer-chain',   description: 'Lift one another up.' },
];

export async function ensureSeeds() {
  const M = await when(NAME);
  if (typeof M.ensureChannel !== 'function') return;
  for (const s of SEEDS) {
    try { await M.ensureChannel(s); } catch (_) { /* graceful */ }
  }
}

/** Convenience: callable from a one-off button or boot step. */
export const seed = ensureSeeds;
