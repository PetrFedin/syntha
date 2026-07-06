'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_CRM_TESTID,
  SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_MATRIX_SEED_LINK_TESTID,
  SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_MEMORY_TESTID,
  SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_PG_TESTID,
  SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_PRICELIST_TESTID,
  SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_STRIP_TESTID,
  SHOP_GREENFIELD_MATRIX_SEED_CTA_RU,
  SHOP_GREENFIELD_ONBOARDING_REGISTRY_PENDING_RU,
  SHOP_GREENFIELD_REGISTRY_PG_PROFILE_RU,
  shopGreenfieldMatrixSeedHref,
  shopGreenfieldOnboardingApiPath,
  shopGreenfieldRegistryReady,
  type ShopGreenfieldOnboardingSnapshot,
} from '@/lib/b2b/shop-greenfield-registry-wave-xx';

type Props = {
  buyerId: string;
  collectionId: string;
};

/** PG greenfield onboarding status для empty registry (shop2). */
export function ShopCoRegistryGreenfieldOnboardingStrip({ buyerId, collectionId }: Props) {
  const [state, setState] = useState<ShopGreenfieldOnboardingSnapshot | null>(null);
  const [storageMode, setStorageMode] = useState<string | null>(null);

  useEffect(() => {
    void fetch(shopGreenfieldOnboardingApiPath(buyerId, collectionId), { cache: 'no-store' })
      .then((res) => res.json())
      .then((json: { state?: ShopGreenfieldOnboardingSnapshot; storageMode?: string }) => {
        setState(json.state ?? null);
        setStorageMode(json.storageMode ?? null);
      })
      .catch(() => {
        setState(null);
      });
  }, [buyerId, collectionId]);

  const matrixHref = shopGreenfieldMatrixSeedHref({ collectionId, buyerId, state });
  const ready = shopGreenfieldRegistryReady(state ?? {});

  return (
    <div
      className="border-border-subtle space-y-2 rounded-md border bg-bg-surface2/50 px-3 py-2"
      data-testid={SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_STRIP_TESTID}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-muted text-[10px] font-semibold uppercase">
          {SHOP_GREENFIELD_REGISTRY_PG_PROFILE_RU}
        </span>
        <Badge variant="secondary" className="text-[9px]">
          {buyerId}
        </Badge>
        {storageMode === 'postgres' ? (
          <Badge
            variant="outline"
            className="border-sky-500/40 text-sky-700 text-[9px]"
            data-testid={SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_PG_TESTID}
          >
            PG
          </Badge>
        ) : storageMode === 'memory' ? (
          <Badge variant="outline" className="text-[9px]" data-testid={SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_MEMORY_TESTID}>
            Память
          </Badge>
        ) : null}
        <Badge
          variant={state?.crmReady ? 'secondary' : 'outline'}
          className="text-[9px]"
          data-testid={SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_CRM_TESTID}
        >
          CRM {state?.crmReady ? '✓' : '—'}
        </Badge>
        <Badge
          variant={state?.pricelistReady ? 'secondary' : 'outline'}
          className="text-[9px]"
          data-testid={SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_PRICELIST_TESTID}
        >
          Прайс {state?.pricelistReady ? '✓' : '—'}
        </Badge>
      </div>
      {ready ? (
        <Link
          href={matrixHref}
          className="text-accent-primary text-[10px] font-medium hover:underline"
          data-testid={SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_MATRIX_SEED_LINK_TESTID}
        >
          {SHOP_GREENFIELD_MATRIX_SEED_CTA_RU} →
        </Link>
      ) : (
        <p className="text-text-muted text-[10px]">{SHOP_GREENFIELD_ONBOARDING_REGISTRY_PENDING_RU}</p>
      )}
    </div>
  );
}
