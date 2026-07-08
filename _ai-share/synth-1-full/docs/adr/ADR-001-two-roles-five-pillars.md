# ADR-001: Platform Core — 2 baseline roles × 5 pillars

**Status:** Accepted  
**Date:** 2026-07-08  
**Context:** Fashion B2B golden path spans brand creation through shop wholesale order to factory production. Previous UI mixed 4 roles, marketing surfaces, and Workshop2 in one navigation graph.

## Decision

Platform Core baseline = **brand + shop** only, each with **five pillars**:

1. development (ТЗ → образец)
2. sample_collection (образец → коллекция)
3. collection_order (коллекция → заказ)
4. order_production (заказ → производство)
5. comms (связь)

Manufacturer and supplier are **extended roles**, not part of baseline bundle or default strict navigation.

## Consequences

- Hub matrix rows: baseline in `platform-core-hub-matrix.ts`; extended peers delegated
- Routes: `platform-core-routes.ts` exports only `ROUTES.brand` and `ROUTES.shop`
- UI entry: `/brand/core` and `/shop/core` with `?pillar=` — not `/brand/production/workshop2`
- Tests: `platform-core-boundaries.test.ts` guards baseline files

## Alternatives rejected

- Single unified role — loses B2B buyer/seller separation
- Workshop2 as primary UI — wrong mental model for Platform Core v1
