/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE PRAYER CHAIN — Live prayer channel + structured prayer requests
   "Pray one for another." — James 5:16

   Two columns:
     • Left: live #prayer-chain channel (Firebase / TheUpperRoom).
     • Right: all active prayer requests so a pastor can tend them alongside
       the live conversation.
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';
import { messages } from '../../Scripts/the_upper_room/index.js';
import * as life     from '../../Scripts/the_life/index.js';
import { renderMessage }  from '../the_fellowship/the_message.js';
import { renderComposer } from '../the_fellowship/the_composer.js';

export const name  = 'the_prayer_chain';
export const title = 'Prayer Chain';

let _activePCSheet = null;
let _liveReqsMap   = {};

const CHANNEL_ID = 'prayer-chain';

export function render() {
  return `
    <section>
      ${pageHero({
        title: 'Prayer Chain',
        subtitle: 'Lift one another up in real time, and tend the structured prayer requests.',
        scripture: 'Pray one for another. — James 5:16',
      })}
      <div class="pc-layout">
        <div class="pc-stream-col">
          <div data-bind="stream" class="pc-stream">
            <div class="pc-stream-empty">Loading…</div>
          </div>
          <div data-bind="composer"></div>
        </div>
        <aside data-bind="requests" class="pc-requests-col">
          <div class="pc-col-hd" style="display:flex;align-items:center;justify-content:space-between">
            Standing Requests
            <button class="flock-btn flock-btn--primary flock-btn--sm" data-act="add-request" style="margin-left:auto">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="margin-right:4px"><path d="M12 5v14M5 12h14"/></svg>Add
            </button>
          </div>
          <div class="pc-col-body pc-loading">Loading requests…</div>
        </aside>
      </div>
    </section>
  `;
}

export function mount(root) {
  const stream  = root.querySelector('[data-bind="stream"]');
  const compose = root.querySelector('[data-bind="composer"]');
  const reqs    = root.querySelector('[data-bind="requests"]');

  // ── Live stream ────────────────────────────────────────────────────────
  let unwatch = () => {};
  messages.watch(CHANNEL_ID, (rows = []) => {
    stream.innerHTML = rows.length
      ? rows.map(renderMessage).join('')
      : `<div class="pc-stream-empty">Begin the chain. Pray a word.</div>`;
    stream.scrollTop = stream.scrollHeight;
  }).then((u) => { unwatch = u; }).catch(() => {
    stream.innerHTML = `<div class="pc-stream-empty">Live prayer channel unavailable.</div>`;
  });

  const stopComposer = renderComposer(compose, { channelId: CHANNEL_ID });

  // ── Standing requests ──────────────────────────────────────────────────
  function _loadRequests() {
    life.prayerRequests().then((rows = []) => {
      _liveReqsMap = {};
      rows.forEach(r => { if (r.id) _liveReqsMap[String(r.id)] = r; });
      const CLOSED = new Set(['answered', 'closed', 'archived', 'deleted']);
      const open   = rows.filter(r => !CLOSED.has((r.status || '').toLowerCase()));
      const closed = rows.filter(r =>  CLOSED.has((r.status || '').toLowerCase()));
      if (!rows.length) {
        reqs.querySelector('.pc-col-body').innerHTML = `<div class="pc-col-empty">No standing requests right now.</div>`;
        return;
      }
      reqs.querySelector('.pc-col-body').innerHTML = [...open, ...closed].map(_req).join('');
      // Wire card clicks
      reqs.querySelectorAll('.pc-req-card[data-id]').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
          const rec = _liveReqsMap[card.dataset.id];
          if (rec) _openPrayerRequestSheet(rec, _loadRequests);
        });
      });
    }).catch(() => {
      reqs.querySelector('.pc-col-body').innerHTML = `<div class="pc-col-empty">Prayer request backend unavailable.</div>`;
    });
  }
  _loadRequests();

  // Add Request button
  reqs.querySelector('[data-act="add-request"]')?.addEventListener('click', () => {
    _openPrayerRequestSheet(null, _loadRequests);
  });

  return () => { try { unwatch(); } catch (_) {} try { stopComposer(); } catch (_) {} _closePCSheet(); };
}

// ── Prayer request card ────────────────────────────────────────────────────────
function _req(p) {
  const name    = _e(p.submitterName || p['Submitter Name'] || 'Anonymous');
  const text    = _e(p.prayerText    || p['Prayer Text']   || '');
  const cat     = p.category         || p['Category']      || '';
  const status  = p.status           || p['Status']        || 'New';
  const date    = _dateStr(p.submittedAt || p['Submitted At'] || p.createdAt);
  const isConf  = p.isConfidential === true || String(p.isConfidential || '').toUpperCase() === 'TRUE';
  const isAns   = status.toLowerCase() === 'answered';

  const statusMap = {
    new:        { color: '#5b8fcf', bg: 'rgba(91,143,207,0.10)'  },
    'in progress': { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    'follow-up':   { color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)' },
    answered:   { color: '#16a34a', bg: 'rgba(22,163,74,0.10)'   },
    closed:     { color: '#9ca3af', bg: 'rgba(156,163,175,0.10)' },
  };
  const s = statusMap[status.toLowerCase()] || statusMap.new;
  const pid = p.id ? _e(String(p.id)) : '';

  return `
    <div class="pc-req-card${isAns ? ' pc-req-answered' : ''}"${pid ? ` data-id="${pid}"` : ''} tabindex="0">
      <div class="pc-req-hd">
        <span class="pc-req-name">${name}</span>
        <span class="pc-req-status" style="color:${s.color};background:${s.bg};">${_e(status)}</span>
      </div>
      ${cat ? `<span class="pc-req-cat">${_e(cat)}</span>` : ''}
      ${text ? `<div class="pc-req-text">${text}</div>` : ''}
      <div class="pc-req-foot">
        ${isConf ? `<span class="pc-req-conf">🔒 Confidential</span>` : ''}
        ${date   ? `<span class="pc-req-date">${date}</span>` : ''}
      </div>
    </div>`;
}

function _dateStr(v) {
  if (!v) return '';
  try {
    const ms = v?.seconds ? v.seconds * 1000 : new Date(v).getTime();
    if (!ms || isNaN(ms)) return '';
    return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (_) { return ''; }
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ── Prayer request sheet ────────────────────────────────────────────
function _closePCSheet() {
  if (!_activePCSheet) return;
  const t = _activePCSheet;
  t.querySelector('.life-sheet-overlay')?.classList.remove('is-open');
  t.querySelector('.life-sheet-panel')?.classList.remove('is-open');
  setTimeout(() => { t.remove(); if (_activePCSheet === t) _activePCSheet = null; }, 320);
}

const PR_CATEGORIES = ['Intercession', 'Praise', 'Personal', 'Urgent', 'Healing', 'Guidance', 'Family'];
const PR_STATUSES   = ['New', 'In Progress', 'Follow-up', 'Answered', 'Closed'];

function _openPrayerRequestSheet(p, onReload) {
  _closePCSheet();
  const V     = window.TheVine;
  const isNew = !p;
  const uid   = p?.id ? String(p.id) : '';
  const submitter = p?.submitterName || p?.['Submitter Name'] || '';
  const text      = p?.prayerText    || p?.['Prayer Text']    || '';
  const category  = p?.category      || p?.['Category']       || '';
  const status    = p?.status        || p?.['Status']         || 'New';
  const isConf    = p?.isConfidential === true || String(p?.isConfidential || '').toUpperCase() === 'TRUE';

  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  sheet.innerHTML = /* html */`
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel" role="dialog" aria-label="${isNew ? 'Add Prayer Request' : 'Edit Prayer Request'}">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div class="life-sheet-hd-info">
          <div class="life-sheet-hd-name">${isNew ? 'Add Prayer Request' : 'Edit Prayer Request'}</div>
          <div class="life-sheet-hd-meta">${isNew ? 'Add a standing request to the chain' : _e(submitter || 'Anonymous')}</div>
        </div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">
        <div class="life-sheet-field">
          <div class="life-sheet-label">Submitter Name <span style="color:#6b7280;font-weight:400">(optional)</span></div>
          <input class="life-sheet-input" data-field="submitterName" type="text" value="${_e(submitter)}" placeholder="Leave blank for Anonymous">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Prayer Request <span style="color:#dc2626">*</span></div>
          <textarea class="life-sheet-input" data-field="prayerText" rows="4" style="resize:vertical" placeholder="Share the prayer need…">${_e(text)}</textarea>
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Category</div>
          <select class="life-sheet-input" data-field="category">
            <option value="">— select —</option>
            ${PR_CATEGORIES.map(c => `<option value="${_e(c)}"${c === category ? ' selected' : ''}>${_e(c)}</option>`).join('')}
          </select>
        </div>
        ${!isNew ? `<div class="life-sheet-field">
          <div class="life-sheet-label">Status</div>
          <select class="life-sheet-input" data-field="status">
            ${PR_STATUSES.map(s => `<option value="${_e(s)}"${s.toLowerCase() === status.toLowerCase() ? ' selected' : ''}>${_e(s)}</option>`).join('')}
          </select>
        </div>` : ''}
        <div class="life-sheet-field" style="display:flex;align-items:center;gap:10px;">
          <input type="checkbox" data-field="isConfidential" id="pc-conf"${isConf ? ' checked' : ''} style="width:auto">
          <label for="pc-conf" class="life-sheet-label" style="margin:0">🔒 Mark as confidential (pastoral eyes only)</label>
        </div>
        <div class="fold-form-error" data-error style="display:none;color:#dc2626;font-size:.85rem;margin-top:8px"></div>
      </div>
      <div class="life-sheet-foot">
        ${!isNew ? '<button class="flock-btn flock-btn--ghost" data-answered style="margin-right:8px">Mark Answered</button>' : ''}
        ${!isNew ? '<button class="flock-btn flock-btn--danger" data-delete style="margin-right:auto">Delete</button>' : ''}
        <button class="flock-btn" data-cancel>Cancel</button>
        <button class="flock-btn flock-btn--primary" data-save>${isNew ? 'Add Request' : 'Save Changes'}</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  _activePCSheet = sheet;
  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
    if (isNew) sheet.querySelector('[data-field="submitterName"]')?.focus();
  });

  const close = () => _closePCSheet();
  sheet.querySelector('[data-cancel]').addEventListener('click', close);
  sheet.querySelector('.life-sheet-close').addEventListener('click', close);

  sheet.querySelector('[data-save]').addEventListener('click', async () => {
    const errEl   = sheet.querySelector('[data-error]');
    const txtVal  = sheet.querySelector('[data-field="prayerText"]').value.trim();
    if (!txtVal) { errEl.textContent = 'Prayer request text is required.'; errEl.style.display = ''; return; }
    errEl.style.display = 'none';
    const btn = sheet.querySelector('[data-save]');
    btn.disabled = true; btn.textContent = isNew ? 'Submitting…' : 'Saving…';
    // Convert checkbox boolean → 'TRUE'/'FALSE' string (Firestore createPrayer expects strings)
    const isConfChecked = sheet.querySelector('[data-field="isConfidential"]').checked;
    const payload = {
      submitterName:   sheet.querySelector('[data-field="submitterName"]').value.trim() || 'Anonymous',
      prayerText:      txtVal,
      category:        sheet.querySelector('[data-field="category"]').value || undefined,
      isConfidential:  isConfChecked ? 'TRUE' : 'FALSE',
      ...(isNew ? { status: 'New' } : { status: sheet.querySelector('[data-field="status"]')?.value || status }),
    };
    try {
      const UR = window.UpperRoom;
      // Firestore (UpperRoom) is the source of truth — life.prayerRequests reads from here
      if (isNew) {
        if (UR && typeof UR.createPrayer === 'function') {
          await UR.createPrayer(payload);
        } else if (V) {
          await V.flock.prayer.create(payload);
        } else {
          throw new Error('No prayer backend available.');
        }
      } else {
        if (UR && typeof UR.updatePrayer === 'function') {
          await UR.updatePrayer(uid, payload);
        } else if (V) {
          await V.flock.prayer.update(Object.assign({ id: uid }, payload));
        } else {
          throw new Error('No prayer backend available.');
        }
      }
      _closePCSheet();
      onReload?.();
    } catch (err) {
      errEl.textContent = err?.message || 'Could not save.';
      errEl.style.display = '';
      btn.disabled = false; btn.textContent = isNew ? 'Add Request' : 'Save Changes';
    }
  });

  sheet.querySelector('[data-answered]')?.addEventListener('click', async () => {
    const ok = confirm('Mark this prayer request as answered? Praise God!');
    if (!ok) return;
    const btn = sheet.querySelector('[data-answered]');
    btn.disabled = true; btn.textContent = 'Saving…';
    try {
      const UR = window.UpperRoom;
      if (UR && typeof UR.updatePrayer === 'function') {
        await UR.updatePrayer(uid, { status: 'Answered' });
      } else if (V) {
        await V.flock.prayer.update({ id: uid, status: 'Answered' });
      } else {
        throw new Error('No prayer backend available.');
      }
      _closePCSheet();
      onReload?.();
    } catch (err) { btn.disabled = false; btn.textContent = 'Mark Answered'; }
  });

  sheet.querySelector('[data-delete]')?.addEventListener('click', async () => {
    if (!confirm('Delete this prayer request? This cannot be undone.')) return;
    const btn = sheet.querySelector('[data-delete]');
    btn.disabled = true; btn.textContent = 'Deleting…';
    try {
      const UR = window.UpperRoom;
      if (UR && typeof UR.deletePrayer === 'function') {
        await UR.deletePrayer(uid);
      } else if (UR && typeof UR.updatePrayer === 'function') {
        // Fallback: soft-delete by setting status to Archived
        await UR.updatePrayer(uid, { status: 'Archived' });
      } else if (V?.flock?.prayer?.remove) {
        await V.flock.prayer.remove(uid);
      } else if (V?.flock?.prayer?.update) {
        await V.flock.prayer.update({ id: uid, status: 'Archived' });
      } else {
        throw new Error('No prayer backend available.');
      }
      _closePCSheet();
      onReload?.();
    } catch (err) {
      console.error('[PrayerChain] delete:', err);
      alert(err?.message || 'Could not delete prayer request.');
      btn.disabled = false; btn.textContent = 'Delete';
    }
  });
}
