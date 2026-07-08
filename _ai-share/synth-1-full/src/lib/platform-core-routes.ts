/**
 * Platform Core v1 · BASELINE routes (brand + shop only).
 *
 * Не импортировать `@/lib/routes` в platform paths.
 * Advanced/archived пути — `@/lib/platform-core-legacy-routes`.
 * Factory/manufacturer/supplier — `@/lib/platform-core-extended-routes`.
 */

import { B2B_WHOLESALE_ORDER_CONTEXT_QUERY } from '@/lib/domain/cross-role-entity-ids';
import {
  workshop2ArticleHref,
  WORKSHOP2_COL_PARAM,
  WORKSHOP2_BASE_PATH,
} from '@/lib/production/workshop2-url';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  platformCoreNativeCheckoutHref,
  platformCoreNativeMatrixHref,
} from '@/lib/platform-core-native-href';

const B2B_CTX = B2B_WHOLESALE_ORDER_CONTEXT_QUERY;

export { WORKSHOP2_COL_PARAM, WORKSHOP2_BASE_PATH, workshop2ArticleHref };

/** Узкий ROUTES для Platform Core v1 baseline (2 роли × 5 столпов). */
export const ROUTES = {
  brand: {
    b2bOrders: '/brand/b2b-orders',
    coreCabinet: '/brand/core',
    factories: '/brand/factories',
    launchReadiness: '/brand/merch/launch-readiness',
    materials: '/brand/materials',
    messages: '/brand/messages',
    messagesChat: (chatId: string) => `/brand/messages?chat=${encodeURIComponent(chatId)}`,
    preOrders: '/brand/pre-orders',
    productionGantt: '/brand/production/gantt',
    productionWorkshop2: '/brand/production/workshop2',
    rangePlanner: '/brand/range-planner',
    retailers: '/brand/retailers',
    showroom: '/brand/showroom',
    suppliers: '/brand/suppliers',
    tasks: '/brand/tasks',
    calendar: '/brand/calendar',
  },
  shop: {
    b2bCalendar: '/shop/b2b/calendar',
    b2bCheckout: '/shop/b2b/checkout',
    b2bCreateOrder: '/shop/b2b/create-order',
    b2bMatrix: '/shop/b2b/matrix',
    b2bOrders: '/shop/b2b/orders',
    b2bPartners: '/shop/b2b/partners',
    b2bPartnersDiscover: '/shop/b2b/partners/discover',
    b2bShowroom: '/shop/b2b/showroom',
    b2bTracking: '/shop/b2b/tracking',
    b2bWorkingOrder: '/shop/b2b/working-order',
    coreCabinet: '/shop/core',
    calendar: '/shop/calendar',
    messages: '/shop/messages',
    messagesChat: (chatId: string) => `/shop/messages?chat=${encodeURIComponent(chatId)}`,
  },
} as const;

export type PlatformCoreRoutes = typeof ROUTES;

export function brandB2bOrderHref(orderId: string): string {
  return `/brand/b2b-orders/${encodeURIComponent(orderId)}`;
}

export function brandB2bOrderHandoffContextHref(orderId: string): string {
  return `${brandB2bOrderHref(orderId)}?pillar=order_production#production-handoff`;
}

export function brandB2bOrderChainContextHref(orderId: string): string {
  return `${brandB2bOrderHref(orderId)}?pillar=order_production`;
}

export function brandB2bOrderDossierContextHref(orderId: string): string {
  return `${brandB2bOrderHref(orderId)}?pillar=order_production#production-dossier`;
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

export function shopB2bWorkingOrderOrderContextHref(orderId: string): string {
  const id = encodeURIComponent(orderId);
  return `${ROUTES.shop.b2bWorkingOrder}?wholesaleOrderId=${id}&${B2B_CTX.order}=${id}&${B2B_CTX.orderId}=${id}`;
}

/** @internal narrow routing helper */
function b2bOrderMessagesQuery(orderId: string): string {
  const id = encodeURIComponent(orderId);
  return `contextType=b2b_order&contextId=${id}&${B2B_CTX.order}=${id}&${B2B_CTX.orderId}=${id}&q=${encodeURIComponent(`B2B ${orderId}`)}`;
}
