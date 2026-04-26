import { FLOCKCHAT_MODULES } from "./modules/index.js";

function toFactoryNameFromId(moduleId) {
  const slug = moduleId.replace(/^flockchat\./, "");
  const pascal = slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return `createFlockchat${pascal}Module`;
}

export async function createFlockchatModuleById(moduleId, deps = {}) {
  const target = FLOCKCHAT_MODULES.find((module) => module.id === moduleId);
  if (!target) {
    return null;
  }

  const slug = moduleId.replace(/^flockchat\./, "");
  const mod = await import(`./modules/${slug}.module.js`);
  const factoryName = toFactoryNameFromId(moduleId);

  if (typeof mod[factoryName] === "function") {
    return mod[factoryName](deps);
  }

  return null;
}

export async function createFlockchatModuleByRoute(route, deps = {}) {
  const target = FLOCKCHAT_MODULES.find((module) => module.route === route);
  if (!target) {
    return null;
  }
  return createFlockchatModuleById(target.id, deps);
}
