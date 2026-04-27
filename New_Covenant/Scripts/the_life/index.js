/* ══════════════════════════════════════════════════════════════════════════════
   THE LIFE — Pastoral command-hub: care, prayer, compassion, outreach, etc.
   "In him was life; and the life was the light of men." — John 1:4
   ══════════════════════════════════════════════════════════════════════════════ */

import { bridge, when, callWhen } from '../the_legacy_bridge.js';

const NAME = 'TheLife';

export const ready = () => when(NAME);
export const live  = () => bridge(NAME);

/* ── TheVine-backed data accessors ────────────────────────────────────────── */

function _rows(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.rows)) return res.rows;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

export async function careCases() {
  const V = window.TheVine;
  if (!V) return [];
  const res = await V.flock.care.list({ status: 'Active' });
  return _rows(res);
}

export async function prayerRequests() {
  const V = window.TheVine;
  if (!V) return [];
  const res = await V.flock.prayer.list({ status: 'New' });
  return _rows(res);
}

export async function compassionList() {
  const V = window.TheVine;
  if (!V) return [];
  // Compassion list = care follow-ups; fall back to general care queue
  try {
    const res = await V.flock.care.followUps.due();
    return _rows(res);
  } catch (_) {
    const res = await V.flock.care.list({ status: 'Active' });
    return _rows(res);
  }
}

export async function pendingCount() {
  const V = window.TheVine;
  if (!V) return 0;
  const rows = await careCases();
  return rows.length;
}

/* ── Legacy bridge stubs (used when window global supports them) ─────────── */
export const outreachList    = (...a) => callWhen(NAME, 'outreachList', ...a);
export const discipleshipFor = (...a) => callWhen(NAME, 'discipleshipFor', ...a);
export const commsLog        = (...a) => callWhen(NAME, 'commsLog', ...a);
export const notesFor        = (...a) => callWhen(NAME, 'notesFor', ...a);
