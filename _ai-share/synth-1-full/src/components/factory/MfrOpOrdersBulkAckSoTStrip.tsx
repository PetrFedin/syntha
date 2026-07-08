'use client';

import Link from 'next/link';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  handoffQueueHref: string;
  pendingCount: number;
};

/** Core: bulk-ack только в очереди передачи — без дубля на /production/orders. */
export function MfrOpOrdersBulkAckSoTStrip({ handoffQueueHref, pendingCount }: Props) {
  if (pendingCount <= 0) return null;
  return (
    <p className={hubGadget.muted} data-testid="factory-production-orders-bulk-sot-strip">
      Ожидают приёмки: {pendingCount}.{' '}
      <Link
        href={handoffQueueHref}
        className={hubGadget.goldenLink}
        data-testid="factory-production-orders-bulk-sot-handoff-link"
      >
        Очередь передачи
      </Link>
    </p>
  );
}
