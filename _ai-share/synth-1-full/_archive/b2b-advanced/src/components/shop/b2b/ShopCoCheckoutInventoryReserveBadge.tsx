'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { buildShopInventoryOpsSession } from '@/lib/b2b/shop-inventory-ops';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import {
  formatPlatformCoreWmsStockAtpSourceRu,
  PLATFORM_CORE_WMS_RESERVE_BEFORE_HANDOFF_RU,
  PLATFORM_CORE_WMS_RESERVE_CHECKOUT_RU,
} from '@/lib/platform-core-wms-reserve-copy';
import {
  buildShopCheckoutWmsBalancesHref,
  formatShopCheckoutWmsReserveLiveBadgeRu,
  formatShopCheckoutWmsReserveLiveDetailRu,
  sumShopCheckoutWmsReservedFromAtpRows,
  WAVE_YH_CHECKOUT_WMS_RESERVE_PHASE_PRE_HANDOFF,
  WAVE_YH_SHOP_CO_CHECKOUT_WMS_RESERVE_LIVE_BADGE_TESTID,
  WAVE_YH_SHOP_CO_CHECKOUT_WMS_RESERVE_QTY_LINK_TESTID,
} from '@/lib/platform/wave-yh-wms-reserve-checkout';

type Props = {
  collectionId: string;
  buyerId?: string;
};

type StockAtpPayload = {
  ok?: boolean;
  source?: string;
  messageRu?: string;
  rows?: Array<{ sku: string; reserved?: number; atp?: number }>;
};

/** Wave YH — live WMS reserve qty + ATP на checkout; резерв честно только после handoff (extends VE/UX). */
export function ShopCoCheckoutInventoryReserveBadge({ collectionId, buyerId }: Props) {
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string | null>(null);
  const [atpTotal, setAtpTotal] = useState(0);
  const [reservedTotal, setReservedTotal] = useState(0);

  const inventoryOps = useMemo(
    () => buildShopInventoryOpsSession({ collectionId }),
    [collectionId]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const qs = new URLSearchParams({ collection: collectionId, limit: '24' });
    if (buyerId?.trim()) qs.set('buyerId', buyerId.trim());

    void (async () => {
      try {
        const res = await fetch(`/api/shop/b2b/replenishment/stock-atp?${qs.toString()}`, {
          headers: buildWorkshop2ApiRequestHeaders({ Accept: 'application/json' }),
          cache: 'no-store',
        });
        const json = (await res.json()) as StockAtpPayload;
        if (cancelled) return;
        const rows = json.rows ?? [];
        setSource(json.source ?? null);
        setAtpTotal(rows.reduce((sum, row) => sum + (row.atp ?? 0), 0));
        setReservedTotal(sumShopCheckoutWmsReservedFromAtpRows(rows));
      } catch {
        if (!cancelled) {
          setSource(null);
          setAtpTotal(0);
          setReservedTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [buyerId, collectionId]);

  const liveWms = source === 'wms' || source === 'pg+wms';
  const sourceLabel = formatPlatformCoreWmsStockAtpSourceRu(source);
  const badgeLabel = formatShopCheckoutWmsReserveLiveBadgeRu({
    loading,
    liveWms,
    reservedQty: reservedTotal,
    atpTotal,
  });
  const liveDetail = formatShopCheckoutWmsReserveLiveDetailRu({
    liveWms,
    reservedQty: reservedTotal,
    atpTotal,
  });
  const wmsBalancesHref = buildShopCheckoutWmsBalancesHref(collectionId);

  return (
    <div
      className="border-border-subtle mt-3 space-y-2 rounded-md border bg-bg-surface2/40 px-3 py-2"
      role="note"
      data-testid="shop-co-checkout-inventory-hold"
      data-audit-legacy="shop-b2b-checkout-inventory-hold"
      data-reserve-honest="1"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-muted text-[10px] font-semibold uppercase">Склад · резерв</span>
        <Badge
          variant={liveWms && (reservedTotal > 0 || atpTotal > 0) ? 'secondary' : 'outline'}
          className="text-[9px]"
          data-testid="shop-co-checkout-inventory-badge"
          data-reserve-live={liveWms ? '1' : '0'}
          data-reserve-phase={WAVE_YH_CHECKOUT_WMS_RESERVE_PHASE_PRE_HANDOFF}
          data-wms-reserved-qty={reservedTotal > 0 ? String(reservedTotal) : undefined}
        >
          {badgeLabel}
        </Badge>
        {!loading && liveWms && reservedTotal > 0 ? (
          <Badge
            variant="secondary"
            className="border-emerald-200 bg-emerald-50 text-[9px] text-emerald-900"
            data-testid={WAVE_YH_SHOP_CO_CHECKOUT_WMS_RESERVE_LIVE_BADGE_TESTID}
            data-wms-reserve-live="1"
          >
            {`Live WMS · ${reservedTotal.toLocaleString('ru-RU')} ед.`}
          </Badge>
        ) : null}
        {sourceLabel ? (
          <Badge variant="outline" className="text-[9px]" data-testid="shop-co-checkout-inventory-source">
            {sourceLabel}
          </Badge>
        ) : null}
      </div>
      <p className="max-w-prose text-xs leading-relaxed text-muted-foreground">
        {PLATFORM_CORE_WMS_RESERVE_CHECKOUT_RU}
        {!loading && liveDetail
          ? ` · ${PLATFORM_CORE_WMS_RESERVE_BEFORE_HANDOFF_RU.toLowerCase()} · ${liveDetail}`
          : null}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {!loading && liveWms && reservedTotal > 0 ? (
          <Link
            href={wmsBalancesHref}
            className="text-accent-primary text-[11px] font-medium hover:underline"
            data-testid={WAVE_YH_SHOP_CO_CHECKOUT_WMS_RESERVE_QTY_LINK_TESTID}
          >
            WMS резерв {reservedTotal.toLocaleString('ru-RU')} ед. → balances API
          </Link>
        ) : null}
        <Link
          href={inventoryOps.replenishmentAtpHref}
          className="text-accent-primary text-[11px] font-medium hover:underline"
          data-testid="shop-co-checkout-inventory-s3-link"
          data-audit-wave="shop-co-checkout-wms-replenishment-link"
        >
          Склад · пополнение и остатки →
        </Link>
        <Link
          href={inventoryOps.orderCommsHref}
          className="text-accent-primary text-[11px] font-medium hover:underline"
          data-testid="shop-co-checkout-wms-tracking-link"
        >
          Трекинг · резерв →
        </Link>
      </div>
    </div>
  );
}
