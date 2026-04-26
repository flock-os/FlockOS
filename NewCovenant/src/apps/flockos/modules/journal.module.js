import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_JOURNAL_MODULE = {
  "id": "flockos.journal",
  "title": "Journal",
  "route": "/flockos/journal",
  "zone": "holy-place",
  "bridgePorts": [
    "resolve",
    "getUser"
  ],
  "phase": "F7.3",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:47:37.317Z",
    "records": [
      {
        "id": "journal-001",
        "label": "Journal snapshot 1",
        "route": "/flockos/journal",
        "endpoint": "TheVine.flock.journal.list",
        "status": "ready",
        "phase": "F7.3",
        "zone": "holy-place"
      },
      {
        "id": "journal-002",
        "label": "Journal snapshot 2",
        "route": "/flockos/journal",
        "endpoint": "TheVine.flock.journal.list",
        "status": "in-progress",
        "phase": "F7.3",
        "zone": "holy-place"
      },
      {
        "id": "journal-003",
        "label": "Journal snapshot 3",
        "route": "/flockos/journal",
        "endpoint": "TheVine.flock.journal.list",
        "status": "queued",
        "phase": "F7.3",
        "zone": "holy-place"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.flock.journal.list",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:47:37.317Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosJournalModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_JOURNAL_MODULE, deps);
}
