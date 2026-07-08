'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';

type Props = {
  collectionId: string;
  articleId: string;
  orderId?: string;
};

/** Honest SLA: RFQ/price quote → chat thread + entity inbox (не silent stub). */
export function SupplierProcurementSlaResponseStrip({ collectionId, articleId, orderId }: Props) {
  const session = buildSupplierProcurementSession({ collectionId, articleId, orderId });

  return (
    <div
      className="border-border-subtle bg-bg-surface2/60 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-xs"
      data-testid="sup-dev-sla-response-strip"
    >
      <Badge variant="outline" className="text-[9px] uppercase">
        SLA 48h
      </Badge>
      <span className="text-text-secondary">
        Ответ на RFQ/цену → чат артикула + bump в entity threads.
      </span>
      <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
        <Link href={session.entitiesHref} data-testid="sup-dev-sla-entities-link">
          Треды сущностей
        </Link>
      </Button>
      <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
        <Link href={session.rfqHref} data-testid="sup-dev-sla-rfq-link">
          RFQ tab
        </Link>
      </Button>
    </div>
  );
}
