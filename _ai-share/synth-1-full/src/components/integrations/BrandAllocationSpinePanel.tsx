'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin } from 'lucide-react';
import {
  integrationPlatformLabelRu,
  isIntegrationImportedWholesaleOrderId,
  formatWholesaleOrderDisplayId,
} from '@/lib/integrations/spine/integration-ui-utils';

type AllocationRecord = {
  wholesaleOrderId: string;
  status: string;
  platform: string;
  lines: Array<{
    sku: string;
    qtyOrdered: number;
    qtyAllocated: number;
    locationLabel?: string;
  }>;
};

type Props = {
  orderId: string;
  reloadNonce?: number;
};

/** Wave D6 · P3-AIMS-ALLOC on brand order detail (pillar 3 post-confirm). */
export function BrandAllocationSpinePanel({ orderId, reloadNonce = 0 }: Props) {
  const [allocation, setAllocation] = useState<AllocationRecord | null>(null);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready'>('idle');
  const [syncBusy, setSyncBusy] = useState(false);

  useEffect(() => {
    const id = orderId.trim();
    if (!id || !isIntegrationImportedWholesaleOrderId(id)) {
      setAllocation(null);
      setLoadState('idle');
      return;
    }
    let cancelled = false;
    setLoadState('loading');
    void (async () => {
      try {
        const res = await fetch(`/api/integrations/v1/allocation/${encodeURIComponent(id)}`, {
          cache: 'no-store',
        });
        const json = (await res.json()) as { data?: { allocation?: AllocationRecord | null } };
        if (!cancelled) {
          setAllocation(json.data?.allocation ?? null);
          setLoadState('ready');
        }
      } catch {
        if (!cancelled) {
          setAllocation(null);
          setLoadState('ready');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, reloadNonce]);

  const syncAllocation = async () => {
    setSyncBusy(true);
    try {
      const res = await fetch('/api/integrations/v1/aims360/allocation/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wholesaleOrderId: orderId }),
      });
      if (res.ok) {
        const json = (await res.json()) as { data?: { allocation?: AllocationRecord } };
        if (json.data?.allocation) setAllocation(json.data.allocation);
      }
    } finally {
      setSyncBusy(false);
    }
  };

  if (!isIntegrationImportedWholesaleOrderId(orderId)) return null;
  if (loadState === 'loading') {
    return (
      <p
        className="flex items-center gap-2 text-xs text-muted-foreground"
        data-testid="brand-allocation-spine-loading"
      >
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        Allocation…
      </p>
    );
  }
  if (!allocation) {
    return (
      <Card className="border-dashed" data-testid="brand-allocation-spine-empty">
        <CardContent className="py-3 text-xs text-muted-foreground">
          Allocation queue появится после подтверждения заказа брендом.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="brand-allocation-spine-panel" className="border-indigo-200/60">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <MapPin className="h-4 w-4 text-indigo-600" aria-hidden />
          Склад · allocation
        </CardTitle>
        <CardDescription className="text-xs">
          После подтверждения · {integrationPlatformLabelRu(allocation.platform)} ·{' '}
          {formatWholesaleOrderDisplayId(allocation.wholesaleOrderId)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Badge
          variant="outline"
          className="text-[10px]"
          data-testid="brand-allocation-status-badge"
        >
          {allocation.status}
        </Badge>
        <ul
          className="space-y-1 text-[11px] text-muted-foreground"
          data-testid="brand-allocation-lines"
        >
          {allocation.lines.slice(0, 5).map((line) => (
            <li key={line.sku}>
              {line.sku} · {line.qtyAllocated}/{line.qtyOrdered}
              {line.locationLabel ? ` · ${line.locationLabel}` : ''}
            </li>
          ))}
        </ul>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-[10px]"
          disabled={syncBusy}
          onClick={() => void syncAllocation()}
          data-testid="brand-allocation-sync-btn"
        >
          {syncBusy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
          Синхронизировать резерв
        </Button>
      </CardContent>
    </Card>
  );
}
