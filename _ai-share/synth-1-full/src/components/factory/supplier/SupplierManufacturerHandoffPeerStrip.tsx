'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFactoryHandoffQueueSse } from '@/hooks/use-factory-handoff-queue-sse';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';

type Props = {
  factoryId: string;
  collectionId: string;
  orderId?: string;
};

/** Peer: закупки поставщика → очередь передачи производства (SSE + poll). */
export function SupplierManufacturerHandoffPeerStrip({
  factoryId,
  collectionId,
  orderId,
}: Props) {
  const { sseConnected } = useFactoryHandoffQueueSse(factoryId, true);
  const handoffHref = manufacturerHandoffFeatureHref('handoff', {
    factoryId,
    collectionId,
    orderId,
  });

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-md border border-sky-200/50 bg-sky-50/40 px-3 py-2 text-xs"
      data-testid="supplier-manufacturer-handoff-peer-strip"
    >
      <Badge variant="outline" className="border-sky-300 text-[9px] text-sky-800">
        Peer · производство
      </Badge>
      <span className="text-text-secondary">
        Очередь передачи цеха — материалы под PO после подтверждения бренда.
      </span>
      <Badge
        variant="outline"
        className="text-[9px]"
        data-testid={`supplier-handoff-peer-sse-${sseConnected ? 'live' : 'poll'}`}
      >
        {sseConnected ? 'SSE в эфире' : 'резервный poll'}
      </Badge>
      <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
        <Link href={handoffHref} data-testid="supplier-handoff-peer-queue-link">
          Очередь передачи
        </Link>
      </Button>
      <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
        <Link
          href={manufacturerHandoffFeatureHref('techpack-ack', {
            factoryId,
            collectionId,
            orderId,
          })}
          data-testid="supplier-handoff-peer-factory-ack-link"
        >
          Подтверждение ТЗ
        </Link>
      </Button>
    </div>
  );
}
