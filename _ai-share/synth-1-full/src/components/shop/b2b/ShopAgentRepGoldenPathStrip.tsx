'use client';

import Link from 'next/link';
import { buildShopAgentRepSession } from '@/lib/b2b/shop-agent-rep';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { ROUTES } from '@/lib/routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type ShopAgentRepGoldenPathStepId =
  | 'portal'
  | 'commission'
  | 'matrix'
  | 'checkout'
  | 'tracking'
  | 'brand-ledger';

type Props = {
  collectionId?: string;
  orderId?: string;
  repId?: string;
  activeStep?: ShopAgentRepGoldenPathStepId;
};

const STEPS: { id: ShopAgentRepGoldenPathStepId; label: string }[] = [
  { id: 'portal', label: 'Портал' },
  { id: 'commission', label: 'Комиссия' },
  { id: 'matrix', label: 'Матрица' },
  { id: 'checkout', label: 'Оформление' },
  { id: 'tracking', label: 'Трекинг' },
  { id: 'brand-ledger', label: 'Леджер бренда' },
];

export function ShopAgentRepGoldenPathStrip({
  collectionId,
  orderId,
  repId,
  activeStep,
}: Props) {
  const session = buildShopAgentRepSession({ collectionId, orderId, repId });
  const matrixTabHref = `${ROUTES.shop.b2bSalesRepPortal}?${PILLAR_CAPABILITY_FEATURE_PARAM}=matrix`;

  const hrefFor = (id: ShopAgentRepGoldenPathStepId): string => {
    if (id === 'portal') return session.portalTabHref;
    if (id === 'commission') return session.commissionTabHref;
    if (id === 'matrix') return matrixTabHref;
    if (id === 'checkout') return session.checkoutHref;
    if (id === 'tracking') return session.trackingHref;
    return session.brandLedgerHref;
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-agent-rep-golden-path-strip">
      {STEPS.map((step, index) => (
        <span key={step.id} className="contents">
          {index > 0 ? (
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
          ) : null}
          <Link
            href={hrefFor(step.id)}
            className={cn(
              hubGadget.goldenLink,
              activeStep === step.id && 'font-bold underline'
            )}
            data-testid={`shop-agent-rep-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function shopAgentRepGoldenPathStepFromFeature(
  featureId: string | null | undefined
): ShopAgentRepGoldenPathStepId | undefined {
  if (featureId === 'portal') return 'portal';
  if (featureId === 'commission') return 'commission';
  if (featureId === 'matrix') return 'matrix';
  return undefined;
}
