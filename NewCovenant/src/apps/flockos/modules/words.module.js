import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_WORDS_MODULE = {
  "id": "flockos.words",
  "title": "Words",
  "route": "/flockos/words",
  "zone": "holy-place",
  "bridgePorts": [
    "resolve",
    "getConfig"
  ],
  "phase": "F7.3",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:23:17.286Z",
    "records": [
      {
        "id": "words-001",
        "label": "Words snapshot 1",
        "route": "/flockos/words",
        "endpoint": "TheVine.flock.call (module-specific)",
        "status": "ready",
        "phase": "F7.3",
        "zone": "holy-place"
      },
      {
        "id": "words-002",
        "label": "Words snapshot 2",
        "route": "/flockos/words",
        "endpoint": "TheVine.flock.call (module-specific)",
        "status": "in-progress",
        "phase": "F7.3",
        "zone": "holy-place"
      },
      {
        "id": "words-003",
        "label": "Words snapshot 3",
        "route": "/flockos/words",
        "endpoint": "TheVine.flock.call (module-specific)",
        "status": "queued",
        "phase": "F7.3",
        "zone": "holy-place"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.flock.call (module-specific)",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:23:17.286Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosWordsModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_WORDS_MODULE, deps);
}
