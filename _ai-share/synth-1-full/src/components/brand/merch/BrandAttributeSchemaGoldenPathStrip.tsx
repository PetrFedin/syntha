'use client';

import Link from 'next/link';
import {
  brandAttributeSchemaFeatureHref,
  brandAttributeSchemaMaterialPassportHref,
  brandAttributeSchemaReleaseChecklistHref,
} from '@/lib/fashion/brand-attribute-schema-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type BrandAttributeSchemaGoldenPathStepId =
  | 'health'
  | 'schemas'
  | 'size-chart'
  | 'material-rollup'
  | 'release-checklist';

type Props = {
  collectionId?: string;
  activeStep?: BrandAttributeSchemaGoldenPathStepId;
};

const STEPS: { id: BrandAttributeSchemaGoldenPathStepId; label: string }[] = [
  { id: 'health', label: 'Health' },
  { id: 'schemas', label: 'Schemas' },
  { id: 'size-chart', label: 'Size chart' },
  { id: 'material-rollup', label: 'Material rollup' },
  { id: 'release-checklist', label: 'Release checklist' },
];

export function BrandAttributeSchemaGoldenPathStrip({ collectionId, activeStep }: Props) {
  const cid = collectionId?.trim() || 'SS27';

  const hrefFor = (id: BrandAttributeSchemaGoldenPathStepId): string => {
    if (id === 'health') return brandAttributeSchemaFeatureHref('health', cid);
    if (id === 'schemas') return brandAttributeSchemaFeatureHref('schemas', cid);
    if (id === 'size-chart') return brandAttributeSchemaFeatureHref('size-chart', cid);
    if (id === 'material-rollup') return brandAttributeSchemaMaterialPassportHref(cid);
    return brandAttributeSchemaReleaseChecklistHref(cid);
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-attribute-schema-golden-path-strip">
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
            data-testid={`brand-attribute-schema-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function brandAttributeSchemaGoldenPathStepFromFeature(
  featureId: string | null | undefined
): BrandAttributeSchemaGoldenPathStepId | undefined {
  if (featureId === 'health') return 'health';
  if (featureId === 'schemas') return 'schemas';
  if (featureId === 'size-chart') return 'size-chart';
  return undefined;
}
