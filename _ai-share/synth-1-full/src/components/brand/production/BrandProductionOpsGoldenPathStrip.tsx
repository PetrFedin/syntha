'use client';

import Link from 'next/link';
import { buildBrandProductionOpsSession } from '@/lib/brand-production/brand-production-ops-session';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type BrandProductionOpsGoldenPathStepId =
  | 'operations'
  | 'handoff'
  | 'cut-ticket'
  | 'qc-gate'
  | 'factory-queue';

type Props = {
  orderId?: string;
  collectionId?: string;
  factoryId?: string;
  articleId?: string;
  activeStep?: BrandProductionOpsGoldenPathStepId;
};

const STEPS: { id: BrandProductionOpsGoldenPathStepId; label: string }[] = [
  { id: 'operations', label: 'Операции' },
  { id: 'handoff', label: 'Передача' },
  { id: 'cut-ticket', label: 'Техкарта раскроя' },
  { id: 'qc-gate', label: 'Гейт КК' },
  { id: 'factory-queue', label: 'Очередь цеха' },
];

export function BrandProductionOpsGoldenPathStrip({
  orderId,
  collectionId,
  factoryId,
  articleId,
  activeStep,
}: Props) {
  const session = buildBrandProductionOpsSession({ orderId, collectionId, factoryId, articleId });

  const hrefFor = (id: BrandProductionOpsGoldenPathStepId): string => {
    if (id === 'operations') return session.operationsTabHref;
    if (id === 'handoff') return session.handoffTabHref;
    if (id === 'cut-ticket') return session.cutTicketTabHref;
    if (id === 'qc-gate') return session.qcGateTabHref;
    return session.factoryQueueHref;
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-production-ops-golden-path-strip">
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
            data-testid={`brand-production-ops-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function brandProductionOpsGoldenPathStepFromFeature(
  featureId: string | null | undefined
): BrandProductionOpsGoldenPathStepId | undefined {
  if (featureId === 'operations') return 'operations';
  if (featureId === 'handoff') return 'handoff';
  if (featureId === 'cut-ticket') return 'cut-ticket';
  if (featureId === 'qc-gate') return 'qc-gate';
  return undefined;
}
