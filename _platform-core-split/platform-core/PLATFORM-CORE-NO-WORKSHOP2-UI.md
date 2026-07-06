# Platform Core — без Workshop2 UI (канон 2026-06)

## Принцип

**Runtime truth для агентов и пользователей Platform Core — только `/platform` и role core cabinets** (`/brand/core`, `/shop/core`, `/factory/production/core`, `/factory/supplier/core`).

Workshop2 (`/brand/production/workshop2`, `components/brand/production/*`, `lib/production/*`) — **legacy gray layer**:

- PG-таблицы и repositories остаются **за ports** (`lib/platform-core-ports/*`)
- UI Workshop2 **не индексируется** (`.cursorignore`) и **не является target href** в hub matrix
- Новый код Platform Core **не импортирует** `@/lib/production/*` в `app/platform`, `api/platform-core`, `components/platform` (кроме сжимающегося allowlist в carve-out test)

## Куда вести ссылки вместо Workshop2

| Было | Стало |
|------|--------|
| `/brand/production/workshop2?w2col=` | `/brand/core?pillar=development&collection=` |
| `workshop2ArticleHref(...)` в hub | `brandDevelopmentArticleHref(...)` |
| Обзор цепочки | `/platform?collection=` |
| Read API из UI | `GET /api/platform-core/articles/.../{bom-costing,rfq,qc,documents}` |

## Redirect (runtime)

`middleware.ts`: `/brand/production/workshop2` → `/brand/core?pillar=development&collection=…` (сохраняет `w2col`/`collection`).

## Что агент **не открывает**

```text
src/lib/production/          # ~4.8M — только ports/gateways
src/app/api/workshop2/       # кроме platform-core bridge (отдельная папка)
src/components/brand/production/
src/app/brand/production/
lib/routes.ts
DEEP-AUDIT-*, PERFORMANCE-UX-*
```

## Definition of Done (автономность)

1. Hub matrix / trail — **нет** href на `/brand/production/workshop2`
2. `npm run validate:platform-core-boundary` — OK
3. `npm test -- --testPathPattern=platform-core-hub-matrix` — OK
4. Задача из planner — scope только claimed pillar + один readiness section

## PG / backend (ещё не переименовано)

Имена таблиц `workshop2_*` и server repositories — **implementation detail** за `platform-core-ports`. Переименование схемы — отдельная фаза; UI и агентский контекст уже **Platform Core**, не Workshop2.

## Жёсткая изоляция (2026-06 пакет)

| Слой | Механизм |
|------|----------|
| UI hrefs | `coercePlatformCoreNativeHref()` в `rewriteHrefForDemo` при MODE=1 |
| Strict pages | `NEXT_PUBLIC_PLATFORM_CORE_STRICT=1` + `middleware.ts` → `/platform?archived=1` |
| Архив escape | `_archive/platform-core-legacy-escapes/` (не импортировать, `.cursorignore`) |
| Dev | `npm run dev:platform-core` из корня Projects |

PG-off: `PlatformCorePgUnavailablePanel` в role cabinet при pillar-snapshot 503.
