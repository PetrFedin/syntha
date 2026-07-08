import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import { ROUTES } from '@/lib/platform-core-routes';
import {
  brandLinesheetsHrefForDemo,
  brandShowroomHrefForDemo,
  getPlatformCoreDemo,
  resolvePageCollectionId,
  type CoreHubPillarId,
} from '@/lib/platform-core-hub-matrix';

export type BrandB2bLegacyRedirectTarget = 'orders' | 'linesheets' | 'retailers' | 'showroom';

export type BrandB2bLegacyRedirectRule = {
  path: string;
  target: BrandB2bLegacyRedirectTarget;
  messageRu: string;
  testId: string;
};

/** Mock / side-path B2B экраны бренда вне golden path — redirect в core. */
export const PLATFORM_CORE_BRAND_B2B_LEGACY_REDIRECTS: readonly BrandB2bLegacyRedirectRule[] = [
  {
    path: `${ROUTES.brand.b2bOrders}/live`,
    target: 'orders',
    messageRu: 'Устаревший монитор заказов → реестр оптовых заказов',
    testId: 'platform-core-brand-b2b-live-legacy-redirect',
  },
  {
    path: `${ROUTES.brand.b2bOrders}/approval-live`,
    target: 'orders',
    messageRu: 'Устаревшее согласование в эфире → реестр оптовых заказов',
    testId: 'platform-core-brand-b2b-approval-live-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.brand.processLiveOrderApproval,
    target: 'orders',
    messageRu: 'Устаревший процесс согласования → реестр оптовых заказов',
    testId: 'platform-core-brand-process-approval-live-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.brand.orderApprovalWorkflow,
    target: 'orders',
    messageRu: 'Устаревший процесс согласования → реестр оптовых заказов',
    testId: 'platform-core-brand-order-approval-workflow-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.brand.orderAmendments,
    target: 'orders',
    messageRu: 'Устаревшие правки заказа → реестр оптовых заказов',
    testId: 'platform-core-brand-order-amendments-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.brand.purchaseOrder,
    target: 'orders',
    messageRu: 'Устаревший мастер производственного заказа → реестр оптовых заказов',
    testId: 'platform-core-brand-po-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.brand.b2bEngagement,
    target: 'retailers',
    messageRu: 'Устаревшая аналитика вовлечённости → ритейлеры',
    testId: 'platform-core-brand-b2b-engagement-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.brand.b2bShipments,
    target: 'orders',
    messageRu: 'Устаревшие отгрузки → реестр оптовых заказов',
    testId: 'platform-core-brand-b2b-shipments-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.brand.tradeShows,
    target: 'linesheets',
    messageRu: 'Устаревшие выставки → лайншиты коллекции',
    testId: 'platform-core-brand-trade-shows-legacy-redirect',
  },
  {
    path: `${ROUTES.brand.showroom}/video-consultation`,
    target: 'showroom',
    messageRu: 'Устаревшая видеоконсультация → витрина коллекции',
    testId: 'platform-core-brand-video-consultation-legacy-redirect',
  },
  {
    path: `${ROUTES.brand.showroom}/banners`,
    target: 'showroom',
    messageRu: 'Устаревшие баннеры витрины → витрина коллекции',
    testId: 'platform-core-brand-showroom-banners-legacy-redirect',
  },
  {
    path: `${ROUTES.brand.showroom}/ai-search`,
    target: 'showroom',
    messageRu: 'Устаревший поиск по витрине → витрина коллекции',
    testId: 'platform-core-brand-showroom-ai-search-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.brand.showroomVr,
    target: 'showroom',
    messageRu: 'Устаревшая VR-витрина → витрина коллекции',
    testId: 'platform-core-brand-showroom-vr-legacy-redirect',
  },
  {
    path: `${ROUTES.brand.showroom}/collaborative`,
    target: 'showroom',
    messageRu: 'Устаревший совместный просмотр → витрина коллекции',
    testId: 'platform-core-brand-showroom-collaborative-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.brand.b2bPassport,
    target: 'linesheets',
    messageRu: 'Устаревший паспорт выставки → лайншиты коллекции',
    testId: 'platform-core-brand-b2b-passport-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.brand.buyerApplications,
    target: 'retailers',
    messageRu: 'Устаревшие заявки байеров → ритейлеры',
    testId: 'platform-core-brand-buyer-applications-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.brand.b2bPrivateInvites,
    target: 'retailers',
    messageRu: 'Устаревшие приглашения → ритейлеры',
    testId: 'platform-core-brand-private-invites-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.brand.contentSyndication,
    target: 'linesheets',
    messageRu: 'Устаревшая синдикация контента → лайншиты',
    testId: 'platform-core-brand-content-syndication-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.brand.catalogQuality,
    target: 'linesheets',
    messageRu: 'Устаревший контроль каталога → лайншиты',
    testId: 'platform-core-brand-catalog-quality-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.brand.lookbookProjects,
    target: 'linesheets',
    messageRu: 'Устаревшие проекты лукбука → лайншиты',
    testId: 'platform-core-brand-lookbook-projects-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.brand.partnerMap,
    target: 'retailers',
    messageRu: 'Устаревшая карта партнёров → ритейлеры',
    testId: 'platform-core-brand-partner-map-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.brand.priceLists,
    target: 'orders',
    messageRu: 'Устаревшие прайс-листы → реестр оптовых заказов',
    testId: 'platform-core-brand-price-lists-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.brand.customerGroups,
    target: 'retailers',
    messageRu: 'Устаревшие группы клиентов → ритейлеры',
    testId: 'platform-core-brand-customer-groups-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.brand.companyAccounts,
    target: 'retailers',
    messageRu: 'Устаревшие аккаунты компаний → ритейлеры',
    testId: 'platform-core-brand-company-accounts-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.brand.b2bLinesheetCampaigns,
    target: 'linesheets',
    messageRu: 'Устаревшие кампании лайншитов → лайншиты',
    testId: 'platform-core-brand-linesheet-campaigns-legacy-redirect',
  },
  {
    path: LEGACY_ROUTES.brand.b2bLinesheetVersions,
    target: 'linesheets',
    messageRu: 'Устаревшие версии лайншитов → лайншиты',
    testId: 'platform-core-brand-linesheet-versions-legacy-redirect',
  },
];

export function pillarIdForBrandB2bLegacyTarget(
  target: BrandB2bLegacyRedirectTarget
): CoreHubPillarId {
  if (target === 'linesheets' || target === 'showroom' || target === 'retailers') {
    return 'sample_collection';
  }
  return 'collection_order';
}

export function resolveBrandB2bLegacyRedirect(
  pathname: string,
  collectionRaw?: string | null
): {
  href: string;
  messageRu: string;
  testId: string;
  target: BrandB2bLegacyRedirectTarget;
} | null {
  const base = (pathname || '').split('?')[0].replace(/\/$/, '') || '/';
  const rule = PLATFORM_CORE_BRAND_B2B_LEGACY_REDIRECTS.find((r) => r.path === base);
  if (!rule) return null;

  const demo = getPlatformCoreDemo(resolvePageCollectionId({ collection: collectionRaw }));

  const href =
    rule.target === 'orders'
      ? ROUTES.brand.b2bOrders
      : rule.target === 'linesheets'
        ? brandLinesheetsHrefForDemo(demo)
        : rule.target === 'showroom'
          ? brandShowroomHrefForDemo(demo)
          : ROUTES.brand.retailers;

  return {
    href,
    messageRu: rule.messageRu,
    testId: rule.testId,
    target: rule.target,
  };
}
