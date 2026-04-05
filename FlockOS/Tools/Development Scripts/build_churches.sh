#!/usr/bin/env bash
# ======================================================================
# FlockOS — Multi-Church Build Script
# Reads each JSON config in Active Deployments/ and produces a
# fully-branded deployment under Church/<shortName>/
#
# Output:
#   Church/FlockOS/  → https://flock-os.github.io/FlockOS/Church/FlockOS/
#   Church/TBC/      → https://flock-os.github.io/FlockOS/Church/TBC/
#   Church/Test/     → https://flock-os.github.io/FlockOS/Church/Test/
# ======================================================================
set -euo pipefail

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
          adminEmail: .adminEmail, analyticsId: .analyticsId, version: .version
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

# ── Clean previous Church builds ─────────────────────────────────────
rm -rf "$CHURCH_DIR"
mkdir -p "$CHURCH_DIR"

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

  OUT="$CHURCH_DIR/$CHURCH_SHORT"
  echo "  → $CHURCH_SHORT ($CHURCH_NAME)"

  mkdir -p "$OUT"

  # 1. Copy FlockOS/ source tree (exclude dev-only files)
  rsync -a \
    --exclude='*.md' --exclude='*.gs' --exclude='*.bak' --exclude='*.txt' \
    --exclude='Tools/' \
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
  MANIFEST_FAVICON="${CHURCH_FAVICON:-Favicon.png}"
  jq --arg n "$CHURCH_NAME" --arg s "$CHURCH_SHORT" --arg t "$CHURCH_TAGLINE" \
     --arg f "$MANIFEST_FAVICON" --arg tc "$CHURCH_THEME" --arg bg "$CHURCH_BG" \
     '.name=$n | .short_name=$s | .description=$t | .background_color=$bg | .theme_color=$tc |
      (.icons[].src) |= sub("Favicon\\.png";$f) |
      (.shortcuts[].icons[].src) |= sub("Favicon\\.png";$f)' \
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

  # 3b-ii. Photos URL injection (replace empty PHOTOS_URL constant)
  if [ -n "$CHURCH_PHOTOS_URL" ]; then
    ESC_PHOTOS_URL=$(printf '%s\n' "$CHURCH_PHOTOS_URL" | sed 's/[&/\\]/\\&/g')
    find "$OUT" -name '*.html' -type f | while read -r file; do
      sed -i '' "s|const PHOTOS_URL = '';|const PHOTOS_URL = '${ESC_PHOTOS_URL}';|g" "$file"
    done
  fi

  # 3b-iii. Favicon replacement
  if [ -n "$CHURCH_FAVICON" ]; then
    find "$OUT" \( -name '*.html' -o -name '*.js' \) -type f | while read -r file; do
      sed -i '' \
        -e "s|Favicon\.png|${ESC_FAVICON}|g" \
        "$file"
    done
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

  # 3e. Wall page — header and lockdown banner
  WALL_FILE="$OUT/FlockOS/Pages/the_wall.html"
  if [ -f "$WALL_FILE" ]; then
    sed -i '' \
      -e "s|<h1>FlockOS</h1>|<h1>${ESC_NAME}</h1>|g" \
      -e "s|FlockOS is in maintenance mode|${ESC_NAME} is in maintenance mode|g" \
      -e "s|FlockOS v1.00|${ESC_NAME} v${CHURCH_VERSION:-1.3}|g" \
      "$WALL_FILE"
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
