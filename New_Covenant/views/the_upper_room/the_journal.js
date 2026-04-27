/* ══════════════════════════════════════════════════════════════════════════════
   THE JOURNAL — Personal entries
   "Take heed unto thyself, and unto the doctrine; continue in them."
   — 1 Timothy 4:16

   A simple write-and-list journal backed by Firestore (church/{id}/journal
   via UpperRoom.listJournal / createJournal).
   ══════════════════════════════════════════════════════════════════════════════ */

import { draw, swr, invalidate } from '../../Scripts/the_manna.js';

const KEY = 'upperRoom:journal';
const TTL = 60_000; // 1 min — refresh after writes

const CATEGORIES = [
  'Daily Reflection',
  'Devotional',
  'Sermon Notes',
  'Prayer',
  'Gratitude',
  'Question',
  'Other',
];

export function mountJournal(host /*, ctx */) {
  if (!host) return () => {};
  let cancelled = false;

  const render = (rows) => {
    if (cancelled || !host.isConnected) return;
    const list = Array.isArray(rows) ? rows.slice() : [];
    list.sort((a, b) => _ts(b) - _ts(a));

    host.innerHTML = `
      <form class="ur-journal-form" data-ur-jform>
        <div class="ur-jrow">
          <input type="text" name="title" placeholder="Title" class="ur-input" required>
          <select name="category" class="ur-input ur-input-narrow">
            ${CATEGORIES.map(c => `<option value="${_e(c)}">${_e(c)}</option>`).join('')}
          </select>
        </div>
        <div class="ur-jrow">
          <input type="text" name="scripture" placeholder="Scripture (optional, e.g. John 4:14)" class="ur-input">
        </div>
        <textarea name="entry" placeholder="What is the Lord teaching you today?" class="ur-textarea" rows="4" required></textarea>
        <div class="ur-jrow ur-jrow-actions">
          <label class="ur-check">
            <input type="checkbox" name="private" checked>
            <span>Keep private</span>
          </label>
          <button type="submit" class="flock-btn flock-btn--primary">Save Entry</button>
          <span class="ur-save-status" data-ur-jstatus></span>
        </div>
      </form>

      <div class="ur-section-title">Your Entries</div>
      <ul class="ur-journal-list">
        ${list.length
          ? list.map(_entryCard).join('')
          : `<li class="ur-empty-soft">No entries yet — write your first reflection above.</li>`}
      </ul>
    `;
    _wireForm(host);
  };

  const cached = swr(KEY, _fetch, render, { ttl: TTL });
  if (cached !== undefined) {
    render(cached);
  } else {
    draw(KEY, _fetch, { ttl: TTL })
      .then(render)
      .catch(() => {
        if (!cancelled && host.isConnected) {
          host.innerHTML = `<div class="ur-empty">Journal is unavailable right now.</div>`;
        }
      });
  }

  return () => { cancelled = true; };
}

/* ── Data ─────────────────────────────────────────────────────────────────── */

async function _fetch() {
  const UR = window.UpperRoom;
  if (!UR || !UR.isReady || !UR.isReady() || typeof UR.listJournal !== 'function') return [];
  try {
    const rows = await UR.listJournal({ limit: 200 });
    return Array.isArray(rows) ? rows : [];
  } catch (_) { return []; }
}

function _ts(r) {
  const v = r.updatedAt || r.createdAt || r.date || 0;
  if (typeof v === 'number') return v;
  if (v && typeof v === 'object' && typeof v.seconds === 'number') return v.seconds * 1000;
  const d = Date.parse(v);
  return isNaN(d) ? 0 : d;
}

/* ── Render ───────────────────────────────────────────────────────────────── */

function _entryCard(r) {
  const title  = r.title || '(untitled)';
  const cat    = r.category || '';
  const scrip  = r.scripture || '';
  const entry  = r.entry || '';
  const when   = _whenLabel(_ts(r));
  const isPriv = !!r.private;
  return `
    <li class="ur-journal-entry">
      <div class="ur-je-head">
        <div class="ur-je-title">${_e(title)}</div>
        <div class="ur-je-meta">
          <span class="ur-je-when">${_e(when)}</span>
          ${cat   ? `<span class="ur-je-cat">${_e(cat)}</span>` : ''}
          ${isPriv ? `<span class="ur-je-priv" title="Only visible to you">🔒</span>` : ''}
        </div>
      </div>
      ${scrip ? `<div class="ur-je-scrip">${_e(scrip)}</div>` : ''}
      <div class="ur-je-body">${_e(entry)}</div>
    </li>
  `;
}

function _wireForm(host) {
  const form   = host.querySelector('[data-ur-jform]');
  const status = host.querySelector('[data-ur-jstatus]');
  if (!form) return;
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const UR = window.UpperRoom;
    if (!UR || typeof UR.createJournal !== 'function') {
      status.textContent = 'Journal unavailable.';
      return;
    }
    const fd = new FormData(form);
    const data = {
      title:     (fd.get('title') || '').toString().trim(),
      entry:     (fd.get('entry') || '').toString().trim(),
      category:  (fd.get('category') || '').toString(),
      scripture: (fd.get('scripture') || '').toString().trim(),
      private:   !!fd.get('private'),
    };
    if (!data.title || !data.entry) { status.textContent = 'Title and entry are required.'; return; }
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true; status.textContent = 'Saving…';
    try {
      await UR.createJournal(data);
      status.textContent = 'Saved.';
      invalidate(KEY);
      // Re-fetch + re-render.
      const rows = await draw(KEY, _fetch, { ttl: TTL });
      // The mountJournal closure isn't reachable; just call render via a
      // fresh import is overkill — instead trigger a DOM event the host
      // listens for. Simplest: rebuild list portion directly.
      const list = host.querySelector('.ur-journal-list');
      if (list) {
        const sorted = (rows || []).slice().sort((a, b) => _ts(b) - _ts(a));
        list.innerHTML = sorted.length
          ? sorted.map(_entryCard).join('')
          : `<li class="ur-empty-soft">No entries yet.</li>`;
      }
      form.reset();
      // Re-check the private box after reset (form.reset clears it).
      const priv = form.querySelector('input[name="private"]');
      if (priv) priv.checked = true;
    } catch (e) {
      status.textContent = 'Save failed — please try again.';
    } finally {
      submit.disabled = false;
    }
  });
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function _whenLabel(ts) {
  if (!ts) return '';
  const now  = Date.now();
  const diff = now - ts;
  const day  = 86_400_000;
  if (diff < day)      return 'Today';
  if (diff < 2 * day)  return 'Yesterday';
  if (diff < 7 * day)  return Math.floor(diff / day) + ' days ago';
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
