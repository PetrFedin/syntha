'use client';

import { useEffect, useMemo, useState } from 'react';

import type { BrandPricelistTierSyncRow } from '@/lib/b2b/brand-pricelist-tier-sync';
import { fetchShopPricelistTierSync } from '@/lib/b2b/brand-pricelist-tier-sync-store';
import {
  applyShopMatrixTierToCartItem,
  mapPriceTierToWorkshop2CartTier,
} from '@/lib/b2b/shop-matrix-cart-tier';
import { resolveShopMatrixUnitPrice } from '@/lib/b2b/shop-matrix-tier-pricing';
import type { CartItem } from '@/lib/types';
import { getCurrentPriceTier, PRICE_TIER_LABELS, type PriceTierId } from '@/lib/b2b/price-tiers';

export function useShopMatrixTierPricing(collectionId: string) {
  const tier = getCurrentPriceTier();
  const [rows, setRows] = useState<BrandPricelistTierSyncRow[]>([]);
  const [storageMode, setStorageMode] = useState<string>('demo');

  useEffect(() => {
    void fetchShopPricelistTierSync(collectionId).then((res) => {
      setRows(res.allRows ?? res.rows ?? []);
      setStorageMode(res.storageMode ?? 'demo');
    });
  }, [collectionId]);

  const resolveUnitPrice = useMemo(
    () =>
      (basePrice: number, tierId: PriceTierId = tier) =>
        resolveShopMatrixUnitPrice(basePrice, tierId, rows),
    [rows, tier]
  );

  const active = useMemo(() => resolveUnitPrice(1000, tier), [resolveUnitPrice, tier]);
  const cartTier = useMemo(() => mapPriceTierToWorkshop2CartTier(tier), [tier]);

  const applyToCartItem = useMemo(
    () => (item: CartItem) => applyShopMatrixTierToCartItem(item, tier, rows),
    [tier, rows]
  );

  return {
    tier,
    tierLabel: PRICE_TIER_LABELS[tier],
    cartTier,
    rows,
    storageMode,
    pricingSource: active.source,
    resolveUnitPrice,
    applyToCartItem,
  };
}
