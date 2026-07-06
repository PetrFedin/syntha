'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import type { PlatformCoreShopTrackingChain } from '@/hooks/use-platform-core-shop-tracking-chains';

type TrackingRow = {
  order: string;
  status: string;
};

export function ShopBuyerDeliveryBatchAckPanel({
  rows,
  chains,
  onAcknowledged,
}: {
  rows: TrackingRow[];
  chains: Record<string, PlatformCoreShopTrackingChain | null>;
  onAcknowledged?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const pendingOrderIds = useMemo(() => {
    return rows
      .filter((row) => {
        const chain = chains[row.order];
        const status = chain?.status ?? row.status;
        const acked = chain?.buyerDeliveryAcknowledgedAt;
        return status === 'shipped' && !acked;
      })
      .map((row) => row.order);
  }, [rows, chains]);

  const ackedCount = useMemo(
    () =>
      rows.filter((row) => {
        const chain = chains[row.order];
        return Boolean(chain?.buyerDeliveryAcknowledgedAt);
      }).length,
    [rows, chains]
  );

  if (pendingOrderIds.length === 0 && ackedCount === 0) return null;

  async function runBatchAck() {
    if (pendingOrderIds.length === 0) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/shop/b2b/orders/delivery-ack/batch', {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderIds: pendingOrderIds, actor: 'shop_tracking_batch' }),
      });
      const json = (await res.json()) as { ok?: boolean; messageRu?: string };
      setMessage(json.messageRu ?? (json.ok ? 'Готово' : 'Ошибка подтверждения'));
      if (json.ok) onAcknowledged?.();
    } catch {
      setMessage('Не удалось подтвердить получение.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="border-border-subtle bg-bg-surface2/50 space-y-2 rounded-lg border px-3 py-2"
      data-testid="shop-co-buyer-delivery-batch-ack"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-text-muted text-[10px] font-bold uppercase tracking-wide">
            Batch · подтверждение получения
          </span>
          {pendingOrderIds.length > 0 ? (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[10px] text-amber-950">
              {pendingOrderIds.length} shipped без ack
            </Badge>
          ) : null}
          {ackedCount > 0 ? (
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-900"
              data-testid="shop-co-buyer-delivery-acked-count"
            >
              {ackedCount} подтверждено
            </Badge>
          ) : null}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-[10px] font-bold uppercase"
          disabled={busy || pendingOrderIds.length === 0}
          data-testid="shop-co-buyer-delivery-batch-ack-btn"
          onClick={() => void runBatchAck()}
        >
          {busy ? '…' : `Подтвердить (${pendingOrderIds.length})`}
        </Button>
      </div>
      {message ? (
        <p className="text-text-secondary text-[10px]" data-testid="shop-co-buyer-delivery-batch-ack-msg">
          {message}
        </p>
      ) : null}
    </div>
  );
}
