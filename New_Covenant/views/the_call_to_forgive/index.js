/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE CALL TO FORGIVE — Reconciliation & Restoration
   "Forgive, and ye shall be forgiven." — Luke 6:37
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'the_call_to_forgive';
export const title = 'The Call to Forgive';

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

const CASES = [
  { id: 1, party1: 'James O.',   party2: 'David C.',      issue: 'Financial dispute — leadership role',    stage: 'Mediation',    date: 'Apr 20' },
  { id: 2, party1: 'Anonymous', party2: 'Church Board',   issue: 'Hurt from past leadership decision',     stage: 'Processing',   date: 'Apr 15' },
  { id: 3, party1: 'M. & S. T.', party2: 'Extended fam.', issue: 'Family estrangement — prodigal child',   stage: 'Reconciled',   date: 'Mar 28' },
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
            <button class="flock-btn flock-btn--primary" style="display:flex;align-items:center;gap:6px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Open Case
            </button>
          </div>
          <div class="ctf-cases" data-bind="cases">
            ${CASES.map(_caseRow).join('')}
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
  _loadCases(root);
  return () => {};
}

function _rows(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.rows)) return res.rows;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

async function _loadCases(root) {
  const V = window.TheVine;
  if (!V) return;
  const casesEl = root.querySelector('[data-bind="cases"]');
  if (!casesEl) return;

  try {
    // Reconciliation cases come from care items tagged with reconciliation type
    const res  = await V.flock.care.list({ type: 'reconciliation', limit: 50 });
    const rows = _rows(res);
    if (!rows.length) return;

    casesEl.innerHTML = rows.map(c => {
      const party1   = c.memberName || c.party1 || c.submitterName || 'Member';
      const party2   = c.party2 || c.otherParty || '';
      const issue    = c.title || c.description || c.issue || '';
      const stage    = c.status || c.stage || 'Processing';
      const dateMs   = c.createdAt?.seconds ? c.createdAt.seconds * 1000 : (c.date ? new Date(c.date).getTime() : 0);
      const date     = dateMs ? new Date(dateMs).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
      return _caseRow({ party1, party2, issue, stage, date });
    }).join('');
  } catch (err) {
    console.error('[TheCallToForgive] care.list error:', err);
  }
}

function _caseRow(c) {
  const meta = STAGE_META[c.stage] || STAGE_META.Processing;
  return /* html */`
    <article class="ctf-case-row" tabindex="0">
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

