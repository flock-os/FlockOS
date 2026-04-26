import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_MEMBER_CARDS_MODULE = {
  "id": "flockos.memberCards",
  "title": "Member Cards",
  "route": "/flockos/memberCards",
  "zone": "gates",
  "bridgePorts": [
    "resolve",
    "getUser",
    "getConfig"
  ],
  "phase": "F5.2",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:47:37.317Z",
    "records": [
      {
        "id": "mbr-001",
        "label": "Care Team card",
        "active": 8,
        "status": "active"
      },
      {
        "id": "mbr-002",
        "label": "Outreach Team card",
        "active": 6,
        "status": "active"
      },
      {
        "id": "mbr-003",
        "label": "Youth Team card",
        "active": 5,
        "status": "review"
      },
      {
        "id": "mbr-004",
        "label": "Worship Team card",
        "active": 7,
        "status": "active"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.flock.memberCards.list",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:47:37.317Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosMemberCardsModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_MEMBER_CARDS_MODULE, deps);
}
