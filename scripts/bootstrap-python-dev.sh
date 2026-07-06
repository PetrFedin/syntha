#!/usr/bin/env bash
# Poetry venv in .venv: core + optional --ml / --analytics (P0/P1 R&D deps).
#   bash scripts/bootstrap-python-dev.sh
#   bash scripts/bootstrap-python-dev.sh --ml --analytics
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

WITH_ML=0
WITH_ANALYTICS=0
for arg in "$@"; do
  case "$arg" in
    --ml) WITH_ML=1 ;;
    --analytics) WITH_ANALYTICS=1 ;;
    --no-ml) WITH_ML=0 ;;
    --all) WITH_ML=1; WITH_ANALYTICS=1 ;;
  esac
done

ensure_poetry() {
  export PATH="${HOME}/.local/bin:${PATH}"
  if command -v poetry >/dev/null 2>&1; then
    return 0
  fi
  echo "→ Poetry не найден — установка (install.python-poetry.org)..."
  curl -sSL https://install.python-poetry.org | python3 -
  export PATH="${HOME}/.local/bin:${PATH}"
  command -v poetry >/dev/null 2>&1 || {
    echo "Poetry не в PATH. Добавьте: export PATH=\"\$HOME/.local/bin:\$PATH\"" >&2
    exit 1
  }
}

ensure_poetry
PY312="$(brew --prefix python@3.12 2>/dev/null)/bin/python3.12"
if [[ -x "$PY312" ]]; then
  echo "→ poetry env use Python 3.12 ($PY312)"
  poetry env use "$PY312" 2>/dev/null || true
elif [[ -x /opt/homebrew/opt/python@3.12/bin/python3.12 ]]; then
  poetry env use /opt/homebrew/opt/python@3.12/bin/python3.12 2>/dev/null || true
else
  echo "WARN: python@3.12 не найден — brew install python@3.12 (3.14 ломает asyncpg/Pillow)" >&2
fi

poetry config virtualenvs.in-project true --local 2>/dev/null || true

echo "→ poetry install (core deps → .venv)"
poetry install --no-interaction --no-ansi

EXTRA=()
[[ "$WITH_ML" -eq 1 ]] && EXTRA+=(--with ml)
[[ "$WITH_ANALYTICS" -eq 1 ]] && EXTRA+=(--with analytics)

if [[ ${#EXTRA[@]} -gt 0 ]]; then
  echo "→ poetry install ${EXTRA[*]}"
  poetry install --no-interaction --no-ansi "${EXTRA[@]}"
fi

echo "→ verify imports"
poetry run python -c "import fastapi, sqlalchemy, redis; print('core OK:', fastapi.__version__)"

if [[ "$WITH_ML" -eq 1 ]]; then
  poetry run python -c "import torch, faiss; print('ml OK: torch', torch.__version__)" || {
    echo "WARN: ML group — poetry install --with ml" >&2
  }
fi

if [[ "$WITH_ANALYTICS" -eq 1 ]]; then
  poetry run python -c "import duckdb, polars, ortools; print('analytics OK: duckdb', duckdb.__version__)" || {
    echo "WARN: analytics — poetry install --with analytics" >&2
  }
fi

echo ""
echo "Backend venv: ${ROOT}/.venv"
echo "  poetry run uvicorn app.main:app --reload --port 8000"
echo "  poetry run pytest -q"
