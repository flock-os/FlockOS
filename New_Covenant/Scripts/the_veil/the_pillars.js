/* ══════════════════════════════════════════════════════════════════════════════
   THE PILLARS — Side navigation (the_veil)
   "Wisdom hath builded her house, she hath hewn out her seven pillars." — Pr 9:1

   Sectioned navigation with icons, badges, and active-state highlighting.
   Listens to the_scribes for active view; pure markup, styles in
   New_Covenant/Styles/new_covenant.css.
   ══════════════════════════════════════════════════════════════════════════════ */

import { go, current } from '../the_scribes/index.js';
import { unreadTotal } from '../the_upper_room/index.js';
import { pendingCount } from '../the_life/index.js';

const I = (path) =>
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

const ICON = {
  home:       I('<path d="M3 12 12 4l9 8"/><path d="M5 10v10h14V10"/>'),
  fold:       I('<path d="M3 7c4 0 4 3 8 3s4-3 8-3"/><path d="M3 17c4 0 4 3 8 3s4-3 8-3"/><path d="M3 12h18"/>'),
  chat:       I('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
  bullhorn:   I('<path d="M3 11v2a3 3 0 0 0 3 3h1l4 4V4l-4 4H6a3 3 0 0 0-3 3z"/><path d="M14 7v10"/><path d="M18 5v14"/>'),
  hands:      I('<path d="M9 11V5a2 2 0 1 1 4 0v8"/><path d="M13 13V3a2 2 0 1 1 4 0v12"/><path d="M17 14V6a2 2 0 1 1 4 0v9a7 7 0 0 1-7 7H9a4 4 0 0 1-4-4l-2-7a2 2 0 0 1 4-1l1 4"/>'),
  calendar:   I('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  harvest:    I('<path d="M12 22V8"/><path d="M5 12c2-3 5-3 7-1 2-2 5-2 7 1"/><path d="M5 18c2-3 5-3 7-1 2-2 5-2 7 1"/>'),
  cross:      I('<path d="M12 3v18M5 9h14"/>'),
  heart:      I('<path d="M20.84 4.6a5.5 5.5 0 0 0-7.78 0L12 5.66l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21l8.84-8.62a5.5 5.5 0 0 0 0-7.78z"/>'),
  pen:        I('<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
  shield:     I('<path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"/>'),
  fish:       I('<path d="M2 12c4-6 14-6 18 0-4 6-14 6-18 0z"/><circle cx="16" cy="12" r="1"/>'),
  chart:      I('<path d="M3 21V3"/><path d="M7 17V11M11 17V7M15 17V13M19 17V9"/>'),
  hammer:     I('<path d="M14 8 6 16l4 4 8-8"/><path d="M14 8l4-4 6 6-4 4z"/>'),
  question:   I('<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4"/><circle cx="12" cy="17" r=".5" fill="currentColor"/>'),
};

const SECTIONS = [
  {
    title: '',
    items: [{ name: 'the_good_shepherd',  label: 'Home',           icon: ICON.home }],
  },
  {
    title: 'Comms',
    items: [
      { name: 'the_fellowship',        label: 'Fellowship',         icon: ICON.chat,     badge: 'fellowship' },
      { name: 'the_announcements',     label: 'Announcements',      icon: ICON.bullhorn },
      { name: 'the_prayer_chain',      label: 'Prayer Chain',       icon: ICON.hands },
    ],
  },
  {
    title: 'Care',
    items: [
      { name: 'the_fold',              label: 'The Fold',           icon: ICON.fold },
      { name: 'the_life',              label: 'Pastoral Care',      icon: ICON.heart,    badge: 'care' },
      { name: 'the_seasons',           label: 'Seasons',            icon: ICON.calendar },
    ],
  },
  {
    title: 'Mission',
    items: [
      { name: 'the_harvest',           label: 'Harvest',            icon: ICON.harvest },
      { name: 'the_way',               label: 'The Way',            icon: ICON.cross },
      { name: 'the_truth',             label: 'Content',            icon: ICON.pen },
      { name: 'fishing_for_men',       label: 'Outreach',           icon: ICON.fish },
      { name: 'fishing_for_data',      label: 'Analytics',          icon: ICON.chart },
    ],
  },
  {
    title: 'Build',
    items: [
      { name: 'the_wall',              label: 'Admin',              icon: ICON.shield },
      { name: 'bezalel',               label: 'Bezalel',            icon: ICON.hammer },
      { name: 'about_flockos',         label: 'About FlockOS',      icon: ICON.question },
    ],
  },
];

export function mountPillars(host) {
  if (!host) return;
  host.classList.add('veil-side');
  host.innerHTML = SECTIONS.map(_section).join('');

  const items = Array.from(host.querySelectorAll('.pillars-item'));
  items.forEach((btn) => {
    btn.addEventListener('click', () => {
      go(btn.dataset.view).catch((err) => console.warn('[pillars]', err));
      document.body.classList.remove('veil-side-open');
    });
  });

  // Active highlighting
  function paintActive() {
    const cur = current() && current().name;
    items.forEach((b) => {
      const on = b.dataset.view === cur;
      b.classList.toggle('is-active', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
  }
  paintActive();
  window.addEventListener('popstate', paintActive);
  // Re-check on a short interval — the_scribes doesn't broadcast yet.
  const tick = setInterval(paintActive, 700);

  // Badges
  _refreshBadges(host);
  const badgeTick = setInterval(() => _refreshBadges(host), 30_000);

  return () => { clearInterval(tick); clearInterval(badgeTick); };
}

function _section(s) {
  const head = s.title ? `<div class="pillars-section">${s.title}</div>` : '';
  const items = s.items.map((it) => `
    <button class="pillars-item" type="button" data-view="${it.name}">
      <span class="pillars-icon" aria-hidden="true">${it.icon}</span>
      <span class="pillars-label">${it.label}</span>
      ${it.badge ? `<span class="pillars-badge" data-badge="${it.badge}" hidden></span>` : ''}
    </button>
  `).join('');
  return head + items;
}

async function _refreshBadges(host) {
  const set = (key, n) => {
    const el = host.querySelector(`[data-badge="${key}"]`);
    if (!el) return;
    if (n && n > 0) { el.textContent = n > 99 ? '99+' : String(n); el.hidden = false; }
    else { el.hidden = true; }
  };
  try { set('fellowship', _toN(await unreadTotal())); } catch (_) {}
  try { set('care',       _toN(await pendingCount())); } catch (_) {}
}
function _toN(v) {
  if (typeof v === 'number') return v;
  if (Array.isArray(v)) return v.length;
  if (v && typeof v === 'object' && typeof v.count === 'number') return v.count;
  return 0;
}
