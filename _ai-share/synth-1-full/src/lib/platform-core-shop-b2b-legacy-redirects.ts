import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import { ROUTES } from '@/lib/platform-core-routes';
import { resolvePageCollectionId, type CoreHubPillarId } from '@/lib/platform-core-hub-matrix';

export type ShopB2bLegacyRedirectTarget =
  | 'showroom'
  | 'matrix'
  | 'orders'
  | 'partners_discover'
  | 'calendar'
  | 'tracking';

export type ShopB2bLegacyRedirectRule = {
  path: string;
  target: ShopB2bLegacyRedirectTarget;
  messageRu: string;
  testId: string;
};

/** Mock / side-path B2B экраны вне golden path — redirect в core. */
export const PLATFORM_CORE_SHOP_B2B_LEGACY_REDIRECTS: readonly ShopB2bLegacyRedirectRule[] = [
  {
    path: LEGACY_ROUTES.shop.b2bCatalog,
    target: 'showroom',
    messageRu: 'Устаревший каталог → витрина опубликованной коллекции',
    testId: 'platform-core-catalog-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bQuickOrder,
    target: 'matrix',
    messageRu: 'Устаревший быстрый заказ → матрица оптового заказа',
    testId: 'platform-core-quick-order-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bEzOrder,
    target: 'matrix',
    messageRu: 'Устаревший мастер заказа → матрица оптового заказа',
    testId: 'platform-core-ez-order-legacy-redirect',
  },
  {
    path: ROUTES.shop.b2bCreateOrder,
    target: 'matrix',
    messageRu: 'Устаревший мастер заказа → матрица оптового заказа',
    testId: 'platform-core-create-order-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bSelectionBuilder,
    target: 'matrix',
    messageRu: 'Устаревший подбор ассортимента → матрица оптового заказа',
    testId: 'platform-core-selection-builder-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bAiSmartOrder,
    target: 'matrix',
    messageRu: 'Устаревший ИИ-заказ → матрица оптового заказа',
    testId: 'platform-core-ai-smart-order-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bGridOrdering,
    target: 'matrix',
    messageRu: 'Устаревшая сетка заказа → матрица оптового заказа',
    testId: 'platform-core-grid-ordering-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bPayment,
    target: 'orders',
    messageRu: 'Устаревшая оплата → реестр оптовых заказов',
    testId: 'platform-core-payment-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bShopifySync,
    target: 'orders',
    messageRu: 'Устаревшая синхронизация каналов → реестр оптовых заказов',
    testId: 'platform-core-shopify-sync-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bWorkspaceMap,
    target: 'orders',
    messageRu: 'Устаревшая карта процессов → реестр оптовых заказов',
    testId: 'platform-core-workspace-map-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bQuoteToOrder,
    target: 'matrix',
    messageRu: 'Устаревшее коммерческое предложение → матрица оптового заказа',
    testId: 'platform-core-quote-to-order-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bReorder,
    target: 'orders',
    messageRu: 'Устаревший повтор заказа → реестр оптовых заказов',
    testId: 'platform-core-reorder-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bLookbooks,
    target: 'showroom',
    messageRu: 'Устаревшие лукбуки → витрина коллекции',
    testId: 'platform-core-lookbooks-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bOrderByCollection,
    target: 'matrix',
    messageRu: 'Устаревший заказ по коллекции → матрица оптового заказа',
    testId: 'platform-core-order-by-collection-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bPassport,
    target: 'showroom',
    messageRu: 'Устаревший паспорт выставки → витрина коллекции',
    testId: 'platform-core-passport-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bOrderMode,
    target: 'matrix',
    messageRu: 'Устаревший режим заказа → матрица оптового заказа',
    testId: 'platform-core-order-mode-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bDiscover,
    target: 'partners_discover',
    messageRu: 'Устаревший discover → партнёры брендов',
    testId: 'platform-core-discover-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bPreOrder,
    target: 'matrix',
    messageRu: 'Устаревший предзаказ → матрица оптового заказа',
    testId: 'platform-core-pre-order-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bWhiteboard,
    target: 'showroom',
    messageRu: 'Устаревшая доска → витрина коллекции',
    testId: 'platform-core-whiteboard-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bOrderDrafts,
    target: 'orders',
    messageRu: 'Устаревшие черновики → реестр оптовых заказов',
    testId: 'platform-core-order-drafts-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bOrderTemplates,
    target: 'matrix',
    messageRu: 'Устаревшие шаблоны → матрица оптового заказа',
    testId: 'platform-core-order-templates-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bVipRoomBooking,
    target: 'showroom',
    messageRu: 'Устаревшее бронирование зала → витрина коллекции',
    testId: 'platform-core-vip-room-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bVideoConsultation,
    target: 'partners_discover',
    messageRu: 'Устаревшая видеоконсультация → партнёры брендов',
    testId: 'platform-core-video-consultation-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bTradeShows,
    target: 'showroom',
    messageRu: 'Устаревшие выставки → витрина коллекции',
    testId: 'platform-core-trade-shows-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bTradeShowAppointments,
    target: 'showroom',
    messageRu: 'Устаревшие встречи на выставке → витрина коллекции',
    testId: 'platform-core-trade-show-appointments-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bSocialFeed,
    target: 'partners_discover',
    messageRu: 'Устаревшая лента → партнёры брендов',
    testId: 'platform-core-social-feed-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bApply,
    target: 'partners_discover',
    messageRu: 'Устаревшая заявка на партнёрство → партнёры брендов',
    testId: 'platform-core-apply-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bAgentCabinet,
    target: 'matrix',
    messageRu: 'Устаревший кабинет агента → матрица оптового заказа',
    testId: 'platform-core-agent-cabinet-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bAnalytics,
    target: 'orders',
    messageRu: 'Устаревшая аналитика → реестр оптовых заказов',
    testId: 'platform-core-analytics-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bRfq,
    target: 'partners_discover',
    messageRu: 'RFQ вне Platform Core — чат по заказу в столпе «Связь» или партнёры брендов',
    testId: 'platform-core-rfq-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bRfqCreate,
    target: 'partners_discover',
    messageRu: 'Создание RFQ вне Platform Core — чат по заказу или партнёры брендов',
    testId: 'platform-core-rfq-create-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bFulfillmentDashboard,
    target: 'orders',
    messageRu: 'Устаревшая панель отгрузок → реестр оптовых заказов',
    testId: 'platform-core-fulfillment-dashboard-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bReports,
    target: 'orders',
    messageRu: 'Устаревшие отчёты → реестр оптовых заказов',
    testId: 'platform-core-reports-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bMarginCalculator,
    target: 'matrix',
    messageRu: 'Устаревший калькулятор маржи → матрица оптового заказа',
    testId: 'platform-core-margin-calculator-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bGamification,
    target: 'partners_discover',
    messageRu: 'Устаревший раздел геймификации → партнёры брендов',
    testId: 'platform-core-gamification-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bDeliveryCalendar,
    target: 'calendar',
    messageRu: 'Устаревший календарь поставок → единый календарь B2B',
    testId: 'platform-core-delivery-calendar-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.shop.b2bStockMap,
    target: 'tracking',
    messageRu: 'Устаревшая карта остатков → отслеживание B2B',
    testId: 'platform-core-stock-map-legacy-redirect',
  },
];

export function pillarIdForShopB2bLegacyTarget(
  target: ShopB2bLegacyRedirectTarget
): CoreHubPillarId {
  if (target === 'showroom' || target === 'partners_discover') return 'sample_collection';
  if (target === 'calendar') return 'comms';
  return 'collection_order';
}

export function resolveShopB2bLegacyRedirect(
  pathname: string,
  collectionRaw: string | null | undefined
): {
  href: string;
  messageRu: string;
  testId: string;
  target: ShopB2bLegacyRedirectTarget;
} | null {
  const base = (pathname || '').split('?')[0].replace(/\/$/, '') || '/';
  const rule = PLATFORM_CORE_SHOP_B2B_LEGACY_REDIRECTS.find((r) => r.path === base);
  if (!rule) return null;

  const collectionId = resolvePageCollectionId({ collection: collectionRaw });
  const params = `collection=${encodeURIComponent(collectionId)}`;

  const href =
    rule.target === 'showroom'
      ? `${ROUTES.shop.b2bShowroom}?${params}`
      : rule.target === 'matrix'
        ? `${ROUTES.shop.b2bMatrix}?${params}`
        : rule.target === 'partners_discover'
          ? ROUTES.shop.b2bPartnersDiscover
          : rule.target === 'calendar'
            ? `${ROUTES.shop.b2bCalendar}?${params}&layers=orders,logistics`
            : rule.target === 'tracking'
              ? ROUTES.shop.b2bTracking
              : ROUTES.shop.b2bOrders;

  return {
    href,
    messageRu: rule.messageRu,
    testId: rule.testId,
    target: rule.target,
  };
}
