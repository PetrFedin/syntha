#!/usr/bin/env bash
# Поднять субмодули и зависимости канона (GSD / Superpowers / full) после clone.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd -P)"
cd "$ROOT"

echo "==> git submodule update --init --recursive"
git submodule update --init --recursive

if [[ -d "$ROOT/_ai-share/synth-1-full" ]]; then
  echo "==> npm ci in _ai-share/synth-1-full"
  (cd "$ROOT/_ai-share/synth-1-full" && npm ci)
else
  echo "WARN: нет каталога _ai-share/synth-1-full — пропуск npm ci"
fi

echo "==> GSD paths under .cursor/ (portable links; no-op if already relative)"
bash "$ROOT/scripts/normalize-gsd-cursor-paths.sh"

echo "==> MCP (project + ~/.cursor) — scripts/cursor-mcp-sync.py"
REPO_ROOT="$ROOT" python3 "$ROOT/scripts/cursor-mcp-sync.py"

echo "Готово. GSD для Cursor (если нужно обновить): npx get-shit-done-cc@latest --local --cursor"
echo "Superpowers: submodule tools/superpowers; плагин в Cursor: /add-plugin superpowers"

echo "Опционально P0 backend/PG/Ollama: npm run bootstrap:p0 (см. AGENTS.md)"
