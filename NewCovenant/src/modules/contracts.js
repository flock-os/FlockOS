export const MODULE_CONTRACTS = {
  config: {
    name: "config",
    version: "0.1.0",
    requiredMethods: ["get", "set", "getSnapshot"]
  },
  resolver: {
    name: "resolver",
    version: "0.1.0",
    requiredMethods: ["resolveRoute", "registerRoute"]
  },
  auth: {
    name: "auth",
    version: "0.1.0",
    requiredMethods: ["getCurrentUser", "signIn", "signOut"]
  },
  offline: {
    name: "offline",
    version: "0.1.0",
    requiredMethods: ["isOnline", "queue", "flush"]
  },
  "ui-kit": {
    name: "ui-kit",
    version: "0.1.0",
    requiredMethods: ["mount", "notify", "renderState"]
  }
};

export function assertContract(contractName, moduleImpl) {
  const spec = MODULE_CONTRACTS[contractName];
  if (!spec) {
    throw new Error(`Unknown contract: ${contractName}`);
  }

  const missingMethods = spec.requiredMethods.filter((method) => {
    return typeof moduleImpl[method] !== "function";
  });

  return {
    contract: spec.name,
    version: spec.version,
    valid: missingMethods.length === 0,
    missingMethods
  };
}
