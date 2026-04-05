#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
#  FlockOS — Unified .gs Deployment File
#  Single.gs contains all backend code. Paste into GAS editor as Code.gs.
#
#  As of 2025, the unified FlockOS API lives in
#  Database/Single.gs (~24,965 lines). The *_Combined.gs files are kept
#  as legacy references only.
#
#  Primary file:
#    Database/Single.gs  →  Unified FlockOS API (all domains)
#
#  Legacy (reference only):
#    Database/Matthew_Combined.gs, Mark_Combined.gs,
#    Database/Luke_Combined.gs, John_Combined.gs
#
#  Deployment:
#    Open the GAS project → paste Single.gs as Code.gs → Save → Deploy
# ═══════════════════════════════════════════════════════════════════════════

set -e
DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  FlockOS Unified Backend"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Primary deployment file
f="$DIR"/Database/Single.gs
if [ -f "$f" ]; then
  lines=$(wc -l < "$f")
  size=$(du -h "$f" | cut -f1)
  echo "  ★ Single.gs:  $lines lines  ($size)  [DEPLOY THIS]"
fi

echo ""
echo "  Legacy combined files (reference only):"
for f in "$DIR"/Database/*_Combined.gs; do
  if [ -f "$f" ]; then
    lines=$(wc -l < "$f")
    size=$(du -h "$f" | cut -f1)
    rel="${f#$DIR/}"
    echo "    $rel:  $lines lines  ($size)"
  fi
done
echo ""
echo "  Deployment: Copy Single.gs → paste as Code.gs in the GAS project"
echo "═══════════════════════════════════════════════════════════════"
