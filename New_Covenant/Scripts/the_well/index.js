/* ══════════════════════════════════════════════════════════════════════════════
   THE WELL — Backup, restore, .xlsx templates (SheetJS)
   "Whosoever drinketh of the water that I shall give him shall never thirst." — Jn 4:14
   ══════════════════════════════════════════════════════════════════════════════ */

import { bridge, when, callWhen } from '../the_legacy_bridge.js';

const NAME = 'TheWell';

export const ready = () => when(NAME);
export const live  = () => bridge(NAME);

export const exportTemplate = (...a) => callWhen(NAME, 'exportTemplate', ...a);
export const exportBackup   = (...a) => callWhen(NAME, 'exportBackup', ...a);
export const importBackup   = (...a) => callWhen(NAME, 'importBackup', ...a);
export const schema         = (...a) => callWhen(NAME, 'schema', ...a);
