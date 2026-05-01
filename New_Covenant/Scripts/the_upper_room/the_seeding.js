/* ══════════════════════════════════════════════════════════════════════════════
   THE SEEDING — Default channels seeded for every church
   "He which soweth bountifully shall reap also bountifully." — 2 Corinthians 9:6

   On first comms touch in a church, ensure these channels exist. Idempotent.
   ══════════════════════════════════════════════════════════════════════════════ */

export const SEEDS = [
  { name: 'general',       description: 'For everyone in the church.' },
  { name: 'announcements', description: 'Read-only firehose.' },
  { name: 'prayer-chain',  description: 'Lift one another up.' },
];

/** Idempotent: list existing channels by name; create only the seeds that
 *  don't yet exist. Safe to call on every Fellowship mount. */
export async function ensureSeeds() {
  const M = window.UpperRoom ?? {};
  if (typeof M.browseChannels !== 'function' || typeof M.createChannel !== 'function') return;

  let existing = [];
  try { existing = (await M.browseChannels()) || []; } catch (_) { return; }
  const have = new Set(existing.map((c) => String(c && c.name || '').toLowerCase()));

  for (const s of SEEDS) {
    if (have.has(s.name.toLowerCase())) continue;
    try { await M.createChannel(s.name, s.description); }
    catch (_) { /* graceful — e.g. permission denied for non-admins */ }
  }
}

/** Convenience: callable from a one-off button or boot step. */
export const seed = ensureSeeds;
