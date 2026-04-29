/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: The Weaver's Plan
   "For I know the thoughts that I think toward you, saith the LORD. — Jeremiah 29:11"
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'the_weavers_plan';
export const title = 'The Weaver\u2019s Plan';

const _e = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ── Status / area helpers ───────────────────────────────────────────────── */
const STATUS_DEF = {
  'on-track':    { bg:'rgba(5,150,105,.10)',  c:'#059669', label:'On Track'    },
  'at-risk':     { bg:'rgba(232,168,56,.14)', c:'#b45309', label:'At Risk'     },
  'off-track':   { bg:'rgba(220,38,38,.10)',  c:'#dc2626', label:'Off Track'   },
  'In Progress': { bg:'rgba(124,58,237,.10)', c:'#7c3aed', label:'In Progress' },
  'Planning':    { bg:'rgba(14,165,233,.10)', c:'#0369a1', label:'Planning'    },
  'Complete':    { bg:'rgba(5,150,105,.10)',  c:'#059669', label:'Complete'    },
  'On Hold':     { bg:'rgba(113,113,122,.10)',c:'#71717a', label:'On Hold'     },
};
const GOAL_STATUSES = ['on-track', 'at-risk', 'off-track'];
const INIT_STATUSES = ['Planning', 'In Progress', 'Complete', 'On Hold'];
const MINISTRY_AREAS = ['Worship', 'Discipleship', 'Missions', 'Giving', 'Outreach', 'Care', 'Administration', 'Youth', 'Families', 'Other'];
const AREA_COLOR = {
  Worship:'#7c3aed', Discipleship:'#e8a838', Missions:'#059669',
  Giving:'#0ea5e9', Outreach:'#dc2626', Care:'#1b264f',
  Administration:'#6366f1', Youth:'#c05818', Families:'#db2777', Other:'#71717a',
};

function badge(key) {
  const d = STATUS_DEF[key] || { bg:'rgba(113,113,122,.10)', c:'#71717a', label: key || '\u2014' };
  return `<span class="wv-badge" style="background:${d.bg};color:${d.c}">${_e(d.label)}</span>`;
}

/* ── Module-level state ──────────────────────────────────────────────────── */
let _activeSheet  = null;
let _liveGoals    = {};
let _liveInits    = {};
let _liveKeyDates = {};

/* ── Render ──────────────────────────────────────────────────────────────── */
export function render() {
  return /* html */`
<section class="wv-view">
  ${pageHero({
    title:    'The Weaver\u2019s Plan',
    subtitle: 'Strategic goals, key initiatives, and kingdom milestones.',
    scripture: 'For I know the thoughts that I think toward you, saith the LORD. \u2014 Jeremiah 29:11',
  })}

  <!-- Kingdom Goals -->
  <div class="wv-card">
    <div class="wv-card-header">
      <h3 class="wv-card-title">Kingdom Goals</h3>
      <button class="flock-btn flock-btn--primary flock-btn--sm" data-act="add-goal">+ Add Goal</button>
    </div>
    <div class="wv-goals-list" data-bind="goals">
      <div class="life-empty">Loading kingdom goals\u2026</div>
    </div>
  </div>

  <div class="wv-lower-row">

    <!-- Key Initiatives -->
    <div class="wv-card wv-initiatives-card">
      <div class="wv-card-header">
        <h3 class="wv-card-title">Key Initiatives</h3>
        <button class="flock-btn flock-btn--primary flock-btn--sm" data-act="add-initiative">+ Add</button>
      </div>
      <div class="wv-init-list" data-bind="initiatives">
        <div class="life-empty">Loading initiatives\u2026</div>
      </div>
    </div>

    <!-- Key Dates -->
    <div class="wv-card wv-milestones-card">
      <div class="wv-card-header" style="margin-bottom:16px">
        <h3 class="wv-card-title">Key Dates</h3>
        <button class="flock-btn flock-btn--primary flock-btn--sm" data-act="add-keydate">+ Add</button>
      </div>
      <div class="wv-timeline" data-bind="keydates">
        <div class="life-empty">Loading key dates\u2026</div>
      </div>
    </div>

  </div>
</section>`;
}

/* ── Mount ───────────────────────────────────────────────────────────────── */
export function mount(root) {
  _loadAll(root);
  root.querySelector('[data-act="add-goal"]')?.addEventListener('click', () => _openGoalSheet(null, () => _loadGoals(root)));
  root.querySelector('[data-act="add-initiative"]')?.addEventListener('click', () => _openInitSheet(null, () => _loadInits(root)));
  root.querySelector('[data-act="add-keydate"]')?.addEventListener('click', () => _openKeyDateSheet(null, () => _loadKeyDates(root)));
  return () => { _closeSheet(); };
}

function _loadAll(root) {
  _loadGoals(root);
  _loadInits(root);
  _loadKeyDates(root);
}

/* ── Backend helpers (UpperRoom Firestore + TheVine GAS fallback) ────────── */
async function _urList(colName) {
  const UR = window.UpperRoom;
  if (colName === 'strategicGoals'       && typeof UR?.listStrategicGoals       === 'function') return UR.listStrategicGoals();
  if (colName === 'strategicInitiatives' && typeof UR?.listStrategicInitiatives  === 'function') return UR.listStrategicInitiatives();
  if (colName === 'strategicKeyDates'    && typeof UR?.listStrategicKeyDates     === 'function') return UR.listStrategicKeyDates();
  const V = window.TheVine;
  if (V?.flock?.strategicPlan?.list) return V.flock.strategicPlan.list({ collection: colName });
  if (UR?._churchDoc) {
    const snap = await UR._churchDoc().collection(colName).orderBy('createdAt','desc').limit(200).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  return null;
}

async function _urCreate(colName, data) {
  const UR = window.UpperRoom;
  if (colName === 'strategicGoals'       && typeof UR?.createStrategicGoal       === 'function') return UR.createStrategicGoal(data);
  if (colName === 'strategicInitiatives' && typeof UR?.createStrategicInitiative  === 'function') return UR.createStrategicInitiative(data);
  if (colName === 'strategicKeyDates'    && typeof UR?.createStrategicKeyDate     === 'function') return UR.createStrategicKeyDate(data);
  const V = window.TheVine;
  if (V?.flock?.strategicPlan?.create) return V.flock.strategicPlan.create({ collection: colName, ...data });
  if (UR?._churchDoc) {
    const ref = await UR._churchDoc().collection(colName).add({ ...data, createdAt: new Date().toISOString() });
    return { id: ref.id, ...data };
  }
  throw new Error('Strategic plan backend not available \u2014 ensure UpperRoom is loaded.');
}

async function _urUpdate(colName, data) {
  const UR = window.UpperRoom;
  if (!data.id) throw new Error('Record id required for update.');
  if (colName === 'strategicGoals'       && typeof UR?.updateStrategicGoal       === 'function') return UR.updateStrategicGoal(data);
  if (colName === 'strategicInitiatives' && typeof UR?.updateStrategicInitiative  === 'function') return UR.updateStrategicInitiative(data);
  if (colName === 'strategicKeyDates'    && typeof UR?.updateStrategicKeyDate     === 'function') return UR.updateStrategicKeyDate(data);
  const V = window.TheVine;
  if (V?.flock?.strategicPlan?.update) return V.flock.strategicPlan.update({ collection: colName, ...data });
  if (UR?._churchDoc) {
    const { id, ...rest } = data;
    await UR._churchDoc().collection(colName).doc(id).update({ ...rest, updatedAt: new Date().toISOString() });
    return data;
  }
  throw new Error('Strategic plan backend not available.');
}

async function _urDelete(colName, id) {
  const UR = window.UpperRoom;
  if (colName === 'strategicGoals'       && typeof UR?.deleteStrategicGoal       === 'function') return UR.deleteStrategicGoal({ id });
  if (colName === 'strategicInitiatives' && typeof UR?.deleteStrategicInitiative  === 'function') return UR.deleteStrategicInitiative({ id });
  if (colName === 'strategicKeyDates'    && typeof UR?.deleteStrategicKeyDate     === 'function') return UR.deleteStrategicKeyDate({ id });
  const V = window.TheVine;
  if (V?.flock?.strategicPlan?.delete) return V.flock.strategicPlan.delete({ collection: colName, id });
  if (UR?._churchDoc) { await UR._churchDoc().collection(colName).doc(id).delete(); return; }
  throw new Error('Strategic plan backend not available.');
}

function _rows(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.rows)) return res.rows;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

/* ── Load Goals ──────────────────────────────────────────────────────────── */
async function _loadGoals(root) {
  const el = root.querySelector('[data-bind="goals"]');
  if (!el) return;
  let rows;
  try { rows = await _urList('strategicGoals'); } catch (e) { rows = null; }
  if (rows === null) { el.innerHTML = '<div class="life-empty">Strategic plan backend not loaded.</div>'; return; }
  rows = _rows(rows);
  if (!rows.length) { el.innerHTML = '<div class="life-empty">No goals yet. Use \u201c+ Add Goal\u201d to define your kingdom objectives.</div>'; return; }
  _liveGoals = {};
  rows.forEach(g => { if (g.id) _liveGoals[String(g.id)] = g; });
  el.innerHTML = rows.map(g => {
    const c   = AREA_COLOR[g.area] || '#7c3aed';
    const pct = Math.min(100, Math.max(0, Number(g.progress ?? g.pct ?? 0)));
    return /* html */`
    <div class="wv-goal-row" data-id="${_e(String(g.id || ''))}" style="cursor:pointer;">
      <div class="wv-goal-area" style="color:${c}">${_e(g.area || '\u2014')}</div>
      <div class="wv-goal-body">
        <div class="wv-goal-text">${_e(g.goal || g.title || '')}</div>
        <div class="wv-goal-bar-wrap"><div class="wv-goal-bar" style="width:${pct}%;background:${c}"></div></div>
      </div>
      <div class="wv-goal-pct">${pct}%</div>
      ${badge(g.status || 'on-track')}
      <div class="wv-goal-owner">${_e(g.owner || '')}</div>
    </div>`;
  }).join('');
  el.querySelectorAll('.wv-goal-row[data-id]').forEach(row => {
    row.addEventListener('click', () => {
      const rec = _liveGoals[row.dataset.id];
      if (rec) _openGoalSheet(rec, () => _loadGoals(root));
    });
  });
}

/* ── Load Initiatives ────────────────────────────────────────────────────── */
async function _loadInits(root) {
  const el = root.querySelector('[data-bind="initiatives"]');
  if (!el) return;
  let rows;
  try { rows = await _urList('strategicInitiatives'); } catch (e) { rows = null; }
  if (rows === null) { el.innerHTML = '<div class="life-empty">Strategic plan backend not loaded.</div>'; return; }
  rows = _rows(rows);
  if (!rows.length) { el.innerHTML = '<div class="life-empty">No initiatives yet. Click \u201c+ Add\u201d to create one.</div>'; return; }
  _liveInits = {};
  rows.forEach(i => { if (i.id) _liveInits[String(i.id)] = i; });
  el.innerHTML = rows.map(i => {
    const c   = AREA_COLOR[i.ministry || i.area] || '#7c3aed';
    const pct = Math.min(100, Math.max(0, Number(i.progress ?? 0)));
    return /* html */`
    <div class="wv-init-row" data-id="${_e(String(i.id || ''))}" style="cursor:pointer;">
      <div class="wv-init-stripe" style="background:${c}"></div>
      <div class="wv-init-body">
        <div class="wv-init-title">${_e(i.title || i.name || '')}</div>
        <div class="wv-init-meta">
          <span style="color:${c}">${_e(i.ministry || i.area || '')}</span>
          ${i.owner ? `<span>\u00b7 ${_e(i.owner)}</span>` : ''}
          ${i.due   ? `<span>\u00b7 Due ${_e(i.due)}</span>` : ''}
        </div>
        <div class="wv-init-bar-wrap"><div class="wv-init-bar" style="width:${pct}%;background:${c}"></div></div>
      </div>
      <div class="wv-init-pct">${pct}%</div>
      ${badge(i.status || 'Planning')}
    </div>`;
  }).join('');
  el.querySelectorAll('.wv-init-row[data-id]').forEach(row => {
    row.addEventListener('click', () => {
      const rec = _liveInits[row.dataset.id];
      if (rec) _openInitSheet(rec, () => _loadInits(root));
    });
  });
}

/* ── Load Key Dates ──────────────────────────────────────────────────────── */
async function _loadKeyDates(root) {
  const el = root.querySelector('[data-bind="keydates"]');
  if (!el) return;
  let rows;
  try { rows = await _urList('strategicKeyDates'); } catch (e) { rows = null; }
  if (rows === null) { el.innerHTML = '<div class="life-empty">Strategic plan backend not loaded.</div>'; return; }
  rows = _rows(rows);
  if (!rows.length) { el.innerHTML = '<div class="life-empty">No key dates yet. Click \u201c+ Add\u201d to record one.</div>'; return; }
  const now = Date.now();
  rows = [...rows].map(m => ({ ...m, _ms: m.date ? new Date(m.date).getTime() : 0 }))
    .sort((a, b) => {
      const aUp = !a.done && a._ms >= now;
      const bUp = !b.done && b._ms >= now;
      if (aUp && !bUp) return -1;
      if (!aUp && bUp) return 1;
      return (a._ms || 0) - (b._ms || 0);
    });
  _liveKeyDates = {};
  rows.forEach(m => { if (m.id) _liveKeyDates[String(m.id)] = m; });
  el.innerHTML = rows.map(m => {
    const fmtDate = m.date ? new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
    return /* html */`
    <div class="wv-milestone-row${m.done ? ' wv-milestone--done' : ''}" data-id="${_e(String(m.id || ''))}" style="cursor:pointer;">
      <div class="wv-milestone-dot"></div>
      <div class="wv-milestone-body">
        <div class="wv-milestone-date">${_e(fmtDate)}</div>
        <div class="wv-milestone-label">${_e(m.label || m.title || '')}</div>
      </div>
      ${m.done ? '<span class="wv-done-check">\u2713</span>' : ''}
    </div>`;
  }).join('');
  el.querySelectorAll('.wv-milestone-row[data-id]').forEach(row => {
    row.addEventListener('click', () => {
      const rec = _liveKeyDates[row.dataset.id];
      if (rec) _openKeyDateSheet(rec, () => _loadKeyDates(root));
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════════════
   SHEETS
   ══════════════════════════════════════════════════════════════════════════════ */

function _closeSheet() {
  if (!_activeSheet) return;
  const t = _activeSheet;
  t.querySelector('.life-sheet-overlay')?.classList.remove('is-open');
  t.querySelector('.life-sheet-panel')?.classList.remove('is-open');
  setTimeout(() => { t.remove(); if (_activeSheet === t) _activeSheet = null; }, 320);
}

function _buildSheet({ title, subtitle, fields, onSave, onDelete }) {
  _closeSheet();
  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  sheet.innerHTML = /* html */`
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel" role="dialog" aria-label="${_e(title)}">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div class="life-sheet-hd-info">
          <div class="life-sheet-hd-name">${_e(title)}</div>
          <div class="life-sheet-hd-meta">${_e(subtitle)}</div>
        </div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">${fields}</div>
      <div class="life-sheet-foot">
        ${onDelete ? '<button class="flock-btn flock-btn--danger" data-delete>Delete</button>' : ''}
        <button class="flock-btn" data-cancel>Cancel</button>
        <button class="flock-btn flock-btn--primary" data-save>Save</button>
      </div>
    </div>`;
  document.body.appendChild(sheet);
  _activeSheet = sheet;
  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
    sheet.querySelector('.life-sheet-input')?.focus();
  });
  sheet.querySelector('[data-cancel]').addEventListener('click', _closeSheet);
  sheet.querySelector('.life-sheet-close').addEventListener('click', _closeSheet);
  sheet.querySelector('[data-save]').addEventListener('click', () => onSave(sheet));
  sheet.querySelector('[data-delete]')?.addEventListener('click', () => onDelete(sheet));
  sheet.querySelectorAll('[data-status]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.life-status-row').querySelectorAll('[data-status]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });
  return sheet;
}

function _showErr(sheet, msg) { const el = sheet.querySelector('[data-error]'); if (el) { el.textContent = msg; el.style.display = ''; } }
function _hideErr(sheet)      { const el = sheet.querySelector('[data-error]'); if (el) el.style.display = 'none'; }
function _setSaving(sheet, v) { const btn = sheet.querySelector('[data-save]'); if (btn) { btn.disabled = v; btn.textContent = v ? 'Saving\u2026' : 'Save'; } }

/* ── Goal sheet ──────────────────────────────────────────────────────────── */
function _openGoalSheet(g, onReload) {
  const isNew = !g;
  _buildSheet({
    title:    isNew ? 'Add Kingdom Goal' : 'Edit Kingdom Goal',
    subtitle: isNew ? 'Define a ministry-area objective' : _e(g?.goal || g?.title || 'Goal'),
    fields: /* html */`
      <div class="life-sheet-field">
        <div class="life-sheet-label">Ministry Area <span style="color:#dc2626">*</span></div>
        <select class="life-sheet-input" data-field="area">
          ${MINISTRY_AREAS.map(a => `<option value="${_e(a)}"${a === (g?.area || '') ? ' selected' : ''}>${_e(a)}</option>`).join('')}
        </select>
      </div>
      <div class="life-sheet-field">
        <div class="life-sheet-label">Goal <span style="color:#dc2626">*</span></div>
        <input class="life-sheet-input" data-field="goal" type="text" value="${_e(g?.goal || g?.title || '')}" placeholder="Describe the goal\u2026">
      </div>
      <div class="life-sheet-field">
        <div class="life-sheet-label">Progress (0\u2013100%)</div>
        <input class="life-sheet-input" data-field="progress" type="number" min="0" max="100" value="${g?.progress ?? g?.pct ?? 0}">
      </div>
      <div class="life-sheet-field">
        <div class="life-sheet-label">Status</div>
        <div class="life-status-row">
          ${GOAL_STATUSES.map(s => `<button class="life-status-pill${s === (g?.status || 'on-track') ? ' is-active' : ''}" data-status="${_e(s)}">${_e(STATUS_DEF[s]?.label || s)}</button>`).join('')}
        </div>
      </div>
      <div class="life-sheet-field">
        <div class="life-sheet-label">Owner</div>
        <input class="life-sheet-input" data-field="owner" type="text" value="${_e(g?.owner || '')}" placeholder="Person or team responsible">
      </div>
      <div class="life-sheet-field">
        <div class="life-sheet-label">Notes</div>
        <textarea class="life-sheet-input" data-field="notes" rows="2" placeholder="Optional context\u2026">${_e(g?.notes || '')}</textarea>
      </div>
      <div class="fold-form-error" data-error style="display:none;color:#dc2626;font-size:.85rem;margin-top:8px"></div>`,
    onSave: async (sheet) => {
      const goal = sheet.querySelector('[data-field="goal"]').value.trim();
      if (!goal) { _showErr(sheet, 'Goal description is required.'); return; }
      _hideErr(sheet); _setSaving(sheet, true);
      const payload = {
        area:     sheet.querySelector('[data-field="area"]').value,
        goal,
        progress: Number(sheet.querySelector('[data-field="progress"]').value) || 0,
        status:   sheet.querySelector('[data-status].is-active')?.dataset.status || 'on-track',
        owner:    sheet.querySelector('[data-field="owner"]').value.trim() || undefined,
        notes:    sheet.querySelector('[data-field="notes"]').value.trim() || undefined,
      };
      if (!isNew) payload.id = String(g.id);
      try {
        if (isNew) await _urCreate('strategicGoals', payload);
        else       await _urUpdate('strategicGoals', payload);
        _closeSheet(); onReload?.();
      } catch (err) { _setSaving(sheet, false); _showErr(sheet, err?.message || 'Could not save.'); }
    },
    onDelete: isNew ? null : async (sheet) => {
      if (!confirm('Delete this goal? This cannot be undone.')) return;
      const btn = sheet.querySelector('[data-delete]');
      btn.disabled = true; btn.textContent = 'Deleting\u2026';
      try { await _urDelete('strategicGoals', String(g.id)); _closeSheet(); onReload?.(); }
      catch (err) { btn.disabled = false; btn.textContent = 'Delete'; alert(err?.message || 'Could not delete.'); }
    },
  });
}

/* ── Initiative sheet ────────────────────────────────────────────────────── */
function _openInitSheet(item, onReload) {
  const isNew = !item;
  _buildSheet({
    title:    isNew ? 'Add Initiative' : 'Edit Initiative',
    subtitle: isNew ? 'Add a key ministry initiative' : _e(item?.title || item?.name || 'Initiative'),
    fields: /* html */`
      <div class="life-sheet-field">
        <div class="life-sheet-label">Title <span style="color:#dc2626">*</span></div>
        <input class="life-sheet-input" data-field="title" type="text" value="${_e(item?.title || item?.name || '')}" placeholder="Initiative name\u2026">
      </div>
      <div class="life-sheet-field">
        <div class="life-sheet-label">Ministry Area</div>
        <select class="life-sheet-input" data-field="ministry">
          ${MINISTRY_AREAS.map(a => `<option value="${_e(a)}"${a === (item?.ministry || item?.area || 'Worship') ? ' selected' : ''}>${_e(a)}</option>`).join('')}
        </select>
      </div>
      <div class="life-sheet-field">
        <div class="life-sheet-label">Owner</div>
        <input class="life-sheet-input" data-field="owner" type="text" value="${_e(item?.owner || '')}" placeholder="Person or team responsible">
      </div>
      <div class="fold-form-row">
        <div class="life-sheet-field">
          <div class="life-sheet-label">Due Date</div>
          <input class="life-sheet-input" data-field="due" type="date" value="${_e(item?.dueISO || '')}">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Progress (0\u2013100%)</div>
          <input class="life-sheet-input" data-field="progress" type="number" min="0" max="100" value="${item?.progress ?? 0}">
        </div>
      </div>
      <div class="life-sheet-field">
        <div class="life-sheet-label">Status</div>
        <div class="life-status-row">
          ${INIT_STATUSES.map(s => `<button class="life-status-pill${s === (item?.status || 'Planning') ? ' is-active' : ''}" data-status="${_e(s)}">${_e(s)}</button>`).join('')}
        </div>
      </div>
      <div class="life-sheet-field">
        <div class="life-sheet-label">Description</div>
        <textarea class="life-sheet-input" data-field="description" rows="3" placeholder="Optional details\u2026">${_e(item?.description || item?.notes || '')}</textarea>
      </div>
      <div class="fold-form-error" data-error style="display:none;color:#dc2626;font-size:.85rem;margin-top:8px"></div>`,
    onSave: async (sheet) => {
      const title = sheet.querySelector('[data-field="title"]').value.trim();
      if (!title) { _showErr(sheet, 'Title is required.'); return; }
      _hideErr(sheet); _setSaving(sheet, true);
      const dueRaw = sheet.querySelector('[data-field="due"]').value;
      const payload = {
        title,
        ministry:    sheet.querySelector('[data-field="ministry"]').value,
        owner:       sheet.querySelector('[data-field="owner"]').value.trim() || undefined,
        due:         dueRaw ? new Date(dueRaw).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : undefined,
        dueISO:      dueRaw || undefined,
        progress:    Number(sheet.querySelector('[data-field="progress"]').value) || 0,
        status:      sheet.querySelector('[data-status].is-active')?.dataset.status || 'Planning',
        description: sheet.querySelector('[data-field="description"]').value.trim() || undefined,
      };
      if (!isNew) payload.id = String(item.id);
      try {
        if (isNew) await _urCreate('strategicInitiatives', payload);
        else       await _urUpdate('strategicInitiatives', payload);
        _closeSheet(); onReload?.();
      } catch (err) { _setSaving(sheet, false); _showErr(sheet, err?.message || 'Could not save.'); }
    },
    onDelete: isNew ? null : async (sheet) => {
      if (!confirm('Delete this initiative? This cannot be undone.')) return;
      const btn = sheet.querySelector('[data-delete]');
      btn.disabled = true; btn.textContent = 'Deleting\u2026';
      try { await _urDelete('strategicInitiatives', String(item.id)); _closeSheet(); onReload?.(); }
      catch (err) { btn.disabled = false; btn.textContent = 'Delete'; alert(err?.message || 'Could not delete.'); }
    },
  });
}

/* ── Key Date sheet ──────────────────────────────────────────────────────── */
function _openKeyDateSheet(m, onReload) {
  const isNew = !m;
  _buildSheet({
    title:    isNew ? 'Add Key Date' : 'Edit Key Date',
    subtitle: isNew ? 'Record a milestone or upcoming date' : _e(m?.label || m?.title || 'Key Date'),
    fields: /* html */`
      <div class="life-sheet-field">
        <div class="life-sheet-label">Label <span style="color:#dc2626">*</span></div>
        <input class="life-sheet-input" data-field="label" type="text" value="${_e(m?.label || m?.title || '')}" placeholder="Name this date\u2026">
      </div>
      <div class="life-sheet-field">
        <div class="life-sheet-label">Date</div>
        <input class="life-sheet-input" data-field="date" type="date" value="${_e(m?.date || '')}">
      </div>
      <div class="life-sheet-field">
        <div class="life-sheet-label">Status</div>
        <div class="life-status-row">
          <button class="life-status-pill${!m?.done ? ' is-active' : ''}" data-status="upcoming">Upcoming</button>
          <button class="life-status-pill${m?.done  ? ' is-active' : ''}" data-status="done">Done</button>
        </div>
      </div>
      <div class="life-sheet-field">
        <div class="life-sheet-label">Notes</div>
        <textarea class="life-sheet-input" data-field="notes" rows="2" placeholder="Optional context\u2026">${_e(m?.notes || '')}</textarea>
      </div>
      <div class="fold-form-error" data-error style="display:none;color:#dc2626;font-size:.85rem;margin-top:8px"></div>`,
    onSave: async (sheet) => {
      const label = sheet.querySelector('[data-field="label"]').value.trim();
      if (!label) { _showErr(sheet, 'A label is required.'); return; }
      _hideErr(sheet); _setSaving(sheet, true);
      const payload = {
        label,
        date:  sheet.querySelector('[data-field="date"]').value || undefined,
        done:  sheet.querySelector('[data-status].is-active')?.dataset.status === 'done',
        notes: sheet.querySelector('[data-field="notes"]').value.trim() || undefined,
      };
      if (!isNew) payload.id = String(m.id);
      try {
        if (isNew) await _urCreate('strategicKeyDates', payload);
        else       await _urUpdate('strategicKeyDates', payload);
        _closeSheet(); onReload?.();
      } catch (err) { _setSaving(sheet, false); _showErr(sheet, err?.message || 'Could not save.'); }
    },
    onDelete: isNew ? null : async (sheet) => {
      if (!confirm('Delete this key date? This cannot be undone.')) return;
      const btn = sheet.querySelector('[data-delete]');
      btn.disabled = true; btn.textContent = 'Deleting\u2026';
      try { await _urDelete('strategicKeyDates', String(m.id)); _closeSheet(); onReload?.(); }
      catch (err) { btn.disabled = false; btn.textContent = 'Delete'; alert(err?.message || 'Could not delete.'); }
    },
  });
}
