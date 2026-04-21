/* ══════════════════════════════════════════════════════════════════════════════
   FINE LINEN — FlockOS Design System
   Theme engine with pastel palettes, pill components, and auto dark mode.

   THEMES (14 total):
     Light:  Dayspring · Meadow · Lavender · Rosewood
     Dark:   Vesper · Evergreen · Twilight · Obsidian
     Flags:  America · Guatemala · Mexico (light) · Germany · Afghanistan (dark)
     Auto:   Follows device prefers-color-scheme

   USAGE:
     Adornment.init();                     — auto-applies saved theme on load
     Adornment.setTheme('dayspring');      — apply named theme
     Adornment.getTheme();                 — returns current theme name
     Adornment.themes                      — array of all valid theme names

   STORAGE:
     TheVine.flock.preferences.get/update  — synced to server (auth users)
     localStorage 'flock_theme'            — fallback (public / offline)

   INJECTION:
     Appends a <style id="adornment-css"> to <head>.
     Sets data-theme on <html>.
   ══════════════════════════════════════════════════════════════════════════════ */

const Adornment = (() => {

  /* ─── THEME REGISTRY ──────────────────────────────────────────────────────── */

  const THEMES = [
    'dayspring', 'meadow', 'lavender', 'rosewood',   // light
    'vesper', 'evergreen', 'twilight', 'obsidian',    // dark
    'america', 'guatemala', 'mexico',                  // flag — light
    'germany', 'afghanistan',                          // flag — dark
    'auto'
  ];

  const DEFAULT_THEME = 'america';
  const STORAGE_KEY   = 'flock_theme';
  // CSS is now loaded via american_garments.css; embedded CSS and STYLE_ID removed.


  /* ─── INTERNAL HELPERS ────────────────────────────────────────────────────── */

  // _inject() removed; CSS is loaded via <link> to american_garments.css

  function _apply(name) {
    document.documentElement.setAttribute('data-theme', name);
  }

  /* ── Theme metadata for swatch rendering ─────────────────────────────────── */
  const THEME_META = {
    dayspring:   { label: 'Dayspring',    bg: '#faf9f6', accent: '#7eaacc', mode: 'light' },
    meadow:      { label: 'Meadow',       bg: '#f6f7f4', accent: '#6ba88a', mode: 'light' },
    lavender:    { label: 'Lavender',     bg: '#f8f6fb', accent: '#9b7ec8', mode: 'light' },
    rosewood:    { label: 'Rosewood',     bg: '#fbf6f7', accent: '#c27d8f', mode: 'light' },
    vesper:      { label: 'Vesper',       bg: '#0f1118', accent: '#8ab4d6', mode: 'dark'  },
    evergreen:   { label: 'Evergreen',    bg: '#0e1510', accent: '#6ec496', mode: 'dark'  },
    twilight:    { label: 'Twilight',     bg: '#12101a', accent: '#a088d0', mode: 'dark'  },
    obsidian:    { label: 'Obsidian',     bg: '#000000', accent: '#88b8e0', mode: 'dark'  },
    america:     { label: 'America',      bg: '#f7f8fb', accent: '#3c3b6e', mode: 'light' },
    guatemala:   { label: 'Guatemala',    bg: '#f4f9fc', accent: '#4997d0', mode: 'light' },
    mexico:      { label: 'Mexico',       bg: '#f5f8f4', accent: '#006847', mode: 'light' },
    germany:     { label: 'Germany',      bg: '#14120e', accent: '#dd0000', mode: 'dark'  },
    afghanistan: { label: 'Afghanistan',  bg: '#0e100c', accent: '#007a3d', mode: 'dark'  },
  };

  /* ─── PUBLIC API ──────────────────────────────────────────────────────────── */

  /** Key used to cache the admin global override locally. */
  const GLOBAL_THEME_KEY = 'flock_global_theme';

  /**
   * init()
   * Injects CSS and applies the saved theme.
   * Priority: user preference → admin global theme → localStorage → DEFAULT_THEME.
   * The admin global theme acts as the church-wide default (base theme).
   * Users can still override with their own preference.
   * Call once on page load, before anything renders.
   */
  function init() {
    // _inject() removed; CSS is loaded via <link> to american_garments.css
    loadOverrides(); // Apply Interface Studio overrides immediately

    // Optimistically apply localStorage theme immediately to avoid FOUC
    const allowCustomStored = localStorage.getItem('flock_allow_custom_themes');
    const customAllowed = allowCustomStored === 'TRUE';
    const stored = localStorage.getItem(STORAGE_KEY);
    const globalStored = localStorage.getItem(GLOBAL_THEME_KEY);
    if (customAllowed && THEMES.includes(stored)) {
      _apply(stored);  // user preference cached locally (only when custom themes allowed)
    } else if (globalStored && globalStored !== 'default' && THEMES.includes(globalStored)) {
      _apply(globalStored);  // admin base theme cached locally
    } else {
      _apply(DEFAULT_THEME);
    }

    // Fetch admin global theme + ALLOW_CUSTOM_THEMES + user preference asynchronously
    var _fbMode = typeof UpperRoom !== 'undefined' && typeof Modules !== 'undefined' && Modules._isFirebaseComms && Modules._isFirebaseComms();
    if (_fbMode) {
      UpperRoom.getAppConfig({ key: 'GLOBAL_THEME' }).then(res => {
        const val = (res && res.value) || 'default';
        localStorage.setItem(GLOBAL_THEME_KEY, val);
        if (val && val !== 'default' && THEMES.includes(val)) {
          _apply(val);
        }
        return UpperRoom.getAppConfig({ key: 'ALLOW_CUSTOM_THEMES' }).then(acRes => {
          const acVal = (acRes && acRes.value) || 'FALSE';
          localStorage.setItem('flock_allow_custom_themes', acVal.toUpperCase());
          if (acVal.toUpperCase() === 'TRUE') {
            _syncUserPref();
          }
        }).catch(() => {});
      }).catch(() => {});
    } else if (typeof TheVine !== 'undefined' && TheVine.flock) {
      if (TheVine.flock.config) {
        TheVine.flock.config.get({ key: 'GLOBAL_THEME' }).then(res => {
          const val = (res && (res.value || (res.data && res.data.value))) || 'default';
          localStorage.setItem(GLOBAL_THEME_KEY, val);
          if (val && val !== 'default' && THEMES.includes(val)) {
            _apply(val);
          }
          return TheVine.flock.config.get({ key: 'ALLOW_CUSTOM_THEMES' }).then(acRes => {
            const acVal = (acRes && (acRes.value || (acRes.data && acRes.data.value))) || 'FALSE';
            localStorage.setItem('flock_allow_custom_themes', acVal.toUpperCase());
            if (acVal.toUpperCase() === 'TRUE') {
              _syncUserPref();
            }
          }).catch(() => {});
        }).catch(() => {});
      }
    }
  }

  /** Sync theme from user's saved preferences (only called when custom themes are allowed). */
  function _syncUserPref() {
    var _fbMode = typeof UpperRoom !== 'undefined' && typeof Modules !== 'undefined' && Modules._isFirebaseComms && Modules._isFirebaseComms();
    if (_fbMode) {
      UpperRoom.getUserPreferences().then(prefs => {
        if (prefs && THEMES.includes(prefs.theme)) {
          _apply(prefs.theme);
          localStorage.setItem(STORAGE_KEY, prefs.theme);
        }
      }).catch(() => {});
    } else if (typeof TheVine !== 'undefined' && TheVine.flock && TheVine.flock.preferences) {
      TheVine.flock.preferences.get().then(prefs => {
        if (prefs && THEMES.includes(prefs.theme)) {
          _apply(prefs.theme);
          localStorage.setItem(STORAGE_KEY, prefs.theme);
        }
      }).catch(() => {});
    }
  }

  /**
   * setTheme(name)
   * Apply a named theme and persist it.
   * Saves to localStorage always; syncs to TheVine if authenticated.
   */
  function setTheme(name) {
    if (!THEMES.includes(name)) {
      console.warn(`Adornment.setTheme: unknown theme "${name}"`);
      return;
    }
    _apply(name);
    localStorage.setItem(STORAGE_KEY, name);

    var _fbMode = typeof UpperRoom !== 'undefined' && typeof Modules !== 'undefined' && Modules._isFirebaseComms && Modules._isFirebaseComms();
    if (_fbMode) {
      UpperRoom.updateUserPreferences({ theme: name }).catch(() => {});
    } else if (typeof TheVine !== 'undefined' && TheVine.flock && TheVine.flock.preferences) {
      TheVine.flock.preferences.update({ theme: name }).catch(() => {});
    }
  }

  /**
   * getTheme()
   * Returns the currently active theme name from the <html> attribute.
   */
  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
  }

  /**
   * getGlobalTheme()
   * Returns the cached admin global override ('default' or a theme name).
   */
  function getGlobalTheme() {
    return localStorage.getItem(GLOBAL_THEME_KEY) || 'default';
  }

  /* ═══════════════════════════════════════════════════════════════════════
     INTERFACE OVERRIDES
     Applies a map of CSS custom property overrides + font-family + any
     component-level custom CSS.  Called by the Interface Studio in Settings.
     ═══════════════════════════════════════════════════════════════════════ */
  var OVERRIDE_STYLE_ID = 'adornment-overrides';
  var OVERRIDE_LS_KEY   = 'flock_interface_overrides';

  /**
   * applyOverrides(obj)
   *   obj.vars   — {  '--radius-sm': '4px', '--shadow-sm': 'none', … }
   *   obj.fonts  — { body: 'Lora, serif', heading: 'Montserrat, sans-serif' }
   *   obj.sizes  — { '.btn': '0.9rem', '.card .card-title': '1rem', … }
   *   obj.pads   — { '.card': '1.5rem', '.btn': '0.6rem 1.5rem', … }
   *   obj.custom — raw CSS string appended at the end
   */
  function applyOverrides(obj) {
    if (!obj) obj = {};
    var el = document.getElementById(OVERRIDE_STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = OVERRIDE_STYLE_ID;
      document.head.appendChild(el);
    }

    var css = '';

    // 1) CSS variable overrides (on :root so they win over theme selectors)
    var vars = obj.vars || {};
    var varEntries = Object.keys(vars);
    if (varEntries.length) {
      css += ':root {\n';
      varEntries.forEach(function(k) { css += '  ' + k + ': ' + vars[k] + ';\n'; });
      css += '}\n';
    }

    // 2) Font-family overrides
    var fonts = obj.fonts || {};
    if (fonts.body) {
      css += 'html { font-family: ' + fonts.body + '; }\n';
    }
    if (fonts.heading) {
      css += 'h1, h2, h3, h4, h5, h6, .settings-section-title, .page-header h1, .welcome-hero h1, .modal-title, .ur-hero-title, .dev-welcome-title { font-family: ' + fonts.heading + '; }\n';
    }

    // 3) Font-size overrides per selector
    var sizes = obj.sizes || {};
    Object.keys(sizes).forEach(function(sel) {
      css += sel + ' { font-size: ' + sizes[sel] + '; }\n';
    });

    // 4) Padding overrides per selector
    var pads = obj.pads || {};
    Object.keys(pads).forEach(function(sel) {
      css += sel + ' { padding: ' + pads[sel] + '; }\n';
    });

    // 5) Raw custom CSS
    if (obj.custom) css += obj.custom + '\n';

    el.textContent = css;
  }

  /**
   * loadOverrides()  — reads from localStorage and applies
   */
  function loadOverrides() {
    try {
      var raw = localStorage.getItem(OVERRIDE_LS_KEY);
      if (raw) applyOverrides(JSON.parse(raw));
    } catch(e) { /* ignore corrupt data */ }
  }

  /**
   * clearOverrides()
   */
  function clearOverrides() {
    var el = document.getElementById(OVERRIDE_STYLE_ID);
    if (el) el.textContent = '';
    localStorage.removeItem(OVERRIDE_LS_KEY);
  }

  // ── Lazy Studio Font Loader ─────────────────────────────────────────────
  // Core fonts (Noto Sans, Hebrew, Serif) are in the HTML <link>.
  // Studio/theme fonts are loaded on-demand when the theme picker opens.
  var _studioFontsLoaded = false;
  function loadStudioFonts() {
    if (_studioFontsLoaded) return;
    _studioFontsLoaded = true;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?'
      + 'family=Lora:ital,wght@0,400;0,700;1,400'
      + '&family=Merriweather:ital,wght@0,400;0,700;1,400'
      + '&family=Montserrat:wght@400;600;700'
      + '&family=Nunito:wght@400;600;700'
      + '&family=Open+Sans:wght@400;600;700'
      + '&family=Poppins:wght@400;600;700'
      + '&family=Playfair+Display:ital,wght@0,400;0,700;1,400'
      + '&family=PT+Serif:ital,wght@0,400;0,700;1,400'
      + '&family=Raleway:wght@400;600;700'
      + '&family=Roboto:wght@400;500;700'
      + '&family=Roboto+Slab:wght@400;600;700'
      + '&family=Source+Sans+3:wght@400;600;700'
      + '&family=Work+Sans:wght@400;600;700'
      + '&display=swap';
    document.head.appendChild(link);
  }

  return {
    themes:    THEMES,
    themeMeta: THEME_META,
    init,
    setTheme,
    getTheme,
    getGlobalTheme,
    applyOverrides,
    loadOverrides,
    clearOverrides,
    loadStudioFonts,
    OVERRIDE_LS_KEY: OVERRIDE_LS_KEY
  };

})();
