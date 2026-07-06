'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Truck } from 'lucide-react';
import type { UnifiedOrderTracking } from '@/lib/integrations/spine/order-tracking.types';
import type { OrderTrackingShipment } from '@/lib/integrations/spine/order-tracking-persistence.file';
import {
  integrationPlatformLabelRu,
  resolveWholesaleOrderSourcePlatform,
  wholesaleOrderSupportsInboundTracking,
  wholesaleTrackingApiBase,
} from '@/lib/integrations/spine/integration-ui-utils';

type Props = {
  wholesaleOrderId: string;
  /** Pillar BFF seed — пропускает начальный client fetch. */
  trackingPreview?: {
    trackingNumber?: string;
    carrier?: string;
    status?: string;
    wipLabelRu?: string;
    deliveryLabel?: string;
  } | null;
};

function trackingShipmentPlatform(wholesaleOrderId: string): OrderTrackingShipment['platform'] {
  const raw = resolveWholesaleOrderSourcePlatform(wholesaleOrderId);
  if (raw === 'zedonk' || raw === 'nuorder' || raw === 'joor') return raw;
  return 'syntha';
}

function previewToUnified(
  wholesaleOrderId: string,
  preview: NonNullable<Props['trackingPreview']>
): UnifiedOrderTracking {
  return {
    wholesaleOrderId,
    productionOrderId: '',
    shipment: preview.trackingNumber
      ? {
          wholesaleOrderId,
          platform: trackingShipmentPlatform(wholesaleOrderId),
          trackingNumber: preview.trackingNumber,
          carrier: preview.carrier,
          status: preview.status ?? 'in_transit',
          updatedAt: new Date().toISOString(),
        }
      : undefined,
    wip: preview.wipLabelRu
      ? {
          platform: 'aims360',
          poStage: 'sewing',
          labelRu: preview.wipLabelRu,
          steps: [],
          updatedAt: new Date().toISOString(),
        }
      : undefined,
    deliveryWindow: preview.deliveryLabel
      ? { label: preview.deliveryLabel, estimatedDelivery: preview.deliveryLabel }
      : undefined,
  };
}

/** Столп 4 · shop — tracking mirror и inbound sync для внешних B2B-каналов. */
export function ShopOrderShipmentTrackingStrip({ wholesaleOrderId, trackingPreview }: Props) {
  const seeded =
    trackingPreview != null &&
    (trackingPreview.trackingNumber ||
      trackingPreview.deliveryLabel ||
      trackingPreview.wipLabelRu);
  const [tracking, setTracking] = useState<UnifiedOrderTracking | null>(() =>
    seeded ? previewToUnified(wholesaleOrderId, trackingPreview!) : null
  );
  const [pullBusy, setPullBusy] = useState(false);
  const [pullMsg, setPullMsg] = useState<string | null>(null);

  const loadTracking = async () => {
    try {
      const res = await fetch(
        `/api/integrations/v1/orders/${encodeURIComponent(wholesaleOrderId)}/tracking`,
        { cache: 'no-store' }
      );
      if (!res.ok) return;
      const json = (await res.json()) as { data?: UnifiedOrderTracking };
      setTracking(json.data ?? null);
    } catch {
      setTracking(null);
    }
  };

  useEffect(() => {
    if (seeded) {
      setTracking(previewToUnified(wholesaleOrderId, trackingPreview!));
      return;
    }
    void loadTracking();
  }, [wholesaleOrderId, seeded, trackingPreview]);

  const pullInbound = async () => {
    const apiBase = wholesaleTrackingApiBase(wholesaleOrderId);
    if (!apiBase) return;
    setPullBusy(true);
    setPullMsg(null);
    try {
      const res = await fetch(`${apiBase}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wholesaleOrderId }),
      });
      const json = (await res.json()) as {
        data?: { shipment?: { trackingNumber?: string }; source?: string };
        error?: { message?: string };
      };
      if (res.ok) {
        setPullMsg(
          `Синхронизировано · ${json.data?.shipment?.trackingNumber ?? json.data?.source ?? 'ok'}`
        );
        await loadTracking();
      } else {
        setPullMsg(json.error?.message ?? 'Ошибка синхронизации');
      }
    } catch {
      setPullMsg('Ошибка сети');
    } finally {
      setPullBusy(false);
    }
  };

  const shipment = tracking?.shipment;
  const delivery = tracking?.deliveryWindow;
  const canPullInbound = wholesaleOrderSupportsInboundTracking(wholesaleOrderId);
  const channelLabel = integrationPlatformLabelRu(
    resolveWholesaleOrderSourcePlatform(wholesaleOrderId) ?? shipment?.platform
  );

  if (!shipment?.trackingNumber && !delivery?.label && !canPullInbound) return null;

  return (
    <div
      className="mt-2 min-w-0 space-y-1 rounded-md border border-sky-200 bg-sky-50/60 px-2 py-1.5 text-[10px] text-sky-950"
      data-testid={`shop-co-tracking-shipment-${wholesaleOrderId}`}
      data-audit-legacy={`shop-op-tracking-shipment-${wholesaleOrderId}`}
    >
      {shipment?.trackingNumber ? (
        <p>
          <Badge variant="secondary" className="mr-1 text-[9px]">
            {channelLabel}
          </Badge>
          {shipment.carrier ? `${shipment.carrier} · ` : ''}
          <span className="break-all font-mono">{shipment.trackingNumber}</span>
          {shipment.status ? ` · ${shipment.status}` : ''}
        </p>
      ) : canPullInbound ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground">
            Данные отгрузки ещё не получены
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="min-h-11 px-3 text-[10px] md:h-6 md:min-h-0 md:px-2 md:text-[9px]"
            disabled={pullBusy}
            onClick={() => void pullInbound()}
            data-testid={`shop-inbound-pull-${wholesaleOrderId}`}
          >
            {pullBusy ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" aria-hidden />
            ) : (
              <Truck className="mr-1 h-3 w-3" aria-hidden />
            )}
            Загрузить из канала
          </Button>
        </div>
      ) : null}
      {delivery?.label ? (
        <p data-testid={`shop-co-tracking-delivery-${wholesaleOrderId}`} data-audit-legacy={`shop-op-tracking-delivery-${wholesaleOrderId}`}>
          Окно поставки: {delivery.label}
        </p>
      ) : null}
      {pullMsg ? <p className="text-muted-foreground text-[9px]">{pullMsg}</p> : null}
    </div>
  );
}
