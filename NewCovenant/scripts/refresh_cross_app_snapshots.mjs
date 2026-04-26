import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const now = new Date().toISOString();

const tracks = [
  {
    name: "atog",
    dir: path.resolve("src/apps/atog/modules"),
    sourceScript: "Covenant/Courts/TheUpperRoom/ATOG.html",
    builders: {
      home: () => [
        { id: "home-001", label: "Hero and invitation hub", section: "landing", status: "ready" },
        { id: "home-002", label: "Great Invitations sequence", section: "invitations", status: "ready" },
        { id: "home-003", label: "I AM declarations navigator", section: "identity", status: "in-progress" },
        { id: "home-004", label: "Finished Work timeline", section: "timeline", status: "queued" }
      ],
      "upper-room": () => [
        { id: "upper-room-001", label: "Devotion dashboard", feed: "devotionals", status: "ready" },
        { id: "upper-room-002", label: "Prayer and journal integration", feed: "prayer+journal", status: "ready" },
        { id: "upper-room-003", label: "Care and compassion reflection", feed: "care+compassion", status: "in-progress" }
      ],
      theology: () => [
        { id: "theology-001", label: "Doctrine map", category: "systematic", status: "ready" },
        { id: "theology-002", label: "Core teaching themes", category: "biblical", status: "ready" },
        { id: "theology-003", label: "Study prompts", category: "application", status: "queued" }
      ],
      books: () => [
        { id: "books-001", label: "Pentateuch", corpus: "OT", status: "ready" },
        { id: "books-002", label: "Gospels", corpus: "NT", status: "ready" },
        { id: "books-003", label: "Epistles overview", corpus: "NT", status: "in-progress" }
      ],
      lexicon: () => [
        { id: "lexicon-001", label: "Greek lookup", language: "Greek", status: "ready" },
        { id: "lexicon-002", label: "Hebrew lookup", language: "Hebrew", status: "ready" },
        { id: "lexicon-003", label: "Word study cross-links", language: "Mixed", status: "queued" }
      ],
      characters: () => [
        { id: "characters-001", label: "Patriarch studies", group: "OT", status: "ready" },
        { id: "characters-002", label: "Prophets and kings", group: "OT", status: "in-progress" },
        { id: "characters-003", label: "Apostles and disciples", group: "NT", status: "ready" }
      ],
      counseling: () => [
        { id: "counseling-001", label: "Biblical care pathways", mode: "pastoral", status: "ready" },
        { id: "counseling-002", label: "Scripture-centered support", mode: "personal", status: "ready" },
        { id: "counseling-003", label: "Reflection exercises", mode: "guided", status: "queued" }
      ],
      heart: () => [
        { id: "heart-001", label: "Heart check prompts", scope: "self", status: "ready" },
        { id: "heart-002", label: "Repentance reflection", scope: "spiritual", status: "in-progress" },
        { id: "heart-003", label: "Growth checkpoints", scope: "formation", status: "queued" }
      ],
      mirror: () => [
        { id: "mirror-001", label: "Identity in Christ", theme: "truth", status: "ready" },
        { id: "mirror-002", label: "Conviction and grace", theme: "sanctification", status: "ready" },
        { id: "mirror-003", label: "Response journaling", theme: "practice", status: "queued" }
      ],
      quiz: () => [
        { id: "quiz-001", label: "Bible knowledge checks", type: "quiz", status: "ready" },
        { id: "quiz-002", label: "Book and doctrine review", type: "assessment", status: "in-progress" },
        { id: "quiz-003", label: "Memory challenge", type: "practice", status: "queued" }
      ],
      apologetics: () => [
        { id: "apologetics-001", label: "Faith questions", type: "faq", status: "ready" },
        { id: "apologetics-002", label: "Worldview responses", type: "defense", status: "ready" },
        { id: "apologetics-003", label: "Objection library", type: "study", status: "queued" }
      ],
      prayer: () => [
        { id: "prayer-001", label: "Prayer request submission", flow: "submit", status: "ready" },
        { id: "prayer-002", label: "Intercession prompts", flow: "pray", status: "in-progress" },
        { id: "prayer-003", label: "Praise reports", flow: "respond", status: "queued" }
      ],
      learning: () => [
        { id: "learning-001", label: "Learning hub", source: "TheWay", status: "ready" },
        { id: "learning-002", label: "Playlist and study surfaces", source: "shared", status: "in-progress" },
        { id: "learning-003", label: "Lesson progression", source: "shared", status: "queued" }
      ],
      support: () => [
        { id: "support-001", label: "Pray support card", action: "pray", status: "ready" },
        { id: "support-002", label: "Share support card", action: "share", status: "ready" },
        { id: "support-003", label: "Give support card", action: "give", status: "queued" }
      ],
      "biblical-worship": () => [
        { id: "biblical-worship-001", label: "Worship research page", type: "research", status: "ready" },
        { id: "biblical-worship-002", label: "Music and liturgy exploration", type: "study", status: "in-progress" },
        { id: "biblical-worship-003", label: "Page wrapper surface", type: "wrapper", status: "queued" }
      ],
      "prayer-intercession": () => [
        { id: "prayer-intercession-001", label: "Prayer and intercession page", type: "research", status: "ready" },
        { id: "prayer-intercession-002", label: "Intercessory study guide", type: "study", status: "in-progress" },
        { id: "prayer-intercession-003", label: "Page wrapper surface", type: "wrapper", status: "queued" }
      ],
      "daily-journey": () => [
        { id: "daily-journey-001", label: "Daily rhythm entry point", type: "devotional", status: "ready" },
        { id: "daily-journey-002", label: "Guided response prompts", type: "reflection", status: "in-progress" },
        { id: "daily-journey-003", label: "Reading and prayer linkage", type: "integration", status: "queued" }
      ],
      devotions: () => [
        { id: "devotions-001", label: "Devotion plans", type: "plan", status: "ready" },
        { id: "devotions-002", label: "Reading cadence", type: "schedule", status: "in-progress" },
        { id: "devotions-003", label: "Follow-up prompts", type: "prompt", status: "queued" }
      ],
      "prayer-journal": () => [
        { id: "prayer-journal-001", label: "Prayer journal", type: "journal", status: "ready" },
        { id: "prayer-journal-002", label: "Entry history", type: "history", status: "in-progress" },
        { id: "prayer-journal-003", label: "Reflection prompts", type: "prompt", status: "queued" }
      ],
      "scripture-search": () => [
        { id: "scripture-search-001", label: "Scripture search", type: "search", status: "ready" },
        { id: "scripture-search-002", label: "Reference lookup", type: "lookup", status: "ready" },
        { id: "scripture-search-003", label: "Cross-reference surface", type: "study", status: "queued" }
      ]
    }
  },
  {
    name: "flockchat",
    dir: path.resolve("src/apps/flockchat/modules"),
    sourceScript: "flockchat-public/FlockChat/the_word.js",
    builders: {
      auth: () => [
        { id: "auth-001", label: "Email/password sign in", backend: "Firebase Auth", status: "ready" },
        { id: "auth-002", label: "Registration and profile bootstrap", backend: "Firestore", status: "ready" },
        { id: "auth-003", label: "Password reset flow", backend: "Firebase Auth", status: "in-progress" }
      ],
      shell: () => [
        { id: "shell-001", label: "Topbar and context header", area: "layout", status: "ready" },
        { id: "shell-002", label: "Sidebar, thread, details panes", area: "layout", status: "ready" },
        { id: "shell-003", label: "Bottom nav and responsive shell", area: "mobile", status: "queued" }
      ],
      channels: () => [
        { id: "channels-001", label: "Channel CRUD", backend: "Firestore", status: "ready" },
        { id: "channels-002", label: "Role-gated and private rooms", backend: "Firestore", status: "in-progress" },
        { id: "channels-003", label: "Seed channels", backend: "bootstrap", status: "ready" }
      ],
      rooms: () => [
        { id: "rooms-001", label: "Community room list", backend: "Firestore", status: "ready" },
        { id: "rooms-002", label: "Room switching", backend: "UI", status: "ready" },
        { id: "rooms-003", label: "Room membership awareness", backend: "Firestore", status: "queued" }
      ],
      "direct-messages": () => [
        { id: "direct-messages-001", label: "DM thread creation", backend: "Firestore", status: "ready" },
        { id: "direct-messages-002", label: "DM sidebar list", backend: "Firestore", status: "in-progress" },
        { id: "direct-messages-003", label: "Participant thread routing", backend: "UI", status: "queued" }
      ],
      messages: () => [
        { id: "messages-001", label: "Realtime stream", backend: "Firestore onSnapshot", status: "ready" },
        { id: "messages-002", label: "Send, edit, delete, react", backend: "Firestore", status: "ready" },
        { id: "messages-003", label: "Cursor pagination", backend: "Firestore", status: "in-progress" }
      ],
      "channel-details": () => [
        { id: "channel-details-001", label: "Details pane", area: "UI", status: "ready" },
        { id: "channel-details-002", label: "Members and description", area: "metadata", status: "ready" },
        { id: "channel-details-003", label: "Leave channel flow", area: "membership", status: "queued" }
      ],
      composer: () => [
        { id: "composer-001", label: "Composer toolbar", area: "input", status: "ready" },
        { id: "composer-002", label: "Textarea and send state", area: "input", status: "ready" },
        { id: "composer-003", label: "Attachment placeholder", area: "input", status: "queued" }
      ],
      notifications: () => [
        { id: "notifications-001", label: "Push token flow", backend: "Firebase Messaging", status: "ready" },
        { id: "notifications-002", label: "Foreground notifications", backend: "Firebase Messaging", status: "in-progress" },
        { id: "notifications-003", label: "Announcement alerts", backend: "FlockChat", status: "queued" }
      ],
      announcements: () => [
        { id: "announcements-001", label: "Leadership announcements", backend: "Firestore", status: "ready" },
        { id: "announcements-002", label: "Seeded announcement room", backend: "bootstrap", status: "ready" },
        { id: "announcements-003", label: "Announcement send surface", backend: "UI", status: "in-progress" }
      ],
      "care-followup": () => [
        { id: "care-followup-001", label: "Care follow-up queue", backend: "channel workflow", status: "ready" },
        { id: "care-followup-002", label: "Pastoral handoff messaging", backend: "FlockChat", status: "in-progress" },
        { id: "care-followup-003", label: "Care channel coordination", backend: "rooms", status: "queued" }
      ],
      presence: () => [
        { id: "presence-001", label: "RTDB presence tracking", backend: "Realtime Database", status: "ready" },
        { id: "presence-002", label: "Typing indicators", backend: "Realtime Database", status: "ready" },
        { id: "presence-003", label: "Status pill sync", backend: "UI", status: "in-progress" }
      ],
      profile: () => [
        { id: "profile-001", label: "Display name editor", backend: "Firestore", status: "ready" },
        { id: "profile-002", label: "Status text editor", backend: "Firestore", status: "in-progress" },
        { id: "profile-003", label: "Role and email display", backend: "UI", status: "queued" }
      ],
      search: () => [
        { id: "search-001", label: "Sidebar search", scope: "channels+people", status: "ready" },
        { id: "search-002", label: "Message search bar", scope: "messages", status: "ready" },
        { id: "search-003", label: "Thread filtering", scope: "thread", status: "in-progress" }
      ],
      "admin-dashboard": () => [
        { id: "admin-dashboard-001", label: "Admin users tab", area: "admin", status: "ready" },
        { id: "admin-dashboard-002", label: "Admin rooms tab", area: "admin", status: "ready" },
        { id: "admin-dashboard-003", label: "Moderation controls", area: "admin", status: "queued" }
      ],
      "new-channel": () => [
        { id: "new-channel-001", label: "New channel modal", area: "modal", status: "ready" },
        { id: "new-channel-002", label: "Role gating and access", area: "modal", status: "ready" },
        { id: "new-channel-003", label: "Member preselection", area: "modal", status: "in-progress" }
      ],
      "new-dm": () => [
        { id: "new-dm-001", label: "Open DM modal", area: "modal", status: "ready" },
        { id: "new-dm-002", label: "User picker", area: "modal", status: "ready" },
        { id: "new-dm-003", label: "Thread open action", area: "modal", status: "queued" }
      ],
      "invite-room": () => [
        { id: "invite-room-001", label: "Invite to room modal", area: "modal", status: "ready" },
        { id: "invite-room-002", label: "Membership invite dispatch", area: "modal", status: "in-progress" },
        { id: "invite-room-003", label: "Room label and user select", area: "modal", status: "queued" }
      ],
      "manage-users": () => [
        { id: "manage-users-001", label: "Manage users modal", area: "admin", status: "ready" },
        { id: "manage-users-002", label: "Role and membership controls", area: "admin", status: "in-progress" },
        { id: "manage-users-003", label: "Moderation view", area: "admin", status: "queued" }
      ],
      "quick-switcher": () => [
        { id: "quick-switcher-001", label: "Ctrl+K launcher", area: "navigation", status: "ready" },
        { id: "quick-switcher-002", label: "Jump list", area: "navigation", status: "ready" },
        { id: "quick-switcher-003", label: "Keyboard navigation", area: "navigation", status: "queued" }
      ],
      "emoji-picker": () => [
        { id: "emoji-picker-001", label: "Composer emoji picker", area: "reactions", status: "ready" },
        { id: "emoji-picker-002", label: "Reaction target support", area: "reactions", status: "in-progress" },
        { id: "emoji-picker-003", label: "Emoji grid surface", area: "reactions", status: "queued" }
      ],
      unread: () => [
        { id: "unread-001", label: "Unread counters", backend: "read-state", status: "ready" },
        { id: "unread-002", label: "Mention highlight support", backend: "messages", status: "ready" },
        { id: "unread-003", label: "Badge surfaces", backend: "UI", status: "in-progress" }
      ]
    }
  }
];

function normalizeFactoryId(trackName, id) {
  if (trackName === "atog") {
    return String(id).replace(/^atog\./, "");
  }
  return String(id).replace(/^flockchat\./, "");
}

function normalizeSourceSurfaceKey(value) {
  return String(value || "")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function genericRecords(definition, slug) {
  return [1, 2, 3].map((n) => ({
    id: `${slug}-${String(n).padStart(3, "0")}`,
    label: `${definition.title} snapshot ${n}`,
    route: definition.route,
    status: ["ready", "in-progress", "queued"][n - 1],
    phase: definition.phase,
    zone: definition.zone
  }));
}

for (const track of tracks) {
  const files = fs.readdirSync(track.dir).filter((f) => f.endsWith(".module.js") && f !== "_moduleRuntime.js");
  let updated = 0;

  for (const file of files) {
    const full = path.join(track.dir, file);
    const mod = await import(`${pathToFileURL(full).href}?v=${Date.now()}`);
    const constName = Object.keys(mod).find((k) => k.endsWith("_MODULE"));
    const factoryName = Object.keys(mod).find((k) => /^create[A-Za-z0-9_]+Module$/.test(k));
    if (!constName || !factoryName) continue;

    const definition = { ...mod[constName] };
    const moduleSurface = normalizeFactoryId(track.name, definition.id);
    const sourceSurface = definition.liveSource?.sourceSurface || moduleSurface;
    const normalizedSurface = normalizeSourceSurfaceKey(sourceSurface);
    const normalizedModuleSurface = normalizeSourceSurfaceKey(moduleSurface);
    const builder = track.builders[sourceSurface] || track.builders[normalizedSurface] || track.builders[moduleSurface] || track.builders[normalizedModuleSurface];
    const records = typeof builder === "function" ? builder() : genericRecords(definition, normalizedModuleSurface || normalizedSurface || sourceSurface.replace(/[^a-z0-9-]/gi, "-").toLowerCase());

    definition.seedData = {
      source: "live-snapshot-importer",
      generatedAt: now,
      records
    };

    definition.liveSource = {
      ...(definition.liveSource || {}),
      provider: track.name === "atog" ? "ATOG Source Snapshot" : "FlockChat Source Snapshot",
      sourceScript: definition.liveSource?.sourceScript || track.sourceScript,
      syncedAt: now,
      refreshMode: "imported-static-snapshot"
    };

    const next = `import { createStandaloneFlockOSModule } from "./_moduleRuntime.js";\n\nexport const ${constName} = ${JSON.stringify(definition, null, 2)};\n\nexport function ${factoryName}(deps = {}) {\n  return createStandaloneFlockOSModule(${constName}, deps);\n}\n`;
    fs.writeFileSync(full, next, "utf8");
    updated += 1;
  }

  console.log(`${track.name}: refreshed ${updated} module files`);
}
