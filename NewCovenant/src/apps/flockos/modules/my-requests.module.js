import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_MY_REQUESTS_MODULE = {
  "id": "flockos.my-requests",
  "title": "My Requests",
  "route": "/flockos/my-requests",
  "zone": "courts",
  "bridgePorts": [
    "resolve",
    "getUser",
    "notify"
  ],
  "phase": "F6.2",
  "seedData": {
    "source": "source-surface-extract",
    "generatedAt": "2026-04-26T22:30:00.000Z",
    "records": [
      {
        "id": "my-requests-001",
        "label": "Personal prayer requests",
        "route": "/flockos/my-requests",
        "status": "source-backed",
        "phase": "F6.2",
        "zone": "courts"
      },
      {
        "id": "my-requests-002",
        "label": "Scoped request list",
        "endpoint": "TheVine.flock.prayer.list",
        "status": "source-backed"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Surface",
    "endpoint": "TheVine.flock.prayer.list",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_tabernacle.js",
    "sourceSurface": "my-requests"
  }
};

export function createFlockosMyRequestsModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_MY_REQUESTS_MODULE, deps);
}