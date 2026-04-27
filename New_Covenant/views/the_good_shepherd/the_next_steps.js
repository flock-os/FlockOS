/* ══════════════════════════════════════════════════════════════════════════════
   THE NEXT STEPS — Today’s top three pastoral tasks
   "Whatsoever thy hand findeth to do, do it with thy might." — Ecclesiastes 9:10

   Reads TheLife.careCases() (or compassionList as fallback), surfaces up to
   three rows on the home page with a one-click jump to that person.
   ══════════════════════════════════════════════════════════════════════════════ */

import { draw, swr } from '../../Scripts/the_manna.js';
import { careCases, compassionList } from '../../Scripts/the_life/index.js';
import { read, write } from '../../Scripts/the_cistern.js';

const KEY = 'shepherd:next';
const TTL = 5 * 60_000; // align with pre-warm; UR cache key keeps consistency
const _MEMBER_MAP_KEY = 'scrolls:member_name_map';
const _MEMBER_MAP_TTL = 20 * 60 * 1000;

async function _getNameMap() {
  try {
    const cached = await read(_MEMBER_MAP_KEY);
    if (cached && cached.expires > Date.now() && cached.map) return cached.map;
  } catch (_) {}
  const V = window.TheVine;
  if (!V) return {};
  try {
    const res     = await V.flock.members.list({ limit: 500 });
    const members = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
    const map     = {};
    for (const m of members) {
      const name = m.preferredName || (`${m.firstName || ''} ${m.lastName || ''}`).trim() || m.displayName || m.name || '';
      if (!name) continue;
      for (const k of [m.id, m.uid, m.docId, m.memberNumber, m.memberPin, m.email]) {
        if (k) map[String(k)] = name;
      }
    }
    await write(_MEMBER_MAP_KEY, { map, expires: Date.now() + _MEMBER_MAP_TTL });
    return map;
  } catch (_) { return {}; }
}

export function mountNextSteps(host, ctx) {
  if (!host) return () => {};
  let cancelled = false;

  const render = async (rawRows) => {
    if (cancelled || !host.isConnected) return;
    const rows = rawRows || [];
    if (!rows.length) {
      host.innerHTML = `<div style="color: var(--ink-muted, #7a7f96);">Nothing on your plate today.</div>`;
      return;
    }
    const nameMap = await _getNameMap().catch(() => ({}));
    if (cancelled || !host.isConnected) return;
    host.innerHTML = rows.slice(0, 3).map(p => _row(p, nameMap)).join('');
    host.querySelectorAll('[data-pid]').forEach((el) => {
      el.addEventListener('click', () => ctx.go && ctx.go('the_life', { person: el.dataset.pid }));
    });
  };

  const cached = swr(KEY, _fetch, render, { ttl: TTL });
  if (cached !== undefined) {
    render(cached);
  } else {
    draw(KEY, _fetch, { ttl: TTL })
      .then(render)
      .catch(() => {
        if (!cancelled && host.isConnected) {
          host.innerHTML = `<div style="color: var(--ink-muted, #7a7f96);">Pastoral backend unavailable right now.</div>`;
        }
      });
  }

  return () => { cancelled = true; };
}

async function _fetch() {
  try {
    const c = await careCases();
    if (Array.isArray(c) && c.length) return c;
  } catch (_) {}
  try {
    const c = await compassionList();
    if (Array.isArray(c)) return c;
  } catch (_) {}
  return [];
}

function _row(p, nameMap = {}) {
  const rawId = p.memberId || p.id || p.uid || p.caseId || '';
  const name  = p.name || p.fullName || p.displayName || p.memberName
             || (rawId && nameMap[rawId])
             || rawId
             || 'A sheep';
  const why   = p.reason || p.note || p.summary
             || [p.careType || p.type, p.status].filter(Boolean).join(' — ')
             || '';
  const pid   = p.id || p.uid || p.caseId || '';
  return `
    <button type="button" data-pid="${_e(pid)}"
      style="display:flex; gap:10px; align-items:center; width:100%;
             padding:8px 4px; background:transparent; border:0; cursor:pointer;
             border-bottom:1px solid var(--line,#e5e7ef); text-align:left;">
      <div style="width:8px; height:8px; border-radius:50%; background:var(--accent,#e8a838); flex-shrink:0;"></div>
      <div style="flex:1; min-width:0;">
        <div style="font-weight:600; color:var(--ink,#1b264f); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${_e(name)}</div>
        <div style="color:var(--ink-muted,#7a7f96); font-size:0.85rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${_e(why)}</div>
      </div>
    </button>`;
}
function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
