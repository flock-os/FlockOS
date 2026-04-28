/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: FISHING FOR DATA — Analytics
   "Number the children of Israel." — Numbers 1:2
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'fishing_for_data';
export const title = 'Analytics';

const KPI_DEFS = [
  { label: 'Avg. Weekly Attendance', color: 'var(--c-violet)' },
  { label: 'Monthly Giving',         color: 'var(--c-emerald)' },
  { label: 'New Members (QTD)',      color: 'var(--c-sky)' },
  { label: 'Care Items Open',        color: 'var(--gold)' },
];

export function render() {
  return /* html */`
    <section class="data-view">
      ${pageHero({
        title:    'Analytics',
        subtitle: 'Attendance trends, giving, growth, and ministry health — at a glance.',
        scripture: 'Number the children of Israel. — Numbers 1:2',
      })}

      <!-- KPI strip -->
      <div class="data-kpi-strip" data-bind="kpi">
        ${KPI_DEFS.map(k => `
          <div class="data-kpi-card">
            <div class="data-kpi-value" style="color:${k.color}">—</div>
            <div class="data-kpi-label">${_e(k.label)}</div>
            <div class="data-kpi-delta" style="color:var(--ink-muted,#7a7f96)">Loading…</div>
          </div>
        `).join('')}
      </div>

      <!-- Attendance chart -->
      <div class="data-card">
        <div class="data-card-header">
          <h2 class="data-card-title">Weekly Attendance — Last 12 Weeks</h2>
        </div>
        <div class="data-chart-wrap" data-bind="chart">
          <div class="life-empty" style="padding:24px 8px;color:var(--ink-muted,#7a7f96);text-align:center">Loading attendance data…</div>
        </div>
      </div>
    </section>
  `;
}

export function mount(root) {
  _loadAnalytics(root);
  return () => {};
}

function _rows(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.rows))      return res.rows;
  if (res && Array.isArray(res.data))      return res.data;
  if (res && Array.isArray(res.weekly))    return res.weekly;
  if (res && Array.isArray(res.snapshots)) return res.snapshots;
  return [];
}

async function _loadAnalytics(root) {
  const errMsg = (msg) => `<div class="life-empty" style="padding:24px 8px;color:var(--ink-muted,#7a7f96);text-align:center">${msg}</div>`;
  const chartWrap = root.querySelector('[data-bind="chart"]');

  const V = window.TheVine;
  if (!V) {
    if (chartWrap) chartWrap.innerHTML = errMsg('Analytics backend not loaded.');
    root.querySelectorAll('.data-kpi-card .data-kpi-delta').forEach(el => { el.textContent = 'Unavailable'; });
    return;
  }

  const [attRes, giveRes, membersRes, careRes] = await Promise.allSettled([
    V.flock?.attendance?.summary?.({ weeks: 12 }),
    V.flock?.giving?.summary?.(),
    V.flock?.members?.list?.({ limit: 500 }),
    V.flock?.care?.list?.({ limit: 500 }),
  ]);

  let chartFilled = false;

  if (attRes.status === 'fulfilled' && attRes.value) {
    const rows = _rows(attRes.value.weekly || attRes.value.snapshots || attRes.value);
    if (rows.length) {
      const last12 = rows.slice(-12);
      const vals   = last12.map(w => Number(w.count || w.total || w.attendance || 0));
      const labels = last12.map(w => {
        const d = w.date || w.serviceDate || w.week;
        if (!d) return '';
        const dt = new Date(typeof d === 'object' && d.seconds ? d.seconds * 1000 : d);
        return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      });
      const maxV = Math.max(...vals, 1);
      if (chartWrap && vals.some(v => v > 0)) {
        chartWrap.innerHTML = _barChart(vals, labels, maxV);
        chartFilled = true;
      }
      const avg = Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
      _setKpi(root, 0, avg > 0 ? String(avg) : '—', '12-week average');
    } else {
      _setKpi(root, 0, '—', 'No data');
    }
  } else { _setKpi(root, 0, '—', 'Unavailable'); }
  if (chartWrap && !chartFilled) chartWrap.innerHTML = errMsg('No attendance snapshots available.');

  if (giveRes.status === 'fulfilled' && giveRes.value) {
    const g = giveRes.value;
    const monthly = g.monthlyTotal ?? g.thisMonth ?? g.givingMonthTotal ?? g.total ?? 0;
    if (monthly > 0) _setKpi(root, 1, `$${(monthly / 1000).toFixed(1)}k`, 'This month');
    else             _setKpi(root, 1, '—', 'No data');
  } else { _setKpi(root, 1, '—', 'Unavailable'); }

  if (membersRes.status === 'fulfilled') {
    const all = _rows(membersRes.value);
    if (all.length) {
      const now    = new Date();
      const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      const newQ   = all.filter(m => {
        const raw = m.joinDate || m.createdAt;
        if (!raw) return false;
        const dt = new Date(typeof raw === 'object' && raw.seconds ? raw.seconds * 1000 : raw);
        return dt >= qStart;
      }).length;
      _setKpi(root, 2, String(newQ), 'Quarter to date');
    } else { _setKpi(root, 2, '0', 'No members yet'); }
  } else { _setKpi(root, 2, '—', 'Unavailable'); }

  if (careRes.status === 'fulfilled') {
    const all = _rows(careRes.value);
    const TERMINAL = new Set(['resolved','closed','archived','cancelled','denied','completed','answered','inactive','deleted']);
    const open = all.filter(c => !TERMINAL.has(String(c.status || '').toLowerCase()));
    _setKpi(root, 3, String(open.length), open.length ? 'Open now' : 'All clear');
  } else { _setKpi(root, 3, '—', 'Unavailable'); }
}

function _setKpi(root, idx, value, deltaLabel) {
  const cards = root.querySelectorAll('.data-kpi-card');
  if (!cards[idx]) return;
  const el = cards[idx].querySelector('.data-kpi-value');
  if (el) el.textContent = value;
  if (deltaLabel != null) {
    const d = cards[idx].querySelector('.data-kpi-delta');
    if (d) { d.textContent = deltaLabel; d.style.color = 'var(--ink-muted,#7a7f96)'; }
  }
}

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

