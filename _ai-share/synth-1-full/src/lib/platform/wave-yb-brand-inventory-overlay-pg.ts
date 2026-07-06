/** Wave YB · brand collection inventory overlay PG (GET/PUT `/api/brand/collection-inventory-overlay`). */

import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { getPlatformCoreDemoByOrderId, PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { ROUTES } from '@/lib/routes';

export const BRAND_COLLECTION_INVENTORY_OVERLAY_API = '/api/brand/collection-inventory-overlay';

export const BRAND_COLLECTION_INVENTORY_OVERLAY_PG_TABLE = 'brand_collection_inventory_overlay';

export const BRAND_COLLECTION_INVENTORY_OVERLAY_PG_BADGE_RU =
  'PostgreSQL · overlay артикулов';
export const BRAND_COLLECTION_INVENTORY_OVERLAY_PG_UNAVAILABLE_RU = 'PG недоступен';
export const BRAND_COLLECTION_INVENTORY_OVERLAY_LOADING_RU = 'Загрузка overlay…';
export const BRAND_COLLECTION_INVENTORY_OVERLAY_MERGE_RU =
  'Состав коллекции: seed + PG overlay (без localStorage в core)';
export const BRAND_COLLECTION_INVENTORY_OVERLAY_LEDGER_LINK_RU =
  'Резерв WMS · inventory ledger →';

export const BRAND_COLLECTION_INVENTORY_OVERLAY_PG_BADGE_TESTID =
  'brand-collection-inventory-overlay-storage-pg';
export const BRAND_COLLECTION_INVENTORY_OVERLAY_PG_UNAVAILABLE_TESTID =
  'brand-collection-inventory-overlay-storage-pg-unavailable';
export const BRAND_COLLECTION_INVENTORY_OVERLAY_LEDGER_LINK_TESTID =
  'brand-collection-inventory-overlay-inventory-ledger-link';
export const BRAND_COLLECTION_INVENTORY_OVERLAY_STRIP_TESTID =
  'brand-collection-inventory-overlay-strip';

/** Deep-link brand inventory ledger overview + WMS reserve strip (Wave YB cross-link). */
export function buildBrandCollectionInventoryLedgerWmsHref(input?: {
  collectionId?: string;
  orderId?: string;
  articleId?: string;
  productionOrderId?: string;
}): string {
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const demo = getPlatformCoreDemoByOrderId(orderId);
  const collectionId = input?.collectionId?.trim() || demo.collectionId;
  const articleId = input?.articleId?.trim() || demo.demoArticleId;
  const productionOrderId = input?.productionOrderId?.trim() || demo.productionOrderId;
  const params = new URLSearchParams({
    [PILLAR_CAPABILITY_FEATURE_PARAM]: 'overview',
    collection: collectionId,
    order: orderId,
  });
  if (articleId) params.set('article', articleId);
  if (productionOrderId) params.set('po', productionOrderId);
  return `${ROUTES.brand.inventory}?${params.toString()}`;
}
