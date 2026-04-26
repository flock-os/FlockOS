import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const ATOG_DEVOTIONS_MODULE = {
  "id": "atog.devotions",
  "title": "Devotion Plans",
  "route": "/atog/devotions",
  "zone": "rhythm",
  "bridgePorts": [
    "resolve",
    "getUser",
    "notify"
  ],
  "phase": "F5.5",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:47:37.379Z",
    "records": [
      {
        "id": "devotions-001",
        "label": "Devotion plans",
        "type": "plan",
        "status": "ready"
      },
      {
        "id": "devotions-002",
        "label": "Reading cadence",
        "type": "schedule",
        "status": "in-progress"
      },
      {
        "id": "devotions-003",
        "label": "Follow-up prompts",
        "type": "prompt",
        "status": "queued"
      }
    ]
  },
  "liveSource": {
    "provider": "ATOG Source Snapshot",
    "sourceScript": "Covenant/Courts/TheUpperRoom/ATOG.html",
    "syncedAt": "2026-04-26T22:47:37.379Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createAtogDevotionsModule(deps = {}) {
  return createStandaloneFlockOSModule(ATOG_DEVOTIONS_MODULE, deps);
}
