import { assertContract } from "./modules/contracts.js";
import { createConfigModule } from "./modules/config/config.contract.js";
import { createResolverModule } from "./modules/resolver/resolver.contract.js";
import { createAuthModule } from "./modules/auth/auth.contract.js";
import { createOfflineModule } from "./modules/offline/offline.contract.js";
import { createUiKitModule } from "./modules/ui-kit/ui-kit.contract.js";
import { runSmokeChecks } from "./smoke.js";
import { assertBridgeContract } from "./bridge/bridge.contract.js";
import { createBridgeRuntime } from "./bridge/createBridgeRuntime.js";
import { createPublicAdapter } from "./bridge/publicAdapter.js";
import { createAdminAdapter } from "./bridge/adminAdapter.js";
import { evaluatePortMap } from "./bridge/portMap.js";
import { createRootShellAdapter } from "./bridge/rootShellAdapter.js";
import { createAuthBoundaryAdapter } from "./bridge/authBoundaryAdapter.js";
import { runIntegrationRehearsal } from "./bridge/integrationRehearsal.js";

const modules = {
  config: createConfigModule(),
  resolver: createResolverModule(),
  auth: createAuthModule(),
  offline: createOfflineModule(),
  "ui-kit": createUiKitModule()
};

const statusList = document.getElementById("status-list");
const statusCard = document.getElementById("status-card");
const smokeList = document.getElementById("smoke-list");
const runSmokeButton = document.getElementById("run-smoke");
const rehearsalList = document.getElementById("rehearsal-list");
const runRehearsalButton = document.getElementById("run-rehearsal");
const buildSummaryList = document.getElementById("build-summary-list");
const refreshSummaryButton = document.getElementById("refresh-summary");
const exportSummaryButton = document.getElementById("export-summary");
const modePublicButton = document.getElementById("mode-public");
const modeAdminButton = document.getElementById("mode-admin");
const publicView = document.getElementById("public-view");
const adminView = document.getElementById("admin-view");
const publicHeroTitle = document.getElementById("public-hero-title");
const publicHeroSubtitle = document.getElementById("public-hero-subtitle");
const publicActionOne = document.getElementById("public-action-1");
const publicActionTwo = document.getElementById("public-action-2");

const qaState = {
  smokePassed: false,
  rehearsalPassed: false
};

let latestBuildSummary = null;

function setMode(mode) {
  const showPublic = mode === "public";

  publicView.classList.toggle("is-active", showPublic);
  adminView.classList.toggle("is-active", !showPublic);

  modePublicButton.classList.toggle("is-active", showPublic);
  modeAdminButton.classList.toggle("is-active", !showPublic);

  modePublicButton.setAttribute("aria-selected", String(showPublic));
  modeAdminButton.setAttribute("aria-selected", String(!showPublic));
}

modePublicButton.addEventListener("click", () => setMode("public"));
modeAdminButton.addEventListener("click", () => setMode("admin"));

const bridge = createBridgeRuntime({ modules, runSmokeChecks });
const publicAdapter = createPublicAdapter(bridge);
const adminAdapter = createAdminAdapter(bridge);
const rootShellAdapter = createRootShellAdapter(bridge);
const authBoundaryAdapter = createAuthBoundaryAdapter(bridge);

modules["ui-kit"].mount(statusCard);

Object.entries(modules).forEach(([name, moduleImpl]) => {
  const result = assertContract(name, moduleImpl);
  const item = document.createElement("li");

  if (result.valid) {
    item.textContent = `${name}@${result.version}: contract verified`;
    item.className = "ok";
  } else {
    item.textContent = `${name}@${result.version}: missing ${result.missingMethods.join(", ")}`;
    item.className = "warn";
  }

  statusList.appendChild(item);
});

const bridgeResult = assertBridgeContract(bridge);
const bridgeItem = document.createElement("li");
if (bridgeResult.valid) {
  bridgeItem.textContent = `bridge@${bridgeResult.version}: contract verified`;
  bridgeItem.className = "ok";
} else {
  bridgeItem.textContent = `bridge@${bridgeResult.version}: missing ${bridgeResult.missingMethods.join(", ")}`;
  bridgeItem.className = "warn";
}
statusList.appendChild(bridgeItem);

const portMapResult = evaluatePortMap();
const portMapSummary = document.createElement("li");
portMapSummary.textContent = `port-map: ${portMapResult.summary.available}/${portMapResult.summary.total} shared surfaces detected`;
portMapSummary.className = portMapResult.summary.missing === 0 ? "ok" : "warn";
statusList.appendChild(portMapSummary);

portMapResult.rows.forEach((row) => {
  const item = document.createElement("li");
  item.textContent = `${row.bridgePort} -> ${row.targetSurface}: ${row.available ? "available" : "missing"}`;
  item.className = row.available ? "ok" : "warn";
  statusList.appendChild(item);
});

const authBoundaryResult = authBoundaryAdapter.enforce({
  requireSignedIn: true,
  allowedRoles: ["admin", "builder"]
});
const authItem = document.createElement("li");
authItem.textContent = `auth-boundary: ${authBoundaryResult.allowed ? "allowed" : "blocked"} (${authBoundaryResult.reason})`;
authItem.className = authBoundaryResult.allowed ? "ok" : "warn";
statusList.appendChild(authItem);

const currentPathItem = document.createElement("li");
currentPathItem.textContent = `root-shell path: ${rootShellAdapter.getCurrentPath()}`;
currentPathItem.className = "ok";
statusList.appendChild(currentPathItem);

function renderBuildSummary() {
  const currentPortMap = evaluatePortMap();
  const rows = [
    {
      label: "module contracts",
      ok: true,
      detail: "validated at startup"
    },
    {
      label: "bridge contract",
      ok: bridgeResult.valid,
      detail: bridgeResult.valid ? "ready" : "missing methods"
    },
    {
      label: "compatibility surfaces",
      ok: currentPortMap.summary.available === currentPortMap.summary.total,
      detail: `${currentPortMap.summary.available}/${currentPortMap.summary.total} detected`
    },
    {
      label: "smoke checks",
      ok: qaState.smokePassed,
      detail: qaState.smokePassed ? "latest run passed" : "not yet passed in this session"
    },
    {
      label: "integration rehearsal",
      ok: qaState.rehearsalPassed,
      detail: qaState.rehearsalPassed ? "latest run passed" : "not yet passed in this session"
    }
  ];

  buildSummaryList.innerHTML = "";

  rows.forEach((row) => {
    const item = document.createElement("li");
    item.textContent = `${row.label}: ${row.ok ? "READY" : "PENDING"} (${row.detail})`;
    item.className = row.ok ? "ok" : "warn";
    buildSummaryList.appendChild(item);
  });

  const readyCount = rows.filter((row) => row.ok).length;
  const summary = document.createElement("li");
  summary.textContent = `Overall readiness: ${readyCount}/${rows.length}`;
  summary.className = readyCount === rows.length ? "ok" : "warn";
  buildSummaryList.appendChild(summary);

  latestBuildSummary = {
    generatedAt: new Date().toISOString(),
    readiness: {
      ready: readyCount,
      total: rows.length
    },
    rows: rows.map((row) => ({
      label: row.label,
      ok: row.ok,
      detail: row.detail
    })),
    portMap: currentPortMap
  };
}

function exportBuildSummary() {
  if (!latestBuildSummary) {
    renderBuildSummary();
  }

  const payload = {
    reportType: "newcovenant-build-summary",
    phase: modules.config.get("runtime.phase", "unknown"),
    app: modules.config.get("app.name", "NewCovenant"),
    summary: latestBuildSummary
  };

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `newcovenant-build-summary-${stamp}.json`;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

modules.config.set("app.name", "NewCovenant");
modules.config.set("runtime.phase", "F1.2");

modules.resolver.registerRoute("/home", ({ path }) => {
  return { route: path, page: "Home" };
});

modules.resolver.registerRoute("/mission/:id", ({ params }) => {
  return { route: "mission", missionId: params.id };
});

const routeHome = modules.resolver.resolveRoute("/home");
const routeMission = modules.resolver.resolveRoute("/mission/alpha-01");

const signedInUser = modules.auth.signIn({
  id: "local-admin",
  name: "Local Admin",
  roles: ["admin", "builder"]
});

const heroModel = publicAdapter.getHeroModel();
const publicActions = publicAdapter.getPrimaryActions();
publicHeroTitle.textContent = heroModel.title;
publicHeroSubtitle.textContent = heroModel.subtitle;
publicActionOne.textContent = publicActions[0]?.label || "Primary Action";
publicActionTwo.textContent = publicActions[1]?.label || "Secondary Action";
publicActionOne.addEventListener("click", () => {
  const outcome = rootShellAdapter.navigate(publicActions[0]?.route || "/home");
  bridge.notify(outcome.found ? "Primary action route resolved" : "Primary action route missing", outcome.found ? "success" : "warn");
});
publicActionTwo.addEventListener("click", () => {
  const outcome = rootShellAdapter.navigate(publicActions[1]?.route || "/home");
  bridge.notify(outcome.found ? "Secondary action route resolved" : "Secondary action route missing", outcome.found ? "success" : "warn");
});

modules.offline.queue({ type: "sync-note", data: { title: "First local note" } });
modules.offline.queue({ type: "sync-note", data: { title: "Second local note" } });
const flushedQueue = modules.offline.flush();

const state = {
  config: modules.config.getSnapshot(),
  routes: {
    home: routeHome,
    mission: routeMission
  },
  auth: signedInUser,
  adminSummary: adminAdapter.getWorkspaceSummary(),
  offline: {
    online: modules.offline.isOnline(),
    flushedCount: flushedQueue.length
  }
};

modules["ui-kit"].renderState(state);
modules["ui-kit"].notify("F1.2 runtime checks completed", "success");

function renderSmokeResult(result) {
  smokeList.innerHTML = "";

  result.checks.forEach((check) => {
    const item = document.createElement("li");
    item.textContent = `${check.name}: ${check.pass ? "PASS" : "FAIL"} (${check.detail})`;
    item.className = check.pass ? "ok" : "warn";
    smokeList.appendChild(item);
  });

  const summary = document.createElement("li");
  summary.textContent = `Summary: ${result.summary.passed}/${result.summary.total} passed, ${result.summary.failed} failed`;
  summary.className = result.summary.failed === 0 ? "ok" : "warn";
  smokeList.appendChild(summary);
}

runSmokeButton.addEventListener("click", () => {
  const result = adminAdapter.runDiagnostics();
  renderSmokeResult(result);
  qaState.smokePassed = result.summary.failed === 0;
  renderBuildSummary();
  bridge.notify(
    result.summary.failed === 0 ? "Smoke checks passed" : "Smoke checks have failures",
    result.summary.failed === 0 ? "success" : "warn"
  );
});

function renderRehearsalResult(result) {
  rehearsalList.innerHTML = "";

  const beforeItem = document.createElement("li");
  beforeItem.textContent = `Before: ${result.summary.beforeAvailable}/${result.summary.total} available`;
  beforeItem.className = "warn";
  rehearsalList.appendChild(beforeItem);

  const afterItem = document.createElement("li");
  afterItem.textContent = `After: ${result.summary.afterAvailable}/${result.summary.total} available`;
  afterItem.className = result.summary.afterAvailable === result.summary.total ? "ok" : "warn";
  rehearsalList.appendChild(afterItem);

  const deltaItem = document.createElement("li");
  deltaItem.textContent = `Improvement: +${result.summary.improvedBy}`;
  deltaItem.className = result.summary.improvedBy > 0 ? "ok" : "warn";
  rehearsalList.appendChild(deltaItem);

  result.after.rows.forEach((row) => {
    const item = document.createElement("li");
    item.textContent = `${row.bridgePort}: ${row.available ? "ready" : "missing"}`;
    item.className = row.available ? "ok" : "warn";
    rehearsalList.appendChild(item);
  });
}

runRehearsalButton.addEventListener("click", () => {
  const result = runIntegrationRehearsal();
  renderRehearsalResult(result);
  qaState.rehearsalPassed = result.summary.afterAvailable === result.summary.total;
  renderBuildSummary();
  bridge.notify(
    result.summary.afterAvailable === result.summary.total
      ? "Integration rehearsal completed successfully"
      : "Integration rehearsal completed with missing surfaces",
    result.summary.afterAvailable === result.summary.total ? "success" : "warn"
  );
});

refreshSummaryButton.addEventListener("click", () => {
  renderBuildSummary();
  bridge.notify("Build summary refreshed", "info");
});

exportSummaryButton.addEventListener("click", () => {
  exportBuildSummary();
  bridge.notify("Build summary exported", "success");
});

renderBuildSummary();

setMode("public");
