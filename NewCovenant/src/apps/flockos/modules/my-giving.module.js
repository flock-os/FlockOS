import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_MY_GIVING_MODULE = {
  "id": "flockos.my-giving",
  "title": "My Giving",
  "route": "/flockos/my-giving",
  "zone": "profile",
  "bridgePorts": [
    "resolve",
    "getUser"
  ],
  "phase": "F7.2",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:47:37.317Z",
    "records": [
      {
        "id": "mygiving-001",
        "label": "My Giving snapshot 1",
        "route": "/flockos/my-giving",
        "endpoint": "TheVine.flock.giving.list",
        "status": "ready",
        "phase": "F7.2",
        "zone": "profile"
      },
      {
        "id": "mygiving-002",
        "label": "My Giving snapshot 2",
        "route": "/flockos/my-giving",
        "endpoint": "TheVine.flock.giving.list",
        "status": "in-progress",
        "phase": "F7.2",
        "zone": "profile"
      },
      {
        "id": "mygiving-003",
        "label": "My Giving snapshot 3",
        "route": "/flockos/my-giving",
        "endpoint": "TheVine.flock.giving.list",
        "status": "queued",
        "phase": "F7.2",
        "zone": "profile"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.flock.giving.list",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "sourceSurface": "my-giving",
    "syncedAt": "2026-04-26T22:47:37.317Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosMyGivingModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_MY_GIVING_MODULE, deps);
}
