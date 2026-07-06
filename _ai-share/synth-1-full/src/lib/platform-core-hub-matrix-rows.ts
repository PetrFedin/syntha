/**
 * Hub matrix rows «роль × столп» — вынесено из platform-core-hub-matrix.ts.
 */
import {
  ROUTES,
  brandB2bOrderHandoffContextHref,
  brandB2bOrderHref,
  brandB2bOrdersAwaitingHandoffRegistryHref,
  brandCalendarB2bOrderContextHref,
  brandDevelopmentArticleHref,
  brandDevelopmentCabinetHref,
  brandMessagesB2bOrderContextHref,
  brandMessagesWorkshop2ArticleContextHref,
  factoryMessagesB2bOrderContextHref,
  factoryMessagesWorkshop2ArticleContextHref,
  factoryProductionDossierHref,
  factoryProductionOrdersOrderContextHref,
  factorySupplierMessagesB2bOrderContextHref,
  factorySupplierCalendarB2bOrderContextHref,
  factorySupplierMessagesWorkshop2ArticleContextHref,
  shopB2bOrderHref,
  shopCalendarB2bOrderContextHref,
  shopMessagesB2bOrderContextHref,
} from '@/lib/platform-core-routes';
import {
  PLATFORM_CORE_DEMO,
  getPlatformCoreCollectionLabel,
} from '@/lib/platform-core-demo-context';
import type { CoreHubRoleRow } from '@/lib/platform-core-hub-matrix.types';
import {
  brandLinesheetsHrefForDemo,
  brandShowroomHrefForDemo,
  factoryHandoffQueueHrefForDemo,
  factoryMaterialsHrefForDemo,
  factoryMaterialsProcurementHrefForDemo,
} from '@/lib/platform-core-hub-matrix-demo-hrefs';

const { collectionId, demoOrderId, demoArticleId, productionOrderId } =
  PLATFORM_CORE_DEMO;

const w2ArticleMessagesHref = brandMessagesWorkshop2ArticleContextHref(collectionId, demoArticleId);
const factoryArticleMessagesHref = factoryMessagesWorkshop2ArticleContextHref(
  collectionId,
  demoArticleId
);
const factoryArticleMessagesSupplierHref = factorySupplierMessagesWorkshop2ArticleContextHref(
  collectionId,
  demoArticleId
);
const factoryCalendarManufacturerHref = `${ROUTES.factory.productionCalendar}?role=manufacturer&layers=tasks,orders,production`;
const brandDevelopmentHref = brandDevelopmentCabinetHref(collectionId);
const shopMatrixHref = `${ROUTES.shop.b2bMatrix}?collection=${collectionId}`;
const shopShowroomHref = `${ROUTES.shop.b2bShowroom}?collection=${collectionId}`;
const brandLinesheetsHref = brandLinesheetsHrefForDemo(PLATFORM_CORE_DEMO);
const brandShowroomHref = brandShowroomHrefForDemo(PLATFORM_CORE_DEMO);
const factoryDossierHref = factoryProductionDossierHref(demoArticleId, { collectionId });
const brandArticleDevelopmentHref = brandDevelopmentArticleHref(collectionId, demoArticleId, {
  section: 'material',
});
const factoryMaterialsHref = factoryMaterialsHrefForDemo(PLATFORM_CORE_DEMO);
const factoryMaterialsProcurementHref = factoryMaterialsProcurementHrefForDemo(PLATFORM_CORE_DEMO);
const hubCollectionLabel = getPlatformCoreCollectionLabel(collectionId);
const hubWholesaleOrderLabel = `Оптовый заказ · ${hubCollectionLabel}`;
const hubDossierLabel = `Досье · ${hubCollectionLabel}`;
const hubChatOrderLabel = `Чат · заказ · ${hubCollectionLabel}`;
const hubCalendarOrderLabel = `Календарь · заказ · ${hubCollectionLabel}`;

export const PLATFORM_CORE_HUB_ROWS: readonly CoreHubRoleRow[] = [
  {
    id: 'brand',
    label: 'Бренд',
    landingHref: ROUTES.brand.coreCabinet,
    pillars: {
      development: {
        kind: 'active',
        title: 'Разработка артикулов до эталона',
        lead: 'Цех разработки: наброски, техзадание и досье — для коллекций и индивидуального пошива. Образцы передаются на производство.',
        actions: [
          { label: 'Цех разработки · артикулы', href: brandDevelopmentHref },
          { label: 'Планировщик ассортимента', href: ROUTES.brand.rangePlanner },
        ],
      },
      sample_collection: {
        kind: 'active',
        title: 'Коллекции и витрина бренда',
        lead: 'Лайншиты: отработанные артикулы собираются в коллекции и открываются для витрины магазинов.',
        actions: [
          { label: 'Лайншиты · коллекции', href: brandLinesheetsHref },
          { label: 'Витрина бренда', href: brandShowroomHref },
        ],
      },
      collection_order: {
        kind: 'active',
        title: 'Приём оптовых заказов',
        lead: 'Ритейлеры и входящие оптовые заказы после презентации коллекции.',
        actions: [
          { label: hubWholesaleOrderLabel, href: brandB2bOrderHref(demoOrderId) },
          { label: 'Сеть ритейлеров', href: ROUTES.brand.retailers },
          { label: 'Реестр оптовых заказов', href: ROUTES.brand.b2bOrders },
        ],
      },
      order_production: {
        kind: 'active',
        title: 'Исполнение заказа',
        lead: 'Подтверждение опта, производственный заказ, передача в цех и контроль сырья — из кабинета бренда.',
        actions: [
          {
            label: 'Реестр · ожидает передачу',
            href: brandB2bOrdersAwaitingHandoffRegistryHref(),
          },
          {
            label: 'Передача в производство',
            href: brandB2bOrderHandoffContextHref(demoOrderId),
          },
          {
            label: hubDossierLabel,
            href: brandArticleDevelopmentHref,
          },
        ],
      },
      comms: {
        kind: 'active',
        title: 'Координация цепочки',
        lead: 'Переписка по артикулу, коллекции и оптовому заказу; слоты отгрузки.',
        actions: [
          { label: hubChatOrderLabel, href: brandMessagesB2bOrderContextHref(demoOrderId) },
          { label: 'Чат · артикул', href: w2ArticleMessagesHref },
          { label: hubCalendarOrderLabel, href: brandCalendarB2bOrderContextHref(demoOrderId) },
        ],
      },
    },
  },
  {
    id: 'shop',
    label: 'Магазин',
    landingHref: ROUTES.shop.coreCabinet,
    pillars: {
      development: {
        kind: 'empty',
        reason:
          'Разработку артикула ведёт бренд. Магазин подключается к опубликованной коллекции в витрине.',
      },
      sample_collection: {
        kind: 'active',
        title: 'Витрина и партнёры',
        lead: 'Коллекции брендов, открытые для вас; внутри коллекции — матрица и оптовый заказ.',
        actions: [
          { label: 'Витрина · коллекции брендов', href: shopShowroomHref },
          { label: 'Каталог партнёров', href: ROUTES.shop.b2bPartnersDiscover },
        ],
      },
      collection_order: {
        kind: 'active',
        title: 'Формирование оптового заказа',
        lead: 'Матрица внутри коллекции, корзина и отправка финального оптового заказа бренду.',
        actions: [
          { label: 'Матрица заказа', href: shopMatrixHref },
          { label: 'Мои оптовые заказы', href: ROUTES.shop.b2bOrders },
          { label: `Заказ · ${collectionId}`, href: shopB2bOrderHref(demoOrderId) },
        ],
      },
      order_production: {
        kind: 'empty',
        reason:
          'Магазин не ведёт производство. Статус после отправки — в столпе «Коллекция→заказ» (buyer view, по правилам бренда).',
      },
      comms: {
        kind: 'active',
        title: 'Связь с брендом',
        lead: 'Переписка и календарь по заказу и окнам отгрузки.',
        actions: [
          { label: hubChatOrderLabel, href: shopMessagesB2bOrderContextHref(demoOrderId) },
          { label: hubCalendarOrderLabel, href: shopCalendarB2bOrderContextHref(demoOrderId) },
        ],
      },
    },
  },
  {
    id: 'manufacturer',
    label: 'Производство',
    landingHref: ROUTES.factory.productionCoreCabinet,
    pillars: {
      development: {
        kind: 'active',
        title: 'Исполнение разработки на цехе',
        lead: 'Очередь образцов и чтение досье — без редактора разработки бренда.',
        actions: [
          { label: 'Цех · очередь образцов', href: ROUTES.factory.production },
          { label: hubDossierLabel, href: factoryDossierHref },
        ],
      },
      sample_collection: {
        kind: 'empty',
        reason:
          'Лайншиты и витрину ведёт бренд — цех видит статус коллекции после одобрения образца.',
      },
      collection_order: {
        kind: 'empty',
        reason:
          'Оптовый заказ формируют магазин и бренд. Цех получает производственный заказ после передачи.',
      },
      order_production: {
        kind: 'active',
        title: 'Выпуск по техзаданию досье',
        lead: 'Производственный заказ после передачи — серия, спецификация материалов и техзадание из разработки артикула.',
        actions: [
          {
            label: 'Очередь передачи в производство',
            href: factoryHandoffQueueHrefForDemo(PLATFORM_CORE_DEMO),
          },
          {
            label: 'Заказы цеха',
            href: factoryProductionOrdersOrderContextHref(demoOrderId, {
              factoryId: PLATFORM_CORE_DEMO.factoryId,
            }),
          },
          { label: 'Досье · техзадание артикула', href: factoryDossierHref },
        ],
      },
      comms: {
        kind: 'active',
        title: 'Связь по производству и образцам',
        lead: 'Переписка по артикулу, календарь этапов производства.',
        actions: [
          { label: hubChatOrderLabel, href: factoryMessagesB2bOrderContextHref(demoOrderId) },
          { label: 'Чат · артикул', href: factoryArticleMessagesHref },
          { label: 'Календарь · производство', href: factoryCalendarManufacturerHref },
        ],
      },
    },
  },
  {
    id: 'supplier',
    label: 'Поставщик',
    landingHref: ROUTES.factory.supplierCoreCabinet,
    pillars: {
      development: {
        kind: 'active',
        title: 'Материалы в контексте артикула',
        lead: 'Спецификация из досье и уточнение цены через чат по артикулу (без формы запроса цены).',
        actions: [
          { label: 'Материалы · разработка', href: factoryMaterialsHref },
          { label: 'Чат · артикул', href: factoryArticleMessagesSupplierHref },
        ],
      },
      sample_collection: {
        kind: 'empty',
        reason:
          'Документацию коллекции для магазинов ведёт бренд; поставщик подключается через спецификацию образца.',
      },
      collection_order: {
        kind: 'empty',
        reason:
          'Оптовый заказ коллекции — между брендом и магазином; поставщик ждёт производственный заказ под закупку.',
      },
      order_production: {
        kind: 'active',
        title: 'Закупка под выпуск',
        lead: 'Сырьё и фурнитура для производственного заказа и спецификации артикула из досье.',
        actions: [
          { label: 'Закупка под производственный заказ', href: factoryMaterialsProcurementHref },
          { label: 'Очередь передачи в цех', href: factoryHandoffQueueHrefForDemo(PLATFORM_CORE_DEMO) },
          { label: 'Чат · артикул', href: factoryArticleMessagesSupplierHref },
        ],
      },
      comms: {
        kind: 'active',
        title: 'Связь по поставкам',
        lead: 'Переписка и календарь: уточнение через чат и логистика сырья.',
        actions: [
          {
            label: hubChatOrderLabel,
            href: factoryMessagesB2bOrderContextHref(demoOrderId, { role: 'supplier' }),
          },
          { label: 'Чат · артикул', href: factoryArticleMessagesSupplierHref },
          { label: 'Календарь · логистика', href: factorySupplierCalendarB2bOrderContextHref(demoOrderId) },
        ],
      },
    },
  },
];
