# ADR: Platform Core v1 baseline freeze

**Status:** accepted · **Date:** 2026-07

## Context

Монорепо Syntha содержал B2C, advanced B2B, admin, marketing и legacy brand/shop
кабинеты в одном дереве `src/app/`. Platform Core v1 требует **2 роли × 5 столпов**
и golden path wholesale без шума.

## Decision

1. **Baseline UI** — только `/platform`, `/brand/core`, `/shop/core`, baseline
   `shop/b2b/*` (7 routes), `/brand/b2b-orders`, messages, calendar.
2. **Физический перенос** в `_archive/*` и `_extended/` (партии 1–10).
3. **tsconfig path fallback** — legacy dynamic imports резолвятся без дублей в `src/`.
4. **Strict mode** — middleware режет legacy UI; denylist в `platform-core-legacy-routes.ts`.
5. **Extended roles** — manufacturer/supplier UI за `NEXT_PUBLIC_PC_EXTENDED_ROLES=1`.

## Consequences

- `npm run build` и `typecheck:ci` зелёные после архивации.
- Golden path e2e (`core-249`) — 12 baseline stops; без PG пропускаются detail + shop showroom.
- Marketing `/b/*` — stub gate → shop showroom (core) или platform archived query.
- Возврат зоны: `git mv` из `_archive/` + снятие alias (см. MANIFEST в каждом архиве).

## References

- `_platform-core-v1/TWO_ROLE_BASELINE.md`
- `_platform-core-v1/PLATFORM_CORE_ARCHIVE_MAP.md`
- `src/lib/platform-core-golden-cross-role-path.ts`
