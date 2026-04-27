/* ══════════════════════════════════════════════════════════════════════════════
   THE BREASTPLATE — Account drawer / role badges
   "Take the breastplate of righteousness." — Ephesians 6:14
   ══════════════════════════════════════════════════════════════════════════════ */

export function renderBadge(profile, { onSignOut } = {}) {
  if (!profile) return;
  const root = document.createElement('div');
  root.className = 'breastplate-overlay';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', 'Account');
  const initials = _initials(profile);
  root.innerHTML = `
    <div class="breastplate-panel">
      <div class="breastplate-id">
        <div class="breastplate-monogram" aria-hidden="true">${initials}</div>
        <div>
          <div class="breastplate-name">${_e(profile.firstName || '')} ${_e(profile.lastName || '')}</div>
          <div class="breastplate-role">${_e(profile.role || 'Member')}</div>
          <div class="breastplate-email">${_e(profile.email || '')}</div>
        </div>
      </div>
      <div class="breastplate-actions">
        <button type="button" data-act="close">Close</button>
        <button type="button" data-act="sign-out">Sign out</button>
      </div>
    </div>
  `;
  root.style.cssText = `position: fixed; inset: 0; z-index: 9100;
    background: rgba(20,24,40,0.45); display: flex;
    align-items: center; justify-content: center;`;
  const panel = root.querySelector('.breastplate-panel');
  panel.style.cssText = `background: var(--bg-raised, #fff); color: var(--ink, #1b264f);
    width: min(420px, 92vw); padding: 22px 24px; border-radius: 14px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    font: 1rem/1.45 'Noto Sans', sans-serif;
    display: flex; flex-direction: column; gap: 16px;`;

  root.querySelector('.breastplate-id').style.cssText =
    `display: flex; align-items: center; gap: 14px;`;
  root.querySelector('.breastplate-monogram').style.cssText =
    `width: 48px; height: 48px; border-radius: 50%;
     background: var(--accent, #e8a838); color: #fff;
     display: flex; align-items: center; justify-content: center;
     font-weight: 700; letter-spacing: 0.04em;`;
  root.querySelector('.breastplate-role').style.cssText =
    `font-size: 0.85rem; color: var(--ink-muted, #7a7f96);`;
  root.querySelector('.breastplate-email').style.cssText =
    `font-size: 0.85rem; color: var(--ink-muted, #7a7f96);`;
  root.querySelector('.breastplate-actions').style.cssText =
    `display: flex; justify-content: flex-end; gap: 8px;`;

  function close() { if (root.parentNode) root.parentNode.removeChild(root); }
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) { if (e.target === root) close(); return; }
    if (btn.dataset.act === 'close')    close();
    if (btn.dataset.act === 'sign-out') { close(); if (onSignOut) onSignOut(); }
  });
  document.body.appendChild(root);
}

function _initials(p) {
  const a = (p.firstName || '').trim()[0] || '';
  const b = (p.lastName  || '').trim()[0] || '';
  return ((a + b) || (p.email || '?')[0]).toUpperCase();
}
function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
