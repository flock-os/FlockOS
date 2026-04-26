export const FLOCKOS_SHELL_DATA = {
  missions: [
    {
      id: "M-101",
      title: "Family Care Follow-Up",
      ministry: "Care",
      owner: "Ruth",
      status: "Needs Review",
      due: "Tue",
      requiredActions: ["A-14"]
    },
    {
      id: "M-204",
      title: "Neighborhood Prayer Walk",
      ministry: "Outreach",
      owner: "Micah",
      status: "In Progress",
      due: "Thu",
      requiredActions: ["A-11"]
    },
    {
      id: "M-318",
      title: "Youth Discipleship Night",
      ministry: "Youth",
      owner: "Leah",
      status: "Ready",
      due: "Fri",
      requiredActions: ["A-12"]
    },
    {
      id: "M-422",
      title: "Welcome Team Rotation",
      ministry: "Hospitality",
      owner: "Asher",
      status: "In Progress",
      due: "Sat",
      requiredActions: ["A-12", "A-13"]
    },
    {
      id: "M-509",
      title: "Baptism Follow-Up Path",
      ministry: "Pastoral Care",
      owner: "Naomi",
      status: "Needs Review",
      due: "Sun",
      requiredActions: ["A-14", "A-13"]
    }
  ],
  teamCapacity: [
    {
      team: "Care Team",
      active: 8,
      available: 3,
      load: "steady"
    },
    {
      team: "Outreach Team",
      active: 6,
      available: 2,
      load: "high"
    },
    {
      team: "Youth Team",
      active: 5,
      available: 4,
      load: "healthy"
    },
    {
      team: "Worship Team",
      active: 7,
      available: 2,
      load: "high"
    }
  ],
  actionQueue: [
    {
      id: "A-11",
      title: "Approve outreach supply budget",
      targetRoom: "Missions Room",
      targetRoute: "/flockchat/rooms/missions",
      priority: "high",
      blockerType: "budget",
      escalationOwner: "finance",
      handoff: "Send budget approval summary and update assignment thread"
    },
    {
      id: "A-12",
      title: "Assign host for youth welcome window",
      targetRoom: "Young Adults Room",
      targetRoute: "/flockchat/rooms/young-adults",
      priority: "medium",
      blockerType: "staffing",
      escalationOwner: "leader",
      handoff: "Post host confirmation and share welcome checklist"
    },
    {
      id: "A-13",
      title: "Confirm Sunday testimony order",
      targetRoom: "Sunday Service Room",
      targetRoute: "/flockchat/rooms/sunday-service",
      priority: "high",
      blockerType: "service-order",
      escalationOwner: "pastor",
      handoff: "Pin testimony order and cue worship transition notes"
    },
    {
      id: "A-14",
      title: "Schedule elder prayer call with care requests",
      targetRoom: "Care Circle",
      targetRoute: "/flockchat/rooms/care-circle",
      priority: "urgent",
      blockerType: "pastoral-care",
      escalationOwner: "care",
      handoff: "Share request digest and proposed call windows"
    }
  ]
};

export const SHELL_STATUS_ORDER = ["Needs Review", "In Progress", "Ready"];
