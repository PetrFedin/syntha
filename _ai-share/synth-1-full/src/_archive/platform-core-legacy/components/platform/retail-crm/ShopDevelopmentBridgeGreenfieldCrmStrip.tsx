'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { buildShopB2bPartnersSession } from '@/lib/platform-core-ports/b2b/shop-b2b-partners-workspace';
import { brandCrmSegmentationFeatureHref } from '@/lib/platform-core-ports/b2b/brand-crm-segmentation';
import { fetchShopBuyerCrmProfile } from '@/lib/platform-core-ports/b2b/shop-buyer-crm-profile-store';
import type { ShopBuyerCrmProfile } from '@/lib/platform-core-ports/b2b/shop-buyer-crm-profile';
import { useShopCoreBuyerId } from '@/hooks/use-shop-core-buyer-id';
import { shopReplenishmentTabHref } from '@/lib/platform-core-ports/b2b/shop-collection-order-hrefs';
import { ROUTES, shopB2bCheckoutCollectionHref } from '@/lib/platform-core-routes';
import {
  SHOP_GREENFIELD_CRM_ATP_RU,
  SHOP_GREENFIELD_CRM_BRAND_PRICELIST_RU,
  SHOP_GREENFIELD_CRM_BRAND_SEGMENTS_RU,
  SHOP_GREENFIELD_CRM_CHECKOUT_RU,
  SHOP_GREENFIELD_CRM_LANDED_MARGIN_RU,
  SHOP_GREENFIELD_CRM_LOADING_RU,
  SHOP_GREENFIELD_CRM_MATRIX_RU,
  SHOP_GREENFIELD_CRM_PARTNERS_RU,
  SHOP_GREENFIELD_CRM_SHOWROOM_RU,
  SHOP_GREENFIELD_CRM_STRIP_TITLE_RU,
  SHOP_GREENFIELD_CRM_UNAVAILABLE_RU,
} from '@/lib/platform-core-ports/b2b/shop-greenfield-registry-wave-xx';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';
import { Percent, Tag } from 'lucide-react';

type Props = {
  collectionId: string;
};

/** Empty-cell shop dev · greenfield buyer CRM + monetization spine. */
export function ShopDevelopmentBridgeGreenfieldCrmStrip({ collectionId }: Props) {
  const { buyerId } = useShopCoreBuyerId();
  const [profile, setProfile] = useState<ShopBuyerCrmProfile | null>(null);
  const [storageMode, setStorageMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchShopBuyerCrmProfile(buyerId).then((res) => {
      if (cancelled) return;
      setProfile(res.profile);
      setStorageMode(res.storageMode);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [buyerId]);

  const partners = buildShopB2bPartnersSession({ collectionId });
  const matrixHref = platformCoreUiHref(
    `${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}`
  );
  const showroomHref = platformCoreUiHref(
    `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(collectionId)}`
  );
  const pricelistHref = brandCrmSegmentationFeatureHref('pricelist', collectionId);
  const replenishmentHref = shopReplenishmentTabHref('stock-atp', collectionId);

  return (
    <div
      className="border-border-subtle bg-bg-surface2/40 space-y-2 rounded-md border px-3 py-2"
      data-testid="shop-development-bridge-greenfield-crm-strip"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-muted text-[10px] font-semibold uppercase">
          {SHOP_GREENFIELD_CRM_STRIP_TITLE_RU}
        </span>
        {storageMode ? (
          <Badge variant="outline" className="text-[9px]" data-testid="shop-dev-bridge-crm-source">
            {storageMode}
          </Badge>
        ) : null}
      </div>

      {loading ? (
        <p className="text-text-muted text-[10px]">{SHOP_GREENFIELD_CRM_LOADING_RU}</p>
      ) : profile ? (
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant="secondary"
            className="text-[9px]"
            data-testid="shop-dev-bridge-crm-segment"
          >
            {profile.segmentNameRu}
          </Badge>
          <Badge variant="outline" className="text-[9px]" data-testid="shop-dev-bridge-crm-tier">
            <Tag className="mr-0.5 h-2.5 w-2.5" aria-hidden />
            {profile.priceTier}
          </Badge>
          <Badge
            variant="outline"
            className="text-[9px]"
            data-testid="shop-dev-bridge-crm-net-terms"
          >
            Net {profile.netTermDays} дн.
          </Badge>
          {profile.firstOrderDiscountPct != null ? (
            <Badge
              variant="outline"
              className="text-[9px]"
              data-testid="shop-dev-bridge-crm-discount"
            >
              <Percent className="mr-0.5 h-2.5 w-2.5" aria-hidden />−{profile.firstOrderDiscountPct}
              %
            </Badge>
          ) : null}
        </div>
      ) : (
        <p className="text-text-muted text-[10px]">{SHOP_GREENFIELD_CRM_UNAVAILABLE_RU}</p>
      )}

      <div className={hubGadget.goldenPath}>
        <Link
          href={showroomHref}
          data-testid="shop-dev-bridge-crm-showroom-link"
          className={hubGadget.goldenLink}
        >
          {SHOP_GREENFIELD_CRM_SHOWROOM_RU}
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={matrixHref}
          data-testid="shop-dev-bridge-crm-matrix-link"
          className={hubGadget.goldenLink}
        >
          {SHOP_GREENFIELD_CRM_MATRIX_RU}
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={replenishmentHref}
          data-testid="shop-dev-bridge-crm-replenishment-link"
          className={hubGadget.goldenLink}
        >
          {SHOP_GREENFIELD_CRM_ATP_RU}
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={partners.discoverHref}
          data-testid="shop-dev-bridge-crm-partners-link"
          className={hubGadget.goldenLink}
        >
          {SHOP_GREENFIELD_CRM_PARTNERS_RU}
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={pricelistHref}
          data-testid="shop-dev-bridge-crm-brand-pricelist-link"
          className={hubGadget.goldenLink}
        >
          {SHOP_GREENFIELD_CRM_BRAND_PRICELIST_RU}
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={partners.brandCrmSegmentsHref}
          data-testid="shop-dev-bridge-crm-brand-segments-link"
          className={hubGadget.goldenLink}
        >
          {SHOP_GREENFIELD_CRM_BRAND_SEGMENTS_RU}
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={partners.landedMarginHref}
          data-testid="shop-dev-bridge-crm-landed-margin-link"
          className={hubGadget.goldenLink}
        >
          {SHOP_GREENFIELD_CRM_LANDED_MARGIN_RU}
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={shopB2bCheckoutCollectionHref(collectionId)}
          data-testid="shop-dev-bridge-crm-checkout-link"
          className={hubGadget.goldenLink}
        >
          {SHOP_GREENFIELD_CRM_CHECKOUT_RU}
        </Link>
      </div>
    </div>
  );
}
