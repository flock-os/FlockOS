import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKCHAT_ADMIN_DASHBOARD_MODULE = {
  "id": "flockchat.admin-dashboard",
  "title": "Admin Dashboard",
  "route": "/flockchat/admin-dashboard",
  "zone": "administration",
  "bridgePorts": [
    "getUser",
    "getConfig",
    "notify"
  ],
  "phase": "F6.6",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:47:37.379Z",
    "records": [
      {
        "id": "admin-dashboard-001",
        "label": "Admin users tab",
        "area": "admin",
        "status": "ready"
      },
      {
        "id": "admin-dashboard-002",
        "label": "Admin rooms tab",
        "area": "admin",
        "status": "ready"
      },
      {
        "id": "admin-dashboard-003",
        "label": "Moderation controls",
        "area": "admin",
        "status": "queued"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockChat Source Snapshot",
    "sourceScript": "flockchat-public/FlockChat/the_word.js",
    "sourceSurface": "admin-dashboard",
    "syncedAt": "2026-04-26T22:47:37.379Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockchatAdminDashboardModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKCHAT_ADMIN_DASHBOARD_MODULE, deps);
}
