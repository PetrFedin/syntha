'use client';

import Link from 'next/link';
import { buildPlatformB2bPartnersSession } from '@/lib/platform-core-ports/b2b/platform-b2b-partners';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type PlatformB2bPartnersGoldenPathStepId =
  | 'directory'
  | 'shop-roster'
  | 'marketroom'
  | 'showroom'
  | 'matrix';

type Props = {
  collectionId?: string;
  activeStep?: PlatformB2bPartnersGoldenPathStepId;
};

const STEPS: { id: PlatformB2bPartnersGoldenPathStepId; label: string }[] = [
  { id: 'directory', label: 'Справочник' },
  { id: 'shop-roster', label: 'Сеть магазинов' },
  { id: 'marketroom', label: 'Маркетрум' },
  { id: 'showroom', label: 'Витрина' },
  { id: 'matrix', label: 'Матрица' },
];

export function PlatformB2bPartnersGoldenPathStrip({ collectionId, activeStep }: Props) {
  const session = buildPlatformB2bPartnersSession({ collectionId });

  const hrefFor = (id: PlatformB2bPartnersGoldenPathStepId): string => {
    if (id === 'directory') return session.directoryHref;
    if (id === 'shop-roster') return session.shopRosterHref;
    if (id === 'marketroom') return session.marketroomHref;
    if (id === 'showroom') return session.shopShowroomHref;
    return session.shopMatrixHref;
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="platform-b2b-partners-golden-path-strip">
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
            data-testid={`platform-b2b-partners-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function platformB2bPartnersGoldenPathStepFromFeature(
  featureId: string | null | undefined
): PlatformB2bPartnersGoldenPathStepId | undefined {
  if (featureId === 'directory') return 'directory';
  if (featureId === 'shop-roster') return 'shop-roster';
  if (featureId === 'marketroom') return 'marketroom';
  return undefined;
}
