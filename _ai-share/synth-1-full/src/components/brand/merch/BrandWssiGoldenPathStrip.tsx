'use client';

import Link from 'next/link';
import {
  brandWssiCheckoutHref,
  brandWssiFeatureHref,
  brandWssiShopMatrixHref,
  brandWssiShowroomHref,
} from '@/lib/fashion/brand-wssi-plan';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type BrandWssiGoldenPathStepId =
  | 'otb'
  | 'mix'
  | 'capacity'
  | 'shop-matrix'
  | 'shop-showroom'
  | 'checkout';

type Props = {
  collectionId?: string;
  activeStep?: BrandWssiGoldenPathStepId;
};

const STEPS: { id: BrandWssiGoldenPathStepId; label: string }[] = [
  { id: 'otb', label: 'OTB' },
  { id: 'mix', label: 'Mix' },
  { id: 'capacity', label: 'Capacity' },
  { id: 'shop-matrix', label: 'Shop matrix' },
  { id: 'shop-showroom', label: 'Шоурум магазина' },
  { id: 'checkout', label: 'Оформление' },
];

export function BrandWssiGoldenPathStrip({ collectionId, activeStep }: Props) {
  const cid = collectionId?.trim() || 'SS27';

  const hrefFor = (id: BrandWssiGoldenPathStepId): string => {
    if (id === 'otb') return brandWssiFeatureHref('otb', cid);
    if (id === 'mix') return brandWssiFeatureHref('mix', cid);
    if (id === 'capacity') return brandWssiFeatureHref('capacity', cid);
    if (id === 'shop-matrix') return brandWssiShopMatrixHref(cid);
    if (id === 'shop-showroom') return brandWssiShowroomHref(cid);
    return brandWssiCheckoutHref(cid);
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-wssi-golden-path-strip">
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
            data-testid={`brand-wssi-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function brandWssiGoldenPathStepFromFeature(
  featureId: string | null | undefined
): BrandWssiGoldenPathStepId | undefined {
  if (featureId === 'otb') return 'otb';
  if (featureId === 'mix') return 'mix';
  if (featureId === 'capacity') return 'capacity';
  return undefined;
}
