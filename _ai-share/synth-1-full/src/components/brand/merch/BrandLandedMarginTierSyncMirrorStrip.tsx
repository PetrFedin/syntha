'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { fetchBrandPricelistTierSync } from '@/lib/b2b/brand-pricelist-tier-sync-store';
import { summarizeBrandPricelistTierSync } from '@/lib/b2b/brand-pricelist-tier-sync';
import { buildBrandLandedMarginSession } from '@/lib/b2b/brand-landed-margin';
import { brandPricelistFeatureHref } from '@/lib/b2b/brand-pricelist-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId?: string;
  orderId?: string;
};

/** Brand mirror of shop tier sync — push pending + shop margin pricelist cross-link. */
export function BrandLandedMarginTierSyncMirrorStrip({ collectionId, orderId }: Props) {
  const session = useMemo(
    () => buildBrandLandedMarginSession({ collectionId, orderId }),
    [collectionId, orderId]
  );
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchBrandPricelistTierSync>>['rows']>(
    []
  );
  const [storageMode, setStorageMode] = useState('demo');

  useEffect(() => {
    void fetchBrandPricelistTierSync(session.collectionId).then((res) => {
      setRows(res.rows ?? []);
      setStorageMode(res.storageMode ?? 'demo');
    });
  }, [session.collectionId]);

  const summary = useMemo(() => summarizeBrandPricelistTierSync(rows ?? []), [rows]);

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-landed-margin-tier-sync-mirror-strip">
      <Badge variant="outline" data-testid="brand-landed-margin-tier-sync-pending-badge">
        Shop sync: {summary.synced}/{summary.total}
      </Badge>
      {summary.pending > 0 ? (
        <Link
          href={brandPricelistFeatureHref('shop-sync', session.collectionId)}
          data-testid="brand-landed-margin-tier-sync-push-link"
          className={hubGadget.goldenLink}
        >
          Push {summary.pending} tier(s)
        </Link>
      ) : null}
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.shopMarginPricelistHref}
        data-testid="brand-landed-margin-shop-pricelist-mirror-link"
        className={hubGadget.goldenLink}
      >
        Shop margin pricelist
      </Link>
      <Badge variant="outline" className="text-[9px]" data-testid={`brand-landed-margin-tier-sync-source-${storageMode}`}>
        {storageMode === 'pg' ? 'PG' : storageMode}
      </Badge>
    </div>
  );
}
