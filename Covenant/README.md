# Covenant Structure

This is the canonical project structure for FlockOS.

## Top-Level Domains

- Foundations
- Courts
- Scrolls
- Gate
- Bezalel
- Nations
- Shepherds
- Testimony
- Storehouse

## Source-of-Truth Map

- Canonical app source (FlockOS): `Covenant/Courts/TheTabernacle/`
- Canonical app source (FlockChat): `Covenant/Courts/TheFellowship/`
- Canonical app source (ATOG): `Covenant/Courts/TheUpperRoom/`
- Church registry configs: `Covenant/Scrolls/ChurchRegistry/`
- Build scripts: `Running to Jesus/Bezalel/Scripts/`
- Generated deployments (do not edit directly): `Covenant/Nations/`
- Internal documentation and runbooks: `Architechtural Docs/Old Covenant/`
- Archived/retired material: `Covenant/Storehouse/Legacy/`

## Architecture Layout

- `Architechtural Docs/New Covenant/Architecture/` - canonical architecture and master references
- `Architechtural Docs/Old Covenant/Architecture/` - mirrored continuity architecture docs
- `Architechtural Docs/Old Covenant/Platforms/` - platform-specific doc sets (ATOG, FlockChat)
- `Architechtural Docs/Old Covenant/Runbooks/` - operational runbooks and deployment maps
- `Architechtural Docs/Old Covenant/Secrets/` - local-only secret material
- `Architechtural Docs/Old Covenant/Migration/` - migration notes/checklists

## Build Rules

1. Edit source only under `Covenant/Courts/...`.
2. Build via `bash "Running to Jesus/Bezalel/Scripts/A-Build_Churches.sh"`.
3. Never hand-edit `Covenant/Nations/*` output.
4. Archive duplicates/outdated copies to `Covenant/Storehouse/Legacy/`.

## Quick Checks

- `ls Covenant`
- `ls Covenant/Courts`
- `ls Covenant/Scrolls/ChurchRegistry`
- `ls "Architechtural Docs/New Covenant"`
