/* ══════════════════════════════════════════════════════════════════════════════
   THE PASTURE — Greeting / hero strip for the_good_shepherd
   "He maketh me to lie down in green pastures." — Psalm 23:2
   ══════════════════════════════════════════════════════════════════════════════ */

export function renderPasture(me) {
  const greeting = _timeGreeting();
  const name     = me && (me.firstName || me.preferredName) ? ` ${_e(me.firstName || me.preferredName)}` : '';
  return `
    <header class="pasture-hero">
      <div class="pasture-date">${_today()}</div>
      <h1>${greeting},${name}.</h1>
      <p class="pasture-tagline">Be still, and know. The flock is gathered below.</p>
    </header>
  `;
}

function _timeGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Peace to you tonight';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Peace to you tonight';
}

function _today() {
  try {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'long', month: 'long', day: 'numeric'
    });
  } catch (_) {
    return new Date().toDateString();
  }
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
