import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKCHAT_UNREAD_MODULE = {
  "id": "flockchat.unread",
  "title": "Unread Counters",
  "route": "/flockchat/unread",
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
        "id": "unread-001",
        "label": "Unread counters",
        "backend": "read-state",
        "status": "ready"
      },
      {
        "id": "unread-002",
        "label": "Mention highlight support",
        "backend": "messages",
        "status": "ready"
      },
      {
        "id": "unread-003",
        "label": "Badge surfaces",
        "backend": "UI",
        "status": "in-progress"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockChat Source Snapshot",
    "sourceScript": "flockchat-public/FlockChat/the_word.js",
    "sourceSurface": "unread",
    "syncedAt": "2026-04-26T22:44:24.995Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockchatUnreadModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKCHAT_UNREAD_MODULE, deps);
}
