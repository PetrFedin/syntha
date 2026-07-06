'use client';

import Link from 'next/link';
import {
  shopB2bCheckoutCollectionHref,
  shopB2bOrdersCollectionRegistryHref,
  shopB2bOrderHref,
  ROUTES,
} from '@/lib/platform-core-routes';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type ShopScGoldenPathOmitStep = 'showroom' | 'matrix';
export type ShopScGoldenPathActiveStep = 'showroom' | 'matrix' | 'checkout' | 'registry';

/** Единая цепочка sample_collection магазина — native href при MODE=1. */
export function ShopScCabinetGoldenPathStrip({
  collectionId,
  activeOrderId,
  omitStep,
  activeStep,
}: {
  collectionId: string;
  activeOrderId?: string;
  omitStep?: ShopScGoldenPathOmitStep;
  /** Подсветка следующего шага (baseline: showroom → matrix). */
  activeStep?: ShopScGoldenPathActiveStep;
}) {
  const showroomHref = platformCoreUiHref(
    `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(collectionId)}`
  );
  const matrixHref = platformCoreUiHref(
    `${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}`
  );

  const parts: Array<{ key: string; href: string; label: string; testId: string; legacy?: string }> =
    [];

  if (omitStep !== 'showroom') {
    parts.push({
      key: 'showroom',
      href: showroomHref,
      label: 'Витрина',
      testId: 'shop-sc-golden-path-showroom',
      legacy: 'shop-sc-cabinet-showroom-link',
    });
  }
  if (omitStep !== 'matrix') {
    parts.push({
      key: 'matrix',
      href: matrixHref,
      label: 'Матрица',
      testId: 'shop-sc-golden-path-matrix',
      legacy: 'shop-sc-cabinet-matrix-link',
    });
  }
  parts.push(
    {
      key: 'checkout',
      href: platformCoreUiHref(shopB2bCheckoutCollectionHref(collectionId)),
      label: 'Оформление',
      testId: 'shop-sc-golden-path-checkout',
      legacy: 'shop-sc-cabinet-checkout-link',
    },
    {
      key: 'registry',
      href: platformCoreUiHref(shopB2bOrdersCollectionRegistryHref(collectionId)),
      label: 'Реестр',
      testId: 'shop-sc-golden-path-registry',
      legacy: 'shop-sc-cabinet-registry-link',
    }
  );

  if (activeOrderId?.trim()) {
    parts.push({
      key: 'order',
      href: platformCoreUiHref(shopB2bOrderHref(activeOrderId.trim())),
      label: 'Заказ',
      testId: 'shop-co-matrix-active-order-link',
    });
  }

  return (
    <div
      className={hubGadget.goldenPath}
      data-testid="shop-sc-cabinet-golden-path"
      data-audit-legacy="shop-sc-cabinet-context-strip"
    >
      {parts.map((part, index) => (
        <span key={part.key} className="inline-flex items-center gap-1.5">
          {index > 0 ? <span className={hubGadget.goldenSep} aria-hidden>·</span> : null}
          <Link
            href={part.href}
            className={cn(
              hubGadget.goldenLink,
              activeStep === part.key && 'font-bold underline'
            )}
            data-testid={part.testId}
            {...(part.legacy ? { 'data-audit-legacy': part.legacy } : {})}
          >
            {part.label}
          </Link>
        </span>
      ))}
    </div>
  );
}
