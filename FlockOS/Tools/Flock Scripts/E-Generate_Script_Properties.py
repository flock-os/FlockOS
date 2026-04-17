#!/usr/bin/env python3
"""
generate_script_properties.py
──────────────────────────────────────────────────────────────────────────────
FlockOS — Script Properties Generator

Takes key church inputs and outputs a formatted block you can paste directly
into the GAS Script Properties editor (⚙ Settings → Script Properties → Edit).

Usage:
  python generate_script_properties.py
  python generate_script_properties.py --church TBC
  python generate_script_properties.py --church TheForest

The script will prompt for any missing secrets interactively.
It prints two outputs:
  1. A human-readable summary of every property and its value
  2. A GAS-compatible "bulk paste" block for the Script Properties UI

──────────────────────────────────────────────────────────────────────────────
"""

import argparse
import json
import os
import sys
import getpass
from pathlib import Path

# ── Repo paths ──────────────────────────────────────────────────────────────
SCRIPT_DIR    = Path(__file__).resolve().parent
REPO_ROOT     = SCRIPT_DIR.parent.parent.parent   # …/FlockOS/Software
DEPLOYMENTS   = REPO_ROOT / "FlockOS" / "Tools" / "Flock Deployments"
SECRETS_DIR   = REPO_ROOT / "FlockOS" / "Tools" / "Flock Secrets"

# ── Church configs (id → json file) ─────────────────────────────────────────
CHURCH_FILES = {
    "flockos":    "flockos-default.json",
    "tbc":        "Trinity.json",
    "trinity":    "Trinity.json",
    "theforest":  "TheForest.json",
}

# ── Secrets file name pattern ────────────────────────────────────────────────
# If a file named <church_id>.secrets.json exists in Flock Secrets/, it will be
# loaded and its values merged in automatically.
# Format: { "SYNC_SECRET": "...", "MASTER_SYNC_SECRET": "...", ... }


def load_json(path: Path) -> dict:
    if path.exists():
        with open(path) as f:
            return json.load(f)
    return {}


def prompt(label: str, default: str = "", secret: bool = False) -> str:
    """Prompt the user for a value. Returns default if user just hits Enter."""
    suffix = f" [{default[:20] + '…' if len(default) > 20 else default}]" if default else ""
    prompt_str = f"  {label}{suffix}: "
    if secret:
        val = getpass.getpass(prompt_str)
    else:
        val = input(prompt_str)
    return val.strip() if val.strip() else default


def build_properties(church_id: str, config: dict, secrets: dict, interactive: bool) -> dict:
    """
    Assembles all Script Properties needed for a church deployment.
    Returns an ordered dict of key → value.
    """
    props = {}

    # ── Identity ─────────────────────────────────────────────────────────────
    props["CHURCH_NAME"]     = config.get("name", "")
    props["CHURCH_TIMEZONE"] = config.get("timezone", "America/Chicago")

    # ── Firestore ─────────────────────────────────────────────────────────────
    fc = config.get("firebaseConfig", {})
    props["FIRESTORE_PROJECT_ID"]  = fc.get("projectId", "")
    props["FIRESTORE_CHURCH_ID"]   = config.get("shortName", church_id.upper())

    # ── Sync secrets ─────────────────────────────────────────────────────────
    props["SYNC_SECRET"]         = secrets.get("SYNC_SECRET", "")
    props["MASTER_SYNC_SECRET"]  = secrets.get("MASTER_SYNC_SECRET", "")

    # ── Firebase service account ─────────────────────────────────────────────
    # Stored as a JSON blob. Try to load from Flock Secrets/ file first.
    props["FIREBASE_SERVICE_ACCOUNT"] = secrets.get("FIREBASE_SERVICE_ACCOUNT", "")

    # ── Optional Twilio ───────────────────────────────────────────────────────
    props["TWILIO_SID"]    = secrets.get("TWILIO_SID", "")
    props["TWILIO_TOKEN"]  = secrets.get("TWILIO_TOKEN", "")
    props["TWILIO_NUMBER"] = secrets.get("TWILIO_NUMBER", "")

    # ── Truth DB ──────────────────────────────────────────────────────────────
    props["TRUTH_SHEET_ID"] = secrets.get("TRUTH_SHEET_ID", config.get("truthSheetId", ""))

    # ── Church Drive folder ───────────────────────────────────────────────────
    props["CHURCH_FOLDER_ID"] = secrets.get("CHURCH_FOLDER_ID", config.get("churchFolderId", ""))

    # ── Setup inputs (filled in interactively — MUST be cleared after setup) ──
    props["ADMIN_EMAIL"]    = secrets.get("ADMIN_EMAIL", "")
    props["ADMIN_FIRST"]    = secrets.get("ADMIN_FIRST", "")
    props["ADMIN_LAST"]     = secrets.get("ADMIN_LAST", "")
    props["ADMIN_PASSWORD"] = secrets.get("ADMIN_PASSWORD", "")
    props["NOTIFY_EMAIL"]   = secrets.get("NOTIFY_EMAIL", config.get("adminEmail", ""))

    # ── Web App URL (set after deployment) ────────────────────────────────────
    props["CHURCH_APP_URL"] = secrets.get("CHURCH_APP_URL", config.get("databaseUrl", ""))

    # ── Interactive fill-in for missing required values ───────────────────────
    if interactive:
        print()
        print("  ── Fill in any missing values (Enter = keep current) ──")

        required = [
            ("CHURCH_NAME",             False),
            ("CHURCH_TIMEZONE",         False),
            ("FIRESTORE_PROJECT_ID",    False),
            ("FIRESTORE_CHURCH_ID",     False),
            ("SYNC_SECRET",             True),
            ("MASTER_SYNC_SECRET",      True),
            ("FIREBASE_SERVICE_ACCOUNT",True),
            ("ADMIN_EMAIL",             False),
            ("ADMIN_FIRST",             False),
            ("ADMIN_LAST",              False),
            ("ADMIN_PASSWORD",          True),
            ("NOTIFY_EMAIL",            False),
            ("CHURCH_APP_URL",          False),
        ]

        for key, is_secret in required:
            current = props.get(key, "")
            if not current:
                val = prompt(key, default=current, secret=is_secret)
                if val:
                    props[key] = val

    return props


def render_summary(props: dict, church_name: str) -> str:
    lines = [
        "",
        "╔══════════════════════════════════════════════════════════════╗",
        f"║  FlockOS Script Properties — {church_name:<30}║",
        "╠══════════════════════════════════════════════════════════════╣",
    ]

    groups = {
        "Identity":    ["CHURCH_NAME", "CHURCH_TIMEZONE", "CHURCH_APP_URL"],
        "Firestore":   ["FIRESTORE_PROJECT_ID", "FIRESTORE_CHURCH_ID"],
        "Secrets":     ["SYNC_SECRET", "MASTER_SYNC_SECRET", "FIREBASE_SERVICE_ACCOUNT",
                        "TWILIO_SID", "TWILIO_TOKEN", "TWILIO_NUMBER"],
        "Setup":       ["ADMIN_EMAIL", "ADMIN_FIRST", "ADMIN_LAST", "ADMIN_PASSWORD", "NOTIFY_EMAIL"],
        "Optional":    ["TRUTH_SHEET_ID", "CHURCH_FOLDER_ID"],
    }

    rendered_keys = set()
    for group, keys in groups.items():
        lines.append(f"║  ── {group} {'─' * (54 - len(group))}║")
        for k in keys:
            v = props.get(k, "")
            if not v:
                display = "(not set)"
            elif k in ("ADMIN_PASSWORD", "SYNC_SECRET", "MASTER_SYNC_SECRET"):
                display = "•" * min(len(v), 12) + "  ✓" if v else "(not set)"
            elif k == "FIREBASE_SERVICE_ACCOUNT":
                display = "(JSON — " + str(len(v)) + " chars)" if v else "(not set)"
            else:
                display = v if len(v) <= 45 else v[:42] + "…"
            line = f"║    {k:<32}  {display}"
            lines.append(line[:66].ljust(66) + "║")
            rendered_keys.add(k)
        lines.append("║" + " " * 64 + "║")

    lines.append("╚══════════════════════════════════════════════════════════════╝")
    return "\n".join(lines)


def render_gas_paste(props: dict) -> str:
    """
    Renders the Script Properties as a GAS Apps Script snippet you can run
    once in the editor to set all properties in bulk.
    """
    lines = [
        "",
        "// ── Paste this into a GAS script file, run it ONCE, then delete it ──",
        "function setAllScriptProperties_() {",
        "  var props = PropertiesService.getScriptProperties();",
        "  props.setProperties({",
    ]

    for k, v in props.items():
        if not v:
            continue
        # Escape backslashes and quotes for safe embedding
        escaped = v.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
        lines.append(f'    "{k}": "{escaped}",')

    lines += [
        "  });",
        '  Logger.log("✅ Script Properties set — " + Object.keys(arguments[0] || {}).length + " keys.");',
        "  Logger.log('⚠️  Delete this function after running.');",
        "}",
        "",
        "// After running, call:  setAllScriptProperties_()",
        "// Then: DELETE this function from your Code.gs",
    ]
    return "\n".join(lines)


def render_json_export(props: dict) -> str:
    """Renders a JSON export for archival in Flock Secrets/."""
    clean = {k: v for k, v in props.items() if v}
    return json.dumps(clean, indent=2)


def main():
    parser = argparse.ArgumentParser(
        description="Generate GAS Script Properties for a FlockOS church deployment."
    )
    parser.add_argument(
        "--church", "-c",
        default="",
        help="Church ID: flockos | tbc | theforest (prompts if omitted)"
    )
    parser.add_argument(
        "--no-interactive", "-n",
        action="store_true",
        help="Skip interactive prompts (use only config + secrets files)"
    )
    parser.add_argument(
        "--output", "-o",
        choices=["all", "summary", "gas", "json"],
        default="all",
        help="What to print: all (default), summary, gas, json"
    )
    args = parser.parse_args()

    # ── Select church ─────────────────────────────────────────────────────────
    church_id = args.church.lower().strip()
    if not church_id:
        print("\nAvailable churches:")
        for k in sorted(set(CHURCH_FILES.values())):
            print(f"  {k}")
        church_id = input("\nEnter church ID (flockos / tbc / theforest): ").strip().lower()

    config_file = CHURCH_FILES.get(church_id)
    if not config_file:
        print(f"ERROR: Unknown church '{church_id}'. Options: {', '.join(CHURCH_FILES.keys())}")
        sys.exit(1)

    config_path = DEPLOYMENTS / config_file
    config = load_json(config_path)
    if not config:
        print(f"ERROR: Could not load config from {config_path}")
        sys.exit(1)

    # ── Load secrets file if present ─────────────────────────────────────────
    secrets_path = SECRETS_DIR / f"{church_id}.secrets.json"
    secrets = load_json(secrets_path)
    if secrets:
        print(f"\n  ✓ Loaded secrets from {secrets_path.name}")
    else:
        print(f"\n  ℹ  No secrets file found at {secrets_path}")
        print(    "     You can create one to pre-fill sensitive values.")

    # ── Build properties ──────────────────────────────────────────────────────
    interactive = not args.no_interactive
    print(f"\n  Church   : {config.get('name', church_id)}")
    print(f"  Config   : {config_path.name}")

    props = build_properties(church_id, config, secrets, interactive)

    church_name = props.get("CHURCH_NAME", config.get("name", church_id))

    # ── Output ────────────────────────────────────────────────────────────────
    output = args.output

    if output in ("all", "summary"):
        print(render_summary(props, church_name))

    if output in ("all", "gas"):
        print("\n" + "═" * 66)
        print("  GAS PASTE BLOCK — copy everything between the dashed lines")
        print("─" * 66)
        print(render_gas_paste(props))
        print("─" * 66)

    if output in ("all", "json"):
        print("\n  JSON export (save to Flock Secrets/ for future use):")
        print(render_json_export(props))

    # ── Reminder ──────────────────────────────────────────────────────────────
    print("\n")
    print("  ⚠️  IMPORTANT REMINDERS:")
    print("  1. After running setAllScriptProperties_(), DELETE it from Code.gs")
    print("  2. After setupFlockOS() completes, DELETE ADMIN_PASSWORD from Script Properties")
    print("  3. The FLOCK_AUTH_PEPPER is auto-generated — do NOT set it manually")
    print("  4. SYNC_SECRET and MASTER_SYNC_SECRET must match Firestore churches/{id}")
    print()


if __name__ == "__main__":
    main()
