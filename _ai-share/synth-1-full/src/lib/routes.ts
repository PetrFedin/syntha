/**
 * Константы маршрутов приложения — единый источник правды для href.
 * Использовать вместо строковых литералов в навигации, entity-links и ссылках.
 */

import type { UserRole } from '@/lib/types';
import { B2B_WHOLESALE_ORDER_CONTEXT_QUERY } from '@/lib/domain/cross-role-entity-ids';
import { workshop2ArticleHref, workshop2ArticlePath } from '@/lib/production/workshop2-url';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';

const B2B_CTX = B2B_WHOLESALE_ORDER_CONTEXT_QUERY;

/** Карточка B2B-заказа в кабинете бренда (`/brand/b2b-orders/[orderId]`). Отдельный экспорт — стабильная ссылка для демо-данных и чанков. */
export function brandB2bOrderHref(orderId: string): string {
  return `/brand/b2b-orders/${encodeURIComponent(orderId)}`;
}

/** Карточка заказа бренда · передача в производство (`?pillar=order_production#production-handoff`). */
export function brandB2bOrderHandoffContextHref(orderId: string): string {
  return `${brandB2bOrderHref(orderId)}?pillar=order_production#production-handoff`;
}

/** Реестр B2B бренда · query filter/order/partner (единый реестр collection_order). */
export function brandB2bOrdersRegistryHref(opts?: {
  filter?: 'awaiting_handoff' | 'in_production' | null;
  order?: string | null;
  partner?: string | null;
  /** @deprecated ignored — реестр только в collection_order */
  productionPillar?: boolean;
}): string {
  const sp = new URLSearchParams();
  const filter = opts?.filter ?? null;
  if (filter) sp.set('filter', filter);
  const order = opts?.order?.trim();
  if (order) sp.set('order', order);
  const partner = opts?.partner?.trim();
  if (partner && partner !== 'all') sp.set('partner', partner);
  const qs = sp.toString();
  return qs ? `${ROUTES.brand.b2bOrders}?${qs}` : ROUTES.brand.b2bOrders;
}

/** Реестр B2B бренда · заказы, ожидающие передачу в цех. */
export function brandB2bOrdersAwaitingHandoffRegistryHref(): string {
  return brandB2bOrdersRegistryHref({ filter: 'awaiting_handoff' });
}

/** Реестр B2B бренда · заказы в производстве (после handoff). */
export function brandB2bOrdersProductionRegistryHref(orderId?: string): string {
  return brandB2bOrdersRegistryHref({
    filter: 'in_production',
    order: orderId ?? null,
  });
}

/** Реестр B2B бренда · столп «Приём заказов» (без `pillar=order_production`). */
export function brandB2bOrdersCollectionRegistryHref(orderId?: string | null): string {
  return brandB2bOrdersRegistryHref({ productionPillar: false, order: orderId ?? null });
}

/** Кабинет бренда · столп «Выпуск» (`/brand/core?pillar=order_production`). */
export function brandCoreOrderProductionCabinetHref(collectionId: string): string {
  return `${ROUTES.brand.coreCabinet}?pillar=order_production&collection=${encodeURIComponent(collectionId)}`;
}

/** Кабинет бренда · столп «Оптовый заказ». */
export function brandCoreCollectionOrderCabinetHref(
  collectionId: string,
  orderId?: string | null
): string {
  const sp = new URLSearchParams({
    pillar: 'collection_order',
    collection: collectionId,
  });
  const oid = orderId?.trim();
  if (oid) sp.set('order', oid);
  return `${ROUTES.brand.coreCabinet}?${sp.toString()}`;
}

/** Заявки на изменение заказа бренда · фильтр по order. */
export function brandOrderAmendmentsOrderHref(orderId: string): string {
  return `${ROUTES.brand.orderAmendments}?order=${encodeURIComponent(orderId)}`;
}

/** Кабинет магазина · столп «Оптовый заказ». */
export function shopCoreCollectionOrderCabinetHref(
  collectionId: string,
  orderId?: string | null
): string {
  const sp = new URLSearchParams({
    pillar: 'collection_order',
    collection: collectionId,
  });
  const oid = orderId?.trim();
  if (oid) sp.set('order', oid);
  return `${ROUTES.shop.coreCabinet}?${sp.toString()}`;
}

/** Карточка заказа бренда · мониторинг цепочки/PO (`?pillar=order_production`). */
export function brandB2bOrderChainContextHref(orderId: string): string {
  return `${brandB2bOrderHref(orderId)}?pillar=order_production`;
}

/** Карточка заказа бренда · контекст ТЗ/W2 (`?pillar=order_production#production-dossier`). */
export function brandB2bOrderDossierContextHref(orderId: string): string {
  return `${brandB2bOrderHref(orderId)}?pillar=order_production#production-dossier`;
}

/** W2 артикула · вкладка ТЗ, секция материалов (BOM перед handoff). */
export function brandW2ProductionTzHref(collectionId: string, articleId: string): string {
  return workshop2ArticleHref(collectionId, articleId, { w2pane: 'tz', w2sec: 'material' });
}

/** Досье цеха (read-only peer) с опциональным контекстом коллекции. */
export function factoryProductionDossierHref(
  articleId: string,
  opts?: { collectionId?: string }
): string {
  const base = `/factory/production/dossier/${encodeURIComponent(articleId)}`;
  const cid = opts?.collectionId?.trim();
  return cid ? `${base}?collection=${encodeURIComponent(cid)}` : base;
}

/** Досье цеха в контексте столпа «Выпуск» (`?pillar=order_production`, опционально `order=`). */
export function factoryProductionDossierContextHref(
  articleId: string,
  opts?: { collectionId?: string; orderId?: string }
): string {
  const sp = new URLSearchParams({ pillar: 'order_production' });
  const cid = opts?.collectionId?.trim();
  if (cid) sp.set('collection', cid);
  const oid = opts?.orderId?.trim();
  if (oid) sp.set('order', oid);
  return `/factory/production/dossier/${encodeURIComponent(articleId)}?${sp.toString()}`;
}

/** Кабинет цеха · столп «Выпуск». */
export function factoryCoreOrderProductionCabinetHref(collectionId: string): string {
  return `${ROUTES.factory.productionCoreCabinet}?pillar=order_production&collection=${encodeURIComponent(collectionId)}`;
}

/** Кабинет поставщика · столп «Выпуск» (закупка). */
export function factorySupplierCoreOrderProductionCabinetHref(collectionId: string): string {
  return `${ROUTES.factory.supplierCoreCabinet}?pillar=order_production&collection=${encodeURIComponent(collectionId)}`;
}

/** Карточка B2B-заказа в кабинете байера (`/shop/b2b/orders/[orderId]`). */
export function shopB2bOrderHref(orderId: string): string {
  return `/shop/b2b/orders/${encodeURIComponent(orderId)}`;
}

/** Tracking с якорем на строку заказа (query `order`). */
export function shopB2bTrackingOrderHref(orderId: string): string {
  return `${ROUTES.shop.b2bTracking}?order=${encodeURIComponent(orderId)}`;
}

/** Карточка заказа магазина · статус PO (canonical: detail + buyer-tracking). */
export function shopB2bOrderProductionContextHref(orderId: string): string {
  return `${shopB2bOrderHref(orderId)}#shop-co-buyer-tracking`;
}

/** Реестр заказов магазина · query filter/order (единый реестр collection_order). */
export function shopB2bOrdersRegistryHref(opts?: {
  filter?: 'in_production' | null;
  order?: string | null;
  /** @deprecated ignored — реестр только в collection_order */
  productionPillar?: boolean;
}): string {
  const sp = new URLSearchParams();
  const filter = opts?.filter ?? null;
  if (filter) sp.set('filter', filter);
  const order = opts?.order?.trim();
  if (order) sp.set('order', order);
  const qs = sp.toString();
  return qs ? `${ROUTES.shop.b2bOrders}?${qs}` : ROUTES.shop.b2bOrders;
}

/** Реестр заказов магазина · фильтр «В производстве». */
export function shopB2bOrdersProductionRegistryHref(orderId?: string): string {
  return shopB2bOrdersRegistryHref({
    filter: 'in_production',
    order: orderId ?? null,
  });
}

/** Реестр заказов магазина · столп «Оптовый заказ» (без `pillar=order_production`). */
export function shopB2bOrdersCollectionRegistryHref(orderId?: string | null): string {
  return shopB2bOrdersRegistryHref({ productionPillar: false, order: orderId ?? null });
}

/** Реестр производственных серий цеха с контекстом B2B-заказа (`?order=`). */
export function factoryProductionOrdersOrderContextHref(
  orderId: string,
  opts?: { factoryId?: string }
): string {
  const sp = new URLSearchParams({ order: orderId });
  if (opts?.factoryId?.trim()) sp.set('factoryId', opts.factoryId.trim());
  return `${ROUTES.factory.productionOrders}?${sp.toString()}`;
}

/** Очередь передачи в цех с контекстом B2B-заказа (workspace tab `pcf=handoff`). */
export function factoryProductionHandoffQueueHref(
  orderId: string,
  opts?: { factoryId?: string; collectionId?: string }
): string {
  const sp = new URLSearchParams({ order: orderId });
  if (opts?.factoryId?.trim()) sp.set('factoryId', opts.factoryId.trim());
  if (opts?.collectionId?.trim()) sp.set('collection', opts.collectionId.trim());
  sp.set(PILLAR_CAPABILITY_FEATURE_PARAM, 'handoff');
  return `${ROUTES.factory.production}?${sp.toString()}#handoff-queue`;
}

/** Checkout магазина с контекстом коллекции (deep-link из бренда). */
export function shopB2bCheckoutCollectionHref(
  collectionId: string,
  opts?: { buyerId?: string }
): string {
  const sp = new URLSearchParams({ collection: collectionId });
  const buyerId = opts?.buyerId?.trim();
  if (buyerId && buyerId !== 'shop1') {
    sp.set('buyer', buyerId);
  }
  return `${ROUTES.shop.b2bCheckout}?${sp.toString()}`;
}

/** Матрица магазина с фокусом на артикул (size run / checkout cross-link). */
export function shopB2bMatrixArticleHref(collectionId: string, articleId: string): string {
  const sp = new URLSearchParams({
    collection: collectionId.trim(),
    article: articleId.trim(),
  });
  return `${ROUTES.shop.b2bMatrix}?${sp.toString()}`;
}

/** Публичный профиль клиента по id/handle (`/client/{id}`). Кабинет «я» — `ROUTES.client.profile` (`/client/me`). */
export function clientPublicProfileHref(clientId: string): string {
  return `/client/${encodeURIComponent(clientId)}`;
}

// —— Client (клиент) ——
export const ROUTES = {
  client: {
    home: '/client',
    wardrobe: '/client/wardrobe',
    tryBeforeYouBuy: '/client/try-before-you-buy',
    orders: '/orders',
    returns: '/client/returns',
    giftRegistry: '/client/gift-registry',
    services: '/client/services',
    allergy: '/client/allergy',
    wishlist: '/client/wishlist',
    /** Сохранённые образы из корзины: состав, сумма, загрузка в корзину */
    myOutfits: '/client/my-outfits',
    catalog: '/client/catalog',
    /** Поиск похожих по фото (демо → витрина / search) */
    visualSearch: '/client/visual-search',
    /** Капсулы / готовые луки из избранного */
    capsules: '/client/capsules',
    /** Персональная лента: размеры, бренды, похожие на покупки */
    forYou: '/client/for-you',
    /** Палитра и сочетания по цвету товара (эвристика без CV) */
    colorStudio: '/client/color-studio',
    /** Рекомендация размера из профиля + голосов посадки (localStorage) */
    fitAdvisor: '/client/fit-advisor',
    /** Слоты образа + анализ «чего не хватает» */
    outfitBuilder: '/client/outfit-builder',
    /** Фильтр каталога по eco-сигналам (скоринг до LCA API) */
    sustainabilityExplorer: '/client/sustainability-explorer',
    /** Доска вдохновения: пины товаров, localStorage, экспорт JSON */
    inspirationBoard: '/client/inspiration-board',
    /** Сравнение двух SKU: размеры, состав, сезон */
    sizeCompare: '/client/size-compare',
    /** Каталог по сезонным корзинам + carryover */
    seasonAtlas: '/client/season-atlas',
    /** Дерево категорий из данных товаров */
    categoryAtlas: '/client/category-atlas',
    /** Отслеживание цены (localStorage + сравнение с каталогом) */
    priceWatch: '/client/price-watch',
    /** EU / US / UK и обувь — справочник из `lib/fashion/size-conversion` */
    sizeConverter: '/client/size-converter',
    /** Настройка параметров тела для авто-подбора размера */
    fitProfile: '/client/fit-profile',
    /** Лист ожидания отсутствующих размеров */
    waitlist: '/client/waitlist',
    /** Смежные SKU при отсутствии размера / цвета */
    skuAlternatives: '/client/sku-alternatives',
    /** Квиз стиля → профиль в localStorage и сортировка «Для вас» */
    styleQuiz: '/client/style-quiz',
    /** Оценка пошлины + НДС (демо, не юр. совет) */
    dutyEstimate: '/client/duty-estimate',
    /** Справочник пиктограмм ухода (библиотека + контекст PDP) */
    careSymbols: '/client/care-symbols',
    scanner: '/client/scanner',
    /** Личный профиль текущего клиента (номер/ид в URL: `/client/me`). */
    profile: '/client/me',
    /** Вкладки UI профиля (`?tab=`). */
    profileWithTab: (tab: string) => `/client/me?tab=${encodeURIComponent(tab)}`,
    profileCollections: '/client/me/collections',
    profilePayments: '/client/me/payments',
    /** Гардероб внутри профиля `/client/me/wardrobe` */
    profileWardrobe: '/client/me/wardrobe',
    /** Продление подписок / офферов в профиле */
    profileOffersRenewal: '/client/me/offers/renewal',
    /** Хаб паспортов (без захардкоженного ID); конкретный паспорт: passportById(id) */
    passport: '/client/passport',
    /** Календарь планов / событий в ЛК клиента (`StyleCalendar`, роль client) */
    calendar: '/client/calendar',
    /** Конструктор лекал (client workspace). */
    sewingPatterns: '/client/sewing-patterns',
    sewingPatternsPresetEditor: '/client/sewing-patterns/preset-editor',
  },
  // —— Brand (бренд) ——
  brand: {
    /** Кабинет бренда: каноничный профиль — `/brand/profile` (редирект с `/brand`) */
    home: '/brand/profile',
    organization: '/brand/profile?group=organization',
    /** Редирект на стратегию/обзор (`app/brand/organization/page.tsx`) */
    organizationPage: '/brand/organization',
    /** Хлебные крошки «Организация» → подразделы */
    organizationOverview: '/brand/profile?group=organization',
    /** Стратегия → обзор (совпадает с редиректом `/brand/organization`) */
    strategyOverview: '/brand/profile?group=strategy&tab=overview',
    /** Профиль бренда: юр. данные, Brand DNA, история */
    profile: '/brand/profile',
    team: '/brand/team',
    teamActivity: '/brand/team?tab=activity',
    teamTasks: '/brand/team?tab=tasks',
    teamPermissions: '/brand/team?tab=permissions',
    teamOrgchart: '/brand/team?tab=orgchart',
    teamPerformance: '/brand/team?tab=performance',
    integrations: '/brand/integrations',
    /** 1С, Мой Склад (РФ) */
    integrationsErpPlm: '/brand/integrations/erp-plm',
    integrationsWebhooks: '/brand/integrations/webhooks',
    integrationsSso: '/brand/integrations/sso',
    /** Архив западных B2B-платформ (демо-страницы) */
    integrationsJoor: '/brand/integrations/archive/joor',
    integrationsNuOrder: '/brand/integrations/archive/nuorder',
    integrationsFashionCloud: '/brand/integrations/archive/fashion-cloud',
    integrationsSparkLayer: '/brand/integrations/archive/sparklayer',
    integrationsColect: '/brand/integrations/archive/colect',
    integrationsZedonk: '/brand/integrations/archive/zedonk',
    integrationsCentric: '/brand/integrations/archive/centric',
    integrationsApparelMagic: '/brand/integrations/archive/apparel-magic',
    subscription: '/brand/subscription',
    documents: '/brand/documents',
    quality: '/brand/quality',
    reviews: '/brand/reviews',
    cms: '/brand/cms',
    ipLedger: '/brand/ip-ledger',
    settings: '/brand/settings',
    settingsApiHub: '/brand/settings/api-hub',
    security: '/brand/security',
    logistics: '/brand/logistics',
    warehouse: '/brand/warehouse',
    inventory: '/brand/inventory',
    logisticsDutyCalculator: '/brand/logistics/duty-calculator',
    logisticsConsolidation: '/brand/logistics/consolidation',
    logisticsShadowInventory: '/brand/logistics/shadow-inventory',
    logisticsRegions: '/brand/logistics/regions',
    compliance: '/brand/compliance',
    complianceStock: '/brand/compliance/stock',
    controlCenter: '/brand/control-center',
    dashboard: '/brand/dashboard',
    /** Личный кабинет Platform Core — столпы по роли */
    coreCabinet: '/brand/core',
    products: '/brand/products',
    /** Карточка товара в PIM бренда */
    productsCard: (productId: string) => `/brand/products/${encodeURIComponent(productId)}`,
    /** Создание карточки товара (wizard) */
    productsNew: '/brand/products/new',
    productsCreateReady: '/brand/products/create-ready',
    productsMatrix: '/brand/products/matrix',
    colors: '/brand/colors',
    planning: '/brand/planning',
    rangePlanner: '/brand/range-planner',
    merchandising: '/brand/merchandising',
    productsDigitalTwinTesting: '/brand/products/digital-twin-testing',
    /** Обувь: 360° ракурсы, GLB после скана, пресеты «с чем носить» */
    footwear360: '/brand/products/footwear-360',
    weatherCollections: '/brand/weather-collections',
    showroom: '/brand/showroom',
    showroomVr: '/brand/showroom/vr',
    /** JOOR-style: виртуальные выставки по сезонам (SS26, FW26), инвайты байерам */
    tradeShows: '/brand/b2b/trade-shows',
    /** JOOR Passport: единый портал выставки — нетворкинг, каталоги, заказы с события */
    b2bPassport: '/brand/b2b/passport',
    /** JOOR-style: заявки байеров на партнёрство → апрув брендом */
    buyerApplications: '/brand/b2b/buyer-applications',
    /** Brandboom: Private Invites по домену — доступ по корпоративному email */
    b2bPrivateInvites: '/brand/b2b/private-invites',
    b2bLinesheets: '/brand/b2b/linesheets',
    b2bLinesheetsCreate: '/brand/b2b/linesheets/create',
    /** NuOrder: кампании по лайншитам — отправка байерам, трекинг */
    b2bLinesheetCampaigns: '/brand/b2b/linesheet-campaigns',
    /** NuOrder: версии лайншита Early Bird / VIP / Outlet / Stock Lot */
    b2bLinesheetVersions: '/brand/b2b/linesheet-versions',
    b2bOrders: '/brand/b2b-orders',
    /** Карточка B2B-заказа бренда: `/brand/b2b-orders/[orderId]` */
    b2bOrder: brandB2bOrderHref,
    /** JOOR/NuOrder: генерация/загрузка PO, привязка к заказу */
    purchaseOrder: '/brand/b2b/po',
    /** JOOR/Zalando: ASN, статусы отгрузок (бренд) */
    b2bShipments: '/brand/b2b/shipments',
    /** JOOR/B2B: многошаговое согласование заказа */
    orderApprovalWorkflow: '/brand/b2b/order-approval-workflow',
    /** JOOR/NuOrder: заявки магазинов на изменение заказа (amendments) */
    orderAmendments: '/brand/b2b/order-amendments',
    /** JOOR: визиты шоурума/лайншита, вовлечённость ритейлеров */
    b2bEngagement: '/brand/b2b/engagement',
    /** Fashion Cloud: синдикация контента PIM → каталог байера, расписание, последнее обновление */
    contentSyndication: '/brand/b2b/content-syndication',
    /** Качество каталога: доля SKU без ошибок, поля с проблемами, экспорт SKU с ошибками в CSV */
    catalogQuality: '/brand/b2b/catalog-quality',
    /** Colect: коллекции как проекты — лукбук, права, до даты, watermarked PDF */
    lookbookProjects: '/brand/b2b/lookbook-projects',
    /** Colect: карта партнёров по территориям, конфликты, эксклюзив */
    partnerMap: '/brand/b2b/partner-map',
    /** SparkLayer: прайс-листы и акции по периоду/каналу */
    priceLists: '/brand/b2b/price-lists',
    /** Группы клиентов: розница, дистрибуция, франшиза */
    customerGroups: '/brand/b2b/customer-groups',
    /** Company accounts: юрлицо + несколько пользователей */
    companyAccounts: '/brand/b2b/company-accounts',
    /** Net terms, First order discount, НДС (РФ) */
    financeRf: '/brand/finance/rf-terms',
    /** Multi-location inventory: остатки по складам/городам */
    inventoryMultiLocation: '/brand/inventory/multi-location',
    retailers: '/brand/retailers',
    distributors: '/brand/distributors',
    preOrders: '/brand/pre-orders',
    bopis: '/brand/bopis',
    giftRegistry: '/brand/gift-registry',
    customers: '/brand/customers',
    customerIntelligence: '/brand/customer-intelligence',
    /** Активность клиентов: подписчики, лайки, избранное, образы, метрики, графики */
    customerActivity: '/brand/customer-activity',
    /** Список коллекций, архивы, создание карточки коллекции */
    collections: '/brand/collections',
    collectionsNew: '/brand/collections/new',
    production: '/brand/production',
    /** Разработка коллекции (workshop2): ТЗ и сэмплы по SKU до серии — отдельный путь. */
    productionWorkshop2: '/brand/production/workshop2',
    /** Единая операционная модель: коллекции, артикулы, PO, BOM, QC, интеграции (без API, под будущий бэкенд) */
    productionOperations: '/brand/production/operations',
    factories: '/brand/factories',
    materials: '/brand/materials',
    materialsReservation: '/brand/materials/reservation',
    productionReadyMade: '/brand/production/ready-made',
    vmi: '/brand/vmi',
    suppliers: '/brand/suppliers',
    productionFitComments: '/brand/production/fit-comments',
    productionGoldSample: '/brand/production/gold-sample',
    productionGantt: '/brand/production/gantt',
    productionDailyOutput: '/brand/production/daily-output',
    productionWorkerSkills: '/brand/production/worker-skills',
    productionQcApp: '/brand/production/qc-app',
    productionMilestonesVideo: '/brand/production/milestones-video',
    productionSubcontractor: '/brand/production/subcontractor',
    productionNesting: '/brand/production/nesting',
    /** Вкладка цеха на /brand/production (floorTab) */
    productionFloorTab: (tab: string) => `/brand/production?floorTab=${encodeURIComponent(tab)}`,
    /** Tech pack по id стиля (карточка артикула); для черновика можно передать new или SKU */
    productionTechPackStyle: (styleId: string) =>
      `/brand/production/tech-pack/${encodeURIComponent(styleId)}`,
    suppliersRfq: '/brand/suppliers/rfq',
    kickstarter: '/brand/kickstarter',
    promotions: '/brand/promotions',
    marketingSamples: '/brand/marketing/samples',
    /** Виртуальная примерка очков (eyewear), query ?frame= URL оправы */
    virtualTryonGlasses: '/brand/virtual-tryon/glasses',
    marketingTrendSentiment: '/brand/marketing/trend-sentiment',
    marketingHeritageTimeline: '/brand/marketing/heritage-timeline',
    marketingDesignCopyright: '/brand/marketing/design-copyright',
    contentHub: '/brand/content-hub',
    marketingContentFactory: '/brand/marketing/content-factory',
    media: '/brand/media',
    mediaVideoSpecs: '/brand/media/video-specs',
    blog: '/brand/blog',
    live: '/brand/live',
    /** LIVE process: хаб поэтапных схем */
    processLiveHub: '/brand/process/live',
    /** LIVE process по разделам (индивидуальные поэтапные схемы) */
    processLiveProduction: '/brand/process/production/live',
    processLiveB2b: '/brand/process/b2b/live',
    processLiveLogistics: '/brand/process/logistics/live',
    processLiveSourcing: '/brand/process/sourcing/live',
    processLiveQc: '/brand/process/qc/live',
    processLiveFinanceEscrow: '/brand/process/finance-escrow/live',
    processLiveOrderApproval: '/brand/process/order-approval/live',
    processLiveCompliance: '/brand/process/compliance/live',
    analyticsBi: '/brand/analytics-bi',
    analyticsPhase2: '/brand/analytics/phase2',
    budgetActual: '/brand/analytics/budget-actual',
    analytics360: '/brand/analytics-360',
    analytics: '/brand/analytics',
    /** Полная статистика продаж: Маркетрум и Аутлет платформы */
    analyticsPlatformSales: '/brand/analytics/platform-sales',
    /** Интеграция результатов продаж закупленных коллекций на других площадках */
    analyticsExternalSales: '/brand/analytics/external-sales',
    /** Сводная аналитика: все каналы на одной платформе для полного анализа */
    analyticsUnified: '/brand/analytics/unified',
    /** Network Sell-Through BI: сравнение с индустрией */
    analyticsSellThrough: '/brand/analytics/sell-through',
    /** Geo-Demand Heatmap: карта спроса по регионам */
    analyticsGeoDemand: '/brand/analytics/geo-demand',
    pricing: '/brand/pricing',
    pricingPriceComparison: '/brand/pricing/price-comparison',
    pricingElasticity: '/brand/pricing/elasticity',
    pricingMarkdown: '/brand/pricing/markdown',
    finance: '/brand/finance',
    financeLandedCost: '/brand/finance/landed-cost',
    financeEscrow: '/brand/finance/escrow',
    financeEmbeddedPayment: '/brand/finance/embedded-payment',
    disputes: '/brand/disputes',
    returnsClaims: '/brand/returns-claims',
    auctions: '/brand/auctions',
    auctionsNew: '/brand/auctions/new',
    circularHub: '/brand/circular-hub',
    customization: '/brand/customization',
    customizationPatterns: '/brand/customization/patterns',
    aiDesign: '/brand/ai-design',
    aiTools: '/brand/ai-tools',
    /** Хаб: клиентские фичи, партнёрский рост, демо-маркетинг (ссылки внутрь) */
    growthHub: '/brand/growth-hub',
    /** Сводка состава/ухода по SKU + CSV для PIM/маркетплейсов */
    fabricPassportRollup: '/brand/merch/fabric-passport',
    /** Полнота атрибутов SKU (composition, care, media…) */
    attributeHealth: '/brand/merch/attribute-health',
    /** Готовность карточек к дропу / публикации */
    launchReadiness: '/brand/merch/launch-readiness',
    /** Здоровье медиа-галереи SKU (кол-во фото, мета ширины) */
    mediaGalleryHealth: '/brand/merch/media-gallery',
    /** Доли категорий в каталоге (мерч, OTB-заготовка) */
    assortmentMix: '/brand/merch/assortment-mix',
    /** MOQ, короб, lead time, Incoterms по SKU */
    packRules: '/brand/merch/pack-rules',
    /** Статистика цен по категориям каталога */
    categoryPricing: '/brand/merch/category-pricing',
    /** SKU на цвет (color) — плотность ряда */
    colorwayCoverage: '/brand/merch/colorway-coverage',
    /** ТН ВЭД, ЕАС, страна — покрытие по SKU */
    tradeCodes: '/brand/merch/trade-codes',
    /** Управление бандлами и скидками на сеты */
    bundles: '/brand/merch/bundles',
    /** Анализ спроса на отсутствующие размеры (Waitlist) */
    demandForecast: '/brand/merch/demand-forecast',
    /** Оптовый лайншит коллекции (PDF/CSV/B2B) */
    linesheet: '/brand/merch/linesheet',
    /** Анализ скорости продаж и остатков (Merchandising) */
    salesVelocity: '/brand/merch/sales-velocity',
    /** Отчет по экологическому следу материалов (LCA) */
    lcaReport: '/brand/merch/lca-report',
    /** Права на использование медиа и кредиты талантов (DAM) */
    assetRights: '/brand/merch/asset-rights',
    /** Форма ввода оптового предзаказа (B2B Pre-Order) */
    wholesalePreorder: '/brand/merch/wholesale-preorder',
    /** Переброска остатков между складами (Stock Balance) */
    inventoryBalance: '/brand/merch/inventory-balance',
    /** Финансовые условия и кредитные лимиты байеров (B2B) */
    b2bFinance: '/brand/merch/b2b-finance',
    /** Анализ пересечения и каннибализации ассортимента */
    assortmentOverlap: '/brand/merch/assortment-overlap',
    /** Дашборд здоровья ассортимента (Aggregated Metrics) */
    assortmentHealth: '/brand/merch/assortment-health',
    /** Оценка и KPI поставщиков (Factory scorecard) */
    supplierScorecard: '/brand/merch/supplier-scorecard',
    /** Калькулятор маржинальности и прибыли по SKU */
    marginSimulator: '/brand/merch/margin-simulator',
    /** Аналитика причин возвратов (NLP/Sentiment) */
    returnIntelligence: '/brand/merch/return-intelligence',
    /** Оптимизация цен и уценки (Markdown Strategy) */
    markdownPredict: '/brand/merch/markdown-predict',
    /** Портал контроля качества на фабрике (QC Portal) */
    factoryQc: '/brand/merch/factory-qc',
    /** Запись в шоурум и календарь байера */
    showroomAppointments: '/brand/merch/appointments',
    /** Тестирование спроса на цифровые двойники (Design A/B) */
    digitalTwinTesting: '/brand/merch/digital-twin-testing',
    /** Планирование структуры коллекции (OTB/Mix) */
    assortmentMixPlanner: '/brand/merch/assortment-mix-planner',
    /** План подсортировки и авто-репликация запасов */
    replenishment: '/brand/merch/replenishment',
    /** Проверка контента под требования МП (Asset QA) */
    assetCompliance: '/brand/merch/asset-compliance',
    /** Управление версиями B2B кампаний и каталога */
    campaignVersions: '/brand/merch/campaign-versions',
    /** Агрегированный эко-отчет по всей коллекции */
    collectionLca: '/brand/merch/collection-lca',
    /** Анализ пробелов в ассортименте (Category Gaps) */
    assortmentGaps: '/brand/merch/assortment-gaps',
    /** Визуализация ценовой лестницы (Price Ladder) */
    priceLadder: '/brand/merch/price-ladder',
    /** Оптимизация визуальной сетки витрины */
    visualGrid: '/brand/merch/visual-grid',
    /** Управление B2B кампаниями */
    b2bCampaigns: '/brand/marketing/campaigns',
    /** Комплаенс и ЭДО (РФ) */
    localCompliance: '/brand/ops/local-compliance',
    /** Анализ влияния погоды на трафик */
    weatherTraffic: '/brand/ops/weather-traffic',
    /** Синхронизация с маркетплейсами (WB/Ozon) */
    marketplaceMapping: '/brand/merch/marketplace-mapping',
    /** Аналитика здоровья карточек на МП */
    marketplaceHealth: '/brand/merch/marketplace-health',
    /** Планировщик шоурумов B2B */
    showroomPlanner: '/brand/merch/showroom-planner',
    /** Активная сессия шоурума */
    showroomSession: (id: string) => `/brand/merch/showroom-session/${id}`,
    /** Карта регионального спроса (Heatmap) */
    regionalDemand: '/brand/merch/regional-demand',
    /** Генератор лайт-шитов */
    lineSheetGenerator: '/brand/merch/linesheet-generator',
    /** Индекс видимости в поиске МП */
    visibilityIndex: '/brand/merch/visibility-index',
    /** Реестр локальных поставщиков (СНГ) */
    cisSourcing: '/brand/merch/cis-sourcing',
    /** Совместная матрица ассортимента: канал × размер × цвет */
    partnerAssortmentMatrix: '/brand/partners/assortment-matrix',
    /** Предикт распродажи / markdown (правила + заготовка под ML) */
    partnerMarkdownPredict: '/brand/partners/markdown-predict',
    /** DAM: права, watermark, сроки лицензий */
    damContentRights: '/brand/media/content-rights',
    /** Портал фабрики: образцы, QC, отклонения от tech pack */
    factoryPortal: '/brand/factory-portal',
    /** Мониторинг карточек на маркетплейсах */
    marketplaceCardHealth: '/brand/integrations/marketplace-card-health',
    esg: '/brand/esg',
    collaborations: '/brand/collaborations',
    hrHub: '/brand/hr-hub',
    academy: '/brand/academy',
    academyTeam: '/brand/academy/team',
    academyKnowledge: '/brand/academy/knowledge',
    academyStores: '/brand/academy/stores',
    academyClients: '/brand/academy/clients',
    academyKnowledgeCreate: '/brand/academy/knowledge/create',
    academyKnowledgeArticle: (id: string) => `/brand/academy/knowledge/${id}`,
    academyCollectionTrainingCreate: '/brand/academy/collections/training',
    academyCollectionTraining: (id: string) => `/brand/academy/collections/training/${id}`,
    academyClientMaterialCreate: '/brand/academy/clients/materials',
    academyClientMaterial: (id: string) => `/brand/academy/clients/materials/${id}`,
    /** Студия партнёрской организации: курсы с модерацией платформы (демо) */
    academyOrganizationStudio: '/brand/academy/organization-studio',
    /** Академия платформы — курсы, пути, статьи, аттестации (внутри бренда) */
    academyPlatform: '/brand/academy/platform',
    academyPlatformCourse: (id: string) => `/brand/academy/platform/course/${id}`,
    academyPlatformPath: (id: string) => `/brand/academy/platform/path/${id}`,
    academyPlatformArticle: (id: string) => `/brand/academy/platform/article/${id}`,
    academyCourse: (id: string) => `/brand/academy/courses/${id}`,
    distributor: {
      territory: '/brand/distributor/territory',
      preOrderQuota: '/brand/distributor/pre-order-quota',
      commissions: '/brand/distributor/commissions',
    },
    marketing: {
      styleMeUpsell: '/brand/marketing/style-me-upsell',
      localInventoryAds: '/brand/marketing/local-inventory-ads',
    },
    shopifySync: '/shop/b2b/shopify-sync',
    videoConsultation: '/shop/b2b/video-consultation',
    preOrder: '/shop/b2b/pre-order',
    b2bMatrix: '/shop/b2b/matrix',
    investing: '/brand/investing',
    creditRisk: '/brand/credit-risk',
    lastCall: '/brand/last-call',
    messages: '/brand/messages',
    messagesChat: (chatId: string) => `/brand/messages?chat=${encodeURIComponent(chatId)}`,
    calendar: '/brand/calendar',
    tasks: '/brand/tasks',
    events: '/brand/events',
  },
  // —— Shop (магазин) ——
  shop: {
    home: '/shop',
    /** Личный кабинет Platform Core — столпы по роли */
    coreCabinet: '/shop/core',
    orders: '/shop/orders',
    /** Карточка розничного заказа: `/shop/orders/[orderId]` */
    order: (orderId: string) => `/shop/orders/${encodeURIComponent(orderId)}`,
    /** PDP в кабинете магазина */
    product: (productId: string) => `/shop/product/${encodeURIComponent(productId)}`,
    inventory: '/shop/inventory',
    inventoryHistorySku: (skuId: string) => `/shop/inventory/history/${encodeURIComponent(skuId)}`,
    inventoryArchive: '/shop/inventory/archive',
    promotions: '/shop/promotions',
    clienteling: '/shop/clienteling',
    bopis: '/shop/bopis',
    stylistTablet: '/shop/stylist-tablet',
    bnpl: '/shop/bnpl',
    cycleCounting: '/shop/inventory/cycle-counting',
    localInventoryAds: '/shop/local-inventory-ads',
    endlessAisle: '/shop/endless-aisle',
    shipFromStore: '/shop/ship-from-store',
    /** Корень B2B байера: редирект на `/shop` (`app/shop/b2b/page.tsx`). */
    b2b: '/shop/b2b',
    b2bCatalog: '/shop/b2b/catalog',
    b2bMatrix: '/shop/b2b/matrix',
    b2bWhiteboard: '/shop/b2b/whiteboard',
    b2bLandedCost: '/shop/b2b/landed-cost',
    /** AI Discovery Radar / свайп-поиск брендов (`/shop/b2b/partners/discover`). Не путать с легаси `b2bDiscover`. */
    b2bPartnersDiscover: '/shop/b2b/partners/discover',
    /** Для байера: подать заявку на партнёрство с брендом (JOOR-style) */
    b2bApply: '/shop/b2b/apply',
    /** JOOR Passport: портал выставки для байера */
    b2bPassport: '/shop/b2b/passport',
    /** JOOR Pay: оплата внутри платформы для байера */
    b2bPayment: '/shop/b2b/payment',
    /** JOOR Discover: каталог брендов, поиск, запрос доступа */
    /** Легаси-маршрут маркетплейса (`/shop/b2b/discover`); карточный radar — `b2bPartnersDiscover`. */
    b2bDiscover: '/shop/b2b/discover',
    /** Полноэкранная карта модулей B2B (DigitalWorkplaceMap) в кабинете ритейла. */
    b2bWorkspaceMap: '/shop/b2b/workspace-map',
    /** Для байера: выставки, на которые приглашён */
    b2bTradeShows: '/shop/b2b/trade-shows',
    /** Запись на визиты и встречи на выставке */
    b2bTradeShowAppointments: '/shop/b2b/trade-shows/appointments',
    /** Обучение по купленным коллекциям: product knowledge, мерчандайзинг, скрипты продаж */
    b2bAcademy: '/shop/b2b/academy',
    b2bAcademyKnowledge: (id: string) => `/shop/b2b/academy/knowledge/${id}`,
    b2bAcademyTraining: (id: string) => `/shop/b2b/academy/training/${id}`,
    b2bStockMap: '/shop/b2b/stock-map',
    b2bClaims: '/shop/b2b/claims',
    b2bOrders: '/shop/b2b/orders',
    /** Карточка B2B-заказа (байер): `/shop/b2b/orders/[orderId]` */
    b2bOrder: shopB2bOrderHref,
    /** Легаси-путь до редиректа на `b2bOrders` (RelatedModules / тесты дедупликации). */
    b2bOrdersLegacy: '/shop/b2b-orders',
    /** Единый дашборд: заказы по статусам, лимит, ожидает оплаты, оплачено, ссылки на оплату и документы */
    b2bFinance: '/shop/b2b/finance',
    /** Запрос увеличения кредитного лимита (демо-страница под финансы B2B) */
    b2bFinanceIncreaseLimit: '/shop/b2b/finance/increase-limit',
    b2bReplenishment: '/shop/b2b/replenishment',
    b2bTracking: '/shop/b2b/tracking',
    b2bBudget: '/shop/b2b/budget',
    b2bBudgetSeason: (seasonSlug: string) => `/shop/b2b/budget/${encodeURIComponent(seasonSlug)}`,
    b2bPartners: '/shop/b2b/partners',
    b2bPartnerRetailer: (slug: string) => `/shop/b2b/partners/${encodeURIComponent(slug)}`,
    b2bContracts: '/shop/b2b/contracts',
    b2bContract: (contractId: string) => `/shop/b2b/contracts/${encodeURIComponent(contractId)}`,
    b2bProduct: (productId: string) => `/shop/b2b/products/${encodeURIComponent(productId)}`,
    b2bKickstarterProject: (projectId: string) =>
      `/shop/b2b/kickstarter/${encodeURIComponent(projectId)}`,
    b2bRating: '/shop/b2b/rating',
    b2bDocuments: '/shop/b2b/documents',
    b2bShopifySync: '/shop/b2b/shopify-sync',
    b2bPartnerOnboarding: '/shop/b2b/partner-onboarding',
    b2bVideoConsultation: '/shop/b2b/video-consultation',
    b2bVipRoomBooking: '/shop/b2b/vip-room-booking',
    b2bPreOrder: '/shop/b2b/pre-order',
    /** NuOrder-style: единая точка входа — выбор режима заказа (Buy Now / Reorder / Pre-order) */
    b2bOrderMode: '/shop/b2b/order-mode',
    /** JOOR: написание заказа магазином — сезон, бренд, коллекция → матрица */
    b2bCreateOrder: '/shop/b2b/create-order',
    /** JOOR: заказ по коллекции/лукбуку — выбор коллекции, затем написание заказа */
    b2bOrderByCollection: '/shop/b2b/order-by-collection',
    /** JOOR: шаблоны заказов по коллекциям для быстрого повторного заказа */
    b2bOrderTemplates: '/shop/b2b/order-templates',
    /** JOOR: личные черновики заказов по коллекциям */
    b2bOrderDrafts: '/shop/b2b/order-drafts',
    /** JOOR: сроки и условия по коллекциям (дедлайны, MOQ, MOV) */
    b2bCollectionTerms: '/shop/b2b/collection-terms',
    /** NuOrder: календарь поставок / drop dates по брендам и коллекциям */
    b2bDeliveryCalendar: '/shop/b2b/delivery-calendar',
    /** Календарь B2B в кабинете ритейла (шоурум / встречи) */
    b2bCalendar: '/shop/b2b/calendar',
    /** Календарь закупок (отдельный экран от operational calendar) */
    b2bPurchaseCalendar: '/shop/b2b/purchase-calendar',
    /** JOOR/Colect: шаринг лукбука/коллекции — ссылка с истечением срока, пароль */
    b2bLookbookShare: '/shop/b2b/lookbook-share',
    /** Виртуальный шоурум: коллекции по бренду/сезону, лайншиты, заказ из лукбука */
    b2bShowroom: '/shop/b2b/showroom',
    /** Colect: лукбуки, доступные байеру (по правам и дате), заказ из лукбука */
    b2bLookbooks: '/shop/b2b/lookbooks',
    /** JOOR: Shoppable Lookbook — заказ прямо из lookbook (клик по look) */
    shoppableLookbook: (lookbookId: string) => `/shop/b2b/lookbooks/${lookbookId}/shoppable`,
    /** Le New Black: Le Privé — приватный VIP-шоурум по slug */
    vipShowroom: (slug: string) => `/s/prive/${slug}`,
    /** Le New Black/RepSpark: скан бирок; query `sampleId=srs-…` — резолв через GET /api/showroom-sample/:id; legacy `add` — base64url. */
    b2bScanner: '/shop/b2b/scanner',
    /** RepSpark: Product Customization в checkout — логотипы, мокапы */
    b2bCheckout: '/shop/b2b/checkout',
    /** Zedonk: агентский кабинет — один логин, несколько брендов, переключение, комиссии */
    b2bAgentCabinet: '/shop/b2b/agent',
    /** Zedonk: сводный заказ агента — один драфт по разным брендам, MOV/MOQ по бренду */
    b2bAgentConsolidatedOrder: '/shop/b2b/agent/consolidated-order',
    /** NuOrder-style: быстрый заказ по артикулам (стиль, размер, qty) */
    b2bQuickOrder: '/shop/b2b/quick-order',
    /** NuOrder-style: повтор заказа из истории (копия + правки) */
    b2bReorder: '/shop/b2b/reorder',
    /** NuOrder-style: планирование ассортимента байером до заказа */
    b2bAssortmentPlanning: '/shop/b2b/assortment-planning',
    /** Формирование селекции: сток / бренд-сезон / кросс-бренд, образы, аналитика, AI-рекомендации */
    b2bSelectionBuilder: '/shop/b2b/selection-builder',
    b2bGamification: '/shop/b2b/gamification',
    b2bSocialFeed: '/shop/b2b/social-feed',
    b2bOrderModes: '/shop/b2b/order-modes',
    b2bMarginCalculator: '/shop/b2b/margin-calculator',
    b2bMultiCurrency: '/shop/b2b/multi-currency',
    b2bAnalytics: '/shop/b2b/analytics',
    b2bMarginAnalysis: '/shop/b2b/margin-analysis',
    /** NuOrder: EZ Order — лайншит как форма заказа в один клик */
    b2bEzOrder: '/shop/b2b/ez-order',
    /** NuOrder: EZ Order по ссылке — заказ без входа (публичная страница /o/ez/[token]) */
    ezOrderByLink: (token: string) => `/o/ez/${token}`,
    /** RepSpark: Custom Assortments — персональный ассортимент под ритейлера */
    b2bCustomAssortments: '/shop/b2b/custom-assortments',
    /** Candid: Collaborative Order Forms + approval workflow (совместное заполнение + апрув) */
    b2bCollaborativeOrder: '/shop/b2b/collaborative-order',
    /** Shopify/Candid: Sales Rep Portal — портал для репов и showroom */
    b2bSalesRepPortal: '/shop/b2b/sales-rep-portal',
    /** NetSuite/BigCommerce: Quote-to-Order — переход от КП к заказу */
    b2bQuoteToOrder: '/shop/b2b/quote-to-order',
    /** NetSuite: Grid Ordering — массовое занесение позиций (таблица) */
    b2bGridOrdering: '/shop/b2b/grid-ordering',
    /** B2B-Center: Тендеры / аукционы — закупки через торги (РФ) */
    b2bTenders: '/shop/b2b/tenders',
    /** Alibaba/OroCommerce: RFQ — запрос котировок от поставщиков (покупатель) */
    b2bRfq: '/shop/b2b/rfq',
    b2bRfqCreate: '/shop/b2b/rfq/create',
    /** Supl.biz: Поиск поставщиков — реестр по гео и категориям (РФ) */
    b2bSupplierDiscovery: '/shop/b2b/supplier-discovery',
    /** Sellty/Compo: Личный кабинет дилера — документы, отчёты, индивидуальные цены */
    b2bDealerCabinet: '/shop/b2b/dealer-cabinet',
    /** Fashion Cloud: Smart Replenishment — автоматические рекомендации пополнения */
    b2bSmartReplenishment: '/shop/b2b/smart-replenishment',
    /** SparkLayer: Списки заказов — быстрый повтор прошлых заказов */
    b2bShoppingLists: '/shop/b2b/shopping-lists',
    /** Uphance: несколько корзин, совместное редактирование */
    b2bMultipleCarts: '/shop/b2b/multiple-carts',
    /** Uphance: избранные товары байера */
    b2bProductFavorites: '/shop/b2b/favorites',
    /** Uphance: курированные ассортименты для отправки байеру */
    b2bAssortmentCuration: '/shop/b2b/assortment-curation',
    /** Uphance/WizCommerce: баннеры — хиты, тренды, скидки */
    b2bProductBanners: '/shop/b2b/product-banners',
    /** WizCommerce: объёмные скидки, pack rules, минималки */
    b2bVolumePackRules: '/shop/b2b/volume-pack-rules',
    /** WizCommerce: AI-поиск и рекомендации */
    b2bAiSearch: '/shop/b2b/ai-search',
    /** OroCommerce: AI SmartOrder — черновик заказа из PDF/email PO */
    b2bAiSmartOrder: '/shop/b2b/ai-smart-order',
    /** NuOrder: Working Order — экспорт/импорт заказа (Excel шаблон) */
    b2bWorkingOrder: '/shop/b2b/working-order',
    /** NuOrder: аналитика по заказам — топ стилей, тренды */
    b2bOrderAnalytics: '/shop/b2b/order-analytics',
    /** Zalando ZEOS: дашборд фулфилмента и аналитики */
    b2bFulfillmentDashboard: '/shop/b2b/fulfillment-dashboard',
    /** ASOS: отчёт по марже по брендам/категориям */
    b2bMarginReport: '/shop/b2b/margin-report',
    /** JOOR/FashioNexus: аналитика для партнёра — продажи по брендам, топ SKU, sell-through, план/факт закупок, экспорт CSV */
    b2bReports: '/shop/b2b/reports',
    /** ASOS: маппинг размеров бренд → ритейл */
    b2bSizeMapping: '/shop/b2b/size-mapping',
    /** Подбор размера по росту/весу/замерам, размерная сетка по бренду */
    b2bSizeFinder: '/shop/b2b/size-finder',
    b2bSettings: '/shop/b2b/settings',
    analytics: '/shop/analytics',
    /** Розница: трафик по зонам / footfall (срез внутри `/shop/analytics/*`) */
    analyticsFootfall: '/shop/analytics/footfall',
    calendar: '/shop/calendar',
    messages: '/shop/messages',
    /** Внутренние сообщения с предвыбранным чатом (например академия: `?chat=academy_…`) */
    messagesChat: (chatId: string) => `/shop/messages?chat=${encodeURIComponent(chatId)}`,
    staff: '/shop/staff',
    career: '/shop/career',
  },
  // —— Admin (платформа) —— не путать с `brand.*` / `shop.*`
  admin: {
    home: '/admin',
    activity: '/admin/activity',
    audit: '/admin/audit',
    productionDossierMetrics: '/admin/production/dossier-metrics',
    productionDossierMetricsOps: '/admin/production/dossier-metrics/ops',
    users: '/admin/users',
    brands: '/admin/brands',
    attributes: '/admin/attributes',
    staff: '/admin/staff',
    appeals: '/admin/appeals',
    billing: '/admin/billing',
    bpiMatrix: '/admin/bpi-matrix',
    promotions: '/admin/promotions',
    promotionsCalendar: '/admin/promotions/calendar',
    /** CMS главной витрины (не путать с `admin.home`) */
    cmsHome: '/admin/home',
    quality: '/admin/quality',
    auctions: '/admin/auctions',
    messages: '/admin/messages',
    calendar: '/admin/calendar',
    integrations: '/admin/integrations',
    settings: '/admin/settings',
    disputes: '/admin/disputes',
    /** Модерация курсов брендов и организаций перед публикацией в клиентской академии */
    academyModeration: '/admin/academy/moderation',
  },
  // —— Дистрибьютор: standalone `/distributor/*` —— не путать с `brand.distributor.*`
  distributor: {
    home: '/distributor',
    orders: '/distributor/orders',
    order: (orderId: string) => `/distributor/orders/${encodeURIComponent(orderId)}`,
    retailers: '/distributor/retailers',
    commissions: '/distributor/commissions',
    analytics: '/distributor/analytics',
    brands: '/distributor/brands',
    matrix: '/distributor/matrix',
    calendar: '/distributor/calendar',
    contracts: '/distributor/contracts',
    settings: '/distributor/settings',
    territory: '/distributor/territory',
    staff: '/distributor/staff',
    showrooms: '/distributor/showrooms',
    finance: '/distributor/finance',
    messages: '/distributor/messages',
    vmi: '/distributor/vmi',
  },
  // —— Factory (цех / поставщик) ——
  factory: {
    home: '/factory',
    /** Сотрудники и доступы цеха / поставщика */
    staff: '/factory/staff',
    production: '/factory/production',
    /** Личный кабинет Platform Core — производство */
    productionCoreCabinet: '/factory/production/core',
    supplier: '/factory/supplier',
    /** Сообщения поставщика (role=supplier по pathname) */
    supplierMessages: '/factory/supplier/messages',
    /** RFQ inbox поставщика — отдельный маршрут (не alias messages?feature=rfq) */
    supplierRfqInbox: '/factory/supplier/rfq-inbox',
    /** Личный кабинет Platform Core — поставщик */
    supplierCoreCabinet: '/factory/supplier/core',
    supplierCircularHub: '/factory/supplier/circular-hub',
    messages: '/factory/messages',
    /** Календарь цеха/поставщика (role=supplier|manufacturer в query; вне production ACL). */
    calendar: '/factory/calendar',
    productionMaterials: '/factory/production/materials',
    productionCalendar: '/factory/production/calendar',
    productionCatalog: '/factory/production/catalog',
    productionOrders: '/factory/production/orders',
    productionBrands: '/factory/production/brands',
    productionFinance: '/factory/production/finance',
    productionCustomization: '/factory/production/customization',
    productionIotMonitoring: '/factory/production/iot-monitoring',
    productionInventoryRfidGates: '/factory/production/inventory/rfid-gates',
    /** Демо-лендинг; отдельного `page` может не быть */
    qc: '/factory/qc',
    live: '/factory/live',
  },
  // —— Общие / публичные ——
  home: '/',
  /** Каталог брендов: реальные бренды одежды, мультибрендовая витрина */
  catalog: '/catalog',
  /** Публичный Маркетрум: каталог, Shop-the-Look, AI Trend Radar */
  marketroom: '/marketroom',
  marketroomShopTheLook: '/marketroom#shop-the-look',
  marketroomTrendRadar: '/marketroom#trend-radar',
  storeLocator: '/store-locator',
  /** Публичная форма / страница обратной связи */
  contact: '/contact',
  academyPlatform: '/academy',
  /** Статья базы знаний в ЛК клиента (mock / education-data) */
  clientAcademyKnowledgeArticle: (slug: string) => `/academy/knowledge/${encodeURIComponent(slug)}`,
  /** Карточка курса платформы (mock / education-data) */
  clientAcademyCourse: (id: string) => `/academy/course/${encodeURIComponent(id)}`,
  /** Траектория обучения (mock / education-data) */
  clientAcademyPath: (id: string) => `/academy/path/${encodeURIComponent(id)}`,
};

/**
 * Календарь планов и событий по роли превью: клиент — ЛК `/client/calendar`,
 * ритейл — `/shop/calendar`, бренд — `/brand/calendar`, и т.д.
 * Использовать там, где выбран `viewRole` (например академия, кросс-ролевые ссылки).
 */
export function calendarHrefForRole(role: UserRole): string {
  switch (role) {
    case 'client':
      return ROUTES.client.calendar;
    case 'shop':
      return isPlatformCoreMode() ? ROUTES.shop.b2bCalendar : ROUTES.shop.calendar;
    case 'brand':
      return ROUTES.brand.calendar;
    case 'admin':
      return ROUTES.admin.calendar;
    case 'distributor':
      return ROUTES.distributor.calendar;
    case 'supplier':
    case 'manufacturer':
      return ROUTES.factory.productionCalendar;
    case 'b2b':
      return ROUTES.shop.b2bCalendar;
    default:
      return ROUTES.client.calendar;
  }
}

/** URL паспорта по ID (Digital Product Passport) */
export function passportById(id: string): string {
  return `${ROUTES.client.passport}/${encodeURIComponent(id)}`;
}

/** URL хаба коллекции по ID (концепция, ДНК, артикулы, инспирейшен, производство) */
export function collectionById(id: string): string {
  return `${ROUTES.brand.collections}/${encodeURIComponent(id)}`;
}

/** LIVE process — поэтапная схема с ответственными, датами, чатами и задачами (production, b2b, logistics, sourcing, qc, finance-escrow, order-approval, compliance) */
export function processLiveUrl(processId: string, contextId?: string): string {
  const base = `/brand/process/${encodeURIComponent(processId)}/live`;
  return contextId ? `${base}?context=${encodeURIComponent(contextId)}` : base;
}

/**
 * Сообщения с контекстом B2B-заказа: `order`, `orderId`, `q` — подхватывает {@link MessagesPage} в поиске чатов.
 */
function b2bOrderMessagesQuery(orderId: string): string {
  const id = encodeURIComponent(orderId);
  return `contextType=b2b_order&contextId=${id}&${B2B_CTX.order}=${id}&${B2B_CTX.orderId}=${id}&q=${encodeURIComponent(`B2B ${orderId}`)}`;
}

export function brandMessagesB2bOrderContextHref(orderId: string): string {
  return `${ROUTES.brand.messages}?${b2bOrderMessagesQuery(orderId)}`;
}

/** `/brand/messages` с контекстом артикула W2 (разработка → связь). */
export function brandMessagesWorkshop2ArticleContextHref(
  collectionId: string,
  articleId: string
): string {
  const ctx = encodeURIComponent(`${collectionId}:${articleId}`);
  return `${ROUTES.brand.messages}?contextType=workshop2_article&contextId=${ctx}`;
}

/** `/brand/calendar` с контекстом артикула W2 — канон core вместо syntha `layers=tasks`. */
export function brandCalendarWorkshop2ArticleContextHref(
  collectionId: string,
  articleId: string
): string {
  const ctx = encodeURIComponent(`${collectionId}:${articleId}`);
  const layers = isPlatformCoreMode() ? 'orders,logistics' : 'tasks';
  return `${ROUTES.brand.calendar}?layers=${layers}&contextType=workshop2_article&contextId=${ctx}`;
}

export function shopMessagesB2bOrderContextHref(orderId: string): string {
  return `${ROUTES.shop.messages}?${b2bOrderMessagesQuery(orderId)}`;
}

/** `/shop/messages` с контекстом артикула W2 (вопрос по SKU из витрины/матрицы). */
export function shopMessagesWorkshop2ArticleContextHref(
  collectionId: string,
  articleId: string
): string {
  const ctx = encodeURIComponent(`${collectionId}:${articleId}`);
  return `${ROUTES.shop.messages}?contextType=workshop2_article&contextId=${ctx}`;
}

export type FactoryMessagesRole = 'manufacturer' | 'supplier';

function factoryMessagesRoleQuery(role?: FactoryMessagesRole): string {
  return role ? `role=${role}` : '';
}

export function factoryMessagesB2bOrderContextHref(
  orderId: string,
  options?: { role?: FactoryMessagesRole }
): string {
  const base = `${ROUTES.factory.messages}?${b2bOrderMessagesQuery(orderId)}`;
  const roleQ = factoryMessagesRoleQuery(options?.role);
  return roleQ ? `${base}&${roleQ}` : base;
}

export function factoryMessagesWorkshop2ArticleContextHref(
  collectionId: string,
  articleId: string,
  options?: { role?: FactoryMessagesRole }
): string {
  const ctx = encodeURIComponent(`${collectionId}:${articleId}`);
  const base = `${ROUTES.factory.messages}?contextType=workshop2_article&contextId=${ctx}`;
  const roleQ = factoryMessagesRoleQuery(options?.role);
  return roleQ ? `${base}&${roleQ}` : base;
}

export function factoryMessagesRoleHref(role: FactoryMessagesRole): string {
  return `${ROUTES.factory.messages}?role=${role}`;
}

export function factorySupplierRfqInboxHref(input?: {
  collectionId?: string;
  articleId?: string;
}): string {
  const sp = new URLSearchParams();
  const collectionId = input?.collectionId?.trim();
  const articleId = input?.articleId?.trim();
  if (collectionId) sp.set('collection', collectionId);
  if (articleId) sp.set('article', articleId);
  const q = sp.toString();
  return q ? `${ROUTES.factory.supplierRfqInbox}?${q}` : ROUTES.factory.supplierRfqInbox;
}

/** `/factory/supplier/messages` с контекстом B2B (pathname → role=supplier). */
export function factorySupplierMessagesB2bOrderContextHref(orderId: string): string {
  return `${ROUTES.factory.supplierMessages}?${b2bOrderMessagesQuery(orderId)}`;
}

/** `/factory/supplier/messages` с контекстом артикула W2 (запрос цены через чат). */
export function factorySupplierMessagesWorkshop2ArticleContextHref(
  collectionId: string,
  articleId: string
): string {
  const ctx = encodeURIComponent(`${collectionId}:${articleId}`);
  return `${ROUTES.factory.supplierMessages}?contextType=workshop2_article&contextId=${ctx}`;
}

/** Календарь с привязкой к заказу (ручной контекст в URL для фильтров/поиска). */
export function brandCalendarB2bOrderContextHref(orderId: string): string {
  const id = encodeURIComponent(orderId);
  const layers = isPlatformCoreMode() ? 'orders,logistics' : 'tasks';
  return `${ROUTES.brand.calendar}?layers=${layers}&${B2B_CTX.order}=${id}&${B2B_CTX.orderId}=${id}`;
}

export function shopCalendarB2bOrderContextHref(orderId: string): string {
  const id = encodeURIComponent(orderId);
  const base = isPlatformCoreMode() ? ROUTES.shop.b2bCalendar : ROUTES.shop.calendar;
  const layers = isPlatformCoreMode() ? 'orders,logistics' : 'tasks';
  return `${base}?layers=${layers}&${B2B_CTX.order}=${id}`;
}

/** Календарь магазина: в core — B2B-календарь закупок, иначе розничный `/shop/calendar`. */
export function shopCanonicalCalendarHref(layers = 'orders,logistics'): string {
  const base = isPlatformCoreMode() ? ROUTES.shop.b2bCalendar : ROUTES.shop.calendar;
  return layers ? `${base}?layers=${encodeURIComponent(layers)}` : base;
}

export function factoryCalendarB2bOrderContextHref(orderId: string): string {
  const id = encodeURIComponent(orderId);
  return `${ROUTES.factory.productionCalendar}?layers=tasks,orders,production&${B2B_CTX.order}=${id}`;
}

/** Календарь поставщика с контекстом B2B-заказа (`/factory/calendar`, не production ACL). */
export function factorySupplierCalendarB2bOrderContextHref(orderId: string): string {
  const sp = new URLSearchParams({
    role: 'supplier',
    layers: 'tasks,orders,logistics',
  });
  sp.set(B2B_CTX.order, orderId);
  sp.set(B2B_CTX.orderId, orderId);
  return `${ROUTES.factory.calendar}?${sp.toString()}`;
}

/**
 * Матрица / селекции с контекстом B2B-заказа (`order`, `orderId`) — единый контур с {@link MessagesPage} и матрицей.
 */
export function brandProductsMatrixB2bOrderContextHref(orderId: string): string {
  const id = encodeURIComponent(orderId);
  return `${ROUTES.brand.productsMatrix}?${B2B_CTX.order}=${id}&${B2B_CTX.orderId}=${id}`;
}

export function shopB2bMatrixOrderContextHref(orderId: string): string {
  const id = encodeURIComponent(orderId);
  return `${ROUTES.shop.b2bMatrix}?${B2B_CTX.order}=${id}&${B2B_CTX.orderId}=${id}`;
}

/** Матрица с режимом повторного/изменённого заказа и опциональным контекстом B2B order. */
export function shopB2bMatrixReorderHref(
  collectionId: string,
  orderId?: string,
  opts?: { buyerId?: string }
): string {
  const sp = new URLSearchParams({
    collection: collectionId,
    mode: 'reorder',
  });
  if (orderId?.trim()) {
    const id = orderId.trim();
    sp.set(B2B_CTX.order, id);
    sp.set(B2B_CTX.orderId, id);
  }
  const buyerId = opts?.buyerId?.trim();
  if (buyerId && buyerId !== 'shop1') {
    sp.set('buyer', buyerId);
  }
  return `${ROUTES.shop.b2bMatrix}?${sp.toString()}`;
}

/** Матрица: вкладка inspector артикула (pcf=inspector + article). */
export function shopB2bMatrixArticleInspectorHref(
  collectionId: string,
  articleId: string,
  orderId?: string
): string {
  const sp = new URLSearchParams({
    collection: collectionId,
    article: articleId,
    pcf: 'inspector',
  });
  if (orderId?.trim()) {
    const id = orderId.trim();
    sp.set(B2B_CTX.order, id);
    sp.set(B2B_CTX.orderId, id);
  }
  return `${ROUTES.shop.b2bMatrix}?${sp.toString()}`;
}

/** Матрица: вкладка pre-pack / size curve. */
export function shopB2bMatrixPrepackHref(collectionId: string, orderId?: string): string {
  const sp = new URLSearchParams({
    collection: collectionId,
    pcf: 'prepack',
  });
  if (orderId?.trim()) {
    const id = orderId.trim();
    sp.set(B2B_CTX.order, id);
    sp.set(B2B_CTX.orderId, id);
  }
  return `${ROUTES.shop.b2bMatrix}?${sp.toString()}`;
}

/** Матрица: применить pre-pack breakdown в cart (matrix tab). */
export function shopB2bMatrixPrepackApplyHref(
  collectionId: string,
  articleId: string,
  packCount: number,
  orderId?: string
): string {
  const sp = new URLSearchParams({
    collection: collectionId,
    pcf: 'matrix',
    prepackApply: '1',
    prepackArticle: articleId,
    prepackPacks: String(Math.max(1, packCount)),
  });
  if (orderId?.trim()) {
    const id = orderId.trim();
    sp.set(B2B_CTX.order, id);
    sp.set(B2B_CTX.orderId, id);
  }
  return `${ROUTES.shop.b2bMatrix}?${sp.toString()}`;
}

export function shopB2bSelectionBuilderOrderContextHref(orderId: string): string {
  const id = encodeURIComponent(orderId);
  return `${ROUTES.shop.b2bSelectionBuilder}?${B2B_CTX.order}=${id}&${B2B_CTX.orderId}=${id}`;
}

export function shopB2bWhiteboardOrderContextHref(orderId: string): string {
  const id = encodeURIComponent(orderId);
  return `${ROUTES.shop.b2bWhiteboard}?${B2B_CTX.order}=${id}&${B2B_CTX.orderId}=${id}`;
}

/** Working Order (NuOrder) с привязкой к оптовому заказу — тот же query, что на карточке бренда. */
export function shopB2bWorkingOrderOrderContextHref(orderId: string): string {
  const id = encodeURIComponent(orderId);
  return `${ROUTES.shop.b2bWorkingOrder}?wholesaleOrderId=${id}&${B2B_CTX.order}=${id}&${B2B_CTX.orderId}=${id}`;
}

/** Хаб операций цеха с контекстом заказа (мост ядра №1 ↔ №2). */
export function brandProductionOperationsB2bOrderContextHref(orderId: string): string {
  const id = encodeURIComponent(orderId);
  return `${ROUTES.brand.productionOperations}?${B2B_CTX.order}=${id}&${B2B_CTX.orderId}=${id}`;
}

/**
 * Вкладка пола цеха (`/brand/production?floorTab=…`) с тем же контекстом коллекции,
 * что передаётся из разработки коллекции (`collectionId` на полу соответствует выбранной коллекции).
 * `stagesSku` — id строки артикула на полу (совпадает с query `w2art` в разработке коллекции), для вкладок, где нужен артикул.
 */
export function brandProductionFloorHref(
  floorTab: string,
  opts?: { collectionId?: string; stagesSku?: string }
): string {
  const u = new URLSearchParams();
  u.set('floorTab', floorTab);
  if (opts?.collectionId) u.set('collectionId', opts.collectionId);
  if (opts?.stagesSku?.trim()) u.set('stagesSku', opts.stagesSku.trim());
  return `${ROUTES.brand.production}?${u.toString()}`;
}

/** Карточка артикула в разработке коллекции — тот же контекст, что `w2col` / `w2art` в query списка. */
export function brandWorkshop2ArticleCardHref(
  collectionId: string,
  articleSegment: string
): string {
  return workshop2ArticlePath(collectionId, articleSegment);
}

/** Добавляет `collectionId` к ссылке на модуль цеха (если коллекция выбрана в разработке коллекции). */
export function withBrandProductionCollectionContext(
  href: string,
  collectionId?: string | null
): string {
  return withBrandProductionDeepContext(href, { collectionId });
}

/**
 * Добавляет к URL модуля цеха `collectionId` и/или `stagesSku` (контекст коллекции и артикула из разработки коллекции).
 * Корректно мержит с уже существующими query-параметрами.
 */
export function withBrandProductionDeepContext(
  href: string,
  opts?: { collectionId?: string | null; stagesSku?: string | null }
): string {
  const cid = typeof opts?.collectionId === 'string' ? opts.collectionId.trim() : '';
  const sku = typeof opts?.stagesSku === 'string' ? opts.stagesSku.trim() : '';
  if (!cid && !sku) return href;
  const hashIdx = href.indexOf('#');
  const beforeHash = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
  const hash = hashIdx >= 0 ? href.slice(hashIdx) : '';
  const qIdx = beforeHash.indexOf('?');
  const base = qIdx >= 0 ? beforeHash.slice(0, qIdx) : beforeHash;
  const existing = qIdx >= 0 ? beforeHash.slice(qIdx + 1) : '';
  const u = new URLSearchParams(existing);
  if (cid) u.set('collectionId', cid);
  if (sku) u.set('stagesSku', sku);
  const q = u.toString();
  return `${base}${q ? `?${q}` : ''}${hash}`;
}

export type Routes = typeof ROUTES;
