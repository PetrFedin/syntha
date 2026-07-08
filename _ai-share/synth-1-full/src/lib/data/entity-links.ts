import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
/**
 * Перекрёстные ссылки между модулями Brand OS.
 * Используется в RelatedModulesBlock на страницах disputes, compliance, production и др.
 */
import {
  PRODUCTION_FLOOR_STEPS,
  productionFloorTabRequiresArticle,
} from '@/lib/production/floor-flow';
import { WORKSHOP2_DEVELOPMENT_FLOOR_TAB_IDS } from '@/lib/production/workshop2-development-scope';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  MATRIX_ORDER_LABEL,
  MY_CABINET_LABEL,
  SHOWROOM_SHOP_LABEL,
} from '@/lib/platform-core-canonical-labels';
import { platformCoreEntityLinkHiddenSet } from '@/lib/platform-core-entity-links-registry';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { ROUTES, brandProductionFloorHref, withBrandProductionDeepContext } from '@/lib/routes';
import { COLLECTION_DEV_HUB_TITLE_RU } from '@/lib/production/collection-development-labels';
import { WORKSHOP2_COL_PARAM } from '@/lib/production/workshop2-url';

/** Связанный модуль: подпись + href (RelatedModulesBlock, дашборды). */
export type EntityLink = {
  label: string;
  href: string;
  disabled?: boolean;
  disabledReasonRu?: string;
};

/** Схлопывает одинаковый хаб по каноническому href (редирект `/shop/b2b-orders` → `/shop/b2b/orders`). */
export function dedupeEntityLinksByHref(links: EntityLink[]): EntityLink[] {
  const legacy = ROUTES.shop.b2bOrdersLegacy;
  const canonical = ROUTES.shop.b2bOrders;
  const byNorm = new Map<string, EntityLink>();
  for (const link of links) {
    const href = link.href as string;
    const norm = href === legacy ? canonical : href;
    byNorm.set(norm, href === legacy ? { ...link, href: canonical } : link);
  }
  return [...byNorm.values()];
}

const PLATFORM_CORE_ENTITY_LINK_HIDDEN = platformCoreEntityLinkHiddenSet();

function rewriteEntityLinkForPlatformCore(link: EntityLink): EntityLink | null {
  const href = link.href as string;
  if (PLATFORM_CORE_ENTITY_LINK_HIDDEN.has(href)) return null;
  if (href === LEGACY_ROUTES.shop.b2bDiscover) {
    return {
      ...link,
      href: ROUTES.shop.b2bPartnersDiscover,
      label: link.label.toLowerCase().includes('discover') ? 'Партнёры брендов' : link.label,
    };
  }
  if (href === LEGACY_ROUTES.shop.b2bCatalog) {
    return {
      ...link,
      href: `${ROUTES.shop.b2bShowroom}?collection=${PLATFORM_CORE_DEMO.collectionId}`,
      label: SHOWROOM_SHOP_LABEL,
    };
  }
  if (href === ROUTES.brand.production || href === ROUTES.brand.productionOperations) {
    return { ...link, href: EXTENDED_ROUTES.factory.production, label: 'Очередь цеха' };
  }
  if (link.label.includes('JOOR Pay')) {
    return null;
  }
  return link;
}

/** Core: убираем mock/side-path и переписываем legacy href на golden path. */
export function sanitizeEntityLinksForPlatformCore(links: EntityLink[]): EntityLink[] {
  if (!isPlatformCoreMode()) return links;
  return links.map(rewriteEntityLinkForPlatformCore).filter((l): l is EntityLink => l !== null);
}

/** Связанные модули: без дублей хаба B2B заказов (legacy + canonical). */
export function finalizeRelatedModuleLinks(links: EntityLink[]): EntityLink[] {
  return sanitizeEntityLinksForPlatformCore(dedupeEntityLinksByHref(links));
}

/** Убирает прямые ссылки на списки B2B-заказов из «связанных модулей», чтобы не дублировать реестр (карточки/навигация). */
function filterB2B(links: EntityLink[]): EntityLink[] {
  return links.filter(
    (l) =>
      (l.href as string) !== ROUTES.brand.b2bOrders && (l.href as string) !== ROUTES.shop.b2bOrders
  );
}

/** Ссылки для Dispute Hub — арбитраж, претензии, Escrow */
export function getArbitrationLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Заявки на изменение', href: LEGACY_ROUTES.brand.orderAmendments },
    { label: 'Возвраты', href: ROUTES.brand.returnsClaims },
    { label: 'Escrow', href: ROUTES.brand.financeEscrow },
    { label: 'LIVE QC', href: ROUTES.brand.processLiveQc },
    { label: 'Календарь', href: ROUTES.brand.calendar },
    { label: 'ЭДО и Compliance', href: ROUTES.brand.compliance },
    { label: 'Сообщения', href: ROUTES.brand.messages },
    { label: 'Production', href: ROUTES.brand.production },
    { label: 'Матрица остатков', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'Финансы', href: ROUTES.brand.finance },
  ]);
}

/** Ссылки для Compliance — ЭДО, маркировка, сертификация */
export function getComplianceLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Production', href: ROUTES.brand.production },
    { label: 'LIVE Compliance', href: ROUTES.brand.processLiveCompliance },
    { label: 'Склад', href: ROUTES.brand.warehouse },
    { label: 'Склад КИЗ', href: ROUTES.brand.complianceStock },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'Логистика', href: ROUTES.brand.logistics },
    { label: 'Документы', href: ROUTES.brand.documents },
    { label: 'Dispute Hub', href: ROUTES.brand.disputes },
    { label: 'Gold Sample', href: ROUTES.brand.productionGoldSample },
  ]);
}

/** Ссылки для Production — цех, сэмплы, PO, QC */
export function getProductionLinks(): EntityLink[] {
  return filterB2B([
    { label: 'LIVE Production', href: ROUTES.brand.processLiveProduction },
    { label: 'B2B: исполнение заказов (LIVE)', href: ROUTES.brand.processLiveB2b },
    { label: 'ЭДО и Compliance', href: ROUTES.brand.compliance },
    { label: 'Gold Sample', href: ROUTES.brand.productionGoldSample },
    { label: 'Склад', href: ROUTES.brand.warehouse },
    { label: 'Матрица остатков', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'Календарь', href: ROUTES.brand.calendar },
    { label: 'Фабрики', href: ROUTES.brand.factories },
    { label: 'Рост платформы (демо)', href: ROUTES.brand.growthHub },
  ]);
}

/**
 * Вкладки пола `/brand/production` для разработки коллекции: контекст коллекции (`w2col` → `collectionId`) и,
 * при выбранном артикуле, `stagesSku` на вкладках, где пол требует артикул.
 */
export function getWorkshop2FloorTabLinks(
  collectionId?: string | null,
  articleLineId?: string | null
): EntityLink[] {
  const cid = collectionId?.trim() || undefined;
  const aid = articleLineId?.trim() || undefined;
  return PRODUCTION_FLOOR_STEPS.map((s) => {
    const stagesSku = aid && productionFloorTabRequiresArticle(s.id) ? aid : undefined;
    return {
      label: s.label,
      href: brandProductionFloorHref(s.id, {
        collectionId: cid,
        ...(stagesSku ? { stagesSku } : {}),
      }),
    };
  });
}

/**
 * Отдельные страницы и хабы цеха (дополнение к вкладкам пола): семплы, материалы, QC, выпуск и т.д.
 * При наличии артикула в разработке коллекции передаётся `stagesSku` для сквозного контекста на полу.
 */
export function getWorkshop2FloorExtraModuleLinks(
  collectionId?: string | null,
  articleLineId?: string | null
): EntityLink[] {
  const deep = (href: string) =>
    withBrandProductionDeepContext(href, { collectionId, stagesSku: articleLineId });
  return filterB2B([
    { label: 'Матрица SKU (бренд)', href: deep(ROUTES.brand.productsMatrix) },
    { label: 'Хаб операций и PO', href: deep(ROUTES.brand.productionOperations) },
    { label: 'Gold Sample', href: deep(ROUTES.brand.productionGoldSample) },
    { label: 'Fit-комментарии', href: deep(ROUTES.brand.productionFitComments) },
    { label: 'Gantt', href: deep(ROUTES.brand.productionGantt) },
    { label: 'QC-приложение', href: deep(ROUTES.brand.productionQcApp) },
    { label: 'Бронирование материалов', href: deep(ROUTES.brand.materialsReservation) },
    { label: 'VMI', href: deep(ROUTES.brand.vmi) },
    { label: 'Nesting (страница)', href: deep(ROUTES.brand.productionNesting) },
    {
      label: 'LIVE Production (процесс)',
      href: withBrandProductionDeepContext(ROUTES.brand.processLiveProduction, {
        collectionId,
        stagesSku: undefined,
      }),
    },
    { label: 'Суточный выпуск', href: deep(ROUTES.brand.productionDailyOutput) },
    { label: 'Навыки смен', href: deep(ROUTES.brand.productionWorkerSkills) },
    { label: 'Субподряд', href: deep(ROUTES.brand.productionSubcontractor) },
    { label: 'Видеоэтапы', href: deep(ROUTES.brand.productionMilestonesVideo) },
    { label: 'Ready-made', href: deep(ROUTES.brand.productionReadyMade) },
  ]);
}

/**
 * Разработка коллекции (workshop2) — только образец на полу: вкладки без серии, nesting, выпуска партий и складского масштаба.
 * Согласовано с правой частью мини-шкалы в списке коллекции (зона каталога от якоря supply-path и далее, в т.ч. samples —
 * отдельный контур от «Разработка» слева).
 * @see WORKSHOP2_DEVELOPMENT_FLOOR_TAB_IDS
 */
export function getWorkshop2DevelopmentFloorTabLinks(
  collectionId?: string | null,
  articleLineId?: string | null
): EntityLink[] {
  const cid = collectionId?.trim() || undefined;
  const aid = articleLineId?.trim() || undefined;
  return WORKSHOP2_DEVELOPMENT_FLOOR_TAB_IDS.map((tabId) => {
    const s = PRODUCTION_FLOOR_STEPS.find((x) => x.id === tabId);
    if (!s) return { label: tabId, href: brandProductionFloorHref(tabId, { collectionId: cid }) };
    const stagesSku = aid && productionFloorTabRequiresArticle(tabId) ? aid : undefined;
    return {
      label: s.label,
      href: brandProductionFloorHref(tabId, {
        collectionId: cid,
        ...(stagesSku ? { stagesSku } : {}),
      }),
    };
  });
}

/**
 * Модули пола для контура «образец и шоурум» — без PO серии, смен, субподряда масштаба заказа.
 */
export function getWorkshop2DevelopmentExtraModuleLinks(
  collectionId?: string | null,
  articleLineId?: string | null
): EntityLink[] {
  const deep = (href: string) =>
    withBrandProductionDeepContext(href, { collectionId, stagesSku: articleLineId });
  return filterB2B([
    { label: 'Gold Sample', href: deep(ROUTES.brand.productionGoldSample) },
    { label: 'Fit-комментарии', href: deep(ROUTES.brand.productionFitComments) },
    { label: 'Gantt · сроки разработки', href: deep(ROUTES.brand.productionGantt) },
    { label: 'QC · контроль образца', href: deep(ROUTES.brand.productionQcApp) },
    {
      label: 'Бронирование материалов (под образец)',
      href: deep(ROUTES.brand.materialsReservation),
    },
    { label: 'Шоурум', href: deep(ROUTES.brand.showroom) },
    { label: 'Коллекции · из готового ассортимента', href: ROUTES.brand.collections },
  ]);
}

/**
 * Явный выход из контура разработки коллекции: серия, опт, исполнение заказов.
 */
export function getWorkshop2HandoffToSeriesLinks(): EntityLink[] {
  return [
    { label: 'Пол цеха · серия и выпуск', href: ROUTES.brand.production },
    { label: 'Операции и PO', href: ROUTES.brand.productionOperations },
    { label: 'Реестр B2B-заказов', href: ROUTES.brand.b2bOrders },
    { label: 'Матрица SKU', href: ROUTES.brand.productsMatrix },
    { label: 'LIVE · исполнение заказов (B2B)', href: ROUTES.brand.processLiveB2b },
  ];
}

/** Ссылки для Академии — курсы, база знаний, клиенты, материалы */
export function getAcademyLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Курсы', href: ROUTES.brand.academy },
    { label: 'База знаний', href: ROUTES.brand.academyKnowledge },
    { label: 'Команда', href: ROUTES.brand.academyTeam },
    { label: 'Магазины', href: ROUTES.brand.academyStores },
    { label: 'Клиенты', href: ROUTES.brand.academyClients },
    { label: 'Академия платформы', href: ROUTES.brand.academyPlatform },
    { label: 'Студия организации', href: ROUTES.brand.academyOrganizationStudio },
    { label: 'Команда бренда', href: ROUTES.brand.team },
    { label: 'Compliance', href: ROUTES.brand.compliance },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
  ]);
}

/** Ссылки для Финансов — P&L, Escrow, факторинг */
export function getFinanceLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Escrow', href: ROUTES.brand.financeEscrow },
    { label: 'Landed Cost', href: ROUTES.brand.financeLandedCost },
    { label: 'ЭДО и Compliance', href: ROUTES.brand.compliance },
    { label: 'Production', href: ROUTES.brand.production },
    { label: 'Логистика', href: ROUTES.brand.logistics },
    { label: 'Матрица остатков', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'Dispute Hub', href: ROUTES.brand.disputes },
    { label: 'Документы', href: ROUTES.brand.documents },
  ]);
}

/** Ссылки для PIM/Products — коллекции, контент, compliance */
export function getProductLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Коллекции', href: ROUTES.brand.collections },
    { label: 'Матрица ассортимента', href: ROUTES.brand.productsMatrix },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'Content Factory', href: ROUTES.brand.marketingContentFactory },
    { label: 'Media & DAM', href: ROUTES.brand.media },
    { label: 'ЭДО и Compliance', href: ROUTES.brand.compliance },
    { label: 'B2B Шоурум', href: ROUTES.brand.showroom },
    { label: 'Лайншиты', href: ROUTES.brand.b2bLinesheets },
    { label: 'Production', href: ROUTES.brand.production },
    { label: 'Поставщики', href: ROUTES.brand.suppliers },
    { label: 'Рост платформы (демо)', href: ROUTES.brand.growthHub },
  ]);
}

/** Ссылки для B2B заказов — FEATURE_BENCHMARK: ship windows, price lists, RFQ, credit */
export function getB2BLinks(): EntityLink[] {
  return finalizeRelatedModuleLinks(
    filterB2B([
      { label: 'Предзаказы', href: ROUTES.brand.preOrders },
      { label: 'Прайс-листы', href: LEGACY_ROUTES.brand.priceLists },
      { label: 'RFQ поставщиков', href: ROUTES.brand.suppliersRfq },
      { label: 'Net terms (РФ)', href: ROUTES.brand.financeRf },
      { label: 'Лайншиты', href: ROUTES.brand.b2bLinesheets },
      { label: 'Production', href: ROUTES.brand.production },
      { label: 'LIVE B2B', href: ROUTES.brand.processLiveB2b },
      { label: 'Заявки на изменение', href: LEGACY_ROUTES.brand.orderAmendments },
      { label: 'ЭДО и Compliance', href: ROUTES.brand.compliance },
      { label: 'Склад', href: ROUTES.brand.warehouse },
      { label: 'Логистика', href: ROUTES.brand.logistics },
      { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
      { label: 'Финансы', href: ROUTES.brand.finance },
      { label: 'Dispute Hub', href: ROUTES.brand.disputes },
      /** Надстройка: коммуникации и сроки поверх ядра заказа ↔ производство */
      { label: 'Сообщения', href: ROUTES.brand.messages },
      { label: 'Календарь', href: ROUTES.brand.calendar },
      { label: 'Выставки', href: LEGACY_ROUTES.brand.tradeShows },
      { label: 'Партнёры', href: ROUTES.brand.retailers },
    ])
  );
}

/**
 * Ядро №1 (вертикаль): ТЗ изделия в кабинете бренда → задание на отшив.
 * `styleId` — id строки заказа / артикула (в demo совпадает с ключом tech-pack), см. `ROUTES.brand.productionTechPackStyle`.
 */
/** Быстрые переходы по трём ядрам с экрана байера (оптовый контур). */
export function getSynthaThreeCoresQuickLinksForBuyer(): EntityLink[] {
  if (isPlatformCoreMode()) {
    return [
      {
        label: SHOWROOM_SHOP_LABEL,
        href: `${ROUTES.shop.b2bShowroom}?collection=${PLATFORM_CORE_DEMO.collectionId}`,
      },
      { label: 'Реестр B2B', href: ROUTES.shop.b2bOrders },
      { label: 'Сообщения', href: ROUTES.shop.messages },
      {
        label: 'Календарь',
        href: `${ROUTES.shop.b2bCalendar}?layers=orders,logistics&collection=${PLATFORM_CORE_DEMO.collectionId}`,
      },
    ];
  }
  return [
    { label: 'Цех и ТЗ (бренд)', href: ROUTES.brand.productionOperations },
    { label: 'Реестр заказов', href: ROUTES.shop.b2bOrders },
    { label: 'Сообщения', href: ROUTES.shop.messages },
    { label: 'Задачи в календаре', href: `${ROUTES.shop.calendar}?layers=tasks` },
  ];
}

/** Быстрые переходы по трём ядрам из кабинета бренда (ТЗ, B2B, надстройка). */
export function getSynthaThreeCoresQuickLinksForBrand(): EntityLink[] {
  if (isPlatformCoreMode()) {
    return [
      {
        label: COLLECTION_DEV_HUB_TITLE_RU,
        href: `${ROUTES.brand.productionWorkshop2}?${WORKSHOP2_COL_PARAM}=${PLATFORM_CORE_DEMO.collectionId}`,
      },
      { label: 'Реестр B2B', href: ROUTES.brand.b2bOrders },
      { label: 'Очередь цеха', href: EXTENDED_ROUTES.factory.production },
      { label: 'Сообщения', href: ROUTES.brand.messages },
      {
        label: 'Календарь',
        href: `${ROUTES.brand.calendar}?layers=tasks,orders,production`,
      },
    ];
  }
  return [
    { label: 'Операции цеха', href: ROUTES.brand.productionOperations },
    { label: COLLECTION_DEV_HUB_TITLE_RU, href: ROUTES.brand.productionWorkshop2 },
    { label: 'Реестр B2B', href: ROUTES.brand.b2bOrders },
    { label: 'Сообщения', href: ROUTES.brand.messages },
    { label: 'Задачи в календаре', href: `${ROUTES.brand.calendar}?layers=tasks` },
  ];
}

export function getB2bOrderVerticalCoreLinks(styleId?: string): EntityLink[] {
  const floorHref = isPlatformCoreMode()
    ? EXTENDED_ROUTES.factory.production
    : ROUTES.brand.productionOperations;
  const out: EntityLink[] = [
    { label: 'Цех: задания и PO', href: floorHref },
    { label: 'ТЗ: досье разработки коллекции', href: ROUTES.brand.productionWorkshop2 },
    /** Мост к ядру №2: исполнение и статусы оптовых заказов из того же контура. */
    { label: 'Реестр B2B-заказов', href: ROUTES.brand.b2bOrders },
  ];
  if (styleId) {
    out.push({
      label: 'ТЗ по артикулу строки',
      href: ROUTES.brand.productionTechPackStyle(styleId),
    });
  }
  return out;
}

/**
 * Рёбра B2B-заказа между ролями (без `EXTENDED_ROUTES.factory.productionOrders` — тот же реестр, что и у бренда).
 * Склеивается с `getB2BLinks()` через `dedupeEntityLinksByHref` + `finalizeRelatedModuleLinks`.
 */
export function getBrandB2bOrdersCrossRoleLinks(): EntityLink[] {
  return [
    { label: 'Заказы байера (ритейл)', href: ROUTES.shop.b2bOrders },
    { label: 'Производственный хаб (factory)', href: EXTENDED_ROUTES.factory.production },
  ];
}

/** Те же рёбра с экрана заказов ритейла — исполнитель и factory shell. */
export function getShopB2bOrdersCrossRoleLinks(): EntityLink[] {
  return [
    { label: 'Заказы бренда (исполнение)', href: ROUTES.brand.b2bOrders },
    { label: 'Производственный хаб (factory)', href: EXTENDED_ROUTES.factory.production },
  ];
}

/** Дашборд ритейла: связь с исполнителем, качеством каталога и цехом. */
export function getShopB2bDashboardCrossRoleLinks(): EntityLink[] {
  return dedupeEntityLinksByHref([
    { label: 'Карта процессов B2B', href: LEGACY_ROUTES.shop.b2bWorkspaceMap },
    { label: 'Fulfillment (SLA)', href: LEGACY_ROUTES.shop.b2bFulfillmentDashboard },
    { label: 'RFQ и тендеры (витрина)', href: LEGACY_ROUTES.shop.b2bRfq },
    { label: 'Аналитика розницы', href: ROUTES.shop.analytics },
    { label: 'Трафик по зонам (footfall)', href: ROUTES.shop.analyticsFootfall },
    { label: 'Хаб маржи (B2B)', href: LEGACY_ROUTES.shop.b2bMarginAnalysis },
    { label: 'Landed cost', href: ROUTES.shop.b2bLandedCost },
    { label: 'Финансы партнёра', href: ROUTES.shop.b2bFinance },
    { label: 'Календарь поставок (ритейл)', href: LEGACY_ROUTES.shop.b2bDeliveryCalendar },
    { label: 'Заказы бренда (исполнение)', href: ROUTES.brand.b2bOrders },
    { label: 'RFQ материалов (бренд)', href: ROUTES.brand.suppliersRfq },
    { label: 'Качество B2B-каталога', href: LEGACY_ROUTES.brand.catalogQuality },
    { label: 'Синдикация (бренд)', href: LEGACY_ROUTES.brand.contentSyndication },
    { label: 'Производственный хаб (factory)', href: EXTENDED_ROUTES.factory.production },
    { label: 'Discover брендов', href: LEGACY_ROUTES.shop.b2bDiscover },
  ]);
}

/** Бренд: как партнёр видит ритейла (байерский контур). */
export function getBrandPartnerRetailCrossRoleLinks(): EntityLink[] {
  return dedupeEntityLinksByHref([
    { label: 'Кабинет магазина', href: ROUTES.shop.home },
    { label: 'Карта процессов B2B (ритейл)', href: LEGACY_ROUTES.shop.b2bWorkspaceMap },
    { label: 'Fulfillment (ритейл)', href: LEGACY_ROUTES.shop.b2bFulfillmentDashboard },
    { label: 'RFQ витрина (ритейл)', href: LEGACY_ROUTES.shop.b2bRfq },
    { label: 'Discover байеров', href: LEGACY_ROUTES.shop.b2bDiscover },
    { label: 'B2B каталог закупки', href: LEGACY_ROUTES.shop.b2bCatalog },
  ]);
}

/** Factory: связь с брендом и ритейлом при исполнении. */
export function getFactoryHubCrossRoleLinks(): EntityLink[] {
  return dedupeEntityLinksByHref([
    { label: 'Карта B2B (ритейл)', href: LEGACY_ROUTES.shop.b2bWorkspaceMap },
    { label: 'RFQ витрина (байер)', href: LEGACY_ROUTES.shop.b2bRfq },
    { label: 'Тендеры B2B (площадка)', href: LEGACY_ROUTES.shop.b2bTenders },
    { label: 'RFQ материалов (бренд)', href: ROUTES.brand.suppliersRfq },
    { label: 'B2B заказы бренда', href: ROUTES.brand.b2bOrders },
    { label: 'Качество каталога (бренд)', href: LEGACY_ROUTES.brand.catalogQuality },
    { label: 'Discover (ритейл)', href: LEGACY_ROUTES.shop.b2bDiscover },
    { label: 'Кабинет магазина', href: ROUTES.shop.home },
  ]);
}

/** Дистрибьютор: ритейл, бренд-исполнение, производство. */
export function getDistributorCrossRoleLinks(): EntityLink[] {
  return dedupeEntityLinksByHref([
    { label: 'Карта процессов B2B', href: LEGACY_ROUTES.shop.b2bWorkspaceMap },
    { label: 'Fulfillment', href: LEGACY_ROUTES.shop.b2bFulfillmentDashboard },
    { label: 'RFQ', href: LEGACY_ROUTES.shop.b2bRfq },
    { label: 'Кабинет магазина', href: ROUTES.shop.home },
    { label: 'Discover байеров', href: LEGACY_ROUTES.shop.b2bDiscover },
    { label: 'B2B каталог', href: LEGACY_ROUTES.shop.b2bCatalog },
    { label: 'Заказы бренда (исполнение)', href: ROUTES.brand.b2bOrders },
    { label: 'Производственный хаб', href: EXTENDED_ROUTES.factory.production },
  ]);
}

/** `/shop/b2b/fulfillment-dashboard` — SLA ритейла ↔ исполнение бренда, factory, трекинг. */
export function getFulfillmentDashboardCrossRoleLinks(): EntityLink[] {
  return dedupeEntityLinksByHref([
    { label: 'Заказы B2B (ритейл)', href: ROUTES.shop.b2bOrders },
    { label: 'Трекинг поставок', href: ROUTES.shop.b2bTracking },
    { label: 'Заказы бренда (исполнение)', href: ROUTES.brand.b2bOrders },
    { label: 'Производство (бренд)', href: ROUTES.brand.production },
    { label: 'Производственный хаб (factory)', href: EXTENDED_ROUTES.factory.production },
    { label: 'Рекламации', href: ROUTES.shop.b2bClaims },
    { label: 'Карта процессов B2B', href: LEGACY_ROUTES.shop.b2bWorkspaceMap },
  ]);
}

/** `/shop/b2b/rfq` — витрина байера ↔ RFQ материалов и поставщики в кабинете бренда. */
export function getShopB2bRfqCrossRoleLinks(): EntityLink[] {
  return dedupeEntityLinksByHref([
    { label: 'Поиск поставщиков', href: ROUTES.shop.b2bSupplierDiscovery },
    { label: 'Тендеры B2B', href: LEGACY_ROUTES.shop.b2bTenders },
    { label: 'RFQ материалов (бренд)', href: ROUTES.brand.suppliersRfq },
    { label: 'Реестр поставщиков (бренд)', href: ROUTES.brand.suppliers },
    { label: 'Материалы (бренд)', href: ROUTES.brand.materials },
    { label: 'Производственный хаб', href: EXTENDED_ROUTES.factory.production },
    { label: 'Заказы бренда', href: ROUTES.brand.b2bOrders },
  ]);
}

/** `/shop/b2b/tenders` — торги площадки ↔ RFQ, бренд, исполнение. */
export function getShopB2bTendersCrossRoleLinks(): EntityLink[] {
  return dedupeEntityLinksByHref([
    { label: 'RFQ', href: LEGACY_ROUTES.shop.b2bRfq },
    { label: 'Поиск поставщиков', href: ROUTES.shop.b2bSupplierDiscovery },
    { label: 'Fulfillment', href: LEGACY_ROUTES.shop.b2bFulfillmentDashboard },
    { label: 'RFQ материалов (бренд)', href: ROUTES.brand.suppliersRfq },
    { label: 'Поставщики (бренд)', href: ROUTES.brand.suppliers },
    { label: 'Производственный хаб', href: EXTENDED_ROUTES.factory.production },
    { label: 'Карта B2B', href: LEGACY_ROUTES.shop.b2bWorkspaceMap },
  ]);
}

/** `/shop/b2b/supplier-discovery` — матчинг → RFQ/тендер и контур бренда. */
export function getShopB2bSupplierDiscoveryCrossRoleLinks(): EntityLink[] {
  return dedupeEntityLinksByHref([
    { label: 'RFQ', href: LEGACY_ROUTES.shop.b2bRfq },
    { label: 'Тендеры B2B', href: LEGACY_ROUTES.shop.b2bTenders },
    { label: 'RFQ материалов (бренд)', href: ROUTES.brand.suppliersRfq },
    { label: 'Материалы (бренд)', href: ROUTES.brand.materials },
    { label: 'Fulfillment', href: LEGACY_ROUTES.shop.b2bFulfillmentDashboard },
    { label: 'Производственный хаб', href: EXTENDED_ROUTES.factory.production },
    { label: 'Карта B2B', href: LEGACY_ROUTES.shop.b2bWorkspaceMap },
  ]);
}

/** Срез shop B2B для страницы каталога — без полного `getShopB2BHubLinks()` и без ссылки на сам каталог. */
const SHOP_B2B_CATALOG_RELATED_HUB_HREFS = new Set<string>([
  ROUTES.shop.b2bShowroom,
  ROUTES.shop.b2bMatrix,
  LEGACY_ROUTES.shop.b2bWhiteboard,
  ROUTES.shop.inventory,
  ROUTES.shop.b2bFinance,
  LEGACY_ROUTES.shop.b2bReplenishment,
  LEGACY_ROUTES.shop.b2bDocuments,
  LEGACY_ROUTES.shop.b2bFulfillmentDashboard,
]);

/** Рёбра PIM / исполнение / factory вокруг каталога закупки. */
export function getShopB2bCatalogCrossRoleLinks(): EntityLink[] {
  return [
    { label: 'Создать заказ', href: ROUTES.shop.b2bCreateOrder },
    { label: 'Заказы B2B', href: ROUTES.shop.b2bOrders },
    { label: 'PIM / товары (бренд)', href: ROUTES.brand.products },
    { label: 'Качество B2B-каталога', href: LEGACY_ROUTES.brand.catalogQuality },
    { label: 'Лайншиты (бренд)', href: ROUTES.brand.b2bLinesheets },
    { label: 'Производственный хаб (factory)', href: EXTENDED_ROUTES.factory.production },
    { label: 'Discover брендов', href: ROUTES.shop.b2bPartnersDiscover },
  ];
}

export function getShopB2bCatalogRelatedLinks(): EntityLink[] {
  const hubSlice = getShopB2BHubLinks().filter((l) => {
    const h = String(l.href);
    return SHOP_B2B_CATALOG_RELATED_HUB_HREFS.has(h) && h !== LEGACY_ROUTES.shop.b2bCatalog;
  });
  return finalizeRelatedModuleLinks(
    dedupeEntityLinksByHref([...hubSlice, ...getShopB2bCatalogCrossRoleLinks()])
  );
}

/** Три входа в shop B2B для поставщика / circular hub (единый источник с `getSupplierLinks`). */
export function getSupplierShopB2bPlatformLinks(): EntityLink[] {
  return [
    { label: 'Ритейл-центр (дашборд)', href: ROUTES.shop.home },
    { label: 'Discover (маркетплейс)', href: LEGACY_ROUTES.shop.b2bDiscover },
    { label: 'Карта процессов B2B', href: LEGACY_ROUTES.shop.b2bWorkspaceMap },
    { label: 'Тендеры B2B', href: LEGACY_ROUTES.shop.b2bTenders },
    { label: 'Поиск поставщиков', href: ROUTES.shop.b2bSupplierDiscovery },
  ];
}

export type AdminB2bLifecycleItem = { href: string; label: string; desc: string };

/** Секция HQ-дашборда: жизненный цикл B2B без дубля с factory handoff (канонические href). */
export function getAdminB2bLifecycleOverviewItems(): AdminB2bLifecycleItem[] {
  return [
    {
      href: ROUTES.shop.b2bOrders,
      label: 'Заказы (ритейл)',
      desc: 'Кабинет магазина — операционные B2B-заказы',
    },
    {
      href: ROUTES.brand.b2bOrders,
      label: 'Заказы (бренд)',
      desc: 'Исполнение и согласования со стороны бренда',
    },
    {
      href: EXTENDED_ROUTES.factory.production,
      label: 'Производственный хаб',
      desc: 'Shell цеха и поставщика материалов',
    },
    {
      href: ROUTES.brand.production,
      label: 'Производство (бренд)',
      desc: 'Операции, смены, маршруты в кабинете бренда',
    },
    {
      href: ROUTES.admin.integrations,
      label: 'Интеграции HQ',
      desc: 'Коннекторы и обмен с внешними B2B-системами',
    },
    { href: ROUTES.admin.disputes, label: 'Споры B2B', desc: 'Арбитраж и эскалации' },
    {
      href: LEGACY_ROUTES.shop.b2bFulfillmentDashboard,
      label: 'Fulfillment (ритейл)',
      desc: 'Сводка исполнения заказов и логистических SLA',
    },
    {
      href: LEGACY_ROUTES.shop.b2bWorkspaceMap,
      label: 'Карта B2B (ритейл)',
      desc: 'Сквозная визуализация модулей закупок и ролей',
    },
  ];
}

/** Ссылки для Логистики — B2B, склад, compliance */
export function getLogisticsLinks(): EntityLink[] {
  return filterB2B([
    { label: 'ЭДО и маркировка', href: ROUTES.brand.compliance },
    { label: 'Документы', href: ROUTES.brand.documents },
    { label: 'Возвраты', href: ROUTES.brand.returnsClaims },
    { label: 'Production', href: ROUTES.brand.production },
    { label: 'Склад', href: ROUTES.brand.warehouse },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'Интеграции', href: ROUTES.brand.integrations },
  ]);
}

/** Ссылки для Интеграций — compliance, documents, team */
export function getIntegrationsLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Compliance', href: ROUTES.brand.compliance },
    { label: 'Документы', href: ROUTES.brand.documents },
    { label: 'Команда', href: ROUTES.brand.team },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков (CSV)', href: ROUTES.shop.inventory },
    // Тендеры и поиск поставщиков — в секции «Встроенные B2B-фичи» на `/brand/integrations` (без дубля в RelatedModules).
    { label: 'Webhooks & B2B inbound', href: ROUTES.brand.integrationsWebhooks },
    { label: 'Оптовый реестр', href: ROUTES.brand.b2bOrders },
    { label: 'Логистика', href: ROUTES.brand.logistics },
    { label: 'Производство', href: ROUTES.brand.production },
  ]);
}

/** Перекрёстные ссылки с хаба роста — без дублирования вкладок страницы */
export function getGrowthPlatformCrossLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Контроль-центр', href: ROUTES.brand.controlCenter },
    { label: 'PIM / товары', href: ROUTES.brand.products },
    { label: 'Состав и уход (CSV)', href: ROUTES.brand.fabricPassportRollup },
    { label: 'Здоровье атрибутов', href: ROUTES.brand.attributeHealth },
    { label: 'Готовность к запуску', href: ROUTES.brand.launchReadiness },
    { label: 'Медиа галерея SKU', href: ROUTES.brand.mediaGalleryHealth },
    { label: 'Микс ассортимента', href: ROUTES.brand.assortmentMix },
    { label: 'MOQ и короба', href: ROUTES.brand.packRules },
    { label: 'Цены по категориям', href: ROUTES.brand.categoryPricing },
    { label: 'Цветовые ряды', href: ROUTES.brand.colorwayCoverage },
    { label: 'ТН ВЭД и ЕАС', href: ROUTES.brand.tradeCodes },
    { label: 'Управление бандлами', href: ROUTES.brand.bundles },
    { label: 'Упущенный спрос (Waitlist)', href: ROUTES.brand.demandForecast },
    { label: 'Оптовый лайншит', href: ROUTES.brand.linesheet },
    { label: 'Скорость продаж', href: ROUTES.brand.salesVelocity },
    { label: 'Эко-след (LCA)', href: ROUTES.brand.lcaReport },
    { label: 'Права и кредиты (DAM)', href: ROUTES.brand.assetRights },
    { label: 'Предзаказ (B2B PO)', href: ROUTES.brand.wholesalePreorder },
    { label: 'Балансировка остатков', href: ROUTES.brand.inventoryBalance },
    { label: 'Матрица остатков', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'B2B Финансы и лимиты', href: ROUTES.brand.b2bFinance },
    { label: 'Анализ пересечения SKU', href: ROUTES.brand.assortmentOverlap },
    { label: 'Здоровье ассортимента', href: ROUTES.brand.assortmentHealth },
    { label: 'KPI поставщиков', href: ROUTES.brand.supplierScorecard },
    { label: 'Видимость в поиске (SEO)', href: ROUTES.brand.visibilityIndex },
    { label: 'Локальный сорсинг (СНГ)', href: ROUTES.brand.cisSourcing },
    { label: 'B2B Кампании (V-Control)', href: ROUTES.brand.b2bCampaigns },
    { label: 'Комплаенс и ЭДО (РФ)', href: ROUTES.brand.localCompliance },
    { label: 'Трафик и Погода (Ops)', href: ROUTES.brand.weatherTraffic },
    { label: 'Контроль ОТК (Factory)', href: ROUTES.brand.factoryQc },
    { label: 'Цифровой двойник (демо)', href: ROUTES.brand.productsDigitalTwinTesting },
    { label: 'AI-инструменты', href: ROUTES.brand.aiTools },
    { label: 'Интеграции', href: ROUTES.brand.integrations },
  ]);
}

/** Ссылки для Команды — сообщения, календарь, задачи */
export function getTeamLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Сообщения', href: ROUTES.brand.messages },
    { label: 'Календарь', href: ROUTES.brand.calendar },
    { label: 'Задачи', href: ROUTES.brand.tasks },
    { label: 'Документы', href: ROUTES.brand.documents },
    { label: 'Контроль-центр', href: ROUTES.brand.controlCenter },
    { label: 'Настройки', href: ROUTES.brand.settings },
    { label: 'Академия', href: ROUTES.brand.academy },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
  ]);
}

/** Ссылки для Настроек — документы, безопасность, подписка */
export function getSettingsLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Документы', href: ROUTES.brand.documents },
    { label: 'Безопасность', href: ROUTES.brand.security },
    { label: 'Подписка', href: ROUTES.brand.subscription },
    { label: 'Интеграции', href: ROUTES.brand.integrations },
    { label: 'Команда', href: ROUTES.brand.team },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
  ]);
}

/** Ссылки для Подписки — финансы, документы */
export function getSubscriptionLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Финансы', href: ROUTES.brand.finance },
    { label: 'Документы', href: ROUTES.brand.documents },
    { label: 'Настройки', href: ROUTES.brand.settings },
    { label: 'Команда', href: ROUTES.brand.team },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
  ]);
}

/** Ссылки для ESG — Production, Compliance, поставщики, Академия */
export function getEsgLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Production & BOM', href: ROUTES.brand.production },
    { label: 'ЭДО и Compliance', href: ROUTES.brand.compliance },
    { label: 'Поставщики', href: ROUTES.brand.suppliers },
    { label: 'Фабрики', href: ROUTES.brand.factories },
    { label: 'Materials', href: ROUTES.brand.materials },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'Gold Sample', href: ROUTES.brand.productionGoldSample },
    { label: 'Академия', href: ROUTES.brand.academy },
    { label: 'Документы', href: ROUTES.brand.documents },
    { label: 'Команда', href: ROUTES.brand.team },
  ]);
}

/** Ссылки для аналитики — BI, план/факт, продажи */
export function getAnalyticsLinks(): EntityLink[] {
  return filterB2B([
    { label: 'B2B Analytics Hub', href: ROUTES.brand.analyticsBi },
    { label: 'План vs Факт', href: ROUTES.brand.budgetActual },
    { label: 'AI Прогнозы', href: ROUTES.brand.analytics },
    { label: 'Production', href: ROUTES.brand.production },
    { label: 'Финансы', href: ROUTES.brand.finance },
    { label: 'Партнёры', href: ROUTES.brand.retailers },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'Compliance', href: ROUTES.brand.compliance },
  ]);
}

/** Ссылки для Analytics Phase 2 */
export function getAnalyticsPhase2Links(): EntityLink[] {
  return getAnalyticsLinks();
}

/** Ссылки для Budget Actual */
export function getBudgetActualLinks(): EntityLink[] {
  return getAnalyticsLinks();
}

/** Ссылки для аукционов — закупки, поставщики */
export function getAuctionLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Поставщики', href: ROUTES.brand.suppliers },
    { label: 'Supplier RFQ', href: ROUTES.brand.suppliersRfq },
    { label: 'Тендеры', href: LEGACY_ROUTES.shop.b2bTenders },
    { label: 'Production', href: ROUTES.brand.production },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'Финансы', href: ROUTES.brand.finance },
  ]);
}

/** Ссылки для BOPIS — склад, заказы */
export function getBopisLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Склад', href: ROUTES.brand.warehouse },
    { label: 'ЭДО и Compliance', href: ROUTES.brand.compliance },
    { label: 'Логистика', href: ROUTES.brand.logistics },
    { label: 'Инвентарь', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
  ]);
}

/** Ссылки для BNPL (рассрочка) */
export function getBnplLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Финансы', href: ROUTES.brand.finance },
    { label: 'Escrow', href: ROUTES.brand.financeEscrow },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
  ]);
}

/** Ссылки для Buyer Onboarding */
export function getBuyerOnboardingLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Партнёры', href: ROUTES.brand.retailers },
    { label: 'Заявки байеров', href: LEGACY_ROUTES.brand.buyerApplications },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'Выставки', href: LEGACY_ROUTES.brand.tradeShows },
  ]);
}

/** Ссылки для Client Allergy (аллергии клиентов) */
export function getClientAllergyLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Клиентская база', href: ROUTES.brand.customers },
    { label: 'CRM', href: ROUTES.brand.customerIntelligence },
    { label: 'Digital Wardrobe', href: ROUTES.client.wardrobe },
  ]);
}

/** Ссылки для Client Service Booking */
export function getClientServiceBookingLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Календарь', href: ROUTES.brand.calendar },
    { label: 'Клиентская база', href: ROUTES.brand.customers },
    { label: 'CRM', href: ROUTES.brand.customerIntelligence },
  ]);
}

/** Ссылки для коллекций */
export function getCollectionLinks(): EntityLink[] {
  return filterB2B([
    { label: 'PIM-центр', href: ROUTES.brand.products },
    { label: 'Матрица ассортимента', href: ROUTES.brand.productsMatrix },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'Content Hub', href: ROUTES.brand.contentHub },
    { label: 'Лайншиты', href: ROUTES.brand.b2bLinesheets },
    { label: 'Production', href: ROUTES.brand.production },
    { label: 'B2B Шоурум', href: ROUTES.brand.showroom },
  ]);
}

/**
 * Хаб сообщений: B2B, календарь задач, ЭДО/НДС РФ — чтобы чат не был «отрезан» от операционного контура.
 */
export function getCommLinks(): EntityLink[] {
  return finalizeRelatedModuleLinks(
    dedupeEntityLinksByHref([
      { label: 'Реестр B2B-заказов', href: ROUTES.brand.b2bOrders },
      { label: 'Календарь · задачи', href: `${ROUTES.brand.calendar}?layers=tasks` },
      { label: 'ЭДО и комплаенс (РФ)', href: ROUTES.brand.localCompliance },
      { label: 'Net terms · НДС (РФ)', href: ROUTES.brand.financeRf },
      { label: 'Документы · УПД', href: ROUTES.brand.documents },
      { label: 'Контроль-центр', href: ROUTES.brand.controlCenter },
      ...getTeamLinks().filter(
        (l) =>
          l.href !== ROUTES.brand.messages &&
          l.href !== ROUTES.brand.calendar &&
          l.href !== ROUTES.brand.settings
      ),
    ])
  );
}

/** Ссылки для Cycle Counting */
export function getCycleCountingLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Склад', href: ROUTES.brand.warehouse },
    { label: 'Инвентарь', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'Логистика', href: ROUTES.brand.logistics },
  ]);
}

/** Ссылки для Digital Twin Testing */
export function getDigitalTwinTestingLinks(): EntityLink[] {
  return filterB2B([
    { label: 'PIM-центр', href: ROUTES.brand.products },
    { label: 'Коллекции', href: ROUTES.brand.collections },
    { label: 'Production', href: ROUTES.brand.production },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'Gold Sample', href: ROUTES.brand.productionGoldSample },
  ]);
}

/** Ссылки для Digital Wardrobe */
export function getDigitalWardrobeLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Клиентская база', href: ROUTES.brand.customers },
    { label: 'CRM', href: ROUTES.brand.customerIntelligence },
    { label: 'Try Before You Buy', href: ROUTES.client.tryBeforeYouBuy },
  ]);
}

/** Ссылки для дистрибьюторов */
export function getDistributorLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Territory Protection', href: ROUTES.brand.distributor.territory },
    { label: 'Pre-Order Quota', href: ROUTES.brand.distributor.preOrderQuota },
    { label: 'Sub-Agent Commission', href: ROUTES.brand.distributor.commissions },
    { label: 'Партнёры', href: ROUTES.brand.retailers },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
  ]);
}

/** Ссылки для документов */
export function getDocumentsLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Compliance', href: ROUTES.brand.compliance },
    { label: 'Production', href: ROUTES.brand.production },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'Интеграции', href: ROUTES.brand.integrations },
    { label: 'Команда', href: ROUTES.brand.team },
  ]);
}

/** Ссылки для Endless Aisle */
export function getEndlessAisleLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Инвентарь', href: ROUTES.brand.inventory },
    { label: 'Ритейл: остатки (upload)', href: ROUTES.shop.inventory },
    { label: 'Склад', href: ROUTES.brand.warehouse },
    { label: 'Логистика', href: ROUTES.brand.logistics },
  ]);
}

/** Ссылки для Endless Stylist */
export function getEndlessStylistLinks(): EntityLink[] {
  return filterB2B([
    { label: 'PIM-центр', href: ROUTES.brand.products },
    { label: 'Коллекции', href: ROUTES.brand.collections },
    { label: 'CRM', href: ROUTES.brand.customerIntelligence },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
  ]);
}

/** Ссылки для Gift Registry */
export function getGiftRegistryLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Клиентская база', href: ROUTES.brand.customers },
    { label: 'CRM', href: ROUTES.brand.customerIntelligence },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
  ]);
}

/** Ссылки для HR Hub */
export function getHRHubLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Команда', href: ROUTES.brand.team },
    { label: 'Академия', href: ROUTES.brand.academy },
    { label: 'Вакансии', href: ROUTES.shop.career },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
  ]);
}

/** Ссылки для LIA (Local Inventory Ads) */
export function getLiaLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Промо', href: ROUTES.brand.promotions },
    { label: 'Инвентарь', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'PIM-центр', href: ROUTES.brand.products },
  ]);
}

/** Ссылки для Linesheet Campaigns */
export function getLinesheetCampaignsLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Лайншиты', href: ROUTES.brand.b2bLinesheets },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'Выставки', href: LEGACY_ROUTES.brand.tradeShows },
    { label: 'Партнёры', href: ROUTES.brand.retailers },
  ]);
}

/** Ссылки для маркетинга */
export function getMarketingLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Content Hub', href: ROUTES.brand.contentHub },
    { label: 'Content Factory', href: ROUTES.brand.marketingContentFactory },
    { label: 'Media & DAM', href: ROUTES.brand.media },
    { label: 'Промо', href: ROUTES.brand.promotions },
    { label: 'Коллекции', href: ROUTES.brand.collections },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'B2B Шоурум', href: ROUTES.brand.showroom },
  ]);
}

/** Ссылки для Маркетрума */
export function getMarketroomLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Каталог', href: ROUTES.catalog },
    { label: 'Коллекции', href: ROUTES.brand.collections },
    { label: 'PIM-центр', href: ROUTES.brand.products },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
  ]);
}

/**
 * Ссылки для B2B заказа (детали заказа): ядро №2 (контур заказа) + горизонталь (ритейл/factory) + вертикаль ТЗ→цех.
 * Чаты/календарь — в базовом `getB2BLinks()` как надстройка.
 */
export function getOrderLinks(options?: { techPackStyleId?: string }): EntityLink[] {
  return finalizeRelatedModuleLinks(
    dedupeEntityLinksByHref([
      ...getB2BLinks(),
      ...getBrandB2bOrdersCrossRoleLinks(),
      ...getB2bOrderVerticalCoreLinks(options?.techPackStyleId),
    ])
  );
}

/** Ссылки для партнёров */
export function getPartnerLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'Выставки', href: LEGACY_ROUTES.brand.tradeShows },
    { label: 'Заявки байеров', href: LEGACY_ROUTES.brand.buyerApplications },
    { label: 'Дистрибьюторы', href: ROUTES.brand.distributors },
  ]);
}

/** Ссылки для Pre-Order Quota */
export function getPreOrderQuotaLinks(): EntityLink[] {
  return getDistributorLinks();
}

/** Ссылки для Ship From Store */
export function getShipFromStoreLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Склад', href: ROUTES.brand.warehouse },
    { label: 'Инвентарь', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'Логистика', href: ROUTES.brand.logistics },
  ]);
}

/** Platform Core: golden path shop B2B hub (7 ссылок вместо 40+ legacy). */
function getShopB2BHubLinksForPlatformCore(): EntityLink[] {
  const collectionId = PLATFORM_CORE_DEMO.collectionId;
  return [
    { label: MY_CABINET_LABEL, href: ROUTES.shop.coreCabinet },
    {
      label: SHOWROOM_SHOP_LABEL,
      href: `${ROUTES.shop.b2bShowroom}?collection=${collectionId}`,
    },
    {
      label: MATRIX_ORDER_LABEL,
      href: `${ROUTES.shop.b2bMatrix}?collection=${collectionId}`,
    },
    { label: 'Оптовые заказы', href: ROUTES.shop.b2bOrders },
    { label: 'Партнёры брендов', href: ROUTES.shop.b2bPartnersDiscover },
    { label: 'Отслеживание заказов', href: ROUTES.shop.b2bTracking },
    { label: 'Сообщения', href: ROUTES.shop.messages },
  ];
}

/** Ссылки для Shop B2B Hub — Фазы 1–4: РФ-специфика, коммерция, AI, удобство байеров */
export function getShopB2BHubLinks(): EntityLink[] {
  if (isPlatformCoreMode()) {
    return finalizeRelatedModuleLinks(getShopB2BHubLinksForPlatformCore());
  }
  return filterB2B([
    { label: 'Каталог', href: LEGACY_ROUTES.shop.b2bCatalog },
    { label: 'Виртуальный шоурум', href: ROUTES.shop.b2bShowroom },
    { label: 'Заказы', href: ROUTES.shop.b2bOrders },
    { label: 'Финансы партнёра', href: ROUTES.shop.b2bFinance },
    { label: 'Оплата B2B', href: LEGACY_ROUTES.shop.b2bPayment },
    { label: 'Документы B2B', href: LEGACY_ROUTES.shop.b2bDocuments },
    { label: 'Контракты B2B', href: ROUTES.shop.b2bContracts },
    { label: 'Аналитика закупок', href: LEGACY_ROUTES.shop.b2bAnalytics },
    { label: 'Аналитика по заказам', href: ROUTES.shop.b2bOrderAnalytics },
    { label: 'Fulfillment Dashboard', href: LEGACY_ROUTES.shop.b2bFulfillmentDashboard },
    { label: 'Replenishment', href: LEGACY_ROUTES.shop.b2bReplenishment },
    { label: 'Трекинг заказов', href: ROUTES.shop.b2bTracking },
    { label: 'Календарь поставок', href: LEGACY_ROUTES.shop.b2bDeliveryCalendar },
    { label: 'Рекламации (RMA)', href: ROUTES.shop.b2bClaims },
    { label: 'Отчёты партнёра', href: LEGACY_ROUTES.shop.b2bReports },
    { label: 'Landed Cost', href: ROUTES.shop.b2bLandedCost },
    { label: 'Карта стока', href: LEGACY_ROUTES.shop.b2bStockMap },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'Доска ассортимента', href: LEGACY_ROUTES.shop.b2bWhiteboard },
    { label: 'Академия и обучение', href: ROUTES.shop.b2bAcademy },
    { label: 'Календарь закупок', href: ROUTES.shop.b2bPurchaseCalendar },
    { label: 'Условия по коллекциям', href: ROUTES.shop.b2bCollectionTerms },
    { label: 'Заказ по коллекции', href: LEGACY_ROUTES.shop.b2bOrderByCollection },
    { label: 'Шаблоны заказов', href: LEGACY_ROUTES.shop.b2bOrderTemplates },
    { label: 'Черновики заказов', href: LEGACY_ROUTES.shop.b2bOrderDrafts },
    { label: 'Быстрый заказ', href: LEGACY_ROUTES.shop.b2bQuickOrder },
    { label: 'Reorder', href: LEGACY_ROUTES.shop.b2bReorder },
    { label: 'Pre-order', href: LEGACY_ROUTES.shop.b2bPreOrder },
    { label: 'Маржа по брендам', href: ROUTES.shop.b2bMarginReport },
    { label: 'Режим заказа', href: LEGACY_ROUTES.shop.b2bOrderMode },
    { label: 'Working Order', href: ROUTES.shop.b2bWorkingOrder },
    { label: 'Лукбуки', href: LEGACY_ROUTES.shop.b2bLookbooks },
    { label: 'Кабинет агента', href: LEGACY_ROUTES.shop.b2bAgentCabinet },
    { label: 'Сводный заказ агента', href: ROUTES.shop.b2bAgentConsolidatedOrder },
    { label: 'Grid Ordering', href: LEGACY_ROUTES.shop.b2bGridOrdering },
    { label: 'Quote-to-Order', href: LEGACY_ROUTES.shop.b2bQuoteToOrder },
    { label: 'Синхронизация Shopify', href: LEGACY_ROUTES.shop.b2bShopifySync },
    { label: 'Режимы заказа (список)', href: LEGACY_ROUTES.shop.b2bOrderModes },
    { label: 'EZ Order', href: LEGACY_ROUTES.shop.b2bEzOrder },
    { label: 'AI Smart Order', href: LEGACY_ROUTES.shop.b2bAiSmartOrder },
    { label: 'Sales Rep Portal', href: LEGACY_ROUTES.shop.b2bSalesRepPortal },
    { label: 'Онбординг партнёра', href: ROUTES.shop.b2bPartnerOnboarding },
    { label: 'Мультивалютность', href: ROUTES.shop.b2bMultiCurrency },
    { label: 'Маппинг размеров', href: ROUTES.shop.b2bSizeMapping },
    { label: 'Custom assortments', href: LEGACY_ROUTES.shop.b2bCustomAssortments },
    { label: 'Подбор размера', href: ROUTES.shop.b2bSizeFinder },
    { label: 'Рейтинг брендов', href: ROUTES.shop.b2bRating },
    { label: 'Челленджи и бейджи', href: LEGACY_ROUTES.shop.b2bGamification },
    { label: 'Лента брендов', href: LEGACY_ROUTES.shop.b2bSocialFeed },
    { label: 'Видео-консультация', href: LEGACY_ROUTES.shop.b2bVideoConsultation },
    { label: 'VIP шоурум', href: LEGACY_ROUTES.shop.b2bVipRoomBooking },
    { label: 'Шаринг лукбука', href: ROUTES.shop.b2bLookbookShare },
    { label: 'Планирование ассортимента', href: LEGACY_ROUTES.shop.b2bAssortmentPlanning },
    { label: 'OTB бюджет', href: ROUTES.shop.b2bBudget },
    { label: 'Анализ маржи', href: LEGACY_ROUTES.shop.b2bMarginAnalysis },
    { label: 'Shoppable lookbook', href: ROUTES.shop.shoppableLookbook('lb-fw26-1') },
    { label: 'Настройки B2B', href: ROUTES.shop.b2bSettings },
    { label: 'Checkout B2B', href: ROUTES.shop.b2bCheckout },
    { label: 'Passport выставки', href: LEGACY_ROUTES.shop.b2bPassport },
    { label: 'Партнёры', href: ROUTES.shop.b2bPartners },
    { label: 'Discover брендов', href: LEGACY_ROUTES.shop.b2bDiscover },
    { label: 'AI Discovery Radar', href: ROUTES.shop.b2bPartnersDiscover },
    { label: 'Заявка на партнёрство', href: LEGACY_ROUTES.shop.b2bApply },
    { label: 'Тендеры B2B', href: LEGACY_ROUTES.shop.b2bTenders },
    { label: 'Поиск поставщиков', href: ROUTES.shop.b2bSupplierDiscovery },
    { label: 'Collaborative Order', href: LEGACY_ROUTES.shop.b2bCollaborativeOrder },
    { label: 'Margin Calculator', href: LEGACY_ROUTES.shop.b2bMarginCalculator },
    { label: 'AI-поиск', href: ROUTES.shop.b2bAiSearch },
    { label: 'Формирование селекции', href: LEGACY_ROUTES.shop.b2bSelectionBuilder },
    { label: 'Sales App', href: ROUTES.shop.b2bScanner },
    { label: 'Личный кабинет дилера', href: ROUTES.shop.b2bDealerCabinet },
    { label: 'Мои выставки', href: LEGACY_ROUTES.shop.b2bTradeShows },
    { label: 'Запись на встречи', href: LEGACY_ROUTES.shop.b2bTradeShowAppointments },
    { label: 'Выставки (бренд)', href: LEGACY_ROUTES.brand.tradeShows },
  ]);
}

/** Ссылки для Shop B2B Orders */
/**
 * Карточка B2B-заказа в кабинете shop: тот же контур, что у бренда, плюс рёбра на исполнителя и ТЗ (демо).
 */
export function getShopB2BOrderLinks(options?: { techPackStyleId?: string }): EntityLink[] {
  return finalizeRelatedModuleLinks(
    dedupeEntityLinksByHref([
      ...getB2BLinks(),
      ...getShopB2bOrdersCrossRoleLinks(),
      ...getB2bOrderVerticalCoreLinks(options?.techPackStyleId),
    ])
  );
}

/** Ссылки для Style-Me Upsell */
export function getStyleMeUpsellLinks(): EntityLink[] {
  return getMarketingLinks();
}

/** Ссылки для Sub-Agent Commission */
export function getSubAgentCommissionLinks(): EntityLink[] {
  return getDistributorLinks();
}

/** Ссылки для поставщиков */
export function getSupplierLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Supplier RFQ', href: ROUTES.brand.suppliersRfq },
    { label: 'Production', href: ROUTES.brand.production },
    { label: 'Materials', href: ROUTES.brand.materials },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    ...getSupplierShopB2bPlatformLinks(),
  ]);
}

/** Ссылки для задач */
export function getTaskLinks(): EntityLink[] {
  return getTeamLinks();
}

/** Ссылки для Try Before You Buy (B2C) */
export function getTbybB2CLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Digital Wardrobe', href: ROUTES.client.wardrobe },
    { label: 'Клиентская база', href: ROUTES.brand.customers },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
  ]);
}

/** Ссылки для Territory Protection */
export function getTerritoryProtectionLinks(): EntityLink[] {
  return getDistributorLinks();
}

/** Ссылки для выставок */
export function getTradeShowLinks(): EntityLink[] {
  return filterB2B([
    { label: 'Шоурум', href: ROUTES.brand.showroom },
    { label: 'Заявки байеров', href: LEGACY_ROUTES.brand.buyerApplications },
    { label: 'Партнёры', href: ROUTES.brand.retailers },
    { label: 'Инвентарь (матрица)', href: ROUTES.brand.inventory },
    { label: 'Ритейл: загрузка остатков', href: ROUTES.shop.inventory },
    { label: 'Лайншиты', href: ROUTES.brand.b2bLinesheets },
  ]);
}

/** Элемент сетки модулей в Control Center (`/brand/control-center`) */
export type ModuleHub = {
  id: string;
  label: string;
  href: string;
  desc: string;
  /** ключ из MODULE_ICONS на странице control-center */
  icon: string;
};

/** Модульные хабы — сетка «Все модули» */
export const MODULE_HUBS: ModuleHub[] = [
  {
    id: 'organization',
    label: 'Профиль бренда',
    href: `${ROUTES.brand.profile}?group=profile&tab=brand`,
    desc: 'Контакты, ДНК, пресс-кит',
    icon: 'Building2',
  },
  {
    id: 'dashboard',
    label: 'Дашборд',
    href: ROUTES.brand.dashboard,
    desc: 'Операционный пульс',
    icon: 'LayoutDashboard',
  },
  {
    id: 'team',
    label: 'Команда',
    href: ROUTES.brand.team,
    desc: 'Участники и доступы',
    icon: 'Users',
  },
  {
    id: 'integrations',
    label: 'Интеграции',
    href: ROUTES.brand.integrations,
    desc: '1С, маркетплейсы, API',
    icon: 'Zap',
  },
  {
    id: 'documents',
    label: 'Документы и ЭДО',
    href: ROUTES.brand.documents,
    desc: 'Договоры, ЭДО, КИЗ',
    icon: 'FileText',
  },
  {
    id: 'settings',
    label: 'Настройки',
    href: ROUTES.brand.settings,
    desc: 'Безопасность, подписка',
    icon: 'Settings',
  },
  {
    id: 'collections',
    label: 'Коллекции',
    href: ROUTES.brand.collections,
    desc: 'Сезоны и коллекции',
    icon: 'Layers',
  },
  {
    id: 'products',
    label: 'PIM-центр',
    href: ROUTES.brand.products,
    desc: 'Карточки и данные SKU',
    icon: 'Box',
  },
  {
    id: 'production',
    label: 'Производство',
    href: ROUTES.brand.production,
    desc: 'Цех и выпуск',
    icon: 'Factory',
  },
  {
    id: 'logistics',
    label: 'Логистика',
    href: ROUTES.brand.logistics,
    desc: 'Перевозки и склады',
    icon: 'Truck',
  },
  {
    id: 'inventory',
    label: 'Инвентарь и сток',
    href: ROUTES.brand.inventory,
    desc: 'Матрица остатков; загрузка CSV — с экрана матрицы и логистики',
    icon: 'Package',
  },
  {
    id: 'b2b',
    label: 'Заказы B2B',
    href: ROUTES.brand.b2bOrders,
    desc: 'PO, отгрузки, согласования',
    icon: 'ShoppingCart',
  },
  {
    id: 'showroom',
    label: 'B2B Шоурум',
    href: ROUTES.brand.showroom,
    desc: 'Витрина для байеров',
    icon: 'Globe',
  },
  {
    id: 'analytics',
    label: 'Аналитика 360',
    href: ROUTES.brand.analytics360,
    desc: 'Сводная аналитика',
    icon: 'BarChart3',
  },
  {
    id: 'finance',
    label: 'Финансы',
    href: ROUTES.brand.finance,
    desc: 'P&L, Cash Flow',
    icon: 'DollarSign',
  },
  {
    id: 'compliance',
    label: 'ЭДО и маркировка',
    href: ROUTES.brand.compliance,
    desc: 'Compliance, Честный ЗНАК',
    icon: 'ShieldCheck',
  },
  {
    id: 'disputes',
    label: 'Арбитраж',
    href: ROUTES.brand.disputes,
    desc: 'Споры и претензии',
    icon: 'Gavel',
  },
  {
    id: 'messages',
    label: 'Сообщения',
    href: ROUTES.brand.messages,
    desc: 'Чаты команды и партнёров',
    icon: 'MessageSquare',
  },
  {
    id: 'academy',
    label: 'Академия',
    href: ROUTES.brand.academy,
    desc: 'Обучение и база знаний',
    icon: 'GraduationCap',
  },
  {
    id: 'esg',
    label: 'ESG',
    href: ROUTES.brand.esg,
    desc: 'Устойчивое развитие',
    icon: 'TrendingUp',
  },
  {
    id: 'platform-growth',
    label: 'Рост платформы',
    href: ROUTES.brand.growthHub,
    desc: 'Клиентские фичи, партнёры, демо без API',
    icon: 'Rocket',
  },
];
