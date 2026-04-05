#!/bin/bash
# Re-minify all FlockOS JS files after code changes.
# Usage: ./minify.sh (from the FlockOS root)
cd "$(dirname "$0")"
.venv/bin/python FlockOS/Exodus/minify.py
