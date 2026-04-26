import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";

export const FLOCKOS_TODO_MODULE = {
  "id": "flockos.todo",
  "title": "Tasks",
  "route": "/flockos/todo",
  "zone": "gates",
  "bridgePorts": [
    "resolve",
    "getUser",
    "notify"
  ],
  "phase": "F5.2",
  "seedData": {
    "source": "live-snapshot-importer",
    "generatedAt": "2026-04-26T22:23:17.286Z",
    "records": [
      {
        "id": "todo-001",
        "label": "Tasks snapshot 1",
        "route": "/flockos/todo",
        "endpoint": "TheVine.flock.call (module-specific)",
        "status": "ready",
        "phase": "F5.2",
        "zone": "gates"
      },
      {
        "id": "todo-002",
        "label": "Tasks snapshot 2",
        "route": "/flockos/todo",
        "endpoint": "TheVine.flock.call (module-specific)",
        "status": "in-progress",
        "phase": "F5.2",
        "zone": "gates"
      },
      {
        "id": "todo-003",
        "label": "Tasks snapshot 3",
        "route": "/flockos/todo",
        "endpoint": "TheVine.flock.call (module-specific)",
        "status": "queued",
        "phase": "F5.2",
        "zone": "gates"
      }
    ]
  },
  "liveSource": {
    "provider": "FlockOS Source Snapshot",
    "endpoint": "TheVine.flock.call (module-specific)",
    "sourceScript": "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    "syncedAt": "2026-04-26T22:23:17.286Z",
    "refreshMode": "imported-static-snapshot"
  }
};

export function createFlockosTodoModule(deps = {}) {
  return createStandaloneFlockOSModule(FLOCKOS_TODO_MODULE, deps);
}
