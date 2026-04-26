export const SITE_WEAVE_CONTENT = {
  atog: {
    id: "atog",
    display: "ATOG",
    title: "Anchor the day in Scripture and prayer",
    summary:
      "ATOG brings morning rhythm, guided devotion paths, and intentional discipleship steps into one calm, focused experience.",
    primaryLabel: "Open Daily Journey",
    secondaryLabel: "Start Devotion Plan",
    primaryRoute: "/atog/daily-journey",
    secondaryRoute: "/atog/devotions",
    features: [
      "Daily check-in with scripture prompt and response journal",
      "Guided devotion tracks for new and mature believers",
      "Prayer rhythm that integrates with shared church moments"
    ]
  },
  flockos: {
    id: "flockos",
    display: "FlockOS",
    title: "Coordinate ministry work with clarity",
    summary:
      "FlockOS is the operational backbone: missions, teams, workflows, and stewardship dashboards that keep leaders aligned.",
    primaryLabel: "Open Mission Dashboard",
    secondaryLabel: "Review Team Workflows",
    primaryRoute: "/flockos/missions",
    secondaryRoute: "/flockos/shell",
    features: [
      "Mission pipeline with clear owner and next-step visibility",
      "Team workflow snapshots with readiness indicators",
      "Offline-safe action capture for field and event work"
    ]
  },
  flockchat: {
    id: "flockchat",
    display: "FlockChat",
    title: "Keep community close all week",
    summary:
      "FlockChat creates living connection between gatherings through rooms, prayer requests, announcements, and care follow-up.",
    primaryLabel: "Open Community Rooms",
    secondaryLabel: "View Notifications",
    primaryRoute: "/flockchat/rooms",
    secondaryRoute: "/flockchat/notifications",
    features: [
      "Rooms organized by ministry, age group, and care focus",
      "Prayer and testimony updates with gentle notification flow",
      "Communication layer that stays connected to core app identity"
    ]
  }
};

export function getWeaveOrder() {
  return ["atog", "flockos", "flockchat"];
}
