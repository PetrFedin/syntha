'use client';

import Link from 'next/link';
import { buildPlatformB2bHubSession } from '@/lib/platform-core-ports/b2b/platform-b2b-hub';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type PlatformB2bHubGoldenPathStepId =
  | 'hub'
  | 'marketroom'
  | 'partners'
  | 'showroom'
  | 'matrix';

type Props = {
  collectionId?: string;
  activeStep?: PlatformB2bHubGoldenPathStepId;
};

const STEPS: { id: PlatformB2bHubGoldenPathStepId; label: string }[] = [
  { id: 'hub', label: 'Хаб' },
  { id: 'marketroom', label: 'Маркетрум' },
  { id: 'partners', label: 'Партнёры' },
  { id: 'showroom', label: 'Витрина' },
  { id: 'matrix', label: 'Матрица' },
];

export function PlatformB2bHubGoldenPathStrip({ collectionId, activeStep }: Props) {
  const session = buildPlatformB2bHubSession({ collectionId });

  const hrefFor = (id: PlatformB2bHubGoldenPathStepId): string => {
    if (id === 'hub') return session.hubHref;
    if (id === 'marketroom') return session.marketroomBridgeHref;
    if (id === 'partners') return session.partnersBridgeHref;
    if (id === 'showroom') return session.shopShowroomHref;
    return session.shopMatrixHref;
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="platform-b2b-hub-golden-path-strip">
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
            data-testid={`platform-b2b-hub-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function platformB2bHubGoldenPathStepFromFeature(
  featureId: string | null | undefined
): PlatformB2bHubGoldenPathStepId | undefined {
  if (featureId === 'hub') return 'hub';
  if (featureId === 'marketroom') return 'marketroom';
  if (featureId === 'partners') return 'partners';
  return undefined;
}
