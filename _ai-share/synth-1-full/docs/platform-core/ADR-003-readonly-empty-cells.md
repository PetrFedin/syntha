# ADR-003: Platform Core read-only empty cells

## Status

Accepted (Wave ZA, core-242)

## Context

Five role×pillar cells in the Platform Core hub matrix are intentionally **empty** for SS27/FW27 demo collections: shop×development, manufacturer×sample_collection, manufacturer×collection_order, supplier×sample_collection, supplier×collection_order.

These cells mount **peer-insight panels** (forecast, BOM preview, development bridge, publish/handoff badges) for investor walkthrough — not full workspace write surfaces.

## Decision

1. Empty-cell insight panels remain **read-only** — no B2B checkout, W2 editor, or procurement write UI in these anchors.
2. Former audit `bad` items for these limitations move to **ADR backlog** (`adrBacklog` on section templates), not live `bad`/`fix` scores.
3. Closure registry: `src/lib/platform/wave-za-adr-readonly-backlog.ts` + e2e `core-242-wave-za-adr.spec.ts`.

## Consequences

- Hub readiness shows cleared `bad`/`fix` on lead empty-cell sections while ADR-003 documents deferred write paths.
- Future write surfaces require a new ADR or explicit wave scope — not silent checkout in empty cells.
