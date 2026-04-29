/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: Bezalel — Deployment Docs & Build Tools
   "I have called by name Bezalel… and filled him with the Spirit of God. — Exodus 31:2-3"

   Tabs:
     • GAS Files    — fetches & displays B/C/D/E deployment docs with copy-to-clipboard
     • Church Setup — per-church DEPLOY_CONFIG generator (no secrets)
     • Deployments  — live church deployment status list

   Role gate: pastor+ (roleLevel ≥ 4)
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'bezalel';
export const title = 'Bezalel';

const _e = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* ── Role constants ────────────────────────────────────────────────────────── */
const ROLE_LEVELS = { readonly:0, volunteer:1, care:2, deacon:2, leader:3, treasurer:3, pastor:4, admin:5 };

function _roleLevel(role) {
  return ROLE_LEVELS[String(role || '').toLowerCase()] ?? -1;
}

function _isPastorPlus() {
  try {
    const N = window.Nehemiah;
    if (!N) return false;
    const sess = typeof N.getSession === 'function' ? N.getSession() : null;
    if (!sess) return false;
    return _roleLevel(sess.role) >= 4;
  } catch (_) { return false; }
}

/* ── GAS deployment doc definitions ────────────────────────────────────────── */
const GAS_DOCS = [
  {
    id: 'code',
    label: 'Code.gs',
    filename: 'B-Master Code.md',
    path: new URL('../../Architechtural Docs/B-Master Code.md', import.meta.url).href,
    description: 'Main GAS backend — paste as Code.gs. Contains all CRUD handlers, dispatcher, setupFlockOS(), and DEPLOY_CONFIG.',
  },
  {
    id: 'firestoresync',
    label: 'FirestoreSync.gs',
    filename: 'C-Master FirestoreSync.md',
    path: new URL('../../Architechtural Docs/C-Master FirestoreSync.md', import.meta.url).href,
    description: 'Hourly Firestore → Sheet sync. Paste as FirestoreSync.gs.',
  },
  {
    id: 'synchandler',
    label: 'SyncHandler.gs',
    filename: 'D-Master SyncHandler.md',
    path: new URL('../../Architechtural Docs/D-Master SyncHandler.md', import.meta.url).href,
    description: 'Receives Cloud Function → Sheet writes. Paste as SyncHandler.gs.',
  },
  {
    id: 'camelcase',
    label: 'CamelCase.gs',
    filename: 'E-Master CamelCase.md',
    path: new URL('../../Architechtural Docs/E-Master CamelCase.md', import.meta.url).href,
    description: 'Auto-generated FIELD_REVERSE_MAP (Firestore camelCase → Sheet headers). Paste as CamelCase.gs.',
  },
];

/* ── Church deployment definitions ────────────────────────────────────────── */
const CHURCHES = [
  {
    id: 'root',
    name: 'FlockOS Root',
    url: 'flockos.app',
    firebaseProject: 'flockos-notify',
    timezone: 'America/New_York',
    status: 'live',
    version: '2.0.0',
    gasUrl: 'https://script.google.com/macros/s/…ROOT…/exec',
  },
  {
    id: 'gas',
    name: 'GAS',
    url: 'gas.flockos.app',
    firebaseProject: null,          // GAS-only — no Firestore project
    timezone: 'America/New_York',
    status: 'live',
    version: '2.0.0',
    gasUrl: 'https://script.google.com/macros/s/…GAS…/exec',
  },
  {
    id: 'tbc',
    name: 'Trinity Bible Church',
    url: 'tbc.flockos.app',
    firebaseProject: 'flockos-trinity',
    timezone: 'America/New_York',
    status: 'live',
    version: '2.0.0',
    gasUrl: 'https://script.google.com/macros/s/…TBC…/exec',
  },
  {
    id: 'theforest',
    name: 'The Forest',
    url: 'theforest.flockos.app',
    firebaseProject: 'flockos-theforest',
    timezone: 'America/Chicago',
    status: 'live',
    version: '2.0.0',
    gasUrl: 'https://script.google.com/macros/s/…FOREST…/exec',
  },
  {
    id: 'comms',
    name: 'FlockChat (Comms)',
    url: 'comms.flockos.app',
    firebaseProject: 'flockos-comms',
    timezone: 'America/New_York',
    status: 'live',
    version: '1.4.2',
    gasUrl: 'https://script.google.com/macros/s/…COMMS…/exec',
  },
];


/* ── Render ───────────────────────────────────────────────────────────────── */
export function render() {
  return `<section class="bz-view" id="bz-root"></section>`;
}

/* ── Mount ────────────────────────────────────────────────────────────────── */
export function mount(root) {
  _render(root);
  return () => {};
}

/* ── Internal renderer ────────────────────────────────────────────────────── */
function _render(root, tab) {
  const activeTab = tab || 'gas-files';

  if (!_isPastorPlus()) {
    root.innerHTML = `
      ${pageHero({ title: 'Bezalel', subtitle: 'Build & deployment tools.', scripture: 'I have called by name Bezalel… and filled him with the Spirit of God. — Exodus 31:2-3' })}
      <div class="life-empty" style="padding:20px;text-align:center;color:var(--ink-muted);">
        <div style="font-size:2.5rem;margin-bottom:12px;">🔒</div>
        <p style="font-size:0.95rem;font-weight:600;">Pastor+ access required.</p>
        <p style="font-size:0.82rem;margin-top:6px;">This area is reserved for pastors and administrators.</p>
      </div>`;
    return;
  }

  const tabs = [
    { id: 'gas-files',    label: '📄 GAS Files'    },
    { id: 'church-setup', label: '⚙ Church Setup'  },
    { id: 'deployments',  label: '🚀 Deployments'  },
  ];

  const tabBar = `<div class="bz-tabbar" style="display:flex;gap:6px;flex-wrap:wrap;margin:12px 0 18px;">
    ${tabs.map(t => `<button class="bz-tab${activeTab === t.id ? ' bz-tab--active' : ''}" data-tab="${_e(t.id)}"
      style="${activeTab === t.id
        ? 'background:var(--accent);color:var(--ink-inverse);font-weight:700;border:none;'
        : 'background:none;color:var(--ink);border:1px solid var(--line);'}
      border-radius:6px;padding:7px 14px;cursor:pointer;font-size:0.82rem;font-family:inherit;white-space:nowrap;"
    >${_e(t.label)}</button>`).join('')}
  </div>`;

  let body = '';
  if (activeTab === 'gas-files')         body = _gasFilesTab();
  else if (activeTab === 'church-setup') body = _churchSetupTab();
  else if (activeTab === 'deployments')  body = _deploymentsTab();

  root.innerHTML = `
    ${pageHero({ title: 'Bezalel', subtitle: 'Build, deploy, and manage the FlockOS church network.', scripture: 'I have called by name Bezalel… and filled him with the Spirit of God. — Exodus 31:2-3' })}
    ${tabBar}
    <div id="bz-tab-body">${body}</div>`;

  /* Wire tab buttons */
  root.querySelectorAll('.bz-tab').forEach(btn => {
    btn.addEventListener('click', () => _render(root, btn.dataset.tab));
  });

  /* Wire copy buttons in GAS files tab */
  if (activeTab === 'gas-files') {
    root.querySelectorAll('.bz-fetch-btn').forEach(btn => {
      btn.addEventListener('click', () => _fetchAndShow(root, btn.dataset.docId));
    });
  }

  /* Wire church setup generator */
  if (activeTab === 'church-setup') {
    _wireChurchSetup(root);
  }

  /* Wire index copy buttons */
  if (activeTab === 'deployments') {
    _wireDeployments(root);
  }
}

/* ── GAS Files tab ────────────────────────────────────────────────────────── */
function _gasFilesTab() {
  return `
<div style="display:grid;gap:14px;">
  ${GAS_DOCS.map(doc => `
  <div class="bz-card" style="background:var(--bg-raised);border:1px solid var(--line);border-radius:12px;padding:16px;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:8px;">
      <div>
        <div style="font-size:1rem;font-weight:700;color:var(--ink);">${_e(doc.label)}</div>
        <div style="font-size:0.76rem;color:var(--ink-muted);margin-top:3px;">${_e(doc.filename)}</div>
      </div>
      <button class="bz-fetch-btn btn btn-primary" data-doc-id="${_e(doc.id)}" style="font-size:0.8rem;padding:7px 14px;white-space:nowrap;">
        📋 Load &amp; Copy
      </button>
    </div>
    <p style="font-size:0.82rem;color:var(--ink-muted);line-height:1.55;margin:0 0 10px;">${_e(doc.description)}</p>
    <div id="bz-doc-${_e(doc.id)}" style="display:none;">
      <pre id="bz-pre-${_e(doc.id)}" style="background:var(--bg-sunken);border:1px solid var(--line);border-radius:8px;
        padding:14px;font-size:0.76rem;line-height:1.55;overflow-x:auto;white-space:pre-wrap;word-break:break-word;
        max-height:420px;overflow-y:auto;color:var(--ink);font-family:monospace;"></pre>
    </div>
  </div>`).join('')}
</div>
<div style="margin-top:16px;padding:12px 14px;background:rgba(232,168,56,0.08);border:1px solid rgba(232,168,56,0.25);border-radius:8px;font-size:0.8rem;color:var(--ink-muted);line-height:1.5;">
  <strong style="color:var(--ink);">How to deploy a new church:</strong>
  Open the church's Google Sheet → Extensions → Apps Script → Create each file above →
  Paste the contents → Set Script Properties (FIREBASE_SERVICE_ACCOUNT, TRUTH_SERVICE_ACCOUNT) →
  Run <code style="background:rgba(0,0,0,0.1);padding:1px 5px;border-radius:3px;font-family:monospace;">setupFlockOS()</code> once.
</div>`;
}

/* Fetch a doc file and show/copy it */
async function _fetchAndShow(root, docId) {
  const doc = GAS_DOCS.find(d => d.id === docId);
  if (!doc) return;

  const btn = root.querySelector(`.bz-fetch-btn[data-doc-id="${docId}"]`);
  const pre = root.querySelector(`#bz-pre-${docId}`);
  const box = root.querySelector(`#bz-doc-${docId}`);
  if (!btn || !pre || !box) return;

  btn.disabled = true;
  btn.textContent = '⏳ Loading…';

  try {
    const resp = await fetch(doc.path);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await resp.text();
    pre.textContent = text;
    box.style.display = '';

    /* Copy to clipboard */
    try {
      await navigator.clipboard.writeText(text);
      btn.disabled = false;
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = '📋 Load & Copy'; }, 3000);
    } catch (_) {
      btn.disabled = false;
      btn.textContent = '📋 Loaded (select & copy)';
    }
  } catch (err) {
    btn.disabled = false;
    btn.textContent = '⚠ Error loading';
    pre.textContent = `Error: ${err.message}\n\nFallback: open the file directly at:\n${doc.path}`;
    box.style.display = '';
  }
}

/* ── Church Setup tab ─────────────────────────────────────────────────────── */
function _churchSetupTab() {
  const selectOpts = CHURCHES.map(c =>
    `<option value="${_e(c.id)}">${_e(c.name)}</option>`
  ).join('');

  return `
<div style="display:grid;gap:14px;">
  <div class="bz-card" style="background:var(--bg-raised);border:1px solid var(--line);border-radius:12px;padding:16px;">
    <div style="font-size:0.9rem;font-weight:700;color:var(--ink);margin-bottom:12px;">Generate DEPLOY_CONFIG</div>
    <p style="font-size:0.82rem;color:var(--ink-muted);line-height:1.55;margin:0 0 14px;">
      Select a church to generate the <code style="font-family:monospace;background:rgba(0,0,0,0.08);padding:1px 5px;border-radius:3px;">DEPLOY_CONFIG</code>
      block to paste at the top of that church's <strong>Code.gs</strong>.
      This block contains only public configuration — no secrets.
    </p>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px;">
      <select id="bz-church-select" style="flex:1;min-width:160px;padding:8px 12px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--ink);font-size:0.85rem;font-family:inherit;">
        <option value="">— Select a church —</option>
        ${selectOpts}
      </select>
      <button id="bz-gen-btn" class="btn btn-primary" style="font-size:0.82rem;padding:8px 16px;">⚙ Generate</button>
    </div>
    <div id="bz-setup-output" style="display:none;">
      <pre id="bz-setup-pre" style="background:var(--bg-sunken);border:1px solid var(--line);border-radius:8px;
        padding:14px;font-size:0.76rem;line-height:1.55;overflow-x:auto;white-space:pre-wrap;word-break:break-word;
        max-height:400px;overflow-y:auto;color:var(--ink);font-family:monospace;"></pre>
      <button id="bz-setup-copy" class="btn btn-outline" style="margin-top:10px;font-size:0.8rem;">📋 Copy</button>
    </div>
  </div>

  <div class="bz-card" style="background:var(--bg-raised);border:1px solid var(--line);border-radius:12px;padding:16px;">
    <div style="font-size:0.9rem;font-weight:700;color:var(--ink);margin-bottom:10px;">Script Properties Required</div>
    <p style="font-size:0.82rem;color:var(--ink-muted);line-height:1.55;margin:0 0 10px;">
      Set these in <strong>Apps Script → ⚙ Settings → Script Properties</strong>.
      These are secrets — never paste them here.
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:0.79rem;">
      <thead><tr style="border-bottom:1px solid var(--line);">
        <th style="text-align:left;padding:6px 8px;color:var(--ink-muted);font-weight:700;font-size:0.72rem;text-transform:uppercase;">Property</th>
        <th style="text-align:left;padding:6px 8px;color:var(--ink-muted);font-weight:700;font-size:0.72rem;text-transform:uppercase;">Description</th>
      </tr></thead>
      <tbody>
        ${[
          ['FIREBASE_SERVICE_ACCOUNT', "Service account JSON for this church's Firebase project"],
          ['TRUTH_SERVICE_ACCOUNT',    'Service account JSON for flockos-truth project (seed data)'],
          ['FIRESTORE_PROJECT_ID',     'Optional — Firebase project ID (e.g. flockos-trinity). Auto-resolved if ChurchRegistry is present.'],
        ].map(([k, v]) => `<tr style="border-bottom:1px solid var(--line);">
          <td style="padding:8px;font-family:monospace;color:var(--accent);font-size:0.76rem;">${_e(k)}</td>
          <td style="padding:8px;color:var(--ink-muted);">${_e(v)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>`;
}

function _wireChurchSetup(root) {
  const select = root.querySelector('#bz-church-select');
  const genBtn = root.querySelector('#bz-gen-btn');
  const output = root.querySelector('#bz-setup-output');
  const pre    = root.querySelector('#bz-setup-pre');
  const copy   = root.querySelector('#bz-setup-copy');

  genBtn?.addEventListener('click', () => {
    const id = select?.value;
    if (!id) { alert('Please select a church.'); return; }
    const church = CHURCHES.find(c => c.id === id);
    if (!church) return;

    const config = `// DEPLOY_CONFIG — ${church.name}
// Generated by New Covenant Bezalel · ${new Date().toISOString().split('T')[0]}
// Paste this block at the top of Code.gs for this church.
const DEPLOY_CONFIG = {
  churchName:   '${church.name}',
  timezone:     '${church.timezone}',
  churchAppUrl: 'https://${church.url}',
};`;

    pre.textContent = config;
    output.style.display = '';
  });

  copy?.addEventListener('click', async () => {
    const text = pre?.textContent || '';
    try {
      await navigator.clipboard.writeText(text);
      copy.textContent = '✓ Copied!';
      setTimeout(() => { copy.textContent = '📋 Copy'; }, 2500);
    } catch (_) {
      copy.textContent = 'Select & copy manually';
    }
  });
}

/* ── Deployments tab ──────────────────────────────────────────────────────── */
function _deploymentsTab() {
  const rows = CHURCHES.map(c => {
    const dot = c.status === 'live'
      ? '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;"></span>'
      : '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;"></span>';
    return `
    <tr style="border-bottom:1px solid var(--line);">
      <td style="padding:10px 8px;">${dot}</td>
      <td style="padding:10px 8px;font-weight:600;color:var(--ink);">${_e(c.name)}</td>
      <td style="padding:10px 8px;font-size:0.8rem;color:var(--ink-muted);">
        <a href="https://${_e(c.url)}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline;text-decoration-style:dotted;">${_e(c.url)}</a>
      </td>
      <td style="padding:10px 8px;font-size:0.78rem;color:var(--ink-muted);font-family:monospace;">${_e(c.firebaseProject)}</td>
      <td style="padding:10px 8px;"><span style="font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:99px;background:${c.status === 'live' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)'};color:${c.status === 'live' ? '#16a34a' : '#d97706'};border:1px solid ${c.status === 'live' ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'};">${_e(c.status)}</span></td>
      <td style="padding:10px 8px;font-size:0.78rem;color:var(--ink-muted);">v${_e(c.version)}</td>
    </tr>`;
  }).join('');

  return `
<div class="bz-card" style="background:var(--bg-raised);border:1px solid var(--line);border-radius:12px;overflow:hidden;">
  <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
    <thead>
      <tr style="border-bottom:2px solid var(--line);background:var(--bg-sunken);">
        <th style="padding:10px 8px;text-align:left;font-size:0.7rem;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.05em;"></th>
        <th style="padding:10px 8px;text-align:left;font-size:0.7rem;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.05em;">Church</th>
        <th style="padding:10px 8px;text-align:left;font-size:0.7rem;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.05em;">URL</th>
        <th style="padding:10px 8px;text-align:left;font-size:0.7rem;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.05em;">Firebase Project</th>
        <th style="padding:10px 8px;text-align:left;font-size:0.7rem;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.05em;">Status</th>
        <th style="padding:10px 8px;text-align:left;font-size:0.7rem;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.05em;">Version</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</div>
<div style="margin-top:12px;padding:10px 14px;background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.2);border-radius:8px;font-size:0.8rem;color:var(--ink-muted);">
  To add a new church, update <strong>CHURCHES</strong> in <code style="font-family:monospace;background:rgba(0,0,0,0.08);padding:1px 5px;border-radius:3px;">New_Covenant/Views/bezalel/index.js</code>
  and run a full BCP: <code style="font-family:monospace;background:rgba(0,0,0,0.08);padding:1px 5px;border-radius:3px;">bash "Running to Jesus/Bezalel/Scripts/A-Build_Churches.sh" --deploy-comms</code>
</div>

<div class="bz-card" style="background:var(--bg-raised);border:1px solid var(--line);border-radius:12px;padding:16px;margin-top:14px;">
  <div style="font-size:0.9rem;font-weight:700;color:var(--ink);margin-bottom:10px;">🗂 Firestore Index Deploy</div>
  <p style="font-size:0.82rem;color:var(--ink-muted);line-height:1.55;margin:0 0 12px;">
    Indexes auto-deploy on every BCP (<code style="font-family:monospace;background:rgba(0,0,0,0.08);padding:1px 5px;border-radius:3px;">--deploy-comms</code>).
    To deploy indexes manually to a single project, copy the command below.
    GAS has no Firestore — no index needed.
  </p>
  <div style="display:grid;gap:8px;">
    ${CHURCHES.filter(c => c.firebaseProject).map(c => `
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
      <span style="font-size:0.78rem;font-weight:600;color:var(--ink);min-width:140px;">${_e(c.name)}</span>
      <code id="bz-idx-cmd-${_e(c.id)}" style="flex:1;background:var(--bg-sunken);border:1px solid var(--line);border-radius:6px;padding:6px 10px;font-size:0.75rem;font-family:monospace;color:var(--ink);white-space:nowrap;overflow-x:auto;">firebase deploy --only firestore:indexes --project ${_e(c.firebaseProject)}</code>
      <button class="bz-idx-copy btn btn-outline" data-target="bz-idx-cmd-${_e(c.id)}" style="font-size:0.75rem;padding:5px 10px;white-space:nowrap;">📋 Copy</button>
    </div>`).join('')}
  </div>
</div>`;
}

function _wireDeployments(root) {
  root.querySelectorAll('.bz-idx-copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const el = root.querySelector(`#${btn.dataset.target}`);
      const text = el?.textContent?.trim() || '';
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = '✓ Copied!';
        setTimeout(() => { btn.textContent = '📋 Copy'; }, 2500);
      } catch (_) {
        btn.textContent = 'Select & copy';
      }
    });
  });
}
