import { brandB2bOrdersCollectionRegistryHref, shopB2bTrackingOrderHref } from '@/lib/routes';
import { shopB2bOperationalStatusApiPath } from '@/lib/order/shop-b2b-operational-status';
import { formatBrandCoPartnerCountLabelRu } from '@/lib/platform/wave-ze-hub-diagnostics-ru';

/** Wave YG · brand CO cabinet partner count (PG summary API). */
export const BRAND_CO_CABINET_PARTNER_COUNT_TESTID = 'brand-co-cabinet-partner-count';
export const BRAND_CO_CABINET_PG_PARTNER_BADGE_TESTID = 'brand-co-cabinet-pg-partner-badge';
export const BRAND_CO_CABINET_PARTNER_COUNT_LOADING_TESTID =
  'brand-co-cabinet-partner-count-loading';

export const BRAND_RETAILERS_B2B_ORDERS_SUMMARY_API_PATH =
  '/api/brand/retailers/b2b-orders-summary';

export function brandRetailersB2bOrdersSummaryApiPath(collectionId?: string | null): string {
  if (!collectionId?.trim()) return BRAND_RETAILERS_B2B_ORDERS_SUMMARY_API_PATH;
  return `${BRAND_RETAILERS_B2B_ORDERS_SUMMARY_API_PATH}?collectionId=${encodeURIComponent(
    collectionId.trim()
  )}`;
}

export type BrandCoPartnerCountRow = {
  retailerId: string;
  displayNameRu: string;
  orderCount: number;
};

export function summarizeBrandCoPartnerCountPg(rows: BrandCoPartnerCountRow[]): {
  activePartners: number;
  pgLabel: string;
} {
  const activePartners = rows.filter((r) => r.orderCount > 0).length;
  return {
    activePartners,
    pgLabel: formatBrandCoPartnerCountLabelRu(activePartners),
  };
}

/** Wave YG · cross-link brand CO registry ↔ shop tracking. */
export const BRAND_CO_REGISTRY_TRACKING_LINK_TESTID = 'brand-co-registry-tracking-link';
export const BRAND_CO_REGISTRY_SHOP_TRACKING_LINK_TESTID = 'brand-co-registry-shop-tracking-link';
export const SHOP_CO_TRACKING_BRAND_REGISTRY_LINK_TESTID = 'shop-co-tracking-brand-registry-link';
export const SHOP_CO_REGISTRY_TRACKING_LINK_TESTID = 'shop-co-registry-tracking-link';

export const BRAND_CO_CABINET_SHOP_TRACKING_LINK_TESTID = 'brand-co-cabinet-shop-tracking-link';

export function brandCoRegistryShopTrackingHref(orderId: string, collectionId: string): string {
  const sp = new URLSearchParams({ order: orderId.trim(), collection: collectionId.trim() });
  return `${shopB2bTrackingOrderHref(orderId)}?${sp.toString()}`;
}

export function shopCoTrackingBrandRegistryHref(orderId: string): string {
  return brandB2bOrdersCollectionRegistryHref(orderId);
}

/** Wave YG · shop operational status PATCH mirror polish. */
export const SHOP_CO_CABINET_OPERATIONAL_STATUS_TESTID = 'shop-co-cabinet-operational-status';
export const SHOP_CO_CABINET_OPERATIONAL_STATUS_PG_BADGE_TESTID =
  'shop-co-cabinet-operational-status-pg-badge';

export function shopCoOperationalStatusPgBadgeLabelRu(storageMode: string | null): string {
  if (storageMode === 'pg' || storageMode === 'postgres') return 'PG · journal';
  if (storageMode === 'file') return 'PG · file';
  return 'PG · mirror';
}

export function shopCoOperationalStatusMirrorApiPath(orderId: string): string {
  return shopB2bOperationalStatusApiPath(orderId);
}
