/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: Bezalel — Build & Deploy Tools
   "I have called by name Bezalel… and filled him with the Spirit of God. — Exodus 31:2-3"
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'bezalel';
export const title = 'Bezalel';

const _e = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* ── Church deployments (mirrors builds_codex.js concept) ────────────────── */
const CHURCHES = [
  { id: 'root',       name: 'FlockOS Root',       url: 'flockos.app',             status: 'live',     lastBuild: '2 hours ago',  version: '2.0.0' },
  { id: 'gas',        name: 'GAS',                url: 'gas.flockos.app',         status: 'live',     lastBuild: '2 hours ago',  version: '2.0.0' },
  { id: 'tbc',        name: 'Trinity Bible',      url: 'tbc.flockos.app',         status: 'live',     lastBuild: '2 hours ago',  version: '2.0.0' },
  { id: 'theforest',  name: 'The Forest',         url: 'theforest.flockos.app',   status: 'live',     lastBuild: '2 hours ago',  version: '2.0.0' },
  { id: 'comms',      name: 'FlockChat (Comms)',  url: 'comms.flockos.app',       status: 'live',     lastBuild: '2 hours ago',  version: '1.4.2' },
];

const BUILD_STEPS = [
  { step: 'Sync SharedVessels CSS',       done: true  },
  { step: 'rsync FlockOS → Nations',     done: true  },
  { step: 'Apply church branding',        done: true  },
  { step: 'Regenerate builds_codex.js',  done: true  },
  { step: 'Inject Firebase config',       done: true  },
  { step: 'Deploy comms hosting',         done: true  },
];

const ENV_VARS = [
  { key: 'FIREBASE_PROJECT',   val: 'flockos-comms',  secret: false },
  { key: 'GAS_COMMS_URL',      val: 'https://script.google.com/…', secret: true  },
  { key: 'GAS_SCROLLS_URL',    val: 'https://script.google.com/…', secret: true  },
  { key: 'VAPID_KEY',          val: 'BPmu…redacted',  secret: true  },
  { key: 'SW_VERSION',         val: '1.4.2',           secret: false },
];

/* ── Render ───────────────────────────────────────────────────────────────── */
export function render() {
  return `
<section class="bz-view">
  ${pageHero({
    title: 'Bezalel',
    subtitle: 'Build, deploy, and inspect the FlockOS church network.',
    scripture: 'I have called by name Bezalel… and filled him with the Spirit of God. — Exodus 31:2-3',
  })}

  <!-- Build status + trigger -->
  <div class="bz-build-row">
    <div class="bz-card bz-status-card">
      <div class="bz-status-head">
        <div class="bz-status-dot bz-dot--green"></div>
        <div class="bz-status-label">Last Build: Successful</div>
        <div class="bz-status-time">2 hours ago · A-Build_Churches.sh</div>
      </div>
      <div class="bz-steps">
        ${BUILD_STEPS.map(s => `
        <div class="bz-step">
          <span class="bz-step-check ${s.done ? 'bz-check--done' : ''}">${s.done ? '✓' : '○'}</span>
          <span class="bz-step-label">${_e(s.step)}</span>
        </div>`).join('')}
      </div>
    </div>
    <div class="bz-card bz-trigger-card">
      <h3 class="bz-card-title">Build & Deploy</h3>
      <p class="bz-trigger-desc">Runs <code>A-Build_Churches.sh --deploy-comms</code> from repo root. Syncs CSS, rsync all churches, regenerates codex, deploys FlockChat.</p>
      <div class="bz-trigger-actions">
        <button class="btn btn-primary" id="bz-build-btn" style="width:100%">⚒ Run Full Build + Deploy</button>
        <button class="btn btn-outline" style="width:100%;margin-top:8px" id="bz-css-btn">🎨 Sync CSS Only</button>
      </div>
      <div class="bz-build-log" id="bz-log" style="display:none"></div>
    </div>
  </div>

  <!-- Church deployments -->
  <div class="bz-card">
    <div class="bz-card-header">
      <h3 class="bz-card-title">Church Deployments</h3>
      <span class="bz-church-count">${CHURCHES.length} churches</span>
    </div>
    <div class="bz-church-list">
      ${CHURCHES.map(c => `
      <div class="bz-church-row">
        <div class="bz-church-dot ${c.status === 'live' ? 'bz-dot--green' : 'bz-dot--yellow'}"></div>
        <div class="bz-church-body">
          <div class="bz-church-name">${_e(c.name)}</div>
          <div class="bz-church-url">${_e(c.url)}</div>
        </div>
        <div class="bz-church-meta">
          <span class="bz-church-ver">v${_e(c.version)}</span>
          <span class="bz-church-build">${_e(c.lastBuild)}</span>
        </div>
        <span class="bz-live-badge">${_e(c.status)}</span>
      </div>`).join('')}
    </div>
  </div>

  <!-- Environment / config -->
  <div class="bz-card">
    <div class="bz-card-header">
      <h3 class="bz-card-title">Environment Config</h3>
      <button class="btn btn-outline" style="font-size:.78rem;padding:5px 12px" id="bz-reveal-btn">Show Values</button>
    </div>
    <div class="bz-env-list" id="bz-env-list">
      ${ENV_VARS.map(v => `
      <div class="bz-env-row">
        <code class="bz-env-key">${_e(v.key)}</code>
        <code class="bz-env-val ${v.secret ? 'bz-env--secret' : ''}" data-secret="${v.secret}" data-real="${_e(v.val)}">
          ${v.secret ? '••••••••' : _e(v.val)}
        </code>
      </div>`).join('')}
    </div>
  </div>

</section>`;
}

export function mount(root) {
  /* Reveal secrets toggle */
  let revealed = false;
  root.querySelector('#bz-reveal-btn')?.addEventListener('click', function() {
    revealed = !revealed;
    this.textContent = revealed ? 'Hide Values' : 'Show Values';
    root.querySelectorAll('.bz-env-val').forEach(el => {
      if (el.dataset.secret === 'true') {
        el.textContent = revealed ? el.dataset.real : '••••••••';
      }
    });
  });

  /* Build trigger — show simulated log */
  root.querySelector('#bz-build-btn')?.addEventListener('click', function() {
    const log = root.querySelector('#bz-log');
    if (!log) return;
    this.disabled = true;
    this.textContent = '⚙ Building…';
    log.style.display = 'block';
    const lines = [
      '$ bash Covenant/Bezalel/Scripts/A-Build_Churches.sh --deploy-comms',
      '→ Syncing SharedVessels CSS…',
      '→ rsync FlockOS → Nations/Root… done',
      '→ rsync FlockOS → Nations/GAS… done',
      '→ rsync FlockOS → Nations/TBC… done',
      '→ rsync FlockOS → Nations/TheForest… done',
      '→ Applying branding overlays… done',
      '→ Regenerating builds_codex.js… done',
      '→ Deploying comms hosting… done',
      '✓ Build complete in 4.2s',
    ];
    log.textContent = '';
    let i = 0;
    const tick = setInterval(() => {
      if (i < lines.length) { log.textContent += lines[i++] + '\n'; }
      else {
        clearInterval(tick);
        this.disabled = false;
        this.textContent = '⚒ Run Full Build + Deploy';
      }
    }, 350);
  });

  return () => {};
}
