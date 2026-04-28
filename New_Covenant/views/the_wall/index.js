/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE WALL — Admin & Church Settings
   "I have set watchmen on your walls, O Jerusalem." — Isaiah 62:6
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'the_wall';
export const title = 'Admin';

const SECTIONS = [
  {
    key: 'general', label: 'Church',
    icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    settings: [
      { label: 'Church Name',      value: 'Grace Fellowship Church', type: 'text'   },
      { label: 'Website',          value: 'gracefellowship.church',   type: 'text'   },
      { label: 'TimeZone',         value: 'America/New_York',         type: 'select' },
      { label: 'Weekly Gathering', value: 'Sunday, 10:00 AM',         type: 'text'   },
    ],
  },
  {
    key: 'members', label: 'Membership',
    icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    settings: [
      { label: 'Member Approval',     value: 'Pastor Review Required', type: 'select' },
      { label: 'Visitor Auto-Tag',    value: 'Enabled',                type: 'toggle', on: true  },
      { label: 'Directory Visible',   value: 'Members Only',           type: 'select' },
      { label: 'Inactive After',      value: '60 days no attendance',  type: 'select' },
    ],
  },
  {
    key: 'roles', label: 'Roles & Access',
    icon: '<path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"/>',
    settings: [
      { label: 'Admin Role',    value: 'Pastor, Elder Board',          type: 'text'   },
      { label: 'Leader Role',   value: 'Deacons, Ministry Leaders',    type: 'text'   },
      { label: 'Member Role',   value: 'All confirmed members',        type: 'text'   },
      { label: 'Visitor Role',  value: 'Unapproved accounts',          type: 'text'   },
    ],
  },
  {
    key: 'integrations', label: 'Integrations',
    icon: '<rect x="2" y="2" width="6" height="6" rx="1"/><rect x="16" y="2" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M5 8v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/>',
    settings: [
      { label: 'Firebase Project',  value: 'flockos-comms',              type: 'text'  },
      { label: 'GAS Endpoint',      value: 'Connected (TheScrolls)',      type: 'badge', status: 'ok'   },
      { label: 'Push Notifications',value: 'VAPID key set',              type: 'badge', status: 'ok'   },
      { label: 'Joshua Project API',value: 'Not connected',              type: 'badge', status: 'warn' },
    ],
  },
  {
    key: 'notifications', label: 'Notifications',
    icon: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    settings: [
      { label: 'New Prayer Request',  value: 'Email + Push → Pastors',    type: 'select' },
      { label: 'New Visitor',         value: 'Email → Welcome Team',       type: 'select' },
      { label: 'Urgent Care Item',    value: 'Push → Assigned Pastor',     type: 'select' },
      { label: 'Weekly Summary',      value: 'Email → Admin, every Monday',type: 'select' },
    ],
  },
  {
    key: 'audit', label: 'Audit & Initialize',
    icon: '<path d="M9 11l3 3 8-8"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    custom: 'audit',
  },
];

export function render() {
  return /* html */`
    <section class="wall-view">
      ${pageHero({
        title:    'Admin',
        subtitle: 'Church settings, roles, integrations, and configuration.',
        scripture: 'I have set watchmen on your walls, O Jerusalem. — Isaiah 62:6',
      })}

      <div class="life-empty" style="padding:10px 14px;margin:8px 0;background:rgba(232,168,56,0.08);border:1px solid rgba(232,168,56,0.25);border-radius:8px;color:var(--ink,#1b264f);font-size:.85rem">
        📄 <strong>Preview.</strong> Settings shown here are illustrative — the live admin backend is wired through the build pipeline. Save buttons do not yet persist.
      </div>

      <div class="wall-layout">
        <!-- Sidebar nav -->
        <nav class="wall-nav">
          ${SECTIONS.map((s, i) => `
            <button class="wall-nav-item${i === 0 ? ' is-active' : ''}" data-wall-section="${s.key}" type="button">
              <svg class="wall-nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${s.icon}</svg>
              ${_e(s.label)}
            </button>
          `).join('')}
        </nav>

        <!-- Settings panels -->
        <div class="wall-panels">
          ${SECTIONS.map((s, i) => `
            <div class="wall-panel${i === 0 ? '' : ' wall-panel--hidden'}" data-wall-panel="${s.key}">
              <h2 class="wall-panel-title">${_e(s.label)}</h2>
              ${s.custom === 'audit' ? _auditPanelMarkup() : `
                <div class="wall-settings-list">
                  ${s.settings.map(_settingRow).join('')}
                </div>
                <button class="flock-btn flock-btn--primary wall-save-btn">Save Changes</button>
              `}
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

export function mount(root) {
  const navBtns = root.querySelectorAll('[data-wall-section]');
  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      root.querySelectorAll('[data-wall-panel]').forEach(p => p.classList.add('wall-panel--hidden'));
      const panel = root.querySelector(`[data-wall-panel="${btn.dataset.wallSection}"]`);
      if (panel) panel.classList.remove('wall-panel--hidden');
      if (btn.dataset.wallSection === 'audit') _refreshAudit(root);
    });
  });

  // Toggle switches
  root.querySelectorAll('.wall-toggle').forEach((t) => {
    t.addEventListener('click', () => t.classList.toggle('wall-toggle--on'));
  });

  // Audit panel wiring
  _wireAuditPanel(root);

  return () => {};
}

/* ── Audit panel ────────────────────────────────────────────────────────── */
function _auditPanelMarkup() {
  return /* html */`
    <p class="wall-audit-intro" style="margin:0 0 14px;color:var(--ink-muted,#7a7f96);font-size:.9rem">
      Scans the live backend for well-known channels and collections this app expects.
      Anything missing can be created with one click — no manual Firestore work required.
    </p>
    <div class="wall-audit-actions" style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
      <button class="flock-btn flock-btn--ghost" data-act="audit-refresh" type="button">Re-scan</button>
      <button class="flock-btn flock-btn--primary" data-act="audit-init-all" type="button">Initialize all missing</button>
    </div>
    <div class="wall-audit-list" data-bind="audit-list">
      <flock-skeleton rows="4"></flock-skeleton>
    </div>
  `;
}

function _wireAuditPanel(root) {
  const panel = root.querySelector('[data-wall-panel="audit"]');
  if (!panel) return;
  panel.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === 'audit-refresh')  return _refreshAudit(root);
    if (act === 'audit-init-all') return _initAllMissing(root);
    if (act === 'audit-init')     return _initOne(root, btn.dataset.id);
  });
  // Initial load if user lands directly on audit (deep-link future-proof).
  if (!panel.classList.contains('wall-panel--hidden')) _refreshAudit(root);
}

async function _refreshAudit(root) {
  const host = root.querySelector('[data-bind="audit-list"]');
  if (!host) return;
  const UR = window.UpperRoom;
  if (!UR || !UR.isReady || !UR.isReady() || !UR.auditDirectories) {
    host.innerHTML = `<div class="life-empty">Backend not ready yet — try Re-scan in a moment.</div>`;
    return;
  }
  host.innerHTML = `<flock-skeleton rows="4"></flock-skeleton>`;
  try {
    const rows = await UR.auditDirectories();
    _renderAuditRows(host, rows);
  } catch (err) {
    host.innerHTML = `<div class="life-empty" style="color:#b91c1c">Audit failed: ${_e(err?.message || String(err))}</div>`;
  }
}

function _renderAuditRows(host, rows) {
  if (!rows.length) {
    host.innerHTML = `<div class="life-empty">No items to audit.</div>`;
    return;
  }
  host.innerHTML = rows.map((r) => {
    const ok = r.exists;
    const dot = ok
      ? '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#16a34a;margin-right:8px"></span>'
      : '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#e8a838;margin-right:8px"></span>';
    const status = ok ? 'Exists' : 'Missing';
    const action = ok
      ? `<span style="color:var(--ink-muted,#7a7f96);font-size:.85rem">OK</span>`
      : `<button class="flock-btn flock-btn--primary flock-btn--sm" data-act="audit-init" data-id="${_e(r.id)}" type="button">Create</button>`;
    return `
      <div class="wall-setting-row" data-row-id="${_e(r.id)}" style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid var(--line,#e5e7ef);border-radius:8px;margin-bottom:6px;background:var(--bg-raised,#fff)">
        <div style="display:flex;flex-direction:column;gap:2px;min-width:0">
          <div style="font-weight:600;color:var(--ink,#1b264f)">${dot}${_e(r.label)}</div>
          <div style="font-size:.78rem;color:var(--ink-muted,#7a7f96)">${_e(r.kind)} · ${_e(r.id)} · ${status}</div>
        </div>
        <div data-bind="action">${action}</div>
      </div>`;
  }).join('');
}

async function _initOne(root, id) {
  const UR = window.UpperRoom;
  if (!UR || !UR.initializeDirectory) return;
  const row = root.querySelector(`[data-row-id="${id}"] [data-bind="action"]`);
  if (row) row.innerHTML = `<span style="color:var(--ink-muted,#7a7f96);font-size:.85rem">Creating…</span>`;
  try {
    await UR.initializeDirectory(id);
    await _refreshAudit(root);
  } catch (err) {
    if (row) row.innerHTML = `<span style="color:#b91c1c;font-size:.8rem">${_e(err?.message || 'Failed')}</span>`;
  }
}

async function _initAllMissing(root) {
  const UR = window.UpperRoom;
  if (!UR || !UR.initializeAllMissing) return;
  const host = root.querySelector('[data-bind="audit-list"]');
  if (host) host.innerHTML = `<div class="life-empty">Initializing missing items…</div>`;
  try {
    const rows = await UR.initializeAllMissing();
    _renderAuditRows(host, rows);
  } catch (err) {
    if (host) host.innerHTML = `<div class="life-empty" style="color:#b91c1c">Initialization failed: ${_e(err?.message || String(err))}</div>`;
  }
}

function _settingRow(s) {
  if (s.type === 'toggle') {
    return /* html */`
      <div class="wall-setting-row">
        <div class="wall-setting-label">${_e(s.label)}</div>
        <div class="wall-toggle${s.on ? ' wall-toggle--on' : ''}" role="switch" aria-checked="${s.on}" tabindex="0">
          <div class="wall-toggle-thumb"></div>
        </div>
      </div>`;
  }
  if (s.type === 'badge') {
    return /* html */`
      <div class="wall-setting-row">
        <div class="wall-setting-label">${_e(s.label)}</div>
        <span class="wall-status-badge wall-status--${_e(s.status)}">${_e(s.value)}</span>
      </div>`;
  }
  return /* html */`
    <div class="wall-setting-row">
      <label class="wall-setting-label">${_e(s.label)}</label>
      <div class="wall-setting-value">${_e(s.value)}</div>
    </div>`;
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

