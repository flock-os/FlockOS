import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const ATOG_BOOKS_MODULE = {
  "id": "atog.books",
  "title": "Books of the Bible",
  "route": "/atog/books",
  "zone": "study",
  "bridgePorts": [
    "resolve",
    "getConfig"
  ],
  "phase": "F7.1",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:48:53.882Z",
    "records": [
      {
        "id": "books-001",
        "label": "Pentateuch",
        "corpus": "OT",
        "status": "ready"
      },
      {
        "id": "books-002",
        "label": "Gospels",
        "corpus": "NT",
        "status": "ready"
      },
      {
        "id": "books-003",
        "label": "Epistles overview",
        "corpus": "NT",
        "status": "in-progress"
      }
    ]
  },
  "liveSource": {
    "provider": "ATOG Source Snapshot",
    "sourceScript": "Covenant/Courts/TheUpperRoom/ATOG.html",
    "sourceSurface": "books",
    "syncedAt": "2026-04-26T22:48:53.882Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createAtogBooksModule(deps = {}) {
  return createStandaloneFlockOSModule(ATOG_BOOKS_MODULE, deps);
}
