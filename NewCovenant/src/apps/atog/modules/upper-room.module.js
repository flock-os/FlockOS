import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const ATOG_UPPER_ROOM_MODULE = {
  "id": "atog.upper-room",
  "title": "The Upper Room",
  "route": "/atog/upper-room",
  "zone": "rhythm",
  "bridgePorts": [
    "resolve",
    "getUser",
    "notify"
  ],
  "phase": "F5.5",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:47:37.379Z",
    "records": [
      {
        "id": "upper-room-001",
        "label": "Devotion dashboard",
        "feed": "devotionals",
        "status": "ready"
      },
      {
        "id": "upper-room-002",
        "label": "Prayer and journal integration",
        "feed": "prayer+journal",
        "status": "ready"
      },
      {
        "id": "upper-room-003",
        "label": "Care and compassion reflection",
        "feed": "care+compassion",
        "status": "in-progress"
      }
    ]
  },
  "liveSource": {
    "provider": "ATOG Source Snapshot",
    "sourceScript": "Covenant/Courts/TheUpperRoom/ATOG.html",
    "sourceSurface": "upperroom",
    "syncedAt": "2026-04-26T22:47:37.379Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createAtogUpperRoomModule(deps = {}) {
  return createStandaloneFlockOSModule(ATOG_UPPER_ROOM_MODULE, deps);
}
