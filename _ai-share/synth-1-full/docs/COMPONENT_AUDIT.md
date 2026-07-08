# Component Audit — Platform Core Phase 20

**Scope:** `src/components/platform/` — 282 files, ~35k LOC

## Top 15 largest (split candidates)

| File | Lines | Action |
|------|------:|--------|
| PlatformCorePublishedShowroom.tsx | 961 | Split showroom / syndication / 3D |
| PlatformCoreB2bOrderDetailFacts.tsx | 824 | Split facts / timeline / actions |
| PlatformCoreShopB2bTrackingPanel.tsx | 791 | Split tracking / chains / map |
| PlatformCorePlannerPanel.tsx | 785 | Dev-only; keep lazy |
| CollectionOrderPillarCard.tsx | 755 | Split brand/shop like other pillars |
| RoleCoreCabinetHub.tsx | 678 | Extract section registry |
| CommsPillarCardExtended.tsx | 657 | Lazy factory strips |
| DevelopmentPillarCardManufacturer.tsx | 609 | OK in extended chunk |
| OrderProductionPillarCardManufacturer.tsx | 552 | OK in extended chunk |

## Duplicate patterns → Shared

| Pattern | Count | Extract to |
|---------|------:|------------|
| *PeerStrip* | 60 | `PlatformCoreSpinePeerStripShell` (config-driven) |
| PillarCard facades | 3 + pillars/ | Done Phase 19; apply to CollectionOrder |
| PillarInsightHeader/Steps | — | Already in `PillarInsightPrimitives.tsx` |
| Cabinet shell | 5 | Already `PillarCabinetHeader`, `ActionRail` |

## Rules

- Component used 2+ times in platform → `components/platform/shared/` (create Phase 22)
- Factory UI → only `pillars/*Extended*` or `workspaces/*`
- Archive imports (`@/_archive`) — 12 files, remove Phase 21

См. `docs/PERFORMANCE_AUDIT.md`
