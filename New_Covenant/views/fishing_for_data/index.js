/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: FISHING FOR DATA — Analytics
   "Number the children of Israel." — Numbers 1:2
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'fishing_for_data';
export const title = 'Analytics';

// ── Demo data ─────────────────────────────────────────────────────────────────
const KPI = [
  { label: 'Avg. Weekly Attendance', value: '312',  delta: '+8%',  up: true,  color: 'var(--c-violet)' },
  { label: 'Monthly Giving',         value: '$24.6k', delta: '+12%', up: true,  color: 'var(--c-emerald)' },
  { label: 'New Members (QTD)',       value: '41',   delta: '+5',   up: true,  color: 'var(--c-sky)'    },
  { label: 'Care Items Open',         value: '8',    delta: '-3',   up: false, color: 'var(--gold)'     },
];

// Weekly attendance: last 12 weeks, ending today (Apr 26)
const ATTENDANCE = [247,261,284,255,311,298,319,302,328,315,309,312];
const WEEKS      = ['Feb 1','Feb 8','Feb 15','Feb 22','Mar 1','Mar 8','Mar 15','Mar 22','Mar 29','Apr 5','Apr 13','Apr 20'];

const MONTHLY = [
  { month: 'Jan', attendance: 288, giving: 21400, members: 229, new: 6 },
  { month: 'Feb', attendance: 297, giving: 22100, members: 233, new: 4 },
  { month: 'Mar', attendance: 308, giving: 23500, members: 239, new: 6 },
  { month: 'Apr', attendance: 312, giving: 24600, members: 247, new: 8 },
];

export function render() {
  const maxAtt = Math.max(...ATTENDANCE);

  return /* html */`
    <section class="data-view">
      ${pageHero({
        title:    'Analytics',
        subtitle: 'Attendance trends, giving, growth, and ministry health — at a glance.',
        scripture: 'Number the children of Israel. — Numbers 1:2',
      })}

      <!-- KPI strip -->
      <div class="data-kpi-strip">
        ${KPI.map(k => `
          <div class="data-kpi-card">
            <div class="data-kpi-value" style="color:${k.color}">${_e(k.value)}</div>
            <div class="data-kpi-label">${_e(k.label)}</div>
            <div class="data-kpi-delta ${k.up ? 'data-delta--up' : 'data-delta--down'}">
              ${k.up ? '↑' : '↓'} ${_e(k.delta)} vs last period
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Attendance chart -->
      <div class="data-card">
        <div class="data-card-header">
          <h2 class="data-card-title">Weekly Attendance — Last 12 Weeks</h2>
        </div>
        <div class="data-chart-wrap">
          ${_barChart(ATTENDANCE, WEEKS, maxAtt)}
        </div>
      </div>

      <!-- Monthly summary table -->
      <div class="data-card">
        <div class="data-card-header">
          <h2 class="data-card-title">Monthly Summary — 2026</h2>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Avg Attendance</th>
              <th>Giving</th>
              <th>Total Members</th>
              <th>New Members</th>
            </tr>
          </thead>
          <tbody>
            ${MONTHLY.map(r => `
              <tr>
                <td><strong>${_e(r.month)}</strong></td>
                <td>${r.attendance}</td>
                <td>$${r.giving.toLocaleString()}</td>
                <td>${r.members}</td>
                <td class="data-cell--good">+${r.new}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

export function mount() { return () => {}; }

function _barChart(data, labels, maxVal) {
  const W = 100 / data.length;
  const bars = data.map((v, i) => {
    const h = Math.round((v / maxVal) * 100);
    const isLast = i === data.length - 1;
    return `
      <div class="data-bar-col">
        <div class="data-bar-val">${v}</div>
        <div class="data-bar-wrap">
          <div class="data-bar${isLast ? ' data-bar--today' : ''}" style="height:${h}%"></div>
        </div>
        <div class="data-bar-label">${_e(labels[i])}</div>
      </div>`;
  }).join('');
  return `<div class="data-bar-chart">${bars}</div>`;
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

