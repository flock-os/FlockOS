import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKCHAT_DIRECT_MESSAGES_MODULE = {
  "id": "flockchat.direct-messages",
  "title": "Direct Messages",
  "route": "/flockchat/direct-messages",
  "zone": "community",
  "bridgePorts": [
    "getUser",
    "notify",
    "enqueueOffline"
  ],
  "phase": "F5.4",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:48:53.882Z",
    "records": [
      {
        "id": "direct-messages-001",
        "label": "DM thread creation",
        "backend": "Firestore",
        "status": "ready"
      },
      {
        "id": "direct-messages-002",
        "label": "DM sidebar list",
        "backend": "Firestore",
        "status": "in-progress"
      },
      {
        "id": "direct-messages-003",
        "label": "Participant thread routing",
        "backend": "UI",
        "status": "queued"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockChat Source Snapshot",
    "sourceScript": "flockchat-public/FlockChat/the_word.js",
    "sourceSurface": "direct-messages",
    "syncedAt": "2026-04-26T22:48:53.882Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockchatDirectMessagesModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKCHAT_DIRECT_MESSAGES_MODULE, deps);
}
