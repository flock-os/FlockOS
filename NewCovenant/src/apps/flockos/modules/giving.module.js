import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_GIVING_MODULE = {
  "id": "flockos.giving",
  "title": "Giving",
  "route": "/flockos/giving",
  "zone": "holy-place",
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
        "id": "giv-001",
        "label": "Care",
        "owner": "Ruth",
        "status": "Needs Review",
        "amount": 450
      },
      {
        "id": "giv-002",
        "label": "Outreach",
        "owner": "Micah",
        "status": "In Progress",
        "amount": 780
      },
      {
        "id": "giv-003",
        "label": "Youth",
        "owner": "Leah",
        "status": "Ready",
        "amount": 620
      },
      {
        "id": "giv-004",
        "label": "Hospitality",
        "owner": "Asher",
        "status": "In Progress",
        "amount": 530
      },
      {
        "id": "giv-005",
        "label": "Pastoral Care",
        "owner": "Naomi",
        "status": "Needs Review",
        "amount": 910
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.flock.giving.list",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:47:37.317Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosGivingModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_GIVING_MODULE, deps);
}
