/* ══════════════════════════════════════════════════════════════════════════════
   THE SEASONS — Calendar, tasks, check-in, iCal feeds
   "To every thing there is a season, and a time to every purpose." — Eccl 3:1
   ══════════════════════════════════════════════════════════════════════════════ */

import { bridge, when, callWhen } from '../the_legacy_bridge.js';

const NAME = 'TheSeason';

export const ready = () => when(NAME);
export const live  = () => bridge(NAME);

export const calendar    = (...a) => callWhen(NAME, 'calendar', ...a);
export const todayCount  = (...a) => callWhen(NAME, 'todayCount', ...a);
export const tasks       = (...a) => callWhen(NAME, 'tasks', ...a);
export const checkIn     = (...a) => callWhen(NAME, 'checkIn', ...a);
export const icalFeed    = (...a) => callWhen(NAME, 'icalFeed', ...a);
