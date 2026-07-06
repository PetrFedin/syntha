'use client';

import Link from 'next/link';
import { buildManufacturerCommsWorkspaceSession } from '@/lib/fashion/manufacturer-comms-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type ManufacturerCommsGoldenPathStepId =
  | 'inbox'
  | 'entities'
  | 'order'
  | 'handoff'
  | 'shop-tracking';

type Props = {
  collectionId?: string;
  orderId?: string;
  factoryId?: string;
  activeStep?: ManufacturerCommsGoldenPathStepId;
};

const STEPS: { id: ManufacturerCommsGoldenPathStepId; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'entities', label: 'Entities' },
  { id: 'order', label: 'Order' },
  { id: 'handoff', label: 'Передача' },
  { id: 'shop-tracking', label: 'Трекинг магазина' },
];

export function ManufacturerCommsWorkspaceGoldenPathStrip({
  collectionId,
  orderId,
  factoryId,
  activeStep,
}: Props) {
  const session = buildManufacturerCommsWorkspaceSession({ collectionId, orderId, factoryId });

  const hrefFor = (id: ManufacturerCommsGoldenPathStepId): string => {
    if (id === 'inbox') return session.inboxHref;
    if (id === 'entities') return session.entitiesHref;
    if (id === 'order') return session.orderTabHref;
    if (id === 'handoff') return session.handoffHref;
    return session.shopTrackingHref;
  };

  return (
    <div
      className={hubGadget.goldenPath}
      data-testid="manufacturer-comms-workspace-golden-path-strip"
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
            data-testid={`manufacturer-comms-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function manufacturerCommsGoldenPathStepFromFeature(
  featureId: string | null | undefined
): ManufacturerCommsGoldenPathStepId | undefined {
  if (featureId === 'inbox') return 'inbox';
  if (featureId === 'entities') return 'entities';
  if (featureId === 'order') return 'order';
  return undefined;
}
