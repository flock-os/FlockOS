# NewCovenant Bridge Release Gate Checklist

This checklist controls first bridge adoption and prevents accidental deployment crossover.

## Scope Guardrails

- [x] Confirm all implementation changes are under NewCovenant paths only.
- [x] Confirm no edits under Covenant/Nations paths.
- [x] Confirm no build/deploy scripts were run for church deployments.

## Contract Integrity

- [x] Verify module contracts remain valid at runtime.
- [x] Verify bridge contract validation passes.
- [x] Verify adapter compatibility checks are green or accepted with notes.

## Experience Quality

- [x] Public mode visual checks completed on desktop.
- [x] Public mode visual checks completed on mobile.
- [x] Admin mode operational checks completed (status, smoke, rehearsal).

## Rehearsal and Diagnostics

- [x] Smoke checks executed and all critical checks pass.
- [x] Integration rehearsal executed and readiness summary captured.
- [x] Known compatibility gaps documented with owner and target phase.

## Approval Gate

- [x] Operator approval recorded (Y/Yes) for next phase.
- [x] Phase summary logged in architecture plan.
- [x] Commit prepared with clear phase tag in message.
