'use client';

import { useEffect } from 'react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CommsContextualThreadLink } from '@/components/platform/CommsContextualThreadLink';
import { PillarInsightSteps } from '@/components/platform/PillarInsightPrimitives';
import { B2bChainPhaseBadge } from '@/components/b2b/B2bChainPhaseBadge';
import { Badge } from '@/components/ui/badge';
import { PlatformCoreChainStatusRefreshBadge } from '@/components/platform/PlatformCoreChainStatusRefreshBadge';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { Button } from '@/components/ui/button';
import { downloadB2bRegistryCsv } from '@/lib/platform-core-b2b-registry-csv';
import { filterPlatformCoreShopOrderRows } from '@/lib/platform-core-b2b-registry-url';
import { buildShopOrderCommsSession } from '@/lib/platform-core-ports/b2b/shop-order-comms';
import { SHOP_CO_TRACKING_BRAND_REGISTRY_LINK_TESTID } from '@/lib/platform-core-ports/b2b/brand-co-wave-yg';
import { buildBrandOrderCommsSession } from '@/lib/platform-core-ports/b2b/brand-order-comms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useShopWorkshop2B2bOrdersList } from '@/hooks/use-shop-workshop2-b2b-orders-list';
import {
  usePlatformCoreShopTrackingChains,
  type PlatformCoreShopTrackingChain,
} from '@/hooks/use-platform-core-shop-tracking-chains';
import { formatShopB2bTrackingReserveLabelRu } from '@/lib/platform-core-tracking-reserve-label';
import { ShopCoTrackingChainStatusMirrorBadge } from '@/components/platform/ShopCoTrackingChainStatusMirrorBadge';
import { ShopCoTrackingMaterialsPushStrip } from '@/components/platform/ShopCoTrackingMaterialsPushStrip';
import { PlatformCoreWmsReserveStrip } from '@/components/platform/PlatformCoreWmsReserveStrip';
import {
  shopB2bMatrixReorderHref,
  shopB2bOrderHref,
  shopB2bOrderProductionContextHref,
  shopB2bOrdersProductionRegistryHref,
  shopCalendarB2bOrderContextHref,
  shopMessagesB2bOrderContextHref,
} from '@/lib/platform-core-routes';
import {
  WAVE_YN_BRAND_CHAT_RU,
  WAVE_YN_ORDER_CHAT_RU,
  WAVE_YN_ORDER_CHAT_SHORT_RU,
} from '@/lib/platform-core-ports/platform/wave-yn-comms-contextual-thread';
import { cn } from '@/lib/utils';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopBuyerDeliveryBatchAckPanel } from '@/components/platform/ShopBuyerDeliveryBatchAckPanel';
import { ShopOrderShipmentTrackingStrip } from '@/components/integrations/ShopOrderShipmentTrackingStrip';
import { IntegrationProductionWipStrip } from '@/components/integrations/IntegrationProductionWipStrip';
import { mergeRegistryRowsWithSpineOverlay } from '@/lib/integrations/spine/registry-spine-merge';
import { useB2bRegistryIntegrationOverlay } from '@/hooks/use-b2b-registry-integration-overlay';
import {
  formatWholesaleOrderDisplayId,
  isIntegrationImportedWholesaleOrderId,
} from '@/lib/integrations/spine/integration-ui-utils';
import {
  isPlatformCorePgCheckoutOrderId,
  isPlatformCoreDemoPinOrderId,
} from '@/lib/platform-core-spine-active-order-fallback';
import { isPlatformCorePgB2bOrder } from '@/lib/platform-core-demo-order';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  legacyShopOpTrackingTestId,
  shopCoTrackingTestId,
} from '@/lib/platform-core-shop-co-test-ids';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import { workshop2B2bOrderStatusLabelRu } from '@/lib/platform-core-ports/b2b-order-lifecycle';
import {
  applyShopBuyerChainVisibility,
  getShopProductionVisibilityPolicy,
  type ShopProductionVisibility,
} from '@/lib/platform-core-shop-production-visibility';

function formatTrackingUpdatedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function resolveFocusOrderId(searchParams: URLSearchParams): string | null {
  return searchParams.get('order')?.trim() || searchParams.get('orderId')?.trim() || null;
}

const trackingRowQuickLinkClass =
  'text-accent-primary inline-flex min-h-11 items-center text-[10px] font-semibold uppercase hover:underline sm:min-h-0';

/** Резерв на карточке: PG chain или честный fallback для golden B2B-DEMO после bootstrap. */
function resolveShopTrackingReserveLabel(
  chain: PlatformCoreShopTrackingChain | null | undefined,
  row: { order: string; status: string }
): ReturnType<typeof formatShopB2bTrackingReserveLabelRu> | null {
  if (chain != null) {
    return formatShopB2bTrackingReserveLabelRu({
      status: chain.status,
      handedOff: chain.handedOff,
      inventoryReserved: chain.inventoryReserved,
      inventoryReservedQty: chain.inventoryReservedQty,
      inventoryReserveReason: chain.inventoryReserveReason,
    });
  }
  if (!row.order.startsWith('B2B-DEMO-')) return null;
  if (row.status === 'Подтверждён' || row.status.includes('Подтверж')) {
    return formatShopB2bTrackingReserveLabelRu({
      status: 'confirmed',
      handedOff: true,
      inventoryReserved: false,
      inventoryReserveReason: 'internal_wms_disabled',
    });
  }
  return formatShopB2bTrackingReserveLabelRu({
    status: 'pending',
    handedOff: false,
    inventoryReserved: false,
  });
}

export function PlatformCoreShopB2bTrackingPanel() {
  const coreSlim = isPlatformCoreMode();
  const searchParams = useSearchParams();
  const { collectionId: contextCollectionId } = usePlatformCoreDemoContext();
  const focusOrderId = resolveFocusOrderId(searchParams);
  const orderCommsSession = useMemo(
    () =>
      focusOrderId
        ? buildShopOrderCommsSession({ orderId: focusOrderId, collectionId: contextCollectionId })
        : null,
    [focusOrderId, contextCollectionId]
  );
  const { rows: w2Rows, loadState } = useShopWorkshop2B2bOrdersList(true);
  const integrationOverlay = useB2bRegistryIntegrationOverlay('shop', true);

  const rows = useMemo(() => {
    if (loadState !== 'ready' || !w2Rows) return null;
    const w2Mapped = w2Rows.map((r) => ({
      order: r.order,
      brand: r.brand,
      status: r.status,
      amount: r.amount,
      collectionId: r.collectionId,
      updatedAt: r.updatedAt,
    }));
    const importedMapped = (
      integrationOverlay.loadState === 'ready' ? integrationOverlay.importedShopRows : []
    ).map((o) => ({
      order: o.orderId,
      brand: o.brand,
      status: o.status,
      amount: o.amount,
      collectionId: o.collectionId ?? contextCollectionId,
      updatedAt: new Date().toISOString(),
    }));
    const merged = mergeRegistryRowsWithSpineOverlay(w2Mapped, importedMapped, (r) => r.order);
    const filtered = filterPlatformCoreShopOrderRows(merged, focusOrderId);
    if (
      focusOrderId &&
      !filtered.some((r) => r.order === focusOrderId) &&
      (isPlatformCorePgCheckoutOrderId(focusOrderId) || focusOrderId.startsWith('B2B-DEMO-'))
    ) {
      return [
        {
          order: focusOrderId,
          brand: '—',
          status: '—',
          amount: '—',
          collectionId: contextCollectionId,
          updatedAt: new Date().toISOString(),
        },
        ...filtered,
      ];
    }
    return filtered;
  }, [w2Rows, loadState, integrationOverlay.importedShopRows, contextCollectionId, focusOrderId]);
  const orderIds = rows?.map((r) => r.order) ?? [];
  const {
    chains,
    loading: chainsLoading,
    lastFetchedAt,
    refresh: refreshChains,
    sseConnected,
    chainPollTick,
  } = usePlatformCoreShopTrackingChains(orderIds, { enabled: Boolean(rows?.length) });

  const [focusChainOverride, setFocusChainOverride] =
    useState<PlatformCoreShopTrackingChain | null>(null);

  useEffect(() => {
    if (!focusOrderId) {
      setFocusChainOverride(null);
      return;
    }
    let cancelled = false;
    const headers = buildWorkshop2ApiRequestHeaders();
    void (async () => {
      try {
        const chainRes = await fetch(
          `/api/workshop2/b2b/orders/${encodeURIComponent(focusOrderId)}/chain-status`,
          { headers, cache: 'no-store' }
        );
        if (!chainRes.ok) return;
        const chainJson = (await chainRes.json()) as {
          ok?: boolean;
          chain?: PlatformCoreShopTrackingChain;
        };
        if (!chainJson.ok || !chainJson.chain) return;

        let chain = chainJson.chain;
        const visRes = await fetch(
          `/api/workshop2/b2b/orders/${encodeURIComponent(focusOrderId)}/shop-production-visibility`,
          { headers, cache: 'no-store' }
        );
        if (visRes.ok) {
          const visJson = (await visRes.json()) as {
            ok?: boolean;
            visibility?: ShopProductionVisibility;
          };
          if (visJson.ok && visJson.visibility) {
            chain =
              applyShopBuyerChainVisibility(
                chain,
                getShopProductionVisibilityPolicy(visJson.visibility)
              ) ?? chain;
          }
        }
        if (!cancelled) setFocusChainOverride(chain);
      } catch {
        /* poll hook covers refresh */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [focusOrderId, chainsLoading, lastFetchedAt]);

  const resolvedChains = useMemo(() => {
    if (!focusOrderId || !focusChainOverride) return chains;
    if (chains[focusOrderId]?.steps?.length) return chains;
    return { ...chains, [focusOrderId]: focusChainOverride };
  }, [chains, focusOrderId, focusChainOverride]);

  useEffect(() => {
    if (!focusOrderId) return;
    const el =
      document.querySelector(`[data-testid="shop-co-tracking-row-${focusOrderId}"]`) ??
      document.querySelector(`[data-testid="platform-core-tracking-${focusOrderId}"]`);
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [focusOrderId, rows, resolvedChains]);

  if (loadState === 'idle' || loadState === 'loading' || rows == null) {
    return (
      <p
        className="text-text-secondary py-6 text-center text-sm"
        data-testid="platform-core-tracking-loading"
      >
        Загрузка заказов и статусов цепочки…
      </p>
    );
  }

  if (loadState === 'error' || rows.length === 0) {
    const demoOrderId = PLATFORM_CORE_DEMO.demoOrderId;
    const emptyShop = buildShopOrderCommsSession({
      orderId: demoOrderId,
      collectionId: contextCollectionId,
    });
    const emptyBrand = buildBrandOrderCommsSession({
      orderId: demoOrderId,
      collectionId: contextCollectionId,
    });

    return (
      <Card className="border-amber-200 bg-amber-50/50" data-testid="platform-core-tracking-empty">
        <CardContent className="space-y-2 py-6 text-center text-sm text-amber-900">
          <p>Нет оптовых заказов для отслеживания по этой коллекции.</p>
          <p className="text-xs text-amber-800/80">
            Добавьте параметр order с номером заказа или откройте демо-цепочку ниже.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
            <Link
              href={emptyShop.trackingHref}
              data-testid="shop-tracking-empty-demo-order-link"
              className="text-accent-primary font-medium hover:underline"
            >
              Демо-трекинг
            </Link>
            <Link
              href={shopB2bOrdersProductionRegistryHref()}
              data-testid="shop-tracking-empty-registry-link"
              className="text-accent-primary font-medium hover:underline"
            >
              Реестр заказов
            </Link>
            <Link
              href={emptyShop.matrixHref}
              data-testid="shop-tracking-empty-matrix-link"
              className="text-accent-primary font-medium hover:underline"
            >
              Матрица заказа
            </Link>
            <Link
              href={emptyShop.landedMarginHref}
              data-testid="shop-tracking-empty-margin-link"
              className="text-accent-primary font-medium hover:underline"
            >
              Маржа с доставкой
            </Link>
            <CommsContextualThreadLink
              href={emptyBrand.chatHref}
              orderId={emptyShop.orderId}
              collectionId={contextCollectionId}
              contextualSource="tracking"
              data-testid="shop-tracking-empty-brand-chat-link"
              className="text-accent-primary font-medium hover:underline"
            >
              {WAVE_YN_BRAND_CHAT_RU}
            </CommsContextualThreadLink>
          </div>
        </CardContent>
      </Card>
    );
  }

  function downloadTrackingCsv() {
    if (!rows?.length) return;
    downloadB2bRegistryCsv(
      'shop-b2b-tracking.csv',
      ['order', 'brand', 'collection', 'status', 'po', 'steps_done', 'steps_total', 'updated_at'],
      rows.map((row) => {
        const chain = resolvedChains[row.order];
        const doneCount = chain?.steps?.filter((s) => s.done).length ?? 0;
        const totalSteps = chain?.steps?.length ?? 0;
        return [
          row.order,
          row.brand,
          row.collectionId ?? '',
          row.status,
          chain?.productionOrderId ?? '',
          doneCount,
          totalSteps,
          row.updatedAt ?? '',
        ];
      })
    );
  }

  return (
    <div
      data-testid={shopCoTrackingTestId('list')}
      data-audit-legacy={legacyShopOpTrackingTestId('list')}
      className="min-w-0 space-y-3"
    >
      {focusOrderId ? (
        <div className={hubGadget.goldenPath} data-testid="shop-co-tracking-context-strip" data-audit-legacy="shop-tracking-order-context-strip">
          <Link
            href={shopB2bOrderHref(focusOrderId)}
            data-testid="shop-co-tracking-order-detail-link"
            data-audit-legacy="shop-tracking-order-detail-link"
            className={hubGadget.goldenLink}
          >
            Заказ
          </Link>
          <span className={hubGadget.goldenSep}>·</span>
          <Link
            href={shopB2bOrdersProductionRegistryHref(focusOrderId)}
            data-testid="shop-co-tracking-registry-link"
            data-audit-legacy="shop-tracking-registry-link"
            className={hubGadget.goldenLink}
          >
            Реестр
          </Link>
          <span className={hubGadget.goldenSep}>·</span>
          <Link
            href={shopCalendarB2bOrderContextHref(focusOrderId)}
            data-testid="shop-co-tracking-calendar-link"
            data-audit-legacy="shop-tracking-calendar-link"
            className={hubGadget.goldenLink}
          >
            Календарь
          </Link>
          <span className={hubGadget.goldenSep}>·</span>
          <CommsContextualThreadLink
            href={shopMessagesB2bOrderContextHref(focusOrderId)}
            orderId={focusOrderId}
            collectionId={contextCollectionId}
            contextualSource="tracking"
            data-testid="shop-co-tracking-order-chat-link"
            className={hubGadget.goldenLink}
          >
            {WAVE_YN_ORDER_CHAT_RU}
          </CommsContextualThreadLink>
          {orderCommsSession ? (
            <>
              <span className={hubGadget.goldenSep}>·</span>
              <Link
                href={orderCommsSession.brandRegistryHref}
                data-testid={SHOP_CO_TRACKING_BRAND_REGISTRY_LINK_TESTID}
                className={hubGadget.goldenLink}
              >
                Реестр бренда
              </Link>
            </>
          ) : null}
          {orderCommsSession ? (
            <>
              <span className={hubGadget.goldenSep}>·</span>
              <Link
                href={orderCommsSession.matrixHref}
                data-testid="shop-co-tracking-matrix-link"
                className={hubGadget.goldenLink}
              >
                Матрица
              </Link>
              <span className={hubGadget.goldenSep}>·</span>
              <Link
                href={orderCommsSession.collaborativeApprovalsHref}
                data-testid="shop-co-tracking-collaborative-link"
                className={hubGadget.goldenLink}
              >
                Согласования
              </Link>
              <span className={hubGadget.goldenSep}>·</span>
              <Link
                href={orderCommsSession.landedMarginHref}
                data-testid="shop-co-tracking-margin-link"
                className={hubGadget.goldenLink}
              >
                Маржа
              </Link>
              {focusOrderId && isIntegrationImportedWholesaleOrderId(focusOrderId) ? (
                <>
                  <span className={hubGadget.goldenSep}>·</span>
                  <Link
                    href={orderCommsSession.workingOrderHref}
                    data-testid="shop-co-tracking-working-order-link"
                    className={hubGadget.goldenLink}
                  >
                    Рабочий заказ
                  </Link>
                </>
              ) : null}
              <span className={hubGadget.goldenSep}>·</span>
              <Link
                href={orderCommsSession.replenishmentAtpHref}
                data-testid="shop-co-tracking-replenishment-link"
                className={hubGadget.goldenLink}
              >
                Пополнение
              </Link>
            </>
          ) : null}
        </div>
      ) : null}
      {rows?.length ? (
        <ShopBuyerDeliveryBatchAckPanel
          rows={rows}
          chains={resolvedChains}
          onAcknowledged={() => refreshChains()}
        />
      ) : null}
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        {!coreSlim ? (
          <PlatformCoreChainStatusRefreshBadge
            sseConnected={sseConnected}
            enabled={orderIds.length > 0}
            sseTestId="shop-co-tracking-sse-live-badge"
            pollTestId="shop-co-tracking-poll-badge"
            sseLegacyTestId="shop-tracking-sse-live-badge"
          />
        ) : null}
        {!focusOrderId ? (
          <Link
            href={shopB2bOrdersProductionRegistryHref()}
            data-testid="shop-co-tracking-toolbar-registry-link"
            data-audit-legacy="shop-tracking-toolbar-registry-link"
            className={cn(trackingRowQuickLinkClass, 'justify-center sm:justify-end')}
          >
            Реестр
          </Link>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          className={cn(hubCabinet.workspacePrimaryBtn, 'text-[10px] font-bold uppercase')}
          data-testid="shop-co-tracking-export-csv"
          data-audit-legacy="shop-b2b-tracking-export-csv"
          onClick={downloadTrackingCsv}
        >
          Экспорт CSV
        </Button>
      </div>
      {(rows ?? []).map((row) => {
        const chain = resolvedChains[row.order];
        const doneCount = chain?.steps?.filter((s) => s.done).length ?? 0;
        const totalSteps = chain?.steps?.length ?? 0;
        const reserve = resolveShopTrackingReserveLabel(chain, row);
        const isHubTrackingRow =
          isPlatformCorePgB2bOrder(row.order) ||
          isIntegrationImportedWholesaleOrderId(row.order);
        const materialsStep = chain?.steps?.find((s) => s.id === 'materials_supplied');
        const materialsDone = chain?.materialsSupplied === true || materialsStep?.done === true;
        const materialsPending =
          chain?.handedOff === true && materialsStep != null && !materialsDone;
        const rowFocused = focusOrderId === row.order;
        const showSteps = (chain?.steps?.length ?? 0) > 0;
        const compactHeaderBadges = coreSlim && showSteps;
        return (
          <Card
            key={row.order}
            data-testid={
              rowFocused
                ? shopCoTrackingTestId('focus-row')
                : isHubTrackingRow
                  ? shopCoTrackingTestId(`row-${row.order}`)
                  : undefined
            }
            data-audit-legacy={
              rowFocused
                ? legacyShopOpTrackingTestId('focus-row')
                : isHubTrackingRow
                  ? `platform-core-tracking-${row.order}`
                  : undefined
            }
            className={cn(
              rowFocused
                ? 'border-accent-primary ring-accent-primary/30 border-2 ring-2'
                : 'border-indigo-200/40',
              'min-w-0 overflow-hidden'
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm font-bold">
                    <Link
                      href={shopB2bOrderHref(row.order)}
                      className="text-accent-primary hover:underline"
                    >
                      {formatWholesaleOrderDisplayId(row.order)}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {row.brand} · {row.collectionId ?? '—'} · {row.status}
                    {chain?.productionOrderId ? ` · PO ${chain.productionOrderId}` : null}
                    {!coreSlim && row.updatedAt ? (
                      <span
                        className="text-text-muted block text-[10px]"
                        data-testid={
                          isHubTrackingRow
                            ? `platform-core-tracking-updated-${row.order}`
                            : undefined
                        }
                      >
                        Обновлено: {formatTrackingUpdatedAt(row.updatedAt)}
                      </span>
                    ) : null}
                  </CardDescription>
                  {coreSlim && isHubTrackingRow && chain ? (
                    <ShopCoTrackingChainStatusMirrorBadge
                      orderId={row.order}
                      statusLabel={
                        chain.status
                          ? workshop2B2bOrderStatusLabelRu(
                              chain.status as Parameters<typeof workshop2B2bOrderStatusLabelRu>[0]
                            )
                          : row.status
                      }
                      sseConnected={sseConnected}
                      enabled={Boolean(chain.steps?.length)}
                    />
                  ) : null}
                  {reserve ? (
                    <PlatformCoreWmsReserveStrip
                      variant="tracking"
                      label={reserve.text}
                      tone={reserve.tone}
                      sseLive={Boolean(isHubTrackingRow && sseConnected && chain?.inventoryReserved)}
                      testId={
                        isHubTrackingRow
                          ? `shop-co-tracking-reserve-${row.order}`
                          : `platform-core-tracking-reserve-${row.order}`
                      }
                    />
                  ) : null}
                  {isHubTrackingRow && chain ? (
                    <ShopCoTrackingMaterialsPushStrip
                      orderId={row.order}
                      materialsDone={materialsDone}
                      materialsPending={materialsPending}
                      handedOff={chain.handedOff === true}
                      sseConnected={sseConnected}
                      refreshTick={chainPollTick}
                    />
                  ) : null}
                </div>
                <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-1.5">
                  <Link
                    href={shopCalendarB2bOrderContextHref(row.order)}
                    className={trackingRowQuickLinkClass}
                    data-testid={
                      isHubTrackingRow
                        ? `shop-co-tracking-row-calendar-link-${row.order}`
                        : undefined
                    }
                    data-audit-legacy={
                      isHubTrackingRow ? `shop-co-tracking-calendar-link-${row.order}` : undefined
                    }
                  >
                    Календарь
                  </Link>
                  <CommsContextualThreadLink
                    href={shopMessagesB2bOrderContextHref(row.order)}
                    orderId={row.order}
                    collectionId={row.collectionId ?? contextCollectionId}
                    contextualSource="tracking"
                    className={trackingRowQuickLinkClass}
                    data-testid={
                      isHubTrackingRow
                        ? `shop-co-tracking-row-chat-link-${row.order}`
                        : undefined
                    }
                  >
                    {WAVE_YN_ORDER_CHAT_SHORT_RU}
                  </CommsContextualThreadLink>
                  {chain?.steps?.some((s) => s.id === 'production_po') && !coreSlim ? (
                    <Link
                      href={shopB2bOrderProductionContextHref(row.order)}
                      className={trackingRowQuickLinkClass}
                      data-testid={
                        isHubTrackingRow
                          ? `shop-co-tracking-production-link-${row.order}`
                          : undefined
                      }
                    >
                      Выпуск
                    </Link>
                  ) : null}
                  {isIntegrationImportedWholesaleOrderId(row.order) ? (
                    <Link
                      href={shopB2bMatrixReorderHref(
                        row.collectionId ?? contextCollectionId,
                        row.order
                      )}
                      className={trackingRowQuickLinkClass}
                      data-testid={`shop-co-tracking-working-order-link-${row.order}`}
                    >
                      Матрица заказа
                    </Link>
                  ) : null}
                  {chain ? (
                    <B2bChainPhaseBadge
                      orderStatusLabel={
                        chain.status
                          ? workshop2B2bOrderStatusLabelRu(
                              chain.status as Parameters<typeof workshop2B2bOrderStatusLabelRu>[0]
                            )
                          : row.status
                      }
                      chain={{
                        orderId: row.order,
                        handedOff: chain.handedOff,
                        poStatusLabelRu: chain.poStatusLabelRu,
                        productionOrderId: chain.productionOrderId,
                        inventoryReserved: chain.inventoryReserved,
                        orderStatusLabelRu: workshop2B2bOrderStatusLabelRu(
                          chain.status as Parameters<typeof workshop2B2bOrderStatusLabelRu>[0]
                        ),
                      }}
                    />
                  ) : null}
                  {!compactHeaderBadges && materialsDone ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-300 text-[10px] text-emerald-800"
                      data-testid={
                        isHubTrackingRow
                          ? `shop-co-tracking-materials-badge-${row.order}`
                          : undefined
                      }
                      data-audit-legacy={
                        isHubTrackingRow
                          ? `platform-core-tracking-materials-${row.order}`
                          : undefined
                      }
                    >
                      Материалы подтверждены
                    </Badge>
                  ) : !compactHeaderBadges && materialsPending ? (
                    <Badge
                      variant="outline"
                      className="border-amber-300 text-[10px] text-amber-900"
                      data-testid={
                        isHubTrackingRow
                          ? `shop-co-tracking-materials-pending-${row.order}`
                          : undefined
                      }
                    >
                      Ожидает материалы
                    </Badge>
                  ) : !compactHeaderBadges && totalSteps > 0 ? (
                    <Badge variant="outline" className="text-[10px]">
                      {doneCount}/{totalSteps} этапов
                    </Badge>
                  ) : null}
                  {chain?.buyerDeliveryAcknowledgedAt ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-300 text-[10px] text-emerald-800"
                      data-testid={
                        isHubTrackingRow
                          ? `shop-co-tracking-delivery-ack-badge-${row.order}`
                          : undefined
                      }
                    >
                      Получение подтверждено
                    </Badge>
                  ) : chain?.status === 'shipped' ? (
                    <Badge
                      variant="outline"
                      className="border-amber-300 text-[10px] text-amber-900"
                      data-testid={
                        isHubTrackingRow
                          ? `shop-co-tracking-delivery-pending-${row.order}`
                          : undefined
                      }
                    >
                      Ожидает ack получения
                    </Badge>
                  ) : null}
                </div>
              </div>
              {isIntegrationImportedWholesaleOrderId(row.order) ||
              isPlatformCorePgB2bOrder(row.order) ? (
                <ShopOrderShipmentTrackingStrip wholesaleOrderId={row.order} />
              ) : null}
              {chain?.handedOff && isIntegrationImportedWholesaleOrderId(row.order) ? (
                <IntegrationProductionWipStrip
                  wholesaleOrderId={row.order}
                  productionOrderId={chain.productionOrderId}
                  variant="shop"
                />
              ) : null}
            </CardHeader>
            {chain?.steps?.length ? (
              <CardContent className="min-w-0">
                <PillarInsightSteps
                  steps={chain.steps.map((step) => ({
                    id: step.id,
                    labelRu: step.labelRu,
                    done: step.done,
                  }))}
                  testId={
                    coreSlim || isHubTrackingRow
                      ? `shop-co-tracking-timeline-${row.order}`
                      : undefined
                  }
                />
                {chain.steps.some((s) => s.id === 'materials_supplied' && s.done) ? (
                  <Link
                    href={shopB2bOrderProductionContextHref(row.order)}
                    data-testid={
                      isHubTrackingRow
                        ? `shop-co-tracking-materials-step-link-${row.order}`
                        : undefined
                    }
                    className={cn(
                      trackingRowQuickLinkClass,
                      'mt-2 inline-flex justify-start sm:mt-1'
                    )}
                  >
                    Выпуск
                  </Link>
                ) : null}
              </CardContent>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
