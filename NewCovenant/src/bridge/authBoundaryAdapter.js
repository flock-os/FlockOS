import { BRIDGE_EVENT_TOPICS, emitBridgeEvent } from "./events.js";

export function createAuthBoundaryAdapter(bridge) {
  function hasRole(user, allowedRoles) {
    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
      return true;
    }

    const roles = Array.isArray(user?.roles) ? user.roles : [];
    return allowedRoles.some((role) => roles.includes(role));
  }

  return {
    canAccess(policy = {}) {
      const user = bridge.getUser();

      if (policy.requireSignedIn && !user) {
        return { allowed: false, reason: "auth-required", user: null };
      }

      if (!hasRole(user, policy.allowedRoles)) {
        return { allowed: false, reason: "missing-role", user };
      }

      return { allowed: true, reason: "ok", user };
    },

    enforce(policy = {}) {
      const result = this.canAccess(policy);
      emitBridgeEvent(BRIDGE_EVENT_TOPICS.authChanged, {
        allowed: result.allowed,
        reason: result.reason,
        user: result.user
      });
      return result;
    }
  };
}
