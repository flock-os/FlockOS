import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKCHAT_NEW_DM_MODULE = {
  "id": "flockchat.new-dm",
  "title": "New Direct Message",
  "route": "/flockchat/new-dm",
  "zone": "community",
  "bridgePorts": [
    "getUser",
    "notify"
  ],
  "phase": "F5.4",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:48:53.882Z",
    "records": [
      {
        "id": "new-dm-001",
        "label": "Open DM modal",
        "area": "modal",
        "status": "ready"
      },
      {
        "id": "new-dm-002",
        "label": "User picker",
        "area": "modal",
        "status": "ready"
      },
      {
        "id": "new-dm-003",
        "label": "Thread open action",
        "area": "modal",
        "status": "queued"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockChat Source Snapshot",
    "sourceScript": "flockchat-public/FlockChat.html",
    "sourceSurface": "new-dm",
    "syncedAt": "2026-04-26T22:48:53.882Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockchatNewDmModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKCHAT_NEW_DM_MODULE, deps);
}
