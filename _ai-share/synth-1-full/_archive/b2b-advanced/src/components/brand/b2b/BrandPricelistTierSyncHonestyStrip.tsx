'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  BRAND_PRICELIST_TIER_SYNC_HONESTY_OK_RU,
  BRAND_PRICELIST_TIER_SYNC_HONESTY_STRIP_TESTID,
  BRAND_PRICELIST_TIER_SYNC_PENDING_BADGE_TESTID,
  BRAND_PRICELIST_TIER_SYNC_PUSH_CTA_RU,
  BRAND_PRICELIST_TIER_SYNC_SOURCE_RU,
  BRAND_PRICELIST_SHOP_MATRIX_TIER_BADGE_LINK_TESTID,
  brandPricelistShopMatrixTierBadgeHref,
} from '@/lib/b2b/brand-co-tier-sync-publish-wn';
import { BRAND_PRICELIST_PUBLISH_API_PATH } from '@/lib/b2b/brand-pricelist-publish';
import { fetchBrandPricelistTierSync } from '@/lib/b2b/brand-pricelist-tier-sync-store';
import { summarizeBrandPricelistTierSync } from '@/lib/b2b/brand-pricelist-tier-sync';
import { buildBrandPricelistSession, brandPricelistFeatureHref } from '@/lib/b2b/brand-pricelist-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Wave WN · publish pricelist → tier sync honesty (RU) + shop matrix cross-link. */
export function BrandPricelistTierSyncHonestyStrip({ collectionId, orderId }: Props) {
  const session = useMemo(
    () => buildBrandPricelistSession({ collectionId, orderId }),
    [collectionId, orderId]
  );
  const shopMatrixHref = useMemo(
    () => brandPricelistShopMatrixTierBadgeHref(collectionId, orderId),
    [collectionId, orderId]
  );
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchBrandPricelistTierSync>>['rows']>(
    []
  );
  const [storageMode, setStorageMode] = useState('demo');

  useEffect(() => {
    void fetchBrandPricelistTierSync(collectionId).then((res) => {
      setRows(res.rows ?? []);
      setStorageMode(res.storageMode ?? 'demo');
    });
  }, [collectionId]);

  const summary = useMemo(() => summarizeBrandPricelistTierSync(rows ?? []), [rows]);
  const shopSyncHref = brandPricelistFeatureHref('shop-sync', collectionId);

  return (
    <div className={hubGadget.goldenPath} data-testid={BRAND_PRICELIST_TIER_SYNC_HONESTY_STRIP_TESTID}>
      <Badge
        variant={summary.pending ? 'outline' : 'secondary'}
        data-testid={BRAND_PRICELIST_TIER_SYNC_PENDING_BADGE_TESTID}
      >
        Синхр. тиров: {summary.synced}/{summary.total}
      </Badge>
      <Badge variant="outline" data-testid={`brand-pricelist-tier-sync-source-${storageMode}`}>
        {BRAND_PRICELIST_TIER_SYNC_SOURCE_RU(storageMode)}
      </Badge>
      {summary.pending > 0 ? (
        <Link
          href={shopSyncHref}
          data-testid="brand-pricelist-tier-sync-push-link"
          className={hubGadget.goldenLink}
        >
          {BRAND_PRICELIST_TIER_SYNC_PUSH_CTA_RU} ({summary.pending})
        </Link>
      ) : (
        <span className="text-text-muted text-[10px]" data-testid="brand-pricelist-tier-sync-ok">
          {BRAND_PRICELIST_TIER_SYNC_HONESTY_OK_RU}
        </span>
      )}
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={shopMatrixHref}
        data-testid={BRAND_PRICELIST_SHOP_MATRIX_TIER_BADGE_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        Матрица магазина · tier badge
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.shopMarginPricelistHref}
        data-testid="brand-pricelist-shop-honesty-mirror-link"
        className={hubGadget.goldenLink}
      >
        Прайс-лист магазина
      </Link>
      <span className="sr-only" data-testid="brand-pricelist-publish-api-path">
        {BRAND_PRICELIST_PUBLISH_API_PATH}
      </span>
    </div>
  );
}
