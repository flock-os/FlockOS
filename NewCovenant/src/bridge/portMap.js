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
    bridgePort: "flushOffline",
    targetSurface: "FlockOS.offline.flush",
    availabilityProbe: () => probe("FlockOS.offline.flush")
  },
  {
    bridgePort: "notify",
    targetSurface: "FlockOS.ui.notify",
    availabilityProbe: () => probe("FlockOS.ui.notify")
  },
  {
    bridgePort: "renderAdminState",
    targetSurface: "FlockOS.admin.renderState",
    availabilityProbe: () => probe("FlockOS.admin.renderState")
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

/**
 * auditManifestBridgeCoverage
 *
 * For each module in the weave manifest, checks whether every bridgePort
 * it declares is registered in the PORT_MAP. Returns a per-module report
 * and an overall gap list.
 *
 * @param {object} manifest - WEAVE_MANIFEST
 * @returns {{ covered: string[], gaps: string[], moduleReports: Array }}
 */
export function auditManifestBridgeCoverage(manifest) {
  const knownPorts = new Set(PORT_MAP.map((item) => item.bridgePort));
  const gapSet = new Set();
  const moduleReports = [];

  manifest.tracks.forEach((track) => {
    track.modules.forEach((module) => {
      const ports = Array.isArray(module.bridgePorts) ? module.bridgePorts : [];
      const missing = ports.filter((port) => !knownPorts.has(port));
      const covered = ports.filter((port) => knownPorts.has(port));

      missing.forEach((port) => gapSet.add(port));

      moduleReports.push({
        moduleId: module.id,
        app: track.app,
        zone: module.zone || "general",
        phase: module.phase,
        totalPorts: ports.length,
        coveredCount: covered.length,
        missingCount: missing.length,
        missingPorts: missing,
        allCovered: missing.length === 0
      });
    });
  });

  return {
    covered: [...knownPorts],
    gaps: [...gapSet].sort(),
    totalModules: moduleReports.length,
    fullyCoveredModules: moduleReports.filter((r) => r.allCovered).length,
    moduleReports
  };
}
