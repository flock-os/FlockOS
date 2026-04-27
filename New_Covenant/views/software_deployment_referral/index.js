/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: SOFTWARE DEPLOYMENT REFERRAL — Deploy & Refer
   "Go ye therefore, and teach all nations." — Matthew 28:19
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'software_deployment_referral';
export const title = 'Deploy & Refer';

const _e = s => String(s ?? '').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const CHECKLIST = [
  { step: 'DNS & Subdomain',      desc: 'Point `church.flockos.app` to Firebase Hosting.',       done: true  },
  { step: 'Firebase Project',     desc: 'Create a new Firebase project; enable Firestore + Auth + Hosting.', done: true },
  { step: 'Google Apps Script',   desc: 'Deploy the Scrolls GAS project and link the API endpoint.',  done: true },
  { step: 'Church Record',        desc: 'Add church to the Church Registry (`Scrolls/ChurchRegistry/`).', done: true },
  { step: 'Branding Assets',      desc: 'Upload logo and set colour tokens in the church config JSON.',  done: false },
  { step: 'Data Migration',       desc: 'Run `import_members.sh` to seed initial member records.',     done: false },
  { step: 'Admin Account',        desc: 'Create the first admin user and assign the Pastor role.',      done: false },
  { step: 'Team Training',        desc: 'Walk through the FlockOS onboarding guide with leadership.',   done: false },
  { step: 'Firebase Deploy',      desc: 'Run `firebase deploy` from the Bezalel view or CLI.',          done: false },
];

const REFERRAL_CODE = 'FLOCK-REF-0001'; // static placeholder

export function render() {
  return /* html */`
    <section class="sdr-view">
      ${pageHero({
        title:    'Deploy & Refer',
        subtitle: 'Deployment checklist for new churches and referral tools to grow the network.',
        scripture: 'Go ye therefore, and teach all nations. — Matthew 28:19',
      })}

      <div class="sdr-layout">

        <!-- Left: checklist -->
        <div class="sdr-checklist-col">
          <div class="way-section-header">
            <h2 class="way-section-title">Deployment Checklist</h2>
            <button class="flock-btn flock-btn--ghost sdr-bezalel-btn">Open Build Panel →</button>
          </div>
          <div class="sdr-checklist">
            ${CHECKLIST.map((c, i) => `
            <label class="sdr-check-row">
              <input type="checkbox" class="sdr-check" data-step="${i}" ${c.done ? 'checked' : ''} />
              <div class="sdr-check-body">
                <div class="sdr-check-step ${c.done ? 'is-done' : ''}">${_e(c.step)}</div>
                <div class="sdr-check-desc">${_e(c.desc)}</div>
              </div>
            </label>`).join('')}
          </div>
          <div class="sdr-progress-bar-wrap">
            <div class="sdr-progress-label"><span class="sdr-done-count">${CHECKLIST.filter(c=>c.done).length}</span> / ${CHECKLIST.length} steps complete</div>
            <div class="sdr-progress-track"><div class="sdr-progress-fill" style="width:${Math.round(CHECKLIST.filter(c=>c.done).length/CHECKLIST.length*100)}%"></div></div>
          </div>
        </div>

        <!-- Right: referral -->
        <aside class="sdr-referral-col">
          <div class="sdr-referral-card">
            <div class="sdr-ref-title">Refer a Church</div>
            <div class="sdr-ref-sub">Share FlockOS with another congregation and help the body grow.</div>
            <div class="sdr-ref-stat-row">
              <div class="sdr-ref-stat"><div class="sdr-ref-stat-n" data-bind="referred-count">0</div><div class="sdr-ref-stat-label">Churches Referred</div></div>
              <div class="sdr-ref-stat"><div class="sdr-ref-stat-n" data-bind="accepted-count">0</div><div class="sdr-ref-stat-label">Accepted</div></div>
            </div>
            <div class="sdr-ref-label">Your Referral Code</div>
            <div class="sdr-ref-code-row">
              <input class="fold-search" style="flex:1;font-family:monospace;font-size:.85rem;" readonly value="${_e(REFERRAL_CODE)}" data-bind="ref-code" />
              <button class="flock-btn flock-btn--ghost sdr-copy-code-btn">Copy</button>
            </div>
            <div class="sdr-ref-label" style="margin-top:10px;">Share Link</div>
            <div class="sdr-ref-code-row">
              <input class="fold-search" style="flex:1;font-size:.8rem;" readonly value="https://flockos.app/?ref=${_e(REFERRAL_CODE)}" data-bind="ref-link" />
              <button class="flock-btn flock-btn--ghost sdr-copy-link-btn">Copy</button>
            </div>
            <button class="flock-btn flock-btn--primary" style="width:100%;margin-top:16px" data-act="request-church">Request a New Church →</button>
          </div>
        </aside>

      </div>
    </section>
  `;
}

export function mount(root) {
  // Checklist progress tracking
  root.querySelectorAll('.sdr-check').forEach(chk => {
    chk.addEventListener('change', () => _updateProgress(root));
  });

  // Copy buttons
  _wireCopy(root, '.sdr-copy-code-btn', '[data-bind="ref-code"]');
  _wireCopy(root, '.sdr-copy-link-btn', '[data-bind="ref-link"]');

  // Bezalel navigation
  root.querySelector('.sdr-bezalel-btn')?.addEventListener('click', () => {
    window.TheVine?.go?.('bezalel');
  });

  // Request church → invitation page
  root.querySelector('[data-act="request-church"]')?.addEventListener('click', () => {
    window.TheVine?.go?.('the_invitation');
  });

  return () => {};
}

function _updateProgress(root) {
  const all   = root.querySelectorAll('.sdr-check');
  const done  = [...all].filter(c => c.checked).length;
  const pct   = Math.round(done / all.length * 100);
  const fill  = root.querySelector('.sdr-progress-fill');
  const label = root.querySelector('.sdr-done-count');
  if (fill)  fill.style.width = pct + '%';
  if (label) label.textContent = done;
  root.querySelectorAll('.sdr-check-row').forEach((row, i) => {
    const title = row.querySelector('.sdr-check-step');
    if (!title) return;
    if (root.querySelectorAll('.sdr-check')[i].checked) {
      title.classList.add('is-done');
    } else {
      title.classList.remove('is-done');
    }
  });
}

function _wireCopy(root, btnSel, inputSel) {
  root.querySelector(btnSel)?.addEventListener('click', async function() {
    const val = root.querySelector(inputSel)?.value || '';
    try {
      await navigator.clipboard.writeText(val);
      this.textContent = 'Copied!';
      setTimeout(() => { this.textContent = 'Copy'; }, 2000);
    } catch { /* clipboard not available */ }
  });
}
