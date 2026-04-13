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
  const STYLE_ID      = 'adornment-css';

  /* ─── CSS ─────────────────────────────────────────────────────────────────── */

  const CSS = `
/* ─── STUDIO FONTS — loaded on demand via Adornment.loadStudioFonts() ────── */
/* Core fonts (Noto Sans, Noto Sans Hebrew, Noto Serif) are loaded via <link>
   in the HTML head. Studio/theme fonts below are injected only when needed. */

/* ─── RESET & BASE ─────────────────────────────────────────────────────────── */

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 100%;
  line-height: 1.6;
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}

body {
  background: var(--bg);
  color: var(--ink);
  min-height: 100dvh;
  transition: background 0.35s ease, color 0.25s ease;
}

img, svg { display: block; max-width: 100%; }
a { color: var(--link); text-decoration: none; }

/* ── Global scrollbar ─────────────────────────────────────────────────────── */
::-webkit-scrollbar          { width: 6px; height: 6px; }
::-webkit-scrollbar-track    { background: transparent; }
::-webkit-scrollbar-thumb    { background: var(--line-strong); border-radius: 99px; }
::-webkit-scrollbar-thumb:hover { background: var(--accent); }
*                            { scrollbar-width: thin; scrollbar-color: var(--line-strong) transparent; }

/* ── Keyboard focus ring ──────────────────────────────────────────────────── */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
button:focus:not(:focus-visible),
input:focus:not(:focus-visible),
select:focus:not(:focus-visible),
textarea:focus:not(:focus-visible) {
  outline: none;
}
a:hover { color: var(--link-hover); }

/* Prevent iOS auto-zoom on form focus (requires >= 16px);
   max() lets inputs scale up with the font-scale slider while keeping
   the 16px floor iOS needs to prevent auto-zoom.
   The !important on mobile overrides inline font-size styles that would
   otherwise drop below 16px and trigger the iOS zoom. */
input, select, textarea { font-size: max(1rem, 16px); }
@media (max-width: 768px) {
  input, select, textarea { font-size: 16px !important; }
}


/* ══════════════════════════════════════════════════════════════════════════════
   THEME TOKENS
   ══════════════════════════════════════════════════════════════════════════════ */


/* ── 1. Dayspring ─── Warm ivory, soft sky, golden hour ─────────────────────
   The default. Clean, warm, uplifting.                                        */

[data-theme="dayspring"],
:root {
  --bg:            #faf9f6;
  --bg-raised:     #ffffff;
  --bg-sunken:     #f0eeea;
  --bg-hover:      #f5f3ef;

  --ink:           #2c2c2c;
  --ink-muted:     #6b6b6b;
  --ink-faint:     #a0a0a0;
  --ink-inverse:   #faf9f6;

  --accent:        #7eaacc;
  --accent-hover:  #6394ba;
  --accent-soft:   rgba(126,170,204,0.12);

  --mint:          #8cc5a2;
  --mint-soft:     rgba(140,197,162,0.12);

  --peach:         #f0a889;
  --peach-soft:    rgba(240,168,137,0.12);

  --lilac:         #b49bdb;
  --lilac-soft:    rgba(180,155,219,0.12);

  --rose:          #e69aba;
  --rose-soft:     rgba(230,154,186,0.12);

  --gold:          #8B7028;
  --gold-soft:     rgba(139,112,40,0.15);

  --sky:           #8abde0;
  --sky-soft:      rgba(138,189,224,0.12);

  --danger:        #c0392b;
  --danger-soft:   rgba(192,57,43,0.10);
  --success:       #3d8b4f;
  --success-soft:  rgba(61,139,79,0.10);
  --warning:       #946B1C;
  --warning-soft:  rgba(148,107,28,0.12);

  --link:          #5a8fb5;
  --link-hover:    #3d7199;

  --line:          #e4e1dc;
  --line-strong:   #d0ccc5;

  --shadow-sm:     0 1px 3px rgba(0,0,0,0.06);
  --shadow-md:     0 4px 12px rgba(0,0,0,0.06);
  --shadow-lg:     0 8px 24px rgba(0,0,0,0.08);

  --radius-sm:     6px;
  --radius-md:     12px;
  --radius-lg:     20px;
  --radius-pill:   9999px;

  --paper:         #fffef8;
  --paper-line:    #d4c5a9;
  --paper-margin:  #e8a0a0;

  color-scheme: light;
}


/* ── 2. Meadow ─── Sage green, cream, botanical ────────────────────────────
   Inspired by tbc_care.html — earthy, gentle, grounded.                      */

[data-theme="meadow"] {
  --bg:            #f6f7f4;
  --bg-raised:     #ffffff;
  --bg-sunken:     #eef0ea;
  --bg-hover:      #f2f3ef;

  --ink:           #1f2923;
  --ink-muted:     #5b6a60;
  --ink-faint:     #8a9a8e;
  --ink-inverse:   #f6f7f4;

  --accent:        #6ba88a;
  --accent-hover:  #53926f;
  --accent-soft:   rgba(107,168,138,0.12);

  --mint:          #7cc49a;
  --mint-soft:     rgba(124,196,154,0.12);

  --peach:         #d4a07a;
  --peach-soft:    rgba(212,160,122,0.12);

  --lilac:         #9c8dbb;
  --lilac-soft:    rgba(156,141,187,0.12);

  --rose:          #c98aa0;
  --rose-soft:     rgba(201,138,160,0.12);

  --gold:          #836A1E;
  --gold-soft:     rgba(131,106,30,0.15);

  --sky:           #7fb3c4;
  --sky-soft:      rgba(127,179,196,0.12);

  --danger:        #a8321e;
  --danger-soft:   rgba(168,50,30,0.10);
  --success:       #357a4c;
  --success-soft:  rgba(53,122,76,0.10);
  --warning:       #8A6418;
  --warning-soft:  rgba(138,100,24,0.12);

  --link:          #3d8c6a;
  --link-hover:    #2a6e52;

  --line:          #dbe6d6;
  --line-strong:   #c5d1c7;

  --shadow-sm:     0 1px 3px rgba(0,0,0,0.05);
  --shadow-md:     0 4px 12px rgba(0,0,0,0.05);
  --shadow-lg:     0 8px 24px rgba(0,0,0,0.07);

  --paper:         #f6faf4;
  --paper-line:    #b8d4b0;
  --paper-margin:  #d4a0a0;

  color-scheme: light;
}


/* ── 3. Lavender ─── Soft violet, dove grey, quiet elegance ─────────────── */

[data-theme="lavender"] {
  --bg:            #f8f6fb;
  --bg-raised:     #ffffff;
  --bg-sunken:     #f0ecf5;
  --bg-hover:      #f4f1f8;

  --ink:           #2e2836;
  --ink-muted:     #6d6378;
  --ink-faint:     #9c92a8;
  --ink-inverse:   #f8f6fb;

  --accent:        #9b7ec8;
  --accent-hover:  #8463b5;
  --accent-soft:   rgba(155,126,200,0.12);

  --mint:          #78b89c;
  --mint-soft:     rgba(120,184,156,0.12);

  --peach:         #d4a088;
  --peach-soft:    rgba(212,160,136,0.12);

  --lilac:         #a88ec8;
  --lilac-soft:    rgba(168,142,200,0.14);

  --rose:          #cf8faa;
  --rose-soft:     rgba(207,143,170,0.12);

  --gold:          #887024;
  --gold-soft:     rgba(136,112,36,0.15);

  --sky:           #82aed0;
  --sky-soft:      rgba(130,174,208,0.12);

  --danger:        #b03636;
  --danger-soft:   rgba(176,54,54,0.10);
  --success:       #3f8858;
  --success-soft:  rgba(63,136,88,0.10);
  --warning:       #906A1E;
  --warning-soft:  rgba(144,106,30,0.12);

  --link:          #7e5eb0;
  --link-hover:    #633d98;

  --line:          #e4dded;
  --line-strong:   #d2c8df;

  --shadow-sm:     0 1px 3px rgba(50,20,80,0.06);
  --shadow-md:     0 4px 12px rgba(50,20,80,0.06);
  --shadow-lg:     0 8px 24px rgba(50,20,80,0.08);

  --paper:         #faf8fc;
  --paper-line:    #d0c0e0;
  --paper-margin:  #d4a0b8;

  color-scheme: light;
}


/* ── 4. Rosewood ─── Blush pink, warm, nurturing ───────────────────────── */

[data-theme="rosewood"] {
  --bg:            #fbf6f7;
  --bg-raised:     #ffffff;
  --bg-sunken:     #f4ecee;
  --bg-hover:      #f8f1f3;

  --ink:           #36292c;
  --ink-muted:     #7a6268;
  --ink-faint:     #a89096;
  --ink-inverse:   #fbf6f7;

  --accent:        #c27d8f;
  --accent-hover:  #ad6578;
  --accent-soft:   rgba(194,125,143,0.12);

  --mint:          #7dba9a;
  --mint-soft:     rgba(125,186,154,0.12);

  --peach:         #e0a88c;
  --peach-soft:    rgba(224,168,140,0.12);

  --lilac:         #a68cc0;
  --lilac-soft:    rgba(166,140,192,0.12);

  --rose:          #d48ea8;
  --rose-soft:     rgba(212,142,168,0.14);

  --gold:          #8A7226;
  --gold-soft:     rgba(138,114,38,0.15);

  --sky:           #82b0cc;
  --sky-soft:      rgba(130,176,204,0.12);

  --danger:        #b23838;
  --danger-soft:   rgba(178,56,56,0.10);
  --success:       #3f8c56;
  --success-soft:  rgba(63,140,86,0.10);
  --warning:       #926C1E;
  --warning-soft:  rgba(146,108,30,0.12);

  --link:          #a8607a;
  --link-hover:    #8e4862;

  --line:          #eddfe2;
  --line-strong:   #ddd0d5;

  --shadow-sm:     0 1px 3px rgba(60,20,30,0.06);
  --shadow-md:     0 4px 12px rgba(60,20,30,0.06);
  --shadow-lg:     0 8px 24px rgba(60,20,30,0.08);

  --paper:         #fdf8f6;
  --paper-line:    #e0c8c0;
  --paper-margin:  #d4a0a0;

  color-scheme: light;
}


/* ── 5. Vesper ─── Deep navy, soft pastels on dark — the dark default ──── */

[data-theme="vesper"] {
  --bg:            #0f1118;
  --bg-raised:     #181b24;
  --bg-sunken:     #0a0c12;
  --bg-hover:      #1e2130;

  --ink:           #e8e6f0;
  --ink-muted:     #9a98ab;
  --ink-faint:     #5e5c6e;
  --ink-inverse:   #0f1118;

  --accent:        #8ab4d6;
  --accent-hover:  #a0c6e4;
  --accent-soft:   rgba(138,180,214,0.14);

  --mint:          #7cc4a0;
  --mint-soft:     rgba(124,196,160,0.12);

  --peach:         #e8a888;
  --peach-soft:    rgba(232,168,136,0.12);

  --lilac:         #b8a0d8;
  --lilac-soft:    rgba(184,160,216,0.12);

  --rose:          #e09ab8;
  --rose-soft:     rgba(224,154,184,0.12);

  --gold:          #d4b870;
  --gold-soft:     rgba(212,184,112,0.12);

  --sky:           #7ec0e0;
  --sky-soft:      rgba(126,192,224,0.12);

  --danger:        #f07070;
  --danger-soft:   rgba(240,112,112,0.12);
  --success:       #60c48a;
  --success-soft:  rgba(96,196,138,0.12);
  --warning:       #e0b048;
  --warning-soft:  rgba(224,176,72,0.12);

  --link:          #8ab4d6;
  --link-hover:    #a8cce8;

  --line:          rgba(255,255,255,0.08);
  --line-strong:   rgba(255,255,255,0.14);

  --shadow-sm:     0 1px 3px rgba(0,0,0,0.30);
  --shadow-md:     0 4px 12px rgba(0,0,0,0.30);
  --shadow-lg:     0 8px 24px rgba(0,0,0,0.40);

  --paper:         #181b24;
  --paper-line:    rgba(255,255,255,0.06);
  --paper-margin:  rgba(180,80,80,0.30);

  color-scheme: dark;
}


/* ── 6. Evergreen ─── Forest dark, sage pastels ─────────────────────────── */

[data-theme="evergreen"] {
  --bg:            #0e1510;
  --bg-raised:     #151e18;
  --bg-sunken:     #0a0f0b;
  --bg-hover:      #1a261e;

  --ink:           #e0eae2;
  --ink-muted:     #8ea898;
  --ink-faint:     #586e60;
  --ink-inverse:   #0e1510;

  --accent:        #6ec496;
  --accent-hover:  #88d4ac;
  --accent-soft:   rgba(110,196,150,0.14);

  --mint:          #7ad0a4;
  --mint-soft:     rgba(122,208,164,0.12);

  --peach:         #d4a880;
  --peach-soft:    rgba(212,168,128,0.12);

  --lilac:         #a898c4;
  --lilac-soft:    rgba(168,152,196,0.12);

  --rose:          #c88ea0;
  --rose-soft:     rgba(200,142,160,0.12);

  --gold:          #c8b060;
  --gold-soft:     rgba(200,176,96,0.12);

  --sky:           #78b8d0;
  --sky-soft:      rgba(120,184,208,0.12);

  --danger:        #e06856;
  --danger-soft:   rgba(224,104,86,0.12);
  --success:       #58c080;
  --success-soft:  rgba(88,192,128,0.12);
  --warning:       #d0a840;
  --warning-soft:  rgba(208,168,64,0.12);

  --link:          #6ec496;
  --link-hover:    #90d8b0;

  --line:          rgba(255,255,255,0.07);
  --line-strong:   rgba(255,255,255,0.13);

  --shadow-sm:     0 1px 3px rgba(0,0,0,0.30);
  --shadow-md:     0 4px 12px rgba(0,0,0,0.30);
  --shadow-lg:     0 8px 24px rgba(0,0,0,0.40);

  --paper:         #141a18;
  --paper-line:    rgba(255,255,255,0.06);
  --paper-margin:  rgba(160,90,80,0.30);

  color-scheme: dark;
}


/* ── 7. Twilight ─── Deep purple, violet pastels ────────────────────────── */

[data-theme="twilight"] {
  --bg:            #12101a;
  --bg-raised:     #1c1828;
  --bg-sunken:     #0c0a14;
  --bg-hover:      #241e34;

  --ink:           #e6e0f0;
  --ink-muted:     #9c94b0;
  --ink-faint:     #605878;
  --ink-inverse:   #12101a;

  --accent:        #a088d0;
  --accent-hover:  #b8a0e4;
  --accent-soft:   rgba(160,136,208,0.14);

  --mint:          #72c4a0;
  --mint-soft:     rgba(114,196,160,0.12);

  --peach:         #e0a490;
  --peach-soft:    rgba(224,164,144,0.12);

  --lilac:         #b898e0;
  --lilac-soft:    rgba(184,152,224,0.14);

  --rose:          #d88eac;
  --rose-soft:     rgba(216,142,172,0.12);

  --gold:          #d0b460;
  --gold-soft:     rgba(208,180,96,0.12);

  --sky:           #80b8d8;
  --sky-soft:      rgba(128,184,216,0.12);

  --danger:        #e86868;
  --danger-soft:   rgba(232,104,104,0.12);
  --success:       #58c488;
  --success-soft:  rgba(88,196,136,0.12);
  --warning:       #d8b040;
  --warning-soft:  rgba(216,176,64,0.12);

  --link:          #a088d0;
  --link-hover:    #bca0e8;

  --line:          rgba(255,255,255,0.08);
  --line-strong:   rgba(255,255,255,0.14);

  --shadow-sm:     0 1px 3px rgba(0,0,0,0.30);
  --shadow-md:     0 4px 12px rgba(0,0,0,0.30);
  --shadow-lg:     0 8px 24px rgba(0,0,0,0.40);

  --paper:         #18141e;
  --paper-line:    rgba(255,255,255,0.06);
  --paper-margin:  rgba(180,80,120,0.30);

  color-scheme: dark;
}


/* ── 8. Obsidian ─── True black, high-contrast pastels — OLED saver ─────  */

[data-theme="obsidian"] {
  --bg:            #000000;
  --bg-raised:     #111111;
  --bg-sunken:     #000000;
  --bg-hover:      #1a1a1a;

  --ink:           #f0f0f0;
  --ink-muted:     #a0a0a0;
  --ink-faint:     #606060;
  --ink-inverse:   #000000;

  --accent:        #88b8e0;
  --accent-hover:  #a0cce8;
  --accent-soft:   rgba(136,184,224,0.14);

  --mint:          #70c89c;
  --mint-soft:     rgba(112,200,156,0.12);

  --peach:         #f0a888;
  --peach-soft:    rgba(240,168,136,0.12);

  --lilac:         #b8a0e0;
  --lilac-soft:    rgba(184,160,224,0.12);

  --rose:          #e090b0;
  --rose-soft:     rgba(224,144,176,0.12);

  --gold:          #d8bc68;
  --gold-soft:     rgba(216,188,104,0.12);

  --sky:           #80c0e0;
  --sky-soft:      rgba(128,192,224,0.12);

  --danger:        #f07070;
  --danger-soft:   rgba(240,112,112,0.12);
  --success:       #60cc8c;
  --success-soft:  rgba(96,204,140,0.12);
  --warning:       #e0b848;
  --warning-soft:  rgba(224,184,72,0.12);

  --link:          #88b8e0;
  --link-hover:    #a8d0f0;

  --line:          rgba(255,255,255,0.10);
  --line-strong:   rgba(255,255,255,0.16);

  --shadow-sm:     0 1px 3px rgba(0,0,0,0.50);
  --shadow-md:     0 4px 12px rgba(0,0,0,0.50);
  --shadow-lg:     0 8px 24px rgba(0,0,0,0.60);

  --paper:         #0e0e0e;
  --paper-line:    rgba(255,255,255,0.05);
  --paper-margin:  rgba(180,70,70,0.28);

  color-scheme: dark;
}


/* ═══════════════════════════════════════════════════════════════════════════
   COUNTRY FLAG THEMES — Patriotic palettes drawn from national colors
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── 9. America ─── Old Glory Red, White & Blue ─────────────────────────── */

[data-theme="america"] {
  --bg:            #f7f8fb;
  --bg-raised:     #ffffff;
  --bg-sunken:     #edf0f6;
  --bg-hover:      #f0f3f9;

  --ink:           #1b264f;
  --ink-muted:     #4a5578;
  --ink-faint:     #8890a5;
  --ink-inverse:   #f7f8fb;

  --accent:        #3c3b6e;
  --accent-hover:  #2d2c55;
  --accent-soft:   rgba(60,59,110,0.12);

  --mint:          #6ea9d7;
  --mint-soft:     rgba(110,169,215,0.12);

  --peach:         #b22234;
  --peach-soft:    rgba(178,34,52,0.10);

  --lilac:         #8b9cc7;
  --lilac-soft:    rgba(139,156,199,0.12);

  --rose:          #c94254;
  --rose-soft:     rgba(201,66,84,0.10);

  --gold:          #c5a44e;
  --gold-soft:     rgba(197,164,78,0.12);

  --sky:           #5b8fbf;
  --sky-soft:      rgba(91,143,191,0.12);

  --danger:        #b22234;
  --danger-soft:   rgba(178,34,52,0.10);
  --success:       #3d7a4f;
  --success-soft:  rgba(61,122,79,0.10);
  --warning:       #b58d2a;
  --warning-soft:  rgba(181,141,42,0.12);

  --link:          #3c3b6e;
  --link-hover:    #2d2c55;

  --line:          #d4d9e6;
  --line-strong:   #bec5d6;

  --shadow-sm:     0 1px 3px rgba(27,38,79,0.06);
  --shadow-md:     0 4px 12px rgba(27,38,79,0.06);
  --shadow-lg:     0 8px 24px rgba(27,38,79,0.08);

  --radius-sm:     6px;
  --radius-md:     12px;
  --radius-lg:     20px;
  --radius-pill:   9999px;

  --paper:         #fdfeff;
  --paper-line:    #c8d0e0;
  --paper-margin:  #d8a0a0;

  color-scheme: light;
}


/* ── 10. Guatemala ─── Maya Blue & White — cielo y paz ──────────────────── */

[data-theme="guatemala"] {
  --bg:            #f4f9fc;
  --bg-raised:     #ffffff;
  --bg-sunken:     #e9f2f8;
  --bg-hover:      #eef5fa;

  --ink:           #173048;
  --ink-muted:     #3f5e78;
  --ink-faint:     #7f9aaf;
  --ink-inverse:   #f4f9fc;

  --accent:        #4997d0;
  --accent-hover:  #3580b8;
  --accent-soft:   rgba(73,151,208,0.12);

  --mint:          #65b89a;
  --mint-soft:     rgba(101,184,154,0.12);

  --peach:         #e0946a;
  --peach-soft:    rgba(224,148,106,0.12);

  --lilac:         #8daed0;
  --lilac-soft:    rgba(141,174,208,0.12);

  --rose:          #c78ea0;
  --rose-soft:     rgba(199,142,160,0.12);

  --gold:          #c4a94e;
  --gold-soft:     rgba(196,169,78,0.12);

  --sky:           #4997d0;
  --sky-soft:      rgba(73,151,208,0.12);

  --danger:        #c0392b;
  --danger-soft:   rgba(192,57,43,0.10);
  --success:       #3d8b5f;
  --success-soft:  rgba(61,139,95,0.10);
  --warning:       #a08830;
  --warning-soft:  rgba(160,136,48,0.12);

  --link:          #3580b8;
  --link-hover:    #266a98;

  --line:          #d0dfe8;
  --line-strong:   #b8ccda;

  --shadow-sm:     0 1px 3px rgba(23,48,72,0.06);
  --shadow-md:     0 4px 12px rgba(23,48,72,0.06);
  --shadow-lg:     0 8px 24px rgba(23,48,72,0.08);

  --radius-sm:     6px;
  --radius-md:     12px;
  --radius-lg:     20px;
  --radius-pill:   9999px;

  --paper:         #fbfdff;
  --paper-line:    #b0c8d8;
  --paper-margin:  #7dbce0;

  color-scheme: light;
}


/* ── 11. Mexico ─── Verde, Blanco y Rojo — eagle & serpent ──────────────── */

[data-theme="mexico"] {
  --bg:            #f5f8f4;
  --bg-raised:     #ffffff;
  --bg-sunken:     #ebf0e8;
  --bg-hover:      #f0f4ee;

  --ink:           #1e2d1a;
  --ink-muted:     #4a5e42;
  --ink-faint:     #88997f;
  --ink-inverse:   #f5f8f4;

  --accent:        #006847;
  --accent-hover:  #005238;
  --accent-soft:   rgba(0,104,71,0.12);

  --mint:          #3a9a6f;
  --mint-soft:     rgba(58,154,111,0.12);

  --peach:         #ce1126;
  --peach-soft:    rgba(206,17,38,0.10);

  --lilac:         #8aab98;
  --lilac-soft:    rgba(138,171,152,0.12);

  --rose:          #d44a5a;
  --rose-soft:     rgba(212,74,90,0.10);

  --gold:          #c8a84e;
  --gold-soft:     rgba(200,168,78,0.12);

  --sky:           #68a8b8;
  --sky-soft:      rgba(104,168,184,0.12);

  --danger:        #ce1126;
  --danger-soft:   rgba(206,17,38,0.10);
  --success:       #006847;
  --success-soft:  rgba(0,104,71,0.10);
  --warning:       #b89030;
  --warning-soft:  rgba(184,144,48,0.12);

  --link:          #006847;
  --link-hover:    #005238;

  --line:          #d0dbc8;
  --line-strong:   #b8c8ae;

  --shadow-sm:     0 1px 3px rgba(30,45,26,0.06);
  --shadow-md:     0 4px 12px rgba(30,45,26,0.06);
  --shadow-lg:     0 8px 24px rgba(30,45,26,0.08);

  --radius-sm:     6px;
  --radius-md:     12px;
  --radius-lg:     20px;
  --radius-pill:   9999px;

  --paper:         #fcfdf8;
  --paper-line:    #b8c8a8;
  --paper-margin:  #d8a0a0;

  color-scheme: light;
}


/* ── 12. Germany ─── Schwarz, Rot, Gold — Bundesfarben ──────────────────── */

[data-theme="germany"] {
  --bg:            #14120e;
  --bg-raised:     #1e1b16;
  --bg-sunken:     #0c0a08;
  --bg-hover:      #252118;

  --ink:           #f0e8d8;
  --ink-muted:     #b0a890;
  --ink-faint:     #706858;
  --ink-inverse:   #14120e;

  --accent:        #dd0000;
  --accent-hover:  #ff2222;
  --accent-soft:   rgba(221,0,0,0.16);

  --mint:          #80b090;
  --mint-soft:     rgba(128,176,144,0.12);

  --peach:         #e08040;
  --peach-soft:    rgba(224,128,64,0.12);

  --lilac:         #b090b8;
  --lilac-soft:    rgba(176,144,184,0.12);

  --rose:          #e06070;
  --rose-soft:     rgba(224,96,112,0.12);

  --gold:          #ffcc00;
  --gold-soft:     rgba(255,204,0,0.16);

  --sky:           #80b0d0;
  --sky-soft:      rgba(128,176,208,0.12);

  --danger:        #ff4040;
  --danger-soft:   rgba(255,64,64,0.14);
  --success:       #60c080;
  --success-soft:  rgba(96,192,128,0.12);
  --warning:       #ffcc00;
  --warning-soft:  rgba(255,204,0,0.14);

  --link:          #ffcc00;
  --link-hover:    #ffe060;

  --line:          rgba(255,204,0,0.14);
  --line-strong:   rgba(255,204,0,0.22);

  --shadow-sm:     0 1px 3px rgba(0,0,0,0.40);
  --shadow-md:     0 4px 12px rgba(0,0,0,0.40);
  --shadow-lg:     0 8px 24px rgba(0,0,0,0.50);

  --radius-sm:     6px;
  --radius-md:     12px;
  --radius-lg:     20px;
  --radius-pill:   9999px;

  --paper:         #1a1710;
  --paper-line:    rgba(255,204,0,0.08);
  --paper-margin:  rgba(221,0,0,0.22);

  color-scheme: dark;
}


/* ── 13. Afghanistan ─── سه رنگ — Black, Red & Green ────────────────────── */

[data-theme="afghanistan"] {
  --bg:            #0e100c;
  --bg-raised:     #181a14;
  --bg-sunken:     #080a06;
  --bg-hover:      #20231a;

  --ink:           #e4e8dc;
  --ink-muted:     #a0a890;
  --ink-faint:     #606850;
  --ink-inverse:   #0e100c;

  --accent:        #007a3d;
  --accent-hover:  #009a50;
  --accent-soft:   rgba(0,122,61,0.18);

  --mint:          #4db87a;
  --mint-soft:     rgba(77,184,122,0.14);

  --peach:         #d32011;
  --peach-soft:    rgba(211,32,17,0.14);

  --lilac:         #90a8a0;
  --lilac-soft:    rgba(144,168,160,0.12);

  --rose:          #e05050;
  --rose-soft:     rgba(224,80,80,0.14);

  --gold:          #c8b068;
  --gold-soft:     rgba(200,176,104,0.14);

  --sky:           #70a8c0;
  --sky-soft:      rgba(112,168,192,0.12);

  --danger:        #d32011;
  --danger-soft:   rgba(211,32,17,0.14);
  --success:       #007a3d;
  --success-soft:  rgba(0,122,61,0.14);
  --warning:       #d0a830;
  --warning-soft:  rgba(208,168,48,0.14);

  --link:          #4db87a;
  --link-hover:    #6ad09a;

  --line:          rgba(0,122,61,0.16);
  --line-strong:   rgba(0,122,61,0.25);

  --shadow-sm:     0 1px 3px rgba(0,0,0,0.44);
  --shadow-md:     0 4px 12px rgba(0,0,0,0.44);
  --shadow-lg:     0 8px 24px rgba(0,0,0,0.54);

  --radius-sm:     6px;
  --radius-md:     12px;
  --radius-lg:     20px;
  --radius-pill:   9999px;

  --paper:         #12140e;
  --paper-line:    rgba(0,122,61,0.10);
  --paper-margin:  rgba(211,32,17,0.22);

  color-scheme: dark;
}


/* ── AUTO THEME ── follows device prefers-color-scheme ──────────────────── */

@media (prefers-color-scheme: light) {
  [data-theme="auto"] {
    --bg:            #faf9f6;
    --bg-raised:     #ffffff;
    --bg-sunken:     #f0eeea;
    --bg-hover:      #f5f3ef;
    --ink:           #2c2c2c;
    --ink-muted:     #6b6b6b;
    --ink-faint:     #a0a0a0;
    --ink-inverse:   #faf9f6;
    --accent:        #7eaacc;
    --accent-hover:  #6394ba;
    --accent-soft:   rgba(126,170,204,0.12);
    --mint:          #8cc5a2;
    --mint-soft:     rgba(140,197,162,0.12);
    --peach:         #f0a889;
    --peach-soft:    rgba(240,168,137,0.12);
    --lilac:         #b49bdb;
    --lilac-soft:    rgba(180,155,219,0.12);
    --rose:          #e69aba;
    --rose-soft:     rgba(230,154,186,0.12);
    --gold:          #8B7028;
    --gold-soft:     rgba(139,112,40,0.15);
    --sky:           #8abde0;
    --sky-soft:      rgba(138,189,224,0.12);
    --danger:        #d4574e;
    --danger-soft:   rgba(212,87,78,0.10);
    --success:       #4a9e6e;
    --success-soft:  rgba(74,158,110,0.10);
    --warning:       #c98b2e;
    --warning-soft:  rgba(201,139,46,0.10);
    --link:          #5a8fb5;
    --link-hover:    #3d7199;
    --line:          #e4e1dc;
    --line-strong:   #d0ccc5;
    --shadow-sm:     0 1px 3px rgba(0,0,0,0.06);
    --shadow-md:     0 4px 12px rgba(0,0,0,0.06);
    --shadow-lg:     0 8px 24px rgba(0,0,0,0.08);
    --paper:         #fffef8;
    --paper-line:    #d4c5a9;
    --paper-margin:  #e8a0a0;
    color-scheme: light;
  }
}

@media (prefers-color-scheme: dark) {
  [data-theme="auto"] {
    --bg:            #0f1118;
    --bg-raised:     #181b24;
    --bg-sunken:     #0a0c12;
    --bg-hover:      #1e2130;
    --ink:           #e8e6f0;
    --ink-muted:     #9a98ab;
    --ink-faint:     #5e5c6e;
    --ink-inverse:   #0f1118;
    --accent:        #8ab4d6;
    --accent-hover:  #a0c6e4;
    --accent-soft:   rgba(138,180,214,0.14);
    --mint:          #7cc4a0;
    --mint-soft:     rgba(124,196,160,0.12);
    --peach:         #e8a888;
    --peach-soft:    rgba(232,168,136,0.12);
    --lilac:         #b8a0d8;
    --lilac-soft:    rgba(184,160,216,0.12);
    --rose:          #e09ab8;
    --rose-soft:     rgba(224,154,184,0.12);
    --gold:          #d4b870;
    --gold-soft:     rgba(212,184,112,0.12);
    --sky:           #7ec0e0;
    --sky-soft:      rgba(126,192,224,0.12);
    --danger:        #f07070;
    --danger-soft:   rgba(240,112,112,0.12);
    --success:       #60c48a;
    --success-soft:  rgba(96,196,138,0.12);
    --warning:       #e0b048;
    --warning-soft:  rgba(224,176,72,0.12);
    --link:          #8ab4d6;
    --link-hover:    #a8cce8;
    --line:          rgba(255,255,255,0.08);
    --line-strong:   rgba(255,255,255,0.14);
    --shadow-sm:     0 1px 3px rgba(0,0,0,0.30);
    --shadow-md:     0 4px 12px rgba(0,0,0,0.30);
    --shadow-lg:     0 8px 24px rgba(0,0,0,0.40);
    --paper:         #181b24;
    --paper-line:    rgba(255,255,255,0.06);
    --paper-margin:  rgba(180,80,80,0.30);
    color-scheme: dark;
  }
}


/* ══════════════════════════════════════════════════════════════════════════════
   TYPOGRAPHY
   ══════════════════════════════════════════════════════════════════════════════ */

h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  line-height: 1.25;
  color: var(--ink);
}

h1 { font-size: 2rem; }
h2 { font-size: 1.5rem; }
h3 { font-size: 1.25rem; }
h4 { font-size: 1.1rem; }

.text-muted   { color: var(--ink-muted); }
.text-faint   { color: var(--ink-faint); }
.text-accent  { color: var(--accent); }
.text-mint    { color: var(--mint); }
.text-peach   { color: var(--peach); }
.text-lilac   { color: var(--lilac); }
.text-rose    { color: var(--rose); }
.text-gold    { color: var(--gold); }
.text-sky     { color: var(--sky); }
.text-danger  { color: var(--danger); }
.text-success { color: var(--success); }
.text-warning { color: var(--warning); }

.text-sm { font-size: 0.875rem; }
.text-xs { font-size: 0.75rem; }
.text-lg { font-size: 1.125rem; }


/* ══════════════════════════════════════════════════════════════════════════════
   LAYOUT
   ══════════════════════════════════════════════════════════════════════════════ */

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.25rem;
}

.container-narrow { max-width: 720px; }
.container-wide   { max-width: 1440px; }

.stack    { display: flex; flex-direction: column; }
.stack-xs { gap: 0.25rem; }
.stack-sm { gap: 0.5rem; }
.stack-md { gap: 1rem; }
.stack-lg { gap: 1.5rem; }
.stack-xl { gap: 2rem; }

.row         { display: flex; flex-wrap: wrap; align-items: center; }
.row-between { justify-content: space-between; }

.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }

@media (max-width: 768px) {
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
}


/* ══════════════════════════════════════════════════════════════════════════════
   CARDS
   ══════════════════════════════════════════════════════════════════════════════ */

.card {
  background: var(--bg-raised);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--line-strong);
}

.card-flush  { padding: 0; }

.card-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--line);
}

.card-body { padding: 1.25rem; }

.card-footer {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--line);
  background: var(--bg-sunken);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
}

.card .card-icon  { font-size: 1.6rem; }
.card .card-title { font-size: 0.92rem; }
.card .card-desc  { font-size: 0.78rem; }


/* ══════════════════════════════════════════════════════════════════════════════
   PILLS & BADGES
   ══════════════════════════════════════════════════════════════════════════════ */

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.4;
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  white-space: nowrap;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.pill-accent  { color: var(--accent);  background: var(--accent-soft);  border-color: var(--accent-soft); }
.pill-mint    { color: var(--mint);    background: var(--mint-soft);    border-color: var(--mint-soft); }
.pill-peach   { color: var(--peach);   background: var(--peach-soft);   border-color: var(--peach-soft); }
.pill-lilac   { color: var(--lilac);   background: var(--lilac-soft);   border-color: var(--lilac-soft); }
.pill-rose    { color: var(--rose);    background: var(--rose-soft);    border-color: var(--rose-soft); }
.pill-gold    { color: var(--gold);    background: var(--gold-soft);    border-color: var(--gold-soft); }
.pill-sky     { color: var(--sky);     background: var(--sky-soft);     border-color: var(--sky-soft); }
.pill-danger  { color: var(--danger);  background: var(--danger-soft);  border-color: var(--danger-soft); }
.pill-success { color: var(--success); background: var(--success-soft); border-color: var(--success-soft); }
.pill-warning { color: var(--warning); background: var(--warning-soft); border-color: var(--warning-soft); }

.pill-outline               { background: transparent; }
.pill-outline.pill-accent   { border-color: var(--accent); }
.pill-outline.pill-mint     { border-color: var(--mint); }
.pill-outline.pill-peach    { border-color: var(--peach); }
.pill-outline.pill-lilac    { border-color: var(--lilac); }
.pill-outline.pill-rose     { border-color: var(--rose); }
.pill-outline.pill-gold     { border-color: var(--gold); }
.pill-outline.pill-sky      { border-color: var(--sky); }

.pill-lg {
  padding: 0.4rem 1rem;
  font-size: 0.8125rem;
}

.pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.badge { font-size: 0.72rem; }

/* ── Health Status Pills ─────────────────────────────────────────────────── */
.health-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.3rem 0.85rem;
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  line-height: 1.3;
  white-space: nowrap;
  transition: background 0.2s, border-color 0.2s;
}
.health-pill .health-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.health-pill-ok {
  color: var(--success);
  background: var(--success-soft);
  border-color: var(--success-soft);
}
.health-pill-ok .health-dot {
  background: var(--success);
  box-shadow: 0 0 6px var(--success);
  animation: health-pulse 2s ease-in-out infinite;
}
.health-pill-warn {
  color: var(--warning);
  background: var(--warning-soft);
  border-color: var(--warning-soft);
}
.health-pill-warn .health-dot {
  background: var(--warning);
  box-shadow: 0 0 6px var(--warning);
  animation: health-pulse 1.5s ease-in-out infinite;
}
.health-pill-fail {
  color: var(--danger);
  background: var(--danger-soft);
  border-color: var(--danger-soft);
}
.health-pill-fail .health-dot {
  background: var(--danger);
  box-shadow: 0 0 6px var(--danger);
}
.health-pill-unknown {
  color: var(--ink-muted);
  background: var(--bg-sunken);
  border-color: var(--line);
}
.health-pill-unknown .health-dot {
  background: var(--ink-faint);
}
@keyframes health-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ── Provisioning URL Fields ─────────────────────────────────────────────── */
.prov-url-field {
  width: 100%;
  font-size: 0.82rem;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  letter-spacing: -0.01em;
  background: var(--bg, #0f0f23);
  color: var(--ink, #e0e0e0);
  border: 1px solid var(--line, #333);
  border-radius: 8px;
  padding: 10px 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
}
.prov-url-field:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
  overflow: visible;
  text-overflow: unset;
}
.prov-url-field::placeholder {
  color: var(--ink-faint);
  font-style: italic;
}


/* ══════════════════════════════════════════════════════════════════════════════
   BUTTONS
   ══════════════════════════════════════════════════════════════════════════════ */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
  white-space: nowrap;
  line-height: 1.4;
}

.btn:active { transform: scale(0.97); }

.btn-primary {
  background: var(--accent);
  color: var(--ink-inverse);
  border-color: var(--accent);
}
.btn-primary:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}

.btn-secondary {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: transparent;
}
.btn-secondary:hover {
  background: var(--bg-hover);
  border-color: var(--accent);
}

.btn-ghost {
  background: transparent;
  color: var(--ink-muted);
}
.btn-ghost:hover {
  background: var(--bg-hover);
  color: var(--ink);
}

.btn-danger {
  background: var(--danger);
  color: var(--ink-inverse);
  border-color: var(--danger);
}
.btn-danger:hover {
  background: var(--danger-soft);
  color: var(--danger);
  border-color: var(--danger);
}

.btn-sm   { padding: 0.3rem 0.85rem; font-size: 0.75rem; }
.btn-icon { padding: 0.5rem; border-radius: var(--radius-md); }


/* ══════════════════════════════════════════════════════════════════════════════
   FORM ELEMENTS
   ══════════════════════════════════════════════════════════════════════════════ */

.input,
.textarea,
.select {
  width: 100%;
  padding: 0.6rem 0.85rem;
  font-size: max(1rem, 16px);
  font-family: inherit;
  color: var(--ink);
  background: var(--bg-raised);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input:focus,
.textarea:focus,
.select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.input::placeholder,
.textarea::placeholder {
  color: var(--ink-faint);
}

.textarea { resize: vertical; min-height: 100px; }

.label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ink-muted);
  margin-bottom: 0.35rem;
}

.field { margin-bottom: 1rem; }


/* ══════════════════════════════════════════════════════════════════════════════
   TABLE
   ══════════════════════════════════════════════════════════════════════════════ */

.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.table th {
  text-align: left;
  padding: 0.65rem 1rem;
  font-weight: 600;
  color: var(--ink-muted);
  background: var(--bg-sunken);
  border-bottom: 1px solid var(--line);
  white-space: nowrap;
}

.table td {
  padding: 0.65rem 1rem;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
}

.table tr:last-child td { border-bottom: none; }
.table tr:hover td      { background: var(--bg-hover); }


/* ══════════════════════════════════════════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════════════════════════════════════════ */

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: var(--bg-raised);
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
}

.nav-links {
  display: flex;
  gap: 0.25rem;
  list-style: none;
}

.nav-link {
  padding: 0.4rem 0.85rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ink-muted);
  border-radius: var(--radius-pill);
  transition: background 0.15s ease, color 0.15s ease;
}

.nav-link:hover,
.nav-link.active {
  background: var(--accent-soft);
  color: var(--accent);
}


/* ══════════════════════════════════════════════════════════════════════════════
   SIDEBAR — Nav Components (layout defined per-page in <style>)
   ══════════════════════════════════════════════════════════════════════════════ */

/* ── Nav Groups ─────────────────────────────────────────────────────────────── */
.nav-group { margin-bottom: 2px; }
.nav-group-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--ink-faint);
  padding: 10px 20px 4px;
  user-select: none;
}
.nav-group-items {
  overflow: visible;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
  font-size: 0.86rem;
  color: var(--ink);
  cursor: pointer;
  transition: all 0.15s;
  text-decoration: none;
  border-left: 3px solid transparent;
}
.nav-item:hover { background: var(--bg-hover); color: var(--accent); }
.nav-item.active {
  background: var(--accent-soft); color: var(--accent);
  border-left-color: var(--accent); font-weight: 600;
}
.nav-item .icon { font-size: 1rem; width: 20px; text-align: center; }

/* ── Favorites Section ──────────────────────────────────────────────────────── */
.nav-favorites {
  border-bottom: 1px solid var(--line);
  padding-bottom: 6px;
  margin-bottom: 4px;
}
.nav-favorites .nav-group-label {
  color: var(--gold);
  cursor: default;
}
.nav-favorites .nav-group-label::after {
  display: none;
}
.nav-favorites .nav-item .icon {
  color: var(--gold);
}
.nav-fav-empty {
  padding: 6px 20px;
  font-size: 0.75rem;
  color: var(--ink-faint);
  font-style: italic;
}


/* ══════════════════════════════════════════════════════════════════════════════
   MODAL / DIALOG
   ══════════════════════════════════════════════════════════════════════════════ */

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.25rem;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.modal-overlay.open { opacity: 1; pointer-events: auto; }
.modal-overlay      { backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }

.modal {
  background: var(--bg-raised);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 520px;
  max-height: 85dvh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--line);
}

.modal-title { font-size: 1.1rem; font-weight: 700; }
.modal-body  { padding: 1.25rem; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--line);
}


/* ══════════════════════════════════════════════════════════════════════════════
   TOAST / NOTIFICATION
   ══════════════════════════════════════════════════════════════════════════════ */

.toast {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 1.25rem;
  background: var(--bg-raised);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  font-size: 0.875rem;
  color: var(--ink);
  z-index: 2000;
  transform: translateY(120%);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.toast.show    { transform: translateY(0); opacity: 1; }
.toast-success { border-left: 3px solid var(--success); }
.toast-danger  { border-left: 3px solid var(--danger); }
.toast-warning { border-left: 3px solid var(--warning); }
.toast-info    { border-left: 3px solid var(--accent); }


/* ══════════════════════════════════════════════════════════════════════════════
   EMPTY STATE
   ══════════════════════════════════════════════════════════════════════════════ */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1.5rem;
  color: var(--ink-faint);
  background: var(--bg-raised);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
}

.empty-state-icon  { font-size: 2.5rem; margin-bottom: 0.75rem; opacity: 0.5; }
.empty-state-title { font-size: 1rem; font-weight: 600; color: var(--ink-muted); margin-bottom: 0.35rem; }
.empty-state .icon { font-size: 2.5rem; }
.empty-state h2    { font-size: 1.1rem; }
.empty-state p     { font-size: 0.85rem; }

/* ── Data Table ──────────────────────────────────────────────────────────────── */
.data-table             { font-size: 0.85rem; }
.data-table th          { font-size: 0.74rem; }
.data-table td          { line-height: 1.5; transition: background 0.1s ease; }
.data-table tbody tr:hover td { background: var(--bg-hover); }

/* ── Form control transitions ────────────────────────────────────────────────── */
input, select, textarea {
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

/* ── Alerts ──────────────────────────────────────────────────────────────────── */
.alert { font-size: 0.85rem; }

/* ── Page Header & Welcome Hero ──────────────────────────────────────────────── */
.page-header h1         { font-size: 1.4rem; }
.page-header p          { font-size: 0.85rem; }
.welcome-hero h1        { font-size: 2rem; }
.welcome-hero .subtitle { font-size: 1rem; }
.welcome-hero .verse    { font-size: 0.82rem; }


/* ══════════════════════════════════════════════════════════════════════════════
   LOADING / SKELETON
   ══════════════════════════════════════════════════════════════════════════════ */

.skeleton {
  background: var(--bg-sunken);
  border-radius: var(--radius-sm);
  position: relative;
  overflow: hidden;
}

.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--bg-hover) 50%,
    transparent 100%
  );
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.skeleton-line   { height: 0.875rem; margin-bottom: 0.5rem; }
.skeleton-circle { border-radius: 50%; }


/* ══════════════════════════════════════════════════════════════════════════════
   AVATAR
   ══════════════════════════════════════════════════════════════════════════════ */

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--ink-inverse);
  background: var(--accent);
  flex-shrink: 0;
}

.avatar-sm  { width: 28px; height: 28px; font-size: 0.65rem; }
.avatar-md  { width: 36px; height: 36px; font-size: 0.8rem; }
.avatar-lg  { width: 48px; height: 48px; font-size: 1rem; }
.avatar-xl  { width: 64px; height: 64px; font-size: 1.25rem; }

.avatar-mint  { background: var(--mint); }
.avatar-peach { background: var(--peach); }
.avatar-lilac { background: var(--lilac); }
.avatar-rose  { background: var(--rose); }
.avatar-gold  { background: var(--gold); }
.avatar-sky   { background: var(--sky); }


/* ══════════════════════════════════════════════════════════════════════════════
   STATUS DOT
   ══════════════════════════════════════════════════════════════════════════════ */

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot-online  { background: var(--success); }
.status-dot-offline { background: var(--danger); }
.status-dot-idle    { background: var(--warning); }
.status-dot-pending { background: var(--ink-faint); }


/* ══════════════════════════════════════════════════════════════════════════════
   THEME PICKER COMPONENT
   ══════════════════════════════════════════════════════════════════════════════ */

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
}

.theme-swatch {
  position: relative;
  border: 2px solid var(--line);
  border-radius: var(--radius-md);
  padding: 0.65rem;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.15s ease;
  background: var(--bg-raised);
}

.theme-swatch:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.theme-swatch.selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.theme-swatch-preview {
  height: 60px;
  border-radius: var(--radius-sm);
  margin-bottom: 0.5rem;
}

.theme-swatch-name {
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  color: var(--ink-muted);
}

.theme-swatch-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 0.6rem;
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-pill);
  font-weight: 700;
  text-transform: uppercase;
}


/* ══════════════════════════════════════════════════════════════════════════════
   RESPONSIVE UTILITIES
   ══════════════════════════════════════════════════════════════════════════════ */

.hide-mobile { display: block; }
.show-mobile { display: none; }

@media (max-width: 768px) {
  .hide-mobile { display: none; }
  .show-mobile { display: block; }

  .sidebar {
    position: fixed;
    left: -100%;
    z-index: 200;
    transition: left 0.25s ease;
  }
  .sidebar.open { left: 0; }

  h1 { font-size: 1.5rem; }
  h2 { font-size: 1.25rem; }

  .prayer-form-row { grid-template-columns: 1fr !important; }

  /* ── Responsive data-table: cards on mobile ──────────────────────────── */
  .data-table thead { display: none; }
  .data-table,
  .data-table tbody,
  .data-table tr,
  .data-table td { display: block; width: 100%; }
  .data-table tr {
    margin-bottom: 12px;
    border: 1px solid var(--line, #333);
    border-radius: 8px;
    padding: 10px 14px;
    background: var(--bg-raised, #1a1a2e);
  }
  .data-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
    border-bottom: none;
    font-size: 0.84rem;
  }
  .data-table td:empty { display: none; }
  .data-table td::before {
    content: attr(data-label);
    font-weight: 600;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--accent, #22d3ee);
    margin-right: 12px;
    flex-shrink: 0;
  }
  .data-table td:last-child { justify-content: space-between; }
  .data-table tr:hover td { background: transparent; }

  /* ── Card grid adjustments ───────────────────────────────────────────── */
  .card-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
  .card { padding: 14px; }
  .card .card-icon  { font-size: 1.3rem; margin-bottom: 6px; }
  .card .card-title { font-size: 0.84rem; }
  .card .card-desc  { font-size: 0.72rem; }
  .welcome-hero     { padding: 28px 8px 20px; }
  .welcome-hero h1  { font-size: 1.5rem; }

  /* ── Admin topbar adjustments ────────────────────────────────────────── */
  .topbar-user       { gap: 8px; }
  .topbar-user .name { font-size: 0.78rem; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .topbar-user .role { display: none; }
  .topbar-user .logout-btn { font-size: 0.72rem; padding: 4px 8px; }
  .notif-bell        { font-size: 1.15rem; padding: 4px; }
}


/* ══════════════════════════════════════════════════════════════════════════════
   TOGGLE SWITCH
   ══════════════════════════════════════════════════════════════════════════════ */

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 24px;
  flex-shrink: 0;
}
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-switch .slider {
  position: absolute; cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background: var(--line, #444);
  border-radius: 24px;
  transition: background 0.25s;
}
.toggle-switch .slider::before {
  content: '';
  position: absolute;
  height: 18px; width: 18px;
  left: 3px; bottom: 3px;
  background: var(--bg-raised);
  border-radius: 50%;
  transition: transform 0.25s;
}
.toggle-switch input:checked + .slider { background: var(--success, #4ade80); }
.toggle-switch input:checked + .slider::before { transform: translateX(18px); }
.toggle-switch input:disabled + .slider { opacity: 0.4; cursor: not-allowed; }

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--line, #333);
}
.toggle-row:last-child { border-bottom: none; }
.toggle-row-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: var(--ink, #e0e0e0);
}
.toggle-row-label .icon { font-size: 1.1rem; opacity: 0.7; }
.toggle-row-label .name { font-weight: 600; }
.toggle-row-scope {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ink-muted, #888);
  margin-right: 12px;
}


/* ══════════════════════════════════════════════════════════════════════════════
   BROWSE / TOPIC SEARCH PATTERN
   ══════════════════════════════════════════════════════════════════════════════ */

.browse-search { margin-bottom: 16px; position: relative; }
.browse-search-input {
  width: 100%;
  padding: 10px 14px 10px 38px;
  background: var(--bg-raised, #1a1a2e);
  color: var(--ink, #e0e0e0);
  border: 1px solid var(--line, #333);
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
}
.browse-search-input:focus {
  outline: none;
  border-color: var(--accent, #22d3ee);
  box-shadow: 0 0 0 2px rgba(34,211,238,0.15);
}
.browse-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  color: var(--ink-muted, #888);
  pointer-events: none;
}

.browse-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  border-bottom: 2px solid var(--line, #333);
  padding-bottom: 0;
}
.browse-tab {
  padding: 8px 18px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ink-muted, #888);
  cursor: pointer;
  border: none;
  background: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.15s, border-color 0.15s;
  font-family: inherit;
}
.browse-tab:hover { color: var(--ink, #e0e0e0); }
.browse-tab.active {
  color: var(--accent, #22d3ee);
  border-bottom-color: var(--accent, #22d3ee);
}

.browse-grid { display: grid; gap: 8px; }

.browse-item {
  border-radius: 10px;
  overflow: visible;
}
.browse-item[open] > .browse-item-trigger .browse-item-chevron {
  transform: rotate(90deg);
}
.browse-item-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-raised, #1a1a2e);
  border: 1px solid var(--line, #333);
  border-radius: 10px;
  cursor: pointer;
  list-style: none;
  user-select: none;
  transition: background 0.15s;
}
.browse-item-trigger::-webkit-details-marker { display: none; }
.browse-item-trigger::marker { display: none; content: ''; }
.browse-item-trigger:hover { background: var(--bg-sunken, #16161f); }
.browse-item-icon { font-size: 1.3rem; flex-shrink: 0; }
.browse-item-title { font-size: 0.9rem; font-weight: 600; color: var(--ink, #e0e0e0); flex: 1; }
.browse-item-sub { font-size: 0.78rem; color: var(--ink-muted, #888); }
.browse-item-chevron {
  font-size: 0.55rem;
  color: var(--ink-muted, #888);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.browse-item-body {
  padding: 12px 4px 4px;
  display: grid;
  gap: 10px;
}

.browse-detail-card {
  padding: 0;
  border-radius: 12px;
  border: 1px solid var(--line, #333);
  border-left: 4px solid var(--accent, #22d3ee);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.14);
  transition: box-shadow 0.2s;
}
.browse-detail-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.22);
}
.browse-detail-card .browse-detail-label {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.04);
  font-size: 0.88rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0;
  opacity: 1;
}
.browse-detail-card p,
.browse-detail-card .browse-detail-text {
  font-family: 'Noto Serif', Georgia, 'Times New Roman', serif;
  font-size: 1.1rem;
  font-style: italic;
  line-height: 1.9;
  margin: 0;
  padding: 13px 16px 14px;
  color: var(--ink, #e0e0e0);
}
.browse-detail-card p + p {
  padding-top: 4px;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.browse-detail-card a { color: inherit; text-decoration: underline; text-decoration-style: dotted; }
/* Structured head/body layout — used by library & encyclopedic cards */
.browse-detail-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.04);
}
.browse-detail-icon { font-size: 1.05rem; flex-shrink: 0; line-height: 1; }
.browse-detail-head .browse-detail-label {
  padding: 0;
  border: none;
  background: none;
}
.browse-detail-body { padding: 13px 16px 14px; }
.browse-detail-body p {
  font-family: 'Noto Serif', Georgia, 'Times New Roman', serif;
  font-size: 1.1rem;
  font-style: italic;
  line-height: 1.9;
  margin: 0 0 10px;
  color: var(--ink, #e0e0e0);
}
.browse-detail-body p:last-child { margin-bottom: 0; }

/* color variants */
.browse-card-accent  { background: var(--accent-soft, rgba(34,211,238,0.08));  border-left-color: var(--accent, #22d3ee); }
.browse-card-accent  .browse-detail-label { color: var(--accent, #22d3ee); }
.browse-card-gold    { background: var(--gold-soft, rgba(248,213,143,0.08));   border-left-color: var(--gold, #f8d58f); }
.browse-card-gold    .browse-detail-label { color: var(--ink); }
.browse-card-mint    { background: var(--mint-soft, rgba(52,211,153,0.08));    border-left-color: var(--mint, #34d399); }
.browse-card-mint    .browse-detail-label { color: var(--mint, #34d399); }
.browse-card-peach   { background: var(--peach-soft, rgba(240,168,137,0.08));  border-left-color: var(--peach, #f0a889); }
.browse-card-peach   .browse-detail-label { color: var(--peach, #f0a889); }
.browse-card-lilac   { background: var(--lilac-soft, rgba(196,181,253,0.08));  border-left-color: var(--lilac, #c4b5fd); }
.browse-card-lilac   .browse-detail-label { color: var(--lilac, #c4b5fd); }

/* ─── BIBLICAL COUNSELING HUB ───────────────────────────────────────────────── */
.coun-hero {
  background: linear-gradient(135deg, rgba(140,197,162,0.10), rgba(126,170,204,0.08), rgba(180,155,219,0.06));
  border: 1px solid var(--line, #333);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 20px;
  position: relative;
}
.coun-hero::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--mint, #8cc5a2), var(--gold, #d4b870), var(--lilac, #b49bdb));
}
.coun-hero-inner {
  padding: 30px 24px 24px;
  text-align: center;
}
.coun-hero-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ink, #e0e0e0);
  margin: 0 0 8px;
  letter-spacing: -0.01em;
}
.coun-hero-sub {
  font-family: 'Noto Serif', Georgia, serif;
  font-size: 0.95rem;
  color: var(--ink-muted, #888);
  line-height: 1.7;
  max-width: 540px;
  margin: 0 auto;
  font-style: italic;
}
.coun-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}
.coun-card {
  background: var(--bg-raised, #1a1a2e);
  border: 1px solid var(--line, #333);
  border-radius: 14px;
  overflow: hidden;
  transition: box-shadow 0.25s, transform 0.2s;
}
.coun-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.18);
  transform: translateY(-2px);
}
.coun-card-head {
  padding: 16px 18px 12px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
.coun-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}
.coun-card-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ink, #e0e0e0);
  margin: 0;
  flex: 1;
  min-width: 0;
}
.coun-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  border: 1px solid;
  white-space: nowrap;
}
.coun-definition {
  padding: 0 18px 14px;
  font-family: 'Noto Serif', Georgia, serif;
  font-size: 1.1rem;
  font-style: italic;
  line-height: 1.9;
  color: var(--ink-muted, #888);
}
.coun-section {
  padding: 0 18px 16px;
}
.coun-section-label {
  font-size: 0.88rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.coun-verse {
  background: var(--gold-soft, rgba(212,184,112,0.06));
  border-left: 3px solid var(--gold, #d4b870);
  border-radius: 0 8px 8px 0;
  padding: 10px 14px;
  margin-bottom: 8px;
}
.coun-verse-ref {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--gold, #d4b870);
  margin-bottom: 4px;
}
.coun-verse-ref a { color: inherit; }
.coun-verse-text {
  font-family: 'Noto Serif', Georgia, serif;
  font-size: 1.1rem;
  font-style: italic;
  line-height: 1.9;
  color: var(--ink, #e0e0e0);
  opacity: 0.9;
}
.coun-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}
.coun-step {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--bg-sunken, rgba(0,0,0,0.15));
}
.coun-step-num {
  min-width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 800;
  flex-shrink: 0;
}
.coun-step-text {
  font-family: 'Noto Serif', Georgia, serif;
  font-size: 1.1rem;
  font-style: italic;
  line-height: 1.9;
  color: var(--ink, #e0e0e0);
}
.coun-step-text a { color: var(--gold, #d4b870); text-decoration: underline; text-decoration-style: dotted; }
@media (max-width: 700px) {
  .coun-grid { grid-template-columns: 1fr; }
  .coun-hero-title { font-size: 1.3rem; }
}

/* ─── READING PLAN ──────────────────────────────────────────────────────────── */
.rp-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.rp-date-picker {
  display: flex; align-items: center; gap: 10px;
}
.rp-header-row {
  display: grid;
  grid-template-columns: 72px repeat(4, 1fr);
  gap: 0 40px;
  align-items: center;
  padding: 8px 14px;
  border-bottom: 2px solid var(--line-strong, rgba(255,255,255,0.14));
}
.rp-header-col {
  font-weight: 700;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-muted);
  text-align: center;
}
.rp-header-col:first-child { text-align: left; }
.rp-row {
  display: grid;
  grid-template-columns: 72px repeat(4, 1fr);
  gap: 0 40px;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid var(--line, rgba(255,255,255,0.06));
  transition: background 0.15s;
}
.rp-row:hover { filter: brightness(1.08); }
.rp-row-target {
  border-left: 3px solid var(--accent);
  background: var(--accent-soft, rgba(138,180,214,0.08)) !important;
}
.rp-date {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.rp-date-num {
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--ink);
}
.rp-cell {
  text-align: center;
  font-size: 0.82rem;
  color: var(--ink);
}
.rp-cell a {
  color: var(--gold);
  text-decoration: underline;
  text-decoration-style: dotted;
}
.rp-load-more {
  text-align: center;
  padding: 16px 0;
}
.rp-load-more a {
  color: var(--accent);
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  text-decoration: none;
}
.rp-load-more a:hover { text-decoration: underline; }
@media (max-width: 600px) {
  .rp-header-row { display: none; }
  .rp-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  .rp-cell { text-align: left; }
}

/* ─── LEXICON / WORD STUDY ──────────────────────────────────────────────────── */
.lex-original {
  font-family: 'Noto Sans', 'Noto Sans Hebrew', 'SBL Hebrew', 'Times New Roman', serif;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--gold, #f8d58f);
  letter-spacing: 0.02em;
}
.lex-original.lex-greek { direction: ltr; }
.lex-original.lex-hebrew { direction: rtl; unicode-bidi: bidi-override; }
.lex-translit {
  font-family: 'Noto Serif', Georgia, serif;
  font-size: 1.05rem;
  font-style: italic;
  color: var(--ink-muted, #888);
  margin-top: 2px;
}
.lex-hero-card {
  text-align: center;
  padding: 28px 20px 20px;
  background: linear-gradient(135deg, var(--bg-raised, #1a1a2e), var(--bg-sunken, #16161f));
  border: 1px solid var(--line, #333);
  border-radius: 14px;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
}
.lex-hero-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--gold, #f8d58f), var(--accent, #22d3ee));
}
.lex-strongs-pill {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  margin-top: 10px;
}
.lex-strongs-pill.lex-nt {
  background: var(--accent-soft, rgba(34,211,238,0.12));
  color: var(--accent, #22d3ee);
  border: 1px solid var(--accent, #22d3ee);
}
.lex-strongs-pill.lex-ot {
  background: var(--gold-soft, rgba(248,213,143,0.12));
  color: var(--gold, #f8d58f);
  border: 1px solid var(--gold, #f8d58f);
}
.lex-details-grid {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}
.lex-stat-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}
.lex-stat-bar-fill {
  height: 6px;
  border-radius: 3px;
  background: var(--accent, #22d3ee);
  flex: 1;
  max-width: 120px;
  opacity: 0.6;
}
.lex-testament-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
}
.lex-testament-tab {
  padding: 10px 22px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--line, #333);
  background: var(--bg-raised, #1a1a2e);
  color: var(--ink-muted, #888);
  transition: all 0.2s ease;
}
.lex-testament-tab:hover { color: var(--ink, #e0e0e0); border-color: var(--ink-muted, #888); }
.lex-testament-tab.active {
  background: var(--accent-soft, rgba(34,211,238,0.12));
  color: var(--accent, #22d3ee);
  border-color: var(--accent, #22d3ee);
}
.lex-testament-tab.lex-ot-tab.active {
  background: var(--gold-soft, rgba(248,213,143,0.12));
  color: var(--gold, #f8d58f);
  border-color: var(--gold, #f8d58f);
}
.lex-count-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  background: var(--bg-sunken, #16161f);
  color: var(--ink-muted, #888);
  margin-left: 6px;
}

/* ─── DEVOTIONAL ENHANCED ──────────────────────────────────────────────────── */
.dev-welcome-banner {
  padding: 28px 20px 22px;
  background: linear-gradient(135deg, var(--accent-soft, rgba(126,170,204,0.15)), var(--gold-soft, rgba(212,184,112,0.1)), var(--lilac-soft, rgba(180,155,219,0.08)));
  border: 1px solid var(--line, #333);
  border-radius: 16px;
  text-align: center;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}
.dev-welcome-banner::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--gold, #d4b870), var(--accent, #7eaacc), var(--lilac, #b49bdb));
}
.dev-welcome-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--accent, #7eaacc);
  margin-bottom: 6px;
  line-height: 1.2;
}
.dev-welcome-verse {
  font-family: 'Noto Serif', Georgia, serif;
  font-size: 1.05rem;
  font-style: italic;
  color: var(--gold, #d4b870);
  line-height: 1.6;
  max-width: 600px;
  margin: 10px auto 0;
  opacity: 0.9;
}
.dev-quick-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 16px;
}
.dev-quick-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 10px;
  border: 1px solid var(--line, #333);
  background: var(--bg-sunken, var(--bg, #1a1a2e));
  color: var(--ink, #e0e0e0);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.dev-quick-btn:hover {
  background: var(--accent-soft, rgba(126,170,204,0.12));
  border-color: var(--accent, #7eaacc);
  color: var(--accent, #7eaacc);
}
.dev-section-card {
  padding: 18px 18px;
  border: 1px solid var(--line, #333);
  border-radius: 14px;
  position: relative;
  overflow: hidden;
}
.dev-section-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
}
.dev-section-card.dev-scripture::before   { background: var(--gold, #d4b870); }
.dev-section-card.dev-reflection::before  { background: var(--accent, #7eaacc); }
.dev-section-card.dev-question::before    { background: var(--mint, #8cc5a2); }
.dev-section-card.dev-prayer-focus::before { background: var(--lilac, #b49bdb); }
.dev-section-card.dev-reading::before     { background: var(--peach, #f0a889); }
.dev-section-card.dev-journal::before     { background: var(--accent, #7eaacc); }
.dev-section-card.dev-pray::before        { background: var(--lilac, #b49bdb); }
.dev-section-label {
  font-size: 0.88rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ink-muted, #888);
}
.dev-section-label span {
  font-size: 1.1rem;
}
.dev-section-content {
  font-size: 1.02rem;
  line-height: 1.8;
  color: var(--ink, #e0e0e0);
}
.dev-section-content p { margin: 0; }
.dev-scripture .dev-section-content,
.dev-reflection .dev-section-content,
.dev-question .dev-section-content,
.dev-prayer-focus .dev-section-content {
  font-family: 'Noto Serif', Georgia, serif;
  font-size: 1.1rem;
  font-style: italic;
  line-height: 1.9;
}
.dev-journal-entry {
  background: var(--bg-raised, #1a1a2e);
  border: 1px solid var(--line, #333);
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.dev-journal-entry:hover { border-color: var(--accent, #7eaacc); }
.dev-prayer-entry {
  background: var(--bg-raised, #1a1a2e);
  border: 1px solid var(--line, #333);
  border-radius: 10px;
  padding: 14px 16px;
}
.dev-prayer-entry.dev-answered { border-color: var(--success, #4ade80); }

/* ─── DEVOTIONALS HERO ─────────────────────────────────────────── */
.dev-hero {
  background: var(--bg-raised, #1a1a2e);
  border: 1px solid var(--line, #333);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
}

/* ─── DEVOTIONALS FEED CARDS ───────────────────────────────────── */
.dev-feed-card {
  background: var(--bg-raised, #1a1a2e);
  border: 1px solid var(--line, #333);
  border-left: 3px solid var(--accent, #7eaacc);
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.dev-feed-card:hover {
  box-shadow: 0 2px 14px rgba(0,0,0,0.18);
  border-color: var(--line-hover, #555);
}
.dev-feed-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
}
.dev-feed-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  width: 48px;
  height: 52px;
  border-radius: 10px;
  flex-shrink: 0;
}
.dev-feed-day {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1.1;
}
.dev-feed-month {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.8;
}
.dev-feed-info {
  flex: 1;
  min-width: 0;
}
.dev-feed-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink, #e0e0e0);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dev-feed-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.dev-feed-rel {
  font-size: 0.75rem;
  color: var(--ink-muted, #888);
  margin-top: 2px;
}
.dev-feed-chevron {
  font-size: 1rem;
  color: var(--ink-muted, #888);
  transition: transform 0.3s ease;
  flex-shrink: 0;
}
.dev-feed-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease, padding 0.3s ease;
  padding: 0 16px;
}
.dev-feed-body.dev-feed-open {
  max-height: 2000px;
  padding: 0 16px 16px;
}
@media (max-width: 600px) {
  .dev-welcome-title { font-size: 1.4rem; }
  .dev-welcome-verse { font-size: 0.95rem; }
  .dev-feed-header { padding: 12px; gap: 10px; }
  .dev-feed-date { min-width: 42px; width: 42px; height: 46px; }
  .dev-feed-day { font-size: 1.2rem; }
  .lex-original { font-size: 1.6rem; }
  .lex-hero-card { padding: 22px 16px 16px; }
}

/* ─── THE UPPER ROOM ───────────────────────────────────────────────────────── */

/* Gate (signed-out state) */
.ur-gate {
  text-align: center;
  padding: 80px 24px;
  max-width: 520px;
  margin: 0 auto;
}
.ur-gate-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  filter: drop-shadow(0 4px 12px rgba(212,184,112,0.3));
}
.ur-gate-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--accent, #7eaacc);
  margin: 0 0 20px;
  letter-spacing: -0.02em;
}
.ur-gate-verse {
  font-family: 'Noto Serif', Georgia, serif;
  font-size: 1.1rem;
  font-style: italic;
  color: var(--gold, #d4b870);
  line-height: 1.7;
  margin: 0 0 6px;
  max-width: 460px;
  margin-left: auto;
  margin-right: auto;
}
.ur-gate-ref {
  font-size: 0.85rem;
  color: var(--ink-muted, #888);
  margin: 0 0 28px;
}
.ur-gate-desc {
  font-size: 0.95rem;
  color: var(--ink, #e0e0e0);
  line-height: 1.7;
  margin: 0 0 28px;
}
.ur-gate-btn {
  display: inline-block;
  padding: 14px 36px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, var(--accent, #7eaacc), var(--gold, #d4b870));
  color: var(--ink-inverse, #0f1118);
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 20px rgba(126,170,204,0.25);
}
.ur-gate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(126,170,204,0.35);
}

/* Container */
.ur-container {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 0 40px;
}

/* Hero */
.ur-hero {
  text-align: center;
  padding: 36px 24px 28px;
  background: linear-gradient(
    160deg,
    var(--accent-soft, rgba(126,170,204,0.12)),
    var(--gold-soft, rgba(212,184,112,0.08)),
    var(--lilac-soft, rgba(180,155,219,0.06))
  );
  border: 1px solid var(--line, #333);
  border-radius: 20px;
  margin-bottom: 8px;
  position: relative;
  overflow: hidden;
}
.ur-hero::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg,
    var(--gold, #d4b870),
    var(--accent, #7eaacc),
    var(--lilac, #b49bdb),
    var(--peach, #f0a889));
}
.ur-hero::after {
  content: '';
  position: absolute;
  bottom: -40px; right: -40px;
  width: 160px; height: 160px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--gold-soft, rgba(212,184,112,0.08)), transparent 70%);
  pointer-events: none;
}
.ur-hero-candle {
  font-size: 2.6rem;
  margin-bottom: 6px;
  filter: drop-shadow(0 2px 8px rgba(212,184,112,0.35));
}
.ur-hero-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--accent, #7eaacc);
  margin: 0 0 4px;
  letter-spacing: -0.02em;
}
.ur-hero-greeting {
  font-size: 1.15rem;
  color: var(--ink, #e0e0e0);
  margin: 0 0 2px;
  font-weight: 600;
}
.ur-hero-date {
  font-size: 0.88rem;
  color: var(--ink-muted, #888);
  margin: 0 0 12px;
}
.ur-hero-verse {
  font-family: 'Noto Serif', Georgia, serif;
  font-size: 1.18rem;
  font-style: italic;
  color: var(--gold, #f0d56c);
  line-height: 1.65;
  max-width: 560px;
  margin: 0 auto;
  text-shadow: 0 0 10px rgba(240,213,108,0.35);
}

/* Section nav tabs */
.ur-nav {
  display: flex;
  gap: 6px;
  padding: 12px 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--bg, #0f1118);
  margin-bottom: 4px;
}
.ur-nav::-webkit-scrollbar { display: none; }
.ur-nav-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid var(--line, #333);
  background: var(--bg-raised, #1a1a2e);
  color: var(--ink, #e0e0e0);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.ur-nav-tab span { font-size: 1rem; }
.ur-nav-tab:hover {
  background: var(--accent-soft, rgba(126,170,204,0.12));
  border-color: var(--accent, #7eaacc);
  color: var(--accent, #7eaacc);
}

/* Sections */
.ur-section {
  background: var(--bg-raised, #1a1a2e);
  border: 1px solid var(--line, #333);
  border-radius: 18px;
  margin-bottom: 16px;
  overflow: hidden;
}
.ur-section-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 22px 14px;
  position: relative;
}
.ur-section-header::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
}
.ur-section-header.ur-section-devotional::before { background: var(--gold, #d4b870); }
.ur-section-header.ur-section-reading::before    { background: var(--peach, #f0a889); }
.ur-section-header.ur-section-journal::before    { background: var(--accent, #7eaacc); }
.ur-section-header.ur-section-prayer::before     { background: var(--lilac, #b49bdb); }
.ur-section-header.ur-section-care::before       { background: var(--danger, #f87171); }
.ur-section-header.ur-section-pulse::before      { background: linear-gradient(90deg, var(--gold, #d4b870), var(--accent, #7eaacc), var(--lilac, #b49bdb)); }
.ur-section-icon {
  font-size: 1.6rem;
  flex-shrink: 0;
}
.ur-section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink, #e0e0e0);
  margin: 0;
}
.ur-section-sub {
  font-size: 0.8rem;
  color: var(--ink-muted, #888);
  margin: 2px 0 0;
}
.ur-section-link {
  margin-left: auto;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--accent, #7eaacc);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
}
.ur-section-link:hover { text-decoration: underline; }
.ur-section-body {
  padding: 0 22px 20px;
  display: grid;
  gap: 14px;
}

/* Cards (devotional sections, forms) */
.ur-card {
  padding: 16px 18px;
  border: 1px solid var(--line, #333);
  border-radius: 14px;
  position: relative;
  overflow: hidden;
  margin: 0 22px 14px;
}
.ur-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
}
.ur-card.ur-card-scripture::before     { background: var(--gold, #d4b870); }
.ur-card.ur-card-reflection::before    { background: var(--accent, #7eaacc); }
.ur-card.ur-card-question::before      { background: var(--mint, #8cc5a2); }
.ur-card.ur-card-prayer-focus::before  { background: var(--lilac, #b49bdb); }
.ur-card.ur-card-journal-new::before   { background: var(--accent, #7eaacc); }
.ur-card.ur-card-prayer-submit::before { background: var(--lilac, #b49bdb); }
.ur-card.ur-card-scripture     { background: var(--gold-soft, rgba(212,184,112,0.08)); }
.ur-card.ur-card-reflection    { background: var(--accent-soft, rgba(126,170,204,0.08)); }
.ur-card.ur-card-question      { background: var(--mint-soft, rgba(140,197,162,0.08)); }
.ur-card.ur-card-prayer-focus  { background: var(--lilac-soft, rgba(180,155,219,0.08)); }
.ur-card.ur-card-journal-new   { background: var(--accent-soft, rgba(126,170,204,0.08)); }
.ur-card.ur-card-prayer-submit { background: var(--lilac-soft, rgba(180,155,219,0.06)); }
.ur-card-label {
  font-size: 0.88rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ink-muted, #888);
}
.ur-card-label span { font-size: 1.1rem; }
.ur-card-content { font-size: 1rem; line-height: 1.8; color: var(--ink, #e0e0e0); }
.ur-card-content p { margin: 0; }
.ur-scripture-text,
.ur-card-reflection .ur-card-content,
.ur-card-question .ur-card-content,
.ur-card-prayer-focus .ur-card-content,
.ur-card-prayer-submit .ur-form-hint {
  font-family: 'Noto Serif', Georgia, serif;
  font-size: 1.1rem;
  font-style: italic;
  line-height: 1.9;
}

/* Reading grid */
.ur-reading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  padding: 0 22px 20px;
}
.ur-reading-item {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--line, #333);
  border-radius: 12px;
  padding: 14px 16px;
  text-align: center;
}
.ur-reading-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--ink-muted, #888);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}
.ur-reading-ref {
  display: flex;
  justify-content: center;
}
.ur-reading-ref .pill {
  font-size: 0.72rem;
  white-space: normal;
  text-align: center;
  word-break: break-word;
  line-height: 1.3;
}

/* Form elements */
.ur-input, .ur-textarea, .ur-select {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--line, #333);
  background: var(--bg, #0f1118);
  color: var(--ink, #e0e0e0);
  font-size: 0.92rem;
  font-family: inherit;
  margin-bottom: 10px;
}
.ur-textarea {
  resize: vertical;
  line-height: 1.7;
  font-family: 'Noto Serif', Georgia, serif;
}
.ur-select { width: auto; min-width: 140px; }
.ur-form-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.ur-form-hint {
  font-size: 0.88rem;
  color: var(--ink-muted, #888);
  line-height: 1.6;
  margin: 0 0 12px;
}
.ur-check-label {
  font-size: 0.82rem;
  color: var(--ink-muted, #888);
  display: flex;
  align-items: center;
  gap: 4px;
}
.ur-btn {
  padding: 10px 22px;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: opacity 0.18s;
  font-family: inherit;
}
.ur-btn:hover { opacity: 0.85; }
.ur-btn-accent {
  background: var(--accent, #7eaacc);
  color: var(--ink-inverse, #0f1118);
}
.ur-btn-lilac {
  background: var(--lilac, #b49bdb);
  color: var(--ink-inverse, #0f1118);
}

/* Entry card grid */
.ur-entries-grid {
  display: grid;
  gap: 10px;
  padding: 0 22px 18px;
}
.ur-entry-card {
  background: var(--bg-sunken, rgba(0,0,0,0.15));
  border: 1px solid var(--line, #333);
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.ur-entry-card:hover { border-color: var(--accent, #7eaacc); }
.ur-prayer-card { cursor: default; }
.ur-answered { border-color: var(--success, #4ade80); }
.ur-resolved { border-color: var(--success, #4ade80); }

/* Prayer card expanded details */
.ur-prayer-notes {
  margin: 8px 0 4px;
  padding: 10px 12px;
  background: var(--bg-sunken, #0d0d1a);
  border-left: 3px solid var(--lilac, #b49bdb);
  border-radius: 6px;
  font-size: 0.84rem;
  color: var(--ink, #e0e0e0);
  line-height: 1.55;
}
.ur-prayer-notes-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--lilac, #b49bdb);
  margin-bottom: 4px;
}
.ur-prayer-notes p { margin: 0; }
.ur-prayer-contacts {
  margin: 8px 0 0;
  border-top: 1px solid var(--line, #333);
  padding-top: 8px;
}
.ur-prayer-contacts-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent, #7eaacc);
  margin-bottom: 6px;
}
.ur-contact-entry {
  padding: 6px 10px;
  margin-bottom: 4px;
  background: var(--bg-sunken, #0d0d1a);
  border-radius: 6px;
  font-size: 0.82rem;
}
.ur-contact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.ur-contact-type {
  font-weight: 600;
  color: var(--ink, #e0e0e0);
  font-size: 0.8rem;
}
.ur-contact-dir {
  font-weight: 400;
  color: var(--ink-muted, #888);
  font-size: 0.75rem;
}
.ur-contact-subject {
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--accent, #7eaacc);
  margin-top: 2px;
}
.ur-contact-detail {
  font-size: 0.8rem;
  color: var(--ink-muted, #888);
  margin: 2px 0 0;
  line-height: 1.5;
}
.ur-contact-by {
  font-size: 0.72rem;
  color: var(--ink-faint, #666);
  font-style: italic;
}

.ur-entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  flex-wrap: wrap;
  gap: 6px;
}
.ur-entry-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--accent, #7eaacc);
}
.ur-entry-meta {
  display: flex;
  gap: 6px;
  align-items: center;
}
.ur-entry-date {
  font-size: 0.72rem;
  color: var(--ink-muted, #888);
}
.ur-entry-excerpt {
  font-size: 0.85rem;
  color: var(--ink, #e0e0e0);
  margin: 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ur-entry-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.ur-assigned {
  font-size: 0.78rem;
  color: var(--accent, #7eaacc);
  font-weight: 600;
}
.ur-view-all {
  text-align: center;
  padding: 8px 22px 18px;
}
.ur-view-all a {
  font-size: 0.85rem;
  color: var(--accent, #7eaacc);
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
}
.ur-view-all a:hover { text-decoration: underline; }
.ur-subsection-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent, #7eaacc);
  padding: 4px 22px 8px;
}

/* Spiritual Pulse */
.ur-pulse-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  padding: 0 22px 18px;
}
.ur-pulse-card {
  text-align: center;
  padding: 18px 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--line, #333);
  border-radius: 14px;
  transition: border-color 0.2s;
}
.ur-pulse-card:hover { border-color: var(--accent, #7eaacc); }
.ur-pulse-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--accent, #7eaacc);
  line-height: 1.1;
  margin-bottom: 6px;
}
.ur-pulse-label {
  font-size: 0.75rem;
  color: var(--ink-muted, #888);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

/* Mood tracker */
.ur-mood-section {
  padding: 4px 22px 20px;
}
.ur-mood-bars {
  display: grid;
  gap: 8px;
}
.ur-mood-row {
  display: grid;
  grid-template-columns: 28px 80px 1fr 28px;
  gap: 8px;
  align-items: center;
}
.ur-mood-emoji { font-size: 1rem; text-align: center; }
.ur-mood-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ink, #e0e0e0);
}
.ur-mood-bar-track {
  height: 8px;
  border-radius: 4px;
  background: rgba(255,255,255,0.06);
  overflow: hidden;
}
.ur-mood-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--accent, #7eaacc), var(--gold, #d4b870));
  transition: width 0.6s ease-out;
}
.ur-mood-count {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--ink-muted, #888);
  text-align: right;
}

/* Footer */
.ur-footer {
  text-align: center;
  padding: 28px 22px;
  border-top: 1px solid var(--line, #333);
  background: linear-gradient(135deg, rgba(126,170,204,0.04), rgba(212,184,112,0.04));
  border-radius: 0 0 18px 18px;
}
.ur-footer-verse {
  font-family: 'Noto Serif', Georgia, serif;
  font-size: 1.02rem;
  font-style: italic;
  color: var(--gold, #f0d56c);
  line-height: 1.7;
  max-width: 520px;
  margin: 0 auto 6px;
  text-shadow: 0 0 10px rgba(240,213,108,0.35);
}
.ur-footer-ref {
  font-size: 0.78rem;
  color: var(--ink-muted, #888);
  margin-bottom: 16px;
}
.ur-footer-nav {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Mobile responsive */
@media (max-width: 600px) {
  .ur-hero { padding: 28px 16px 22px; border-radius: 14px; }
  .ur-hero-title { font-size: 1.6rem; }
  .ur-hero-greeting { font-size: 1rem; }
  .ur-hero-verse { font-size: 0.95rem; }
  .ur-section { border-radius: 14px; margin-bottom: 12px; }
  .ur-section-header { padding: 16px 16px 10px; gap: 10px; }
  .ur-section-icon { font-size: 1.3rem; }
  .ur-section-title { font-size: 0.98rem; }
  .ur-card { margin: 0 16px 12px; padding: 14px 14px; }
  .ur-entries-grid { padding: 0 16px 14px; }
  .ur-reading-grid { padding: 0 16px 16px; grid-template-columns: 1fr; }
  .ur-reading-item .pill { white-space: normal; text-align: center; }
  .ur-pulse-grid { padding: 0 16px 14px; grid-template-columns: repeat(3, 1fr); }
  .ur-mood-section { padding: 4px 16px 16px; }
  .ur-mood-row { grid-template-columns: 24px 64px 1fr 24px; }
  .ur-subsection-label { padding: 4px 16px 8px; }
  .ur-view-all { padding: 8px 16px 14px; }
  .ur-footer { padding: 22px 16px; }
  .ur-gate { padding: 50px 16px; }
  .ur-gate-title { font-size: 1.7rem; }
  .ur-nav-tab { padding: 7px 12px; font-size: 0.78rem; }
}

/* Lineage tree */
.lineage-node {
  position: relative;
  padding: 10px 14px 10px 24px;
  margin-left: 16px;
  border-left: 2px solid var(--line, #333);
}
.lineage-node::before {
  content: '';
  position: absolute;
  left: -2px;
  top: 18px;
  width: 16px;
  height: 0;
  border-top: 2px solid var(--line, #333);
}
.lineage-node-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--accent, #22d3ee);
  cursor: pointer;
}
.lineage-node-name:hover { text-decoration: underline; }
.lineage-node-detail {
  font-size: 0.78rem;
  color: var(--ink-muted, #888);
}
.lineage-root { margin-left: 0; border-left: none; padding-left: 0; }
.lineage-root::before { display: none; }

/* Letter index */
.letter-index {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 16px;
}
.letter-index-btn {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-raised, #1a1a2e);
  border: 1px solid var(--line, #333);
  border-radius: 6px;
  color: var(--ink, #e0e0e0);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.letter-index-btn:hover { border-color: var(--accent, #22d3ee); color: var(--accent, #22d3ee); }
.letter-index-btn.active { background: var(--accent, #22d3ee); color: var(--ink-inverse); border-color: var(--accent, #22d3ee); }
.letter-index-btn.disabled { opacity: 0.3; pointer-events: none; }
.letter-group-heading {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--accent, #22d3ee);
  padding: 12px 0 6px;
  border-bottom: 1px solid var(--line, #333);
  margin-bottom: 8px;
}


/* ══════════════════════════════════════════════════════════════════════════════
   GENEALOGY — Split-Panel Master/Detail Layout
   ══════════════════════════════════════════════════════════════════════════════ */

.gene-split {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 0;
  height: 72vh;
  min-height: 480px;
  border: 1px solid var(--line, #333);
  border-radius: var(--radius, 12px);
  overflow: hidden;
  background: var(--bg, #0f0f23);
}
@media (max-width: 900px) {
  .gene-split {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 0;
  }
}

/* ── Left: Name list panel ── */
.gene-list {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--line, #333);
  background: var(--bg-raised, #1a1a2e);
  overflow: hidden;
}
@media (max-width: 900px) {
  .gene-list {
    border-right: none;
    border-bottom: 1px solid var(--line, #333);
    max-height: 50vh;
  }
}
.gene-list-header {
  padding: 12px 14px;
  border-bottom: 1px solid var(--line, #333);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  background: var(--bg-sunken, #111);
}
.gene-list-header-title {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--ink, #e0e0e0);
}
.gene-list-count {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 12px;
  background: var(--accent-soft, rgba(34,211,238,0.12));
  color: var(--accent, #22d3ee);
}
.gene-list-search {
  padding: 10px 12px;
  border-bottom: 1px solid var(--line, #333);
  flex-shrink: 0;
}
.gene-list-search input {
  width: 100%;
  padding: 8px 12px 8px 34px;
  background: var(--bg, #0f0f23);
  border: 1px solid var(--line, #333);
  border-radius: 8px;
  color: var(--ink, #e0e0e0);
  font-size: max(0.85rem, 16px);
  font-family: inherit;
  box-sizing: border-box;
}
.gene-list-search input:focus {
  outline: none;
  border-color: var(--accent, #22d3ee);
  box-shadow: 0 0 0 2px var(--accent-soft, rgba(34,211,238,0.15));
}
.gene-list-scroll {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.gene-list-scroll::-webkit-scrollbar { width: 4px; }
.gene-list-scroll::-webkit-scrollbar-track { background: transparent; }
.gene-list-scroll::-webkit-scrollbar-thumb { background: var(--line, #333); border-radius: 4px; }
.gene-list-scroll::-webkit-scrollbar-thumb:hover { background: var(--accent, #22d3ee); }

/* ── Individual list items ── */
.gene-item {
  padding: 12px 14px;
  border-bottom: 1px solid var(--line-faint, rgba(255,255,255,0.04));
  cursor: pointer;
  border-left: 4px solid transparent;
  transition: all 0.2s ease;
}
.gene-item:hover {
  background: var(--bg-hover, rgba(255,255,255,0.04));
  transform: translateX(4px);
}
.gene-item.active {
  border-left-color: var(--accent, #22d3ee);
  background: var(--accent-soft, rgba(34,211,238,0.08));
}
.gene-item-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--ink, #e0e0e0);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.gene-item.active .gene-item-name { color: var(--accent, #22d3ee); }
.gene-item-title {
  font-size: 0.76rem;
  color: var(--ink-muted, #888);
  font-style: italic;
  margin-top: 2px;
}

/* ── Letter headings inside list ── */
.gene-letter-head {
  padding: 6px 14px;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--accent, #22d3ee);
  background: var(--bg-sunken, #111);
  border-bottom: 1px solid var(--line, #333);
  position: sticky;
  top: 0;
  z-index: 2;
}

/* ── Right: Detail panel ── */
.gene-detail {
  overflow-y: auto;
  background: var(--bg, #0f0f23);
  position: relative;
}
.gene-detail::-webkit-scrollbar { width: 4px; }
.gene-detail::-webkit-scrollbar-track { background: transparent; }
.gene-detail::-webkit-scrollbar-thumb { background: var(--line, #333); border-radius: 4px; }
.gene-detail::-webkit-scrollbar-thumb:hover { background: var(--accent, #22d3ee); }

.gene-detail-empty {
  height: 100%;
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
  color: var(--ink-faint, #555);
}
.gene-detail-empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.25;
  color: var(--accent, #22d3ee);
}
.gene-detail-empty-title {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ink-muted, #888);
  margin-bottom: 8px;
}
.gene-detail-empty-sub {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.6;
}

/* ── Hero header inside detail ── */
.gene-hero {
  padding: 32px 28px 24px;
  border-bottom: 1px solid var(--line, #333);
}
.gene-hero-name {
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 800;
  color: var(--ink, #e0e0e0);
  margin: 0 0 4px;
  line-height: 1.15;
}
.gene-hero-title {
  font-size: 1rem;
  color: var(--accent, #22d3ee);
  font-style: italic;
  margin: 0 0 16px;
}
.gene-hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.gene-hero-badge {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid var(--line, #333);
  background: var(--bg-raised, #1a1a2e);
  color: var(--ink-muted, #999);
}
.gene-hero-badge-accent {
  background: var(--accent-soft, rgba(34,211,238,0.1));
  border-color: var(--accent, #22d3ee);
  color: var(--accent, #22d3ee);
}
.gene-hero-badge-gold {
  background: var(--gold-soft, rgba(248,213,143,0.1));
  border-color: var(--gold, #f8d58f);
  color: var(--gold, #f8d58f);
}

/* ── Detail body sections ── */
.gene-sections {
  padding: 20px 28px 40px;
  display: grid;
  gap: 16px;
}
.gene-section {
  padding: 16px 18px;
  border-radius: 10px;
  border-left: 4px solid var(--accent, #22d3ee);
  background: var(--accent-soft, rgba(34,211,238,0.05));
}
.gene-section-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
  color: var(--accent, #22d3ee);
  opacity: 0.85;
}
.gene-section p, .gene-section .gene-section-text {
  font-size: 0.92rem;
  line-height: 1.7;
  margin: 0;
  color: var(--ink, #e0e0e0);
}
.gene-section-gold   { border-left-color: var(--gold, #f8d58f); background: var(--gold-soft, rgba(248,213,143,0.05)); }
.gene-section-gold   .gene-section-label { color: var(--gold, #f8d58f); }
.gene-section-mint   { border-left-color: var(--mint, #34d399); background: var(--mint-soft, rgba(52,211,153,0.05)); }
.gene-section-mint   .gene-section-label { color: var(--mint, #34d399); }
.gene-section-peach  { border-left-color: var(--peach, #f0a889); background: var(--peach-soft, rgba(240,168,137,0.05)); }
.gene-section-peach  .gene-section-label { color: var(--peach, #f0a889); }
.gene-section-lilac  { border-left-color: var(--lilac, #c084fc); background: var(--lilac-soft, rgba(192,132,252,0.05)); }
.gene-section-lilac  .gene-section-label { color: var(--lilac, #c084fc); }

/* ── Reference pills (verse pills) ── */
.gene-ref-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}
.gene-ref-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--bg-sunken, #111);
  border: 1px solid var(--line, #333);
  color: var(--accent, #22d3ee);
  letter-spacing: 0.04em;
  transition: border-color 0.15s;
}
.gene-ref-pill:hover { border-color: var(--accent, #22d3ee); }

/* ── Family links ── */
.gene-family-link {
  color: var(--accent, #22d3ee);
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dotted;
  transition: color 0.15s;
}
.gene-family-link:hover { color: var(--gold, #f8d58f); }

/* ── Stat row (used for overview stats above split) ── */
.gene-stat-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}
.gene-stat-card {
  background: var(--bg-raised, #1a1a2e);
  border: 1px solid var(--line, #333);
  border-radius: var(--radius, 12px);
  padding: 14px;
  text-align: center;
}
.gene-stat-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ink, #e0e0e0);
}
.gene-stat-label {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-muted, #888);
  margin-top: 2px;
}

/* ── Fade-in animation for detail view ── */
@keyframes geneFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.gene-fade-in { animation: geneFadeIn 0.35s ease forwards; }


/* ══════════════════════════════════════════════════════════════════════════════
   PHOTO GALLERY
   ══════════════════════════════════════════════════════════════════════════════ */

/* Album grid */
.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}
.album-card {
  background: var(--bg-raised);
  border: 1px solid var(--line);
  border-radius: var(--radius, 12px);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s;
}
.album-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.18);
}
.album-cover {
  width: 100%;
  aspect-ratio: 16/10;
  object-fit: cover;
  display: block;
  background: var(--line);
}
.album-cover-placeholder {
  width: 100%;
  aspect-ratio: 16/10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-raised) 0%, var(--line) 100%);
  font-size: 2.4rem;
  color: var(--ink-muted);
  opacity: 0.5;
}
.album-info {
  padding: 14px 16px 16px;
}
.album-info h3 {
  margin: 0 0 4px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.album-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.78rem;
  color: var(--ink-muted);
  flex-wrap: wrap;
}
.album-meta-dot::before { content: '\u00B7'; margin: 0 2px; }

/* Photo grid inside album detail */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}
.photo-thumb {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  background: var(--line);
  transition: transform 0.15s;
}
.photo-thumb:hover { transform: scale(1.03); }
.photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.photo-thumb-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 6px 8px;
  background: linear-gradient(transparent, rgba(0,0,0,0.65));
  color: #fff;
  font-size: 0.72rem;
  opacity: 0;
  transition: opacity 0.2s;
}
.photo-thumb:hover .photo-thumb-overlay { opacity: 1; }

/* Lightbox */
.photo-lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0,0,0,0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  animation: lbFadeIn 0.2s ease;
}
@keyframes lbFadeIn { from { opacity: 0; } to { opacity: 1; } }
.photo-lightbox img {
  max-width: 92vw;
  max-height: 80vh;
  border-radius: 8px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.5);
  object-fit: contain;
}
.photo-lightbox-caption {
  margin-top: 12px;
  color: #fff;
  font-size: 0.88rem;
  text-align: center;
  max-width: 80vw;
}
.photo-lightbox-close {
  position: absolute;
  top: 16px; right: 20px;
  background: none; border: none;
  color: #fff; font-size: 1.8rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.15s;
}
.photo-lightbox-close:hover { opacity: 1; }
.photo-lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.12);
  border: none;
  color: #fff;
  font-size: 1.6rem;
  width: 42px; height: 42px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: opacity 0.15s, background 0.15s;
}
.photo-lightbox-nav:hover { opacity: 1; background: rgba(255,255,255,0.22); }
.photo-lightbox-nav.lb-prev { left: 16px; }
.photo-lightbox-nav.lb-next { right: 16px; }

/* Upload area */
.photo-upload-zone {
  border: 2px dashed var(--line);
  border-radius: var(--radius, 12px);
  padding: 28px 20px;
  text-align: center;
  color: var(--ink-muted);
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  margin-bottom: 18px;
}
.photo-upload-zone:hover,
.photo-upload-zone.drag-over {
  border-color: var(--accent);
  background: rgba(var(--accent-rgb, 59,130,246), 0.06);
}
.photo-upload-zone-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 6px;
}
.photo-upload-progress {
  margin-top: 10px;
  height: 4px;
  border-radius: 2px;
  background: var(--line);
  overflow: hidden;
}
.photo-upload-progress-bar {
  height: 100%;
  background: var(--accent);
  transition: width 0.3s ease;
  width: 0%;
}

/* Album detail header */
.album-detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.album-detail-header h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--ink);
  flex: 1;
  min-width: 160px;
}
.album-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--line);
  background: var(--bg-raised);
  color: var(--ink);
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s;
}
.album-back-btn:hover { background: var(--line); }

/* Empty state */
.photo-empty {
  text-align: center;
  padding: 48px 20px;
  color: var(--ink-muted);
}
.photo-empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  opacity: 0.4;
}
.photo-empty p {
  font-size: 0.88rem;
  margin: 0 0 16px;
}

/* Album card open hint */
.album-open-hint {
  margin-top: 8px;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--accent);
  opacity: 0.7;
  transition: opacity 0.15s;
}
.album-card:hover .album-open-hint { opacity: 1; }

/* Photo thumbnail delete button */
.photo-thumb-del {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 50%;
  background: rgba(0,0,0,0.55);
  color: #fff;
  font-size: 0.82rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s;
  z-index: 2;
}
.photo-thumb:hover .photo-thumb-del { opacity: 1; }
.photo-thumb-del:hover { background: var(--danger, #e74c3c); }

/* Lightbox actions bar */
.photo-lightbox-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 8px;
}
.photo-lightbox-actions button {
  padding: 6px 14px;
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 6px;
  background: rgba(255,255,255,0.1);
  color: #fff;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.15s;
}
.photo-lightbox-actions button:hover {
  background: rgba(255,255,255,0.22);
}

/* Mobile */
@media (max-width: 600px) {
  .album-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
  .album-cover, .album-cover-placeholder { aspect-ratio: 4/3; }
  .album-info { padding: 10px 12px 12px; }
  .album-info h3 { font-size: 0.88rem; }
  .photo-grid { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; }
  .photo-lightbox-nav { width: 34px; height: 34px; font-size: 1.3rem; }
  .album-open-hint { font-size: 0.7rem; }
}


/* ══════════════════════════════════════════════════════════════════════════════
   SETTINGS PAGE
   ══════════════════════════════════════════════════════════════════════════════ */

.settings-section {
  margin-bottom: 20px;
  background: var(--bg-raised, #1a1a2e);
  border-radius: 14px;
  border: 1px solid var(--line, #333);
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}
.settings-section-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px 22px 14px;
  background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 100%);
  border-bottom: 1px solid var(--line, #333);
}
.settings-section-icon {
  font-size: 1.6rem;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 2px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--accent-rgb, 59,130,246), 0.1);
  border-radius: 10px;
}
.settings-section-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ink, #e0e0e0);
  margin: 0 0 3px;
}
.settings-section-desc {
  font-size: 0.82rem;
  color: var(--ink-muted, #888);
  margin: 0;
  line-height: 1.5;
}

.settings-card {
  padding: 18px 22px 20px;
}
.settings-card-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ink, #e0e0e0);
  margin-bottom: 4px;
}
.settings-card-hint {
  font-size: 0.8rem;
  color: var(--ink-muted, #888);
  margin: 0 0 12px;
  line-height: 1.45;
}
.settings-card-hint strong {
  color: var(--ink, #e0e0e0);
}

.settings-input {
  background: var(--bg, #0f0f23);
  color: var(--ink, #e0e0e0);
  border: 1px solid var(--line, #333);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.9rem;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.settings-input:focus {
  outline: none;
  border-color: var(--accent, #22d3ee);
  box-shadow: 0 0 0 3px var(--accent-soft, rgba(34,211,238,0.15));
}

/* Toggle switch */
.settings-toggle {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  flex-shrink: 0;
}
.settings-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}
.settings-toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--line, #444);
  border-radius: 28px;
  transition: background 0.25s;
}
.settings-toggle-slider::before {
  content: '';
  position: absolute;
  left: 3px;
  top: 3px;
  width: 22px;
  height: 22px;
  background: var(--bg-raised, #222);
  border-radius: 50%;
  transition: transform 0.25s;
}
.settings-toggle input:checked + .settings-toggle-slider {
  background: var(--warning, #c98b2e);
}
.settings-toggle input:checked + .settings-toggle-slider::before {
  transform: translateX(24px);
}

/* Theme swatch grid */
.settings-swatch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
}
.settings-swatch-grid.disabled {
  opacity: 0.4;
  pointer-events: none;
}
.settings-swatch {
  cursor: pointer;
  border: 2px solid var(--line, #333);
  border-radius: 10px;
  padding: 10px;
  text-align: center;
  transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
  background: var(--bg-raised, #1a1a2e);
}
.settings-swatch:hover {
  border-color: var(--accent, #22d3ee);
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0,0,0,0.15);
}
.settings-swatch.active {
  border-color: var(--accent, #22d3ee);
  box-shadow: 0 0 0 2px var(--accent-soft, rgba(34,211,238,0.2));
}
.settings-swatch-preview {
  height: 40px;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: inset 0 -8px 16px rgba(0,0,0,0.15);
}
.settings-swatch.active .settings-swatch-preview {
  box-shadow: inset 0 -8px 16px rgba(0,0,0,0.15), 0 0 0 2px var(--accent, #22d3ee);
}
.settings-swatch-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--ink, #e0e0e0);
}
.settings-swatch-mode {
  font-size: 0.67rem;
  color: var(--ink-muted, #888);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Toggle row */
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-radius: 8px;
  margin: 4px 0;
  transition: background 0.15s;
}
.toggle-row:hover { background: rgba(255,255,255,0.03); }
.toggle-row-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
  color: var(--ink, #e0e0e0);
}
.toggle-row-label .icon {
  font-size: 1.1rem;
  width: 28px;
  text-align: center;
  opacity: 0.7;
}
.toggle-row-label .name { font-weight: 500; }

/* Toggle switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 24px;
  flex-shrink: 0;
}
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-switch .slider {
  position: absolute;
  inset: 0;
  background: var(--line, #444);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.25s;
}
.toggle-switch .slider::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  left: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.25s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
.toggle-switch input:checked + .slider {
  background: var(--accent, #22d3ee);
}
.toggle-switch input:checked + .slider::before {
  transform: translateX(18px);
}
.toggle-switch input:disabled + .slider {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Accordion */
.settings-accordion {
  border-top: 1px solid var(--line, #333);
}
.settings-accordion[open] > .settings-accordion-trigger .settings-accordion-chevron {
  transform: rotate(90deg);
}
.settings-accordion-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  list-style: none;
  user-select: none;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--ink, #e0e0e0);
  transition: background 0.15s;
}
.settings-accordion-trigger::-webkit-details-marker { display: none; }
.settings-accordion-trigger::marker { display: none; content: ''; }
.settings-accordion-trigger:hover {
  background: rgba(255,255,255,0.03);
}
.settings-accordion-chevron {
  font-size: 0.6rem;
  transition: transform 0.2s ease;
  color: var(--ink-muted, #888);
  flex-shrink: 0;
}
.settings-accordion-label {
  flex: 1;
}
.settings-accordion-count {
  font-size: 0.74rem;
  font-weight: 500;
  color: var(--ink-muted, #888);
  background: var(--bg, #0f0f23);
  padding: 3px 12px;
  border-radius: 20px;
}
.settings-accordion-body {
  padding: 2px 10px 12px;
}

/* Standalone accordion section (e.g. System Settings) */
details.settings-section.settings-accordion {
  padding: 0;
}
details.settings-section.settings-accordion > .settings-accordion-trigger {
  border-top: none;
}

/* Settings stat cards row */
.settings-stat-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}
.settings-stat-card {
  background: var(--bg-raised, #1a1a2e);
  border: 1px solid var(--line, #333);
  border-radius: 8px;
  padding: 10px 12px;
  text-align: center;
}
.settings-stat-value {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--accent, #22d3ee);
}
.settings-stat-label {
  font-size: 0.68rem;
  color: var(--ink-muted, #888);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 2px;
}

/* System Config — grouped card layout */
.sys-cfg-group { margin-bottom: 20px; }
.sys-cfg-group:last-child { margin-bottom: 0; }
.sys-cfg-group-hdr {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--line);
}
.sys-cfg-group-icon { font-size: 1.15rem; }
.sys-cfg-group-label {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--ink);
  flex: 1;
}
.sys-cfg-group-count {
  font-size: 0.72rem;
  color: var(--ink-muted);
  background: var(--bg-sunken, rgba(0,0,0,0.15));
  padding: 2px 8px;
  border-radius: 10px;
}
.sys-cfg-group-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
}
.sys-cfg-card {
  background: var(--bg-raised);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.12s;
}
.sys-cfg-card:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}
.sys-cfg-card-key {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 5px;
  font-family: monospace;
}
.sys-cfg-card-val {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--ink);
  word-break: break-word;
  margin-bottom: 4px;
}
.sys-cfg-card-val.sys-cfg-empty {
  color: var(--ink-muted);
  font-weight: 400;
  font-style: italic;
  font-size: 0.82rem;
}
.sys-cfg-bool {
  display: flex;
  align-items: center;
  gap: 6px;
}
.sys-cfg-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.sys-cfg-on .sys-cfg-dot { background: var(--success, #4ade80); }
.sys-cfg-off .sys-cfg-dot { background: var(--danger, #f87171); }
.sys-cfg-on { color: var(--success, #4ade80); }
.sys-cfg-off { color: var(--ink-muted); }
.sys-cfg-card-desc {
  font-size: 0.78rem;
  color: var(--ink-muted);
  line-height: 1.4;
  margin-bottom: 2px;
}
.sys-cfg-card-ts {
  font-size: 0.68rem;
  color: var(--ink-muted);
  opacity: 0.7;
  margin-top: 4px;
}
@media (max-width: 600px) {
  .sys-cfg-group-cards { grid-template-columns: 1fr; }
}

/* ── Interface Studio ───────────────────────────────────────────────────── */
.studio-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  border-bottom: 1px solid var(--line, #333);
  flex-wrap: wrap;
}
.studio-row:last-child { border-bottom: none; }
.studio-label-wrap { flex: 1; min-width: 140px; }
.studio-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ink, #e0e0e0);
}
.studio-hint {
  display: block;
  font-size: 0.68rem;
  color: var(--ink-muted, #888);
  font-family: monospace;
  margin-top: 1px;
}
.studio-control {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.studio-pct {
  width: 62px;
  padding: 4px 6px;
  border: 1px solid var(--line, #333);
  border-radius: 6px;
  background: var(--bg, #0f0f23);
  color: var(--ink, #e0e0e0);
  font-size: 0.8rem;
  font-weight: 600;
  text-align: right;
  font-variant-numeric: tabular-nums;
  -moz-appearance: textfield;
}
.studio-pct::-webkit-inner-spin-button,
.studio-pct::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.studio-pct:focus { outline: none; border-color: var(--accent, #22d3ee); }
.studio-pct-suffix {
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--ink-muted, #888);
}
.studio-select { min-width: 180px; }
.studio-group-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent, #22d3ee);
  padding: 10px 0 3px;
  border-bottom: 1px solid var(--line, #333);
}
.studio-font-card {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  border: 2px solid var(--line, #333);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  min-width: 100px;
  text-align: center;
  background: var(--bg, #0f0f23);
}
.studio-font-card:hover { border-color: var(--ink-muted, #888); background: var(--bg-raised, #1a1a2e); }
.studio-font-card.selected { border-color: var(--accent, #22d3ee); background: var(--bg-raised, #1a1a2e); }
.studio-font-card .font-sample { font-size: 1rem; font-weight: 600; line-height: 1.2; margin-bottom: 2px; }
.studio-font-card .font-name { font-size: 0.62rem; color: var(--ink-muted, #888); text-transform: uppercase; letter-spacing: 0.04em; }
.theme-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
.theme-card {
  position: relative;
  border: 2px solid var(--line, #333);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.theme-card:hover { border-color: var(--ink-muted, #888); }
.theme-card.selected { border-color: var(--accent, #22d3ee); box-shadow: 0 0 0 2px var(--accent, #22d3ee); }
.theme-card .tc-swatch { height: 32px; }
.theme-card .tc-body { padding: 6px 8px; background: var(--bg, #0f0f23); }
.theme-card .tc-name { font-size: 0.74rem; font-weight: 700; color: var(--ink, #e0e0e0); }
.theme-card .tc-mode { font-size: 0.62rem; color: var(--ink-muted, #888); text-transform: uppercase; letter-spacing: 0.03em; }
.theme-card .tc-check { position: absolute; top: 4px; right: 6px; font-size: 0.8rem; }
@media (max-width: 600px) {
  .studio-row { flex-direction: column; align-items: flex-start; }
  .studio-pct { width: 56px; }
  .studio-control { width: 100%; }
  .theme-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
}

/* ══════════════════════════════════════════════════════════════════════════════
   CONTROL PANEL — OVERVIEW TAB
   ══════════════════════════════════════════════════════════════════════════════ */
/* Health bar */
.cp-health-bar {
  background: var(--bg-raised, #1a1a2e);
  border: 1px solid var(--line, #333);
  border-radius: 14px;
  margin-bottom: 16px;
  overflow: hidden;
}
.cp-health-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--line, #333);
  transition: background 0.15s;
}
.cp-health-row:last-child { border-bottom: none; }
.cp-health-row:hover { background: rgba(255,255,255,0.02); }
.cp-health-icon {
  font-size: 1.2rem;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}
.cp-health-body { flex: 1; min-width: 0; }
.cp-health-label {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--ink, #e0e0e0);
  margin-bottom: 2px;
}
.cp-health-detail {
  font-size: 0.74rem;
  color: var(--ink-muted, #888);
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 320px;
}
/* Snapshot grid */
.cp-snapshot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1px;
  background: var(--line, #333);
  border: 1px solid var(--line, #333);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 16px;
}
.cp-snapshot-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  background: var(--bg-raised, #1a1a2e);
  transition: background 0.15s;
}
.cp-snapshot-item:hover { background: var(--bg-sunken, rgba(0,0,0,0.2)); }
.cp-snapshot-label {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--ink-muted, #888);
}
.cp-snapshot-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ink, #e0e0e0);
  word-break: break-word;
}
/* Quick actions */
.cp-quick-actions {
  margin-bottom: 24px;
}
.cp-quick-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-muted, #888);
  margin-bottom: 8px;
}
.cp-quick-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.cp-quick-btn {
  padding: 8px 16px;
  border: 1px solid var(--line, #333);
  border-radius: 8px;
  background: var(--bg-raised, #1a1a2e);
  color: var(--ink, #e0e0e0);
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  white-space: nowrap;
}
.cp-quick-btn:hover {
  border-color: var(--accent, #22d3ee);
  color: var(--accent, #22d3ee);
}
/* Church Identity card */
.cp-identity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}
.cp-identity-field { display: flex; flex-direction: column; gap: 5px; }
.cp-identity-label {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--ink-muted, #888);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.cp-identity-hint {
  font-size: 0.72rem;
  color: var(--ink-faint, #666);
  line-height: 1.4;
}
@media (max-width: 600px) {
  .cp-identity-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .cp-health-detail { max-width: 160px; }
  .cp-snapshot-grid { grid-template-columns: repeat(2, 1fr); }
}

/* ══════════════════════════════════════════════════════════════════════════════
   NETWORK ADMIN
   ══════════════════════════════════════════════════════════════════════════════ */
.network-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.network-card {
  background: var(--bg-raised, #1a1a2e);
  border: 1px solid var(--line, #333);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color 0.2s;
}
.network-card:hover { border-color: var(--accent, #22d3ee); }
.network-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.network-card-name {
  font-weight: 700;
  font-size: 1rem;
  color: var(--ink, #e0e0e0);
  line-height: 1.3;
}
.network-card-id {
  font-size: 0.72rem;
  color: var(--ink-muted, #888);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 2px;
}
.network-pill {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}
.network-pill-checking { background: rgba(255,255,255,0.07); color: var(--ink-muted,#888); }
.network-pill-ok       { background: rgba(34,197,94,0.15);  color: #4ade80; }
.network-pill-down     { background: rgba(239,68,68,0.15);  color: #f87171; }
.network-card-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.network-meta-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 0.8rem;
}
.network-meta-label {
  font-weight: 700;
  color: var(--ink-muted, #888);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-width: 64px;
}
.network-meta-val { color: var(--ink, #e0e0e0); }
.network-meta-muted { color: var(--ink-faint, #666); font-style: italic; }
.network-meta-link {
  color: var(--accent, #22d3ee);
  text-decoration: none;
  font-size: 0.78rem;
}
.network-meta-link:hover { text-decoration: underline; }
.network-card-latency {
  font-size: 0.72rem;
  color: var(--ink-faint, #666);
  min-height: 14px;
}
@media (max-width: 600px) {
  .network-grid { grid-template-columns: 1fr; }
}

/* ══════════════════════════════════════════════════════════════════════════════
   SETTINGS TAB NAVIGATION
   ══════════════════════════════════════════════════════════════════════════════ */
.config-tabs-bar {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--bg-sunken, rgba(0,0,0,0.2));
  border-radius: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.config-tabs-bar::-webkit-scrollbar { display: none; }
.config-tab {
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: var(--ink-muted, #888);
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}
.config-tab:hover {
  color: var(--ink, #e0e0e0);
  background: rgba(255,255,255,0.04);
}
.config-tab.active {
  background: var(--accent, #22d3ee);
  color: var(--bg, #0f0f23);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.config-tab-icon {
  font-size: 1rem;
}
#settings-content {
  animation: configFadeIn 0.25s ease;
}
@keyframes configFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Enhanced stat cards */
.config-stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.config-stat-card {
  background: var(--bg-raised, #1a1a2e);
  border: 1px solid var(--line, #333);
  border-radius: 14px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s;
}
.config-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.config-stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}
.config-stat-card:nth-child(1)::before { background: linear-gradient(90deg, #22d3ee, #06b6d4); }
.config-stat-card:nth-child(2)::before { background: linear-gradient(90deg, #a78bfa, #7c3aed); }
.config-stat-card:nth-child(3)::before { background: linear-gradient(90deg, #4ade80, #22c55e); }
.config-stat-card:nth-child(4)::before { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
.config-stat-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
}
.config-stat-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ink, #e0e0e0);
  line-height: 1.2;
}
.config-stat-label {
  font-size: 0.72rem;
  color: var(--ink-muted, #888);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 4px;
}
@media (max-width: 768px) {
  .config-tabs-bar {
    gap: 2px;
    padding: 3px;
    border-radius: 8px;
  }
  .config-tab {
    padding: 8px 12px;
    font-size: 0.76rem;
  }
  .config-tab-icon { display: none; }
  .config-stat-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .config-stat-card { padding: 14px; }
  .config-stat-value { font-size: 1.2rem; }
}

/* My Requests cards */
.my-requests-grid {
  display: grid;
  gap: 14px;
}
.my-request-card {
  background: var(--bg-raised);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px 18px;
  transition: border-color 0.15s;
}
.my-request-card:hover { border-color: var(--accent); }
.my-request-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.my-request-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--ink);
}
.my-request-meta {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}
.my-request-body {
  font-size: 0.84rem;
  color: var(--ink-muted);
  line-height: 1.5;
  margin-bottom: 8px;
}
.my-request-footer {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 0.76rem;
  color: var(--ink-muted);
  flex-wrap: wrap;
}
.my-request-footer .assigned-to {
  color: var(--accent);
  font-weight: 600;
}

@media (max-width: 600px) {
  .settings-swatch-grid { grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 8px; }
  .settings-swatch { padding: 8px; }
  .settings-swatch-preview { height: 32px; }
  .settings-stat-row { grid-template-columns: repeat(2, 1fr); }
  .settings-section-header { padding: 16px 16px 12px; }
  .settings-card { padding: 14px 16px 16px; }
  .settings-accordion-trigger { padding: 12px 16px; }
  .toggle-row { padding: 8px 10px; }
}

/* ── Settings v2: sidebar layout, clean components ────────────── */
.stg-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 0;
  min-height: 60vh;
}
.stg-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 0 8px 0;
  border-right: 1px solid var(--line, #333);
  position: sticky;
  top: 0;
  align-self: start;
}
.stg-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: var(--ink-muted, #888);
  font-size: 0.84rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  border-radius: 0 10px 10px 0;
  transition: all 0.15s;
  text-align: left;
  white-space: nowrap;
}
.stg-nav-item:hover { background: rgba(255,255,255,0.04); color: var(--ink, #e0e0e0); }
.stg-nav-item.active {
  background: var(--accent, #22d3ee);
  color: var(--bg, #0f0f23);
  font-weight: 700;
}
.stg-nav-icon { font-size: 1.05rem; width: 22px; text-align: center; flex-shrink: 0; }
.stg-main {
  padding: 16px 24px 32px;
  min-width: 0;
}
.stg-panel-animate {
  animation: stgFade 0.2s ease;
}
@keyframes stgFade {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Cards ── */
.stg-card {
  background: var(--bg-raised, #1a1a2e);
  border: 1px solid var(--line, #333);
  border-radius: 14px;
  padding: 20px 22px;
  margin-bottom: 16px;
}
.stg-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink, #e0e0e0);
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.stg-card-count {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ink-muted, #888);
  margin-left: auto;
}
.stg-card-desc {
  font-size: 0.82rem;
  color: var(--ink-muted, #888);
  margin: 0 0 14px;
  line-height: 1.5;
}

/* ── Stats row ── */
.stg-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.stg-stat {
  background: var(--bg-raised, #1a1a2e);
  border: 1px solid var(--line, #333);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}
.stg-stat-val {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--ink, #e0e0e0);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.stg-stat-lbl {
  font-size: 0.68rem;
  color: var(--ink-muted, #888);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 4px;
}

/* ── Health / KV rows ── */
.stg-health-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--surface-alt, rgba(255,255,255,0.04));
}
.stg-health-row:last-child { border-bottom: none; }
.stg-health-label { font-size: 0.85rem; font-weight: 600; }
.stg-kv {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 0;
  font-size: 0.84rem;
  border-bottom: 1px solid var(--surface-alt, rgba(255,255,255,0.04));
}
.stg-kv:last-child { border-bottom: none; }
.stg-kv > span:first-child { color: var(--ink-muted, #888); }
.stg-kv > span:last-child { font-weight: 600; color: var(--ink, #e0e0e0); }

/* ── Pills ── */
.stg-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
.stg-pill::before {
  content: '';
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.stg-pill-ok   { background: rgba(74,222,128,0.12); color: #4ade80; }
.stg-pill-ok::before   { background: #4ade80; }
.stg-pill-warn { background: rgba(251,191,36,0.12); color: #fbbf24; }
.stg-pill-warn::before { background: #fbbf24; }
.stg-pill-err  { background: rgba(248,113,113,0.12); color: #f87171; }
.stg-pill-err::before  { background: #f87171; }
.stg-pill-off  { background: rgba(128,128,128,0.12); color: #888; }
.stg-pill-off::before  { background: #888; }
.stg-pill-check { background: rgba(128,128,128,0.08); color: var(--ink-muted, #888); }
.stg-pill-check::before { background: var(--ink-muted, #888); animation: stgPulse 1.2s infinite; }
@keyframes stgPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

/* ── Banners ── */
.stg-banner {
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  margin-bottom: 12px;
}
.stg-banner-warn { background: rgba(251,191,36,0.12); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }
.stg-banner-info { background: rgba(34,211,238,0.12); color: #22d3ee; border: 1px solid rgba(34,211,238,0.2); }

/* ── Forms ── */
.stg-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.stg-form-grid-3 { grid-template-columns: repeat(3, 1fr); }
.stg-field { display: flex; flex-direction: column; gap: 4px; }
.stg-label {
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--ink-muted, #888);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.stg-input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--line, #333);
  background: var(--bg, #0f0f23);
  color: var(--ink, #e0e0e0);
  font-size: 0.85rem;
  font-family: inherit;
  transition: border-color 0.15s;
}
.stg-input:focus { border-color: var(--accent, #22d3ee); outline: none; }
.stg-input-sm { width: 65px; padding: 5px 8px; font-size: 0.82rem; }
.stg-textarea { resize: vertical; font-family: monospace; font-size: 0.82rem; }
.stg-input-row { display: flex; align-items: center; gap: 6px; }
.stg-unit { font-size: 0.78rem; color: var(--ink-muted); }
.stg-form-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
}
.stg-status { font-size: 0.78rem; color: var(--ink-muted, #888); }

/* ── Buttons ── */
.stg-btn {
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.stg-btn-primary { background: var(--accent, #22d3ee); color: var(--bg, #0f0f23); }
.stg-btn-primary:hover { filter: brightness(1.1); }
.stg-btn-ghost { background: transparent; border: 1px solid var(--line, #333); color: var(--ink, #e0e0e0); }
.stg-btn-ghost:hover { border-color: var(--accent, #22d3ee); color: var(--accent, #22d3ee); }
.stg-btn-danger { background: var(--danger, #ef4444); color: #fff; }
.stg-btn-sm { padding: 5px 12px; font-size: 0.78rem; }
.stg-link-btn {
  background: none; border: none; color: inherit; text-decoration: underline;
  cursor: pointer; font-size: inherit; font-family: inherit; padding: 0;
}

/* ── Toggle switch ── */
.stg-switch { position: relative; display: inline-block; width: 38px; height: 22px; flex-shrink: 0; }
.stg-switch input { opacity: 0; width: 0; height: 0; }
.stg-switch-track {
  position: absolute; inset: 0;
  background: var(--surface-alt, rgba(255,255,255,0.1));
  border-radius: 22px;
  cursor: pointer;
  transition: background 0.2s;
}
.stg-switch-track::after {
  content: '';
  position: absolute; left: 3px; top: 3px;
  width: 16px; height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
}
.stg-switch input:checked + .stg-switch-track { background: var(--accent, #22d3ee); }
.stg-switch input:checked + .stg-switch-track::after { transform: translateX(16px); }
.stg-switch-label { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--ink-muted); }

/* ── Toggles list ── */
.stg-toggle-list { display: flex; flex-direction: column; }
.stg-toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 0; border-bottom: 1px solid var(--surface-alt, rgba(255,255,255,0.04));
  font-size: 0.85rem;
}
.stg-toggle-row:last-child { border-bottom: none; }

/* ── Theme grid ── */
.stg-theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin: 8px 0;
}
.stg-theme-card {
  border: 2px solid var(--line, #333);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;
}
.stg-theme-card:hover { transform: translateY(-2px); border-color: var(--ink-muted); }
.stg-theme-card.selected { border-color: var(--accent, #22d3ee); box-shadow: 0 0 0 2px rgba(34,211,238,0.3); }
.stg-theme-swatch { height: 48px; }
.stg-theme-name {
  padding: 6px 8px;
  font-size: 0.72rem;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Font chips ── */
.stg-font-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.stg-font-chip {
  padding: 5px 12px;
  border: 1px solid var(--line, #333);
  border-radius: 6px;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.15s;
}
.stg-font-chip:hover { border-color: var(--ink-muted); }
.stg-font-chip.selected { border-color: var(--accent); background: rgba(34,211,238,0.1); color: var(--accent); }

/* ── Module categories ── */
.stg-mod-cat {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--ink-muted, #888);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 12px 0 4px;
  border-bottom: 1px solid var(--surface-alt, rgba(255,255,255,0.04));
  margin-top: 8px;
}
.stg-mod-cat-icon { font-size: 0.9rem; }

/* ── Config key-value rows ── */
.stg-cfg-cat {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--ink-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 14px 0 6px;
}
.stg-cfg-cat-n { font-weight: 500; opacity: 0.6; }
.stg-cfg-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.1s;
}
.stg-cfg-row:hover { background: rgba(255,255,255,0.03); }
.stg-cfg-key { font-size: 0.82rem; font-weight: 600; font-family: monospace; color: var(--ink); min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.stg-cfg-val { font-size: 0.82rem; color: var(--ink-muted); text-align: right; flex-shrink: 0; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.stg-cfg-on { color: #4ade80; }
.stg-cfg-off { color: #f87171; }

/* ── Chunk grid ── */
.stg-chunk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; }
.stg-chunk-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 10px; border-radius: 6px;
  background: var(--surface-alt, rgba(255,255,255,0.03));
  font-size: 0.84rem; font-weight: 600;
}

/* ── Quick actions ── */
.stg-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
.stg-action {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--line, #333);
  background: var(--bg-raised, #1a1a2e);
  color: var(--ink, #e0e0e0);
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}
.stg-action:hover { border-color: var(--accent); color: var(--accent); }

/* ── Mobile: collapse sidebar to horizontal pills ── */
@media (max-width: 768px) {
  .stg-layout { grid-template-columns: 1fr; }
  .stg-sidebar {
    flex-direction: row;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    border-right: none;
    border-bottom: 1px solid var(--line, #333);
    padding: 6px;
    gap: 4px;
    position: static;
  }
  .stg-sidebar::-webkit-scrollbar { display: none; }
  .stg-nav-item { border-radius: 8px; padding: 7px 12px; font-size: 0.76rem; }
  .stg-nav-label { display: none; }
  .stg-nav-icon { font-size: 1.1rem; width: auto; }
  .stg-main { padding: 12px 14px 24px; }
  .stg-form-grid { grid-template-columns: 1fr; }
  .stg-form-grid-3 { grid-template-columns: 1fr 1fr; }
  .stg-stats { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .stg-theme-grid { grid-template-columns: repeat(3, 1fr); }
}


/* ══════════════════════════════════════════════════════════════════════════════
   FULL-PAGE EDITORS (the_life.js)
   ══════════════════════════════════════════════════════════════════════════════ */
.fp-editor { max-width: 900px; margin: 0 auto; }
.fp-topbar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.fp-back {
  background: none;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 7px 16px;
  cursor: pointer;
  color: var(--ink);
  font-size: 0.84rem;
  font-family: inherit;
  white-space: nowrap;
  transition: border-color 0.15s;
}
.fp-back:hover { border-color: var(--accent); }
.fp-title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--ink);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fp-save-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg);
  padding: 10px 0 14px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 16px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
.fp-save-btn {
  background: var(--accent);
  color: var(--ink-inverse);
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.92rem;
  font-family: inherit;
  transition: opacity 0.15s;
}
.fp-save-btn:hover { opacity: 0.9; }
.fp-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.fp-save-status { font-size: 0.82rem; color: var(--ink-muted); }
.fp-resolve-btn {
  background: none;
  border: 1px solid var(--success);
  color: var(--success);
  border-radius: 6px;
  padding: 8px 18px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.84rem;
  font-family: inherit;
}
.fp-resolve-btn:hover { background: var(--success); color: #fff; }
.fp-bottom-bar {
  margin-top: 20px;
  padding: 16px 0;
  border-top: 1px solid var(--line);
  display: flex;
  gap: 10px;
  align-items: center;
}
.fp-action-btn {
  padding: 7px 16px;
  border-radius: 6px;
  border: 1px solid var(--line);
  background: var(--bg-raised);
  color: var(--ink);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: border-color 0.15s;
}
.fp-action-btn:hover { border-color: var(--accent); }
.fp-section { margin-bottom: 16px; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
.fp-section > summary {
  padding: 12px 16px;
  background: rgba(255,255,255,0.04);
  cursor: pointer;
  font-weight: 700;
  font-size: 0.82rem;
  color: var(--accent);
  user-select: none;
}

/* ── Timeline ── */
.fp-timeline { padding-left: 20px; border-left: 2px solid var(--accent); }
.fp-timeline-item {
  position: relative;
  padding: 0 0 20px 16px;
}
.fp-timeline-dot {
  position: absolute;
  left: -27px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent);
  border: 2px solid var(--bg);
}
.fp-timeline-content {
  background: var(--bg-raised);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 12px 14px;
}
.fp-timeline-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.fp-timeline-type { font-weight: 700; font-size: 0.8rem; color: var(--ink); }
.fp-timeline-date { font-size: 0.72rem; color: var(--ink-muted); }
.fp-timeline-body { font-size: 0.82rem; color: var(--ink); line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
.fp-timeline-fu { font-size: 0.72rem; color: var(--warn); font-weight: 600; margin-top: 6px; }

/* ── Prayer request display ── */
.fp-request-card {
  background: var(--bg-sunken);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 18px;
}
.fp-request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.fp-request-name { font-weight: 700; font-size: 0.95rem; color: var(--ink); }
.fp-request-meta { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
.fp-request-text {
  font-size: 0.9rem;
  color: var(--ink);
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  padding: 12px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  margin-bottom: 12px;
}
.fp-request-contact {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 0.82rem;
  color: var(--ink-muted);
}

@media (max-width: 600px) {
  .fp-editor { padding: 0 4px; }
  .fp-topbar { gap: 8px; }
  .fp-save-bar { flex-direction: column; align-items: stretch; }
  .fp-save-btn { width: 100%; text-align: center; }
  .fp-timeline { padding-left: 14px; }
  .fp-timeline-dot { left: -21px; width: 10px; height: 10px; }
}

/* ══════════════════════════════════════════════════════════════════════════════
   MY FLOCK HUB — Pastoral command center
   ══════════════════════════════════════════════════════════════════════════════ */
.flock-hub { max-width: 1280px; margin: 0 auto; overflow-x: hidden; }

/* ── Dashboard strip (overview) ── */
.flock-dashboard-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg-raised);
  border: 1px solid var(--line);
  border-radius: 10px;
}
.flock-dash-item { text-align: center; }
.flock-dash-val { font-size: 1.3rem; font-weight: 800; color: var(--accent); display: block; }
.flock-dash-label { font-size: 0.65rem; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.flock-section-heading {
  font-size: 0.82rem;
  color: var(--accent);
  margin: 14px 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.flock-section-ct {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 0.68rem;
  font-weight: 700;
  border-radius: 10px;
  background: var(--accent);
  color: var(--bg);
}
.flock-see-more {
  text-align: center;
  margin-top: 8px;
  font-size: 0.78rem;
  color: var(--ink-muted);
}
.flock-followup-row {
  background: var(--bg-raised);
  border: 1px solid var(--warn);
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  color: var(--ink);
}
.flock-followup-date { font-size: 0.72rem; color: var(--warn); font-weight: 600; }

/* ── KPI ribbon ── */
.flock-kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}
.flock-kpi {
  background: var(--bg-raised);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 14px 12px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.flock-kpi:hover { border-color: var(--accent); box-shadow: 0 2px 12px rgba(0,0,0,0.12); }
.flock-kpi.kpi-alert { border-color: var(--danger); }
.flock-kpi-val { font-size: 1.5rem; font-weight: 800; line-height: 1.15; }
.flock-kpi-label { font-size: 0.7rem; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-top: 2px; }

/* ── Tab bar ── */
.flock-tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--line);
  margin-bottom: 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.flock-tab {
  padding: 10px 18px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ink-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
  font-family: inherit;
}
.flock-tab:hover { color: var(--ink); }
.flock-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
.flock-tab .tab-ct {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 9px;
  margin-left: 6px;
  background: var(--ink-muted);
  color: var(--bg);
}
.flock-tab .tab-ct.ct-danger { background: var(--danger); }
.flock-tab .tab-ct.ct-warn   { background: var(--warn);   }

/* ── Panel containers ── */
.flock-panel { display: none; }
.flock-panel.active { display: block; }

/* ── Card grid / list ── */
.flock-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 12px;
}
.flock-card {
  background: var(--bg-raised);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.flock-card:hover { border-color: var(--accent); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.flock-card.priority-high,
.flock-card.priority-critical { border-left: 3px solid var(--danger); }
.flock-card.priority-urgent   { border-left: 3px solid var(--warn); }
.flock-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.flock-card-name { font-weight: 700; font-size: 0.88rem; color: var(--ink); }
.flock-card-pills { display: flex; gap: 5px; flex-wrap: wrap; }
.flock-card-body { font-size: 0.82rem; color: var(--ink-muted); line-height: 1.5; }
.flock-card-foot {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  font-size: 0.72rem;
  color: var(--ink-muted);
  margin-top: auto;
  padding-top: 4px;
  border-top: 1px solid var(--line);
}
.flock-card-foot .assigned { color: var(--accent); font-weight: 600; }

/* ── Quick-action row ── */
.flock-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.flock-actions button {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  border: 1px solid var(--line);
  background: var(--bg-raised);
  color: var(--ink);
  transition: border-color 0.15s;
}
.flock-actions button:hover { border-color: var(--accent); }
.flock-actions button.primary { background: var(--accent); color: var(--ink-inverse); border-color: var(--accent); }

/* ── Members list (overview tab) ── */
.flock-member-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--line);
  transition: background 0.1s;
}
.flock-member-row:hover { background: var(--bg-raised); }
.flock-member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--accent);
  flex-shrink: 0;
}
.flock-member-init {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}
.flock-member-info { flex: 1; min-width: 0; }
.flock-member-name { font-weight: 600; font-size: 0.85rem; color: var(--ink); }
.flock-member-detail { font-size: 0.73rem; color: var(--ink-muted); }

/* ── Notes thread ── */
.flock-note {
  padding: 10px 14px;
  border-left: 3px solid var(--accent);
  margin-bottom: 10px;
  background: var(--bg-raised);
  border-radius: 0 8px 8px 0;
}
.flock-note-head { display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--ink-muted); margin-bottom: 4px; }
.flock-note-body { font-size: 0.82rem; color: var(--ink); line-height: 1.5; white-space: pre-wrap; word-break: break-word; }

/* ── Empty state within panel ── */
.flock-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--ink-muted);
  font-size: 0.85rem;
}
.flock-empty-icon { font-size: 2rem; opacity: 0.5; margin-bottom: 8px; }

@media (max-width: 600px) {
  .flock-kpi-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .flock-kpi { padding: 10px 8px; }
  .flock-kpi-val { font-size: 1.2rem; }
  .flock-card-grid { grid-template-columns: 1fr; }
  .flock-tab { padding: 8px 12px; font-size: 0.75rem; }
}

/* ══════════════════════════════════════════════════════════════════════════════
   UTILITY CLASSES
   ══════════════════════════════════════════════════════════════════════════════ */

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  border: 0;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.divider {
  height: 1px;
  background: var(--line);
  border: none;
  margin: 1rem 0;
}

.visually-hidden {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

/* ══════════════════════════════════════════════════════════════════════════════
   TABERNACLE ZONES — Spiritual Progression in Navigation
   Outer Court → Courts → Holy Place → Holy of Holies
   ══════════════════════════════════════════════════════════════════════════════ */

/* ── Zone accent bars on group labels ──────────── */
.nav-group[data-zone] .nav-group-label {
  position: relative;
  padding-left: 28px;
}
.nav-group[data-zone] .nav-group-label::before {
  content: '';
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  border-radius: 2px;
  transition: background 0.3s;
}

/* Gates — warm gold (entry, welcome) */
.nav-group[data-zone="gates"] .nav-group-label::before {
  background: var(--gold, #d4b870);
}
.nav-group[data-zone="gates"] .nav-group-label {
  color: var(--gold, #d4b870);
}

/* Courts — sage mint (service, community) */
.nav-group[data-zone="courts"] .nav-group-label::before {
  background: var(--mint, #8cc5a2);
}
.nav-group[data-zone="courts"] .nav-group-label {
  color: var(--mint, #8cc5a2);
}

/* Holy Place — soft lilac (growth, formation) */
.nav-group[data-zone="holy-place"] .nav-group-label::before {
  background: var(--lilac, #b49bdb);
}
.nav-group[data-zone="holy-place"] .nav-group-label {
  color: var(--lilac, #b49bdb);
}

/* Holy of Holies — luminous gold gradient (encounter, presence) */
.nav-group[data-zone="holies"] .nav-group-label::before {
  background: linear-gradient(180deg, var(--gold, #d4b870), var(--lilac, #b49bdb));
  width: 5px;
}
.nav-group[data-zone="holies"] .nav-group-label {
  color: var(--gold, #d4b870);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
}
.nav-group[data-zone="holies"] .nav-item {
  font-weight: 600;
  color: var(--gold, #d4b870);
}
.nav-group[data-zone="holies"] .nav-item:hover {
  background: var(--gold-soft, rgba(212,184,112,0.08));
  border-left-color: var(--gold, #d4b870);
}

/* ── Threshold dividers between spiritual zones ──────────── */
.nav-threshold {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 20px 4px;
  margin: 2px 0;
  user-select: none;
}
.nav-threshold::before,
.nav-threshold::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--line);
  opacity: 0.5;
}
.nav-threshold-glyph {
  font-size: 0.6rem;
  color: var(--ink-faint);
  opacity: 0.6;
  letter-spacing: 0.3em;
}

/* ── Admin / personal zones — muted, recessive ──────────── */
.nav-group[data-zone="personal"] .nav-group-label,
.nav-group[data-zone="admin"] .nav-group-label {
  color: var(--ink-faint);
  font-size: 0.65rem;
}
.nav-group[data-zone="personal"] .nav-item,
.nav-group[data-zone="admin"] .nav-item {
  font-size: 0.82rem;
  color: var(--ink-muted);
}

/* ── Dashboard zone grouping (mirrors sidebar Tabernacle pattern) ── */
.dash-zone-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gold, #d4b870);
  padding: 0 0 6px;
  margin-top: 4px;
}
.dash-threshold {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 24px 0 8px;
  user-select: none;
}
.dash-threshold::before,
.dash-threshold::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--line);
  opacity: 0.5;
}
.dash-threshold-glyph {
  font-size: 0.6rem;
  color: var(--ink-faint);
  opacity: 0.6;
  letter-spacing: 0.3em;
}
`;

  /* ─── INTERNAL HELPERS ────────────────────────────────────────────────────── */

  function _inject() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

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
    _inject();
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
