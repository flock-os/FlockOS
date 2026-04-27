/* ══════════════════════════════════════════════════════════════════════════════
   THE SCROLLS — Unified interaction ledger (touches, calls, texts, etc.)
   "And the books were opened: and another book was opened, which is the
    book of life." — Revelation 20:12
   ══════════════════════════════════════════════════════════════════════════════ */

import { bridge, when, callWhen } from '../the_legacy_bridge.js';

const NAME = 'TheScrolls';

export const ready = () => when(NAME);
export const live  = () => bridge(NAME);

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

    // Fall back: use care cases as timeline items (they have member names, types, timestamps)
    if (!personId) {
      try {
        const res = await V.flock.care.list({});
        const cases = Array.isArray(res) ? res
          : (res && Array.isArray(res.rows) ? res.rows : (res && Array.isArray(res.data) ? res.data : []));
        if (cases.length) {
          return cases
            .slice()
            .sort((a, b) => {
              const ta = _tsMs(a.updatedAt || a.createdAt);
              const tb = _tsMs(b.updatedAt || b.createdAt);
              return tb - ta;
            })
            .slice(0, limit)
            .map(c => ({
              icon:   _typeIcon(c.careType || c.type || ''),
              label:  c.memberName || c.name || c.memberId || 'Member',
              detail: [c.careType || c.type, c.status].filter(Boolean).join(' — '),
              ts:     c.updatedAt || c.createdAt,
            }));
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
  if (t.includes('crisis'))       return '🚨';
  if (t.includes('grief'))        return '🤍';
  if (t.includes('hospital'))     return '🏥';
  if (t.includes('prayer'))       return '🙏';
  if (t.includes('marriage'))     return '💍';
  if (t.includes('addiction'))    return '🔗';
  if (t.includes('mental'))       return '🧠';
  if (t.includes('counsel'))      return '💬';
  if (t.includes('financial'))    return '💰';
  if (t.includes('milestone'))    return '🎉';
  if (t.includes('new believer')) return '✨';
  if (t.includes('follow'))       return '📞';
  return '🫱';
}

export const log       = (...a) => callWhen(NAME, 'log', ...a);
export const forPerson = (...a) => callWhen(NAME, 'forPerson', ...a);
export const types     = (...a) => callWhen(NAME, 'types', ...a);
export const filter    = (...a) => callWhen(NAME, 'filter', ...a);
