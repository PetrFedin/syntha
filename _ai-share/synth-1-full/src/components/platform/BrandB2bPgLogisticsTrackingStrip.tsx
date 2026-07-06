'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Truck } from 'lucide-react';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { isPlatformCorePgLogisticsWholesaleOrderId } from '@/lib/platform-core-spine-active-order-fallback';

type Props = {
  orderId: string;
};

/** Столп 3–4 · brand — ТТН для clean PG заказа (не integration ERP strip). */
export function BrandB2bPgLogisticsTrackingStrip({ orderId }: Props) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    if (!isPlatformCorePgLogisticsWholesaleOrderId(orderId)) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/b2b/orders/${encodeURIComponent(orderId)}/logistics-tracking`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as { trackingNumber?: string | null; carrier?: string | null };
        if (!cancelled && json.trackingNumber) {
          setSaved(json.trackingNumber);
          setTrackingNumber(json.trackingNumber);
          if (json.carrier) setCarrier(json.carrier);
        }
      } catch {
        /* optional seed */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (!isPlatformCorePgLogisticsWholesaleOrderId(orderId)) return null;

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/workshop2/b2b/orders/${encodeURIComponent(orderId)}/logistics-tracking`,
        {
          method: 'POST',
          headers: {
            ...buildWorkshop2ApiRequestHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trackingNumber: trackingNumber.trim(),
            carrier: carrier.trim() || undefined,
          }),
        }
      );
      const json = (await res.json()) as { ok?: boolean; messageRu?: string; trackingNumber?: string };
      if (res.ok && json.ok) {
        setSaved(json.trackingNumber ?? trackingNumber.trim());
        setMsg(json.messageRu ?? 'Трек-номер сохранён.');
      } else {
        setMsg(json.messageRu ?? 'Не удалось сохранить трек-номер.');
      }
    } catch {
      setMsg('Сеть недоступна.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`${hubGadget.goldenPath} flex-col items-stretch gap-2 rounded-md border border-sky-200/80 bg-sky-50/50 px-2 py-1.5`}
      data-testid="brand-co-logistics-tracking-strip"
    >
      <p className="flex items-center gap-1 text-[10px] font-medium text-sky-950">
        <Truck className="h-3 w-3" aria-hidden />
        Логистика · ТТН для магазина
        {saved ? (
          <span className="text-text-muted font-normal">· сохранён</span>
        ) : null}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="h-7 max-w-[200px] font-mono text-xs"
          placeholder="Трек-номер"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          data-testid="brand-co-logistics-tracking-input"
        />
        <Input
          className="h-7 max-w-[120px] text-xs"
          placeholder="Перевозчик"
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          data-testid="brand-co-logistics-tracking-carrier"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-[10px]"
          disabled={busy || !trackingNumber.trim()}
          onClick={() => void save()}
          data-testid="brand-co-logistics-tracking-save"
        >
          {busy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" aria-hidden /> : null}
          Сохранить ТТН
        </Button>
      </div>
      {msg ? (
        <p className="text-text-muted text-[9px]" role="status">
          {msg}
        </p>
      ) : null}
    </div>
  );
}
