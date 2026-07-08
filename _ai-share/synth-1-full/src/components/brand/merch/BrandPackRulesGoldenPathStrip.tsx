'use client';

import Link from 'next/link';
import { buildBrandPackRulesSession } from '@/lib/fashion/brand-pack-rules-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type BrandPackRulesGoldenPathStepId =
  | 'rules'
  | 'curve'
  | 'shop-prepack'
  | 'matrix-prepack'
  | 'checkout'
  | 'size-chart';

type Props = {
  collectionId?: string;
  orderId?: string;
  activeStep?: BrandPackRulesGoldenPathStepId;
};

const STEPS: { id: BrandPackRulesGoldenPathStepId; label: string }[] = [
  { id: 'rules', label: 'Rules' },
  { id: 'curve', label: 'Curve' },
  { id: 'shop-prepack', label: 'Shop prepack' },
  { id: 'matrix-prepack', label: 'Matrix prepack' },
  { id: 'checkout', label: 'Checkout' },
  { id: 'size-chart', label: 'Size chart' },
];

export function BrandPackRulesGoldenPathStrip({ collectionId, orderId, activeStep }: Props) {
  const session = buildBrandPackRulesSession({ collectionId, orderId });

  const hrefFor = (id: BrandPackRulesGoldenPathStepId): string => {
    if (id === 'rules') return session.rulesHref;
    if (id === 'curve') return session.curveHref;
    if (id === 'shop-prepack') return session.shopPrepackHref;
    if (id === 'matrix-prepack') return session.shopMatrixPrepackHref;
    if (id === 'checkout') return session.shopCheckoutHref;
    return session.sizeChartHref;
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-pack-rules-golden-path-strip">
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
            data-testid={`brand-pack-rules-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function brandPackRulesGoldenPathStepFromFeature(
  featureId: string | null | undefined
): BrandPackRulesGoldenPathStepId | undefined {
  if (featureId === 'rules') return 'rules';
  if (featureId === 'curve') return 'curve';
  if (featureId === 'shop-prepack') return 'shop-prepack';
  return undefined;
}
