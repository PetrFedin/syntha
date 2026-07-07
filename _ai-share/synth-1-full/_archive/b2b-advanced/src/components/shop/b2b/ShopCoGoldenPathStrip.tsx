'use client';

import Link from 'next/link';
import {
  buildShopCoGoldenPathSession,
  SHOP_CO_GOLDEN_PATH_STEPS,
  WAVE_YK_SHOP_CO_GOLDEN_PATH_STRIP_TESTID,
  shopCoGoldenPathHrefForStep,
  type ShopCoGoldenPathStepId,
} from '@/lib/platform/wave-yk-shop-co-golden-path';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  orderId?: string;
  activeStep?: ShopCoGoldenPathStepId;
  omitStep?: ShopCoGoldenPathStepId;
  stripTestId?: string;
  className?: string;
  /** Preserve legacy link testids on specific surfaces (checkout/registry/detail). */
  legacyLinkTestIds?: Partial<Record<ShopCoGoldenPathStepId, string>>;
};

/** Единая CO golden path: матрица → оформление → пополнение → реестр → трекинг. */
export function ShopCoGoldenPathStrip({
  collectionId,
  orderId,
  activeStep,
  omitStep,
  stripTestId = WAVE_YK_SHOP_CO_GOLDEN_PATH_STRIP_TESTID,
  className,
  legacyLinkTestIds,
}: Props) {
  const session = buildShopCoGoldenPathSession({ collectionId, orderId });
  const steps = SHOP_CO_GOLDEN_PATH_STEPS.filter((step) => step.id !== omitStep);

  return (
    <div
      className={cn(
        hubGadget.goldenPath,
        hubCabinet.workspaceTableScroll,
        'max-md:flex-nowrap',
        className
      )}
      data-testid={stripTestId}
    >
      {steps.map((step, index) => (
        <span key={step.id} className="contents">
          {index > 0 ? (
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
          ) : null}
          <Link
            href={shopCoGoldenPathHrefForStep(session, step.id)}
            className={cn(hubGadget.goldenLink, activeStep === step.id && 'font-bold underline')}
            data-testid={legacyLinkTestIds?.[step.id] ?? step.linkTestId}
          >
            {step.labelRu}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function shopCoGoldenPathStepFromFeature(
  featureId: string | null | undefined
): ShopCoGoldenPathStepId | undefined {
  if (featureId === 'matrix') return 'matrix';
  if (featureId === 'checkout') return 'checkout';
  if (featureId === 'replenishment' || featureId === 'stock-atp' || featureId === 'rules') {
    return 'replenishment';
  }
  if (featureId === 'registry') return 'registry';
  if (featureId === 'tracking') return 'tracking';
  return undefined;
}
