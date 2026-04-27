/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: The Weaver’s Plan
   "For I know the thoughts that I think toward you, saith the LORD. — Jeremiah 29:11"
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'the_weavers_plan';
export const title = 'The Weaver’s Plan';

const _e = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* ── Data ───────────────────────────────────────────────────────────────────────────── */
const GOALS = [
  { area: 'Worship',      goal: 'Average 300+ in Sunday attendance',   pct: 88, status: 'on-track', owner: 'Pastor Greg'    },
  { area: 'Discipleship', goal: '100% of members in a small group',    pct: 61, status: 'at-risk',  owner: 'Elder Thompson' },
  { area: 'Missions',     goal: 'Fund 6 missionaries to full support', pct: 67, status: 'on-track', owner: 'Marcus Hill'    },
  { area: 'Giving',       goal: 'Reach $240k annual budget',           pct: 74, status: 'on-track', owner: 'Deacon Board'   },
  { area: 'Outreach',     goal: '50 gospel conversations / quarter',   pct: 46, status: 'at-risk',  owner: 'Outreach Team'  },
  { area: 'Care',         goal: 'No unassigned care items > 48 hrs',   pct: 92, status: 'on-track', owner: 'Pastor Marcus'  },
];

const INITIATIVES = [
  { title: 'Launch Small Group Network v2',  ministry: 'Discipleship', owner: 'Elder Thompson',  status: 'In Progress', due: 'May 31',  progress: 60  },
  { title: 'Summer Revival Planning',         ministry: 'Worship',      owner: 'Pastor Greg',     status: 'In Progress', due: 'Jul 15',  progress: 35  },
  { title: 'Missions Conference 2026',        ministry: 'Missions',     owner: 'Marcus Hill',     status: 'In Progress', due: 'Sep 20',  progress: 20  },
  { title: 'Generosity Campaign: Harvest',   ministry: 'Giving',       owner: 'Deacon Board',    status: 'Planning',    due: 'Oct 1',   progress: 10  },
  { title: 'New Member Assimilation Track',  ministry: 'Discipleship', owner: 'Sarah Okafor',    status: 'Complete',    due: 'Apr 1',   progress: 100 },
  { title: 'Community Meal Program',         ministry: 'Outreach',     owner: 'Deacon Board',    status: 'In Progress', due: 'Ongoing', progress: 75  },
  { title: 'Benevolence Fund Drive',         ministry: 'Care',         owner: 'Pastor Marcus',   status: 'Planning',    due: 'Jun 15',  progress: 5   },
];

const MILESTONES = [
  { date: 'Apr 27', label: 'Easter Sunday Service',           done: false },
  { date: 'May 11', label: "Mother's Day — Family Dedication", done: false },
  { date: 'May 25', label: 'Small Group Leader Training',     done: false },
  { date: 'Jun 15', label: 'Benevolence Fund Drive Kickoff',  done: false },
  { date: 'Jul 15', label: 'Summer Revival Begins',           done: false },
  { date: 'Mar 15', label: 'New Member Track launched',       done: true  },
  { date: 'Feb 1',  label: 'Budget approved for 2026',        done: true  },
];

const STATUS_DEF = {
  'on-track':   { bg:'rgba(5,150,105,.1)',   c:'#059669', label:'On Track'   },
  'at-risk':    { bg:'rgba(232,168,56,.14)', c:'#b45309', label:'At Risk'    },
  'In Progress':{ bg:'rgba(124,58,237,.1)', c:'#7c3aed', label:'In Progress' },
  'Planning':   { bg:'rgba(14,165,233,.1)',  c:'#0369a1', label:'Planning'   },
  'Complete':   { bg:'rgba(5,150,105,.1)',   c:'#059669', label:'Complete'   },
};
function badge(key) {
  const d = STATUS_DEF[key] || STATUS_DEF['Planning'];
  return `<span class="wv-badge" style="background:${d.bg};color:${d.c}">${_e(d.label)}</span>`;
}
const AREA_COLOR = { Worship:'#7c3aed', Discipleship:'#e8a838', Missions:'#059669', Giving:'#0ea5e9', Outreach:'#dc2626', Care:'#1b264f' };

export function render() {
  return `
<section class="wv-view">
  ${pageHero({
    title: 'The Weaver\u2019s Plan',
    subtitle: 'Strategic planning across all ministry areas.',
    scripture: 'For I know the thoughts that I think toward you, saith the LORD. \u2014 Jeremiah 29:11',
  })}

  <div class="wv-card">
    <div class="wv-card-header">
      <h3 class="wv-card-title">2026 Kingdom Goals</h3>
      <span class="wv-year-badge">Year of Harvest</span>
    </div>
    <div class="wv-goals-list">
      ${GOALS.map(g => {
        const c = AREA_COLOR[g.area] || '#7c3aed';
        return `
      <div class="wv-goal-row">
        <div class="wv-goal-area" style="color:${c}">${_e(g.area)}</div>
        <div class="wv-goal-body">
          <div class="wv-goal-text">${_e(g.goal)}</div>
          <div class="wv-goal-bar-wrap"><div class="wv-goal-bar" style="width:${g.pct}%;background:${c}"></div></div>
        </div>
        <div class="wv-goal-pct">${g.pct}%</div>
        ${badge(g.status)}
        <div class="wv-goal-owner">${_e(g.owner)}</div>
      </div>`;
      }).join('')}
    </div>
  </div>

  <div class="wv-lower-row">

    <div class="wv-card wv-initiatives-card">
      <div class="wv-card-header">
        <h3 class="wv-card-title">Key Initiatives</h3>
        <button class="btn btn-outline" style="font-size:.8rem;padding:6px 14px">+ Add</button>
      </div>
      <div class="wv-init-list">
        ${INITIATIVES.map(i => {
          const c = AREA_COLOR[i.ministry] || '#7c3aed';
          return `
        <div class="wv-init-row">
          <div class="wv-init-stripe" style="background:${c}"></div>
          <div class="wv-init-body">
            <div class="wv-init-title">${_e(i.title)}</div>
            <div class="wv-init-meta">
              <span style="color:${c}">${_e(i.ministry)}</span>
              <span>\u00b7 ${_e(i.owner)}</span>
              <span>\u00b7 Due ${_e(i.due)}</span>
            </div>
            <div class="wv-init-bar-wrap"><div class="wv-init-bar" style="width:${i.progress}%;background:${c}"></div></div>
          </div>
          <div class="wv-init-pct">${i.progress}%</div>
          ${badge(i.status)}
        </div>`;
        }).join('')}
      </div>
    </div>

    <div class="wv-card wv-milestones-card">
      <h3 class="wv-card-title" style="margin-bottom:16px">Upcoming Milestones</h3>
      <div class="wv-timeline">
        ${MILESTONES.map(m => `
        <div class="wv-milestone-row ${m.done ? 'wv-milestone--done' : ''}">
          <div class="wv-milestone-dot"></div>
          <div class="wv-milestone-body">
            <div class="wv-milestone-date">${_e(m.date)}</div>
            <div class="wv-milestone-label">${_e(m.label)}</div>
          </div>
          ${m.done ? '<span class="wv-done-check">\u2713</span>' : ''}
        </div>`).join('')}
      </div>
    </div>

  </div>
</section>`;
}

export function mount(_root) { return () => {}; }
