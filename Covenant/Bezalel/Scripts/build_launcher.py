"""
build_launcher.py — Filter and patch a church suite launcher (index.html).
Called by A-Build_Churches.sh for each church deployment.

Usage: python3 build_launcher.py <index_path> <short_lower> <apps_json> <app_links_json>
"""
import json
import re
import sys

index_path, short_lower, apps_json, app_links_json = sys.argv[1:5]
html = open(index_path, 'r', encoding='utf-8').read()

try:
    apps = json.loads(apps_json)
except Exception:
    apps = ["flockos", "flockchat", "atog"]
if not isinstance(apps, list):
    apps = ["flockos", "flockchat", "atog"]

try:
    app_links = json.loads(app_links_json)
except Exception:
    app_links = {}
if not isinstance(app_links, dict):
    app_links = {}

allowed = {str(a).strip().lower() for a in apps if str(a).strip()}
if not allowed:
    allowed = {"flockos"}

defaults = {
    "flockos": "FlockOS/Pages/index.html",
    "flockchat": f"../../Courts/TheFellowship/FlockChat.html?church={short_lower}",
    "atog": "../../Courts/TheUpperRoom/ATOG.html",
}
cards = {
    "flockos": "app-card--floccos",
    "flockchat": "app-card--flockchat",
    "atog": "app-card--atog",
}


def card_pattern(card_class: str) -> re.Pattern:
    return re.compile(
        r'\n\s*<a class="app-card[^"\n]*\b' + re.escape(card_class) + r'\b[^"\n]*"[^>]*>.*?</a>\n',
        re.S,
    )


for app, cls in cards.items():
    pat = card_pattern(cls)
    if app not in allowed:
        html = pat.sub('\n', html)
        continue

    href = app_links.get(app) or defaults[app]

    def replace_href(m, _href=href):
        block = m.group(0)
        return re.sub(r'href="[^"]+"', f'href="{_href}"', block, count=1)

    html = pat.sub(replace_href, html)

# Fix launcher asset paths for nested Covenant/Nations/<shortName>/ URLs.
# Note: FlockOS/Images/, FlockOS/Pages/, etc. are siblings of index.html in
# Covenant/Nations/<shortName>/, so they need NO prefix. Only legacy off-tree
# references (FlockChat, ATOG) still need ../../ to reach Covenant/Courts/.
html = html.replace('src="FlockChat/Images/', 'src="../../FlockChat/Images/')
html = html.replace('src="ATOG/Images/', 'src="../../ATOG/Images/')

app_count = sum(1 for app in cards if app in allowed)
html = re.sub(
    r'<strong>\d+</strong>\s*\n\s*<span>distinct ministry applications presented with clearer identity</span>',
    f'<strong>{app_count}</strong>\n            <span>distinct ministry applications presented with clearer identity</span>',
    html,
    count=1,
)

open(index_path, 'w', encoding='utf-8').write(html)
