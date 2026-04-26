import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_ABOUT_MODULE = {
  "id": "flockos.about",
  "title": "About",
  "route": "/flockos/about",
  "zone": "foundation",
  "bridgePorts": [
    "resolve",
    "getConfig"
  ],
  "phase": "F5.0",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:48:53.797Z",
    "records": [
      {
        "id": "about-001",
        "label": "About snapshot 1",
        "route": "/flockos/about",
        "endpoint": "TheVine.flock.call (module-specific)",
        "status": "ready",
        "phase": "F5.0",
        "zone": "foundation"
      },
      {
        "id": "about-002",
        "label": "About snapshot 2",
        "route": "/flockos/about",
        "endpoint": "TheVine.flock.call (module-specific)",
        "status": "in-progress",
        "phase": "F5.0",
        "zone": "foundation"
      },
      {
        "id": "about-003",
        "label": "About snapshot 3",
        "route": "/flockos/about",
        "endpoint": "TheVine.flock.call (module-specific)",
        "status": "queued",
        "phase": "F5.0",
        "zone": "foundation"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.flock.call (module-specific)",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:48:53.797Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosAboutModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_ABOUT_MODULE, deps);
}
