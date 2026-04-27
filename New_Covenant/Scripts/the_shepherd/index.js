/* ══════════════════════════════════════════════════════════════════════════════
   THE SHEPHERD — People engine (split index)
   "I am the good shepherd: the good shepherd giveth his life for the sheep." — Jn 10:11

   Phase I: thin re-export of the live `TheShepherd` legacy global. The actual
   file split (the_search.js, the_profile.js, the_save.js, the_permissions.js)
   lands in Phase II — call sites don't change because they import only from
   this index.

   Public surface (matches legacy `TheShepherd`):
     search(query, opts)         — member directory search
     getProfile(id)              — full profile bundle
     save(id, patch)             — multi-table save
     create(payload)             — new member / card
     can(action, target)         — permission check (delegates to Temple)
   ══════════════════════════════════════════════════════════════════════════════ */

import { bridge, when, callWhen } from '../the_legacy_bridge.js';

const NAME = 'TheShepherd';

export const ready = () => when(NAME);
export const live  = () => bridge(NAME);

export const search     = (...a) => callWhen(NAME, 'search', ...a);
export const getProfile = (...a) => callWhen(NAME, 'getProfile', ...a);
export const save       = (...a) => callWhen(NAME, 'save', ...a);
export const create     = (...a) => callWhen(NAME, 'create', ...a);
export const can        = (...a) => callWhen(NAME, 'can', ...a);
