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
import { WEAVE_MANIFEST, summarizeWeaveManifest } from "./weave/weaveManifest.js";
import { SITE_WEAVE_CONTENT, getWeaveOrder } from "./weave/siteWeaveContent.js";
import { FLOCKOS_SHELL_DATA } from "./weave/flockosShellSurfaceData.js";
import { BRAND } from "./brand.js";

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
const summaryHistoryList = document.getElementById("summary-history-list");
const captureSummaryButton = document.getElementById("capture-summary");
const clearHistoryButton = document.getElementById("clear-history");
const weaveRoadmapList = document.getElementById("weave-roadmap-list");
const refreshWeaveButton = document.getElementById("refresh-weave");
const modePublicButton = document.getElementById("mode-public");
const modeAdminButton = document.getElementById("mode-admin");
const publicView = document.getElementById("public-view");
const adminView = document.getElementById("admin-view");
const publicHeroTitle = document.getElementById("public-hero-title");
const publicHeroSubtitle = document.getElementById("public-hero-subtitle");
const publicActionOne = document.getElementById("public-action-1");
const publicActionTwo = document.getElementById("public-action-2");
const weaveStreamGrid = document.getElementById("weave-stream-grid");
const weekTimeline = document.getElementById("week-timeline");
const chatPulse = document.getElementById("chat-pulse");
const projectMapSummary = document.getElementById("project-map-summary");
const projectMapPhase = document.getElementById("project-map-phase");
const projectMapProgress = document.getElementById("project-map-progress");
const projectMapUpdated = document.getElementById("project-map-updated");
const projectMapPhaseBuckets = document.getElementById("project-map-phase-buckets");
const projectMapPlatforms = document.getElementById("project-map-platforms");
const projectMapTracks = document.getElementById("project-map-tracks");
const refreshProjectMapButton = document.getElementById("refresh-project-map");
const shellMissionSummary = document.getElementById("shell-mission-summary");
const shellStatusFilter = document.getElementById("shell-status-filter");
const shellMissions = document.getElementById("shell-missions");
const shellTeams = document.getElementById("shell-teams");
const shellActions = document.getElementById("shell-actions");
const shellCurrentPath = document.getElementById("shell-current-path");
const shellRouteButtons = document.querySelectorAll(".shell-route-btn");
const shellHandoffStatus = document.getElementById("shell-handoff-status");
const shellHandoffContext = document.getElementById("shell-handoff-context");
const shellActionRollup = document.getElementById("shell-action-rollup");
const shellResetActionsButton = document.getElementById("shell-reset-actions");
const shellHandoffRollup = document.getElementById("shell-handoff-rollup");
const shellGateRollup = document.getElementById("shell-gate-rollup");
const shellEscalationSummary = document.getElementById("shell-escalation-summary");
const shellEscalationList = document.getElementById("shell-escalation-list");
const shellExportEscalationButton = document.getElementById("shell-export-escalation");
const shellExportEscalationMarkdownButton = document.getElementById("shell-export-escalation-md");
const shellCopyEscalationBriefButton = document.getElementById("shell-copy-escalation-brief");
const shellEscalationExportStatus = document.getElementById("shell-escalation-export-status");

const ACTION_STATE_KEY = "newcovenant.flockos.action-state.v1";
const MISSION_STATE_KEY = "newcovenant.flockos.mission-state.v1";
const DAY_INDEX = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6
};
const PRIORITY_WEIGHT = {
  urgent: 40,
  high: 30,
  medium: 20,
  low: 10
};
const BLOCKER_WEIGHT = {
  "pastoral-care": 18,
  budget: 14,
  staffing: 12,
  "service-order": 10,
  general: 8
};
const MISSION_STATUS_WEIGHT = {
  "Needs Review": 8,
  "In Progress": 12,
  Ready: 6
};
const PLATFORM_PARITY_TARGETS = BRAND.deploymentSurfaces.map((s) => s.label);

const qaState = {
  smokePassed: false,
  rehearsalPassed: false
};

let latestBuildSummary = null;
let summaryHistory = [];
let actionState = loadActionState();
let missionState = loadMissionState();
let latestEscalationRows = [];

function loadActionState() {
  try {
    const raw = sessionStorage.getItem(ACTION_STATE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveActionState() {
  try {
    sessionStorage.setItem(ACTION_STATE_KEY, JSON.stringify(actionState));
  } catch {
    // Keep runtime functional even if storage is unavailable.
  }
}

function loadMissionState() {
  try {
    const raw = sessionStorage.getItem(MISSION_STATE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveMissionState() {
  try {
    sessionStorage.setItem(MISSION_STATE_KEY, JSON.stringify(missionState));
  } catch {
    // Keep runtime functional even if storage is unavailable.
  }
}

function getActionStatus(actionId) {
  return actionState[actionId] || "pending";
}

function setActionStatus(actionId, status) {
  actionState[actionId] = status;
  saveActionState();
}

function getMissionStatus(missionId) {
  return missionState[missionId] || "pending";
}

function setMissionStatus(missionId, status) {
  missionState[missionId] = status;
  saveMissionState();
}

function getActionById(actionId) {
  return FLOCKOS_SHELL_DATA.actionQueue.find((action) => action.id === actionId) || null;
}

function areMissionDependenciesComplete(mission) {
  const required = Array.isArray(mission.requiredActions) ? mission.requiredActions : [];
  return required.every((actionId) => getActionStatus(actionId) === "complete");
}

function getMissingDependencies(mission) {
  const required = Array.isArray(mission.requiredActions) ? mission.requiredActions : [];
  return required.filter((actionId) => getActionStatus(actionId) !== "complete");
}

function enforceMissionGates() {
  let changed = false;

  FLOCKOS_SHELL_DATA.missions.forEach((mission) => {
    if (getMissionStatus(mission.id) === "complete" && !areMissionDependenciesComplete(mission)) {
      missionState[mission.id] = "pending";
      changed = true;
    }
  });

  if (changed) {
    saveMissionState();
  }
}

function computeActionRollup() {
  const total = FLOCKOS_SHELL_DATA.actionQueue.length;
  const complete = FLOCKOS_SHELL_DATA.actionQueue.filter((action) => getActionStatus(action.id) === "complete").length;
  const inProgress = FLOCKOS_SHELL_DATA.actionQueue.filter((action) => getActionStatus(action.id) === "in-progress").length;
  const pending = total - complete - inProgress;
  return { total, complete, inProgress, pending };
}

function computeMissionRollup() {
  const total = FLOCKOS_SHELL_DATA.missions.length;
  const complete = FLOCKOS_SHELL_DATA.missions.filter((mission) => getMissionStatus(mission.id) === "complete").length;
  const unlocked = FLOCKOS_SHELL_DATA.missions.filter((mission) => areMissionDependenciesComplete(mission)).length;
  const locked = total - unlocked;
  return { total, complete, unlocked, locked };
}

function getDaysUntilDue(dueLabel) {
  const dueIndex = DAY_INDEX[dueLabel];
  if (typeof dueIndex !== "number") {
    return 7;
  }

  const today = new Date().getDay();
  const delta = (dueIndex - today + 7) % 7;
  return delta;
}

function getDueWeight(dueLabel) {
  const delta = getDaysUntilDue(dueLabel);
  if (delta === 0) {
    return 36;
  }
  if (delta === 1) {
    return 30;
  }
  if (delta <= 2) {
    return 24;
  }
  if (delta <= 4) {
    return 16;
  }
  return 10;
}

function deriveUrgencyLevel(score) {
  if (score >= 74) {
    return "critical";
  }
  if (score >= 56) {
    return "high";
  }
  if (score >= 40) {
    return "moderate";
  }
  return "watch";
}

function scoreEscalation(mission, action, blockerType) {
  const priorityWeight = PRIORITY_WEIGHT[action.priority] || PRIORITY_WEIGHT.medium;
  const blockerWeight = BLOCKER_WEIGHT[blockerType] || BLOCKER_WEIGHT.general;
  const dueWeight = getDueWeight(mission.due);
  const missionWeight = MISSION_STATUS_WEIGHT[mission.status] || 6;
  const score = priorityWeight + blockerWeight + dueWeight + missionWeight;

  return {
    score,
    level: deriveUrgencyLevel(score),
    dueInDays: getDaysUntilDue(mission.due)
  };
}

function buildEscalationRows(missions) {
  const rows = [];

  missions.forEach((mission) => {
    if (getMissionStatus(mission.id) === "complete") {
      return;
    }

    const missing = getMissingDependencies(mission);
    missing.forEach((actionId) => {
      const action = getActionById(actionId);
      if (!action) {
        return;
      }

      const urgency = scoreEscalation(mission, action, action.blockerType || "general");

      rows.push({
        mission,
        action,
        blockerType: action.blockerType || "general",
        urgencyScore: urgency.score,
        urgencyLevel: urgency.level,
        dueInDays: urgency.dueInDays
      });
    });
  });

  rows.sort((a, b) => {
    if (b.urgencyScore !== a.urgencyScore) {
      return b.urgencyScore - a.urgencyScore;
    }
    if (a.dueInDays !== b.dueInDays) {
      return a.dueInDays - b.dueInDays;
    }
    return a.mission.id.localeCompare(b.mission.id);
  });

  return rows;
}

function triggerEscalationHandoff(row) {
  if (getActionStatus(row.action.id) === "pending") {
    setActionStatus(row.action.id, "in-progress");
  }

  const outcome = rootShellAdapter.navigate(row.action.targetRoute);
  const escalationPayload = {
    id: `${row.action.id}-ESC`,
    title: `Escalation for ${row.mission.id}: ${row.action.title}`,
    priority: row.action.priority,
    targetRoom: row.action.targetRoom,
    targetRoute: row.action.targetRoute,
    handoff: `Blocker type ${row.blockerType} | owner ${row.action.escalationOwner} | ${row.action.handoff}`
  };

  renderHandoffContext(escalationPayload, outcome);
  renderFlockosShell();
  bridge.notify(
    outcome.found
      ? `Escalation launched to ${row.action.targetRoom} (${row.action.escalationOwner})`
      : `Escalation route missing for ${row.action.targetRoom}`,
    outcome.found ? "success" : "warn"
  );
}

function renderEscalationConsole(rows) {
  latestEscalationRows = rows;
  shellEscalationList.innerHTML = "";

  if (rows.length === 0) {
    shellEscalationSummary.textContent = "No active blockers. Mission dependencies are clear.";
    const item = document.createElement("li");
    item.className = "shell-escalation-item";
    item.textContent = "All blocker-linked actions are complete for visible missions.";
    shellEscalationList.appendChild(item);
    return;
  }

  const criticalCount = rows.filter((row) => row.urgencyLevel === "critical").length;
  const highCount = rows.filter((row) => row.urgencyLevel === "high").length;
  shellEscalationSummary.textContent = `${rows.length} blocker escalations suggested (sorted by urgency). Critical: ${criticalCount}, High: ${highCount}.`;

  rows.forEach((row) => {
    const item = document.createElement("li");
    item.className = "shell-escalation-item";

    const title = document.createElement("p");
    title.className = "shell-escalation-title";
    title.textContent = `${row.mission.id} blocked by ${row.action.id}`;

    const meta = document.createElement("p");
    meta.className = "shell-escalation-meta";
    meta.textContent = `Type: ${row.blockerType} | Owner: ${row.action.escalationOwner} | Room: ${row.action.targetRoom} | due in ${row.dueInDays}d`;

    const urgency = document.createElement("p");
    urgency.className = `shell-escalation-urgency is-${row.urgencyLevel}`;
    urgency.textContent = `Urgency ${row.urgencyLevel.toUpperCase()} (${row.urgencyScore})`;

    const controls = document.createElement("div");
    controls.className = "shell-escalation-controls";

    const escalateButton = document.createElement("button");
    escalateButton.type = "button";
    escalateButton.className = "shell-action-btn";
    escalateButton.textContent = "Escalate to Room";
    escalateButton.addEventListener("click", () => {
      triggerEscalationHandoff(row);
    });

    const completeActionButton = document.createElement("button");
    completeActionButton.type = "button";
    completeActionButton.className = "shell-state-btn";
    completeActionButton.textContent = "Mark Dependency Complete";
    completeActionButton.addEventListener("click", () => {
      setActionStatus(row.action.id, "complete");
      renderFlockosShell();
      bridge.notify(`Dependency ${row.action.id} marked complete`, "success");
    });

    controls.appendChild(escalateButton);
    controls.appendChild(completeActionButton);

    item.appendChild(title);
    item.appendChild(meta);
    item.appendChild(urgency);
    item.appendChild(controls);
    shellEscalationList.appendChild(item);
  });
}

function getTopEscalationRows() {
  return latestEscalationRows.slice(0, 5);
}

function buildEscalationDigestPayload() {
  const topRows = getTopEscalationRows();
  return {
    reportType: "newcovenant-escalation-digest",
    generatedAt: new Date().toISOString(),
    phase: modules.config.get("runtime.phase", "unknown"),
    summary: {
      totalRows: latestEscalationRows.length,
      exportedRows: topRows.length,
      critical: latestEscalationRows.filter((row) => row.urgencyLevel === "critical").length,
      high: latestEscalationRows.filter((row) => row.urgencyLevel === "high").length
    },
    rows: topRows.map((row) => ({
      missionId: row.mission.id,
      missionTitle: row.mission.title,
      missionOwner: row.mission.owner,
      missionDue: row.mission.due,
      actionId: row.action.id,
      actionTitle: row.action.title,
      blockerType: row.blockerType,
      actionPriority: row.action.priority,
      escalationOwner: row.action.escalationOwner,
      targetRoom: row.action.targetRoom,
      targetRoute: row.action.targetRoute,
      handoff: row.action.handoff,
      urgencyScore: row.urgencyScore,
      urgencyLevel: row.urgencyLevel,
      dueInDays: row.dueInDays,
      actionState: getActionStatus(row.action.id)
    }))
  };
}

function downloadTextFile(filename, content, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportEscalationDigestJson() {
  const payload = buildEscalationDigestPayload();
  const topRows = payload.rows;

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `newcovenant-escalation-digest-${stamp}.json`;
  downloadTextFile(filename, JSON.stringify(payload, null, 2), "application/json");
  shellEscalationExportStatus.textContent = `Exported JSON (${topRows.length} blockers) at ${new Date().toLocaleTimeString()}`;
}

function buildEscalationDigestMarkdown() {
  const payload = buildEscalationDigestPayload();
  const lines = [
    "# NewCovenant Escalation Digest",
    "",
    `Generated: ${payload.generatedAt}`,
    `Phase: ${payload.phase}`,
    `Total blockers: ${payload.summary.totalRows}`,
    `Exported blockers: ${payload.summary.exportedRows}`,
    `Critical: ${payload.summary.critical}`,
    `High: ${payload.summary.high}`,
    "",
    "## Top Blockers",
    ""
  ];

  payload.rows.forEach((row, index) => {
    lines.push(`### ${index + 1}. ${row.missionId} -> ${row.actionId}`);
    lines.push(`- Mission: ${row.missionTitle}`);
    lines.push(`- Owner: ${row.missionOwner}`);
    lines.push(`- Due: ${row.missionDue} (in ${row.dueInDays}d)`);
    lines.push(`- Blocker: ${row.blockerType}`);
    lines.push(`- Priority: ${row.actionPriority}`);
    lines.push(`- Urgency: ${row.urgencyLevel} (${row.urgencyScore})`);
    lines.push(`- Escalation owner: ${row.escalationOwner}`);
    lines.push(`- Room: ${row.targetRoom}`);
    lines.push(`- Route: ${row.targetRoute}`);
    lines.push(`- Handoff: ${row.handoff}`);
    lines.push("");
  });

  return lines.join("\n");
}

function exportEscalationDigestMarkdown() {
  const markdown = buildEscalationDigestMarkdown();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `newcovenant-escalation-digest-${stamp}.md`;
  downloadTextFile(filename, markdown, "text/markdown");
  shellEscalationExportStatus.textContent = `Exported Markdown at ${new Date().toLocaleTimeString()}`;
}

async function copyEscalationBriefToClipboard() {
  const payload = buildEscalationDigestPayload();
  const topRows = payload.rows.slice(0, 3);
  const briefLines = [
    `Escalation Brief | Critical ${payload.summary.critical} | High ${payload.summary.high}`,
    ...topRows.map((row, index) => {
      return `${index + 1}) ${row.missionId}/${row.actionId} | ${row.blockerType} | ${row.escalationOwner} -> ${row.targetRoom} | ${row.urgencyLevel} ${row.urgencyScore}`;
    })
  ];
  const brief = briefLines.join("\n");

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(brief);
      shellEscalationExportStatus.textContent = `Copied escalation brief at ${new Date().toLocaleTimeString()}`;
      return true;
    }
  } catch {
    // Fallback below when clipboard API is unavailable.
  }

  const fallback = document.createElement("textarea");
  fallback.value = brief;
  document.body.appendChild(fallback);
  fallback.select();
  document.execCommand("copy");
  fallback.remove();
  shellEscalationExportStatus.textContent = `Copied escalation brief (fallback) at ${new Date().toLocaleTimeString()}`;
  return true;
}

function exportEscalationDigest() {
  exportEscalationDigestJson();
}

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
  allowedRoles: ["admin", "pastor", "leader"]
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

function renderSummaryHistory() {
  summaryHistoryList.innerHTML = "";

  if (summaryHistory.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No snapshots captured in this session.";
    emptyItem.className = "warn";
    summaryHistoryList.appendChild(emptyItem);
    return;
  }

  summaryHistory.slice(0, 8).forEach((entry, index) => {
    const item = document.createElement("li");
    item.textContent = `#${index + 1} ${entry.when} | ${entry.ready}/${entry.total} ready | source: ${entry.source}`;
    item.className = entry.ready === entry.total ? "ok" : "warn";
    summaryHistoryList.appendChild(item);
  });
}

function captureSummarySnapshot(source = "manual") {
  if (!latestBuildSummary) {
    renderBuildSummary();
  }

  const snapshot = {
    when: new Date().toLocaleTimeString(),
    source,
    ready: latestBuildSummary.readiness.ready,
    total: latestBuildSummary.readiness.total
  };

  summaryHistory.unshift(snapshot);
  if (summaryHistory.length > 20) {
    summaryHistory = summaryHistory.slice(0, 20);
  }

  renderSummaryHistory();
}

function exportBuildSummary() {
  if (!latestBuildSummary) {
    renderBuildSummary();
  }

  const payload = {
    reportType: "newcovenant-build-summary",
    phase: modules.config.get("runtime.phase", "unknown"),
    app: modules.config.get("app.label", BRAND.products.newcovenant.label),
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

function renderWeaveStreams() {
  weaveStreamGrid.innerHTML = "";

  getWeaveOrder().forEach((appId) => {
    const app = SITE_WEAVE_CONTENT[appId];
    if (!app) {
      return;
    }

    const card = document.createElement("article");
    card.className = "stream-card";

    const heading = document.createElement("h4");
    heading.textContent = app.display;

    const title = document.createElement("p");
    title.className = "stream-title";
    title.textContent = app.title;

    const summary = document.createElement("p");
    summary.className = "stream-summary";
    summary.textContent = app.summary;

    const features = document.createElement("ul");
    features.className = "stream-features";
    app.features.forEach((feature) => {
      const featureItem = document.createElement("li");
      featureItem.textContent = feature;
      features.appendChild(featureItem);
    });

    const actions = document.createElement("div");
    actions.className = "stream-actions";

    const primary = document.createElement("button");
    primary.className = "hero-btn primary";
    primary.type = "button";
    primary.textContent = app.primaryLabel;
    primary.addEventListener("click", () => {
      const outcome = rootShellAdapter.navigate(app.primaryRoute);
      bridge.notify(outcome.found ? `${app.display} route ready` : `${app.display} route missing`, outcome.found ? "success" : "warn");
    });

    const secondary = document.createElement("button");
    secondary.className = "hero-btn secondary";
    secondary.type = "button";
    secondary.textContent = app.secondaryLabel;
    secondary.addEventListener("click", () => {
      const outcome = rootShellAdapter.navigate(app.secondaryRoute);
      bridge.notify(outcome.found ? `${app.display} route ready` : `${app.display} route missing`, outcome.found ? "success" : "warn");
    });

    actions.appendChild(primary);
    actions.appendChild(secondary);

    card.appendChild(heading);
    card.appendChild(title);
    card.appendChild(summary);
    card.appendChild(features);
    card.appendChild(actions);
    weaveStreamGrid.appendChild(card);
  });
}

function renderWeekTimeline() {
  const items = [
    "Sunday: Worship + prayer commissioning",
    "Monday: ATOG devotion launch and follow-up prompts",
    "Tuesday: Team mission planning in FlockOS",
    "Wednesday: Midweek care room check-ins in FlockChat",
    "Thursday: Outreach coordination and task sync",
    "Friday: Testimony share and gratitude thread",
    "Saturday: Leader prep and next-week activation"
  ];

  weekTimeline.innerHTML = "";
  items.forEach((line) => {
    const item = document.createElement("li");
    item.textContent = line;
    weekTimeline.appendChild(item);
  });
}

function renderChatPulse() {
  const pulse = [
    "Prayer Team Room: 14 new prayer requests this week",
    "Young Adults Room: Discipleship meetup confirmed for Tuesday",
    "Care Circle: Meal train filled for upcoming family support",
    "Missions Room: Outreach assignment handoff completed",
    "Sunday Welcome Team: New volunteer orientation shared"
  ];

  chatPulse.innerHTML = "";
  pulse.forEach((line) => {
    const item = document.createElement("li");
    item.textContent = line;
    chatPulse.appendChild(item);
  });
}

function phaseToScore(phaseLabel) {
  const normalized = String(phaseLabel || "").trim().toUpperCase();
  const match = normalized.match(/^F(\d+)(?:\.(\d+))?$/);
  if (!match) {
    return -1;
  }

  const major = Number(match[1] || 0);
  const minor = Number(match[2] || 0);
  return major * 100 + minor;
}

function getModuleMapStatus(trackStatus, modulePhaseScore, currentPhaseScore) {
  if (modulePhaseScore < 0 || currentPhaseScore < 0) {
    return "planned";
  }

  if (modulePhaseScore < currentPhaseScore) {
    return "complete";
  }

  if (modulePhaseScore === currentPhaseScore) {
    return trackStatus === "in-progress" ? "active" : "queued";
  }

  return "planned";
}

function renderProjectDirectionMap() {
  const currentPhase = modules.config.get("runtime.phase", "unknown");
  const currentPhaseScore = phaseToScore(currentPhase);
  const phaseBuckets = new Map();

  let completeCount = 0;
  let activeCount = 0;
  let queuedCount = 0;
  let plannedCount = 0;

  projectMapTracks.innerHTML = "";

  WEAVE_MANIFEST.tracks.forEach((track) => {
    const moduleStatuses = track.modules.map((module) => {
      const bucketKey = String(module.phase || "unknown").split(".")[0] || "unknown";
      const existingBucket = phaseBuckets.get(bucketKey) || { total: 0, weightedComplete: 0 };

      const status = getModuleMapStatus(track.status, phaseToScore(module.phase), currentPhaseScore);
      existingBucket.total += 1;

      if (status === "complete") {
        completeCount += 1;
        existingBucket.weightedComplete += 1;
      } else if (status === "active") {
        activeCount += 1;
        existingBucket.weightedComplete += 0.5;
      } else if (status === "queued") {
        queuedCount += 1;
      } else {
        plannedCount += 1;
      }

      phaseBuckets.set(bucketKey, existingBucket);

      return { module, status };
    });

    const completedWeight = moduleStatuses.reduce((sum, entry) => {
      if (entry.status === "complete") {
        return sum + 1;
      }
      if (entry.status === "active") {
        return sum + 0.5;
      }
      return sum;
    }, 0);

    const completionPercent = track.modules.length > 0 ? Math.round((completedWeight / track.modules.length) * 100) : 0;

    const trackCard = document.createElement("article");
    trackCard.className = "project-track";

    const head = document.createElement("div");
    head.className = "project-track-head";

    const title = document.createElement("p");
    title.className = "project-track-title";
    title.textContent = `${track.app} track`;

    const state = document.createElement("p");
    state.className = "project-track-state";
    state.textContent = `Track status: ${track.status}`;

    head.appendChild(title);
    head.appendChild(state);

    const meter = document.createElement("div");
    meter.className = "project-track-meter";
    const meterFill = document.createElement("span");
    meterFill.style.width = `${completionPercent}%`;
    meter.appendChild(meterFill);

    // Group modules by zone for clearer visual organisation
    const zoneMap = new Map();
    moduleStatuses.forEach((entry) => {
      const zone = entry.module.zone || "general";
      if (!zoneMap.has(zone)) {
        zoneMap.set(zone, []);
      }
      zoneMap.get(zone).push(entry);
    });

    const zoneCount = zoneMap.size;

    const foot = document.createElement("p");
    foot.className = "project-track-foot";
    foot.textContent = `Completion signal: ${completionPercent}% (${track.modules.length} modules across ${zoneCount} zone${zoneCount !== 1 ? "s" : ""})`;

    const moduleList = document.createElement("ul");
    moduleList.className = "project-track-modules";

    zoneMap.forEach((entries, zone) => {
      const zoneLabel = document.createElement("li");
      zoneLabel.className = "project-track-zone";
      zoneLabel.textContent = zone.replace(/-/g, " ");
      moduleList.appendChild(zoneLabel);

      entries.forEach((entry) => {
        const moduleItem = document.createElement("li");
        moduleItem.className = `project-module is-${entry.status}`;

        const titleWrap = document.createElement("div");

        const moduleTitle = document.createElement("p");
        moduleTitle.className = "project-module-title";
        moduleTitle.textContent = entry.module.title;

        const modulePhase = document.createElement("p");
        modulePhase.className = "project-module-phase";
        modulePhase.textContent = `${entry.module.route} | ${entry.module.phase}`;

        titleWrap.appendChild(moduleTitle);
        titleWrap.appendChild(modulePhase);

        const status = document.createElement("p");
        status.className = "project-module-status";
        status.textContent = entry.status;

        moduleItem.appendChild(titleWrap);
        moduleItem.appendChild(status);
        moduleList.appendChild(moduleItem);
      });
    });

    trackCard.appendChild(head);
    trackCard.appendChild(meter);
    trackCard.appendChild(foot);
    trackCard.appendChild(moduleList);
    projectMapTracks.appendChild(trackCard);
  });

  const totalModules = completeCount + activeCount + queuedCount + plannedCount;
  projectMapSummary.textContent = "Direction: hold FlockOS steady where it is strong, extract and improve in modular NewCovenant slices, and keep deploy parity.";
  projectMapPhase.textContent = `Current phase: ${currentPhase}`;
  projectMapProgress.textContent = `Progress: ${completeCount} complete, ${activeCount} active, ${queuedCount} queued, ${plannedCount} planned (${totalModules} total modules)`;
  projectMapUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;

  projectMapPhaseBuckets.innerHTML = "";
  Array.from(phaseBuckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([bucket, stats]) => {
      const percent = stats.total > 0 ? Math.round((stats.weightedComplete / stats.total) * 100) : 0;
      const item = document.createElement("li");
      item.textContent = `${bucket}: ${percent}%`;
      projectMapPhaseBuckets.appendChild(item);
    });

  projectMapPlatforms.innerHTML = "";
  PLATFORM_PARITY_TARGETS.forEach((target) => {
    const item = document.createElement("li");
    item.textContent = target;
    projectMapPlatforms.appendChild(item);
  });
}

function renderFlockosShell() {
  enforceMissionGates();

  const selected = shellStatusFilter.value;
  const missions = FLOCKOS_SHELL_DATA.missions.filter((mission) => {
    return selected === "all" ? true : mission.status === selected;
  });

  shellMissionSummary.textContent = `${missions.length} visible missions (${selected === "all" ? "all statuses" : selected})`;
  shellCurrentPath.textContent = `Current shell path: ${rootShellAdapter.getCurrentPath()}`;

  const rollup = computeActionRollup();
  const rollupText = `Action status: ${rollup.complete}/${rollup.total} complete, ${rollup.inProgress} in progress, ${rollup.pending} pending`;
  shellActionRollup.textContent = rollupText;
  shellHandoffRollup.textContent = rollupText;

  const missionRollup = computeMissionRollup();
  shellGateRollup.textContent = `Mission gates: ${missionRollup.unlocked}/${missionRollup.total} unlocked, ${missionRollup.complete} complete, ${missionRollup.locked} locked`;

  const escalationRows = buildEscalationRows(missions);
  renderEscalationConsole(escalationRows);

  shellMissions.innerHTML = "";
  missions.forEach((mission) => {
    const missionStatus = getMissionStatus(mission.id);
    const depsComplete = areMissionDependenciesComplete(mission);
    const missingDeps = getMissingDependencies(mission);

    const item = document.createElement("li");
    if (missionStatus === "complete") {
      item.className = "shell-mission-item is-complete";
    } else if (depsComplete) {
      item.className = "shell-mission-item is-ready";
    } else {
      item.className = "shell-mission-item is-locked";
    }

    const title = document.createElement("p");
    title.className = "shell-mission-title";
    title.textContent = `${mission.id}: ${mission.title}`;

    const meta = document.createElement("p");
    meta.className = "shell-mission-meta";
    meta.textContent = `${mission.ministry} | owner ${mission.owner} | status ${mission.status} | due ${mission.due}`;

    const gate = document.createElement("p");
    gate.className = "shell-mission-gate";
    if (missionStatus === "complete") {
      gate.textContent = "Gate: Completed";
    } else if (depsComplete) {
      gate.textContent = `Gate: Unlocked (requires ${mission.requiredActions.join(", ")})`;
    } else {
      gate.textContent = `Gate: Locked (missing ${missingDeps.join(", ")})`;
    }

    const controls = document.createElement("div");
    controls.className = "shell-mission-controls";

    const completeButton = document.createElement("button");
    completeButton.type = "button";
    completeButton.className = "shell-state-btn";
    completeButton.textContent = "Complete Mission";
    completeButton.disabled = !depsComplete || missionStatus === "complete";
    completeButton.addEventListener("click", () => {
      setMissionStatus(mission.id, "complete");
      renderFlockosShell();
      bridge.notify(`Mission ${mission.id} marked complete`, "success");
    });

    const reopenButton = document.createElement("button");
    reopenButton.type = "button";
    reopenButton.className = "shell-state-btn";
    reopenButton.textContent = "Reopen";
    reopenButton.disabled = missionStatus !== "complete";
    reopenButton.addEventListener("click", () => {
      setMissionStatus(mission.id, "pending");
      renderFlockosShell();
      bridge.notify(`Mission ${mission.id} reopened`, "info");
    });

    controls.appendChild(completeButton);
    controls.appendChild(reopenButton);

    item.appendChild(title);
    item.appendChild(meta);
    item.appendChild(gate);
    item.appendChild(controls);
    shellMissions.appendChild(item);
  });

  shellTeams.innerHTML = "";
  FLOCKOS_SHELL_DATA.teamCapacity.forEach((team) => {
    const item = document.createElement("li");
    item.textContent = `${team.team}: ${team.active} active, ${team.available} available (${team.load})`;
    shellTeams.appendChild(item);
  });

  shellActions.innerHTML = "";
  FLOCKOS_SHELL_DATA.actionQueue.forEach((action) => {
    const status = getActionStatus(action.id);
    const item = document.createElement("li");
    item.className = `shell-action-item is-${status}`;

    const title = document.createElement("p");
    title.className = "shell-action-title";
    title.textContent = `${action.id}: ${action.title}`;

    const meta = document.createElement("p");
    meta.className = "shell-action-meta";
    meta.textContent = `Status: ${status} | Priority: ${action.priority} | Room: ${action.targetRoom}`;

    const controls = document.createElement("div");
    controls.className = "shell-action-controls";

    const launchButton = document.createElement("button");
    launchButton.type = "button";
    launchButton.className = "shell-action-btn";
    launchButton.textContent = "Launch Handoff";
    launchButton.addEventListener("click", () => {
      triggerActionHandoff(action);
    });

    const inProgressButton = document.createElement("button");
    inProgressButton.type = "button";
    inProgressButton.className = "shell-state-btn";
    inProgressButton.textContent = "Mark In Progress";
    inProgressButton.addEventListener("click", () => {
      setActionStatus(action.id, "in-progress");
      renderFlockosShell();
      bridge.notify(`Action ${action.id} set to in progress`, "info");
    });

    const completeButton = document.createElement("button");
    completeButton.type = "button";
    completeButton.className = "shell-state-btn";
    completeButton.textContent = "Mark Complete";
    completeButton.addEventListener("click", () => {
      setActionStatus(action.id, "complete");
      renderFlockosShell();
      bridge.notify(`Action ${action.id} marked complete`, "success");
    });

    const pendingButton = document.createElement("button");
    pendingButton.type = "button";
    pendingButton.className = "shell-state-btn";
    pendingButton.textContent = "Set Pending";
    pendingButton.addEventListener("click", () => {
      setActionStatus(action.id, "pending");
      renderFlockosShell();
      bridge.notify(`Action ${action.id} set to pending`, "info");
    });

    controls.appendChild(launchButton);
    controls.appendChild(inProgressButton);
    controls.appendChild(completeButton);
    controls.appendChild(pendingButton);

    item.appendChild(title);
    item.appendChild(meta);
    item.appendChild(controls);
    shellActions.appendChild(item);
  });
}

function renderHandoffContext(action, outcome) {
  shellHandoffStatus.textContent =
    outcome.found
      ? `Handoff launched to ${action.targetRoom} (${action.targetRoute})`
      : `Handoff route missing for ${action.targetRoom} (${action.targetRoute})`;

  shellHandoffContext.innerHTML = "";
  const details = [
    `Action: ${action.title}`,
    `State: ${getActionStatus(action.id)}`,
    `Priority: ${action.priority}`,
    `Room: ${action.targetRoom}`,
    `Route: ${action.targetRoute}`,
    `Payload: ${action.handoff}`
  ];

  details.forEach((line) => {
    const item = document.createElement("li");
    item.textContent = line;
    shellHandoffContext.appendChild(item);
  });
}

function triggerActionHandoff(action) {
  if (getActionStatus(action.id) === "pending") {
    setActionStatus(action.id, "in-progress");
  }
  const outcome = rootShellAdapter.navigate(action.targetRoute);
  renderHandoffContext(action, outcome);
  renderFlockosShell();
  bridge.notify(
    outcome.found ? `Handoff ready: ${action.targetRoom}` : `Handoff missing: ${action.targetRoom}`,
    outcome.found ? "success" : "warn"
  );
}

function renderWeaveRoadmap() {
  const summary = summarizeWeaveManifest(WEAVE_MANIFEST);
  weaveRoadmapList.innerHTML = "";

  // ── Headline ───────────────────────────────────────────────────────
  const headline = document.createElement("li");
  headline.textContent = `Manifest v${summary.version}: ${summary.totalApps} tracks · ${summary.totalModules} modules · ${summary.totalZones} zones`;
  headline.className = "ok";
  weaveRoadmapList.appendChild(headline);

  // ── Zone breakdown summary ─────────────────────────────────────────
  const zoneBreakdown = document.createElement("li");
  zoneBreakdown.className = "ok";
  zoneBreakdown.textContent =
    "Zones: " +
    Object.entries(summary.zoneBreakdown)
      .map(([zone, count]) => `${zone.replace(/-/g, "\u00a0")}(${count})`)
      .join(" · ");
  weaveRoadmapList.appendChild(zoneBreakdown);

  // ── Per-track breakdown, grouped by zone ──────────────────────────
  WEAVE_MANIFEST.tracks.forEach((track) => {
    const trackItem = document.createElement("li");
    trackItem.textContent = `── ${track.app}: ${track.modules.length} modules, status ${track.status}`;
    trackItem.className = track.status === "in-progress" ? "ok" : "warn";
    weaveRoadmapList.appendChild(trackItem);

    // Group by zone
    const zoneMap = new Map();
    track.modules.forEach((module) => {
      const zone = module.zone || "general";
      if (!zoneMap.has(zone)) {
        zoneMap.set(zone, []);
      }
      zoneMap.get(zone).push(module);
    });

    zoneMap.forEach((modules, zone) => {
      const zoneItem = document.createElement("li");
      zoneItem.textContent = `   ${zone}: ${modules.map((m) => `${m.title} (${m.phase})`).join(", ")}`;
      zoneItem.className = track.status === "in-progress" ? "ok" : "warn";
      weaveRoadmapList.appendChild(zoneItem);
    });
  });
}

modules.config.set("app.name", BRAND.products.newcovenant.name);
modules.config.set("app.label", BRAND.products.newcovenant.label);
modules.config.set("runtime.phase", "F4.6");



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
  roles: ["admin", "leader"]
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
  const outcome = rootShellAdapter.navigate("/flockos/shell");
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
  captureSummarySnapshot("smoke");
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
  captureSummarySnapshot("rehearsal");
  bridge.notify(
    result.summary.afterAvailable === result.summary.total
      ? "Integration rehearsal completed successfully"
      : "Integration rehearsal completed with missing surfaces",
    result.summary.afterAvailable === result.summary.total ? "success" : "warn"
  );
});

refreshSummaryButton.addEventListener("click", () => {
  renderBuildSummary();
  captureSummarySnapshot("refresh");
  bridge.notify("Build summary refreshed", "info");
});

exportSummaryButton.addEventListener("click", () => {
  exportBuildSummary();
  bridge.notify("Build summary exported", "success");
});

captureSummaryButton.addEventListener("click", () => {
  captureSummarySnapshot("manual");
  bridge.notify("Summary snapshot captured", "success");
});

clearHistoryButton.addEventListener("click", () => {
  summaryHistory = [];
  renderSummaryHistory();
  bridge.notify("Summary history cleared", "info");
});

refreshWeaveButton.addEventListener("click", () => {
  renderWeaveRoadmap();
  bridge.notify("Weave roadmap refreshed", "info");
});

refreshProjectMapButton?.addEventListener("click", () => {
  renderProjectDirectionMap();
  bridge.notify("Project map refreshed", "info");
});

shellStatusFilter.addEventListener("change", () => {
  renderFlockosShell();
  bridge.notify("FlockOS control deck filtered", "info");
});

shellRouteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const route = button.dataset.shellRoute;
    const outcome = rootShellAdapter.navigate(route || "/home");
    renderFlockosShell();
    bridge.notify(outcome.found ? `Route ready: ${route}` : `Route missing: ${route}`, outcome.found ? "success" : "warn");
  });
});

shellResetActionsButton.addEventListener("click", () => {
  actionState = {};
  saveActionState();
  missionState = {};
  saveMissionState();
  shellHandoffStatus.textContent = "Action states reset. Select an action to launch its room handoff.";
  shellHandoffContext.innerHTML = "";
  renderFlockosShell();
  bridge.notify("Action and mission state reset", "info");
});

shellExportEscalationButton.addEventListener("click", () => {
  exportEscalationDigest();
  bridge.notify("Escalation digest exported", "success");
});

shellExportEscalationMarkdownButton.addEventListener("click", () => {
  exportEscalationDigestMarkdown();
  bridge.notify("Escalation markdown exported", "success");
});

shellCopyEscalationBriefButton.addEventListener("click", async () => {
  await copyEscalationBriefToClipboard();
  bridge.notify("Escalation brief copied", "success");
});

renderBuildSummary();
renderSummaryHistory();
renderWeaveRoadmap();
renderWeaveStreams();
renderWeekTimeline();
renderChatPulse();
renderProjectDirectionMap();
renderFlockosShell();

// ── Brand header boot ─────────────────────────────────────────────────
const appEyebrow = document.getElementById("app-eyebrow");
const appBrandLabel = document.getElementById("app-brand-label");
if (appEyebrow) appEyebrow.textContent = BRAND.eyebrow;
if (appBrandLabel) appBrandLabel.textContent = BRAND.products.newcovenant.label;

setMode("public");
