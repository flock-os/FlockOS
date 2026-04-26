function resolveHost(target) {
  if (!target) {
    return null;
  }

  if (typeof target === "string") {
    return document.querySelector(target);
  }

  return target;
}

function renderSeedRecords(records = []) {
  if (!Array.isArray(records) || records.length === 0) {
    return "";
  }

  const items = records
    .map((row) => {
      const label = row?.label || row?.id || "record";
      const status = row?.status || "ready";
      const phase = row?.phase || "";
      return `<li><strong>${label}</strong> <span>(${status}${phase ? ` | ${phase}` : ""})</span></li>`;
    })
    .join("");

  return `
    <div class="module-seed-data">
      <h4>Seed Data</h4>
      <ul>${items}</ul>
    </div>
  `;
}

export function createStandaloneFlockOSModule(definition, deps = {}) {
  const state = {
    mounted: false,
    mountedAt: null,
    hydratedAt: null,
    payload: null
  };

  const listeners = new Set();

  function snapshot() {
    return {
      mounted: state.mounted,
      mountedAt: state.mountedAt,
      hydratedAt: state.hydratedAt,
      payload: state.payload
    };
  }

  function notify() {
    const data = snapshot();
    listeners.forEach((listener) => {
      try {
        listener(data);
      } catch {
        // Keep module runtime alive if an observer throws.
      }
    });
  }

  function mount(target) {
    const host = resolveHost(target);
    if (!host) {
      return false;
    }

    if (!state.payload && definition.seedData) {
      state.payload = definition.seedData;
      state.hydratedAt = new Date().toISOString();
    }

    const records = state.payload?.records || definition.seedData?.records || [];

    host.innerHTML = `
      <section class="module-shell" data-module-id="${definition.id}">
        <h3>${definition.title}</h3>
        <p><strong>Route:</strong> ${definition.route}</p>
        <p><strong>Zone:</strong> ${definition.zone}</p>
        <p><strong>Phase:</strong> ${definition.phase}</p>
        ${renderSeedRecords(records)}
      </section>
    `;

    state.mounted = true;
    state.mountedAt = new Date().toISOString();
    notify();

    if (typeof deps.onMount === "function") {
      deps.onMount({ definition, state: snapshot(), host });
    }

    return true;
  }

  function unmount(target) {
    const host = resolveHost(target);
    if (host) {
      host.innerHTML = "";
    }

    state.mounted = false;
    notify();

    if (typeof deps.onUnmount === "function") {
      deps.onUnmount({ definition, state: snapshot(), host });
    }

    return true;
  }

  function hydrate(payload = {}) {
    state.payload = payload;
    state.hydratedAt = new Date().toISOString();
    notify();
    return snapshot();
  }

  function onChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return {
    id: definition.id,
    definition,
    getDefinition: () => definition,
    getState: () => snapshot(),
    mount,
    unmount,
    hydrate,
    onChange
  };
}
