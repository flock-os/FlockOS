// Canonical module IDs used to unify overlapping legacy/spin-off surfaces.
// Left side: alias/legacy surface. Right side: canonical target.
export const FLOCKOS_MODULE_ALIASES = {
  "flockos.ministry": "flockos.ministries",
  "flockos.photos": "flockos.albums",
  "flockos.care": "flockos.counseling",
  "flockos.prayer-admin": "flockos.prayer",
  "flockos.quarterly": "flockos.services",
  "flockos.navigation-shell": "flockos.dashboard"
};

export function resolveFlockosCanonicalModuleId(moduleId) {
  return FLOCKOS_MODULE_ALIASES[moduleId] || moduleId;
}

export function resolveFlockosCanonicalRoute(route) {
  if (typeof route !== "string" || !route.startsWith("/flockos/")) {
    return route;
  }

  const id = `flockos.${route.slice("/flockos/".length)}`;
  const canonicalId = resolveFlockosCanonicalModuleId(id);
  return canonicalId.startsWith("flockos.")
    ? `/flockos/${canonicalId.slice("flockos.".length)}`
    : route;
}
