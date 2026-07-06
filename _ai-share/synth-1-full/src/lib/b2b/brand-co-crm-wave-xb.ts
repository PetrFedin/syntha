import { shopShowroomTabHref } from '@/lib/b2b/shop-collection-order-hrefs';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';

/** Wave XB — brand CO CRM: PG buyer_segments → auto linesheet visibility + shop showroom cross-link. */
export const BRAND_CO_CRM_LINESHEET_VISIBILITY_API = '/api/brand/b2b/crm/linesheet-visibility';

export const BRAND_CO_CRM_LINESHEET_VISIBILITY_STRIP_TESTID =
  'brand-co-crm-linesheet-visibility-strip';
export const BRAND_CO_CRM_LINESHEET_VISIBILITY_SUMMARY_BADGE_TESTID =
  'brand-co-crm-linesheet-visibility-summary-badge';
export const BRAND_CO_CRM_LINESHEET_VISIBILITY_SHOP_SHOWROOM_LINK_TESTID =
  'brand-co-crm-linesheet-visibility-shop-showroom-link';
export const BRAND_CO_CRM_LINESHEET_VISIBILITY_SHOWROOM_LINK_TESTID =
  'brand-co-crm-linesheet-visibility-showroom-link';
export const BRAND_CO_CRM_LINESHEET_VISIBILITY_SEGMENTS_LINK_TESTID =
  'brand-co-crm-linesheet-visibility-segments-link';
export const BRAND_CO_CRM_LINESHEET_VISIBILITY_SHOP_SHOWROOM_PEER_LINK_TESTID =
  'brand-co-crm-shop-showroom-link';

export const BRAND_CO_CRM_LINESHEET_VISIBILITY_SUMMARY_RU = 'Авто linesheet';
export const BRAND_CO_CRM_LINESHEET_PG_SOURCE_RU = 'PG buyer_segments';
export const BRAND_CO_CRM_LINESHEET_SHOP_SHOWROOM_RU = 'Шоурум магазина';
export const BRAND_CO_CRM_LINESHEET_BRAND_SHOWROOM_RU = 'Шоурум бренда';
export const BRAND_CO_CRM_LINESHEET_CRM_SEGMENTS_RU = 'Сегменты CRM';
export const BRAND_CO_CRM_LINESHEET_GATED_SUFFIX_RU = ' · gated';

export function brandCoCrmLinesheetSegmentLinkTestId(segmentKey: string): string {
  return `brand-co-crm-linesheet-visibility-segment-${segmentKey}-link`;
}

export function brandCoCrmLinesheetSegmentShopLinkTestId(segmentKey: string): string {
  return `brand-co-crm-linesheet-visibility-segment-${segmentKey}-shop-link`;
}

export function brandCoCrmLinesheetVisibilitySourceBadgeTestId(storageMode: string): string {
  return `brand-co-crm-linesheet-visibility-source-${storageMode}`;
}

export function brandCoCrmLinesheetShopShowroomHref(input: {
  collectionId: string;
  segmentKey?: string;
  orderId?: string;
}): string {
  const collectionId = input.collectionId.trim() || PLATFORM_CORE_DEMO.collectionId;
  const orderId = input.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const base = shopShowroomTabHref('showroom', collectionId, orderId);
  if (!input.segmentKey?.trim()) return base;
  return `${base}&focus=${encodeURIComponent(input.segmentKey.trim())}`;
}

export function brandCoCrmLinesheetVisibilityMessageRu(input: {
  autoVisible: number;
  total: number;
  storageMode: string;
}): string {
  if (input.storageMode === 'pg') {
    return `${input.autoVisible}/${input.total} сегмент(ов) · авто-видимость linesheet · PG`;
  }
  return `${input.autoVisible}/${input.total} сегмент(ов) · ${input.storageMode}`;
}

export function filterBrandCoCrmAutoVisibleRows<T extends { autoVisible: boolean }>(
  rows: readonly T[]
): T[] {
  return rows.filter((row) => row.autoVisible);
}
