/* ══════════════════════════════════════════════════════════════════════════════
   THE SEASONS — Calendar, tasks, check-in, iCal feeds
   "To every thing there is a season, and a time to every purpose." — Eccl 3:1
   ══════════════════════════════════════════════════════════════════════════════ */

import { bridge, when, callWhen } from '../the_legacy_bridge.js';

const NAME = 'TheSeason';

export const ready = () => when(NAME);
export const live  = () => bridge(NAME);

export async function todayCount() {
  const V = window.TheVine;
  if (!V) return 0;
  try {
    const res = await V.flock.events.list();
    const rows = Array.isArray(res) ? res : (res && Array.isArray(res.rows) ? res.rows : (res && Array.isArray(res.data) ? res.data : []));
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    return rows.filter((ev) => {
      const d = new Date(ev.startDate || ev.date || ev.createdAt);
      return d >= today && d < tomorrow;
    }).length;
  } catch (_) { return 0; }
}

export const calendar = (...a) => callWhen(NAME, 'calendar', ...a);
export const tasks    = (...a) => callWhen(NAME, 'tasks', ...a);
export const checkIn  = (...a) => callWhen(NAME, 'checkIn', ...a);
export const icalFeed = (...a) => callWhen(NAME, 'icalFeed', ...a);
