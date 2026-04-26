# FlockOS Master Brand Document

> This is the single source of truth for all branding across FlockOS and
> every powered product. The `NewCovenant/` folder is an internal codename/workspace path,
> but the distributed product identity is FlockOS. All site builds, module templates,
> and UI copy MUST reference
> this file first. If a value is not listed here, ask the confirmation questions in the
> Branding Gate section before inventing it.

---

## 1. Brand Hierarchy

| Level | Brand | Label pattern |
|-------|-------|---------------|
| Distributed foundation | **FlockOS** | FlockOS (standalone, no qualifier needed) |
| Internal codename/workspace | **NewCovenant** | Internal only (not public-facing) |
| Communication layer | **FlockChat** | FlockChat (Powered by FlockOS) |
| Discipleship layer | **ATOG** | ATOG (Powered by FlockOS) |

Rule: The distributed shell is FlockOS. `NewCovenant` is an internal code/workspace name only.

---

## 2. Canonical Product Names

Use these exact strings in UI, copy, and code. Do not invent variations.

| Token | Canonical string |
|-------|-----------------|
| `BRAND_FOUNDATION` | FlockOS |
| `BRAND_FORWARD_APP` | FlockOS |
| `BRAND_COMMS` | FlockChat |
| `BRAND_DISCIPLESHIP` | ATOG |
| `BRAND_TAGLINE` | Church Management & Ministry Platform |
| `BRAND_POWERED_BY` | Powered by FlockOS |
| `BRAND_EYEBROW` | Foundational FlockOS |

---

## 3. Colors

Extracted from `NewCovenant/src/styles.css` and `Covenant/Scrolls/ChurchRegistry/FlockOS-Root.json`.

| Token | Value | Usage |
|-------|-------|-------|
| `--sand` | `#f8f3ea` | Page background warm tone |
| `--ink` | `#1c2330` | Body text |
| `--copper` | `#b56429` | Eyebrow text, accents, kickers |
| `--sea` | `#1a7a70` | Teal accent |
| `--line` | `#d7c9b6` | Borders and dividers |
| `--admin-bg` | `#eef3f7` | Admin workspace background |
| `themeColor` | `#e8a838` | PWA theme color (manifest, meta tag) |
| `backgroundColor` | `#1a1a2e` | PWA splash / app shell background |

Background gradient (body): `160deg, #fffaf2 0%, #f5efe4 38%, #e8f0f4 100%`

Atmosphere overlays (decorative, not interactive):
- Copper warm: `rgba(181, 100, 41, 0.18)` at 15% 8%
- Teal cool: `rgba(26, 122, 112, 0.22)` at 85% 18%
- Ink depth: `rgba(28, 35, 48, 0.13)` at 50% 100%

---

## 4. Typography

Loaded via Google Fonts in every HTML surface.

| Role | Font | Weights |
|------|------|---------|
| Display / headings | **Fraunces** (serif, optical size 9–144) | 500, 700 |
| Body / UI | **Manrope** (sans-serif) | 400, 500, 700, 800 |

---

## 5. Tone and Voice

- Warm, pastoral, and human-first for public-facing surfaces.
- Practical, direct, and action-oriented for admin/operational surfaces.
- Never corporate or transactional. The product is built for the church, not enterprise.
- Use second-person ("your flock", "your team") not third-person distancing.

---

## 6. Approved Copy Snippets

| Context | Approved copy |
|---------|--------------|
| Page eyebrow | Foundational FlockOS |
| Public hero subtext | Powered by FlockOS |
| Stream kicker | Three Streams, One River |
| FlockOS description | The operational backbone for missions, teams, and stewardship |
| FlockChat description | Living connection between gatherings |
| ATOG description | Anchor the day in Scripture and prayer |
| Footer / PWA about | Church Management & Ministry Platform |

---

## 7. Deployment Surfaces

Every build must maintain branding parity across all of the following:

| Surface | Deployment target |
|---------|------------------|
| FlockOS Root | `Nations/Root/` |
| Nations / FlockOS | `Nations/FlockOS/` |
| Nations / GAS | `Nations/GAS/` |
| Nations / TBC | `Nations/TBC/` |
| Nations / TheForest | `Nations/TheForest/` |
| FlockChat PWA | Firebase Hosting — `flockos-comms` project |
| Foundational FlockOS shell (`NewCovenant/`) | Firebase Hosting (TBD) — same infrastructure |

The build script reads `brandName` from each `Covenant/Scrolls/ChurchRegistry/<church>.json`.
That field must always be present and must follow the canonical name table in section 2.

---

## 8. Favicon and Icons

| Token | Current value |
|-------|--------------|
| Favicon (default) | `FlockOS_Pink.png` |
| Portrait icon | `FlockOS_Pink.png` |
| Icon set source | `$ICONSET/` at repo root |

Update both `favicon` and `portrait` fields in the church registry JSON when changing icons.

---

## 9. Branding Gate — Ask Before Publishing

When a branding decision is ambiguous, ask these questions before implementing:

1. What is the exact user-facing product name in this context?
2. Should this surface show the full "Powered by FlockOS" label or a compact form?
3. Is this public-facing copy, admin-facing copy, or internal developer copy?
4. Which deployment surface is this for? (see section 7)
5. Is this a temporary campaign string or permanent canonical product wording?
6. Should FlockOS appear in the heading, footer, or both?
7. Does this surface use church-specific `brandName` substitution via the build script?

---

## 10. Change Control

- **Update this file first** when any brand value changes.
- Then update `NewCovenant/src/styles.css` (colors/fonts) or `NewCovenant/src/weave/siteWeaveContent.js` (copy) to match.
- Then run BCP (`bash "Covenant/Bezalel/Scripts/A-Build_Churches.sh"`) to propagate to Nations deployments.
- If a request conflicts with values in this file, use the gate questions above before proceeding.
