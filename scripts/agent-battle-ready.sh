#!/usr/bin/env bash
# All agent layers → battle readiness report (.planning/intel/agent-battle-ready.md)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
REPORT="${ROOT}/.planning/intel/agent-battle-ready.md"
FASTAPI_PID_FILE="${ROOT}/.planning/.fastapi-dev.pid"
FASTAPI_LOG="${ROOT}/.planning/fastapi-dev.log"
# shellcheck source=core-lib.sh
source "${ROOT}/scripts/core-lib.sh"

PASS=0
FAIL=0
WARN=0
LINES=()

log() { LINES+=("$1"); echo "$1"; }
ok() { PASS=$((PASS + 1)); log "OK   $1"; }
fail() { FAIL=$((FAIL + 1)); log "FAIL $1"; }
warn() { WARN=$((WARN + 1)); log "WARN $1"; }

ensure_pg() {
  if core_lib_pg_ready; then
    ok "PostgreSQL :5433"
    return 0
  fi
  warn "PostgreSQL :5433 OFF — docker compose up"
  if npm run db:core:up >/dev/null 2>&1; then
    for _ in $(seq 1 45); do
      core_lib_pg_ready && break
      sleep 1
    done
  fi
  if core_lib_pg_ready; then
    ok "PostgreSQL :5433 (started)"
  else
    warn "PostgreSQL :5433 — OrbStack OFF; scan/routing agents OK, PG strips need db:core:up"
  fi
}

ensure_core_dev() {
  if core_lib_core_dev_ready; then
    ok "Platform Core dev:core :3001"
    return 0
  fi
  if core_lib_port_listening 3001; then
    fail "Port :3001 busy but not coreMode — npm run core:restart"
    return 1
  fi
  warn "dev:core OFF — starting in background"
  nohup bash "${ROOT}/scripts/core-dev.sh" >>"${ROOT}/.planning/core-dev.log" 2>&1 &
  for _ in $(seq 1 90); do
    core_lib_core_dev_ready && break
    sleep 2
  done
  if core_lib_core_dev_ready; then
    ok "Platform Core dev:core :3001 (started)"
  else
    fail "dev:core :3001 not ready — npm run dev:core"
  fi
}

ensure_fastapi() {
  if curl -fsS --max-time 3 "http://127.0.0.1:8000/api/v1/platform/stack/agents/routing?pillar=development&role=brand" >/dev/null 2>&1; then
    ok "FastAPI :8000 (agents API)"
    return 0
  fi
  if [[ -f "${FASTAPI_PID_FILE}" ]]; then
    old_pid="$(cat "${FASTAPI_PID_FILE}" 2>/dev/null || true)"
    if [[ -n "${old_pid}" ]] && kill -0 "${old_pid}" 2>/dev/null; then
      kill "${old_pid}" 2>/dev/null || true
    fi
  fi
  mkdir -p "$(dirname "${FASTAPI_LOG}")"
  warn "FastAPI OFF — starting uvicorn :8000"
  (
    cd "${ROOT}"
    export ENVIRONMENT=development
    nohup uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 >>"${FASTAPI_LOG}" 2>&1 &
    echo $! >"${FASTAPI_PID_FILE}"
  )
  for _ in $(seq 1 45); do
    if curl -fsS --max-time 2 "http://127.0.0.1:8000/docs" >/dev/null 2>&1; then
      ok "FastAPI :8000 (started)"
      return 0
    fi
    sleep 1
  done
  fail "FastAPI :8000 — uv run uvicorn app.main:app --reload --port 8000"
}

check_ollama() {
  if curl -fsS --max-time 3 "http://127.0.0.1:11434/api/tags" >/dev/null 2>&1; then
    models="$(curl -fsS --max-time 3 "http://127.0.0.1:11434/api/tags" | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(', '.join(m.get('name','') for m in d.get('models',[])[:5]) or 'none')
" 2>/dev/null || echo "?")"
    ok "Ollama :11434 (${models})"
  else
    warn "Ollama OFF — scan agents OK; LLM agents need ollama serve"
  fi
}

check_cursor_subagents() {
  n="$(find "${ROOT}/.cursor/agents" -maxdepth 1 -name 'syntha-*.md' 2>/dev/null | wc -l | tr -d ' ')"
  if [[ "${n}" -ge 5 ]]; then
    ok "Cursor subagents syntha-* (${n} files)"
  else
    warn "Cursor subagents syntha-* (${n} files, expected ≥5)"
  fi
}

check_planner() {
  if ! core_lib_core_dev_ready; then
    warn "Planner API skip (dev:core down)"
    return
  fi
  body="$(curl -fsS --max-time 5 "http://127.0.0.1:3001/api/dev/syntha-status" 2>/dev/null || echo '{}')"
  planner_live="$(printf '%s' "${body}" | python3 -c "import json,sys; print(json.load(sys.stdin).get('plannerLive', False))" 2>/dev/null || echo False)"
  cursor_cfg="$(printf '%s' "${body}" | python3 -c "import json,sys; print(json.load(sys.stdin).get('cursorAgentConfigured', False))" 2>/dev/null || echo False)"
  if [[ "${planner_live}" == "True" ]]; then
    ok "Planner queue API (plannerLive)"
  else
    warn "Planner plannerLive=false"
  fi
  if [[ "${cursor_cfg}" == "True" ]]; then
    ok "CURSOR_API_KEY configured"
  else
    warn "CURSOR_API_KEY missing — npm run planner:agent:setup"
  fi
  open_n="$(curl -fsS --max-time 5 "http://127.0.0.1:3001/api/dev/platform-core/planner" 2>/dev/null | python3 -c "
import json,sys
raw=sys.stdin.read()
try:
  d=json.loads(raw)
except Exception:
  print('?'); raise SystemExit(0)
items=d.get('items') or (d.get('data') or {}).get('items') or []
print(sum(1 for i in items if i.get('status')=='open'))
" 2>/dev/null || echo "?")"
  log "     Planner open items: ${open_n}"
}

run_backend_unit() {
  # Static/routing tests only — test_agents.py hits live Ollama (slow/flaky in battle check).
  if uv run pytest \
    tests/unit/test_analysis_agents.py \
    tests/unit/test_ai_task_dev.py \
    tests/unit/test_platform_stack.py \
    -q --tb=no 2>/dev/null; then
    ok "Backend agent unit tests (static + routing)"
  else
    fail "Backend agent unit tests"
  fi
}

run_routing_eval() {
  if uv run pytest tests/eval/test_agent_routing_eval.py -q --tb=no 2>/dev/null; then
    ok "Routing eval (pick_agent + classify)"
  else
    fail "Routing eval"
  fi
}

run_intel_refresh() {
  if bash "${ROOT}/scripts/agent-intel-refresh.sh" >/dev/null 2>&1; then
    ok "agents-map.md refreshed"
  else
    warn "agent-intel-refresh failed"
  fi
}

probe_routing_api() {
  url="http://127.0.0.1:8000/api/v1/platform/stack/agents/routing?pillar=collection_order&role=shop&section_id=shop-co-checkout&task=MOQ%20anomaly"
  body="$(curl -fsS --max-time 5 "${url}" 2>/dev/null || true)"
  if printf '%s' "${body}" | grep -q 'order_anomaly'; then
    ok "GET /platform/stack/agents/routing → order_anomaly"
  else
    fail "Routing API probe"
  fi
}

probe_registry_api() {
  body="$(curl -fsS --max-time 5 "http://127.0.0.1:8000/api/v1/platform/stack/agents/registry" 2>/dev/null || true)"
  wired="$(printf '%s' "${body}" | python3 -c "
import json,sys
d=json.load(sys.stdin)
agents=d.get('data') or d.get('agents') or []
if isinstance(agents, dict): agents=list(agents.values())
wired=sum(1 for a in agents if isinstance(a,dict) and a.get('wired_in_orchestrator'))
print(wired)
" 2>/dev/null || echo 0)"
  if [[ "${wired}" -ge 18 ]]; then
    ok "Registry API (${wired} wired in orchestrator)"
  else
    warn "Registry wired count=${wired} (expected ≥18)"
  fi
}

probe_task_dev_scan() {
  body="$(curl -fsS --max-time 120 -X POST "http://127.0.0.1:8000/api/v1/ai/task/dev" \
    -H 'Content-Type: application/json' \
    -d '{"task":"List migration tech debt and TODO stubs","context":{"pillar":"development","role":"brand","section_id":"brand-dev-pg-sync"}}' 2>/dev/null || true)"
  if printf '%s' "${body}" | grep -qiE 'TechDebt|TECH_DEBT'; then
    ok "POST /ai/task/dev → tech_debt scan (no cloud LLM)"
  else
    fail "POST /ai/task/dev scan probe"
  fi
}

probe_platform_bff() {
  if ! core_lib_core_dev_ready; then
    return
  fi
  body="$(curl -fsS --max-time 120 -X POST "http://127.0.0.1:3001/api/dev/platform-ai/task" \
    -H 'Content-Type: application/json' \
    -d '{"task":"scan tech debt","context":{"pillar":"development","role":"brand","section_id":"brand-dev-pg-sync"}}' 2>/dev/null || true)"
  if printf '%s' "${body}" | grep -q '"ok":true'; then
    ok "Platform BFF POST /api/dev/platform-ai/task"
  else
    warn "Platform BFF probe — FastAPI bridge"
  fi
}

run_ollama_eval_optional() {
  if [[ "${SKIP_OLLAMA_EVAL:-}" == "1" ]]; then
    warn "Ollama eval skipped (SKIP_OLLAMA_EVAL=1)"
    return
  fi
  if ! curl -fsS --max-time 2 "http://127.0.0.1:11434/api/tags" >/dev/null 2>&1; then
    warn "Ollama eval skipped"
    return
  fi
  export AI_TIMEOUT="${AI_TIMEOUT:-180}"
  if bash "${ROOT}/scripts/agent-eval-ollama.sh" >/dev/null 2>&1; then
    ok "Ollama live eval (risk/quota/anomaly)"
  else
    warn "Ollama eval partial fail — see .planning/intel/ollama-eval-report.md"
  fi
}

main() {
  mkdir -p "$(dirname "${REPORT}")"
  log ""
  log "=== Agent battle readiness — $(date -u '+%Y-%m-%d %H:%M UTC') ==="
  log ""

  ensure_pg || true
  ensure_core_dev || true
  ensure_fastapi || true
  check_ollama
  check_cursor_subagents
  check_planner

  log ""
  log "--- Backend verification ---"
  run_intel_refresh
  run_backend_unit || true
  run_routing_eval || true
  probe_routing_api || true
  probe_registry_api || true
  probe_task_dev_scan || true
  probe_platform_bff || true
  run_ollama_eval_optional || true

  log ""
  log "=== Summary: ${PASS} OK, ${WARN} WARN, ${FAIL} FAIL ==="

  {
    echo "# Agent battle readiness"
    echo ""
    echo "Generated: $(date -u '+%Y-%m-%d %H:%M UTC')"
    echo ""
    echo "**Score:** ${PASS} OK · ${WARN} WARN · ${FAIL} FAIL"
    echo ""
    echo "## Checks"
    echo '```'
    printf '%s\n' "${LINES[@]}"
    echo '```'
    echo ""
    echo "## Ops"
    echo ""
    echo "| Service | Command |"
    echo "|---------|---------|"
    echo "| Platform Core | \`npm run dev:core\` · :3001 |"
    echo "| FastAPI agents | \`uv run uvicorn app.main:app --reload --port 8000\` |"
    echo "| PG workshop2 | \`npm run db:core:up\` · :5433 |"
    echo "| Planner loop | \`npm run planner:agent:setup\` → \`npm run planner:agent:loop\` |"
    echo "| Full eval | \`npm run agent:eval:all\` |"
    echo ""
    if [[ "${FAIL}" -eq 0 ]]; then
      echo "Status: **READY** (warnings OK for optional LLM/CURSOR)"
    else
      echo "Status: **DEGRADED** — fix FAIL items above"
    fi
  } >"${REPORT}"

  log "Report: .planning/intel/agent-battle-ready.md"
  [[ "${FAIL}" -eq 0 ]]
}

main "$@"
