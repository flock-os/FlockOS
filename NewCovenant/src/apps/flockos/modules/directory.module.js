import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_DIRECTORY_MODULE = {
  "id": "flockos.directory",
  "title": "Directory",
  "route": "/flockos/directory",
  "zone": "gates",
  "bridgePorts": [
    "resolve",
    "getUser"
  ],
  "phase": "F5.1",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:23:17.286Z",
    "records": [
      {
        "id": "dir-001",
        "label": "Care Team Network",
        "households": 22,
        "load": "steady"
      },
      {
        "id": "dir-002",
        "label": "Outreach Team Network",
        "households": 18,
        "load": "high"
      },
      {
        "id": "dir-003",
        "label": "Youth Team Network",
        "households": 14,
        "load": "healthy"
      },
      {
        "id": "dir-004",
        "label": "Worship Team Network",
        "households": 20,
        "load": "high"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.flock.members.list",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:23:17.286Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosDirectoryModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_DIRECTORY_MODULE, deps);
}
