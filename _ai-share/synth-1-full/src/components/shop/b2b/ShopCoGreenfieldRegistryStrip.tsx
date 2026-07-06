'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  SHOP_CO_GREENFIELD_REGISTRY_BUYER_PG_TESTID,
  SHOP_CO_GREENFIELD_REGISTRY_BUYER_TESTID,
  SHOP_CO_GREENFIELD_REGISTRY_CRM_TESTID,
  SHOP_CO_GREENFIELD_REGISTRY_MATRIX_SEED_LINK_TESTID,
  SHOP_CO_GREENFIELD_REGISTRY_MEMORY_TESTID,
  SHOP_CO_GREENFIELD_REGISTRY_PATH_TESTID,
  SHOP_CO_GREENFIELD_REGISTRY_PG_TESTID,
  SHOP_CO_GREENFIELD_REGISTRY_PRICELIST_TESTID,
  SHOP_CO_GREENFIELD_REGISTRY_STATUS_TESTID,
  SHOP_CO_GREENFIELD_REGISTRY_STRIP_TESTID,
  SHOP_GREENFIELD_MATRIX_SEED_CTA_RU,
  SHOP_GREENFIELD_ONBOARDING_PENDING_RU,
  SHOP_GREENFIELD_REGISTRY_TITLE_RU,
  shopGreenfieldBuyerLabelRu,
  shopGreenfieldMatrixSeedHref,
  shopGreenfieldOnboardingApiPath,
  shopGreenfieldOnboardingMessageRu,
  shopGreenfieldRegistryReady,
  type ShopGreenfieldOnboardingSnapshot,
} from '@/lib/b2b/shop-greenfield-registry-wave-xx';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  buyerId: string;
  collectionId: string;
};

/** Greenfield shop2 · cabinet CO registry strip (PG buyer + pricelist + matrix seed). */
export function ShopCoGreenfieldRegistryStrip({ buyerId, collectionId }: Props) {
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
  const statusRu = shopGreenfieldOnboardingMessageRu({
    crmReady: Boolean(state?.crmReady),
    pricelistReady: Boolean(state?.pricelistReady),
    storageMode,
    buyerId,
  });

  return (
    <div
      className="border-border-subtle space-y-2 rounded-md border border-violet-200/50 bg-violet-50/20 px-3 py-2"
      data-testid={SHOP_CO_GREENFIELD_REGISTRY_STRIP_TESTID}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-muted text-[10px] font-semibold uppercase">
          {SHOP_GREENFIELD_REGISTRY_TITLE_RU}
        </span>
        <Badge variant="secondary" className="text-[9px]" data-testid={SHOP_CO_GREENFIELD_REGISTRY_BUYER_TESTID}>
          {buyerId}
        </Badge>
        <Badge variant="outline" className="text-[9px]" data-testid={SHOP_CO_GREENFIELD_REGISTRY_BUYER_PG_TESTID}>
          {shopGreenfieldBuyerLabelRu(buyerId)}
        </Badge>
        {storageMode === 'postgres' ? (
          <Badge
            variant="outline"
            className="border-sky-500/40 text-sky-700 text-[9px]"
            data-testid={SHOP_CO_GREENFIELD_REGISTRY_PG_TESTID}
          >
            PG
          </Badge>
        ) : storageMode === 'memory' ? (
          <Badge variant="outline" className="text-[9px]" data-testid={SHOP_CO_GREENFIELD_REGISTRY_MEMORY_TESTID}>
            Память
          </Badge>
        ) : null}
        <Badge
          variant={state?.crmReady ? 'secondary' : 'outline'}
          className="text-[9px]"
          data-testid={SHOP_CO_GREENFIELD_REGISTRY_CRM_TESTID}
        >
          CRM {state?.crmReady ? '✓' : '—'}
        </Badge>
        <Badge
          variant={state?.pricelistReady ? 'secondary' : 'outline'}
          className="text-[9px]"
          data-testid={SHOP_CO_GREENFIELD_REGISTRY_PRICELIST_TESTID}
        >
          Прайс {state?.pricelistReady ? '✓' : '—'}
        </Badge>
      </div>
      <p className="text-text-muted text-[10px]" data-testid={SHOP_CO_GREENFIELD_REGISTRY_STATUS_TESTID}>
        {statusRu}
      </p>
      {ready ? (
        <div className={hubGadget.goldenPath} data-testid={SHOP_CO_GREENFIELD_REGISTRY_PATH_TESTID}>
          <Link
            href={matrixHref}
            className={hubGadget.goldenLink}
            data-testid={SHOP_CO_GREENFIELD_REGISTRY_MATRIX_SEED_LINK_TESTID}
          >
            {SHOP_GREENFIELD_MATRIX_SEED_CTA_RU}
          </Link>
        </div>
      ) : (
        <p className="text-text-muted text-[10px]">{SHOP_GREENFIELD_ONBOARDING_PENDING_RU}</p>
      )}
    </div>
  );
}
