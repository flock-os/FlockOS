import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKCHAT_QUICK_SWITCHER_MODULE = {
  "id": "flockchat.quick-switcher",
  "title": "Quick Switcher",
  "route": "/flockchat/quick-switcher",
  "zone": "community",
  "bridgePorts": [
    "getUser",
    "notify"
  ],
  "phase": "F5.6",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:44:24.995Z",
    "records": [
      {
        "id": "quick-switcher-001",
        "label": "Ctrl+K launcher",
        "area": "navigation",
        "status": "ready"
      },
      {
        "id": "quick-switcher-002",
        "label": "Jump list",
        "area": "navigation",
        "status": "ready"
      },
      {
        "id": "quick-switcher-003",
        "label": "Keyboard navigation",
        "area": "navigation",
        "status": "queued"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockChat Source Snapshot",
    "sourceScript": "flockchat-public/FlockChat.html",
    "sourceSurface": "quick-switcher",
    "syncedAt": "2026-04-26T22:44:24.995Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockchatQuickSwitcherModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKCHAT_QUICK_SWITCHER_MODULE, deps);
}
