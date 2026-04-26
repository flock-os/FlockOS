export function createAdminAdapter(bridge) {
  return {
    getWorkspaceSummary() {
      const user = bridge.getUser();
      return {
        user,
        online: typeof navigator === "undefined" ? true : navigator.onLine,
        appName: bridge.getConfig("app.name", "NewCovenant")
      };
    },

    runDiagnostics() {
      return bridge.runSmoke();
    }
  };
}
