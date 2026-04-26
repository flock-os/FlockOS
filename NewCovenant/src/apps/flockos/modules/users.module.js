import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_USERS_MODULE = {
  "id": "flockos.users",
  "title": "User Management",
  "route": "/flockos/users",
  "zone": "holy-of-holies",
  "bridgePorts": [
    "resolve",
    "getConfig",
    "getUser"
  ],
  "phase": "F8.2",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:23:17.286Z",
    "records": [
      {
        "id": "usr-001",
        "label": "Care Team",
        "role": "pastor",
        "active": 8
      },
      {
        "id": "usr-002",
        "label": "Outreach Team",
        "role": "leader",
        "active": 6
      },
      {
        "id": "usr-003",
        "label": "Youth Team",
        "role": "member",
        "active": 5
      },
      {
        "id": "usr-004",
        "label": "Worship Team",
        "role": "admin",
        "active": 7
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.flock.users.list",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:23:17.286Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosUsersModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_USERS_MODULE, deps);
}
