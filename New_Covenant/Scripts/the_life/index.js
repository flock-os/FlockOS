/* ══════════════════════════════════════════════════════════════════════════════
   THE LIFE — Pastoral command-hub: care, prayer, compassion, outreach, etc.
   "In him was life; and the life was the light of men." — John 1:4
   ══════════════════════════════════════════════════════════════════════════════ */

import { bridge, when, callWhen } from '../the_legacy_bridge.js';

const NAME = 'TheLife';

export const ready = () => when(NAME);
export const live  = () => bridge(NAME);

export const careCases       = (...a) => callWhen(NAME, 'careCases', ...a);
export const prayerRequests  = (...a) => callWhen(NAME, 'prayerRequests', ...a);
export const compassionList  = (...a) => callWhen(NAME, 'compassionList', ...a);
export const outreachList    = (...a) => callWhen(NAME, 'outreachList', ...a);
export const discipleshipFor = (...a) => callWhen(NAME, 'discipleshipFor', ...a);
export const commsLog        = (...a) => callWhen(NAME, 'commsLog', ...a);
export const notesFor        = (...a) => callWhen(NAME, 'notesFor', ...a);
export const pendingCount    = (...a) => callWhen(NAME, 'pendingCount', ...a);
