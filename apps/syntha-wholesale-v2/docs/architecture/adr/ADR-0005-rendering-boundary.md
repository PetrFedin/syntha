# ADR-0005 — Rendering boundary

Status: PROPOSED
Date: 2026-07-17

## Decision

Use server-first rendering. Route composition, authorization, sensitive projections and initial data loading run on the server. Client Components own only interaction state, browser APIs and rich editors.

## Rules

- Sensitive fields are removed before data reaches the client.
- Client Components do not call persistence adapters directly.
- Mutations enter through application commands.
- Published and confirmed snapshots are not reconstructed from client state.

## Consequences

This reduces client exposure and duplicated fetching, while requiring deliberate serialization and hydration boundaries.
