/**
 * WEAVE_MANIFEST — canonical list of all NewCovenant module extraction targets.
 *
 * Phase conventions (current runtime phase: F4.6):
 *   phase ≤ F4.6  → rendered as "complete" in the Project Map
 *   phase = F4.6  → rendered as "active"
 *   phase > F4.6  → rendered as "planned" or "queued"
 *
 * Modules reflect the full real FlockOS nav surface (the_good_shepherd.html)
 * and ATOG (TheUpperRoom), organized by extraction roadmap phase.
 */
import { FLOCKOS_CANONICAL_MODULES } from "../apps/flockos/modules/canonicalIndex.js";
import { ATOG_MODULES } from "../apps/atog/modules/index.js";
import { FLOCKCHAT_MODULES } from "../apps/flockchat/modules/index.js";

export const WEAVE_MANIFEST = {
  version: "0.2.0",
  tracks: [
    // ── FlockOS ──────────────────────────────────────────────────────
    // Legacy FlockOS is the source of truth; these phases represent
    // when each module will be extracted as a standalone bridge module.
    {
      app: "FlockOS",
      status: "in-progress",
      modules: FLOCKOS_CANONICAL_MODULES
    },

    {
      app: "ATOG",
      status: "planned",
      modules: ATOG_MODULES
    },

    // ── FlockChat ─────────────────────────────────────────────────────
    {
      app: "FlockChat",
      status: "planned",
      modules: FLOCKCHAT_MODULES
    }
  ]
};

export function summarizeWeaveManifest(manifest = WEAVE_MANIFEST) {
  const allModules = manifest.tracks.flatMap((track) => track.modules);

  // Zone breakdown across all tracks
  const zoneStats = new Map();
  allModules.forEach((module) => {
    const zone = module.zone || "general";
    zoneStats.set(zone, (zoneStats.get(zone) || 0) + 1);
  });

  const appSummaries = manifest.tracks.map((track) => {
    const zones = [...new Set(track.modules.map((m) => m.zone || "general"))];
    return {
      app: track.app,
      status: track.status,
      modules: track.modules.length,
      zones,
      ready: track.status === "in-progress" ? 1 : 0
    };
  });

  return {
    version: manifest.version,
    totalApps: manifest.tracks.length,
    totalModules: allModules.length,
    totalZones: zoneStats.size,
    zoneBreakdown: Object.fromEntries(zoneStats),
    appSummaries,
    moduleIds: allModules.map((module) => module.id)
  };
}
