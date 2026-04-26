import { ATOG_MODULES } from "./modules/index.js";

function toFactoryNameFromId(moduleId) {
  const slug = moduleId.replace(/^atog\./, "");
  const pascal = slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return `createAtog${pascal}Module`;
}

export async function createAtogModuleById(moduleId, deps = {}) {
  const target = ATOG_MODULES.find((module) => module.id === moduleId);
  if (!target) {
    return null;
  }

  const slug = moduleId.replace(/^atog\./, "");
  const mod = await import(`./modules/${slug}.module.js`);
  const factoryName = toFactoryNameFromId(moduleId);

  if (typeof mod[factoryName] === "function") {
    return mod[factoryName](deps);
  }

  return null;
}

export async function createAtogModuleByRoute(route, deps = {}) {
  const target = ATOG_MODULES.find((module) => module.route === route);
  if (!target) {
    return null;
  }
  return createAtogModuleById(target.id, deps);
}
