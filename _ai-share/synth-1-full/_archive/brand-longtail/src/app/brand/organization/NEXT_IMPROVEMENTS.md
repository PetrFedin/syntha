# Разделы организации — что улучшать дальше

## Уже сделано

- Общий период (7 дней / 30 дней / Календарь) в шапке, справа от «Организация › Центр управления»
- Один период управляет «Недавняя активность» и «Партнёрская экосистема»
- Индекс здоровья: кнопка «Обновить», скелетон при загрузке; при успешном ответе **`GET /api/v1/organization/health/{brandId}`** (`GenericResponse.data` = **bundle**: `metrics` + сырые `profile` / `dashboard` / `integrations`) хаб делает **один** запрос — метрики и шапка из одного снимка (`useOrganizationHealth`). Старый контракт (`data` = только массив метрик) или сбой — fallback: отдельные GET profile/dashboard/integrations и при необходимости локальный расчёт метрик.
- Шапка: название организации и юр.данные из API (profile); **ошибки и частичная загрузка** — сообщения и «Повторить»; пустой профиль не ломает UI (**Syntha HQ**); участники/онлайн из `brand/dashboard` (поля присутствия и зеркала) или из `user.team`, иначе демо
- Карточки модулей: целиком кликабельны, aria-label; подстановка на основе `brand/dashboard.moduleStats` — **`/brand/team`**, **`/brand/documents`** (На подписи из **`EDODocument`** draft/sent), **`/brand/compliance`** по **`markingSyncStatus`**; **`/brand/integrations`** — **X/Y** через **`count_configured_integrations_for_hub`** (числитель — env-подключённые клиенты, знаменатель **13** = 6 проводных + 7 каталога в **`app/integrations/hub_catalog.py`**)
- Партнёрская экосистема: блок «Партнёры по типам» / полоска роста из `dashboard.partnerEcosystem` (`growthByPeriod`, `countsPatchById`, при активной орг. ещё `businessProcessesPatchById` и `ecosystemBlocksPatchById` поверх `PARTNER_*` в page-data); при **`has_org_activity`** **`growthByPeriod`** считается на бэке из тех же счётчиков, что патчи процессов (не демо-полоска); демо **`PARTNER_GROWTH_BY_PERIOD`** + **`mergePartnerGrowthSlice`** вынесены в **`organization-partner-growth.ts`** (реэкспорт из `page-data` для совместимости)
- Доп. вынесение из `page-data` (узкий read / меньше контекста): **`organization-partner-counts.ts`**, **`organization-partner-processes.ts`**, **`organization-partner-ecosystem-blocks.ts`**, **`organization-partner-ecosystem-patches.ts`** (`pickPartnerEcosystemPatches`), **`organization-partner-role-meta.ts`**, **`organization-org-hub-static.ts`**, **`organization-section-meta.ts`**, **`organization-navigation-cards.ts`**, **`organization-recent-activity.ts`**, **`organization-health-metrics-demo.ts`**; **`page-data.ts`** — только barrel; тип **`HealthMetric`** (в т.ч. **`scoreSource`**) — в **`src/lib/brand/organization-types.ts`**, хук **`useOrganizationHealth`** импортирует тип оттуда
- Блок «Требует внимания»: … начальное состояние из `dashboard.attentionAlerts`; **снимок dismiss** — union **localStorage** и **`organizations.attention_dismiss_json`** (GET при загрузке, PATCH при «Устранить»), контракт `AttentionDismissRecord` (`certificateIds` / `profileIds` / `taskIds` / **`integrationIssueIds`**). SQL: **`scripts/sql/organization_attention_dismiss_json.sql`**
- Недавняя активность: демо-события с `dayOffset` и `getRecentActivities(сегодня)` — даты в актуальном окне 7/30 дней
- Рефакторинг UI обзора: секции вынесены в `_components/*`
- Бэкенд: `/api/v1/brand/profile`, `/api/v1/brand/dashboard`, `/api/v1/brand/integrations`; **`/api/v1/organization/health/{brand_id}`** — один снимок метрик + источников через `get_organization_health_bundle` (`organization_health_service`), без дублирующих параллельных запросов на фронте при актуальном контракте.

---

## Приоритет 1 — быстрые победы

### 1. ~~Недавняя активность: даты относительно «сегодня»~~ (сделано)

Реализовано через `RECENT_ACTIVITIES_BASE` + `dayOffset` и `getRecentActivities()` в эмбеде.

### 2. ~~Шапка: «24 участника» и «8 онлайн» из API~~ (сделано)

Бэкенд (`fetch_brand_dashboard_data`): **`participantsCount`** / **`teamMembersCount`** / **`membersCount`** — число активных **`User`** организации; при отсутствии записей — демо **24**. **`onlineCount`** / **`membersOnline`** — эвристика (~⅓ команды при участниках в БД; без участников — демо **8**). Фронт по-прежнему может подставить длину **`user.team`** как запасной источник.

Дальше при появлении телеметрии — реальный онлайн вместо эвристики.

### 3. ~~Ошибки и пустые состояния~~ (сделано)

- При ошибке загрузки profile — сообщение и «Повторить» в шапке; частичный сбой дашборда/интеграций при успешном профиле — предупреждение и «Повторить».
- Пустой или неполный profile не ломает шапку: название **`Syntha HQ`**, юр.блок по возможности из ответа.

---

## Приоритет 2 — данные с бэкенда

### 4. ~~Алерты «Требует внимания» из API~~ (сделано: локально + сервер)

Инициализация из `brand/dashboard.attentionAlerts` (`useAttentionAlerts`). **Dismiss:** union-id по каждому бренду: **localStorage** (`attention-dismiss-storage.ts`) и **`GET/PATCH /api/v1/brand/attention-dismiss/{brand_id}`** (JWT + проверка `organization_id`; данные в колонке **`organizations.attention_dismiss_json`**, патч скрипт **`scripts/sql/organization_attention_dismiss_json.sql`**). При включённом FastAPI клиент при загрузке хаба мержит ответ сервера с локальным и сохраняет объединённый снимок; при dismiss дополнительно шлёт PATCH.

**Сделано (хвост п.4):** **`integrationIssues`** — элементы **`{ id, message }`** (legacy-строки в payload → стабильный **`intg:auto:…`**); dismiss как у cert/profile/task (**`integrationIssueIds`** в PATCH + «Устранить» в UI). **Дальше по желанию:** отдавать id с бэка при сборке алертов из интеграций; soft-reset dismiss администратором.

### 5. Brand/dashboard — реальные агрегаты

**Частично:** в `app/api/v1/endpoints/brand.py` (`fetch_brand_dashboard_data`) сняты частые заглушки при «активной» организации (`orders` / `showrooms` / `members`):

| Поле                                    | Источник в БД                                                                                                                                                                                                          |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retailersCount`                        | UNION DISTINCT buyer из `orders` (`buyer_organization_id` \| `buyer_id`) и retailer id из **`Assortment.retailer_ids`** по `organization_id`; иначе при активной орг. — `max(orders, showrooms, 1)`, демо — как раньше |
| `collectionsCount`                      | `CollectionDrop` + `Lookbook` по `brand_id`                                                                                                                                                                            |
| `certsActive`                           | активные `EACCertificate`                                                                                                                                                                                              |
| `poInProduction`                        | заказы со статусом `confirmed`                                                                                                                                                                                         |
| `openB2bOrders`                         | только фактический pending (без «или 7» при активной орг.)                                                                                                                                                             |
| `markingSyncStatus` / `markingLastSync` | локальные **`ChestnyZnakCode`**: `COUNT`, последнее событие `max(coalesce(applied_at, created_at))`; без записей при активной орг. — warning                                                                           |
| `inventorySyncFailed30d`                | **`InventorySyncLog`** со статусом `failed`, `organization_id == brand_id`, за 30 дн.; без активной орг. — `0`                                                                                                         |
| `inventorySyncLastSuccessAt`            | **`max(timestamp)`** успешных синков по `organization_id`; ISO datetime или `null`                                                                                                                                     |

**Inventory sync:** в модели **`InventorySyncLog`** добавлено поле **`organization_id`** (nullable, индекс). SQL-патчи и порядок: корневой **`scripts/sql/README.md`**. Репозиторий: **`get_latest_logs_for_organization`**.

**CRPT / operational outbox (Python):** отдельная очередь операций ЧЗ не заведена — по-прежнему клиент **`CRPTClient`** и доменные события/outbox на стороне **`synth-1-full`** (см. `SOURCE_OF_TRUTH.md`, ops health). Следующий шаг при необходимости — таблица ретраев или зеркало статуса из шины.

Дальше: выравнивание retailer id с таблицей контрагентов при появлении модели.

### 6. Карточки модулей: цифры из API

Сделано: `dashboard.moduleStats` (ключ = `href`) + `mergeNavigationCardsWithModuleStats` на фронте. При активной организации карточка **`/brand/documents`** («На подписи») считается из **`EDODocument`** со статусами `draft`/`sent` (`documentsPendingSignature` в ответе дашборда для прозрачности). Карточка **`/brand/integrations`**: **X/Y** — числитель по **`is_configured`** у шести проводных клиентов (как в `/integrations/status`), знаменатель **13**: те же 6 + **7** слотов каталога из UI (`hub_catalog.CATALOG_ONLY_*`). Дальше — по мере появления клиентов переносить слоты из «только каталог» в wired; профиль с метриками заполненности при расширении моделей.

### 7. ~~Партнёрская экосистема: данные по периоду~~ (сделано: рост из счётчиков)

Ответ `brand/dashboard.partnerEcosystem`:

| Поле                         | Поведение при `has_org_activity`                                                                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `growthByPeriod`             | агрегаты 7d/30d из **`orders_*`**, **`pending*`**, **`po_confirmed`**, **`shipped_count`**, **`retailers_count`**, **`edo_signed`** (тот же слой данных, что патчи процессов; без отдельной таблицы истории) |
| `countsPatchById`            | патч карточки «Магазины» (`retailersCount`/orders)                                                                                                                                                           |
| `businessProcessesPatchById` | `b2b-orders`, `documents`, `shipments`: счётчики заказов/ЭДО из БД                                                                                                                                           |
| `ecosystemBlocksPatchById`   | `contracts-docs`, `logistics-shipments`, `partner-analytics`: метрики/алерты из тех же источников где возможно                                                                                               |

Остальные процессы и блоки — заготовки из `page-data` до появления доменных агрегатов (возвраты, задачи, финансы).

---

## Приоритет 3 — полировка

### 8. Доступность (a11y)

- **Сделано:** осмысленные `aria-label` у триггеров карточек «Требует внимания», кнопки «Устранить» (локальный dismiss), кнопок Help по блокам; у значков «требует внимания» и подсказок в «Разделы организации» и «Партнёрская экосистема»; у основных ссылок на счётчики партнёров и процессов; группа периода в шапке — **`radiogroup`** для 7/30 дней, связка **`aria-labelledby`** с подписью «Период:», календарь без ложного **`aria-expanded`**, подпись контента календаря; фильтр участников в «Недавняя активность» — **`radiogroup`** и **`role="radio"`** / **`aria-checked`**; снижение дублей озвучки — тултипы на бейджах предупреждений с **`aria-hidden`** (подпись только **`aria-label`**), у фильтра участников тултип убран при сохранении **`aria-label`**.
- **Дальше:** при необходимости полный аудит таб-порядка (горизонтальные полосы карточек, вложенные попапы).

### 9. Скелетоны при загрузке

- **Сделано:** пока `healthLoading`, блоки «Партнёрская экосистема» и «Разделы организации» показывают полоски-карточки вместо статических данных из `page-data`; при подгрузке JS-чанка хаба — расширенный placeholder (шапка + полосы + скелетон модулей); блок **«Результаты бренда по ролям»** — `OrgHubRoleReportsSkeleton` при `healthLoading`.
- **Дальше:** при появлении удалённых данных в отчётах по ролям — расширить скелетон под фактическую раскладку.

### 10. ~~Organization health с бэкенда~~ (снимок без дублей — сделано)

**Контракт:** `GET /api/v1/organization/health/{brand_id}` → `GenericResponse.data` — объект **`{ metrics, profile, dashboard, integrations }`**: `metrics` — массив в форме `HealthMetric`; остальное — те же полезные нагрузки, что отдельные brand-эндпоинты (один проход на бэкенде: `get_organization_health_bundle`). Обратная совместимость: если задеплоен только массив в `data`, фронт как раньше подтягивает три GET и подставляет метрики из массива.

**Фронт:** `useOrganizationHealth` — при bundle с непустым `metrics` заполняет индекс и шапку без параллельных profile/dashboard/integrations; иначе — три запроса и/или локальный расчёт метрик.

**Сделано (хвост п.10):** `useOrganizationHealth` — **stale-кэш 120s** + **`refetch()` принудительно обновляет снимок**; метрики с **`scoreSource`** (подписка — **placeholder**, не в **overallHealth**); «Безопасность» / «Документы» / «Настройки» — из **dashboard/profile** на бэке (`organization_health_service`) и тем же смыслом в клиентском fallback. Мок **`/brand/dashboard/`** в **`lib/api/mock-fallbacks.ts`** выровнен с контрактом (**`_source`**, присутствие, **inventory sync**, пустые **attentionAlerts**).

---

Рекомендуемый следующий шаг: operational **CRPT**-очередь в Python при контракте; SQL на живых БД (**inventory_sync_logs**, **organization_attention_dismiss_json**); сплит топ-TSX; `raw-chunk-*` / типы по волне из плана фазы 2.

---

## Фаза 2 — общий бэклог (чеклисты, правила агентов)

Зафиксировано в **`docs/PLAN-phase2-repo-and-hub.md`**: гигиена репо, ~~п.7~~ / ~~п.4 (хвост)~~, сплит топ-TSX, ~~MOCK вынесен~~ / ~~health-кэш + scoreSource~~, `raw-chunk-*`, SQL/CRPT; правила **узкого read** и **scope по каталогу** для ревью.
