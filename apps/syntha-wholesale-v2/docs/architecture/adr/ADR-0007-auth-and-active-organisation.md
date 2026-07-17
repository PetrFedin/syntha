# ADR-0007 — Authentication and active organisation

Status: PROPOSED
Date: 2026-07-17

## Decision

Authorization is evaluated server-side from authenticated user, active organisation membership, organisation type, permission set, assignment scope, entity relationship and entity state.

## Rules

- Brand and Shop are organisation types, not user roles.
- Every protected request validates active organisation membership.
- Hiding a UI action is not authorization.
- Private Shop data never enters Brand projections and vice versa.
- Organisation switching invalidates organisation-scoped caches.

## Consequences

The model supports multi-organisation users safely, but requires negative authorization and tenant-isolation tests for every protected operation.
