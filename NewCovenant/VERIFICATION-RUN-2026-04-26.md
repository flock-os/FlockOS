# NewCovenant Pre-Release Verification Run

Date: 2026-04-26
Phase: F4.6
Scope: Standalone NewCovenant only

## Automated Verification Results

1. Artifact inventory captured for NewCovenant workspace.
2. JavaScript syntax checks passed for all files under NewCovenant/src.
3. Editor diagnostics found no errors under NewCovenant.
4. Git scope guardrail check passed:
   - Working tree currently shows only NewCovenant as changed/untracked.
   - No Covenant/Nations path changes detected.

## Compatibility and Bridge Notes

1. Bridge runtime contract validation is implemented in harness startup.
2. Port-map compatibility probes are implemented and rendered in admin status.
3. Integration rehearsal runner is available and can be executed from Admin Workspace.

## Manual Verification Items

1. Public mode visual review on desktop and mobile.
2. Admin run-through for:
   - Smoke checks button execution.
   - Integration rehearsal button execution.
3. Capture any missing shared surfaces and assign owner/phase.

---

## Session History

### F2.8 Live Session (Complete)

- Local server started: `python3 -m http.server 4173`
- Preview URL opened: `http://localhost:4173/NewCovenant/index.html`
- Operator QA sign-off confirmed.
- Smoke: 5/5 passed.

### F2.9 Commit Snapshot

- Commit: `2af8809`
- Message: `feat(newcovenant): add bridge integration rehearsal and release-gate package`

---

## F4.6 Session Summary (2026-04-26)

### Changes This Session

| File | Change |
|---|---|
| `src/brand.js` | **NEW** — machine-readable mirror of `brand.md`. Exports `BRAND` with names, colors, fonts, deployment surfaces. |
| `src/weave/weaveManifest.js` | Expanded from 6 stubs to 31 real FlockOS/ATOG/FlockChat modules, v0.1.0 → v0.2.0. Modules now have `zone` field. `summarizeWeaveManifest` returns zone breakdown. |
| `src/main.js` | Imports `BRAND`; `PLATFORM_PARITY_TARGETS` derived from `BRAND.deploymentSurfaces`; `app.name`/`app.label` set from `BRAND`; project map groups by zone; weave roadmap shows zone tree; header eyebrow/h1 set from `BRAND` at boot. |
| `src/styles.css` | Added `.project-track-zone` — small-caps zone label style inside track cards. |
| `index.html` | `<title>` updated; `id="app-eyebrow"` and `id="app-brand-label"` added to header elements. |
| `brand.md` | **NEW** — master branding governance document (10 sections). |
| `README.md` | Branding source-of-truth section updated to reference `brand.md` and build pipeline. |
| `Covenant/Bezalel/Scripts/A-Build_Churches.sh` | Header comment updated to cite `brand.md` as branding source and explain `brandName` injection. |
| `src/bridge/integrationRehearsal.js` | Mock user role updated to canonical `"leader"`. |
| `src/weave/flockosShellSurfaceData.js` | `escalationOwner` fields updated to canonical FlockOS role strings. |

### Brand Coverage Status

| Brand value | Source | Status |
|---|---|---|
| `app.name` config | `BRAND.products.newcovenant.name` | ✓ wired |
| `app.label` config | `BRAND.products.newcovenant.label` | ✓ wired |
| Export payload `app` field | `BRAND.products.newcovenant.label` | ✓ wired |
| `PLATFORM_PARITY_TARGETS` | `BRAND.deploymentSurfaces` | ✓ wired |
| Header eyebrow | `BRAND.eyebrow` at boot | ✓ wired |
| Header h1 | `BRAND.products.newcovenant.label` at boot | ✓ wired |
| CSS color tokens | `src/styles.css` matches `brand.js` | ✓ aligned |
| `<title>` | Static — matches brand | ✓ match |

### Automated Checks (F4.6 session)

- `node --check src/main.js`: PASS
- `node --check src/brand.js`: PASS
- `node --check src/weave/weaveManifest.js`: PASS
- Editor diagnostics (all three files): No errors

### Pre-BCP Checklist

- [ ] Final `node --check` on all src/*.js files
- [ ] `git diff --stat NewCovenant/` reviewed
- [ ] Duplicate file scan: `find . -name "* *.js" -o -name "* *.html"` clean
- [ ] BCP: `bash "Covenant/Bezalel/Scripts/A-Build_Churches.sh" --deploy-comms`
- [ ] Commit: `git commit -m "feat(newcovenant): F4.6 brand system, manifest expansion, project map zones"`

### Operator Sign-Off Record

- Pending — awaiting operator review of F4.6 changes before commit.

---

## F4.6 BCP Record (2026-04-26)

- Build: 4 churches built (FlockOS, GAS, TBC, TheForest) — ✓
- FlockChat deploy: `flockos-comms.web.app` — ✓ release complete
- Duplicate scan: clean — ✓
- Commit: `79ba11c` — `feat(newcovenant): F4.6 brand system, manifest expansion, zone-grouped project map`
- Push: `15f1b8b..79ba11c  main -> main` — ✓

