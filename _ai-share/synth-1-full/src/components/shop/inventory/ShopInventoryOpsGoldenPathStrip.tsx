'use client';

import Link from 'next/link';
import { buildShopInventoryOpsSession } from '@/lib/b2b/shop-inventory-ops';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type ShopInventoryOpsGoldenPathStepId =
  | 'overview'
  | 'reconcile'
  | 'replenishment-atp'
  | 'matrix'
  | 'tracking';

type Props = {
  collectionId?: string;
  orderId?: string;
  activeStep?: ShopInventoryOpsGoldenPathStepId;
};

const STEPS: { id: ShopInventoryOpsGoldenPathStepId; label: string }[] = [
  { id: 'overview', label: 'Обзор' },
  { id: 'reconcile', label: 'Сверка' },
  { id: 'replenishment-atp', label: 'Пополнение · ATP' },
  { id: 'matrix', label: 'Матрица' },
  { id: 'tracking', label: 'Трекинг' },
];

export function ShopInventoryOpsGoldenPathStrip({
  collectionId,
  orderId,
  activeStep,
}: Props) {
  const session = buildShopInventoryOpsSession({ collectionId, orderId });

  const hrefFor = (id: ShopInventoryOpsGoldenPathStepId): string => {
    if (id === 'overview') return session.overviewHref;
    if (id === 'reconcile') return session.reconcileHref;
    if (id === 'replenishment-atp') return session.replenishmentAtpHref;
    if (id === 'matrix') return session.matrixHref;
    return session.orderCommsHref;
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-inventory-ops-golden-path-strip">
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
            data-testid={`shop-inventory-ops-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function shopInventoryOpsGoldenPathStepFromFeature(
  featureId: string | null | undefined
): ShopInventoryOpsGoldenPathStepId | undefined {
  if (featureId === 'overview') return 'overview';
  if (featureId === 'reconcile') return 'reconcile';
  return undefined;
}
