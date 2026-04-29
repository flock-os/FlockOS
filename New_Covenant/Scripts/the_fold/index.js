/* ══════════════════════════════════════════════════════════════════════════════
   THE FOLD — Groups, small groups, Bible studies, attendance
   "There shall be one fold, and one shepherd." — John 10:16
   ══════════════════════════════════════════════════════════════════════════════ */

import { bridge, when, callWhen } from '../the_legacy_bridge.js';

const NAME = 'TheFold';

export const ready = () => when(NAME);
export const live  = () => bridge(NAME);

export const listGroups   = (...a) => callWhen(NAME, 'listGroups', ...a);
export const getGroup     = (...a) => callWhen(NAME, 'getGroup', ...a);
export const saveGroup    = (...a) => callWhen(NAME, 'saveGroup', ...a);
export const recordAttendance = (...a) => callWhen(NAME, 'recordAttendance', ...a);
export const attendanceFor    = (...a) => callWhen(NAME, 'attendanceFor', ...a);
