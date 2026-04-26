import { BRIDGE_EVENT_TOPICS, emitBridgeEvent } from "./events.js";

export function createRootShellAdapter(bridge) {
  return {
    navigate(path, context = {}) {
      const resolved = bridge.resolve(path, context);
      emitBridgeEvent(BRIDGE_EVENT_TOPICS.routeChanged, {
        path,
        found: resolved.found
      });
      return resolved;
    },

    getCurrentPath() {
      if (typeof window === "undefined") {
        return "/";
      }

      return window.location?.pathname || "/";
    }
  };
}
