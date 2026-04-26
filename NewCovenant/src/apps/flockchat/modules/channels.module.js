import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKCHAT_CHANNELS_MODULE = {
  "id": "flockchat.channels",
  "title": "Channels",
  "route": "/flockchat/channels",
  "zone": "community",
  "bridgePorts": [
    "getUser",
    "notify",
    "enqueueOffline"
  ],
  "phase": "F5.3",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:48:53.882Z",
    "records": [
      {
        "id": "channels-001",
        "label": "Channel CRUD",
        "backend": "Firestore",
        "status": "ready"
      },
      {
        "id": "channels-002",
        "label": "Role-gated and private rooms",
        "backend": "Firestore",
        "status": "in-progress"
      },
      {
        "id": "channels-003",
        "label": "Seed channels",
        "backend": "bootstrap",
        "status": "ready"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockChat Source Snapshot",
    "sourceScript": "flockchat-public/FlockChat/the_word.js",
    "sourceSurface": "channels",
    "syncedAt": "2026-04-26T22:48:53.882Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockchatChannelsModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKCHAT_CHANNELS_MODULE, deps);
}
