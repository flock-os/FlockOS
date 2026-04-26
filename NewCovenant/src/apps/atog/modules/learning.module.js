import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const ATOG_LEARNING_MODULE = {
  "id": "atog.learning",
  "title": "Learning Hub",
  "route": "/atog/learning",
  "zone": "study",
  "bridgePorts": [
    "resolve",
    "getConfig",
    "getUser"
  ],
  "phase": "F7.3",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:47:37.379Z",
    "records": [
      {
        "id": "learning-001",
        "label": "Learning hub",
        "source": "TheWay",
        "status": "ready"
      },
      {
        "id": "learning-002",
        "label": "Playlist and study surfaces",
        "source": "shared",
        "status": "in-progress"
      },
      {
        "id": "learning-003",
        "label": "Lesson progression",
        "source": "shared",
        "status": "queued"
      }
    ]
  },
  "liveSource": {
    "provider": "ATOG Source Snapshot",
    "sourceScript": "Covenant/Courts/TheUpperRoom/ATOG.html",
    "sourceSurface": "learning",
    "syncedAt": "2026-04-26T22:47:37.379Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createAtogLearningModule(deps = {}) {
  return createStandaloneFlockOSModule(ATOG_LEARNING_MODULE, deps);
}
