'use client';

import Link from 'next/link';
import {
  brandMaterialPassportFeatureHref,
  brandMaterialPassportReleaseChecklistHref,
  brandMaterialPassportSyndicationHref,
} from '@/lib/fashion/brand-material-passport-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type BrandMaterialPassportGoldenPathStepId =
  | 'rollup'
  | 'certs'
  | 'release'
  | 'checklist'
  | 'syndication';

type Props = {
  collectionId?: string;
  activeStep?: BrandMaterialPassportGoldenPathStepId;
};

const STEPS: { id: BrandMaterialPassportGoldenPathStepId; label: string }[] = [
  { id: 'rollup', label: 'Rollup' },
  { id: 'certs', label: 'Certs' },
  { id: 'release', label: 'Release' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'syndication', label: 'Syndication' },
];

export function BrandMaterialPassportGoldenPathStrip({ collectionId, activeStep }: Props) {
  const cid = collectionId?.trim() || 'SS27';

  const hrefFor = (id: BrandMaterialPassportGoldenPathStepId): string => {
    if (id === 'rollup') return brandMaterialPassportFeatureHref('rollup', cid);
    if (id === 'certs') return brandMaterialPassportFeatureHref('certs', cid);
    if (id === 'release') return brandMaterialPassportFeatureHref('release', cid);
    if (id === 'checklist') return brandMaterialPassportReleaseChecklistHref(cid);
    return brandMaterialPassportSyndicationHref(cid);
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-material-passport-golden-path-strip">
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
            data-testid={`brand-material-passport-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function brandMaterialPassportGoldenPathStepFromFeature(
  featureId: string | null | undefined
): BrandMaterialPassportGoldenPathStepId | undefined {
  if (featureId === 'rollup') return 'rollup';
  if (featureId === 'certs') return 'certs';
  if (featureId === 'release') return 'release';
  return undefined;
}
