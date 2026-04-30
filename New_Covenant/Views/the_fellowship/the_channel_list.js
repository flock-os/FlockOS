/* ══════════════════════════════════════════════════════════════════════════════
   THE CHANNEL LIST — Firebase channels pane
   "There is one body, and one Spirit." — Ephesians 4:4
   ══════════════════════════════════════════════════════════════════════════════ */

import { channels, unread, seeding } from '../../Scripts/the_upper_room/index.js';
import { renderThread } from './the_thread.js';

export function renderChannelsPane(host /*, ctx */) {
  if (!host) return () => {};
  host.innerHTML = `
    <div class="ch-pane" style="display:flex; flex-direction:column; gap:10px; min-height:60vh;">
      <header style="display:flex; align-items:center; gap:8px;">
        <strong style="flex:1; font:600 0.95rem 'Noto Sans',sans-serif; color:var(--ink,#1b264f);">Channels</strong>
        <button type="button" class="flock-btn flock-btn--primary flock-btn--sm" data-act="new-channel">+ New Channel</button>
      </header>
      <div class="ch-grid">
        <aside class="ch-list" style="overflow:auto;"></aside>
        <div class="ch-thread" style="min-width:0;"></div>
      </div>
    </div>
  `;
  const list   = host.querySelector('.ch-list');
  const thread = host.querySelector('.ch-thread');
  list.innerHTML = `<flock-skeleton rows="5"></flock-skeleton>`;
  thread.innerHTML = `<div style="color:var(--ink-muted,#7a7f96); padding:24px 8px;">Pick a channel to begin.</div>`;

  let stopThread = null;
  let activeId   = null;

  function paint(rows = []) {
    list.innerHTML = rows.length ? rows.map(_row).join('') :
      `<div style="color:var(--ink-muted,#7a7f96); padding:8px;">No channels yet. Click “+ New Channel” above.</div>`;
    list.querySelectorAll('[data-ch]').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-archive]')) return; // archive btn handled separately
        if (activeId === el.dataset.ch) return;
        activeId = el.dataset.ch;
        list.querySelectorAll('[data-ch]').forEach((n) => n.style.background = 'transparent');
        el.style.background = 'var(--bg,#f7f8fb)';
        if (stopThread) try { stopThread(); } catch (_) {}
        unread.mark(activeId);
        stopThread = renderThread(thread, { channelId: activeId });
      });
    });
    list.querySelectorAll('[data-archive]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id   = btn.dataset.archive;
        const name = btn.dataset.name || id;
        if (!confirm(`Archive #${name}? Members will lose access.`)) return;
        try { await channels.archive(id); }
        catch (err) { console.error('[Fellowship] archive channel:', err); alert(err?.message || 'Could not archive channel.'); }
      });
    });
  }

  host.querySelector('[data-act="new-channel"]').addEventListener('click', async () => {
    const name = prompt('Channel name (e.g. prayer, worship-team):');
    if (!name) return;
    const clean = name.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
    if (!clean) { alert('Please enter a valid channel name.'); return; }
    const description = prompt('Short description (optional):') || '';
    try { await channels.create({ name: clean, description }); }
    catch (err) { console.error('[Fellowship] create channel:', err); alert(err?.message || 'Could not create channel.'); }
  });

  // Seed defaults idempotently then watch.
  seeding.seed().catch(() => {});
  let unwatch = () => {};
  channels.watch(paint).then((u) => { unwatch = u; }).catch(() => {
    list.innerHTML = `<div style="color:var(--ink-muted,#7a7f96); padding:8px;">Comms backend not loaded.</div>`;
  });

  return () => { try { unwatch(); } catch (_) {} if (stopThread) try { stopThread(); } catch (_) {} };
}

function _row(c) {
  const badge = c && c.unread ? `<span style="background:var(--accent,#e8a838); color:#fff; padding:1px 6px; border-radius:10px; font-size:0.72rem;">${c.unread}</span>` : '';
  return `
    <div data-ch="${_e(c.id)}" class="ch-row"
      style="display:flex; align-items:center; gap:8px; width:100%; padding:8px 10px;
             cursor:pointer; border-radius:8px; color:var(--ink,#1b264f); text-align:left;
             font:500 0.92rem 'Noto Sans',sans-serif;">
      <span style="color:var(--ink-muted,#7a7f96);">#</span>
      <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${_e(c.name || c.id)}</span>
      ${badge}
      <button type="button" data-archive="${_e(c.id)}" data-name="${_e(c.name || c.id)}" title="Archive channel"
        class="flock-icon-btn flock-icon-btn--sm flock-icon-btn--warn">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><path d="M10 12h4"/></svg>
      </button>
    </div>`;
}
function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
