'use client';

import Link from 'next/link';
import { buildManufacturerProductionOpsSession } from '@/lib/production/manufacturer-production-ops';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type ManufacturerProductionOpsGoldenPathStepId =
  | 'orders'
  | 'wip'
  | 'cut-ticket'
  | 'handoff'
  | 'shop-tracking';

type Props = {
  factoryId?: string;
  orderId?: string;
  collectionId?: string;
  articleId?: string;
  activeStep?: ManufacturerProductionOpsGoldenPathStepId;
};

const STEPS: { id: ManufacturerProductionOpsGoldenPathStepId; label: string }[] = [
  { id: 'orders', label: 'Заказы' },
  { id: 'wip', label: 'Незавершёнка' },
  { id: 'cut-ticket', label: 'Техкарта раскроя' },
  { id: 'handoff', label: 'Передача' },
  { id: 'shop-tracking', label: 'Трекинг магазина' },
];

export function ManufacturerProductionOpsGoldenPathStrip({
  factoryId,
  orderId,
  collectionId,
  articleId,
  activeStep,
}: Props) {
  const session = buildManufacturerProductionOpsSession({
    factoryId,
    orderId,
    collectionId,
    articleId,
  });

  const hrefFor = (id: ManufacturerProductionOpsGoldenPathStepId): string => {
    if (id === 'orders') return session.ordersHref;
    if (id === 'wip') return session.wipHref;
    if (id === 'cut-ticket') return session.cutTicketHref;
    if (id === 'handoff') return session.handoffQueueHref;
    return session.shopTrackingHref;
  };

  return (
    <div
      className={hubGadget.goldenPath}
      data-testid="manufacturer-production-ops-golden-path-strip"
    >
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
            data-testid={`manufacturer-production-ops-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function manufacturerProductionOpsGoldenPathStepFromFeature(
  featureId: string | null | undefined
): ManufacturerProductionOpsGoldenPathStepId | undefined {
  if (featureId === 'orders') return 'orders';
  if (featureId === 'wip') return 'wip';
  if (featureId === 'cut-ticket') return 'cut-ticket';
  return undefined;
}
