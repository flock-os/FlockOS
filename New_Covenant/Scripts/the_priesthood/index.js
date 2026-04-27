/* ══════════════════════════════════════════════════════════════════════════════
   THE PRIESTHOOD — Auth UI shell (public API)
   "But ye are a chosen generation, a royal priesthood." — 1 Peter 2:9

   Thin wrapper over Nehemiah (firm_foundation.js). Phase I responsibilities:
     • whoAmI()  — resolve the current user (no UI block)
     • enter()   — open sign-in sheet (delegates to Nehemiah)
     • depart()  — sign out
     • openAccountSheet() — small account drawer triggered from the_crown
   ══════════════════════════════════════════════════════════════════════════════ */

import { renderGarments } from './the_garments.js';
import { readToken }      from './the_anointing.js';
import { renderBadge }    from './the_breastplate.js';

let _profile = null;

export async function whoAmI() {
  // Nehemiah lives on window when loaded by the legacy bundle.
  const N = window.Nehemiah;
  if (!N || typeof N.getProfile !== 'function') {
    _profile = null;
    return null;
  }
  try {
    _profile = N.getProfile() || null;
  } catch (_) {
    _profile = null;
  }
  return _profile;
}

export function profile() { return _profile; }

export async function enter() {
  return renderGarments({ mode: 'login' });
}

export async function depart() {
  const N = window.Nehemiah;
  if (N && typeof N.logout === 'function') {
    try { await N.logout(); } catch (_) { /* graceful */ }
  }
  _profile = null;
  location.search = '?covenant=new';
}

export function openAccountSheet() {
  if (!_profile) return enter();
  return renderBadge(_profile, { onSignOut: depart });
}

export { readToken };
