const SESSION_KEY = "newcovenant.auth.session.v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function cloneValue(value) {
  return value ? { ...value } : null;
}

function readSession() {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.expiresAt || parsed.expiresAt < Date.now()) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return parsed;
  } catch (_error) {
    return null;
  }
}

function writeSession(session) {
  if (!canUseStorage()) {
    return;
  }

  try {
    if (!session) {
      window.localStorage.removeItem(SESSION_KEY);
      return;
    }
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (_error) {
    // Session is still available in memory even when persistence fails.
  }
}

export function createAuthModule() {
  let user = readSession();

  return {
    getCurrentUser() {
      return cloneValue(user);
    },

    signIn(identity) {
      const candidate = identity || {};
      const resolvedId = String(candidate.id || "local-user").trim();
      const resolvedName = String(candidate.name || "Local User").trim();

      user = {
        id: resolvedId,
        name: resolvedName,
        roles: Array.isArray(candidate.roles) ? [...candidate.roles] : ["member"],
        issuedAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 60 * 12
      };

      writeSession(user);
      return cloneValue(user);
    },

    signOut() {
      user = null;
      writeSession(null);
      return true;
    }
  };
}
