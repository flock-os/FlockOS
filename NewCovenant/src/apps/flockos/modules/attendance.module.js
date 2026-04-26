import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_ATTENDANCE_MODULE = {
  "id": "flockos.attendance",
  "title": "Attendance",
  "route": "/flockos/attendance",
  "zone": "courts",
  "bridgePorts": [
    "resolve",
    "getUser",
    "enqueueOffline"
  ],
  "phase": "F6.3",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:48:53.797Z",
    "records": [
      {
        "id": "att-001",
        "label": "Care Team",
        "active": 8,
        "available": 3,
        "load": "steady",
        "service": "Sunday AM"
      },
      {
        "id": "att-002",
        "label": "Outreach Team",
        "active": 6,
        "available": 2,
        "load": "high",
        "service": "Sunday PM"
      },
      {
        "id": "att-003",
        "label": "Youth Team",
        "active": 5,
        "available": 4,
        "load": "healthy",
        "service": "Wednesday"
      },
      {
        "id": "att-004",
        "label": "Worship Team",
        "active": 7,
        "available": 2,
        "load": "high",
        "service": "Youth Night"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.flock.attendance.list",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:48:53.797Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosAttendanceModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_ATTENDANCE_MODULE, deps);
}
