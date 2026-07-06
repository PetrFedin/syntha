'use client';

import Link from 'next/link';
import { buildShopShowroomBuySession } from '@/lib/b2b/shop-showroom-buy';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type ShopShowroomBuyGoldenPathStepId =
  | 'showroom'
  | 'matrix'
  | 'checkout'
  | 'registry'
  | 'tracking';

type Props = {
  collectionId?: string;
  orderId?: string;
  activeStep?: ShopShowroomBuyGoldenPathStepId;
};

const STEPS: { id: ShopShowroomBuyGoldenPathStepId; label: string }[] = [
  { id: 'showroom', label: 'Шоурум' },
  { id: 'matrix', label: 'Матрица' },
  { id: 'checkout', label: 'Оформление' },
  { id: 'registry', label: 'Реестр' },
  { id: 'tracking', label: 'Трекинг' },
];

export function ShopShowroomBuyGoldenPathStrip({ collectionId, orderId, activeStep }: Props) {
  const session = buildShopShowroomBuySession({ collectionId, orderId });

  const hrefFor = (id: ShopShowroomBuyGoldenPathStepId): string => {
    if (id === 'showroom') return session.showroomHref;
    if (id === 'matrix') return session.matrixHref;
    if (id === 'checkout') return session.checkoutHref;
    if (id === 'registry') return session.registryHref;
    return session.trackingHref;
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-showroom-buy-golden-path-strip">
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
            data-testid={`shop-showroom-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function shopShowroomBuyGoldenPathStepFromFeature(
  featureId: string | null | undefined
): ShopShowroomBuyGoldenPathStepId | undefined {
  if (featureId === 'showroom') return 'showroom';
  if (featureId === 'linesheet') return 'showroom';
  if (featureId === 'buy') return 'checkout';
  if (featureId === '3d-stream') return 'showroom';
  return undefined;
}
