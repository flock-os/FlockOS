const STORAGE_KEY = "newcovenant.config.v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function cloneValue(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function readStoredConfig() {
  if (!canUseStorage()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_error) {
    return {};
  }
}

function writeStoredConfig(snapshot) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (_error) {
    // Best-effort persistence; memory state remains source of truth during this session.
  }
}

export function createConfigModule(seed = {}) {
  const initial = { ...readStoredConfig(), ...seed };
  const state = new Map(Object.entries(initial));

  return {
    get(key, fallback = null) {
      return state.has(key) ? cloneValue(state.get(key)) : fallback;
    },

    set(key, value) {
      state.set(key, cloneValue(value));
      writeStoredConfig(Object.fromEntries(state.entries()));
      return value;
    },

    getSnapshot() {
      return cloneValue(Object.fromEntries(state.entries()));
    }
  };
}
