import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const ATOG_MIRROR_MODULE = {
  "id": "atog.mirror",
  "title": "The Mirror",
  "route": "/atog/mirror",
  "zone": "grow",
  "bridgePorts": [
    "resolve",
    "getUser"
  ],
  "phase": "F6.2",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:44:24.995Z",
    "records": [
      {
        "id": "mirror-001",
        "label": "Identity in Christ",
        "theme": "truth",
        "status": "ready"
      },
      {
        "id": "mirror-002",
        "label": "Conviction and grace",
        "theme": "sanctification",
        "status": "ready"
      },
      {
        "id": "mirror-003",
        "label": "Response journaling",
        "theme": "practice",
        "status": "queued"
      }
    ]
  },
  "liveSource": {
    "provider": "ATOG Source Snapshot",
    "sourceScript": "Covenant/Courts/TheUpperRoom/ATOG.html",
    "sourceSurface": "mirror",
    "syncedAt": "2026-04-26T22:44:24.995Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createAtogMirrorModule(deps = {}) {
  return createStandaloneFlockOSModule(ATOG_MIRROR_MODULE, deps);
}
