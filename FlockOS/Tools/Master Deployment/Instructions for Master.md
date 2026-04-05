# FlockOS — Multi-Church Deployment: AS-BUILT Reference

> **Status:** ✅ IMPLEMENTED — v1.3 (March 31, 2026)

The multi-church build system is fully operational. The source code remains a single codebase in `FlockOS/`. A build script reads JSON configs and produces branded deployments under `Church/<shortName>/`.

---

## Architecture

```
FlockOS/Tools/Active Deployments/     ← Church config JSON files
FlockOS/Tools/Development Scripts/    ← build_churches.sh
FlockOS/                              ← Source (single codebase)
Church/                               ← Output (one folder per church, generated)
```

**Flow:** Config JSON → `build_churches.sh` → `Church/<shortName>/` → push → live on GitHub Pages

---

## Config Schema

Each church has a JSON file in `FlockOS/Tools/Active Deployments/`. A blank template is provided as `ChurchTemplate.json`.

```json
{
  "id": "flockos-example",
  "name": "Example Church",
  "shortName": "Example",
  "brandName": "Example Church | FlockOS",
  "tagline": "Church Management & Ministry Platform",
  "logo": "FlockOS_Blue.png",
  "themeColor": "#e8a838",
  "backgroundColor": "#1a1a2e",
  "databaseUrl": "https://script.google.com/macros/s/.../exec",
  "adminEmail": "admin@example.org",
  "analyticsId": "",
  "version": "1.3"
}
```

| Field | Purpose |
|-------|---------|
| `id` | Unique deployment identifier (URL-safe, lowercase, hyphens) |
| `name` | Full church name → `<title>`, `og:title`, offline page, wall header/footer, lockdown messages, alt text |
| `shortName` | Output folder name + PWA `short_name` |
| `brandName` | Top navigation bar text (topbar-brand div, both public and admin) |
| `tagline` | `og:description` and PWA description |
| `logo` | Logo filename in `FlockOS/Images/`. Empty = keep default (`FlockOS_Midnight.png`) |
| `themeColor` | PWA theme color / meta tag |
| `backgroundColor` | PWA background color / splash gradient |
| `databaseUrl` | Google Apps Script Web App URL (per-church API endpoint) |
| `adminEmail` | Notification recipient |
| `analyticsId` | Google Analytics Measurement ID (optional) |
| `version` | Version string shown in wall footer |

---

## Active Deployments

| Config | Church | Output | URL |
|--------|--------|--------|-----|
| `flockos-default.json` | FlockOS | `Church/FlockOS/` | `https://flock-os.github.io/FlockOS/Church/FlockOS/` |
| `flockos-tbc.json` | Trinity Baptist Church | `Church/TBC/` | `https://flock-os.github.io/FlockOS/Church/TBC/` |
| `flockos-test.json` | Test FlockOS | `Church/Test/` | `https://flock-os.github.io/FlockOS/Church/Test/` |

---

## Build Process (`build_churches.sh`)

**Run:** `bash FlockOS/Tools/Development\ Scripts/build_churches.sh`

**What it does for each config:**

1. **Skips** `ChurchTemplate.json`
2. **Copies** `FlockOS/` source tree (excluding Tools/, .md, .gs, .bak, .txt) → `Church/<shortName>/FlockOS/`
3. **Copies** root `index.html`, `manifest.json`, `the_living_water.js` → `Church/<shortName>/`
4. **manifest.json** — uses `jq` to replace name, short_name, description, colors, and icon filenames
5. **Database URL** — sed replaces the default URL with the church's URL in all HTML/JS
6. **Tagline, colors** — sed replaces default tagline, theme color, background color
7. **Logo** — sed replaces `FlockOS_Midnight.png` with church logo (only when `logo` field is non-empty)
8. **Titles** — sed replaces `<title>` and `og:title` in ALL HTML files (not just index.html)
9. **Brand name** — sed replaces topbar-brand text with `brandName`
10. **Offline page** — sed replaces "FlockOS" in offline title and body text with church name
11. **Lockdown pages** — sed replaces "FlockOS" in lockdown messages
12. **Wall page** — sed replaces header `<h1>`, maintenance banner, and footer version

---

## Adding a New Church

1. Copy `ChurchTemplate.json` → `flockos-newchurch.json` in `Active Deployments/`
2. Fill in all fields
3. (Optional) Add a logo to `FlockOS/Images/`
4. Run `build_churches.sh`
5. `git add -A && git commit -m "Add [Church Name]" && git push`

---

## Important Notes

- **Never edit files in `Church/` directly.** They are regenerated on every build.
- The build script **wipes and recreates** `Church/` on every run (`rm -rf`).
- The default config (`flockos-default.json`) defines the "source truth" values that sed matches against. If the default config changes, the source files should match.
- Logo replacement is **skipped** when the logo field is empty — the source default `FlockOS_Midnight.png` is preserved.
- `brandName` uses `#` as the sed delimiter (not `|`) to allow pipe characters in brand strings like "Power to the People | FlockOS".
- The `adminEmail` field exists in configs but is **not currently injected** by the build script — it's reserved for future use.
- This approach scales cleanly to ~15 churches. Beyond that, evaluate a Cloudflare Worker or Netlify Edge Function approach.
