import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const ATOG_LEXICON_MODULE = {
  "id": "atog.lexicon",
  "title": "Greek & Hebrew Lexicon",
  "route": "/atog/lexicon",
  "zone": "study",
  "bridgePorts": [
    "resolve",
    "getConfig"
  ],
  "phase": "F7.2",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:48:53.882Z",
    "records": [
      {
        "id": "lexicon-001",
        "label": "Greek lookup",
        "language": "Greek",
        "status": "ready"
      },
      {
        "id": "lexicon-002",
        "label": "Hebrew lookup",
        "language": "Hebrew",
        "status": "ready"
      },
      {
        "id": "lexicon-003",
        "label": "Word study cross-links",
        "language": "Mixed",
        "status": "queued"
      }
    ]
  },
  "liveSource": {
    "provider": "ATOG Source Snapshot",
    "sourceScript": "Covenant/Courts/TheUpperRoom/ATOG.html",
    "sourceSurface": "lexicon",
    "syncedAt": "2026-04-26T22:48:53.882Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createAtogLexiconModule(deps = {}) {
  return createStandaloneFlockOSModule(ATOG_LEXICON_MODULE, deps);
}
