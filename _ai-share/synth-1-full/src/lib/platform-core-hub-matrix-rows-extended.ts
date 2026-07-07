/**
 * Platform Core · EXTENDED hub rows (manufacturer + supplier).
 *
 * Не входят в baseline v1 (brand + shop). Показываются в hub только при
 * `NEXT_PUBLIC_PC_EXTENDED_ROLES=1`. Все factory/* route- и demo-href-импорты
 * изолированы здесь — baseline-файлы (`platform-core-hub-matrix-rows.ts`) их не тянут.
 *
 * Физический перенос standalone-кабинетов цеха/поставщика в `_extended/` —
 * см. `_platform-core-v1/migration-notes/`. Пока изоляция логическая (routes/rows/nav).
 */
import {
  PLATFORM_CORE_ROUTES as ROUTES,
  factoryMessagesB2bOrderContextHref,
  factoryMessagesWorkshop2ArticleContextHref,
  factoryProductionDossierHref,
  factoryProductionOrdersOrderContextHref,
  factorySupplierCalendarB2bOrderContextHref,
  factorySupplierMessagesWorkshop2ArticleContextHref,
} from '@/lib/platform-core-extended-routes';
import {
  PLATFORM_CORE_DEMO,
  getPlatformCoreCollectionLabel,
} from '@/lib/platform-core-demo-context';
import type { CoreHubRoleRow } from '@/lib/platform-core-hub-matrix.types';
import {
  factoryHandoffQueueHrefForDemo,
  factoryMaterialsHrefForDemo,
  factoryMaterialsProcurementHrefForDemo,
} from '@/lib/platform-core-hub-matrix-demo-hrefs';

const { collectionId, demoOrderId, demoArticleId } = PLATFORM_CORE_DEMO;

const factoryArticleMessagesHref = factoryMessagesWorkshop2ArticleContextHref(
  collectionId,
  demoArticleId
);
const factoryArticleMessagesSupplierHref = factorySupplierMessagesWorkshop2ArticleContextHref(
  collectionId,
  demoArticleId
);
const factoryCalendarManufacturerHref = `${ROUTES.factory.productionCalendar}?role=manufacturer&layers=tasks,orders,production`;
const factoryDossierHref = factoryProductionDossierHref(demoArticleId, { collectionId });
const factoryMaterialsHref = factoryMaterialsHrefForDemo(PLATFORM_CORE_DEMO);
const factoryMaterialsProcurementHref = factoryMaterialsProcurementHrefForDemo(PLATFORM_CORE_DEMO);

const hubCollectionLabel = getPlatformCoreCollectionLabel(collectionId);
const hubDossierLabel = `Досье · ${hubCollectionLabel}`;
const hubChatOrderLabel = `Чат · заказ · ${hubCollectionLabel}`;

/** Роли вне baseline: цех и поставщик (feature flag `NEXT_PUBLIC_PC_EXTENDED_ROLES=1`). */
export const PLATFORM_CORE_EXTENDED_ROWS: readonly CoreHubRoleRow[] = [
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
