/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: The Gift Drift
   "Every man according as he purposeth in his heart, so let him give. — 2 Corinthians 9:7"
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'the_gift_drift';
export const title = 'The Gift Drift';

const _e = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* ── Demo data ────────────────────────────────────────────────────────────── */
const KPI = [
  { label: 'This Month',  value: '$18,240', delta: '+6%',  up: true  },
  { label: 'YTD Giving',  value: '$84,720', delta: '+11%', up: true  },
  { label: 'Avg Gift',    value: '$127',    delta: '-3%',  up: false },
  { label: 'Active Givers', value: '148',   delta: '+9',   up: true  },
];

/* Monthly giving Jan–Apr + forecast May–Jun */
const MONTHS = [
  { label: 'Jan', amount: 19800, forecast: false },
  { label: 'Feb', amount: 16400, forecast: false },
  { label: 'Mar', amount: 21300, forecast: false },
  { label: 'Apr', amount: 18240, forecast: false },
  { label: 'May', amount: 17500, forecast: true  },
  { label: 'Jun', amount: 19000, forecast: true  },
];
const MAX_AMT = Math.max(...MONTHS.map(m => m.amount));

/* Giving funds */
const FUNDS = [
  { name: 'General Fund',       pct: 68, color: 'var(--c-violet,#7c3aed)', amount: '$11,603' },
  { name: 'Missions',           pct: 16, color: 'var(--gold,#e8a838)',      amount: '$2,918'  },
  { name: 'Building Fund',      pct: 10, color: 'var(--c-sky,#0ea5e9)',     amount: '$1,824'  },
  { name: 'Benevolence',        pct:  6, color: 'var(--c-emerald,#059669)', amount: '$1,094'  },
];

/* Recent transactions */
const GIFTS = [
  { name: 'Anonymous',       fund: 'General Fund',  amount: '$500',  method: 'Online', date: 'Apr 26' },
  { name: 'James & Ruth K.', fund: 'Missions',      amount: '$250',  method: 'ACH',    date: 'Apr 25' },
  { name: 'Maria Gonzalez',  fund: 'Building Fund', amount: '$200',  method: 'Check',  date: 'Apr 25' },
  { name: 'David Chen',      fund: 'General Fund',  amount: '$150',  method: 'Online', date: 'Apr 24' },
  { name: 'Sarah & Tom L.',  fund: 'Benevolence',   amount: '$100',  method: 'Online', date: 'Apr 24' },
  { name: 'Anonymous',       fund: 'General Fund',  amount: '$1,000',method: 'Cash',   date: 'Apr 23' },
  { name: 'Emma Thornton',   fund: 'Missions',      amount: '$75',   method: 'Online', date: 'Apr 23' },
];

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function methodBadge(m) {
  const bg = m === 'Online' ? 'rgba(124,58,237,0.12)' : m === 'ACH' ? 'rgba(5,150,105,0.12)' : 'rgba(113,113,122,0.12)';
  const c  = m === 'Online' ? 'var(--c-violet,#7c3aed)' : m === 'ACH' ? 'var(--c-emerald,#059669)' : '#52525b';
  return `<span class="gift-method-badge" style="background:${bg};color:${c}">${_e(m)}</span>`;
}

/* ── Render ───────────────────────────────────────────────────────────────── */
export function render() {
  return `
<section class="gift-view">
  ${pageHero({
    title: 'The Gift Drift',
    subtitle: 'Giving, stewardship, and generosity.',
    scripture: 'Every man according as he purposeth in his heart, so let him give. — 2 Corinthians 9:7',
  })}

  <!-- KPI strip -->
  <div class="gift-kpi-strip">
    ${KPI.map(k => `
    <div class="gift-kpi-card">
      <div class="gift-kpi-value">${_e(k.value)}</div>
      <div class="gift-kpi-label">${_e(k.label)}</div>
      <div class="gift-kpi-delta ${k.up ? 'gift-delta--up' : 'gift-delta--down'}">${_e(k.delta)} vs last period</div>
    </div>`).join('')}
  </div>

  <!-- Charts row -->
  <div class="gift-charts-row">

    <!-- Monthly trend -->
    <div class="gift-card">
      <div class="gift-card-header">
        <h3 class="gift-card-title">Monthly Giving Trend</h3>
        <span class="gift-forecast-note">May–Jun are projections</span>
      </div>
      <div class="gift-bar-chart">
        ${MONTHS.map(m => {
          const h = Math.round((m.amount / MAX_AMT) * 140);
          return `
          <div class="gift-bar-col">
            <div class="gift-bar-val">$${(m.amount/1000).toFixed(1)}k</div>
            <div class="gift-bar-wrap">
              <div class="gift-bar ${m.forecast ? 'gift-bar--forecast' : ''}" style="height:${h}px"></div>
            </div>
            <div class="gift-bar-label">${_e(m.label)}</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- Fund breakdown -->
    <div class="gift-card">
      <div class="gift-card-header">
        <h3 class="gift-card-title">This Month by Fund</h3>
        <span class="gift-card-sub">$18,240 total</span>
      </div>
      <div class="gift-funds">
        ${FUNDS.map(f => `
        <div class="gift-fund-row">
          <div class="gift-fund-head">
            <span class="gift-fund-dot" style="background:${f.color}"></span>
            <span class="gift-fund-name">${_e(f.name)}</span>
            <span class="gift-fund-pct">${f.pct}%</span>
            <span class="gift-fund-amount">${_e(f.amount)}</span>
          </div>
          <div class="gift-fund-bar-wrap">
            <div class="gift-fund-bar" style="width:${f.pct}%;background:${f.color}"></div>
          </div>
        </div>`).join('')}
      </div>
    </div>

  </div>

  <!-- Recent gifts -->
  <div class="gift-card">
    <div class="gift-card-header">
      <h3 class="gift-card-title">Recent Gifts</h3>
      <button class="btn btn-outline" style="font-size:.8rem;padding:6px 14px">Export CSV</button>
    </div>
    <div class="gift-transactions">
      ${GIFTS.map(g => `
      <div class="gift-tx-row">
        <div class="gift-tx-avatar">${_e(g.name === 'Anonymous' ? '🙏' : g.name.split(' ').map(w=>w[0]).slice(0,2).join(''))}</div>
        <div class="gift-tx-body">
          <div class="gift-tx-name">${_e(g.name)}</div>
          <div class="gift-tx-fund">${_e(g.fund)}</div>
        </div>
        ${methodBadge(g.method)}
        <div class="gift-tx-amount">${_e(g.amount)}</div>
        <div class="gift-tx-date">${_e(g.date)}</div>
      </div>`).join('')}
    </div>
  </div>

</section>`;
}

export function mount(root) {
  _loadGiving(root);
  return () => {};
}

function _rows(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.rows)) return res.rows;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

async function _loadGiving(root) {
  const V = window.TheVine;
  if (!V) return;

  const [summaryRes, listRes] = await Promise.allSettled([
    V.flock.giving.summary(),
    V.flock.giving.list({ limit: 20 }),
  ]);

  // ── KPI strip ───────────────────────────────────────────────────────────
  if (summaryRes.status === 'fulfilled' && summaryRes.value) {
    const s       = summaryRes.value;
    const monthly = s.monthlyTotal ?? s.thisMonth ?? s.total ?? 0;
    const ytd     = s.ytdTotal     ?? s.yearToDate ?? 0;
    const avg     = s.averageGift  ?? s.avgGift    ?? 0;
    const givers  = s.activeGivers ?? s.uniqueGivers ?? 0;

    const kpiEl = root.querySelector('.gift-kpi-strip');
    if (kpiEl) {
      const cards = kpiEl.querySelectorAll('.gift-kpi-card');
      const _set  = (i, v) => {
        const el = cards[i]?.querySelector('.gift-kpi-value');
        if (el && v) el.textContent = v;
      };
      if (monthly > 0) _set(0, `$${monthly.toLocaleString()}`);
      if (ytd     > 0) _set(1, `$${ytd.toLocaleString()}`);
      if (avg     > 0) _set(2, `$${Math.round(avg).toLocaleString()}`);
      if (givers  > 0) _set(3, String(givers));
    }

    // ── Bar chart from monthly breakdown ──────────────────────────────────
    const monthlyData = s.monthly || s.monthlyBreakdown || s.byMonth || [];
    if (Array.isArray(monthlyData) && monthlyData.length) {
      const maxA = Math.max(...monthlyData.map(m => m.amount || m.total || 0), 1);
      const barEl = root.querySelector('.gift-bar-chart');
      if (barEl) {
        barEl.innerHTML = monthlyData.map(m => {
          const amt  = m.amount || m.total || 0;
          const lbl  = m.label  || m.month || '';
          const h    = Math.round((amt / maxA) * 140);
          const isForecast = m.forecast === true;
          return `
            <div class="gift-bar-col">
              <div class="gift-bar-val">$${(amt / 1000).toFixed(1)}k</div>
              <div class="gift-bar-wrap">
                <div class="gift-bar${isForecast ? ' gift-bar--forecast' : ''}" style="height:${h}px"></div>
              </div>
              <div class="gift-bar-label">${_e(lbl)}</div>
            </div>`;
        }).join('');
      }
    }

    // ── Fund breakdown ─────────────────────────────────────────────────────
    const fundData = s.funds || s.byFund || s.fundBreakdown || [];
    if (Array.isArray(fundData) && fundData.length) {
      const fundsEl = root.querySelector('.gift-funds');
      if (fundsEl) {
        const total = fundData.reduce((sum, f) => sum + (f.amount || f.total || 0), 0) || 1;
        const FUND_COLORS = ['var(--c-violet,#7c3aed)','var(--gold,#e8a838)','var(--c-sky,#0ea5e9)','var(--c-emerald,#059669)','#db2777','#c05818'];
        fundsEl.innerHTML = fundData.map((f, i) => {
          const amt = f.amount || f.total || 0;
          const pct = Math.round((amt / total) * 100);
          const col = FUND_COLORS[i % FUND_COLORS.length];
          return `
            <div class="gift-fund-row">
              <div class="gift-fund-head">
                <span class="gift-fund-dot" style="background:${col}"></span>
                <span class="gift-fund-name">${_e(f.name || f.fund || `Fund ${i + 1}`)}</span>
                <span class="gift-fund-pct">${pct}%</span>
                <span class="gift-fund-amount">$${amt.toLocaleString()}</span>
              </div>
              <div class="gift-fund-bar-wrap">
                <div class="gift-fund-bar" style="width:${pct}%;background:${col}"></div>
              </div>
            </div>`;
        }).join('');
      }
    }
  }

  // ── Recent gifts table ──────────────────────────────────────────────────
  if (listRes.status === 'fulfilled') {
    const gifts = _rows(listRes.value);
    if (gifts.length) {
      const txEl = root.querySelector('.gift-transactions');
      if (txEl) {
        txEl.innerHTML = gifts.map(g => {
          const name   = g.name || g.displayName || g.giverName || 'Anonymous';
          const fund   = g.fund || g.fundName || g.designatedFund || 'General Fund';
          const raw    = g.amount || g.totalAmount || 0;
          const amt    = typeof raw === 'number' ? `$${raw.toLocaleString()}` : String(raw);
          const method = g.method || g.paymentMethod || g.type || 'Online';
          const dateMs = g.createdAt?.seconds
            ? g.createdAt.seconds * 1000
            : (g.giftDate || g.date ? new Date(g.giftDate || g.date).getTime() : 0);
          const date   = dateMs ? new Date(dateMs).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—';
          const initials = name === 'Anonymous' ? '🙏' : name.split(/\s+/).map(w => w[0] || '').slice(0, 2).join('');
          return `
            <div class="gift-tx-row">
              <div class="gift-tx-avatar">${initials}</div>
              <div class="gift-tx-body">
                <div class="gift-tx-name">${_e(name)}</div>
                <div class="gift-tx-fund">${_e(fund)}</div>
              </div>
              ${methodBadge(method)}
              <div class="gift-tx-amount">${_e(amt)}</div>
              <div class="gift-tx-date">${_e(date)}</div>
            </div>`;
        }).join('');
      }
    }
  }
}
