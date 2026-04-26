export const BRIDGE_EVENT_TOPICS = {
  authChanged: "newcovenant:auth-changed",
  routeChanged: "newcovenant:route-changed",
  offlineQueued: "newcovenant:offline-queued",
  offlineFlushed: "newcovenant:offline-flushed"
};

export function emitBridgeEvent(topic, detail) {
  if (typeof window === "undefined") {
    return false;
  }

  window.dispatchEvent(new CustomEvent(topic, { detail }));
  return true;
}
