'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShopCoCheckoutGreenfieldReadinessStrip } from '@/components/shop/b2b/ShopCoCheckoutGreenfieldReadinessStrip';
import { ShopCoRegistryGreenfieldOnboardingStrip } from '@/components/shop/b2b/ShopCoRegistryGreenfieldOnboardingStrip';
import { buildPlatformB2bHubSession } from '@/lib/b2b/platform-b2b-hub';
import { buildBrandCrmSegmentationSession } from '@/lib/b2b/brand-crm-segmentation';
import { shopB2bCheckoutCollectionHref } from '@/lib/routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  buyerId: string;
  collectionId: string;
  showroomHref: string;
  matrixHref: string;
};

/** Greenfield shop2 · empty registry monetization spine (CRM → checkout → registry). */
export function ShopCoRegistryEmptyGreenfieldMonetizationStrip({
  buyerId,
  collectionId,
  showroomHref,
  matrixHref,
}: Props) {
  const platform = buildPlatformB2bHubSession({ collectionId });
  const crmSession = buildBrandCrmSegmentationSession({ collectionId });
  const { shopMarginPricelistHref, segmentsHref: brandAssignHref } = crmSession;

  return (
    <div
      className="border-border-subtle space-y-3 rounded-lg border border-violet-200/60 bg-violet-50/25 px-4 py-4"
      data-testid="shop-co-registry-empty-greenfield-monetization-strip"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="text-[9px]" data-testid="shop-co-registry-empty-greenfield-badge">
          Greenfield · {buyerId}
        </Badge>
        <span className="text-sm font-medium">Онбординг нового магазина</span>
      </div>
      <p className="text-text-secondary text-xs leading-relaxed">
        Бренд назначает CRM и прайс → оформление → заказ в реестре. Без тупика demo-seed.
      </p>
      <ShopCoRegistryGreenfieldOnboardingStrip buyerId={buyerId} collectionId={collectionId} />
      <ShopCoCheckoutGreenfieldReadinessStrip buyerId={buyerId} collectionId={collectionId} />
      <div className={hubGadget.goldenPath} data-testid="shop-co-registry-empty-greenfield-path">
        <Link
          href={brandAssignHref}
          className={hubGadget.goldenLink}
          data-testid="shop-co-registry-empty-greenfield-brand-assign-link"
        >
          CRM бренда
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={shopMarginPricelistHref}
          className={hubGadget.goldenLink}
          data-testid="shop-co-registry-empty-greenfield-brand-pricelist-link"
        >
          Прайс-лист
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link href={showroomHref} className={hubGadget.goldenLink} data-testid="shop-co-registry-empty-greenfield-showroom-link">
          Шоурум
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link href={matrixHref} className={hubGadget.goldenLink} data-testid="shop-co-registry-empty-greenfield-matrix-link">
          Матрица
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={shopB2bCheckoutCollectionHref(collectionId)}
          className={hubGadget.goldenLink}
          data-testid="shop-co-registry-empty-greenfield-checkout-link"
        >
          Оформление
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={platform.hubHref}
          className={hubGadget.goldenLink}
          data-testid="shop-co-registry-empty-greenfield-platform-hub-link"
        >
          Platform B2B
        </Link>
      </div>
    </div>
  );
}
