#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
uv run python scripts/export-agents-intel.py
echo "Tip: full codebase intel → /gsd-intel refresh (.planning/intel/)"
