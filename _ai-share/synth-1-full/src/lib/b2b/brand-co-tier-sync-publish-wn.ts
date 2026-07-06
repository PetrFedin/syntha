import { BRAND_PRICELIST_PUBLISH_API_PATH } from '@/lib/b2b/brand-pricelist-publish';
import { buildBrandPricelistSession } from '@/lib/b2b/brand-pricelist-workspace';

/** Wave WN · Brand CO pricelist publish → shop tier sync (PG stub, env-gated). */

export const BRAND_PRICELIST_TIER_SYNC_API_PATH = '/api/brand/b2b/pricelist/tier-sync' as const;

export const BRAND_PRICELIST_TIER_SYNC_HONESTY_STRIP_TESTID =
  'brand-pricelist-tier-sync-honesty-strip';
export const BRAND_PRICELIST_TIER_SYNC_PENDING_BADGE_TESTID =
  'brand-pricelist-tier-sync-pending-badge';
export const BRAND_PRICELIST_SHOP_MATRIX_TIER_BADGE_LINK_TESTID =
  'brand-pricelist-shop-matrix-tier-badge-link';
export const SHOP_PRICELIST_TIER_RECEIVE_BADGE_TESTID = 'shop-pricelist-tier-receive-badge';
export const SHOP_CO_MATRIX_TIER_SYNC_RECEIVE_BADGE_TESTID =
  'shop-co-matrix-tier-sync-receive-badge';

/** Env gate: set `BRAND_PRICELIST_PUBLISH_TIER_SYNC=0` to skip publish → shop push. */
export function isBrandPricelistPublishTierSyncEnabled(): boolean {
  return process.env.BRAND_PRICELIST_PUBLISH_TIER_SYNC !== '0';
}

export function brandPricelistTierSyncHonestyPendingRu(synced: number, total: number): string {
  return `Синхр. тиров: ${synced}/${total}`;
}

export const BRAND_PRICELIST_TIER_SYNC_HONESTY_OK_RU = 'Все тиры синхронизированы с магазином';
export const BRAND_PRICELIST_TIER_SYNC_PUSH_CTA_RU = 'Отправить в магазин';
export const BRAND_PRICELIST_TIER_SYNC_PG_SOURCE_RU = 'Синхр. тира PG';
export const BRAND_PRICELIST_TIER_SYNC_SOURCE_RU = (mode: string) =>
  mode === 'pg' ? BRAND_PRICELIST_TIER_SYNC_PG_SOURCE_RU : `Синхр. тира · ${mode}`;

export const SHOP_PRICELIST_TIER_RECEIVE_SYNCED_RU = 'Тир получен от бренда';
export const SHOP_PRICELIST_TIER_RECEIVE_PENDING_RU = 'Ожидает прайс-лист бренда';
export const SHOP_PRICELIST_TIER_RECEIVE_MULTIPLIER_RU = (multiplier: number) =>
  `×${multiplier}`;

export function brandPricelistShopMatrixTierBadgeHref(
  collectionId: string,
  orderId?: string
): string {
  return buildBrandPricelistSession({ collectionId, orderId }).shopMatrixHref;
}

export function brandCoTierSyncPublishWnContract(): {
  publishApiPath: string;
  tierSyncApiPath: string;
} {
  return {
    publishApiPath: BRAND_PRICELIST_PUBLISH_API_PATH,
    tierSyncApiPath: BRAND_PRICELIST_TIER_SYNC_API_PATH,
  };
}
