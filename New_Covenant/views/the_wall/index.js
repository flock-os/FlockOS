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
              <div class="wall-settings-list">
                ${s.settings.map(_settingRow).join('')}
              </div>
              <button class="flock-btn flock-btn--primary wall-save-btn">Save Changes</button>
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
    });
  });

  // Toggle switches
  root.querySelectorAll('.wall-toggle').forEach((t) => {
    t.addEventListener('click', () => t.classList.toggle('wall-toggle--on'));
  });
  return () => {};
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

