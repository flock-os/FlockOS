import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKCHAT_ANNOUNCEMENTS_MODULE = {
  "id": "flockchat.announcements",
  "title": "Announcements",
  "route": "/flockchat/announcements",
  "zone": "community",
  "bridgePorts": [
    "getUser",
    "notify",
    "getConfig"
  ],
  "phase": "F6.6",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:48:53.882Z",
    "records": [
      {
        "id": "announcements-001",
        "label": "Leadership announcements",
        "backend": "Firestore",
        "status": "ready"
      },
      {
        "id": "announcements-002",
        "label": "Seeded announcement room",
        "backend": "bootstrap",
        "status": "ready"
      },
      {
        "id": "announcements-003",
        "label": "Announcement send surface",
        "backend": "UI",
        "status": "in-progress"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockChat Source Snapshot",
    "sourceScript": "flockchat-public/FlockChat/the_word.js",
    "syncedAt": "2026-04-26T22:48:53.882Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockchatAnnouncementsModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKCHAT_ANNOUNCEMENTS_MODULE, deps);
}
