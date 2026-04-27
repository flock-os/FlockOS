/* ══════════════════════════════════════════════════════════════════════════════
   THE TRUMPET — Device APIs (share, clipboard, call, sms, notify, badge, …)
   "Blow the trumpet in Zion." — Joel 2:1
   ══════════════════════════════════════════════════════════════════════════════ */

import { bridge, when, callWhen } from '../the_legacy_bridge.js';

const NAME = 'Trumpet';

export const ready = () => when(NAME);
export const live  = () => bridge(NAME);

export const share      = (...a) => callWhen(NAME, 'share', ...a);
export const clipboard  = (...a) => callWhen(NAME, 'clipboard', ...a);
export const call       = (...a) => callWhen(NAME, 'call', ...a);
export const sms        = (...a) => callWhen(NAME, 'sms', ...a);
export const notify     = (...a) => callWhen(NAME, 'notify', ...a);
export const badge      = (...a) => callWhen(NAME, 'badge', ...a);
export const fullscreen = (...a) => callWhen(NAME, 'fullscreen', ...a);
export const camera     = (...a) => callWhen(NAME, 'camera', ...a);
export const resizeImage = (...a) => callWhen(NAME, 'resizeImage', ...a);
export const qr         = (...a) => callWhen(NAME, 'qr', ...a);
export const geo        = (...a) => callWhen(NAME, 'geo', ...a);
