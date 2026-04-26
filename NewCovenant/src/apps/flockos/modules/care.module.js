import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_CARE_MODULE = {
  "id": "flockos.care",
  "title": "Care",
  "route": "/flockos/care",
  "zone": "courts",
  "bridgePorts": [
    "resolve",
    "getUser",
    "notify"
  ],
  "phase": "F6.1",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:23:17.286Z",
    "records": [
      {
        "id": "car-001",
        "label": "Approve outreach supply budget",
        "priority": "high",
        "room": "Missions Room",
        "route": "/flockchat/rooms/missions",
        "escalationOwner": "finance"
      },
      {
        "id": "car-002",
        "label": "Assign host for youth welcome window",
        "priority": "medium",
        "room": "Young Adults Room",
        "route": "/flockchat/rooms/young-adults",
        "escalationOwner": "leader"
      },
      {
        "id": "car-003",
        "label": "Confirm Sunday testimony order",
        "priority": "high",
        "room": "Sunday Service Room",
        "route": "/flockchat/rooms/sunday-service",
        "escalationOwner": "pastor"
      },
      {
        "id": "car-004",
        "label": "Schedule elder prayer call with care requests",
        "priority": "urgent",
        "room": "Care Circle",
        "route": "/flockchat/rooms/care-circle",
        "escalationOwner": "care"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.flock.care.list",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:23:17.286Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosCareModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_CARE_MODULE, deps);
}
