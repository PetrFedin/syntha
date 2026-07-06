# Article Spine — scope Platform Core (v1)

Канон кода: `_ai-share/synth-1-full/src/lib/platform-core-article-spine.ts`

## Суть

**Артикул** — единый объект сквозь всю платформу. **Коллекция** — вторичная группировка готовых сэмплов (несколько коллекций в сезон/год — норма).

## Два пути к сэмплу

| Режим | Смысл |
|-------|--------|
| `full_production` | ТЗ → цех → сырьё → образец |
| `buy_or_import` | Закупка/импорт; полные характеристики без полного производственного цикла |

## Spine (7 этапов)

1. Создание артикула (brand · development)
2. ТЗ и досье
3. Образец
4. Коллекция / витрина (brand · sample_collection)
5. Оптовый заказ (shop · collection_order)
6. Исполнение (manufacturer/supplier · order_production)
7. Связь и календарь (comms — чат, заметки, сроки)

## Что остаётся в Platform Core hub

- W2 hub + dossier, BOM, RFQ, материалы, PG sync
- Linesheets, showroom, publish
- CO: registry, detail, matrix/checkout (shop), handoff, production orders, procurement
- Comms: chat, calendar, notes

## Что скрыто из hub (archive list)

См. `ARTICLE_SPINE_ARCHIVE_SECTION_IDS` — WSSI, CRM, agent-rep, pricelist/pack/landed (brand CO), inventory-ops, working-order, shop partners и т.д.

Маршруты **не удалены** — только фильтр навигации при `isPlatformCoreArticleSpineMode()`.

Отключить фильтр: `NEXT_PUBLIC_PC_ARTICLE_SPINE_OFF=1`

## Следующие волны

- **Wave 6:** golden e2e от brand-dev-w2-hub (не от shop matrix)
- **Wave 7:** физический перенос legacy retail / CRM UI в `src/_archive/`
- **Wave 8:** PG SoT для артикула (режим full_production vs buy_or_import)
