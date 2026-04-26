import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKCHAT_PROFILE_MODULE = {
  "id": "flockchat.profile",
  "title": "Profile",
  "route": "/flockchat/profile",
  "zone": "account",
  "bridgePorts": [
    "getUser",
    "notify"
  ],
  "phase": "F5.6",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:47:37.379Z",
    "records": [
      {
        "id": "profile-001",
        "label": "Display name editor",
        "backend": "Firestore",
        "status": "ready"
      },
      {
        "id": "profile-002",
        "label": "Status text editor",
        "backend": "Firestore",
        "status": "in-progress"
      },
      {
        "id": "profile-003",
        "label": "Role and email display",
        "backend": "UI",
        "status": "queued"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockChat Source Snapshot",
    "sourceScript": "flockchat-public/FlockChat/the_word.js",
    "sourceSurface": "profile",
    "syncedAt": "2026-04-26T22:47:37.379Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockchatProfileModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKCHAT_PROFILE_MODULE, deps);
}
