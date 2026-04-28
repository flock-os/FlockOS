/* ══════════════════════════════════════════════════════════════════════════════
   THE PRAYER HOURS — Daily Prayer Hours widget for the home dashboard
   "Evening, morning and noon I cry out in distress, and he hears my voice."
   — Psalm 55:17

   Compact, static widget — no API calls. Highlights the current liturgical
   hour based on local clock time. Clicking any hour row (or the Begin button)
   navigates to prayerful_action.
   ══════════════════════════════════════════════════════════════════════════════ */

const _e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const LITURGY = [
  { id: 'dawn',    time: 'Dawn',     label: 'Morning Watch',   icon: '🌅', range: [4,  11] },
  { id: 'midday',  time: '12:00 PM', label: 'Midday Pause',    icon: '☀️',  range: [11, 14] },
  { id: 'three',   time: '3:00 PM',  label: 'Hour of Prayer',  icon: '⛪',  range: [14, 17] },
  { id: 'vespers', time: 'Evening',  label: 'Evening Vespers', icon: '🌙', range: [17, 23] },
];

function _currentHour() {
  const h = new Date().getHours();
  return LITURGY.find((l) => h >= l.range[0] && h < l.range[1]) || LITURGY[0];
}

export function mountPrayerHours(host, ctx) {
  if (!host) return () => {};

  const now = _currentHour();

  host.innerHTML = `
    <div class="word-card prayer-hours-card">
      <div class="word-mark">🕯️</div>
      <div class="word-body" style="flex:1">
        <div class="word-eyebrow">Daily Prayer Hours</div>
        <p class="word-scrip" style="margin:0 0 12px">
          "Evening, morning and noon I cry out in distress, and he hears my voice." — Psalm 55:17
        </p>
        <div class="prayer-hours-list">
          ${LITURGY.map((l) => {
            const isNow = l.id === now.id;
            return `
          <div class="prayer-hours-row${isNow ? ' is-now' : ''}" data-hour="${_e(l.id)}" tabindex="0" role="button" aria-label="Begin ${_e(l.label)}">
            <span class="prayer-hours-icon">${l.icon}</span>
            <span class="prayer-hours-body">
              <span class="prayer-hours-time">${_e(l.time)} — ${_e(l.label)}</span>
              ${isNow ? '<span class="prayer-hours-now-pill">Now</span>' : ''}
            </span>
          </div>`;
          }).join('')}
        </div>
        <button type="button" class="flock-btn flock-btn--ghost" style="margin-top:14px;width:100%" id="ph-begin-btn">
          Begin ${_e(now.label)} →
        </button>
      </div>
    </div>`;

  const go = () => {
    if (ctx && ctx.go) ctx.go('prayerful_action');
    else if (typeof navigate === 'function') navigate('prayerful_action');
  };

  host.querySelector('#ph-begin-btn')?.addEventListener('click', go);
  host.querySelectorAll('.prayer-hours-row').forEach((row) => {
    row.addEventListener('click', go);
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  });

  return () => {};
}
