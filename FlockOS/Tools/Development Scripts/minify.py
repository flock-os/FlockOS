#!/usr/bin/env python3
"""Minify all FlockOS JS and standalone HTML files."""
import os
import rjsmin
import minify_html

# Exodus/minify.py lives at FlockOS/Exodus/ — resolve paths relative to repo root
_REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
JS_SRC_DIR  = os.path.join(_REPO, 'FlockOS', 'Genesis')
JS_OUT_DIR  = os.path.join(_REPO, 'FlockOS', 'Acts')
HTML_SRC_DIR = os.path.join(_REPO, 'FlockOS', 'Genesis')
HTML_OUT_DIR = os.path.join(_REPO, 'FlockOS', 'Revelation')
SW_SRC_FILE  = os.path.join(_REPO, 'FlockOS', 'Genesis', 'the_living_water.js')
SW_OUT_FILE  = os.path.join(_REPO, 'm.the_living_water.js')

# All HTML pages → Genesis source → Revelation m.filename.html
HTML_SOURCES = [
    'fishing-for-men.html',
    'prayerful_action.html',
    'the_anatomy_of_worship.html',
    'the_call_to_forgive.html',
    'the_generations.html',
    'the_gift_drift.html',
    'the_good_shepherd.html',
    'the_invitation.html',
    'the_pentecost.html',
    'the_wall.html',
    'the_weavers_plan.html',
]

# Root HTML pages — source in Genesis, minified output at repo root
ROOT_HTML = [
    ('index.html',      'index.html'),
    ('Learn More.html',  'Learn More.html'),
]

total_before = 0
total_after = 0

# Files handled separately (SW and commission have dedicated output paths)
_JS_SKIP = {'the_living_water.js', 'the_commission.js'}

# Minify Genesis JS source files → Acts m.filename.js
for fname in sorted(os.listdir(JS_SRC_DIR)):
    if not fname.endswith('.js') or fname.startswith('m.') or fname in _JS_SKIP:
        continue
    src = os.path.join(JS_SRC_DIR, fname)
    dst = os.path.join(JS_OUT_DIR, 'm.' + fname)
    with open(src, 'r') as f:
        original = f.read()
    if not original.strip():
        print(f"  SKIP  {fname} (empty)")
        continue
    minified = rjsmin.jsmin(original)
    with open(dst, 'w') as f:
        f.write(minified)
    ob = len(original.encode('utf-8'))
    mb = len(minified.encode('utf-8'))
    total_before += ob
    total_after += mb
    pct = (1 - mb / ob) * 100 if ob else 0
    print(f"  {fname:30s}  {ob:>8,} → {mb:>8,}  ({pct:.0f}% smaller)")

# Minify service worker (Genesis → repo root)
with open(SW_SRC_FILE, 'r') as f:
    original = f.read()
minified = rjsmin.jsmin(original)
with open(SW_OUT_FILE, 'w') as f:
    f.write(minified)
ob = len(original.encode('utf-8'))
mb = len(minified.encode('utf-8'))
total_before += ob
total_after += mb
pct = (1 - mb / ob) * 100 if ob else 0
print(f"  {'the_living_water.js':30s}  {ob:>8,} → {mb:>8,}  ({pct:.0f}% smaller)")

# Minify the_commission.js (Genesis → Revelation)
comm_src = os.path.join(HTML_SRC_DIR, 'the_commission.js')
comm_dst = os.path.join(HTML_OUT_DIR, 'm.the_commission.js')
with open(comm_src, 'r') as f:
    original = f.read()
minified = rjsmin.jsmin(original)
with open(comm_dst, 'w') as f:
    f.write(minified)
ob = len(original.encode('utf-8'))
mb = len(minified.encode('utf-8'))
total_before += ob
total_after += mb
pct = (1 - mb / ob) * 100 if ob else 0
print(f"  {'the_commission.js':30s}  {ob:>8,} → {mb:>8,}  ({pct:.0f}% smaller)")

# Minify standalone HTML pages (Genesis → Revelation m.filename.html)
for fname in sorted(HTML_SOURCES):
    src = os.path.join(HTML_SRC_DIR, fname)
    dst = os.path.join(HTML_OUT_DIR, 'm.' + fname)
    if not os.path.exists(src):
        print(f"  SKIP  {fname} (not found)")
        continue
    with open(src, 'r') as f:
        original = f.read()
    minified = minify_html.minify(original,
        minify_js=True,
        minify_css=True,
        remove_processing_instructions=True,
    )
    with open(dst, 'w') as f:
        f.write(minified)
    ob = len(original.encode('utf-8'))
    mb = len(minified.encode('utf-8'))
    total_before += ob
    total_after += mb
    pct = (1 - mb / ob) * 100 if ob else 0
    print(f"  {fname:30s}  {ob:>8,} → {mb:>8,}  ({pct:.0f}% smaller)")

# Minify root HTML pages (Genesis source → repo root, overwrite in place)
for src_name, dst_name in ROOT_HTML:
    src = os.path.join(HTML_SRC_DIR, src_name)
    dst = os.path.join(_REPO, dst_name)
    if not os.path.exists(src):
        print(f"  SKIP  {src_name} (not found)")
        continue
    with open(src, 'r') as f:
        original = f.read()
    minified = minify_html.minify(original,
        minify_js=True,
        minify_css=True,
        remove_processing_instructions=True,
    )
    with open(dst, 'w') as f:
        f.write(minified)
    ob = len(original.encode('utf-8'))
    mb = len(minified.encode('utf-8'))
    total_before += ob
    total_after += mb
    pct = (1 - mb / ob) * 100 if ob else 0
    print(f"  {dst_name:30s}  {ob:>8,} → {mb:>8,}  ({pct:.0f}% smaller)")

print(f"\n  TOTAL: {total_before:,} → {total_after:,} bytes  ({(1 - total_after/total_before)*100:.0f}% reduction)")
