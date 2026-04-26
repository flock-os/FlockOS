import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKCHAT_SEARCH_MODULE = {
  "id": "flockchat.search",
  "title": "Search",
  "route": "/flockchat/search",
  "zone": "community",
  "bridgePorts": [
    "getUser",
    "notify"
  ],
  "phase": "F5.6",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:47:37.379Z",
    "records": [
      {
        "id": "search-001",
        "label": "Sidebar search",
        "scope": "channels+people",
        "status": "ready"
      },
      {
        "id": "search-002",
        "label": "Message search bar",
        "scope": "messages",
        "status": "ready"
      },
      {
        "id": "search-003",
        "label": "Thread filtering",
        "scope": "thread",
        "status": "in-progress"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockChat Source Snapshot",
    "sourceScript": "flockchat-public/FlockChat/the_word.js",
    "sourceSurface": "search",
    "syncedAt": "2026-04-26T22:47:37.379Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockchatSearchModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKCHAT_SEARCH_MODULE, deps);
}
