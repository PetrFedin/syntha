# Platform Core Dead Code Report — Phase 22.5

**Date:** 2026-07-08  
**Rule:** list only — **no automatic deletion** in Phase 22.5.

---

## 1. Compatibility wrappers (keep)

| Path | Used by | Verdict |
|------|---------|---------|
| `components/platform/BrandCoAgentRepCoPeerStrip.tsx` | retail CRM denylist sections | **Keep** — thin re-export to `shared/legacy-peer-strips/` |
| `components/platform/shared/legacy-peer-strips/**` | 12 former `@/_archive` imports | **Keep** — archive isolation layer |
| `app/api/platform-core/b2b-message-templates/route.ts` | legacy clients | **Keep** — re-exports canonical handler |
| `platform-core-legacy-routes.ts` | middleware, readiness | **Keep** — legacy path redirects |
| `platform-core-extended-routes.ts` | extended roles + ≤12 baseline deep-links | **Keep** — Ring B facade |

---

## 2. Baseline extended-routes debt (shrink later)

Files in `components/platform/` (baseline names) still importing `platform-core-extended-routes` for factory dossier hrefs:

- `BrandDevPgSyncPeerStrip.tsx`
- `CommsNotificationCenterStrip.tsx`
- `PlatformCoreArticleChatContextStrip.tsx`
- `PlatformCoreB2bOrderDetailFacts.tsx`
- `PlatformCoreB2bOrderDetailPoCard.tsx`
- `PlatformCoreCalendarUserTasksStrip.tsx`
- `PlatformCoreCommsCrossNav.tsx`
- `PlatformCoreFactoryCalendarOrderContextStrip.tsx`
- `PlatformCoreFactoryCommsContextBanner.tsx`
- `PlatformCoreSegmentError.tsx`

**Action (Phase 23+):** move factory dossier hrefs to `platform-core-ports/factory/*` consumed by baseline.

---

## 3. Duplicate EmptyState (consolidate)

| File | Status |
|------|--------|
| `components/design-system/empty-state.tsx` | **Canonical** |
| `components/ui/empty-state.tsx` | Legacy — migrate callers to `platform-core-empty-state` |
| `components/ui/empty-state-b2b.tsx` | JOOR-style — compatibility for B2B pages outside Ring A |
| `components/user/shared/empty-state.tsx` | User cabinet — outside PC |

---

## 4. Extended UI in platform/ (not dead — Ring B)

| Component | Role |
|-----------|------|
| `FactoryDossierCoreChrome.tsx` | Manufacturer dossier |
| `SupplierProcurementPillarCard.tsx` | Supplier pillar |
| `pillars/*Manufacturer*`, `*Extended*` | Lazy chunks behind flag |

**Verdict:** keep until extended roles promoted or fully isolated bundle.

---

## 5. Wave / readiness strips (evaluate per wave)

| Pattern | Examples | Verdict |
|---------|----------|---------|
| `WaveY*Readiness*` | `WaveYzReadinessScoreExportStrip` | **Keep** — planner/readiness UAT hooks |
| Monetization peers | `BrandCoWssiCoPeerStrip`, CRM strips | **Denylist** in two-role baseline sidebar; code remains for full audit mode |

---

## 6. Unused exports (manual follow-up)

Automated orphan detection not run in Phase 22.5 (risk of dynamic import false negatives).

**Recommended:** `npx ts-prune` on `src/lib/platform-core*.ts` in CI Phase 24.

---

## 7. Routes outside baseline manifest

| Route | Status |
|-------|--------|
| `/brand/range-planner` | Supporting — brand development exit |
| `/brand/production/workshop2` | Legacy — middleware redirects in PC mode |
| `ROUTES.brand.launchReadiness` | Orphan — see FIVE_PILLARS_AUDIT |

---

## Summary

| Category | Count | Action |
|----------|-------|--------|
| Compatibility wrappers | ~25 | Keep |
| Extended-routes debt files | ≤12 | Shrink via ports |
| EmptyState duplicates | 3 non-canonical | Migrate gradually |
| Archive peer strips | 13 files | Keep as isolation |
| True dead code | TBD | ts-prune in Phase 24 |
