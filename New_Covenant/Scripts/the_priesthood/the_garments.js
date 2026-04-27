/* ══════════════════════════════════════════════════════════════════════════════
   THE GARMENTS — Sign-in form UI
   "Let thy priests be clothed with righteousness." — Psalm 132:9

   Phase I: a minimal modal that hands credentials to Nehemiah.login().
   Real visual polish comes via Adornment / american_garments later.
   ══════════════════════════════════════════════════════════════════════════════ */

import { weighAll, rules } from '../the_stones.js';

export async function renderGarments(/* { mode } */) {
  return new Promise((resolve) => {
    const root = document.createElement('div');
    root.className = 'garments-overlay';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Sign in');
    root.innerHTML = `
      <form class="garments-form" novalidate>
        <h2>Welcome back</h2>
        <p class="garments-quiet">Enter to tend the flock.</p>
        <label>Email
          <input type="email" name="email" autocomplete="email" required>
        </label>
        <label>Passcode
          <input type="password" name="passcode" autocomplete="current-password" inputmode="numeric" required>
        </label>
        <div class="garments-error" aria-live="polite"></div>
        <div class="garments-actions">
          <button type="button" data-act="cancel">Cancel</button>
          <button type="submit"  data-act="submit">Sign in</button>
        </div>
      </form>
    `;
    root.style.cssText = `
      position: fixed; inset: 0; z-index: 9100;
      background: rgba(20,24,40,0.5);
      display: flex; align-items: center; justify-content: center;
    `;
    const form = root.querySelector('form');
    form.style.cssText = `
      background: var(--bg-raised, #fff); color: var(--ink, #1b264f);
      width: min(420px, 92vw); padding: 22px 24px; border-radius: 14px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
      font: 1rem/1.45 'Noto Sans', sans-serif;
      display: flex; flex-direction: column; gap: 12px;
    `;
    form.querySelectorAll('label').forEach(l => l.style.cssText =
      `display: flex; flex-direction: column; gap: 4px; font-size: 0.9rem; color: var(--ink-muted, #7a7f96);`);
    form.querySelectorAll('input').forEach(i => i.style.cssText =
      `padding: 10px 12px; border: 1px solid var(--line, #e5e7ef); border-radius: 8px; font: inherit; color: var(--ink, #1b264f);`);
    form.querySelector('.garments-actions').style.cssText =
      `display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px;`;

    const errBox = form.querySelector('.garments-error');
    errBox.style.cssText = `color: #b91c1c; font-size: 0.85rem; min-height: 1.1em;`;

    function close(result) {
      if (root.parentNode) root.parentNode.removeChild(root);
      resolve(result);
    }

    form.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-act]');
      if (btn && btn.dataset.act === 'cancel') { e.preventDefault(); close({ ok: false, cancelled: true }); }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errBox.textContent = '';
      const email    = form.email.value.trim();
      const passcode = form.passcode.value;
      const v = weighAll(email, [rules.required, rules.email]);
      if (!v.ok) { errBox.textContent = v.message; return; }
      const v2 = weighAll(passcode, [rules.required]);
      if (!v2.ok) { errBox.textContent = v2.message; return; }

      try {
        const N = window.Nehemiah;
        if (!N || typeof N.login !== 'function') {
          errBox.textContent = 'Sign-in is unavailable right now.';
          return;
        }
        const result = await N.login({ email, passcode });
        if (result && result.ok) { close({ ok: true, profile: result.profile || null }); }
        else { errBox.textContent = (result && result.message) || 'That didn’t work. Check your details.'; }
      } catch (err) {
        errBox.textContent = err && err.message ? err.message : 'Something went wrong.';
      }
    });

    document.body.appendChild(root);
    setTimeout(() => form.email.focus(), 30);
  });
}
