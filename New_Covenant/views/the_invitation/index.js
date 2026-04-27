/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE INVITATION — Pending Members & Invite Management
   "Come unto me, all ye that labour and are heavy laden." — Matthew 11:28
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'the_invitation';
export const title = 'The Invitation';

const _e = s => String(s ?? '').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const PENDING = [
  { name: 'Aaron & Lisa Webb',   email: 'aaron.webb@…',    submitted: 'Apr 25', source: 'Web form',   role: 'visitor' },
  { name: 'Chloe Osei',          email: 'chloe.osei@…',    submitted: 'Apr 23', source: 'FlockChat',  role: 'visitor' },
  { name: 'Marcus Delacroix',    email: 'm.delacroix@…',   submitted: 'Apr 20', source: 'QR code',    role: 'visitor' },
  { name: 'Naomi & Kwame B.',    email: 'naomi.b@…',       submitted: 'Apr 18', source: 'Referral',   role: 'visitor' },
];

const INVITE_STATS = [
  { label: 'Pending Approval', n: 4,  color: 'var(--gold)' },
  { label: 'Approved This Month', n: 12, color: 'var(--c-emerald)' },
  { label: 'Invites Sent',     n: 28, color: 'var(--c-sky)' },
  { label: 'Accepted',         n: 19, color: 'var(--c-violet)' },
];

export function render() {
  return /* html */`
    <section class="inv-view">
      ${pageHero({
        title:    'The Invitation',
        subtitle: 'Pending member requests, invitations, and onboarding — every door opened in love.',
        scripture: 'Come unto me, all ye that labour and are heavy laden. — Matthew 11:28',
      })}

      <!-- Stats strip -->
      <div class="inv-stats">
        ${INVITE_STATS.map(s => `
        <div class="inv-stat-card">
          <div class="inv-stat-n" style="color:${s.color}">${s.n}</div>
          <div class="inv-stat-label">${_e(s.label)}</div>
        </div>`).join('')}
      </div>

      <!-- Pending approvals -->
      <div class="way-section-header" style="margin-top:24px;">
        <h2 class="way-section-title">Pending Approval</h2>
        <button class="flock-btn flock-btn--primary" style="display:flex;align-items:center;gap:6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/></svg>
          Send Invite
        </button>
      </div>
      <div class="inv-list" data-bind="pending">
        ${PENDING.map(_pendingRow).join('')}
      </div>

      <!-- Send a new invite -->
      <div class="way-section-header" style="margin-top:28px;">
        <h2 class="way-section-title">Invite Someone</h2>
      </div>
      <div class="inv-invite-card">
        <input class="fold-search" type="email" placeholder="Email address…" style="max-width:360px;" data-bind="invite-email" />
        <select class="inv-select" data-bind="invite-role">
          <option value="visitor">Visitor</option>
          <option value="member">Member</option>
          <option value="leader">Leader</option>
        </select>
        <button class="flock-btn flock-btn--primary" data-act="send-invite">Send Invitation</button>
        <div class="inv-invite-note" data-bind="invite-status"></div>
      </div>
    </section>
  `;
}

export function mount(root) {
  _loadPending(root);
  _wireInvite(root);
  return () => {};
}

function _rows(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.rows)) return res.rows;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

async function _loadPending(root) {
  const V = window.TheVine;
  if (!V) return;
  const listEl = root.querySelector('[data-bind="pending"]');
  if (!listEl) return;

  try {
    const res  = await V.admin.users.pending();
    const rows = _rows(res);
    if (!rows.length) return;

    const users = rows.map(u => ({
      id:        u.id || u.uid || '',
      name:      u.displayName || u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown',
      email:     u.email || '',
      submitted: (() => {
        const ms = u.createdAt?.seconds ? u.createdAt.seconds * 1000 : (u.submittedAt ? new Date(u.submittedAt).getTime() : 0);
        return ms ? new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
      })(),
      source:    u.source || u.signUpSource || '—',
      role:      u.role || 'visitor',
    }));
    listEl.innerHTML = users.map(_pendingRow).join('');

    // Wire approve / deny on live rows
    listEl.querySelectorAll('.inv-pending-row').forEach((row, i) => {
      const u = users[i];
      if (!u?.id) return;
      row.querySelector('.inv-approve-btn')?.addEventListener('click', async e => {
        e.stopPropagation();
        const btn = e.currentTarget;
        btn.disabled = true; btn.textContent = 'Approving…';
        try {
          await V.admin.users.approve({ id: u.id });
          row.remove();
        } catch (_) { btn.disabled = false; btn.textContent = 'Approve'; }
      });
      row.querySelector('.inv-deny-btn')?.addEventListener('click', async e => {
        e.stopPropagation();
        if (!confirm(`Deny membership request from ${u.name}?`)) return;
        const btn = e.currentTarget;
        btn.disabled = true; btn.textContent = 'Denying…';
        try {
          await V.admin.users.deny({ id: u.id });
          row.remove();
        } catch (_) { btn.disabled = false; btn.textContent = 'Deny'; }
      });
    });
  } catch (err) {
    console.error('[TheInvitation] users.pending error:', err);
  }
}

function _wireInvite(root) {
  const btn    = root.querySelector('[data-act="send-invite"]');
  const emailEl = root.querySelector('[data-bind="invite-email"]');
  const roleEl  = root.querySelector('[data-bind="invite-role"]');
  const status  = root.querySelector('[data-bind="invite-status"]');
  if (!btn || !emailEl) return;

  btn.addEventListener('click', async () => {
    const email = (emailEl.value || '').trim();
    const role  = roleEl?.value || 'visitor';
    if (!email || !email.includes('@')) {
      if (status) { status.textContent = 'Please enter a valid email address.'; status.style.color = '#dc2626'; }
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      const V = window.TheVine;
      if (V && V.admin && V.admin.users && V.admin.users.create) {
        await V.admin.users.create({ email, role });
      }
      emailEl.value = '';
      if (status) { status.textContent = `Invitation sent to ${email}.`; status.style.color = '#059669'; }
    } catch (err) {
      if (status) { status.textContent = 'Could not send — check the admin backend.'; status.style.color = '#dc2626'; }
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Invitation';
    }
  });
}

function _pendingRow(u) {
  const initials = u.name.split(/\s+/).map(w => w[0] || '').slice(0,2).join('').toUpperCase() || '?';
  return /* html */`
    <article class="inv-pending-row" tabindex="0">
      <div class="fold-avatar" style="background:linear-gradient(135deg,#7c3aed,#0ea5e9);width:38px;height:38px;font-size:.78rem;">${_e(initials)}</div>
      <div class="inv-pending-body">
        <div class="inv-pending-name">${_e(u.name)}</div>
        <div class="inv-pending-meta">
          ${u.email ? `<span>${_e(u.email)}</span><span>·</span>` : ''}
          <span>${_e(u.source)}</span>
          ${u.submitted ? `<span>·</span><span>${_e(u.submitted)}</span>` : ''}
        </div>
      </div>
      <div class="inv-pending-actions">
        <button class="flock-btn flock-btn--ghost inv-deny-btn" style="font-size:.78rem;padding:5px 12px">Deny</button>
        <button class="flock-btn flock-btn--primary inv-approve-btn" style="font-size:.78rem;padding:5px 12px">Approve</button>
      </div>
    </article>`;
}

