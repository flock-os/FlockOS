import fs from "node:fs";
import { FLOCKOS_MODULES } from "../src/apps/flockos/modules/index.js";
import { ATOG_MODULES } from "../src/apps/atog/modules/index.js";
import { FLOCKCHAT_MODULES } from "../src/apps/flockchat/modules/index.js";

function extractFlockosMetaKeys(source) {
  const start = source.indexOf("const _moduleMeta = {");
  const brace = source.indexOf("{", start);
  let depth = 0;
  let end = brace;
  for (let i = brace; i < source.length; i += 1) {
    if (source[i] === "{") depth += 1;
    if (source[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  const block = source.slice(brace + 1, end);
  return [...block.matchAll(/\n\s*'?(?<key>[A-Za-z0-9-]+)'?\s*:\s*\{/g)].map((m) => m.groups.key);
}

const flockosSource = fs.readFileSync("../Covenant/Courts/TheTabernacle/Scripts/the_tabernacle.js", "utf8");
const flockosExpected = extractFlockosMetaKeys(flockosSource);
const flockosCurrent = FLOCKOS_MODULES.map((m) => m.id.replace(/^flockos\./, ""));
const flockosMissing = flockosExpected.filter((key) => !flockosCurrent.includes(key));

const atogHtml = fs.readFileSync("../Covenant/Courts/TheUpperRoom/ATOG.html", "utf8");
const atogViews = [...new Set([...atogHtml.matchAll(/data-view="([^"]+)"/g)].map((m) => m[1]))];
const atogResearchExpected = ["biblical-worship", "prayer-intercession"];
const atogCurrent = new Set(ATOG_MODULES.map((m) => m.liveSource?.sourceSurface || m.id.replace(/^atog\./, "")));
const atogMissing = atogViews.filter((view) => !atogCurrent.has(view)).concat(atogResearchExpected.filter((view) => !atogCurrent.has(view)));

const flockchatExpected = [
  "auth",
  "shell",
  "channels",
  "rooms",
  "direct-messages",
  "messages",
  "channel-details",
  "composer",
  "notifications",
  "announcements",
  "care-followup",
  "presence",
  "profile",
  "search",
  "admin-dashboard",
  "new-channel",
  "new-dm",
  "invite-room",
  "manage-users",
  "quick-switcher",
  "emoji-picker",
  "unread"
];
const flockchatCurrent = new Set(FLOCKCHAT_MODULES.map((m) => (m.liveSource?.sourceSurface || m.id.replace(/^flockchat\./, "")).replace(/^flockchat\./, "")));
const flockchatMissing = flockchatExpected.filter((surface) => !flockchatCurrent.has(surface));

const report = {
  flockos: {
    expected: flockosExpected.length,
    current: flockosCurrent.length,
    missing: flockosMissing
  },
  atog: {
    expectedViews: atogViews.length + atogResearchExpected.length,
    current: ATOG_MODULES.length,
    missing: atogMissing
  },
  flockchat: {
    expected: flockchatExpected.length,
    current: FLOCKCHAT_MODULES.length,
    missing: flockchatMissing
  }
};

console.log(JSON.stringify(report, null, 2));