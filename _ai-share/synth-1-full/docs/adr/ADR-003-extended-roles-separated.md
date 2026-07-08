# ADR-003: Extended roles separated from baseline

**Status:** Accepted  
**Date:** 2026-07-08

## Context

Manufacturer/supplier UI pulled `@/components/factory/*` into brand/shop bundles, inflating baseline and violating role isolation.

## Decision

1. **Route split:** `platform-core-extended-routes.ts` for factory paths
2. **Component split:** `pillars/*Extended*`, `*Manufacturer*` loaded via `next/dynamic`
3. **Import guard:** baseline files must not static-import factory, extended routes, legacy routes
4. **Flag:** `NEXT_PUBLIC_PC_EXTENDED_ROLES=1` for factory cabinets

## Consequences

- Phase 19: RoleCorePillarInsightCards imports baseline chunks directly
- Workspaces for mfr/supplier remain in extended ring
- Peer hrefs to factory from brand use `platform-core-baseline-peer-hrefs.ts` (literals, no extended import)

## Alternatives rejected

- Single monolithic pillar card with variant — webpack still bundles factory
- Removing manufacturer from product — needed for full chain demo
