'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShopScCabinetBuyerProfileStrip } from '@/components/shop/b2b/ShopScCabinetBuyerProfileStrip';
import { ROUTES } from '@/lib/routes';
import {
  SHOP_EMPTY27_GREENFIELD_HINT_TESTID,
  SHOP_EMPTY27_MATRIX_LINK_RU,
  SHOP_EMPTY27_ONBOARDING_CRM_TESTID,
  SHOP_EMPTY27_ONBOARDING_GREENFIELD_TESTID,
  SHOP_EMPTY27_ONBOARDING_MATRIX_LINK_TESTID,
  SHOP_EMPTY27_ONBOARDING_PARTNERS_LINK_TESTID,
  SHOP_EMPTY27_ONBOARDING_PRICELIST_TESTID,
  SHOP_EMPTY27_ONBOARDING_SEED_PROFILE_TESTID,
  SHOP_EMPTY27_ONBOARDING_STRIP_TESTID,
  SHOP_EMPTY27_PARTNERS_LINK_RU,
  SHOP_EMPTY27_BUYER_PROFILE_SEED_BUSY_RU,
  SHOP_EMPTY27_BUYER_PROFILE_SEED_CTA_RU,
  shopEmpty27GreenfieldHintRu,
  shopEmpty27GreenfieldOnboardingApiPath,
  shopEmpty27MatrixSeedHref,
  shopEmpty27OnboardingStorageBadgeTestId,
  shopEmpty27OnboardingTitleRu,
  shopEmpty27BuyerProfileStorageBadgeRu,
} from '@/lib/b2b/shop-sc-empty27-buyer-profile-wave-ym';
import type { ShopGreenfieldOnboardingSnapshot } from '@/lib/b2b/shop-greenfield-registry-wave-xx';
import { postShopBuyerCrmProfileOnboardingSeed } from '@/lib/b2b/shop-buyer-crm-profile-store';

type Props = {
  buyerId: string;
  collectionId: string;
};

/** EMPTY27 cabinet — PG buyer profile read/write + greenfield onboarding (wave YM). */
export function ShopScEmpty27OnboardingStrip({ buyerId, collectionId }: Props) {
  const [state, setState] = useState<ShopGreenfieldOnboardingSnapshot | null>(null);
  const [storageMode, setStorageMode] = useState<string | null>(null);
  const [profileRefreshNonce, setProfileRefreshNonce] = useState(0);
  const [seedBusy, setSeedBusy] = useState(false);
  const [seedHint, setSeedHint] = useState<string | null>(null);

  const reloadGreenfield = useCallback(() => {
    void fetch(shopEmpty27GreenfieldOnboardingApiPath(buyerId, collectionId), {
      cache: 'no-store',
    })
      .then((res) => res.json())
      .then((json: { state?: ShopGreenfieldOnboardingSnapshot; storageMode?: string }) => {
        setState(json.state ?? null);
        setStorageMode(json.storageMode ?? null);
      })
      .catch(() => {
        setState(null);
      });
  }, [buyerId, collectionId]);

  useEffect(() => {
    reloadGreenfield();
  }, [reloadGreenfield]);

  const matrixHref = shopEmpty27MatrixSeedHref({ buyerId, state });
  const onboardingBadgeTestId = shopEmpty27OnboardingStorageBadgeTestId(storageMode);
  const onboardingBadgeRu = shopEmpty27BuyerProfileStorageBadgeRu(
    storageMode === 'postgres' ? 'pg' : storageMode === 'memory' ? 'memory' : null
  );

  const handleSeedProfile = () => {
    setSeedBusy(true);
    setSeedHint(null);
    void postShopBuyerCrmProfileOnboardingSeed({ buyerId, collectionId })
      .then((res) => {
        setSeedHint(res.messageRu ?? null);
        if (res.ok) {
          setProfileRefreshNonce((n) => n + 1);
          reloadGreenfield();
        }
      })
      .finally(() => {
        setSeedBusy(false);
      });
  };

  return (
    <div
      className="border-border-subtle space-y-3 rounded-md border bg-bg-surface2/30 px-3 py-2"
      data-testid={SHOP_EMPTY27_ONBOARDING_STRIP_TESTID}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-muted text-[10px] font-semibold uppercase">
          {shopEmpty27OnboardingTitleRu(collectionId)}
        </span>
        {onboardingBadgeTestId && onboardingBadgeRu ? (
          <Badge
            variant="outline"
            className="text-[9px] uppercase"
            data-testid={onboardingBadgeTestId}
          >
            {onboardingBadgeRu}
          </Badge>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-[10px] font-bold uppercase"
          data-testid={SHOP_EMPTY27_ONBOARDING_SEED_PROFILE_TESTID}
          disabled={seedBusy}
          onClick={handleSeedProfile}
        >
          {seedBusy ? SHOP_EMPTY27_BUYER_PROFILE_SEED_BUSY_RU : SHOP_EMPTY27_BUYER_PROFILE_SEED_CTA_RU}
        </Button>
      </div>

      {seedHint ? (
        <p className="text-text-secondary text-[10px] leading-relaxed" data-testid="shop-sc-empty27-onboarding-seed-hint">
          {seedHint}
        </p>
      ) : null}

      <ShopScCabinetBuyerProfileStrip
        buyerId={buyerId}
        collectionId={collectionId}
        surface="embedded"
        refreshNonce={profileRefreshNonce}
      />

      <div
        className="border-border-subtle space-y-2 rounded-md border bg-bg-surface2/40 px-3 py-2"
        data-testid={SHOP_EMPTY27_ONBOARDING_GREENFIELD_TESTID}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={state?.crmReady ? 'secondary' : 'outline'}
            className="text-[9px]"
            data-testid={SHOP_EMPTY27_ONBOARDING_CRM_TESTID}
          >
            CRM {state?.crmReady ? '✓' : '—'}
          </Badge>
          <Badge
            variant={state?.pricelistReady ? 'secondary' : 'outline'}
            className="text-[9px]"
            data-testid={SHOP_EMPTY27_ONBOARDING_PRICELIST_TESTID}
          >
            Прайс {state?.pricelistReady ? '✓' : '—'}
          </Badge>
        </div>
        <p
          className="text-text-secondary text-[10px] leading-relaxed"
          data-testid={SHOP_EMPTY27_GREENFIELD_HINT_TESTID}
        >
          {shopEmpty27GreenfieldHintRu(state)}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline" className="h-7 text-[10px] font-bold uppercase">
            <Link
              href={ROUTES.shop.b2bPartnersDiscover}
              data-testid={SHOP_EMPTY27_ONBOARDING_PARTNERS_LINK_TESTID}
            >
              {SHOP_EMPTY27_PARTNERS_LINK_RU}
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="h-7 text-[10px] font-bold uppercase">
            <Link href={matrixHref} data-testid={SHOP_EMPTY27_ONBOARDING_MATRIX_LINK_TESTID}>
              {SHOP_EMPTY27_MATRIX_LINK_RU}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
