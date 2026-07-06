#!/usr/bin/env bash
# P0/P1/P2 audit: backend, Ollama, PG :5433, CLI, optional R&D.
#   bash scripts/audit-rd-stack.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
P0_FAIL=0
ok() { echo "  OK   $*"; }
miss() { echo "  MISS $*"; P0_FAIL=1; }
warn() { echo "  WARN $*"; }

section() { echo ""; echo "== $* =="; }

section "P0 · Backend Python"
export PATH="${HOME}/.local/bin:${PATH}"
if command -v poetry >/dev/null 2>&1; then ok "poetry"; else miss "poetry"; fi
if [[ -x "${ROOT}/.venv/bin/python" ]]; then
  "${ROOT}/.venv/bin/python" -c "import fastapi" 2>/dev/null && ok "fastapi" || miss "fastapi in .venv"
  "${ROOT}/.venv/bin/python" -c "import torch, faiss" 2>/dev/null && ok "torch+faiss" || warn "poetry install --with ml"
else
  miss ".venv"
fi

section "P0 · Ollama"
CANON=(qwen3 llama3.3 deepseek-r1)
if curl -sf http://localhost:11434/api/tags >/dev/null 2>&1; then
  TAGS=$(curl -s http://localhost:11434/api/tags | python3 -c "import sys,json; print(' '.join(m['name'] for m in json.load(sys.stdin).get('models',[])))" 2>/dev/null || true)
  for m in "${CANON[@]}"; do
    echo "$TAGS" | tr ' ' '\n' | grep -q "^${m}" && ok "ollama $m" || warn "ollama pull $m"
  done
else
  miss "Ollama :11434"
fi

section "P0 · PG :5433"
if docker info >/dev/null 2>&1 && (nc -z localhost 5433 2>/dev/null || true); then
  nc -z localhost 5433 2>/dev/null && ok "PG :5433" || miss "npm run core:bootstrap"
else
  miss "Docker/PG :5433"
fi

section "P1 · CLI + analytics"
for cmd in fd delta ast-grep ruff duckdb; do
  command -v "$cmd" >/dev/null 2>&1 && ok "$cmd" || warn "$cmd"
done
if [[ -x "${ROOT}/.venv/bin/python" ]]; then
  for pkg in duckdb polars ortools; do
    "${ROOT}/.venv/bin/python" -c "import ${pkg}" 2>/dev/null && ok "py $pkg" || warn "poetry install --with analytics"
  done
fi

section "P2 · R&D vendor"
[[ -d "${HOME}/R&D/vendor/Seamly2D" ]] && ok "Seamly2D vendor" || warn "~/R&D/vendor/Seamly2D"

echo ""
[[ "$P0_FAIL" -eq 0 ]] && echo "P0: OK" || echo "P0: gaps — bash scripts/bootstrap-p0-runtime.sh"
exit "$P0_FAIL"
