/* ══════════════════════════════════════════════════════════════════════════════
   THE INTERACTIONS PANE — GAS interaction ledger (TheScrolls)
   "And the books were opened." — Revelation 20:12

   The pastoral conversation ledger: calls, sms, emails, visits, notes,
   prayers, pastoral actions. Backed by Google Apps Script via TheVine.
   This is the "did we touch this person, when, why" surface — distinct from
   the live Firebase chat.
   ══════════════════════════════════════════════════════════════════════════════ */

import * as scrolls from '../../Scripts/the_scrolls/index.js';

export function renderInteractionsPane(host /*, ctx */) {
  if (!host) return () => {};
  host.innerHTML = `
    <div class="ix-pane" style="display:flex; flex-direction:column; gap:10px; min-height:60vh;">
      <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
        <select id="ix-type" style="padding:8px 10px; border:1px solid var(--line,#e5e7ef);
                border-radius:8px; font:inherit; background:var(--bg-raised,#fff);
                color:var(--ink,#1b264f); min-width:130px;">
          <option value="">All types</option>
        </select>
        <input type="search" placeholder="Search…" id="ix-q"
          style="flex:1; min-width:120px; padding:9px 12px; border:1px solid var(--line,#e5e7ef);
                 border-radius:8px; font:inherit; background:var(--bg-raised,#fff); color:var(--ink,#1b264f);">
        <button type="button" data-act="refresh" class="flock-btn" style="white-space:nowrap;">Refresh</button>
      </div>
      <div data-bind="list" style="display:flex; flex-direction:column; gap:6px;">
        <flock-skeleton rows="6"></flock-skeleton>
      </div>
    </div>
  `;

  const sel  = host.querySelector('#ix-type');
  const list = host.querySelector('[data-bind="list"]');
  const q    = host.querySelector('#ix-q');

  scrolls.types().then((t = {}) => {
    const types = Object.keys(t);
    types.forEach((k) => {
      const opt = document.createElement('option');
      opt.value = k;
      opt.textContent = t[k].label || k;
      sel.appendChild(opt);
    });
  }).catch(() => {});

  async function refresh() {
    list.innerHTML = `<flock-skeleton rows="6"></flock-skeleton>`;
    try {
      const rows = await scrolls.timeline(null, 100);
      const filtered = (rows || [])
        .filter((r) => !sel.value || r.type === sel.value)
        .filter((r) => !q.value.trim() || JSON.stringify(r).toLowerCase().includes(q.value.toLowerCase()));
      list.innerHTML = filtered.length
        ? filtered.map(_row).join('')
        : `<div style="color:var(--ink-muted,#7a7f96); padding:16px;">No interactions match.</div>`;
    } catch (_) {
      list.innerHTML = `<div style="color:var(--ink-muted,#7a7f96); padding:16px;">Pastoral ledger unavailable right now.</div>`;
    }
  }

  host.addEventListener('click', (e) => { if (e.target.closest('[data-act="refresh"]')) refresh(); });
  sel.addEventListener('change', refresh);
  q.addEventListener('input', () => clearTimeout(host._t) || (host._t = setTimeout(refresh, 200)));
  refresh();

  return () => { clearTimeout(host._t); };
}

function _row(r) {
  return `
    <div style="display:flex; gap:10px; padding:10px 12px;
                background:var(--bg-raised,#fff); border:1px solid var(--line,#e5e7ef);
                border-radius:10px;">
      <div style="width:24px; text-align:center;">${_e(r.icon || '•')}</div>
      <div style="min-width:0; flex:1;">
        <div style="font-weight:600; color:var(--ink,#1b264f);">${_e(r.label || r.type || 'Interaction')}</div>
        <div style="color:var(--ink-muted,#7a7f96); font-size:0.85rem;">${_e(r.detail || '')}</div>
      </div>
      <div style="color:var(--ink-muted,#7a7f96); font-size:0.78rem; white-space:nowrap;">${_when(r.ts || r.timestamp)}</div>
    </div>`;
}
function _when(ts) {
  if (!ts) return '';
  try { return new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }
  catch (_) { return ''; }
}
function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
