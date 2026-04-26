import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const ATOG_SCRIPTURE_SEARCH_MODULE = {
  "id": "atog.scripture-search",
  "title": "Scripture Search",
  "route": "/atog/scripture-search",
  "zone": "content",
  "bridgePorts": [
    "resolve",
    "getConfig"
  ],
  "phase": "F7.4",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:44:24.995Z",
    "records": [
      {
        "id": "scripture-search-001",
        "label": "Scripture search",
        "type": "search",
        "status": "ready"
      },
      {
        "id": "scripture-search-002",
        "label": "Reference lookup",
        "type": "lookup",
        "status": "ready"
      },
      {
        "id": "scripture-search-003",
        "label": "Cross-reference surface",
        "type": "study",
        "status": "queued"
      }
    ]
  },
  "liveSource": {
    "provider": "ATOG Source Snapshot",
    "sourceScript": "Covenant/Courts/TheUpperRoom/ATOG.html",
    "syncedAt": "2026-04-26T22:44:24.995Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createAtogScriptureSearchModule(deps = {}) {
  return createStandaloneFlockOSModule(ATOG_SCRIPTURE_SEARCH_MODULE, deps);
}
