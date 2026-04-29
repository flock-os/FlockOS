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
    custom: 'church',
  },
  {
    key: 'members', label: 'Membership',
    icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    custom: 'members',
  },
  {
    key: 'roles', label: 'Roles & Access',
    icon: '<path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"/>',
    custom: 'roles',
  },
  {
    key: 'integrations', label: 'Integrations',
    icon: '<rect x="2" y="2" width="6" height="6" rx="1"/><rect x="16" y="2" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M5 8v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/>',
    settings: [
      { label: 'Firebase Project',  value: 'flockos-comms',              type: 'text'  },
      { label: 'GAS Endpoint',      value: 'Connected (TheScrolls)',      type: 'badge', status: 'ok'   },
      { label: 'Push Notifications',value: 'VAPID key set',              type: 'badge', status: 'ok'   },
      { label: 'Joshua Project API', type: 'jp-api' },
      { label: 'api.bible',           type: 'bible-api' },
    ],
  },
  {
    key: 'notifications', label: 'Notifications',
    icon: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    custom: 'notifications',
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
              ${s.custom === 'audit'         ? _auditPanelMarkup()         :
                s.custom === 'church'        ? _churchPanelMarkup()        :
                s.custom === 'members'       ? _membersPanelMarkup()       :
                s.custom === 'roles'         ? _rolesPanelMarkup()         :
                s.custom === 'notifications' ? _notifPanelMarkup()         : `
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

  // Church settings panel — load from Firestore and wire save
  _wireChurchPanel(root);

  // Membership settings panel
  _wireMembersPanel(root);

  // Roles & Access panel
  _wireRolesPanel(root);

  // Notifications panel
  _wireNotifPanel(root);

  // Audit panel wiring
  _wireAuditPanel(root);

  // JP API panel wiring — load status immediately
  _wireIntegrationsPanel(root);

  // When navigating to integrations, refresh both API statuses
  navBtns.forEach((btn) => {
    if (btn.dataset.wallSection === 'integrations') {
      btn.addEventListener('click', () => {
        _loadJpStatus(root);
        _loadBibleApiStatus(root);
      });
    }
  });

  return () => {};
}

/* ── Church settings panel ──────────────────────────────────────────────── */

const _CHURCH_FIELDS = [
  { key: 'church_name',     label: 'Church Name',      type: 'text',   placeholder: 'e.g. Grace Fellowship Church' },
  { key: 'church_website',  label: 'Website',          type: 'url',    placeholder: 'https://…' },
  { key: 'church_timezone', label: 'Time Zone',        type: 'tz',     placeholder: 'America/New_York' },
  { key: 'church_gathering',label: 'Weekly Gathering', type: 'text',   placeholder: 'e.g. Sunday, 10:00 AM'  },
  { key: 'church_address',  label: 'Address',          type: 'text',   placeholder: 'Street address'         },
  { key: 'church_phone',    label: 'Phone',            type: 'tel',    placeholder: '+1 (555) 000-0000'      },
  { key: 'church_email',    label: 'Contact Email',    type: 'email',  placeholder: 'info@church.org'        },
  { key: 'church_pastor',        label: 'Lead Pastor',            type: 'text',   placeholder: 'Full name'              },
  { key: 'LEAD_PASTOR_MEMBER_ID', label: 'Lead Pastor Member PIN',  type: 'text',   placeholder: 'e.g. M-00123',
    hint: 'The member PIN of the lead pastor. Used to auto-assign care cases and prayer requests.' },
];

const _TZ_OPTIONS = [
  'America/New_York','America/Chicago','America/Denver','America/Los_Angeles',
  'America/Phoenix','America/Anchorage','Pacific/Honolulu',
  'America/Toronto','America/Vancouver','America/Mexico_City',
  'Europe/London','Europe/Paris','Europe/Berlin','Europe/Rome',
  'Africa/Lagos','Africa/Nairobi','Africa/Johannesburg',
  'Asia/Jerusalem','Asia/Kolkata','Asia/Singapore','Asia/Tokyo',
  'Australia/Sydney','Pacific/Auckland',
];

function _churchPanelMarkup() {
  return /* html */`
    <div class="wall-church-form" data-bind="church-form">
      <div class="wall-settings-list">
        ${_CHURCH_FIELDS.map(f => {
          if (f.type === 'tz') return `
            <div class="wall-setting-row" style="align-items:center">
              <label class="wall-setting-label" for="church-field-${f.key}">${_e(f.label)}</label>
              <select class="wall-church-input" id="church-field-${f.key}" data-church-key="${f.key}">
                ${_TZ_OPTIONS.map(tz => `<option value="${_e(tz)}">${_e(tz)}</option>`).join('')}
              </select>
            </div>`;
          return `
            <div class="wall-setting-row" style="align-items:${f.hint ? 'flex-start' : 'center'}">
              <label class="wall-setting-label" for="church-field-${f.key}">${_e(f.label)}</label>
              <div style="flex:1;min-width:0">
                <input class="wall-church-input" id="church-field-${f.key}"
                  type="${f.type === 'tel' ? 'tel' : f.type === 'email' ? 'email' : f.type === 'url' ? 'url' : 'text'}"
                  data-church-key="${f.key}" placeholder="${_e(f.placeholder)}" value="">
                ${f.hint ? `<div class="wall-field-hint">${_e(f.hint)}</div>` : ''}
              </div>
            </div>`;
        }).join('')}
      </div>
      <div class="wall-church-status" data-bind="church-status" style="display:none;margin-top:8px;font-size:.85rem"></div>
      <div style="display:flex;align-items:center;gap:10px;margin-top:14px">
        <button class="flock-btn flock-btn--primary" data-act="church-save">Save Changes</button>
        <span class="wall-church-saved" data-bind="church-saved" style="display:none;color:var(--success,#16a34a);font-size:.85rem">✓ Saved</span>
      </div>
    </div>`;
}

function _wireChurchPanel(root) {
  const panel = root.querySelector('[data-wall-panel="general"]');
  if (!panel) return;

  // Load stored values from Firestore
  _loadChurchSettings(root);

  // Wire save button
  panel.addEventListener('click', async (e) => {
    if (!e.target.closest('[data-act="church-save"]')) return;
    await _saveChurchSettings(root);
  });
}

async function _loadChurchSettings(root) {
  const form = root.querySelector('[data-bind="church-form"]');
  if (!form) return;

  const UR = await _waitForUpperRoom(10000);
  if (!UR) return; // silently leave inputs blank if backend not ready

  await Promise.all(_CHURCH_FIELDS.map(async (f) => {
    try {
      const cfg = await UR.getAppConfig({ key: f.key });
      const val = cfg?.value || '';
      const el  = form.querySelector(`[data-church-key="${f.key}"]`);
      if (!el || !val) return;
      if (el.tagName === 'SELECT') el.value = val;
      else el.value = val;
    } catch (_) {}
  }));
}

async function _saveChurchSettings(root) {
  const form    = root.querySelector('[data-bind="church-form"]');
  const savedEl = root.querySelector('[data-bind="church-saved"]');
  const btn     = root.querySelector('[data-act="church-save"]');
  if (!form) return;

  const UR = window.UpperRoom;
  if (!UR) { alert('Backend not ready — try again in a moment.'); return; }

  btn.disabled = true; btn.textContent = 'Saving…';
  if (savedEl) savedEl.style.display = 'none';

  try {
    await Promise.all(_CHURCH_FIELDS.map(f => {
      const el  = form.querySelector(`[data-church-key="${f.key}"]`);
      const val = el ? el.value.trim() : '';
      return UR.setAppConfig({ key: f.key, value: val, category: 'church',
        description: f.label });
    }));
    if (savedEl) { savedEl.style.display = ''; setTimeout(() => { savedEl.style.display = 'none'; }, 3000); }
  } catch (err) {
    alert('Could not save: ' + (err?.message || String(err)));
  } finally {
    btn.disabled = false; btn.textContent = 'Save Changes';
  }
}

/* ── Membership settings panel ──────────────────────────────────────────── */

const _MEMBERS_FIELDS = [
  {
    key: 'members_approval', label: 'Member Approval', type: 'select',
    options: ['Pastor Review Required', 'Elder Board Approval', 'Self-Approval (Open)'],
  },
  {
    key: 'members_visitor_autotag', label: 'Visitor Auto-Tag', type: 'toggle',
    hint: 'Automatically tag new sign-ups as Visitor',
  },
  {
    key: 'members_directory', label: 'Directory Visible To', type: 'select',
    options: ['Members Only', 'All Logged-In Users', 'Admins & Leaders Only', 'Hidden'],
  },
  {
    key: 'members_inactive_after', label: 'Mark Inactive After', type: 'select',
    options: ['30 days no attendance', '60 days no attendance', '90 days no attendance',
              '6 months no attendance', '1 year no attendance', 'Never (manual only)'],
  },
];

function _membersPanelMarkup() {
  return _genericAppConfigPanel('members', _MEMBERS_FIELDS);
}

function _wireMembersPanel(root) {
  _wireAppConfigPanel(root, 'members', _MEMBERS_FIELDS);
}

/* ── Roles & Access settings panel ─────────────────────────────────────── */

const _ROLES_FIELDS = [
  { key: 'roles_admin',   label: 'Admin Role',   type: 'text', placeholder: 'e.g. Pastor, Elder Board' },
  { key: 'roles_leader',  label: 'Leader Role',  type: 'text', placeholder: 'e.g. Deacons, Ministry Leaders' },
  { key: 'roles_member',  label: 'Member Role',  type: 'text', placeholder: 'e.g. All confirmed members' },
  { key: 'roles_visitor', label: 'Visitor Role', type: 'text', placeholder: 'e.g. Unapproved accounts' },
];

function _rolesPanelMarkup() {
  return _genericAppConfigPanel('roles', _ROLES_FIELDS);
}

function _wireRolesPanel(root) {
  _wireAppConfigPanel(root, 'roles', _ROLES_FIELDS);
}

/* ── Notifications settings panel ───────────────────────────────────────── */

const _NOTIF_FIELDS = [
  {
    key: 'notif_prayer_request', label: 'New Prayer Request', type: 'multicheck',
    channels: ['Email', 'Push'], recipients: ['Pastors', 'Prayer Team', 'All Leaders'],
    recipientKey: 'notif_prayer_request_to',
  },
  {
    key: 'notif_new_visitor', label: 'New Visitor', type: 'multicheck',
    channels: ['Email', 'Push'], recipients: ['Welcome Team', 'Pastors', 'All Leaders'],
    recipientKey: 'notif_new_visitor_to',
  },
  {
    key: 'notif_urgent_care', label: 'Urgent Care Item', type: 'multicheck',
    channels: ['Email', 'Push'], recipients: ['Assigned Pastor', 'Pastors', 'All Leaders'],
    recipientKey: 'notif_urgent_care_to',
  },
  {
    key: 'notif_care_updates', label: 'Care Case Updates', type: 'select',
    hint: 'How aggressively to notify when a care case status changes',
    options: ['All updates', 'Major changes only', 'Resolved only', 'Off'],
  },
  {
    key: 'notif_weekly_summary', label: 'Weekly Summary', type: 'select',
    options: ['Off', 'Email → Admin (Monday)', 'Email → Admin (Friday)',
              'Email → All Leaders (Monday)', 'Email → All Leaders (Friday)'],
  },
];

function _notifPanelMarkup() {
  let html = '<div class="wall-church-form" data-bind="notif-form"><div class="wall-settings-list">';
  for (const f of _NOTIF_FIELDS) {
    if (f.type === 'multicheck') {
      html += `<div class="wall-setting-row wall-setting-row--col">
        <div class="wall-setting-label">${_e(f.label)}</div>
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start">
          <div style="display:flex;gap:14px;flex-wrap:wrap">
            ${f.channels.map(c => `
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font:.86rem var(--font-ui)">
                <input type="checkbox" data-notif-key="${_e(f.key)}" data-notif-channel="${_e(c)}"
                  style="width:15px;height:15px;cursor:pointer"> ${_e(c)}
              </label>`).join('')}
          </div>
          <div style="display:flex;align-items:center;gap:8px;font:.84rem var(--font-ui)">
            <span style="color:var(--ink-muted)">→</span>
            <select class="wall-church-input" data-notif-key="${_e(f.recipientKey)}" style="min-width:160px;max-width:200px">
              ${f.recipients.map(r => `<option value="${_e(r)}">${_e(r)}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>`;
    } else if (f.type === 'select') {
      html += `<div class="wall-setting-row" style="align-items:center">
        <div style="display:flex;flex-direction:column;gap:2px">
          <label class="wall-setting-label">${_e(f.label)}</label>
          ${f.hint ? `<span style="font:.75rem var(--font-ui);color:var(--ink-muted)">${_e(f.hint)}</span>` : ''}
        </div>
        <select class="wall-church-input" data-notif-key="${_e(f.key)}" style="min-width:200px;max-width:280px">
          ${f.options.map(o => `<option value="${_e(o)}">${_e(o)}</option>`).join('')}
        </select>
      </div>`;
    }
  }
  html += `</div>
    <div style="display:flex;align-items:center;gap:10px;margin-top:14px">
      <button class="flock-btn flock-btn--primary" data-act="notif-save">Save Changes</button>
      <span data-bind="notif-saved" style="display:none;color:var(--success,#16a34a);font-size:.85rem">✓ Saved</span>
    </div>
  </div>`;
  return html;
}

function _wireNotifPanel(root) {
  const panel = root.querySelector('[data-wall-panel="notifications"]');
  if (!panel) return;
  _loadNotifSettings(root);
  panel.addEventListener('click', async (e) => {
    if (e.target.closest('[data-act="notif-save"]')) await _saveNotifSettings(root);
  });
}

async function _loadNotifSettings(root) {
  const form = root.querySelector('[data-bind="notif-form"]');
  if (!form) return;
  const UR = await _waitForUpperRoom(10000);
  if (!UR) return;
  for (const f of _NOTIF_FIELDS) {
    if (f.type === 'multicheck') {
      try {
        const cfg = await UR.getAppConfig({ key: f.key });
        const saved = (cfg?.value || '').split(',').map(s => s.trim());
        form.querySelectorAll(`[data-notif-key="${f.key}"]`).forEach(cb => {
          cb.checked = saved.includes(cb.dataset.notifChannel);
        });
        const recipCfg = await UR.getAppConfig({ key: f.recipientKey });
        const sel = form.querySelector(`[data-notif-key="${f.recipientKey}"]`);
        if (sel && recipCfg?.value) sel.value = recipCfg.value;
      } catch (_) {}
    } else if (f.type === 'select') {
      try {
        const cfg = await UR.getAppConfig({ key: f.key });
        const sel = form.querySelector(`[data-notif-key="${f.key}"]`);
        if (sel && cfg?.value) sel.value = cfg.value;
      } catch (_) {}
    }
  }
}

async function _saveNotifSettings(root) {
  const form    = root.querySelector('[data-bind="notif-form"]');
  const savedEl = root.querySelector('[data-bind="notif-saved"]');
  const btn     = root.querySelector('[data-act="notif-save"]');
  const UR = window.UpperRoom;
  if (!UR) { alert('Backend not ready — try again in a moment.'); return; }
  btn.disabled = true; btn.textContent = 'Saving…';
  if (savedEl) savedEl.style.display = 'none';
  try {
    const writes = [];
    for (const f of _NOTIF_FIELDS) {
      if (f.type === 'multicheck') {
        const checked = [...form.querySelectorAll(`[data-notif-key="${f.key}"]`)]
          .filter(cb => cb.checked).map(cb => cb.dataset.notifChannel).join(', ');
        writes.push(UR.setAppConfig({ key: f.key, value: checked, category: 'notifications', description: f.label }));
        const sel = form.querySelector(`[data-notif-key="${f.recipientKey}"]`);
        if (sel) writes.push(UR.setAppConfig({ key: f.recipientKey, value: sel.value, category: 'notifications', description: f.label + ' recipients' }));
      } else if (f.type === 'select') {
        const sel = form.querySelector(`[data-notif-key="${f.key}"]`);
        if (sel) writes.push(UR.setAppConfig({ key: f.key, value: sel.value, category: 'notifications', description: f.label }));
      }
    }
    await Promise.all(writes);
    if (savedEl) { savedEl.style.display = ''; setTimeout(() => { savedEl.style.display = 'none'; }, 3000); }
  } catch (err) {
    alert('Could not save: ' + (err?.message || String(err)));
  } finally {
    btn.disabled = false; btn.textContent = 'Save Changes';
  }
}

/* ── Generic app-config panel helpers (Membership, Roles) ───────────────── */

function _genericAppConfigPanel(panelKey, fields) {
  let html = `<div class="wall-church-form" data-bind="${panelKey}-form"><div class="wall-settings-list">`;
  for (const f of fields) {
    if (f.type === 'toggle') {
      html += `<div class="wall-setting-row" style="align-items:center">
        <div style="display:flex;flex-direction:column;gap:2px">
          <label class="wall-setting-label">${_e(f.label)}</label>
          ${f.hint ? `<span style="font:.75rem var(--font-ui);color:var(--ink-muted)">${_e(f.hint)}</span>` : ''}
        </div>
        <div class="wall-toggle" data-appconfig-key="${_e(f.key)}" role="switch" tabindex="0">
          <div class="wall-toggle-thumb"></div>
        </div>
      </div>`;
    } else if (f.type === 'select') {
      html += `<div class="wall-setting-row" style="align-items:center">
        <label class="wall-setting-label">${_e(f.label)}</label>
        <select class="wall-church-input" data-appconfig-key="${_e(f.key)}">
          ${f.options.map(o => `<option value="${_e(o)}">${_e(o)}</option>`).join('')}
        </select>
      </div>`;
    } else {
      html += `<div class="wall-setting-row" style="align-items:center">
        <label class="wall-setting-label">${_e(f.label)}</label>
        <input class="wall-church-input" type="text" data-appconfig-key="${_e(f.key)}"
          placeholder="${_e(f.placeholder || '')}" value="">
      </div>`;
    }
  }
  html += `</div>
    <div style="display:flex;align-items:center;gap:10px;margin-top:14px">
      <button class="flock-btn flock-btn--primary" data-act="${panelKey}-save">Save Changes</button>
      <span data-bind="${panelKey}-saved" style="display:none;color:var(--success,#16a34a);font-size:.85rem">✓ Saved</span>
    </div>
  </div>`;
  return html;
}

function _wireAppConfigPanel(root, panelKey, fields) {
  const panel = root.querySelector(`[data-wall-panel="${panelKey}"]`);
  if (!panel) return;

  // Wire toggles
  panel.querySelectorAll('.wall-toggle[data-appconfig-key]').forEach(t => {
    t.addEventListener('click', () => t.classList.toggle('wall-toggle--on'));
    t.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') t.classList.toggle('wall-toggle--on'); });
  });

  // Load values
  _loadAppConfigPanel(root, panelKey, fields);

  // Save
  panel.addEventListener('click', async (e) => {
    if (e.target.closest(`[data-act="${panelKey}-save"]`)) await _saveAppConfigPanel(root, panelKey, fields);
  });
}

async function _loadAppConfigPanel(root, panelKey, fields) {
  const panelEl = root.querySelector(`[data-wall-panel="${panelKey}"]`);
  if (!panelEl) return;
  const UR = await _waitForUpperRoom(10000);
  if (!UR) return;
  for (const f of fields) {
    try {
      const cfg = await UR.getAppConfig({ key: f.key });
      const val = cfg?.value || '';
      if (!val) continue;
      const el = panelEl.querySelector(`[data-appconfig-key="${f.key}"]`);
      if (!el) continue;
      if (f.type === 'toggle') {
        if (val === 'true' || val === '1' || val.toLowerCase() === 'enabled') {
          el.classList.add('wall-toggle--on');
        }
      } else if (el.tagName === 'SELECT') {
        el.value = val;
      } else {
        el.value = val;
      }
    } catch (_) {}
  }
}

async function _saveAppConfigPanel(root, panelKey, fields) {
  const panelEl = root.querySelector(`[data-wall-panel="${panelKey}"]`);
  const savedEl = root.querySelector(`[data-bind="${panelKey}-saved"]`);
  const btn     = root.querySelector(`[data-act="${panelKey}-save"]`);
  const UR = window.UpperRoom;
  if (!UR) { alert('Backend not ready — try again in a moment.'); return; }
  btn.disabled = true; btn.textContent = 'Saving…';
  if (savedEl) savedEl.style.display = 'none';
  try {
    await Promise.all(fields.map(f => {
      const el = panelEl.querySelector(`[data-appconfig-key="${f.key}"]`);
      let val = '';
      if (f.type === 'toggle') val = el?.classList.contains('wall-toggle--on') ? 'enabled' : 'disabled';
      else val = el?.value?.trim() || '';
      return UR.setAppConfig({ key: f.key, value: val, category: panelKey, description: f.label });
    }));
    if (savedEl) { savedEl.style.display = ''; setTimeout(() => { savedEl.style.display = 'none'; }, 3000); }
  } catch (err) {
    alert('Could not save: ' + (err?.message || String(err)));
  } finally {
    btn.disabled = false; btn.textContent = 'Save Changes';
  }
}

/* ── Joshua Project API integration ────────────────────────────────────── */

const JP_API_BASE = 'https://api.joshuaproject.net/v1';
const JP_CONFIG_KEY = 'jp_api_key';
const BIBLE_API_BASE   = 'https://rest.api.bible/v1';
const BIBLE_CONFIG_KEY = 'bible_api_key';

function _wireIntegrationsPanel(root) {
  const panel = root.querySelector('[data-wall-panel="integrations"]');
  if (!panel) return;
  panel.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    if (btn.dataset.act === 'jp-save-test') {
      const input = panel.querySelector('[data-bind="jp-key-input"]');
      const key = input?.value.trim();
      if (key) await _saveAndTestJpKey(root, key);
    }
    if (btn.dataset.act === 'bible-save-test') {
      const input = panel.querySelector('[data-bind="bible-key-input"]');
      const key = input?.value.trim();
      if (key) await _saveAndTestBibleApiKey(root, key);
    }
  });
  // Load saved key statuses on first render
  _loadJpStatus(root);
  _loadBibleApiStatus(root);
}

async function _loadJpStatus(root) {
  const badge  = root.querySelector('[data-bind="jp-status"]');
  const input  = root.querySelector('[data-bind="jp-key-input"]');
  if (!badge) return;

  _setJpBadge(badge, 'checking');

  const UR = await _waitForUpperRoom(10000);
  if (!UR) { _setJpBadge(badge, 'no-backend'); return; }

  let storedKey = '';
  try {
    const cfg = await UR.getAppConfig({ key: JP_CONFIG_KEY });
    storedKey = cfg.value || '';
  } catch (_) { /* Firestore not ready */ }

  if (!storedKey) {
    _setJpBadge(badge, 'not-set');
    return;
  }

  // Mask the input so it's clear a key is saved without exposing it
  if (input) input.placeholder = '••••••••  (key saved — paste new to replace)';

  _setJpBadge(badge, 'testing');
  const ok = await _testJpApiKey(storedKey);
  _setJpBadge(badge, ok ? 'ok' : 'invalid');
}

async function _saveAndTestJpKey(root, key) {
  const badge = root.querySelector('[data-bind="jp-status"]');
  const input = root.querySelector('[data-bind="jp-key-input"]');
  if (!badge) return;

  _setJpBadge(badge, 'testing');

  const ok = await _testJpApiKey(key);
  if (!ok) { _setJpBadge(badge, 'invalid'); return; }

  const UR = window.UpperRoom;
  if (UR && UR.setAppConfig) {
    try {
      await UR.setAppConfig({ key: JP_CONFIG_KEY, value: key, category: 'integrations',
        description: 'Joshua Project API key — api.joshuaproject.net' });
    } catch (err) {
      _setJpBadge(badge, 'save-error');
      return;
    }
  }

  if (input) {
    input.value = '';
    input.placeholder = '••••••••  (key saved — paste new to replace)';
  }
  _setJpBadge(badge, 'ok');
}

async function _testJpApiKey(key) {
  try {
    const url = `${JP_API_BASE}/people_groups/daily_unreached.json?api_key=${encodeURIComponent(key)}`;
    const res = await fetch(url);
    if (!res.ok) return false;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0;
  } catch (_) {
    return false;
  }
}

function _setJpBadge(badge, state) {
  const map = {
    checking:   { status: 'muted', text: 'Checking…'        },
    testing:    { status: 'muted', text: 'Testing…'         },
    ok:         { status: 'ok',   text: 'Connected'         },
    invalid:    { status: 'warn', text: 'Invalid key'       },
    'not-set':  { status: 'warn', text: 'Not connected'     },
    'no-backend': { status: 'warn', text: 'Backend offline' },
    'save-error': { status: 'warn', text: 'Save failed'     },
  };
  const { status, text } = map[state] || map['not-set'];
  badge.className = `wall-status-badge wall-status--${status}`;
  badge.textContent = text;
}

/* ── api.bible integration ──────────────────────────────────────────────── */

async function _loadBibleApiStatus(root) {
  const badge = root.querySelector('[data-bind="bible-status"]');
  const input = root.querySelector('[data-bind="bible-key-input"]');
  if (!badge) return;

  _setBibleBadge(badge, 'checking');

  const UR = await _waitForUpperRoom(10000);
  if (!UR) { _setBibleBadge(badge, 'no-backend'); return; }

  let storedKey = '';
  try {
    const cfg = await UR.getAppConfig({ key: BIBLE_CONFIG_KEY });
    storedKey = cfg.value || '';
  } catch (_) {}

  if (!storedKey) { _setBibleBadge(badge, 'not-set'); return; }

  if (input) input.placeholder = '••••••••  (key saved — paste new to replace)';

  _setBibleBadge(badge, 'testing');
  const ok = await _testBibleApiKey(storedKey);
  _setBibleBadge(badge, ok ? 'ok' : 'invalid');
}

async function _saveAndTestBibleApiKey(root, key) {
  const badge = root.querySelector('[data-bind="bible-status"]');
  const input = root.querySelector('[data-bind="bible-key-input"]');
  if (!badge) return;

  _setBibleBadge(badge, 'testing');
  const ok = await _testBibleApiKey(key);
  if (!ok) { _setBibleBadge(badge, 'invalid'); return; }

  const UR = window.UpperRoom;
  if (UR && UR.setAppConfig) {
    try {
      await UR.setAppConfig({ key: BIBLE_CONFIG_KEY, value: key, category: 'integrations',
        description: 'api.bible key — scripture.api.bible' });
    } catch (_) { _setBibleBadge(badge, 'save-error'); return; }
  }

  if (input) {
    input.value = '';
    input.placeholder = '••••••••  (key saved — paste new to replace)';
  }
  _setBibleBadge(badge, 'ok');
}

async function _testBibleApiKey(key) {
  try {
    const res = await fetch(`${BIBLE_API_BASE}/bibles`, {
      headers: { 'api-key': key },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Array.isArray(data?.data) && data.data.length > 0;
  } catch (_) { return false; }
}

function _setBibleBadge(badge, state) {
  const map = {
    checking:     { status: 'muted', text: 'Checking…'        },
    testing:      { status: 'muted', text: 'Testing…'         },
    ok:           { status: 'ok',    text: 'Connected'         },
    invalid:      { status: 'warn',  text: 'Invalid key'       },
    'not-set':    { status: 'warn',  text: 'Not connected'     },
    'no-backend': { status: 'warn',  text: 'Backend offline'   },
    'save-error': { status: 'warn',  text: 'Save failed'       },
  };
  const { status, text } = map[state] || map['not-set'];
  badge.className = `wall-status-badge wall-status--${status}`;
  badge.textContent = text;
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
  host.innerHTML = `<flock-skeleton rows="4"></flock-skeleton>`;

  // Wait for UpperRoom to come online (up to ~10s) before declaring "not ready".
  const UR = await _waitForUpperRoom(10000);
  if (!UR || !UR.auditDirectories) {
    host.innerHTML = `<div class="life-empty">Backend not ready yet — try Re-scan in a moment.</div>`;
    return;
  }

  try {
    const rows = await UR.auditDirectories();
    _renderAuditRows(host, rows);
  } catch (err) {
    host.innerHTML = `<div class="life-empty" style="color:#b91c1c">Audit failed: ${_e(err?.message || String(err))}</div>`;
  }
}

function _waitForUpperRoom(timeoutMs) {
  return new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      const UR = window.UpperRoom;
      if (UR && typeof UR.isReady === 'function' && UR.isReady()) {
        return resolve(UR);
      }
      if (Date.now() - start >= timeoutMs) return resolve(null);
      setTimeout(tick, 250);
    };
    tick();
  });
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
  if (s.type === 'jp-api') {
    return /* html */`
      <div class="wall-setting-row" style="align-items:flex-start;gap:12px">
        <div class="wall-setting-label" style="padding-top:6px">Joshua Project API</div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <span class="wall-status-badge wall-status--muted" data-bind="jp-status">Loading…</span>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end">
            <input type="password" class="wall-jp-key-input" data-bind="jp-key-input"
              placeholder="Paste API key…"
              autocomplete="off" spellcheck="false"
              style="font-size:.82rem;padding:5px 8px;border:1px solid var(--line,#e5e7ef);border-radius:6px;width:210px;background:var(--bg-raised,#fff);color:var(--ink,#1b264f)" />
            <button class="flock-btn flock-btn--primary flock-btn--sm" data-act="jp-save-test" type="button">Save &amp; Test</button>
          </div>
          <a href="https://api.joshuaproject.net/" target="_blank" rel="noopener noreferrer"
            style="font-size:.75rem;color:var(--accent,#4a7fa5);text-decoration:none">Get an API key ↗</a>
        </div>
      </div>`;
  }
  if (s.type === 'bible-api') {
    return /* html */`
      <div class="wall-setting-row" style="align-items:flex-start;gap:12px">
        <div class="wall-setting-label" style="padding-top:6px">api.bible</div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <span class="wall-status-badge wall-status--muted" data-bind="bible-status">Loading…</span>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end">
            <input type="password" class="wall-jp-key-input" data-bind="bible-key-input"
              placeholder="Paste API key…"
              autocomplete="off" spellcheck="false"
              style="font-size:.82rem;padding:5px 8px;border:1px solid var(--line,#e5e7ef);border-radius:6px;width:210px;background:var(--bg-raised,#fff);color:var(--ink,#1b264f)" />
            <button class="flock-btn flock-btn--primary flock-btn--sm" data-act="bible-save-test" type="button">Save &amp; Test</button>
          </div>
          <a href="https://scripture.api.bible/sign-up" target="_blank" rel="noopener noreferrer"
            style="font-size:.75rem;color:var(--accent,#4a7fa5);text-decoration:none">Get a free key at api.bible ↗</a>
        </div>
      </div>`;
  }
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

