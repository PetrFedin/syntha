'use client';

import { useState } from 'react';
import { PlatformCoreWmsReserveStrip } from '@/components/platform/PlatformCoreWmsReserveStrip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

type Props = {
  collectionId: string;
  articleId: string;
  b2bOrderId?: string;
  brandHandoffHref: string;
  shopTrackingHref: string;
  testId?: string;
};

/** Supplier procurement · WMS sample reserve + B2B inventory reserve PATCH (Wave SQ). */
export function SupplierWmsReserveActionStrip({
  collectionId,
  articleId,
  b2bOrderId,
  brandHandoffHref,
  shopTrackingHref,
  testId = 'sup-op-procurement-wms-reserve-strip',
}: Props) {
  const [reserving, setReserving] = useState(false);
  const [reserveMessage, setReserveMessage] = useState<string | null>(null);
  const [reserveOk, setReserveOk] = useState<boolean | null>(null);
  const [b2bReserving, setB2bReserving] = useState(false);
  const [b2bReserveMessage, setB2bReserveMessage] = useState<string | null>(null);
  const [b2bReserveOk, setB2bReserveOk] = useState<boolean | null>(null);

  const handleSampleReserve = async () => {
    if (reserving) return;
    setReserving(true);
    setReserveMessage(null);
    setReserveOk(null);
    try {
      const res = await fetch(
        `/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(articleId)}/wms/reserve-sample`,
        {
          method: 'POST',
          headers: {
            ...buildWorkshop2ApiRequestHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            actor: 'supplier-procurement-wms-reserve',
            sampleOrderId: b2bOrderId?.trim() || undefined,
          }),
        }
      );
      const json = (await res.json()) as {
        ok?: boolean;
        messageRu?: string;
        reservedLines?: number;
        wmsSyncStatus?: string;
      };
      if (!res.ok || !json.ok) {
        setReserveOk(false);
        setReserveMessage(json.messageRu ?? 'WMS недоступен — проверьте досье/PG.');
        return;
      }
      setReserveOk(true);
      setReserveMessage(
        json.messageRu ??
          `Резерв образца · ${json.reservedLines ?? 0} строк${json.wmsSyncStatus ? ` · ${json.wmsSyncStatus}` : ''}`
      );
    } catch {
      setReserveOk(false);
      setReserveMessage('Ошибка сети при резерве образца.');
    } finally {
      setReserving(false);
    }
  };

  const handleB2bInventoryReserve = async () => {
    const orderId = b2bOrderId?.trim();
    if (!orderId || b2bReserving) return;
    setB2bReserving(true);
    setB2bReserveMessage(null);
    setB2bReserveOk(null);
    try {
      const res = await fetch(
        `/api/workshop2/b2b/orders/${encodeURIComponent(orderId)}/inventory-reserve`,
        {
          method: 'PATCH',
          headers: {
            ...buildWorkshop2ApiRequestHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ source: 'supplier_materials' }),
        }
      );
      const json = (await res.json()) as {
        ok?: boolean;
        messageRu?: string;
        idempotent?: boolean;
        inventoryReserve?: { reserved?: boolean; reservedQty?: number };
      };
      if (!res.ok || !json.ok) {
        setB2bReserveOk(false);
        setB2bReserveMessage(json.messageRu ?? 'Не удалось оформить резерв B2B.');
        return;
      }
      setB2bReserveOk(true);
      setB2bReserveMessage(
        json.messageRu ??
          (json.inventoryReserve?.reserved
            ? `Резерв B2B · ${json.inventoryReserve.reservedQty ?? '—'} ед.`
            : 'Резерв не создан (дефицит/WMS).')
      );
    } catch {
      setB2bReserveOk(false);
      setB2bReserveMessage('Ошибка сети при резерве B2B.');
    } finally {
      setB2bReserving(false);
    }
  };

  return (
    <div className="space-y-1.5" data-testid={`${testId}-action-wrap`}>
      <PlatformCoreWmsReserveStrip
        variant="supplier"
        brandHandoffHref={brandHandoffHref}
        shopTrackingHref={shopTrackingHref}
        testId={testId}
      />
      <div className="flex flex-wrap items-center gap-2 px-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-[10px]"
          disabled={reserving}
          data-testid={`${testId}-post-reserve-btn`}
          onClick={() => void handleSampleReserve()}
        >
          {reserving ? 'Резерв…' : 'Резерв образца WMS'}
        </Button>
        {b2bOrderId?.trim() ? (
          <Button
            type="button"
            size="sm"
            variant="default"
            className="h-7 text-[10px]"
            disabled={b2bReserving}
            data-testid="sup-op-procurement-b2b-inventory-reserve-btn"
            onClick={() => void handleB2bInventoryReserve()}
          >
            {b2bReserving ? 'Резерв…' : 'Резерв B2B заказа'}
          </Button>
        ) : null}
        {b2bOrderId?.trim() ? (
          <Badge variant="outline" className="text-[9px]" data-testid="sup-op-procurement-b2b-inventory-reserve-scope">
            PO · {b2bOrderId}
          </Badge>
        ) : null}
        {reserveMessage ? (
          <span
            className={reserveOk ? 'text-text-secondary text-[10px]' : 'text-destructive text-[10px]'}
            data-testid={`${testId}-post-reserve-message`}
          >
            {reserveMessage}
          </span>
        ) : null}
        {b2bReserveMessage ? (
          <span
            className={b2bReserveOk ? 'text-text-secondary text-[10px]' : 'text-destructive text-[10px]'}
            data-testid="sup-op-procurement-b2b-inventory-reserve-message"
          >
            {b2bReserveMessage}
          </span>
        ) : null}
      </div>
    </div>
  );
}
