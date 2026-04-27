/* ══════════════════════════════════════════════════════════════════════════════
   THE HARVEST — Ministry hub: events, sermons, service plans, songs, teams, volunteers
   "The harvest truly is plenteous, but the labourers are few." — Matthew 9:37
   ══════════════════════════════════════════════════════════════════════════════ */

import { bridge, when, callWhen } from '../the_legacy_bridge.js';

const NAME = 'TheHarvest';

export const ready = () => when(NAME);
export const live  = () => bridge(NAME);

export const listEvents       = (...a) => callWhen(NAME, 'listEvents', ...a);
export const saveEvent        = (...a) => callWhen(NAME, 'saveEvent', ...a);
export const listSermons      = (...a) => callWhen(NAME, 'listSermons', ...a);
export const saveSermon       = (...a) => callWhen(NAME, 'saveSermon', ...a);
export const listServicePlans = (...a) => callWhen(NAME, 'listServicePlans', ...a);
export const saveServicePlan  = (...a) => callWhen(NAME, 'saveServicePlan', ...a);
export const listTeams        = (...a) => callWhen(NAME, 'listTeams', ...a);
export const listVolunteers   = (...a) => callWhen(NAME, 'listVolunteers', ...a);
