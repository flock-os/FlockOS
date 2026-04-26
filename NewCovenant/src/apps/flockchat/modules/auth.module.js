import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKCHAT_AUTH_MODULE = {
  "id": "flockchat.auth",
  "title": "Authentication",
  "route": "/flockchat/auth",
  "zone": "access",
  "bridgePorts": [
    "resolve",
    "getUser",
    "notify"
  ],
  "phase": "F5.2",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:44:24.995Z",
    "records": [
      {
        "id": "auth-001",
        "label": "Email/password sign in",
        "backend": "Firebase Auth",
        "status": "ready"
      },
      {
        "id": "auth-002",
        "label": "Registration and profile bootstrap",
        "backend": "Firestore",
        "status": "ready"
      },
      {
        "id": "auth-003",
        "label": "Password reset flow",
        "backend": "Firebase Auth",
        "status": "in-progress"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockChat Source Snapshot",
    "sourceScript": "flockchat-public/FlockChat/the_word.js",
    "sourceSurface": "auth",
    "syncedAt": "2026-04-26T22:44:24.995Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockchatAuthModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKCHAT_AUTH_MODULE, deps);
}
