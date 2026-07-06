'use client';

import Link from 'next/link';
import {
  buildManufacturerHandoffQueueSession,
  manufacturerHandoffFeatureHref,
} from '@/lib/production/manufacturer-handoff-queue';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type ManufacturerHandoffGoldenPathStepId =
  | 'handoff'
  | 'qc-gate'
  | 'techpack-ack'
  | 'brand-handoff'
  | 'shop-tracking';

type Props = {
  factoryId?: string;
  orderId?: string;
  collectionId?: string;
  articleId?: string;
  activeStep?: ManufacturerHandoffGoldenPathStepId;
};

const STEPS: { id: ManufacturerHandoffGoldenPathStepId; label: string }[] = [
  { id: 'handoff', label: 'Передача' },
  { id: 'qc-gate', label: 'Контроль качества' },
  { id: 'techpack-ack', label: 'Подтверждение ТЗ' },
  { id: 'brand-handoff', label: 'Передача бренда' },
  { id: 'shop-tracking', label: 'Трекинг магазина' },
];

export function ManufacturerHandoffQueueGoldenPathStrip({
  factoryId,
  orderId,
  collectionId,
  articleId,
  activeStep,
}: Props) {
  const session = buildManufacturerHandoffQueueSession({ factoryId, orderId, collectionId });
  const opts = { factoryId, orderId, collectionId, articleId };

  const hrefFor = (id: ManufacturerHandoffGoldenPathStepId): string => {
    if (id === 'handoff') return session.handoffHref;
    if (id === 'qc-gate') return manufacturerHandoffFeatureHref('qc-gate', opts);
    if (id === 'techpack-ack') return manufacturerHandoffFeatureHref('techpack-ack', opts);
    if (id === 'brand-handoff') return session.brandHandoffHref;
    return session.shopTrackingHref;
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="manufacturer-handoff-queue-golden-path-strip">
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
            data-testid={`manufacturer-handoff-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function manufacturerHandoffGoldenPathStepFromFeature(
  featureId: string | null | undefined
): ManufacturerHandoffGoldenPathStepId | undefined {
  if (featureId === 'handoff') return 'handoff';
  if (featureId === 'qc-gate') return 'qc-gate';
  if (featureId === 'techpack-ack') return 'techpack-ack';
  return undefined;
}
