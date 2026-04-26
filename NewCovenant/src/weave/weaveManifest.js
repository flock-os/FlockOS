export const WEAVE_MANIFEST = {
  version: "0.1.0",
  tracks: [
    {
      app: "ATOG",
      status: "planned",
      modules: [
        {
          id: "atog.daily-journey",
          title: "Daily Journey",
          route: "/atog/daily-journey",
          bridgePorts: ["resolve", "getConfig", "notify"],
          phase: "F4.1"
        },
        {
          id: "atog.devotions",
          title: "Devotions",
          route: "/atog/devotions",
          bridgePorts: ["resolve", "getUser", "notify"],
          phase: "F4.1"
        }
      ]
    },
    {
      app: "FlockOS",
      status: "in-progress",
      modules: [
        {
          id: "flockos.navigation-shell",
          title: "Navigation Shell",
          route: "/flockos/shell",
          bridgePorts: ["resolve", "getConfig", "renderAdminState"],
          phase: "F3.7"
        },
        {
          id: "flockos.missions",
          title: "Missions Dashboard",
          route: "/flockos/missions",
          bridgePorts: ["resolve", "getUser", "enqueueOffline", "flushOffline"],
          phase: "F4.2"
        }
      ]
    },
    {
      app: "FlockChat",
      status: "planned",
      modules: [
        {
          id: "flockchat.rooms",
          title: "Rooms",
          route: "/flockchat/rooms",
          bridgePorts: ["getUser", "notify", "enqueueOffline"],
          phase: "F4.3"
        },
        {
          id: "flockchat.notifications",
          title: "Notifications",
          route: "/flockchat/notifications",
          bridgePorts: ["getUser", "notify"],
          phase: "F4.3"
        }
      ]
    }
  ]
};

export function summarizeWeaveManifest(manifest = WEAVE_MANIFEST) {
  const allModules = manifest.tracks.flatMap((track) => track.modules);
  const appSummaries = manifest.tracks.map((track) => {
    return {
      app: track.app,
      status: track.status,
      modules: track.modules.length,
      ready: track.status === "in-progress" ? 1 : 0
    };
  });

  return {
    version: manifest.version,
    totalApps: manifest.tracks.length,
    totalModules: allModules.length,
    appSummaries,
    moduleIds: allModules.map((module) => module.id)
  };
}
