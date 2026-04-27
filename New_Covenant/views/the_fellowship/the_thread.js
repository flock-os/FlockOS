/* ══════════════════════════════════════════════════════════════════════════════
   THE THREAD — Message stream + composer for one channel
   "Iron sharpeneth iron; so a man sharpeneth the countenance of his friend." — Pr 27:17
   ══════════════════════════════════════════════════════════════════════════════ */

import { messages, typing }   from '../../Scripts/the_upper_room/index.js';
import { renderMessage }      from './the_message.js';
import { renderComposer }     from './the_composer.js';

export function renderThread(host, { channelId }) {
  if (!host || !channelId) return () => {};
  host.innerHTML = `
    <div style="display:flex; flex-direction:column; height:60vh; gap:8px;">
      <div data-bind="stream" style="flex:1; overflow-y:auto; padding:8px 4px; display:flex; flex-direction:column; gap:6px;">
        <flock-skeleton rows="6"></flock-skeleton>
      </div>
      <div data-bind="typing" style="min-height:1.1em; color:var(--ink-muted,#7a7f96); font-size:0.82rem;"></div>
      <div data-bind="composer"></div>
    </div>
  `;
  const stream  = host.querySelector('[data-bind="stream"]');
  const typBox  = host.querySelector('[data-bind="typing"]');
  const compose = host.querySelector('[data-bind="composer"]');

  let stopComposer = renderComposer(compose, { channelId });
  let unwatchMsgs  = () => {};
  let unwatchTyp   = () => {};

  messages.watch(channelId, (rows = []) => {
    stream.innerHTML = rows.length
      ? rows.map((m) => renderMessage(m)).join('')
      : `<div style="color:var(--ink-muted,#7a7f96); padding:24px 8px; text-align:center;">No messages yet. Be the first.</div>`;
    stream.scrollTop = stream.scrollHeight;
  }).then((u) => { unwatchMsgs = u; }).catch(() => {});

  typing.watch(channelId, (uids = []) => {
    typBox.textContent = uids.length
      ? `${uids.length} ${uids.length === 1 ? 'person is' : 'people are'} typing…`
      : '';
  }).then((u) => { unwatchTyp = u; }).catch(() => {});

  return () => {
    try { stopComposer(); } catch (_) {}
    try { unwatchMsgs();  } catch (_) {}
    try { unwatchTyp();   } catch (_) {}
  };
}
