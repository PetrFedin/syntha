'use client';

import Link from 'next/link';
import { buildShopOrderCommsSession } from '@/lib/b2b/shop-order-comms';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type ShopOrderCommsGoldenPathStepId =
  | 'tracking'
  | 'chat'
  | 'calendar'
  | 'matrix'
  | 'brand-handoff';

type Props = {
  orderId?: string;
  collectionId?: string;
  activeStep?: ShopOrderCommsGoldenPathStepId;
};

const STEPS: { id: ShopOrderCommsGoldenPathStepId; label: string }[] = [
  { id: 'tracking', label: 'Трекинг' },
  { id: 'chat', label: 'Чат' },
  { id: 'calendar', label: 'Календарь' },
  { id: 'matrix', label: 'Матрица' },
  { id: 'brand-handoff', label: 'Передача бренда' },
];

export function ShopOrderCommsGoldenPathStrip({ orderId, collectionId, activeStep }: Props) {
  const session = buildShopOrderCommsSession({ orderId, collectionId });

  const hrefFor = (id: ShopOrderCommsGoldenPathStepId): string => {
    if (id === 'tracking') return session.trackingHref;
    if (id === 'chat') return session.chatHref;
    if (id === 'calendar') return session.calendarHref;
    if (id === 'matrix') return session.matrixHref;
    return session.brandOrderHandoffHref;
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-order-comms-golden-path-strip">
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
            data-testid={`shop-order-comms-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function shopOrderCommsGoldenPathStepFromFeature(
  featureId: string | null | undefined
): ShopOrderCommsGoldenPathStepId | undefined {
  if (featureId === 'tracking') return 'tracking';
  if (featureId === 'chat') return 'chat';
  if (featureId === 'calendar') return 'calendar';
  return undefined;
}
