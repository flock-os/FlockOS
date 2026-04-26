import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_SONGS_MODULE = {
  "id": "flockos.songs",
  "title": "Music Stand",
  "route": "/flockos/songs",
  "zone": "holy-place",
  "bridgePorts": [
    "resolve",
    "getConfig",
    "getUser"
  ],
  "phase": "F7.1",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:23:17.286Z",
    "records": [
      {
        "id": "sng-001",
        "label": "Family Care Follow-Up Set",
        "key": "G",
        "status": "Needs Review"
      },
      {
        "id": "sng-002",
        "label": "Neighborhood Prayer Walk Set",
        "key": "D",
        "status": "In Progress"
      },
      {
        "id": "sng-003",
        "label": "Youth Discipleship Night Set",
        "key": "A",
        "status": "Ready"
      },
      {
        "id": "sng-004",
        "label": "Welcome Team Rotation Set",
        "key": "E",
        "status": "In Progress"
      },
      {
        "id": "sng-005",
        "label": "Baptism Follow-Up Path Set",
        "key": "C",
        "status": "Needs Review"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.flock.songs.list",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:23:17.286Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosSongsModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_SONGS_MODULE, deps);
}
