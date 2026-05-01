#!/usr/bin/env bash
# ======================================================================
# B-Build_Nations.sh — Build New_Covenant for each Nation
#
# Source of truth:  New_Covenant/
# Output:           Nations/<church>/   (repo root)
#
# Per-church patches applied to each copy:
#   • Scripts/the_true_vine.js  → church GAS API endpoints
#   • the_living_water.js (SW)  → unique CACHE_NAME
#   • manifest.json             → church name / branding
#   • index.html                → <title>, window.FLOCK_FIREBASE_CONFIG
#
# Config data read from:  Covenant/Scrolls/ChurchRegistry/<church>.json
#
# Usage:
#   bash Covenant/Bezalel/Scripts/B-Build_Nations.sh
#   bash Covenant/Bezalel/Scripts/B-Build_Nations.sh --dry-run
# ======================================================================
set -euo pipefail

# ── Flag parsing ─────────────────────────────────────────────────────
DRY_RUN=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
  esac
done
$DRY_RUN && echo "🏗  DRY RUN — no files will be written" && echo ""

# ── Paths ─────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# Script lives at Covenant/Bezalel/Scripts/ → workspace root is 3 levels up
WORKSPACE="$(cd "$SCRIPT_DIR/../../.." && pwd)"
NEW_COVENANT="$WORKSPACE/New_Covenant"
NATIONS_DIR="$WORKSPACE/Nations"
CONFIGS_DIR="$WORKSPACE/Covenant/Scrolls/ChurchRegistry"

# ── Dependency check ──────────────────────────────────────────────────
if ! command -v jq &>/dev/null; then
  echo "ERROR: jq is required. Install with: brew install jq"; exit 1
fi
if ! command -v python3 &>/dev/null; then
  echo "ERROR: python3 is required."; exit 1
fi

# ── Church definitions ────────────────────────────────────────────────
# FORMAT:  "FolderName|ConfigFile|CACHE_NAME"
CHURCHES=(
  "Root|FlockOS-Root.json|flockos-root-v1.01"
  "FlockOS|FlockOS-Root.json|flockos-v1.01"
  "TBC|Trinity.json|flockos-tbc-v1.01"
  "TheForest|TheForest.json|flockos-theforest-v1.01"
)

# ── Pre-flight ────────────────────────────────────────────────────────
echo "Running pre-flight checks…"
PREFLIGHT_OK=true

[ -d "$NEW_COVENANT" ] || { echo "  ✗ MISSING: New_Covenant/"; PREFLIGHT_OK=false; }
[ -f "$NEW_COVENANT/index.html" ] || { echo "  ✗ MISSING: New_Covenant/index.html"; PREFLIGHT_OK=false; }
[ -f "$NEW_COVENANT/the_living_water.js" ] || { echo "  ✗ MISSING: New_Covenant/the_living_water.js"; PREFLIGHT_OK=false; }
[ -f "$NEW_COVENANT/Scripts/the_true_vine.js" ] || { echo "  ✗ MISSING: New_Covenant/Scripts/the_true_vine.js"; PREFLIGHT_OK=false; }

for entry in "${CHURCHES[@]}"; do
  IFS='|' read -r FOLDER CONFIG CACHE <<< "$entry"
  CFG="$CONFIGS_DIR/$CONFIG"
  [ -f "$CFG" ] || { echo "  ✗ MISSING config: $CFG"; PREFLIGHT_OK=false; }
done

$PREFLIGHT_OK || { echo ""; echo "Pre-flight FAILED."; exit 1; }
echo "  ✓ All checks passed"
echo ""

# ── Build each Nation ─────────────────────────────────────────────────
mkdir -p "$NATIONS_DIR"

for entry in "${CHURCHES[@]}"; do
  IFS='|' read -r FOLDER CONFIG CACHE_NAME <<< "$entry"

  CFG="$CONFIGS_DIR/$CONFIG"
  TARGET="$NATIONS_DIR/$FOLDER"

  echo "═══ Building  Nations/$FOLDER  ←  $CONFIG ═══"

  # Read config values
  DB_URL=$(jq -r '.databaseUrl' "$CFG")
  CHURCH_NAME=$(jq -r '.name' "$CFG")
  SHORT_NAME=$(jq -r '.shortName' "$CFG")
  THEME_COLOR=$(jq -r '.themeColor // "#e8a838"' "$CFG")
  BG_COLOR=$(jq -r '.backgroundColor // "#0c1445"' "$CFG")

  if $DRY_RUN; then
    echo "  [dry] rsync New_Covenant → Nations/$FOLDER"
    echo "  [dry] GAS URL: $DB_URL"
    echo "  [dry] CACHE_NAME: $CACHE_NAME"
    echo "  [dry] Church: $CHURCH_NAME"
    echo ""
    continue
  fi

  # ── 1. rsync New_Covenant → Nations/<Folder> ──────────────────────
  rsync -a --delete \
    --exclude='.DS_Store' \
    --exclude='Google Sites Embeds/' \
    "$NEW_COVENANT/" "$TARGET/"
  echo "  ✓ rsync complete"

  # ── 2. Patch Scripts/the_true_vine.js — all 4 GAS endpoints ───────
  export _NC_DB_URL="$DB_URL"
  export _NC_TARGET="$TARGET"
  python3 << 'PYEOF'
import os, re

target  = os.environ['_NC_TARGET']
new_url = os.environ['_NC_DB_URL']
vine    = target + '/Scripts/the_true_vine.js'

with open(vine, 'r') as f:
    content = f.read()

# Replace every GAS script.google.com exec URL in the endpoint arrays
content = re.sub(
    r"'https://script\.google\.com/macros/s/[^']+/exec'",
    f"'{new_url}'",
    content
)

with open(vine, 'w') as f:
    f.write(content)
print('  ✓ the_true_vine.js GAS endpoints patched')
PYEOF

  # ── 3. Patch the_living_water.js — CACHE_NAME ─────────────────────
  sed -i '' "s|const CACHE_NAME = '[^']*'|const CACHE_NAME = '$CACHE_NAME'|" \
    "$TARGET/the_living_water.js"
  echo "  ✓ the_living_water.js CACHE_NAME → $CACHE_NAME"

  # ── 4. Patch manifest.json — name / branding ──────────────────────
  export _NC_CHURCH_NAME="$CHURCH_NAME"
  export _NC_SHORT_NAME="$SHORT_NAME"
  export _NC_THEME_COLOR="$THEME_COLOR"
  export _NC_BG_COLOR="$BG_COLOR"
  python3 << 'PYEOF'
import os, json

t = os.environ['_NC_TARGET']
path = t + '/manifest.json'

with open(path, 'r') as f:
    m = json.load(f)

m['name']             = os.environ['_NC_CHURCH_NAME']
m['short_name']       = os.environ['_NC_SHORT_NAME']
m['theme_color']      = os.environ['_NC_THEME_COLOR']
m['background_color'] = os.environ['_NC_BG_COLOR']

with open(path, 'w') as f:
    json.dump(m, f, indent=2)
    f.write('\n')
print('  ✓ manifest.json patched')
PYEOF

  # ── 5. Patch index.html — <title>, apple title, Firebase config ────
  FB_CONFIG_JSON=$(jq -r '.firebaseConfig // "null"' "$CFG")
  export _NC_FB_CONFIG="$FB_CONFIG_JSON"
  python3 << 'PYEOF'
import os, json, re

t          = os.environ['_NC_TARGET']
name       = os.environ['_NC_CHURCH_NAME']
fb_raw     = os.environ['_NC_FB_CONFIG']
path       = t + '/index.html'

with open(path, 'r') as f:
    content = f.read()

# Patch <title>
content = re.sub(r'<title>[^<]*</title>', f'<title>{name}</title>', content)

# Patch apple-mobile-web-app-title
content = re.sub(
    r'(<meta name="apple-mobile-web-app-title" content=")[^"]*(")',
    rf'\g<1>{name}\g<2>',
    content
)

# Patch window.FLOCK_FIREBASE_CONFIG — only when church has its own config
try:
    fb_obj = json.loads(fb_raw)
    if isinstance(fb_obj, dict) and 'projectId' in fb_obj:
        # Build JS object literal from JSON
        lines = ['    window.FLOCK_FIREBASE_CONFIG = {']
        for k, v in fb_obj.items():
            lines.append(f"      {k}:  '{v}',")
        lines.append('    };')
        new_block = '\n'.join(lines)
        content = re.sub(
            r'window\.FLOCK_FIREBASE_CONFIG\s*=\s*\{[^}]+\};',
            new_block,
            content,
            flags=re.DOTALL
        )
        print('  ✓ index.html Firebase config replaced with church config')
    else:
        print('  ✓ index.html Firebase config kept as default (shared)')
except Exception:
    print('  ✓ index.html Firebase config kept as default (shared)')

with open(path, 'w') as f:
    f.write(content)
print(f'  ✓ index.html title → {name}')
PYEOF

  echo "  ✓ Nations/$FOLDER complete"
  echo ""
done

echo "══════════════════════════════════════════════"
echo "Nations build complete:"
for entry in "${CHURCHES[@]}"; do
  IFS='|' read -r FOLDER CONFIG CACHE <<< "$entry"
  echo "  Nations/$FOLDER/"
done
echo ""
echo "Next: commit + push to deploy via GitHub Pages / Firebase."
