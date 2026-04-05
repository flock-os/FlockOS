# ══════════════════════════════════════════════════════════════════════════
# FlockOS .gitignore — Master Reference (v1.3)
# Copy this to the repo root as .gitignore
# ══════════════════════════════════════════════════════════════════════════

# ── OS / Editor artifacts ─────────────────────────────────────────────────
.DS_Store
Thumbs.db
*.swp
*.swo
*~
.vscode/
.idea/

# ── Backup / temp files ──────────────────────────────────────────────────
*.bak
*.tmp
*.log

# ── Development-only files (not deployed) ─────────────────────────────────
# Tools/, docs, scripts, and backend source stay local.
# The .gitignore blocks: *.md, *.gs, *.txt, *.sh, *.py by extension.
# Exception: README.md and LICENSE are force-added.
*.md
*.md.bak
*.gs
*.txt
*.sh
*.py

# ── Node / build artifacts (future-proofing) ─────────────────────────────
node_modules/
.env
.env.*

# ── Python build tools ───────────────────────────────────────────────────
.venv/
__pycache__/
*.pyc