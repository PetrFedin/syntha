'use client';

import Link from 'next/link';
import {
  brandAgentRepLedgerHref,
  brandAgentRepShopPortalHref,
} from '@/lib/fashion/brand-agent-rep-oversight';
import { buildShopAgentRepSession } from '@/lib/b2b/shop-agent-rep';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { ROUTES } from '@/lib/routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type BrandAgentRepGoldenPathStepId = 'ledger' | 'reps' | 'shop-portal' | 'shop-matrix';

type Props = {
  activeStep?: BrandAgentRepGoldenPathStepId;
};

const STEPS: { id: BrandAgentRepGoldenPathStepId; label: string }[] = [
  { id: 'ledger', label: 'Ledger' },
  { id: 'reps', label: 'Reps' },
  { id: 'shop-portal', label: 'Shop portal' },
  { id: 'shop-matrix', label: 'Shop matrix' },
];

export function BrandAgentRepGoldenPathStrip({ activeStep }: Props) {
  const shopSession = buildShopAgentRepSession();

  const hrefFor = (id: BrandAgentRepGoldenPathStepId): string => {
    if (id === 'ledger') return brandAgentRepLedgerHref();
    if (id === 'reps') {
      return `${ROUTES.brand.distributor.commissions}?${PILLAR_CAPABILITY_FEATURE_PARAM}=reps`;
    }
    if (id === 'shop-portal') return brandAgentRepShopPortalHref();
    return shopSession.matrixHref;
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-agent-rep-golden-path-strip">
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
            data-testid={`brand-agent-rep-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function brandAgentRepGoldenPathStepFromFeature(
  featureId: string | null | undefined
): BrandAgentRepGoldenPathStepId | undefined {
  if (featureId === 'ledger') return 'ledger';
  if (featureId === 'reps') return 'reps';
  if (featureId === 'shop-portal') return 'shop-portal';
  return undefined;
}
