import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_EVENTS_MODULE = {
  "id": "flockos.events",
  "title": "Events",
  "route": "/flockos/events",
  "zone": "courts",
  "bridgePorts": [
    "resolve",
    "getConfig",
    "getUser"
  ],
  "phase": "F6.2",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:47:37.317Z",
    "records": [
      {
        "id": "evt-001",
        "label": "Family Care Follow-Up",
        "owner": "Ruth",
        "ministry": "Care",
        "status": "Needs Review",
        "due": "Tue",
        "start": "Tue 18:30"
      },
      {
        "id": "evt-002",
        "label": "Neighborhood Prayer Walk",
        "owner": "Micah",
        "ministry": "Outreach",
        "status": "In Progress",
        "due": "Thu",
        "start": "Thu 19:00"
      },
      {
        "id": "evt-003",
        "label": "Youth Discipleship Night",
        "owner": "Leah",
        "ministry": "Youth",
        "status": "Ready",
        "due": "Fri",
        "start": "Fri 18:00"
      },
      {
        "id": "evt-004",
        "label": "Welcome Team Rotation",
        "owner": "Asher",
        "ministry": "Hospitality",
        "status": "In Progress",
        "due": "Sat",
        "start": "Sat 09:00"
      },
      {
        "id": "evt-005",
        "label": "Baptism Follow-Up Path",
        "owner": "Naomi",
        "ministry": "Pastoral Care",
        "status": "Needs Review",
        "due": "Sun",
        "start": "Sun 10:00"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.flock.events.list",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:47:37.317Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosEventsModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_EVENTS_MODULE, deps);
}
