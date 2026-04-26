import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_DEPLOYMENT_GUIDE_MODULE = {
  "id": "flockos.deployment-guide",
  "title": "Deployment Guide",
  "route": "/flockos/deployment-guide",
  "zone": "foundation",
  "bridgePorts": [
    "resolve",
    "getConfig"
  ],
  "phase": "F5.1",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:48:53.797Z",
    "records": [
      {
        "id": "deploymentguide-001",
        "label": "Deployment Guide snapshot 1",
        "route": "/flockos/deployment-guide",
        "endpoint": "TheVine.flock.call (module-specific)",
        "status": "ready",
        "phase": "F5.1",
        "zone": "foundation"
      },
      {
        "id": "deploymentguide-002",
        "label": "Deployment Guide snapshot 2",
        "route": "/flockos/deployment-guide",
        "endpoint": "TheVine.flock.call (module-specific)",
        "status": "in-progress",
        "phase": "F5.1",
        "zone": "foundation"
      },
      {
        "id": "deploymentguide-003",
        "label": "Deployment Guide snapshot 3",
        "route": "/flockos/deployment-guide",
        "endpoint": "TheVine.flock.call (module-specific)",
        "status": "queued",
        "phase": "F5.1",
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

export function createFlockosDeploymentGuideModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_DEPLOYMENT_GUIDE_MODULE, deps);
}
