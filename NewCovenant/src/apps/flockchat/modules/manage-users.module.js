import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKCHAT_MANAGE_USERS_MODULE = {
  "id": "flockchat.manage-users",
  "title": "Manage Users",
  "route": "/flockchat/manage-users",
  "zone": "administration",
  "bridgePorts": [
    "getUser",
    "getConfig",
    "notify"
  ],
  "phase": "F6.6",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:44:24.995Z",
    "records": [
      {
        "id": "manage-users-001",
        "label": "Manage users modal",
        "area": "admin",
        "status": "ready"
      },
      {
        "id": "manage-users-002",
        "label": "Role and membership controls",
        "area": "admin",
        "status": "in-progress"
      },
      {
        "id": "manage-users-003",
        "label": "Moderation view",
        "area": "admin",
        "status": "queued"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockChat Source Snapshot",
    "sourceScript": "flockchat-public/FlockChat.html",
    "sourceSurface": "manage-users",
    "syncedAt": "2026-04-26T22:44:24.995Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockchatManageUsersModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKCHAT_MANAGE_USERS_MODULE, deps);
}
