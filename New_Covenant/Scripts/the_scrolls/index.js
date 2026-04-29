/* ══════════════════════════════════════════════════════════════════════════════
   THE SCROLLS — Unified interaction ledger (touches, calls, texts, etc.)
   "And the books were opened: and another book was opened, which is the
    book of life." — Revelation 20:12
   ══════════════════════════════════════════════════════════════════════════════ */

import { bridge, when, callWhen } from '../the_legacy_bridge.js';
import { read, write } from '../the_cistern.js';

const NAME = 'TheScrolls';

export const ready = () => when(NAME);
export const live  = () => bridge(NAME);

// ── Member name cache (Cistern-backed, survives page reload) ─────────────────
const _MEMBER_MAP_KEY = 'scrolls:member_name_map';
const _MEMBER_MAP_TTL = 20 * 60 * 1000; // 20 minutes

/** Returns a { memberId -> displayName } map. Reads from Cistern; fetches + saves if stale/missing. */
async function _getMemberNameMap() {
  // 1. Check persisted cache
  try {
    const cached = await read(_MEMBER_MAP_KEY);
    if (cached && cached.expires > Date.now() && cached.map) return cached.map;
  } catch (_) {}

  // 2. Fetch fresh from API
  const V = window.TheVine;
  if (!V) return {};
  try {
    const res     = await V.flock.members.list({ limit: 500 });
    const members = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
    const map     = {};
    for (const m of members) {
      const name = m.preferredName
        || (`${m.firstName || ''} ${m.lastName || ''}`).trim()
        || m.displayName
        || m.name
        || '';
      if (!name) continue;
      for (const k of [m.id, m.uid, m.docId, m.memberNumber, m.memberPin, m.email]) {
        if (k) map[String(k)] = name;
      }
    }
    // 3. Save to Cistern so next call is instant
    await write(_MEMBER_MAP_KEY, { map, expires: Date.now() + _MEMBER_MAP_TTL });
    return map;
  } catch (_) {
    return {};
  }
}

/** Return the last N interaction records. Falls back to care cases gracefully. */
export async function timeline(personId, limit = 10) {
  const V = window.TheVine;
  if (V) {
    // Try dedicated interaction namespaces first
    try {
      const ns = V.flock.interactions || V.flock.scrolls;
      if (ns) {
        const fn = personId ? () => ns.forPerson(personId, { limit }) : () => ns.list({ limit });
        const res = await fn();
        const rows = Array.isArray(res) ? res : (res && Array.isArray(res.rows) ? res.rows : []);
        if (rows.length) return rows;
      }
    } catch (_) {}

    // Fall back: use care cases as timeline items; resolve member IDs to real names
    if (!personId) {
      try {
        const [careRes, nameMap] = await Promise.all([
          V.flock.care.list({}),
          _getMemberNameMap(),
        ]);
        const cases = Array.isArray(careRes) ? careRes
          : (careRes?.rows ?? careRes?.data ?? []);
        if (cases.length) {
          return cases
            .slice()
            .sort((a, b) => _tsMs(b.updatedAt || b.createdAt) - _tsMs(a.updatedAt || a.createdAt))
            .slice(0, limit)
            .map(c => {
              const rawId = c.memberId || c.memberNumber || '';
              const name  = c.memberName || c.name
                         || (rawId && nameMap[rawId])
                         || rawId
                         || 'Member';
              return {
                icon:   _typeIcon(c.careType || c.type || ''),
                label:  name,
                detail: [c.careType || c.type, c.status].filter(Boolean).join(' — '),
                ts:     c.updatedAt || c.createdAt,
              };
            });
        }
      } catch (_) {}
    }
  }
  return [];
}

function _tsMs(ts) {
  if (!ts) return 0;
  if (ts?.seconds) return ts.seconds * 1000;
  const n = new Date(ts).getTime();
  return isNaN(n) ? 0 : n;
}

function _typeIcon(type) {
  const t = String(type).toLowerCase();
  if (t.includes('crisis'))                              return '🚨';
  if (t.includes('abuse') || t.includes('domestic'))    return '🛡️';
  if (t.includes('hospital'))                            return '🏥';
  if (t.includes('medical') || t.includes('terminal'))  return '🩺';
  if (t.includes('elder'))                               return '🧓';
  if (t.includes('grief') || t.includes('infant loss')) return '🤍';
  if (t.includes('marriage') || t.includes('pre-marr')) return '💍';
  if (t.includes('family'))                              return '👨‍👩‍👧';
  if (t.includes('addiction') || t.includes('pornogr'))  return '🔗';
  if (t.includes('mental'))                              return '🧠';
  if (t.includes('counsel'))                             return '💬';
  if (t.includes('new believer'))                        return '✨';
  if (t.includes('discipleship'))                        return '📚';
  if (t.includes('shepherd'))                            return '🐑';
  if (t.includes('restoration'))                         return '🔄';
  if (t.includes('financial'))                           return '💰';
  if (t.includes('immigration') || t.includes('deport')) return '✈️';
  if (t.includes('incarceration') || t.includes('entry')) return '🔑';
  if (t.includes('prayer'))                              return '🙏';
  if (t.includes('follow'))                              return '📞';
  if (t.includes('milestone'))                           return '🎉';
  return '🫱';
}

export const log       = (...a) => callWhen(NAME, 'log', ...a);
export const forPerson = (...a) => callWhen(NAME, 'forPerson', ...a);
export const types     = (...a) => callWhen(NAME, 'types', ...a);
export const filter    = (...a) => callWhen(NAME, 'filter', ...a);
