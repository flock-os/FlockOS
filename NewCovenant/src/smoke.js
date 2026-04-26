export function runSmokeChecks(modules) {
  const checks = [];

  const configValue = modules.config.set("smoke.enabled", true);
  checks.push({
    name: "config: set/get works",
    pass: configValue === true && modules.config.get("smoke.enabled") === true,
    detail: "Expected persisted boolean flag"
  });

  modules.resolver.registerRoute("/smoke/:test", ({ params }) => params.test);
  const resolverResult = modules.resolver.resolveRoute("/smoke/router");
  checks.push({
    name: "resolver: dynamic route params",
    pass: resolverResult.found && resolverResult.value === "router",
    detail: "Expected dynamic segment extraction"
  });

  const authUser = modules.auth.signIn({ id: "smoke-user", name: "Smoke User" });
  const authCurrent = modules.auth.getCurrentUser();
  checks.push({
    name: "auth: session lifecycle",
    pass: authUser?.id === "smoke-user" && authCurrent?.id === "smoke-user",
    detail: "Expected signed-in user snapshot"
  });

  modules.auth.signOut();

  const beforeQueue = modules.offline.queue({ type: "smoke" });
  const flushed = modules.offline.flush();
  checks.push({
    name: "offline: queue and flush",
    pass: beforeQueue >= 1 && Array.isArray(flushed) && flushed.length >= 1,
    detail: "Expected queue drain during flush"
  });

  const notification = modules["ui-kit"].notify("Smoke check ping", "info");
  const rendered = modules["ui-kit"].renderState({ smoke: "ok" });
  checks.push({
    name: "ui-kit: notify and render",
    pass: notification?.message === "Smoke check ping" && typeof rendered === "string",
    detail: "Expected notification payload and rendered text"
  });

  const passed = checks.filter((check) => check.pass).length;
  const failed = checks.length - passed;

  return {
    checks,
    summary: {
      total: checks.length,
      passed,
      failed
    }
  };
}
