# Performance Audit — Platform Core Phase 20

## Done (Phase 19)

| Area | Implementation |
|------|----------------|
| Pillar cards | `pillars/*Brand/Baseline` vs `*Manufacturer/Extended` — separate chunks |
| RoleCorePillarInsightCards | Direct dynamic import per role×pillar |
| Facades | Development/Comms/OrderProduction → dynamic routers |
| Workspaces | `PlatformCoreRolePillarWorkspace` — lazy per cabinet |
| Extended bridge | `RoleCoreCabinetHubExtendedBridge` — supplier/mfr only |
| Empty cells | `PlatformCoreEmptyCellPanels` — dynamic |

## Baseline bundle (brand/shop /core)

**Does NOT load:** `@/components/factory/*` (verified boundaries + pillar split)

**Still in baseline JS:**
- `platform-core-hub-matrix.ts` (646 LOC) — P1 split rows vs runtime
- `RoleCoreCabinetHub` static shell (~678 LOC)
- `platform-core-routes.ts` + `workshop2-url` (URL helpers only)

## Further lazy-load (Phase 21–22)

| Target | Benefit |
|--------|---------|
| `CollectionOrderPillarCard` → brand/shop split | Match pillar pattern |
| Factory strips inside `CommsPillarCardExtended` | Smaller extended chunk |
| `PlatformCorePublishedShowroom` (961 LOC) | Hub initial load |
| `PlatformCoreB2bOrderDetailFacts` (824 LOC) | Order detail route only |
| `platform-core-hub-matrix` → split demo-hrefs | Tree-shake extended peers |

## Dead code candidates

- Unused hooks (5) — see STATE_AUDIT
- `PlatformCoreCabinetPillarCards.tsx` — legacy hub cards
- LEGACY_ROUTES pages after archive move

## Verification

```bash
npm run build
# Analyze .next/static/chunks for factory in brand core entry (manual)
npm test -- --testPathPattern=platform-core-boundaries
```
