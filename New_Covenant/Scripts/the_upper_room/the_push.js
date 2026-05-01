/* ══════════════════════════════════════════════════════════════════════════════
   THE PUSH — FCM token registration + delivery hooks
   "He shall send his angel before thee." — Genesis 24:7

   Registers the browser's FCM token with the church's Firebase project so
   Trumpet.notify can deliver to this device. Token is stored in
   churches/{cid}/devices/{uid}_{tokenHash}.

   Public API:
     register()           — request permission + register token
     unregister()         — remove token (sign-out)
     enabled()            — boolean
   ══════════════════════════════════════════════════════════════════════════════ */

import { getVapidKey } from './the_firebase_config.js';

export async function register() {
  if (typeof Notification === 'undefined') return { ok: false, reason: 'no-notification-api' };
  const vapid = getVapidKey();
  if (!vapid) return { ok: false, reason: 'no-vapid-key' };
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return { ok: false, reason: 'denied' };
  return window.UpperRoom?.registerPush?.({ vapid });
}

export async function unregister() {
  try { return await window.UpperRoom?.unregisterPush?.(); }
  catch (_) { return { ok: false }; }
}

export function enabled() {
  return typeof Notification !== 'undefined' && Notification.permission === 'granted';
}
