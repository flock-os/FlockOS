/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE GENERATIONS — Church History & Milestones
   "One generation shall praise thy works to another." — Psalm 145:4
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'the_generations';
export const title = 'The Generations';

const _e = s => String(s ?? '').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const MILESTONES = [
  { year: 1987, title: 'Church Founded',           category: 'founding',   desc: 'A small group of 12 families covenanted together to plant this church under Pastor Robert H.' },
  { year: 1992, title: 'First Building Dedicated',  category: 'building',   desc: 'The congregation moved into the first permanent sanctuary on Oak Avenue after 18 months of fundraising.' },
  { year: 1998, title: '100 Members Milestone',     category: 'growth',     desc: 'Sunday attendance crossed 100 for the first time. Youth ministry launched.' },
  { year: 2003, title: 'First Missions Trip',       category: 'missions',   desc: 'Team of 8 traveled to West Africa — the beginning of an ongoing partnership with SIM.' },
  { year: 2008, title: 'Building Expansion',        category: 'building',   desc: 'Fellowship hall and classrooms added. Seating capacity doubled to 300.' },
  { year: 2012, title: 'Pastoral Transition',       category: 'leadership', desc: 'Pastor Mike installed as lead pastor following years of mentoring under founding pastor.' },
  { year: 2015, title: 'New Covenant Platform',     category: 'tech',       desc: 'FlockOS (then GAS-based) launched as the church management system.' },
  { year: 2019, title: '250 Members',               category: 'growth',     desc: 'Active membership reached 250 with 8 active small groups and 4 ministry departments.' },
  { year: 2022, title: 'FlockOS 1.0 Launch',        category: 'tech',       desc: 'Full rebuild on Firebase + Google Apps Script. Multiple church deployments go live.' },
  { year: 2024, title: 'Prison Ministry Launched',  category: 'outreach',   desc: 'Weekly prison ministry at Brookfield CI established. First baptism inside the facility.' },
  { year: 2026, title: 'New Covenant Era',          category: 'tech',       desc: 'FlockOS 2.0 — New Covenant shell, real-time Firebase comms, global missions registry.' },
];

const CAT_META = {
  founding:   { color: '#7c3aed', bg: 'rgba(124,58,237,0.11)', icon: '✝️'  },
  building:   { color: '#0ea5e9', bg: 'rgba(14,165,233,0.11)', icon: '⛪'  },
  growth:     { color: '#059669', bg: 'rgba(5,150,105,0.11)',  icon: '🌱'  },
  missions:   { color: '#e8a838', bg: 'rgba(232,168,56,0.13)', icon: '🌍'  },
  leadership: { color: '#1b264f', bg: 'rgba(27,38,79,0.10)',   icon: '🙌'  },
  tech:       { color: '#6366f1', bg: 'rgba(99,102,241,0.11)', icon: '⚙️'  },
  outreach:   { color: '#c05818', bg: 'rgba(192,88,24,0.11)',  icon: '🤝'  },
};

const CURRENT_YEAR = new Date().getFullYear();

export function render() {
  return /* html */`
    <section class="gen-view">
      ${pageHero({
        title:    'The Generations',
        subtitle: 'The long story of the church — founding, growth, missions, and covenant moments.',
        scripture: 'One generation shall praise thy works to another. — Psalm 145:4',
      })}

      <!-- Stats strip -->
      <div class="gen-stats">
        <div class="gen-stat-card">
          <div class="gen-stat-n" style="color:var(--c-violet)">${CURRENT_YEAR - 1987}</div>
          <div class="gen-stat-label">Years of Ministry</div>
        </div>
        <div class="gen-stat-card">
          <div class="gen-stat-n" style="color:var(--c-emerald)">247</div>
          <div class="gen-stat-label">Active Members</div>
        </div>
        <div class="gen-stat-card">
          <div class="gen-stat-n" style="color:var(--gold)">6</div>
          <div class="gen-stat-label">Lead Pastors</div>
        </div>
        <div class="gen-stat-card">
          <div class="gen-stat-n" style="color:var(--c-sky)">4</div>
          <div class="gen-stat-label">Mission Fields</div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="way-section-header" style="margin-top:24px;">
        <h2 class="way-section-title">Church Timeline</h2>
        <button class="flock-btn flock-btn--ghost">Add Milestone</button>
      </div>
      <div class="gen-timeline" data-bind="timeline">
        ${MILESTONES.slice().reverse().map(_milestone).join('')}
      </div>
    </section>
  `;
}

export function mount(root) {
  _loadGenerations(root);
  return () => {};
}

function _rows(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.rows)) return res.rows;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

async function _loadGenerations(root) {
  const V = window.TheVine;
  if (!V) return;
  const tlEl = root.querySelector('[data-bind="timeline"]');
  if (!tlEl) return;

  try {
    // Try flock milestones
    const res  = await V.flock.milestones.list({ limit: 100 });
    const rows = _rows(res);
    if (!rows.length) return;

    const sorted = [...rows].sort((a, b) => {
      const ya = a.year || (a.date ? new Date(a.date).getFullYear() : 0);
      const yb = b.year || (b.date ? new Date(b.date).getFullYear() : 0);
      return yb - ya;
    });

    tlEl.innerHTML = sorted.map(m => {
      const year  = m.year || (m.date ? new Date(m.date).getFullYear() : '');
      const title = m.title || m.name || 'Milestone';
      const cat   = (m.category || m.type || 'growth').toLowerCase();
      const desc  = m.description || m.notes || m.desc || '';
      const meta  = CAT_META[cat] || CAT_META.growth;
      return /* html */`
        <div class="gen-milestone">
          <div class="gen-milestone-year">${year}</div>
          <div class="gen-milestone-dot" style="background:${meta.color}"></div>
          <div class="gen-milestone-body">
            <div class="gen-milestone-head">
              <span class="gen-milestone-icon" style="background:${meta.bg};color:${meta.color}">${meta.icon}</span>
              <span class="gen-milestone-title">${_e(title)}</span>
            </div>
            ${desc ? `<div class="gen-milestone-desc">${_e(desc)}</div>` : ''}
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    console.error('[TheGenerations] milestones.list error:', err);
  }
}

function _milestone(m) {
  const meta = CAT_META[m.category] || CAT_META.growth;
  return /* html */`
    <div class="gen-milestone">
      <div class="gen-milestone-year">${m.year}</div>
      <div class="gen-milestone-dot" style="background:${meta.color}"></div>
      <div class="gen-milestone-body">
        <div class="gen-milestone-head">
          <span class="gen-milestone-icon" style="background:${meta.bg};color:${meta.color}">${meta.icon}</span>
          <span class="gen-milestone-title">${_e(m.title)}</span>
        </div>
        <div class="gen-milestone-desc">${_e(m.desc)}</div>
      </div>
    </div>`;
}

