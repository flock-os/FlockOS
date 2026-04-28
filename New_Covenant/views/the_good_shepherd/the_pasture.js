/* ══════════════════════════════════════════════════════════════════════════════
   THE PASTURE — Greeting / hero strip for the_good_shepherd
   "He maketh me to lie down in green pastures." — Psalm 23:2
   ══════════════════════════════════════════════════════════════════════════════ */

export function renderPasture(me) {
  const greeting = _timeGreeting();
  const first    = _firstName(me);
  const name     = first ? ` ${_e(first)}` : '';
  return `
    <header class="pasture-hero">
      <div class="pasture-date">${_today()}</div>
      <h1>${greeting}${name}.</h1>
      <p class="pasture-tagline">Be still, and know. The flock is gathered below.</p>
    </header>
  `;
}

function _firstName(me) {
  if (!me) return '';
  const raw = me.firstName || me.preferredName
           || (me.displayName ? String(me.displayName).trim().split(/\s+/)[0] : '')
           || (me.name        ? String(me.name).trim().split(/\s+/)[0]        : '')
           || (me.email       ? String(me.email).split('@')[0]                 : '');
  return raw || '';
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
