import { FLOCKOS_MODULES } from "./index.js";
import { resolveFlockosCanonicalModuleId } from "../moduleAliasMap.js";

function scoreModuleCandidate(module, canonicalId) {
  const bridgePorts = Array.isArray(module.bridgePorts) ? module.bridgePorts.length : 0;
  const exactCanonicalMatch = module.id === canonicalId ? 100 : 0;
  return exactCanonicalMatch + bridgePorts;
}

// Dedupes module aliases into one canonical module list.
export function buildFlockosCanonicalModules(modules = FLOCKOS_MODULES) {
  const bestByCanonicalId = new Map();

  modules.forEach((module) => {
    const canonicalId = resolveFlockosCanonicalModuleId(module.id);
    const candidate = {
      ...module,
      id: canonicalId,
      route: canonicalId.startsWith("flockos.")
        ? `/flockos/${canonicalId.slice("flockos.".length)}`
        : module.route,
      sourceId: module.id
    };

    const current = bestByCanonicalId.get(canonicalId);
    if (!current) {
      bestByCanonicalId.set(canonicalId, candidate);
      return;
    }

    const currentScore = scoreModuleCandidate(current, canonicalId);
    const nextScore = scoreModuleCandidate(candidate, canonicalId);
    if (nextScore > currentScore) {
      bestByCanonicalId.set(canonicalId, candidate);
    }
  });

  return [...bestByCanonicalId.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export const FLOCKOS_CANONICAL_MODULES = buildFlockosCanonicalModules();
