'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchShopBuyerCrmProfile } from '@/lib/b2b/shop-buyer-crm-profile-store';
import type { ShopBuyerCrmProfile } from '@/lib/b2b/shop-buyer-crm-profile';
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
} from '@/lib/b2b/shop-sc-empty27-buyer-profile-wave-ym';
import { ROUTES } from '@/lib/routes';
import { RefreshCw } from 'lucide-react';

type Props = {
  buyerId: string;
  collectionId: string;
  /** Wave YM: embedded in EMPTY27 strip — omit duplicate peer CTAs. */
  surface?: 'embedded' | 'standalone';
  refreshNonce?: number;
};

/** EMPTY27 / пустая витрина — PG buyer CRM strip в кабинете sample_collection (wave YM). */
export function ShopScCabinetBuyerProfileStrip({
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

  return (
    <div
      className="border-border-subtle space-y-2 rounded-md border bg-bg-surface2/40 px-3 py-2"
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
                ? 'border-sky-500/40 text-sky-700 text-[9px] uppercase'
                : 'text-[9px] uppercase'
            }
            data-testid={storageBadgeTestId}
          >
            {storageBadgeRu}
          </Badge>
        ) : storageMode === 'file' ? (
          <Badge variant="outline" className="text-[9px] uppercase" data-testid="shop-sc-cabinet-buyer-profile-file">
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
          <Badge variant="secondary" className="text-[9px]" data-testid="shop-sc-cabinet-buyer-profile-segment">
            {profile.segmentNameRu}
          </Badge>
          <Badge variant="outline" className="text-[9px]" data-testid="shop-sc-cabinet-buyer-profile-tier">
            {profile.priceTier}
          </Badge>
          <Badge variant="outline" className="text-[9px]" data-testid="shop-sc-cabinet-buyer-profile-net">
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
          <Button asChild size="sm" variant="outline" className="h-7 text-[10px] font-bold uppercase">
            <Link
              href={ROUTES.shop.b2bPartnersDiscover}
              data-testid="shop-sc-cabinet-buyer-profile-partners-link"
            >
              {SHOP_EMPTY27_PARTNERS_LINK_RU}
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="h-7 text-[10px] font-bold uppercase">
            <Link
              href={`${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(
                collectionId === 'EMPTY27' ? SHOP_EMPTY27_MATRIX_SEED_COLLECTION_ID : collectionId
              )}`}
              data-testid="shop-sc-cabinet-buyer-profile-matrix-link"
            >
              Матрица
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
