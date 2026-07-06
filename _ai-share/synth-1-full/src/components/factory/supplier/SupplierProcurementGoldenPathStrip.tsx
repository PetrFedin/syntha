'use client';

import Link from 'next/link';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type SupplierProcurementGoldenPathStepId =
  | 'bom'
  | 'forecast'
  | 'supply'
  | 'handoff'
  | 'shop-tracking';

type Props = {
  collectionId?: string;
  articleId?: string;
  orderId?: string;
  factoryId?: string;
  activeStep?: SupplierProcurementGoldenPathStepId;
};

const STEPS: { id: SupplierProcurementGoldenPathStepId; label: string }[] = [
  { id: 'bom', label: 'BOM' },
  { id: 'forecast', label: 'Прогноз' },
  { id: 'supply', label: 'Поставка' },
  { id: 'handoff', label: 'Передача' },
  { id: 'shop-tracking', label: 'Трекинг магазина' },
];

export function SupplierProcurementGoldenPathStrip({
  collectionId,
  articleId,
  orderId,
  factoryId,
  activeStep,
}: Props) {
  const session = buildSupplierProcurementSession({ collectionId, articleId, orderId, factoryId });

  const hrefFor = (id: SupplierProcurementGoldenPathStepId): string => {
    if (id === 'bom') return session.bomHref;
    if (id === 'forecast') return session.forecastHref;
    if (id === 'supply') return session.supplyHref;
    if (id === 'handoff') return session.handoffHref;
    return session.shopTrackingHref;
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="supplier-procurement-golden-path-strip">
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
            data-testid={`supplier-procurement-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function supplierProcurementGoldenPathStepFromFeature(
  featureId: string | null | undefined
): SupplierProcurementGoldenPathStepId | undefined {
  if (featureId === 'bom') return 'bom';
  if (featureId === 'forecast') return 'forecast';
  if (featureId === 'supply') return 'supply';
  return undefined;
}
