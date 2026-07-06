'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { fetchShopPricelistTierSync } from '@/lib/b2b/brand-pricelist-tier-sync-store';
import { summarizeBrandPricelistTierSync } from '@/lib/b2b/brand-pricelist-tier-sync';
import { buildShopLandedMarginSession } from '@/lib/b2b/shop-landed-margin';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Pending brand tier sync → honest CTA before margin/pricing reads. */
export function ShopLandedMarginTierSyncHonestyStrip({ collectionId, orderId }: Props) {
  const session = useMemo(
    () => buildShopLandedMarginSession({ collectionId, orderId }),
    [collectionId, orderId]
  );
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchShopPricelistTierSync>>['rows']>(
    []
  );
  const [storageMode, setStorageMode] = useState('demo');

  useEffect(() => {
    void fetchShopPricelistTierSync(collectionId).then((res) => {
      setRows(res.rows ?? []);
      setStorageMode(res.storageMode ?? 'demo');
    });
  }, [collectionId]);

  const summary = useMemo(() => summarizeBrandPricelistTierSync(rows ?? []), [rows]);

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-landed-margin-tier-sync-honesty-strip">
      <Badge
        variant={summary.pending ? 'outline' : 'secondary'}
        data-testid="shop-landed-margin-tier-sync-pending-badge"
      >
        Pending tiers: {summary.pending}/{summary.total}
      </Badge>
      <Badge variant="outline" data-testid={`shop-landed-margin-tier-sync-source-${storageMode}`}>
        {storageMode === 'pg' ? 'PG tier sync' : `${storageMode} tier sync`}
      </Badge>
      {summary.pending > 0 ? (
        <Link
          href={session.brandShopSyncHref}
          data-testid="shop-landed-margin-brand-sync-cta"
          className={hubGadget.goldenLink}
        >
          Brand · push shop sync
        </Link>
      ) : (
        <span className="text-text-muted text-[10px]" data-testid="shop-landed-margin-tier-sync-ok">
          All tiers synced
        </span>
      )}
    </div>
  );
}
