# Platform Core — изолированные legacy-escape (не удалять)

Сюда складываются **снимки** href-резолверов и UI-паттернов, которые Platform Core **больше не использует напрямую** в runtime.

## Правила

1. **Не импортировать** из `src/app/**`, `components/platform/**`, `lib/platform-core-*` — только справочник и история.
2. Активный код использует `src/lib/platform-core-native-href.ts` и `src/lib/platform-core-strict-routes.ts`.
3. Каталог `.cursorignore` — агенты не тратят токены на этот каталог при обычной работе.
4. Физические page-split legacy остаются в `_archive/platform-core-legacy/app/…` (см. sibling README).

## Что здесь лежит

| Файл | Назначение |
|------|------------|
| `lib/legacy-href-catalog.ts` | Замороженная таблица «было → стало» для audit/sections и peer strips |

## Definition of Done (изоляция)

- `coercePlatformCoreNativeHref()` при `NEXT_PUBLIC_PLATFORM_CORE_MODE=1`
- Strict: `NEXT_PUBLIC_PLATFORM_CORE_STRICT=1` + `npm run dev:platform-core`
- `npm run validate:platform-core-boundary` — OK
