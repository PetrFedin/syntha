'use client';

import Link from 'next/link';
import {
  buildBrandSupplierBomSession,
  type BrandSupplierBomSession,
} from '@/lib/fashion/brand-supplier-bom-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type BrandSupplierBomGoldenPathStepId =
  | 'bom'
  | 'procurement'
  | 'centric-rfq'
  | 'material-passport'
  | 'supplier-forecast';

type Props = {
  collectionId?: string;
  articleId?: string;
  activeStep?: BrandSupplierBomGoldenPathStepId;
};

const STEPS: { id: BrandSupplierBomGoldenPathStepId; label: string }[] = [
  { id: 'bom', label: 'BOM' },
  { id: 'procurement', label: 'Procurement' },
  { id: 'centric-rfq', label: 'Centric RFQ' },
  { id: 'material-passport', label: 'Material passport' },
  { id: 'supplier-forecast', label: 'Supplier forecast' },
];

function hrefForStep(
  session: BrandSupplierBomSession,
  id: BrandSupplierBomGoldenPathStepId
): string {
  if (id === 'bom') return session.bomHref;
  if (id === 'procurement') return session.procurementHref;
  if (id === 'centric-rfq') return session.centricRfqHref;
  if (id === 'material-passport') return session.materialPassportHref;
  return session.supplierForecastHref;
}

export function BrandSupplierBomGoldenPathStrip({ collectionId, articleId, activeStep }: Props) {
  const session = buildBrandSupplierBomSession({ collectionId, articleId });

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-supplier-bom-golden-path-strip">
      {STEPS.map((step, index) => (
        <span key={step.id} className="contents">
          {index > 0 ? (
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
          ) : null}
          <Link
            href={hrefForStep(session, step.id)}
            className={cn(hubGadget.goldenLink, activeStep === step.id && 'font-bold underline')}
            data-testid={`brand-supplier-bom-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function brandSupplierBomGoldenPathStepFromFeature(
  featureId: string | null | undefined
): BrandSupplierBomGoldenPathStepId | undefined {
  if (featureId === 'bom') return 'bom';
  if (featureId === 'procurement') return 'procurement';
  return undefined;
}
