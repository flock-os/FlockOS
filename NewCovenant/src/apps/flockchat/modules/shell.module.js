import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKCHAT_SHELL_MODULE = {
  "id": "flockchat.shell",
  "title": "App Shell",
  "route": "/flockchat/shell",
  "zone": "shell",
  "bridgePorts": [
    "resolve",
    "getUser"
  ],
  "phase": "F5.1",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:48:53.882Z",
    "records": [
      {
        "id": "shell-001",
        "label": "Topbar and context header",
        "area": "layout",
        "status": "ready"
      },
      {
        "id": "shell-002",
        "label": "Sidebar, thread, details panes",
        "area": "layout",
        "status": "ready"
      },
      {
        "id": "shell-003",
        "label": "Bottom nav and responsive shell",
        "area": "mobile",
        "status": "queued"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockChat Source Snapshot",
    "sourceScript": "flockchat-public/FlockChat.html",
    "sourceSurface": "shell",
    "syncedAt": "2026-04-26T22:48:53.882Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockchatShellModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKCHAT_SHELL_MODULE, deps);
}
