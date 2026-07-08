# Phase 22.5 — Final Platform Core Cleanup Report

**Date:** 2026-07-08  
**Branch:** `platform-core-v1-routes-cleanup`  
**Rule:** no new features · no UX change · no scope expansion

---

## Deliverables

| # | Task | Status |
|---|------|--------|
| 1 | Final core inventory | ✅ `PLATFORM_CORE_MANIFEST.md` § Phase 22.5 |
| 2 | Import cleanup | ✅ baseline 0 archive/factory; extended isolated |
| 3 | Core service normalization | ✅ `platform-core-services.ts` |
| 4 | Documents gateway | ⚠️ gateway exists; UI wiring → Phase 23A |
| 5 | DataTable | ✅ `PlatformCoreDataTable` shell |
| 6 | EmptyState | ✅ `platform-core-empty-state.ts` |
| 7 | PeerStrip shell | ✅ 5 strips migrated (6/70 total) |
| 8 | Design tokens | ✅ documented; hubCabinet canonical |
| 9 | Hub matrix | ✅ coordinator 425 LOC; peers/rewrite extracted |
| 10 | Dead code report | ✅ `DEAD_CODE_REPORT.md` |
| 11 | Dependency check | ✅ no new cycles; extended facade explicit |
| 12 | Boundary tests | ✅ `platform-core-boundaries-final.test.ts` (304 total) |
| 13 | Final report | ✅ this file |

---

## Metrics

| Metric | Before 22.5 | After 22.5 |
|--------|-------------|------------|
| Archive imports (baseline UI) | 0 | **0** |
| PeerStrip on shell | 2 | **6** |
| Boundary test files | 2 | **3** |
| Horizontal services barrel | none | **1** |
| Canonical EmptyState entry | none | **1** |
| Canonical DataTable entry | none | **1** |

---

## What remains outside ideal state

1. **≤12 baseline UI files** import `platform-core-extended-routes` (factory dossier links) — capped by test
2. **64 PeerStrips** still use inline `hubGadget.goldenPath` layout
3. **Documents gateway** not consumed in baseline UI components
4. **3 EmptyState** implementations outside design-system
5. **Extended pillar cards** (`*Manufacturer*`, `*Extended*`) remain in `components/platform/` — Ring B, not removable without bundle split
6. **`platform-core-ports/legacy/marketing`** — archive port, not baseline
7. **Hub matrix** `getHubCellActionsForDemo` — filter logic still in coordinator (acceptable; could move to builder in P2)

---

## Compatibility layers (intentional)

- `shared/legacy-peer-strips/*` — archive UI isolation
- `platform-core-extended-routes.ts` — Ring B href facade
- `platform-core-legacy-routes.ts` — URL redirects
- `b2b-message-templates` legacy BFF path
- `ui/empty-state-b2b.tsx` — non-PC B2B pages

---

## Post-legacy deletion candidates (after extended bundle split)

- Archive wrapper files in `components/platform/Brand*Retail*` (replace with ports-only)
- Wave readiness strips when UAT complete
- `lib/routes` consumers in non-test code outside Ring A

---

## §14 Completion check (five questions)

### 1. Можно ли считать Platform Core полностью очищенным?

**Нет** — baseline Ring A чист от archive/factory/marketing; остаётся extended-routes debt (≤12 файлов), PeerStrip migration (64 осталось), documents UI unwired.

### 2. Есть ли функциональность вне 2 ролей × 5 столпов?

**Да:**
- Extended manufacturer/supplier pillar cards and factory dossier chrome (flag-gated)
- Monetization/CRM peer strips (WSSI, agent-rep, pricelist) — denylist in two-role sidebar, code remains
- `/platform/b2b/marketroom`, partners — B2B hub surfaces (supporting, not fifth pillar)
- Planner dev API — dev-only

### 3. Есть ли прямые зависимости от Archive или Extended?

**Archive:** baseline UI — **нет** (0 `@/_archive`).  
**Extended:** baseline UI — **да**, ≤12 files via `platform-core-extended-routes` (factory dossier hrefs); extended UI files import `@/components/factory` by design.

### 4. Можно ли считать Platform Core самостоятельным продуктом?

**Да, с оговоркой** — как **brand+shop wholesale kernel** на ветке `platform-core-v1-routes-cleanup`; commercial completeness **7.4/10** (Phase 22); merge to `main` pending.

### 5. Последние действия до полного завершения очистки

1. Merge `platform-core-v1-routes-cleanup` → `main`
2. Phase 23A–D (product P0) — not cleanup, but blocks "commercial complete"
3. Migrate remaining PeerStrips to shell
4. Replace extended-routes imports in 10 baseline files with `platform-core-ports/factory/*`
5. Wire documents-gateway in tracking/handoff UI
6. Consolidate EmptyState callers → `platform-core-empty-state`
7. Optional: split extended pillar chunks to separate npm entry / lazy boundary
8. `ts-prune` dead export pass (Phase 24)

---

## References

- `docs/PLATFORM_CORE_MANIFEST.md`
- `docs/DEAD_CODE_REPORT.md`
- `docs/FIVE_PILLARS_AUDIT.md`
- `docs/PHASE_23_ROADMAP.md`
- `src/lib/__tests__/platform-core-boundaries-final.test.ts`
