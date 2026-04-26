import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKCHAT_INVITE_ROOM_MODULE = {
  "id": "flockchat.invite-room",
  "title": "Invite to Channel",
  "route": "/flockchat/invite-room",
  "zone": "administration",
  "bridgePorts": [
    "getUser",
    "notify"
  ],
  "phase": "F5.5",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:44:24.995Z",
    "records": [
      {
        "id": "invite-room-001",
        "label": "Invite to room modal",
        "area": "modal",
        "status": "ready"
      },
      {
        "id": "invite-room-002",
        "label": "Membership invite dispatch",
        "area": "modal",
        "status": "in-progress"
      },
      {
        "id": "invite-room-003",
        "label": "Room label and user select",
        "area": "modal",
        "status": "queued"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockChat Source Snapshot",
    "sourceScript": "flockchat-public/FlockChat.html",
    "sourceSurface": "invite-room",
    "syncedAt": "2026-04-26T22:44:24.995Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockchatInviteRoomModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKCHAT_INVITE_ROOM_MODULE, deps);
}
