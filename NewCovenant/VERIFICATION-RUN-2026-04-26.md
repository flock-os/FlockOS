# NewCovenant Pre-Release Verification Run

Date: 2026-04-26
Phase: F2.6
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

## F2.8 Live Session (In Progress)

- Local server started: `python3 -m http.server 4173`
- Preview URL opened: `http://localhost:4173/NewCovenant/index.html`
- QA status: awaiting operator visual/interaction confirmation.

### Operator Completion Steps

1. In Public Experience mode:
- Confirm desktop presentation looks inviting and polished.
- Confirm mobile presentation is readable and usable.
2. Switch to Admin Workspace mode:
- Click `Run Smoke Checks` and verify summary appears.
- Click `Run Rehearsal` and verify before/after readiness appears.
3. Return with `Y/Yes` once completed so F2.8 can be marked done.

### Operator Reported Smoke Output

- `config: set/get works`: PASS
- `resolver: dynamic route params`: PASS
- `auth: session lifecycle`: PASS
- `offline: queue and flush`: PASS
- `ui-kit: notify and render`: PASS
- Summary: `5/5 passed, 0 failed`

Status: Smoke checks are confirmed passing by operator report.

### Operator Final QA Sign-Off

- Public Experience desktop review: confirmed.
- Public Experience mobile review: confirmed.
- Admin rehearsal run: confirmed.
- Operator sign-off response: `Y`.

Status: F2.8 manual QA is complete.

## F2.9 Commit Snapshot

- Commit created: `2af8809`
- Message: `feat(newcovenant): add bridge integration rehearsal and release-gate package`
- Scope: `NewCovenant/*`
- Duplicate-file scan: clean before and after commit.

## Operator Sign-Off Record

- Continuation approval received in-session as: "y".
- Final release adoption sign-off should be recorded after manual visual checks.
