'use client';

import Link from 'next/link';
import { buildBrandLandedMarginSession } from '@/lib/b2b/brand-landed-margin';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type BrandLandedMarginGoldenPathStepId =
  | 'simulator'
  | 'pricelist'
  | 'shop-rollup'
  | 'shop-matrix'
  | 'checkout'
  | 'price-lists';

type Props = {
  collectionId?: string;
  orderId?: string;
  activeStep?: BrandLandedMarginGoldenPathStepId;
};

const STEPS: { id: BrandLandedMarginGoldenPathStepId; label: string }[] = [
  { id: 'simulator', label: 'Simulator' },
  { id: 'pricelist', label: 'Pricelist' },
  { id: 'shop-rollup', label: 'Shop rollup' },
  { id: 'shop-matrix', label: 'Shop matrix' },
  { id: 'checkout', label: 'Checkout' },
  { id: 'price-lists', label: 'Price lists' },
];

export function BrandLandedMarginGoldenPathStrip({ collectionId, orderId, activeStep }: Props) {
  const session = buildBrandLandedMarginSession({ collectionId, orderId });

  const hrefFor = (id: BrandLandedMarginGoldenPathStepId): string => {
    if (id === 'simulator') return session.simulatorHref;
    if (id === 'pricelist') return session.pricelistHref;
    if (id === 'shop-rollup') return session.shopRollupHref;
    if (id === 'shop-matrix') return session.shopMatrixHref;
    if (id === 'checkout') return session.shopCheckoutHref;
    return session.priceListsVersionsHref;
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-landed-margin-golden-path-strip">
      {STEPS.map((step, index) => (
        <span key={step.id} className="contents">
          {index > 0 ? (
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
          ) : null}
          <Link
            href={hrefFor(step.id)}
            className={cn(hubGadget.goldenLink, activeStep === step.id && 'font-bold underline')}
            data-testid={`brand-landed-margin-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function brandLandedMarginGoldenPathStepFromFeature(
  featureId: string | null | undefined
): BrandLandedMarginGoldenPathStepId | undefined {
  if (featureId === 'simulator') return 'simulator';
  if (featureId === 'pricelist') return 'pricelist';
  if (featureId === 'shop-rollup') return 'shop-rollup';
  return undefined;
}
