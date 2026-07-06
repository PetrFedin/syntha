'use client';

import Link from 'next/link';
import { buildShopWorkingOrderSession } from '@/lib/b2b/shop-working-order-session';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type ShopWorkingOrderGoldenPathStepId = 'versions' | 'bulk' | 'handoff';

type Props = {
  wholesaleOrderId: string;
  collectionId?: string;
  activeStep?: ShopWorkingOrderGoldenPathStepId;
};

const STEPS: { id: ShopWorkingOrderGoldenPathStepId; label: string }[] = [
  { id: 'versions', label: 'Версии' },
  { id: 'bulk', label: 'Опт' },
  { id: 'handoff', label: 'Передача' },
];

export function ShopWorkingOrderGoldenPathStrip({
  wholesaleOrderId,
  collectionId,
  activeStep,
}: Props) {
  const session = buildShopWorkingOrderSession({ wholesaleOrderId, collectionId });

  const hrefFor = (id: ShopWorkingOrderGoldenPathStepId): string => {
    if (id === 'versions') return session.versionsHref;
    if (id === 'bulk') return session.bulkHref;
    return session.handoffHref;
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-working-order-golden-path-strip">
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
            data-testid={`shop-working-order-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function shopWorkingOrderGoldenPathStepFromFeature(
  featureId: string | null | undefined
): ShopWorkingOrderGoldenPathStepId | undefined {
  if (featureId === 'versions') return 'versions';
  if (featureId === 'bulk') return 'bulk';
  if (featureId === 'handoff') return 'handoff';
  return undefined;
}
