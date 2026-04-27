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
            <button class="pray-pray-btn" data-rid="demo">🙏 I Prayed (${r.prays})</button>
            <button class="pray-answer-btn" data-rid="demo">✅ Mark Answered</button>
          </div>
        </div>`).join('')}
      </div>

      <!-- Answered -->
      <div class="pray-section-label" style="margin-top:8px">Answered (${answered.length})</div>
      <div class="pray-list" id="pray-answered-list">
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
  function _applyFilter(f) {
    root.querySelectorAll('.pray-card').forEach(c => {
      c.style.display = (f === 'All' || c.dataset.type === f || (f === 'Urgent' && c.classList.contains('pray-card--urgent'))) ? '' : 'none';
    });
  }
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    _applyFilter(btn.dataset.filter);
  }));

  _wireInteractiveButtons(root);
  _loadPrayer(root, filters);

  // Add Request button
  root.querySelector('#pray-add-btn')?.addEventListener('click', () => _openAddRequestSheet(() => _loadPrayer(root, filters)));

  return () => { _closePraySheet(); };
}

function _wireInteractiveButtons(root) {
  /* "I Prayed" counter bump */
  root.querySelectorAll('.pray-pray-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = btn.textContent.match(/\((\d+)\)/);
      if (m) {
        const newCount = +m[1] + 1;
        btn.textContent = btn.textContent.replace(/\(\d+\)/, `(${newCount})`);
        const rid = btn.dataset.rid;
        if (rid && rid !== 'demo') {
          window.TheVine?.flock?.prayer?.update({ id: rid, prayCount: newCount }).catch(() => {});
        }
      }
    });
  });

  /* Mark answered — remove card with live update */
  root.querySelectorAll('.pray-answer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.pray-card');
      const rid  = btn.dataset.rid;
      if (rid && rid !== 'demo') {
        window.TheVine?.flock?.prayer?.update({ id: rid, status: 'Answered' }).catch(() => {});
      }
      card.style.transition = 'opacity 300ms, transform 300ms';
      card.style.opacity = '0';
      card.style.transform = 'translateX(20px)';
      setTimeout(() => card.remove(), 320);
    });
  });
}

const _CLOSED_PRAY = new Set(['answered', 'closed', 'archived', 'deleted']);

function _normalizeCategory(raw) {
  const s = (raw || '').toLowerCase().replace(/[-_\s]/g, '');
  if (s.includes('praise') || s.includes('thanksgiving') || s.includes('gratitude')) return 'Praise';
  if (s.includes('urgent') || s.includes('crisis') || s.includes('emergency'))       return 'Urgent';
  if (s.includes('personal') || s.includes('family') || s.includes('marriage')
    || s.includes('health') || s.includes('job') || s.includes('financial'))         return 'Personal';
  return 'Intercession'; // default — church, missions, spiritual, general
}

function _liveCard(r, isAnswered) {
  const id    = r.id || r.requestId || 'demo';
  const type  = _normalizeCategory(r.category || r.type || '');
  const name  = r.submitterName  || r.name || 'Anonymous';
  const text  = r.prayerText     || r.text || r.description || '';
  const date  = _fmtDate(r.submittedAt || r.createdAt);
  const prays = Number(r.prayCount || r.prayerCount || 0);
  const urgent = type === 'Urgent' || (r.priority || '').toLowerCase() === 'urgent';
  const conf  = r.isConfidential === true || String(r.isConfidential || '').toUpperCase() === 'TRUE';

  const cardHtml = `
    <div class="pray-card${urgent ? ' pray-card--urgent' : ''}${isAnswered ? ' pray-card--answered' : ''}" data-type="${_e(type)}">
      <div class="pray-card-head">
        ${typeBadge(type)}
        ${urgent ? '<span class="pray-urgent-badge">Urgent</span>' : ''}
        ${isAnswered ? '<span class="pray-answered-badge">Answered ✅</span>' : ''}
        <span class="pray-card-date">${_e(date)}</span>
        ${conf ? '<span class="pray-conf-icon" title="Confidential">🔒</span>' : ''}
      </div>
      <div class="pray-card-name">${_e(name)}</div>
      <div class="pray-card-text">${_e(text)}</div>
      ${isAnswered
        ? `<div class="pray-card-prays" style="font:.72rem var(--font-ui);color:var(--ink-muted,#7a7f96);margin-top:4px">${prays || ''} ${prays ? 'people prayed' : ''}</div>`
        : `<div class="pray-card-foot">
             <button class="pray-pray-btn" data-rid="${_e(String(id))}">🙏 I Prayed (${prays})</button>
             <button class="pray-answer-btn" data-rid="${_e(String(id))}">✅ Mark Answered</button>
           </div>`}
    </div>`;
  return cardHtml;
}

function _fmtDate(ts) {
  if (!ts) return '';
  try {
    const ms = ts?.seconds ? ts.seconds * 1000 : new Date(ts).getTime();
    if (!ms || isNaN(ms)) return '';
    return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (_) { return ''; }
}

async function _loadPrayer(root, filterBtns) {
  const V  = window.TheVine;
  const UR = window.UpperRoom;

  // Loading state
  const activeList   = root.querySelector('#pray-active-list');
  const answeredList = root.querySelector('#pray-answered-list');
  if (activeList)   activeList.innerHTML   = '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Loading prayer requests…</div>';
  if (answeredList) answeredList.innerHTML = '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Loading…</div>';

  try {
    let all = [];
    // UpperRoom (Firestore prayers) is authoritative
    if (UR && typeof UR.listPrayers === 'function') {
      try {
        const r = await UR.listPrayers({ allUsers: true, limit: 100 });
        all = Array.isArray(r) ? r : (r?.rows ?? r?.data ?? []);
      } catch (_) {}
    }
    // Fallback to TheVine GAS
    if (!all.length && V) {
      try {
        const res = await V.flock.prayer.list({ limit: 50 });
        all = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? []);
      } catch (_) {}
    }

    const active   = all.filter(r => !_CLOSED_PRAY.has((r.status || 'new').toLowerCase()));
    const answered = all.filter(r => (r.status || '').toLowerCase() === 'answered');

    // Update stats strip with live counts
    const urgentN  = active.filter(r => _normalizeCategory(r.category || '') === 'Urgent').length;
    const answeredN = answered.length;
    const prayingN  = active.reduce((n, r) => n + Number(r.prayCount || 0), 0);
    const _setStat = (idx, val) => {
      const cards = root.querySelectorAll('.pray-stat-card');
      const el    = cards[idx]?.querySelector('.pray-stat-val');
      if (el) el.textContent = String(val);
    };
    _setStat(0, active.length);
    _setStat(1, answeredN);
    _setStat(2, prayingN || active.length);

    // Replace active list
    const activeList = root.querySelector('#pray-active-list');
    if (activeList) {
      const lbl = activeList.previousElementSibling;
      if (lbl && lbl.classList.contains('pray-section-label')) lbl.textContent = `Active (${active.length})`;
      activeList.innerHTML = active.length
        ? active.map(r => _liveCard(r, false)).join('')
        : `<div class="pray-empty">No active prayer requests right now.</div>`;
    }

    // Replace answered list
    const answeredList = root.querySelector('#pray-answered-list');
    if (answeredList) {
      const lbl = answeredList.previousElementSibling;
      if (lbl && lbl.classList.contains('pray-section-label')) lbl.textContent = `Answered (${answered.length})`;
      answeredList.innerHTML = answered.length
        ? answered.map(r => _liveCard(r, true)).join('')
        : `<div class="pray-empty">No answered prayers recorded yet.</div>`;
    }

    // Re-wire interactive buttons with live rids
    _wireInteractiveButtons(root);

    // Re-apply active filter
    const activeFilter = root.querySelector('.pray-filter.is-active');
    if (activeFilter) {
      root.querySelectorAll('.pray-card').forEach(c => {
        const f = activeFilter.dataset.filter;
        c.style.display = (f === 'All' || c.dataset.type === f || (f === 'Urgent' && c.classList.contains('pray-card--urgent'))) ? '' : 'none';
      });
    }
  } catch (err) {
    console.warn('[PrayerfulAction] prayer.list failed, showing demo data:', err);
  }
}

// ── Add Prayer Request sheet ─────────────────────────────────────────────────
let _activePraySheet = null;

function _closePraySheet() {
  if (!_activePraySheet) return;
  const t = _activePraySheet;
  t.querySelector('.life-sheet-overlay')?.classList.remove('is-open');
  t.querySelector('.life-sheet-panel')?.classList.remove('is-open');
  setTimeout(() => { t.remove(); if (_activePraySheet === t) _activePraySheet = null; }, 320);
}

function _openAddRequestSheet(onReload) {
  _closePraySheet();
  const V = window.TheVine;
  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  sheet.innerHTML = /* html */`
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel" role="dialog" aria-label="New Prayer Request">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div class="life-sheet-hd-info">
          <div class="life-sheet-hd-name">New Prayer Request</div>
          <div class="life-sheet-hd-meta">Submit a request to the church prayer team</div>
        </div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">
        <div class="life-sheet-field">
          <div class="life-sheet-label">Name <span style="color:#6b7280;font-weight:400">(or leave blank for anonymous)</span></div>
          <input class="life-sheet-input" data-field="name" type="text" placeholder="Your name">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Prayer Request <span style="color:#dc2626">*</span></div>
          <textarea class="life-sheet-input" data-field="prayerText" rows="4" style="resize:vertical" placeholder="Share your prayer request…"></textarea>
        </div>
        <div class="fold-form-row">
          <div class="life-sheet-field">
            <div class="life-sheet-label">Category</div>
            <select class="life-sheet-input" data-field="category">
              <option value="Intercession">Intercession</option>
              <option value="Praise">Praise &amp; Thanksgiving</option>
              <option value="Personal">Personal</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div class="life-sheet-field">
            <div class="life-sheet-label">Priority</div>
            <select class="life-sheet-input" data-field="priority">
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div class="life-sheet-field" style="display:flex;align-items:center;gap:10px;margin-top:4px">
          <input type="checkbox" id="pray-conf-chk" data-field="isConfidential" style="width:16px;height:16px;cursor:pointer">
          <label for="pray-conf-chk" style="font:.88rem var(--font-ui);cursor:pointer">🔒 Keep confidential (prayer team only)</label>
        </div>
        <div class="fold-form-error" data-error style="display:none;color:#dc2626;font-size:.85rem;margin-top:8px"></div>
      </div>
      <div class="life-sheet-foot">
        <button class="flock-btn" data-cancel>Cancel</button>
        <button class="flock-btn flock-btn--primary" data-save>Submit Request</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  _activePraySheet = sheet;
  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
    sheet.querySelector('[data-field="prayerText"]')?.focus();
  });

  const close = () => _closePraySheet();
  sheet.querySelector('[data-cancel]').addEventListener('click', close);
  sheet.querySelector('.life-sheet-close').addEventListener('click', close);
  sheet.querySelector('.life-sheet-overlay').addEventListener('click', close);

  sheet.querySelector('[data-save]').addEventListener('click', async () => {
    const errEl    = sheet.querySelector('[data-error]');
    const textVal  = sheet.querySelector('[data-field="prayerText"]').value.trim();
    if (!textVal) { errEl.textContent = 'Please enter a prayer request.'; errEl.style.display = ''; return; }
    errEl.style.display = 'none';
    const btn = sheet.querySelector('[data-save]');
    btn.disabled = true; btn.textContent = 'Submitting…';
    const payload = {
      submitterName:   sheet.querySelector('[data-field="name"]').value.trim() || 'Anonymous',
      prayerText:      textVal,
      category:        sheet.querySelector('[data-field="category"]').value,
      priority:        sheet.querySelector('[data-field="priority"]').value,
      isConfidential:  sheet.querySelector('[data-field="isConfidential"]').checked,
      status:          'New',
    };
    try {
      if (V) { await V.flock.prayer.create(payload); }
      _closePraySheet();
      onReload?.();
    } catch (err) {
      console.error('[PrayerfulAction] prayer.create error:', err);
      errEl.textContent = err?.message || 'Could not submit request. Please try again.';
      errEl.style.display = '';
      btn.disabled = false; btn.textContent = 'Submit Request';
    }
  });
}
