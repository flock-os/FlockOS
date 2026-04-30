#!/usr/bin/env python3
"""
export_mirror_to_js.py
─────────────────────────────────────────────────────────────────────────────
Exports the `mirror` app-content collection from a FlockOS Firebase project and
writes it as a static ES-module bundle (zero Firestore reads at runtime).

Each document is a Shepherd's Mirror triage entry with fields:
  categoryId, categoryTitle, color, chartLabel,
  questionId, question, prescription, scripture, slug

The bundle is read by:
  - New_Covenant/Scripts/the_gospel/the_gospel_mirror.js  (private & public)

Usage
─────
  python export_mirror_to_js.py
  python export_mirror_to_js.py --project flockos-trinity

Defaults
────────
  --project   flockos-notify
  --out       New_Covenant/Data/mirror.js

Auth
────
  Uses Application Default Credentials (ADC).
  Run once:  gcloud auth application-default login
"""

import argparse, json, os, sys
from datetime import datetime, timezone

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT   = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..', '..'))
DEFAULT_OUT = os.path.join(REPO_ROOT, 'New_Covenant', 'Data', 'mirror.js')

parser = argparse.ArgumentParser(description='Export Firestore mirror questions → ES module')
parser.add_argument('--project', default='flockos-notify')
parser.add_argument('--out', default=DEFAULT_OUT)
args = parser.parse_args()

try:
    from google.cloud import firestore
except ImportError:
    sys.exit('[ERROR] Run: pip install google-cloud-firestore')

print(f'[export_mirror] Connecting to project: {args.project}')
try:
    db = firestore.Client(project=args.project)
except Exception as e:
    sys.exit(f'[ERROR] Could not connect: {e}\n  Run: gcloud auth application-default login')

print('[export_mirror] Fetching mirror collection…')
try:
    docs = list(db.collection('mirror').stream())
except Exception as e:
    sys.exit(f'[ERROR] Firestore fetch failed: {e}')

if not docs:
    sys.exit('[ERROR] No documents found in mirror collection.')

print(f'[export_mirror] {len(docs)} record(s) fetched.')

# ── Normalise ─────────────────────────────────────────────────────────────
# Firestore field names for mirror (from TheTruth field map / FIELD_REVERSE_MAP):
#   'Category ID', 'Category Title', 'Color', 'Chart Label',
#   'Question ID', 'Question', 'Prescription', 'Scripture', 'Slug'
# We normalise all to camelCase for the static bundle.

FIELD_MAP = {
    'Category ID':    'categoryId',
    'Category Title': 'categoryTitle',
    'Color':          'color',
    'Chart Label':    'chartLabel',
    'Question ID':    'questionId',
    'Question':       'question',
    'Prescription':   'prescription',
    'Scripture':      'scripture',
    'Slug':           'slug',
}

def _camel(s):
    if s in FIELD_MAP:
        return FIELD_MAP[s]
    # Generic camelCase for any unmapped fields
    if ' ' not in s:
        return s[0].lower() + s[1:] if s else s
    parts = s.split()
    return parts[0].lower() + ''.join(p.capitalize() for p in parts[1:])

def _normalise(d):
    out = {}
    for k, v in d.items():
        ck = _camel(k)
        if hasattr(v, 'isoformat'):
            v = v.isoformat()
        elif isinstance(v, dict):
            v = {_camel(dk): dv for dk, dv in v.items()}
        elif isinstance(v, list):
            v = [_normalise(i) if isinstance(i, dict) else i for i in v]
        out[ck] = v
    return out

records = []
for doc in docs:
    r = _normalise(doc.to_dict())
    # Ensure questionId set — fall back to Firestore doc ID
    if not r.get('questionId'):
        r['questionId'] = doc.id
    records.append(r)

# Sort by categoryTitle then questionId for stable, grouped ordering
records.sort(key=lambda r: (r.get('categoryTitle', ''), r.get('questionId', '')))

# ── Validate sample ────────────────────────────────────────────────────────
required = {'question', 'categoryTitle', 'prescription'}
missing_count = sum(1 for r in records if not required.issubset(r.keys()))
if missing_count:
    print(f'[WARN] {missing_count} record(s) missing required fields (question/categoryTitle/prescription)')

# ── Write ─────────────────────────────────────────────────────────────────
timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
header = f'''\
// mirror.js — Static Shepherd's Mirror triage questions bundle
// Source:   Firestore project {args.project}, collection: mirror
// Exported: {timestamp}
// Records:  {len(records)}
//
// Used by the_gospel_mirror.js when no backend (Firestore/GAS) is available.
// Serves both the private GROW app (authenticated) and the public GROW app.
//
// Re-generate: python "Architechtural Docs/New Covenant/Automation/Shepherds/export_mirror_to_js.py"
// DO NOT EDIT — regenerate from Firestore via TheTruth instead.

export default '''

os.makedirs(os.path.dirname(args.out), exist_ok=True)
with open(args.out, 'w', encoding='utf-8') as f:
    f.write(header)
    f.write(json.dumps(records, indent=2, ensure_ascii=False))
    f.write(';\n')

size_kb = os.path.getsize(args.out) / 1024
print(f'[export_mirror] ✓ Written → {args.out} ({size_kb:.1f} KB, {len(records)} questions)')
