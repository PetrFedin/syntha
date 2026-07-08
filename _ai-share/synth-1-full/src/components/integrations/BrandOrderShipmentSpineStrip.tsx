'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Truck } from 'lucide-react';
import {
  integrationPlatformLabelRu,
  isIntegrationImportedWholesaleOrderId,
  resolveWholesaleOrderSourcePlatform,
  wholesaleTrackingApiBase,
} from '@/lib/integrations/spine/integration-ui-utils';

type Props = {
  orderId: string;
  sourcePlatform?: string;
};

/** Столп 4 · brand — единая панель отгрузки для внешних B2B-каналов с tracking sync. */
export function BrandOrderShipmentSpineStrip({ orderId, sourcePlatform }: Props) {
  const [tracking, setTracking] = useState('');
  const [carrier, setCarrier] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!isIntegrationImportedWholesaleOrderId(orderId)) return null;

  const platform =
    resolveWholesaleOrderSourcePlatform(orderId) ??
    (sourcePlatform?.trim().toLowerCase() as ReturnType<
      typeof resolveWholesaleOrderSourcePlatform
    >);
  const apiBase = wholesaleTrackingApiBase(orderId, sourcePlatform);

  if (!platform || !apiBase || (platform !== 'joor' && platform !== 'nuorder')) return null;
  if (
    sourcePlatform &&
    resolveWholesaleOrderSourcePlatform(orderId) &&
    sourcePlatform.trim().toLowerCase() !== resolveWholesaleOrderSourcePlatform(orderId)
  ) {
    return null;
  }

  const channelLabel = integrationPlatformLabelRu(platform);
  const defaultCarrier = platform === 'joor' ? 'DHL' : 'UPS';

  const pushShipment = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wholesaleOrderId: orderId,
          trackingNumber: tracking.trim() || `TRK-${Date.now()}`,
          carrier: carrier.trim() || defaultCarrier,
          status: 'shipped',
        }),
      });
      const json = (await res.json()) as {
        data?: { shipment?: { trackingNumber?: string } };
        error?: { message?: string };
      };
      if (res.ok) {
        setMsg(`Отгрузка ${json.data?.shipment?.trackingNumber ?? ''} · tracking обновлён.`);
      } else {
        setMsg(json.error?.message ?? 'Ошибка синхронизации отгрузки');
      }
    } catch {
      setMsg('Ошибка сети');
    } finally {
      setBusy(false);
    }
  };

  const pullInbound = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wholesaleOrderId: orderId }),
      });
      const json = (await res.json()) as {
        data?: { shipment?: { trackingNumber?: string }; source?: string };
        error?: { message?: string };
      };
      if (res.ok) {
        setMsg(
          `Входящая синхронизация · ${json.data?.shipment?.trackingNumber ?? json.data?.source ?? 'ok'}`
        );
      } else {
        setMsg(json.error?.message ?? 'Ошибка входящей синхронизации');
      }
    } catch {
      setMsg('Ошибка сети');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="space-y-2 rounded-md border border-blue-200/70 bg-blue-50/40 p-2 text-xs"
      data-testid="brand-order-shipment-spine-strip"
      data-channel={platform}
    >
      <p className="flex items-center gap-1 font-medium text-blue-950">
        <Truck className="h-3.5 w-3.5" aria-hidden />
        Отгрузка · {channelLabel}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="h-7 max-w-[180px] text-xs"
          placeholder="Трек-номер"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          data-testid="brand-order-shipment-tracking-input"
        />
        <Input
          className="h-7 max-w-[100px] text-xs"
          placeholder="Перевозчик"
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-[10px]"
          disabled={busy}
          onClick={() => void pushShipment()}
          data-testid="brand-order-shipment-push-btn"
        >
          {busy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" aria-hidden /> : null}
          Отправить отгрузку
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 text-[10px]"
          disabled={busy}
          onClick={() => void pullInbound()}
          data-testid="brand-order-shipment-inbound-btn"
        >
          Загрузить из канала
        </Button>
      </div>
      {msg ? <p className="text-[10px] text-muted-foreground">{msg}</p> : null}
    </div>
  );
}
