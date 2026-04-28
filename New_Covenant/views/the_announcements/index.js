/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE ANNOUNCEMENTS — Read-only firehose
   "And the angel said unto them, Fear not: for, behold, I bring you good
    tidings of great joy." — Luke 2:10

   Shows the church's #announcements channel as a read-only stream. No
   composer; admins post via the Channels view.
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero, ensureVessels } from '../_frame.js';
import { messages } from '../../Scripts/the_upper_room/index.js';
import { renderMessage } from '../the_fellowship/the_message.js';

export const name  = 'the_announcements';
export const title = 'Announcements';

const CHANNEL_ID = 'announcements';

export function render() {
  return `
    <section>
      ${pageHero({
        title: 'Announcements',
        subtitle: 'A read-only firehose of what the leadership is saying.',
        scripture: 'I bring you good tidings of great joy. — Luke 2:10',
      })}
      <div class="ann-composer" style="display:flex; gap:8px; align-items:flex-start; margin-bottom:14px;
           padding:12px; background:var(--bg-raised,#fff); border:1px solid var(--line,#e5e7ef); border-radius:10px;">
        <textarea data-bind="input" rows="2" placeholder="Post an announcement to the whole church…"
          style="flex:1; padding:9px 12px; border:1px solid var(--line,#e5e7ef); border-radius:8px;
                 font:inherit; resize:vertical; min-height:42px; background:var(--bg,#f7f8fb);
                 color:var(--ink,#1b264f);"></textarea>
        <button type="button" class="flock-btn flock-btn--primary" data-act="post">Post</button>
      </div>
      <div data-bind="stream" style="display:flex; flex-direction:column; gap:6px;">
        <flock-skeleton rows="6"></flock-skeleton>
      </div>
    </section>
  `;
}

export function mount(root /*, ctx */) {
  ensureVessels('the_chalice', 'the_mantle');
  const stream = root.querySelector('[data-bind="stream"]');
  const input  = root.querySelector('[data-bind="input"]');
  const post   = root.querySelector('[data-act="post"]');
  let unwatch  = () => {};

  function paint(rows = []) {
    if (!rows.length) {
      stream.innerHTML = `<div style="color:var(--ink-muted,#7a7f96); padding:24px 8px; text-align:center;">No announcements yet. Post the first.</div>`;
      return;
    }
    stream.innerHTML = rows.slice().reverse().map((m) => `
      <div class="ann-msg" data-mid="${_e(String(m.id || ''))}" style="position:relative;">
        ${renderMessage(m)}
        <div class="ann-msg-actions" style="position:absolute; top:6px; right:6px; display:flex; gap:4px; opacity:0; transition:opacity 120ms;">
          <button type="button" class="flock-icon-btn flock-icon-btn--sm" data-act="edit" title="Edit" aria-label="Edit announcement">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </button>
          <button type="button" class="flock-icon-btn flock-icon-btn--sm flock-icon-btn--danger" data-act="delete" title="Delete" aria-label="Delete announcement">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6"/><path d="M10 11v6M14 11v6"/></svg>
          </button>
        </div>
      </div>`).join('');
    stream.querySelectorAll('.ann-msg').forEach((el) => {
      const actions = el.querySelector('.ann-msg-actions');
      el.addEventListener('mouseenter', () => { actions.style.opacity = '1'; });
      el.addEventListener('mouseleave', () => { actions.style.opacity = '0'; });
      el.querySelector('[data-act="edit"]')?.addEventListener('click', async () => {
        const m = rows.find((r) => String(r.id) === el.dataset.mid);
        if (!m) return;
        const next = prompt('Edit announcement:', m.body || m.text || '');
        if (next == null) return;
        const trimmed = next.trim();
        if (!trimmed) { alert('Announcement cannot be empty.'); return; }
        try { await messages.edit(CHANNEL_ID, m.id, { body: trimmed }); }
        catch (err) { console.error('[Announcements] edit:', err); alert(err?.message || 'Could not edit announcement.'); }
      });
      el.querySelector('[data-act="delete"]')?.addEventListener('click', async () => {
        if (!confirm('Delete this announcement? This cannot be undone.')) return;
        try { await messages.remove(CHANNEL_ID, el.dataset.mid); }
        catch (err) { console.error('[Announcements] delete:', err); alert(err?.message || 'Could not delete announcement.'); }
      });
    });
  }

  messages.watch(CHANNEL_ID, paint, { limit: 200 }).then((u) => { unwatch = u; }).catch(() => {
    stream.innerHTML = `<div style="color:var(--ink-muted,#7a7f96); padding:24px 8px;">Comms backend not loaded.</div>`;
  });

  async function _post() {
    const body = input.value.trim();
    if (!body) return;
    post.disabled = true; post.textContent = 'Posting…';
    try {
      await messages.send(CHANNEL_ID, { body });
      input.value = '';
    } catch (err) {
      console.error('[Announcements] send:', err);
      alert(err?.message || 'Could not post announcement.');
    } finally {
      post.disabled = false; post.textContent = 'Post';
      input.focus();
    }
  }
  post.addEventListener('click', _post);
  input.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); _post(); }
  });

  return () => { try { unwatch(); } catch (_) {} };
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
