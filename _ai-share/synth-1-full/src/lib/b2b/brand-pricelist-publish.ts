/** Wave TK · Brand CO pricelist publish → shop tier sync push. */

import type { PriceTierId } from '@/lib/b2b/price-tiers';

export const BRAND_PRICELIST_PUBLISH_API_PATH = '/api/brand/b2b/pricelist/publish' as const;

export type BrandPricelistPublishTierSyncResult = {
  ok: boolean;
  tierId?: PriceTierId;
  shopSynced?: boolean;
  syncedAt?: string;
  skipped?: boolean;
  reason?: string;
};

export type BrandPricelistPublishResult = {
  ok: boolean;
  collectionId?: string;
  priceListId?: string;
  tierSync?: BrandPricelistPublishTierSyncResult;
  messageRu?: string;
  storageMode?: 'pg' | 'file' | 'memory' | 'demo';
};

export const BRAND_PRICELIST_PUBLISH_SUCCESS_RU =
  'Прайс-лист опубликован — множитель тира отправлен в матрицу магазина.';

export const BRAND_PRICELIST_PUBLISH_TIER_SYNC_SKIPPED_RU =
  'Прайс-лист опубликован — синхр. тира в магазин отключена.';

export const BRAND_PRICELIST_PUBLISH_NOT_FOUND_RU = 'Прайс-лист не найден для коллекции.';

export const BRAND_PRICELIST_PUBLISH_UNKNOWN_TIER_RU =
  'Канал прайс-листа не сопоставлен с tier sync — push пропущен.';

export const BRAND_PRICELIST_PUBLISH_TIER_SYNC_FAILED_RU =
  'Прайс-лист сохранён — синхр. тира в магазин не удалась.';

export function brandPricelistPublishMessageRu(input: {
  priceListName: string;
  tierId?: PriceTierId;
  tierSync?: BrandPricelistPublishTierSyncResult;
}): string {
  const base = `«${input.priceListName}» опубликован`;
  if (!input.tierSync || input.tierSync.skipped) {
    return `${base} · ${BRAND_PRICELIST_PUBLISH_TIER_SYNC_SKIPPED_RU}`;
  }
  if (input.tierSync.ok && input.tierSync.shopSynced && input.tierId) {
    return `${base} · tier ${input.tierId} → shop matrix`;
  }
  if (input.tierSync.reason === 'tier_sync_failed') {
    return `${base} · ${BRAND_PRICELIST_PUBLISH_TIER_SYNC_FAILED_RU}`;
  }
  return `${base} · ${BRAND_PRICELIST_PUBLISH_SUCCESS_RU}`;
}
