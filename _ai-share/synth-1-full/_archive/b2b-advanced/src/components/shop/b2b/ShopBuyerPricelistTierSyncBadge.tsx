'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { parsePriceTierId } from '@/lib/b2b/price-tiers';
import { fetchShopPricelistTierSync } from '@/lib/b2b/brand-pricelist-tier-sync-store';

type Props = {
  collectionId: string;
  priceTier: string;
  testIdPrefix: string;
  reloadNonce?: number;
};

/** Shop read mirror · tier synced to matrix after brand CRM assign. */
export function ShopBuyerPricelistTierSyncBadge({
  collectionId,
  priceTier,
  testIdPrefix,
  reloadNonce = 0,
}: Props) {
  const [shopSynced, setShopSynced] = useState<boolean | null>(null);
  const [multiplier, setMultiplier] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tierId = parsePriceTierId(priceTier);
    if (!tierId) {
      setShopSynced(null);
      setMultiplier(null);
      return;
    }
    void fetchShopPricelistTierSync(collectionId).then((res) => {
      if (cancelled) return;
      const row = res.rows?.find((r) => r.tierId === tierId);
      setShopSynced(row?.shopSynced === true);
      setMultiplier(row?.multiplier ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [collectionId, priceTier, reloadNonce]);

  if (shopSynced == null) return null;

  return (
    <Badge
      variant={shopSynced ? 'secondary' : 'outline'}
      className="text-[9px]"
      data-testid={`${testIdPrefix}-tier-sync-${shopSynced ? 'synced' : 'pending'}`}
    >
      {shopSynced
        ? `Matrix tier ✓${multiplier != null ? ` · ×${multiplier}` : ''}`
        : 'Tier sync pending'}
    </Badge>
  );
}
