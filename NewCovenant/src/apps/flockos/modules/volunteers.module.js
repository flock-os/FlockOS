import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_VOLUNTEERS_MODULE = {
  "id": "flockos.volunteers",
  "title": "Volunteers",
  "route": "/flockos/volunteers",
  "zone": "courts",
  "bridgePorts": [
    "resolve",
    "getUser",
    "notify"
  ],
  "phase": "F6.3",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:48:53.797Z",
    "records": [
      {
        "id": "vol-001",
        "label": "Care Team",
        "active": 8,
        "available": 3,
        "load": "steady",
        "onboarding": "ready"
      },
      {
        "id": "vol-002",
        "label": "Outreach Team",
        "active": 6,
        "available": 2,
        "load": "high",
        "onboarding": "pending"
      },
      {
        "id": "vol-003",
        "label": "Youth Team",
        "active": 5,
        "available": 4,
        "load": "healthy",
        "onboarding": "active"
      },
      {
        "id": "vol-004",
        "label": "Worship Team",
        "active": 7,
        "available": 2,
        "load": "high",
        "onboarding": "active"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.flock.volunteers.list",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:48:53.797Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosVolunteersModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_VOLUNTEERS_MODULE, deps);
}
