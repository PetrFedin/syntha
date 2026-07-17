# ADR-0004 — Runtime framework

Status: PROPOSED
Date: 2026-07-17

## Context

V2 needs an isolated typed web runtime with mature routing, server rendering and deployment support.

## Decision

Use Next.js App Router with TypeScript inside `apps/syntha-wholesale-v2`.

## Rules

- React Server Components are the default.
- Client Components require a documented browser-only need.
- V2 must not import the existing Platform Core application.
- Runtime configuration remains inside the V2 package.

## Consequences

The project gets a mature React runtime and clear route composition, but framework upgrades and server/client boundaries require active governance.

## Alternatives

- Vite SPA: rejected for the default architecture because server rendering and route-level server composition are core needs.
- Reusing the legacy runtime: rejected because it breaks V2 isolation.
