/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE LIFE — Pastoral Care
   "Shepherd the flock of God that is among you." — 1 Peter 5:2
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'the_life';
export const title = 'Pastoral Care';

const PRIORITY = {
  urgent: { label: 'Urgent',  color: '#dc2626', bg: 'rgba(220,38,38,0.10)' },
  high:   { label: 'High',    color: '#e8a838', bg: 'rgba(232,168,56,0.13)' },
  normal: { label: 'Normal',  color: '#0ea5e9', bg: 'rgba(14,165,233,0.10)' },
};

const CARE_TYPES = {
  prayer:     { icon: '🙏', label: 'Prayer Request' },
  visit:      { icon: '🏥', label: 'Hospital Visit'  },
  followup:   { icon: '📞', label: 'Follow-up Call'  },
  grief:      { icon: '🕊️', label: 'Grief Support'   },
  counseling: { icon: '💬', label: 'Counseling'       },
  welcome:    { icon: '👋', label: 'New Visitor'      },
  milestone:  { icon: '🎉', label: 'Life Milestone'   },
};

const STATUSES = ['Open', 'In Progress', 'Follow-Up', 'Referred'];

export function render() {
  return /* html */`
    <section class="life-view">
      ${pageHero({
        title:    'Pastoral Care',
        subtitle: 'Follow-ups, prayer requests, visits, and life moments — nobody falls through the cracks.',
        scripture: 'Shepherd the flock of God that is among you. — 1 Peter 5:2',
      })}

      <!-- Quick stats -->
      <div class="life-stats">
        <div class="life-stat-card life-stat--urgent">
          <div class="life-stat-n">—</div>
          <div class="life-stat-label">Urgent</div>
        </div>
        <div class="life-stat-card life-stat--high">
          <div class="life-stat-n">—</div>
          <div class="life-stat-label">High Priority</div>
        </div>
        <div class="life-stat-card life-stat--normal">
          <div class="life-stat-n">—</div>
          <div class="life-stat-label">Normal</div>
        </div>
        <div class="life-stat-card life-stat--total">
          <div class="life-stat-n">—</div>
          <div class="life-stat-label">Total Open</div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="life-toolbar">
        <div class="fold-filters">
          <button class="fold-filter is-active" data-life-filter="all">All</button>
          <button class="fold-filter" data-life-filter="urgent">Urgent</button>
          <button class="fold-filter" data-life-filter="prayer">Prayer</button>
          <button class="fold-filter" data-life-filter="visit">Visits</button>
          <button class="fold-filter" data-life-filter="followup">Follow-ups</button>
        </div>
        <button class="flock-btn flock-btn--primary" data-care-new style="margin-left:auto;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          New Care Item
        </button>
      </div>

      <!-- Queue -->
      <div class="life-queue" data-bind="queue">
        <div class="life-loading">Loading care queue…</div>
      </div>
    </section>
  `;
}

export function mount(root) {
  let _memberDir = [];
  const _caseMap = {};

  function _wireFilters() {
    root.querySelectorAll('[data-life-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('[data-life-filter]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const f = btn.dataset.lifeFilter;
        root.querySelectorAll('.life-card').forEach((card) => {
          const show = f === 'all' || card.dataset.type === f || card.dataset.priority === f;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  function _wireCards() {
    root.querySelectorAll('.life-card').forEach((card) => {
      const cid = card.dataset.cid;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.life-card-actions')) return;
        const c = cid && _caseMap[cid];
        if (c) _openSheet(c, _memberDir, _reload);
      });

      const resolveBtn = card.querySelector('[data-care-complete]');
      if (resolveBtn) {
        resolveBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await _resolveCase(cid, card, root);
        });
      }

      const noteBtn = card.querySelector('[data-care-note]');
      if (noteBtn) {
        noteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const c = cid && _caseMap[cid];
          const personName = c ? (_resolveName(c.memberId, _memberDir) || c.memberName || c.name || '') : '';
          _quickNote(cid, personName);
        });
      }
    });
  }

  function _wireNewBtn() {
    const btn = root.querySelector('[data-care-new]');
    if (!btn) return;
    const fresh = btn.cloneNode(true);
    btn.replaceWith(fresh);
    fresh.addEventListener('click', () => _newCareModal(_memberDir, _reload));
  }

  async function _reload() {
    const result = await _loadCare(root, _caseMap);
    if (result) _memberDir = result.memberDir;
    _wireCards();
    _wireFilters();
    _wireNewBtn();
  }

  _wireFilters();
  _wireNewBtn();
  _reload();

  return () => { _closeSheet(); };
}

const _TERMINAL = new Set(['resolved','closed','archived','cancelled','denied','completed','answered','inactive','deleted']);

async function _loadCare(root, caseMap) {
  const V = window.TheVine;
  if (!V) return null;
  const queue = root.querySelector('[data-bind="queue"]');
  if (!queue) return null;
  queue.innerHTML = '<div class="life-loading">Loading care queue…</div>';
  try {
    const [careRes, membersRes] = await Promise.all([
      V.flock.care.list({}),
      V.flock.members.list({ limit: 500 }).catch(() => []),
    ]);
    const memberDir = _rows(membersRes);
    const all  = _rows(careRes);
    const rows = all.filter(r => !_TERMINAL.has((r.status || r.Status || '').toLowerCase()));
    // Populate caseMap
    Object.keys(caseMap).forEach(k => delete caseMap[k]);
    rows.forEach(c => { caseMap[String(c.id || c.caseId || '')] = c; });
    if (!rows.length) {
      queue.innerHTML = '<div class="life-loading">No active care cases. Quiet is good.</div>';
      _updateStats(root, []);
      return { rows: [], memberDir };
    }
    queue.innerHTML = rows.map(c => _liveCareCard(c, memberDir)).join('');
    _updateStats(root, rows);
    return { rows, memberDir };
  } catch (err) {
    console.error('[TheLife] care.list error:', err);
    queue.innerHTML = '<div class="life-loading">Could not load care queue right now.</div>';
    return null;
  }
}

function _rows(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.rows)) return res.rows;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

function _updateStats(root, rows) {
  const urgent = rows.filter(r => (r.priority || '').toLowerCase() === 'urgent').length;
  const high   = rows.filter(r => (r.priority || '').toLowerCase() === 'high').length;
  const normal = rows.filter(r => { const p = (r.priority || 'normal').toLowerCase(); return p !== 'urgent' && p !== 'high'; }).length;
  const set = (sel, val) => { const el = root.querySelector(sel); if (el) el.textContent = val; };
  set('.life-stat--urgent .life-stat-n', urgent);
  set('.life-stat--high .life-stat-n',   high);
  set('.life-stat--normal .life-stat-n', normal);
  set('.life-stat--total .life-stat-n',  rows.length);
}

function _normalizeType(rawType) {
  return rawType.replace(/[-\s]/g, '')
    .replace('followupcall', 'followup')
    .replace('hospitalvisit', 'visit')
    .replace('prayerrequest', 'prayer')
    .replace('lifemilestone', 'milestone')
    .replace('newvisitor', 'welcome');
}

// Resolve a memberId/email to a display name from the member directory
function _resolveName(idOrEmail, memberDir) {
  if (!idOrEmail) return '';
  const key = String(idOrEmail).toLowerCase();
  for (const m of memberDir) {
    if ((m.email && m.email.toLowerCase() === key)
      || (m.primaryEmail && m.primaryEmail.toLowerCase() === key)
      || m.id === idOrEmail || m.memberNumber === idOrEmail || m.memberPin === idOrEmail) {
      return (m.preferredName || ((m.firstName || '') + ' ' + (m.lastName || '')).trim() || m.displayName || idOrEmail);
    }
  }
  return idOrEmail.includes(' ') ? idOrEmail : '';
}

function _liveCareCard(c, memberDir) {
  memberDir = memberDir || [];
  const priority = (c.priority || 'Normal').toLowerCase();
  // GAS uses 'careType'; fall back to 'type' for older records
  const rawType  = (c.careType || c.type || c.caseType || 'followup').toLowerCase();
  const type     = _normalizeType(rawType);
  // Name: first try direct name fields, then resolve memberId from directory
  const name     = c.memberName
                || c.name
                || _resolveName(c.memberId, memberDir)
                || c.memberId
                || 'Unknown';
  // Assigned: primaryCaregiverId is the canonical field; assignedTo is a fallback
  const assigneeRaw = c.primaryCaregiverId || c.assignedTo || c.assignedName || c.assignee || '';
  const assignee = _resolveName(assigneeRaw, memberDir) || assigneeRaw || 'Unassigned';
  const note     = c.summary || c.description || c.notes || c.note || '';
  const p        = PRIORITY[priority]  || PRIORITY.normal;
  const t        = CARE_TYPES[type]    || CARE_TYPES[rawType] || { icon: '🫱', label: c.careType || c.type || type };
  const unassigned = !assigneeRaw || assignee === 'Unassigned';
  const ts       = c.updatedAt || c.createdAt;
  const daysStr  = ts ? _daysAgo(ts) : '';
  const cid      = _e(String(c.id || c.caseId || ''));

  return /* html */`
    <article class="life-card" data-cid="${cid}" data-type="${_e(type)}" data-priority="${_e(priority)}" tabindex="0">
      <div class="life-card-icon">${t.icon}</div>
      <div class="life-card-body">
        <div class="life-card-top">
          <span class="life-card-name">${_e(name)}</span>
          <span class="life-priority-badge" style="color:${p.color}; background:${p.bg}">${p.label}</span>
          <span class="life-type-badge">${t.label}</span>
        </div>
        <div class="life-card-note">${_e(note)}</div>
        <div class="life-card-foot">
          <span class="life-assignee${unassigned ? ' life-assignee--empty' : ''}">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            ${_e(assignee)}
          </span>
          ${daysStr ? `<span class="life-days">${daysStr}</span>` : ''}
        </div>
      </div>
      <div class="life-card-actions">
        <button class="life-action-btn" title="Mark complete" data-care-complete="${cid}" aria-label="Complete">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
        <button class="life-action-btn" title="Add note" data-care-note="${cid}" aria-label="Note">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
        </button>
      </div>
    </article>`;
}

function _daysAgo(ts) {
  const delta = Math.floor((Date.now() - new Date(ts).getTime()) / 86_400_000);
  if (delta <= 0) return 'Today';
  if (delta === 1) return 'Yesterday';
  return `${delta}d ago`;
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ── Resolve a case ────────────────────────────────────────────────────────────
async function _resolveCase(cid, card, root) {
  const V = window.TheVine;
  if (!V || !cid) return;
  try {
    await V.flock.care.resolve({ id: cid });
  } catch {
    try { await V.flock.care.update({ id: cid, status: 'Resolved' }); } catch (err) {
      console.error('[TheLife] resolve error:', err);
      return;
    }
  }
  card.style.transition = 'opacity 300ms, transform 300ms';
  card.style.opacity = '0';
  card.style.transform = 'scale(0.96)';
  setTimeout(() => { card.remove(); _decrementTotal(root); }, 320);
}

function _decrementTotal(root) {
  if (!root) return;
  const el = root.querySelector('.life-stat--total .life-stat-n');
  if (el) el.textContent = Math.max(0, parseInt(el.textContent || '0', 10) - 1);
}

// ── Detail sheet ─────────────────────────────────────────────────────────────
let _activeSheet = null;

function _openSheet(c, memberDir, onSave) {
  _closeSheet();
  const V = window.TheVine;
  const cid = String(c.id || c.caseId || '');
  const name = c.memberName || c.name || _resolveName(c.memberId, memberDir) || c.memberId || 'Unknown';
  const assigneeRaw   = c.primaryCaregiverId   || c.assignedTo || c.assignedName || '';
  const secondaryRaw  = c.secondaryCaregiverId || c.secondaryCaregiver || '';
  const currentStatus = c.status || 'Open';
  const hasMemberDir  = memberDir && memberDir.length > 0;

  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  sheet.innerHTML = /* html */`
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel" role="dialog" aria-label="Care Case - ${_e(name)}">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div class="life-sheet-hd-info">
          <div class="life-sheet-hd-name">${_e(name)}</div>
          <div class="life-sheet-hd-meta">${_e(c.careType || c.type || '')} &bull; ${_e(currentStatus)}</div>
        </div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">
        <!-- Status pills -->
        <div class="life-sheet-field">
          <div class="life-sheet-label">Status</div>
          <div class="life-status-row">
            ${STATUSES.map(s => `<button class="life-status-pill${s === currentStatus ? ' is-active' : ''}" data-status="${_e(s)}">${_e(s)}</button>`).join('')}
          </div>
        </div>
        <!-- Primary Caregiver -->
        <div class="life-sheet-field">
          <div class="life-sheet-label">Assigned To</div>
          ${hasMemberDir
            ? _caregiverSelect(memberDir, 'assignee', assigneeRaw, '— Unassigned —', true)
            : `<input class="life-sheet-input" data-field="assignee" type="text" value="${_e(_resolveName(assigneeRaw, memberDir) || assigneeRaw)}" placeholder="Caregiver name or email">`}
        </div>
        <!-- Secondary Caregiver -->
        <div class="life-sheet-field">
          <div class="life-sheet-label">
            Secondary Caregiver
            <span class="life-field-hint">Also has access to view this case</span>
          </div>
          ${hasMemberDir
            ? _caregiverSelect(memberDir, 'secondary', secondaryRaw, '— None —', true)
            : `<input class="life-sheet-input" data-field="secondary" type="text" value="${_e(_resolveName(secondaryRaw, memberDir) || secondaryRaw)}" placeholder="Secondary caregiver (optional)">`}
        </div>
        <!-- Summary -->
        <div class="life-sheet-field">
          <div class="life-sheet-label">Summary / Notes</div>
          <textarea class="life-sheet-ta" data-field="summary" rows="3" placeholder="What's happening?">${_e(c.summary || c.description || '')}</textarea>
        </div>
        <!-- Interactions -->
        <div class="life-sheet-field">
          <div class="life-sheet-label">Interactions</div>
          <div class="life-ix-list" data-ix><div class="life-ix-empty">Loading…</div></div>
          <div class="life-note-form">
            <textarea class="life-note-ta" rows="2" placeholder="Add a note…"></textarea>
            <button class="flock-btn flock-btn--sm" data-add-note>Add Note</button>
          </div>
        </div>
      </div>
      <div class="life-sheet-foot">
        <button class="flock-btn life-resolve-btn" data-resolve>Resolve Case</button>
        <button class="flock-btn flock-btn--primary" data-save>Save Changes</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  _activeSheet = sheet;

  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
  });

  // Load interactions
  if (V && cid) {
    V.flock.care.interactions.list({ caseId: cid }).then((res) => {
      const ix = sheet.querySelector('[data-ix]');
      if (!ix) return;
      const items = _rows(res);
      if (!items.length) { ix.innerHTML = '<div class="life-ix-empty">No interactions yet.</div>'; return; }
      ix.innerHTML = items.slice().reverse().map(i => {
        const ts = i.createdAt ? new Date(i.createdAt).toLocaleString() : '';
        return `<div class="life-ix-item"><div class="life-ix-note">${_e(i.note || i.content || i.body || '')}</div><div class="life-ix-meta">${_e(i.author || i.authorName || '')}${ts ? ' &bull; ' + _e(ts) : ''}</div></div>`;
      }).join('');
    }).catch(() => {
      const ix = sheet.querySelector('[data-ix]');
      if (ix) ix.innerHTML = '<div class="life-ix-empty">Could not load interactions.</div>';
    });
  }

  // Status pill wiring
  sheet.querySelectorAll('.life-status-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      sheet.querySelectorAll('.life-status-pill').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });

  // Add note
  sheet.querySelector('[data-add-note]').addEventListener('click', async () => {
    const ta = sheet.querySelector('.life-note-ta');
    const note = (ta.value || '').trim();
    if (!note || !V || !cid) return;
    const btn = sheet.querySelector('[data-add-note]');
    btn.disabled = true;
    btn.textContent = 'Saving…';
    try {
      await V.flock.care.interactions.create({ caseId: cid, note });
      ta.value = '';
      // Refresh interactions
      const res = await V.flock.care.interactions.list({ caseId: cid });
      const ix = sheet.querySelector('[data-ix]');
      if (ix) {
        const items = _rows(res);
        ix.innerHTML = items.slice().reverse().map(i => {
          const ts = i.createdAt ? new Date(i.createdAt).toLocaleString() : '';
          return `<div class="life-ix-item"><div class="life-ix-note">${_e(i.note || i.content || i.body || '')}</div><div class="life-ix-meta">${_e(i.author || i.authorName || '')}${ts ? ' &bull; ' + _e(ts) : ''}</div></div>`;
        }).join('');
      }
    } catch (err) { console.error('[TheLife] add note error:', err); }
    btn.disabled = false;
    btn.textContent = 'Add Note';
  });

  // Save
  sheet.querySelector('[data-save]').addEventListener('click', async () => {
    const btn = sheet.querySelector('[data-save]');
    btn.disabled = true;
    btn.textContent = 'Saving…';
    const activeStatus = sheet.querySelector('.life-status-pill.is-active')?.dataset.status || currentStatus;
    const assigneeVal  = sheet.querySelector('[data-field="assignee"]')?.value?.trim() || '';
    const secondaryVal = sheet.querySelector('[data-field="secondary"]')?.value?.trim() || '';
    const summaryVal   = sheet.querySelector('[data-field="summary"]').value.trim();
    try {
      await V.flock.care.update({
        id:                   cid,
        status:               activeStatus,
        primaryCaregiverId:   assigneeVal  || undefined,
        secondaryCaregiverId: secondaryVal || undefined,
        summary:              summaryVal   || undefined,
      });
      _closeSheet();
      if (onSave) onSave();
    } catch (err) {
      console.error('[TheLife] update error:', err);
      btn.disabled = false;
      btn.textContent = 'Save Changes';
    }
  });

  // Resolve
  sheet.querySelector('[data-resolve]').addEventListener('click', async () => {
    const btn = sheet.querySelector('[data-resolve]');
    btn.disabled = true;
    btn.textContent = 'Resolving…';
    try {
      await V.flock.care.resolve({ id: cid });
    } catch {
      try { await V.flock.care.update({ id: cid, status: 'Resolved' }); } catch (err) {
        console.error('[TheLife] resolve error:', err);
        btn.disabled = false; btn.textContent = 'Resolve Case'; return;
      }
    }
    _closeSheet();
    if (onSave) onSave();
  });

  // Close
  sheet.querySelector('.life-sheet-close').addEventListener('click', () => _closeSheet());
  sheet.querySelector('.life-sheet-overlay').addEventListener('click', () => _closeSheet());

  // Swipe to close (panel drag)
  let _startY = null;
  const panel = sheet.querySelector('.life-sheet-panel');
  panel.addEventListener('touchstart', e => { _startY = e.touches[0].clientY; }, { passive: true });
  panel.addEventListener('touchmove', e => {
    const dy = e.touches[0].clientY - _startY;
    if (dy > 0) panel.style.transform = `translateY(${dy}px)`;
  }, { passive: true });
  panel.addEventListener('touchend', e => {
    const dy = e.changedTouches[0].clientY - _startY;
    panel.style.transform = '';
    if (dy > 80) _closeSheet();
  });
}

function _closeSheet(el) {
  const target = el || _activeSheet;
  if (!target) return;
  const overlay = target.querySelector('.life-sheet-overlay');
  const panel   = target.querySelector('.life-sheet-panel');
  if (overlay) overlay.classList.remove('is-open');
  if (panel)   panel.classList.remove('is-open');
  setTimeout(() => { target.remove(); if (_activeSheet === target) _activeSheet = null; }, 320);
}

// ── Quick note sheet ─────────────────────────────────────────────────────────
function _quickNote(cid, personName) {
  _closeSheet();
  const V = window.TheVine;
  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  sheet.innerHTML = /* html */`
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel life-sheet-panel--sm" role="dialog">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div class="life-sheet-hd-info">
          <div class="life-sheet-hd-name">Add Note${personName ? ' — ' + _e(personName) : ''}</div>
        </div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">
        <textarea class="life-note-ta" rows="4" placeholder="What happened? What was said?…" style="width:100%"></textarea>
      </div>
      <div class="life-sheet-foot">
        <button class="flock-btn" data-cancel>Cancel</button>
        <button class="flock-btn flock-btn--primary" data-save>Add Note</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  _activeSheet = sheet;
  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
    sheet.querySelector('.life-note-ta').focus();
  });

  sheet.querySelector('[data-cancel]').addEventListener('click', () => _closeSheet());
  sheet.querySelector('.life-sheet-close').addEventListener('click', () => _closeSheet());
  sheet.querySelector('.life-sheet-overlay').addEventListener('click', () => _closeSheet());

  sheet.querySelector('[data-save]').addEventListener('click', async () => {
    const ta  = sheet.querySelector('.life-note-ta');
    const note = (ta.value || '').trim();
    if (!note || !V || !cid) return;
    const btn = sheet.querySelector('[data-save]');
    btn.disabled = true; btn.textContent = 'Saving…';
    try {
      await V.flock.care.interactions.create({ caseId: cid, note });
      _closeSheet();
    } catch (err) {
      console.error('[TheLife] quick note error:', err);
      btn.disabled = false; btn.textContent = 'Add Note';
    }
  });
}

// ── New care modal ─────────────────────────────────────────────────────────────
const PRIORITY_LABELS = ['Normal', 'High', 'Urgent'];

// ── Member name helper ────────────────────────────────────────────────────────
function _memberName(m) {
  return m.preferredName
    || (((m.firstName || '') + ' ' + (m.lastName || '')).trim())
    || m.displayName || m.name || m.email || '';
}

// ── Find Lead Pastor from member directory ────────────────────────────────────
function _findLeadPastor(members) {
  const PASTOR_ROLES = ['lead pastor','senior pastor','lead','pastor'];
  return members.find(m => {
    const r = String(m.role || m.memberType || '').toLowerCase();
    return PASTOR_ROLES.some(pr => r === pr || r.startsWith(pr));
  });
}

// ── Build a staff/caregiver <select> ─────────────────────────────────────────
// If staffOnly=true, filters to leaders/pastoral roles; otherwise shows everyone.
function _caregiverSelect(members, fieldName, defaultId, placeholder, staffOnly) {
  const STAFF_ROLES = ['leader','deacon','elder','pastor','admin','care','volunteer'];
  const pool = staffOnly
    ? members.filter(m => STAFF_ROLES.some(r => String(m.role || m.memberType || '').toLowerCase().includes(r)))
    : members;
  const sorted = pool.slice().sort((a, b) => _memberName(a).localeCompare(_memberName(b)));
  return `<select class="life-sheet-input" data-field="${_e(fieldName)}">
    <option value="">${_e(placeholder || '— None —')}</option>
    ${sorted.map(m => {
      const id  = m.id || m.memberNumber || m.email || '';
      const sel = (defaultId && (id === defaultId || m.email === defaultId)) ? ' selected' : '';
      return `<option value="${_e(id)}"${sel}>${_e(_memberName(m))}</option>`;
    }).join('')}
  </select>`;
}

// ── Build a full member <select> with filter search ───────────────────────────
function _memberPickerHtml(members, fieldName) {
  const sorted = members.slice().sort((a, b) => _memberName(a).localeCompare(_memberName(b)));
  return `
    <div class="life-member-picker">
      <input class="life-member-search" type="search" placeholder="Filter members…"
             aria-label="Filter member list" data-member-search="${_e(fieldName)}">
      <select class="life-sheet-input life-member-select" data-field="${_e(fieldName)}" size="5">
        <option value="">— Select a member —</option>
        ${sorted.map(m => {
          const id   = m.id || m.memberNumber || m.email || '';
          const disp = _memberName(m);
          const role = m.role || m.memberType || '';
          return `<option value="${_e(id)}" data-n="${_e(disp.toLowerCase())}">${_e(disp)}${role ? '  (' + role + ')' : ''}</option>`;
        }).join('')}
      </select>
    </div>`;
}

function _newCareModal(memberDir, onSave) {
  _closeSheet();
  const V = window.TheVine;
  const hasMemberDir = memberDir && memberDir.length > 0;
  const leadPastor   = _findLeadPastor(memberDir || []);
  const lpId         = leadPastor ? (leadPastor.id || leadPastor.memberNumber || leadPastor.email || '') : '';

  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  sheet.innerHTML = /* html */`
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel" role="dialog" aria-label="New Care Case">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div class="life-sheet-hd-info"><div class="life-sheet-hd-name">New Care Case</div></div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">
        <!-- Member picker -->
        <div class="life-sheet-field">
          <div class="life-sheet-label">Member</div>
          ${hasMemberDir
            ? _memberPickerHtml(memberDir, 'memberId')
            : `<input class="life-sheet-input" data-field="memberId" type="text" placeholder="Member email or ID">`}
        </div>
        <!-- Care Type -->
        <div class="life-sheet-field">
          <div class="life-sheet-label">Care Type</div>
          <select class="life-sheet-input" data-field="careType">
            ${Object.entries(CARE_TYPES).map(([k, t]) => `<option value="${_e(k)}">${t.icon} ${t.label}</option>`).join('')}
          </select>
        </div>
        <!-- Priority -->
        <div class="life-sheet-field">
          <div class="life-sheet-label">Priority</div>
          <div class="life-status-row">
            ${PRIORITY_LABELS.map((p, i) => `<button class="life-status-pill${i === 0 ? ' is-active' : ''}" data-priority="${_e(p.toLowerCase())}">${_e(p)}</button>`).join('')}
          </div>
        </div>
        <!-- Assigned To (Lead Pastor default) -->
        <div class="life-sheet-field">
          <div class="life-sheet-label">
            Assigned To
            ${leadPastor ? `<span class="life-field-hint">Defaulting to Lead Pastor</span>` : ''}
          </div>
          ${hasMemberDir
            ? _caregiverSelect(memberDir, 'assignee', lpId, '— Unassigned —', true)
            : `<input class="life-sheet-input" data-field="assignee" type="text" placeholder="Caregiver name or email" value="${_e(leadPastor ? _memberName(leadPastor) : '')}">`}
        </div>
        <!-- Secondary Caregiver -->
        <div class="life-sheet-field">
          <div class="life-sheet-label">
            Secondary Caregiver
            <span class="life-field-hint">Also gets access to view this case</span>
          </div>
          ${hasMemberDir
            ? _caregiverSelect(memberDir, 'secondary', '', '— None —', true)
            : `<input class="life-sheet-input" data-field="secondary" type="text" placeholder="Secondary caregiver (optional)">`}
        </div>
        <!-- Summary -->
        <div class="life-sheet-field">
          <div class="life-sheet-label">Summary</div>
          <textarea class="life-sheet-ta" data-field="summary" rows="3" placeholder="What's the situation?"></textarea>
        </div>
      </div>
      <div class="life-sheet-foot">
        <button class="flock-btn" data-cancel>Cancel</button>
        <button class="flock-btn flock-btn--primary" data-save>Create Case</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  _activeSheet = sheet;
  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
  });

  // Member search filter
  const searchInput = sheet.querySelector('[data-member-search]');
  if (searchInput) {
    const selEl = sheet.querySelector('[data-field="memberId"]');
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      if (!selEl) return;
      Array.from(selEl.options).forEach(opt => {
        opt.hidden = !!(q && !opt.dataset.n?.includes(q) && opt.value !== '');
      });
    });
  }

  // Priority pills
  sheet.querySelectorAll('[data-priority]').forEach(btn => {
    btn.addEventListener('click', () => {
      sheet.querySelectorAll('[data-priority]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });

  sheet.querySelector('[data-cancel]').addEventListener('click', () => _closeSheet());
  sheet.querySelector('.life-sheet-close').addEventListener('click', () => _closeSheet());
  sheet.querySelector('.life-sheet-overlay').addEventListener('click', () => _closeSheet());

  sheet.querySelector('[data-save]').addEventListener('click', async () => {
    const memberId  = sheet.querySelector('[data-field="memberId"]').value.trim();
    const careType  = sheet.querySelector('[data-field="careType"]').value;
    const priority  = sheet.querySelector('[data-priority].is-active')?.dataset.priority || 'normal';
    const assignee  = sheet.querySelector('[data-field="assignee"]')?.value?.trim() || '';
    const secondary = sheet.querySelector('[data-field="secondary"]')?.value?.trim() || '';
    const summary   = sheet.querySelector('[data-field="summary"]').value.trim();
    if (!memberId) { sheet.querySelector('[data-field="memberId"]').focus(); return; }
    const btn = sheet.querySelector('[data-save]');
    btn.disabled = true; btn.textContent = 'Creating…';
    try {
      await V.flock.care.create({
        memberId,
        careType,
        priority,
        status: 'Open',
        primaryCaregiverId:   assignee  || undefined,
        secondaryCaregiverId: secondary || undefined,
        summary:              summary   || undefined,
      });
      _closeSheet();
      if (onSave) onSave();
    } catch (err) {
      console.error('[TheLife] care.create error:', err);
      btn.disabled = false; btn.textContent = 'Create Case';
    }
  });
}