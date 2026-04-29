// theology.js — Static snapshot of the 'theology' Firestore collection.
// Records are synced from flockos-truth by TheTruth.syncBundle('theology').
// TheTruth.liveBundle('theology') in localStorage is the live source;
// this file is the cold-start fallback served at deploy time.
//
// Each record is a flat doctrine section (one row per section):
//   categoryTitle, categorySubtitle, categoryIntro, categoryIcon, categoryColor,
//   sectionTitle, content, summary, scriptureRefs, keywords,
//   status ('Draft'|'Approved'|'Review'), approvedBy, approvedAt, _docId
//
// The renderer groups records by categoryTitle to build the accordion UI.
//
// Re-generate from Firestore:
//   1. Open the Truth Editor → Theology tab → "Sync App Data"
//   OR
//   2. Run: python3 "Architechtural Docs/New Covenant/Automation/Shepherds/export_theology_to_js.py"

export default [];
