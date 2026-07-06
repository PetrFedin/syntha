#!/usr/bin/env bash
# Platform Core planner — run Cursor agents in a loop until queue empty or max iterations.
set -euo pipefail

BASE="${PLANNER_API_BASE:-http://127.0.0.1:3001}"
MAX="${PLANNER_LOOP_MAX:-5}"
POLL_SEC="${PLANNER_LOOP_POLL_SEC:-15}"
TIMEOUT_SEC="${PLANNER_LOOP_TIMEOUT_SEC:-600}"
BY="${PLANNER_LOOP_BY:-loop-agent}"

if ! curl -fsS --max-time 3 "${BASE}/api/dev/syntha-status" >/dev/null 2>&1; then
  echo "dev:core not reachable at ${BASE}" >&2
  if curl -fsS --max-time 2 "http://127.0.0.1:3001/" >/dev/null 2>&1; then
    echo "  :3001 responds but not Platform Core planner API → npm run core:restart" >&2
  else
    echo "  start: npm run dev:core   (PG: npm run db:core:up)" >&2
  fi
  exit 1
fi

STATUS_JSON="$(curl -fsS --max-time 4 "${BASE}/api/dev/syntha-status" 2>/dev/null || echo '{}')"
PLANNER_LIVE="$(printf '%s' "${STATUS_JSON}" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("plannerLive", False))' 2>/dev/null || echo False)"

if [[ "${PLANNER_LIVE}" != "True" ]]; then
  echo "planner API not live at ${BASE} (plannerLive=false) → npm run core:restart" >&2
  exit 1
fi

echo "→ boundary check"
npm run validate:platform-core-boundary

iter=0
while [[ "${iter}" -lt "${MAX}" ]]; do
  iter=$((iter + 1))
  echo "=== planner loop ${iter}/${MAX} ==="

  RESP="$(curl -fsS -X POST "${BASE}/api/dev/platform-core/planner/run-agents" \
    -H 'Content-Type: application/json' \
    -d "{\"by\":\"${BY}\"}" 2>/dev/null || true)"

  if [[ -z "${RESP}" ]]; then
    echo "run-agents failed (empty response)" >&2
    exit 1
  fi

  OK="$(printf '%s' "${RESP}" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("ok", False))' 2>/dev/null || echo False)"
  if [[ "${OK}" != "True" ]]; then
    REASON="$(printf '%s' "${RESP}" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("reason") or d.get("message") or "unknown")' 2>/dev/null || echo unknown)"
    echo "Stop: ${REASON}"
    exit 0
  fi

  TASK_ID="$(printf '%s' "${RESP}" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("taskId",""))')"
  SESSION_ID="$(printf '%s' "${RESP}" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("sessionId",""))')"
  echo "task=${TASK_ID} session=${SESSION_ID}"

  if [[ -z "${SESSION_ID}" ]]; then
    echo "No sessionId — check CURSOR_API_KEY and npm run planner:agent:install" >&2
    exit 1
  fi

  elapsed=0
  STATUS="running"
  while [[ "${elapsed}" -lt "${TIMEOUT_SEC}" ]]; do
    sleep "${POLL_SEC}"
    elapsed=$((elapsed + POLL_SEC))
    META="$(curl -fsS "${BASE}/api/dev/platform-core/planner/session/${SESSION_ID}" 2>/dev/null || echo '{}')"
    STATUS="$(printf '%s' "${META}" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("status","unknown"))' 2>/dev/null || echo unknown)"
    echo "  session status=${STATUS} (${elapsed}s)"
    if [[ "${STATUS}" == "done" || "${STATUS}" == "error" ]]; then
      break
    fi
  done

  NOTE="loop ${iter}: session ${STATUS}"
  curl -fsS -X POST "${BASE}/api/dev/platform-core/planner/complete" \
    -H 'Content-Type: application/json' \
    -d "$(python3 -c 'import json,sys; print(json.dumps({"id":sys.argv[1],"by":sys.argv[2],"note":sys.argv[3]}))' "${TASK_ID}" "${BY}" "${NOTE}")" \
    >/dev/null

  echo "completed ${TASK_ID}"
done

echo "Reached max iterations (${MAX}). Run npm run planner:next for remaining tasks."
