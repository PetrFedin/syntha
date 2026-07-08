'use client';

import Link from 'next/link';
import {
  buildBrandRfqSupplierSession,
  type BrandRfqSupplierSession,
} from '@/lib/fashion/brand-rfq-supplier-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type BrandRfqSupplierGoldenPathStepId =
  | 'upstream'
  | 'rfq'
  | 'comms'
  | 'supplier-bom'
  | 'showroom';

type Props = {
  collectionId?: string;
  articleId?: string;
  orderId?: string;
  activeStep?: BrandRfqSupplierGoldenPathStepId;
};

const STEPS: { id: BrandRfqSupplierGoldenPathStepId; label: string }[] = [
  { id: 'upstream', label: 'Upstream' },
  { id: 'rfq', label: 'RFQ' },
  { id: 'comms', label: 'Comms' },
  { id: 'supplier-bom', label: 'Supplier BOM' },
  { id: 'showroom', label: 'Showroom' },
];

function hrefForStep(
  session: BrandRfqSupplierSession,
  id: BrandRfqSupplierGoldenPathStepId
): string {
  if (id === 'upstream') return session.upstreamHref;
  if (id === 'rfq') return session.rfqHref;
  if (id === 'comms') return session.commsHref;
  if (id === 'supplier-bom') return session.supplierBomHref;
  return session.shopShowroomHref;
}

export function BrandRfqSupplierGoldenPathStrip({
  collectionId,
  articleId,
  orderId,
  activeStep,
}: Props) {
  const session = buildBrandRfqSupplierSession({ collectionId, articleId, orderId });

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-rfq-supplier-golden-path-strip">
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
            data-testid={`brand-rfq-supplier-golden-${step.id}-link`}
          >
            {step.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function brandRfqSupplierGoldenPathStepFromFeature(
  featureId: string | null | undefined
): BrandRfqSupplierGoldenPathStepId | undefined {
  if (featureId === 'upstream') return 'upstream';
  if (featureId === 'rfq') return 'rfq';
  if (featureId === 'comms') return 'comms';
  return undefined;
}
