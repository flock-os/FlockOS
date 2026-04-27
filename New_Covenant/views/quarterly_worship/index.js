/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: QUARTERLY WORSHIP — Service Plans & Arts Calendar
   "Sing unto the LORD a new song." — Psalm 96:1
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'quarterly_worship';
export const title = 'Quarterly Worship';

const _e = s => String(s ?? '').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const QUARTER = 'Q2 2026 (Apr–Jun)';

const SERVICE_PLANS = [
  { date: 'Apr 27', title: 'Kingdom Roots — Week 1', series: 'Kingdom Roots',  theme: 'Abide in the Vine',         preacher: 'Pastor Greg',   songs: ['Come Thou Fount', 'Holy Spirit', 'Abide With Me'] },
  { date: 'May 4',  title: 'Baptism Sunday',          series: 'Special',        theme: 'New Life in Christ',         preacher: 'Pastor Mike',   songs: ['Amazing Grace (My Chains)', 'Living Water', 'What a Beautiful Name'] },
  { date: 'May 11', title: 'Kingdom Roots — Week 2',  series: 'Kingdom Roots',  theme: 'Bearing Fruit',             preacher: 'Pastor Greg',   songs: ['Fruitful', 'King of Kings', '10,000 Reasons'] },
  { date: 'May 18', title: 'Revival Night',            series: 'Special',        theme: 'Outpouring of the Spirit',  preacher: 'Dr. A. Osei',   songs: ['Fire Fall Down', 'Come Holy Spirit', 'Spirit Break Out'] },
  { date: 'May 25', title: 'Kingdom Roots — Week 3',  series: 'Kingdom Roots',  theme: 'The True Vine',             preacher: 'Elder Sarah',   songs: ['Vine', 'You Are My All in All', 'Cornerstone'] },
];

const ARTS_CALENDAR = [
  { date: 'May 2',  item: 'Worship team rehearsal',         team: 'Worship',  type: 'rehearsal' },
  { date: 'May 4',  item: 'Baptism service music prep',     team: 'Worship',  type: 'rehearsal' },
  { date: 'May 9',  item: 'Audio/visual crew training',     team: 'Tech',     type: 'training'  },
  { date: 'May 14', item: 'New songs selection meeting',    team: 'Worship',  type: 'planning'  },
  { date: 'May 16', item: 'Revival nights sound check',     team: 'Tech',     type: 'rehearsal' },
  { date: 'May 23', item: 'Quarterly worship review',       team: 'Leadership', type: 'planning' },
];

const TYPE_META = {
  rehearsal: { color: '#7c3aed', bg: 'rgba(124,58,237,0.10)' },
  training:  { color: '#0ea5e9', bg: 'rgba(14,165,233,0.10)' },
  planning:  { color: '#059669', bg: 'rgba(5,150,105,0.10)'  },
};

export function render() {
  return /* html */`
    <section class="qw-view">
      ${pageHero({
        title:    'Quarterly Worship',
        subtitle: `${QUARTER} — service plans, setlists, and arts calendar.`,
        scripture: 'Sing unto the LORD a new song. — Psalm 96:1',
      })}

      <!-- Quarter tabs -->
      <div class="qw-quarter-tabs">
        <button class="qw-qtab is-active">Q2 2026</button>
        <button class="qw-qtab">Q3 2026</button>
        <button class="qw-qtab">Q4 2026</button>
      </div>

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
            ${SERVICE_PLANS.map(_planCard).join('')}
          </div>
        </div>

        <!-- Right: arts calendar -->
        <div class="qw-arts-col">
          <div class="way-section-header">
            <h2 class="way-section-title">Arts Calendar</h2>
          </div>
          <div class="qw-arts">
            ${ARTS_CALENDAR.map(a => {
              const meta = TYPE_META[a.type] || TYPE_META.rehearsal;
              return `
              <div class="qw-arts-row">
                <div class="qw-arts-date">${_e(a.date)}</div>
                <div class="qw-arts-body">
                  <div class="qw-arts-item">${_e(a.item)}</div>
                  <span class="qw-arts-team">${_e(a.team)}</span>
                </div>
                <span class="qw-arts-badge" style="color:${meta.color};background:${meta.bg}">${_e(a.type)}</span>
              </div>`;
            }).join('')}
          </div>
        </div>

      </div>
    </section>
  `;
}

export function mount(root) {
  // Quarter tab switching (visual only)
  root.querySelectorAll('.qw-qtab').forEach(btn => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('.qw-qtab').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });

  _loadPlans(root);
  return () => {};
}

function _rows(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.rows)) return res.rows;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

async function _loadPlans(root) {
  const V = window.TheVine;
  if (!V) return;
  const plansEl = root.querySelector('[data-bind="plans"]');
  if (!plansEl) return;

  try {
    const res  = await V.flock.servicePlans.list({ limit: 20 });
    const rows = _rows(res);
    if (!rows.length) return;

    // Filter to current quarter
    const now = new Date();
    const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const qEnd   = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
    const plans  = rows.filter(p => {
      const d = new Date(p.serviceDate || p.date || p.createdAt);
      return d >= qStart && d <= qEnd;
    }).sort((a, b) => new Date(a.serviceDate || a.date) - new Date(b.serviceDate || b.date));

    if (!plans.length) return;
    plansEl.innerHTML = plans.map(p => {
      const dateMs = new Date(p.serviceDate || p.date || p.createdAt).getTime();
      const date   = dateMs ? new Date(dateMs).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
      const title  = p.title || p.name || 'Service';
      const series = p.series || p.seriesName || '';
      const theme  = p.theme || p.message || '';
      const preacher = p.preacher || p.speaker || '';
      const songs  = p.songs || p.setlist || [];
      return _planCard({ date, title, series, theme, preacher, songs });
    }).join('');
  } catch (err) {
    console.error('[QuarterlyWorship] servicePlans.list error:', err);
  }
}

function _planCard(p) {
  const songList = Array.isArray(p.songs) && p.songs.length
    ? `<div class="qw-plan-songs">🎵 ${p.songs.map(s => _e(typeof s === 'string' ? s : s.title || '')).join(' · ')}</div>`
    : '';
  return /* html */`
    <article class="qw-plan-card" tabindex="0">
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

