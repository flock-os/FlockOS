/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE CALL TO FORGIVE — Reconciliation & Restoration
   "Forgive, and ye shall be forgiven." — Luke 6:37
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';
import { buildAdapter } from '../../Scripts/the_living_water_adapter.js';

export const name  = 'the_call_to_forgive';
export const title = 'The Call to Forgive';

let _activeCtfSheet = null;
let _liveCasesMap   = {};

const _e = s => String(s ?? '').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const STEPS = [
  { n: 1, title: 'Acknowledge the Wound',  desc: 'Name the hurt honestly and without minimising it before God.' },
  { n: 2, title: 'Choose to Forgive',      desc: 'Forgiveness is a decision of the will, not a feeling. Make the choice.' },
  { n: 3, title: 'Speak the Release',      desc: 'Pray the release aloud: "I forgive ____ for ____."' },
  { n: 4, title: 'Seek Reconciliation',    desc: 'Where safe and possible, pursue restoration of the relationship.' },
  { n: 5, title: 'Walk in the Healing',    desc: 'Forgiveness is a journey. Return to these steps as needed.' },
];

const SCRIPTURES = [
  { ref: 'Matthew 6:14',   text: 'For if you forgive men their trespasses, your heavenly Father will also forgive you.' },
  { ref: 'Colossians 3:13', text: 'Bearing with one another and, if one has a complaint against another, forgiving each other; as the Lord has forgiven you, so you also must forgive.' },
  { ref: 'Luke 6:37',      text: 'Forgive, and you will be forgiven.' },
  { ref: 'Ephesians 4:32', text: 'Be kind to one another, tenderhearted, forgiving one another, as God in Christ forgave you.' },
];

const STAGE_META = {
  Processing:   { color: '#0ea5e9', bg: 'rgba(14,165,233,0.10)'  },
  Mediation:    { color: '#e8a838', bg: 'rgba(232,168,56,0.13)'  },
  Reconciled:   { color: '#059669', bg: 'rgba(5,150,105,0.10)'   },
  Closed:       { color: '#9ca3af', bg: 'rgba(156,163,175,0.10)' },
};

export function render() {
  return /* html */`
    <section class="ctf-view">
      ${pageHero({
        title:    'The Call to Forgive',
        subtitle: 'Pastoral tools for reconciliation, restoration, and the ministry of healing.',
        scripture: 'Forgive, and ye shall be forgiven. — Luke 6:37',
      })}

      <div class="ctf-layout">

        <!-- Left: active cases + steps -->
        <div class="ctf-main">

          <!-- Reconciliation cases -->
          <div class="way-section-header">
            <h2 class="way-section-title">Reconciliation Cases</h2>
            <button class="flock-btn flock-btn--primary" data-act="open-case" style="display:flex;align-items:center;gap:6px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Open Case
            </button>
          </div>
          <div class="ctf-cases" data-bind="cases">
            <div style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Loading cases…</div>
          </div>

          <!-- Process steps -->
          <div class="way-section-header" style="margin-top:28px;">
            <h2 class="way-section-title">The Pathway to Forgiveness</h2>
          </div>
          <div class="ctf-steps">
            ${STEPS.map(s => `
            <div class="ctf-step">
              <div class="ctf-step-n">${s.n}</div>
              <div class="ctf-step-body">
                <div class="ctf-step-title">${_e(s.title)}</div>
                <div class="ctf-step-desc">${_e(s.desc)}</div>
              </div>
            </div>`).join('')}
          </div>
        </div>

        <!-- Right: scripture rail -->
        <aside class="ctf-scripture-col">
          <div class="ctf-scripture-hd">Scriptures on Forgiveness</div>
          ${SCRIPTURES.map(s => `
          <div class="ctf-scripture-card">
            <div class="ctf-scripture-ref">${_e(s.ref)}</div>
            <div class="ctf-scripture-text">"${_e(s.text)}"</div>
          </div>`).join('')}
          <button class="flock-btn flock-btn--ghost" style="width:100%;margin-top:12px">Forgiveness Prayer Guide</button>
        </aside>

      </div>
    </section>
  `;
}

export function mount(root) {
  const reload = () => _loadCases(root, reload);
  reload();
  root.querySelector('[data-act="open-case"]')?.addEventListener('click', () => _openCaseSheet(null, reload));
  return () => { _closeCtfSheet(); };
}

function _rows(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.rows)) return res.rows;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

function _isFB() {
  const UR = window.UpperRoom;
  return !!(UR && typeof UR.isReady === 'function' && UR.isReady() && typeof UR.listCareCases === 'function');
}

async function _loadCases(root, onReload) {
  const V   = window.TheVine;
  const MX  = buildAdapter('flock.care', V);
  const UR  = window.UpperRoom;
  const casesEl = root.querySelector('[data-bind="cases"]');
  if (!casesEl) return;
  if (!UR && !V) {
    casesEl.innerHTML = '<div class="life-empty" style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Reconciliation data is unavailable right now.</div>';
    return;
  }

  try {
    // Fetch all care cases then filter client-side by careType=reconciliation
    let allRows;
    if (UR && typeof UR.listCareCases === 'function' && UR.isReady?.()) {
      allRows = _rows(await UR.listCareCases({}));
    } else {
      allRows = _rows(await MX.list({ careType: 'reconciliation', limit: 50 }));
    }
    const rows = allRows.filter(r => String(r.careType || r.type || '').toLowerCase() === 'reconciliation').slice(0, 12);
    if (!rows.length) {
      casesEl.innerHTML = '<div class="life-empty" style="padding:32px;text-align:center;color:var(--ink-muted,#7a7f96)">No reconciliation cases on file. Use "Open Case" to begin one.</div>';
      _liveCasesMap = {};
      return;
    }

    casesEl.innerHTML = rows.map(c => {
      const party1   = c.memberName || c.party1 || c.submitterName || '(unnamed)';
      const party2   = c.party2 || c.otherParty || '';
      const issue    = c.summary || c.title || c.description || c.issue || '';
      const stage    = c.status || c.stage || 'Processing';
      const dateMs   = c.createdAt?.seconds ? c.createdAt.seconds * 1000 : (c.date ? new Date(c.date).getTime() : 0);
      const date     = dateMs ? new Date(dateMs).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
      return _caseRow({ id: c.id ? String(c.id) : undefined, party1, party2, issue, stage, date });
    }).join('');
    _liveCasesMap = {};
    rows.forEach(c => { if (c.id) _liveCasesMap[String(c.id)] = c; });
    casesEl.querySelectorAll('.ctf-case-row[data-id]').forEach(row => {
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        const rec = _liveCasesMap[row.dataset.id];
        if (rec) _openCaseSheet({
          id:     rec.id,
          party1: rec.memberName || rec.party1 || rec.submitterName || 'Member',
          party2: rec.party2 || rec.otherParty || '',
          issue:  rec.summary || rec.title || rec.description || rec.issue || '',
          stage:  rec.status || rec.stage || 'Processing',
        }, onReload);
      });
    });
  } catch (err) {
    console.error('[TheCallToForgive] load error:', err);
    casesEl.innerHTML = '<div class="life-empty" style="padding:24px;text-align:center;color:var(--ink-muted,#7a7f96)">Could not load reconciliation cases right now.</div>';
  }
}

function _caseRow(c) {
  const meta = STAGE_META[c.stage] || STAGE_META.Processing;
  return /* html */`
    <article class="ctf-case-row"${c.id ? ` data-id="${_e(c.id)}"` : ''} tabindex="0">
      <div class="ctf-case-parties">
        <span class="ctf-party">${_e(c.party1)}</span>
        ${c.party2 ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
        <span class="ctf-party">${_e(c.party2)}</span>` : ''}
      </div>
      ${c.issue ? `<div class="ctf-case-issue">${_e(c.issue)}</div>` : ''}
      <div class="ctf-case-foot">
        <span class="ctf-stage-badge" style="color:${meta.color};background:${meta.bg}">${_e(c.stage)}</span>
        ${c.date ? `<span class="ctf-case-date">${_e(c.date)}</span>` : ''}
      </div>
    </article>`;
}

// ── Case sheet ───────────────────────────────────────────────────────────────
const CTF_STAGES = Object.keys(STAGE_META);

function _closeCtfSheet() {
  if (!_activeCtfSheet) return;
  const t = _activeCtfSheet;
  t.querySelector('.life-sheet-overlay')?.classList.remove('is-open');
  t.querySelector('.life-sheet-panel')?.classList.remove('is-open');
  setTimeout(() => { t.remove(); if (_activeCtfSheet === t) _activeCtfSheet = null; }, 320);
}

function _openCaseSheet(c, onReload) {
  _closeCtfSheet();
  const V   = window.TheVine;
  const MX  = buildAdapter('flock.care', V);
  const UR  = window.UpperRoom;
  const useFB = !!(UR && typeof UR.isReady === 'function' && UR.isReady() && typeof UR.createCareCase === 'function');
  const isNew = !c;
  const uid   = c?.id ? String(c.id) : '';

  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  sheet.innerHTML = /* html */`
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel" role="dialog" aria-label="${isNew ? 'Open Case' : 'Edit Case'}">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div class="life-sheet-hd-info">
          <div class="life-sheet-hd-name">${isNew ? 'Open Reconciliation Case' : 'Edit Case'}</div>
          <div class="life-sheet-hd-meta">${isNew ? 'Begin the ministry of reconciliation' : _e((c?.party1 || '') + (c?.party2 ? ' & ' + c.party2 : ''))}</div>
        </div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">
        <div class="life-sheet-field">
          <div class="life-sheet-label">First Party / Member Name <span style="color:#dc2626">*</span></div>
          <input class="life-sheet-input" data-field="party1" type="text" value="${_e(c?.party1 || '')}" placeholder="Name of the primary person">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Second Party <span style="color:#6b7280;font-weight:400">(optional)</span></div>
          <input class="life-sheet-input" data-field="party2" type="text" value="${_e(c?.party2 || '')}" placeholder="Name of the other party">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Issue / Description</div>
          <textarea class="life-sheet-input" data-field="issue" rows="3" style="resize:vertical" placeholder="Brief description of the conflict or need…">${_e(c?.issue || '')}</textarea>
        </div>
        ${!isNew ? `<div class="life-sheet-field">
          <div class="life-sheet-label">Stage</div>
          <select class="life-sheet-input" data-field="stage">
            ${CTF_STAGES.map(s => `<option value="${_e(s)}"${s === (c?.stage || 'Processing') ? ' selected' : ''}>${_e(s)}</option>`).join('')}
          </select>
        </div>` : ''}
        <div class="fold-form-error" data-error style="display:none;color:#dc2626;font-size:.85rem;margin-top:8px"></div>
      </div>
      <div class="life-sheet-foot">
        ${!isNew ? '<button class="flock-btn flock-btn--danger" data-delete style="margin-right:auto">Delete Case</button>' : ''}
        ${!isNew ? '<button class="flock-btn flock-btn--ghost" data-close-case>Close Case</button>' : ''}
        <button class="flock-btn" data-cancel>Cancel</button>
        <button class="flock-btn flock-btn--primary" data-save>${isNew ? 'Open Case' : 'Save Changes'}</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  _activeCtfSheet = sheet;
  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
    sheet.querySelector('[data-field="party1"]')?.focus();
  });

  const close = () => _closeCtfSheet();
  sheet.querySelector('[data-cancel]').addEventListener('click', close);
  sheet.querySelector('.life-sheet-close').addEventListener('click', close);

  sheet.querySelector('[data-save]').addEventListener('click', async () => {
    const errEl = sheet.querySelector('[data-error]');
    const p1    = sheet.querySelector('[data-field="party1"]').value.trim();
    if (!p1) { errEl.textContent = 'First party name is required.'; errEl.style.display = ''; return; }
    errEl.style.display = 'none';
    const btn = sheet.querySelector('[data-save]');
    btn.disabled = true; btn.textContent = isNew ? 'Opening…' : 'Saving…';
    const payload = {
      careType: 'reconciliation',
      party1:   p1,
      party2:   sheet.querySelector('[data-field="party2"]').value.trim() || undefined,
      summary:  sheet.querySelector('[data-field="issue"]').value.trim() || undefined,
      status:   isNew ? 'Processing' : (sheet.querySelector('[data-field="stage"]')?.value || 'Processing'),
    };
    if (!isNew) payload.id = uid;
    try {
      if (isNew) {
        await (useFB ? UR.createCareCase(payload) : MX.create(payload));
      } else {
        await (useFB ? UR.updateCareCase(payload) : MX.update(payload));
      }
      _closeCtfSheet();
      onReload?.();
    } catch (err) {
      errEl.textContent = err?.message || 'Could not save case.';
      errEl.style.display = '';
      btn.disabled = false; btn.textContent = isNew ? 'Open Case' : 'Save Changes';
    }
  });

  sheet.querySelector('[data-close-case]')?.addEventListener('click', async () => {
    const ok = confirm('Mark this reconciliation case as Closed?');
    if (!ok) return;
    const btn = sheet.querySelector('[data-close-case]');
    btn.disabled = true; btn.textContent = 'Closing…';
    try {
      await (useFB ? UR.updateCareCase({ id: uid, status: 'Closed' }) : MX.update({ id: uid, status: 'Closed' }));
      _closeCtfSheet();
      onReload?.();
    } catch (_) { btn.disabled = false; btn.textContent = 'Close Case'; }
  });

  sheet.querySelector('[data-delete]')?.addEventListener('click', async () => {
    const party = c?.party1 || 'this case';
    if (!confirm(`Permanently delete the case for "${party}"? This cannot be undone.`)) return;
    const btn = sheet.querySelector('[data-delete]');
    btn.disabled = true; btn.textContent = 'Deleting…';
    try {
      // care.delete does not exist in the API — always soft-delete via status update
      await (useFB ? UR.updateCareCase({ id: uid, status: 'Deleted' }) : MX.update({ id: uid, status: 'Deleted' }));
      _closeCtfSheet();
      onReload?.();
    } catch (err) {
      alert(err?.message || 'Could not delete case.');
      btn.disabled = false; btn.textContent = 'Delete Case';
    }
  });
}

