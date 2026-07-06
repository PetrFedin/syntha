'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ROUTES,
  shopB2bOrderHref,
  shopB2bOrderProductionContextHref,
  shopB2bOrdersProductionRegistryHref,
  shopB2bOrdersRegistryHref,
  shopB2bTrackingOrderHref,
  shopMessagesB2bOrderContextHref,
} from '@/lib/routes';
import { useShopWorkshop2B2bOrdersList } from '@/hooks/use-shop-workshop2-b2b-orders-list';
import { useShopCoreBuyerId } from '@/hooks/use-shop-core-buyer-id';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';
import { tid } from '@/lib/ui/test-ids';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PlatformAiTaskStrip } from '@/components/platform/PlatformAiTaskStrip';
import { useWorkshop2B2bChainSummaries } from '@/hooks/use-workshop2-b2b-chain-summaries';
import { B2bChainPhaseBadge } from '@/components/b2b/B2bChainPhaseBadge';
import { PLATFORM_CORE_ORDERS_UNAVAILABLE_RU } from '@/lib/platform-core-user-messages';
import { useB2bOrderThreadPreviews } from '@/hooks/use-b2b-order-thread-previews';
import { B2bOrderThreadPreviewHint } from '@/components/platform/B2bOrderThreadPreviewHint';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { downloadB2bRegistryCsv } from '@/lib/platform-core-b2b-registry-csv';
import {
  filterPlatformCoreShopOrderRows,
  resolveB2bRegistryFocusOrderId,
} from '@/lib/platform-core-b2b-registry-url';
import { B2bOrderIntegrationBadge } from '@/components/b2b/B2bOrderIntegrationBadge';
import {
  formatWholesaleOrderDisplayId,
  isIntegrationImportedWholesaleOrderId,
} from '@/lib/integrations/spine/integration-ui-utils';
import { mergeRegistryRowsWithSpineOverlay } from '@/lib/integrations/spine/registry-spine-merge';
import { useB2bRegistryIntegrationOverlay } from '@/hooks/use-b2b-registry-integration-overlay';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';
import { ShopCoRegistryBuyerCrmOnboardingStrip } from '@/components/shop/b2b/ShopCoRegistryBuyerCrmOnboardingStrip';
import { ShopCoRegistryEmptyGreenfieldMonetizationStrip } from '@/components/shop/b2b/ShopCoRegistryEmptyGreenfieldMonetizationStrip';
import { ShopCoRegistryGreenfieldFocusStrip } from '@/components/shop/b2b/ShopCoRegistryGreenfieldFocusStrip';
import { ShopOpRegistrySpinePeerStrip } from '@/components/platform/ShopOpRegistrySpinePeerStrip';
import { ShopOpOrderStatusSpinePeerStrip } from '@/components/platform/ShopOpOrderStatusSpinePeerStrip';
import { ShopCoGoldenPathStrip } from '@/components/shop/b2b/ShopCoGoldenPathStrip';
import { SHOP_CO_GOLDEN_PATH_LEGACY_BY_SURFACE } from '@/lib/platform/wave-yk-shop-co-golden-path';

export function ShopB2bOrdersCorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productionPillar = searchParams.get('pillar') === 'order_production';
  const coreMode = isPlatformCoreMode();
  const pillarId = productionPillar ? 'order_production' : 'collection_order';
  const focusOrderId = useMemo(() => resolveB2bRegistryFocusOrderId(searchParams), [searchParams]);
  const focusRowRef = useRef<HTMLTableRowElement>(null);
  const [showInProductionOnly, setShowInProductionOnly] = useState(
    searchParams.get('filter') === 'in_production'
  );
  const { buyerId, buyerLabelRu } = useShopCoreBuyerId();
  const { rows: w2Rows, loadState: w2LoadState, reload } = useShopWorkshop2B2bOrdersList(true);
  const integrationOverlay = useB2bRegistryIntegrationOverlay('shop', true);

  const replaceRegistryUrl = useCallback(
    (patch: { inProduction?: boolean; order?: string | null }) => {
      const inProd = patch.inProduction ?? showInProductionOnly;
      const href = shopB2bOrdersRegistryHref({
        productionPillar: productionPillar || inProd,
        filter: inProd ? 'in_production' : null,
        order: patch.order !== undefined ? patch.order : focusOrderId,
      });
      router.replace(href, { scroll: false });
    },
    [focusOrderId, productionPillar, router, showInProductionOnly]
  );

  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'in_production') {
      setShowInProductionOnly(true);
    } else if (!filter) {
      setShowInProductionOnly(false);
    }
  }, [searchParams]);
  const goldenCollectionId = PLATFORM_CORE_DEMO.collectionId;
  const showroomHref = `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(goldenCollectionId)}`;
  const matrixHref = `${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(goldenCollectionId)}`;
  const listOrders = useMemo(() => {
    if (w2LoadState !== 'ready' || !w2Rows) return [];
    const w2Mapped = w2Rows.map((r) => ({
      orderId: r.order,
      brand: r.brand,
      status: r.status,
      amount: r.amount,
      collectionId: r.collectionId ?? goldenCollectionId,
      integration: integrationOverlay.integrationByOrderId[r.order],
    }));
    const importedMapped = integrationOverlay.importedShopRows.map((o) => ({
      orderId: o.orderId,
      brand: o.brand,
      status: o.status,
      amount: o.amount,
      collectionId: o.collectionId ?? goldenCollectionId,
      integration: o.integration,
    }));
    const merged = mergeRegistryRowsWithSpineOverlay(w2Mapped, importedMapped, (r) => r.orderId);
    return filterPlatformCoreShopOrderRows(merged, focusOrderId);
  }, [
    w2Rows,
    w2LoadState,
    goldenCollectionId,
    integrationOverlay.importedShopRows,
    integrationOverlay.integrationByOrderId,
    focusOrderId,
  ]);
  const coreOrderIds = useMemo(() => listOrders.map((o) => o.orderId), [listOrders]);
  const { summaries: chainSummaries } = useWorkshop2B2bChainSummaries(coreOrderIds, true);
  const threadPreviews = useB2bOrderThreadPreviews('shop', !coreMode);
  const inProductionCount = listOrders.filter(
    (o) => chainSummaries[o.orderId]?.handedOff === true
  ).length;
  const visibleOrders = useMemo(
    () =>
      showInProductionOnly
        ? listOrders.filter((o) => chainSummaries[o.orderId]?.handedOff === true)
        : listOrders,
    [listOrders, showInProductionOnly, chainSummaries]
  );
  const registryFallbackOrderId = listOrders[0]?.orderId ?? '';
  const { activeOrderId: registryActiveOrderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: registryFallbackOrderId,
    resolveFrom: ['operational', 'allocation'],
    actorRole: 'shop',
  });
  const contextOrderId = registryActiveOrderId.trim() || registryFallbackOrderId.trim();

  useEffect(() => {
    if (w2LoadState !== 'ready' || !focusOrderId) return;
    const timer = window.setTimeout(() => {
      focusRowRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [w2LoadState, focusOrderId, visibleOrders.length]);

  function downloadRegistryCsv() {
    downloadB2bRegistryCsv(
      'shop-b2b-orders.csv',
      ['order', 'brand', 'collection', 'amount', 'status', 'po'],
      visibleOrders.map((o) => [
        o.orderId,
        o.brand,
        o.collectionId ?? '',
        o.amount,
        o.status,
        chainSummaries[o.orderId]?.productionOrderId ?? '',
      ])
    );
  }

  function orderDetailHref(orderId: string, handedOff: boolean): string {
    if (isIntegrationImportedWholesaleOrderId(orderId)) {
      return shopB2bOrderHref(orderId);
    }
    return handedOff ? shopB2bOrderProductionContextHref(orderId) : ROUTES.shop.b2bOrder(orderId);
  }

  const registryPanelTestId = productionPillar
    ? 'shop-op-registry-panel'
    : 'shop-co-registry-panel';
  const registryFocusRowTestId = productionPillar
    ? 'shop-op-registry-focus-row'
    : 'shop-co-registry-focus-row';

  return (
    <div data-testid={tid.page('shop-b2b-orders')}>
      <PlatformCoreListChrome highlightRole="shop" pillarId={pillarId}>
        <div data-testid={registryPanelTestId}>
          <div className="mb-3">
            <ShopOpRegistrySpinePeerStrip
              collectionId={goldenCollectionId}
              orderId={contextOrderId || undefined}
            />
          </div>
          {productionPillar && contextOrderId ? (
            <div className="mb-3">
              <ShopOpOrderStatusSpinePeerStrip
                collectionId={goldenCollectionId}
                orderId={contextOrderId}
              />
            </div>
          ) : null}
          <div
            className={cn(
              'mb-3 flex flex-wrap items-center justify-between gap-2',
              coreMode && cn(hubCabinet.workspaceStickyHead, 'sticky top-0 z-10 -mx-1 px-1')
            )}
          >
            {!productionPillar ? (
              <>
                <ShopCoGoldenPathStrip
                  collectionId={goldenCollectionId}
                  orderId={contextOrderId || undefined}
                  activeStep="registry"
                  omitStep="registry"
                  stripTestId={SHOP_CO_GOLDEN_PATH_LEGACY_BY_SURFACE.registry.strip}
                  className="mb-3"
                  legacyLinkTestIds={{
                    matrix: SHOP_CO_GOLDEN_PATH_LEGACY_BY_SURFACE.registry.matrix,
                    tracking: SHOP_CO_GOLDEN_PATH_LEGACY_BY_SURFACE.registry.tracking,
                  }}
                />
                {coreMode ? (
                  <PlatformAiTaskStrip
                    sectionId="shop-co-registry"
                    pillarId="collection_order"
                    roleId="shop"
                    task="Detect registry order anomalies: MOQ violations and duplicate lines"
                    collectionId={goldenCollectionId}
                    orderId={contextOrderId || undefined}
                    orders={visibleOrders.slice(0, 12).map((o) => ({
                      orderId: o.orderId,
                      status: o.status,
                      amount: o.amount,
                      collectionId: o.collectionId,
                    }))}
                    testId="shop-co-registry-ai-anomaly"
                    buttonLabel="Аномалии реестра (AI)"
                  />
                ) : null}
              </>
            ) : (
              <div
                className={hubGadget.goldenPath + ' mb-3'}
                data-testid="shop-registry-production-context-strip"
                data-audit-legacy="shop-op-registry-context-strip"
              >
                <Link
                  href={ROUTES.shop.b2bTracking}
                  data-testid="shop-registry-tracking-link"
                  className={hubGadget.goldenLink}
                >
                  Трекинг
                </Link>
                <span className={hubGadget.goldenSep} aria-hidden>
                  ·
                </span>
                {showInProductionOnly ? (
                  <Link
                    href={ROUTES.shop.b2bOrders}
                    data-testid="shop-registry-all-orders-link"
                    className={hubGadget.goldenLink}
                  >
                    Все заказы
                  </Link>
                ) : (
                  <Link
                    href={shopB2bOrdersProductionRegistryHref()}
                    data-testid="shop-registry-in-production-link"
                    className={hubGadget.goldenLink}
                  >
                    В производстве
                  </Link>
                )}
              </div>
            )}
            <div className="ml-auto flex flex-wrap justify-end gap-2">
              {inProductionCount > 0 ? (
                <Button
                  variant={showInProductionOnly ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'h-8 text-[10px] font-bold uppercase',
                    showInProductionOnly && 'bg-sky-600 hover:bg-sky-700'
                  )}
                  data-testid={
                    productionPillar
                      ? 'shop-op-registry-filter-in-production'
                      : 'shop-co-registry-filter-in-production'
                  }
                  data-audit-legacy="shop-b2b-filter-in-production"
                  onClick={() => {
                    const next = !showInProductionOnly;
                    setShowInProductionOnly(next);
                    replaceRegistryUrl({ inProduction: next });
                  }}
                >
                  В производстве ({inProductionCount})
                </Button>
              ) : null}
              {visibleOrders.length > 0 && w2LoadState === 'ready' ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] font-bold uppercase"
                  data-testid={
                    productionPillar ? 'shop-op-registry-export-csv' : 'shop-co-registry-export-csv'
                  }
                  data-audit-legacy="shop-b2b-registry-export-csv"
                  onClick={downloadRegistryCsv}
                >
                  Экспорт CSV
                </Button>
              ) : null}
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              {focusOrderId && !productionPillar && coreMode ? (
                <ShopCoRegistryGreenfieldFocusStrip
                  orderId={focusOrderId}
                  collectionId={goldenCollectionId}
                  buyerId={buyerId}
                />
              ) : null}
              {w2LoadState === 'ready' && visibleOrders.length > 0 ? (
                <p className="text-text-muted mb-4 text-xs">{visibleOrders.length} заказ(ов)</p>
              ) : null}
              {w2LoadState === 'loading' ? (
                <p className="text-text-secondary py-6 text-center text-sm">
                  Загрузка W2 B2B заказов…
                </p>
              ) : null}
              {w2LoadState === 'error' ? (
                <div
                  className="space-y-3 py-4 text-center text-sm"
                  data-testid="shop-b2b-orders-w2-error"
                >
                  <p className="text-text-secondary">{PLATFORM_CORE_ORDERS_UNAVAILABLE_RU}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-[10px] normal-case"
                    data-testid="shop-b2b-registry-error-retry"
                    onClick={() => reload()}
                  >
                    Повторить загрузку
                  </Button>
                </div>
              ) : null}
              {listOrders.length > 0 &&
              visibleOrders.length === 0 &&
              showInProductionOnly &&
              w2LoadState === 'ready' ? (
                <div
                  className="border-border-subtle space-y-2 rounded-lg border border-dashed px-4 py-6 text-center"
                  data-testid="shop-b2b-registry-filter-empty"
                >
                  <p className="text-sm font-medium">Нет заказов в производстве</p>
                  <p className="text-text-secondary text-xs">
                    Заказы появятся после передачи брендом в цех — откройте трекинг или снимите
                    фильтр.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 text-[10px] font-semibold uppercase">
                    <Link
                      href={ROUTES.shop.b2bTracking}
                      data-testid="shop-b2b-registry-filter-empty-tracking"
                      className="text-accent-primary hover:underline"
                    >
                      Трекинг
                    </Link>
                    <button
                      type="button"
                      className="text-accent-primary hover:underline"
                      data-testid="shop-b2b-registry-filter-empty-clear"
                      onClick={() => {
                        setShowInProductionOnly(false);
                        replaceRegistryUrl({ inProduction: false });
                      }}
                    >
                      Все заказы
                    </button>
                  </div>
                </div>
              ) : null}
              {listOrders.length === 0 && w2LoadState === 'ready' ? (
                <div
                  className="space-y-3"
                  data-testid="shop-co-registry-empty-onboarding"
                  data-audit-legacy="shop-b2b-registry-empty-onboarding"
                >
                  <p className="text-sm font-medium">Пока нет оптовых заказов</p>
                  <p className="text-text-secondary text-xs leading-relaxed">
                    {coreMode
                      ? 'После checkout заказы появятся здесь.'
                      : `${buyerLabelRu}: реестр заполняется после checkout — без ручного seed.`}
                  </p>
                  {coreMode ? (
                    <ShopCoRegistryEmptyGreenfieldMonetizationStrip
                      buyerId={buyerId}
                      collectionId={goldenCollectionId}
                      showroomHref={showroomHref}
                      matrixHref={matrixHref}
                    />
                  ) : (
                    <ShopCoRegistryBuyerCrmOnboardingStrip
                      buyerId={buyerId}
                      collectionId={goldenCollectionId}
                      showroomHref={showroomHref}
                      matrixHref={matrixHref}
                    />
                  )}
                </div>
              ) : null}
              {w2LoadState === 'ready' ? (
                <>
                  <div
                    className={cn(
                      coreMode && 'md:hidden lg:block',
                      coreMode && hubCabinet.workspaceTableScroll
                    )}
                    data-testid="shop-co-registry-table-scroll"
                  >
                    {visibleOrders.length > 0 ? (
                      <table className="w-full min-w-[40rem] text-sm">
                        <thead
                          className={
                            isPlatformCoreMode() ? hubCabinet.workspaceStickyHead : undefined
                          }
                        >
                          <tr className="border-border-default border-b">
                            <th
                              className={cn(
                                'py-2 text-left font-medium',
                                isPlatformCoreMode() && hubCabinet.workspaceStickyCol
                              )}
                            >
                              Номер
                            </th>
                            <th className="py-2 text-left font-medium">Бренд</th>
                            <th className="py-2 text-left font-medium">Статус</th>
                            <th className="py-2 text-left font-medium">ПЗ</th>
                            <th className="py-2 text-left font-medium">Цепочка</th>
                            <th className="py-2 text-right font-medium">Сумма</th>
                            <th className="whitespace-nowrap py-2 text-right font-medium">
                              Действия
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleOrders.map((o) => {
                            const chain = chainSummaries[o.orderId];
                            const handedOff = chain?.handedOff === true;
                            const poId = chain?.productionOrderId;
                            const rowFocused = focusOrderId != null && o.orderId === focusOrderId;

                            return (
                              <tr
                                key={o.orderId}
                                ref={rowFocused ? focusRowRef : undefined}
                                data-order={o.orderId}
                                data-testid={
                                  rowFocused
                                    ? registryFocusRowTestId
                                    : o.orderId.startsWith('B2B-DEMO-')
                                      ? `shop-b2b-order-row-${o.orderId}`
                                      : undefined
                                }
                                data-audit-legacy={
                                  o.orderId.startsWith('B2B-DEMO-')
                                    ? `shop-b2b-order-row-${o.orderId}`
                                    : undefined
                                }
                                className={cn(
                                  'border-border-subtle border-b',
                                  rowFocused && 'bg-amber-50/60 ring-1 ring-amber-200/80'
                                )}
                              >
                                <td
                                  className={cn(
                                    'py-2 font-mono',
                                    isPlatformCoreMode() && hubCabinet.workspaceStickyCol
                                  )}
                                >
                                  <Link
                                    className="text-accent-primary hover:underline"
                                    href={orderDetailHref(o.orderId, handedOff)}
                                    data-testid={
                                      o.orderId.startsWith('B2B-DEMO-')
                                        ? `shop-b2b-order-detail-${o.orderId}`
                                        : undefined
                                    }
                                  >
                                    {formatWholesaleOrderDisplayId(o.orderId)}
                                  </Link>
                                  <B2bOrderIntegrationBadge
                                    wholesaleOrderId={o.orderId}
                                    integration={o.integration}
                                  />
                                  {o.collectionId ? (
                                    <span className="text-text-muted ml-2 text-[10px] font-bold uppercase">
                                      {o.collectionId}
                                    </span>
                                  ) : null}
                                </td>
                                <td className="py-2">{o.brand}</td>
                                <td className="py-2">
                                  <Badge variant="secondary" className="text-[9px]">
                                    {o.status}
                                  </Badge>
                                </td>
                                <td
                                  className="py-2 text-[11px] tabular-nums"
                                  data-testid={`shop-b2b-order-po-${o.orderId}`}
                                >
                                  {poId ? (
                                    <Link
                                      href={shopB2bTrackingOrderHref(o.orderId)}
                                      className="text-accent-primary font-medium hover:underline"
                                      data-testid={`shop-b2b-order-po-link-${o.orderId}`}
                                    >
                                      {poId}
                                    </Link>
                                  ) : handedOff ? (
                                    <Link
                                      href={shopB2bTrackingOrderHref(o.orderId)}
                                      className="text-emerald-700 hover:underline"
                                      data-testid={`shop-b2b-order-po-link-${o.orderId}`}
                                    >
                                      Передан
                                    </Link>
                                  ) : (
                                    <span className="text-text-muted">—</span>
                                  )}
                                </td>
                                <td className="py-2">
                                  <B2bChainPhaseBadge orderStatusLabel={o.status} chain={chain} />
                                </td>
                                <td className="py-2 text-right font-medium">{o.amount}</td>
                                <td className="py-2 text-right">
                                  <div className="flex flex-col items-end gap-0.5">
                                    <div className="flex flex-wrap justify-end gap-x-2 text-[10px] font-semibold uppercase">
                                      <Link
                                        className="text-accent-primary hover:underline"
                                        href={shopB2bTrackingOrderHref(o.orderId)}
                                        data-testid={`shop-b2b-order-tracking-${o.orderId}`}
                                      >
                                        Трекинг
                                      </Link>
                                      {!coreMode && handedOff ? (
                                        <Link
                                          className="text-accent-primary hover:underline"
                                          href={shopB2bOrderProductionContextHref(o.orderId)}
                                          data-testid={`shop-b2b-order-production-${o.orderId}`}
                                        >
                                          Выпуск
                                        </Link>
                                      ) : null}
                                      {!coreMode ? (
                                        <Link
                                          className="text-accent-primary hover:underline"
                                          href={shopMessagesB2bOrderContextHref(o.orderId)}
                                          data-testid={`shop-b2b-order-chat-${o.orderId}`}
                                        >
                                          Чат
                                        </Link>
                                      ) : null}
                                    </div>
                                    {!coreMode ? (
                                      <B2bOrderThreadPreviewHint
                                        orderId={o.orderId}
                                        role="shop"
                                        preview={threadPreviews[o.orderId]}
                                      />
                                    ) : null}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-text-muted py-4 text-center text-sm md:hidden lg:block">
                        Нет заказов по выбранному фильтру.
                      </p>
                    )}
                  </div>
                  {coreMode ? (
                    <div
                      className={cn('hidden md:grid lg:hidden', hubCabinet.workspaceCardGrid)}
                      data-testid="shop-co-registry-card-grid"
                    >
                      {visibleOrders.length === 0 ? (
                        <p className="text-text-muted col-span-full text-center text-sm">
                          Нет заказов по выбранному фильтру.
                        </p>
                      ) : (
                        visibleOrders.map((o) => {
                          const chain = chainSummaries[o.orderId];
                          const handedOff = chain?.handedOff === true;
                          const poId = chain?.productionOrderId;
                          const rowFocused = focusOrderId != null && o.orderId === focusOrderId;
                          return (
                            <div
                              key={o.orderId}
                              ref={rowFocused ? focusRowRef : undefined}
                              data-order={o.orderId}
                            >
                              <Card
                                data-testid={
                                  rowFocused
                                    ? registryFocusRowTestId
                                    : o.orderId.startsWith('B2B-DEMO-')
                                      ? `shop-b2b-order-card-${o.orderId}`
                                      : undefined
                                }
                                className={cn(rowFocused && 'ring-1 ring-amber-200/80')}
                              >
                                <CardContent className="space-y-2 p-3 text-xs">
                                  <div className="flex items-start justify-between gap-2">
                                    <Link
                                      className="text-accent-primary font-mono text-sm font-semibold hover:underline"
                                      href={orderDetailHref(o.orderId, handedOff)}
                                      data-testid={
                                        o.orderId.startsWith('B2B-DEMO-')
                                          ? `shop-b2b-order-detail-${o.orderId}`
                                          : undefined
                                      }
                                    >
                                      {formatWholesaleOrderDisplayId(o.orderId)}
                                    </Link>
                                    <Badge variant="secondary" className="text-[9px]">
                                      {o.status}
                                    </Badge>
                                  </div>
                                  <p className="text-text-muted truncate">{o.brand}</p>
                                  <div className="text-text-secondary flex flex-wrap items-center gap-x-2">
                                    <span className="font-medium">{o.amount}</span>
                                    {o.collectionId ? (
                                      <span className="text-[10px] font-bold uppercase">
                                        {o.collectionId}
                                      </span>
                                    ) : null}
                                  </div>
                                  <B2bChainPhaseBadge orderStatusLabel={o.status} chain={chain} />
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    <Link
                                      className="text-accent-primary text-[10px] font-semibold uppercase hover:underline"
                                      href={shopB2bTrackingOrderHref(o.orderId)}
                                      data-testid={`shop-b2b-order-tracking-${o.orderId}`}
                                    >
                                      Трекинг
                                    </Link>
                                    {poId ? (
                                      <Link
                                        href={shopB2bTrackingOrderHref(o.orderId)}
                                        className="text-accent-primary text-[10px] font-semibold uppercase hover:underline"
                                        data-testid={`shop-b2b-order-po-link-${o.orderId}`}
                                      >
                                        ПЗ {poId}
                                      </Link>
                                    ) : null}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          );
                        })
                      )}
                    </div>
                  ) : null}
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </PlatformCoreListChrome>
    </div>
  );
}
