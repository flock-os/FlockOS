/* ══════════════════════════════════════════════════════════════════════════════
   THE WELLSPRING — Local-only mode (single .xlsx in IndexedDB)
   "He shall be like a tree planted by the rivers of water." — Psalm 1:3

   The wellspring is the resolver hook into TheVine for offline-first churches
   that have chosen Local Data mode. Identity of the public surface is
   preserved via the legacy `TheWellspring` global.
   ══════════════════════════════════════════════════════════════════════════════ */

import { bridge, when, callWhen } from '../the_legacy_bridge.js';

const NAME = 'TheWellspring';

export const ready = () => when(NAME);
export const live  = () => bridge(NAME);

export const isActive  = (...a) => callWhen(NAME, 'isActive', ...a);
export const load      = (...a) => callWhen(NAME, 'load', ...a);
export const exportXlsx = (...a) => callWhen(NAME, 'exportXlsx', ...a);
export const status    = (...a) => callWhen(NAME, 'status', ...a);
