import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
import { ROUTES } from '@/lib/routes';
import { COLLECTION_DEV_HUB_TITLE_RU } from '@/lib/production/collection-development-labels';
import type { EntityLink } from '@/lib/data/entity-links';
import {
  getB2bOrderVerticalCoreLinks,
  getBrandB2bOrdersCrossRoleLinks,
  getShopB2bOrdersCrossRoleLinks,
} from '@/lib/data/entity-links';

/** Визуальная роль секции (левый акцент в панели JOOR-style). */
export type PriorityWorkflowVariant =
  | 'production'
  | 'commerce'
  | 'execution'
  | 'overlay'
  | 'cross'
  /** Российская юрисдикция: НДС, ЭДО, маркировка */
  | 'rf'
  /** То, чего нет «как у всех»: единый контур заказ ↔ ТЗ ↔ РФ */
  | 'differentiator';

export type PriorityWorkflowGroup = {
  id: string;
  title: string;
  subtitle?: string;
  variant: PriorityWorkflowVariant;
  links: EntityLink[];
};

function nonEmptyGroups(groups: PriorityWorkflowGroup[]): PriorityWorkflowGroup[] {
  return groups.filter((g) => g.links.length > 0);
}

/**
 * Карточка B2B-заказа (бренд): ядра ТЗ→цех, оптовый контур, исполнение, надстройка коммуникаций, горизонталь ролей.
 */
export function getBrandB2bOrderPriorityGroups(styleId?: string): PriorityWorkflowGroup[] {
  return nonEmptyGroups([
    {
      id: 'core-tz-production',
      title: 'ТЗ и производство',
      subtitle: 'Ядро №1 · спецификация → задание в цех',
      variant: 'production',
      links: getB2bOrderVerticalCoreLinks(styleId),
    },
    {
      id: 'core-b2b-commerce',
      title: 'Оптовый контур',
      subtitle: 'Ядро №2 · JOOR / NuOrder · заказ и коммерция',
      variant: 'commerce',
      links: [
        { label: 'Прайс-листы', href: LEGACY_ROUTES.brand.priceLists },
        { label: 'Лайншиты', href: ROUTES.brand.b2bLinesheets },
        { label: 'Предзаказы', href: ROUTES.brand.preOrders },
        { label: 'Заявки на изменение', href: LEGACY_ROUTES.brand.orderAmendments },
        { label: 'LIVE B2B', href: ROUTES.brand.processLiveB2b },
        { label: 'Production (хаб)', href: ROUTES.brand.production },
      ],
    },
    {
      id: 'execution',
      title: 'Исполнение и контроль',
      subtitle: 'Склад · логистика · compliance · споры',
      variant: 'execution',
      links: [
        { label: 'Склад', href: ROUTES.brand.warehouse },
        { label: 'Логистика', href: ROUTES.brand.logistics },
        { label: 'ЭДО и Compliance', href: ROUTES.brand.compliance },
        { label: 'Финансы', href: ROUTES.brand.finance },
        { label: 'Dispute Hub', href: ROUTES.brand.disputes },
      ],
    },
    {
      id: 'overlay-comms',
      title: 'Команда и сроки',
      subtitle: 'Ядро №3 · чаты и календарь',
      variant: 'overlay',
      links: [
        { label: 'Сообщения', href: ROUTES.brand.messages },
        { label: 'Календарь', href: ROUTES.brand.calendar },
      ],
    },
    {
      id: 'cross-role',
      title: 'Роли и площадки',
      subtitle: 'Горизонталь',
      variant: 'cross',
      links: getBrandB2bOrdersCrossRoleLinks(),
    },
    {
      id: 'rf-jurisdiction',
      title: 'Россия: юрисдикция',
      subtitle: 'НДС · ЭДО · маркировка · учёт',
      variant: 'rf',
      links: [
        { label: 'Net terms · НДС (РФ)', href: ROUTES.brand.financeRf },
        { label: 'Комплаенс и ЭДО (РФ)', href: ROUTES.brand.localCompliance },
        { label: 'Compliance (ЭДО/сертификаты)', href: ROUTES.brand.compliance },
        { label: 'Склад КИЗ · маркировка', href: ROUTES.brand.complianceStock },
        { label: 'Документы · УПД', href: ROUTES.brand.documents },
        { label: 'Пошлины · НДС (оценка)', href: ROUTES.brand.logisticsDutyCalculator },
      ],
    },
    {
      id: 'platform-edge',
      title: 'Единая ОС (сверх JOOR / NuOrder)',
      subtitle: 'Заказ ↔ ТЗ ↔ цех ↔ РФ в одном контуре',
      variant: 'differentiator',
      links: [
        { label: 'Контроль-центр', href: ROUTES.brand.controlCenter },
        { label: 'Интеграции', href: ROUTES.brand.integrations },
        { label: 'B2B Passport · выставки', href: LEGACY_ROUTES.brand.b2bPassport },
        { label: 'Согласование заказа', href: LEGACY_ROUTES.brand.orderApprovalWorkflow },
        { label: 'Качество каталога', href: LEGACY_ROUTES.brand.catalogQuality },
        { label: 'Синдикация контента', href: LEGACY_ROUTES.brand.contentSyndication },
      ],
    },
  ]);
}

/**
 * Карточка B2B-заказа (shop): те же оси, с маршрутами байера и календарями поставок.
 */
export function getShopB2bOrderPriorityGroups(styleId?: string): PriorityWorkflowGroup[] {
  return nonEmptyGroups([
    {
      id: 'core-tz-production',
      title: 'ТЗ и производство у бренда',
      subtitle: 'Контур исполнителя · спецификация → цех',
      variant: 'production',
      links: getB2bOrderVerticalCoreLinks(styleId),
    },
    {
      id: 'core-b2b-buyer',
      title: 'Закупка и операции',
      subtitle: 'Ядро №2 · каталог · fulfillment · оплата',
      variant: 'commerce',
      links: [
        { label: 'Каталог B2B', href: LEGACY_ROUTES.shop.b2bCatalog },
        { label: 'Реестр заказов', href: ROUTES.shop.b2bOrders },
        { label: 'Fulfillment', href: LEGACY_ROUTES.shop.b2bFulfillmentDashboard },
        { label: 'Трекинг', href: ROUTES.shop.b2bTracking },
        { label: 'Календарь поставок', href: LEGACY_ROUTES.shop.b2bDeliveryCalendar },
        { label: 'Оплата (JOOR Pay)', href: LEGACY_ROUTES.shop.b2bPayment },
      ],
    },
    {
      id: 'execution-shop',
      title: 'Стоимость и остатки',
      subtitle: 'Landed cost · финансы · претензии',
      variant: 'execution',
      links: [
        { label: 'Landed cost', href: ROUTES.shop.b2bLandedCost },
        { label: 'Финансы партнёра', href: ROUTES.shop.b2bFinance },
        { label: 'Рекламации (RMA)', href: ROUTES.shop.b2bClaims },
        { label: 'Загрузка остатков', href: ROUTES.shop.inventory },
      ],
    },
    {
      id: 'overlay-comms-shop',
      title: 'Команда и сроки',
      subtitle: 'Ядро №3 · чаты и календарь',
      variant: 'overlay',
      links: [
        { label: 'Сообщения', href: ROUTES.shop.messages },
        { label: 'Календарь', href: ROUTES.shop.calendar },
        { label: 'Календарь закупок', href: ROUTES.shop.b2bPurchaseCalendar },
      ],
    },
    {
      id: 'cross-role-shop',
      title: 'Исполнение и бренд',
      subtitle: 'Горизонталь',
      variant: 'cross',
      links: getShopB2bOrdersCrossRoleLinks(),
    },
    {
      id: 'rf-jurisdiction-shop',
      title: 'РФ: закупка и документы',
      subtitle: 'Договоры · отчётность · прозрачность',
      variant: 'rf',
      links: [
        { label: 'Документы B2B', href: LEGACY_ROUTES.shop.b2bDocuments },
        { label: 'Контракты B2B', href: ROUTES.shop.b2bContracts },
        { label: 'Отчёты партнёра', href: LEGACY_ROUTES.shop.b2bReports },
        { label: 'Аналитика закупок', href: LEGACY_ROUTES.shop.b2bAnalytics },
      ],
    },
    {
      id: 'platform-edge-shop',
      title: 'Преимущества контура',
      subtitle: 'Видимость ТЗ у бренда · SLA · маржа',
      variant: 'differentiator',
      links: [
        { label: 'Карта процессов B2B', href: LEGACY_ROUTES.shop.b2bWorkspaceMap },
        { label: 'Маржа по брендам', href: ROUTES.shop.b2bMarginReport },
        { label: 'Discover брендов', href: ROUTES.shop.b2bPartnersDiscover },
        { label: 'Качество каталога (бренд)', href: LEGACY_ROUTES.brand.catalogQuality },
      ],
    },
  ]);
}

/**
 * Единый процесс заказа: общение и планирование в **нашем** чате и календаре,
 * оформление и селекции — в матрице, подборках и каталоге; материалы — в академии.
 */
export function getBrandB2bCollaborationProcessGroups(): PriorityWorkflowGroup[] {
  return nonEmptyGroups([
    {
      id: 'collab-brand',
      title: 'Коммуникации и планирование',
      subtitle: 'Вопросы, звонки, сроки — чат и календарь в одном контуре с заказом',
      variant: 'overlay',
      links: [
        { label: 'Сообщения', href: ROUTES.brand.messages },
        { label: 'Календарь · задачи', href: `${ROUTES.brand.calendar}?layers=tasks` },
        { label: 'Календарь · события', href: `${ROUTES.brand.calendar}?layers=events` },
        { label: 'Команда', href: ROUTES.brand.team },
        { label: 'Документы · УПД', href: ROUTES.brand.documents },
      ],
    },
    {
      id: 'order-formation-brand',
      title: 'Коллекции и оформление',
      subtitle: 'Детальные артикулы · заказы к партнёру',
      variant: 'commerce',
      links: [
        { label: 'Реестр B2B', href: ROUTES.brand.b2bOrders },
        { label: 'Матрица ассортимента', href: ROUTES.brand.productsMatrix },
        { label: 'Лайншиты', href: ROUTES.brand.b2bLinesheets },
        { label: 'Шоурум', href: ROUTES.brand.showroom },
        { label: 'Коллекции', href: ROUTES.brand.collections },
      ],
    },
    {
      id: 'training-brand',
      title: 'Материалы, тренинги, презентации',
      subtitle: 'Что передаётся байеру и команде магазина',
      variant: 'differentiator',
      links: [
        { label: 'Академия бренда', href: ROUTES.brand.academy },
        { label: 'База знаний', href: ROUTES.brand.academyKnowledge },
        { label: 'Материалы для ритейла', href: ROUTES.brand.academyClients },
        { label: 'Тренинг по коллекции', href: ROUTES.brand.academyCollectionTrainingCreate },
      ],
    },
  ]);
}

/** Тот же сквозной процесс для кабинета магазина: от чата до селекций и аналитики. */
export function getShopB2bCollaborationProcessGroups(): PriorityWorkflowGroup[] {
  return nonEmptyGroups([
    {
      id: 'collab-shop',
      title: 'Общение с брендом',
      subtitle: 'Чат · календари поставок и закупок',
      variant: 'overlay',
      links: [
        { label: 'Сообщения', href: ROUTES.shop.messages },
        { label: 'Календарь', href: ROUTES.shop.calendar },
        { label: 'Календарь поставок', href: LEGACY_ROUTES.shop.b2bDeliveryCalendar },
        { label: 'Календарь закупок', href: ROUTES.shop.b2bPurchaseCalendar },
      ],
    },
    {
      id: 'order-formation-shop',
      title: 'Формирование заказа и селекции',
      subtitle: 'Матрица · подборки · луки · working order',
      variant: 'commerce',
      links: [
        { label: 'Создать заказ', href: ROUTES.shop.b2bCreateOrder },
        { label: 'Матрица заказа', href: ROUTES.shop.b2bMatrix },
        { label: 'Подборки (selection)', href: LEGACY_ROUTES.shop.b2bSelectionBuilder },
        { label: 'Доска ассортимента', href: LEGACY_ROUTES.shop.b2bWhiteboard },
        { label: 'Working Order (Excel)', href: ROUTES.shop.b2bWorkingOrder },
        { label: 'Каталог B2B', href: LEGACY_ROUTES.shop.b2bCatalog },
      ],
    },
    {
      id: 'analytics-shop',
      title: 'Анализ, прогноз, пополнение',
      subtitle: 'Replenishment · маржа · розница · сезон',
      variant: 'execution',
      links: [
        { label: 'Replenishment workspace', href: LEGACY_ROUTES.shop.b2bReplenishment },
        { label: 'Аналитика по заказам', href: ROUTES.shop.b2bOrderAnalytics },
        { label: 'Маржа по брендам', href: ROUTES.shop.b2bMarginReport },
        { label: 'Аналитика розницы', href: ROUTES.shop.analytics },
        { label: 'Трафик по зонам', href: ROUTES.shop.analyticsFootfall },
        { label: 'Остатки ритейла', href: ROUTES.shop.inventory },
      ],
    },
    {
      id: 'materials-shop',
      title: 'Материалы и обучение',
      subtitle: 'Презентации · витрина знаний',
      variant: 'differentiator',
      links: [
        { label: 'Академия B2B', href: ROUTES.shop.b2bAcademy },
        { label: 'Discover брендов', href: ROUTES.shop.b2bPartnersDiscover },
      ],
    },
  ]);
}

/**
 * Полная связка приоритетных направлений: ядро №1 (ТЗ→цех), ядро №2 (B2B как JOOR/NuOrder+),
 * надстройка (чат/календарь), горизонталь ролей. Для хабов реестров и сквозной навигации.
 */
/**
 * Хаб ядра №1 (разработка коллекции / ТЗ → образец): вертикаль цеха, мост к B2B и надстройке без дублирования полной матрицы реестра.
 */
export function getSynthaProductionHubBridgeGroups(): PriorityWorkflowGroup[] {
  return nonEmptyGroups([
    {
      id: 'wh-core1-vertical',
      title: 'ТЗ и производство',
      subtitle: 'Ядро №1 · спецификация → отшив',
      variant: 'production',
      links: [
        { label: 'Операции цеха и PO', href: ROUTES.brand.productionOperations },
        { label: 'Матрица SKU (бренд)', href: ROUTES.brand.productsMatrix },
        { label: 'LIVE Production', href: ROUTES.brand.processLiveProduction },
      ],
    },
    {
      id: 'wh-core2-bridge',
      title: 'Оптовый контур',
      subtitle: 'Ядро №2 · исполнение заказа партнёра',
      variant: 'commerce',
      links: [
        { label: 'Реестр B2B (бренд)', href: ROUTES.brand.b2bOrders },
        { label: 'Заказы байеров (ритейл)', href: ROUTES.shop.b2bOrders },
        { label: 'LIVE B2B', href: ROUTES.brand.processLiveB2b },
      ],
    },
    {
      id: 'wh-overlay-comms',
      title: 'Команда и сроки',
      subtitle: 'Ядро №3 · чат/календарь не заменяют ТЗ и PO',
      variant: 'overlay',
      links: [
        { label: 'Сообщения', href: ROUTES.brand.messages },
        { label: 'Календарь · задачи', href: `${ROUTES.brand.calendar}?layers=tasks` },
        { label: 'Команда бренда', href: ROUTES.brand.team },
      ],
    },
  ]);
}

export function getSynthaThreeCoresFullMatrixGroups(): PriorityWorkflowGroup[] {
  return nonEmptyGroups([
    {
      id: 'syntha-core-1-vertical',
      title: 'Ядро №1 · ТЗ → отшив',
      subtitle: 'Вертикаль · кабинет бренда → задание в цех',
      variant: 'production',
      links: [
        { label: 'Операции цеха и PO', href: ROUTES.brand.productionOperations },
        { label: COLLECTION_DEV_HUB_TITLE_RU, href: ROUTES.brand.productionWorkshop2 },
        { label: 'LIVE Production', href: ROUTES.brand.processLiveProduction },
        { label: 'Матрица SKU (бренд)', href: ROUTES.brand.productsMatrix },
      ],
    },
    {
      id: 'syntha-core-2-b2b',
      title: 'Ядро №2 · Оптовый контур',
      subtitle: 'JOOR / NuOrder и сильнее · заказ и исполнение',
      variant: 'commerce',
      links: [
        { label: 'Реестр B2B (бренд)', href: ROUTES.brand.b2bOrders },
        { label: 'Создать заказ (байер)', href: ROUTES.shop.b2bCreateOrder },
        { label: 'Реестр заказов (байер)', href: ROUTES.shop.b2bOrders },
        { label: 'Матрица заказа', href: ROUTES.shop.b2bMatrix },
        { label: 'Подборки (selection)', href: LEGACY_ROUTES.shop.b2bSelectionBuilder },
        { label: 'Working Order · Excel', href: ROUTES.shop.b2bWorkingOrder },
        { label: 'LIVE B2B', href: ROUTES.brand.processLiveB2b },
      ],
    },
    {
      id: 'syntha-overlay-comms',
      title: 'Ядро №3 · диалог и сроки',
      subtitle: 'Чаты и календарь — не фундамент данных',
      variant: 'overlay',
      links: [
        { label: 'Сообщения · бренд', href: ROUTES.brand.messages },
        { label: 'Сообщения · байер', href: ROUTES.shop.messages },
        { label: 'Календарь · задачи (бренд)', href: `${ROUTES.brand.calendar}?layers=tasks` },
        { label: 'Календарь · задачи (байер)', href: `${ROUTES.shop.calendar}?layers=tasks` },
        { label: 'Календарь поставок', href: LEGACY_ROUTES.shop.b2bDeliveryCalendar },
        { label: 'Календарь закупок', href: ROUTES.shop.b2bPurchaseCalendar },
      ],
    },
    {
      id: 'syntha-horizontal-cross',
      title: 'Горизонталь · роли и площадки',
      subtitle: 'Бренд ↔ байер ↔ factory ↔ контроль',
      variant: 'cross',
      links: [
        { label: 'Заказы байера (ритейл)', href: ROUTES.shop.b2bOrders },
        { label: 'Заказы бренда (исполнение)', href: ROUTES.brand.b2bOrders },
        { label: 'Производственный хаб (factory)', href: EXTENDED_ROUTES.factory.production },
        { label: 'Контроль-центр', href: ROUTES.brand.controlCenter },
        { label: 'Интеграции', href: ROUTES.brand.integrations },
      ],
    },
  ]);
}
