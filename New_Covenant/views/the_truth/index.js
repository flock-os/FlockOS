/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE TRUTH — Content Library
   "Sanctify them through thy truth: thy word is truth." — John 17:17
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';
import { buildAdapter } from '../../Scripts/the_living_water_adapter.js';

export const name  = 'the_truth';
export const title = 'Content';

let _activeTruthSheet = null;
let _liveSeriesMap    = {};
let _liveMsgMap       = {};

const TYPE_META = {
  sermon:     { label: 'Sermon',     color: '#7c3aed', bg: 'rgba(124,58,237,0.11)' },
  study:      { label: 'Study',      color: '#0ea5e9', bg: 'rgba(14,165,233,0.11)' },
  devotional: { label: 'Devotional', color: '#059669', bg: 'rgba(5,150,105,0.11)'  },
};

export function render() {
  return /* html */`
    <section class="truth-view">
      ${pageHero({
        title:    'Content',
        subtitle: 'Sermon series, Bible studies, and devotionals — your congregation\'s library.',
        scripture: 'Sanctify them through thy truth: thy word is truth. — John 17:17',
      })}

      <!-- Toolbar -->
      <div class="fold-toolbar">
        <div class="fold-filters">
          <button class="fold-filter is-active" data-truth-filter="all">All</button>
          <button class="fold-filter" data-truth-filter="sermon">Sermons</button>
          <button class="fold-filter" data-truth-filter="study">Studies</button>
          <button class="fold-filter" data-truth-filter="devotional">Devotionals</button>
        </div>
        <button class="flock-btn flock-btn--primary" style="margin-left:auto; display:flex; align-items:center; gap:6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Upload
        </button>
      </div>

      <!-- Active series -->
      <div class="way-section-header">
        <h2 class="way-section-title">Series</h2>
      </div>
      <div class="truth-series-grid">
        <div class="truth-loading" style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Loading series…</div>
      </div>

      <!-- Recent messages -->
      <div class="way-section-header" style="margin-top:24px;">
        <h2 class="way-section-title">Recent Messages</h2>
        <button class="flock-btn flock-btn--ghost way-see-all">Browse All</button>
      </div>
      <div class="truth-messages">
        <div class="truth-loading" style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Loading messages…</div>
      </div>
    </section>
  `;
}

export function mount(root) {
  // Filter wiring (works for demo and live rows)
  function _wireFilters() {
    root.querySelectorAll('[data-truth-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('[data-truth-filter]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const f = btn.dataset.truthFilter;
        root.querySelectorAll('.truth-msg-row').forEach((row) => {
          row.style.display = (f === 'all' || row.dataset.type === f) ? '' : 'none';
        });
      });
    });
  }
  _wireFilters();

  // Upload button → new sermon sheet
  root.querySelectorAll('.flock-btn--primary').forEach(btn => {
    if (btn.textContent.includes('Upload')) {
      btn.addEventListener('click', () => _openMsgSheet(null, () => _loadTruth(root).then(() => _wireFilters())));
    }
  });

  _loadTruth(root).then(() => _wireFilters());
  return () => { _closeTruthSheet(); };
}

async function _loadTruth(root) {
  const V = window.TheVine;
  const MX  = buildAdapter('flock.sermons', V);
  const MXS = buildAdapter('flock.sermonSeries', V);
  const seriesEl = root.querySelector('.truth-series-grid');
  const msgsEl   = root.querySelector('.truth-messages');
  if (!V) {
    if (seriesEl) seriesEl.innerHTML = '<div class="life-empty" style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Content backend not loaded.</div>';
    if (msgsEl)   msgsEl.innerHTML   = '<div class="life-empty" style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Content backend not loaded.</div>';
    return;
  }
  if (seriesEl) {
    seriesEl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Loading series…</div>';
    try {
      const res  = await MXS.list();
      const rows = _rows(res);
      seriesEl.innerHTML = rows.length
        ? rows.map(_liveSeriesCard).join('')
        : '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">No sermon series on file.</div>';
      // Build map + wire edit clicks
      _liveSeriesMap = {};
      rows.forEach(s => { if (s.id) _liveSeriesMap[String(s.id)] = s; });
      const sreload = () => _loadTruth(root);
      seriesEl.querySelectorAll('.truth-series-card[data-id]').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
          const rec = _liveSeriesMap[card.dataset.id];
          if (rec) _openSeriesSheet(rec, sreload);
        });
      });
    } catch (err) {
      console.error('[TheTruth] sermonSeries.list error:', err);
      seriesEl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Content library unavailable.</div>';
    }
  }

  // Recent sermons/messages
  if (msgsEl) {
    msgsEl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Loading messages…</div>';
    try {
      const res  = await MX.list();
      const rows = _rows(res);
      msgsEl.innerHTML = rows.length
        ? rows.map(_liveMsgRow).join('')
        : '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">No messages on file.</div>';
      // Build map + wire edit clicks
      _liveMsgMap = {};
      rows.forEach(m => { if (m.id) _liveMsgMap[String(m.id)] = m; });
      const mreload = () => _loadTruth(root);
      msgsEl.querySelectorAll('.truth-msg-row[data-id]').forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
          const rec = _liveMsgMap[row.dataset.id];
          if (rec) _openMsgSheet(rec, mreload);
        });
      });
    } catch (err) {
      console.error('[TheTruth] sermons.list error:', err);
      msgsEl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Messages unavailable.</div>';
    }
  }
}

function _rows(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.rows)) return res.rows;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

const _COVER_COLORS = ['#7c3aed','#0ea5e9','#059669','#e8a838','#db2777','#c05818','#6366f1'];
const _SERIES_ICONS = ['🌿','🛡️','💧','👑','🕊️','🔥','✝️'];

function _liveSeriesCard(s, i) {
  const title    = s.title || s.name || 'Series';
  const speaker  = s.speaker || s.preacher || s.author || '';
  const desc     = s.description || s.desc || '';
  const episodes = s.episodeCount || s.messageCount || s.count || 0;
  const current  = !!(s.current || (s.status || '').toLowerCase() === 'active');
  const color    = _COVER_COLORS[i % _COVER_COLORS.length];
  const icon     = _SERIES_ICONS[i % _SERIES_ICONS.length];
  return /* html */`
    <article class="truth-series-card${current ? ' truth-series--current' : ''}"${s.id ? ` data-id="${_e(String(s.id))}"` : ''} tabindex="0">
      <div class="truth-series-cover" style="background:${color}">${icon}</div>
      <div class="truth-series-body">
        <div class="truth-series-title">${_e(title)}</div>
        ${speaker ? `<div class="truth-series-speaker">${_e(speaker)}</div>` : ''}
        ${desc    ? `<div class="truth-series-desc">${_e(desc)}</div>` : ''}
        <div class="truth-series-foot">
          ${episodes ? `<span class="truth-episode-count">${episodes} messages</span>` : ''}
          ${current  ? '<span class="truth-current-badge">Current</span>' : ''}
        </div>
      </div>
    </article>`;
}

function _liveMsgRow(m) {
  const title    = m.title || m.name || 'Message';
  const type     = (m.type || m.messageType || 'sermon').toLowerCase();
  const speaker  = m.speaker || m.preacher || m.author || '';
  const date     = m.deliveredDate || m.date || m.createdAt ? _fmtDate(m.deliveredDate || m.date || m.createdAt) : '';
  const duration = m.duration || '';
  const views    = m.playCount || m.views || m.viewCount || 0;
  const meta     = TYPE_META[type] || TYPE_META.sermon;
  return /* html */`
    <article class="truth-msg-row"${m.id ? ` data-id="${_e(String(m.id))}"` : ''} data-type="${_e(type)}" tabindex="0">
      <div class="truth-msg-play">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </div>
      <div class="truth-msg-body">
        <div class="truth-msg-title">${_e(title)}</div>
        <div class="truth-msg-meta">
          <span class="truth-type-badge" style="color:${meta.color}; background:${meta.bg}">${meta.label}</span>
          ${speaker  ? `<span>${_e(speaker)}</span><span>·</span>` : ''}
          ${date     ? `<span>${_e(date)}</span>` : ''}
          ${duration ? `<span>·</span><span>${_e(duration)}</span>` : ''}
        </div>
      </div>
      ${views ? `<div class="truth-msg-views">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        ${views}
      </div>` : ''}
    </article>`;
}

function _fmtDate(ts) {
  if (!ts) return '';
  try { return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch (_) { return String(ts); }
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ── Truth sheets ────────────────────────────────────────────────────
function _closeTruthSheet() {
  if (!_activeTruthSheet) return;
  const t = _activeTruthSheet;
  t.querySelector('.life-sheet-overlay')?.classList.remove('is-open');
  t.querySelector('.life-sheet-panel')?.classList.remove('is-open');
  setTimeout(() => { t.remove(); if (_activeTruthSheet === t) _activeTruthSheet = null; }, 320);
}

const CONTENT_TYPES = ['sermon', 'study', 'devotional', 'teaching', 'testimony'];

function _openMsgSheet(m, onReload) {
  _closeTruthSheet();
  const V     = window.TheVine;
  const MX    = buildAdapter('flock.sermons', V);
  const isNew = !m;
  const uid   = m?.id ? String(m.id) : '';
  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  const title   = m?.title || m?.name || '';
  const type    = (m?.type || m?.messageType || 'sermon').toLowerCase();
  const speaker = m?.speaker || m?.preacher || '';
  const date    = m?.deliveredDate || m?.date ? String(m.deliveredDate || m.date).substring(0,10) : '';
  const duration = m?.duration || '';
  const series  = m?.series || m?.seriesTitle || '';
  const desc    = m?.description || m?.notes || '';

  sheet.innerHTML = /* html */`
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel" role="dialog" aria-label="${isNew ? 'Upload Message' : 'Edit Message'}">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div class="life-sheet-hd-info">
          <div class="life-sheet-hd-name">${isNew ? 'Upload Message' : 'Edit Message'}</div>
          <div class="life-sheet-hd-meta">${isNew ? 'Log a sermon, study, or devotional' : _e(title)}</div>
        </div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">
        <div class="life-sheet-field">
          <div class="life-sheet-label">Title <span style="color:#dc2626">*</span></div>
          <input class="life-sheet-input" data-field="title" type="text" value="${_e(title)}" placeholder="e.g. Rooted &amp; Built Up (Week 6)">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Type</div>
          <select class="life-sheet-input" data-field="type">
            ${CONTENT_TYPES.map(t => `<option value="${t}"${t === type ? ' selected' : ''}>${t.charAt(0).toUpperCase()+t.slice(1)}</option>`).join('')}
          </select>
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Speaker</div>
          <input class="life-sheet-input" data-field="speaker" type="text" value="${_e(speaker)}" placeholder="e.g. Pastor Mike">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Delivered Date</div>
          <input class="life-sheet-input" data-field="deliveredDate" type="date" value="${_e(date)}">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Duration</div>
          <input class="life-sheet-input" data-field="duration" type="text" value="${_e(duration)}" placeholder="e.g. 42 min">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Series</div>
          <input class="life-sheet-input" data-field="series" type="text" value="${_e(series)}" placeholder="Series name">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Notes / Description</div>
          <textarea class="life-sheet-input" data-field="description" rows="3" style="resize:vertical" placeholder="Scripture references, highlights…">${_e(desc)}</textarea>
        </div>
        <div class="fold-form-error" data-error style="display:none;color:#dc2626;font-size:.85rem;margin-top:8px"></div>
      </div>
      <div class="life-sheet-foot">
        ${!isNew ? '<button class="flock-btn flock-btn--danger" data-delete style="margin-right:auto">Delete</button>' : ''}
        <button class="flock-btn" data-cancel>Cancel</button>
        <button class="flock-btn flock-btn--primary" data-save>${isNew ? 'Upload' : 'Save Changes'}</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  _activeTruthSheet = sheet;
  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
    if (isNew) sheet.querySelector('[data-field="title"]')?.focus();
  });

  const close = () => _closeTruthSheet();
  sheet.querySelector('[data-cancel]').addEventListener('click', close);
  sheet.querySelector('.life-sheet-close').addEventListener('click', close);

  sheet.querySelector('[data-save]').addEventListener('click', async () => {
    const errEl = sheet.querySelector('[data-error]');
    const titleVal = sheet.querySelector('[data-field="title"]').value.trim();
    if (!titleVal) { errEl.textContent = 'Title is required.'; errEl.style.display = ''; return; }
    if (!V) { errEl.textContent = 'Content backend not loaded.'; errEl.style.display = ''; return; }
    errEl.style.display = 'none';
    const btn = sheet.querySelector('[data-save]');
    btn.disabled = true; btn.textContent = isNew ? 'Uploading…' : 'Saving…';
    const payload = {
      title:       titleVal,
      type:        sheet.querySelector('[data-field="type"]').value,
      speaker:     sheet.querySelector('[data-field="speaker"]').value.trim() || undefined,
      deliveredDate: sheet.querySelector('[data-field="deliveredDate"]').value || undefined,
      duration:    sheet.querySelector('[data-field="duration"]').value.trim() || undefined,
      series:      sheet.querySelector('[data-field="series"]').value.trim() || undefined,
      description: sheet.querySelector('[data-field="description"]').value.trim() || undefined,
    };
    if (!isNew) payload.id = uid;
    try {
      if (isNew) { await MX.create(payload); }
      else       { await MX.update(payload); }
      _closeTruthSheet();
      onReload?.();
    } catch (err) {
      errEl.textContent = err?.message || 'Could not save.';
      errEl.style.display = '';
      btn.disabled = false; btn.textContent = isNew ? 'Upload' : 'Save Changes';
    }
  });

  sheet.querySelector('[data-delete]')?.addEventListener('click', async () => {
    const ok = confirm(`Delete “${title}”? This cannot be undone.`);
    if (!ok) return;
    const btn = sheet.querySelector('[data-delete]');
    btn.disabled = true; btn.textContent = 'Deleting…';
    try {
      await MX.update({ id: uid, status: 'Deleted' });
      _closeTruthSheet();
      onReload?.();
    } catch (err) {
      console.error('[TheTruth] sermons.delete error:', err);
      btn.disabled = false; btn.textContent = 'Delete';
      alert(err?.message || 'Could not delete message.');
    }
  });
}

function _openSeriesSheet(s, onReload) {
  _closeTruthSheet();
  const V     = window.TheVine;
  const MXS   = buildAdapter('flock.sermonSeries', V);
  const isNew = !s;
  const uid   = s?.id ? String(s.id) : '';
  const title   = s?.title || s?.name || '';
  const speaker = s?.speaker || s?.preacher || '';
  const desc    = s?.description || s?.desc || '';
  const current = !!(s?.current || (s?.status || '').toLowerCase() === 'active');

  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  sheet.innerHTML = /* html */`
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel" role="dialog" aria-label="${isNew ? 'New Series' : 'Edit Series'}">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div class="life-sheet-hd-info">
          <div class="life-sheet-hd-name">${isNew ? 'New Sermon Series' : 'Edit Series'}</div>
          <div class="life-sheet-hd-meta">${isNew ? 'Start a new teaching series' : _e(title)}</div>
        </div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">
        <div class="life-sheet-field">
          <div class="life-sheet-label">Series Title <span style="color:#dc2626">*</span></div>
          <input class="life-sheet-input" data-field="title" type="text" value="${_e(title)}" placeholder="e.g. Rooted">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Speaker</div>
          <input class="life-sheet-input" data-field="speaker" type="text" value="${_e(speaker)}" placeholder="e.g. Pastor Mike">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Description</div>
          <textarea class="life-sheet-input" data-field="description" rows="3" style="resize:vertical" placeholder="Brief summary of the series theme…">${_e(desc)}</textarea>
        </div>
        <div class="life-sheet-field" style="display:flex;align-items:center;gap:10px;">
          <input type="checkbox" data-field="current" id="truth-current" style="width:auto"${current ? ' checked' : ''}>
          <label for="truth-current" class="life-sheet-label" style="margin:0">Mark as current series</label>
        </div>
        <div class="fold-form-error" data-error style="display:none;color:#dc2626;font-size:.85rem;margin-top:8px"></div>
      </div>
      <div class="life-sheet-foot">
        ${!isNew ? '<button class="flock-btn flock-btn--danger" data-delete style="margin-right:auto">Archive Series</button>' : ''}
        <button class="flock-btn" data-cancel>Cancel</button>
        <button class="flock-btn flock-btn--primary" data-save>${isNew ? 'Create Series' : 'Save Changes'}</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  _activeTruthSheet = sheet;
  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
    if (isNew) sheet.querySelector('[data-field="title"]')?.focus();
  });

  const close = () => _closeTruthSheet();
  sheet.querySelector('[data-cancel]').addEventListener('click', close);
  sheet.querySelector('.life-sheet-close').addEventListener('click', close);

  sheet.querySelector('[data-save]').addEventListener('click', async () => {
    const errEl   = sheet.querySelector('[data-error]');
    const titleVal = sheet.querySelector('[data-field="title"]').value.trim();
    if (!titleVal) { errEl.textContent = 'Title is required.'; errEl.style.display = ''; return; }
    if (!V) { errEl.textContent = 'Content backend not loaded.'; errEl.style.display = ''; return; }
    errEl.style.display = 'none';
    const btn = sheet.querySelector('[data-save]');
    btn.disabled = true; btn.textContent = isNew ? 'Creating…' : 'Saving…';
    const isCurrent = sheet.querySelector('[data-field="current"]').checked;
    const payload = {
      title:       titleVal,
      speaker:     sheet.querySelector('[data-field="speaker"]').value.trim() || undefined,
      description: sheet.querySelector('[data-field="description"]').value.trim() || undefined,
      current:     isCurrent,
      status:      isCurrent ? 'Active' : 'Complete',
    };
    if (!isNew) payload.id = uid;
    try {
      if (isNew) { await MXS.create(payload); }
      else       { await MXS.update(payload); }
      _closeTruthSheet();
      onReload?.();
    } catch (err) {
      errEl.textContent = err?.message || 'Could not save.';
      errEl.style.display = '';
      btn.disabled = false; btn.textContent = isNew ? 'Create Series' : 'Save Changes';
    }
  });

  sheet.querySelector('[data-delete]')?.addEventListener('click', async () => {
    const ok = confirm(`Archive the series “${title}”?`);
    if (!ok) return;
    const btn = sheet.querySelector('[data-delete]');
    btn.disabled = true; btn.textContent = 'Archiving…';
    try {
      await MXS.update({ id: uid, status: 'Archived' });
      _closeTruthSheet();
      onReload?.();
    } catch (err) {
      console.error('[TheTruth] sermonSeries.archive error:', err);
      btn.disabled = false; btn.textContent = 'Archive Series';
      alert(err?.message || 'Could not archive series.');
    }
  });
}

