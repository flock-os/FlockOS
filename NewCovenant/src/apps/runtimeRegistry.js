import { createFlockosModuleById, createFlockosModuleByRoute } from "./flockos/runtimeRegistry.js";
import { createAtogModuleById, createAtogModuleByRoute } from "./atog/runtimeRegistry.js";
import { createFlockchatModuleById, createFlockchatModuleByRoute } from "./flockchat/runtimeRegistry.js";

export async function createModuleById(moduleId, deps = {}) {
  if (moduleId.startsWith("flockos.")) {
    return createFlockosModuleById(moduleId, deps);
  }
  if (moduleId.startsWith("atog.")) {
    return createAtogModuleById(moduleId, deps);
  }
  if (moduleId.startsWith("flockchat.")) {
    return createFlockchatModuleById(moduleId, deps);
  }
  return null;
}

export async function createModuleByRoute(route, deps = {}) {
  if (route.startsWith("/flockos/")) {
    return createFlockosModuleByRoute(route, deps);
  }
  if (route.startsWith("/atog/")) {
    return createAtogModuleByRoute(route, deps);
  }
  if (route.startsWith("/flockchat/")) {
    return createFlockchatModuleByRoute(route, deps);
  }
  return null;
}
