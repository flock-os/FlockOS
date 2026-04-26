import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const ATOG_CHARACTERS_MODULE = {
  "id": "atog.characters",
  "title": "Bible Characters",
  "route": "/atog/characters",
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
        "id": "characters-001",
        "label": "Patriarch studies",
        "group": "OT",
        "status": "ready"
      },
      {
        "id": "characters-002",
        "label": "Prophets and kings",
        "group": "OT",
        "status": "in-progress"
      },
      {
        "id": "characters-003",
        "label": "Apostles and disciples",
        "group": "NT",
        "status": "ready"
      }
    ]
  },
  "liveSource": {
    "provider": "ATOG Source Snapshot",
    "sourceScript": "Covenant/Courts/TheUpperRoom/ATOG.html",
    "sourceSurface": "characters",
    "syncedAt": "2026-04-26T22:48:53.882Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createAtogCharactersModule(deps = {}) {
  return createStandaloneFlockOSModule(ATOG_CHARACTERS_MODULE, deps);
}
