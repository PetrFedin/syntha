#!/usr/bin/env bash
# P0: Poetry+ML+analytics, DuckDB CLI, core PG, Ollama models.
#   bash scripts/bootstrap-p0-runtime.sh [--skip-ollama]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
SKIP_OLLAMA=0
[[ "${1:-}" == "--skip-ollama" ]] && SKIP_OLLAMA=1

bash "${ROOT}/scripts/bootstrap-python-dev.sh" --ml --analytics

command -v duckdb >/dev/null 2>&1 || { command -v brew >/dev/null && brew install duckdb || true; }

if docker info >/dev/null 2>&1; then
  npm run core:bootstrap
else
  echo "WARN: Docker off — npm run core:bootstrap после OrbStack" >&2
fi

if [[ "$SKIP_OLLAMA" -eq 0 ]] && command -v ollama >/dev/null 2>&1; then
  for m in qwen3 llama3.3 deepseek-r1; do
    ollama list 2>/dev/null | awk '{print $1}' | grep -q "^${m}" || ollama pull "$m" || true
  done
fi

bash "${ROOT}/scripts/audit-rd-stack.sh" || true
