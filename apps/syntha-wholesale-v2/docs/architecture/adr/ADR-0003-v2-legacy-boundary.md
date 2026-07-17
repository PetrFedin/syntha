# ADR-0003 — V2 and Legacy Boundary

Status: PROPOSED
Date: 2026-07-17
Owners: Architecture

## Context

The repository contains a large legacy/Platform Core application. Reusing its UI, routes or mutable business state directly would make V2 dependent on undocumented behavior and prevent an independent architecture.

## Decision

`apps/syntha-wholesale-v2` is an isolated product boundary.

- Legacy UI components and routes are not imported.
- Legacy routes are not fallback routes for V2.
- Reuse is allowed only through an explicit local adapter implementing a V2-owned port.
- Adapter behavior must be covered by contract tests.
- V2 owns presentation, buyer access, selection, collaboration and negotiated order state.
- External or legacy systems may remain source of truth only for fields explicitly documented in an integration contract.

## Consequences

- V2 can evolve without inheriting legacy navigation and UI decisions.
- Useful infrastructure can still be reused behind stable ports.
- Migration is explicit and testable rather than hidden.
- Initial implementation cost is higher than direct imports but long-term coupling is lower.

## Validation

- Architecture validator rejects legacy UI imports when source code is introduced.
- Every adapter records source-of-truth ownership and failure behavior.
- No task may introduce a fallback to fixtures or legacy routes without an accepted ADR.
