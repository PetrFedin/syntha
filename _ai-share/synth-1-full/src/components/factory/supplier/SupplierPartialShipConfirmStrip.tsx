'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  WAVE_WI_SUP_PARTIAL_SHIP_BACKORDER_LABEL_RU,
  WAVE_WI_SUP_PARTIAL_SHIP_CONFIRM_BTN_RU,
  WAVE_WI_SUP_PARTIAL_SHIP_QTY_LABEL_RU,
  WAVE_WI_SUP_PARTIAL_SHIP_TITLE_RU,
} from '@/lib/platform/wave-wi-supplier-partial-ship';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { buildWorkshop2SupplierBulkConfirmIdempotencyKey } from '@/lib/production/workshop2-supplier-bulk-confirm-idempotency';

type Props = {
  collectionId: string;
  articleId: string;
  orderId: string;
  productionOrderId?: string;
  defaultQty?: number;
  disabled?: boolean;
  onConfirmed?: (meta?: { qty: number; backorder: boolean }) => void;
};

/** Частичная отгрузка + backorder перед bulk-confirm (Wave WI). */
export function SupplierPartialShipConfirmStrip({
  collectionId,
  articleId,
  orderId,
  productionOrderId,
  defaultQty = 0,
  disabled = false,
  onConfirmed,
}: Props) {
  const [shippedQty, setShippedQty] = useState(String(defaultQty > 0 ? defaultQty : 1));
  const [backorder, setBackorder] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    if (busy || disabled) return;
    setBusy(true);
    setMessage(null);
    try {
      const qty = Math.max(0, Math.round(Number(shippedQty) || 0));
      const idempotencyKey = buildWorkshop2SupplierBulkConfirmIdempotencyKey({
        b2bOrderId: orderId,
        collectionId,
        articleId,
        productionOrderId,
        partialShipQty: qty,
        backorderFlag: backorder,
      });
      const res = await fetch('/api/workshop2/supplier/material-request/bulk-confirm', {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          collectionId,
          articleId,
          b2bOrderId: orderId,
          productionOrderId,
          partialShipQty: qty,
          backorderFlag: backorder,
          idempotencyKey,
          updatedBy: 'supplier-partial-ship',
        }),
      });
      const json = (await res.json()) as { ok?: boolean; messageRu?: string };
      setMessage(json.messageRu ?? (json.ok ? 'Подтверждено.' : 'Ошибка подтверждения.'));
      if (json.ok) onConfirmed?.({ qty, backorder });
    } catch {
      setMessage('Не удалось подтвердить частичную отгрузку.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="space-y-2 rounded-md border border-emerald-200/80 bg-emerald-50/40 px-2 py-2"
      data-testid="sup-op-partial-ship-confirm-strip"
    >
      <p className="text-[10px] font-semibold text-emerald-950">{WAVE_WI_SUP_PARTIAL_SHIP_TITLE_RU}</p>
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor="sup-op-partial-ship-qty" className="text-[10px]">
            {WAVE_WI_SUP_PARTIAL_SHIP_QTY_LABEL_RU}
          </Label>
          <Input
            id="sup-op-partial-ship-qty"
            type="number"
            min={0}
            value={shippedQty}
            onChange={(e) => setShippedQty(e.target.value)}
            className="h-8 w-24 text-xs"
            data-testid="sup-op-partial-ship-qty-input"
          />
        </div>
        <label className="flex items-center gap-2 text-[10px]">
          <Checkbox
            checked={backorder}
            onCheckedChange={(v) => setBackorder(v === true)}
            data-testid="sup-op-partial-ship-backorder"
          />
          {WAVE_WI_SUP_PARTIAL_SHIP_BACKORDER_LABEL_RU}
        </label>
        <Button
          type="button"
          size="sm"
          className="h-8 text-[10px]"
          disabled={busy || disabled}
          onClick={() => void submit()}
          data-testid="sup-op-partial-ship-confirm-btn"
        >
          {busy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
          {WAVE_WI_SUP_PARTIAL_SHIP_CONFIRM_BTN_RU}
        </Button>
      </div>
      {message ? (
        <p className="text-[10px] text-emerald-900" data-testid="sup-op-partial-ship-msg">
          {message}
        </p>
      ) : null}
    </div>
  );
}
