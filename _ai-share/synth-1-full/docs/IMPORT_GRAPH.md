# Import Graph — Platform Core Phase 20

## Allowed rings (ISOLATION-MAP)

```
Ring A (baseline): platform-core-routes, components/platform, lib/platform-core-*
Ring B (extended): platform-core-extended-routes, factory/*, mfr/supplier workspaces
Ring C (legacy): platform-core-legacy-routes, lib/routes, lib/b2b, lib/production
```

**Rule:** A must not import B or C statically. Extended loads via `next/dynamic`.

## Baseline guard (`platform-core-boundaries.test.ts`)

Forbidden in 8 baseline files:
- `@/lib/routes`, `@/_archive`, `@/_extended`
- `@/components/factory`, `@/components/client`, `@/components/wardrobe`
- `@/lib/platform-core-extended-routes`, `@/lib/platform-core-legacy-routes`

## Heavy chains

```
RoleCoreCabinetHub → platform-core-hub-matrix (646 LOC, 100+ importers)
  → demo-context, native-href, extended-peers, article-spine
usePlatformCoreChainOverview → hub-matrix (again) → /api/.../chain-overview
```

**Cycle break:** `platform-core-demo-context.ts` — no routes/hub-matrix import

## Violations (gray zone)

| Zone | Files | Phase |
|------|------:|-------|
| `@/_archive` in platform | 12 | 21 remove |
| Static `@/components/factory` | extended pillars + dossier | OK if dynamic entry |
| `@/lib/production` in baseline routes | workshop2-url only | OK (URLs, not UI) |
| Barrel re-exports | pillar-cabinet-sections shim | 22 consolidate |

## Barrel files to avoid

- Do not create `components/platform/index.ts` mega-barrel
- Prefer direct imports or pillar facades

См. `docs/PLATFORM_CORE_DEPENDENCY_GRAPH.md`, `docs/PERFORMANCE_AUDIT.md`
