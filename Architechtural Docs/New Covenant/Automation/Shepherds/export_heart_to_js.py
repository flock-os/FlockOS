#!/usr/bin/env python3
"""
export_heart_to_js.py
─────────────────────────────────────────────────────────────────────────────
Exports the `heart` app-content collection from a FlockOS Firebase project and
writes it as a static ES-module bundle (zero Firestore reads at runtime).

Each document is a Heart Check question with fields:
  questionId, category, chartAxis, question, prescription, verseReference

The bundle is read by:
  - New_Covenant/Scripts/the_gospel/the_gospel_heart.js  (private & public)

Usage
─────
  python export_heart_to_js.py
  python export_heart_to_js.py --project flockos-trinity

Defaults
────────
  --project   flockos-notify
  --out       New_Covenant/Data/heart.js

Auth
────
  Uses Application Default Credentials (ADC).
  Run once:  gcloud auth application-default login
"""

import argparse, json, os, sys
from datetime import datetime, timezone

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT   = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..', '..'))
DEFAULT_OUT = os.path.join(REPO_ROOT, 'New_Covenant', 'Data', 'heart.js')

parser = argparse.ArgumentParser(description='Export Firestore heart-check questions → ES module')
parser.add_argument('--project', default='flockos-notify')
parser.add_argument('--out', default=DEFAULT_OUT)
args = parser.parse_args()

try:
    from google.cloud import firestore
except ImportError:
    sys.exit('[ERROR] Run: pip install google-cloud-firestore')

print(f'[export_heart] Connecting to project: {args.project}')
try:
    db = firestore.Client(project=args.project)
except Exception as e:
    sys.exit(f'[ERROR] Could not connect: {e}\n  Run: gcloud auth application-default login')

print('[export_heart] Fetching heart collection…')
try:
    docs = list(db.collection('heart').stream())
except Exception as e:
    sys.exit(f'[ERROR] Firestore fetch failed: {e}')

if not docs:
    sys.exit('[ERROR] No documents found in heart collection.')

print(f'[export_heart] {len(docs)} question(s) fetched.')

# ── Normalise ─────────────────────────────────────────────────────────────
# Firestore field names for heart use Title Case (from TheTruth's field map):
#   'Question ID', 'Category', 'Chart Axis', 'Question', 'Prescription', 'Verse Reference'
# We normalise all to camelCase for the static bundle.

FIELD_MAP = {
    'Question ID':    'questionId',
    'Category':       'category',
    'Chart Axis':     'chartAxis',
    'Question':       'question',
    'Prescription':   'prescription',
    'Verse Reference': 'verseReference',
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
    # Ensure questionId is set — fall back to Firestore doc ID
    if not r.get('questionId'):
        r['questionId'] = doc.id
    records.append(r)

# Sort by category then questionId for stable, grouped ordering
records.sort(key=lambda r: (r.get('category', ''), r.get('questionId', '')))

# ── Validate sample ────────────────────────────────────────────────────────
required = {'question', 'category', 'prescription'}
missing_count = sum(1 for r in records if not required.issubset(r.keys()))
if missing_count:
    print(f'[WARN] {missing_count} record(s) missing required fields (question/category/prescription)')

# ── Write ─────────────────────────────────────────────────────────────────
timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
header = f'''\
// heart.js — Static Heart Check questions bundle
// Source:   Firestore project {args.project}, collection: heart
// Exported: {timestamp}
// Records:  {len(records)}
//
// Used by the_gospel_heart.js when no backend (Firestore/GAS) is available.
// Serves both the private GROW app (authenticated) and the public GROW app.
//
// Re-generate: python "Architechtural Docs/New Covenant/Automation/Shepherds/export_heart_to_js.py"
// DO NOT EDIT — regenerate from Firestore via TheTruth instead.

export default '''

os.makedirs(os.path.dirname(args.out), exist_ok=True)
with open(args.out, 'w', encoding='utf-8') as f:
    f.write(header)
    f.write(json.dumps(records, indent=2, ensure_ascii=False))
    f.write(';\n')

size_kb = os.path.getsize(args.out) / 1024
print(f'[export_heart] ✓ Written → {args.out} ({size_kb:.1f} KB, {len(records)} questions)')
