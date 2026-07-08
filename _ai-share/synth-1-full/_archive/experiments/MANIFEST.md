# experiments archive — batch 5

**Date:** 2026-07 · **Status:** moved

## Перенесено

| From | To |
|------|-----|
| `src/app/academy` | `_archive/experiments/src/app/academy` |
| `src/app/auctions` | `_archive/experiments/src/app/auctions` |
| `src/app/runway` | `_archive/experiments/src/app/runway` |
| `src/app/community` | `_archive/experiments/src/app/community` |
| `src/app/wallet` | `_archive/experiments/src/app/wallet` |
| `src/app/loyalty` | `_archive/experiments/src/app/loyalty` |
| `src/app/marketroom` | `_archive/experiments/src/app/marketroom` |
| `src/components/academy` | `_archive/experiments/src/components/academy` |

**~20 файлов.** Stub routes не нужны — strict mode + Platform Core hub не ссылаются на эти зоны.

## Batch 7 (2026-07) — admin + retail/experiment long-tail

| From | To |
|------|-----|
| `src/app/admin` (+ stub gate) | `_archive/experiments/src/app/admin` |
| vendor, kickstarter, metaverse, look-builder, try-on, store-locator, outlet, quiz, looks, project-info, embed, qc-terminal, search | `_archive/experiments/src/app/` |
| `components/admin`, `components/vendor` | `_archive/experiments/src/components/` |

Stub: `src/app/admin/[[...path]]/page.tsx` → `/platform?archived=1`.

**client-b2c addendum:** `src/app/u` → `_archive/client-b2c/src/app/u` (alias `/u` → client).

**extended addendum:** `src/app/supplier` (circular-hub root) → `_extended/supplier/`.

**Итого experiments:** ~134 файла.

## Не перенесено (следующие партии)

- `src/app/admin/**` — ops/admin (отдельное решение)
- investor/monetization strips — уже в `src/_archive/platform-core-legacy/` (Wave 7/9)

## Возврат

`git mv` обратно + снять alias `@/components/academy/*`.
