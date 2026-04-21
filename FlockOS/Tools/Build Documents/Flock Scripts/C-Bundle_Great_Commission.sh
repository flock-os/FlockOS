#!/usr/bin/env bash
# ======================================================================
# Bundle the_great_commission.html into a single self-contained file.
# Inlines all local JS scripts; keeps Firebase CDN links (required).
# Output: FlockOS/Tools/Master Deployment/TheGreatCommission.html
# ======================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
SRC="$REPO_ROOT/FlockOS/Pages/the_great_commission.html"
SCRIPTS_DIR="$REPO_ROOT/FlockOS/Scripts"
OUT_DIR="$REPO_ROOT/FlockOS/Tools/Master Deployment"
OUT="$OUT_DIR/TheGreatCommission.html"

mkdir -p "$OUT_DIR"

# Scripts to inline (in load order)
LOCALS=(
  the_upper_room.js
  fine_linen.js
  the_true_vine.js
  the_wellspring.js
  the_well.js
  firm_foundation.js
)

echo "Bundling the_great_commission.html …"

# Verify all scripts exist
for js in "${LOCALS[@]}"; do
  if [ ! -f "$SCRIPTS_DIR/$js" ]; then
    echo "  ✗ MISSING: $SCRIPTS_DIR/$js"
    exit 1
  fi
done

# Start with a working copy
WORK=$(mktemp)
cp "$SRC" "$WORK"

# Remove favicon / manifest / apple-touch-icon lines (won't resolve standalone)
sed -i '' '/<link rel="icon"/d'            "$WORK"
sed -i '' '/<link rel="apple-touch-icon"/d' "$WORK"
sed -i '' '/<link rel="manifest"/d'         "$WORK"

# For each local script, replace the <script defer src="..."> tag with inline content
for js in "${LOCALS[@]}"; do
  JS_FILE="$SCRIPTS_DIR/$js"

  # Build inline block in a temp file
  INLINE_TMP=$(mktemp)
  printf '<script>/* ═══ %s (inlined) ═══ */\n' "$js" > "$INLINE_TMP"
  cat "$JS_FILE" >> "$INLINE_TMP"
  printf '\n</script>' >> "$INLINE_TMP"

  # Use perl to replace the script tag with inline content
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

# Write final output
cp "$WORK" "$OUT"
rm -f "$WORK"

# Stats
LINES=$(wc -l < "$OUT" | tr -d ' ')
SIZE=$(du -h "$OUT" | cut -f1)
echo "  ✓ Bundled → $OUT"
echo "    ${LINES} lines, ${SIZE}"
echo ""
echo "Share this single file via Google Drive — recipients just open it in a browser."
echo "Requires internet only for Firebase CDN + Google Fonts."
