# Platform Core v1 — Readiness Report

**Date:** 2026-07-08 · Phase 18

## ✅ Already solid

- 2 roles × 5 pillars baseline (`PLATFORM_CORE_BASELINE_ROWS`)
- Routes split: baseline / extended / legacy
- `/brand/core`, `/shop/core` without `@/lib/routes`
- Boundary tests (`platform-core-boundaries.test.ts`)
- Backend baseline router + `PLATFORM_CORE_BASELINE` flag
- Readiness audits via `platform-core-readiness-routes` bridge
- typecheck:ci + unit tests green locally

## ⚠️ Needs work

| Priority | Item |
|----------|------|
| P1 | Dynamic-import factory-heavy pillar cards for baseline bundle |
| P1 | CI: synth-1-full + Platform Core interactive verify on main |
| P2 | Expand boundary test to scan all `components/platform` (not only 8 files) |
| P2 | Backend: tag stack_registry capabilities baseline/extended/archive |
| P3 | E2E golden-cross-role with PG on CI |

## 🎯 Product mapping (6 entities)

| Entity | Brand | Shop | Outside core |
|--------|-------|------|-------------|
| Article | development pillar | read-only showroom | Workshop2 legacy UI |
| Sample | linesheets/showroom | b2b showroom | factory sample queue (extended) |
| Collection | range/linesheets | matrix/checkout | trade shows (archive) |
| Wholesale Order | b2b-orders | b2b/orders | RFQ/tenders (archive) |
| Fulfillment | handoff/production | tracking | factory ERP (extended) |
| Communication | messages/calendar | messages/calendar | VIP/video (archive) |

## Risks

- Static factory imports inflate baseline JS bundle
- Readiness audit files are large generated splits — edit via bridge only
- `PLATFORM_CORE_BASELINE=true` defaults false — explicit opt-in for prod core deployments

## Next phases

1. Phase 19: Pillar card lazy gates + bundle budget test
2. Phase 20: stack_registry tags + API probe CI
3. Phase 21: PG-primary Platform Core CI green
