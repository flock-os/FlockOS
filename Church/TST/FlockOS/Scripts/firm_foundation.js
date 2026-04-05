/* ══════════════════════════════════════════════════════════════════════════════
   FIRM_FOUNDATION.js — The Secure Wall
   "So I sent messengers to them, saying, 'I am doing a great work
    and I cannot come down.'" — Nehemiah 6:3

   Nehemiah rebuilt the wall around Jerusalem to protect God's people.
   This module guards access to FlockOS — no one enters without passing
   through the gate.

   Responsibilities:
     1. Gate check — is the user authenticated?  (isAuthenticated)
     2. Login      — email + passcode → token    (login)
     3. Logout     — clear session + server       (logout)
     4. Register   — self-registration            (register)
     5. Forgot     — password reset request        (forgotPassword)
     6. Reset      — reset with code               (resetWithCode)
     7. Guard      — redirect unauthenticated      (guard)
     8. Role check — minimum role enforcement       (requireRole)
     9. Session    — expose session data            (getSession, getProfile)

   Depends on:
     TheVine  (the_true_vine.js) — all API calls flow through The Vine

   Usage:
     Nehemiah.guard();                              // redirect if not logged in
     Nehemiah.login('user@email.com', 'pass123');   // returns session or throws
     Nehemiah.logout();                             // clears everything
     Nehemiah.isAuthenticated();                    // true / false
     Nehemiah.requireRole('pastor');                // throws if insufficient
     Nehemiah.getSession();                         // { token, email, role, ... }
   ══════════════════════════════════════════════════════════════════════════════ */

const Nehemiah = (() => {
  'use strict';

  // ── Constants ────────────────────────────────────────────────────────────

  // Resolve paths relative to the site root so redirects work from any page depth.
  const _base = (function() {
    const s = document.querySelector('script[src*="firm_foundation"]');
    if (!s) return '';
    const src = s.getAttribute('src');
    // Strip path to "Scripts/firm_foundation.js" to get base, then point to Pages/
    const idx = src.indexOf('Scripts/');
    if (idx < 0) return '';
    // e.g. "FlockOS/Scripts/" → "FlockOS/Pages/" (HTML files live in Pages/)
    return src.substring(0, idx) + 'Pages/';
  })();

  const LOGIN_PAGE  = _base + 'the_wall.html';
  const APP_PAGE    = _base + 'the_good_shepherd.html';
  const ROLE_LEVELS = { readonly: 0, volunteer: 1, care: 2, leader: 3, pastor: 4, admin: 5 };

  // ── Local Security Bypass ────────────────────────────────────────────────
  // Allows running FlockOS locally (file:// or localhost) without a live
  // GAS backend.  Injects a synthetic admin session into sessionStorage so
  // TheVine.session() and all downstream auth checks pass transparently.
  //
  // Activate:   Nehemiah.enableLocalBypass()
  // Deactivate: Nehemiah.disableLocalBypass()
  // Check:      Nehemiah.isLocalBypass()
  //
  // The flag persists in localStorage — survives page reloads but NOT
  // incognito/different-browser sessions (by design).

  const LOCAL_BYPASS_KEY = 'flock_local_bypass';

  /** True only when the page is served from file://, localhost, or 127.0.0.1. */
  function _isLocalEnv() {
    const h = location.hostname;
    return location.protocol === 'file:' || h === 'localhost' || h === '127.0.0.1';
  }

  function _isLocalBypass() {
    return _isLocalEnv() && localStorage.getItem(LOCAL_BYPASS_KEY) === 'true';
  }

  /** Build the synthetic session that stands in for a real server token. */
  function _syntheticSession() {
    // Build all-true permissions map for local dev
    const allPerms = {};
    const moduleKeys = [
      'dashboard','daily-bread','upper-room','reading-plan','devotionals',
      'prayer','my-requests','words','themes','sermons','songs','calendar',
      'events','services','ministries','volunteers','todo','checkin','journal',
      'directory','members','care','my-flock','prayer-admin','compassion','mirror',
      'groups','attendance','giving','discipleship','outreach','learning',
      'theology','library','comms','missions','statistics','reports',
      'users','config','audit','interface-studio'
    ];
    moduleKeys.forEach(k => { allPerms[k] = true; });

    return {
      token:       'local-bypass-' + Date.now(),
      email:       'local@flockos.dev',
      role:        'admin',
      roleLevel:   5,
      displayName: 'Local Developer',
      expiresAt:   Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
      permissions: allPerms,
    };
  }

  /** Ensure the synthetic session exists in sessionStorage. */
  function _ensureBypassSession() {
    const key = 'flock_auth_session';
    const existing = sessionStorage.getItem(key);
    if (!existing) {
      sessionStorage.setItem(key, JSON.stringify(_syntheticSession()));
    }
    // Also inject a minimal profile so getProfile() works
    const profKey = 'flock_auth_profile';
    if (!sessionStorage.getItem(profKey)) {
      sessionStorage.setItem(profKey, JSON.stringify({
        email:       'local@flockos.dev',
        displayName: 'Local Developer',
        firstName:   'Local',
        lastName:    'Developer',
        role:        'admin',
        theme:       'Auto',
      }));
    }
  }

  /** Activate Local Security Bypass (only works on local origins). */
  function enableLocalBypass() {
    if (!_isLocalEnv()) {
      console.warn('[Nehemiah] Local Security Bypass is only available on file://, localhost, or 127.0.0.1.');
      return;
    }
    localStorage.setItem(LOCAL_BYPASS_KEY, 'true');
    _ensureBypassSession();
    console.log('%c[Nehemiah] Local Security Bypass ENABLED — admin session injected.', 'color:#e8a838;font-weight:bold');
  }

  /** Deactivate Local Security Bypass and clear the synthetic session. */
  function disableLocalBypass() {
    localStorage.removeItem(LOCAL_BYPASS_KEY);
    // Only clear if the session is the synthetic one
    try {
      const raw = sessionStorage.getItem('flock_auth_session');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.email === 'local@flockos.dev') {
          sessionStorage.removeItem('flock_auth_session');
          sessionStorage.removeItem('flock_auth_profile');
        }
      }
    } catch (_) { /* ignore */ }
    console.log('%c[Nehemiah] Local Security Bypass DISABLED.', 'color:#e8a838;font-weight:bold');
  }

  // Auto-restore bypass session on page load if the flag is set
  if (_isLocalBypass()) {
    _ensureBypassSession();
  }


  // ── Gate Check ───────────────────────────────────────────────────────────

  /** Returns true if a valid, non-expired session exists client-side. */
  function isAuthenticated() {
    if (_isLocalBypass()) return true;
    return TheVine.session() !== null;
  }

  /** Returns the current session object or null. */
  function getSession() {
    if (_isLocalBypass()) { _ensureBypassSession(); }
    return TheVine.session();
  }

  /** Returns the cached profile or null. */
  function getProfile() {
    try {
      const raw = sessionStorage.getItem('flock_auth_profile');
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }


  // ── Guard (page-level gate) ──────────────────────────────────────────────

  /**
   * Call at the top of every protected page.
   * Redirects to the login wall if the user has no valid session.
   * Returns the session object if authenticated (so callers can use it).
   */
  function guard() {
    if (_isLocalBypass()) { _ensureBypassSession(); }
    const session = getSession();
    if (!session) {
      window.location.replace(LOGIN_PAGE);
      return null;
    }
    return session;
  }

  /**
   * Call on the login page itself — if already authenticated, skip to app.
   */
  function guardLogin() {
    if (_isLocalBypass()) {
      window.location.replace(APP_PAGE);
      return;
    }
    if (isAuthenticated()) {
      window.location.replace(APP_PAGE);
    }
  }


  // ── Role Enforcement ─────────────────────────────────────────────────────

  /**
   * Returns true if the current user meets the minimum role requirement.
   * @param {string} minRole — 'readonly' | 'volunteer' | 'care' | 'leader' | 'pastor' | 'admin'
   */
  function hasRole(minRole) {
    const session = getSession();
    if (!session || !session.role) return false;
    const userLevel = ROLE_LEVELS[session.role] ?? -1;
    const reqLevel  = ROLE_LEVELS[minRole] ?? 99;
    return userLevel >= reqLevel;
  }

  /**
   * Returns true if the current user has access to the given module.
   * Checks the permissions map returned by the server at login.
   * Falls back to role-level check if no permissions map exists.
   *
   * @param {string} moduleKey — e.g. 'events', 'giving', 'users'
   * @returns {boolean}
   */
  function canAccess(moduleKey) {
    const session = getSession();
    if (!session) return false;
    // If the server provided a permissions map, use it
    if (session.permissions && typeof session.permissions === 'object') {
      return session.permissions[moduleKey] === true;
    }
    // Fallback: legacy role-level check (pre-permissions sessions)
    return true; // allow if no permissions map (backward compat)
  }

  /**
   * Returns true for the given fine-grained capability key.
   * Seed admin and Lead Pastor bypass all checks and always return true.
   * All other users are evaluated against the permissions map returned at login.
   *
   * @param {string} capability — e.g. 'care.view-all', 'my-flock.add-edit-members'
   * @returns {boolean}
   */
  function can(capability) {
    const session = getSession();
    if (!session) return false;
    // Seed admin and Lead Pastor always have full access — they cannot be locked out
    if (session.isSeed) return true;
    const profile = getProfile();
    if (profile && profile.groups) {
      const groups = String(profile.groups).split(',').map(g => g.trim().toLowerCase());
      if (groups.indexOf('lead pastor') !== -1) return true;
    }
    if (session.permissions && typeof session.permissions === 'object') {
      return session.permissions[capability] === true;
    }
    return false;
  }

  /**
   * Returns true if the current user belongs to the named group.
   * Checks the profile's groups field (comma-separated in AccessControl).
   * @param {string} groupName — e.g. 'Lead Pastor'
   */
  function hasGroup(groupName) {
    const profile = getProfile();
    if (!profile || !profile.groups) return false;
    const groups = String(profile.groups).split(',').map(g => g.trim().toLowerCase());
    return groups.indexOf(String(groupName).toLowerCase()) !== -1;
  }

  /**
   * Throws an Error if the user doesn't meet the minimum role.
   * Use for gating admin panels, pastor-only views, etc.
   */
  function requireRole(minRole) {
    if (!hasRole(minRole)) {
      throw new Error('Access denied. Requires ' + minRole + ' or higher.');
    }
  }


  // ── Login ────────────────────────────────────────────────────────────────

  /**
   * Authenticates with email + passcode via John (Flock API).
   * On success: saves session + profile to sessionStorage, returns session.
   * On failure: throws an Error with the server's message.
   *
   * @param {string} email
   * @param {string} passcode
   * @returns {Promise<Object>} session object { token, email, role, displayName, expiresAt }
   */
  async function login(email, passcode) {
    if (!email || !passcode) {
      throw new Error('Email and passcode are required.');
    }

    const result = await TheVine.john.auth.login({ email, passcode });

    if (!result || !result.ok) {
      throw new Error((result && result.error) || 'Login failed.');
    }

    // TheVine.john.auth.login already saves the session internally.
    // Cache profile if returned.
    if (result.profile) {
      try { sessionStorage.setItem('flock_auth_profile', JSON.stringify(result.profile)); } catch (_) {}
    }

    return result.session || result;
  }


  // ── Logout ───────────────────────────────────────────────────────────────

  /**
   * Clears local session and tells the server to invalidate the token.
   * Always redirects to the login wall, even if the server call fails.
   */
  async function logout() {
    try {
      await TheVine.john.auth.logout({});
    } catch (_) {
      // Server call is best-effort — clear local state regardless
    }
    // TheVine.john.auth.logout already clears the session internally.
    window.location.replace(LOGIN_PAGE);
  }


  // ── Registration ─────────────────────────────────────────────────────────

  /**
   * Self-register a new account (if ALLOW_SELF_REGISTER is enabled).
   * Account starts in 'pending' status — admin must approve before login.
   *
   * @param {Object} opts — { email, passcode, firstName, lastName? }
   * @returns {Promise<Object>} server response
   */
  async function register(opts) {
    if (!opts.email || !opts.passcode || !opts.firstName) {
      throw new Error('Email, passcode, and first name are required.');
    }

    const result = await TheVine.john.auth.register(opts);

    if (!result || !result.ok) {
      throw new Error((result && result.error) || 'Registration failed.');
    }

    return result;
  }


  // ── Password Reset ───────────────────────────────────────────────────────

  /**
   * Request a password reset code (sent to email).
   * Returns a generic success message regardless of whether the email exists.
   */
  async function forgotPassword(email) {
    if (!email) throw new Error('Email is required.');

    const result = await TheVine.john.auth.forgotPassword({ email });

    if (!result || !result.ok) {
      throw new Error((result && result.error) || 'Request failed.');
    }

    return result;
  }

  /**
   * Reset password using the 6-digit code from email.
   */
  async function resetWithCode(email, resetCode, newPasscode) {
    if (!email || !resetCode || !newPasscode) {
      throw new Error('Email, reset code, and new passcode are required.');
    }

    const result = await TheVine.john.auth.resetWithToken({
      email, resetCode, newPasscode
    });

    if (!result || !result.ok) {
      throw new Error((result && result.error) || 'Reset failed.');
    }

    return result;
  }


  // ── Offline Vault Integration ────────────────────────────────────────────

  /**
   * Set up offline vault: encrypt current session with a PIN.
   * @param {string} pin — 6+ character PIN
   */
  async function setupVault(pin) {
    if (typeof TheWellspring === 'undefined' || !TheWellspring.vault) {
      throw new Error('Offline vault not available');
    }
    var s = getSession();
    if (!s) throw new Error('Must be logged in to set up offline vault');
    await TheWellspring.vault.setup(pin, {
      email: s.email,
      role: s.role,
      roleLevel: s.roleLevel,
      displayName: s.displayName,
      permissions: s.permissions || {},
      isSeed: s.isSeed || false,
    });
  }

  /**
   * Attempt offline login with PIN.
   * Decrypts the vault and creates a local session with offline:true flag.
   * @param {string} pin
   * @returns {object} session object
   */
  async function loginOffline(pin) {
    if (typeof TheWellspring === 'undefined' || !TheWellspring.vault) {
      throw new Error('Offline vault not available');
    }
    var session = await TheWellspring.vault.unlock(pin);
    // reduced TTL: 4 hours
    session.expiresAt = Date.now() + (4 * 60 * 60 * 1000);
    session.token = 'offline-' + Date.now();
    sessionStorage.setItem('flock_auth_session', JSON.stringify(session));
    return session;
  }

  /**
   * Check if offline vault is available.
   * @returns {Promise<boolean>}
   */
  async function hasVault() {
    if (typeof TheWellspring === 'undefined' || !TheWellspring.vault) return false;
    return TheWellspring.vault.exists();
  }

  /**
   * Destroy the offline vault.
   */
  async function destroyVault() {
    if (typeof TheWellspring === 'undefined' || !TheWellspring.vault) return;
    return TheWellspring.vault.destroy();
  }


  // ── Public API ───────────────────────────────────────────────────────────

  return Object.freeze({
    // Gate
    isAuthenticated,
    guard,
    guardLogin,

    // Session
    getSession,
    getProfile,

    // Role
    hasRole,
    hasGroup,
    canAccess,
    can,
    requireRole,

    // Auth actions
    login,
    logout,
    register,
    forgotPassword,
    resetWithCode,

    // Offline Vault
    setupVault,
    loginOffline,
    hasVault,
    destroyVault,

    // Local Security Bypass
    enableLocalBypass,
    disableLocalBypass,
    isLocalBypass: _isLocalBypass,
  });

})();
