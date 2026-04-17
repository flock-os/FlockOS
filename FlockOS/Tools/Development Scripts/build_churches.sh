#!/usr/bin/env bash
# ======================================================================
# FlockOS — Multi-Church Build Script
# Reads each JSON config in Active Deployments/ and produces a
# fully-branded deployment under Church/<shortName>/
#
# Output:
#   Church/FlockOS/   → https://flock-os.github.io/FlockOS/Church/FlockOS/
#   Church/GAS/       → https://flock-os.github.io/FlockOS/Church/GAS/
#   Church/TBC/       → https://flock-os.github.io/FlockOS/Church/TBC/
#   Church/TheForest/ → https://flock-os.github.io/FlockOS/Church/TheForest/
# Note: GAS/TBC/TheForest configs are fetched from the master API (master-api.json).
# ======================================================================
set -euo pipefail

# ── Flag parsing ─────────────────────────────────────────────────────
DRY_RUN=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
  esac
done
if $DRY_RUN; then echo "🏗  DRY RUN — no files will be written"; echo ""; fi

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
CONFIGS_DIR="$REPO_ROOT/FlockOS/Tools/Active Deployments"
CHURCH_DIR="$REPO_ROOT/Church"
SOURCE_DIR="$REPO_ROOT/FlockOS"
ROOT_INDEX="$REPO_ROOT/index.html"
ROOT_MANIFEST="$REPO_ROOT/manifest.json"
ROOT_SW="$REPO_ROOT/the_living_water.js"

# ── Default values (hardcoded in source for GitHub Pages root) ────────
DEFAULT_CONFIG="$CONFIGS_DIR/flockos-default.json"
DEF_NAME=$(jq -r '.name' "$DEFAULT_CONFIG")
DEF_TAGLINE=$(jq -r '.tagline' "$DEFAULT_CONFIG")
DEF_FAVICON=$(jq -r '.favicon' "$DEFAULT_CONFIG")
DEF_PORTRAIT=$(jq -r '.portrait' "$DEFAULT_CONFIG")
DEF_THEME=$(jq -r '.themeColor' "$DEFAULT_CONFIG")
DEF_BG=$(jq -r '.backgroundColor' "$DEFAULT_CONFIG")
DEF_DB_URL=$(jq -r '.databaseUrl' "$DEFAULT_CONFIG")

# ── Dependency check ──────────────────────────────────────────────────
if ! command -v jq &>/dev/null; then
  echo "ERROR: jq is required. Install with: brew install jq"
  exit 1
fi

# ── Pre-flight validation ─────────────────────────────────────────────
echo "Running pre-flight checks…"
PREFLIGHT_OK=true

# Check critical source files exist
CRITICAL_FILES=(
  "$SOURCE_DIR/Pages/the_good_shepherd.html"
  "$SOURCE_DIR/Pages/index.html"
  "$SOURCE_DIR/Scripts/the_tabernacle.js"
  "$SOURCE_DIR/Scripts/the_true_vine.js"
  "$SOURCE_DIR/Scripts/the_living_water.js"
  "$SOURCE_DIR/Scripts/the_upper_room.js"
  "$SOURCE_DIR/Scripts/the_life.js"
  "$ROOT_INDEX"
  "$ROOT_MANIFEST"
  "$ROOT_SW"
)
for f in "${CRITICAL_FILES[@]}"; do
  if [ ! -f "$f" ]; then
    echo "  ✗ MISSING: $f"
    PREFLIGHT_OK=false
  fi
done

# Validate JSON configs
for jf in "$CONFIGS_DIR"/*.json; do
  [[ "$(basename "$jf")" == "ChurchTemplate.json" ]] && continue
  [[ "$(basename "$jf")" == "master-api.json" ]] && continue
  if ! jq empty "$jf" 2>/dev/null; then
    echo "  ✗ INVALID JSON: $(basename "$jf")"
    PREFLIGHT_OK=false
  else
    # Check required fields
    _sn=$(jq -r '.shortName // empty' "$jf")
    _db=$(jq -r '.databaseUrl // empty' "$jf")
    if [ -z "$_sn" ]; then
      echo "  ✗ Missing shortName in $(basename "$jf")"
      PREFLIGHT_OK=false
    fi
    if [ -z "$_db" ]; then
      echo "  ✗ Missing databaseUrl in $(basename "$jf")"
      PREFLIGHT_OK=false
    fi
  fi
done

# Validate root manifest.json
if ! jq empty "$ROOT_MANIFEST" 2>/dev/null; then
  echo "  ✗ INVALID JSON: manifest.json"
  PREFLIGHT_OK=false
fi

if ! $PREFLIGHT_OK; then
  echo ""
  echo "Pre-flight FAILED. Fix errors above before building."
  exit 1
fi
echo "  ✓ All pre-flight checks passed"
echo ""

# ── Optional: fetch church configs from the master FlockOS API ─────────────
# Create Active\ Deployments/master-api.json with { "apiUrl": "...", "apiToken": "..." }
# to build church deployments from the Church Registry instead of local JSON files.
MASTER_API_FILE="$CONFIGS_DIR/master-api.json"
BUILD_CONFIGS_DIR="$CONFIGS_DIR"  # default: use local JSON files

if [ -f "$MASTER_API_FILE" ]; then
  _API_URL=$(jq -r '.apiUrl // empty' "$MASTER_API_FILE")
  if [ -n "$_API_URL" ]; then
    echo "Fetching church configs from master API…"
    _RESPONSE=$(curl -sfL "${_API_URL}?action=church.configs" 2>/dev/null || echo '')
    if echo "$_RESPONSE" | jq -e '.ok == true and (.configs | length) > 0' &>/dev/null; then
      _TMP_DIR=$(mktemp -d)
      while IFS= read -r _cfg; do
        _SHORT=$(echo "$_cfg" | jq -r '.shortName')
        [ -z "$_SHORT" ] && continue
        echo "$_cfg" | jq '{
          id: .id, name: .name, shortName: .shortName, brandName: .brandName,
          tagline: .tagline, favicon: .favicon, portrait: .portrait,
          themeColor: .themeColor, backgroundColor: .backgroundColor,
          databaseUrl: .databaseUrl, photosUrl: .photosUrl,
          adminEmail: .adminEmail, analyticsId: .analyticsId,
          firebaseConfig: .firebaseConfig, version: .version
        }' > "$_TMP_DIR/flockos-${_SHORT}.json"
      done < <(echo "$_RESPONSE" | jq -c '.configs[]')
      _FETCHED=$(find "$_TMP_DIR" -name '*.json' | wc -l | tr -d ' ')
      echo "  → $_FETCHED config(s) fetched from API"
      BUILD_CONFIGS_DIR="$_TMP_DIR"
    else
      echo "Warning: API returned no active configs. Falling back to local JSON files."
    fi
  fi
fi

# ── Ensure Church output directory exists (do NOT wipe — preserves church-specific images) ─
mkdir -p "$CHURCH_DIR"

# ── Regenerate bezalel_codex.js from master Code.gs ────────────────────────
# This file embeds the full Code.gs content as a JS variable so bezalel.html
# and bezalel_matrix.html can offer a one-click Copy for Code.gs as well.
MASTER_CODE="$REPO_ROOT/FlockOS/Tools/Master Deployment/8-Master Code.md"
CODEX_OUT="$SOURCE_DIR/Pages/bezalel_codex.js"
if [ -f "$MASTER_CODE" ] && command -v python3 &>/dev/null; then
  python3 -c "
import json, sys
with open(sys.argv[1], 'r') as f:
    content = f.read()
lines = len(content.splitlines())
out  = '// AUTO-GENERATED by build_churches.sh — do not edit manually.\n'
out += '// Source: FlockOS/Tools/Master Deployment/10-Master Code.md\n'
out += '// Lines: ' + str(lines) + '\n'
out += 'window.BEZALEL_CODE_GS = ' + json.dumps(content) + ';\n'
out += 'window.BEZALEL_CODE_GS_LINES = ' + str(lines) + ';\n'
with open(sys.argv[2], 'w') as f:
    f.write(out)
print('  → bezalel_codex.js regenerated (' + str(lines) + ' lines)')
" "$MASTER_CODE" "$CODEX_OUT"
fi

# ── Regenerate bezalel_firestoresync_codex.js from FirestoreSync.md ──────────
FIRESTORESYNC_MD="$REPO_ROOT/FlockOS/Tools/Master Deployment/2-FirestoreSync.md"
FIRESTORESYNC_OUT="$SOURCE_DIR/Pages/bezalel_firestoresync_codex.js"
if [ -f "$FIRESTORESYNC_MD" ] && command -v python3 &>/dev/null; then
  python3 -c "
import json, sys
with open(sys.argv[1], 'r') as f:
    content = f.read()
lines = len(content.splitlines())
out  = '// AUTO-GENERATED by build_churches.sh — do not edit manually.\n'
out += '// Source: FlockOS/Tools/Master Deployment/4-FirestoreSync.md\n'
out += '// Lines: ' + str(lines) + '\n'
out += 'window.BEZALEL_FIRESTORESYNC_GS = ' + json.dumps(content) + ';\n'
out += 'window.BEZALEL_FIRESTORESYNC_GS_LINES = ' + str(lines) + ';\n'
with open(sys.argv[2], 'w') as f:
    f.write(out)
print('  → bezalel_firestoresync_codex.js regenerated (' + str(lines) + ' lines)')
" "$FIRESTORESYNC_MD" "$FIRESTORESYNC_OUT"
fi

# ── Regenerate bezalel_synchandler_codex.js from SyncHandlerGS.md ────────────
SYNCHANDLER_MD="$REPO_ROOT/FlockOS/Tools/Master Deployment/5-SyncHandlerGS.md"
SYNCHANDLER_OUT="$SOURCE_DIR/Pages/bezalel_synchandler_codex.js"
if [ -f "$SYNCHANDLER_MD" ] && command -v python3 &>/dev/null; then
  python3 -c "
import json, sys
with open(sys.argv[1], 'r') as f:
    content = f.read()
lines = len(content.splitlines())
out  = '// AUTO-GENERATED by build_churches.sh — do not edit manually.\n'
out += '// Source: FlockOS/Tools/Master Deployment/5-SyncHandlerGS.md\n'
out += '// Lines: ' + str(lines) + '\n'
out += 'window.BEZALEL_SYNCHANDLER_GS = ' + json.dumps(content) + ';\n'
out += 'window.BEZALEL_SYNCHANDLER_GS_LINES = ' + str(lines) + ';\n'
with open(sys.argv[2], 'w') as f:
    f.write(out)
print('  → bezalel_synchandler_codex.js regenerated (' + str(lines) + ' lines)')
" "$SYNCHANDLER_MD" "$SYNCHANDLER_OUT"
fi

# ── Count configs (excluding template and master-api) ───────────────────────
CONFIG_COUNT=$(find "$BUILD_CONFIGS_DIR" -maxdepth 1 -name '*.json' ! -name 'ChurchTemplate.json' ! -name 'master-api.json' | wc -l | tr -d ' ')
if [ "$CONFIG_COUNT" -eq 0 ]; then
  echo "No church configs found in $BUILD_CONFIGS_DIR"
  exit 1
fi
echo "Building $CONFIG_COUNT church deployment(s)…"
echo ""

# ── Build each church ───────────────────────────────────────────────────
for config in "$BUILD_CONFIGS_DIR"/*.json; do
  # Skip template and API auth files
  [[ "$(basename "$config")" == "ChurchTemplate.json" ]] && continue
  [[ "$(basename "$config")" == "master-api.json" ]] && continue

  CHURCH_NAME=$(jq -r '.name' "$config")
  CHURCH_SHORT=$(jq -r '.shortName' "$config")
  CHURCH_ID=$(jq -r '.id // empty' "$config")
  CHURCH_BRAND=$(jq -r '.brandName // .name' "$config")
  CHURCH_TAGLINE=$(jq -r '.tagline' "$config")
  CHURCH_FAVICON=$(jq -r '.favicon // empty' "$config")
  CHURCH_PORTRAIT=$(jq -r '.portrait // empty' "$config")
  CHURCH_THEME=$(jq -r '.themeColor' "$config")
  CHURCH_BG=$(jq -r '.backgroundColor' "$config")
  CHURCH_DB_URL=$(jq -r '.databaseUrl' "$config")
  CHURCH_PHOTOS_URL=$(jq -r '.photosUrl // empty' "$config")
  CHURCH_VERSION=$(jq -r '.version // "1.0"' "$config")
  CHURCH_ANALYTICS=$(jq -r '.analyticsId // empty' "$config")
  CHURCH_FB_CONFIG=$(jq -r '.firebaseConfig // empty' "$config")

  OUT="$CHURCH_DIR/$CHURCH_SHORT"
  echo "  → $CHURCH_SHORT ($CHURCH_NAME)"

  if $DRY_RUN; then
    echo "    [dry-run] Would build → Church/$CHURCH_SHORT/"
    echo "    [dry-run]   DB URL: $CHURCH_DB_URL"
    echo "    [dry-run]   Theme: $CHURCH_THEME | BG: $CHURCH_BG"
    [ -n "$CHURCH_FB_CONFIG" ] && echo "    [dry-run]   Firebase: custom config"
    echo ""
    continue
  fi

  mkdir -p "$OUT"

  # 1. Copy FlockOS/ source tree (exclude dev-only files)
  rsync -a \
    --exclude='*.md' --exclude='*.gs' --exclude='*.bak' --exclude='*.txt' \
    --exclude='Tools/' \
    --exclude='Pages/bezalel_matrix_local.html' \
    "$SOURCE_DIR/" "$OUT/FlockOS/"

  # 2. Copy root-level files
  cp "$ROOT_INDEX"    "$OUT/index.html"
  cp "$ROOT_MANIFEST" "$OUT/manifest.json"
  cp "$ROOT_SW"       "$OUT/the_living_water.js"

  # 3. Brand with church-specific values

  # Escape values for sed
  ESC_NAME=$(printf '%s\n' "$CHURCH_NAME" | sed 's/[&/\\]/\\&/g')
  ESC_BRAND=$(printf '%s\n' "$CHURCH_BRAND" | sed 's/[&#\\]/\\&/g')
  ESC_TAGLINE=$(printf '%s\n' "$CHURCH_TAGLINE" | sed 's/[&/\\]/\\&/g')
  ESC_FAVICON=$(printf '%s\n' "$CHURCH_FAVICON" | sed 's/[&/\\]/\\&/g')
  ESC_PORTRAIT=$(printf '%s\n' "$CHURCH_PORTRAIT" | sed 's/[&/\\]/\\&/g')
  ESC_THEME=$(printf '%s\n' "$CHURCH_THEME" | sed 's/[&/\\]/\\&/g')
  ESC_BG=$(printf '%s\n' "$CHURCH_BG" | sed 's/[&/\\]/\\&/g')
  ESC_DB_URL=$(printf '%s\n' "$CHURCH_DB_URL" | sed 's/[&/\\]/\\&/g')
  ESC_DEF_DB_URL=$(printf '%s\n' "$DEF_DB_URL" | sed 's/[&/\\]/\\&/g')
  ESC_DEF_TAGLINE=$(printf '%s\n' "$DEF_TAGLINE" | sed 's/[&/\\]/\\&/g')
  ESC_DEF_FAVICON=$(printf '%s\n' "$DEF_FAVICON" | sed 's/[&/\\]/\\&/g')
  ESC_DEF_PORTRAIT=$(printf '%s\n' "$DEF_PORTRAIT" | sed 's/[&/\\]/\\&/g')
  ESC_DEF_THEME=$(printf '%s\n' "$DEF_THEME" | sed 's/[&/\\]/\\&/g')
  ESC_DEF_BG=$(printf '%s\n' "$DEF_BG" | sed 's/[&/\\]/\\&/g')
  ESC_DEF_NAME=$(printf '%s\n' "$DEF_NAME" | sed 's/[&/\\]/\\&/g')

  # 3a. manifest.json — precise JSON replacement
  MANIFEST_FAVICON="${CHURCH_FAVICON:-FlockOS_icon.png}"
  jq --arg n "$CHURCH_NAME" --arg s "$CHURCH_SHORT" --arg t "$CHURCH_TAGLINE" \
     --arg f "$MANIFEST_FAVICON" --arg tc "$CHURCH_THEME" --arg bg "$CHURCH_BG" \
     '.name=$n | .short_name=$s | .description=$t | .background_color=$bg | .theme_color=$tc |
      (.icons[].src) |= sub("FlockOS_icon\\.png";$f) |
      (.shortcuts[].icons[].src) |= sub("FlockOS_icon\\.png";$f)' \
     "$OUT/manifest.json" > "$OUT/manifest.json.tmp" && mv "$OUT/manifest.json.tmp" "$OUT/manifest.json"

  # 3b. HTML/JS — replace database URL, tagline, theme, background
  find "$OUT" \( -name '*.html' -o -name '*.js' \) -type f | while read -r file; do
    sed -i '' \
      -e "s|${ESC_DEF_DB_URL}|${ESC_DB_URL}|g" \
      -e "s|${ESC_DEF_TAGLINE}|${ESC_TAGLINE}|g" \
      -e "s|${ESC_DEF_THEME}|${ESC_THEME}|g" \
      -e "s|${ESC_DEF_BG}|${ESC_BG}|g" \
      "$file"
  done

  # 3b-iv. Google Analytics — inject church tag or strip root tag
  DEF_ANALYTICS="G-D7V88DPF3T"
  find "$OUT" -name '*.html' -type f | while read -r file; do
    if [ -n "$CHURCH_ANALYTICS" ]; then
      # Replace root tag ID with church-specific tag ID
      sed -i '' \
        -e "s|${DEF_ANALYTICS}|${CHURCH_ANALYTICS}|g" \
        "$file"
    else
      # Strip the entire Google tag block (3 lines: comment + script src + inline script block)
      python3 -c "
import re, sys
content = open(sys.argv[1]).read()
cleaned = re.sub(
  r'\s*<!-- Google tag \(gtag\.js\) -->\s*<script async src=\"https://www\.googletagmanager\.com/gtag/js\?id=[^\"]+\"></script>\s*<script>[\s\S]*?</script>',
  '',
  content
)
open(sys.argv[1], 'w').write(cleaned)
" "$file"
    fi
  done

  # 3b-i. Portrait / logo — replace splash screen img src in index.html + the_good_shepherd.html + pages index
  if [ -n "$CHURCH_PORTRAIT" ]; then
    sed -i '' \
      -e "s|id=\"church-hero-logo\" class=\"splash-bg\" src=\"FlockOS/Images/[^\"]*\"|id=\"church-hero-logo\" class=\"splash-bg\" src=\"FlockOS/Images/${ESC_PORTRAIT}\"|g" \
      "$OUT/index.html"
    GS_FILE="$OUT/FlockOS/Pages/the_good_shepherd.html"
    if [ -f "$GS_FILE" ]; then
      sed -i '' \
        -e "s|id=\"church-splash-logo\" class=\"splash-bg\" src=\"\.\./Images/[^\"]*\"|id=\"church-splash-logo\" class=\"splash-bg\" src=\"../Images/${ESC_PORTRAIT}\"|g" \
        "$GS_FILE"
    fi
    PAGES_INDEX="$OUT/FlockOS/Pages/index.html"
    if [ -f "$PAGES_INDEX" ]; then
      sed -i '' \
        -e "s|id=\"church-pages-logo\" class=\"splash-bg\" src=\"\.\./Images/[^\"]*\"|id=\"church-pages-logo\" class=\"splash-bg\" src=\"../Images/${ESC_PORTRAIT}\"|g" \
        "$PAGES_INDEX"
    fi
  fi

  # 3b-ii. Photos URL injection (replace empty PHOTOS_URL constant)
  if [ -n "$CHURCH_PHOTOS_URL" ]; then
    ESC_PHOTOS_URL=$(printf '%s\n' "$CHURCH_PHOTOS_URL" | sed 's/[&/\\]/\\&/g')
    find "$OUT" -name '*.html' -type f | while read -r file; do
      sed -i '' "s|const PHOTOS_URL = '';|const PHOTOS_URL = '${ESC_PHOTOS_URL}';|g" "$file"
    done
  fi

  # 3b-iii. Favicon replacement — all .png icon/logo references across HTML + JS
  if [ -n "$CHURCH_FAVICON" ]; then
    find "$OUT" \( -name '*.html' -o -name '*.js' \) -type f | while read -r file; do
      sed -i '' \
        -e "s|Favicon\.png|${ESC_FAVICON}|g" \
        -e "s|FlockOS_icon\.png|${ESC_FAVICON}|g" \
        -e "s|FlockOS_Camo\.png|${ESC_FAVICON}|g" \
        -e "s|rel=\"icon\" type=\"image/png\" href=\"FlockOS/Images/[^\"]*\"|rel=\"icon\" type=\"image/png\" href=\"FlockOS/Images/${ESC_FAVICON}\"|g" \
        -e "s|rel=\"apple-touch-icon\" href=\"FlockOS/Images/[^\"]*\"|rel=\"apple-touch-icon\" href=\"FlockOS/Images/${ESC_FAVICON}\"|g" \
        -e "s|rel=\"icon\" type=\"image/png\" href=\"\.\./Images/[^\"]*\"|rel=\"icon\" type=\"image/png\" href=\"../Images/${ESC_FAVICON}\"|g" \
        -e "s|rel=\"apple-touch-icon\" href=\"\.\./Images/[^\"]*\"|rel=\"apple-touch-icon\" href=\"../Images/${ESC_FAVICON}\"|g" \
        -e "s|property=\"og:image\" content=\"FlockOS/Images/[^\"]*\"|property=\"og:image\" content=\"FlockOS/Images/${ESC_FAVICON}\"|g" \
        -e "s|property=\"og:image\" content=\"\.\./Images/[^\"]*\"|property=\"og:image\" content=\"../Images/${ESC_FAVICON}\"|g" \
        "$file"
    done
  fi

  # 3b-v. Firebase project override (per-church Firebase config)
  if [ -n "$CHURCH_FB_CONFIG" ] && echo "$CHURCH_FB_CONFIG" | jq -e '.apiKey' &>/dev/null; then
    FB_JSON=$(echo "$CHURCH_FB_CONFIG" | jq -c '.')
    # Inject window.FLOCK_FIREBASE_CONFIG and window.FLOCK_CHURCH_ID into the_upper_room.js
    UR_FILE="$OUT/FlockOS/Scripts/the_upper_room.js"
    if [ -f "$UR_FILE" ]; then
      TMPF=$(mktemp)
      echo "window.FLOCK_FIREBASE_CONFIG = ${FB_JSON};" > "$TMPF"
      if [ -n "$CHURCH_ID" ]; then
        echo "window.FLOCK_CHURCH_ID = \"${CHURCH_ID}\";" >> "$TMPF"
      fi
      cat "$UR_FILE" >> "$TMPF"
      mv "$TMPF" "$UR_FILE"
    fi
  fi

  # 3b-vi. Truth Editor — church deployments edit their OWN Firestore, not flockos-truth
  GS_FILE_TRUTH="$OUT/FlockOS/Pages/the_good_shepherd.html"
  if [ -f "$GS_FILE_TRUTH" ]; then
    sed -i '' 's|<script defer src="../Scripts/the_truth.js"></script>|<script>window.FLOCK_TRUTH_USE_LOCAL = true;</script>\n<script defer src="../Scripts/the_truth.js"></script>|' "$GS_FILE_TRUTH"
  fi

  # 3c. Title/meta replacement — ALL HTML files
  find "$OUT" -name '*.html' -type f | while read -r file; do
    sed -i '' \
      -e "s|<title>${ESC_DEF_NAME}</title>|<title>${ESC_NAME}</title>|g" \
      -e "s|<title>${ESC_DEF_NAME} — Admin</title>|<title>${ESC_NAME} — Admin</title>|g" \
      -e "s|<title>${ESC_DEF_NAME} — The Wall</title>|<title>${ESC_NAME} — The Wall</title>|g" \
      -e "s|og:title\" content=\"${ESC_DEF_NAME}\"|og:title\" content=\"${ESC_NAME}\"|g" \
      "$file"
  done

  # 3d. Brand name replacement — topbar, offline page, lockdown, wall header
  find "$OUT" \( -name '*.html' -o -name '*.js' \) -type f | while read -r file; do
    sed -i '' \
      -e "s#>FlockOS <span>Admin</span>#>${ESC_BRAND} <span>Admin</span>#g" \
      -e "s#title=\"Home\">FlockOS</div>#title=\"Home\">${ESC_BRAND}</div>#g" \
      -e "s#<title>FlockOS — Offline</title>#<title>${ESC_NAME} — Offline</title>#g" \
      -e "s#FlockOS can't reach the server#${ESC_NAME} can't reach the server#g" \
      -e "s#next version of FlockOS#next version of ${ESC_NAME}#g" \
      -e "s#access FlockOS here#access ${ESC_NAME} here#g" \
      -e "s#alt=\"FlockOS\"#alt=\"${ESC_NAME}\"#g" \
      "$file"
  done

  # 3e. Wall page — header, lockdown banner, and logo
  WALL_FILE="$OUT/FlockOS/Pages/the_wall.html"
  if [ -f "$WALL_FILE" ]; then
    sed -i '' \
      -e "s|<h1[^>]*>FlockOS</h1>|<h1 class=\"wall-title\">${ESC_NAME}</h1>|g" \
      -e "s|FlockOS is in maintenance mode|${ESC_NAME} is in maintenance mode|g" \
      -e "s|FlockOS v1.00|${ESC_NAME} v${CHURCH_VERSION:-1.3}|g" \
      "$WALL_FILE"
    if [ -n "$CHURCH_PORTRAIT" ]; then
      sed -i '' \
        -e "s|id=\"wall-logo\" class=\"wall-logo\" src=\"\.\./Images/[^\"]*\"|id=\"wall-logo\" class=\"wall-logo\" src=\"../Images/${ESC_PORTRAIT}\"|g" \
        "$WALL_FILE"
    fi
  fi

  # 3f. Deployment Guide (the_pentecost.html) — inject church-specific DATABASE_URL
  PENTECOST_FILE="$OUT/FlockOS/Pages/the_pentecost.html"
  if [ -f "$PENTECOST_FILE" ]; then
    sed -i '' \
      -e "s|\[YOUR_DATABASE_URL\]|${ESC_DB_URL}|g" \
      -e "s|\[DATABASE_URL\]|${ESC_DB_URL}|g" \
      -e "s|FlockOS &mdash; Deployment &amp; Project Guide|${ESC_NAME} \&mdash; Deployment \&amp; Project Guide|g" \
      -e "s|<title>FlockOS — Deployment &amp; Project Guide</title>|<title>${ESC_NAME} — Deployment \\&amp; Project Guide</title>|g" \
      "$PENTECOST_FILE"
  fi

  # 3g. Value Proposition (fishing-for-men.html) — brand with church name
  FISHING_FILE="$OUT/FlockOS/Pages/fishing-for-men.html"
  if [ -f "$FISHING_FILE" ]; then
    sed -i '' \
      -e "s|FlockOS — Value Proposition|${ESC_NAME} — Value Proposition|g" \
      -e "s|<title>FlockOS — Value Proposition</title>|<title>${ESC_NAME} — Value Proposition</title>|g" \
      -e "s|FlockOS is a full-featured|${ESC_NAME} runs on FlockOS, a full-featured|g" \
      -e "s|FlockOS delivers|${ESC_NAME} delivers|g" \
      -e "s|FlockOS covers|${ESC_NAME} covers|g" \
      -e "s|FlockOS &mdash; Fishing for Men|${ESC_NAME} \&mdash; Value Proposition|g" \
      "$FISHING_FILE"
  fi

  # 3h. About / The Why (About_FlockOS.html) — copied as-is, no branding
  # (This page is the same across all deployments.)

  echo "    → Church/$CHURCH_SHORT/"
  echo ""
done

echo "======================================================================"
echo "  $CONFIG_COUNT deployment(s) built → Church/"
echo ""
ls -1 "$CHURCH_DIR" | while read -r d; do
  echo "    Church/$d/  →  https://flock-os.github.io/FlockOS/Church/$d/"
done
echo ""
echo "======================================================================"
