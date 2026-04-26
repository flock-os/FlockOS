import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKCHAT_CHANNEL_DETAILS_MODULE = {
  "id": "flockchat.channel-details",
  "title": "Channel Details",
  "route": "/flockchat/channel-details",
  "zone": "conversation",
  "bridgePorts": [
    "getUser",
    "notify"
  ],
  "phase": "F5.4",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:48:53.882Z",
    "records": [
      {
        "id": "channel-details-001",
        "label": "Details pane",
        "area": "UI",
        "status": "ready"
      },
      {
        "id": "channel-details-002",
        "label": "Members and description",
        "area": "metadata",
        "status": "ready"
      },
      {
        "id": "channel-details-003",
        "label": "Leave channel flow",
        "area": "membership",
        "status": "queued"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockChat Source Snapshot",
    "sourceScript": "flockchat-public/FlockChat.html",
    "sourceSurface": "channel-details",
    "syncedAt": "2026-04-26T22:48:53.882Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockchatChannelDetailsModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKCHAT_CHANNEL_DETAILS_MODULE, deps);
}
