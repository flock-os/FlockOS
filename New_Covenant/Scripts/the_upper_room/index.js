/* ══════════════════════════════════════════════════════════════════════════════
   THE UPPER ROOM — Comms (split index)
   "And when the day of Pentecost was fully come, they were all
    with one accord in one place." — Acts 2:1

   Single import point for every comms surface in the new shell. Sub-modules
   own their slice; this index just wires them up under one namespace.
   ══════════════════════════════════════════════════════════════════════════════ */

import { bridge, when, callWhen } from '../the_legacy_bridge.js';

import * as firebaseConfig from './the_firebase_config.js';
import * as tenant         from './the_tenant.js';
import * as identity       from './the_identity.js';
import * as channels       from './the_channels.js';
import * as messages       from './the_messages.js';
import * as dms            from './the_dms.js';
import * as presence       from './the_presence.js';
import * as typing         from './the_typing.js';
import * as unread         from './the_unread.js';
import * as mentions       from './the_mentions.js';
import * as emoji          from './the_emoji.js';
import * as seeding        from './the_seeding.js';
import * as attachments    from './the_attachments.js';
import * as push           from './the_push.js';

const NAME = 'TheUpperRoom';

export const ready = () => when(NAME);
export const live  = () => bridge(NAME);

/* Aggregate namespaces — views import these, not the legacy globals. */
export {
  firebaseConfig, tenant, identity,
  channels, messages, dms,
  presence, typing, unread,
  mentions, emoji,
  seeding, attachments, push,
};

/* Convenience scalars retained for one-line call sites. */
export const churchId    = () => tenant.churchId();
export async function unreadTotal() {
  const OR = window.UpperRoom;
  if (OR && typeof OR.getUnreadCount === 'function') {
    try { return await OR.getUnreadCount(); } catch (_) {}
  }
  return 0;
}
