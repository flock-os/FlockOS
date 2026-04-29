// genealogy.js — Static snapshot of the 'genealogy' Firestore collection.
// Records are synced from flockos-truth by TheTruth.syncBundle('genealogy').
// TheTruth.liveBundle('genealogy') in localStorage is the live source;
// this file is the cold-start fallback served at deploy time.
//
// Field names match the Truth Editor schema (camelCase / lowercase):
//   name, title, meaning, lifespan, bio, reference, children, _docId
//
// Re-generate from Firestore:
//   1. Open the Truth Editor → Genealogy tab → "Sync App Data"
//   OR
//   2. Run: python3 "Architechtural Docs/New Covenant/Automation/Shepherds/export_genealogy_to_js.py"

export default [];
