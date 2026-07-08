'use client';

import Link from 'next/link';
import { buildPlatformB2bMarketroomSession } from '@/lib/platform-core-ports/b2b/platform-b2b-marketroom';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type PlatformB2bMarketroomGoldenPathStepId =
  | 'showcase'
  | 'discover'
  | 'buy-path'
  | 'matrix'
  | 'tracking';

type Props = {
  collectionId?: string;
  orderId?: string;
  activeStep?: PlatformB2bMarketroomGoldenPathStepId;
};

const STEPS: { id: PlatformB2bMarketroomGoldenPathStepId; label: string }[] = [
  { id: 'showcase', label: 'Витрина B2B' },
  { id: 'discover', label: 'Подбор' },
  { id: 'buy-path', label: 'Путь заказа' },
  { id: 'matrix', label: 'Матрица' },
  { id: 'tracking', label: 'Трекинг' },
];

export function PlatformB2bMarketroomGoldenPathStrip({ collectionId, orderId, activeStep }: Props) {
  const session = buildPlatformB2bMarketroomSession({ collectionId, orderId });

  const hrefFor = (id: PlatformB2bMarketroomGoldenPathStepId): string => {
    if (id === 'showcase') return session.showcaseHref;
    if (id === 'discover') return session.discoverHref;
    if (id === 'buy-path') return session.buyPathHref;
    if (id === 'matrix') return session.shopMatrixHref;
    return session.shopOrderCommsHref;
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="platform-b2b-marketroom-golden-path-strip">
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
            data-testid={`platform-b2b-marketroom-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function platformB2bMarketroomGoldenPathStepFromFeature(
  featureId: string | null | undefined
): PlatformB2bMarketroomGoldenPathStepId | undefined {
  if (featureId === 'showcase') return 'showcase';
  if (featureId === 'discover') return 'discover';
  if (featureId === 'buy-path') return 'buy-path';
  return undefined;
}
