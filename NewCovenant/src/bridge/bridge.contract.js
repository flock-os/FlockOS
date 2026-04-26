export const BRIDGE_CONTRACT = {
  name: "newcovenant-bridge",
  version: "0.1.0",
  requiredMethods: [
    "getConfig",
    "resolve",
    "getUser",
    "signIn",
    "signOut",
    "enqueueOffline",
    "flushOffline",
    "notify",
    "renderAdminState",
    "runSmoke"
  ]
};

export function assertBridgeContract(bridge) {
  const missingMethods = BRIDGE_CONTRACT.requiredMethods.filter((method) => {
    return typeof bridge[method] !== "function";
  });

  return {
    contract: BRIDGE_CONTRACT.name,
    version: BRIDGE_CONTRACT.version,
    valid: missingMethods.length === 0,
    missingMethods
  };
}
