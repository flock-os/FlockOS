import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_GROUPS_MODULE = {
  "id": "flockos.groups",
  "title": "Groups",
  "route": "/flockos/groups",
  "zone": "gates",
  "bridgePorts": [
    "resolve",
    "getUser",
    "notify"
  ],
  "phase": "F5.2",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:47:37.317Z",
    "records": [
      {
        "id": "grp-001",
        "label": "Care Team",
        "active": 8,
        "available": 3,
        "load": "steady",
        "cadence": "weekly"
      },
      {
        "id": "grp-002",
        "label": "Outreach Team",
        "active": 6,
        "available": 2,
        "load": "high",
        "cadence": "biweekly"
      },
      {
        "id": "grp-003",
        "label": "Youth Team",
        "active": 5,
        "available": 4,
        "load": "healthy",
        "cadence": "weekly"
      },
      {
        "id": "grp-004",
        "label": "Worship Team",
        "active": 7,
        "available": 2,
        "load": "high",
        "cadence": "monthly"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.flock.groups.list",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:47:37.317Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosGroupsModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_GROUPS_MODULE, deps);
}
