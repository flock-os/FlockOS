/* ══════════════════════════════════════════════════════════════════════════════
   THE SCROLLS — Unified interaction ledger (touches, calls, texts, etc.)
   "And the books were opened: and another book was opened, which is the
    book of life." — Revelation 20:12
   ══════════════════════════════════════════════════════════════════════════════ */

import { bridge, when, callWhen } from '../the_legacy_bridge.js';

const NAME = 'TheScrolls';

export const ready = () => when(NAME);
export const live  = () => bridge(NAME);

export const log         = (...a) => callWhen(NAME, 'log', ...a);
export const timeline    = (...a) => callWhen(NAME, 'timeline', ...a);
export const forPerson   = (...a) => callWhen(NAME, 'forPerson', ...a);
export const types       = (...a) => callWhen(NAME, 'types', ...a);
export const filter      = (...a) => callWhen(NAME, 'filter', ...a);
