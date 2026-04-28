/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: QUARTERLY WORSHIP — Service Plans & Arts Calendar
   "Sing unto the LORD a new song." — Psalm 96:1
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'quarterly_worship';
export const title = 'Quarterly Worship';

const _e = s => String(s ?? '').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function _quarterLabel(d = new Date()) {
  const q = Math.floor(d.getMonth() / 3) + 1;
  const start = new Date(d.getFullYear(), (q - 1) * 3, 1);
  const end   = new Date(d.getFullYear(), (q - 1) * 3 + 3, 0);
  const fmt   = (x) => x.toLocaleDateString(undefined, { month: 'short' });
  return `Q${q} ${d.getFullYear()} (${fmt(start)}–${fmt(end)})`;
}

const TYPE_META = {
  rehearsal: { color: '#7c3aed', bg: 'rgba(124,58,237,0.10)' },
  training:  { color: '#0ea5e9', bg: 'rgba(14,165,233,0.10)' },
  planning:  { color: '#059669', bg: 'rgba(5,150,105,0.10)'  },
};

export function render() {
  const quarter = _quarterLabel();
  return /* html */`
    <section class="qw-view">
      ${pageHero({
        title:    'Quarterly Worship',
        subtitle: `${quarter} — service plans, setlists, and arts calendar.`,
        scripture: 'Sing unto the LORD a new song. — Psalm 96:1',
      })}

      <div class="qw-layout">

        <!-- Left: service plans -->
        <div class="qw-plans-col">
          <div class="way-section-header">
            <h2 class="way-section-title">Service Plans</h2>
            <button class="flock-btn flock-btn--primary" style="display:flex;align-items:center;gap:6px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
              New Plan
            </button>
          </div>
          <div class="qw-plans" data-bind="plans">
            <div class="life-empty" style="padding:24px 8px;color:var(--ink-muted,#7a7f96);text-align:center">Loading service plans…</div>
          </div>
        </div>

        <!-- Right: arts calendar -->
        <div class="qw-arts-col">
          <div class="way-section-header">
            <h2 class="way-section-title">Arts Calendar</h2>
          </div>
          <div class="qw-arts" data-bind="arts">
            <div class="life-empty" style="padding:24px 8px;color:var(--ink-muted,#7a7f96);text-align:center">Arts calendar coming soon.</div>
          </div>
        </div>

      </div>
    </section>
  `;
}

let _activePlanSheet = null;
let _livePlansMap    = {};

export function mount(root) {
  // New Plan button
  root.querySelectorAll('.flock-btn--primary').forEach(btn => {
    if (btn.textContent.includes('New Plan')) {
      btn.addEventListener('click', () => _openPlanSheet(null, () => _loadPlans(root)));
    }
  });

  _loadPlans(root);
  return () => { _closePlanSheet(); };
}

function _rows(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.rows)) return res.rows;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

async function _loadPlans(root) {
  const plansEl = root.querySelector('[data-bind="plans"]');
  if (!plansEl) return;
  const errMsg = (msg) => `<div class="life-empty" style="padding:24px 8px;color:var(--ink-muted,#7a7f96);text-align:center">${msg}</div>`;

  const V = window.TheVine;
  if (!V) { plansEl.innerHTML = errMsg('Service plans backend not loaded.'); return; }

  try {
    const res  = await V.flock.servicePlans.list({ limit: 20 });
    const rows = _rows(res);

    // Filter to current quarter
    const now = new Date();
    const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const qEnd   = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
    const plans  = rows.filter(p => {
      const d = new Date(p.serviceDate || p.date || p.createdAt);
      return d >= qStart && d <= qEnd;
    }).sort((a, b) => new Date(a.serviceDate || a.date) - new Date(b.serviceDate || b.date));

    if (!plans.length) { plansEl.innerHTML = errMsg('No service plans for this quarter yet.'); return; }

    _livePlansMap = {};
    plansEl.innerHTML = plans.map((p, i) => {
      const dateMs = new Date(p.serviceDate || p.date || p.createdAt).getTime();
      const date   = dateMs ? new Date(dateMs).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
      const title  = p.title || p.name || 'Service';
      const series = p.series || p.seriesName || '';
      const theme  = p.theme || p.message || '';
      const preacher = p.preacher || p.speaker || '';
      const songs  = p.songs || p.setlist || [];
      const pid = p.id ? String(p.id) : String(i);
      if (p.id) _livePlansMap[pid] = p;
      return _planCard({ date, title, series, theme, preacher, songs, _id: pid });
    }).join('');
    // Wire card clicks for edit
    const reload = () => _loadPlans(root);
    plansEl.querySelectorAll('.qw-plan-card[data-id]').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        const plan = _livePlansMap[card.dataset.id];
        if (plan) _openPlanSheet(plan, reload);
      });
    });
  } catch (err) {
    console.error('[QuarterlyWorship] servicePlans.list error:', err);
    plansEl.innerHTML = errMsg('Could not load service plans.');
  }
}

function _planCard(p) {
  const songList = Array.isArray(p.songs) && p.songs.length
    ? `<div class="qw-plan-songs">🎵 ${p.songs.map(s => _e(typeof s === 'string' ? s : s.title || '')).join(' · ')}</div>`
    : '';
  return /* html */`
    <article class="qw-plan-card" tabindex="0"${p._id ? ` data-id="${_e(p._id)}"` : ''}>
      <div class="qw-plan-date">${_e(p.date)}</div>
      <div class="qw-plan-body">
        <div class="qw-plan-title">${_e(p.title)}</div>
        <div class="qw-plan-meta">
          ${p.series   ? `<span class="qw-plan-series">${_e(p.series)}</span>` : ''}
          ${p.theme    ? `<span class="qw-plan-theme">· ${_e(p.theme)}</span>` : ''}
          ${p.preacher ? `<span class="qw-plan-preacher">👤 ${_e(p.preacher)}</span>` : ''}
        </div>
        ${songList}
      </div>
    </article>`;
}

// ── Service Plan sheet (create / edit) ──────────────────────────────────────────
function _closePlanSheet() {
  if (!_activePlanSheet) return;
  const t = _activePlanSheet;
  t.querySelector('.life-sheet-overlay')?.classList.remove('is-open');
  t.querySelector('.life-sheet-panel')?.classList.remove('is-open');
  setTimeout(() => { t.remove(); if (_activePlanSheet === t) _activePlanSheet = null; }, 320);
}

function _openPlanSheet(plan, onReload) {
  _closePlanSheet();
  const V     = window.TheVine;
  const isNew = !plan;
  const uid   = plan?.id ? String(plan.id) : '';
  const title = plan?.title || plan?.name || '';
  const date  = plan?.serviceDate ? String(plan.serviceDate).substring(0,10) : (plan?.date ? String(plan.date).substring(0,10) : '');
  const series   = plan?.series   || plan?.seriesName || '';
  const theme    = plan?.theme    || plan?.message    || '';
  const preacher = plan?.preacher || plan?.speaker    || '';
  const songs    = Array.isArray(plan?.songs) ? plan.songs.map(s => typeof s === 'string' ? s : s.title || '').join(', ') : '';

  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  sheet.innerHTML = /* html */`
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel" role="dialog" aria-label="${isNew ? 'New Service Plan' : 'Edit Service Plan'}">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div class="life-sheet-hd-info">
          <div class="life-sheet-hd-name">${isNew ? 'New Service Plan' : 'Edit Service Plan'}</div>
          <div class="life-sheet-hd-meta">${isNew ? 'Create a new service order' : _e(title)}</div>
        </div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">
        <div class="life-sheet-field">
          <div class="life-sheet-label">Title <span style="color:#dc2626">*</span></div>
          <input class="life-sheet-input" data-field="title" type="text" value="${_e(title)}" placeholder="e.g. Kingdom Roots — Week 1">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Service Date <span style="color:#dc2626">*</span></div>
          <input class="life-sheet-input" data-field="serviceDate" type="date" value="${_e(date)}">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Series Name</div>
          <input class="life-sheet-input" data-field="series" type="text" value="${_e(series)}" placeholder="e.g. Kingdom Roots">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Theme / Message</div>
          <input class="life-sheet-input" data-field="theme" type="text" value="${_e(theme)}" placeholder="e.g. Abide in the Vine">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Preacher / Speaker</div>
          <input class="life-sheet-input" data-field="preacher" type="text" value="${_e(preacher)}" placeholder="e.g. Pastor Greg">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Songs / Setlist <span style="color:#6b7280;font-weight:400">(comma-separated)</span></div>
          <textarea class="life-sheet-input" data-field="songs" rows="3" style="resize:vertical" placeholder="Come Thou Fount, Holy Spirit, What A Beautiful Name">${_e(songs)}</textarea>
        </div>
        <div class="fold-form-error" data-error style="display:none;color:#dc2626;font-size:.85rem;margin-top:8px"></div>
      </div>
      <div class="life-sheet-foot">
        ${!isNew ? '<button class="flock-btn flock-btn--danger" data-delete style="margin-right:auto">Delete Plan</button>' : ''}
        <button class="flock-btn" data-cancel>Cancel</button>
        <button class="flock-btn flock-btn--primary" data-save>${isNew ? 'Create Plan' : 'Save Changes'}</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  _activePlanSheet = sheet;
  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
    if (isNew) sheet.querySelector('[data-field="title"]')?.focus();
  });

  const close = () => _closePlanSheet();
  sheet.querySelector('[data-cancel]').addEventListener('click', close);
  sheet.querySelector('.life-sheet-close').addEventListener('click', close);

  sheet.querySelector('[data-save]').addEventListener('click', async () => {
    const errEl    = sheet.querySelector('[data-error]');
    const titleVal = sheet.querySelector('[data-field="title"]').value.trim();
    const dateVal  = sheet.querySelector('[data-field="serviceDate"]').value;
    if (!titleVal) { errEl.textContent = 'Title is required.'; errEl.style.display = ''; return; }
    if (!dateVal)  { errEl.textContent = 'Service date is required.'; errEl.style.display = ''; return; }
    errEl.style.display = 'none';
    const btn = sheet.querySelector('[data-save]');
    btn.disabled = true; btn.textContent = isNew ? 'Creating…' : 'Saving…';
    const songsRaw = sheet.querySelector('[data-field="songs"]').value;
    const songArr  = songsRaw ? songsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
    const payload = {
      title:    titleVal,
      serviceDate: dateVal,
      series:   sheet.querySelector('[data-field="series"]').value.trim(),
      theme:    sheet.querySelector('[data-field="theme"]').value.trim(),
      preacher: sheet.querySelector('[data-field="preacher"]').value.trim(),
      songs:    songArr,
    };
    if (!isNew) payload.id = uid;
    try {
      if (!V) throw new Error('Service plans backend not available.');
      if (isNew) { await V.flock.servicePlans.create(payload); }
      else       { await V.flock.servicePlans.update(payload); }
      _closePlanSheet();
      onReload?.();
    } catch (err) {
      console.error('[QuarterlyWorship] plan save error:', err);
      errEl.textContent = err?.message || 'Could not save plan.';
      errEl.style.display = '';
      btn.disabled = false; btn.textContent = isNew ? 'Create Plan' : 'Save Changes';
    }
  });

  sheet.querySelector('[data-delete]')?.addEventListener('click', async () => {
    const ok = confirm(`Delete “${title}”? This cannot be undone.`);
    if (!ok) return;
    const btn = sheet.querySelector('[data-delete]');
    btn.disabled = true; btn.textContent = 'Deleting…';
    try {
      await V.flock.servicePlans.update({ id: uid, status: 'Deleted' });
      _closePlanSheet();
      onReload?.();
    } catch (err) {
      btn.disabled = false; btn.textContent = 'Delete Plan';
    }
  });
}