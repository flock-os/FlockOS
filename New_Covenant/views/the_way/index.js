/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE WAY — Discipleship & Small Groups
   "I am the way, the truth, and the life." — John 14:6
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'the_way';
export const title = 'The Way';

const TRACKS = [
  {
    id: 1, title: 'Foundations of Faith', stage: 'New Believer',
    color: '#059669', enrolled: 14, complete: 3, lessons: 8,
    desc: 'Core doctrines, prayer, Scripture basics, and first steps in community.',
  },
  {
    id: 2, title: 'Rooted in Grace', stage: 'Growing',
    color: '#0ea5e9', enrolled: 22, complete: 9, lessons: 12,
    desc: 'Deeper study of the Gospels, spiritual disciplines, and serving the church.',
  },
  {
    id: 3, title: 'Walking in the Spirit', stage: 'Maturing',
    color: '#7c3aed', enrolled: 11, complete: 7, lessons: 10,
    desc: 'Gifts of the Spirit, intercession, spiritual warfare, and mentoring others.',
  },
  {
    id: 4, title: 'Called to Lead', stage: 'Leader Track',
    color: '#e8a838', enrolled: 7, complete: 2, lessons: 14,
    desc: 'Leadership theology, preaching basics, pastoral care, and church governance.',
  },
];

const GROUPS = [
  { id: 1, name: 'Young Adults — Eastside',   leader: 'James Okafor',   members: 12, day: 'Tuesday',   time: '7:00 PM', type: 'Small Group'  },
  { id: 2, name: 'Married Couples Circle',     leader: 'Sarah & David Mitchell', members: 8, day: 'Wednesday', time: '7:30 PM', type: 'Life Group'   },
  { id: 3, name: 'Men\'s Bible Study',         leader: 'Elijah Mensah',  members: 15, day: 'Saturday',  time: '8:00 AM', type: 'Study Group'  },
  { id: 4, name: 'Women of the Word',          leader: 'Grace Kimura',   members: 19, day: 'Thursday',  time: '6:30 PM', type: 'Study Group'  },
  { id: 5, name: 'Teen Discipleship',          leader: 'Priya Nair',     members: 11, day: 'Friday',    time: '6:00 PM', type: 'Youth Group'  },
  { id: 6, name: 'Senior Fellowship',          leader: 'Ruth Adebayo',   members: 10, day: 'Monday',    time: '2:00 PM', type: 'Life Group'   },
];

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
        <button class="flock-btn flock-btn--ghost way-see-all">View All Tracks</button>
      </div>
      <div class="way-tracks">
        <div class="way-loading" style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Loading tracks…</div>
      </div>

      <!-- Small Groups -->
      <div class="way-section-header" style="margin-top:28px;">
        <h2 class="way-section-title">Small Groups</h2>
        <button class="flock-btn flock-btn--primary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          New Group
        </button>
      </div>
      <div class="way-groups">
        <div class="way-loading" style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Loading groups…</div>
      </div>
    </section>
  `;
}

const GROUP_TYPES  = ['Small Group','Life Group','Study Group','Youth Group','Men\'s Group','Women\'s Group','Prayer Group','Recovery Group'];
const GROUP_DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

let _activeWaySheet = null;
let _liveGroupsMap  = {};

export function mount(root) {
  _loadWay(root);

  // New Group button (last .flock-btn--primary in header)
  root.querySelectorAll('.flock-btn--primary').forEach(btn => {
    if (btn.textContent.includes('New Group')) {
      btn.addEventListener('click', () => _openGroupSheet(null, () => _loadWay(root)));
    }
  });

  return () => { _closeWaySheet(); };
}

async function _loadWay(root) {
  const V = window.TheVine;
  if (!V) return;

  // Discipleship tracks
  const tracksEl = root.querySelector('.way-tracks');
  if (tracksEl) {
    tracksEl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Loading tracks…</div>';
    try {
      const res  = await V.flock.discipleship.paths.list({});
      const all  = _rows(res);
      // Filter client-side: exclude archived/inactive
      const _DEAD = new Set(['archived','inactive','draft']);
      const rows = all.filter(r => !_DEAD.has((r.status || r.Status || '').toLowerCase()));
      tracksEl.innerHTML = rows.length
        ? rows.map(_liveTrackCard).join('')
        : '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">No discipleship tracks found.</div>';
    } catch (err) {
      console.error('[TheWay] discipleship.paths.list error:', err);
      tracksEl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Discipleship data unavailable.</div>';
    }
  }

  // Small groups
  const groupsEl = root.querySelector('.way-groups');
  if (groupsEl) {
    groupsEl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Loading groups…</div>';
    try {
      const res  = await V.flock.groups.list();
      const rows = _rows(res);
      groupsEl.innerHTML = rows.length
        ? rows.map(_liveGroupRow).join('')
        : '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">No small groups found.</div>';

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
      groupsEl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Small groups data unavailable.</div>';
    }
  }
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
    <article class="way-track-card" tabindex="0">
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
  const name     = g.name || 'Small Group';
  const leader   = g.leader || g.leaderName || '';
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
          ${(day || time) ? `<span>·</span><span>${_e([day && day + 's', time].filter(Boolean).join(' '))}</span>` : ''}
          ${members ? `<span>·</span><span>${members} members</span>` : ''}
        </div>
      </div>
      ${leader ? `<div class="way-group-leader">Led by ${_e(leader)}</div>` : ''}
    </article>`;
}

function _trackCard(t) {
  const pct = Math.round((t.complete / t.enrolled) * 100);
  return /* html */`
    <article class="way-track-card" tabindex="0">
      <div class="way-track-stripe" style="background:${t.color}"></div>
      <div class="way-track-body">
        <div class="way-track-stage" style="color:${t.color}">${_e(t.stage)}</div>
        <div class="way-track-title">${_e(t.title)}</div>
        <div class="way-track-desc">${_e(t.desc)}</div>
        <div class="way-track-meta">
          <span>${t.lessons} lessons</span>
          <span>${t.enrolled} enrolled</span>
        </div>
        <div class="way-progress-bar">
          <div class="way-progress-fill" style="width:${pct}%; background:${t.color}"></div>
        </div>
        <div class="way-progress-label">${t.complete}/${t.enrolled} completed (${pct}%)</div>
      </div>
    </article>
  `;
}

function _groupRow(g) {
  const initials = g.leader.split(/\s+/).map(w => w[0] || '').slice(0,2).join('').toUpperCase();
  return /* html */`
    <article class="way-group-row" tabindex="0">
      <div class="way-group-avatar">${initials}</div>
      <div class="way-group-body">
        <div class="way-group-name">${_e(g.name)}</div>
        <div class="way-group-meta">
          <span>${_e(g.type)}</span>
          <span>·</span>
          <span>${_e(g.day)}s ${_e(g.time)}</span>
          <span>·</span>
          <span>${g.members} members</span>
        </div>
      </div>
      <div class="way-group-leader">Led by ${_e(g.leader)}</div>
    </article>
  `;
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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
  const V     = window.TheVine;
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
  sheet.querySelector('.life-sheet-overlay').addEventListener('click', close);

  sheet.querySelector('[data-save]').addEventListener('click', async () => {
    const errEl   = sheet.querySelector('[data-error]');
    const nameVal = sheet.querySelector('[data-field="name"]').value.trim();
    if (!nameVal) { errEl.textContent = 'Group name is required.'; errEl.style.display = ''; return; }
    errEl.style.display = 'none';
    const btn = sheet.querySelector('[data-save]');
    btn.disabled = true; btn.textContent = isNew ? 'Creating…' : 'Saving…';
    const maxVal = parseInt(sheet.querySelector('[data-field="maxMembers"]').value);
    const payload = {
      name:        nameVal,
      type:        sheet.querySelector('[data-field="type"]').value,
      leaderName:  sheet.querySelector('[data-field="leaderName"]').value.trim(),
      meetingDay:  sheet.querySelector('[data-field="meetingDay"]').value,
      meetingTime: sheet.querySelector('[data-field="meetingTime"]').value,
      description: sheet.querySelector('[data-field="description"]').value.trim(),
      ...(maxVal > 0 ? { maxMembers: maxVal } : {}),
    };
    if (!isNew) payload.id = uid;
    try {
      if (isNew) { await V.flock.groups.create(payload); }
      else       { await V.flock.groups.update(payload); }
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
      await V.flock.groups.update({ id: uid, status: 'Archived' });
      _closeWaySheet();
      onReload?.();
    } catch (err) {
      console.error('[TheWay] group archive error:', err);
      btn.disabled = false; btn.textContent = 'Archive Group';
    }
  });
}
