/**
 * Shop CO peer hrefs — legacy URL shape → platformCoreUiHref (MODE-aware).
 * Без импорта lib/b2b / lib/routes.
 */
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';
import {
  ROUTES,
  shopB2bCheckoutCollectionHref,
  shopB2bMatrixReorderHref,
} from '@/lib/platform-core-routes';

export function shopCoCollaborativeTabUiHref(
  featureId: 'session' | 'approvals' | 'comms',
  orderId: string,
  collectionId?: string
): string {
  const sp = new URLSearchParams({
    order: orderId,
    [PILLAR_CAPABILITY_FEATURE_PARAM]: featureId,
  });
  if (collectionId?.trim()) sp.set('collection', collectionId.trim());
  return platformCoreUiHref(`${ROUTES.shop.b2bCollaborativeOrder}?${sp.toString()}`);
}

export function shopCoLandedMarginTabUiHref(
  featureId: 'hub' | 'rollup' | 'pricelist',
  collectionId: string,
  orderId?: string
): string {
  const oid = orderId?.trim() ?? '';
  const sp = new URLSearchParams({
    collection: collectionId,
    [PILLAR_CAPABILITY_FEATURE_PARAM]: featureId,
  });
  if (oid) sp.set('order', oid);
  return platformCoreUiHref(`${ROUTES.shop.b2bMarginAnalysis}?${sp.toString()}`);
}

export function shopCoReplenishmentTabUiHref(
  featureId: 'alerts' | 'stock-atp' | 'rules',
  collectionId: string,
  orderId?: string
): string {
  const sp = new URLSearchParams({
    collection: collectionId,
    [PILLAR_CAPABILITY_FEATURE_PARAM]: featureId,
  });
  if (orderId?.trim()) {
    sp.set('order', orderId.trim());
    sp.set('orderId', orderId.trim());
  }
  return platformCoreUiHref(`${ROUTES.shop.b2bReplenishment}?${sp.toString()}`);
}

export function shopCoMatrixReorderUiHref(
  collectionId: string,
  orderId: string,
  opts?: { buyerId?: string }
): string {
  return platformCoreUiHref(shopB2bMatrixReorderHref(collectionId, orderId, opts));
}

export function shopCoCheckoutCollectionUiHref(
  collectionId: string,
  opts?: { buyerId?: string }
): string {
  return platformCoreUiHref(shopB2bCheckoutCollectionHref(collectionId, opts));
}

export function shopB2bLegacyUiHref(pathWithQuery: string): string {
  return platformCoreUiHref(pathWithQuery);
}
