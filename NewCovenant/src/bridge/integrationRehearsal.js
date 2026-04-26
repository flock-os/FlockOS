import { evaluatePortMap } from "./portMap.js";

function installMockFlockOS() {
  if (typeof window === "undefined") {
    return false;
  }

  const existing = window.FlockOS;

  window.FlockOS = {
    ...(existing || {}),
    configStore: {
      get(key) {
        return key;
      }
    },
    router: {
      resolve(path) {
        return { found: true, path };
      }
    },
    auth: {
      getCurrentUser() {
        return { id: "mock-user", name: "Mock User", roles: ["builder"] };
      }
    },
    offline: {
      enqueue(job) {
        return job;
      }
    },
    ui: {
      notify(message) {
        return message;
      }
    }
  };

  return existing;
}

function restoreMockFlockOS(existing) {
  if (typeof window === "undefined") {
    return;
  }

  if (existing === false) {
    return;
  }

  if (typeof existing === "undefined") {
    delete window.FlockOS;
    return;
  }

  window.FlockOS = existing;
}

export function runIntegrationRehearsal() {
  const before = evaluatePortMap();
  const previous = installMockFlockOS();
  const after = evaluatePortMap();
  restoreMockFlockOS(previous);

  return {
    before,
    after,
    summary: {
      improvedBy: after.summary.available - before.summary.available,
      total: after.summary.total,
      beforeAvailable: before.summary.available,
      afterAvailable: after.summary.available
    }
  };
}
