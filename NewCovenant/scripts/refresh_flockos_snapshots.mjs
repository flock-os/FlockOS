import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { FLOCKOS_SHELL_DATA } from "../src/weave/flockosShellSurfaceData.js";

const modulesDir = path.resolve("src/apps/flockos/modules");
const files = fs.readdirSync(modulesDir).filter((f) => f.endsWith(".module.js"));
const now = new Date().toISOString();

const missions = FLOCKOS_SHELL_DATA.missions;
const teamCapacity = FLOCKOS_SHELL_DATA.teamCapacity;
const actionQueue = FLOCKOS_SHELL_DATA.actionQueue;

function missionRows(prefix) {
  return missions.map((m, i) => ({
    id: `${prefix}-${String(i + 1).padStart(3, "0")}`,
    label: m.title,
    owner: m.owner,
    ministry: m.ministry,
    status: m.status,
    due: m.due
  }));
}

function queueRows(prefix) {
  return actionQueue.map((a, i) => ({
    id: `${prefix}-${String(i + 1).padStart(3, "0")}`,
    label: a.title,
    priority: a.priority,
    room: a.targetRoom,
    route: a.targetRoute,
    escalationOwner: a.escalationOwner
  }));
}

function teamRows(prefix) {
  return teamCapacity.map((t, i) => ({
    id: `${prefix}-${String(i + 1).padStart(3, "0")}`,
    label: t.team,
    active: t.active,
    available: t.available,
    load: t.load
  }));
}

const recordBuilders = {
  missions: () =>
    missions.map((m) => ({
      id: m.id,
      label: m.title,
      owner: m.owner,
      ministry: m.ministry,
      status: m.status,
      due: m.due,
      requiredActions: m.requiredActions
    })),
  groups: () =>
    teamRows("grp").map((r, i) => ({ ...r, cadence: ["weekly", "biweekly", "weekly", "monthly"][i % 4] })),
  attendance: () =>
    teamRows("att").map((r, i) => ({ ...r, service: ["Sunday AM", "Sunday PM", "Wednesday", "Youth Night"][i % 4] })),
  events: () =>
    missionRows("evt").map((r, i) => ({ ...r, start: ["Tue 18:30", "Thu 19:00", "Fri 18:00", "Sat 09:00", "Sun 10:00"][i % 5] })),
  songs: () =>
    missionRows("sng").map((r, i) => ({ id: r.id, label: `${r.label} Set`, key: ["G", "D", "A", "E", "C"][i % 5], status: r.status })),
  sermons: () =>
    missionRows("srm").map((r, i) => ({ id: r.id, label: r.label, speaker: r.owner, series: ["Faithful Steps", "Kingdom Work", "Living Hope", "Grace in Action", "Shepherd Care"][i % 5] })),
  giving: () =>
    missionRows("giv").map((r, i) => ({ id: r.id, label: r.ministry, owner: r.owner, status: r.status, amount: [450, 780, 620, 530, 910][i % 5] })),
  users: () =>
    teamRows("usr").map((r, i) => ({ id: r.id, label: r.label, role: ["pastor", "leader", "member", "admin"][i % 4], active: r.active })),
  directory: () =>
    teamRows("dir").map((r, i) => ({ id: r.id, label: `${r.label} Network`, households: [22, 18, 14, 20][i % 4], load: r.load })),
  ministries: () =>
    missionRows("min").map((r, i) => ({ id: r.id, label: r.ministry, owner: r.owner, status: r.status, quarterlyGoal: [3, 4, 2, 5, 3][i % 5] })),
  volunteers: () =>
    teamRows("vol").map((r, i) => ({ ...r, onboarding: ["ready", "pending", "active", "active"][i % 4] })),
  prayer: () => queueRows("pry"),
  care: () => queueRows("car"),
  outreach: () => missionRows("out"),
  services: () =>
    queueRows("svc").map((r, i) => ({ ...r, serviceWindow: ["AM", "PM", "Special", "Midweek"][i % 4] })),
  comms: () => queueRows("com"),
  notifications: () => queueRows("not"),
  reports: () =>
    missionRows("rpt").map((r, i) => ({ id: r.id, label: `${r.ministry} trend`, status: r.status, delta: [12, -3, 8, 5, 9][i % 5] })),
  statistics: () =>
    missionRows("sts").map((r, i) => ({ id: r.id, label: `${r.ministry} KPI`, status: r.status, score: [78, 66, 84, 73, 81][i % 5] })),
  membercards: () =>
    teamRows("mbr").map((r, i) => ({ id: r.id, label: `${r.label} card`, active: r.active, status: ["active", "active", "review", "active"][i % 4] })),
  myflock: () => teamRows("flk")
};

function normalizeSlug(id) {
  return String(id || "").replace(/^flockos\./, "").replace(/-/g, "").toLowerCase();
}

function genericRows(definition, slug) {
  const endpoint = definition?.liveSource?.endpoint || "TheVine.flock.call";
  return [1, 2, 3].map((n) => ({
    id: `${slug || "module"}-${String(n).padStart(3, "0")}`,
    label: `${definition.title} snapshot ${n}`,
    route: definition.route,
    endpoint,
    status: ["ready", "in-progress", "queued"][n - 1],
    phase: definition.phase,
    zone: definition.zone
  }));
}

let updated = 0;
let enriched = 0;

for (const file of files) {
  const full = path.join(modulesDir, file);
  const mod = await import(`${pathToFileURL(full).href}?v=${Date.now()}`);
  const constName = Object.keys(mod).find((k) => k.endsWith("_MODULE"));
  const factoryName = Object.keys(mod).find((k) => /^create[A-Za-z0-9_]+Module$/.test(k));
  if (!constName || !factoryName) {
    continue;
  }

  const definition = { ...mod[constName] };
  const slug = normalizeSlug(definition.id);
  const builder = recordBuilders[slug];
  const records = typeof builder === "function" ? builder() : genericRows(definition, slug);

  if ((definition.seedData?.records || []).length <= 1 || typeof builder === "function") {
    enriched += 1;
  }

  definition.seedData = {
    source: "live-snapshot-importer",
    generatedAt: now,
    records
  };

  definition.liveSource = {
    ...(definition.liveSource || {}),
    provider: "FlockOS Source Snapshot",
    sourceScript: "Covenant/Courts/TheTabernacle/Scripts/the_well.js",
    syncedAt: now,
    refreshMode: "imported-static-snapshot"
  };

  const next = `import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";\n\nexport const ${constName} = ${JSON.stringify(definition, null, 2)};\n\nexport function ${factoryName}(deps = {}) {\n  return createStandaloneFlockOSModule(${constName}, deps);\n}\n`;

  fs.writeFileSync(full, next, "utf8");
  updated += 1;
}

console.log(`Snapshot importer refreshed ${updated} FlockOS module files (${enriched} with focused enrichment).`);
