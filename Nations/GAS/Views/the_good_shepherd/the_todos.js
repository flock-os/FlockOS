/* ══════════════════════════════════════════════════════════════════════════════
   THE TODOS — My open todos on the home page
   "Whatsoever thy hand findeth to do, do it with thy might." — Ecclesiastes 9:10

   Pulls UpperRoom.myTodos() (Firestore — fast), filters out completed/archived,
   sorts by due date (oldest first), shows up to 5. Click → jump to a todos
   view if registered, otherwise stays on home (placeholder).
   ══════════════════════════════════════════════════════════════════════════════ */

import { draw, swr } from '../../Scripts/the_manna.js';

const TTL = 60_000; // todos change frequently → 1 min cache
const KEY = 'shepherd:mytodos';

export function mountMyTodos(host, ctx) {
  if (!host) return () => {};
  let cancelled = false;

  const render = (raw) => {
    if (cancelled || !host.isConnected) return;
    const rows = _filterAndSort(raw);
    if (!rows.length) {
      host.innerHTML = `<div class="empty-soft">Your task list is clear. Well done.</div>`;
      return;
    }
    host.innerHTML = rows.map(_row).join('');
  };

  const cached = swr(KEY, _fetch, render, { ttl: TTL });
  if (cached !== undefined) {
    render(cached);
  } else {
    draw(KEY, _fetch, { ttl: TTL })
      .then(render)
      .catch(() => {
        if (!cancelled && host.isConnected) {
          host.innerHTML = `<div class="empty-soft">Task list unavailable right now.</div>`;
        }
      });
  }

  return () => { cancelled = true; };
}

async function _fetch() {
  const UR = window.UpperRoom;
  if (!UR || !UR.isReady || !UR.isReady() || !UR.myTodos) return [];
  return UR.myTodos();
}

function _filterAndSort(raw) {
  const open = (raw || []).filter(t => !t.completed && !t.archived && t.status !== 'done');
  open.sort((a, b) => {
    const ad = a.dueDate || ''; const bd = b.dueDate || '';
    if (!ad && !bd) return 0;
    if (!ad) return 1;
    if (!bd) return -1;
    return ad.localeCompare(bd);
  });
  return open.slice(0, 5);
}

function _row(t) {
  const title = t.title || t.task || t.label || 'Untitled task';
  const due   = _dueLabel(t.dueDate);
  const dueClass = _dueClass(t.dueDate);
  return `
    <div class="todo-row">
      <div class="todo-dot"></div>
      <div class="todo-body">
        <div class="todo-title">${_e(title)}</div>
        ${due ? `<div class="todo-due ${dueClass}">${_e(due)}</div>` : ''}
      </div>
    </div>`;
}

function _dueLabel(dueDate) {
  if (!dueDate) return '';
  const d = _parseDate(dueDate);
  if (!d) return '';
  const today = new Date(); today.setHours(0,0,0,0);
  const days  = Math.round((d - today) / 86400000);
  if (days < 0)  return `Overdue by ${Math.abs(days)}d`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days < 7)  return `Due in ${days}d`;
  return `Due ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}
function _dueClass(dueDate) {
  if (!dueDate) return '';
  const d = _parseDate(dueDate);
  if (!d) return '';
  const today = new Date(); today.setHours(0,0,0,0);
  const days  = Math.round((d - today) / 86400000);
  if (days < 0)  return 'is-overdue';
  if (days <= 1) return 'is-soon';
  return '';
}
function _parseDate(raw) {
  if (raw && raw.toDate) raw = raw.toDate().toISOString().slice(0, 10);
  if (typeof raw !== 'string') return null;
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return isNaN(d) ? null : d;
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
