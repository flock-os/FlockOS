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
- Build scripts: `Covenant/Bezalel/Scripts/`
- Generated deployments (do not edit directly): `Covenant/Nations/`
- Internal documentation and runbooks: `Covenant/Testimony/`
- Archived/retired material: `Covenant/Storehouse/Legacy/`

## Testimony Layout

- `Covenant/Testimony/Architecture/` - core architecture and master references
- `Covenant/Testimony/Platforms/` - platform-specific doc sets (ATOG, FlockChat)
- `Covenant/Testimony/Runbooks/` - operational runbooks and deployment maps
- `Covenant/Testimony/Secrets/` - local-only secret material
- `Covenant/Testimony/Migration/` - migration notes/checklists

## Build Rules

1. Edit source only under `Covenant/Courts/...`.
2. Build via `bash "Covenant/Bezalel/Scripts/A-Build_Churches.sh"`.
3. Never hand-edit `Covenant/Nations/*` output.
4. Archive duplicates/outdated copies to `Covenant/Storehouse/Legacy/`.

## Quick Checks

- `ls Covenant`
- `ls Covenant/Courts`
- `ls Covenant/Scrolls/ChurchRegistry`
- `ls Covenant/Testimony`
