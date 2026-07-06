'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import {
  buildBrandOpInventoryLedgerSession,
  resolveBrandOpInventoryReserveQty,
  sumWmsReservedQty,
} from '@/lib/platform-core-ports/b2b/brand-op-inventory-ledger-session';
import { formatPlatformCoreWmsReserveDoneWithQtyRu } from '@/lib/platform-core-wms-reserve-copy';
import {
  formatBrandInventoryLedgerReserveQtyCrossLinkRu,
  WAVE_YH_BRAND_INVENTORY_LEDGER_RESERVE_QTY_LINK_TESTID,
} from '@/lib/platform-core-ports/platform/wave-yh-wms-reserve-checkout';
import { PlatformCoreInventoryLedgerStrip } from '@/components/platform/PlatformCoreInventoryLedgerStrip';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { Loader2 } from 'lucide-react';

type Props = {
  collectionId?: string;
  articleId?: string;
  orderId?: string;
  productionOrderId?: string;
  reconcileHref: string;
  testId?: string;
};

type InventoryReservePayload = {
  ok?: boolean;
  reservedQty?: number;
  internalWmsEnabled?: boolean;
  inventoryReserve?: { reserved?: boolean; reservedQty?: number; reason?: string };
  wmsBalancesHref?: string;
};

type WmsBalancesPayload = {
  ok?: boolean;
  balances?: Array<{ qtyReserved?: number; qty_reserved?: number }>;
};

/** Brand OP inventory ledger + live GET inventory/reserve badge + WMS API cross-links (Wave S3). */
export function BrandOpInventoryLedgerStrip({
  collectionId,
  articleId,
  orderId,
  productionOrderId,
  reconcileHref,
  testId = 'brand-op-inventory-ledger',
}: Props) {
  const session = buildBrandOpInventoryLedgerSession({
    collectionId,
    articleId,
    orderId,
    productionOrderId,
  });
  const [reservedQty, setReservedQty] = useState<number | null>(null);
  const [wmsLive, setWmsLive] = useState(false);
  const [wmsLoading, setWmsLoading] = useState(true);
  const [wmsBalancesHref, setWmsBalancesHref] = useState(session.wmsBalancesHref);

  const reloadReserve = useCallback(async () => {
    setWmsLoading(true);
    try {
      const res = await fetch(session.inventoryReserveHref, {
        headers: buildWorkshop2ApiRequestHeaders(),
        cache: 'no-store',
      });
      const json = (await res.json()) as InventoryReservePayload;
      if (json.ok) {
        const qty = resolveBrandOpInventoryReserveQty(json);
        if (qty != null && qty > 0) {
          setReservedQty(qty);
          setWmsLive(json.inventoryReserve?.reserved === true || qty > 0);
        } else if (json.inventoryReserve?.reserved) {
          setReservedQty(0);
          setWmsLive(true);
        } else {
          const balancesRes = await fetch(session.wmsBalancesHref, {
            headers: buildWorkshop2ApiRequestHeaders(),
            cache: 'no-store',
          });
          const balancesJson = (await balancesRes.json()) as WmsBalancesPayload;
          if (balancesJson.ok && Array.isArray(balancesJson.balances)) {
            const sum = sumWmsReservedQty(balancesJson.balances);
            setReservedQty(sum);
            setWmsLive(sum > 0);
          } else {
            setReservedQty(qty);
            setWmsLive(false);
          }
        }
        if (json.wmsBalancesHref?.trim()) {
          setWmsBalancesHref(json.wmsBalancesHref.trim());
        }
      } else {
        setReservedQty(null);
        setWmsLive(false);
      }
    } catch {
      setReservedQty(null);
      setWmsLive(false);
    } finally {
      setWmsLoading(false);
    }
  }, [session.inventoryReserveHref, session.wmsBalancesHref]);

  useEffect(() => {
    void reloadReserve();
  }, [reloadReserve]);

  return (
    <div className="space-y-3" data-testid={`${testId}-strip`}>
      <div
        className="border-border-subtle flex flex-wrap items-center gap-2 rounded-md border bg-bg-surface2/60 px-3 py-2 text-xs"
        data-testid={`${testId}-wms-reserve-row`}
      >
        <Badge variant="outline" className="text-[9px] uppercase">
          WMS reserve
        </Badge>
        {wmsLoading ? (
          <span className="text-text-muted inline-flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            Загрузка резерва…
          </span>
        ) : (
          <Badge
            variant="outline"
            data-testid={`${testId}-wms-reserve-badge`}
            data-wms-live={wmsLive ? '1' : '0'}
            className={
              reservedQty != null && reservedQty > 0
                ? 'border-emerald-200 bg-emerald-50 text-[10px] text-emerald-900'
                : 'border-amber-200 bg-amber-50 text-[10px] text-amber-900'
            }
          >
            {reservedQty != null && reservedQty > 0
              ? formatPlatformCoreWmsReserveDoneWithQtyRu(reservedQty)
              : 'Резерв WMS · ожидание'}
          </Badge>
        )}
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={session.inventoryReserveHref}
          data-testid={`${testId}-wms-reserve-api-link`}
          className={hubGadget.goldenLink}
        >
          GET inventory/reserve
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={wmsBalancesHref}
          data-testid={`${testId}-wms-balances-api-link`}
          className={hubGadget.goldenLink}
        >
          WMS balances API
        </Link>
        {reservedQty != null && reservedQty > 0 ? (
          <>
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
            <Link
              href={wmsBalancesHref}
              data-testid={WAVE_YH_BRAND_INVENTORY_LEDGER_RESERVE_QTY_LINK_TESTID}
              data-wms-reserved-qty={String(reservedQty)}
              className={hubGadget.goldenLink}
            >
              {formatBrandInventoryLedgerReserveQtyCrossLinkRu(reservedQty)}
            </Link>
          </>
        ) : null}
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={session.supplierProcurementPatchHref}
          data-testid={`${testId}-supplier-patch-link`}
          className={hubGadget.goldenLink}
        >
          Закупка поставщика → PATCH
        </Link>
      </div>
      <PlatformCoreInventoryLedgerStrip
        collectionId={session.collectionId}
        reconcileHref={reconcileHref}
        variant="brand"
        testId={`${testId}-ledger`}
      />
    </div>
  );
}
