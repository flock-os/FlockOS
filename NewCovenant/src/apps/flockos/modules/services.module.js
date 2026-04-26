import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_SERVICES_MODULE = {
  "id": "flockos.services",
  "title": "Service Plans",
  "route": "/flockos/services",
  "zone": "holy-place",
  "bridgePorts": [
    "resolve",
    "getConfig",
    "getUser"
  ],
  "phase": "F7.1",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:48:53.797Z",
    "records": [
      {
        "id": "svc-001",
        "label": "Approve outreach supply budget",
        "priority": "high",
        "room": "Missions Room",
        "route": "/flockchat/rooms/missions",
        "escalationOwner": "finance",
        "serviceWindow": "AM"
      },
      {
        "id": "svc-002",
        "label": "Assign host for youth welcome window",
        "priority": "medium",
        "room": "Young Adults Room",
        "route": "/flockchat/rooms/young-adults",
        "escalationOwner": "leader",
        "serviceWindow": "PM"
      },
      {
        "id": "svc-003",
        "label": "Confirm Sunday testimony order",
        "priority": "high",
        "room": "Sunday Service Room",
        "route": "/flockchat/rooms/sunday-service",
        "escalationOwner": "pastor",
        "serviceWindow": "Special"
      },
      {
        "id": "svc-004",
        "label": "Schedule elder prayer call with care requests",
        "priority": "urgent",
        "room": "Care Circle",
        "route": "/flockchat/rooms/care-circle",
        "escalationOwner": "care",
        "serviceWindow": "Midweek"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.flock.servicePlans.list",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:48:53.797Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosServicesModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_SERVICES_MODULE, deps);
}
