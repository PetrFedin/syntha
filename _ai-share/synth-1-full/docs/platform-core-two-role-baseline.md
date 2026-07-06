# Platform Core · Two-Role Baseline (Article Spine v1)

## Канон

**Публичные роли v1:** только `brand` и `shop`.

| Роль | Фокус |
|------|--------|
| **Бренд** | Артикулы (ТЗ/закупка) → сэмпл → коллекции → приём опта → **исполнение заказа** (PO, цех, сырьё) → связь |
| **Магазин** | Витрина/лайншит → матрица и заказ → трекинг → связь |

**Manufacturer / supplier** остаются backend-акторами цепочки (handoff, PO, procurement). В UI по умолчанию **не скрыты как код**, но **не показываются** как отдельные кабинеты на `/platform`.

## Флаг расширения

```bash
# .env.local — показать 4 роли на hub и в cross-role
NEXT_PUBLIC_PC_EXTENDED_ROLES=1
```

E2e extended suite (требует флаг на dev-сервере):

```bash
PC_EXTENDED_ROLES_E2E=1 npm run test:e2e:core -- e2e/core-249-extended-roles-golden.spec.ts
```

## Где фильтруется

| Модуль | Поведение |
|--------|-----------|
| `getPlatformCoreHubRowsForUi()` | Hub quick entry, role blocks, readiness matrix |
| `getPillarCrossRolePeersForDemo()` | Peer-ссылки без mfr/sup в baseline |
| `buildPlatformCoreGoldenCrossRoleStopsForUi()` | Golden e2e brand↔shop (9 stops) |
| `buildPlatformCoreGoldenCrossRoleStops()` | Полный spine 12 stops (audit / extended) |

## Столпы (UI copy)

- Brand: Разработка → Коллекция → Оптовый заказ → **Исполнение** → Связь
- Shop: Коллекция/витрина → Оптовый заказ → (трекинг в CO) → Связь

См. `src/lib/platform-core-article-spine.ts`, `PLATFORM_CORE_HUB_HEADING`.
