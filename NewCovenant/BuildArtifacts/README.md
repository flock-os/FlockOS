# BuildArtifacts

This folder stores controlled-build dry-run outputs for standalone NewCovenant packaging.

## Output Files

- `newcovenant-standalone-<timestamp>.tar.gz`: packaged snapshot of `NewCovenant/`
- `controlled-build-report-<timestamp>.txt`: guardrail + packaging report

## Notes

- This is a standalone packaging step only.
- It does not run church build/deploy scripts.
- It does not modify `Covenant/Nations/*`.
