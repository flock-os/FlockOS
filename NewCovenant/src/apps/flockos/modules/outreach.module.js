import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_OUTREACH_MODULE = {
  "id": "flockos.outreach",
  "title": "Outreach",
  "route": "/flockos/outreach",
  "zone": "holy-place",
  "bridgePorts": [
    "resolve",
    "getConfig",
    "getUser"
  ],
  "phase": "F7.2",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:47:37.317Z",
    "records": [
      {
        "id": "out-001",
        "label": "Family Care Follow-Up",
        "owner": "Ruth",
        "ministry": "Care",
        "status": "Needs Review",
        "due": "Tue"
      },
      {
        "id": "out-002",
        "label": "Neighborhood Prayer Walk",
        "owner": "Micah",
        "ministry": "Outreach",
        "status": "In Progress",
        "due": "Thu"
      },
      {
        "id": "out-003",
        "label": "Youth Discipleship Night",
        "owner": "Leah",
        "ministry": "Youth",
        "status": "Ready",
        "due": "Fri"
      },
      {
        "id": "out-004",
        "label": "Welcome Team Rotation",
        "owner": "Asher",
        "ministry": "Hospitality",
        "status": "In Progress",
        "due": "Sat"
      },
      {
        "id": "out-005",
        "label": "Baptism Follow-Up Path",
        "owner": "Naomi",
        "ministry": "Pastoral Care",
        "status": "Needs Review",
        "due": "Sun"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.flock.outreach.contacts.list",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:47:37.317Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosOutreachModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_OUTREACH_MODULE, deps);
}
