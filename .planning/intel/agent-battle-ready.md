# Agent battle readiness

Generated: 2026-06-21 01:42 UTC

**Score:** 13 OK · 3 WARN · 0 FAIL

## Checks
```

=== Agent battle readiness — 2026-06-21 01:36 UTC ===

WARN PostgreSQL :5433 OFF — docker compose up
WARN PostgreSQL :5433 — OrbStack OFF; scan/routing agents OK, PG strips need db:core:up
OK   Platform Core dev:core :3001
OK   FastAPI :8000 (agents API)
OK   Ollama :11434 (gpt-oss:20b)
OK   Cursor subagents syntha-* (7 files)
OK   Planner queue API (plannerLive)
OK   CURSOR_API_KEY configured
     Planner open items: 0

--- Backend verification ---
OK   agents-map.md refreshed
OK   Backend agent unit tests (static + routing)
OK   Routing eval (pick_agent + classify)
OK   GET /platform/stack/agents/routing → order_anomaly
OK   Registry API (20 wired in orchestrator)
OK   POST /ai/task/dev → tech_debt scan (no cloud LLM)
OK   Platform BFF POST /api/dev/platform-ai/task
WARN Ollama eval skipped (SKIP_OLLAMA_EVAL=1)

=== Summary: 13 OK, 3 WARN, 0 FAIL ===
```

## Ops

| Service | Command |
|---------|---------|
| Platform Core | `npm run dev:core` · :3001 |
| FastAPI agents | `uv run uvicorn app.main:app --reload --port 8000` |
| PG workshop2 | `npm run db:core:up` · :5433 |
| Planner loop | `npm run planner:agent:setup` → `npm run planner:agent:loop` |
| Full eval | `npm run agent:eval:all` |

Status: **READY** (warnings OK for optional LLM/CURSOR)
