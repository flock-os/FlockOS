/* ══════════════════════════════════════════════════════════════════════════════
   GROW PUBLIC — Lightweight bootstrap for the public-facing GROW page.
   No auth, no Firebase, no backend. Static + offline-mode modules only.
   "But grow in the grace and knowledge of our Lord." — 2 Peter 3:18
   ══════════════════════════════════════════════════════════════════════════════ */

/* ─── Module registry ────────────────────────────────────────────────────────
   Only public-safe modules. Excluded: Journal, Analytics, Certificates,
   Fellowship, Announcements, Prayer Chain, The Fold, The Life.
   ─────────────────────────────────────────────────────────────────────────── */
const NAV = [
  /* Daily Practice */
  {
    section: 'Daily Practice',
    items: [
      { name: 'the_gospel_reading',       title: 'Reading Plans',      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,      accent: '#0ea5e9' },
      { name: 'the_gospel_devotionals',   title: 'Devotionals',        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`, accent: '#f59e0b' },
      { name: 'the_gospel_heart',         title: 'Heart Check',        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.6a5.5 5.5 0 0 0-7.78 0L12 5.66l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21l8.84-8.62a5.5 5.5 0 0 0 0-7.78z"/></svg>`,         accent: '#dc2626' },
      { name: 'the_gospel_mirror',        title: "Shepherd's Mirror",  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="2" width="18" height="20" rx="3"/><path d="M9 22v-4h6v4"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>`,                             accent: '#7c3aed' },
    ],
  },
  /* Study & Discipleship */
  {
    section: 'Study & Discipleship',
    items: [
      { name: 'the_gospel_courses',       title: 'Courses',            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z"/><path d="M4 4v12a4 4 0 0 0 4 4"/><path d="M9 9h6M9 13h6"/></svg>`,                     accent: '#7c3aed' },
      { name: 'the_gospel_quizzes',       title: 'Quizzes',            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,  accent: '#0891b2' },
      { name: 'the_gospel_theology',      title: 'Theology',           icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,  accent: '#1d4ed8' },
      { name: 'the_gospel_teaching_plans',title: 'Teaching Plans',     icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,                               accent: '#059669' },
      { name: 'the_gospel_lexicon',       title: 'Lexicon',            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,             accent: '#be185d' },
      { name: 'the_gospel_library',       title: 'Library',            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528"/></svg>`, accent: '#0f766e' },
      { name: 'the_gospel_apologetics',   title: 'Apologetics',        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M3 7l9 3 9-3"/><path d="M3 17l9-3 9 3"/></svg>`,                                                         accent: '#475569' },
      { name: 'the_gospel_counseling',    title: 'Counseling',         icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,                       accent: '#0369a1' },
      { name: 'the_gospel_genealogy',     title: 'Genealogy',          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="9" y1="11" x2="9" y2="21"/><line x1="5" y1="16" x2="13" y2="16"/></svg>`,                         accent: '#92400e' },
    ],
  },
];

/* Flat module list for quick lookup */
const ALL_MODULES = NAV.flatMap(g => g.items);

/* ─── DOM handles ────────────────────────────────────────────────────────────*/
const topbar = document.getElementById('gp-topbar');
const sidebar = document.getElementById('gp-sidebar');
const main    = document.getElementById('gp-main');

/* ─── State ──────────────────────────────────────────────────────────────── */
let _currentUnmount = null;
let _sidebarOpen = false;

/* ─── Routing helpers ────────────────────────────────────────────────────── */
function currentRoute() {
  return location.hash.replace(/^#/, '') || '';
}

function go(name) {
  location.hash = name ? `#${name}` : '';
}

/* ─── Topbar ─────────────────────────────────────────────────────────────── */
topbar.innerHTML = /* html */`
  <button class="pillars-item gp-hamburger" id="gp-menu-btn" aria-label="Open menu" aria-expanded="false" style="width:44px;height:44px;padding:0;display:none;align-items:center;justify-content:center;flex:none;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <line x1="3" y1="6"  x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  </button>
  <a class="veil-brand" href="#" aria-label="GROW home">
    <img src="Images/NewCovenant.png" alt="FlockOS" width="30" height="30">
    <span class="veil-brand-text">GROW</span>
  </a>
  <span class="veil-spacer"></span>
  <a href="index.html" class="gp-cta" title="Sign in to FlockOS for the full experience">
    Sign in for full access
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
  </a>
`;

/* ─── Sidebar ────────────────────────────────────────────────────────────── */
function _sidebarHTML() {
  return /* html */`
    <button class="pillars-item" data-go="" data-section="home" style="width:100%">
      <span class="pillars-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V8"/><path d="M5 12c0-3 3-5 7-4 0 4-3 7-7 4z"/><path d="M19 8c0-3-3-5-7-4 0 4 3 7 7 4z"/></svg>
      </span>
      <span class="pillars-label">Overview</span>
    </button>

    ${NAV.map(g => /* html */`
      <div class="pillars-section">${g.section}</div>
      ${g.items.map(item => /* html */`
        <button class="pillars-item" data-go="${item.name}" data-section="word" style="width:100%">
          <span class="pillars-icon">${item.icon}</span>
          <span class="pillars-label">${item.title}</span>
        </button>
      `).join('')}
    `).join('')}

    <div style="margin-top:auto;padding:24px 14px 8px;border-top:1px solid rgba(255,255,255,0.07);text-align:center;">
      <a href="https://flock-os.github.io/FlockOS/" target="_blank" rel="noopener"
         style="color:rgba(255,255,255,0.32);font:0.72rem var(--font-ui);text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px;">
        <img src="Images/NewCovenant.png" alt="" width="14" height="14" style="border-radius:3px;opacity:0.5;">
        Powered by FlockOS
      </a>
    </div>
  `;
}

sidebar.innerHTML = _sidebarHTML();

/* ─── Active state sync ──────────────────────────────────────────────────── */
function _syncActive(route) {
  sidebar.querySelectorAll('.pillars-item[data-go]').forEach(btn => {
    const match = btn.dataset.go === route;
    btn.classList.toggle('is-active', match);
    btn.setAttribute('aria-current', match ? 'page' : 'false');
  });
}

/* ─── Home dashboard ─────────────────────────────────────────────────────── */
function _renderHome() {
  function _card(item) {
    return /* html */`
      <button class="growth-card" data-go="${item.name}" style="--grow-accent:${item.accent}">
        <span class="growth-card-icon" aria-hidden="true">${item.icon}</span>
        <span class="growth-card-text">
          <span class="growth-card-title">${item.title}</span>
        </span>
      </button>
    `;
  }

  main.innerHTML = /* html */`
    <section class="grow-page" data-grow="home">
      <header class="grow-hero" style="--grow-accent:#0ea572">
        <div class="grow-hero-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22V8"/><path d="M5 12c0-3 3-5 7-4 0 4-3 7-7 4z"/><path d="M19 8c0-3-3-5-7-4 0 4 3 7 7 4z"/>
          </svg>
        </div>
        <div class="grow-hero-text">
          <h1 class="grow-hero-title">GROW</h1>
          <p class="grow-hero-sub">Your library, your habits, your discipleship — freely available. No account required.</p>
        </div>
      </header>

      ${NAV.map(g => /* html */`
        <section class="growth-section">
          <header class="growth-section-head">
            <h2 class="growth-section-title">${g.section}</h2>
          </header>
          <div class="growth-grid">
            ${g.items.map(_card).join('')}
          </div>
        </section>
      `).join('')}

      <div class="gp-full-access-banner">
        <div class="gp-full-access-inner">
          <span class="gp-full-access-label">Want your journal, certificates &amp; progress tracking?</span>
          <a href="index.html" class="gp-cta">Sign in to FlockOS
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </section>
  `;

  /* Wire home dashboard cards */
  main.querySelectorAll('[data-go]').forEach(btn => {
    btn.addEventListener('click', () => go(btn.dataset.go));
  });
}

/* ─── Module loader ──────────────────────────────────────────────────────── */
async function _loadModule(name) {
  main.innerHTML = /* html */`
    <div style="padding:48px 24px;text-align:center;color:var(--ink-muted,#7a7f96);font:0.95rem var(--font-ui);">
      <div style="width:40px;height:40px;border:3px solid var(--line,#e5e7ef);border-top-color:var(--gold,#e8a838);border-radius:50%;animation:spin 0.7s linear infinite;margin:0 auto 16px;"></div>
      Loading…
    </div>
  `;

  try {
    const mod = await import(`./the_gospel/${name}.js`);
    main.innerHTML = mod.render();
    const unmount = mod.mount(main, { go });
    _currentUnmount = typeof unmount === 'function' ? unmount : null;
  } catch (err) {
    console.error('[grow-public] module load failed:', name, err);
    main.innerHTML = /* html */`
      <div style="padding:48px 24px;max-width:520px;margin:0 auto;text-align:center;">
        <div style="font-size:2.5rem;margin-bottom:12px;">⚠️</div>
        <h2 style="font:700 1.2rem var(--font-ui);color:var(--ink,#1b264f);margin:0 0 8px;">${name.replace(/_/g,' ')} could not be loaded</h2>
        <p style="color:var(--ink-muted,#7a7f96);font:0.9rem var(--font-ui);margin:0 0 20px;">${err.message || String(err)}</p>
        <button onclick="history.back()" style="padding:10px 22px;border-radius:10px;background:var(--gold,#e8a838);color:#0c1445;border:0;font:600 0.9rem var(--font-ui);cursor:pointer;">← Back</button>
      </div>
    `;
  }
}

/* ─── Router ─────────────────────────────────────────────────────────────── */
async function _route() {
  /* Cleanup previous view */
  if (typeof _currentUnmount === 'function') {
    try { _currentUnmount(); } catch (_) {}
    _currentUnmount = null;
  }

  /* Scroll main back to top */
  main.scrollTop = 0;

  const route = currentRoute();
  _syncActive(route);

  /* Close sidebar on mobile after nav */
  if (_sidebarOpen) _toggleSidebar(false);

  if (!route) {
    _renderHome();
    return;
  }

  const mod = ALL_MODULES.find(m => m.name === route);
  if (!mod) {
    go('');  /* Unknown route → home */
    return;
  }

  await _loadModule(route);
}

/* ─── Sidebar nav click delegation ──────────────────────────────────────── */
sidebar.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-go]');
  if (!btn) return;
  go(btn.dataset.go);
});

/* ─── Topbar brand link → home ───────────────────────────────────────────── */
topbar.querySelector('.veil-brand').addEventListener('click', (e) => {
  e.preventDefault();
  go('');
});

/* ─── Mobile hamburger ───────────────────────────────────────────────────── */
const menuBtn = document.getElementById('gp-menu-btn');
const sidePanel = document.getElementById('gp-sidebar-wrap');

function _toggleSidebar(open) {
  _sidebarOpen = open ?? !_sidebarOpen;
  sidePanel.classList.toggle('gp-sidebar-open', _sidebarOpen);
  menuBtn.setAttribute('aria-expanded', String(_sidebarOpen));
}

menuBtn.addEventListener('click', () => _toggleSidebar());

/* Close sidebar when clicking the overlay backdrop */
sidePanel.addEventListener('click', (e) => {
  if (e.target === sidePanel) _toggleSidebar(false);
});

/* ─── Hash-change listener ───────────────────────────────────────────────── */
window.addEventListener('hashchange', _route);

/* ─── Initial render ─────────────────────────────────────────────────────── */
_route();

/* CSS spin keyframe injected once (only needed for loading indicator) */
const _spin = document.createElement('style');
_spin.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
document.head.appendChild(_spin);
