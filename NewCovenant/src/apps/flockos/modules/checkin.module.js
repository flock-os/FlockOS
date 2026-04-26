import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_CHECKIN_MODULE = {
  "id": "flockos.checkin",
  "title": "Check-In",
  "route": "/flockos/checkin",
  "zone": "gates",
  "bridgePorts": [
    "resolve",
    "getUser",
    "getConfig"
  ],
  "phase": "F5.2",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:47:37.317Z",
    "records": [
      {
        "id": "checkin-001",
        "label": "Check-In snapshot 1",
        "route": "/flockos/checkin",
        "endpoint": "TheVine.flock.call (module-specific)",
        "status": "ready",
        "phase": "F5.2",
        "zone": "gates"
      },
      {
        "id": "checkin-002",
        "label": "Check-In snapshot 2",
        "route": "/flockos/checkin",
        "endpoint": "TheVine.flock.call (module-specific)",
        "status": "in-progress",
        "phase": "F5.2",
        "zone": "gates"
      },
      {
        "id": "checkin-003",
        "label": "Check-In snapshot 3",
        "route": "/flockos/checkin",
        "endpoint": "TheVine.flock.call (module-specific)",
        "status": "queued",
        "phase": "F5.2",
        "zone": "gates"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.flock.call (module-specific)",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:47:37.317Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosCheckinModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_CHECKIN_MODULE, deps);
}
