# Межролевые цепочки и проверки (ядро B2B)

Документ фиксирует **какие функции связывают кабинеты** (бренд, магазин, дистрибутор, производство, поставщик), **где первичный UI**, ожидаемое **зеркалирование событий** и что менять при доработках. Имеет силу вместе с `CABINET-INTERACTION-ARCHITECTURE.md`. Полная **сводка фаз, ядра `syntha-cores` по ролям и реестр расхождений/заглушек** — `CORE_OPERATING_CHAIN.md`. **Реестр команд проверки, имён Playwright/Jest-тестов и пробелов** — §5.

## 1. Единый идентификатор «Связь» (`comms`)

У **магазина**, **дистрибутора**, **производства** и **поставщика** группа верхнего уровня с календарём и сообщениями имеет **`id: 'comms'`** (подпись «Связь»), как у бренда. Это упрощает сопоставление в матрицах ролей и обсуждения UX.

**Platform Core (5 столпов):** разделы **чата, календаря и групп по разделам** существуют **только** в ячейке `× comms` (`SECTION_AUDIT` id `{role}-cm-*`). В остальных столпах — **context-strip deep-link** (`?order=`, `?article=`, `section=`) в столп Связь; отдельных audit-разделов «Чат»/«Календарь» там быть не должно. Канон и CI-guard: `platform-core-comms-canon.ts`, ADR-002 Appendix B.

**Группы и auto-контекст:** треды/события преимущественно привязываются к контексту работы (столп + section id + entity id). Свободные треды вне активных столпов допустимы; целевое состояние — auto-группы из PG registry/chain, не seed file.

При изменении навигации: `npm run validate:cabinet-nav` (роль-хаб, `comms`, ядра `syntha-cores`, **строковые href** в данных навигации пяти кабинетов).

**Календарь бренда и ритейл:** в ядре календарь открывается с слоями `tasks,orders,production` (сквозной контекст заказа ↔ производство). Прямые входы «выставки / запись на встречи» со стороны магазина перенесены в архив бренда (`buyer-retail-mirror`), чтобы не смешивать столпы «Связь» с дублирующими ярлыками чужого кабинета.

**Календарь в кабинете производства** (`factory-navigation`): те же слои `tasks,orders,production` — согласованность с брендом. **У поставщика** в `comms` — `tasks,orders,logistics` (закупка и поставки сырья без дублирования розничных слоёв).

## 2. Матрица «поток → кто участвует»

Условные обозначения: **●** первичный кабинет действия; **◐** видит/отвечает; **—** не в ядре сценария.

| Поток                                           | Бренд                                       | Магазин                           | Дистрибутор                                 | Производство                                                                             | Поставщик                 |
| ----------------------------------------------- | ------------------------------------------- | --------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------- |
| **Чаты / треды** по заказу, коллекции, спору    | ● Лента и контекст в сообщениях             | ◐ Тот же тред при участии байера  | ◐ При подключении к сети                    | ◐ PO/QC-треды                                                                            | ◐ RFQ/поставка материалов |
| **Задачи / дедлайны** (календарь)               | ● Слои коллекции, производство, compliance  | ◐ События закупки, отгрузки       | ◐ Оптовые слоты                             | ◐ Этапы цеха                                                                             | ◐ Поставки сырья          |
| **B2B заказ** (создание → подтверждение)        | ● Заказы B2B, правила, ассортимент          | ● Создание/черновики (ритейл)     | ● Те же маршруты опта при роли дистрибутора | ◐ Не дублируем отдельной группой «Заказы» в factory — исполнение через PO в производстве | —                         |
| **Передача в производство** (B2B → PO / выпуск) | ● Производство, матрица SKU (внутри модуля) | ◐ Статус через заказ              | ◐ Аналогично                                | ● Операции, PO, цех                                                                      | —                         |
| **Материалы / RFQ**                             | ● Поставщики, RFQ, склад                    | —                                 | —                                           | ◐ Резерв/снятие                                                                          | ● Каталог, RFQ, VMI       |
| **Логистика / отгрузка**                        | ● Центр логистики, склад, КИЗ               | ◐ Трекинг в опте                  | ◐ Карта поставок                            | ◐ Отгрузка партий                                                                        | ◐ Поставка на фабрику     |
| **Комплаенс / маркировка**                      | ● Склад, документооборот, привязка к заказу | ◐ Если затрагивает выдачу в точке | ◐ Цепочка опта                              | ◐ Партии                                                                                 | ◐ Сертификаты материала   |

## 3. Ожидаемое поведение при правках (контракт разработки)

1. **Новый межролевой сценарий** (например «заказ → автоматическая задача в календаре цеха»): добавить строку в таблицу §2 или подпункт; указать **идентификатор сущности** (orderId, poId, threadId); обновить этот файл в том же PR.
2. **Изменение сайдбара** (`clusterId`, `id` группы): проверить, что не ломается смысл «Связь» (`comms`) и не дублируется чужой контур; запустить проверки из §1.
3. **Чаты**: привязка к **контексту** (заказ, коллекция, спор), а не к «профилю вообще»; второй участник видит тред только при membership в этом контексте (политика RBAC — не в этом файле, но сценарий здесь).
4. **Задачи**: источник события должен быть тем же, что и в календаре другой роли (общий `orderId` / `collectionId` в payload), иначе «связь только по функции» не выполняется.

## 4. Цепочки в рамках отобранного ядра (кратко)

1. **Байер ↔ Бренд (опт)**  
   Магазин/дистрибутор: закупка у брендов → заказы B2B. Бренд: те же заказы, согласование, передача в производство. Связь: `comms` + ссылки из карточки заказа.

2. **Бренд ↔ Производство**  
   PO, этапы, QC. Без отдельной группы «Заказы B2B» в factory-сайдбаре — исполнение в «Производство» и связанных экранах.

3. **Бренд ↔ Поставщик**  
   RFQ, каталог материалов, резервы. Поставщик не ведёт B2B-витрину магазина; связь через материалы и сообщения.

4. **Магазин ↔ Дистрибутор**  
   Только в сценариях сети (передача опта, общие контрагенты-бренды). Не смешивать с цехом напрямую.

## 5. Проверки: документация, статика, юниты, E2E и пробелы

Документы §1–§4 фиксируют **намерение и смысл** связей. Они **не доказывают**, что конкретное действие пользователя (клик, ввод, сохранение) в рантайме порождает ожидаемое **событие домена**, **запись** или **видимость у второй роли**. Такое доказательство даёт только автоматический тест (или ручная приёмка по сценарию с фиксацией шагов).

Ниже — **пирамида проверок** репозитория `synth-1-full`, **точные идентификаторы** существующих Playwright/Jest-тестов (имена `test('…')` — стабильные якоря для ссылок в PR и для колонки «тестовый id»), перечень **`data-testid`**, задействованных в ключевых UI-сценариях, и **матрица пробелов**: что пока не покрыто сквозным E2E по доменным событиям между кабинетами.

### 5.1. Уровни и границы ответственности

| Уровень                                                                       | Что гарантирует                                                                    | Чего не гарантирует                                                          |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Документы** (`CROSS_ROLE_FLOWS.md`, `CABINET-INTERACTION-ARCHITECTURE.md`)  | Согласованность смысла, матрица ролей, правила правок                              | Исполнение в браузере, побочные эффекты API                                  |
| **Статика навигации**                                                         | Инварианты `comms`, матрица роль↔хаб (`validate:cabinet-nav`)                      | Поведение экранов после перехода                                             |
| **Контрактные guard-ы** (`npm run check:contracts`, см. `SOURCE_OF_TRUTH.md`) | Границы модулей, health-контракт ops (при настроенном URL)                         | Полный пользовательский сценарий                                             |
| **Jest** (`test:contracts:b2b` и смежные `**/__tests__/**`)                   | Outbox, шина событий, разбор health, PATCH↔GET для API в изоляции                  | Рендер React, cookie-сессии, кросс-кабинет в одном прогоне браузера          |
| **Playwright `test:e2e:api`**                                                 | HTTP-контракты, узкий UI (create-order export), сегменты навигации, загрузка хабов | Не каждая кнопка каждого экрана; не каждый тип `DomainEvent` у «второй» роли |
| **Playwright `test:e2e:verification`**                                        | Демо-сквозняк инвентаря Brand↔Shop, ссылки, upload CSV                             | Не PO/RFQ/мульти-тенант чат                                                  |
| **Будущие E2E** (строки с «—» в §5.6)                                         | «Действие в кабинете A → событие/outbox → отражение в B»                           | Пока вносить в таблицу §5.6 по мере появления `test('…')`                    |

**Проверка «корректировка → изменение в рантайме»** в текущем коде реализована так:

- **Сохранение с последующим чтением** — `PATCH` operational order → `GET` detail с тем же `id` (**Playwright**, см. §5.3).
- **Идемпотентный экспорт заказа** — `POST /api/b2b/export-order` с тем же `Idempotency-Key` → тот же `exportJobId` (**Playwright** + **Jest** в контрактах интеграций).
- **UI submit экспорта** — клик по `shop-b2b-platform-export-submit` → ожидание `POST /api/b2b/export-order` → видимость `exportJobId` в `shop-b2b-platform-export-result` (**Playwright**).
- **Шина и outbox** — снимок в `GET /api/ops/domain-events/health` (`bus`, `outbox`) — **Playwright** (контракт тела и заголовков) + **Jest** (`domain-events-health`, `domain-event-outbox`).
- **Сквозной инвентарь** — клик по ссылкам, `POST` stock-upload после выбора файла — **`test:e2e:verification`** (не входит в `test:e2e:api`).
- **Workflow LIVE** (`/api/processes`, определения и runtime) — **файловое хранилище** на одном инстансе: `.data/workflow-store.json`, код `src/lib/server/process-workflow-store.ts`; отключение записи: `WORKFLOW_STORE_DISABLED=1`. Ограничения кластера и P1 (БД) — `CORE_OPERATING_CHAIN.md` §5–6, `CORE_PRODUCT_DEEP_PLAN.md`. В **`test:e2e:api`** — **`e2e/processes-workflow-api.spec.ts`**: `GET` списка, **`POST` → `GET` → `PUT` → `GET`** (см. §5.4).

Полная **нумерация каждой кнопки** приложения в этом файле не ведётся (это сотни элементов); вместо этого — **классы действий** (§5.5) и **привязка к строкам матрицы §2** (§5.6).

### 5.2. Статика и навигация

| Команда                                          | Назначение                                                                                                                        |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `npm run validate:cabinet-nav`                   | матрица ролей + `comms` + `syntha-core-groups` + **`validate:cabinet-nav-hrefs`** (относительные пути, без пустых href)           |
| `npm run check:contracts` / `check:contracts:ci` | Легаси API, границы интеграций/AI, parity health-runner, опционально live-probe `domain-events` health (см. `SOURCE_OF_TRUTH.md`) |

### 5.3. Jest: домен, outbox, health (агрегат `npm run test:contracts:b2b`)

Один прогон (список из `package.json`):

1. `src/lib/b2b/integrations/__tests__/b2b-integration-public-response.schema.test.ts`
2. `src/lib/b2b/integrations/__tests__/integration-export-persistence.test.ts`
3. `src/lib/b2b/integrations/__tests__/b2b-export-domain-event.test.ts`
4. `src/lib/order/__tests__/domain-event-outbox.test.ts`
5. `src/lib/order/__tests__/domain-events-health.test.ts`
6. `src/lib/server/__tests__/domain-event-outbox-cron-auth.test.ts`
7. `src/lib/server/__tests__/domain-events-health.test.ts`
8. `src/lib/server/__tests__/domain-events-health-route.test.ts`
9. `src/lib/use-cases/b2b/__tests__/load-integrations-dashboard.test.ts`
10. `src/lib/marketing/__tests__/crowd-sentiment.test.ts` (подписка на `eventBus`)

Дополнительно вне этого агрегата полезны **`src/lib/server/__tests__/domain-events-health-check-output.test.ts`**, **`domain-events-health-check-config.test.ts`** — для формата логов CI и конфига health-check.

### 5.4. Playwright: `npm run test:e2e:api` (порядок файлов = порядок в `package.json`)

Сервер: **`npm run dev:e2e`** (`127.0.0.1:3123`). Для health нужен **`DOMAIN_EVENT_HEALTH_SECRET`** (в скрипте задан `e2e-domain-health-secret`).

| №   | Файл                                              | `test.describe`                               | Точное имя `test('…')`                                                                | Что проверяет                                                                                                                                                                                                                                                                        |
| --- | ------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `e2e/domain-events-health-api.spec.ts`            | `Domain events ops health API`                | `GET /api/ops/domain-events/health requires auth and returns contract payload`        | 401 без Bearer; 200 с секретом; заголовки `x-request-id`, `x-domain-events-health-contract-version: v1`; JSON: `contractVersion`, `ok`, `status`, `summaryCode`, `summary`, массивы `alerts`/`degradedReasons`/`recommendations`, `thresholds`, **`bus`**, **`outbox`**, `requestId` |
| 2   | `e2e/processes-workflow-api.spec.ts`              | `Workflow processes API`                      | `GET /api/processes returns non-empty merged list`                                    | Список процессов (merged), непустой                                                                                                                                                                                                                                                  |
| 2   | ↑                                                 | ↑                                             | `POST custom process → GET → PUT → GET roundtrip`                                     | **POST 201** custom → **GET** → **PUT** → **GET** (имя обновлено)                                                                                                                                                                                                                    |
| 3   | `e2e/b2b-operational-orders-api.spec.ts`          | `B2B operational orders API`                  | `GET /api/b2b/operational-orders → jsonOk, meta, непустой список`                     | Список операционных заказов                                                                                                                                                                                                                                                          |
| 3   | ↑                                                 | ↑                                             | `Tenant/Owner filtering: Brand sees only its orders`                                  | Изоляция тенанта Brand                                                                                                                                                                                                                                                               |
| 3   | ↑                                                 | ↑                                             | `Tenant/Owner filtering: Shop sees only its orders`                                   | Изоляция тенанта Shop                                                                                                                                                                                                                                                                |
| 3   | ↑                                                 | ↑                                             | `GET /api/b2b/operational-orders/:id → jsonOk + order (id from list)`                 | Чтение по id                                                                                                                                                                                                                                                                         |
| 3   | ↑                                                 | ↑                                             | `GET /api/b2b/operational-orders/unknown → 404 jsonError`                             | Ошибка 404                                                                                                                                                                                                                                                                           |
| 3   | ↑                                                 | ↑                                             | `GET /api/b2b/v1/operational-orders → wholesaleOrderId + apiVersion`                  | Версионированный список                                                                                                                                                                                                                                                              |
| 3   | ↑                                                 | ↑                                             | `GET /api/b2b/v1/operational-orders/:id → detail DTO (id from list)`                  | Версионированное чтение                                                                                                                                                                                                                                                              |
| 3   | ↑                                                 | ↑                                             | `PATCH v1 operational-note → сохранение и отражение в GET detail`                     | **Мутация + повторное чтение**                                                                                                                                                                                                                                                       |
| 3   | ↑                                                 | ↑                                             | `PATCH v1 internalNote → отражение в GET detail (internalNotes)`                      | **Мутация внутренней заметки**                                                                                                                                                                                                                                                       |
| 4   | `e2e/b2b-integrations-dashboard-api.spec.ts`      | `B2B integrations dashboard API`              | `GET /api/b2b/integrations/dashboard → integrations + catalog + assembledAt`          | Дашборд интеграций                                                                                                                                                                                                                                                                   |
| 4   | ↑                                                 | ↑                                             | `GET /api/b2b/integrations/dashboard?brandId=demo → brandId в catalog`                | Фильтр brandId                                                                                                                                                                                                                                                                       |
| 5   | `e2e/b2b-export-order-api.spec.ts`                | `B2B export-order API`                        | `POST platform export and idempotent replay share exportJobId`                        | Идемпотентность, стабильный `exportJobId`                                                                                                                                                                                                                                            |
| 5   | ↑                                                 | ↑                                             | `POST export-order/retry after simulateReject can accept`                             | Повтор после отказа                                                                                                                                                                                                                                                                  |
| 6   | `e2e/b2b-create-order-platform-export-ui.spec.ts` | `B2B create-order platform export UI`         | `platform export card shows exportJobId after submit`                                 | UI: заполнение `shop-b2b-platform-export-order-id`, клик **`shop-b2b-platform-export-submit`**, ожидание **`POST /api/b2b/export-order`**, проверка **`shop-b2b-platform-export-result`** (текст `exportJobId`, заказ)                                                               |
| 7   | `e2e/b2b-catalog.spec.ts`                         | `B2B Catalog`                                 | `catalog loads and search filters products`                                           | Загрузка каталога B2B                                                                                                                                                                                                                                                                |
| 8   | `e2e/production.spec.ts`                          | `Production`                                  | `production page loads`                                                               | `/factory/production` без 5xx                                                                                                                                                                                                                                                        |
| 8   | ↑                                                 | ↑                                             | `production page has content`                                                         | Контент страницы                                                                                                                                                                                                                                                                     |
| 9   | `e2e/shop-erp-analytics-strip.spec.ts`            | `Shop ERP sync API + analytics segment strip` | `GET /api/shop/erp-sync-status returns JSON with lastSuccessAt`                       | Контракт ERP; опционально поле **`domainOutboxPending`**                                                                                                                                                                                                                             |
| 9   | ↑                                                 | ↑                                             | `segment nav visible on retail and B2B analytics URLs`                                | Видимость **`shop-analytics-segment-nav`** и ссылок-сегментов на множестве URL (`data-testid` перечислены в исходнике)                                                                                                                                                               |
| 9   | ↑                                                 | ↑                                             | `operational B2B: ERP strip + cross-links on orders, tracking, claims, replenishment` | Навигационные кресты ритейл↔B2B на экранах заказов/трекинга/претензий/пополнения                                                                                                                                                                                                     |

**Имена тестов** в первой колонке «Точное имя» можно копировать в PR как **идентификатор сценария**; при добавлении нового теста — добавить строку в эту таблицу.

### 5.5. Другие npm-цели Playwright (вне `test:e2e:api`)

| Скрипт                          | Файлы                                 | Назначение                                                                                                         |
| ------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `npm run test:e2e:verification` | `e2e/unified-ecosystem-smoke.spec.ts` | Демо-сквозняк: инвентарь Brand↔Shop (serial), ритейл+аналитика, оболочки `/brand/logistics`, `/brand/integrations` |
| `npm run test:e2e:cabinet-hubs` | `e2e/cabinet-hubs-smoke.spec.ts`      | Для каждого пути из `CABINET_HUBS`: ответ не 5xx, URL, видимость `main`                                            |
| `npm run test:e2e:light`        | `e2e/smoke.spec.ts`                   | Короткий smoke страниц                                                                                             |
| `npm run test:e2e`              | все `e2e/*.spec.ts` (полный набор)    | Полный прогон                                                                                                      |

**`cabinet-hubs-smoke`**: генерируемые имена `cabinet hub: <name> (<path>)` для путей `/admin`, `/shop`, `/brand`, `/client`, `/distributor`, `/factory/production`, `/factory/supplier`.

**`unified-ecosystem-smoke`** (точные `test` внутри `describe`):

- `Shop inventory contour (serial)` → `Brand ↔ Shop inventory cross-links (stock contour)`; `Brand logistics hub → Shop stock upload link`; `Shop inventory shell` (включая **`shop-stock-sync-open-excel`**, диалог, **`POST /api/shop/inventory/stock-upload`**).
- `Shop retail hub + analytics segment + margin hub shell`
- `Brand logistics hub shell (/brand/logistics)`
- `Brand integrations hub shell (/brand/integrations)`

### 5.6. Таксономия действий UI и уровень проверки «изменение зафиксировано»

| Класс действия                               | Примеры в продукте                                                                 | Как доказать изменение в рантайме                                                                                                                                     | Сейчас в репозитории                                                                                                                                                                      |
| -------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Submit / RPC**                             | Отправка формы, `POST` export                                                      | `waitForResponse` + assert тела/виджета результата                                                                                                                    | `b2b-create-order-platform-export-ui`, `b2b-export-order-api`                                                                                                                             |
| **Статус заказа (бренд → общий read-model)** | `PATCH` v1 `/operational-orders/:id/status` (только brand), GET list/detail у shop | `PATCH` → `GET` detail/list с тем же `status`                                                                                                                         | `b2b-operational-orders-api` — `PATCH v1 status (brand) → GET detail+list (shop) show same status`                                                                                        |
| **Сохранение поля (API)**                    | Operational note, internal note                                                    | `PATCH` → `GET` того же ресурса                                                                                                                                       | `b2b-operational-orders-api` (два PATCH-теста)                                                                                                                                            |
| **Переход по связи**                         | Ссылка Brand→Shop инвентарь                                                        | `waitForURL` / assert `href` + видимость целевой страницы                                                                                                             | `unified-ecosystem-smoke`, `shop-erp-analytics-strip` (сегменты)                                                                                                                          |
| **Переключение среза аналитики**             | Тот же layout, другой `data-testid` ссылки                                         | Видимость полосы `shop-analytics-segment-nav` + пар ссылок                                                                                                            | `shop-erp-analytics-strip`                                                                                                                                                                |
| **Загрузка файла**                           | CSV остатков                                                                       | `setInputFiles` + `waitForResponse` POST + assert текста «последний принятый файл»                                                                                    | `unified-ecosystem-smoke` (`Shop inventory shell`)                                                                                                                                        |
| **Состояние шины / outbox**                  | Нет UI-кнопки; снимок для ops                                                      | Контракт JSON health                                                                                                                                                  | `domain-events-health-api` + Jest                                                                                                                                                         |
| **Схема LIVE-процесса (бренд)**              | Редактор этапов на `/brand/process/.../live`                                       | `PUT /api/processes/:id` → тот же контент в `GET` (PG `platform_core_live_workflow_store` или `.data/workflow-store.json`; `WORKFLOW_STORE_DISABLED=1` — без persist) | **`processes-workflow-api`** (`POST`→`GET`→`PUT`→`GET`); UI-редактор без отдельного Playwright                                                                                            |
| **Чат / тред / календарь по контексту**      | События в `comms`                                                                  | Сквозной сценарий с двумя сессиями или PG contextual API + UI poll                                                                                                    | **Частично:** `core-02` (`столп 5: messages → calendar`, `W2: отправить ТЗ в чат артикула`), `core-40`, `integrations-spine-golden-path`; dedicated dual-session в `test:e2e:api` — **—** |
| **PO / выпуск на фабрике**                   | Смена статуса PO, очередь handoff                                                  | `POST confirm-production-handoff` → экран `#handoff-queue` + PO в materials procurement                                                                               | **Частично:** `core-02` (`цепочка: B2B confirm → production handoff queue`, `hub: матрица → заказ, досье, handoff`, `досье цеха: столп 4`); полный PO status PATCH + второй актор — **—** |
| **RFQ поставщика**                           | Ответ на RFQ, material-request                                                     | PATCH material-request → отражение у бренда/цеха                                                                                                                      | **Частично:** `core-02` (`поставщик: закупка — PATCH material-request`); полный RFQ create→brand — **—**                                                                                  |

Строки с **—** — кандидаты на будущие идентификаторы `test('…')`; при добавлении теста внести **файл + полное имя теста** в §5.4 или подтаблицу ниже.

### 5.7. Матрица: строка §2 ↔ автотесты ↔ пробел

| Строка §2 (поток)                    | Покрытие сейчас                                                                                                                                      | Пробел / следующий шаг                                                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Чаты / треды                         | `core-02` comms pillar, `core-40` four roles, contextual API в checkout helpers                                                                      | Dedicated dual-session API e2e в `test:e2e:api`                                                                                     |
| Задачи / дедлайны (календарь)        | `core-02` calendar pillar, PG calendar tasks migration `030`                                                                                         | Событие `calendar` + отображение у второй роли                                                                                      |
| B2B заказ (создание → подтверждение) | operational orders list/detail, export API/UI, catalog; **PATCH v1 status** (бренд) → тот же статус в GET у ритейлера (`b2b-operational-orders-api`) | Полное зеркалирование в **UI** второй стороны без API — по-прежнему пробел; сквозная проверка статуса на уровне **HTTP v1** закрыта |
| Передача в производство              | `core-02` handoff queue + factory dossier + supplier procurement                                                                                     | PO status PATCH + событие outbox + экран второй роли без API-only assert                                                            |
| Материалы / RFQ                      | `core-02` supplier PATCH material-request, BOM procurement view                                                                                      | RFQ create → brand inbox                                                                                                            |
| Логистика / отгрузка                 | unified smoke (ссылки), ERP strip                                                                                                                    | Трекинг номера отправления кросс-роль                                                                                               |
| Комплаенс / маркировка               | —                                                                                                                                                    | КИЗ/сертификат цепочка                                                                                                              |

### 5.8. Шаблон записи нового тестового id в PR

Чтобы §5 оставалась **единым реестром**, при добавлении теста копировать блок:

```text
Файл: e2e/<name>.spec.ts
describe: <строка test.describe>
test: <строка в test('…')>
Связь с §2: <имя потока или «инфра: health/outbox»>
data-testid (если UI): <список>
```

И добавить строку в **§5.4** (для `test:e2e:api`) или в **§5.5** (для остальных скриптов).

### 5.9. Чеклист перед релизом (навигация + межролевые фичи + тесты)

- [ ] Обновлены `CROSS_ROLE_FLOWS.md` или `CABINET-INTERACTION-ARCHITECTURE.md` при смене сценария или столбца сайдбара.
- [ ] `npm run validate:cabinet-nav` — OK.
- [ ] Для новых сущностей: есть общий **ключ связи** (ID заказа/PO/треда) в UI обеих сторон или явно описано отсутствие зеркала. Для оптового заказа в query чатов/матрицы — **`cross-role-entity-ids.ts`** (`B2B_WHOLESALE_ORDER_CONTEXT_QUERY`), строители URL в **`routes.ts`**.
- [ ] Если менялись operational orders / export / health / outbox / **workflow processes**: `npm run test:contracts:b2b` и релевантный Playwright (`test:e2e:api` или `test:e2e:verification`); для процессов — при смене контракта API обновить §5.1 и таблицы §5.4/§5.6 (сейчас e2e: **`processes-workflow-api`** в `test:e2e:api`).
- [ ] Новый автотест: добавлена строка в §5.4 или §5.5 по шаблону §5.8.

## 6. Связь с матрицей тем (`role-hub-matrix.ts`)

Строки с фазой **`comms`** в таблице покрытия отражают сквозные коммуникации. При смене подписей кластеров в `CABINET_SIDEBAR_CLUSTERS_FULL` синхронизировать навигационные файлы и этот документ.
