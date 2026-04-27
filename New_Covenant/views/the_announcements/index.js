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
      <div data-bind="stream" style="display:flex; flex-direction:column; gap:6px;">
        <flock-skeleton rows="6"></flock-skeleton>
      </div>
    </section>
  `;
}

export function mount(root /*, ctx */) {
  ensureVessels('the_chalice', 'the_mantle');
  const stream = root.querySelector('[data-bind="stream"]');
  let unwatch = () => {};

  messages.watch(CHANNEL_ID, (rows = []) => {
    stream.innerHTML = rows.length
      ? rows.slice().reverse().map(renderMessage).join('')   // newest-first
      : `<div style="color:var(--ink-muted,#7a7f96); padding:24px 8px; text-align:center;">No announcements yet. Quiet seas today.</div>`;
  }, { limit: 200 }).then((u) => { unwatch = u; }).catch(() => {
    stream.innerHTML = `<div style="color:var(--ink-muted,#7a7f96); padding:24px 8px;">Comms backend not loaded.</div>`;
  });

  return () => { try { unwatch(); } catch (_) {} };
}
