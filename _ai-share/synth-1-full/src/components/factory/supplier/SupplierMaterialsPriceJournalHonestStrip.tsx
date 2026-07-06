'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';
import { ROUTES } from '@/lib/routes';
import { WORKSHOP2_COL_PARAM } from '@/lib/production/workshop2-url';

type Props = {
  collectionId: string;
  articleId: string;
  orderId?: string;
  hasUnitCostFallback?: boolean;
};

/** Honest empty price journal — PG events absent, peer links to RFQ and brand BOM. */
export function SupplierMaterialsPriceJournalHonestStrip({
  collectionId,
  articleId,
  orderId,
  hasUnitCostFallback,
}: Props) {
  const session = buildSupplierProcurementSession({ collectionId, articleId, orderId });
  const brandBomHref = `${ROUTES.brand.productionWorkshop2}?${WORKSHOP2_COL_PARAM}=${encodeURIComponent(collectionId)}&article=${encodeURIComponent(articleId)}#bom`;

  return (
    <div
      className="border-border-subtle flex flex-wrap items-center gap-2 rounded-md border border-amber-200/60 bg-amber-50/50 px-3 py-2 text-xs text-amber-950"
      data-testid="sup-dev-materials-price-journal-honest-strip"
    >
      <Badge variant="outline" className="border-amber-300 text-[9px]">
        Журнал цен
      </Badge>
      <span>
        {hasUnitCostFallback
          ? 'В PG нет dossier_events с ценами — показан fallback из unitCostNet BOM.'
          : 'Журнал пуст: нет price events в PG и unitCostNet в BOM.'}
      </span>
      <Link
        href={session.rfqHref}
        data-testid="sup-dev-materials-price-rfq-link"
        className="font-medium text-amber-900 underline"
      >
        RFQ →
      </Link>
      <Link
        href={brandBomHref}
        data-testid="sup-dev-materials-price-brand-bom-link"
        className="font-medium text-amber-900 underline"
      >
        BOM бренда →
      </Link>
      <Link
        href={session.entitiesHref}
        data-testid="sup-dev-materials-price-comms-link"
        className="font-medium text-amber-900 underline"
      >
        Связь · котировка →
      </Link>
    </div>
  );
}
