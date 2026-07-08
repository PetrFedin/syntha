'use client';

import Link from 'next/link';
import { buildBrandInventoryOpsSession } from '@/lib/b2b/brand-inventory-ops';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

export type BrandInventoryOpsGoldenPathStepId =
  | 'overview'
  | 'balance'
  | 'count'
  | 'shop-reconcile'
  | 'shop-tracking';

type Props = {
  collectionId?: string;
  orderId?: string;
  activeStep?: BrandInventoryOpsGoldenPathStepId;
};

const STEPS: { id: BrandInventoryOpsGoldenPathStepId; label: string }[] = [
  { id: 'overview', label: 'Обзор' },
  { id: 'balance', label: 'Баланс' },
  { id: 'count', label: 'Пересчёт' },
  { id: 'shop-reconcile', label: 'Сверка магазина' },
  { id: 'shop-tracking', label: 'Трекинг магазина' },
];

export function BrandInventoryOpsGoldenPathStrip({ collectionId, orderId, activeStep }: Props) {
  const session = buildBrandInventoryOpsSession({ collectionId, orderId });

  const hrefFor = (id: BrandInventoryOpsGoldenPathStepId): string => {
    if (id === 'overview') return session.overviewHref;
    if (id === 'balance') return session.balanceHref;
    if (id === 'count') return session.countHref;
    if (id === 'shop-reconcile') return session.shopInventoryReconcileHref;
    return session.shopOrderCommsHref;
  };

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="brand-inventory-ops-golden-path-strip"
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
            data-testid={`brand-inventory-ops-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function brandInventoryOpsGoldenPathStepFromFeature(
  featureId: string | null | undefined
): BrandInventoryOpsGoldenPathStepId | undefined {
  if (featureId === 'overview') return 'overview';
  if (featureId === 'balance') return 'balance';
  if (featureId === 'count') return 'count';
  if (featureId === 'network') return undefined;
  return undefined;
}
