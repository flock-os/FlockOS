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
    "source": "source-surface-extract",
    "generatedAt": "2026-04-26T22:30:00.000Z",
    "records": [
      {
        "id": "my-giving-001",
        "label": "Personal giving history",
        "route": "/flockos/my-giving",
        "status": "source-backed",
        "phase": "F7.2",
        "zone": "profile"
      },
      {
        "id": "my-giving-002",
        "label": "Scoped giving records",
        "endpoint": "TheVine.flock.giving.list",
        "status": "source-backed"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Surface",
    "endpoint": "TheVine.flock.giving.list",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_tabernacle.js",
    "sourceSurface": "my-giving"
  }
};

export function createFlockosMyGivingModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_MY_GIVING_MODULE, deps);
}