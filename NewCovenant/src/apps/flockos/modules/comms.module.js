import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_COMMS_MODULE = {
  "id": "flockos.comms",
  "title": "FlockChat Integration",
  "route": "/flockos/comms",
  "zone": "gates",
  "bridgePorts": [
    "getUser",
    "notify",
    "enqueueOffline"
  ],
  "phase": "F5.3",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:47:37.317Z",
    "records": [
      {
        "id": "com-001",
        "label": "Approve outreach supply budget",
        "priority": "high",
        "room": "Missions Room",
        "route": "/flockchat/rooms/missions",
        "escalationOwner": "finance"
      },
      {
        "id": "com-002",
        "label": "Assign host for youth welcome window",
        "priority": "medium",
        "room": "Young Adults Room",
        "route": "/flockchat/rooms/young-adults",
        "escalationOwner": "leader"
      },
      {
        "id": "com-003",
        "label": "Confirm Sunday testimony order",
        "priority": "high",
        "room": "Sunday Service Room",
        "route": "/flockchat/rooms/sunday-service",
        "escalationOwner": "pastor"
      },
      {
        "id": "com-004",
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
    "endpoint": "TheVine.flock.comms.messages.list",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:47:37.317Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosCommsModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_COMMS_MODULE, deps);
}
