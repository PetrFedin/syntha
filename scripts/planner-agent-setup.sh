#!/usr/bin/env bash
# Planner agent prerequisites: dev:core + runner install + CURSOR_API_KEY hint.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE="${PLANNER_API_BASE:-http://127.0.0.1:3001}"

# shellcheck source=core-lib.sh
source "${ROOT}/scripts/core-lib.sh"

echo "=== planner:agent:setup ==="

if core_lib_core_dev_ready; then
  echo "OK  dev:core → ${BASE}/platform"
elif core_lib_http_ok "${BASE}/api/dev/syntha-status" '"ok":true'; then
  echo "WARN dev:core partial (syntha-status ok, coreMode health missing)"
  echo "     npm run core:restart"
else
  echo "FAIL dev:core not reachable at ${BASE}" >&2
  echo "     npm run core:restart   # or: npm run stop:stale-dev && npm run dev:core" >&2
  exit 1
fi

echo "→ npm install planner-cursor-agent runner…"
npm install --no-audit --no-fund --prefix "${ROOT}/scripts/planner-cursor-agent"

ENV_LOCAL="${ROOT}/_ai-share/synth-1-full/.env.local"
if [[ -f "${ENV_LOCAL}" ]] && grep -qE '^CURSOR_API_KEY=.+' "${ENV_LOCAL}" 2>/dev/null; then
  echo "OK  CURSOR_API_KEY in .env.local"
else
  echo "WARN CURSOR_API_KEY missing in _ai-share/synth-1-full/.env.local"
  echo "     cursor.com/dashboard/integrations → add CURSOR_API_KEY=…"
fi

STATUS="$(curl -fsS --max-time 4 "${BASE}/api/dev/syntha-status" 2>/dev/null || echo '{}')"
printf '%s' "${STATUS}" | python3 -c "
import json, sys
d = json.load(sys.stdin)
for k in ('plannerLive', 'cursorAgentConfigured', 'cursorAgentRunner'):
    print(f\"{'OK' if d.get(k) else 'WARN'}  {k}={d.get(k)}\")
" 2>/dev/null || true

echo ""
echo "Next: npm run planner:agent:loop"
echo "      npm run planner:next"
