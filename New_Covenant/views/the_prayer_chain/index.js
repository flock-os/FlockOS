/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE PRAYER CHAIN — Live prayer channel + GAS prayer log
   "Pray one for another." — James 5:16

   Two columns:
     • Left: live #prayer-chain channel (Firebase / TheUpperRoom).
     • Right: pending GAS prayer requests (TheLife.prayerRequests),
       so a pastor can see structured asks alongside live conversation.
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero, ensureVessels } from '../_frame.js';
import { messages } from '../../Scripts/the_upper_room/index.js';
import * as life     from '../../Scripts/the_life/index.js';
import { renderMessage }  from '../the_fellowship/the_message.js';
import { renderComposer } from '../the_fellowship/the_composer.js';

export const name  = 'the_prayer_chain';
export const title = 'Prayer Chain';

const CHANNEL_ID = 'prayer-chain';

export function render() {
  return `
    <section>
      ${pageHero({
        title: 'Prayer Chain',
        subtitle: 'Lift one another up in real time, and tend the structured prayer requests.',
        scripture: 'Pray one for another. — James 5:16',
      })}
      <div style="display:grid; grid-template-columns: 1fr 320px; gap:16px; min-height: 60vh;">
        <div data-bind="stream-wrap" style="display:flex; flex-direction:column; gap:8px;">
          <div data-bind="stream" style="flex:1; overflow-y:auto; padding:8px 4px;
            background:var(--bg-raised,#fff); border:1px solid var(--line,#e5e7ef);
            border-radius:12px; min-height:50vh; display:flex; flex-direction:column; gap:6px;">
            <flock-skeleton rows="6"></flock-skeleton>
          </div>
          <div data-bind="composer"></div>
        </div>
        <aside data-bind="requests"
               style="background:var(--bg-raised,#fff); border:1px solid var(--line,#e5e7ef);
                      border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:8px;">
          <div style="font:600 1rem 'Noto Serif',Georgia,serif;">Standing requests</div>
          <flock-skeleton rows="5"></flock-skeleton>
        </aside>
      </div>
    </section>
  `;
}

export function mount(root /*, ctx */) {
  ensureVessels('the_chalice', 'the_seal', 'the_basin', 'the_mantle', 'the_staff');

  const stream  = root.querySelector('[data-bind="stream"]');
  const compose = root.querySelector('[data-bind="composer"]');
  const reqs    = root.querySelector('[data-bind="requests"]');

  let unwatch = () => {};
  messages.watch(CHANNEL_ID, (rows = []) => {
    stream.innerHTML = rows.length
      ? rows.map(renderMessage).join('')
      : `<div style="color:var(--ink-muted,#7a7f96); padding:24px 8px; text-align:center;">Begin the chain. Pray a word.</div>`;
    stream.scrollTop = stream.scrollHeight;
  }).then((u) => { unwatch = u; }).catch(() => {
    stream.innerHTML = `<div style="color:var(--ink-muted,#7a7f96); padding:24px 8px;">Comms backend not loaded.</div>`;
  });

  const stopComposer = renderComposer(compose, { channelId: CHANNEL_ID });

  // GAS-side prayer requests
  life.prayerRequests().then((rows = []) => {
    const head = `<div style="font:600 1rem 'Noto Serif',Georgia,serif;">Standing requests</div>`;
    if (!rows.length) {
      reqs.innerHTML = head + `<div style="color:var(--ink-muted,#7a7f96);">No standing requests today.</div>`;
      return;
    }
    reqs.innerHTML = head + rows.map(_req).join('');
  }).catch(() => {
    reqs.innerHTML = `<div style="font:600 1rem 'Noto Serif',Georgia,serif;">Standing requests</div>
      <div style="color:var(--ink-muted,#7a7f96);">Pastoral backend unavailable right now.</div>`;
  });

  return () => { try { unwatch(); } catch (_) {} try { stopComposer(); } catch (_) {} };
}

function _req(p) {
  return `
    <div style="padding:10px 12px; border:1px solid var(--line,#e5e7ef); border-radius:10px;">
      <div style="font-weight:600; color:var(--ink,#1b264f);">${_e(p.title || p.subject || 'Prayer')}</div>
      <div style="color:var(--ink-muted,#7a7f96); font-size:0.85rem;">${_e(p.body || p.detail || '')}</div>
      <div style="color:var(--ink-muted,#7a7f96); font-size:0.78rem; margin-top:4px;">
        ${_e(p.requester || '')} ${p.ts ? '· ' + new Date(p.ts).toLocaleDateString() : ''}
      </div>
    </div>`;
}
function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
