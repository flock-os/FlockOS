import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_REPORTS_MODULE = {
  "id": "flockos.reports",
  "title": "Reports",
  "route": "/flockos/reports",
  "zone": "holy-of-holies",
  "bridgePorts": [
    "resolve",
    "getConfig"
  ],
  "phase": "F8.1",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:47:37.317Z",
    "records": [
      {
        "id": "rpt-001",
        "label": "Care trend",
        "status": "Needs Review",
        "delta": 12
      },
      {
        "id": "rpt-002",
        "label": "Outreach trend",
        "status": "In Progress",
        "delta": -3
      },
      {
        "id": "rpt-003",
        "label": "Youth trend",
        "status": "Ready",
        "delta": 8
      },
      {
        "id": "rpt-004",
        "label": "Hospitality trend",
        "status": "In Progress",
        "delta": 5
      },
      {
        "id": "rpt-005",
        "label": "Pastoral Care trend",
        "status": "Needs Review",
        "delta": 9
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.extra.statistics.snapshots.list",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:47:37.317Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosReportsModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_REPORTS_MODULE, deps);
}
