'use client';

import Link from 'next/link';
import { buildBrandSampleLifecycleWorkspaceSession } from '@/lib/fashion/brand-sample-lifecycle-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type BrandSampleLifecycleGoldenPathStepId =
  | 'hub'
  | 'rounds'
  | 'handoff'
  | 'factory-pack'
  | 'release'
  | 'shop-showroom';

type Props = {
  collectionId?: string;
  activeStep?: BrandSampleLifecycleGoldenPathStepId;
};

const STEPS: { id: BrandSampleLifecycleGoldenPathStepId; label: string }[] = [
  { id: 'hub', label: 'Хаб W2' },
  { id: 'rounds', label: 'Rounds' },
  { id: 'handoff', label: 'Передача' },
  { id: 'factory-pack', label: 'Фабричный пакет' },
  { id: 'release', label: 'Release' },
  { id: 'shop-showroom', label: 'Shop showroom' },
];

export function BrandSampleLifecycleGoldenPathStrip({ collectionId, activeStep }: Props) {
  const session = buildBrandSampleLifecycleWorkspaceSession({ collectionId });

  const hrefFor = (id: BrandSampleLifecycleGoldenPathStepId): string => {
    if (id === 'hub') return session.hubHref;
    if (id === 'rounds') return session.roundsHref;
    if (id === 'handoff') return session.handoffTabHref;
    if (id === 'factory-pack') return session.factoryPackHref;
    if (id === 'release') return session.releaseGateHref;
    return session.shopShowroomHref;
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-sample-lifecycle-golden-path-strip">
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
            data-testid={`brand-sample-lifecycle-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function brandSampleLifecycleGoldenPathStepFromFeature(
  featureId: string | null | undefined
): BrandSampleLifecycleGoldenPathStepId | undefined {
  if (featureId === 'hub') return 'hub';
  if (featureId === 'rounds') return 'rounds';
  if (featureId === 'handoff') return 'handoff';
  if (featureId === 'factory-pack') return 'factory-pack';
  return undefined;
}
