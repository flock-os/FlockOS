/**
 * NewCovenant Brand Config
 *
 * Machine-readable mirror of NewCovenant/brand.md.
 * This file is the single JS source of truth for all brand values used in
 * the renderer, project map, export payloads, and admin surfaces.
 *
 * CHANGE CONTROL: Update brand.md first, then update this file to match.
 * Do not invent values here that are not defined in brand.md.
 */

export const BRAND = {
  // ── Foundation ─────────────────────────────────────────────────────
  foundation: "FlockOS",
  tagline: "Church Management & Ministry Platform",
  poweredBy: "Powered by FlockOS",
  eyebrow: "Foundational FlockOS",

  // ── Product labels ─────────────────────────────────────────────────
  products: {
    newcovenant: {
      // NOTE: Keep the object key `newcovenant` for code compatibility.
      // Distributed/public product identity is FlockOS.
      name: "FlockOS",
      label: "FlockOS",
      description: "Final presentation shell around the church data build"
    },
    flockchat: {
      name: "FlockChat",
      label: "FlockChat (Powered by FlockOS)",
      description: "Living connection between gatherings"
    },
    atog: {
      name: "ATOG",
      label: "ATOG (Powered by FlockOS)",
      description: "Anchor the day in Scripture and prayer"
    }
  },

  // ── Colors ─────────────────────────────────────────────────────────
  // These mirror the CSS variables in src/styles.css and the
  // themeColor/backgroundColor fields in ChurchRegistry/FlockOS-Root.json.
  colors: {
    sand: "#f8f3ea",
    ink: "#1c2330",
    copper: "#b56429",
    sea: "#1a7a70",
    line: "#d7c9b6",
    adminBg: "#eef3f7",
    themeColor: "#e8a838",
    backgroundColor: "#1a1a2e"
  },

  // ── Typography ─────────────────────────────────────────────────────
  fonts: {
    display: "Fraunces",
    body: "Manrope"
  },

  // ── Deployment surfaces ────────────────────────────────────────────
  // Matches section 7 of brand.md.
  deploymentSurfaces: [
    { id: "root",        label: "FlockOS Root",          path: "Nations/Root/" },
    { id: "flockos",     label: "Nations / FlockOS",     path: "Nations/FlockOS/" },
    { id: "gas",         label: "Nations / GAS",         path: "Nations/GAS/" },
    { id: "tbc",         label: "Nations / TBC",         path: "Nations/TBC/" },
    { id: "theforest",   label: "Nations / TheForest",   path: "Nations/TheForest/" },
    { id: "flockchat",   label: "FlockChat PWA",         path: "Firebase: flockos-comms" },
    { id: "newcovenant", label: "Foundational FlockOS",  path: "Firebase: TBD" }
  ]
};
