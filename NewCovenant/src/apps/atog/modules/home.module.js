import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const ATOG_HOME_MODULE = {
  "id": "atog.home",
  "title": "Home",
  "route": "/atog/home",
  "zone": "foundation",
  "bridgePorts": [
    "resolve",
    "getConfig"
  ],
  "phase": "F5.0",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:44:24.995Z",
    "records": [
      {
        "id": "home-001",
        "label": "Hero and invitation hub",
        "section": "landing",
        "status": "ready"
      },
      {
        "id": "home-002",
        "label": "Great Invitations sequence",
        "section": "invitations",
        "status": "ready"
      },
      {
        "id": "home-003",
        "label": "I AM declarations navigator",
        "section": "identity",
        "status": "in-progress"
      },
      {
        "id": "home-004",
        "label": "Finished Work timeline",
        "section": "timeline",
        "status": "queued"
      }
    ]
  },
  "liveSource": {
    "provider": "ATOG Source Snapshot",
    "sourceScript": "Covenant/Courts/TheUpperRoom/ATOG.html",
    "sourceSurface": "home",
    "syncedAt": "2026-04-26T22:44:24.995Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createAtogHomeModule(deps = {}) {
  return createStandaloneFlockOSModule(ATOG_HOME_MODULE, deps);
}
