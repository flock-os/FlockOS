#!/usr/bin/env python3
"""
Deduplicate all root-level Truth collections in Firestore.
Also writes a numeric sortOrder field to apologetics docs so the
client can order them correctly (q1=1, q2=2 … q115=115).

Collections handled:
  apologetics        — dedup by questionId; keep apol_XXX format; add sortOrder
  reading            — delete day_NNN (keep dayNNN, no underscore)
  mirror             — dedup by slug
  theologyCategories — dedup by categoryId
  theology           — dedup by sectionId

Not touched (no duplicates or intentionally many):
  books, counseling, devotionals, genealogy, heart, quiz, words

Usage:
  python dedup_truth.py              # dry-run (preview)
  python dedup_truth.py --push       # apply changes
"""
import sys, argparse, re
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore

CREDS = Path(__file__).resolve().parents[3] / "CurrentFBPW.json"


# ── Helpers ──────────────────────────────────────────────────────────────────

def _score(doc_id: str, pattern: str) -> tuple:
    """Higher = preferred keeper. (matches_pattern, field_count) not used — caller decides."""
    return 1 if re.fullmatch(pattern, doc_id) else 0


def _field_count(data: dict) -> int:
    return sum(1 for v in data.values() if v and str(v).strip())


def _commit_batch(batch, db, count):
    if count > 0:
        batch.commit()
    return db.batch(), 0


# ── Apologetics ──────────────────────────────────────────────────────────────

def dedup_apologetics(db, push: bool):
    print("\n── apologetics ──────────────────────────────────────────────")
    coll = db.collection("apologetics")
    docs = list(coll.stream())
    print(f"  Total docs: {len(docs)}")

    # Group by questionId
    groups = {}
    for doc in docs:
        data = doc.to_dict() or {}
        qid = str(data.get("questionId") or "").strip()
        if not qid:
            qid = f"__noid__{doc.id}"
        groups.setdefault(qid, []).append((doc.id, data, doc.reference))

    deleted = 0
    updated = 0
    batch = db.batch()
    count = 0

    for qid, entries in sorted(groups.items()):
        # Score: prefer apol_XXX format, then most fields
        entries.sort(
            key=lambda e: (_score(e[0], r'apol_\d+'), _field_count(e[1])),
            reverse=True
        )
        keeper_id, keeper_data, keeper_ref = entries[0]
        to_delete = entries[1:]

        # Compute numeric sort order from questionId (q1 → 1)
        m = re.search(r'\d+', qid)
        sort_order = int(m.group()) if m else 9999

        # Write sortOrder to keeper
        if keeper_data.get("sortOrder") != sort_order:
            if push:
                batch.update(keeper_ref, {"sortOrder": sort_order})
            count += 1
            updated += 1
            if count >= 450:
                batch, count = _commit_batch(batch, db, count)

        if to_delete:
            print(f"  {qid}: KEEP {keeper_id}  DELETE {[e[0] for e in to_delete]}")
            for _, _, ref in to_delete:
                deleted += 1
                if push:
                    batch.delete(ref)
                count += 1
                if count >= 450:
                    batch, count = _commit_batch(batch, db, count)

    if push and count > 0:
        batch.commit()

    action = "Applied" if push else "Would apply"
    print(f"  {action}: {deleted} deletions, {updated} sortOrder writes")


# ── Reading ───────────────────────────────────────────────────────────────────

def dedup_reading(db, push: bool):
    print("\n── reading ──────────────────────────────────────────────────")
    coll = db.collection("reading")
    docs = list(coll.stream())
    print(f"  Total docs: {len(docs)}")

    # Keep dayNNN (no underscore); delete day_NNN
    to_delete = [doc for doc in docs if re.fullmatch(r'day_\d+', doc.id)]
    to_keep   = [doc for doc in docs if re.fullmatch(r'day\d+',  doc.id)]

    print(f"  Keep  (dayNNN):   {len(to_keep)}")
    print(f"  Delete (day_NNN): {len(to_delete)}")

    if push:
        batch = db.batch()
        count = 0
        for doc in to_delete:
            batch.delete(doc.reference)
            count += 1
            if count >= 450:
                batch, count = _commit_batch(batch, db, count)
        if count > 0:
            batch.commit()
        print(f"  Deleted {len(to_delete)} docs. ✓")
    else:
        print(f"  Would delete {len(to_delete)} docs.")


# ── Mirror ────────────────────────────────────────────────────────────────────

def dedup_by_field(db, collection: str, dedup_field: str, preferred_id_pattern: str, push: bool):
    print(f"\n── {collection} ──────────────────────────────────────────────")
    coll = db.collection(collection)
    docs = list(coll.stream())
    print(f"  Total docs: {len(docs)}")

    groups = {}
    for doc in docs:
        data = doc.to_dict() or {}
        key = str(data.get(dedup_field) or "").strip().lower()
        if not key:
            key = f"__noid__{doc.id}"
        groups.setdefault(key, []).append((doc.id, data, doc.reference))

    deleted = 0
    batch = db.batch()
    count = 0

    for key, entries in sorted(groups.items()):
        if len(entries) == 1:
            continue
        entries.sort(
            key=lambda e: (_score(e[0], preferred_id_pattern), _field_count(e[1])),
            reverse=True
        )
        keeper_id = entries[0][0]
        to_delete = entries[1:]
        print(f"  '{key}': KEEP {keeper_id}  DELETE {[e[0] for e in to_delete]}")
        for _, _, ref in to_delete:
            deleted += 1
            if push:
                batch.delete(ref)
            count += 1
            if count >= 450:
                batch, count = _commit_batch(batch, db, count)

    if push and count > 0:
        batch.commit()

    action = "Deleted" if push else "Would delete"
    if deleted == 0:
        print(f"  No duplicates found. ✓")
    else:
        print(f"  {action} {deleted} duplicate(s).")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Deduplicate all Truth collections in Firestore")
    parser.add_argument("--push", action="store_true",
                        help="Actually apply changes (default is dry-run)")
    args = parser.parse_args()

    cred = credentials.Certificate(str(CREDS))
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    db = firestore.client()

    mode = "LIVE — applying changes" if args.push else "DRY RUN — no changes will be made"
    print(f"\n{'='*60}")
    print(f"  Dedup Truth — {mode}")
    print(f"{'='*60}")

    dedup_apologetics(db, args.push)
    dedup_reading(db, args.push)
    dedup_by_field(db, "mirror",             "slug",       r'[a-z][\w\-]+\.\d+', args.push)
    dedup_by_field(db, "theologyCategories", "categoryId", r'[a-z][\w_]+',       args.push)
    dedup_by_field(db, "theology",           "sectionId",  r'theo_\d+',          args.push)

    print()
    if not args.push:
        print("  DRY RUN complete. Re-run with --push to apply.\n")
    else:
        print("  Done. ✓\n")


if __name__ == "__main__":
    main()
