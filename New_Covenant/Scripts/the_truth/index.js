/* ══════════════════════════════════════════════════════════════════════════════
   THE TRUTH — Firestore-backed content editor
   "Sanctify them through thy truth: thy word is truth." — John 17:17

   Public content tabs: Books, Genealogy, Counseling, Devotionals, Reading
   Plan, Lexicon, Heart Check, Mirror, Quiz, Apologetics. All routed through
   the legacy `TheTruth` global; the per-tab files land in Phase II.
   ══════════════════════════════════════════════════════════════════════════════ */

import { bridge, when, callWhen } from '../the_legacy_bridge.js';

const NAME = 'TheTruth';

export const ready = () => when(NAME);
export const live  = () => bridge(NAME);

export const list   = (collection, opts)        => callWhen(NAME, 'list',   collection, opts);
export const read   = (collection, id)          => callWhen(NAME, 'read',   collection, id);
export const write  = (collection, id, patch)   => callWhen(NAME, 'write',  collection, id, patch);
export const remove = (collection, id)          => callWhen(NAME, 'remove', collection, id);
