'use client';

import Link from 'next/link';
import { buildBrandShowroomBuySession } from '@/lib/fashion/brand-showroom-buy';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type BrandShowroomBuyGoldenPathStepId =
  | 'preview'
  | 'publish'
  | 'shop-buy'
  | 'shop-showroom'
  | 'matrix';

type Props = {
  collectionId?: string;
  activeStep?: BrandShowroomBuyGoldenPathStepId;
};

const STEPS: { id: BrandShowroomBuyGoldenPathStepId; label: string }[] = [
  { id: 'preview', label: 'Preview' },
  { id: 'publish', label: 'Publish' },
  { id: 'shop-buy', label: 'Закупка магазина' },
  { id: 'shop-showroom', label: 'Шоурум магазина' },
  { id: 'matrix', label: 'Матрица магазина' },
];

export function BrandShowroomBuyGoldenPathStrip({ collectionId, activeStep }: Props) {
  const session = buildBrandShowroomBuySession({ collectionId });

  const hrefFor = (id: BrandShowroomBuyGoldenPathStepId): string => {
    if (id === 'preview') return session.previewHref;
    if (id === 'publish') return session.publishHref;
    if (id === 'shop-buy') return session.shopBuyHref;
    if (id === 'shop-showroom') return session.shopShowroomHref;
    return session.shopMatrixHref;
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-showroom-buy-golden-path-strip">
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
            data-testid={`brand-showroom-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function brandShowroomBuyGoldenPathStepFromFeature(
  featureId: string | null | undefined
): BrandShowroomBuyGoldenPathStepId | undefined {
  if (featureId === 'preview') return 'preview';
  if (featureId === 'publish') return 'publish';
  if (featureId === 'shop-buy') return 'shop-buy';
  return undefined;
}
