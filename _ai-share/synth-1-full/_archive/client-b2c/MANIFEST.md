# client-b2c archive — batch 1 (physical move)

**Date:** 2026-07 · **Status:** moved

## Перенесено

| From | To | Files |
|------|-----|-------|
| `src/app/client/**` | `_archive/client-b2c/src/app/client/**` | 67 |
| `src/lib/client/**` | `_archive/client-b2c/src/lib/client/**` | 8 |
| `src/components/client/**` | `_archive/client-b2c/src/components/client/**` | 7 |
| `src/components/wardrobe/**` | `_archive/client-b2c/src/components/wardrobe/**` | 2 |

**Total:** 84 files.

## Stub (активный код)

- `src/app/client/layout.tsx` — passthrough gate layout
- `src/app/client/[[...path]]/page.tsx` — redirect → `/platform?archived=client-b2c`

## Path aliases (tsconfig)

- `@/lib/client/*` → `_archive/client-b2c/src/lib/client/*`
- `@/components/client/*` → `_archive/client-b2c/src/components/client/*`
- `@/components/wardrobe/*` → `_archive/client-b2c/src/components/wardrobe/*`

## Не перенесено (batch 2+)

- `src/app/api/client/**` — API sewing-pattern intent (server bridge)
- `src/components/layout/client-cabinet-shell.tsx` — shared layout shell

## Возврат

`NEXT_PUBLIC_CLIENT_B2C_RESTORE=1` (планируется) или восстановление tree из git + снятие aliases.

## Batch 2 (2026-07)

| From | To |
|------|-----|
| `src/app/api/client/**` | `_archive/client-b2c/src/app/api/client/**` |
| `src/components/layout/client-cabinet-shell.tsx` | `_archive/client-b2c/src/components/layout/` |

Stubs: `src/app/api/client/*/route.ts` (410 в Platform Core, legacy → dynamic import из архива); `src/components/layout/client-cabinet-shell.tsx` (re-export).
