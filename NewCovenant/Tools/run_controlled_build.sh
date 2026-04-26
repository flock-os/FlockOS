#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_DIR="$(cd "$ROOT_DIR/.." && pwd)"
ARTIFACT_DIR="$ROOT_DIR/BuildArtifacts"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
ARTIFACT_NAME="newcovenant-standalone-${TIMESTAMP}.tar.gz"
ARTIFACT_PATH="$ARTIFACT_DIR/$ARTIFACT_NAME"
REPORT_PATH="$ARTIFACT_DIR/controlled-build-report-${TIMESTAMP}.txt"
CHECKSUM_PATH="$ARTIFACT_DIR/checksums.sha256"

mkdir -p "$ARTIFACT_DIR"

{
  echo "NewCovenant Controlled Build Dry Run"
  echo "timestamp=$TIMESTAMP"
  echo "root_dir=$ROOT_DIR"
  echo "artifact=$ARTIFACT_PATH"
  echo ""
  echo "Guardrail checks"
  git -C "$REPO_DIR" status --short | grep "Covenant/Nations/" >/dev/null && {
    echo "FAIL: Nations path changes detected"
    exit 1
  } || echo "PASS: no Nations path changes detected"

  echo ""
  echo "Packaging"
} > "$REPORT_PATH"

(
  cd "$REPO_DIR"
  tar -czf "$ARTIFACT_PATH" \
    --exclude="NewCovenant/BuildArtifacts" \
    --exclude="*.DS_Store" \
    NewCovenant
)

echo "PASS: artifact created" >> "$REPORT_PATH"
echo "artifact_size=$(du -h "$ARTIFACT_PATH" | awk '{print $1}')" >> "$REPORT_PATH"

(
  cd "$ARTIFACT_DIR"
  shasum -a 256 newcovenant-standalone-*.tar.gz > "$CHECKSUM_PATH"
  shasum -a 256 -c "$CHECKSUM_PATH" >/dev/null
)

echo "PASS: checksum manifest refreshed" >> "$REPORT_PATH"
echo "checksum_manifest=$CHECKSUM_PATH" >> "$REPORT_PATH"

echo "Controlled build complete"
echo "Artifact: $ARTIFACT_PATH"
echo "Report:   $REPORT_PATH"
echo "Checksums: $CHECKSUM_PATH"
