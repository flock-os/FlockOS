import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKCHAT_ROOMS_MODULE = {
  "id": "flockchat.rooms",
  "title": "Rooms",
  "route": "/flockchat/rooms",
  "zone": "community",
  "bridgePorts": [
    "getUser",
    "notify",
    "enqueueOffline"
  ],
  "phase": "F5.3",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:44:24.995Z",
    "records": [
      {
        "id": "rooms-001",
        "label": "Community room list",
        "backend": "Firestore",
        "status": "ready"
      },
      {
        "id": "rooms-002",
        "label": "Room switching",
        "backend": "UI",
        "status": "ready"
      },
      {
        "id": "rooms-003",
        "label": "Room membership awareness",
        "backend": "Firestore",
        "status": "queued"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockChat Source Snapshot",
    "sourceScript": "flockchat-public/FlockChat/the_word.js",
    "syncedAt": "2026-04-26T22:44:24.995Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockchatRoomsModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKCHAT_ROOMS_MODULE, deps);
}
