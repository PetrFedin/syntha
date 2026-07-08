'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { factoryHandoffQueueHrefForDemo } from '@/lib/platform-core-hub-matrix';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-hub-matrix';
import { formatWholesaleOrderDisplayId } from '@/lib/integrations/spine/integration-ui-utils';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  demo: PlatformCoreDemoContext;
  orderId?: string;
  productionOrderId?: string | null;
  expectedPoDateIso?: string | null;
};

function formatExpectedPoDateRu(iso: string | null | undefined): string | null {
  const raw = iso?.trim();
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Supplier empty CO · read-only expected PO date from handoff queue PG. */
export function SupEmptyCoExpectedPoDateStrip({
  demo,
  orderId,
  productionOrderId,
  expectedPoDateIso,
}: Props) {
  const displayOrderId = orderId?.trim() ?? '';
  const dateRu = formatExpectedPoDateRu(expectedPoDateIso);
  const handoffHref = factoryHandoffQueueHrefForDemo({
    ...demo,
    demoOrderId: displayOrderId || demo.demoOrderId,
  });

  return (
    <div
      className="border-border-subtle flex flex-wrap items-center gap-2 rounded-md border border-blue-200/50 bg-blue-50/30 px-3 py-2 text-xs"
      data-testid="sup-empty-co-expected-po-date-strip"
    >
      <Badge variant="outline" className="border-blue-300 text-[9px] text-blue-900">
        Ожидаемая дата PO
      </Badge>
      {displayOrderId ? (
        <span className="font-mono text-[10px]">
          {formatWholesaleOrderDisplayId(displayOrderId)}
        </span>
      ) : null}
      {productionOrderId ? (
        <span className="text-text-muted text-[10px]">· PO {productionOrderId}</span>
      ) : null}
      {dateRu ? (
        <span
          className="text-text-primary font-medium"
          data-testid="sup-empty-co-expected-po-date-value"
        >
          {dateRu}
        </span>
      ) : (
        <span
          className="text-text-muted text-[11px]"
          data-testid="sup-empty-co-expected-po-date-empty"
        >
          Дата появится после передачи в очередь производства
        </span>
      )}
      <Link
        href={handoffHref}
        data-testid="sup-empty-co-expected-po-handoff-link"
        className={hubGadget.goldenLink}
      >
        Очередь передачи →
      </Link>
    </div>
  );
}
