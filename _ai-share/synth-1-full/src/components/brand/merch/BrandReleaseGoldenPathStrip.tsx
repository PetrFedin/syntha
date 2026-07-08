'use client';

import Link from 'next/link';
import { buildBrandLinesheetSyndicationSession } from '@/lib/fashion/brand-linesheet-syndication';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type BrandReleaseGoldenPathStepId =
  | 'checklist'
  | 'syndication'
  | 'showroom-publish'
  | 'brand-preview'
  | 'shop-showroom';

type Props = {
  collectionId?: string;
  activeStep?: BrandReleaseGoldenPathStepId;
};

const STEPS: { id: BrandReleaseGoldenPathStepId; label: string }[] = [
  { id: 'checklist', label: 'Checklist' },
  { id: 'syndication', label: 'Syndication' },
  { id: 'showroom-publish', label: 'Publish' },
  { id: 'brand-preview', label: 'Brand preview' },
  { id: 'shop-showroom', label: 'Шоурум магазина' },
];

/** One-click golden path: release gate → syndication → showroom mirrors. */
export function BrandReleaseGoldenPathStrip({ collectionId, activeStep }: Props) {
  const session = buildBrandLinesheetSyndicationSession({ collectionId });

  const hrefFor = (id: BrandReleaseGoldenPathStepId): string => {
    switch (id) {
      case 'checklist':
        return session.checklistHref;
      case 'syndication':
        return session.syndicationHref;
      case 'showroom-publish':
        return session.showroomPublishHref;
      case 'brand-preview':
        return session.brandShowroomHref;
      case 'shop-showroom':
        return session.shopShowroomHref;
      default:
        return session.checklistHref;
    }
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-release-golden-path-strip">
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
            data-testid={`brand-release-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function brandReleaseGoldenPathStepFromFeature(
  featureId: string | null | undefined
): BrandReleaseGoldenPathStepId | undefined {
  if (featureId === 'checklist') return 'checklist';
  if (featureId === 'syndication') return 'syndication';
  if (featureId === 'showroom-publish') return 'showroom-publish';
  return undefined;
}
