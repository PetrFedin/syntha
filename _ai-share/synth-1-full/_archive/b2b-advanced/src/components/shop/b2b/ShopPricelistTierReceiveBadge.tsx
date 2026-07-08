'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  SHOP_PRICELIST_TIER_RECEIVE_BADGE_TESTID,
  SHOP_PRICELIST_TIER_RECEIVE_MULTIPLIER_RU,
  SHOP_PRICELIST_TIER_RECEIVE_PENDING_RU,
  SHOP_PRICELIST_TIER_RECEIVE_SYNCED_RU,
} from '@/lib/b2b/brand-co-tier-sync-publish-wn';
import { fetchShopPricelistTierSync } from '@/lib/b2b/brand-pricelist-tier-sync-store';
import { summarizeBrandPricelistTierSync } from '@/lib/b2b/brand-pricelist-tier-sync';

type Props = {
  collectionId: string;
  reloadNonce?: number;
  testId?: string;
  className?: string;
};

/** Wave WN · shop pricelist receive badge after brand publish tier sync. */
export function ShopPricelistTierReceiveBadge({
  collectionId,
  reloadNonce = 0,
  testId = SHOP_PRICELIST_TIER_RECEIVE_BADGE_TESTID,
  className,
}: Props) {
  const [synced, setSynced] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [multiplier, setMultiplier] = useState<number | null>(null);
  const [storageMode, setStorageMode] = useState('demo');

  useEffect(() => {
    let cancelled = false;
    void fetchShopPricelistTierSync(collectionId).then((res) => {
      if (cancelled) return;
      const summary = summarizeBrandPricelistTierSync(res.rows ?? []);
      setSynced(summary.synced);
      setTotal(summary.total);
      setStorageMode(res.storageMode ?? 'demo');
      const firstSynced = res.rows?.find((row) => row.shopSynced);
      setMultiplier(firstSynced?.multiplier ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [collectionId, reloadNonce]);

  const allSynced = useMemo(() => synced != null && synced === total && total > 0, [synced, total]);
  const pending = synced != null && synced < total;

  if (synced == null) return null;

  return (
    <Badge
      variant={allSynced ? 'secondary' : 'outline'}
      className={className ? `text-[9px] ${className}` : 'text-[9px]'}
      data-testid={testId}
      data-storage-mode={storageMode}
      data-synced={allSynced ? 'true' : 'false'}
    >
      {allSynced
        ? `${SHOP_PRICELIST_TIER_RECEIVE_SYNCED_RU}${multiplier != null ? ` · ${SHOP_PRICELIST_TIER_RECEIVE_MULTIPLIER_RU(multiplier)}` : ''}`
        : pending
          ? `${SHOP_PRICELIST_TIER_RECEIVE_PENDING_RU} (${synced}/${total})`
          : SHOP_PRICELIST_TIER_RECEIVE_PENDING_RU}
    </Badge>
  );
}
