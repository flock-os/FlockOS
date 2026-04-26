import { FLOCKOS_MODULES } from "./modules/index.js";
import { resolveFlockosCanonicalModuleId, resolveFlockosCanonicalRoute } from "./moduleAliasMap.js";

function toFactoryNameFromId(moduleId) {
  const slug = moduleId.replace(/^flockos\./, "");
  const normalized = slug.replace(/([a-z])([A-Z])/g, "$1-$2");
  const pascal = normalized
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return `createFlockos${pascal}Module`;
}

export async function createFlockosModuleById(moduleId, deps = {}) {
  const canonicalId = resolveFlockosCanonicalModuleId(moduleId);
  const target = FLOCKOS_MODULES.find((module) => module.id === canonicalId)
    || FLOCKOS_MODULES.find((module) => module.id === moduleId);
  if (!target) {
    return null;
  }

  const slug = target.id.replace(/^flockos\./, "");
  const mod = await import(`./modules/${slug}.module.js`);
  const factoryName = toFactoryNameFromId(target.id);

  if (typeof mod[factoryName] === "function") {
    return mod[factoryName](deps);
  }

  return null;
}

export async function createFlockosModuleByRoute(route, deps = {}) {
  const canonicalRoute = resolveFlockosCanonicalRoute(route);
  const target = FLOCKOS_MODULES.find((module) => module.route === canonicalRoute)
    || FLOCKOS_MODULES.find((module) => module.route === route);
  if (!target) {
    return null;
  }
  return createFlockosModuleById(target.id, deps);
}
