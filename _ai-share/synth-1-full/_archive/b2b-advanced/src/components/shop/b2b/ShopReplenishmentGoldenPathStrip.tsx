'use client';

import Link from 'next/link';
import { buildShopReplenishmentSession } from '@/lib/b2b/shop-replenishment-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type ShopReplenishmentGoldenPathStepId =
  | 'alerts'
  | 'stock-atp'
  | 'rules'
  | 'supplier-forecast';

type Props = {
  collectionId?: string;
  orderId?: string;
  activeStep?: ShopReplenishmentGoldenPathStepId;
};

const STEPS: { id: ShopReplenishmentGoldenPathStepId; label: string }[] = [
  { id: 'alerts', label: 'Оповещения' },
  { id: 'stock-atp', label: 'Склад · ATP' },
  { id: 'rules', label: 'Правила' },
  { id: 'supplier-forecast', label: 'Прогноз поставщика' },
];

export function ShopReplenishmentGoldenPathStrip({
  collectionId,
  orderId,
  activeStep,
}: Props) {
  const session = buildShopReplenishmentSession({ collectionId, orderId });

  const hrefFor = (id: ShopReplenishmentGoldenPathStepId): string => {
    if (id === 'alerts') return session.alertsHref;
    if (id === 'stock-atp') return session.stockAtpHref;
    if (id === 'rules') return session.rulesHref;
    return session.supplierForecastHref;
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-replenishment-golden-path-strip">
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
            data-testid={`shop-replenishment-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function shopReplenishmentGoldenPathStepFromFeature(
  featureId: string | null | undefined
): ShopReplenishmentGoldenPathStepId | undefined {
  if (featureId === 'alerts') return 'alerts';
  if (featureId === 'stock-atp') return 'stock-atp';
  if (featureId === 'rules') return 'rules';
  return undefined;
}
