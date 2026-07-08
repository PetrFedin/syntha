# ADR-005: Backend split — Core (baseline) vs Full (extended)

**Status:** Accepted  
**Date:** 2026-07-08

## Context

FastAPI mounted 400+ routes including analytics, wardrobe, academy — unnecessary for Platform Core deployments and agent token budget.

## Decision

1. `platform_core_baseline.py` — auth, org, brand, product metadata, collections, seasons, showrooms, wholesale, orders, dam, ingestion, plm (baseline set), pricing, inventory, collaboration, tasks, platform stack, ai (baseline)
2. `platform_core_extended.py` — factory, fintech, marketing, archive-tagged modules
3. Env `PLATFORM_CORE_BASELINE=true` mounts baseline only

**Important:** Next.js BFF (`/api/workshop2/platform-core/*`) remains primary write path for golden path entities regardless of FastAPI mode.

## Consequences

- Ops can run slim backend for PC demos
- Dual PG (5433 W2 vs 5432 FastAPI) documented — not merged in Phase 20
- See `docs/BACKEND_PLATFORM_CORE_BASELINE.md`

## Alternatives rejected

- Single merged backend service — too large for baseline deploy
- Remove FastAPI entirely — still needed for DAM, auth, org
