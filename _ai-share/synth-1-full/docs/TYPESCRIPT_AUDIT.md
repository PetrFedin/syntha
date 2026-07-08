# TypeScript Audit — Platform Core Phase 20

## Canonical type locations

| Domain | Canonical file |
|--------|----------------|
| Demo context | `lib/platform-core-demo-context.ts` |
| Pillar snapshots | `lib/platform-core-pillar-snapshot.types.ts` |
| Chain overview | `server/platform-core-chain-overview.ts` |
| Hub matrix types | `lib/platform-core-hub-matrix.ts` (prefer demo-context for DemoContext) |
| B2B order | `platform-core-ports/b2b-orders.ts` → workshop2 lifecycle |
| Roles/pillars | `lib/platform-core-hub-matrix.ts` — CoreChainRoleId, CoreHubPillarId |

## Duplicates / drift

| Issue | Files | Fix Phase |
|-------|-------|-----------|
| `ChainPillarSnap` vs `PlatformCorePillarSnapshot` | client hook vs server | 21 unify |
| Inline `StatusPayload` in SampleCollectionPillarCard | pillar card | 21 use snapshot types |
| Gateway `*OrderResult` overlap | gateways/* | 22 shared base type |
| `any` in readiness audits | *-audit.ts | 23 strict |

## Enums

- Role: `brand | shop | manufacturer | supplier` — `CoreChainRoleId`
- Pillar: 5 ids — `CoreHubPillarId`
- Do not add parallel string unions in components — import from hub-matrix

## Rules

1. New public types → `lib/platform-core-*` or `platform-core-ports/types`
2. No duplicate DTO in components — use snapshot/gateway types
3. Server types stay in `server/platform-core-*` or `platform-core-pillar-snapshot.types.ts`
