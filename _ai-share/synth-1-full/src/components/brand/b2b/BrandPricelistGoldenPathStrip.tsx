'use client';

import Link from 'next/link';
import { buildBrandPricelistSession } from '@/lib/b2b/brand-pricelist-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type BrandPricelistGoldenPathStepId =
  | 'versions'
  | 'tiers'
  | 'shop-sync'
  | 'shop-matrix'
  | 'crm-segments'
  | 'checkout';

type Props = {
  collectionId?: string;
  orderId?: string;
  activeStep?: BrandPricelistGoldenPathStepId;
};

const STEPS: { id: BrandPricelistGoldenPathStepId; label: string }[] = [
  { id: 'versions', label: 'Versions' },
  { id: 'tiers', label: 'Tiers' },
  { id: 'shop-sync', label: 'Shop sync' },
  { id: 'shop-matrix', label: 'Shop matrix' },
  { id: 'crm-segments', label: 'CRM segments' },
  { id: 'checkout', label: 'Оформление' },
];

export function BrandPricelistGoldenPathStrip({
  collectionId,
  orderId,
  activeStep,
}: Props) {
  const session = buildBrandPricelistSession({ collectionId, orderId });

  const hrefFor = (id: BrandPricelistGoldenPathStepId): string => {
    if (id === 'versions') return session.versionsHref;
    if (id === 'tiers') return session.tiersHref;
    if (id === 'shop-sync') return session.shopSyncHref;
    if (id === 'shop-matrix') return session.shopMatrixHref;
    if (id === 'crm-segments') return session.brandCrmSegmentsHref;
    return session.shopCheckoutHref;
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-pricelist-golden-path-strip">
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
            data-testid={`brand-pricelist-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function brandPricelistGoldenPathStepFromFeature(
  featureId: string | null | undefined
): BrandPricelistGoldenPathStepId | undefined {
  if (featureId === 'versions') return 'versions';
  if (featureId === 'tiers') return 'tiers';
  if (featureId === 'shop-sync') return 'shop-sync';
  return undefined;
}
