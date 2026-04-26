/**
 * WEAVE_MANIFEST — canonical list of all NewCovenant module extraction targets.
 *
 * Phase conventions (current runtime phase: F4.6):
 *   phase ≤ F4.6  → rendered as "complete" in the Project Map
 *   phase = F4.6  → rendered as "active"
 *   phase > F4.6  → rendered as "planned" or "queued"
 *
 * Modules reflect the full real FlockOS nav surface (the_good_shepherd.html)
 * and ATOG (TheUpperRoom), organized by extraction roadmap phase.
 */
export const WEAVE_MANIFEST = {
  version: "0.2.0",
  tracks: [
    // ── FlockOS ──────────────────────────────────────────────────────
    // Legacy FlockOS is the source of truth; these phases represent
    // when each module will be extracted as a standalone bridge module.
    {
      app: "FlockOS",
      status: "in-progress",
      modules: [
        // ─ Foundation (already scaffolded)
        {
          id: "flockos.navigation-shell",
          title: "Navigation Shell",
          route: "/flockos/shell",
          zone: "foundation",
          bridgePorts: ["resolve", "getConfig", "renderAdminState"],
          phase: "F3.7"
        },
        {
          id: "flockos.missions",
          title: "Missions Dashboard",
          route: "/flockos/missions",
          zone: "foundation",
          bridgePorts: ["resolve", "getUser", "enqueueOffline", "flushOffline"],
          phase: "F4.2"
        },
        // ─ F5 — Outer Court (Gates): member-facing daily tools
        {
          id: "flockos.calendar",
          title: "Calendar",
          route: "/flockos/calendar",
          zone: "gates",
          bridgePorts: ["resolve", "getConfig", "getUser"],
          phase: "F5.1"
        },
        {
          id: "flockos.directory",
          title: "Directory",
          route: "/flockos/directory",
          zone: "gates",
          bridgePorts: ["resolve", "getUser"],
          phase: "F5.1"
        },
        {
          id: "flockos.groups",
          title: "Groups",
          route: "/flockos/groups",
          zone: "gates",
          bridgePorts: ["resolve", "getUser", "notify"],
          phase: "F5.2"
        },
        {
          id: "flockos.photos",
          title: "Photos",
          route: "/flockos/photos",
          zone: "gates",
          bridgePorts: ["resolve", "getConfig"],
          phase: "F5.2"
        },
        // ─ F5 — Communications integration
        {
          id: "flockos.comms",
          title: "FlockChat Integration",
          route: "/flockos/comms",
          zone: "gates",
          bridgePorts: ["getUser", "notify", "enqueueOffline"],
          phase: "F5.3"
        },
        // ─ F6 — Courts: leadership & pastoral tools
        {
          id: "flockos.my-flock",
          title: "My Flock",
          route: "/flockos/my-flock",
          zone: "courts",
          bridgePorts: ["resolve", "getUser", "notify"],
          phase: "F6.1"
        },
        {
          id: "flockos.care",
          title: "Care",
          route: "/flockos/care",
          zone: "courts",
          bridgePorts: ["resolve", "getUser", "notify"],
          phase: "F6.1"
        },
        {
          id: "flockos.prayer",
          title: "Prayer",
          route: "/flockos/prayer",
          zone: "courts",
          bridgePorts: ["resolve", "getUser", "notify"],
          phase: "F6.2"
        },
        {
          id: "flockos.compassion",
          title: "Compassion",
          route: "/flockos/compassion",
          zone: "courts",
          bridgePorts: ["resolve", "getUser"],
          phase: "F6.2"
        },
        {
          id: "flockos.attendance",
          title: "Attendance",
          route: "/flockos/attendance",
          zone: "courts",
          bridgePorts: ["resolve", "getUser", "enqueueOffline"],
          phase: "F6.3"
        },
        {
          id: "flockos.ministry",
          title: "Ministry",
          route: "/flockos/ministry",
          zone: "courts",
          bridgePorts: ["resolve", "getConfig", "getUser"],
          phase: "F6.3"
        },
        {
          id: "flockos.quarterly",
          title: "Quarterly Planner",
          route: "/flockos/quarterly",
          zone: "courts",
          bridgePorts: ["resolve", "getConfig", "getUser"],
          phase: "F6.4"
        },
        // ─ F7 — Holy Place: ministry operations
        {
          id: "flockos.sermons",
          title: "Sermons",
          route: "/flockos/sermons",
          zone: "holy-place",
          bridgePorts: ["resolve", "getConfig"],
          phase: "F7.1"
        },
        {
          id: "flockos.services",
          title: "Service Plans",
          route: "/flockos/services",
          zone: "holy-place",
          bridgePorts: ["resolve", "getConfig", "getUser"],
          phase: "F7.1"
        },
        {
          id: "flockos.giving",
          title: "Giving",
          route: "/flockos/giving",
          zone: "holy-place",
          bridgePorts: ["resolve", "getUser"],
          phase: "F7.2"
        },
        {
          id: "flockos.outreach",
          title: "Outreach",
          route: "/flockos/outreach",
          zone: "holy-place",
          bridgePorts: ["resolve", "getConfig", "getUser"],
          phase: "F7.2"
        },
        {
          id: "flockos.discipleship",
          title: "Discipleship",
          route: "/flockos/discipleship",
          zone: "holy-place",
          bridgePorts: ["resolve", "getUser", "notify"],
          phase: "F7.3"
        },
        {
          id: "flockos.learning",
          title: "Learning",
          route: "/flockos/learning",
          zone: "holy-place",
          bridgePorts: ["resolve", "getConfig", "getUser"],
          phase: "F7.3"
        },
        // ─ F8 — Holy of Holies: admin & reporting
        {
          id: "flockos.statistics",
          title: "Statistics",
          route: "/flockos/statistics",
          zone: "holy-of-holies",
          bridgePorts: ["resolve", "getConfig"],
          phase: "F8.1"
        },
        {
          id: "flockos.reports",
          title: "Reports",
          route: "/flockos/reports",
          zone: "holy-of-holies",
          bridgePorts: ["resolve", "getConfig"],
          phase: "F8.1"
        },
        {
          id: "flockos.users",
          title: "User Management",
          route: "/flockos/users",
          zone: "holy-of-holies",
          bridgePorts: ["resolve", "getConfig", "getUser"],
          phase: "F8.2"
        },
        {
          id: "flockos.content-admin",
          title: "Content Admin",
          route: "/flockos/content-admin",
          zone: "holy-of-holies",
          bridgePorts: ["resolve", "getConfig"],
          phase: "F8.2"
        },
        {
          id: "flockos.admin-dashboard",
          title: "Admin Dashboard",
          route: "/flockos/admin-dashboard",
          zone: "holy-of-holies",
          bridgePorts: ["resolve", "getConfig", "renderAdminState"],
          phase: "F8.3"
        },
        {
          id: "flockos.my-profile",
          title: "My Profile",
          route: "/flockos/my-profile",
          zone: "profile",
          bridgePorts: ["getUser", "notify"],
          phase: "F5.4"
        }
      ]
    },

    // ── ATOG ─────────────────────────────────────────────────────────
    {
      app: "ATOG",
      status: "planned",
      modules: [
        {
          id: "atog.daily-journey",
          title: "Daily Journey",
          route: "/atog/daily-journey",
          zone: "rhythm",
          bridgePorts: ["resolve", "getConfig", "notify"],
          phase: "F5.5"
        },
        {
          id: "atog.devotions",
          title: "Devotion Plans",
          route: "/atog/devotions",
          zone: "rhythm",
          bridgePorts: ["resolve", "getUser", "notify"],
          phase: "F5.5"
        },
        {
          id: "atog.prayer-journal",
          title: "Prayer Journal",
          route: "/atog/prayer-journal",
          zone: "rhythm",
          bridgePorts: ["resolve", "getUser"],
          phase: "F6.5"
        },
        {
          id: "atog.scripture-search",
          title: "Scripture Search",
          route: "/atog/scripture-search",
          zone: "content",
          bridgePorts: ["resolve", "getConfig"],
          phase: "F7.4"
        }
      ]
    },

    // ── FlockChat ─────────────────────────────────────────────────────
    {
      app: "FlockChat",
      status: "planned",
      modules: [
        {
          id: "flockchat.rooms",
          title: "Rooms",
          route: "/flockchat/rooms",
          zone: "community",
          bridgePorts: ["getUser", "notify", "enqueueOffline"],
          phase: "F5.3"
        },
        {
          id: "flockchat.notifications",
          title: "Notifications",
          route: "/flockchat/notifications",
          zone: "community",
          bridgePorts: ["getUser", "notify"],
          phase: "F5.6"
        },
        {
          id: "flockchat.announcements",
          title: "Announcements",
          route: "/flockchat/announcements",
          zone: "community",
          bridgePorts: ["getUser", "notify", "getConfig"],
          phase: "F6.6"
        },
        {
          id: "flockchat.care-followup",
          title: "Care Follow-up",
          route: "/flockchat/care-followup",
          zone: "pastoral",
          bridgePorts: ["getUser", "notify", "enqueueOffline"],
          phase: "F6.7"
        }
      ]
    }
  ]
};

export function summarizeWeaveManifest(manifest = WEAVE_MANIFEST) {
  const allModules = manifest.tracks.flatMap((track) => track.modules);

  // Zone breakdown across all tracks
  const zoneStats = new Map();
  allModules.forEach((module) => {
    const zone = module.zone || "general";
    zoneStats.set(zone, (zoneStats.get(zone) || 0) + 1);
  });

  const appSummaries = manifest.tracks.map((track) => {
    const zones = [...new Set(track.modules.map((m) => m.zone || "general"))];
    return {
      app: track.app,
      status: track.status,
      modules: track.modules.length,
      zones,
      ready: track.status === "in-progress" ? 1 : 0
    };
  });

  return {
    version: manifest.version,
    totalApps: manifest.tracks.length,
    totalModules: allModules.length,
    totalZones: zoneStats.size,
    zoneBreakdown: Object.fromEntries(zoneStats),
    appSummaries,
    moduleIds: allModules.map((module) => module.id)
  };
}
