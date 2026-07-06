import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  ROUTES,
  shopB2bMatrixPrepackHref,
  shopB2bMatrixReorderHref,
  shopB2bWorkingOrderOrderContextHref,
} from '@/lib/routes';

export function shopReplenishmentTabHref(
  featureId: 'alerts' | 'stock-atp' | 'rules',
  collectionId: string = PLATFORM_CORE_DEMO.collectionId,
  orderId?: string
): string {
  const sp = new URLSearchParams({
    collection: collectionId,
    [PILLAR_CAPABILITY_FEATURE_PARAM]: featureId,
  });
  if (orderId?.trim()) {
    const id = orderId.trim();
    sp.set('order', id);
    sp.set('orderId', id);
  }
  return `${ROUTES.shop.b2bReplenishment}?${sp.toString()}`;
}

export function shopMatrixWorkspaceTabHref(
  featureId: 'matrix' | 'inspector' | 'prepack',
  collectionId: string = PLATFORM_CORE_DEMO.collectionId,
  orderId?: string,
  articleId?: string
): string {
  if (featureId === 'prepack') {
    return shopB2bMatrixPrepackHref(collectionId, orderId);
  }
  if (featureId === 'matrix') {
    return `${shopB2bMatrixReorderHref(collectionId, orderId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=matrix`;
  }
  const sp = new URLSearchParams({
    collection: collectionId,
    [PILLAR_CAPABILITY_FEATURE_PARAM]: 'inspector',
  });
  if (orderId?.trim()) {
    const id = orderId.trim();
    sp.set('order', id);
    sp.set('orderId', id);
  }
  if (articleId?.trim()) {
    sp.set('article', articleId.trim());
  }
  return `${ROUTES.shop.b2bMatrix}?${sp.toString()}`;
}

export function shopWorkingOrderTabHref(
  featureId: 'versions' | 'bulk' | 'handoff',
  wholesaleOrderId: string = PLATFORM_CORE_DEMO.demoOrderId,
  collectionId?: string
): string {
  const base = shopB2bWorkingOrderOrderContextHref(wholesaleOrderId);
  const collectionQ = collectionId?.trim()
    ? `&collection=${encodeURIComponent(collectionId.trim())}`
    : '';
  return `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=${featureId}${collectionQ}`;
}

export function shopShowroomTabHref(
  featureId: 'showroom' | 'linesheet' | 'buy',
  collectionId: string = PLATFORM_CORE_DEMO.collectionId,
  orderId?: string
): string {
  const sp = new URLSearchParams({
    collection: collectionId,
    [PILLAR_CAPABILITY_FEATURE_PARAM]: featureId,
  });
  if (orderId?.trim()) {
    const id = orderId.trim();
    sp.set('order', id);
    sp.set('orderId', id);
  }
  return `${ROUTES.shop.b2bShowroom}?${sp.toString()}`;
}

export function shopCollaborativeTabHref(
  featureId: 'session' | 'approvals' | 'comms',
  orderId: string = PLATFORM_CORE_DEMO.demoOrderId,
  collectionId?: string
): string {
  const sp = new URLSearchParams({
    order: orderId,
    [PILLAR_CAPABILITY_FEATURE_PARAM]: featureId,
  });
  if (collectionId?.trim()) {
    sp.set('collection', collectionId.trim());
  }
  return `${ROUTES.shop.b2bCollaborativeOrder}?${sp.toString()}`;
}

/** Brand oversight · read-only mirror of shop collaborative session (wave VI). */
export function shopCollaborativeTabReadOnlyHref(
  featureId: 'session' | 'approvals' | 'comms' = 'session',
  orderId: string = PLATFORM_CORE_DEMO.demoOrderId,
  collectionId?: string
): string {
  return `${shopCollaborativeTabHref(featureId, orderId, collectionId)}&readOnly=1`;
}

export function shopLandedMarginTabHref(
  featureId: 'hub' | 'rollup' | 'pricelist',
  collectionId: string = PLATFORM_CORE_DEMO.collectionId,
  orderId?: string
): string {
  const resolvedOrderId = orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const base = `${ROUTES.shop.b2bMarginAnalysis}?collection=${encodeURIComponent(collectionId)}&order=${encodeURIComponent(resolvedOrderId)}`;
  return `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=${featureId}`;
}

export function shopOrderCommsTabHref(
  featureId: 'tracking' | 'chat' | 'calendar',
  orderId: string = PLATFORM_CORE_DEMO.demoOrderId,
  collectionId?: string
): string {
  const resolvedCollectionId = collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const base = `${ROUTES.shop.b2bTracking}?order=${encodeURIComponent(orderId)}&collection=${encodeURIComponent(resolvedCollectionId)}`;
  return `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=${featureId}`;
}
