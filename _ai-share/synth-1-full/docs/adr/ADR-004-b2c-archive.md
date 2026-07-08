# ADR-004: B2C and non-B2B products in Archive

**Status:** Accepted  
**Date:** 2026-07-08

## Context

Syntha monorepo contains wardrobe, client portal, academy, runway, marketing AI — not part of wholesale golden path.

## Decision

Non-B2B surfaces are **Archive ring**:

- Denylist in `platform-core-legacy-routes.ts`
- STRICT mode redirects to `/platform?archived=1`
- No imports from `@/app/client`, `@/components/wardrobe`, etc. in baseline

Platform Core MODE=1 is **B2B chain only** (brand ↔ shop ↔ factory as peer, not consumer app).

## Consequences

- `_archive/platform-core-legacy/` holds moved pages
- Full app still builds with `MODE=0` for legacy demos
- New consumer features require new product repo or explicit archive ADR

## Alternatives rejected

- Delete B2C code — loses optional full-app demo
- Merge wardrobe into shop core — scope explosion
