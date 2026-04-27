/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE TRUTH — Content Library
   "Sanctify them through thy truth: thy word is truth." — John 17:17
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'the_truth';
export const title = 'Content';

const SERIES = [
  { id: 1, title: 'Rooted',            speaker: 'Pastor Mike',  episodes: 6,  cover: '#7c3aed', icon: '🌿', current: true,  desc: 'Colossians — established and built up in him.' },
  { id: 2, title: 'Fear Not',          speaker: 'Elder Sarah',  episodes: 4,  cover: '#0ea5e9', icon: '🛡️', current: false, desc: 'Overcoming anxiety through the promises of God.' },
  { id: 3, title: 'Living Water',      speaker: 'Pastor Mike',  episodes: 8,  cover: '#059669', icon: '💧', current: false, desc: 'John 4 — the invitation that changes everything.' },
  { id: 4, title: 'The King is Coming',speaker: 'Guest: Dr. A. Osei', episodes: 3, cover: '#e8a838', icon: '👑', current: false, desc: 'Revelation 1–3 — letters to the seven churches.' },
];

const MESSAGES = [
  { id: 1, title: 'Rooted & Built Up (Week 6)',  series: 'Rooted',       speaker: 'Pastor Mike', date: 'Apr 20, 2026', duration: '42 min', views: 184, type: 'sermon' },
  { id: 2, title: 'Rooted & Built Up (Week 5)',  series: 'Rooted',       speaker: 'Pastor Mike', date: 'Apr 13, 2026', duration: '38 min', views: 201, type: 'sermon' },
  { id: 3, title: 'Women\'s Bible Study — Esther 4', series: 'Study', speaker: 'Grace Kimura',  date: 'Apr 10, 2026', duration: '55 min', views:  62, type: 'study' },
  { id: 4, title: 'Fear Not — Week 4 (Final)',   series: 'Fear Not',     speaker: 'Elder Sarah',  date: 'Apr  6, 2026', duration: '44 min', views: 167, type: 'sermon' },
  { id: 5, title: 'Morning Devotional — Psalm 46', series: 'Devotional', speaker: 'Deacon James', date: 'Apr  1, 2026', duration: '12 min', views:  95, type: 'devotional' },
  { id: 6, title: 'Fear Not — Week 3',           series: 'Fear Not',     speaker: 'Elder Sarah',  date: 'Mar 30, 2026', duration: '41 min', views: 149, type: 'sermon' },
];

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
        ${SERIES.map(_seriesCard).join('')}
      </div>

      <!-- Recent messages -->
      <div class="way-section-header" style="margin-top:24px;">
        <h2 class="way-section-title">Recent Messages</h2>
        <button class="flock-btn flock-btn--ghost way-see-all">Browse All</button>
      </div>
      <div class="truth-messages">
        ${MESSAGES.map(_messageRow).join('')}
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

  _loadTruth(root).then(() => _wireFilters());
  return () => {};
}

async function _loadTruth(root) {
  const V = window.TheVine;
  if (!V) return;

  // Sermon series
  const seriesEl = root.querySelector('.truth-series-grid');
  if (seriesEl) {
    seriesEl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Loading series…</div>';
    try {
      const res  = await V.flock.sermonSeries.list();
      const rows = _rows(res);
      seriesEl.innerHTML = rows.length
        ? rows.map(_liveSeriesCard).join('')
        : '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">No sermon series on file.</div>';
    } catch (_) {
      seriesEl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Content library unavailable.</div>';
    }
  }

  // Recent sermons/messages
  const msgsEl = root.querySelector('.truth-messages');
  if (msgsEl) {
    msgsEl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Loading messages…</div>';
    try {
      const res  = await V.flock.sermons.list();
      const rows = _rows(res);
      msgsEl.innerHTML = rows.length
        ? rows.map(_liveMsgRow).join('')
        : '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">No messages on file.</div>';
    } catch (_) {
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
    <article class="truth-series-card${current ? ' truth-series--current' : ''}" tabindex="0">
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
    <article class="truth-msg-row" data-type="${_e(type)}" tabindex="0">
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

function _seriesCard(s) {
  return /* html */`
    <article class="truth-series-card${s.current ? ' truth-series--current' : ''}" tabindex="0">
      <div class="truth-series-cover" style="background:${s.cover}">${s.icon}</div>
      <div class="truth-series-body">
        <div class="truth-series-title">${_e(s.title)}</div>
        <div class="truth-series-speaker">${_e(s.speaker)}</div>
        <div class="truth-series-desc">${_e(s.desc)}</div>
        <div class="truth-series-foot">
          <span class="truth-episode-count">${s.episodes} messages</span>
          ${s.current ? '<span class="truth-current-badge">Current</span>' : ''}
        </div>
      </div>
    </article>
  `;
}

function _messageRow(m) {
  const meta = TYPE_META[m.type] || TYPE_META.sermon;
  return /* html */`
    <article class="truth-msg-row" data-type="${_e(m.type)}" tabindex="0">
      <div class="truth-msg-play">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </div>
      <div class="truth-msg-body">
        <div class="truth-msg-title">${_e(m.title)}</div>
        <div class="truth-msg-meta">
          <span class="truth-type-badge" style="color:${meta.color}; background:${meta.bg}">${meta.label}</span>
          <span>${_e(m.speaker)}</span>
          <span>·</span>
          <span>${_e(m.date)}</span>
          <span>·</span>
          <span>${_e(m.duration)}</span>
        </div>
      </div>
      <div class="truth-msg-views">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        ${m.views}
      </div>
    </article>
  `;
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

