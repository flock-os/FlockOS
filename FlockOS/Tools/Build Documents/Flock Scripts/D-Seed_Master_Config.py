#!/usr/bin/env python3
"""
FlockOS — Seed Master Config & Church Registry into flockos-notify Firestore.

Writes two root-level collections to the flockos-notify Firebase project:

  masterConfig/{key}   — the 20 default app config values that can be pushed
                         to all church deployments from the Admin Dashboard.

  churches/{id}        — the church registry (one doc per deployed church)
                         containing the GAS endpoint, sync secret, and metadata
                         needed for the pushMasterConfig Cloud Function.

Usage:
  python seed_master_config.py            # dry-run (shows what would be written)
  python seed_master_config.py --push     # write to Firestore
  python seed_master_config.py --push --config-only   # only write masterConfig
  python seed_master_config.py --push --churches-only # only write churches
"""

import json
import secrets
import sys
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore

# ── Credentials (flockos-notify service account) ───────────────────────────
CREDS = Path(__file__).resolve().parents[3] / "CurrentFBPW.json"

# ── Church registry ────────────────────────────────────────────────────────
# Loaded from Flock Deployments JSON files. These are the authoritative
# sources for GAS endpoints and church metadata.
DEPLOYMENTS_DIR = Path(__file__).resolve().parents[1] / "Flock Deployments"

CHURCH_FILES = [
    "FlockOS-Root.json",
    "TheForest.json",
    "Trinity.json",
]

# ── Master default config values ───────────────────────────────────────────
# Mirrors _DEFAULT_APP_CONFIG in the_tabernacle.js.
# Each key becomes a separate Firestore document at masterConfig/{key}
# so the Cloud Function trigger fires per-key on writes.
MASTER_CONFIG_DEFAULTS = [
    { "key": "CARD_PREFIX",           "value": "FLOCK",   "description": "Member card number prefix (1-10 alphanumeric chars)",   "category": "Members" },
    { "key": "GLOBAL_THEME",          "value": "default", "description": "Church-wide theme override (default = member choice)",   "category": "Display" },
    { "key": "FONT_SCALE",            "value": "100",     "description": "Desktop font scale percentage",                          "category": "Display" },
    { "key": "FONT_SCALE_MOBILE",     "value": "100",     "description": "Mobile font scale percentage",                           "category": "Display" },
    { "key": "QUIZ_SIZE",             "value": "10",      "description": "Number of questions per quiz session",                   "category": "Learning" },
    { "key": "MAINTENANCE_MODE",      "value": "FALSE",   "description": "Put the app in maintenance lockdown (TRUE/FALSE)",       "category": "System" },
    { "key": "TWILIO_ENABLED",        "value": "FALSE",   "description": "Enable Twilio SMS notifications (TRUE/FALSE)",           "category": "Notifications" },
    { "key": "ALLOW_SELF_REGISTER",   "value": "FALSE",   "description": "Allow new users to self-register (TRUE/FALSE)",          "category": "Access" },
    { "key": "DEFAULT_ROLE",          "value": "member",  "description": "Role assigned to new registrations",                    "category": "Access" },
    { "key": "BACKUP_ROW_LIMIT",      "value": "5000",    "description": "Max rows per sheet tab in database backups",             "category": "System" },
    { "key": "GIVING_CURRENCY",       "value": "USD",     "description": "Currency code for giving/pledges display",              "category": "Giving" },
    { "key": "ATTENDANCE_AUTO_CLOSE", "value": "180",     "description": "Minutes before a check-in session auto-closes",         "category": "Attendance" },
    { "key": "PRAYER_MAX_DAYS",       "value": "30",      "description": "Days before unanswered prayers are auto-archived",      "category": "Prayer" },
    { "key": "SERMON_UPLOAD_ENABLED", "value": "FALSE",   "description": "Enable sermon file upload to cloud storage",            "category": "Sermons" },
    { "key": "CHURCH_LOGO",           "value": "",        "description": "URL of the church logo image",                          "category": "Display" },
    { "key": "CHURCH_WEBSITE",        "value": "",        "description": "Public website URL for the church",                     "category": "Church Info" },
    { "key": "CHURCH_PHONE",          "value": "",        "description": "Main church phone number",                              "category": "Church Info" },
    { "key": "CHURCH_ADDRESS",        "value": "",        "description": "Physical address of the church",                        "category": "Church Info" },
    { "key": "CHURCH_EMAIL",          "value": "",        "description": "Main contact email for the church",                     "category": "Church Info" },
    { "key": "COMMS_MODE",            "value": "sheets",  "description": "Primary database mode: sheets or firebase",             "category": "System" },
]


# ── Helpers ────────────────────────────────────────────────────────────────

def load_churches():
    """Load church metadata from Flock Deployments JSON files."""
    churches = []
    for fname in CHURCH_FILES:
        path = DEPLOYMENTS_DIR / fname
        if not path.exists():
            print(f"  ⚠  {fname} not found — skipping")
            continue
        with open(path) as f:
            data = json.load(f)
        # Only include churches with a GAS databaseUrl
        if not data.get("databaseUrl"):
            print(f"  ⚠  {fname} has no databaseUrl — skipping")
            continue
        churches.append(data)
    return churches


def seed_master_config(db, push):
    print("\n  ── masterConfig collection ──────────────────────────────────")
    for entry in MASTER_CONFIG_DEFAULTS:
        key = entry["key"]
        ref = db.collection("masterConfig").document(key)
        existing = ref.get()
        if existing.exists:
            current = existing.to_dict().get("value", "?")
            print(f"  ↩  masterConfig/{key}  already exists  (value={current!r})")
            continue
        print(f"  →  masterConfig/{key}  value={entry['value']!r}  [{entry['category']}]")
        if push:
            ref.set(entry)
            print(f"     ✓ Written")
    print()


def seed_churches(db, push, churches):
    print("\n  ── churches collection ──────────────────────────────────────")
    generated_secrets = {}

    for church in churches:
        church_id = church["id"]
        ref = db.collection("churches").document(church_id)
        existing = ref.get()

        if existing.exists:
            data = existing.to_dict()
            print(f"  ↩  churches/{church_id}  already exists  ({data.get('name', '?')})")
            continue

        sync_secret = secrets.token_urlsafe(32)
        generated_secrets[church_id] = sync_secret

        doc = {
            "id":           church_id,
            "name":         church.get("name", church_id),
            "shortName":    church.get("shortName", church_id),
            "databaseUrl":  church["databaseUrl"],
            "syncSecret":   sync_secret,
            "firebaseConfig": church.get("firebaseConfig"),  # None for GAS-only
            "analyticsId":  church.get("analyticsId", ""),
            "active":       True,
        }

        print(f"  →  churches/{church_id}  ({doc['name']})")
        print(f"     databaseUrl: {doc['databaseUrl'][:60]}...")
        print(f"     syncSecret:  {sync_secret}")

        if push:
            ref.set(doc)
            print(f"     ✓ Written")
        print()

    return generated_secrets


def main():
    push           = "--push"           in sys.argv
    config_only    = "--config-only"    in sys.argv
    churches_only  = "--churches-only"  in sys.argv

    if not CREDS.exists():
        print(f"\n  ✗  Credentials not found at {CREDS}")
        print("     Expected: CurrentFBPW.json (flockos-notify service account)")
        sys.exit(1)

    cred = credentials.Certificate(str(CREDS))
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    db = firestore.client()

    print("\n  FlockOS — Seed Master Config")
    print("  " + "=" * 50)
    print(f"  Mode: {'PUSH (writing to Firestore)' if push else 'DRY RUN'}")
    if config_only:    print("  Scope: masterConfig only")
    if churches_only:  print("  Scope: churches only")

    churches = load_churches()

    generated_secrets = {}

    if not churches_only:
        seed_master_config(db, push)

    if not config_only:
        generated_secrets = seed_churches(db, push, churches)

    if not push:
        print("\n  Run with --push to write to Firestore.")
        print("  Run with --push --config-only or --push --churches-only for partial seeding.\n")
    elif generated_secrets:
        print("\n  ─────────────────────────────────────────────────────────────")
        print("  ACTION REQUIRED — Copy each syncSecret into the church's GAS project:")
        print("  (Add as a Script Property named MASTER_SYNC_SECRET in each GAS project)\n")
        for church_id, secret in generated_secrets.items():
            print(f"  {church_id:20s}  {secret}")
        print()
    else:
        print("\n  Done! All documents written to flockos-notify.\n")


if __name__ == "__main__":
    main()
