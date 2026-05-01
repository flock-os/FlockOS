/* ══════════════════════════════════════════════════════════════════════════════
   THE BIRTHDAYS — Members with birthdays in the next 7 days
   "There is a time to be born…" — Ecclesiastes 3:2

   Pulls from UpperRoom.listMembers (Firestore — fast), filters by birthDate
   (or birthdate / dateOfBirth fallback), and shows the next ~5 birthdays
   sorted by how soon. Click → jump to the_fold for that person.
   ══════════════════════════════════════════════════════════════════════════════ */

import { draw, swr } from '../../Scripts/the_manna.js';

const TTL = 30 * 60_000; // birthdays change rarely → cache 30 min
const KEY = 'shepherd:birthdays';

export function mountBirthdays(host, ctx) {
  if (!host) return () => {};
  let cancelled = false;

  const render = (members) => {
    if (cancelled || !host.isConnected) return;
    const rows = _upcoming(members || [], 7);
    if (!rows.length) {
      host.innerHTML = `<div class="empty-soft">No birthdays in the next 7 days.</div>`;
      return;
    }
    host.innerHTML = rows.map(_row).join('');
    host.querySelectorAll('[data-pid]').forEach((el) => {
      el.addEventListener('click', () => ctx.go && ctx.go('the_fold', { person: el.dataset.pid }));
    });
  };

  // The pre-warm caches the raw member list under KEY (same key the warm uses).
  const cached = swr(KEY, _fetch, render, { ttl: TTL });
  if (cached !== undefined) {
    render(cached);
  } else {
    draw(KEY, _fetch, { ttl: TTL })
      .then(render)
      .catch(() => {
        if (!cancelled && host.isConnected) {
          host.innerHTML = `<div class="empty-soft">Birthday list unavailable right now.</div>`;
        }
      });
  }

  return () => { cancelled = true; };
}

async function _fetch() {
  const UR = window.UpperRoom;
  if (!UR || !UR.isReady || !UR.isReady()) return [];
  const res = await UR.listMembers({ limit: 1000 });
  return Array.isArray(res) ? res : (res?.results ?? []);
}

function _upcoming(members, days) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + days);

  const out = [];
  for (const m of members) {
    const raw = m.birthDate || m.birthdate || m.dateOfBirth;
    if (!raw) continue;
    const bday = _parseDate(raw);
    if (!bday) continue;
    const next = _nextOccurrence(bday, today);
    if (next > horizon) continue;
    const age = next.getFullYear() - bday.getFullYear();
    out.push({ member: m, when: next, age });
  }
  out.sort((a, b) => a.when - b.when);
  return out.slice(0, 5);
}

function _parseDate(raw) {
  // YYYY-MM-DD or ISO — anchor to local midnight
  if (raw && raw.toDate) raw = raw.toDate().toISOString().slice(0, 10);
  if (typeof raw !== 'string') return null;
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return isNaN(d) ? null : d;
}

function _nextOccurrence(bday, today) {
  const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return next;
}

function _row({ member, when, age }) {
  const name = (member.preferredName || `${member.firstName || ''} ${member.lastName || ''}`.trim()) || 'A sheep';
  const pid  = member.id || member.docId || member.memberPin || '';
  const today = new Date(); today.setHours(0,0,0,0);
  const days  = Math.round((when - today) / 86400000);
  const label = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : when.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const ageBadge = (Number.isFinite(age) && age > 0 && age < 130) ? `<span class="bday-age">turns ${age}</span>` : '';
  return `
    <button type="button" data-pid="${_e(pid)}" class="bday-row">
      <div class="bday-cake">🎂</div>
      <div class="bday-body">
        <div class="bday-name">${_e(name)}</div>
        ${ageBadge}
      </div>
      <div class="bday-when">${_e(label)}</div>
    </button>`;
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
