'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlatformCoreLink } from '@/components/platform/PlatformCoreLink';
import { fetchShopBuyerCrmProfile } from '@/lib/platform-core-ports/b2b/shop-buyer-crm-profile-store';
import type { ShopBuyerCrmProfile } from '@/lib/platform-core-ports/b2b/shop-buyer-crm-profile';
import {
  SHOP_EMPTY27_BUYER_PROFILE_LOADING_RU,
  SHOP_EMPTY27_BUYER_PROFILE_NO_SEGMENT_HINT_RU,
  SHOP_EMPTY27_BUYER_PROFILE_REFRESH_RU,
  SHOP_EMPTY27_BUYER_PROFILE_STRIP_TESTID,
  SHOP_EMPTY27_BUYER_PROFILE_TITLE_RU,
  SHOP_EMPTY27_MATRIX_SEED_COLLECTION_ID,
  SHOP_EMPTY27_PARTNERS_LINK_RU,
  SHOP_SC_CABINET_BUYER_PROFILE_NO_SEGMENT_RU,
  shopEmpty27BuyerProfileOmitsPeerLinks,
  shopEmpty27BuyerProfileStorageBadgeRu,
  shopEmpty27BuyerProfileStorageBadgeTestId,
} from '@/lib/platform-core-ports/b2b/shop-sc-empty27-buyer-profile-wave-ym';
import { ROUTES } from '@/lib/platform-core-routes';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';

type Props = {
  buyerId: string;
  collectionId: string;
  surface?: 'embedded' | 'standalone';
  refreshNonce?: number;
};

/** EMPTY27 buyer CRM strip — native platform/showroom (no components/shop/b2b). */
export function PlatformCoreShowroomBuyerProfileStrip({
  buyerId,
  collectionId,
  surface = 'standalone',
  refreshNonce = 0,
}: Props) {
  const [profile, setProfile] = useState<ShopBuyerCrmProfile | null>(null);
  const [storageMode, setStorageMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [localRefreshNonce, setLocalRefreshNonce] = useState(0);
  const omitPeerLinks = shopEmpty27BuyerProfileOmitsPeerLinks(surface);

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
  }, [buyerId, refreshNonce, localRefreshNonce]);

  const storageBadgeTestId = shopEmpty27BuyerProfileStorageBadgeTestId(storageMode);
  const storageBadgeRu = shopEmpty27BuyerProfileStorageBadgeRu(storageMode);
  const matrixCollection =
    collectionId === 'EMPTY27' ? SHOP_EMPTY27_MATRIX_SEED_COLLECTION_ID : collectionId;
  const matrixHref = platformCoreUiHref(
    `${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(matrixCollection)}`
  );
  const partnersHref = platformCoreUiHref(ROUTES.shop.b2bPartnersDiscover);

  return (
    <div
      className="border-border-subtle bg-bg-surface2/40 space-y-2 rounded-md border px-3 py-2"
      data-testid={SHOP_EMPTY27_BUYER_PROFILE_STRIP_TESTID}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-muted text-[10px] font-semibold uppercase">
          {SHOP_EMPTY27_BUYER_PROFILE_TITLE_RU}
        </span>
        {storageBadgeTestId && storageBadgeRu ? (
          <Badge
            variant="outline"
            className={
              storageMode === 'pg'
                ? 'border-sky-500/40 text-[10px] uppercase text-sky-700'
                : 'text-[10px] uppercase'
            }
            data-testid={storageBadgeTestId}
          >
            {storageBadgeRu}
          </Badge>
        ) : storageMode === 'file' ? (
          <Badge
            variant="outline"
            className="text-[9px] uppercase"
            data-testid="shop-sc-cabinet-buyer-profile-file"
          >
            file
          </Badge>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-[10px]"
          data-testid="shop-sc-cabinet-buyer-profile-refresh"
          onClick={() => setLocalRefreshNonce((n) => n + 1)}
        >
          <RefreshCw className="mr-1 h-3 w-3" aria-hidden />
          {SHOP_EMPTY27_BUYER_PROFILE_REFRESH_RU}
        </Button>
      </div>

      {loading ? (
        <p className="text-text-secondary text-[11px]">{SHOP_EMPTY27_BUYER_PROFILE_LOADING_RU}</p>
      ) : profile ? (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="text-[9px]"
            data-testid="shop-sc-cabinet-buyer-profile-segment"
          >
            {profile.segmentNameRu}
          </Badge>
          <Badge
            variant="outline"
            className="text-[9px]"
            data-testid="shop-sc-cabinet-buyer-profile-tier"
          >
            {profile.priceTier}
          </Badge>
          <Badge
            variant="outline"
            className="text-[9px]"
            data-testid="shop-sc-cabinet-buyer-profile-net"
          >
            Net {profile.netTermDays} дн.
          </Badge>
        </div>
      ) : (
        <div className="space-y-1">
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-[9px] text-amber-900"
            data-testid="shop-sc-cabinet-buyer-profile-no-segment"
          >
            {SHOP_SC_CABINET_BUYER_PROFILE_NO_SEGMENT_RU}
          </Badge>
          <p className="text-text-secondary text-[11px] leading-relaxed">
            {SHOP_EMPTY27_BUYER_PROFILE_NO_SEGMENT_HINT_RU}
          </p>
        </div>
      )}

      {!omitPeerLinks ? (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-7 text-[10px] font-bold uppercase"
          >
            <PlatformCoreLink
              href={partnersHref}
              data-testid="shop-sc-cabinet-buyer-profile-partners-link"
            >
              {SHOP_EMPTY27_PARTNERS_LINK_RU}
            </PlatformCoreLink>
          </Button>
          <Button asChild size="sm" variant="ghost" className="h-7 text-[10px] font-bold uppercase">
            <PlatformCoreLink
              href={matrixHref}
              data-testid="shop-sc-cabinet-buyer-profile-matrix-link"
            >
              Матрица
            </PlatformCoreLink>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
