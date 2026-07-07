/**
 * Platform Core · BASELINE hub rows (brand + shop) — ядро v1.
 *
 * Только 2 публичные роли и 5 столпов. Никаких factory/supplier импортов —
 * extended-роли живут в `platform-core-hub-matrix-rows-extended.ts` за флагом
 * `NEXT_PUBLIC_PC_EXTENDED_ROLES=1`. Комбинированный список — `platform-core-hub-matrix-rows-all.ts`.
 *
 * Цепочка: Article → Sample → Collection → Wholesale Order → Fulfillment → Communication.
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
  shopB2bOrderHref,
  shopB2bOrdersProductionRegistryHref,
  shopB2bTrackingOrderHref,
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
} from '@/lib/platform-core-hub-matrix-demo-hrefs';

const { collectionId, demoOrderId, demoArticleId } = PLATFORM_CORE_DEMO;

const w2ArticleMessagesHref = brandMessagesWorkshop2ArticleContextHref(collectionId, demoArticleId);
const brandDevelopmentHref = brandDevelopmentCabinetHref(collectionId);
const shopMatrixHref = `${ROUTES.shop.b2bMatrix}?collection=${collectionId}`;
const shopShowroomHref = `${ROUTES.shop.b2bShowroom}?collection=${collectionId}`;
const brandLinesheetsHref = brandLinesheetsHrefForDemo(PLATFORM_CORE_DEMO);
const brandShowroomHref = brandShowroomHrefForDemo(PLATFORM_CORE_DEMO);
const brandArticleDevelopmentHref = brandDevelopmentArticleHref(collectionId, demoArticleId, {
  section: 'material',
});
const hubCollectionLabel = getPlatformCoreCollectionLabel(collectionId);
const hubWholesaleOrderLabel = `Оптовый заказ · ${hubCollectionLabel}`;
const hubDossierLabel = `Досье · ${hubCollectionLabel}`;
const hubChatOrderLabel = `Чат · заказ · ${hubCollectionLabel}`;
const hubCalendarOrderLabel = `Календарь · заказ · ${hubCollectionLabel}`;

/** Публичные роли v1: бренд + магазин. Источник правды hub-матрицы baseline. */
export const PLATFORM_CORE_BASELINE_ROWS: readonly CoreHubRoleRow[] = [
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
          'Разработку артикула ведёт бренд. Магазин видит опубликованную коллекцию в витрине (read-only).',
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
        kind: 'active',
        title: 'Отслеживание и приёмка',
        lead: 'Статус производства, окна отгрузки, документы и задержки по отправленному оптовому заказу — представление байера по правилам бренда.',
        actions: [
          { label: 'Трекинг заказа', href: shopB2bTrackingOrderHref(demoOrderId) },
          { label: 'Заказы в производстве', href: shopB2bOrdersProductionRegistryHref(demoOrderId) },
          { label: hubCalendarOrderLabel, href: shopCalendarB2bOrderContextHref(demoOrderId) },
        ],
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
];
