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
    <span class="veil-brand-text">GROW</span>
  </a>
  <span class="veil-spacer"></span>
  <div class="gp-avatar-wrap" style="position:relative;">
    <button class="veil-avatar" id="gp-signin-btn" aria-label="Sign in to FlockOS" aria-haspopup="true" aria-expanded="false">
      <img class="veil-avatar-logo" alt="GROW" src="Images/GrowIcon.png" style="border-radius:10px;">
    </button>
    <div id="gp-signin-dropdown" class="gp-signin-dropdown" role="menu" hidden>
      <div class="gp-signin-dropdown-inner">
        <img src="Images/GrowIcon.png" alt="GROW" width="44" height="44" style="border-radius:12px;display:block;margin:0 auto 10px;">
        <p class="gp-signin-title">Sign in to FlockOS</p>
        <p class="gp-signin-sub">Unlock your journal, certificates, fellowship channels, and progress tracking.</p>
        <a href="index.html" class="gp-cta gp-signin-cta">
          Sign in
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <p class="gp-signin-foot">Powered by <strong>FlockOS</strong></p>
      </div>
    </div>
  </div>
`;

/* ─── Sign-in dropdown toggle ─────────────────────────────────────────────── */
function _initSigninDropdown() {
  const btn      = document.getElementById('gp-signin-btn');
  const dropdown = document.getElementById('gp-signin-dropdown');
  if (!btn || !dropdown) return;

  function _open()  { dropdown.hidden = false; btn.setAttribute('aria-expanded','true'); }
  function _close() { dropdown.hidden = true;  btn.setAttribute('aria-expanded','false'); }
  function _toggle() { dropdown.hidden ? _open() : _close(); }

  btn.addEventListener('click', (e) => { e.stopPropagation(); _toggle(); });

  /* Close on outside click */
  document.addEventListener('click', (e) => {
    if (!dropdown.hidden && !dropdown.contains(e.target) && e.target !== btn) _close();
  });

  /* Close on Escape */
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') _close(); });
}
_initSigninDropdown();

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

/* ─── Public prayer-request modal ──────────────────────────────────────────────── */
/* Inject styles for the prayer modal once */
const _prayerStyle = document.createElement('style');
_prayerStyle.textContent = `
.gp-prayer-overlay {
  position: fixed; inset: 0; z-index: 900;
  background: rgba(12,20,69,0.72); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  animation: gp-overlay-in 180ms ease;
}
@keyframes gp-overlay-in { from { opacity:0; } to { opacity:1; } }
.gp-prayer-card {
  background: var(--bg-raised, #fff);
  border: 1px solid var(--line, #e5e7ef);
  border-radius: 20px;
  box-shadow: 0 24px 72px rgba(15,23,42,0.30);
  width: 100%; max-width: 540px; max-height: 90vh;
  overflow-y: auto; padding: 28px 28px 24px;
  animation: gp-card-in 200ms cubic-bezier(.2,.8,.2,1);
}
@keyframes gp-card-in { from { transform: translateY(12px) scale(0.97); opacity:0; } to { transform: none; opacity:1; } }
.gp-prayer-title {
  font: 700 1.2rem var(--font-ui, sans-serif);
  color: var(--ink, #1b264f); margin: 0 0 4px;
}
.gp-prayer-sub {
  font: 0.85rem var(--font-ui, sans-serif);
  color: var(--ink-muted, #7a7f96); margin: 0 0 20px;
}
.gp-prayer-field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
.gp-prayer-label { font: 600 0.8rem var(--font-ui, sans-serif); color: var(--ink, #1b264f); }
.gp-prayer-input {
  padding: 9px 12px; border-radius: 10px;
  border: 1.5px solid var(--line, #e5e7ef);
  font: 0.9rem var(--font-ui, sans-serif);
  color: var(--ink, #1b264f); background: var(--bg, #f7f8fb);
  outline: none; transition: border-color 140ms;
}
.gp-prayer-input:focus { border-color: var(--gold, #e8a838); }
textarea.gp-prayer-input { resize: vertical; min-height: 120px; font-size: 0.82rem; line-height: 1.5; }
.gp-prayer-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 6px; }
.gp-prayer-email-btn {
  flex: 1; padding: 11px 18px; border-radius: 10px;
  background: var(--gold, #e8a838); color: #0c1445;
  border: 0; font: 700 0.88rem var(--font-ui, sans-serif);
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  transition: background 140ms, transform 100ms;
}
.gp-prayer-email-btn:hover { background: #f0b534; transform: translateY(-1px); }
.gp-prayer-copy-btn, .gp-prayer-cancel-btn {
  padding: 11px 16px; border-radius: 10px;
  background: transparent;
  border: 1.5px solid var(--line, #e5e7ef);
  font: 600 0.85rem var(--font-ui, sans-serif);
  color: var(--ink-muted, #7a7f96); cursor: pointer;
  transition: border-color 140ms, color 140ms;
}
.gp-prayer-copy-btn:hover, .gp-prayer-cancel-btn:hover {
  border-color: var(--ink, #1b264f); color: var(--ink, #1b264f);
}
.gp-prayer-note {
  margin-top: 14px; padding: 10px 14px;
  background: rgba(232,168,56,0.10); border-radius: 10px;
  font: 0.78rem var(--font-ui, sans-serif); color: var(--ink-muted, #7a7f96);
  line-height: 1.5;
}
@media (max-width: 500px) { .gp-prayer-card { padding: 20px 16px 18px; } }
`;
document.head.appendChild(_prayerStyle);

/**
 * Gather a human-readable summary from the module's diagnostic output.
 * Reads from the visible prescriptions/scan/plan panel rendered in `root`.
 */
function _gatherDiagnosticSummary(root) {
  const lines = [];
  /* Hero title */
  const heroTitle = root.querySelector('.grow-hero-title');
  if (heroTitle) lines.push(`=== ${heroTitle.textContent.trim()} Results ===\n`);
  /* Prescription / action-plan cards */
  root.querySelectorAll('.grow-split-aside, [data-bind="scan"], [data-bind="plan"]').forEach(panel => {
    panel.querySelectorAll('[style*="border-left"]').forEach(card => {
      const cat  = card.querySelector('[style*="text-transform"]');
      const q    = card.querySelector('p');
      const step = card.querySelectorAll('p')[1];
      const ref  = card.querySelectorAll('p')[2];
      if (cat && cat.textContent.trim()) lines.push(`\n[${cat.textContent.trim()}]`);
      if (q)    lines.push(q.textContent.trim());
      if (step) lines.push(`→ ${step.textContent.trim()}`);
      if (ref)  lines.push(`   ${ref.textContent.trim()}`);
    });
    /* Scan percentage */
    const pct = panel.querySelector('.grow-scan-pct');
    if (pct) lines.push(`\nCompletion: ${pct.textContent.trim()}`);
  });
  return lines.join('\n').trim() || '(No results captured — please describe your situation below.)';
}

/** Open the prayer request modal. */
function _openPrayerModal(summary) {
  /* Tear down any existing modal */
  document.getElementById('gp-prayer-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'gp-prayer-overlay';
  overlay.className = 'gp-prayer-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'gp-prayer-dlg-title');

  overlay.innerHTML = /* html */`
    <div class="gp-prayer-card">
      <h2 class="gp-prayer-title" id="gp-prayer-dlg-title">🙏 Send a Private Prayer Request</h2>
      <p class="gp-prayer-sub">Your results and a personal note will be composed into an email to your pastor. Nothing is sent automatically — you control what goes.</p>

      <div class="gp-prayer-field">
        <label class="gp-prayer-label" for="gp-pr-name">Your name (optional)</label>
        <input class="gp-prayer-input" id="gp-pr-name" type="text" placeholder="First name or anonymous" autocomplete="name">
      </div>

      <div class="gp-prayer-field">
        <label class="gp-prayer-label" for="gp-pr-pastor">Pastor’s email address</label>
        <input class="gp-prayer-input" id="gp-pr-pastor" type="email" placeholder="pastor@yourchurch.com" autocomplete="off">
      </div>

      <div class="gp-prayer-field">
        <label class="gp-prayer-label" for="gp-pr-note">Personal note to your pastor (optional)</label>
        <textarea class="gp-prayer-input" id="gp-pr-note" placeholder="Anything you want to add…"></textarea>
      </div>

      <div class="gp-prayer-field">
        <label class="gp-prayer-label" for="gp-pr-results">Your diagnostic results (edit freely)</label>
        <textarea class="gp-prayer-input" id="gp-pr-results" style="min-height:150px;">${summary.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>
      </div>

      <div class="gp-prayer-actions">
        <button class="gp-prayer-email-btn" id="gp-pr-send">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          Open in Email App
        </button>
        <button class="gp-prayer-copy-btn" id="gp-pr-copy">Copy to clipboard</button>
        <button class="gp-prayer-cancel-btn" id="gp-pr-cancel">Cancel</button>
      </div>

      <p class="gp-prayer-note">🔒 This stays between you and your pastor. Nothing is stored or sent by FlockOS — your email app handles delivery.</p>
    </div>
  `;

  document.body.appendChild(overlay);

  function _body() {
    const name    = document.getElementById('gp-pr-name').value.trim();
    const note    = document.getElementById('gp-pr-note').value.trim();
    const results = document.getElementById('gp-pr-results').value.trim();
    const parts   = [];
    if (name)    parts.push(`From: ${name}\n`);
    if (note)    parts.push(`Note:\n${note}\n`);
    if (results) parts.push(`\nDiagnostic Results:\n${results}`);
    return parts.join('\n').trim();
  }

  function _close() { overlay.remove(); }

  /* Close on backdrop click */
  overlay.addEventListener('click', (e) => { if (e.target === overlay) _close(); });
  document.getElementById('gp-pr-cancel').addEventListener('click', _close);

  /* Open email app */
  document.getElementById('gp-pr-send').addEventListener('click', () => {
    const to      = document.getElementById('gp-pr-pastor').value.trim();
    const heroTitle = document.querySelector('[data-grow] .grow-hero-title');
    const subject = encodeURIComponent(`Private Prayer Request — ${heroTitle ? heroTitle.textContent : 'GROW'}`);
    const body    = encodeURIComponent(_body());
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${subject}&body=${body}`;
  });

  /* Copy to clipboard */
  document.getElementById('gp-pr-copy').addEventListener('click', async (e) => {
    try {
      await navigator.clipboard.writeText(_body());
      e.target.textContent = 'Copied!';
      setTimeout(() => { e.target.textContent = 'Copy to clipboard'; }, 2000);
    } catch (_) {
      e.target.textContent = 'Could not copy';
    }
  });

  /* Trap Escape */
  const _esc = (ev) => { if (ev.key === 'Escape') { _close(); document.removeEventListener('keydown', _esc); } };
  document.addEventListener('keydown', _esc);

  /* Focus pastor email field */
  setTimeout(() => document.getElementById('gp-pr-pastor')?.focus(), 80);
}

/**
 * Install a capture-phase listener on `root` that intercepts any
 * [data-help-btn] click BEFORE wireHelp's bubble-phase handler fires.
 * Opens the public prayer modal with the current module's results.
 */
function _installPrayerHook(root) {
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-help-btn]');
    if (!btn) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    const summary = _gatherDiagnosticSummary(root);
    _openPrayerModal(summary);
  }, true /* capture */);
}

/* ─── Hash-change listener ───────────────────────────────────────────────── */
window.addEventListener('hashchange', _route);

/* ─── Initial render ─────────────────────────────────────────────────────── */
_route();

/* CSS spin keyframe injected once (only needed for loading indicator) */
const _spin = document.createElement('style');
_spin.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
document.head.appendChild(_spin);
