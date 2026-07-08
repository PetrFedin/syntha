'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Package } from 'lucide-react';
import { factorySupplierMessagesB2bOrderContextHref } from '@/lib/routes';
import {
  formatWholesaleOrderDisplayId,
  isIntegrationImportedWholesaleOrderId,
  wholesaleOrderKindLabelRu,
} from '@/lib/integrations/spine/integration-ui-utils';
import type { SupplierProcurementSpineSnapshot } from '@/lib/platform-core-pillar-snapshot.types';

type Props = {
  orderId: string;
  /** Из pillar BFF — без GET /procurement на mount в кабинете. */
  procurement?: SupplierProcurementSpineSnapshot | null;
  reloadNonce?: number;
  /** Called after vendor PO ack so pillar snapshot can refresh. */
  onAckSuccess?: () => void;
  compact?: boolean;
};

/** Spine procurement overlay (pillar 4). Supplier paths: BFF; manufacturer workspace: client fetch fallback. */
export function SupplierProcurementSpineStrip({
  orderId,
  procurement: procurementProp,
  reloadNonce = 0,
  onAckSuccess,
  compact = false,
}: Props) {
  const [fetchedCtx, setFetchedCtx] = useState<SupplierProcurementSpineSnapshot | null>(null);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [deliveryBusy, setDeliveryBusy] = useState(false);
  const [ackBusy, setAckBusy] = useState(false);
  const [localReload, setLocalReload] = useState(0);

  const useClientFetch = procurementProp === undefined;

  useEffect(() => {
    if (!useClientFetch) return;
    const id = orderId.trim();
    if (!id) {
      setFetchedCtx(null);
      setLoadState('idle');
      return;
    }
    let cancelled = false;
    setLoadState('loading');
    void (async () => {
      try {
        const res = await fetch(`/api/integrations/v1/procurement/${encodeURIComponent(id)}`, {
          cache: 'no-store',
        });
        const json = (await res.json()) as {
          data?: { procurement?: SupplierProcurementSpineSnapshot };
        };
        if (!cancelled) {
          if (res.ok && json.data?.procurement) {
            setFetchedCtx(json.data.procurement);
            setLoadState('ready');
          } else {
            setFetchedCtx(null);
            setLoadState('error');
          }
        }
      } catch {
        if (!cancelled) {
          setFetchedCtx(null);
          setLoadState('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, reloadNonce, localReload, useClientFetch]);

  const ctx = useClientFetch ? fetchedCtx : procurementProp;

  const syncDelivery = async () => {
    if (!ctx?.deliveryLabel) return;
    setDeliveryBusy(true);
    try {
      await fetch(`/api/integrations/v1/orders/${encodeURIComponent(orderId)}/delivery-window`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: ctx.deliveryLabel }),
      });
    } finally {
      setDeliveryBusy(false);
    }
  };

  const ackVendorPo = async () => {
    if (!ctx?.vendorPo?.vendorPoId) return;
    setAckBusy(true);
    try {
      const res = await fetch('/api/integrations/v1/apparel-magic/vendor-po/import', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorPoId: ctx.vendorPo.vendorPoId }),
      });
      if (res.ok) {
        setLocalReload((n) => n + 1);
        onAckSuccess?.();
      }
    } finally {
      setAckBusy(false);
    }
  };

  if (useClientFetch && loadState === 'loading') {
    return (
      <div
        className="flex items-center gap-2 text-xs text-muted-foreground"
        data-testid="sup-procurement-spine-loading"
      >
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        Закупка по внешнему заказу…
      </div>
    );
  }

  if (!ctx) return null;

  if (!isIntegrationImportedWholesaleOrderId(orderId) && !ctx.centricRfq && !ctx.vendorPo) {
    return null;
  }

  return (
    <div
      className={
        compact
          ? 'space-y-1.5 rounded-md border border-emerald-200/60 bg-emerald-50/30 p-2'
          : 'space-y-2 rounded-md border border-emerald-200/70 bg-emerald-50/40 p-2'
      }
      data-testid="sup-procurement-spine-strip"
      data-compact={compact ? 'true' : 'false'}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-[9px]">
          <Package className="mr-0.5 inline h-3 w-3" aria-hidden />
          {wholesaleOrderKindLabelRu(orderId)} · {formatWholesaleOrderDisplayId(orderId)}
        </Badge>
        {ctx.isSpineImported ? (
          <Badge variant="secondary" className="text-[9px]">
            Внешний канал
          </Badge>
        ) : null}
        {ctx.chainHandedOff && ctx.poId ? (
          <Badge variant="outline" className="text-[9px]">
            PO {ctx.poId}
          </Badge>
        ) : null}
        {ctx.chainMaterialsSupplied ? (
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-[9px] text-emerald-800"
            data-testid="sup-procurement-materials-supplied-badge"
          >
            Материалы подтверждены
          </Badge>
        ) : ctx.chainHandedOff && ctx.vendorPo ? (
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-[9px] text-amber-800"
            data-testid="sup-procurement-materials-pending-badge"
          >
            ожидает ack
          </Badge>
        ) : null}
      </div>
      {ctx.centricRfq ? (
        <div className="space-y-1" data-testid="sup-procurement-centric-rfq">
          <p className="text-xs font-medium">
            PLM · RFQ {ctx.centricRfq.rfqId} · {ctx.centricRfq.status}
          </p>
          <ul className="space-y-0.5 text-[11px] text-muted-foreground">
            {ctx.centricRfq.lines.slice(0, 4).map((line) => (
              <li key={line.materialName}>
                {line.materialName} · {line.qty} {line.unit ?? 'ед.'}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {ctx.vendorPo ? (
        <div className="space-y-1" data-testid="sup-procurement-am-vendor-po">
          <p className="text-xs font-medium">
            ERP · заказ поставщику {ctx.vendorPo.vendorPoId} · {ctx.vendorPo.status}
          </p>
          <ul className="space-y-0.5 text-[11px] text-muted-foreground">
            {ctx.vendorPo.lines.slice(0, 4).map((line) => (
              <li key={line.materialName}>
                {line.materialName} · {line.ackQty ?? '—'}/{line.qty} {line.unit ?? 'ед.'}
              </li>
            ))}
          </ul>
          {ctx.vendorPo.status === 'open' ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 text-[10px]"
              disabled={ackBusy}
              onClick={() => void ackVendorPo()}
              data-testid="sup-procurement-vendor-po-ack-btn"
            >
              {ackBusy ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Подтвердить поставку (ack)'
              )}
            </Button>
          ) : null}
        </div>
      ) : null}
      {ctx.deliveryLabel ? (
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span>Поставка: {ctx.deliveryLabel}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px]"
            disabled={deliveryBusy}
            onClick={() => void syncDelivery()}
            data-testid="sup-procurement-sync-delivery-btn"
          >
            {deliveryBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : '→ календарь'}
          </Button>
        </div>
      ) : null}
      <Link
        href={factorySupplierMessagesB2bOrderContextHref(orderId)}
        className="text-accent-primary text-[10px] font-medium hover:underline"
        data-testid="sup-procurement-spine-chat-link"
      >
        Чат · RFQ / заказ
      </Link>
    </div>
  );
}
