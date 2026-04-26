function normalizePath(path) {
  const clean = String(path || "").trim();
  const leading = clean.startsWith("/") ? clean : `/${clean}`;
  return leading === "/" ? leading : leading.replace(/\/+$/, "");
}

function compilePattern(path) {
  const normalized = normalizePath(path);
  const segments = normalized.split("/").filter(Boolean);

  return {
    normalized,
    segments,
    dynamicCount: segments.filter((segment) => segment.startsWith(":"))
      .length
  };
}

function matchRoute(pattern, inputPath) {
  if (pattern.normalized === inputPath) {
    return { matched: true, params: {} };
  }

  const inputSegments = inputPath.split("/").filter(Boolean);
  if (pattern.segments.length !== inputSegments.length) {
    return { matched: false, params: null };
  }

  const params = {};
  for (let i = 0; i < pattern.segments.length; i += 1) {
    const expected = pattern.segments[i];
    const actual = inputSegments[i];

    if (expected.startsWith(":")) {
      params[expected.slice(1)] = decodeURIComponent(actual);
      continue;
    }

    if (expected !== actual) {
      return { matched: false, params: null };
    }
  }

  return { matched: true, params };
}

export function createResolverModule() {
  const routes = [];

  return {
    registerRoute(path, handler) {
      const compiled = compilePattern(path);
      const index = routes.findIndex((entry) => entry.pattern.normalized === compiled.normalized);
      const record = { pattern: compiled, handler };

      if (index >= 0) {
        routes[index] = record;
      } else {
        routes.push(record);
      }

      routes.sort((a, b) => a.pattern.dynamicCount - b.pattern.dynamicCount);
    },

    resolveRoute(path, context = {}) {
      const inputPath = normalizePath(path);

      for (let i = 0; i < routes.length; i += 1) {
        const entry = routes[i];
        const match = matchRoute(entry.pattern, inputPath);
        if (!match.matched) {
          continue;
        }

        return {
          found: true,
          value: entry.handler({ ...context, params: match.params, path: inputPath })
        };
      }

      return { found: false, value: null };
    }
  };
}
