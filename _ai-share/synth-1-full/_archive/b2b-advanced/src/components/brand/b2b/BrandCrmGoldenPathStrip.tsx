'use client';

import Link from 'next/link';
import { buildBrandCrmSegmentationSession } from '@/lib/b2b/brand-crm-segmentation';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type BrandCrmGoldenPathStepId = 'segments' | 'pricelist' | 'showroom' | 'shop-matrix';

type Props = {
  collectionId?: string;
  activeStep?: BrandCrmGoldenPathStepId;
};

const STEPS: { id: BrandCrmGoldenPathStepId; label: string }[] = [
  { id: 'segments', label: 'Segments' },
  { id: 'pricelist', label: 'Pricelist' },
  { id: 'showroom', label: 'Showroom' },
  { id: 'shop-matrix', label: 'Shop matrix' },
];

export function BrandCrmGoldenPathStrip({ collectionId, activeStep }: Props) {
  const session = buildBrandCrmSegmentationSession({ collectionId });

  const hrefFor = (id: BrandCrmGoldenPathStepId): string => {
    switch (id) {
      case 'segments':
        return session.segmentsHref;
      case 'pricelist':
        return session.pricelistHref;
      case 'showroom':
        return session.showroomHref;
      case 'shop-matrix':
        return session.shopMatrixHref;
      default:
        return session.segmentsHref;
    }
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-crm-golden-path-strip">
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
            data-testid={`brand-crm-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function brandCrmGoldenPathStepFromFeature(
  featureId: string | null | undefined
): BrandCrmGoldenPathStepId | undefined {
  if (featureId === 'segments') return 'segments';
  if (featureId === 'pricelist') return 'pricelist';
  if (featureId === 'showroom') return 'showroom';
  return undefined;
}
