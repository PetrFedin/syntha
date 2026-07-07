# brand-public archive — batch 10

**Date:** 2026-07 · **Status:** moved

## Перенесено

| From | To |
|------|-----|
| `src/app/b/**` (39 файлов) | `_archive/brand-public/src/app/b/` |

Marketing-профили бренда (`/b/[brandId]`, runway tab) — вне wholesale spine v1.

## Stub (gate)

- `src/app/b/[brandId]/page.tsx` — Platform Core → `/shop/b2b/showroom?brand=…`; иначе → `/platform?archived=brand-public`
- `src/app/b/[brandId]/runway/page.tsx` — redirect на gate

Home/brand-card ссылки на `/b/*` в strict mode ведут на оптовую витрину.

## Alias

`tsconfig`: `@/app/b/*` → stub first, затем `_archive/brand-public`.

## Возврат

`git mv` обратно + удалить stubs.
