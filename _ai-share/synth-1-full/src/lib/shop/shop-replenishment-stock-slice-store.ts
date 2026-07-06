import type { ReplenishmentStockSlice } from '@/lib/platform/shop-replenishment-stock-slices';
import {
  fetchShopReplenishmentFilterSlices,
  postShopReplenishmentFilterSlice,
} from '@/lib/shop/shop-replenishment-filter-slices-client';

export async function fetchShopReplenishmentStockSlice(
  buyerId = 'shop1'
): Promise<{ slice: ReplenishmentStockSlice | null; storageMode?: string }> {
  const json = await fetchShopReplenishmentFilterSlices(buyerId);
  if (!json.ok || !json.activeSlice) {
    return { slice: null, storageMode: json.storageMode };
  }
  return { slice: json.activeSlice, storageMode: json.storageMode };
}

export async function saveShopReplenishmentStockSlice(
  slice: ReplenishmentStockSlice,
  buyerId = 'shop1'
): Promise<{ ok: boolean; storageMode?: string; messageRu?: string }> {
  return postShopReplenishmentFilterSlice(slice, buyerId);
}
