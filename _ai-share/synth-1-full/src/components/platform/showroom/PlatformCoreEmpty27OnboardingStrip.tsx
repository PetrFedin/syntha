'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlatformCoreLink } from '@/components/platform/PlatformCoreLink';
import { PlatformCoreShowroomBuyerProfileStrip } from '@/components/platform/showroom/PlatformCoreShowroomBuyerProfileStrip';
import { ROUTES } from '@/lib/platform-core-routes';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';
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
} from '@/lib/platform-core-ports/b2b/shop-sc-empty27-buyer-profile-wave-ym';
import type { ShopGreenfieldOnboardingSnapshot } from '@/lib/platform-core-ports/b2b/shop-greenfield-registry-wave-xx';
import { postShopBuyerCrmProfileOnboardingSeed } from '@/lib/platform-core-ports/b2b/shop-buyer-crm-profile-store';

type Props = {
  buyerId: string;
  collectionId: string;
};

/** EMPTY27 cabinet — PG buyer profile + greenfield onboarding (native platform/showroom). */
export function PlatformCoreEmpty27OnboardingStrip({ buyerId, collectionId }: Props) {
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

  const matrixHref = platformCoreUiHref(shopEmpty27MatrixSeedHref({ buyerId, state }));
  const partnersHref = platformCoreUiHref(ROUTES.shop.b2bPartnersDiscover);
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
      className="border-border-subtle bg-bg-surface2/30 space-y-3 rounded-md border px-3 py-2"
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
          {seedBusy
            ? SHOP_EMPTY27_BUYER_PROFILE_SEED_BUSY_RU
            : SHOP_EMPTY27_BUYER_PROFILE_SEED_CTA_RU}
        </Button>
      </div>

      {seedHint ? (
        <p
          className="text-text-secondary text-[10px] leading-relaxed"
          data-testid="shop-sc-empty27-onboarding-seed-hint"
        >
          {seedHint}
        </p>
      ) : null}

      <PlatformCoreShowroomBuyerProfileStrip
        buyerId={buyerId}
        collectionId={collectionId}
        surface="embedded"
        refreshNonce={profileRefreshNonce}
      />

      <div
        className="border-border-subtle bg-bg-surface2/40 space-y-2 rounded-md border px-3 py-2"
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
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-7 text-[10px] font-bold uppercase"
          >
            <PlatformCoreLink
              href={partnersHref}
              data-testid={SHOP_EMPTY27_ONBOARDING_PARTNERS_LINK_TESTID}
            >
              {SHOP_EMPTY27_PARTNERS_LINK_RU}
            </PlatformCoreLink>
          </Button>
          <Button asChild size="sm" variant="ghost" className="h-7 text-[10px] font-bold uppercase">
            <PlatformCoreLink
              href={matrixHref}
              data-testid={SHOP_EMPTY27_ONBOARDING_MATRIX_LINK_TESTID}
            >
              {SHOP_EMPTY27_MATRIX_LINK_RU}
            </PlatformCoreLink>
          </Button>
        </div>
      </div>
    </div>
  );
}

/** @deprecated alias — use PlatformCoreEmpty27OnboardingStrip */
export const ShopScEmpty27OnboardingStrip = PlatformCoreEmpty27OnboardingStrip;
