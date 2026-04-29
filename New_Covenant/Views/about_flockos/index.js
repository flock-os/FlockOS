/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: About FlockOS
   "Feed my sheep. — John 21:17"
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'about_flockos';
export const title = 'About FlockOS';

const _e = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

const VERSION   = '2.0.0-new-covenant';
const BUILD_DATE = 'April 26, 2026';

const PILLARS = [
  { icon: '🐑', name: 'The Shepherd',      desc: 'Home dashboard — your flock at a glance.' },
  { icon: '⛪', name: 'The Fellowship',     desc: 'Real-time channels powered by Firebase.' },
  { icon: '🗓️', name: 'The Seasons',       desc: 'Church calendar, events, and RSVPs.' },
  { icon: '🙏', name: 'The Life',          desc: 'Pastoral care queue and follow-up.' },
  { icon: '📖', name: 'The Truth',         desc: 'Sermon archive and content library.' },
  { icon: '🌱', name: 'The Way',           desc: 'Discipleship tracks and small groups.' },
  { icon: '🌍', name: 'The Harvest',       desc: 'Missions, outreach, and gospel contacts.' },
  { icon: '📊', name: 'Fishing for Data',  desc: 'Analytics and kingdom metrics.' },
  { icon: '🪙', name: 'The Gift Drift',    desc: 'Giving, stewardship, and generosity.' },
];

const CREDITS = [
  { role: 'Lead Shepherd',     name: 'Greg Granger' },
  { role: 'Architecture',      name: 'Bezalel Spirit' },
  { role: 'Design System',     name: 'American Garments CSS' },
  { role: 'Comms Backend',     name: 'Firebase / Google Apps Script' },
  { role: 'Theology Advisor',  name: 'The Holy Scriptures' },
];

export function render() {
  return `
<section class="about-view">
  ${pageHero({
    title: 'About FlockOS',
    subtitle: 'A church operating system built on the covenant.',
    scripture: 'Feed my sheep. — John 21:17',
  })}

  <!-- Mission card -->
  <div class="about-mission-card">
    <div class="about-mission-icon">✝️</div>
    <div class="about-mission-body">
      <h2 class="about-mission-title">The Covenant Behind FlockOS</h2>
      <p class="about-mission-text">
        FlockOS is not software first — it is a covenant first. Built to serve local
        churches and church networks with the tools that shepherds actually need:
        pastoral care, discipleship tracking, giving clarity, and kingdom analytics.
        All built in the open, without subscriptions, without ads, and without compromise.
      </p>
      <p class="about-mission-text">
        "Be thou diligent to know the state of thy flocks, and look well to thy herds."
        <em style="color:var(--gold,#e8a838)"> — Proverbs 27:23</em>
      </p>
    </div>
  </div>

  <!-- Pillars grid -->
  <div class="about-section-label">The Seven Pillars (and more)</div>
  <div class="about-pillars-grid">
    ${PILLARS.map(p => `
    <div class="about-pillar-card">
      <div class="about-pillar-icon">${p.icon}</div>
      <div class="about-pillar-name">${_e(p.name)}</div>
      <div class="about-pillar-desc">${_e(p.desc)}</div>
    </div>`).join('')}
  </div>

  <!-- Build info + credits -->
  <div class="about-lower-row">

    <div class="about-info-card">
      <h3 class="about-card-title">Build Info</h3>
      <table class="about-info-table">
        <tr><td class="about-info-key">Version</td><td class="about-info-val">${_e(VERSION)}</td></tr>
        <tr><td class="about-info-key">Build Date</td><td class="about-info-val">${_e(BUILD_DATE)}</td></tr>
        <tr><td class="about-info-key">Shell</td><td class="about-info-val">New Covenant (ES Module PWA)</td></tr>
        <tr><td class="about-info-key">Comms</td><td class="about-info-val">Firebase + Google Apps Script</td></tr>
        <tr><td class="about-info-key">CSS</td><td class="about-info-val">American Garments Design System</td></tr>
        <tr><td class="about-info-key">License</td><td class="about-info-val">MIT — Free as in Grace</td></tr>
      </table>
      <div class="about-btn-row">
        <a class="btn btn-outline" href="https://github.com/flockos" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a class="btn btn-outline" href="#bezalel" data-nav="bezalel">Build Tools</a>
      </div>
    </div>

    <div class="about-credits-card">
      <h3 class="about-card-title">Credits</h3>
      <div class="about-credits-list">
        ${CREDITS.map(c => `
        <div class="about-credit-row">
          <div class="about-credit-role">${_e(c.role)}</div>
          <div class="about-credit-name">${_e(c.name)}</div>
        </div>`).join('')}
      </div>
      <div class="about-scripture-foot">
        <div class="about-scripture-quote">
          "I have called by name Bezalel… and I have filled him with the Spirit of God,
          with ability and intelligence, with knowledge and all craftsmanship."
          <em>— Exodus 31:2-3</em>
        </div>
      </div>
    </div>

  </div>

</section>`;
}

export function mount(root) {
  /* Internal nav links */
  root.querySelectorAll('[data-nav]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('flockos:navigate', { detail: { view: a.dataset.nav } }));
    });
  });
  return () => {};
}
