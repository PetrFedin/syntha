'use client';

import Link from 'next/link';
import { buildShopLandedMarginSession } from '@/lib/b2b/shop-landed-margin';
import { shopB2bCheckoutCollectionHref } from '@/lib/routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type ShopLandedMarginGoldenPathStepId =
  | 'hub'
  | 'rollup'
  | 'pricelist'
  | 'matrix'
  | 'checkout';

type Props = {
  collectionId?: string;
  orderId?: string;
  activeStep?: ShopLandedMarginGoldenPathStepId;
};

const STEPS: { id: ShopLandedMarginGoldenPathStepId; label: string }[] = [
  { id: 'hub', label: 'Кабинет' },
  { id: 'rollup', label: 'Сводка' },
  { id: 'pricelist', label: 'Прайс-лист' },
  { id: 'matrix', label: 'Матрица' },
  { id: 'checkout', label: 'Оформление' },
];

export function ShopLandedMarginGoldenPathStrip({
  collectionId,
  orderId,
  activeStep,
}: Props) {
  const session = buildShopLandedMarginSession({ collectionId, orderId });

  const hrefFor = (id: ShopLandedMarginGoldenPathStepId): string => {
    if (id === 'hub') return session.hubHref;
    if (id === 'rollup') return session.rollupHref;
    if (id === 'pricelist') return session.pricelistHref;
    if (id === 'matrix') return session.matrixHref;
    return shopB2bCheckoutCollectionHref(session.collectionId);
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-landed-margin-golden-path-strip">
      {STEPS.map((step, index) => (
        <span key={step.id} className="contents">
          {index > 0 ? (
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
          ) : null}
          <Link
            href={hrefFor(step.id)}
            className={cn(
              hubGadget.goldenLink,
              activeStep === step.id && 'font-bold underline'
            )}
            data-testid={`shop-landed-margin-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function shopLandedMarginGoldenPathStepFromFeature(
  featureId: string | null | undefined
): ShopLandedMarginGoldenPathStepId | undefined {
  if (featureId === 'hub') return 'hub';
  if (featureId === 'rollup') return 'rollup';
  if (featureId === 'pricelist') return 'pricelist';
  return undefined;
}
