# NewCovenant Standalone Scaffold

This directory is an isolated, standalone harness for NewCovenant work.
It is intentionally separate from Nations deployments.

## What is included

- Browser harness in `index.html`
- Entry module in `src/main.js`
- Baseline styles in `src/styles.css`
- Module contracts for `config`, `resolver`, `auth`, `offline`, and `ui-kit`
- Bridge runtime and adapters in `src/bridge/`

## Run locally

Use any static server from the repository root:

```bash
python3 -m http.server 4173
```

Then open:

- `http://localhost:4173/NewCovenant/index.html`

## Contract-first development flow

1. Update a contract in `src/modules/*/*.contract.js`
2. Build module implementation against that contract
3. Register concrete modules in `src/main.js`
4. Validate parity checklists in `Covenant/Testimony/Architecture/A-Plan for New Covenant.md`

## Bridge-first migration flow

1. Add or refine runtime ports in `src/bridge/bridge.contract.js`
2. Implement bridge behavior in `src/bridge/createBridgeRuntime.js`
3. Expose mode-specific models in:
	- `src/bridge/publicAdapter.js`
	- `src/bridge/adminAdapter.js`
4. Keep UI calls routed through adapters rather than directly calling module internals

## Controlled Build Dry Run

Run a safe standalone package step with no Nations deployment impact:

```bash
bash NewCovenant/Tools/run_controlled_build.sh
```

Outputs are written to `NewCovenant/BuildArtifacts/`:

- `newcovenant-standalone-<timestamp>.tar.gz`
- `controlled-build-report-<timestamp>.txt`
- `checksums.sha256`

Verify artifacts against checksum manifest:

```bash
bash NewCovenant/Tools/verify_build_artifacts.sh
```

## Build Summary Export

From Admin Workspace, use `Export Summary` in the Build Summary card.

- Downloads `newcovenant-build-summary-<timestamp>.json`
- Includes readiness rows, compatibility snapshot, and phase/app metadata
