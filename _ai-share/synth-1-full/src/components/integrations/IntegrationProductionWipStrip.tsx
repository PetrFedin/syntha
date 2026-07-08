'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { UnifiedOrderTracking } from '@/lib/integrations/spine/order-tracking.types';
import { integrationPlatformLabelRu } from '@/lib/integrations/spine/integration-ui-utils';

type Props = {
  wholesaleOrderId: string;
  productionOrderId?: string;
  variant: 'factory' | 'shop';
  /** Factory: advance WIP stage on production PO */
  allowAdvance?: boolean;
};

/** Столп 4 · manufacturer/shop — WIP + tracking mirror для внешних заказов. */
export function IntegrationProductionWipStrip({
  wholesaleOrderId,
  productionOrderId,
  variant,
  allowAdvance = false,
}: Props) {
  const [tracking, setTracking] = useState<UnifiedOrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [autoPullMsg, setAutoPullMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/integrations/v1/orders/${encodeURIComponent(wholesaleOrderId)}/tracking`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error('tracking failed');
      const json = (await res.json()) as { data?: UnifiedOrderTracking };
      setTracking(json.data ?? null);
    } catch {
      setTracking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [wholesaleOrderId]);

  const advanceWip = async () => {
    if (!productionOrderId) return;
    setBusy(true);
    setAutoPullMsg(null);
    try {
      const nextStage = !tracking?.wip?.poStage
        ? 'cutting'
        : tracking.wip.poStage === 'cutting'
          ? 'sewing'
          : tracking.wip.poStage === 'sewing'
            ? 'qc'
            : tracking.wip.poStage === 'qc'
              ? 'ready_to_ship'
              : 'shipped';
      const res = await fetch('/api/integrations/v1/aims360/wip/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productionOrderId,
          b2bOrderId: wholesaleOrderId,
          poStage: nextStage,
        }),
      });
      const json = (await res.json()) as {
        data?: {
          autoPull?: {
            pulled?: boolean;
            platform?: string;
            shipment?: { trackingNumber?: string };
          };
        };
      };
      if (res.ok && json.data?.autoPull?.pulled) {
        const channel = integrationPlatformLabelRu(json.data.autoPull.platform ?? '');
        setAutoPullMsg(
          `Отгрузка синхронизирована · ${channel} · ${json.data.autoPull.shipment?.trackingNumber ?? 'tracking'}`
        );
      }
      await load();
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <span
        className="text-text-muted text-[9px]"
        data-testid={`${variant}-wip-loading-${wholesaleOrderId}`}
      >
        WIP…
      </span>
    );
  }

  const prefix = variant === 'factory' ? 'factory-op' : 'shop-op';

  return (
    <div className="space-y-1" data-testid={`${prefix}-wip-strip-${wholesaleOrderId}`}>
      {tracking?.wip ? (
        <>
          <div className="flex flex-wrap gap-1">
            {tracking.wip.steps.map((step) => (
              <Badge
                key={step.id}
                variant={step.done ? 'default' : 'outline'}
                className="text-[8px] font-semibold normal-case"
                data-testid={`${prefix}-wip-step-${step.id}-${wholesaleOrderId}`}
              >
                {step.labelRu}
              </Badge>
            ))}
          </div>
          <p className="text-text-muted text-[9px]">Склад · WIP · {tracking.wip.labelRu}</p>
        </>
      ) : (
        <Badge
          variant="outline"
          className="text-[8px]"
          data-testid={`${prefix}-wip-empty-${wholesaleOrderId}`}
        >
          WIP производства —
        </Badge>
      )}
      {allowAdvance && productionOrderId ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-6 px-2 text-[9px]"
          disabled={busy || tracking?.wip?.poStage === 'shipped'}
          data-testid={`${prefix}-wip-advance-${wholesaleOrderId}`}
          onClick={() => void advanceWip()}
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Следующая стадия WIP'}
        </Button>
      ) : null}
      {tracking?.shipment?.trackingNumber ? (
        <p
          className="text-text-muted text-[9px]"
          data-testid={`${prefix}-wip-shipment-${wholesaleOrderId}`}
        >
          Отгрузка · {integrationPlatformLabelRu(tracking.shipment.platform)} ·{' '}
          <span className="font-mono">{tracking.shipment.trackingNumber}</span>
        </p>
      ) : null}
      {autoPullMsg ? (
        <p
          className="text-[9px] text-emerald-800"
          data-testid={`${prefix}-wip-autopull-${wholesaleOrderId}`}
        >
          {autoPullMsg}
        </p>
      ) : null}
    </div>
  );
}
