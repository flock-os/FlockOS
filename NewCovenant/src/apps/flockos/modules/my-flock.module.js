import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_MY_FLOCK_MODULE = {
  "id": "flockos.my-flock",
  "title": "My Flock",
  "route": "/flockos/my-flock",
  "zone": "courts",
  "bridgePorts": [
    "resolve",
    "getUser",
    "notify"
  ],
  "phase": "F6.1",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:47:37.317Z",
    "records": [
      {
        "id": "flk-001",
        "label": "Care Team",
        "active": 8,
        "available": 3,
        "load": "steady"
      },
      {
        "id": "flk-002",
        "label": "Outreach Team",
        "active": 6,
        "available": 2,
        "load": "high"
      },
      {
        "id": "flk-003",
        "label": "Youth Team",
        "active": 5,
        "available": 4,
        "load": "healthy"
      },
      {
        "id": "flk-004",
        "label": "Worship Team",
        "active": 7,
        "available": 2,
        "load": "high"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.flock.members.list (scoped)",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:47:37.317Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosMyFlockModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_MY_FLOCK_MODULE, deps);
}
