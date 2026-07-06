import type { ReplenishmentStockSlice } from '@/lib/platform/shop-replenishment-stock-slices';
import {
  shouldMirrorPgClientStoreToLocalStorage,
  shouldUseLocalStorageClientFallbackInCore,
} from '@/lib/production/workshop2-pg-read-path-policy';

export type ShopReplenishmentFilterSliceRecord = ReplenishmentStockSlice & {
  sliceId: string;
  isActive: boolean;
  updatedAt?: string;
};

export type ShopReplenishmentFilterSlicesResponse = {
  ok?: boolean;
  presets?: readonly ReplenishmentStockSlice[];
  savedSlices?: ShopReplenishmentFilterSliceRecord[];
  activeSlice?: ReplenishmentStockSlice | null;
  activeSliceId?: string;
  storageMode?: string;
  messageRu?: string;
};

const STORAGE_KEY = 'shop_replenishment_filter_slices_v1';
const DEFAULT_BUYER = 'shop1';

function cacheKey(buyerId: string): string {
  return `${STORAGE_KEY}:${buyerId.trim() || DEFAULT_BUYER}`;
}

export function loadShopReplenishmentFilterSlicesLocal(
  buyerId = DEFAULT_BUYER
): ShopReplenishmentFilterSlicesResponse | null {
  if (!shouldUseLocalStorageClientFallbackInCore() || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(cacheKey(buyerId));
    if (!raw) return null;
    return JSON.parse(raw) as ShopReplenishmentFilterSlicesResponse;
  } catch {
    return null;
  }
}

export function saveShopReplenishmentFilterSlicesLocal(
  buyerId: string,
  payload: ShopReplenishmentFilterSlicesResponse
): void {
  if (!shouldMirrorPgClientStoreToLocalStorage() || typeof window === 'undefined') return;
  localStorage.setItem(cacheKey(buyerId), JSON.stringify(payload));
}

export async function fetchShopReplenishmentFilterSlices(
  buyerId = DEFAULT_BUYER
): Promise<ShopReplenishmentFilterSlicesResponse> {
  const res = await fetch(
    `/api/shop/b2b/replenishment/filter-slices?buyerId=${encodeURIComponent(buyerId)}`,
    { cache: 'no-store' }
  );
  const json = (await res.json()) as ShopReplenishmentFilterSlicesResponse;
  if (!res.ok || !json.ok) {
    const local = loadShopReplenishmentFilterSlicesLocal(buyerId);
    return (
      local ?? {
        ok: false,
        storageMode: shouldUseLocalStorageClientFallbackInCore() ? 'local' : 'unavailable',
        messageRu: 'Срезы недоступны — требуется PostgreSQL в core mode.',
      }
    );
  }
  saveShopReplenishmentFilterSlicesLocal(buyerId, json);
  return json;
}

export async function postShopReplenishmentFilterSlice(
  slice: ReplenishmentStockSlice,
  buyerId = DEFAULT_BUYER,
  sliceId?: string
): Promise<{ ok: boolean; storageMode?: string; messageRu?: string }> {
  const res = await fetch('/api/shop/b2b/replenishment/filter-slices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ buyerId, slice, sliceId }),
  });
  const json = (await res.json()) as ShopReplenishmentFilterSlicesResponse;
  if (json.ok) saveShopReplenishmentFilterSlicesLocal(buyerId, json);
  return {
    ok: res.ok && json.ok === true,
    storageMode: json.storageMode,
    messageRu: json.messageRu,
  };
}
