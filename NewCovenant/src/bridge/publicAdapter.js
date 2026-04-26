export function createPublicAdapter(bridge) {
  return {
    getHeroModel() {
      const appName = bridge.getConfig("app.name", "NewCovenant");
      const user = bridge.getUser();

      return {
        title: "A place people want to stay",
        subtitle: user
          ? `Welcome back, ${user.name}. Continue your journey in ${appName}.`
          : `Discover community and belonging in ${appName}.`
      };
    },

    getPrimaryActions() {
      return [
        { id: "join-gathering", label: "Join a Gathering", route: "/home" },
        { id: "watch-story", label: "Watch the Story", route: "/mission/intro" }
      ];
    }
  };
}
