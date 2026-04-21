#!/usr/bin/env python3
"""
Deduplicate Bible Books in Firestore.

Books are stored at the root-level 'books' collection (not under churches/).
Groups all docs by bookName, keeps the best one (numeric ID preferred,
then most populated fields), and removes the rest.

Usage:
  python dedup_books.py              # dry-run (preview only)
  python dedup_books.py --push       # actually delete duplicates
"""
import sys, argparse, re
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore

CREDS = Path(__file__).resolve().parents[3] / "CurrentFBPW.json"


def is_numeric_id(doc_id: str) -> bool:
    return bool(re.fullmatch(r'\d+', doc_id))


def score_doc(doc_id: str, data: dict) -> tuple:
    """Higher score = preferred keeper. Returns (is_numeric, field_count)."""
    field_count = sum(1 for v in data.values() if v and str(v).strip())
    return (1 if is_numeric_id(doc_id) else 0, field_count)


def dedup_books(db, push: bool):
    coll_ref = db.collection("books")
    docs = list(coll_ref.stream())

    if not docs:
        print("  No books found — skipping.")
        return

    print(f"  Found {len(docs)} total book documents.\n")

    # Group by bookName (case-insensitive for safety)
    groups: dict[str, list] = {}
    for doc in docs:
        data = doc.to_dict() or {}
        key = str(data.get("bookName") or data.get("book_name") or "").strip().lower()
        if not key:
            key = f"__unnamed__{doc.id}"
        groups.setdefault(key, []).append((doc.id, data, doc.reference))

    duplicates_found = 0

    for book_name, entries in sorted(groups.items()):
        if len(entries) == 1:
            continue

        # Sort: best keeper first
        entries.sort(key=lambda e: score_doc(e[0], e[1]), reverse=True)
        to_delete = entries[1:]

        duplicates_found += len(to_delete)
        print(f"  '{entries[0][1].get('bookName', book_name)}'")
        print(f"    KEEP   → {entries[0][0]}")
        for doc_id, _, ref in to_delete:
            print(f"    DELETE → {doc_id}")
            if push:
                ref.delete()

    if duplicates_found == 0:
        print("  No duplicates found. ✓")
    else:
        action = "Deleted" if push else "Would delete"
        print(f"\n  {action} {duplicates_found} duplicate(s).")


def main():
    parser = argparse.ArgumentParser(description="Deduplicate root-level Firestore books collection")
    parser.add_argument("--push", action="store_true",
                        help="Actually delete duplicates (default is dry-run)")
    args = parser.parse_args()

    cred = credentials.Certificate(str(CREDS))
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    db = firestore.client()

    mode = "LIVE — deleting duplicates" if args.push else "DRY RUN — no changes will be made"
    print(f"\n{'='*60}")
    print(f"  Dedup Books — {mode}")
    print(f"  Path: books/ (root collection)")
    print(f"{'='*60}\n")

    dedup_books(db, args.push)

    if not args.push:
        print("\n  To apply, re-run with --push\n")
    else:
        print("\n  Done. ✓\n")


if __name__ == "__main__":
    main()
