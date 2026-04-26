import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKCHAT_MESSAGES_MODULE = {
  "id": "flockchat.messages",
  "title": "Message Stream",
  "route": "/flockchat/messages",
  "zone": "conversation",
  "bridgePorts": [
    "getUser",
    "notify",
    "enqueueOffline"
  ],
  "phase": "F5.4",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:44:24.995Z",
    "records": [
      {
        "id": "messages-001",
        "label": "Realtime stream",
        "backend": "Firestore onSnapshot",
        "status": "ready"
      },
      {
        "id": "messages-002",
        "label": "Send, edit, delete, react",
        "backend": "Firestore",
        "status": "ready"
      },
      {
        "id": "messages-003",
        "label": "Cursor pagination",
        "backend": "Firestore",
        "status": "in-progress"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockChat Source Snapshot",
    "sourceScript": "flockchat-public/FlockChat/the_word.js",
    "sourceSurface": "messages",
    "syncedAt": "2026-04-26T22:44:24.995Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockchatMessagesModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKCHAT_MESSAGES_MODULE, deps);
}
