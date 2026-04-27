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
        ${TRACKS.map(_trackCard).join('')}
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
        ${GROUPS.map(_groupRow).join('')}
      </div>
    </section>
  `;
}

export function mount(root) {
  _loadWay(root);
  return () => {};
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
    <article class="way-group-row" tabindex="0">
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
