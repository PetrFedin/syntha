'use client';

import Link from 'next/link';
import { buildBrandCommsWorkspaceSession } from '@/lib/fashion/brand-comms-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type BrandCommsGoldenPathStepId =
  | 'inbox'
  | 'entities'
  | 'order-chat'
  | 'order-handoff'
  | 'shop-tracking';

type Props = {
  collectionId?: string;
  orderId?: string;
  activeStep?: BrandCommsGoldenPathStepId;
};

const STEPS: { id: BrandCommsGoldenPathStepId; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'entities', label: 'Entities' },
  { id: 'order-chat', label: 'Чат заказа' },
  { id: 'order-handoff', label: 'Передача' },
  { id: 'shop-tracking', label: 'Трекинг магазина' },
];

export function BrandCommsWorkspaceGoldenPathStrip({ collectionId, orderId, activeStep }: Props) {
  const session = buildBrandCommsWorkspaceSession({ collectionId, orderId });

  const hrefFor = (id: BrandCommsGoldenPathStepId): string => {
    if (id === 'inbox') return session.inboxHref;
    if (id === 'entities') return session.entitiesHref;
    if (id === 'order-chat') return session.orderChatHref;
    if (id === 'order-handoff') return session.orderHandoffHref;
    return session.shopTrackingHref;
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-comms-workspace-golden-path-strip">
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
            data-testid={`brand-comms-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function brandCommsGoldenPathStepFromFeature(
  featureId: string | null | undefined
): BrandCommsGoldenPathStepId | undefined {
  if (featureId === 'inbox') return 'inbox';
  if (featureId === 'entities') return 'entities';
  return undefined;
}
