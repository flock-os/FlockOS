#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ARTIFACT_DIR="$ROOT_DIR/BuildArtifacts"
CHECKSUM_PATH="$ARTIFACT_DIR/checksums.sha256"

if [[ ! -f "$CHECKSUM_PATH" ]]; then
  echo "Missing checksum manifest: $CHECKSUM_PATH"
  exit 1
fi

(
  cd "$ARTIFACT_DIR"
  shasum -a 256 -c "$CHECKSUM_PATH"
)

echo "Artifact verification passed"
