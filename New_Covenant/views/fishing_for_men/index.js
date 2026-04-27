/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: FISHING FOR MEN — Outreach & Evangelism
   "Follow me, and I will make you fishers of men." — Matthew 4:19
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'fishing_for_men';
export const title = 'Outreach';

let _activeFishSheet = null;
let _liveContactsMap = {};

const FUNNEL = [
  { stage: 'Gospel Contacts',   n: 287, color: 'var(--c-sky)',     pct: 100 },
  { stage: 'Follow-up Made',    n: 143, color: 'var(--c-violet)',   pct: 50  },
  { stage: 'Interested',        n:  72, color: 'var(--gold)',       pct: 25  },
  { stage: 'Attending Church',  n:  38, color: 'var(--c-emerald)',  pct: 13  },
  { stage: 'Decisions',         n:  34, color: '#dc2626',           pct: 12  },
];

const CONTACTS = [
  { name: 'Noah Williams',    source: 'Street Outreach',   date: 'Apr 24', stage: 'Attending Church', assigned: 'Elijah M.' },
  { name: 'Aisha Kamara',     source: 'Friend Referral',   date: 'Apr 22', stage: 'Interested',       assigned: 'James O.'  },
  { name: 'Dario Ferreira',   source: 'Community Event',   date: 'Apr 19', stage: 'Follow-up Made',   assigned: 'Unassigned' },
  { name: 'Mei-Ling Zhao',    source: 'FlockChat Invite',  date: 'Apr 17', stage: 'Interested',       assigned: 'Priya N.'  },
  { name: 'Kwame Asante',     source: 'Prison Ministry',   date: 'Apr 10', stage: 'Attending Church', assigned: 'Pastor Mike' },
  { name: 'Beatrice Olawale', source: 'Mothers Day Event', date: 'Apr  6', stage: 'Gospel Contacts',  assigned: 'Unassigned' },
  { name: 'Sven Larsson',     source: 'Community Outreach',date: 'Mar 28', stage: 'Decisions',        assigned: 'Elder Sarah' },
];

const STAGE_COLOR = {
  'Gospel Contacts':  { color: 'var(--c-sky)',    bg: 'rgba(14,165,233,0.10)'  },
  'Follow-up Made':   { color: 'var(--c-violet)', bg: 'rgba(124,58,237,0.10)' },
  'Interested':       { color: 'var(--gold)',      bg: 'rgba(232,168,56,0.13)' },
  'Attending Church': { color: 'var(--c-emerald)', bg: 'rgba(5,150,105,0.10)'  },
  'Decisions':        { color: '#dc2626',          bg: 'rgba(220,38,38,0.10)'  },
};

export function render() {
  return /* html */`
    <section class="fish-view">
      ${pageHero({
        title:    'Outreach',
        subtitle: 'Track every gospel contact from first conversation to new life in Christ.',
        scripture: 'Follow me, and I will make you fishers of men. — Matthew 4:19',
      })}

      <!-- Funnel -->
      <div class="way-section-header">
        <h2 class="way-section-title">Evangelism Funnel — 2026</h2>
      </div>
      <div class="fish-funnel">
        ${FUNNEL.map(f => `
          <div class="fish-funnel-row">
            <div class="fish-funnel-label">${_e(f.stage)}</div>
            <div class="fish-funnel-bar-wrap">
              <div class="fish-funnel-bar" style="width:${f.pct}%; background:${f.color}"></div>
            </div>
            <div class="fish-funnel-n" style="color:${f.color}">${f.n}</div>
          </div>
        `).join('')}
      </div>

      <!-- Contacts list -->
      <div class="way-section-header" style="margin-top:24px;">
        <h2 class="way-section-title">Recent Gospel Contacts</h2>
        <button class="flock-btn flock-btn--primary" style="display:flex; align-items:center; gap:6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Log Contact
        </button>
      </div>
      <div class="fish-contacts">
        <div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Loading contacts…</div>
      </div>
    </section>
  `;
}

export function mount(root) {
  // Log Contact button
  root.querySelectorAll('.flock-btn--primary').forEach(btn => {
    if (btn.textContent.includes('Log Contact')) {
      btn.addEventListener('click', () => _openContactSheet(null, () => _loadOutreach(root)));
    }
  });
  _loadOutreach(root);
  return () => { _closeFishSheet(); };
}

// ── Stage normalisation ───────────────────────────────────────────────────────
const _STAGE_MAP = {
  'gospel contacts':  'Gospel Contacts',
  'initial contact':  'Gospel Contacts',
  'first contact':    'Gospel Contacts',
  'contacted':        'Gospel Contacts',
  'new contact':      'Gospel Contacts',
  'follow-up':        'Follow-up Made',
  'follow-up made':   'Follow-up Made',
  'followup':         'Follow-up Made',
  'interested':       'Interested',
  'seeking':          'Interested',
  'considering':      'Interested',
  'attending':        'Attending Church',
  'attending church': 'Attending Church',
  'regular':          'Attending Church',
  'decision':         'Decisions',
  'decisions':        'Decisions',
  'converted':        'Decisions',
  'baptized':         'Decisions',
  'new believer':     'Decisions',
};
function _stageKey(raw) {
  return _STAGE_MAP[(raw || '').toLowerCase().trim()] || null;
}

function _rows(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.rows)) return res.rows;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

async function _loadOutreach(root) {
  const V = window.TheVine;
  if (!V) return;

  const funnelEl   = root.querySelector('.fish-funnel');
  const contactsEl = root.querySelector('.fish-contacts');
  if (contactsEl) {
    contactsEl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Loading contacts…</div>';
  }

  try {
    const res  = await V.flock.outreach.contacts.list({ limit: 100 });
    const all  = _rows(res);

    if (!all.length) {
      if (contactsEl) contactsEl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">No gospel contacts on file. Use “Log Contact” to add one.</div>';
      return;
    }

    // Sort by most-recent first
    const sorted = [...all].sort((a, b) => {
      const ta = a.createdAt?.seconds ?? (a.contactDate ? new Date(a.contactDate).getTime() / 1000 : 0);
      const tb = b.createdAt?.seconds ?? (b.contactDate ? new Date(b.contactDate).getTime() / 1000 : 0);
      return tb - ta;
    });

    if (contactsEl) contactsEl.innerHTML = sorted.map(_liveContactRow).join('');
    // Build map + wire edit clicks
    _liveContactsMap = {};
    all.forEach(c => { if (c.id) _liveContactsMap[String(c.id)] = c; });
    const reload = () => _loadOutreach(root);
    contactsEl?.querySelectorAll('.fish-contact-row[data-id]').forEach(row => {
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        const rec = _liveContactsMap[row.dataset.id];
        if (rec) _openContactSheet(rec, reload);
      });
    });

    // Rebuild funnel counts from live data
    if (funnelEl) {
      const counts = {};
      FUNNEL.forEach(f => { counts[f.stage] = 0; });
      all.forEach(c => {
        const key = _stageKey(c.stage || c.status || c.funnelStage || '') || 'Gospel Contacts';
        counts[key] = (counts[key] || 0) + 1;
      });
      const total = all.length;
      funnelEl.innerHTML = FUNNEL.map(f => {
        const n   = f.stage === 'Gospel Contacts' ? total : (counts[f.stage] || 0);
        const pct = total > 0 ? Math.max(1, Math.round((n / total) * 100)) : f.pct;
        return `
          <div class="fish-funnel-row">
            <div class="fish-funnel-label">${_e(f.stage)}</div>
            <div class="fish-funnel-bar-wrap">
              <div class="fish-funnel-bar" style="width:${f.stage === 'Gospel Contacts' ? 100 : pct}%; background:${f.color}"></div>
            </div>
            <div class="fish-funnel-n" style="color:${f.color}">${n}</div>
          </div>`;
      }).join('');
    }
  } catch (err) {
    console.error('[FishingForMen] outreach.contacts.list error:', err);
    if (contactsEl) contactsEl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Could not load contacts right now.</div>';
  }
}

function _liveContactRow(c) {
  const first    = c.firstName || '';
  const last     = c.lastName  || '';
  const name     = c.name || c.displayName || `${first} ${last}`.trim() || 'Unknown';
  const source   = c.source || c.contactSource || c.channel || '—';
  const rawStage = c.stage || c.status || c.funnelStage || 'Gospel Contacts';
  const stage    = _stageKey(rawStage) || rawStage;
  const assigned = c.assignedToName || c.assignedTo || 'Unassigned';
  const dateMs   = c.createdAt?.seconds
    ? c.createdAt.seconds * 1000
    : (c.contactDate ? new Date(c.contactDate).getTime() : 0);
  const date     = dateMs ? new Date(dateMs).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—';
  const sc       = STAGE_COLOR[stage] || { color: 'var(--ink-muted)', bg: 'var(--bg-base)' };
  const initials = name.split(/\s+/).map(w => w[0] || '').slice(0, 2).join('').toUpperCase();
  const unassigned = assigned === 'Unassigned';
  return `
    <article class="fish-contact-row"${c.id ? ` data-id="${_e(String(c.id))}"` : ''} tabindex="0">
      <div class="fold-avatar" style="background:linear-gradient(135deg,#0ea5e9,#7c3aed);width:38px;height:38px;font-size:.78rem;">${_e(initials || '?')}</div>
      <div class="fish-contact-body">
        <div class="fish-contact-name">${_e(name)}</div>
        <div class="fish-contact-meta">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          ${_e(source)} · ${_e(date)}
        </div>
      </div>
      <span class="fish-stage-badge" style="color:${sc.color};background:${sc.bg}">${_e(stage)}</span>
      <div class="fish-assigned${unassigned ? ' fish-assigned--empty' : ''}">${_e(assigned)}</div>
    </article>`;
}

function _contactRow(c) {
  const sc = STAGE_COLOR[c.stage] || { color: 'var(--ink-muted)', bg: 'var(--bg-base)' };
  const initials = c.name.split(' ').map(w => w[0] || '').slice(0, 2).join('').toUpperCase();
  const unassigned = c.assigned === 'Unassigned';
  return /* html */`
    <article class="fish-contact-row" tabindex="0">
      <div class="fold-avatar" style="background: linear-gradient(135deg,#0ea5e9,#7c3aed); width:38px; height:38px; font-size:.78rem;">${initials}</div>
      <div class="fish-contact-body">
        <div class="fish-contact-name">${_e(c.name)}</div>
        <div class="fish-contact-meta">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          ${_e(c.source)} · ${_e(c.date)}
        </div>
      </div>
      <span class="fish-stage-badge" style="color:${sc.color}; background:${sc.bg}">${_e(c.stage)}</span>
      <div class="fish-assigned${unassigned ? ' fish-assigned--empty' : ''}">${_e(c.assigned)}</div>
    </article>
  `;
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ── Contact sheet ──────────────────────────────────────────────────
function _closeFishSheet() {
  if (!_activeFishSheet) return;
  const t = _activeFishSheet;
  t.querySelector('.life-sheet-overlay')?.classList.remove('is-open');
  t.querySelector('.life-sheet-panel')?.classList.remove('is-open');
  setTimeout(() => { t.remove(); if (_activeFishSheet === t) _activeFishSheet = null; }, 320);
}

const STAGES = ['Gospel Contacts', 'Follow-up Made', 'Interested', 'Attending Church', 'Decisions'];
const SOURCES = ['Street Outreach', 'Friend Referral', 'Community Event', 'FlockChat Invite', 'Prison Ministry', 'Mothers Day Event', 'Community Outreach', 'Online', 'Other'];

function _openContactSheet(c, onReload) {
  _closeFishSheet();
  const V     = window.TheVine;
  const isNew = !c;
  const uid   = c?.id ? String(c.id) : '';
  const first   = c?.firstName || (c?.name ? c.name.split(' ')[0] : '') || '';
  const last    = c?.lastName  || (c?.name ? c.name.split(' ').slice(1).join(' ') : '') || '';
  const email   = c?.email || '';
  const phone   = c?.phone || '';
  const source  = c?.source || c?.contactSource || '';
  const rawStage = c?.stage || c?.status || c?.funnelStage || 'Gospel Contacts';
  const stage   = _stageKey(rawStage) || rawStage;
  const assigned = c?.assignedToName || c?.assignedTo || '';
  const notes   = c?.notes || c?.description || '';

  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  sheet.innerHTML = /* html */`
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel" role="dialog" aria-label="${isNew ? 'Log Gospel Contact' : 'Edit Contact'}">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div class="life-sheet-hd-info">
          <div class="life-sheet-hd-name">${isNew ? 'Log Gospel Contact' : 'Edit Contact'}</div>
          <div class="life-sheet-hd-meta">${isNew ? 'Record a new outreach conversation' : _e(`${first} ${last}`.trim())}</div>
        </div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="life-sheet-field">
            <div class="life-sheet-label">First Name <span style="color:#dc2626">*</span></div>
            <input class="life-sheet-input" data-field="firstName" type="text" value="${_e(first)}" placeholder="First">
          </div>
          <div class="life-sheet-field">
            <div class="life-sheet-label">Last Name</div>
            <input class="life-sheet-input" data-field="lastName" type="text" value="${_e(last)}" placeholder="Last">
          </div>
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Email</div>
          <input class="life-sheet-input" data-field="email" type="email" value="${_e(email)}" placeholder="email@example.com">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Phone</div>
          <input class="life-sheet-input" data-field="phone" type="tel" value="${_e(phone)}" placeholder="+1 (555) 000-0000">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">How did we meet?</div>
          <select class="life-sheet-input" data-field="source">
            <option value="">— select —</option>
            ${SOURCES.map(s => `<option value="${_e(s)}"${s === source ? ' selected' : ''}>${_e(s)}</option>`).join('')}
          </select>
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Stage</div>
          <select class="life-sheet-input" data-field="stage">
            ${STAGES.map(s => `<option value="${_e(s)}"${s === stage ? ' selected' : ''}>${_e(s)}</option>`).join('')}
          </select>
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Assigned To</div>
          <input class="life-sheet-input" data-field="assignedTo" type="text" value="${_e(assigned)}" placeholder="Member name">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Notes</div>
          <textarea class="life-sheet-input" data-field="notes" rows="3" style="resize:vertical" placeholder="Conversation highlights, prayer requests, follow-up actions…">${_e(notes)}</textarea>
        </div>
        <div class="fold-form-error" data-error style="display:none;color:#dc2626;font-size:.85rem;margin-top:8px"></div>
      </div>
      <div class="life-sheet-foot">
        ${!isNew ? '<button class="flock-btn flock-btn--danger" data-delete style="margin-right:auto">Delete Contact</button>' : ''}
        <button class="flock-btn" data-cancel>Cancel</button>
        <button class="flock-btn flock-btn--primary" data-save>${isNew ? 'Log Contact' : 'Save Changes'}</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  _activeFishSheet = sheet;
  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
    if (isNew) sheet.querySelector('[data-field="firstName"]')?.focus();
  });

  const close = () => _closeFishSheet();
  sheet.querySelector('[data-cancel]').addEventListener('click', close);
  sheet.querySelector('.life-sheet-close').addEventListener('click', close);
  sheet.querySelector('.life-sheet-overlay').addEventListener('click', close);

  sheet.querySelector('[data-save]').addEventListener('click', async () => {
    const errEl     = sheet.querySelector('[data-error]');
    const firstVal  = sheet.querySelector('[data-field="firstName"]').value.trim();
    if (!firstVal) { errEl.textContent = 'First name is required.'; errEl.style.display = ''; return; }
    errEl.style.display = 'none';
    const btn = sheet.querySelector('[data-save]');
    btn.disabled = true; btn.textContent = isNew ? 'Logging…' : 'Saving…';
    const payload = {
      firstName:   firstVal,
      lastName:    sheet.querySelector('[data-field="lastName"]').value.trim() || undefined,
      email:       sheet.querySelector('[data-field="email"]').value.trim()     || undefined,
      phone:       sheet.querySelector('[data-field="phone"]').value.trim()     || undefined,
      source:      sheet.querySelector('[data-field="source"]').value           || undefined,
      stage:       sheet.querySelector('[data-field="stage"]').value,
      assignedTo:  sheet.querySelector('[data-field="assignedTo"]').value.trim() || undefined,
      notes:       sheet.querySelector('[data-field="notes"]').value.trim()     || undefined,
    };
    if (!isNew) payload.id = uid;
    try {
      if (isNew) { await V.flock.outreach.contacts.create(payload); }
      else       { await V.flock.outreach.contacts.update(payload); }
      _closeFishSheet();
      onReload?.();
    } catch (err) {
      errEl.textContent = err?.message || 'Could not save.';
      errEl.style.display = '';
      btn.disabled = false; btn.textContent = isNew ? 'Log Contact' : 'Save Changes';
    }
  });

  sheet.querySelector('[data-delete]')?.addEventListener('click', async () => {
    const name = `${first} ${last}`.trim() || 'this contact';
    const ok = confirm(`Delete ${name}? This cannot be undone.`);
    if (!ok) return;
    const btn = sheet.querySelector('[data-delete]');
    btn.disabled = true; btn.textContent = 'Deleting…';
    try {
      await V.flock.outreach.contacts.update({ id: uid, status: 'Deleted' });
      _closeFishSheet();
      onReload?.();
    } catch (err) { btn.disabled = false; btn.textContent = 'Delete Contact'; }
  });
}

