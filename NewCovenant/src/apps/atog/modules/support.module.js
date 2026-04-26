import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const ATOG_SUPPORT_MODULE = {
  "id": "atog.support",
  "title": "Support",
  "route": "/atog/support",
  "zone": "support",
  "bridgePorts": [
    "resolve",
    "getConfig"
  ],
  "phase": "F8.4",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:44:24.995Z",
    "records": [
      {
        "id": "support-001",
        "label": "Pray support card",
        "action": "pray",
        "status": "ready"
      },
      {
        "id": "support-002",
        "label": "Share support card",
        "action": "share",
        "status": "ready"
      },
      {
        "id": "support-003",
        "label": "Give support card",
        "action": "give",
        "status": "queued"
      }
    ]
  },
  "liveSource": {
    "provider": "ATOG Source Snapshot",
    "sourceScript": "Covenant/Courts/TheUpperRoom/ATOG.html",
    "sourceSurface": "support",
    "syncedAt": "2026-04-26T22:44:24.995Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createAtogSupportModule(deps = {}) {
  return createStandaloneFlockOSModule(ATOG_SUPPORT_MODULE, deps);
}
