import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKCHAT_PRESENCE_MODULE = {
  "id": "flockchat.presence",
  "title": "Presence",
  "route": "/flockchat/presence",
  "zone": "realtime",
  "bridgePorts": [
    "getUser",
    "notify"
  ],
  "phase": "F5.5",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:44:24.995Z",
    "records": [
      {
        "id": "presence-001",
        "label": "RTDB presence tracking",
        "backend": "Realtime Database",
        "status": "ready"
      },
      {
        "id": "presence-002",
        "label": "Typing indicators",
        "backend": "Realtime Database",
        "status": "ready"
      },
      {
        "id": "presence-003",
        "label": "Status pill sync",
        "backend": "UI",
        "status": "in-progress"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockChat Source Snapshot",
    "sourceScript": "flockchat-public/FlockChat/the_word.js",
    "sourceSurface": "presence",
    "syncedAt": "2026-04-26T22:44:24.995Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockchatPresenceModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKCHAT_PRESENCE_MODULE, deps);
}
