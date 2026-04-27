/* ══════════════════════════════════════════════════════════════════════════════
   THE COUNT — One summary card body
   "And the LORD said unto Moses, Number the children of Israel." — Numbers 1:2

   Pulls live numbers from the three real backends and renders a small
   number + caption (or an empty-state line). All reads cached briefly via
   the_manna so tab-switching feels instant.
   ══════════════════════════════════════════════════════════════════════════════ */

import { draw } from '../../Scripts/the_manna.js';
import { unreadTotal } from '../../Scripts/the_upper_room/index.js';
import { pendingCount } from '../../Scripts/the_life/index.js';
import { todayCount }   from '../../Scripts/the_seasons/index.js';

const COPY = {
  fellowship: {
    caption: 'unread in Fellowship', empty: 'All caught up.',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  },
  care: {
    caption: 'pending follow-ups', empty: 'No one waiting on you today.',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.6a5.5 5.5 0 0 0-7.78 0L12 5.66l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21l8.84-8.62a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  },
  today: {
    caption: 'on the calendar today', empty: 'Today is open.',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  },
};

function _cls(kind) {
  return kind === 'fellowship' ? 'sc-fellowship' : kind === 'care' ? 'sc-care' : 'sc-today';
}

export function mountCount(host, kind) {
  if (!host) return () => {};
  const meta = COPY[kind] || { caption: '', empty: 'Nothing yet.' };
  let cancelled = false;

  draw(`shepherd:${kind}`, () => _fetch(kind), { ttl: 30_000 })
    .then((n) => {
      if (cancelled || !host.isConnected) return;
      const num = (typeof n === 'number' && Number.isFinite(n)) ? n : null;
      const cls  = _cls(kind);
      if (num == null || num === 0) {
        host.innerHTML = `
          <div class="stat-card ${cls}">
            <div class="stat-icon ${cls}">${meta.icon}</div>
            <div class="stat-value zero">—</div>
            <div class="stat-caption">${meta.empty}</div>
          </div>`;
        return;
      }
      host.innerHTML = `
        <div class="stat-card ${cls}" tabindex="0">
          <div class="stat-icon ${cls}">${meta.icon}</div>
          <div class="stat-value">${num}</div>
          <div class="stat-caption">${meta.caption}</div>
          <span class="stat-arrow" aria-hidden="true">→</span>
        </div>`;
    })
    .catch(() => {
      if (cancelled || !host.isConnected) return;
      const cls = _cls(kind);
      host.innerHTML = `
        <div class="stat-card ${cls}">
          <div class="stat-icon ${cls}">${COPY[kind]?.icon ?? ''}</div>
          <div class="stat-value zero">—</div>
          <div class="stat-caption">${COPY[kind]?.empty ?? ''}</div>
        </div>`;
    });

  return () => { cancelled = true; };
}

async function _fetch(kind) {
  if (kind === 'fellowship') return _toNum(await unreadTotal());
  if (kind === 'care')       return _toNum(await pendingCount());
  if (kind === 'today')      return _toNum(await todayCount());
  return null;
}

function _toNum(v) {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(+v)) return +v;
  if (Array.isArray(v)) return v.length;
  if (typeof v === 'object' && typeof v.count === 'number') return v.count;
  return null;
}
