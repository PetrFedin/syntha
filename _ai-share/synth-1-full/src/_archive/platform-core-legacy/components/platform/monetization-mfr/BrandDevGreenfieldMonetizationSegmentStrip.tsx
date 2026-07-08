'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { fetchBrandShopBuyerCrmAssignment } from '@/lib/platform-core-ports/b2b/brand-crm-shop-buyer-assign-store';
import type { ShopBuyerCrmProfile } from '@/lib/platform-core-ports/b2b/shop-buyer-crm-profile';
import { brandCrmSegmentationFeatureHref } from '@/lib/platform-core-ports/b2b/brand-crm-segmentation';
import { buildShopShowroomBuySession } from '@/lib/platform-core-ports/b2b/shop-showroom-buy';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import {
  BRAND_DEV_GREENFIELD_BUYER_BADGE_RU,
  BRAND_DEV_GREENFIELD_LOADING_RU,
  BRAND_DEV_GREENFIELD_MONETIZATION_LABEL_RU,
  BRAND_DEV_GREENFIELD_UNAVAILABLE_RU,
} from '@/lib/platform-core-ports/platform/brand-dev-tasks-kanban-calendar';
import { Percent, Tag } from 'lucide-react';

const GREENFIELD_BUYER_ID = 'shop2';

type Props = {
  collectionId: string;
};

/** Brand dev · greenfield shop2 monetization segment read from PG (`shop_buyer_crm_profiles`). */
export function BrandDevGreenfieldMonetizationSegmentStrip({ collectionId }: Props) {
  const [profile, setProfile] = useState<ShopBuyerCrmProfile | null>(null);
  const [storageMode, setStorageMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchBrandShopBuyerCrmAssignment(GREENFIELD_BUYER_ID).then((res) => {
      if (cancelled) return;
      setProfile(res.profile);
      setStorageMode(res.storageMode);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const shop = buildShopShowroomBuySession({ collectionId });
  const segmentsHref = brandCrmSegmentationFeatureHref('segments', collectionId);
  const pricelistHref = brandCrmSegmentationFeatureHref('pricelist', collectionId);

  return (
    <div
      className="border-border-subtle space-y-2 rounded-md border border-violet-200/50 bg-violet-50/20 px-3 py-2"
      data-testid="brand-dev-greenfield-monetization-segment-strip"
    >
      <p
        className="text-text-muted text-[10px] font-bold uppercase tracking-wide"
        data-testid="brand-dev-greenfield-label"
      >
        {BRAND_DEV_GREENFIELD_MONETIZATION_LABEL_RU}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="text-[9px]" data-testid="brand-dev-greenfield-badge">
          {BRAND_DEV_GREENFIELD_BUYER_BADGE_RU} · {GREENFIELD_BUYER_ID}
        </Badge>
        {storageMode ? (
          <Badge
            variant="outline"
            className="text-[9px]"
            data-testid="brand-dev-greenfield-pg-source"
          >
            {storageMode === 'pg' ? 'PostgreSQL' : storageMode}
          </Badge>
        ) : null}
      </div>

      {loading ? (
        <p className="text-text-muted text-[10px]" data-testid="brand-dev-greenfield-loading">
          {BRAND_DEV_GREENFIELD_LOADING_RU}
        </p>
      ) : profile ? (
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant="secondary"
            className="text-[9px]"
            data-testid="brand-dev-greenfield-segment"
          >
            {profile.segmentNameRu}
          </Badge>
          <Badge variant="outline" className="text-[9px]" data-testid="brand-dev-greenfield-tier">
            <Tag className="mr-0.5 h-2.5 w-2.5" aria-hidden />
            {profile.priceTier}
          </Badge>
          <Badge
            variant="outline"
            className="text-[9px]"
            data-testid="brand-dev-greenfield-net-terms"
          >
            Net {profile.netTermDays} дн.
          </Badge>
          {profile.firstOrderDiscountPct != null ? (
            <Badge
              variant="outline"
              className="text-[9px]"
              data-testid="brand-dev-greenfield-discount"
            >
              <Percent className="mr-0.5 h-2.5 w-2.5" aria-hidden />−{profile.firstOrderDiscountPct}
              %
            </Badge>
          ) : null}
        </div>
      ) : (
        <p className="text-text-muted text-[10px]" data-testid="brand-dev-greenfield-unavailable">
          {BRAND_DEV_GREENFIELD_UNAVAILABLE_RU}
        </p>
      )}

      <div className={hubGadget.goldenPath} data-testid="brand-dev-greenfield-monetization-path">
        <Link
          href={segmentsHref}
          data-testid="brand-dev-greenfield-crm-link"
          className={hubGadget.goldenLink}
        >
          CRM сегменты
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={pricelistHref}
          data-testid="brand-dev-greenfield-pricelist-link"
          className={hubGadget.goldenLink}
        >
          Прайс-лист
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={shop.matrixHref}
          data-testid="brand-dev-greenfield-matrix-link"
          className={hubGadget.goldenLink}
        >
          Матрица
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={shop.checkoutHref}
          data-testid="brand-dev-greenfield-checkout-link"
          className={hubGadget.goldenLink}
        >
          Оформление
        </Link>
      </div>
    </div>
  );
}
