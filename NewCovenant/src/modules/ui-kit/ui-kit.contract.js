function getOrCreateToastHost(root) {
  let host = root.querySelector("[data-ui='toast-host']");
  if (host) {
    return host;
  }

  host = document.createElement("div");
  host.setAttribute("data-ui", "toast-host");
  host.className = "toast-host";
  root.appendChild(host);
  return host;
}

export function createUiKitModule() {
  let mountRoot = null;

  return {
    mount(root) {
      if (!root || typeof root.appendChild !== "function") {
        throw new Error("ui-kit mount requires a valid root element");
      }

      mountRoot = root;
      getOrCreateToastHost(mountRoot);
      return mountRoot;
    },

    notify(message, level = "info") {
      const payload = {
        message: String(message || ""),
        level,
        timestamp: Date.now()
      };

      if (mountRoot) {
        const host = getOrCreateToastHost(mountRoot);
        const toast = document.createElement("div");
        toast.className = `toast toast-${level}`;
        toast.textContent = payload.message;
        host.appendChild(toast);

        window.setTimeout(() => {
          toast.remove();
        }, 2600);
      }

      return payload;
    },

    renderState(state) {
      const rendered = JSON.stringify(state, null, 2);

      if (mountRoot) {
        let panel = mountRoot.querySelector("[data-ui='state-panel']");
        if (!panel) {
          panel = document.createElement("pre");
          panel.setAttribute("data-ui", "state-panel");
          panel.className = "state-panel";
          mountRoot.appendChild(panel);
        }

        panel.textContent = rendered;
      }

      return rendered;
    }
  };
}
