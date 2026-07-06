'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  shopB2bOrderHref,
  shopB2bTrackingOrderHref,
  shopMessagesB2bOrderContextHref,
  shopB2bCheckoutCollectionHref,
} from '@/lib/routes';
import { buildShopCollaborativeOrderSession } from '@/lib/b2b/shop-collaborative-order';
import { buildShopReplenishmentSession } from '@/lib/b2b/shop-replenishment-workspace';
import {
  SHOP_CO_REGISTRY_GREENFIELD_FOCUS_MATRIX_SEED_LINK_TESTID,
  SHOP_CO_REGISTRY_GREENFIELD_FOCUS_STRIP_TESTID,
  SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_PG_TESTID,
  SHOP_GREENFIELD_DEFAULT_BUYER_ID,
  shopGreenfieldOnboardingApiPath,
} from '@/lib/b2b/shop-greenfield-registry-wave-xx';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  orderId: string;
  collectionId: string;
  buyerId?: string;
};

/** Greenfield shop2 · post-checkout registry focus — monetization spine complete. */
export function ShopCoRegistryGreenfieldFocusStrip({
  orderId,
  collectionId,
  buyerId = SHOP_GREENFIELD_DEFAULT_BUYER_ID,
}: Props) {
  const collaborative = buildShopCollaborativeOrderSession({ collectionId, orderId });
  const replenishment = buildShopReplenishmentSession({ collectionId, orderId });
  const [matrixSeedHref, setMatrixSeedHref] = useState<string | null>(null);
  const [onboardingMode, setOnboardingMode] = useState<string | null>(null);

  useEffect(() => {
    void fetch(shopGreenfieldOnboardingApiPath(buyerId, collectionId), { cache: 'no-store' })
      .then((res) => res.json())
      .then((json: { state?: { matrixSeedHref?: string }; storageMode?: string }) => {
        setMatrixSeedHref(json.state?.matrixSeedHref ?? null);
        setOnboardingMode(json.storageMode ?? null);
      })
      .catch(() => {
        /* optional */
      });
  }, [buyerId, collectionId, orderId]);

  return (
    <div
      className="border-border-subtle mb-4 space-y-2 rounded-lg border border-emerald-200/60 bg-emerald-50/30 px-4 py-3"
      data-testid={SHOP_CO_REGISTRY_GREENFIELD_FOCUS_STRIP_TESTID}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="text-[9px]" data-testid="shop-co-registry-greenfield-focus-badge">
          Greenfield · первый заказ
        </Badge>
        {onboardingMode === 'postgres' ? (
          <Badge variant="outline" className="text-[9px]" data-testid={SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_PG_TESTID}>
            PG onboarding
          </Badge>
        ) : null}
        <span className="text-sm font-medium">{orderId}</span>
      </div>
      <p className="text-text-secondary text-xs leading-relaxed">
        Оформление → фокус реестра: CRM и синхронизация tier применены. Следующий шаг — трекинг и согласования совместного заказа.
      </p>
      <div className={hubGadget.goldenPath}>
        <Link
          href={shopB2bOrderHref(orderId)}
          className={hubGadget.goldenLink}
          data-testid="shop-co-registry-greenfield-focus-detail-link"
        >
          Карточка
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={shopB2bTrackingOrderHref(orderId)}
          className={hubGadget.goldenLink}
          data-testid="shop-co-registry-greenfield-focus-tracking-link"
        >
          Трекинг
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={collaborative.approvalsHref}
          className={hubGadget.goldenLink}
          data-testid="shop-co-registry-greenfield-focus-collaborative-link"
        >
          Согласования
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={shopMessagesB2bOrderContextHref(orderId)}
          className={hubGadget.goldenLink}
          data-testid="shop-co-registry-greenfield-focus-comms-link"
        >
          Чат заказа
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={replenishment.rulesHref}
          className={hubGadget.goldenLink}
          data-testid="shop-co-registry-greenfield-focus-replenishment-link"
        >
          Пополнение
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={shopB2bCheckoutCollectionHref(collectionId)}
          className={hubGadget.goldenLink}
          data-testid="shop-co-registry-greenfield-focus-checkout-link"
        >
          Оформление
        </Link>
        {matrixSeedHref ? (
          <>
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
            <Link
              href={matrixSeedHref}
              className={hubGadget.goldenLink}
              data-testid={SHOP_CO_REGISTRY_GREENFIELD_FOCUS_MATRIX_SEED_LINK_TESTID}
            >
              Seed матрицы
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}
