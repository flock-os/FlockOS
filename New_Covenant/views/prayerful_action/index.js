/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: Prayerful Action
   "Pray without ceasing. — 1 Thessalonians 5:17"
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'prayerful_action';
export const title = 'Prayerful Action';

const _e = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* ── Demo data ────────────────────────────────────────────────────────────── */
const STATS = [
  { label: 'Active Requests', value: '24', icon: '🙏' },
  { label: 'Answered',        value: '89', icon: '✅' },
  { label: 'Praying Today',   value: '12', icon: '👥' },
  { label: 'Days This Streak',value: '7',  icon: '🔥' },
];

const FILTERS = ['All', 'Intercession', 'Praise', 'Personal', 'Urgent'];

const REQUESTS = [
  { id: 1, type: 'Intercession', name: 'Margaret & Bill F.', request: 'Recovery from surgery — Lord, bring complete healing and peace to their home.', status: 'Active',   date: 'Apr 26', urgent: true,  prays: 8  },
  { id: 2, type: 'Praise',       name: 'The Chen Family',   request: 'Baby girl born healthy! Praising God for His gift of new life.', status: 'Active',   date: 'Apr 25', urgent: false, prays: 14 },
  { id: 3, type: 'Intercession', name: 'Robert Simmons',    request: 'Job search after layoff — believing God is opening a door.', status: 'Active',   date: 'Apr 24', urgent: false, prays: 5  },
  { id: 4, type: 'Personal',     name: 'Anonymous',         request: 'Wisdom for a difficult family decision. Need the Lord\'s clear direction.', status: 'Active',   date: 'Apr 23', urgent: false, prays: 3  },
  { id: 5, type: 'Intercession', name: 'Grace Thompson',    request: 'Stage 2 diagnosis — standing on His promises. Claiming Isaiah 53:5.', status: 'Active',   date: 'Apr 22', urgent: true,  prays: 22 },
  { id: 6, type: 'Intercession', name: 'Youth Ministry',    request: 'Upcoming summer camp — protection, salvations, spiritual breakthrough.', status: 'Active',   date: 'Apr 21', urgent: false, prays: 11 },
  { id: 7, type: 'Praise',       name: 'Pastor Marcus',     request: 'Marriage restored after counseling — God\'s faithfulness is real!', status: 'Answered', date: 'Apr 10', urgent: false, prays: 19 },
  { id: 8, type: 'Personal',     name: 'David Okafor',      request: 'Prodigal son came home last Sunday — grace upon grace.', status: 'Answered', date: 'Apr 5',  urgent: false, prays: 31 },
];

const LITURGY = [
  { time: 'Dawn',      label: 'Morning Watch',    text: '"O LORD, in the morning you hear my voice." — Psalm 5:3',    icon: '🌅' },
  { time: '12:00 PM',  label: 'Midday Pause',     text: '"Seven times a day I praise you." — Psalm 119:164',          icon: '☀️' },
  { time: '3:00 PM',   label: 'Hour of Prayer',   text: '"Now Peter and John went up together into the temple at the hour of prayer." — Acts 3:1', icon: '⛪' },
  { time: 'Evening',   label: 'Evening Vespers',  text: '"Let my prayer be set forth before thee as incense." — Psalm 141:2', icon: '🌙' },
];

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function typeBadge(t) {
  const m = { Intercession: ['rgba(124,58,237,0.12)','#7c3aed'], Praise: ['rgba(232,168,56,0.14)','#b45309'], Personal: ['rgba(14,165,233,0.12)','#0369a1'], Urgent: ['rgba(220,38,38,0.12)','#dc2626'] };
  const [bg, c] = m[t] || ['rgba(113,113,122,0.1)','#52525b'];
  return `<span class="pray-type-badge" style="background:${bg};color:${c}">${_e(t)}</span>`;
}

/* ── Render ───────────────────────────────────────────────────────────────── */
export function render() {
  const active   = REQUESTS.filter(r => r.status === 'Active');
  const answered = REQUESTS.filter(r => r.status === 'Answered');

  return `
<section class="pray-view">
  ${pageHero({
    title: 'Prayerful Action',
    subtitle: 'Prayer journal — requests, answers, and daily liturgy.',
    scripture: 'Pray without ceasing. — 1 Thessalonians 5:17',
  })}

  <!-- Stats -->
  <div class="pray-stats">
    ${STATS.map(s => `
    <div class="pray-stat-card">
      <div class="pray-stat-icon">${s.icon}</div>
      <div class="pray-stat-val">${_e(s.value)}</div>
      <div class="pray-stat-label">${_e(s.label)}</div>
    </div>`).join('')}
  </div>

  <!-- Main columns -->
  <div class="pray-columns">

    <!-- Left: prayer journal -->
    <div class="pray-journal">

      <!-- Toolbar -->
      <div class="pray-toolbar">
        <div class="pray-filters">
          ${FILTERS.map((f, i) => `<button class="pray-filter ${i === 0 ? 'is-active' : ''}" data-filter="${_e(f)}">${_e(f)}</button>`).join('')}
        </div>
        <button class="btn btn-primary" style="font-size:.8rem;padding:7px 16px" id="pray-add-btn">+ Add Request</button>
      </div>

      <!-- Active requests -->
      <div class="pray-section-label">Active (${active.length})</div>
      <div class="pray-list" id="pray-active-list">
        ${active.map(r => `
        <div class="pray-card ${r.urgent ? 'pray-card--urgent' : ''}" data-type="${_e(r.type)}">
          <div class="pray-card-head">
            ${typeBadge(r.type)}
            ${r.urgent ? '<span class="pray-urgent-badge">Urgent</span>' : ''}
            <span class="pray-card-date">${_e(r.date)}</span>
          </div>
          <div class="pray-card-name">${_e(r.name)}</div>
          <div class="pray-card-text">${_e(r.request)}</div>
          <div class="pray-card-foot">
            <button class="pray-pray-btn" data-id="${r.id}">🙏 I Prayed (${r.prays})</button>
            <button class="pray-answer-btn" data-id="${r.id}">✅ Mark Answered</button>
          </div>
        </div>`).join('')}
      </div>

      <!-- Answered -->
      <div class="pray-section-label" style="margin-top:8px">Answered (${answered.length})</div>
      <div class="pray-list">
        ${answered.map(r => `
        <div class="pray-card pray-card--answered" data-type="${_e(r.type)}">
          <div class="pray-card-head">
            ${typeBadge(r.type)}
            <span class="pray-answered-badge">Answered ✅</span>
            <span class="pray-card-date">${_e(r.date)}</span>
          </div>
          <div class="pray-card-name">${_e(r.name)}</div>
          <div class="pray-card-text">${_e(r.request)}</div>
          <div class="pray-card-prays" style="font:.72rem var(--font-ui);color:var(--ink-muted,#7a7f96);margin-top:4px">${r.prays} people prayed</div>
        </div>`).join('')}
      </div>

    </div>

    <!-- Right: daily liturgy -->
    <div class="pray-liturgy-col">
      <div class="pray-liturgy-card">
        <div class="pray-liturgy-title">Daily Prayer Hours</div>
        <div class="pray-liturgy-verse">"Evening, morning and noon I cry out in distress, and he hears my voice." — Psalm 55:17</div>
        <div class="pray-liturgy-list">
          ${LITURGY.map(l => `
          <div class="pray-liturgy-row">
            <div class="pray-lit-icon">${l.icon}</div>
            <div class="pray-lit-body">
              <div class="pray-lit-time">${_e(l.time)} — ${_e(l.label)}</div>
              <div class="pray-lit-text">${_e(l.text)}</div>
            </div>
          </div>`).join('')}
        </div>
        <button class="btn btn-outline" style="width:100%;margin-top:16px;font-size:.82rem">Begin Morning Watch</button>
      </div>

      <!-- Scripture of the day -->
      <div class="pray-scripture-card">
        <div class="pray-scripture-label">Scripture of the Day</div>
        <div class="pray-scripture-ref">Philippians 4:6</div>
        <div class="pray-scripture-text">"Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God."</div>
      </div>
    </div>

  </div>

</section>`;
}

export function mount(root) {
  /* Filter chips */
  const filters = root.querySelectorAll('.pray-filter');
  const cards   = root.querySelectorAll('.pray-card');
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const f = btn.dataset.filter;
    cards.forEach(c => {
      c.style.display = (f === 'All' || c.dataset.type === f || (f === 'Urgent' && c.classList.contains('pray-card--urgent'))) ? '' : 'none';
    });
  }));

  /* "I Prayed" counter bump */
  root.querySelectorAll('.pray-pray-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = btn.textContent.match(/\((\d+)\)/);
      if (m) btn.textContent = btn.textContent.replace(/\(\d+\)/, `(${+m[1]+1})`);
    });
  });

  /* Mark answered — remove card */
  root.querySelectorAll('.pray-answer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.pray-card');
      card.style.transition = 'opacity 300ms, transform 300ms';
      card.style.opacity = '0';
      card.style.transform = 'translateX(20px)';
      setTimeout(() => card.remove(), 320);
    });
  });

  return () => {};
}
