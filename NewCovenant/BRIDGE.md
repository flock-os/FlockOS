# NewCovenant Bridge Layer

This bridge creates a stable integration surface between standalone NewCovenant modules and future shared FlockOS surfaces.

## Why this exists

- Preserve standalone velocity in NewCovenant.
- Avoid direct coupling to deployment-specific infrastructure.
- Keep public and admin experiences aligned on the same runtime ports.

## Files

- src/bridge/bridge.contract.js
- src/bridge/createBridgeRuntime.js
- src/bridge/publicAdapter.js
- src/bridge/adminAdapter.js
- src/bridge/portMap.js
- src/bridge/events.js
- src/bridge/rootShellAdapter.js
- src/bridge/authBoundaryAdapter.js
- src/bridge/integrationRehearsal.js

## Runtime contract ports

- getConfig
- resolve
- getUser
- signIn
- signOut
- enqueueOffline
- flushOffline
- notify
- renderAdminState
- runSmoke

## Adapter intent

- publicAdapter: produces model data for story-first public UI blocks.
- adminAdapter: exposes operational summaries and diagnostics methods.

## Boundary guarantee

This layer is standalone-only and does not touch Nations deployments.

## F2.2 compatibility mapping

- Port map defines bridge-to-FlockOS target surfaces with availability probes.
- Event map defines portable bridge event topics for auth, route, and offline transitions.
- Current implementation is probe-based for safe standalone development.

## F2.3 compatibility adapters

- rootShellAdapter: navigation handoff and route-change event emission.
- authBoundaryAdapter: route-level auth checks and boundary enforcement events.

## F2.4 integration rehearsal

- integrationRehearsal runs safe before/after compatibility probes.
- Rehearsal uses temporary mock shared surfaces and restores prior global state.
