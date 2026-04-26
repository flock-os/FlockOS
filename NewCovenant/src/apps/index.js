import { ATOG_APP } from "./atog.app.js";
import { FLOCKOS_APP } from "./flockos.app.js";
import { FLOCKCHAT_APP } from "./flockchat.app.js";

// Registry used by the public stream renderer in main.js.
export const SITE_WEAVE_CONTENT = {
  flockos: FLOCKOS_APP,
  atog: ATOG_APP,
  flockchat: FLOCKCHAT_APP
};

export function getWeaveOrder() {
  return [FLOCKOS_APP.id, ATOG_APP.id, FLOCKCHAT_APP.id];
}
