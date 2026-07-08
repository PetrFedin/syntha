'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin } from 'lucide-react';
import { brandB2bOrdersCollectionRegistryHref } from '@/lib/routes';
import { isIntegrationImportedWholesaleOrderId } from '@/lib/integrations/spine/integration-ui-utils';

type QueueItem = {
  wholesaleOrderId: string;
  status: string;
  lines: Array<{ sku: string; qtyAllocated: number; qtyOrdered: number }>;
};

/** Сводка очереди allocation для pillar collection_order (только imported wholesale). */
export function BrandCollectionAllocationQueueBadge({ reloadNonce = 0 }: { reloadNonce?: number }) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/integrations/v1/allocation/queue?limit=5', {
          cache: 'no-store',
        });
        const json = (await res.json()) as { data?: { items?: QueueItem[] } };
        if (!cancelled && res.ok) {
          setItems(json.data?.items ?? []);
        }
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadNonce]);

  const spineItems = items.filter((i) => isIntegrationImportedWholesaleOrderId(i.wholesaleOrderId));

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        Резерв…
      </span>
    );
  }

  if (spineItems.length === 0) return null;

  const queued = spineItems.filter(
    (i) => i.status === 'queued' || i.status === 'in_progress'
  ).length;

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-md border border-indigo-200/60 bg-indigo-50/40 px-2 py-1"
      data-testid="brand-co-allocation-queue-badge"
    >
      <MapPin className="h-3 w-3 text-indigo-700" aria-hidden />
      <Badge variant="outline" className="text-[9px]">
        Резерв · {spineItems.length}
        {queued > 0 ? ` · ${queued} в работе` : ''}
      </Badge>
      <Link
        href={brandB2bOrdersCollectionRegistryHref(spineItems[0]?.wholesaleOrderId)}
        className="text-accent-primary text-[10px] font-medium hover:underline"
        data-testid="brand-co-allocation-queue-link"
      >
        Реестр →
      </Link>
    </div>
  );
}
