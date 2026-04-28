/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE WAY — Discipleship & Small Groups
   "I am the way, the truth, and the life." — John 14:6
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';
import { buildAdapter } from '../../Scripts/the_living_water_adapter.js';

export const name  = 'the_way';
export const title = 'The Way';

export function render() {
  return /* html */`
    <section class="way-view">
      ${pageHero({
        title:    'The Way',
        subtitle: 'Discipleship tracks, small groups, and spiritual growth journeys — walking alongside every member.',
        scripture: 'I am the way, the truth, and the life. — John 14:6',
      })}

      <!-- Discipleship Tracks -->
      <div class="way-section-header">
        <h2 class="way-section-title">Discipleship Tracks</h2>
        <button class="flock-btn flock-btn--primary" data-new-track>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Add Track
        </button>
      </div>
      <div class="way-tracks">
        <div class="life-empty">Loading tracks…</div>
      </div>

      <!-- Small Groups -->
      <div class="way-section-header" style="margin-top:28px;">
        <h2 class="way-section-title">Small Groups</h2>
        <button class="flock-btn flock-btn--primary" data-new-group>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          New Group
        </button>
      </div>
      <div class="way-groups">
        <div class="life-empty">Loading groups…</div>
      </div>

      <!-- Ministries -->
      <div class="way-section-header" style="margin-top:32px;">
        <h2 class="way-section-title">Ministries</h2>
        <button class="flock-btn flock-btn--primary" data-new-ministry>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          New Ministry
        </button>
      </div>
      <div data-bind="ministries">
        <div class="life-empty">Loading ministries…</div>
      </div>

      <!-- Volunteers -->
      <div class="way-section-header" style="margin-top:32px;">
        <h2 class="way-section-title">Volunteer Slots</h2>
        <button class="flock-btn flock-btn--primary" data-new-volunteer>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Add Volunteer
        </button>
      </div>
      <div data-bind="volunteers">
        <div class="life-empty">Loading volunteers…</div>
      </div>
    </section>
  `;
}

const GROUP_TYPES  = ['Small Group','Life Group','Study Group','Youth Group','Men\'s Group','Women\'s Group','Prayer Group','Recovery Group'];
const GROUP_DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

let _activeWaySheet = null;
let _liveGroupsMap  = {};
let _liveTracksMap  = {};

export function mount(root) {
  _loadWay(root);

  root.querySelector('[data-new-group]')?.addEventListener('click', () => _openGroupSheet(null, () => _loadWay(root)));
  root.querySelector('[data-new-track]')?.addEventListener('click', () => _openTrackSheet(null, () => _loadWay(root)));
  root.querySelector('[data-new-ministry]')?.addEventListener('click', () => _openMinistrySheet(null, () => _loadMinistries(root)));
  root.querySelector('[data-new-volunteer]')?.addEventListener('click', () => _openVolunteerSheet(null, () => _loadVolunteers(root)));

  return () => { _closeWaySheet(); _closeMinistrySheet(); _closeVolunteerSheet(); _closeTrackSheet(); };
}

async function _loadWay(root) {
  const V   = window.TheVine;
  const MXG = buildAdapter('flock.groups', V);
  const MXD = buildAdapter('flock.discipleship.paths', V);
  const tracksEl = root.querySelector('.way-tracks');
  const groupsEl = root.querySelector('.way-groups');
  if (!V) {
    if (tracksEl) tracksEl.innerHTML = '<div class="life-empty">Discipleship backend not loaded.</div>';
    if (groupsEl) groupsEl.innerHTML = '<div class="life-empty">Small groups backend not loaded.</div>';
    _loadMinistries(root);
    _loadVolunteers(root);
    return;
  }

  // Discipleship tracks
  if (tracksEl) {
    tracksEl.innerHTML = '<div class="life-empty">Loading tracks…</div>';
    try {
      const res  = await MXD.list({});
      const all  = _rows(res);
      // Filter client-side: exclude archived/inactive
      const _DEAD = new Set(['archived','inactive','draft']);
      const rows = all.filter(r => !_DEAD.has((r.status || r.Status || '').toLowerCase()));
      _liveTracksMap = {};
      rows.forEach(t => { if (t.id) _liveTracksMap[String(t.id)] = t; });
      if (rows.length) {
        tracksEl.innerHTML = rows.map(_liveTrackCard).join('');
        tracksEl.querySelectorAll('.way-track-card[data-id]').forEach(card => {
          card.style.cursor = 'pointer';
          card.addEventListener('click', () => {
            const t = _liveTracksMap[card.dataset.id];
            if (t) _openTrackSheet(t, () => _loadWay(root));
          });
        });
      } else {
        tracksEl.innerHTML = '<div class="life-empty">No discipleship tracks yet. Use "Add Track" to create one.</div>';
      }
    } catch (err) {
      console.error('[TheWay] discipleship.paths.list error:', err);
      tracksEl.innerHTML = '<div class="life-empty">Could not load discipleship tracks right now.</div>';
    }
  }

  // Small groups
  if (groupsEl) {
    groupsEl.innerHTML = '<div class="life-empty">Loading groups…</div>';
    try {
      const res  = await MXG.list();
      const rows = _rows(res);
      groupsEl.innerHTML = rows.length
        ? rows.map(_liveGroupRow).join('')
        : '<div class="life-empty">No small groups yet. Use “New Group” to add one.</div>';

      // Store map and wire clicks
      _liveGroupsMap = {};
      rows.forEach(g => { if (g.id) _liveGroupsMap[String(g.id)] = g; });
      const reload = () => _loadWay(root);
      groupsEl.querySelectorAll('.way-group-row').forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
          const g = _liveGroupsMap[row.dataset.id];
          if (g) _openGroupSheet(g, reload);
        });
      });
    } catch (err) {
      console.error('[TheWay] groups.list error:', err);
      groupsEl.innerHTML = '<div class="life-empty">Could not load small groups right now.</div>';
    }
  }

  _loadMinistries(root);
  _loadVolunteers(root);
}

function _rows(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.rows)) return res.rows;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

const _TRACK_COLORS = ['#059669','#0ea5e9','#7c3aed','#e8a838','#db2777','#c05818'];

function _liveTrackCard(t, i) {
  const title    = t.title || t.name || 'Track';
  const stage    = t.stage || t.level || t.category || '';
  const desc     = t.description || t.desc || '';
  const lessons  = t.lessonCount   || t.stepCount    || 0;
  const enrolled = t.enrolledCount || t.enrollmentCount || t.enrolled || 0;
  const complete = t.completedCount || t.completionCount || t.complete || 0;
  const pct      = enrolled ? Math.round((complete / enrolled) * 100) : 0;
  const color    = _TRACK_COLORS[i % _TRACK_COLORS.length];
  return /* html */`
    <article class="way-track-card" tabindex="0" data-id="${_e(String(t.id || ''))}">
      <div class="way-track-stripe" style="background:${color}"></div>
      <div class="way-track-body">
        ${stage ? `<div class="way-track-stage" style="color:${color}">${_e(stage)}</div>` : ''}
        <div class="way-track-title">${_e(title)}</div>
        ${desc ? `<div class="way-track-desc">${_e(desc)}</div>` : ''}
        <div class="way-track-meta">
          ${lessons  ? `<span>${lessons} lessons</span>` : ''}
          ${enrolled ? `<span>${enrolled} enrolled</span>` : ''}
        </div>
        ${enrolled ? `
        <div class="way-progress-bar">
          <div class="way-progress-fill" style="width:${pct}%; background:${color}"></div>
        </div>
        <div class="way-progress-label">${complete}/${enrolled} completed (${pct}%)</div>` : ''}
      </div>
    </article>`;
}

function _liveGroupRow(g) {
  const name     = g.groupName || g.name || 'Small Group';
  const leader   = g.leaderName || g.leader || g.leaderId || '';
  const members  = g.memberCount || g.members || '';
  const day      = g.meetingDay  || g.day || '';
  const time     = g.meetingTime || g.time || '';
  const type     = g.type || g.groupType || 'Small Group';
  const initials = leader.split(/\s+/).map(w => w[0] || '').slice(0,2).join('').toUpperCase();
  return /* html */`
    <article class="way-group-row" tabindex="0" data-id="${_e(String(g.id || ''))}">
      <div class="way-group-avatar">${initials || '?'}</div>
      <div class="way-group-body">
        <div class="way-group-name">${_e(name)}</div>
        <div class="way-group-meta">
          <span>${_e(type)}</span>
          ${(day || time) ? `<span>·</span><span>${_e([day && day + 's', _fmtTime(time)].filter(Boolean).join(' '))}</span>` : ''}
          ${members ? `<span>·</span><span>${members} members</span>` : ''}
        </div>
      </div>
      ${leader ? `<div class="way-group-leader">Led by ${_e(leader)}</div>` : ''}
    </article>`;
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function _fmtTime(raw) {
  if (!raw) return '';
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(String(raw))) return String(raw).slice(0, 5);
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return String(raw);
}

// ── Group sheet (create / edit) ───────────────────────────────────────────────
function _closeWaySheet() {
  if (!_activeWaySheet) return;
  const t = _activeWaySheet;
  t.querySelector('.life-sheet-overlay')?.classList.remove('is-open');
  t.querySelector('.life-sheet-panel')?.classList.remove('is-open');
  setTimeout(() => { t.remove(); if (_activeWaySheet === t) _activeWaySheet = null; }, 320);
}

function _openGroupSheet(g, onReload) {
  _closeWaySheet();
  const V   = window.TheVine;
  const MXG = buildAdapter('flock.groups', V);
  const isNew = !g;
  const uid   = g?.id ? String(g.id) : '';
  const name  = g?.name  || '';
  const leader = g?.leader || g?.leaderName || '';
  const type  = g?.type  || g?.groupType || 'Small Group';
  const day   = g?.meetingDay  || g?.day || '';
  const time  = g?.meetingTime || g?.time || '';
  const maxM  = g?.maxMembers  || g?.capacity || '';
  const desc  = g?.description || '';

  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  sheet.innerHTML = /* html */`
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel" role="dialog" aria-label="${isNew ? 'New Group' : 'Edit Group'}">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div class="life-sheet-hd-info">
          <div class="life-sheet-hd-name">${isNew ? 'New Small Group' : 'Edit Group'}</div>
          <div class="life-sheet-hd-meta">${isNew ? 'Create a new group or ministry' : _e(name)}</div>
        </div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">
        <div class="life-sheet-field">
          <div class="life-sheet-label">Group Name <span style="color:#dc2626">*</span></div>
          <input class="life-sheet-input" data-field="name" type="text" value="${_e(name)}" placeholder="e.g. Young Adults — Eastside">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Group Type</div>
          <select class="life-sheet-input" data-field="type">
            ${GROUP_TYPES.map(t => `<option value="${_e(t)}"${t === type ? ' selected' : ''}>${_e(t)}</option>`).join('')}
          </select>
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Leader</div>
          <input class="life-sheet-input" data-field="leaderName" type="text" value="${_e(leader)}" placeholder="Leader name">
        </div>
        <div class="fold-form-row">
          <div class="life-sheet-field">
            <div class="life-sheet-label">Meeting Day</div>
            <select class="life-sheet-input" data-field="meetingDay">
              <option value="">— Select day —</option>
              ${GROUP_DAYS.map(d => `<option value="${_e(d)}"${d === day ? ' selected' : ''}>${_e(d)}</option>`).join('')}
            </select>
          </div>
          <div class="life-sheet-field">
            <div class="life-sheet-label">Time</div>
            <input class="life-sheet-input" data-field="meetingTime" type="time" value="${_e(time)}">
          </div>
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Max Members <span style="color:#6b7280;font-weight:400">(optional)</span></div>
          <input class="life-sheet-input" data-field="maxMembers" type="number" min="1" value="${_e(String(maxM))}" placeholder="No limit">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Description</div>
          <textarea class="life-sheet-input" data-field="description" rows="3" style="resize:vertical" placeholder="What is this group about?">${_e(desc)}</textarea>
        </div>
        <div class="fold-form-error" data-error style="display:none;color:#dc2626;font-size:.85rem;margin-top:8px"></div>
      </div>
      <div class="life-sheet-foot">
        ${!isNew ? '<button class="flock-btn flock-btn--danger" data-delete style="margin-right:auto">Archive Group</button>' : ''}
        <button class="flock-btn" data-cancel>Cancel</button>
        <button class="flock-btn flock-btn--primary" data-save>${isNew ? 'Create Group' : 'Save Changes'}</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  _activeWaySheet = sheet;
  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
    if (isNew) sheet.querySelector('[data-field="name"]')?.focus();
  });

  const close = () => _closeWaySheet();
  sheet.querySelector('[data-cancel]').addEventListener('click', close);
  sheet.querySelector('.life-sheet-close').addEventListener('click', close);

  sheet.querySelector('[data-save]').addEventListener('click', async () => {
    const errEl   = sheet.querySelector('[data-error]');
    const nameVal = sheet.querySelector('[data-field="name"]').value.trim();
    if (!nameVal) { errEl.textContent = 'Group name is required.'; errEl.style.display = ''; return; }
    if (!V?.flock?.groups) {
      errEl.textContent = 'Groups backend not loaded.'; errEl.style.display = ''; return;
    }
    errEl.style.display = 'none';
    const btn = sheet.querySelector('[data-save]');
    btn.disabled = true; btn.textContent = isNew ? 'Creating…' : 'Saving…';
    const maxVal = parseInt(sheet.querySelector('[data-field="maxMembers"]').value);
    const payload = {
      name:        nameVal,   // GAS column header
      groupName:   nameVal,   // Firestore field
      type:        sheet.querySelector('[data-field="type"]').value,
      groupType:   sheet.querySelector('[data-field="type"]').value, // Firestore field
      leaderName:  sheet.querySelector('[data-field="leaderName"]').value.trim(),
      meetingDay:  sheet.querySelector('[data-field="meetingDay"]').value,
      meetingTime: sheet.querySelector('[data-field="meetingTime"]').value,
      description: sheet.querySelector('[data-field="description"]').value.trim(),
      ...(maxVal > 0 ? { capacity: maxVal, maxMembers: maxVal } : {}),
    };
    if (!isNew) payload.id = uid;
    try {
      if (isNew) { await MXG.create(payload); }
      else       { await MXG.update(payload); }
      _closeWaySheet();
      onReload?.();
    } catch (err) {
      console.error('[TheWay] group save error:', err);
      errEl.textContent = err?.message || 'Could not save group.';
      errEl.style.display = '';
      btn.disabled = false; btn.textContent = isNew ? 'Create Group' : 'Save Changes';
    }
  });

  sheet.querySelector('[data-delete]')?.addEventListener('click', async () => {
    const ok = confirm(`Archive "${name}"? Members will be notified.`);
    if (!ok) return;
    const btn = sheet.querySelector('[data-delete]');
    btn.disabled = true; btn.textContent = 'Archiving…';
    try {
      await MXG.update({ id: uid, status: 'Archived' });
      _closeWaySheet();
      onReload?.();
    } catch (err) {
      console.error('[TheWay] group archive error:', err);
      alert(err?.message || 'Could not archive group.');
      btn.disabled = false; btn.textContent = 'Archive Group';
    }
  });
}

// ── MINISTRIES ────────────────────────────────────────────────────────────────
let _activeMinistrySheet = null;
const MINISTRY_TYPES     = ['Worship', 'Outreach', 'Care', 'Youth', 'Children', 'Men\'s', 'Women\'s', 'Prayer', 'Missions', 'Media', 'Facilities', 'Finance', 'Other'];
const MINISTRY_STATUSES  = ['Active', 'Inactive', 'Forming', 'Archived'];

function _closeMinistrySheet() {
  if (!_activeMinistrySheet) return;
  const t = _activeMinistrySheet;
  t.querySelector('.life-sheet-overlay')?.classList.remove('is-open');
  t.querySelector('.life-sheet-panel')?.classList.remove('is-open');
  setTimeout(() => { t.remove(); if (_activeMinistrySheet === t) _activeMinistrySheet = null; }, 320);
}

async function _loadMinistries(root) {
  const host = root.querySelector('[data-bind="ministries"]');
  if (!host) return;
  const UR = window.UpperRoom;
  if (!UR || typeof UR.listMinistries !== 'function') {
    host.innerHTML = '<div class="life-empty">Ministries require Firestore (UpperRoom) — not available.</div>';
    return;
  }
  host.innerHTML = '<div class="life-empty">Loading ministries…</div>';
  try {
    const res  = await UR.listMinistries({ limit: 100 });
    const rows = Array.isArray(res) ? res : (res?.results || res?.rows || []);
    if (!rows.length) {
      host.innerHTML = '<div class="life-empty">No ministries on record. Use “New Ministry” to add one.</div>';
      return;
    }
    host.innerHTML = rows.map(m => _ministryRow(m)).join('');
    host.querySelectorAll('[data-ministry-id]').forEach(row => {
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        const id   = row.dataset.ministryId;
        const item = rows.find(r => String(r.id) === id);
        if (item) _openMinistrySheet(item, () => _loadMinistries(root));
      });
    });
  } catch (err) {
    console.error('[TheWay] listMinistries:', err);
    host.innerHTML = '<div class="life-empty">Could not load ministries right now.</div>';
  }
}

function _ministryRow(m) {
  const name   = m.name || '—';
  const type   = m.type || m.ministryType || 'Other';
  const leader = m.leader || m.leaderName || m.leaderId || '—';
  const members = m.memberCount || 0;
  const status = m.status || 'Active';
  const isActive = status === 'Active';
  const c  = isActive ? '#059669' : '#6b7280';
  const bg = isActive ? 'rgba(5,150,105,0.10)' : 'rgba(107,114,128,0.10)';

  return /* html */`
    <article class="way-group-row" data-ministry-id="${_e(String(m.id || ''))}" tabindex="0">
      <div class="way-group-icon">⛪</div>
      <div class="way-group-body">
        <div class="way-group-name">${_e(name)}</div>
        <div class="way-group-meta">
          <span class="way-group-badge" style="color:${c};background:${bg}">${_e(status)}</span>
          <span>${_e(type)}</span>
          ${leader !== '—' ? `<span>Lead: ${_e(leader)}</span>` : ''}
          ${members ? `<span>${members} members</span>` : ''}
        </div>
      </div>
    </article>`;
}

function _openMinistrySheet(item, onSave) {
  _closeMinistrySheet();
  const UR    = window.UpperRoom;
  if (!UR) return;
  const isEdit   = !!item;
  const currentStatus = item?.status || 'Active';

  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  sheet.innerHTML = /* html */`
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel" role="dialog" aria-label="${isEdit ? 'Edit Ministry' : 'New Ministry'}">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div class="life-sheet-hd-info"><div class="life-sheet-hd-name">${isEdit ? 'Edit Ministry' : 'New Ministry'}</div></div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">
        <div class="life-sheet-field">
          <div class="life-sheet-label">Ministry Name <span style="color:#dc2626">*</span></div>
          <input class="life-sheet-input" data-field="name" type="text" value="${_e(item?.name || '')}" placeholder="e.g. Worship Ministry">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Type</div>
          <select class="life-sheet-input" data-field="type">
            ${MINISTRY_TYPES.map(t => `<option value="${_e(t)}"${(item?.type || item?.ministryType || 'Other') === t ? ' selected' : ''}>${_e(t)}</option>`).join('')}
          </select>
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Status</div>
          <div class="life-status-row">
            ${MINISTRY_STATUSES.map(s => `<button class="life-status-pill${s === currentStatus ? ' is-active' : ''}" data-status="${_e(s)}">${_e(s)}</button>`).join('')}
          </div>
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Leader</div>
          <input class="life-sheet-input" data-field="leader" type="text" value="${_e(item?.leader || item?.leaderName || '')}" placeholder="Name or email">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Member Count</div>
          <input class="life-sheet-input" data-field="memberCount" type="number" min="0" value="${item?.memberCount || ''}">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Description</div>
          <textarea class="life-sheet-ta" data-field="description" rows="3" placeholder="What is this ministry's purpose?">${_e(item?.description || '')}</textarea>
        </div>
        <div class="fold-form-error" data-error style="display:none;color:#dc2626;font-size:.85rem;margin-top:8px"></div>
      </div>
      <div class="life-sheet-foot">
        ${isEdit ? '<button class="flock-btn flock-btn--danger" data-delete style="margin-right:auto">Delete Ministry</button>' : ''}
        <button class="flock-btn" data-cancel>Cancel</button>
        <button class="flock-btn flock-btn--primary" data-save>${isEdit ? 'Save Changes' : 'Create Ministry'}</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  _activeMinistrySheet = sheet;
  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
  });

  sheet.querySelectorAll('[data-status]').forEach(btn => {
    btn.addEventListener('click', () => {
      sheet.querySelectorAll('[data-status]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });

  const close = () => _closeMinistrySheet();
  sheet.querySelector('[data-cancel]').addEventListener('click', close);
  sheet.querySelector('.life-sheet-close').addEventListener('click', close);

  sheet.querySelector('[data-save]').addEventListener('click', async () => {
    const errEl = sheet.querySelector('[data-error]');
    const name  = sheet.querySelector('[data-field="name"]').value.trim();
    if (!name) { errEl.textContent = 'Name is required.'; errEl.style.display = ''; return; }
    errEl.style.display = 'none';
    const btn = sheet.querySelector('[data-save]');
    btn.disabled = true; btn.textContent = 'Saving…';
    const payload = {
      name,
      type:        sheet.querySelector('[data-field="type"]').value,
      status:      sheet.querySelector('[data-status].is-active')?.dataset.status || currentStatus,
      leader:      sheet.querySelector('[data-field="leader"]').value.trim() || undefined,
      memberCount: parseInt(sheet.querySelector('[data-field="memberCount"]').value, 10) || 0,
      description: sheet.querySelector('[data-field="description"]').value.trim() || undefined,
    };
    try {
      if (isEdit) { await UR.updateMinistry(Object.assign({ id: item.id }, payload)); }
      else        { await UR.createMinistry(payload); }
      _closeMinistrySheet();
      if (onSave) onSave();
    } catch (err) {
      console.error('[TheWay] ministry save:', err);
      errEl.textContent = err?.message || 'Could not save ministry.'; errEl.style.display = '';
      btn.disabled = false; btn.textContent = isEdit ? 'Save Changes' : 'Create Ministry';
    }
  });

  sheet.querySelector('[data-delete]')?.addEventListener('click', async () => {
    if (!confirm(`Delete ministry "${item?.name}"? This cannot be undone.`)) return;
    const btn = sheet.querySelector('[data-delete]');
    btn.disabled = true; btn.textContent = 'Deleting…';
    try {
      if (typeof UR.deleteMinistry === 'function') await UR.deleteMinistry({ id: item.id });
      else await UR.updateMinistry({ id: item.id, status: 'Archived' });
      _closeMinistrySheet();
      if (onSave) onSave();
    } catch (err) {
      console.error('[TheWay] ministry delete:', err);
      alert(err?.message || 'Could not delete ministry.');
      btn.disabled = false; btn.textContent = 'Delete Ministry';
    }
  });
}

// ── VOLUNTEERS ────────────────────────────────────────────────────────────────
let _activeVolunteerSheet = null;

function _closeVolunteerSheet() {
  if (!_activeVolunteerSheet) return;
  const t = _activeVolunteerSheet;
  t.querySelector('.life-sheet-overlay')?.classList.remove('is-open');
  t.querySelector('.life-sheet-panel')?.classList.remove('is-open');
  setTimeout(() => { t.remove(); if (_activeVolunteerSheet === t) _activeVolunteerSheet = null; }, 320);
}

async function _loadVolunteers(root) {
  const host = root.querySelector('[data-bind="volunteers"]');
  if (!host) return;
  const UR = window.UpperRoom;
  if (!UR || typeof UR.listVolunteers !== 'function') {
    host.innerHTML = '<div class="life-empty">Volunteers require Firestore (UpperRoom) — not available.</div>';
    return;
  }
  host.innerHTML = '<div class="life-empty">Loading volunteers…</div>';
  try {
    const res  = await UR.listVolunteers({ limit: 80 });
    const rows = Array.isArray(res) ? res : (res?.results || res?.rows || []);
    if (!rows.length) {
      host.innerHTML = '<div class="life-empty">No volunteer records. Use “Add Volunteer” to log one.</div>';
      return;
    }
    host.innerHTML = rows.map(v => _volunteerRow(v)).join('');
    host.querySelectorAll('[data-vol-id]').forEach(row => {
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        const id   = row.dataset.volId;
        const item = rows.find(r => String(r.id) === id);
        if (item) _openVolunteerSheet(item, () => _loadVolunteers(root));
      });
    });
  } catch (err) {
    console.error('[TheWay] listVolunteers:', err);
    host.innerHTML = '<div class="life-empty">Could not load volunteers right now.</div>';
  }
}

function _volunteerRow(v) {
  const name     = v.memberName || v.memberId || '—';
  const role     = v.role || 'Volunteer';
  const ministry = v.ministryName || v.ministryId || '—';
  const date     = v.serviceDate
    ? (typeof v.serviceDate === 'string' ? v.serviceDate : new Date(v.serviceDate?.seconds ? v.serviceDate.seconds * 1000 : v.serviceDate).toLocaleDateString())
    : '';
  const initials = name === '—' ? '🙋' : name.split(/\s+/).map(w => w[0] || '').slice(0, 2).join('');

  return /* html */`
    <article class="way-group-row" data-vol-id="${_e(String(v.id || ''))}" tabindex="0">
      <div class="way-group-icon">${initials}</div>
      <div class="way-group-body">
        <div class="way-group-name">${_e(name)}</div>
        <div class="way-group-meta">
          <span>${_e(role)}</span>
          ${ministry !== '—' ? `<span>${_e(ministry)}</span>` : ''}
          ${date ? `<span>${_e(date)}</span>` : ''}
        </div>
      </div>
    </article>`;
}

function _openVolunteerSheet(item, onSave) {
  _closeVolunteerSheet();
  const UR    = window.UpperRoom;
  if (!UR) return;
  const isEdit = !!item;

  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  sheet.innerHTML = /* html */`
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel" role="dialog" aria-label="${isEdit ? 'Edit Volunteer' : 'Add Volunteer'}">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div class="life-sheet-hd-info"><div class="life-sheet-hd-name">${isEdit ? 'Edit Volunteer Record' : 'Add Volunteer'}</div></div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">
        <div class="life-sheet-field">
          <div class="life-sheet-label">Member <span style="color:#dc2626">*</span></div>
          <input class="life-sheet-input" data-field="memberId" type="text" value="${_e(item?.memberId || item?.memberName || '')}" placeholder="Email or name">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Role</div>
          <input class="life-sheet-input" data-field="role" type="text" value="${_e(item?.role || '')}" placeholder="e.g. Sound Tech, Greeter, Usher…">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Ministry</div>
          <input class="life-sheet-input" data-field="ministryId" type="text" value="${_e(item?.ministryId || item?.ministryName || '')}" placeholder="Ministry name or ID">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Service Date</div>
          <input class="life-sheet-input" data-field="serviceDate" type="date" value="${_e(typeof item?.serviceDate === 'string' ? item.serviceDate : '')}">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Notes</div>
          <textarea class="life-sheet-ta" data-field="notes" rows="2" placeholder="Availability, restrictions, context…">${_e(item?.notes || '')}</textarea>
        </div>
        <div class="fold-form-error" data-error style="display:none;color:#dc2626;font-size:.85rem;margin-top:8px"></div>
      </div>
      <div class="life-sheet-foot">
        ${isEdit ? '<button class="flock-btn flock-btn--danger" data-delete style="margin-right:auto">Delete Record</button>' : ''}
        <button class="flock-btn" data-cancel>Cancel</button>
        <button class="flock-btn flock-btn--primary" data-save>${isEdit ? 'Save Changes' : 'Add Volunteer'}</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  _activeVolunteerSheet = sheet;
  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
  });

  const close = () => _closeVolunteerSheet();
  sheet.querySelector('[data-cancel]').addEventListener('click', close);
  sheet.querySelector('.life-sheet-close').addEventListener('click', close);

  sheet.querySelector('[data-save]').addEventListener('click', async () => {
    const errEl    = sheet.querySelector('[data-error]');
    const memberId = sheet.querySelector('[data-field="memberId"]').value.trim();
    if (!memberId) { errEl.textContent = 'Member is required.'; errEl.style.display = ''; return; }
    errEl.style.display = 'none';
    const btn = sheet.querySelector('[data-save]');
    btn.disabled = true; btn.textContent = 'Saving…';
    const payload = {
      memberId,
      role:        sheet.querySelector('[data-field="role"]').value.trim() || 'Volunteer',
      ministryId:  sheet.querySelector('[data-field="ministryId"]').value.trim() || undefined,
      serviceDate: sheet.querySelector('[data-field="serviceDate"]').value || undefined,
      notes:       sheet.querySelector('[data-field="notes"]').value.trim() || undefined,
    };
    try {
      if (isEdit) { await UR.updateVolunteer(Object.assign({ id: item.id }, payload)); }
      else        { await UR.createVolunteer(payload); }
      _closeVolunteerSheet();
      if (onSave) onSave();
    } catch (err) {
      console.error('[TheWay] volunteer save:', err);
      errEl.textContent = err?.message || 'Could not save volunteer record.'; errEl.style.display = '';
      btn.disabled = false; btn.textContent = isEdit ? 'Save Changes' : 'Add Volunteer';
    }
  });

  sheet.querySelector('[data-delete]')?.addEventListener('click', async () => {
    if (!confirm('Delete this volunteer record? This cannot be undone.')) return;
    const btn = sheet.querySelector('[data-delete]');
    btn.disabled = true; btn.textContent = 'Deleting…';
    try {
      if (typeof UR.deleteVolunteer === 'function') await UR.deleteVolunteer({ id: item.id });
      else await UR.updateVolunteer({ id: item.id, status: 'Deleted' });
      _closeVolunteerSheet();
      if (onSave) onSave();
    } catch (err) {
      console.error('[TheWay] volunteer delete:', err);
      alert(err?.message || 'Could not delete record.');
      btn.disabled = false; btn.textContent = 'Delete Record';
    }
  });
}

// ── DISCIPLESHIP TRACKS ────────────────────────────────────────────────────────
let _activeTrackSheet = null;
const TRACK_STAGES = ['Foundation', 'Growth', 'Leadership', 'Missions', 'Specialised', 'Other'];

function _closeTrackSheet() {
  if (!_activeTrackSheet) return;
  const t = _activeTrackSheet;
  t.querySelector('.life-sheet-overlay')?.classList.remove('is-open');
  t.querySelector('.life-sheet-panel')?.classList.remove('is-open');
  setTimeout(() => { t.remove(); if (_activeTrackSheet === t) _activeTrackSheet = null; }, 320);
}

function _openTrackSheet(t, onReload) {
  _closeTrackSheet();
  const V   = window.TheVine;
  const MXD = buildAdapter('flock.discipleship.paths', V);
  const isNew = !t;

  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  sheet.innerHTML = /* html */`
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel" role="dialog" aria-label="${isNew ? 'Add Track' : 'Edit Track'}">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div class="life-sheet-hd-info">
          <div class="life-sheet-hd-name">${isNew ? 'Add Discipleship Track' : 'Edit Track'}</div>
          <div class="life-sheet-hd-meta">${isNew ? 'Create a new growth path' : _e(t?.title || t?.name || 'Track')}</div>
        </div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">
        <div class="life-sheet-field">
          <div class="life-sheet-label">Title <span style="color:#dc2626">*</span></div>
          <input class="life-sheet-input" data-field="title" type="text" value="${_e(t?.title || t?.name || '')}" placeholder="e.g. Foundations of Faith">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Stage / Level</div>
          <select class="life-sheet-input" data-field="stage">
            <option value="">— Select stage —</option>
            ${TRACK_STAGES.map(s => `<option value="${_e(s)}"${s === (t?.stage || t?.level || t?.category || '') ? ' selected' : ''}>${_e(s)}</option>`).join('')}
          </select>
        </div>
        <div class="fold-form-row">
          <div class="life-sheet-field">
            <div class="life-sheet-label">Lesson Count</div>
            <input class="life-sheet-input" data-field="lessonCount" type="number" min="0" value="${t?.lessonCount ?? t?.stepCount ?? ''}">
          </div>
          <div class="life-sheet-field">
            <div class="life-sheet-label">Enrolled</div>
            <input class="life-sheet-input" data-field="enrolledCount" type="number" min="0" value="${t?.enrolledCount ?? t?.enrolled ?? ''}">
          </div>
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Description</div>
          <textarea class="life-sheet-input" data-field="description" rows="3" placeholder="What will participants learn?">${_e(t?.description || t?.desc || '')}</textarea>
        </div>
        <div class="fold-form-error" data-error style="display:none;color:#dc2626;font-size:.85rem;margin-top:8px"></div>
      </div>
      <div class="life-sheet-foot">
        ${!isNew ? '<button class="flock-btn flock-btn--danger" data-delete style="margin-right:auto">Delete Track</button>' : ''}
        <button class="flock-btn" data-cancel>Cancel</button>
        <button class="flock-btn flock-btn--primary" data-save>${isNew ? 'Create Track' : 'Save Changes'}</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  _activeTrackSheet = sheet;
  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
    sheet.querySelector('[data-field="title"]')?.focus();
  });

  sheet.querySelector('[data-cancel]').addEventListener('click', _closeTrackSheet);
  sheet.querySelector('.life-sheet-close').addEventListener('click', _closeTrackSheet);

  sheet.querySelector('[data-save]').addEventListener('click', async () => {
    const errEl = sheet.querySelector('[data-error]');
    const title = sheet.querySelector('[data-field="title"]').value.trim();
    if (!title) { errEl.textContent = 'Title is required.'; errEl.style.display = ''; return; }
    if (!V) {
      errEl.textContent = 'Discipleship backend not available.'; errEl.style.display = ''; return;
    }
    errEl.style.display = 'none';
    const btn = sheet.querySelector('[data-save]');
    btn.disabled = true; btn.textContent = isNew ? 'Creating…' : 'Saving…';
    const payload = {
      title,
      name:         title,
      stage:        sheet.querySelector('[data-field="stage"]').value || undefined,
      level:        sheet.querySelector('[data-field="stage"]').value || undefined,
      lessonCount:  parseInt(sheet.querySelector('[data-field="lessonCount"]').value) || undefined,
      enrolledCount:parseInt(sheet.querySelector('[data-field="enrolledCount"]').value) || undefined,
      description:  sheet.querySelector('[data-field="description"]').value.trim() || undefined,
    };
    if (!isNew) payload.id = String(t.id);
    try {
      if (isNew) await MXD.create(payload);
      else       await MXD.update(payload);
      _closeTrackSheet(); onReload?.();
    } catch (err) {
      errEl.textContent = err?.message || 'Could not save track.'; errEl.style.display = '';
      btn.disabled = false; btn.textContent = isNew ? 'Create Track' : 'Save Changes';
    }
  });

  sheet.querySelector('[data-delete]')?.addEventListener('click', async () => {
    if (!confirm(`Delete track "${t?.title || t?.name}"? This cannot be undone.`)) return;
    const btn = sheet.querySelector('[data-delete]');
    btn.disabled = true; btn.textContent = 'Deleting…';
    try {
      await MXD.delete({ id: String(t.id) });
      _closeTrackSheet(); onReload?.();
    } catch (err) {
      alert(err?.message || 'Could not delete track.');
      btn.disabled = false; btn.textContent = 'Delete Track';
    }
  });
}
