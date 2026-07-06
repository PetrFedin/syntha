# Syntha — Fashion Platform

**Repository:** https://github.com/PetrFedin/syntha  

Syntha (Fashion OS, Platform Core) — отдельный продукт. **Renova** (ремонт): https://github.com/PetrFedin/renova — другой репозиторий, без общего кода.

## Local Environment

- Node.js 22
- Python 3.14
- FastAPI
- PostgreSQL 17
- Redis 8
- Docker / OrbStack
- Ollama 0.30.8
- Firebase
- Vercel

## Backend

FastAPI + SQLAlchemy + PostgreSQL

## AI

Ollama running on:

http://localhost:11434

Preferred models:

- qwen3
- llama3.3
- deepseek-r1

## Infrastructure

Redis for cache and queues.
PostgreSQL for persistent storage.
Docker for local development.

## Platform Capabilities

| Area | Where to extend |
|------|-----------------|
| PostgreSQL + SQLAlchemy | `app/db/` — models, repositories, `session.py` |
| Alembic / migrations | `app/db/migrations/`, `_ai-share/synth-1-full/db/migrations/` |
| JWT auth | `app/core/security.py`, `app/api/deps.py`, `app/api/v1/endpoints/auth.py` |
| Users | `app/db/models/core.py` |
| Product catalog | `app/api/v1/endpoints/product.py`, BFF in `_ai-share/synth-1-full/src/app/api/b2b/` |
| Image upload | `app/api/v1/endpoints/dam.py`, `ingestion.py`, `ai_routes.py` |
| Firebase Auth | `_ai-share/synth-1-full/src/lib/firebase/` (frontend) |
| Stripe / ЮKassa | `_ai-share/synth-1-full/src/app/api/integrations/payments/` |
| AI (Ollama / OpenAI) | `app/ai/`, `app/api/v1/endpoints/ai_routes.py` |

**Platform stack API:** `GET /api/v1/platform/stack/matrix` · **Agent context:** pass `pillar`, `role`, `section_id` to orchestrator.

Cursor rule with full paths: **`.cursor/rules/project.mdc`** (`alwaysApply: true`).

---

# Synth-1 Fashion OS — Backend

FastAPI backend for the Synth-1 Fashion Intelligence Platform. **Next.js UI:** `_ai-share/synth-1-full/`. Онбординг, CI и матрица env: **`docs/RUNBOOK.md`**.

**Фронтенд (Next.js):** единственный код в монорепо — **`_ai-share/synth-1-full`**. Субмодуль **`synth-1/`** удалён; порядок работ и субмодули — **`docs/MIGRATION_FULL_CUTOVER.md`**, **`docs/SUBMODULES.md`**.

**Cursor (агенты / MCP):** контракт агента — **`AGENTS.md`**, правило **`/.cursor/rules/gsd-superpowers-mcp-monorepo.mdc`**, детали — **`docs/CURSOR_AGENT_TOOLKIT.md`**, MCP — **`.cursor/mcp.json`**. Исходники Superpowers: **`tools/superpowers`** ([obra/superpowers](https://github.com/obra/superpowers.git)). После clone: **`bash scripts/bootstrap-monorepo-dev.sh`** (внутри вызывается **`scripts/normalize-gsd-cursor-paths.sh`**). После отдельного **`npx get-shit-done-cc@latest --local --cursor`** при необходимости снова: **`bash scripts/normalize-gsd-cursor-paths.sh`**.

## Quick start

```bash
# Install
poetry install

# Run
uvicorn app.main:app --reload

# API docs
open http://localhost:8000/docs
```

## Structure

- `app/api/` — REST endpoints
- `app/services/` — Business logic
- `app/ai/` — LLM, embeddings, AI services
- `app/agents/` — AI agents (orchestrator, report agents)
- `app/db/` — Models, repositories, migrations

## Key commands

```bash
# Run all agents (reports + smoke)
python scripts/run_all_agents.py

# Report agents only
python -m app.agents.agent_runner

# Tests
pytest tests/
```

## Environment

Copy `.env.example` to `.env`. Required: `SECRET_KEY`, `DATABASE_URL`.

## License

Proprietary.
