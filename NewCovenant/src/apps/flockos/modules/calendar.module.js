import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_CALENDAR_MODULE = {
  "id": "flockos.calendar",
  "title": "Calendar",
  "route": "/flockos/calendar",
  "zone": "gates",
  "bridgePorts": [
    "resolve",
    "getConfig",
    "getUser"
  ],
  "phase": "F5.1",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:23:17.286Z",
    "records": [
      {
        "id": "calendar-001",
        "label": "Calendar snapshot 1",
        "route": "/flockos/calendar",
        "endpoint": "TheVine.flock.events.list (calendar view)",
        "status": "ready",
        "phase": "F5.1",
        "zone": "gates"
      },
      {
        "id": "calendar-002",
        "label": "Calendar snapshot 2",
        "route": "/flockos/calendar",
        "endpoint": "TheVine.flock.events.list (calendar view)",
        "status": "in-progress",
        "phase": "F5.1",
        "zone": "gates"
      },
      {
        "id": "calendar-003",
        "label": "Calendar snapshot 3",
        "route": "/flockos/calendar",
        "endpoint": "TheVine.flock.events.list (calendar view)",
        "status": "queued",
        "phase": "F5.1",
        "zone": "gates"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.flock.events.list (calendar view)",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:23:17.286Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosCalendarModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_CALENDAR_MODULE, deps);
}
