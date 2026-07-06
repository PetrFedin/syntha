'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  buildPlatformCoreShopCoGoldenPathSession,
  PLATFORM_CORE_SHOP_CO_GOLDEN_PATH_STEPS,
  platformCoreShopCoGoldenPathHrefForStep,
  type PlatformCoreShopCoGoldenPathStepId,
} from '@/lib/platform-core-shop-co-golden-path';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';

type Props = {
  collectionId: string;
  orderId?: string;
  activeStep?: PlatformCoreShopCoGoldenPathStepId;
  omitStep?: PlatformCoreShopCoGoldenPathStepId;
  stripTestId?: string;
  className?: string;
  legacyLinkTestIds?: Partial<Record<PlatformCoreShopCoGoldenPathStepId, string>>;
};

/** Native CO golden path — без импорта components/shop/b2b. */
export function PlatformCoreShopCoGoldenPathStrip({
  collectionId,
  orderId,
  activeStep,
  omitStep,
  stripTestId = 'shop-co-golden-path-strip',
  className,
  legacyLinkTestIds,
}: Props) {
  const session = buildPlatformCoreShopCoGoldenPathSession({ collectionId, orderId });
  const steps = PLATFORM_CORE_SHOP_CO_GOLDEN_PATH_STEPS.filter((step) => step.id !== omitStep);

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
            href={platformCoreShopCoGoldenPathHrefForStep(session, step.id)}
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

export { shopCoGoldenPathStepFromFeature } from '@/lib/platform-core-shop-co-golden-path';
