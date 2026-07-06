# Platform Core — responsive cabinet & workspace

Контракт слоёв для `:3001` (core mode). Breakpoints: **< md** iPhone · **md–lg** iPad · **lg+** MacBook.

## Источники правды

| Слой | Токены / компоненты |
|------|---------------------|
| Кабинет роли | `hubCabinet` — `src/lib/platform-core-cabinet-chrome.ts` |
| Insight-карточки | `pillarInsight`, `PillarInsightPrimitives` |
| Hub quick entry | `PlatformCoreHubQuickEntry`, `platformCoreHeaderHubTabClass` |
| Workspace chrome | `PlatformCoreListChrome`, `PlatformCoreRolePillarStrip` |
| Dedup | `platform-core-ui-dedup` — один context-bar, без дубля H1/cross-role |

## Кабинет `*/core`

| Viewport | Навигация столпов | Insight | CTA |
|----------|-------------------|---------|-----|
| < 768 | `role-core-pillar-nav-horizontal` — swipe pills, `min-h-11` | stack, step chips | `panelHeader`, full-width < sm |
| md–lg | `role-core-pillar-nav` aside `w-52` | `insightGrid` 2 col | в шапке панели |
| lg+ | aside + panel side-by-side | компактно + cross-role | `primaryCta` inline |

**Above the fold (393×812):** context-bar → pills → заголовок столпа → «Открыть рабочий экран».

## Workspace (list chrome)

| Viewport | Pillar strip | Sidebar |
|----------|--------------|---------|
| < lg | `platform-core-role-pillar-strip` под context-bar | бургер |
| lg+ | strip скрыт (`lg:hidden`) | столпы в сайдбаре роли |

Strip: hub-pills, wrap на md; back — `platform-core-workspace-back`.

## E2E

- `e2e/core-92-cabinet-layout-viewports.spec.ts` — brand + shop 393 / 834 / 1280
- `e2e/core-94-cabinet-all-roles-viewports.spec.ts` — manufacturer + supplier cabinets 393 / 834 / 1280
- `e2e/core-91-hub-layout-viewports.spec.ts` — hub
- `e2e/core-93-shop-matrix-smoke.spec.ts` — matrix 393 + iPad sticky col
- Helpers: `expectCabinetPillarNav`, `expectCabinetAboveFold`, `expectWorkspacePillarStrip`

## Preview

`syntha-device-preview.html?url=/brand/core` — iframe + `fitDeviceScale()` на iPad.

## Проверка после правок

```bash
npm run audit:platform-core-ui
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 PLAYWRIGHT_SKIP_WEBSERVER=1 \
  npx playwright test e2e/core-92-cabinet-layout-viewports.spec.ts e2e/core-94-cabinet-all-roles-viewports.spec.ts
```

## Context bar (workspace)

Core mode: одна строка `← Кабинет · роль · столп · entity` (`showWorkspaceBack`).

`data-testid="platform-core-workspace-back"` на ссылке «Кабинет» в context-bar (без дубля в ListChrome).

## Таблицы

`hubCabinet.workspaceTableScroll` + `workspaceStickyHead` / `workspaceStickyCol` — orders registry, matrix size grid.

## Order detail

`hubCabinet.orderDetailLayout` — `lg:grid-cols-[1fr_20rem]`; cross-role в `orderDetailRail` (lg+) и `platform-core-order-detail-cross-role-mobile` (< lg).

## Реестры заказов (brand/shop)

`< md` и `lg+` — таблица + sticky col; **md–lg** — `workspaceCardGrid` (`brand-co-registry-card-grid`, `shop-co-registry-card-grid`).

## Кабинет — mobile panel grid

`pillarPanelGrid` (core mode): строка 1 — название столпа (sticky top); строка 2 — insight; строка 3 — CTA «Открыть…» (`role-pillar-primary-cta`, sticky bottom + `pb-safe`). На `md+` — CTA в шапке панели (grid col 2), insight ниже в 2 колонки.

## Тема

`PlatformCoreThemeBridge` — `data-platform-core`, `.dark` по `prefers-color-scheme`.

## E2E helpers (`e2e/helpers/core-chain-overview.ts`)

| Helper | Назначение |
|--------|------------|
| `expectCabinetPillarNav` | horizontal `< md`, aside `≥ md` |
| `expectCabinetAboveFold` | context + pills + CTA + insight в 393×812 |
| `expectCabinetAsidePanelLayout` | aside + panel в одной строке `md+` |
| `expectWorkspacePillarStrip` | strip `< lg`, hidden `lg+` |
| `cabinetPillarNavLocator` / `clickCabinetPillar` | клик по столпу без strict-mode дубля testid |
| `clickCabinetPrimaryCta` | CTA кабинета: навигация по `href` (live `demoOrderId`) |
| `gotoRoleCoreCabinet` | `/core` + optional chain-overview wait |

## Hub `/platform`

| Зона | < md | md–lg | lg+ | E2E |
|------|------|-------|-----|-----|
| Quick entry + матрица | stack / h-scroll | 2×2 роли, таблица | 2-col grid + audit | `core-91` |
| Audit-only роли | 2×2 (`PLATFORM_CORE_HUB_CARD_ROW_ROLES`) | 2×2 | 2×2 в левой колонке | `core-91` audit 834 |
| Планировщик | full width, toolbar scroll, `min-h-11` CTA | same | chat split `lg:grid` | `core-104` |

Токены: `platformCoreHubLayout` (`platform-core-hub-layout.ts`), planner actions — `hubCabinet.workspaceStickyActions` / `workspacePrimaryBtn`.

### E2E hub (дополнительно)

- `e2e/core-104-hub-planner-viewports.spec.ts` — planner 393 / 834
- `e2e/core-101-comms-mobile-viewports.spec.ts` — messages split `< md`
- `e2e/core-102-calendar-viewports.spec.ts` — calendar compact 393 / 834
- `e2e/core-103-op-viewports.spec.ts` — handoff, mfr cards, sup procurement

## Range planner (`brand-dev-range`)

| Viewport | План по уровням | Tier board | Формы |
|----------|-----------------|------------|-------|
| < md | 1 col | h-scroll (`brand-dev-range-tier-board-scroll`) | full-width touch |
| md–lg | `workspaceCardGrid` 2 col | 3 col grid | 2 col inputs |
| lg+ | 3 col | 3 col grid | inline |

E2E: `e2e/core-105-range-planner-viewports.spec.ts`

## Order detail (brand/shop)

| Viewport | Layout | Cross-role |
|----------|--------|------------|
| < lg | stack, `orderDetailCrossRoleMobile` под facts | `platform-core-order-detail-cross-role-mobile` |
| lg+ | `orderDetailLayout` 2-col | `platform-core-order-detail-rail` sticky |

Строки заказа: `platform-core-order-lines-scroll` (`workspaceTableScroll`). Brand: `showCrossLinks={false}` в workspace — без дубля footer.

E2E: `e2e/core-106-order-detail-viewports.spec.ts`

## Sample collection (brand-sc / shop-sc)

| Экран | < md | md–lg | lg+ |
|-------|------|-------|-----|
| Brand linesheets | `brand-sc-linesheets-card-grid` 1 col | 2 col grid | table `brand-sc-linesheets-list` |
| Shop showroom | cover hero `h-12`, article 1 col | 2 col grid | 2 col |
| Publish / unpublish | `min-h-11` touch targets | same | table actions |

E2E: `e2e/core-107-sc-viewports.spec.ts`

## shop-op buyer tracking (Фаза 11 follow-up)

- `PlatformCoreShopB2bTrackingPanel`: context strip h-scroll + `trackingGoldenLink` (≥44px < md); `ShopOpTrackingSpinePeerStrip` под strip при `?order=`; timeline — chips h-scroll `< md` (`trackingTimelineMobile`), список `md+`.
- `CollectionOrderPillarCard` (shop OP cabinet): `ShopOpCabinetSpinePeerStrip` после ETA peek.
- E2E: `core-97` — mobile timeline + spine peer; iPad скрывает mobile timeline.
- Audit: `inventory_reserved` + `!compact` regex fix (41/41).

## Shop buyer tracking (shop-op / shop-co-buyer-tracking) — 2026-06-12

- `tracking-core.tsx`: `pb-safe` на странице.
- `PlatformCoreShopB2bTrackingPanel`: timeline → `PillarInsightSteps` (chips < md, list md+); shipment strip touch.
- `ShopOrderShipmentTrackingStrip`: `break-all` на ТТН, pull CTA `min-h-11` < md.
- `pillarInsight.goldenLink`: touch `min-h-11` < md (все golden path / shop-op peer strips).
- Audit: `inventory_reserved` + `!compact` regex multiline; mfr WMS badge скрыт в compact.
- E2E: `core-97` (393 timeline + 834 calendar); требует `npm run dev:core` + `db:core:bootstrap`.

## Brand dossier (brand-dev-dossier) — 2026-06-12

- `workshop2-article-core-wayfinding.tsx`: context/cross strips → `hubGadget.goldenPath`, `pb-safe`.
- `workshop2-phase1-dossier-panel-tz-dense-nav.tsx`: h-scroll tabs < md, `min-h-11`, `brand-dev-dossier-section-nav`.
- `workshop2-phase1-dossier-panel-body-shell.tsx`: compact hero < md.
- `workshop2-phase1-dossier-panel-tz-stage-sticky-header.tsx`: sticky stage board < md (`workspaceStickyHead`).
- `workshop2-phase1-dossier-panel-footer-actions.tsx`: sticky actions + `brand-dev-dossier-actions-strip`, touch CTA.
- E2E: `core-108` (393 + 834); требует `npm run core:bootstrap`.

## Русификация UI + brand-dev-pg-sync — 2026-06-12

- Peer-стрипы shop-op / shop-cm / tracking bridge: русские подписи для ролей бренд·магазин·производство.
- brand-dev-pg-sync: `BrandDevPgSyncPeerStrip` (Схема атрибутов, Чат по артикулу), `brand-dev-pg-sync-stack` + `pb-safe` на W2 hub.
- `Workshop2HubSlaOpsPanel` compact: h-scroll < md, русские метки SLO.
- W2/dossier/range: «Хаб W2», «Сводка для инвестора».
- E2E: `core-98` — pg-sync peer strip + SLA panel на 393/834.

## Обновление 2026-06-12 — фазы 12–15

### Фаза 12 (development) — закрыто
- `materials-core.tsx`: h-scroll context-strips, `overflow-x-clip`, section nav артикулов, таблицы BOM через `workspaceTableScroll`.
- E2E: `core-100` (393 development + 834 procurement).

### Фаза 15 (hub planner) — закрыто
- `PlatformCorePlannerPanel`: `overflow-x-clip`, `plannerToolbarRow` на stats, touch CTA `min-h-11`, русские статусы (в сети/офлайн).
- Hub: `PlatformHubPageClient` — `overflow-x-clip` на колонке и секции planner.
- E2E: `core-104` (393 + 834).

### Русификация platform-core (peer strips)
- Передача, Техкарта раскроя, Связь с цехом, Прогноз, Операции цеха — вместо EN в OP/comms/empty peer strips.

### M3 — core-109 representative workspaces
- `e2e/core-109-representative-workspaces.spec.ts`: 5 экранов × 393/834, overflow smoke.
- W2 hub · shop matrix · brand CO registry · factory dossier · brand order messages.
