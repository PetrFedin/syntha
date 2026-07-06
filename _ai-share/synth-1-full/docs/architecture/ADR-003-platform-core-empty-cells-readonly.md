# ADR-003: Platform Core empty cells — intentional read-only peer insight

## Статус
**Принято (stub)** — wave ZA · core-242

## Контекст
В матрице Platform Core (5×4) пять ячеек **неактивны** по доменной роли, но показывают **peer-insight** панели: магазин × development; производство × sample_collection/collection_order; поставщик × sample_collection/collection_order.

Ранее пункты «нет write surface» попадали в audit `bad`. Это не дефекты — осознанный read-only контур до отдельного ADR на расширение роли.

## Решение
1. Пустые ячейки остаются **read-only insight** (status mirror, peer strips, preview dialogs).
2. Бывшие `bad` переносятся в **`adrBacklog`** с ссылкой на ADR-003.
3. SoT в коде: `src/lib/platform/wave-za-adr-readonly-backlog.ts`, audit: `empty-cells-audit.ts`.

## Якоря (SS27)
| Роль | Столп | Панель | Ограничение |
|------|-------|--------|-------------|
| shop | development | ShopDevelopmentBridge | Нет W2 write; preview + wishlist |
| manufacturer | sample_collection | MfrEmpty SC status | Нет brand publish UI |
| manufacturer | collection_order | MfrEmpty CO handoff | Нет B2B checkout |
| supplier | sample_collection | Sup BOM preview | Нет create BOM |
| supplier | collection_order | Sup CO forecast | Нет wholesale order create |

## Последствия
- Planner не должен auto-open fix на эти пункты.
- Расширение write surface — новый ADR или дополнение ADR-003.

## Ссылки
- `wave-za-adr-readonly-backlog.ts` · e2e `core-242-wave-za-adr.spec.ts`
