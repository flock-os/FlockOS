const globalRoot = typeof window !== "undefined" ? window : globalThis;

function hasPath(path) {
  return path.split(".").every((segment) => {
    if (!segment) {
      return false;
    }

    if (typeof hasPath.cursor === "undefined") {
      hasPath.cursor = globalRoot;
    }

    if (hasPath.cursor && Object.prototype.hasOwnProperty.call(hasPath.cursor, segment)) {
      hasPath.cursor = hasPath.cursor[segment];
      return true;
    }

    return false;
  });
}

function probe(path) {
  hasPath.cursor = undefined;
  return hasPath(path);
}

export const PORT_MAP = [
  {
    bridgePort: "getConfig",
    targetSurface: "FlockOS.configStore",
    availabilityProbe: () => probe("FlockOS.configStore")
  },
  {
    bridgePort: "resolve",
    targetSurface: "FlockOS.router.resolve",
    availabilityProbe: () => probe("FlockOS.router.resolve")
  },
  {
    bridgePort: "getUser",
    targetSurface: "FlockOS.auth.getCurrentUser",
    availabilityProbe: () => probe("FlockOS.auth.getCurrentUser")
  },
  {
    bridgePort: "enqueueOffline",
    targetSurface: "FlockOS.offline.enqueue",
    availabilityProbe: () => probe("FlockOS.offline.enqueue")
  },
  {
    bridgePort: "notify",
    targetSurface: "FlockOS.ui.notify",
    availabilityProbe: () => probe("FlockOS.ui.notify")
  }
];

export function evaluatePortMap() {
  const rows = PORT_MAP.map((item) => {
    const available = item.availabilityProbe();
    return {
      bridgePort: item.bridgePort,
      targetSurface: item.targetSurface,
      available
    };
  });

  return {
    rows,
    summary: {
      total: rows.length,
      available: rows.filter((row) => row.available).length,
      missing: rows.filter((row) => !row.available).length
    }
  };
}
