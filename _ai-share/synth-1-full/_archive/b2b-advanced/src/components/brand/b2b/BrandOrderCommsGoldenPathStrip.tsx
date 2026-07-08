'use client';

import Link from 'next/link';
import { buildBrandOrderCommsSession } from '@/lib/b2b/brand-order-comms';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type BrandOrderCommsGoldenPathStepId =
  | 'registry'
  | 'detail'
  | 'chat'
  | 'handoff'
  | 'shop-matrix'
  | 'checkout'
  | 'shop-tracking'
  | 'factory-queue';

type Props = {
  orderId: string;
  collectionId?: string;
  activeStep?: BrandOrderCommsGoldenPathStepId;
};

const STEPS: { id: BrandOrderCommsGoldenPathStepId; label: string }[] = [
  { id: 'registry', label: 'Реестр' },
  { id: 'detail', label: 'Карточка' },
  { id: 'chat', label: 'Чат' },
  { id: 'handoff', label: 'Передача' },
  { id: 'shop-matrix', label: 'Матрица магазина' },
  { id: 'checkout', label: 'Оформление' },
  { id: 'shop-tracking', label: 'Трекинг магазина' },
  { id: 'factory-queue', label: 'Очередь цеха' },
];

export function BrandOrderCommsGoldenPathStrip({
  orderId,
  collectionId,
  activeStep,
}: Props) {
  const session = buildBrandOrderCommsSession({ orderId, collectionId });

  const hrefFor = (id: BrandOrderCommsGoldenPathStepId): string => {
    if (id === 'registry') return session.registryHref;
    if (id === 'detail') return session.detailHref;
    if (id === 'chat') return session.chatHref;
    if (id === 'handoff') return session.handoffHref;
    if (id === 'shop-matrix') return session.shopMatrixHref;
    if (id === 'checkout') return session.shopCheckoutHref;
    if (id === 'shop-tracking') return session.shopTrackingHref;
    return session.factoryQueueHref;
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-order-comms-golden-path-strip">
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
            data-testid={`brand-order-comms-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function brandOrderCommsGoldenPathStepFromFeature(
  featureId: string | null | undefined
): BrandOrderCommsGoldenPathStepId | undefined {
  if (featureId === 'detail') return 'detail';
  if (featureId === 'chat') return 'chat';
  if (featureId === 'handoff') return 'handoff';
  return undefined;
}
