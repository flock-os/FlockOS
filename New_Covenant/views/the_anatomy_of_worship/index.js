/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: The Anatomy of Worship
   "Worship the LORD in the beauty of holiness. — Psalm 29:2"
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'the_anatomy_of_worship';
export const title = 'The Anatomy of Worship';

const _e = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* ── Service template ─────────────────────────────────────────────────────── */
const SERVICES = [
  { id: 'sunday', label: 'Sunday Morning', time: '10:00 AM', date: 'Apr 27, 2026' },
  { id: 'evening', label: 'Sunday Evening', time: '6:00 PM', date: 'Apr 27, 2026' },
  { id: 'midweek', label: 'Wednesday Night', time: '7:00 PM', date: 'Apr 29, 2026' },
];

const SEGMENT_TYPES = {
  prelude:    { icon: '🎵', color: '#7c3aed', label: 'Prelude'        },
  welcome:    { icon: '🙌', color: '#0ea5e9', label: 'Welcome'        },
  worship:    { icon: '🎶', color: '#e8a838', label: 'Worship Set'    },
  scripture:  { icon: '📖', color: '#059669', label: 'Scripture'      },
  sermon:     { icon: '🕊️', color: '#1b264f', label: 'Sermon'         },
  offering:   { icon: '🪙', color: '#e8a838', label: 'Offering'       },
  communion:  { icon: '🍞', color: '#dc2626', label: 'Communion'      },
  prayer:     { icon: '🙏', color: '#7c3aed', label: 'Prayer'         },
  dismiss:    { icon: '✝️', color: '#059669', label: 'Dismissal'      },
  responsive: { icon: '📣', color: '#0ea5e9', label: 'Responsive'     },
};

const SERVICE_ORDER = [
  { type: 'prelude',    title: 'Prelude Music',                 leader: 'Worship Team',    mins: 10, note: 'Instrumental — set a tone of reverence' },
  { type: 'welcome',    title: 'Welcome & Announcements',       leader: 'Pastor Greg',     mins: 5,  note: '' },
  { type: 'worship',    title: 'Opening Worship Set',           leader: 'Worship Team',    mins: 20, note: '"How Great Is Our God", "10,000 Reasons", "Great Are You Lord"' },
  { type: 'responsive', title: 'Call to Worship',               leader: 'Congregation',    mins: 3,  note: 'Psalm 100 — responsive reading' },
  { type: 'scripture',  title: 'Scripture Reading',             leader: 'Elder Thompson',  mins: 5,  note: 'John 15:1-17 — The Vine and the Branches' },
  { type: 'prayer',     title: 'Pastoral Prayer',               leader: 'Pastor Marcus',   mins: 5,  note: 'Intercession for congregation + community' },
  { type: 'sermon',     title: 'Sermon: Abide in the Vine',     leader: 'Pastor Greg',     mins: 40, note: 'Series: Kingdom Roots, Week 3' },
  { type: 'offering',   title: 'Tithes & Offerings',            leader: 'Deacon Board',    mins: 5,  note: 'Online giving available — tithes.flockos.app' },
  { type: 'communion',  title: 'Lord\'s Supper',                leader: 'Elder Board',     mins: 10, note: 'Open to all baptized believers' },
  { type: 'worship',    title: 'Closing Worship',               leader: 'Worship Team',    mins: 8,  note: '"Doxology", "Blessed Be Your Name"' },
  { type: 'dismiss',    title: 'Benediction & Dismissal',       leader: 'Pastor Greg',     mins: 2,  note: '' },
];

const totalMins = SERVICE_ORDER.reduce((a, s) => a + s.mins, 0);

/* ── Render ───────────────────────────────────────────────────────────────── */
export function render() {
  const segments = SERVICE_ORDER.map((seg, i) => {
    const def = SEGMENT_TYPES[seg.type];
    return `
    <div class="aow-segment" data-idx="${i}">
      <div class="aow-seg-grip">⠿</div>
      <div class="aow-seg-icon" style="background:${def.color}20;color:${def.color}">${def.icon}</div>
      <div class="aow-seg-body">
        <div class="aow-seg-title">${_e(seg.title)}</div>
        <div class="aow-seg-meta">
          <span class="aow-type-badge" style="background:${def.color}18;color:${def.color}">${_e(def.label)}</span>
          <span class="aow-seg-leader">👤 ${_e(seg.leader)}</span>
          ${seg.note ? `<span class="aow-seg-note">${_e(seg.note)}</span>` : ''}
        </div>
      </div>
      <div class="aow-seg-mins">
        <span class="aow-min-val">${seg.mins}</span>
        <span class="aow-min-unit">min</span>
      </div>
      <div class="aow-seg-actions">
        <button class="aow-btn-move" data-dir="up"   title="Move up">↑</button>
        <button class="aow-btn-move" data-dir="down" title="Move down">↓</button>
      </div>
    </div>`;
  }).join('');

  return `
<section class="aow-view">
  ${pageHero({
    title: 'The Anatomy of Worship',
    subtitle: 'Liturgical structure, service flow, and worship arts.',
    scripture: 'Worship the LORD in the beauty of holiness. — Psalm 29:2',
  })}

  <!-- Service selector + meta -->
  <div class="aow-header-row">
    <div class="aow-service-tabs">
      ${SERVICES.map((s, i) => `
      <button class="aow-service-tab ${i === 0 ? 'is-active' : ''}" data-svc="${_e(s.id)}">
        <span class="aow-tab-label">${_e(s.label)}</span>
        <span class="aow-tab-time">${_e(s.time)} · ${_e(s.date)}</span>
      </button>`).join('')}
    </div>
    <button class="btn btn-primary" style="font-size:.82rem;padding:8px 18px">+ Add Segment</button>
  </div>

  <!-- Time budget bar -->
  <div class="aow-budget-row">
    <div class="aow-budget-label">Service length: <strong>${totalMins} min</strong></div>
    <div class="aow-budget-track">
      ${SERVICE_ORDER.map(s => {
        const def = SEGMENT_TYPES[s.type];
        const w = ((s.mins / totalMins) * 100).toFixed(1);
        return `<div class="aow-budget-seg" style="width:${w}%;background:${def.color}" title="${def.label}: ${s.mins}min"></div>`;
      }).join('')}
    </div>
  </div>

  <!-- Segment list -->
  <div class="aow-segments" id="aow-list">
    ${segments}
  </div>

</section>`;
}

export function mount(root) {
  /* Move-up / move-down reordering */
  const list = root.querySelector('#aow-list');
  if (!list) return () => {};

  list.addEventListener('click', e => {
    const btn = e.target.closest('.aow-btn-move');
    if (!btn) return;
    const seg   = btn.closest('.aow-segment');
    const dir   = btn.dataset.dir;
    if (dir === 'up' && seg.previousElementSibling) {
      list.insertBefore(seg, seg.previousElementSibling);
    } else if (dir === 'down' && seg.nextElementSibling) {
      list.insertBefore(seg.nextElementSibling, seg);
    }
  });

  /* Service tab switching (visual only for now) */
  const tabs = root.querySelectorAll('.aow-service-tab');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('is-active'));
    tab.classList.add('is-active');
  }));

  return () => {};
}
