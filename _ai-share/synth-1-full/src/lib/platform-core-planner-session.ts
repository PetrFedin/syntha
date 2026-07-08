import { PLATFORM_CORE_PLANNER_CLOSED_WAVE_GENERATION } from '@/lib/platform-core-planner-auto-done';
import type { PlannerPriority } from '@/lib/platform-core-planner';

export type PlatformCorePlannerSessionEntry = {
  title: string;
  detail: string;
  testids?: string;
};

export type PlatformCorePlannerNextEntry = {
  priority: PlannerPriority;
  title: string;
  hint?: string;
  href?: string;
};

export type PlatformCorePlannerSessionSummary = {
  generation: number;
  updatedAt: string;
  recentDone: PlatformCorePlannerSessionEntry[];
  nextUp: PlatformCorePlannerNextEntry[];
};

/** Живой журнал волны — показывается в hub «План» (gen синхронизирован с closed wave). */
export function getPlatformCorePlannerSessionSummary(): PlatformCorePlannerSessionSummary {
  return {
    generation: PLATFORM_CORE_PLANNER_CLOSED_WAVE_GENERATION,
    updatedAt: '2026-06-25T16:00:00.000Z',
    recentDone: [
      {
        title: 'tz signoff zone + brand tasks core strip',
        detail:
          'useWorkshop2Phase1DossierTzSignoffZone: digital+section signoff bundle. Brand /tasks: brand-tasks-core-calendar-strip в core mode. tsconfig.typecheck exclude _archive. core-66.',
        testids:
          'brand-tasks-core-calendar-strip, brand-tasks-kanban-pg, use-workshop2-phase1-dossier-tz-signoff-zone',
      },
      {
        title: 'sketch + final TZ wizard hooks + typecheck:ci',
        detail:
          'useWorkshop2Phase1DossierSketchWorkspaceState + FinalTzWizardController — sectionBodies zone. tsconfig.ci exclude __tests__ → typecheck:ci green в typecheck:platform-core. core-65.',
        testids:
          'brand-dev-dossier-panel, use-workshop2-phase1-dossier-sketch-workspace-state, use-workshop2-phase1-dossier-final-tz-wizard-controller',
      },
      {
        title: 'investor-summary + attr-comments hook',
        detail:
          'investor-summary read-only: readiness+brief; investor hub banner off на /platform core. useWorkshop2Phase1DossierAttrCommentsController — sectionBodies zone. core-64.',
        testids:
          'workshop2-investor-summary-page, use-workshop2-phase1-dossier-attr-comments-controller, brand-dev-dossier-panel',
      },
      {
        title: 'dossier persist core-state + typecheck gate',
        detail:
          'useWorkshop2Phase1DossierCoreState: dossier+persist+hydrate bundle; typecheck:platform-core в core:verify; brand OP BOM+materials одна строка. core-63.',
        testids:
          'brand-dev-dossier-panel, brand-op-bom-preview-badge, use-workshop2-phase1-dossier-core-state',
      },
      {
        title: 'dossier decomposition + shop notification prefs',
        detail:
          'Workshop2Phase1DossierPanel: rollback banner, factory-pin toast, jump-anchors hooks; decomposition manifest. Shop comms: notification prefs compact (localStorage stub). core-62.',
        testids:
          'workshop2-phase1-dossier-rollback-banner, shop-cm-notification-prefs-compact, platform-core-placeholder-brand-collaborations',
      },
      {
        title: 'WMS reserve copy + comms inbox Redis hub',
        detail:
          'platform-core-wms-reserve-copy: checkout/tracking/cabinet badges единый честный copy; supplier pending «заявка в PG». platform-core-comms-inbox-hub + inbox-stream SSE; health realtimeHubs matrix. core-61.',
        testids:
          'shop-co-checkout-inventory-hold, shop-co-tracking-reserve, sup-op-cabinet-wms-reserve-badge, comms-pillar-sse-live-badge',
      },
      {
        title: 'EMPTY27 PDF + compact comms + placeholder badges',
        detail:
          'Linesheets: brand-sc-linesheets-empty-pdf-hint + disabled PDF для EMPTY27; CommsNotificationCenterStrip compact на hub pillar; analytics placeholder disclaimer; RFQ redirect «чат». core-60.',
        testids:
          'brand-sc-linesheets-empty-pdf-hint, shop-cm-notification-center-compact, platform-core-placeholder-brand-analytics, platform-core-rfq-legacy-redirect',
      },
      {
        title: 'ERP UX backoff + honest pending copy',
        detail:
          'PlatformCoreErpRetryHint: live countdown erpNextRetryAt; brand pending hint; factory queue/registry — journal vs error buckets + row error copy. core-59.',
        testids:
          'brand-b2b-erp-pending-hint, brand-b2b-erp-auto-retry-hint, mfr-op-handoff-queue-erp-backoff-hint, factory-handoff-erp-retry-hint',
      },
      {
        title: 'range planner drag-reorder между tier',
        detail:
          'tierArticles в PG snapshot; RangePlannerTierArticleBoard: HTML5 drag + move-кнопки → PATCH assign. core-58: core→trend UI + dev-status round-trip; drag demo-ss27-02→novelty.',
        testids:
          'range-planner-tier-article-board, range-planner-tier-column-core, range-planner-tier-move-demo-ss27-01-trend',
      },
      {
        title: 'PO status SSE + second-actor live UI',
        detail:
          'Peer mirror: shop-co-chain-peer-po-pending/synced + status-summary; SSE/poll refetch без reload. core-57: brand confirm + factory ack → shop UI. Shop dashboard demo badge.',
        testids:
          'shop-co-chain-peer-po-pending, shop-co-chain-peer-po-synced, shop-co-chain-peer-status-summary, platform-core-placeholder-shop',
      },
      {
        title: 'logistics cross-role + PO peer mirror',
        detail:
          'PG B2B logistics-tracking API → spine mirror; brand-co-logistics-tracking-strip; shop-co-tracking-shipment на tracking/detail. core-56: ТТН A→B + factory ack → shop-co-chain-peer-po-synced.',
        testids:
          'brand-co-logistics-tracking-save, shop-co-tracking-shipment, shop-co-chain-peer-po-synced',
      },
      {
        title: 'manufacturer ERP clean-PG e2e',
        detail:
          'core-55: clean B2B-\\d+ → bulk ack → handoff ERP alert/retry UI + production-orders registry. Helpers bulkAckPgHandoffViaApi; factory-handoff-row testid для PG.',
        testids:
          'factory-handoff-row-B2B, mfr-op-handoff-queue-erp-alert, factory-handoff-erp-retry, factory-production-orders-erp-alert',
      },
      {
        title: 'dual-session + e2e drift + Kanban PG',
        detail:
          'core-54: brand POST → shop threads; confirm API → shop peer mirror UI; calendar PG round-trip. core-02: tracking-link вместо production-link. Kanban persistBrandTasks в PG.',
        testids:
          'shop-co-chain-peer-mirror, shop-co-registry-tracking-link, brand-tasks-kanban-pg, core-54-dual-session',
      },
      {
        title: 'shop partners PG onboarding',
        detail:
          'shop_b2b_partnerships: profile → requested → connected в PG. Discover: «Запросить доступ» + «Подтвердить доступ»; badge Заявка/Подключён + PG.',
        testids:
          'shop-sc-partners-request-access, shop-sc-partners-connect-demo, shop-sc-partners-source-pg',
      },
      {
        title: 'development-status SSE push',
        detail:
          'SSE development-status-stream + hub bump на sample/publish/gate/range-planner/article create. DevelopmentPillarCard Live badge; range-planner auto-refetch.',
        testids: 'brand-dev-development-sse-live-badge, mfr-dev-development-sse-live-badge',
      },
      {
        title: 'calendar/Kanban → PG SoT',
        detail:
          'listPlatformCoreUserCalendarTasks: PG-first при WORKSHOP2_DATABASE_URL (без spine merge/file). Health auxiliaryStores.calendarTasks. Kanban brand_tasks_kanban уже API-only в core.',
        testids: 'brand-cm-calendar-pg-required-hint, brand-tasks-kanban-pg',
      },
      {
        title: 'UI-mirror peer status + tracking→calendar',
        detail:
          'B2bOrderChainPeerMirrorStrip: бренд видит buyer-view по visibility policy; магазин — статус бренда + календарь. Tracking context strip → календарь order=.',
        testids:
          'brand-co-chain-peer-mirror, shop-co-chain-peer-mirror, shop-co-tracking-calendar-link',
      },
      {
        title: 'Навигация · hub labels + role sidebars',
        detail:
          'P2: подписи групп = hub pillars. Brand b2b + ритейлеры; shop partners discover/apply; manufacturer handoff/orders/dossier; supplier BOM + закупка под PO.',
        testids:
          'brand-sidebar-retailers-core, shop-sidebar-partners-discover-core, mfr-sidebar-handoff-queue-core, sup-sidebar-materials-procurement-core',
      },
      {
        title: 'Навигация · sidebar = hub pillars',
        detail:
          'Shop: partners в core после investor spine; pim — витрина+матрица без тройного showroom; b2b — реестр+трекинг. Brand: b2b → «Оптовые заказы». Supplier pim → «Материалы и закупка».',
        testids:
          'shop-sidebar-pim-showroom-core, shop-sidebar-b2b-tracking-core, shop-sidebar-partners',
      },
      {
        title: 'comms banner + calendar PG hint',
        detail:
          'Comms workspace: без дубля W2/чат в production banner; shortcuts off в core; календарь — короткий hint без PG; shop tracking только вне OP pillar.',
        testids:
          'brand-cm-calendar-pg-required-hint, communications-production-context-banner, shop-co-detail-tracking-link',
      },
      {
        title: 'shop CO path',
        detail:
          'Matrix/checkout: ShopScCabinetGoldenPathStrip + hubGadget; убран дубль context strip и header showroom; calendar events badge короче; SSE badge короче.',
        testids: 'shop-sc-cabinet-golden-path, shop-co-checkout-context-strip',
      },
      {
        title: 'golden path unify',
        detail:
          'Linesheets/showroom/W2: один BrandScCabinetGoldenPathStrip; footer CTA скрыт в core; dev banner off на golden paths; W2 hub без дубля лайншитов.',
        testids: 'brand-sc-unified-audit-path, brand-dev-w2-hub-context-strip',
      },
      {
        title: 'comms workspace',
        detail:
          'Comms: cross-nav + один баннер; убраны order/article strip и auto-thread; article dossier testid в баннере; registry strips → hubGadget.',
        testids: 'platform-core-comms-cross-nav, brand-cm-banner, brand-co-registry-context-strip',
      },
      {
        title: 'chain card + EMPTY27',
        detail:
          'B2bOrderChainStatusCard: hubGadget handoff strip без дубля чата; короче awaiting copy. BrandDevEmptyChainOnboarding: 2 CTA + SS27 links.',
        testids: 'brand-order-handoff-context-strip, brand-dev-empty-onboarding',
      },
      {
        title: 'OP/supplier/tracking',
        detail:
          'OP hub: чат только в comms; supplier compact без spine/SSE/дублей; tracking strip без чата; comms hub без placeholder-тредов; detail strips → hubGadget.',
        testids:
          'brand-op-cabinet-cta-strip, shop-co-tracking-context-strip, brand-cm-order-chat-link',
      },
      {
        title: 'hub gadget',
        detail:
          'hubGadget на все pillar cards; убран список «Разделы» из role core; dev — один golden strip; brand showroom — BrandScCabinetGoldenPathStrip; matrix без pre-order в coreMode.',
        testids:
          'brand-dev-cabinet-context-strip, brand-sc-unified-audit-path, role-pillar-primary-cta',
      },
      {
        title: 'Comms/calendar dedupe',
        detail:
          'Один cross-nav + order-strip; убраны дубли calendar-context; tracking без calendar CTA; brand calendar PG task create.',
        testids: 'platform-core-comms-cross-nav, brand-cm-order-context-strip',
      },
      {
        title: 'Comms и календарь',
        detail:
          'UAT diff panel, дубль publish-strip, W2 intro, op-pillar calendar/лишние CTA, pre-orders tail в calendar + entity-links.',
        testids: 'brand-sc-linesheets-pdf-disabled, brand-op-cabinet-cta-strip',
      },
      {
        title: 'Brand CRM invite',
        detail:
          'brand-co-registry-invite-panel — симметрия shop-sc-partners-invite, POST /api/brand/b2b/invites.',
        testids: 'brand-co-registry-invite-generate',
      },
      {
        title: 'B2C header в core',
        detail:
          'Platform Core: retail Header (АССОРТИМЕНТ/LIVE/корзина) скрыт на cabinet-путях; hub /platform — CoreModeHeader.',
        testids: 'core-mode-header, brand-co-registry-panel',
      },
      {
        title: 'Factory OP и comms',
        detail:
          'Чат убран с materials/handoff rows/OP cabinet в core; dossier golden strip без чата; FW27 banner короче; мёртвый OrderChatContextStrip удалён.',
        testids:
          'mfr-op-dossier-context-strip, sup-op-procurement-context-strip, platform-core-comms-cross-nav',
      },
      {
        title: 'Order detail, materials, tracking',
        detail:
          'Shop amend-card скрыт в core; chain card без дубля PO-link; materials без chain workspace; tracking без SSE/Выпуск; короткий PO/досье copy.',
        testids:
          'brand-co-detail-chat-link, shop-co-tracking-context-strip, sup-op-procurement-context-strip',
      },
      {
        title: 'Comms и реестр',
        detail:
          'Placeholder-треды без PG скрыты; hub comms без statusLine шума; invite вне golden strip; W2 hub без дубля publish-audit.',
        testids: 'comms-pillar-card, brand-co-registry-invite-panel, brand-sc-publish-audit-log',
      },
      {
        title: 'Factory и tracking',
        detail:
          'Order detail без footer-чата; OP hub compact без SSE; factory calendar/prod-orders/materials strips без дубля чата; tracking row без чата.',
        testids:
          'shop-co-detail-chat-link, comms-cross-nav-chat, factory-calendar-handoff-link, sup-op-procurement-context-strip',
      },
      {
        title: 'UX noise reduction',
        detail:
          'Hub comms compact: без search/notification center/section groups; order detail — чат на chain card.',
        testids: 'brand-co-detail-chat-link, shop-co-detail-chat-link, comms-pillar-card',
      },
      {
        title: 'Критичные e2e закрыты',
        detail: 'MES EMPTY27, PG-primary B2B, TZ export, contextual PG.',
      },
      {
        title: 'Образец → коллекция (P1)',
        detail: 'Cabinet sync, peer checkout, season matrix, linesheet diff, publish audit.',
        testids: 'brand-sc-cabinet-published-sync, shop-co-season-matrix-strip',
      },
      {
        title: 'Коллекция → заказ (P1)',
        detail: 'Batch delivery ack, CRM invite shop, checkout JWT, quick-add→matrix.',
        testids: 'shop-sc-partners-invite-panel, shop-co-buyer-delivery-batch-ack',
      },
      {
        title: 'Техдолг (закрыто)',
        detail: 'typecheck:w2; dossier PG-only banner; workflow → postgres store.',
      },
    ],
    nextUp: [
      {
        priority: 'P2',
        title: 'Full tsc (tsconfig.typecheck.json) green в CI',
        hint: 'снять continue-on-error; ~83 ошибок вне hot paths',
      },
      {
        priority: 'P2',
        title: 'role-hub-matrix / b2b-workspace-matrix — split configs',
        hint: 'вынести pillar CTA в модули по роли',
      },
    ],
  };
}
