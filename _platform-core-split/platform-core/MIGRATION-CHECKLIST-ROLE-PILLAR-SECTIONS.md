# Platform Core — чеклист переноса: роль × столп × раздел

Дата: 2026-06-26 · SoT разделов: `src/lib/platform-core-readiness-sections/*-audit.ts`

**Всего разделов:** 90 (brand 38 · shop 25 · manufacturer 13 · supplier 14) + 12 empty-cell insight разделов.

## Целевая структура (кольцо A)

```text
components/platform/
  workspaces/{brand|shop|manufacturer|supplier}/{pillar}/
    {Role}{Pillar}CabinetWorkspace.tsx    ← main panel справа
    sections/{section-id}.tsx             ← один audit-раздел
  showroom/                             ← уже native
  peers/                                ← cross-role strips
RoleCoreCabinetHub.tsx                  ← mount workspace по role+pillar
RoleCorePillarSectionLinks.tsx          ← левый nav по ?section=
```

## Легенда

| Символ | Значение |
|--------|----------|
| ✅ | Native / cabinet / meta-раздел |
| 🟡 | Частично (wrapper на legacy или strips) |
| 🔴 | Legacy URL → strict archived=1 |
| 🟢 | Native route (messages/calendar) |
| ⏭ | Peer strip — не отдельный workspace |
| 📦 | После переноса → `src/_archive/platform-core-legacy/` |

## Сводка 4×5 (workspace)

| Роль | development | sample_collection | collection_order | order_production | comms |
|------|-------------|-------------------|------------------|------------------|-------|
| Бренд | 🟡 partial | 🔴 overview | 🔴 overview | 🔴 overview | 🟢 native |
| Магазин | 🟡 partial | 🔴 overview | 🔴 overview | 🔴 overview | 🟢 native |
| Производитель | 🔴 overview | — empty | — empty | ✅ embedded | 🟢 native |
| Поставщик | ✅ embedded | — empty | — empty | ✅ embedded | 🟢 native |

Pillar cards: `development`→DevelopmentPillarCard · `sample_collection`→SampleCollectionPillarCard · `collection_order`→CollectionOrderPillarCard · `order_production`→OrderProductionPillarCard · `comms`→CommsPillarCard

## Волны исполнения

| Wave | Фокус | Ячейки |
|------|-------|--------|
| 1 | W2 development native | brand×dev, shop×dev-bridge |
| 2 | Showroom + linesheets | brand×sc, shop×sc |
| 3 | B2B matrix/checkout/orders | brand×co, shop×co |
| 4 | Production + factory/supplier | brand×op, shop×op, mfr×*, sup×* |
| 5 | Comms polish + section nav | все × comms |
| 6 | Long-tail → archive | retailers, WSSI, agent, margin… |

## Не архивировать (кольцо B — данные)

`lib/production/`, `lib/server/workshop2-*`, `app/api/workshop2/**`, `lib/platform-core-ports/**` — только ports, UI не импортирует напрямую.

---

## Бренд (`brand`)

### Разработка (`development`)

Workspace: **BrandDevelopmentCabinetWorkspace** · Wave **1** · Pillar card: `DevelopmentPillarCard`

| # | section id | Раздел | Статус | Legacy (откуда) | Native (куда) | Port |
|---|------------|--------|--------|-----------------|---------------|------|
| 1 | `brand-dev-w2-hub` | Цех разработки · коллекция | 🟡 embedded W2 (перенести UI) | app/brand/production/workshop2/**; components/brand/production/** | `components/platform/workspaces/brand/development/sections/brand-dev-w2-hub.tsx` | dossier-store.ts, tz-client.ts, sample-orders.ts |
| 2 | `brand-dev-dossier` | Досье артикула · техзадание | 🟡 embedded W2 (перенести UI) | app/brand/production/workshop2/**; components/brand/production/** | `components/platform/workspaces/brand/development/sections/brand-dev-dossier.tsx` | dossier-store.ts, tz-client.ts, sample-orders.ts |
| 3 | `brand-dev-range` | Планировщик ассортимента | 🔴 legacy href → archived | app/brand/linesheets/**; app/shop/b2b/showroom/**; components/platform/showroom/** (частично) | `components/platform/workspaces/brand/development/sections/brand-dev-range.tsx` | brand-linesheet-syndication.ts, brand-release-gate.ts |
| 4 | `brand-dev-pg-sync` | Статус разработки · PG | 🔴 legacy href → archived | app/brand/production/workshop2/**; components/brand/production/** | `components/platform/workspaces/brand/development/sections/brand-dev-pg-sync.tsx` | dossier-store.ts, tz-client.ts, sample-orders.ts |
| 5 | `brand-dev-cabinet` | Кабинет · карточка столпа | ✅ cabinet link | RoleCoreCabinetHub + ?section= | `components/platform/workspaces/brand/development/sections/brand-dev-cabinet.tsx` | platform-core-ports/* (точечно) |
| 6 | `brand-dev-cross` | Связь · цех и поставщик | ⏭ peer strip (не workspace) | app/factory/production/**; app/factory/supplier/**; components/factory/** | `components/platform/workspaces/brand/development/sections/brand-dev-cross.tsx` | factory-dossier.ts, manufacturer-handoff.ts, material-requisitions.ts |
| 7 | `brand-dev-attribute-schema` | Attribute schema · health | 🔴 legacy href → archived | app/brand/(integrations|retailers|price-lists|…)/** | `components/platform/workspaces/brand/development/sections/brand-dev-attribute-schema.tsx` | platform-core-ports/* (точечно) |
| 8 | `brand-dev-material-passport` | Material passport · rollup | 🔴 legacy href → archived | app/brand/(integrations|retailers|price-lists|…)/** | `components/platform/workspaces/brand/development/sections/brand-dev-material-passport.tsx` | platform-core-ports/* (точечно) |
| 9 | `brand-dev-rfq-supplier` | Centric RFQ · upstream | 🔴 legacy href → archived | app/brand/(integrations|retailers|price-lists|…)/** | `components/platform/workspaces/brand/development/sections/brand-dev-rfq-supplier.tsx` | platform-core-ports/* (точечно) |
| 10 | `brand-dev-supplier-bom` | Supplier BOM · procurement | 🔴 legacy href → archived | app/brand/(integrations|retailers|price-lists|…)/** | `components/platform/workspaces/brand/development/sections/brand-dev-supplier-bom.tsx` | platform-core-ports/* (точечно) |

**После wave:** подключить `RoleCoreCabinetHub` → `BrandDevelopmentCabinetWorkspace` + `RoleCorePillarSectionLinks` по `?section=`.

### Коллекция и витрина (`sample_collection`)

Workspace: **—** · Wave **2** · Pillar card: `SampleCollectionPillarCard`

| # | section id | Раздел | Статус | Legacy (откуда) | Native (куда) | Port |
|---|------------|--------|--------|-----------------|---------------|------|
| 1 | `brand-sc-linesheets` | Лайншиты · коллекция | 🔴 legacy href → archived | app/brand/linesheets/**; app/shop/b2b/showroom/**; components/platform/showroom/** (частично) | `components/platform/workspaces/brand/sample_collection/sections/brand-sc-linesheets.tsx` | brand-linesheet-syndication.ts, brand-release-gate.ts |
| 2 | `brand-sc-showroom` | Витрина бренда | 🔴 legacy href → archived | grep resolveHref в *-audit.ts | `components/platform/workspaces/brand/sample_collection/sections/brand-sc-showroom.tsx` | platform-core-ports/* (точечно) |
| 3 | `brand-sc-publish` | Публикация · витрина | 🔴 legacy href → archived | app/brand/linesheets/**; app/shop/b2b/showroom/**; components/platform/showroom/** (частично) | `components/platform/workspaces/brand/sample_collection/sections/brand-sc-publish.tsx` | brand-linesheet-syndication.ts, brand-release-gate.ts |
| 4 | `brand-sc-cross-matrix` | Cross-role · матрица магазина | ⏭ peer strip (не workspace) | app/shop/b2b/**; components/shop/b2b/** | `components/platform/workspaces/brand/sample_collection/sections/brand-sc-cross-matrix.tsx` | b2b-orders.ts, b2b-order-lifecycle.ts, workshop2-cart-bridge.ts |
| 5 | `brand-sc-cabinet` | Кабинет · лайншит и витрина | ✅ cabinet link | RoleCoreCabinetHub + ?section= | `components/platform/workspaces/brand/sample_collection/sections/brand-sc-cabinet.tsx` | platform-core-ports/* (точечно) |

**После wave:** подключить `RoleCoreCabinetHub` → `BrandSampleCollectionCabinetWorkspace` + `RoleCorePillarSectionLinks` по `?section=`.

### Оптовый заказ (`collection_order`)

Workspace: **—** · Wave **3** · Pillar card: `CollectionOrderPillarCard`

| # | section id | Раздел | Статус | Legacy (откуда) | Native (куда) | Port |
|---|------------|--------|--------|-----------------|---------------|------|
| 1 | `brand-co-registry` | Реестр оптовых заказов | 🔴 legacy href → archived | app/brand/b2b-orders/**; components/platform/PlatformCoreB2b* (частично native) | `components/platform/workspaces/brand/collection_order/sections/brand-co-registry.tsx` | b2b-orders.ts, b2b-order-lifecycle.ts, workshop2-cart-bridge.ts |
| 2 | `brand-co-detail` | Карточка заказа | 🔴 legacy href → archived | app/brand/b2b-orders/**; components/platform/PlatformCoreB2b* (частично native) | `components/platform/workspaces/brand/collection_order/sections/brand-co-detail.tsx` | b2b-orders.ts, b2b-order-lifecycle.ts, workshop2-cart-bridge.ts |
| 3 | `brand-co-retailers` | Сеть ритейлеров | 🔴 legacy href → archived | app/brand/linesheets/**; app/shop/b2b/showroom/**; components/platform/showroom/** (частично) | `components/platform/workspaces/brand/collection_order/sections/brand-co-retailers.tsx` | brand-linesheet-syndication.ts, brand-release-gate.ts |
| 4 | `brand-co-chain` | Этапы цепочки · заказ | 🔴 legacy href → archived | app/brand/b2b-orders/**; components/platform/PlatformCoreB2b* (частично native) | `components/platform/workspaces/brand/collection_order/sections/brand-co-chain.tsx` | b2b-orders.ts, b2b-order-lifecycle.ts, workshop2-cart-bridge.ts |
| 5 | `brand-co-cabinet` | Кабинет · приём заказов | ✅ cabinet link | RoleCoreCabinetHub + ?section= | `components/platform/workspaces/brand/collection_order/sections/brand-co-cabinet.tsx` | platform-core-ports/* (точечно) |
| 6 | `brand-co-wssi-plan` | WSSI · OTB → shop buy | 🔴 legacy href → archived | app/brand/(integrations|retailers|price-lists|…)/** | `components/platform/workspaces/brand/collection_order/sections/brand-co-wssi-plan.tsx` | platform-core-ports/* (точечно) |
| 7 | `brand-co-crm-segmentation` | CRM · сегменты → showroom | 🔴 legacy href → archived | app/brand/(integrations|retailers|price-lists|…)/** | `components/platform/workspaces/brand/collection_order/sections/brand-co-crm-segmentation.tsx` | platform-core-ports/* (точечно) |
| 8 | `brand-co-agent-rep` | Agent rep · brand oversight | 🔴 legacy href → archived | app/brand/(integrations|retailers|price-lists|…)/** | `components/platform/workspaces/brand/collection_order/sections/brand-co-agent-rep.tsx` | platform-core-ports/* (точечно) |
| 9 | `brand-co-pricelist` | Price lists · tier sync | 🔴 legacy href → archived | app/brand/linesheets/**; app/shop/b2b/showroom/**; components/platform/showroom/** (частично) | `components/platform/workspaces/brand/collection_order/sections/brand-co-pricelist.tsx` | brand-linesheet-syndication.ts, brand-release-gate.ts |
| 10 | `brand-co-pack-rules` | Pack rules · MOQ | 🔴 legacy href → archived | app/brand/(integrations|retailers|price-lists|…)/** | `components/platform/workspaces/brand/collection_order/sections/brand-co-pack-rules.tsx` | platform-core-ports/* (точечно) |
| 11 | `brand-co-landed-margin` | Landed margin · brand | 🔴 legacy href → archived | app/brand/(integrations|retailers|price-lists|…)/** | `components/platform/workspaces/brand/collection_order/sections/brand-co-landed-margin.tsx` | platform-core-ports/* (точечно) |

**После wave:** подключить `RoleCoreCabinetHub` → `BrandCollectionOrderCabinetWorkspace` + `RoleCorePillarSectionLinks` по `?section=`.

### Производство (`order_production`)

Workspace: **—** · Wave **4** · Pillar card: `OrderProductionPillarCard`

| # | section id | Раздел | Статус | Legacy (откуда) | Native (куда) | Port |
|---|------------|--------|--------|-----------------|---------------|------|
| 1 | `brand-op-handoff` | Передача в производство | 🔴 legacy href → archived | app/brand/b2b-orders/**; components/platform/PlatformCoreB2b* (частично native) | `components/platform/workspaces/brand/order_production/sections/brand-op-handoff.tsx` | b2b-orders.ts, b2b-order-lifecycle.ts, workshop2-cart-bridge.ts |
| 2 | `brand-op-chain` | Статус цепочки · PO | 🔴 legacy href → archived | app/brand/b2b-orders/**; components/platform/PlatformCoreB2b* (частично native) | `components/platform/workspaces/brand/order_production/sections/brand-op-chain.tsx` | b2b-orders.ts, b2b-order-lifecycle.ts, workshop2-cart-bridge.ts |
| 3 | `brand-op-dossier` | Досье · W2 бренда | 🔴 legacy href → archived | app/brand/b2b-orders/**; components/platform/PlatformCoreB2b* (частично native) | `components/platform/workspaces/brand/order_production/sections/brand-op-dossier.tsx` | b2b-orders.ts, b2b-order-lifecycle.ts, workshop2-cart-bridge.ts |
| 4 | `brand-op-registry` | Реестр · контекст заказов | 🔴 legacy href → archived | app/brand/b2b-orders/**; components/platform/PlatformCoreB2b* (частично native) | `components/platform/workspaces/brand/order_production/sections/brand-op-registry.tsx` | b2b-orders.ts, b2b-order-lifecycle.ts, workshop2-cart-bridge.ts |
| 5 | `brand-op-cabinet` | Кабинет · заказ→производство | ✅ meta | grep resolveHref в *-audit.ts | `components/platform/workspaces/brand/order_production/sections/brand-op-cabinet.tsx` | platform-core-ports/* (точечно) |
| 6 | `brand-op-inventory-ops` | Inventory · brand ledger | 🔴 legacy href → archived | app/brand/(integrations|retailers|price-lists|…)/** | `components/platform/workspaces/brand/order_production/sections/brand-op-inventory-ops.tsx` | platform-core-ports/* (точечно) |

**После wave:** подключить `RoleCoreCabinetHub` → `BrandOrderProductionCabinetWorkspace` + `RoleCorePillarSectionLinks` по `?section=`.

### Связь (`comms`)

Workspace: **CommsCabinetSplitLayout** · Wave **5** · Pillar card: `CommsPillarCard`

| # | section id | Раздел | Статус | Legacy (откуда) | Native (куда) | Port |
|---|------------|--------|--------|-----------------|---------------|------|
| 1 | `brand-cm-order-chat` | Чат · оптовый заказ | 🟢 native route | app/{role}/messages/** — OK в strict; components/platform/Comms* | `components/platform/workspaces/brand/comms/sections/brand-cm-order-chat.tsx` | contextual-messages.ts, brand-calendar.ts |
| 2 | `brand-cm-article-chat` | Чат · артикул W2 | 🟢 native route | app/{role}/messages/** — OK в strict; components/platform/Comms* | `components/platform/workspaces/brand/comms/sections/brand-cm-article-chat.tsx` | contextual-messages.ts, brand-calendar.ts |
| 3 | `brand-cm-calendar` | Календарь · заказ | 🟢 native route | app/{role}/messages/** — OK в strict; components/platform/Comms* | `components/platform/workspaces/brand/comms/sections/brand-cm-calendar.tsx` | contextual-messages.ts, brand-calendar.ts |
| 4 | `brand-cm-banner` | Контекст-баннер · URL | 🟢 native route | app/{role}/messages/** — OK в strict; components/platform/Comms* | `components/platform/workspaces/brand/comms/sections/brand-cm-banner.tsx` | contextual-messages.ts, brand-calendar.ts |
| 5 | `brand-cm-section-groups` | Группы по разделам | ✅ cabinet link | RoleCoreCabinetHub + ?section= | `components/platform/workspaces/brand/comms/sections/brand-cm-section-groups.tsx` | platform-core-ports/* (точечно) |
| 6 | `brand-cm-cabinet` | Кабинет · связь | ✅ cabinet link | RoleCoreCabinetHub + ?section= | `components/platform/workspaces/brand/comms/sections/brand-cm-cabinet.tsx` | platform-core-ports/* (точечно) |

**После wave:** подключить `RoleCoreCabinetHub` → `BrandCommsCabinetWorkspace` + `RoleCorePillarSectionLinks` по `?section=`.

---

## Магазин (`shop`)

### Разработка (`development`)

Workspace: **empty-cells + ShopDevelopmentBridge*** · Wave **1** · Pillar card: `DevelopmentPillarCard`

| # | section id | Раздел | Статус | Legacy (откуда) | Native (куда) | Port |
|---|------------|--------|--------|-----------------|---------------|------|
| 1 | `shop-dev-bridge` | Мост разработки · read-only | ✅ cabinet link | RoleCoreCabinetHub + ?section= | `components/platform/workspaces/shop/development/sections/shop-dev-bridge.tsx` | platform-core-ports/* (точечно) |

**После wave:** подключить `RoleCoreCabinetHub` → `ShopDevelopmentCabinetWorkspace` + `RoleCorePillarSectionLinks` по `?section=`.

### Коллекция и витрина (`sample_collection`)

Workspace: **—** · Wave **2** · Pillar card: `SampleCollectionPillarCard`

| # | section id | Раздел | Статус | Legacy (откуда) | Native (куда) | Port |
|---|------------|--------|--------|-----------------|---------------|------|
| 1 | `shop-sc-showroom` | Витрина коллекции | 🔴 legacy href → archived | app/brand/linesheets/**; app/shop/b2b/showroom/**; components/platform/showroom/** (частично) | `components/platform/workspaces/shop/sample_collection/sections/shop-sc-showroom.tsx` | brand-linesheet-syndication.ts, brand-release-gate.ts |
| 2 | `shop-sc-partners` | Каталог партнёров | 🔴 legacy href → archived | app/shop/b2b/**; components/shop/b2b/** | `components/platform/workspaces/shop/sample_collection/sections/shop-sc-partners.tsx` | b2b-orders.ts, b2b-order-lifecycle.ts, workshop2-cart-bridge.ts |
| 3 | `shop-sc-matrix-entry` | Переход · матрица | 🔴 legacy href → archived | app/shop/b2b/**; components/shop/b2b/** | `components/platform/workspaces/shop/sample_collection/sections/shop-sc-matrix-entry.tsx` | b2b-orders.ts, b2b-order-lifecycle.ts, workshop2-cart-bridge.ts |
| 4 | `shop-sc-cabinet` | Кабинет · витрина | ✅ cabinet link | RoleCoreCabinetHub + ?section= | `components/platform/workspaces/shop/sample_collection/sections/shop-sc-cabinet.tsx` | platform-core-ports/* (точечно) |

**После wave:** подключить `RoleCoreCabinetHub` → `ShopSampleCollectionCabinetWorkspace` + `RoleCorePillarSectionLinks` по `?section=`.

### Оптовый заказ (`collection_order`)

Workspace: **—** · Wave **3** · Pillar card: `CollectionOrderPillarCard`

| # | section id | Раздел | Статус | Legacy (откуда) | Native (куда) | Port |
|---|------------|--------|--------|-----------------|---------------|------|
| 1 | `shop-co-matrix` | Матрица оптового заказа | 🔴 legacy href → archived | app/shop/b2b/**; components/shop/b2b/** | `components/platform/workspaces/shop/collection_order/sections/shop-co-matrix.tsx` | b2b-orders.ts, b2b-order-lifecycle.ts, workshop2-cart-bridge.ts |
| 2 | `shop-co-checkout` | Checkout · отправка бренду | 🔴 legacy href → archived | app/brand/production/workshop2/**; components/brand/production/** | `components/platform/workspaces/shop/collection_order/sections/shop-co-checkout.tsx` | dossier-store.ts, tz-client.ts, sample-orders.ts |
| 3 | `shop-co-registry` | Реестр оптовых заказов | 🔴 legacy href → archived | app/shop/b2b/**; components/shop/b2b/** | `components/platform/workspaces/shop/collection_order/sections/shop-co-registry.tsx` | b2b-orders.ts, b2b-order-lifecycle.ts, workshop2-cart-bridge.ts |
| 4 | `shop-co-detail` | Карточка заказа | 🔴 legacy href → archived | grep resolveHref в *-audit.ts | `components/platform/workspaces/shop/collection_order/sections/shop-co-detail.tsx` | platform-core-ports/* (точечно) |
| 5 | `shop-co-buyer-tracking` | Трекинг покупателя · PO | 🔴 legacy href → archived | grep resolveHref в *-audit.ts | `components/platform/workspaces/shop/collection_order/sections/shop-co-buyer-tracking.tsx` | platform-core-ports/* (точечно) |
| 6 | `shop-co-cabinet` | Кабинет · формирование заказа | ✅ cabinet link | RoleCoreCabinetHub + ?section= | `components/platform/workspaces/shop/collection_order/sections/shop-co-cabinet.tsx` | platform-core-ports/* (точечно) |
| 7 | `shop-co-replenishment` | Replenishment workspace | 🔴 legacy href → archived | app/shop/b2b/**; components/shop/b2b/** | `components/platform/workspaces/shop/collection_order/sections/shop-co-replenishment.tsx` | b2b-orders.ts, b2b-order-lifecycle.ts, workshop2-cart-bridge.ts |
| 8 | `shop-co-agent-rep` | Agent / sales rep | 🔴 legacy href → archived | app/shop/b2b/**; components/shop/b2b/** | `components/platform/workspaces/shop/collection_order/sections/shop-co-agent-rep.tsx` | b2b-orders.ts, b2b-order-lifecycle.ts, workshop2-cart-bridge.ts |
| 9 | `shop-co-landed-margin` | Landed margin · shop | 🔴 legacy href → archived | app/shop/b2b/**; components/shop/b2b/** | `components/platform/workspaces/shop/collection_order/sections/shop-co-landed-margin.tsx` | b2b-orders.ts, b2b-order-lifecycle.ts, workshop2-cart-bridge.ts |
| 10 | `shop-co-collaborative-order` | Collaborative order · session | 🔴 legacy href → archived | app/shop/b2b/**; components/shop/b2b/** | `components/platform/workspaces/shop/collection_order/sections/shop-co-collaborative-order.tsx` | b2b-orders.ts, b2b-order-lifecycle.ts, workshop2-cart-bridge.ts |
| 11 | `shop-co-working-order` | Working order · versions | 🔴 legacy href → archived | app/shop/b2b/**; components/shop/b2b/** | `components/platform/workspaces/shop/collection_order/sections/shop-co-working-order.tsx` | b2b-orders.ts, b2b-order-lifecycle.ts, workshop2-cart-bridge.ts |

**После wave:** подключить `RoleCoreCabinetHub` → `ShopCollectionOrderCabinetWorkspace` + `RoleCorePillarSectionLinks` по `?section=`.

### Производство (`order_production`)

Workspace: **—** · Wave **4** · Pillar card: `OrderProductionPillarCard`

| # | section id | Раздел | Статус | Legacy (откуда) | Native (куда) | Port |
|---|------------|--------|--------|-----------------|---------------|------|
| 1 | `shop-op-tracking` | Трекинг цепочки | 🔴 legacy href → archived | grep resolveHref в *-audit.ts | `components/platform/workspaces/shop/order_production/sections/shop-op-tracking.tsx` | platform-core-ports/* (точечно) |
| 2 | `shop-op-order-status` | Карточка · статус PO | 🔴 legacy href → archived | grep resolveHref в *-audit.ts | `components/platform/workspaces/shop/order_production/sections/shop-op-order-status.tsx` | platform-core-ports/* (точечно) |
| 3 | `shop-op-registry` | Реестр · контекст | 🔴 legacy href → archived | grep resolveHref в *-audit.ts | `components/platform/workspaces/shop/order_production/sections/shop-op-registry.tsx` | platform-core-ports/* (точечно) |
| 4 | `shop-op-cabinet` | Кабинет · после отправки | ✅ cabinet link | RoleCoreCabinetHub + ?section= | `components/platform/workspaces/shop/order_production/sections/shop-op-cabinet.tsx` | platform-core-ports/* (точечно) |
| 5 | `shop-op-inventory-ops` | Inventory · overview | 🔴 legacy href → archived | app/brand/(integrations|retailers|price-lists|…)/** | `components/platform/workspaces/shop/order_production/sections/shop-op-inventory-ops.tsx` | platform-core-ports/* (точечно) |

**После wave:** подключить `RoleCoreCabinetHub` → `ShopOrderProductionCabinetWorkspace` + `RoleCorePillarSectionLinks` по `?section=`.

### Связь (`comms`)

Workspace: **CommsCabinetSplitLayout** · Wave **5** · Pillar card: `CommsPillarCard`

| # | section id | Раздел | Статус | Legacy (откуда) | Native (куда) | Port |
|---|------------|--------|--------|-----------------|---------------|------|
| 1 | `shop-cm-order-chat` | Чат · заказ | 🟢 native route | app/{role}/messages/** — OK в strict; components/platform/Comms* | `components/platform/workspaces/shop/comms/sections/shop-cm-order-chat.tsx` | contextual-messages.ts, brand-calendar.ts |
| 2 | `shop-cm-calendar-order` | Календарь · заказ | 🟢 native route | app/{role}/messages/** — OK в strict; components/platform/Comms* | `components/platform/workspaces/shop/comms/sections/shop-cm-calendar-order.tsx` | contextual-messages.ts, brand-calendar.ts |
| 3 | `shop-cm-calendar-logistics` | Календарь · закупки | 🔴 legacy href → archived | app/shop/b2b/**; components/shop/b2b/** | `components/platform/workspaces/shop/comms/sections/shop-cm-calendar-logistics.tsx` | b2b-orders.ts, b2b-order-lifecycle.ts, workshop2-cart-bridge.ts |
| 4 | `shop-cm-cabinet` | Кабинет · связь | ✅ cabinet link | RoleCoreCabinetHub + ?section= | `components/platform/workspaces/shop/comms/sections/shop-cm-cabinet.tsx` | platform-core-ports/* (точечно) |

**После wave:** подключить `RoleCoreCabinetHub` → `ShopCommsCabinetWorkspace` + `RoleCorePillarSectionLinks` по `?section=`.

---

## Производитель (`manufacturer`)

### Разработка (`development`)

Workspace: **—** · Wave **4** · Pillar card: `DevelopmentPillarCard`

| # | section id | Раздел | Статус | Legacy (откуда) | Native (куда) | Port |
|---|------------|--------|--------|-----------------|---------------|------|
| 1 | `mfr-dev-dossier` | Досье · read-only | 🔴 legacy href → archived | app/factory/production/**; app/factory/supplier/**; components/factory/** | `components/platform/workspaces/manufacturer/development/sections/mfr-dev-dossier.tsx` | factory-dossier.ts, manufacturer-handoff.ts, material-requisitions.ts |
| 2 | `mfr-dev-sample-queue` | Очередь образцов | 🔴 legacy href → archived | app/factory/production/**; app/factory/supplier/**; components/factory/** | `components/platform/workspaces/manufacturer/development/sections/mfr-dev-sample-queue.tsx` | factory-dossier.ts, manufacturer-handoff.ts, material-requisitions.ts |
| 3 | `mfr-dev-status` | Статус коллекции · PG | 🔴 legacy href → archived | app/factory/production/**; app/factory/supplier/**; components/factory/** | `components/platform/workspaces/manufacturer/development/sections/mfr-dev-status.tsx` | factory-dossier.ts, manufacturer-handoff.ts, material-requisitions.ts |
| 4 | `mfr-dev-cabinet` | Кабинет · досье/образцы | ✅ meta | app/factory/production/**; app/factory/supplier/**; components/factory/** | `components/platform/workspaces/manufacturer/development/sections/mfr-dev-cabinet.tsx` | factory-dossier.ts, manufacturer-handoff.ts, material-requisitions.ts |

**После wave:** подключить `RoleCoreCabinetHub` → `ManufacturerDevelopmentCabinetWorkspace` + `RoleCorePillarSectionLinks` по `?section=`.

### Коллекция и витрина — *empty cell / insight only*

### Оптовый заказ — *empty cell / insight only*

### Производство (`order_production`)

Workspace: **FactoryDossierCoreChrome (detail only)** · Wave **4** · Pillar card: `OrderProductionPillarCard`

| # | section id | Раздел | Статус | Legacy (откуда) | Native (куда) | Port |
|---|------------|--------|--------|-----------------|---------------|------|
| 1 | `mfr-op-handoff-queue` | Очередь передачи | 🔴 legacy href → archived | app/factory/production/**; app/factory/supplier/**; components/factory/** | `components/platform/workspaces/manufacturer/order_production/sections/mfr-op-handoff-queue.tsx` | factory-dossier.ts, manufacturer-handoff.ts, material-requisitions.ts |
| 2 | `mfr-op-production-orders` | Производственные заказы | 🔴 legacy href → archived | app/factory/production/**; app/factory/supplier/**; components/factory/** | `components/platform/workspaces/manufacturer/order_production/sections/mfr-op-production-orders.tsx` | factory-dossier.ts, manufacturer-handoff.ts, material-requisitions.ts |
| 3 | `mfr-op-dossier` | Досье · техзадание | 🔴 legacy href → archived | app/factory/production/**; app/factory/supplier/**; components/factory/** | `components/platform/workspaces/manufacturer/order_production/sections/mfr-op-dossier.tsx` | factory-dossier.ts, manufacturer-handoff.ts, material-requisitions.ts |
| 4 | `mfr-op-materials` | Закупка · поставщик | 🔴 legacy href → archived | app/factory/production/**; app/factory/supplier/**; components/factory/** | `components/platform/workspaces/manufacturer/order_production/sections/mfr-op-materials.tsx` | factory-dossier.ts, manufacturer-handoff.ts, material-requisitions.ts |
| 5 | `mfr-op-cabinet` | Кабинет · выпуск | ✅ meta | app/factory/production/**; app/factory/supplier/**; components/factory/** | `components/platform/workspaces/manufacturer/order_production/sections/mfr-op-cabinet.tsx` | factory-dossier.ts, manufacturer-handoff.ts, material-requisitions.ts |

**После wave:** подключить `RoleCoreCabinetHub` → `ManufacturerOrderProductionCabinetWorkspace` + `RoleCorePillarSectionLinks` по `?section=`.

### Связь (`comms`)

Workspace: **CommsCabinetSplitLayout** · Wave **5** · Pillar card: `CommsPillarCard`

| # | section id | Раздел | Статус | Legacy (откуда) | Native (куда) | Port |
|---|------------|--------|--------|-----------------|---------------|------|
| 1 | `mfr-cm-order` | Чат · заказ | 🟢 native route | app/{role}/messages/** — OK в strict; components/platform/Comms* | `components/platform/workspaces/manufacturer/comms/sections/mfr-cm-order.tsx` | contextual-messages.ts, brand-calendar.ts |
| 2 | `mfr-cm-article` | Чат · артикул | 🟢 native route | app/{role}/messages/** — OK в strict; components/platform/Comms* | `components/platform/workspaces/manufacturer/comms/sections/mfr-cm-article.tsx` | contextual-messages.ts, brand-calendar.ts |
| 3 | `mfr-cm-calendar` | Календарь · производство | 🟢 native route | app/{role}/messages/** — OK в strict; components/platform/Comms* | `components/platform/workspaces/manufacturer/comms/sections/mfr-cm-calendar.tsx` | contextual-messages.ts, brand-calendar.ts |
| 4 | `mfr-cm-cabinet` | Кабинет · связь | ✅ meta | app/factory/production/**; app/factory/supplier/**; components/factory/** | `components/platform/workspaces/manufacturer/comms/sections/mfr-cm-cabinet.tsx` | factory-dossier.ts, manufacturer-handoff.ts, material-requisitions.ts |

**После wave:** подключить `RoleCoreCabinetHub` → `ManufacturerCommsCabinetWorkspace` + `RoleCorePillarSectionLinks` по `?section=`.

---

## Поставщик (`supplier`)

### Разработка (`development`)

Workspace: **SupplierBomPreview strips** · Wave **4** · Pillar card: `DevelopmentPillarCard`

| # | section id | Раздел | Статус | Legacy (откуда) | Native (куда) | Port |
|---|------------|--------|--------|-----------------|---------------|------|
| 1 | `sup-dev-bom` | BOM · спецификация | 🔴 legacy href → archived | app/factory/production/**; app/factory/supplier/**; components/factory/** | `components/platform/workspaces/supplier/development/sections/sup-dev-bom.tsx` | factory-dossier.ts, manufacturer-handoff.ts, material-requisitions.ts |
| 2 | `sup-dev-materials` | Материалы · разработка | 🔴 legacy href → archived | app/factory/production/**; app/factory/supplier/**; components/factory/** | `components/platform/workspaces/supplier/development/sections/sup-dev-materials.tsx` | factory-dossier.ts, manufacturer-handoff.ts, material-requisitions.ts |
| 3 | `sup-dev-comms-peer` | Чат · уточнение цены | 🟢 native route | app/{role}/messages/** — OK в strict; components/platform/Comms* | `components/platform/workspaces/supplier/development/sections/sup-dev-comms-peer.tsx` | contextual-messages.ts, brand-calendar.ts |
| 4 | `sup-dev-cabinet` | Кабинет · BOM образца | ✅ meta | app/factory/production/**; app/factory/supplier/**; components/factory/** | `components/platform/workspaces/supplier/development/sections/sup-dev-cabinet.tsx` | factory-dossier.ts, manufacturer-handoff.ts, material-requisitions.ts |

**После wave:** подключить `RoleCoreCabinetHub` → `SupplierDevelopmentCabinetWorkspace` + `RoleCorePillarSectionLinks` по `?section=`.

### Коллекция и витрина — *empty cell / insight only*

### Оптовый заказ — *empty cell / insight only*

### Производство (`order_production`)

Workspace: **SupplierProcurementPillarCard** · Wave **4** · Pillar card: `OrderProductionPillarCard`

| # | section id | Раздел | Статус | Legacy (откуда) | Native (куда) | Port |
|---|------------|--------|--------|-----------------|---------------|------|
| 1 | `sup-op-procurement` | Закупка · PATCH | 🔴 legacy href → archived | app/factory/production/**; app/factory/supplier/**; components/factory/** | `components/platform/workspaces/supplier/order_production/sections/sup-op-procurement.tsx` | factory-dossier.ts, manufacturer-handoff.ts, material-requisitions.ts |
| 2 | `sup-op-bom-po` | BOM × PO · прогресс | 🔴 legacy href → archived | app/factory/production/**; app/factory/supplier/**; components/factory/** | `components/platform/workspaces/supplier/order_production/sections/sup-op-bom-po.tsx` | factory-dossier.ts, manufacturer-handoff.ts, material-requisitions.ts |
| 3 | `sup-op-chain` | Этап · materials_supplied | 🔴 legacy href → archived | grep resolveHref в *-audit.ts | `components/platform/workspaces/supplier/order_production/sections/sup-op-chain.tsx` | platform-core-ports/* (точечно) |
| 4 | `sup-op-handoff-read` | Очередь передачи · read | 🔴 legacy href → archived | app/factory/production/**; app/factory/supplier/**; components/factory/** | `components/platform/workspaces/supplier/order_production/sections/sup-op-handoff-read.tsx` | factory-dossier.ts, manufacturer-handoff.ts, material-requisitions.ts |
| 5 | `sup-op-cabinet` | Кабинет · закупка | ✅ meta | grep resolveHref в *-audit.ts | `components/platform/workspaces/supplier/order_production/sections/sup-op-cabinet.tsx` | platform-core-ports/* (точечно) |

**После wave:** подключить `RoleCoreCabinetHub` → `SupplierOrderProductionCabinetWorkspace` + `RoleCorePillarSectionLinks` по `?section=`.

### Связь (`comms`)

Workspace: **CommsCabinetSplitLayout** · Wave **5** · Pillar card: `CommsPillarCard`

| # | section id | Раздел | Статус | Legacy (откуда) | Native (куда) | Port |
|---|------------|--------|--------|-----------------|---------------|------|
| 1 | `sup-cm-order` | Чат · заказ | 🟢 native route | app/{role}/messages/** — OK в strict; components/platform/Comms* | `components/platform/workspaces/supplier/comms/sections/sup-cm-order.tsx` | contextual-messages.ts, brand-calendar.ts |
| 2 | `sup-cm-article` | Чат · артикул | 🟢 native route | app/{role}/messages/** — OK в strict; components/platform/Comms* | `components/platform/workspaces/supplier/comms/sections/sup-cm-article.tsx` | contextual-messages.ts, brand-calendar.ts |
| 3 | `sup-cm-rfq-inbox` | RFQ inbox · отдельный маршрут | 🔴 legacy href → archived | grep resolveHref в *-audit.ts | `components/platform/workspaces/supplier/comms/sections/sup-cm-rfq-inbox.tsx` | platform-core-ports/* (точечно) |
| 4 | `sup-cm-calendar` | Календарь · логистика | 🟢 native route | app/{role}/messages/** — OK в strict; components/platform/Comms* | `components/platform/workspaces/supplier/comms/sections/sup-cm-calendar.tsx` | contextual-messages.ts, brand-calendar.ts |
| 5 | `sup-cm-cabinet` | Кабинет · связь | ✅ meta | app/factory/production/**; app/factory/supplier/**; components/factory/** | `components/platform/workspaces/supplier/comms/sections/sup-cm-cabinet.tsx` | factory-dossier.ts, manufacturer-handoff.ts, material-requisitions.ts |

**После wave:** подключить `RoleCoreCabinetHub` → `SupplierCommsCabinetWorkspace` + `RoleCorePillarSectionLinks` по `?section=`.

---

## Empty cells (read-only insight)

SoT: `empty-cells-audit.ts`

| Роль | Столп | section id | Native panel |
|------|-------|------------|-------------|
| shop | development | `shop-empty-dev-status` | empty-cells/shop-development-bridge-panel.tsx ✅ |
| shop | development | `shop-empty-dev-brand-w2` | peer → brand dev |
| shop | development | `shop-empty-dev-showroom` | ShopShowroomMini 🟡 |
| shop | development | `shop-empty-dev-cross` | peer strips |
| manufacturer | sample_collection | `mfr-empty-sc-*` | empty-cells/manufacturer-sample-collection-status-panel.tsx ✅ |
| manufacturer | collection_order | `mfr-empty-co-*` | insight peers only |
| supplier | sample_collection | `sup-empty-sc-*` | SupplierBomPreview 🟡 |
| supplier | collection_order | `sup-empty-co-*` | forecast peers only |

## Архив (кольцо C) — после переноса UI

| Legacy зона | Когда в 📦 |
|-------------|----------|
| `app/shop/b2b/**` (кроме API) | Wave 3 done + boundary 0 |
| `app/brand/production/workshop2/**` (UI pages) | Wave 1 done — logic → workspaces/brand/development |
| `components/shop/b2b/**` | Wave 2–3 |
| `components/brand/production/**` | Wave 1 |
| Brand long-tail (retailers, WSSI, agent…) | Wave 6 или stub в platform |

## Definition of Done (один раздел)

1. `resolveHref` в *-audit.ts → native `/{role}/core?pillar=…&section=…`
2. Section component в `components/platform/workspaces/…`
3. 0 import из `shop/b2b`, `brand/production/workshop2` (кроме ports)
4. STRICT: раздел открывается без `archived=1`
5. Тест: hub-matrix или section href test

*Сгенерировано из readiness-sections; обновлять при закрытии wave.*


---

## Sidebar (глобальная левая панель) — эталон UI

**Не путать** с узким rail внутри `RoleCoreCabinetHub` (`role-core-pillar-nav`).

| Роль | Компонент | Спека групп |
|------|-----------|-------------|
| brand | `components/brand/BrandSidebar.tsx` | `PLATFORM_CORE_BRAND_NAV` |
| shop | `components/shop/ShopSidebar.tsx` | `PLATFORM_CORE_SHOP_NAV` |
| manufacturer | factory sidebar + augment | `PLATFORM_CORE_MANUFACTURER_NAV` |
| supplier | factory supplier sidebar + augment | `PLATFORM_CORE_SUPPLIER_NAV` |

Кластер: **`Цепочка · 5 столпов`** (`PLATFORM_CORE_SIDEBAR_CLUSTER_LABEL`).

### Brand (как на скриншоте)

| Группа sidebar | Столп | Пункты меню |
|----------------|-------|-------------|
| Разработка | development | Цех разработки · артикулы · План ассортимента |
| Коллекция и витрина | sample_collection | Лайншиты · Витрина бренда |
| Оптовые заказы | collection_order | Реестр B2B · Ритейлеры |
| Производство | order_production | Подтверждение → цех · Материалы |
| Связь | comms | Сообщения · Календарь |

Augment: `lib/brand-core-nav-augment.ts` + `withPlatformCoreNavHrefs` (native href, STRICT-safe).

### Shop / manufacturer / supplier

См. `lib/platform-core-role-nav-reference.ts` — меньше групп (empty pillars скрыты), тот же accordion-паттерн.

**DoD sidebar:** каждый `href` после augment → открывает `/…/core?pillar=…` без `archived=1`.
