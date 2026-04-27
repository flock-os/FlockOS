/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE PRAYER CHAIN — Live prayer channel + structured prayer requests
   "Pray one for another." — James 5:16

   Two columns:
     • Left: live #prayer-chain channel (Firebase / TheUpperRoom).
     • Right: all active prayer requests so a pastor can tend them alongside
       the live conversation.
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';
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
      <div class="pc-layout">
        <div class="pc-stream-col">
          <div data-bind="stream" class="pc-stream">
            <div class="pc-stream-empty">Loading…</div>
          </div>
          <div data-bind="composer"></div>
        </div>
        <aside data-bind="requests" class="pc-requests-col">
          <div class="pc-col-hd">Standing Requests</div>
          <div class="pc-col-body pc-loading">Loading requests…</div>
        </aside>
      </div>
    </section>
  `;
}

export function mount(root) {
  const stream  = root.querySelector('[data-bind="stream"]');
  const compose = root.querySelector('[data-bind="composer"]');
  const reqs    = root.querySelector('[data-bind="requests"]');

  // ── Live stream ────────────────────────────────────────────────────────
  let unwatch = () => {};
  messages.watch(CHANNEL_ID, (rows = []) => {
    stream.innerHTML = rows.length
      ? rows.map(renderMessage).join('')
      : `<div class="pc-stream-empty">Begin the chain. Pray a word.</div>`;
    stream.scrollTop = stream.scrollHeight;
  }).then((u) => { unwatch = u; }).catch(() => {
    stream.innerHTML = `<div class="pc-stream-empty">Live prayer channel unavailable.</div>`;
  });

  const stopComposer = renderComposer(compose, { channelId: CHANNEL_ID });

  // ── Standing requests ──────────────────────────────────────────────────
  life.prayerRequests().then((rows = []) => {
    const hd = `<div class="pc-col-hd">Standing Requests</div>`;
    if (!rows.length) {
      reqs.innerHTML = hd + `<div class="pc-col-empty">No standing requests right now.</div>`;
      return;
    }
    // Show open/new/in-progress first; answered/closed last
    const CLOSED = new Set(['answered', 'closed', 'archived', 'deleted']);
    const open   = rows.filter(r => !CLOSED.has((r.status || '').toLowerCase()));
    const closed = rows.filter(r =>  CLOSED.has((r.status || '').toLowerCase()));
    reqs.innerHTML = hd + [...open, ...closed].map(_req).join('');
  }).catch(() => {
    reqs.innerHTML = `<div class="pc-col-hd">Standing Requests</div>
      <div class="pc-col-empty">Prayer request backend unavailable.</div>`;
  });

  return () => { try { unwatch(); } catch (_) {} try { stopComposer(); } catch (_) {} };
}

// ── Prayer request card ────────────────────────────────────────────────────────
function _req(p) {
  const name    = _e(p.submitterName || p['Submitter Name'] || 'Anonymous');
  const text    = _e(p.prayerText    || p['Prayer Text']   || '');
  const cat     = p.category         || p['Category']      || '';
  const status  = p.status           || p['Status']        || 'New';
  const date    = _dateStr(p.submittedAt || p['Submitted At'] || p.createdAt);
  const isConf  = p.isConfidential === true || String(p.isConfidential || '').toUpperCase() === 'TRUE';
  const isAns   = status.toLowerCase() === 'answered';

  const statusMap = {
    new:        { color: '#5b8fcf', bg: 'rgba(91,143,207,0.10)'  },
    'in progress': { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    'follow-up':   { color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)' },
    answered:   { color: '#16a34a', bg: 'rgba(22,163,74,0.10)'   },
    closed:     { color: '#9ca3af', bg: 'rgba(156,163,175,0.10)' },
  };
  const s = statusMap[status.toLowerCase()] || statusMap.new;

  return `
    <div class="pc-req-card${isAns ? ' pc-req-answered' : ''}">
      <div class="pc-req-hd">
        <span class="pc-req-name">${name}</span>
        <span class="pc-req-status" style="color:${s.color};background:${s.bg};">${_e(status)}</span>
      </div>
      ${cat ? `<span class="pc-req-cat">${_e(cat)}</span>` : ''}
      ${text ? `<div class="pc-req-text">${text}</div>` : ''}
      <div class="pc-req-foot">
        ${isConf ? `<span class="pc-req-conf">🔒 Confidential</span>` : ''}
        ${date   ? `<span class="pc-req-date">${date}</span>` : ''}
      </div>
    </div>`;
}

function _dateStr(v) {
  if (!v) return '';
  try {
    const ms = v?.seconds ? v.seconds * 1000 : new Date(v).getTime();
    if (!ms || isNaN(ms)) return '';
    return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (_) { return ''; }
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
