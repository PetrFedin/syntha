# ADR-0003 — V2 and Legacy Boundary

Status: ACCEPTED
Date: 2026-07-17
Accepted: 2026-07-22
Reviewer: Product owner — Petr Fedin
Owners: Architecture

## Context

The repository contains a large legacy/Platform Core application. Reusing its UI, routes or mutable business state directly would make V2 dependent on undocumented behavior and prevent an independent architecture.

## Decision

`apps/syntha-wholesale-v2` is an isolated product boundary.

- Legacy UI components, routes, services and mutable business state are not imported.
- Legacy routes are not fallback routes for V2.
- Legacy code is not copied into V2.
- Any future external-system integration must implement a V2-owned port through an explicit adapter.
- Adapter behavior must be covered by contract tests.
- V2 owns presentation, buyer access, selection, collaboration and negotiated order state.
- External systems may remain source of truth only for fields explicitly documented in an integration contract.

## Consequences

- V2 evolves without inheriting legacy navigation, UI and domain decisions.
- Legacy can remain archived and operationally separate.
- Migration or integration is explicit and testable rather than hidden.
- Initial implementation cost is higher than direct reuse but long-term coupling is lower.

## Validation

- Architecture validation rejects imports from legacy application roots.
- Every adapter records source-of-truth ownership and failure behavior.
- No task may introduce a fallback to legacy routes, fixtures or mutable state without a new accepted ADR.
