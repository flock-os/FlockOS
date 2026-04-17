#!/usr/bin/env bash
# ======================================================================
# FlockOS — Fully Offline Single-File Bundler
# Produces a 100% self-contained HTML file — zero internet required.
#
# What gets inlined:
#   1. All 11 local JS scripts
#   2. Logo as base64 data URI
#   3. Google Fonts (9 .ttf files as base64 @font-face)
#   4. Firebase SDK (app-compat, firestore-compat, auth-compat)
#   5. SheetJS library
#   6. FlockOS-CRM.xlsx pre-loaded into Wellspring on startup
#   7. Nehemiah auth bypass (synthetic admin session, no login)
#
# Output: FlockOS/Tools/Master Deployment/FlockOS.html (~8MB)
#
# Usage: bash B-Bundle.sh
#        Then share FlockOS.html via Google Drive, AirDrop, email, etc.
# ======================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
SRC="$REPO_ROOT/FlockOS/Pages/index.html"
SCRIPTS_DIR="$REPO_ROOT/FlockOS/Scripts"
IMAGES_DIR="$REPO_ROOT/FlockOS/Images"
DEV_DIR="$REPO_ROOT/FlockOS/Tools/Development Scripts"
OUT_DIR="$REPO_ROOT/FlockOS/Tools/Master Deployment"
OUT="$OUT_DIR/FlockOS.html"
CACHE_DIR="/tmp/flock_bundle_cache"

mkdir -p "$OUT_DIR" "$CACHE_DIR"

# Local scripts to inline (must match load order in index.html)
LOCALS=(
  the_upper_room.js
  fine_linen.js
  the_true_vine.js
  the_wellspring.js
  the_well.js
  the_tabernacle.js
  the_truth.js
  the_seasons.js
  the_way.js
  the_harvest.js
  the_life.js
)

# CDN URLs
FIREBASE_VER="10.14.1"
FIREBASE_APP="https://www.gstatic.com/firebasejs/${FIREBASE_VER}/firebase-app-compat.js"
FIREBASE_FS="https://www.gstatic.com/firebasejs/${FIREBASE_VER}/firebase-firestore-compat.js"
FIREBASE_AUTH="https://www.gstatic.com/firebasejs/${FIREBASE_VER}/firebase-auth-compat.js"
SHEETJS_URL="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"
FONTS_CSS_URL="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&family=Noto+Sans+Hebrew:wght@400;600;700&family=Noto+Serif:ital,wght@0,400;0,700;1,400&display=swap"

# xlsx database to embed
XLSX_SRC="$DEV_DIR/FlockOS-CRM.xlsx"

echo "═══════════════════════════════════════════════════════════"
echo "  FlockOS — Fully Offline Bundler"
echo "═══════════════════════════════════════════════════════════"
echo ""

# ── Helper: download with cache ──────────────────────────────────────
dl_cached() {
  local url="$1" dest="$2"
  if [ -f "$dest" ] && [ -s "$dest" ]; then
    return 0
  fi
  curl -sL -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120" \
    -o "$dest" "$url"
}

# ── Pre-flight ────────────────────────────────────────────────────────
echo "Checking local scripts…"
for js in "${LOCALS[@]}"; do
  if [ ! -f "$SCRIPTS_DIR/$js" ]; then
    echo "  ✗ MISSING: $SCRIPTS_DIR/$js"; exit 1
  fi
done
if [ ! -f "$SRC" ]; then echo "  ✗ MISSING: $SRC"; exit 1; fi
echo "  ✓ All ${#LOCALS[@]} scripts found"

if [ ! -f "$XLSX_SRC" ]; then
  echo "  ⚠ No xlsx at $XLSX_SRC — bundle will skip pre-loaded database"
  HAS_XLSX=false
else
  XLSX_SIZE=$(du -k "$XLSX_SRC" | cut -f1)
  echo "  ✓ FlockOS-CRM.xlsx found (${XLSX_SIZE}KB)"
  HAS_XLSX=true
fi

# ── Download CDN assets ──────────────────────────────────────────────
echo ""
echo "Downloading CDN assets (cached)…"

dl_cached "$FIREBASE_APP"  "$CACHE_DIR/firebase-app-compat.js"
dl_cached "$FIREBASE_FS"   "$CACHE_DIR/firebase-firestore-compat.js"
dl_cached "$FIREBASE_AUTH"  "$CACHE_DIR/firebase-auth-compat.js"
echo "  ✓ Firebase SDK (3 files)"

dl_cached "$SHEETJS_URL" "$CACHE_DIR/xlsx.full.min.js"
echo "  ✓ SheetJS"

dl_cached "$FONTS_CSS_URL" "$CACHE_DIR/fonts.css"
echo "  ✓ Google Fonts CSS"

# ── Download & base64-encode font files ──────────────────────────────
echo "Building inline @font-face CSS…"
FONTS_INLINE="$CACHE_DIR/fonts_inline.css"
cp "$CACHE_DIR/fonts.css" "$FONTS_INLINE"

# Extract each font URL, download the .ttf, replace with data URI
grep -oE 'https://fonts\.gstatic\.com/[^)]+' "$CACHE_DIR/fonts.css" | while read -r FONT_URL; do
  # Use URL hash as filename
  FONT_HASH=$(echo "$FONT_URL" | md5 | cut -c1-12)
  FONT_FILE="$CACHE_DIR/font_${FONT_HASH}.ttf"
  dl_cached "$FONT_URL" "$FONT_FILE"
  FONT_B64="data:font/ttf;base64,$(base64 -i "$FONT_FILE" | tr -d '\n')"
  # Escape URL for sed (slashes)
  FONT_URL_ESC=$(printf '%s' "$FONT_URL" | sed 's|[/&]|\\&|g')
  FONT_B64_ESC=$(printf '%s' "$FONT_B64" | sed 's|[/&]|\\&|g')
  sed -i '' "s|${FONT_URL_ESC}|${FONT_B64_ESC}|" "$FONTS_INLINE"
done
echo "  ✓ 9 font files base64-encoded into @font-face CSS"

# ── Create resized logo as base64 data URI ────────────────────────────
LOGO_SRC="$IMAGES_DIR/FlockOS_Camo.png"
LOGO_B64=""
if [ -f "$LOGO_SRC" ]; then
  LOGO_TMP=$(mktemp /tmp/flock_logo_XXXX.png)
  sips -Z 192 "$LOGO_SRC" --out "$LOGO_TMP" >/dev/null 2>&1 || cp "$LOGO_SRC" "$LOGO_TMP"
  LOGO_B64="data:image/png;base64,$(base64 -i "$LOGO_TMP" | tr -d '\n')"
  rm -f "$LOGO_TMP"
  echo "  ✓ Logo resized & base64 encoded"
else
  echo "  ⚠ Logo not found — will be blank"
fi

# ── Build working copy ────────────────────────────────────────────────
echo ""
echo "Assembling bundle…"
WORK=$(mktemp /tmp/flock_bundle_XXXX.html)
cp "$SRC" "$WORK"

# Remove manifest + favicon links (won't resolve standalone)
sed -i '' '/<link rel="icon"/d'            "$WORK"
sed -i '' '/<link rel="apple-touch-icon"/d' "$WORK"
sed -i '' '/<link rel="manifest"/d'         "$WORK"

# Remove Google Analytics (not needed offline)
sed -i '' '/googletagmanager\.com/d' "$WORK"
sed -i '' '/gtag.*config.*G-/d' "$WORK" 2>/dev/null || true

# Replace logo <img> src with base64
if [ -n "$LOGO_B64" ]; then
  sed -i '' "s|src=\"\.\./Images/FlockOS_Camo\.png\"|src=\"${LOGO_B64}\"|g" "$WORK"
fi

# ── Replace Google Fonts <link> with inline @font-face CSS ────────────
# Remove preconnect hints
sed -i '' '/<link rel="preconnect" href="https:\/\/fonts/d' "$WORK"

# Replace the fonts stylesheet link with inline <style>
FONTS_STYLE_TMP=$(mktemp /tmp/flock_fontstyle_XXXX)
echo '<style>/* ═══ Google Fonts (inlined) ═══ */' > "$FONTS_STYLE_TMP"
cat "$FONTS_INLINE" >> "$FONTS_STYLE_TMP"
echo '</style>' >> "$FONTS_STYLE_TMP"

perl -0777 -pe "
  BEGIN {
    open my \$fh, '<', '$FONTS_STYLE_TMP' or die;
    local \$/; \$r = <\$fh>; close \$fh;
  }
  s|<link href=\"https://fonts\.googleapis\.com/css2[^\"]*\" rel=\"stylesheet\">|\$r|s;
" "$WORK" > "${WORK}.new"
mv "${WORK}.new" "$WORK"
rm -f "$FONTS_STYLE_TMP"
echo "  ✓ Google Fonts inlined as @font-face CSS"

# ── Replace Firebase CDN scripts with inline <script> ─────────────────
for fb_file in firebase-app-compat.js firebase-firestore-compat.js firebase-auth-compat.js; do
  INLINE_TMP=$(mktemp /tmp/flock_fb_XXXX)
  printf '<script>/* ═══ %s (inlined) ═══ */\n' "$fb_file" > "$INLINE_TMP"
  cat "$CACHE_DIR/$fb_file" >> "$INLINE_TMP"
  printf '\n</script>' >> "$INLINE_TMP"

  PATTERN="<script defer src=\"https://www\.gstatic\.com/firebasejs/${FIREBASE_VER}/${fb_file}\"></script>"
  perl -0777 -pe "
    BEGIN {
      open my \$fh, '<', '$INLINE_TMP' or die;
      local \$/; \$r = <\$fh>; close \$fh;
    }
    s|${PATTERN}|\$r|s;
  " "$WORK" > "${WORK}.new"
  mv "${WORK}.new" "$WORK"
  rm -f "$INLINE_TMP"
done
echo "  ✓ Firebase SDK inlined (3 files)"

# ── Replace SheetJS CDN script with inline <script> ──────────────────
INLINE_TMP=$(mktemp /tmp/flock_sheetjs_XXXX)
printf '<script>/* ═══ SheetJS xlsx.full.min.js (inlined) ═══ */\n' > "$INLINE_TMP"
cat "$CACHE_DIR/xlsx.full.min.js" >> "$INLINE_TMP"
printf '\n</script>' >> "$INLINE_TMP"

perl -0777 -pe "
  BEGIN {
    open my \$fh, '<', '$INLINE_TMP' or die;
    local \$/; \$r = <\$fh>; close \$fh;
  }
  s|<script defer src=\"https://cdn\.sheetjs\.com/[^\"]+\"></script>|\$r|s;
" "$WORK" > "${WORK}.new"
mv "${WORK}.new" "$WORK"
rm -f "$INLINE_TMP"
echo "  ✓ SheetJS inlined"

# ── Inline each local script ─────────────────────────────────────────
for js in "${LOCALS[@]}"; do
  JS_FILE="$SCRIPTS_DIR/$js"
  INLINE_TMP=$(mktemp /tmp/flock_inline_XXXX)
  printf '<script>/* ═══ %s (inlined) ═══ */\n' "$js" > "$INLINE_TMP"
  cat "$JS_FILE" >> "$INLINE_TMP"
  printf '\n</script>' >> "$INLINE_TMP"

  PATTERN="<script defer src=\"\\.\\./Scripts/${js}\"></script>"
  perl -0777 -pe "
    BEGIN {
      open my \$fh, '<', '$INLINE_TMP' or die;
      local \$/; \$r = <\$fh>; close \$fh;
    }
    s|${PATTERN}|\$r|s;
  " "$WORK" > "${WORK}.new"
  mv "${WORK}.new" "$WORK"
  rm -f "$INLINE_TMP"
done
echo "  ✓ ${#LOCALS[@]} local scripts inlined"

# ── Inject auto-bootstrap: bypass auth + activate Wellspring ──────────
BOOTSTRAP_TMP=$(mktemp /tmp/flock_boot_XXXX)
cat > "$BOOTSTRAP_TMP" <<'BOOT_EOF'
<script>/* ═══ FlockOS Portable Bootstrap ═══ */
(function() {
  'use strict';
  localStorage.setItem('flock_local_bypass', 'true');

  var allPerms = {};
  ['dashboard','daily-bread','upper-room','reading-plan','devotionals',
   'prayer','my-requests','words','themes','sermons','songs','calendar',
   'events','services','ministries','volunteers','todo','checkin','journal',
   'directory','members','care','my-flock','prayer-admin','compassion','mirror',
   'groups','attendance','giving','discipleship','outreach','learning',
   'theology','library','comms','missions','statistics','reports',
   'users','config','audit','interface-studio','service-hub'
  ].forEach(function(k) { allPerms[k] = true; });

  var session = {
    token:       'portable-' + Date.now(),
    email:       'pastor@flockos.app',
    role:        'admin',
    roleLevel:   5,
    displayName: 'Pastor',
    expiresAt:   Date.now() + 365 * 24 * 60 * 60 * 1000,
    permissions: allPerms,
    isSeed:      true,
    churchId:    'portable'
  };
  sessionStorage.setItem('flock_auth_session', JSON.stringify(session));
  sessionStorage.setItem('flock_auth_profile', JSON.stringify({
    email: 'pastor@flockos.app', displayName: 'Pastor',
    firstName: 'Pastor', lastName: '', role: 'admin', theme: 'Auto'
  }));

  window.__FLOCKOS_PORTABLE__ = true;
  console.log('%c✝ FlockOS Portable — Fully offline. No authentication required.', 'color:#e8a838;font-weight:bold;font-size:14px');
})();
</script>
BOOT_EOF

# Insert bootstrap right before the first inlined Firebase script
perl -0777 -pe "
  BEGIN {
    open my \$fh, '<', '$BOOTSTRAP_TMP' or die;
    local \$/; \$r = <\$fh>; close \$fh;
  }
  s|(<script>/\* ═══ firebase-app-compat)|\$r\n\1|s;
" "$WORK" > "${WORK}.new"
mv "${WORK}.new" "$WORK"
rm -f "$BOOTSTRAP_TMP"
echo "  ✓ Auth bypass + portable bootstrap injected"

# ── Embed xlsx database with auto-load ────────────────────────────────
if [ "$HAS_XLSX" = true ]; then
  XLSX_B64=$(base64 -i "$XLSX_SRC" | tr -d '\n')
  XLSX_SCRIPT_TMP=$(mktemp /tmp/flock_xlsx_XXXX)
  cat > "$XLSX_SCRIPT_TMP" <<XLSX_EOF
<script>/* ═══ Pre-loaded Church Database ═══ */
(function() {
  'use strict';
  var XLSX_B64 = '${XLSX_B64}';

  function b64toArrayBuffer(b64) {
    var bin = atob(b64), len = bin.length, buf = new ArrayBuffer(len), arr = new Uint8Array(buf);
    for (var i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
    return buf;
  }

  // Wait for TheWellspring to be available, then auto-load the database
  var attempts = 0;
  var interval = setInterval(function() {
    attempts++;
    if (attempts > 100) { clearInterval(interval); return; }

    if (typeof TheWellspring !== 'undefined' && TheWellspring.load) {
      clearInterval(interval);
      try {
        var buf = b64toArrayBuffer(XLSX_B64);
        var wb = XLSX.read(buf, { type: 'array' });
        TheWellspring.load(wb);
        console.log('%c✝ Church database auto-loaded (' + wb.SheetNames.length + ' sheets)', 'color:#4caf50;font-weight:bold');
      } catch(e) {
        console.warn('FlockOS Portable: auto-load xlsx failed —', e.message);
      }
    }
  }, 200);
})();
</script>
XLSX_EOF

  # Insert right before </body>
  perl -0777 -pe "
    BEGIN {
      open my \$fh, '<', '$XLSX_SCRIPT_TMP' or die;
      local \$/; \$r = <\$fh>; close \$fh;
    }
    s|</body>|\$r\n</body>|s;
  " "$WORK" > "${WORK}.new"
  mv "${WORK}.new" "$WORK"
  rm -f "$XLSX_SCRIPT_TMP"
  echo "  ✓ FlockOS-CRM.xlsx embedded & auto-loads on startup"
fi

# ── Update page title ─────────────────────────────────────────────────
sed -i '' 's|<title>.*</title>|<title>FlockOS — Portable</title>|' "$WORK"

# ── Write final output ────────────────────────────────────────────────
cp "$WORK" "$OUT"
rm -f "$WORK"

# ── Stats ─────────────────────────────────────────────────────────────
LINES=$(wc -l < "$OUT" | tr -d '\n ')
SIZE_K=$(du -k "$OUT" | cut -f1)
SIZE_M=$(echo "scale=1; $SIZE_K / 1024" | bc)

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✓ FlockOS.html — ${LINES} lines, ${SIZE_M}MB"
echo "    $OUT"
echo ""
echo "  Everything inlined — ZERO internet required:"
echo "    • 11 app scripts"
echo "    • Firebase SDK (app + firestore + auth)"
echo "    • SheetJS spreadsheet library"
echo "    • 9 Google Font files (Noto Sans/Hebrew/Serif)"
if [ "$HAS_XLSX" = true ]; then
echo "    • FlockOS-CRM.xlsx (auto-loads on startup)"
fi
echo "    • Logo + auth bypass"
echo ""
echo "  How to use:"
echo "    1. Share FlockOS.html via Google Drive / AirDrop / email"
echo "    2. Open it in any browser (Chrome, Safari, Edge)"
echo "    3. The app launches with your church data pre-loaded"
echo "    4. Works completely offline — no server needed"
echo "═══════════════════════════════════════════════════════════"
