/**
 * Platform Core narrow routing — не импортировать `@/lib/routes` в platform paths.
 * Сгенерировано/поддерживается для hub, components/platform, lib/platform-core-*.
 */

import { B2B_WHOLESALE_ORDER_CONTEXT_QUERY } from '@/lib/domain/cross-role-entity-ids';
import { workshop2ArticleHref, WORKSHOP2_COL_PARAM, WORKSHOP2_BASE_PATH } from '@/lib/production/workshop2-url';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  platformCoreNativeCheckoutHref,
  platformCoreNativeMatrixHref,
} from '@/lib/platform-core-native-href';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';

const B2B_CTX = B2B_WHOLESALE_ORDER_CONTEXT_QUERY;

export { WORKSHOP2_COL_PARAM, WORKSHOP2_BASE_PATH, workshop2ArticleHref };

/** Узкий ROUTES для Platform Core (subset полного `@/lib/routes`). */
export const ROUTES = {
  brand: {
    b2bEngagement: '/brand/b2b/engagement',
    b2bLinesheetCampaigns: '/brand/b2b/linesheet-campaigns',
    b2bLinesheetVersions: '/brand/b2b/linesheet-versions',
    b2bOrders: '/brand/b2b-orders',
    b2bPassport: '/brand/b2b/passport',
    b2bPrivateInvites: '/brand/b2b/private-invites',
    b2bShipments: '/brand/b2b/shipments',
    buyerApplications: '/brand/b2b/buyer-applications',
    catalogQuality: '/brand/b2b/catalog-quality',
    companyAccounts: '/brand/b2b/company-accounts',
    contentSyndication: '/brand/b2b/content-syndication',
    coreCabinet: '/brand/core',
    customerGroups: '/brand/b2b/customer-groups',
    factories: '/brand/factories',
    launchReadiness: '/brand/merch/launch-readiness',
    lookbookProjects: '/brand/b2b/lookbook-projects',
    materials: '/brand/materials',
    messages: '/brand/messages',
    messagesChat: (chatId: string) => `/brand/messages?chat=${encodeURIComponent(chatId)}`,
    orderAmendments: '/brand/b2b/order-amendments',
    orderApprovalWorkflow: '/brand/b2b/order-approval-workflow',
    partnerMap: '/brand/b2b/partner-map',
    preOrders: '/brand/pre-orders',
    priceLists: '/brand/b2b/price-lists',
    processLiveOrderApproval: '/brand/process/order-approval/live',
    productionGantt: '/brand/production/gantt',
    productionWorkshop2: '/brand/production/workshop2',
    purchaseOrder: '/brand/b2b/po',
    rangePlanner: '/brand/range-planner',
    retailers: '/brand/retailers',
    showroom: '/brand/showroom',
    showroomVr: '/brand/showroom/vr',
    suppliers: '/brand/suppliers',
    tasks: '/brand/tasks',
    tradeShows: '/brand/b2b/trade-shows',
    calendar: '/brand/calendar',
  },
  shop: {
    b2bAgentCabinet: '/shop/b2b/agent',
    b2bAiSmartOrder: '/shop/b2b/ai-smart-order',
    b2bAnalytics: '/shop/b2b/analytics',
    b2bApply: '/shop/b2b/apply',
    b2bAssortmentCuration: '/shop/b2b/assortment-curation',
    b2bAssortmentPlanning: '/shop/b2b/assortment-planning',
    b2bCalendar: '/shop/b2b/calendar',
    b2bCatalog: '/shop/b2b/catalog',
    b2bCheckout: '/shop/b2b/checkout',
    b2bCollaborativeOrder: '/shop/b2b/collaborative-order',
    b2bCreateOrder: '/shop/b2b/create-order',
    b2bCustomAssortments: '/shop/b2b/custom-assortments',
    b2bDeliveryCalendar: '/shop/b2b/delivery-calendar',
    b2bDiscover: '/shop/b2b/discover',
    b2bDocuments: '/shop/b2b/documents',
    b2bEzOrder: '/shop/b2b/ez-order',
    b2bFulfillmentDashboard: '/shop/b2b/fulfillment-dashboard',
    b2bGamification: '/shop/b2b/gamification',
    b2bGridOrdering: '/shop/b2b/grid-ordering',
    b2bLookbooks: '/shop/b2b/lookbooks',
    b2bMarginAnalysis: '/shop/b2b/margin-analysis',
    b2bMarginCalculator: '/shop/b2b/margin-calculator',
    b2bMatrix: '/shop/b2b/matrix',
    b2bOrderByCollection: '/shop/b2b/order-by-collection',
    b2bOrderDrafts: '/shop/b2b/order-drafts',
    b2bOrderMode: '/shop/b2b/order-mode',
    b2bOrderTemplates: '/shop/b2b/order-templates',
    b2bOrders: '/shop/b2b/orders',
    b2bPartners: '/shop/b2b/partners',
    b2bPartnersDiscover: '/shop/b2b/partners/discover',
    b2bPassport: '/shop/b2b/passport',
    b2bPayment: '/shop/b2b/payment',
    b2bPreOrder: '/shop/b2b/pre-order',
    b2bQuickOrder: '/shop/b2b/quick-order',
    b2bQuoteToOrder: '/shop/b2b/quote-to-order',
    b2bReorder: '/shop/b2b/reorder',
    b2bReplenishment: '/shop/b2b/replenishment',
    b2bReports: '/shop/b2b/reports',
    b2bRfq: '/shop/b2b/rfq',
    b2bRfqCreate: '/shop/b2b/rfq/create',
    b2bSalesRepPortal: '/shop/b2b/sales-rep-portal',
    b2bSelectionBuilder: '/shop/b2b/selection-builder',
    b2bShopifySync: '/shop/b2b/shopify-sync',
    b2bShowroom: '/shop/b2b/showroom',
    b2bSocialFeed: '/shop/b2b/social-feed',
    b2bStockMap: '/shop/b2b/stock-map',
    b2bTenders: '/shop/b2b/tenders',
    b2bTracking: '/shop/b2b/tracking',
    b2bTradeShowAppointments: '/shop/b2b/trade-shows/appointments',
    b2bTradeShows: '/shop/b2b/trade-shows',
    b2bVideoConsultation: '/shop/b2b/video-consultation',
    b2bVipRoomBooking: '/shop/b2b/vip-room-booking',
    b2bWhiteboard: '/shop/b2b/whiteboard',
    b2bWorkingOrder: '/shop/b2b/working-order',
    b2bWorkspaceMap: '/shop/b2b/workspace-map',
    coreCabinet: '/shop/core',
    calendar: '/shop/calendar',
    messages: '/shop/messages',
    messagesChat: (chatId: string) => `/shop/messages?chat=${encodeURIComponent(chatId)}`,
  },
  factory: {
    calendar: '/factory/calendar',
    messages: '/factory/messages',
    production: '/factory/production',
    productionCalendar: '/factory/production/calendar',
    productionCatalog: '/factory/production/catalog',
    productionCoreCabinet: '/factory/production/core',
    productionMaterials: '/factory/production/materials',
    productionMessages: '/factory/production/messages',
    productionOrders: '/factory/production/orders',
    supplier: '/factory/supplier',
    supplierCoreCabinet: '/factory/supplier/core',
    supplierMessages: '/factory/supplier/messages',
    supplierRfqInbox: '/factory/supplier/rfq-inbox',
  },
} as const;

export type PlatformCoreRoutes = typeof ROUTES;

export type FactoryMessagesRole = 'manufacturer' | 'supplier';

export function brandB2bOrderHref(orderId: string): string {
  return `/brand/b2b-orders/${encodeURIComponent(orderId)}`;
}


export function brandB2bOrderHandoffContextHref(orderId: string): string {
  return `${brandB2bOrderHref(orderId)}?pillar=order_production#production-handoff`;
}


export function brandB2bOrderChainContextHref(orderId: string): string {
  return `${brandB2bOrderHref(orderId)}?pillar=order_production`;
}


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


export function brandB2bOrdersAwaitingHandoffRegistryHref(): string {
  return brandB2bOrdersRegistryHref({ filter: 'awaiting_handoff' });
}


export function brandB2bOrdersProductionRegistryHref(orderId?: string): string {
  return brandB2bOrdersRegistryHref({
    filter: 'in_production',
    order: orderId ?? null,
  });
}


export function brandB2bOrdersCollectionRegistryHref(orderId?: string | null): string {
  return brandB2bOrdersRegistryHref({ productionPillar: false, order: orderId ?? null });
}


export function brandCoreOrderProductionCabinetHref(collectionId: string): string {
  return `${ROUTES.brand.coreCabinet}?pillar=order_production&collection=${encodeURIComponent(collectionId)}`;
}

/** Главный хаб Platform Core — без legacy Workshop2 UI. */
export function platformHubHref(collectionId?: string): string {
  const cid = collectionId?.trim();
  return cid ? `/platform?collection=${encodeURIComponent(cid)}` : '/platform';
}

/** Столп development в кабинете бренда (канон вместо `/brand/production/workshop2`). */
export function brandDevelopmentCabinetHref(
  collectionId: string,
  articleId?: string,
  opts?: { create?: boolean; section?: string }
): string {
  const sp = new URLSearchParams({
    pillar: 'development',
    collection: collectionId.trim(),
  });
  const aid = articleId?.trim();
  if (aid) sp.set('article', aid);
  const section = opts?.section?.trim();
  if (section) {
    sp.set('section', section);
  } else {
    sp.set('section', aid ? 'brand-dev-dossier' : 'brand-dev-w2-hub');
  }
  if (opts?.create) sp.set('create', '1');
  return `${ROUTES.brand.coreCabinet}?${sp.toString()}`;
}

/** Deep-link артикула в development (material/tz section опционально). */
export function brandDevelopmentArticleHref(
  collectionId: string,
  articleId: string,
  opts?: { section?: 'material' | 'tz' | 'overview' | string }
): string {
  const sp = new URLSearchParams({
    pillar: 'development',
    collection: collectionId.trim(),
    article: articleId.trim(),
    section: 'brand-dev-dossier',
  });
  const w2sec = opts?.section?.trim();
  if (w2sec && w2sec !== 'brand-dev-dossier') sp.set('w2sec', w2sec);
  return `${ROUTES.brand.coreCabinet}?${sp.toString()}`;
}

/** @deprecated имя сохранено для совместимости — ведёт в brand core development, не в Workshop2 UI. */
export function brandW2ProductionTzHref(collectionId: string, articleId: string): string {
  return brandDevelopmentArticleHref(collectionId, articleId, { section: 'material' });
}


export function factoryProductionDossierHref(
  articleId: string,
  opts?: { collectionId?: string }
): string {
  const base = `/factory/production/dossier/${encodeURIComponent(articleId)}`;
  const cid = opts?.collectionId?.trim();
  return cid ? `${base}?collection=${encodeURIComponent(cid)}` : base;
}


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


export function factoryCoreOrderProductionCabinetHref(collectionId: string): string {
  return `${ROUTES.factory.productionCoreCabinet}?pillar=order_production&collection=${encodeURIComponent(collectionId)}`;
}


export function shopB2bOrderHref(orderId: string): string {
  return `/shop/b2b/orders/${encodeURIComponent(orderId)}`;
}


export function shopB2bTrackingOrderHref(orderId: string): string {
  return `${ROUTES.shop.b2bTracking}?order=${encodeURIComponent(orderId)}`;
}


export function shopB2bOrderProductionContextHref(orderId: string): string {
  return `${shopB2bOrderHref(orderId)}#shop-co-buyer-tracking`;
}


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


export function shopB2bOrdersProductionRegistryHref(orderId?: string): string {
  return shopB2bOrdersRegistryHref({
    filter: 'in_production',
    order: orderId ?? null,
  });
}


export function shopB2bOrdersCollectionRegistryHref(orderId?: string | null): string {
  return shopB2bOrdersRegistryHref({ productionPillar: false, order: orderId ?? null });
}


export function factoryProductionOrdersOrderContextHref(
  orderId: string,
  opts?: { factoryId?: string }
): string {
  const sp = new URLSearchParams({ order: orderId });
  if (opts?.factoryId?.trim()) sp.set('factoryId', opts.factoryId.trim());
  return `${ROUTES.factory.productionOrders}?${sp.toString()}`;
}


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


export function shopB2bCheckoutCollectionHref(
  collectionId: string,
  opts?: { buyerId?: string }
): string {
  if (isPlatformCoreMode()) {
    return platformCoreNativeCheckoutHref(collectionId, { buyerId: opts?.buyerId });
  }
  const sp = new URLSearchParams({ collection: collectionId });
  const buyerId = opts?.buyerId?.trim();
  if (buyerId && buyerId !== 'shop1') {
    sp.set('buyer', buyerId);
  }
  return `${ROUTES.shop.b2bCheckout}?${sp.toString()}`;
}


export function shopB2bMatrixReorderHref(
  collectionId: string,
  orderId?: string,
  opts?: { buyerId?: string }
): string {
  if (isPlatformCoreMode()) {
    return platformCoreNativeMatrixHref(collectionId, orderId);
  }
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


export function brandMessagesB2bOrderContextHref(orderId: string): string {
  return `${ROUTES.brand.messages}?${b2bOrderMessagesQuery(orderId)}`;
}


export function brandMessagesWorkshop2ArticleContextHref(
  collectionId: string,
  articleId: string
): string {
  const ctx = encodeURIComponent(`${collectionId}:${articleId}`);
  return `${ROUTES.brand.messages}?contextType=workshop2_article&contextId=${ctx}`;
}


export function shopMessagesB2bOrderContextHref(orderId: string): string {
  return `${ROUTES.shop.messages}?${b2bOrderMessagesQuery(orderId)}`;
}


export function shopMessagesWorkshop2ArticleContextHref(
  collectionId: string,
  articleId: string
): string {
  const ctx = encodeURIComponent(`${collectionId}:${articleId}`);
  return `${ROUTES.shop.messages}?contextType=workshop2_article&contextId=${ctx}`;
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


export function factorySupplierMessagesB2bOrderContextHref(orderId: string): string {
  return `${ROUTES.factory.supplierMessages}?${b2bOrderMessagesQuery(orderId)}`;
}


export function factorySupplierMessagesWorkshop2ArticleContextHref(
  collectionId: string,
  articleId: string
): string {
  const ctx = encodeURIComponent(`${collectionId}:${articleId}`);
  return `${ROUTES.factory.supplierMessages}?contextType=workshop2_article&contextId=${ctx}`;
}


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


export function factoryCalendarB2bOrderContextHref(orderId: string): string {
  const id = encodeURIComponent(orderId);
  return `${ROUTES.factory.productionCalendar}?layers=tasks,orders,production&${B2B_CTX.order}=${id}`;
}


export function factorySupplierCalendarB2bOrderContextHref(orderId: string): string {
  const sp = new URLSearchParams({
    role: 'supplier',
    layers: 'tasks,orders,logistics',
  });
  sp.set(B2B_CTX.order, orderId);
  sp.set(B2B_CTX.orderId, orderId);
  return `${ROUTES.factory.calendar}?${sp.toString()}`;
}


export function shopB2bWorkingOrderOrderContextHref(orderId: string): string {
  const id = encodeURIComponent(orderId);
  return `${ROUTES.shop.b2bWorkingOrder}?wholesaleOrderId=${id}&${B2B_CTX.order}=${id}&${B2B_CTX.orderId}=${id}`;
}


/** @internal narrow routing helper */
function b2bOrderMessagesQuery(orderId: string): string {
  const id = encodeURIComponent(orderId);
  return `contextType=b2b_order&contextId=${id}&${B2B_CTX.order}=${id}&${B2B_CTX.orderId}=${id}&q=${encodeURIComponent(`B2B ${orderId}`)}`;
}


/** @internal narrow routing helper */
function factoryMessagesRoleQuery(role?: FactoryMessagesRole): string {
  return role ? `role=${role}` : '';
}

