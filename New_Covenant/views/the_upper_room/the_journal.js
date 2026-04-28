/* ══════════════════════════════════════════════════════════════════════════════
   THE JOURNAL — Personal entries
   "Take heed unto thyself, and unto the doctrine; continue in them."
   — 1 Timothy 4:16

   A simple write-and-list journal backed by Firestore (church/{id}/journal
   via UpperRoom.listJournal / createJournal / updateJournal / deleteJournal).
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
  let _liveEntries = [];

  const render = (rows) => {
    if (cancelled || !host.isConnected) return;
    _liveEntries = Array.isArray(rows) ? rows.slice() : [];
    _liveEntries.sort((a, b) => _ts(b) - _ts(a));

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
      <ul class="ur-journal-list" data-ur-jlist>
        ${_liveEntries.length
          ? _liveEntries.map(_entryCard).join('')
          : `<li class="ur-empty-soft">No entries yet — write your first reflection above.</li>`}
      </ul>
    `;
    _wireForm(host, _liveEntries, render);
    _wireList(host, _liveEntries, render);
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
  const id     = String(r.id || '');
  return `
    <li class="ur-journal-entry" data-je-id="${_e(id)}">
      <div class="ur-je-head">
        <div class="ur-je-title">${_e(title)}</div>
        <div class="ur-je-meta">
          <span class="ur-je-when">${_e(when)}</span>
          ${cat   ? `<span class="ur-je-cat">${_e(cat)}</span>` : ''}
          ${isPriv ? `<span class="ur-je-priv" title="Only visible to you">\u{1f512}</span>` : ''}
          ${id ? `<span class="ur-je-actions">
            <button type="button" class="flock-icon-btn flock-icon-btn--sm" data-je-edit title="Edit entry">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </button>
            <button type="button" class="flock-icon-btn flock-icon-btn--sm flock-icon-btn--danger" data-je-delete title="Delete entry">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6"/></svg>
            </button>
          </span>` : ''}
        </div>
      </div>
      ${scrip ? `<div class="ur-je-scrip">${_e(scrip)}</div>` : ''}
      <div class="ur-je-body">${_e(entry)}</div>
    </li>
  `;
}

/* ── Wire form (new entry) ────────────────────────────────────────────────── */

function _wireForm(host, liveEntries, onRefresh) {
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
    submit.disabled = true; status.textContent = 'Saving\u2026';
    try {
      await UR.createJournal(data);
      status.textContent = 'Saved.';
      invalidate(KEY);
      const rows = await draw(KEY, _fetch, { ttl: TTL });
      onRefresh(rows || []);
    } catch (e) {
      status.textContent = 'Save failed \u2014 please try again.';
    } finally {
      submit.disabled = false;
    }
  });
}

/* ── Wire list (edit / delete) ────────────────────────────────────────────── */

function _wireList(host, liveEntries, onRefresh) {
  const list = host.querySelector('[data-ur-jlist]');
  if (!list) return;

  list.querySelectorAll('[data-je-id]').forEach((li) => {
    const id  = li.dataset.jeId;
    const rec = liveEntries.find(r => String(r.id || '') === id);
    if (!rec || !id) return;

    // Edit
    li.querySelector('[data-je-edit]')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      _openEntrySheet(rec, async (updated) => {
        const UR = window.UpperRoom;
        if (!UR || typeof UR.updateJournal !== 'function') {
          alert('Journal update not available.'); return;
        }
        await UR.updateJournal({ id, ...updated });
        invalidate(KEY);
        const rows = await draw(KEY, _fetch, { ttl: TTL });
        onRefresh(rows || []);
      });
    });

    // Delete
    li.querySelector('[data-je-delete]')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm('Delete this journal entry? This cannot be undone.')) return;
      const btn = li.querySelector('[data-je-delete]');
      btn.disabled = true;
      try {
        const UR = window.UpperRoom;
        if (typeof UR?.deleteJournal === 'function') await UR.deleteJournal({ id });
        else if (typeof UR?.updateJournal === 'function') await UR.updateJournal({ id, deleted: true });
        invalidate(KEY);
        const rows = await draw(KEY, _fetch, { ttl: TTL });
        onRefresh(rows || []);
      } catch (err) {
        alert(err?.message || 'Could not delete entry.');
        btn.disabled = false;
      }
    });
  });
}

/* ── Entry edit sheet ─────────────────────────────────────────────────────── */

let _activeEntrySheet = null;

function _closeEntrySheet() {
  if (!_activeEntrySheet) return;
  const t = _activeEntrySheet;
  t.querySelector('.life-sheet-overlay')?.classList.remove('is-open');
  t.querySelector('.life-sheet-panel')?.classList.remove('is-open');
  setTimeout(() => { t.remove(); if (_activeEntrySheet === t) _activeEntrySheet = null; }, 320);
}

function _openEntrySheet(r, onSave) {
  _closeEntrySheet();
  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  sheet.innerHTML = /* html */`
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel" role="dialog" aria-label="Edit Journal Entry">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div class="life-sheet-hd-info">
          <div class="life-sheet-hd-name">Edit Journal Entry</div>
          <div class="life-sheet-hd-meta">${_e(r?.title || '(untitled)')}</div>
        </div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">
        <div class="life-sheet-field">
          <div class="life-sheet-label">Title <span style="color:#dc2626">*</span></div>
          <input class="life-sheet-input" data-field="title" type="text" value="${_e(r?.title || '')}">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Category</div>
          <select class="life-sheet-input" data-field="category">
            ${CATEGORIES.map(c => `<option value="${_e(c)}"${c === (r?.category || '') ? ' selected' : ''}>${_e(c)}</option>`).join('')}
          </select>
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Scripture</div>
          <input class="life-sheet-input" data-field="scripture" type="text" value="${_e(r?.scripture || '')}" placeholder="e.g. John 4:14">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Entry <span style="color:#dc2626">*</span></div>
          <textarea class="life-sheet-input" data-field="entry" rows="6" style="resize:vertical">${_e(r?.entry || '')}</textarea>
        </div>
        <div class="life-sheet-field" style="display:flex;align-items:center;gap:8px">
          <input type="checkbox" id="ur-je-priv-chk" data-field="private" ${r?.private ? 'checked' : ''}>
          <label for="ur-je-priv-chk" style="font-size:.9rem;color:var(--ink-muted,#6b7280)">Keep private</label>
        </div>
        <div class="fold-form-error" data-error style="display:none;color:#dc2626;font-size:.85rem;margin-top:8px"></div>
      </div>
      <div class="life-sheet-foot">
        <button class="flock-btn" data-cancel>Cancel</button>
        <button class="flock-btn flock-btn--primary" data-save>Save Changes</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  _activeEntrySheet = sheet;
  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
  });

  sheet.querySelector('[data-cancel]').addEventListener('click', _closeEntrySheet);
  sheet.querySelector('.life-sheet-close').addEventListener('click', _closeEntrySheet);

  sheet.querySelector('[data-save]').addEventListener('click', async () => {
    const errEl = sheet.querySelector('[data-error]');
    const title = sheet.querySelector('[data-field="title"]').value.trim();
    const entry = sheet.querySelector('[data-field="entry"]').value.trim();
    if (!title || !entry) { errEl.textContent = 'Title and entry are required.'; errEl.style.display = ''; return; }
    errEl.style.display = 'none';
    const btn = sheet.querySelector('[data-save]');
    btn.disabled = true; btn.textContent = 'Saving\u2026';
    try {
      await onSave({
        title,
        entry,
        category:  sheet.querySelector('[data-field="category"]').value,
        scripture: sheet.querySelector('[data-field="scripture"]').value.trim() || undefined,
        private:   sheet.querySelector('[data-field="private"]').checked,
      });
      _closeEntrySheet();
    } catch (err) {
      errEl.textContent = err?.message || 'Could not save entry.'; errEl.style.display = '';
      btn.disabled = false; btn.textContent = 'Save Changes';
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
