export function createBridgeRuntime({ modules, runSmokeChecks }) {
  if (!modules || typeof runSmokeChecks !== "function") {
    throw new Error("createBridgeRuntime requires modules and runSmokeChecks");
  }

  const uiKit = modules["ui-kit"];

  return {
    getConfig(key, fallback = null) {
      return modules.config.get(key, fallback);
    },

    resolve(path, context = {}) {
      return modules.resolver.resolveRoute(path, context);
    },

    getUser() {
      return modules.auth.getCurrentUser();
    },

    signIn(identity) {
      return modules.auth.signIn(identity);
    },

    signOut() {
      return modules.auth.signOut();
    },

    enqueueOffline(job) {
      return modules.offline.queue(job);
    },

    flushOffline() {
      return modules.offline.flush();
    },

    notify(message, level = "info") {
      return uiKit.notify(message, level);
    },

    renderAdminState(state) {
      return uiKit.renderState(state);
    },

    runSmoke() {
      return runSmokeChecks(modules);
    }
  };
}
