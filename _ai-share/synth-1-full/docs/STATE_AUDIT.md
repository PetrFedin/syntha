# State Management Audit — Platform Core Phase 20

## React Context (3)

| Provider | File | Purpose |
|----------|------|---------|
| ChainOverview + demo | `usePlatformCoreChainOverview.tsx` | Hub chain status, demo context |
| Comms split | `CommsCabinetSplitProvider.tsx` | Thread preview layout |
| Embedded workspace | `PlatformCoreEmbeddedWorkspaceContext.tsx` | Chrome flag |

**zustand/jotai:** not used in platform-core (good — avoid parallel stores)

## Hooks (`use-platform-core*` — 21 files)

**Active:** chain-status-poll, development-status-poll, comms-threads-source, b2b-registry-poll, hub-views, order-detail-pillar, audit-ui

**Unused (candidate delete Phase 21):**
- `use-platform-core-syntha-health.ts`
- `use-platform-core-sample-status-poll.ts`
- `use-platform-core-calendar-events.ts`
- `use-platform-core-calendar-task-create-enabled.ts`
- `use-platform-core-w2-registry-order-id.ts`

## Duplicate state patterns

1. **Two snapshot pipelines:** chain-overview vs pillar-snapshot — unify types Phase 21
2. **Poll + SSE + registry** — overlapping refresh; document ownership per surface
3. **Demo context** — canonical in `platform-core-demo-context.ts`; avoid re-import via hub-matrix in new code

## Recommendation

- No new global Context without ADR
- New pillar data → `use-pillar-snapshot` + BFF
- Caches: client maps in chain-overview hook only; no second cache layer

См. `docs/TYPESCRIPT_AUDIT.md`
