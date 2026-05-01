/* ══════════════════════════════════════════════════════════════════════════════
   THE FIREBASE CONFIG — Per-church Firebase web config resolution
   "Except the LORD build the house, they labour in vain that build it." — Ps 127:1

   Reads window.FLOCK_FIREBASE_CONFIG (injected per-church by the build), with
   a safe fallback to the shared flockos-notify project for churches that
   haven't been migrated to their own Firebase yet.

   Public API:
     getConfig()  — { apiKey, authDomain, projectId, ... }
     getVapidKey() — string (FCM web push key) or null
     getProjectId() — convenience
     hasOwnProject() — true if church has its own Firebase project
   ══════════════════════════════════════════════════════════════════════════════ */

const SHARED_FALLBACK_PROJECT = 'flockos-notify';

export function getConfig() {
  const inj = (typeof window !== 'undefined') ? window.FLOCK_FIREBASE_CONFIG : null;
  if (inj && inj.projectId) return inj;
  return null; // No fallback config baked in — caller should detect and degrade.
}

export function getVapidKey() {
  if (typeof window === 'undefined') return null;
  return window.FLOCK_VAPID_KEY || null;
}

export function getProjectId() {
  const c = getConfig();
  return c && c.projectId ? c.projectId : SHARED_FALLBACK_PROJECT;
}

export function hasOwnProject() {
  return getProjectId() !== SHARED_FALLBACK_PROJECT;
}
