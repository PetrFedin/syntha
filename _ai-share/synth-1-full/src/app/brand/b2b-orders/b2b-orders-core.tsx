'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle } from 'lucide-react';
import {
  ROUTES,
  brandB2bOrderChainContextHref,
  brandB2bOrderHandoffContextHref,
  brandB2bOrderHref,
  brandB2bOrdersAwaitingHandoffRegistryHref,
  brandB2bOrdersProductionRegistryHref,
  brandB2bOrdersRegistryHref,
  brandMessagesB2bOrderContextHref,
  factoryProductionOrdersOrderContextHref,
  shopB2bTrackingOrderHref,
} from '@/lib/routes';
import {
  factoryHandoffQueueHrefForDemo,
  getPlatformCoreDemoByOrderId,
} from '@/lib/platform-core-hub-matrix';
import { B2bOrderThreadPreviewHint } from '@/components/platform/B2bOrderThreadPreviewHint';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { usePlatformCoreEmbeddedWorkspace } from '@/components/platform/PlatformCoreEmbeddedWorkspaceContext';
import { useBrandWorkshop2B2bOrdersList } from '@/hooks/use-brand-workshop2-b2b-orders-list';
import { useWorkshop2PgCollections } from '@/hooks/use-workshop2-pg-collections';
import {
  BRAND_CORE_PENDING_W2_STATUSES,
  BRAND_CORE_W2_COLLECTION_IDS,
  workshop2B2bOrderStatusLabelRu,
  workshop2BuyerLabelRu,
} from '@/lib/order/brand-workshop2-b2b-order-ui';
import { getPlatformCoreCollectionLabel } from '@/lib/platform-core-hub-matrix';
import { ShipWindowBadge } from '@/components/b2b/ShipWindowBadge';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PlatformAiTaskStrip } from '@/components/platform/PlatformAiTaskStrip';
import { useWorkshop2B2bChainSummaries } from '@/hooks/use-workshop2-b2b-chain-summaries';
import { B2bChainPhaseBadge } from '@/components/b2b/B2bChainPhaseBadge';
import { useB2bOrderThreadPreviews } from '@/hooks/use-b2b-order-thread-previews';
import { PLATFORM_CORE_ORDERS_UNAVAILABLE_RU } from '@/lib/platform-core-user-messages';
import { downloadB2bRegistryCsv } from '@/lib/platform-core-b2b-registry-csv';
import { Checkbox } from '@/components/ui/checkbox';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { buildWorkshop2BulkHandoffIdempotencyKey } from '@/lib/production/workshop2-bulk-handoff-idempotency';
import {
  pickB2bRegistryProductionFilter,
  filterPlatformCoreBrandOrderRows,
  resolveB2bRegistryFocusOrderId,
} from '@/lib/platform-core-b2b-registry-url';
import { B2bOrderIntegrationBadge } from '@/components/b2b/B2bOrderIntegrationBadge';
import {
  formatWholesaleOrderDisplayId,
  isIntegrationImportedWholesaleOrderId,
} from '@/lib/integrations/spine/integration-ui-utils';
import { BrandB2bIntegrationsImportToolbar } from '@/components/integrations/BrandB2bIntegrationsImportToolbar';
import { BrandCoRegistryRetailOnboardingStrip } from '@/components/platform/BrandCoRegistryRetailOnboardingStrip';
import { BrandCoRegistryAmendQueueStrip } from '@/components/brand/b2b/BrandCoRegistryAmendQueueStrip';
import { BrandB2bRetailerInvitePanel } from '@/components/brand/b2b/BrandB2bRetailerInvitePanel';
import { BrandCoRegistryShopTrackingPeerStrip } from '@/components/brand/b2b/BrandCoRegistryShopTrackingPeerStrip';
import { BrandOpRegistryProductionStrip } from '@/components/platform/BrandOpRegistryProductionStrip';
import { BrandOpChainSseDedupStrip } from '@/components/platform/BrandOpChainSseDedupStrip';
import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';
import { BRAND_OP_REGISTRY_SSE_DEDUP_STRIP_TESTID } from '@/lib/fashion/brand-op-wave-vq';
import { mergeRegistryRowsWithSpineOverlay } from '@/lib/integrations/spine/registry-spine-merge';
import { useB2bRegistryIntegrationOverlay } from '@/hooks/use-b2b-registry-integration-overlay';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';

function isBrandB2bHandoffEligible(input: {
  status: string;
  handedOff?: boolean;
  orderId?: string;
}): boolean {
  if (input.handedOff === true) return false;
  if (input.status === 'Черновик' || input.status === 'Отменён' || input.status === 'Отгружен') {
    return false;
  }
  if (input.orderId && input.orderId.startsWith('INT-')) {
    return (
      input.status === 'Подтверждён' ||
      input.status === 'confirmed' ||
      input.status === 'На согласовании' ||
      input.status === 'pending_approval'
    );
  }
  return true;
}

export function BrandB2bOrdersCorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productionPillar = searchParams.get('pillar') === 'order_production';
  const coreMode = isPlatformCoreMode();
  const embeddedWorkspace = usePlatformCoreEmbeddedWorkspace();
  const focusOrderId = useMemo(() => resolveB2bRegistryFocusOrderId(searchParams), [searchParams]);
  const focusRowRef = useRef<HTMLTableRowElement>(null);
  const pillarId = productionPillar ? 'order_production' : 'collection_order';
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [collectionFilter, setCollectionFilter] = useState<string>('all');
  const [showOnlyNeedingAction, setShowOnlyNeedingAction] = useState(false);
  const [showAwaitingHandoff, setShowAwaitingHandoff] = useState(
    searchParams.get('filter') === 'awaiting_handoff'
  );
  const [showInProductionOnly, setShowInProductionOnly] = useState(
    searchParams.get('filter') === 'in_production'
  );
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkHandoffBusy, setBulkHandoffBusy] = useState(false);
  const [bulkHandoffMsg, setBulkHandoffMsg] = useState<string | null>(null);
  const [listReloadNonce, setListReloadNonce] = useState(0);
  const { collectionIds: pgCollectionIds, loadState: pgCollectionsLoadState } =
    useWorkshop2PgCollections(true);

  useEffect(() => {
    const partner = searchParams.get('partner')?.trim();
    if (partner) setPartnerFilter(partner);
    const filter = searchParams.get('filter');
    if (filter === 'awaiting_handoff') {
      setShowAwaitingHandoff(true);
      setShowInProductionOnly(false);
    } else if (filter === 'in_production') {
      setShowInProductionOnly(true);
      setShowAwaitingHandoff(false);
    } else if (!filter) {
      setShowAwaitingHandoff(false);
      setShowInProductionOnly(false);
    }
  }, [searchParams]);

  const replaceRegistryUrl = useCallback(
    (patch: {
      awaitingHandoff?: boolean;
      inProduction?: boolean;
      partner?: string;
      order?: string | null;
    }) => {
      const awaiting = patch.awaitingHandoff ?? showAwaitingHandoff;
      const inProd = patch.inProduction ?? showInProductionOnly;
      const filter = pickB2bRegistryProductionFilter({
        awaitingHandoff: awaiting,
        inProduction: inProd,
      });
      const href = brandB2bOrdersRegistryHref({
        productionPillar: productionPillar || Boolean(filter),
        filter,
        order: patch.order !== undefined ? patch.order : focusOrderId,
        partner: patch.partner ?? partnerFilter,
      });
      router.replace(href, { scroll: false });
    },
    [
      focusOrderId,
      partnerFilter,
      productionPillar,
      router,
      showAwaitingHandoff,
      showInProductionOnly,
    ]
  );

  const { rows: w2Rows, partnerIds: apiPartnerIds, loadState: w2LoadState } =
    useBrandWorkshop2B2bOrdersList(true, listReloadNonce, partnerFilter);
  const integrationOverlay = useB2bRegistryIntegrationOverlay('brand', true, listReloadNonce);
  const orders = useMemo(() => {
    if (w2LoadState !== 'ready' || !w2Rows) return [];
    const merged = mergeRegistryRowsWithSpineOverlay(
      w2Rows,
      integrationOverlay.importedBrandRows,
      (r) => r.order
    );
    return filterPlatformCoreBrandOrderRows(merged, focusOrderId).sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  }, [w2Rows, w2LoadState, integrationOverlay.importedBrandRows, focusOrderId]);
  const collectionOptions = useMemo(() => {
    const fromOrders = orders.map((o) => o.collectionId).filter(Boolean);
    const fromPg = pgCollectionIds.filter(Boolean);
    return [...new Set([...BRAND_CORE_W2_COLLECTION_IDS, ...fromPg, ...fromOrders])].sort();
  }, [orders, pgCollectionIds]);
  const partners = useMemo(() => {
    const fromRows = [...new Set(orders.map((o) => o.retailerId).filter(Boolean))] as string[];
    if (fromRows.length) return fromRows.sort();
    const fromApi = apiPartnerIds
      .map((id) => {
        if (/^shop\d/i.test(id)) return id.toLowerCase();
        if (id === 'buyer-demo') return 'shop1';
        return id;
      })
      .filter((id) => /^shop\d/i.test(id));
    return [...new Set(fromApi)].sort();
  }, [orders, apiPartnerIds]);
  const byPartner =
    partnerFilter === 'all'
      ? orders
      : orders.filter(
          (o) => o.retailerId === partnerFilter || o.shop === partnerFilter || o.order === partnerFilter
        );
  const corePendingLabels = BRAND_CORE_PENDING_W2_STATUSES.map(workshop2B2bOrderStatusLabelRu);
  const needingActionCount = orders.filter((o) => corePendingLabels.includes(o.status)).length;
  const allOrderIds = useMemo(() => orders.map((o) => o.order), [orders]);
  const { summaries: chainSummaries } = useWorkshop2B2bChainSummaries(
    allOrderIds,
    true,
    listReloadNonce
  );
  const awaitingHandoffCount = orders.filter(
    (o) => chainSummaries[o.order]?.handedOff !== true && o.status !== 'Черновик'
  ).length;
  const inProductionCount = orders.filter(
    (o) => chainSummaries[o.order]?.handedOff === true
  ).length;
  const filtered = useMemo(() => {
    let rows = showOnlyNeedingAction
      ? byPartner.filter((o) => corePendingLabels.includes(o.status))
      : byPartner;
    if (collectionFilter !== 'all') {
      rows = rows.filter((o) => o.collectionId === collectionFilter);
    }
    if (showAwaitingHandoff) {
      rows = rows.filter(
        (o) => chainSummaries[o.order]?.handedOff !== true && o.status !== 'Черновик'
      );
    }
    if (showInProductionOnly) {
      rows = rows.filter((o) => chainSummaries[o.order]?.handedOff === true);
    }
    return rows;
  }, [
    byPartner,
    showOnlyNeedingAction,
    showAwaitingHandoff,
    showInProductionOnly,
    collectionFilter,
    corePendingLabels,
    chainSummaries,
  ]);

  const registryFallbackOrderId = orders[0]?.order ?? '';
  const { activeOrderId: registryActiveOrderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: registryFallbackOrderId,
    resolveFrom: ['allocation', 'operational', 'handoff'],
    actorRole: 'brand',
    reloadNonce: listReloadNonce,
  });
  const contextOrderId = registryActiveOrderId.trim() || registryFallbackOrderId.trim();
  const { sseConnected: registrySseConnected } = usePlatformCoreChainStatusPoll(
    coreMode && productionPillar && Boolean(contextOrderId),
    contextOrderId ? [contextOrderId] : []
  );

  useEffect(() => {
    if (w2LoadState !== 'ready' || !focusOrderId) return;
    const timer = window.setTimeout(() => {
      focusRowRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [w2LoadState, focusOrderId, filtered.length]);

  const threadPreviews = useB2bOrderThreadPreviews('brand', !coreMode);

  const handoffEligibleIds = useMemo(
    () =>
      filtered
        .filter((o) =>
          isBrandB2bHandoffEligible({
            status: o.status,
            handedOff: chainSummaries[o.order]?.handedOff,
            orderId: o.order,
          })
        )
        .map((o) => o.order),
    [filtered, chainSummaries]
  );

  useEffect(() => {
    setSelectedOrderIds((prev) => prev.filter((id) => handoffEligibleIds.includes(id)));
  }, [handoffEligibleIds]);

  const toggleOrderSelection = (orderId: string, checked: boolean) => {
    setSelectedOrderIds((prev) => {
      if (checked) return [...new Set([...prev, orderId])];
      return prev.filter((id) => id !== orderId);
    });
  };

  const runBulkHandoff = () => {
    if (!selectedOrderIds.length || bulkHandoffBusy) return;
    void (async () => {
      setBulkHandoffBusy(true);
      setBulkHandoffMsg(null);
      try {
        const idempotencyKey = buildWorkshop2BulkHandoffIdempotencyKey(selectedOrderIds);
        const res = await fetch('/api/brand/b2b/orders/bulk-confirm-production-handoff', {
          method: 'POST',
          headers: {
            ...buildWorkshop2ApiRequestHeaders(),
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey,
          },
          body: JSON.stringify({ orderIds: selectedOrderIds, idempotencyKey }),
        });
        const json = (await res.json()) as { ok?: boolean; messageRu?: string };
        setBulkHandoffMsg(json.messageRu ?? (res.ok ? 'Готово.' : 'Ошибка передачи.'));
        if (res.ok) {
          setSelectedOrderIds([]);
          setListReloadNonce((n) => n + 1);
        }
      } catch {
        setBulkHandoffMsg('Ошибка сети при пакетной передаче.');
      } finally {
        setBulkHandoffBusy(false);
      }
    })();
  };

  function downloadRegistryCsv() {
    downloadB2bRegistryCsv(
      'brand-b2b-orders.csv',
      ['order', 'shop', 'date', 'amount', 'status', 'po'],
      filtered.map((o) => [
        o.order,
        o.shop,
        new Date(o.date).toISOString().slice(0, 10),
        o.amount,
        o.status,
        chainSummaries[o.order]?.productionOrderId ?? '',
      ])
    );
  }

  const registryCollectionId =
    collectionFilter !== 'all'
      ? collectionFilter
      : getPlatformCoreDemoByOrderId(contextOrderId || registryFallbackOrderId).collectionId;

  const getStatusVariant = (status: string) => {
    if (status === 'Черновик') return 'secondary';
    if (status === 'Требует внимания') return 'destructive';
    if (status === 'Зарезервировано') return 'default';
    return 'outline';
  };

  const registryPanelTestId = productionPillar
    ? 'brand-op-registry-panel'
    : 'brand-co-registry-panel';
  const registryFocusRowTestId = productionPillar
    ? 'brand-op-registry-focus-row'
    : 'brand-co-registry-focus-row';

  return (
    <CabinetPageContent maxWidth="full" className="w-full pb-16">
      <PlatformCoreListChrome highlightRole="brand" pillarId={pillarId}>
        <div data-testid={registryPanelTestId}>
          {!productionPillar ? (
            <>
              {!embeddedWorkspace ? (
                <>
              <div
                className={hubGadget.goldenPath + ' mb-3'}
                data-testid="brand-co-registry-context-strip"
              >
                {contextOrderId ? (
                  <>
                    <Link
                      href={brandB2bOrderHref(contextOrderId)}
                      data-testid="brand-co-registry-active-order-link"
                      className={hubGadget.goldenLink}
                    >
                      Заказ
                    </Link>
                    <span className={hubGadget.goldenSep} aria-hidden>
                      ·
                    </span>
                  </>
                ) : null}
                <Link
                  href={brandB2bOrdersProductionRegistryHref()}
                  data-testid="brand-co-registry-production-link"
                  className={hubGadget.goldenLink}
                >
                  В производстве
                </Link>
                {contextOrderId ? (
                  <>
                    <span className={hubGadget.goldenSep} aria-hidden>
                      ·
                    </span>
                    <Link
                      href={shopB2bTrackingOrderHref(contextOrderId)}
                      data-testid="brand-co-registry-tracking-link"
                      className={hubGadget.goldenLink}
                    >
                      Трекинг магазина
                    </Link>
                  </>
                ) : null}
              </div>
              <BrandCoRegistryShopTrackingPeerStrip
                collectionId={registryCollectionId}
                orderId={contextOrderId || undefined}
              />
              <BrandCoRegistryAmendQueueStrip
                collectionId={registryCollectionId}
                partner={partnerFilter}
                reloadNonce={listReloadNonce}
              />
              <BrandCoRegistryRetailOnboardingStrip
                collectionId={
                  collectionFilter !== 'all'
                    ? collectionFilter
                    : getPlatformCoreDemoByOrderId(contextOrderId || registryFallbackOrderId)
                        .collectionId
                }
                orderId={contextOrderId || undefined}
              />
                </>
              ) : null}
              {coreMode ? (
                <PlatformAiTaskStrip
                  sectionId="brand-co-registry"
                  pillarId="collection_order"
                  roleId="brand"
                  task="Scan wholesale registry for duplicate MOQ lines and order anomalies"
                  collectionId={
                    collectionFilter !== 'all'
                      ? collectionFilter
                      : getPlatformCoreDemoByOrderId(contextOrderId || registryFallbackOrderId)
                          .collectionId
                  }
                  orderId={contextOrderId || undefined}
                  orders={filtered.slice(0, 12).map((o) => ({
                    orderId: o.order,
                    status: o.status,
                    amount: o.amount,
                    collectionId: o.collectionId,
                  }))}
                  testId="brand-co-registry-ai-anomaly"
                  buttonLabel="Аномалии реестра (AI)"
                />
              ) : null}
              {!embeddedWorkspace ? (
                <div className="mb-3">
                  <BrandB2bRetailerInvitePanel compact />
                </div>
              ) : null}
              {!isPlatformCoreMode() ? (
                <BrandB2bIntegrationsImportToolbar
                  className="mb-3"
                  onImported={() => {
                    setListReloadNonce((n) => n + 1);
                    integrationOverlay.reload();
                  }}
                />
              ) : null}
            </>
          ) : null}
          {productionPillar ? (
            <div
              className={hubGadget.goldenPath + ' mb-3'}
              data-testid="brand-registry-production-context-strip"
            >
              {showInProductionOnly ? (
                <Link
                  href={ROUTES.brand.b2bOrders}
                  data-testid="brand-registry-all-orders-link"
                  className={hubGadget.goldenLink}
                >
                  Все заказы
                </Link>
              ) : (
                <Link
                  href={brandB2bOrdersProductionRegistryHref()}
                  data-testid="brand-registry-in-production-link"
                  className={hubGadget.goldenLink}
                >
                  В производстве
                </Link>
              )}
              <span className={hubGadget.goldenSep} aria-hidden>
                ·
              </span>
              {showAwaitingHandoff ? (
                <Link
                  href={ROUTES.brand.b2bOrders}
                  data-testid="brand-registry-awaiting-handoff-clear-link"
                  className={hubGadget.goldenLink}
                >
                  Сбросить фильтр
                </Link>
              ) : (
                <Link
                  href={brandB2bOrdersAwaitingHandoffRegistryHref()}
                  data-testid="brand-registry-awaiting-handoff-link"
                  className={hubGadget.goldenLink}
                >
                  Ожидает передачу
                </Link>
              )}
              {contextOrderId ? (
                <>
                  <span className={hubGadget.goldenSep} aria-hidden>
                    ·
                  </span>
                  <Link
                    href={shopB2bTrackingOrderHref(contextOrderId)}
                    data-testid="brand-registry-tracking-link"
                    className={hubGadget.goldenLink}
                  >
                    Трекинг
                  </Link>
                </>
              ) : null}
            </div>
          ) : null}
          {productionPillar ? (
            <BrandOpRegistryProductionStrip
              demo={getPlatformCoreDemoByOrderId(contextOrderId || registryFallbackOrderId)}
              contextOrderId={contextOrderId || undefined}
            />
          ) : null}
          {productionPillar && contextOrderId && coreMode ? (
            <BrandOpChainSseDedupStrip
              orderId={contextOrderId}
              sseConnected={registrySseConnected}
              stripTestId={BRAND_OP_REGISTRY_SSE_DEDUP_STRIP_TESTID}
              chainLinkTestId="brand-op-registry-sse-dedup-chain-link"
            />
          ) : null}
          {needingActionCount > 0 || awaitingHandoffCount > 0 ? (
            <div className="flex flex-wrap justify-end gap-2">
              {needingActionCount > 0 ? (
                <Button
                  variant={showOnlyNeedingAction ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'h-8 text-[10px] font-bold uppercase',
                    showOnlyNeedingAction && 'bg-amber-500 hover:bg-amber-600'
                  )}
                  data-testid={
                    productionPillar
                      ? 'brand-op-registry-filter-needing-action'
                      : 'brand-co-registry-filter-needing-action'
                  }
                  onClick={() => setShowOnlyNeedingAction(!showOnlyNeedingAction)}
                >
                  <AlertCircle className="mr-1 h-3.5 w-3.5" /> Внимание ({needingActionCount})
                </Button>
              ) : null}
              {awaitingHandoffCount > 0 ? (
                <Button
                  variant={showAwaitingHandoff ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'h-8 text-[10px] font-bold uppercase',
                    showAwaitingHandoff && 'bg-sky-600 hover:bg-sky-700'
                  )}
                  data-testid={
                    productionPillar
                      ? 'brand-op-registry-filter-awaiting-handoff'
                      : 'brand-co-registry-filter-awaiting-handoff'
                  }
                  data-audit-legacy="brand-b2b-filter-awaiting-handoff"
                  onClick={() => {
                    const next = !showAwaitingHandoff;
                    setShowAwaitingHandoff(next);
                    if (next) setShowInProductionOnly(false);
                    replaceRegistryUrl({
                      awaitingHandoff: next,
                      inProduction: next ? false : false,
                    });
                  }}
                >
                  Ожидает передачу ({awaitingHandoffCount})
                </Button>
              ) : null}
              {inProductionCount > 0 ? (
                <Button
                  variant={showInProductionOnly ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'h-8 text-[10px] font-bold uppercase',
                    showInProductionOnly && 'bg-emerald-600 hover:bg-emerald-700'
                  )}
                  data-testid={
                    productionPillar
                      ? 'brand-op-registry-filter-in-production'
                      : 'brand-co-registry-filter-in-production'
                  }
                  data-audit-legacy="brand-b2b-filter-in-production"
                  onClick={() => {
                    const next = !showInProductionOnly;
                    setShowInProductionOnly(next);
                    if (next) setShowAwaitingHandoff(false);
                    replaceRegistryUrl({
                      inProduction: next,
                      awaitingHandoff: next ? false : false,
                    });
                  }}
                >
                  В производстве ({inProductionCount})
                </Button>
              ) : null}
            </div>
          ) : null}
          <div
            className={cn(
              cabinetSurface.cabinetProfileTabPanel,
              'w-full space-y-6 pb-8',
              coreMode && hubCabinet.workspaceStickyHead,
              coreMode && 'bg-bg-surface/95 sticky top-0 z-20 -mx-1 px-1 backdrop-blur-sm'
            )}
          >
            <div className="flex flex-wrap items-center justify-end gap-2">
              {selectedOrderIds.length > 0 ? (
                <Button
                  size="sm"
                  className="h-8 text-[10px] font-bold uppercase"
                  data-testid="brand-b2b-bulk-handoff"
                  disabled={bulkHandoffBusy}
                  onClick={runBulkHandoff}
                >
                  {bulkHandoffBusy ? 'Передача…' : `Передать в цех (${selectedOrderIds.length})`}
                </Button>
              ) : null}
              {filtered.length > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] font-bold uppercase"
                  data-testid={
                    productionPillar
                      ? 'brand-op-registry-export-csv'
                      : 'brand-co-registry-export-csv'
                  }
                  data-audit-legacy="brand-b2b-registry-export-csv"
                  onClick={downloadRegistryCsv}
                >
                  Экспорт CSV
                </Button>
              ) : null}
              <label
                className="text-text-secondary sr-only text-[10px] font-bold uppercase"
                htmlFor="b2b-partner-filter"
              >
                Партнёр
              </label>
              <select
                id="b2b-collection-filter"
                value={collectionFilter}
                onChange={(e) => setCollectionFilter(e.target.value)}
                data-testid={
                  productionPillar
                    ? 'brand-op-registry-collection-filter'
                    : 'brand-co-registry-collection-filter'
                }
                data-audit-legacy="brand-b2b-collection-filter"
                className="border-border-default min-w-[10rem] rounded-lg border bg-white px-3 py-2 text-sm"
              >
                <option value="all">Все коллекции</option>
                {collectionOptions.map((id) => (
                  <option key={id} value={id}>
                    {getPlatformCoreCollectionLabel(id)}
                  </option>
                ))}
              </select>
              {pgCollectionsLoadState === 'ready' && pgCollectionIds.length > 0 ? (
                <Badge
                  variant="outline"
                  className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-800"
                  data-testid="brand-co-registry-pg-collections-badge"
                >
                  PG · {pgCollectionIds.length} колл.
                </Badge>
              ) : null}
              {pgCollectionsLoadState === 'ready' && partners.length > 1 ? (
                <Badge
                  variant="outline"
                  className="border-sky-200 bg-sky-50 text-[10px] text-sky-800"
                  data-testid="brand-co-registry-pg-partner-badge"
                >
                  PG · {partners.length} партн.
                </Badge>
              ) : null}
              <select
                id="b2b-partner-filter"
                value={partnerFilter}
                onChange={(e) => {
                  const next = e.target.value;
                  setPartnerFilter(next);
                  replaceRegistryUrl({ partner: next });
                }}
                data-testid={
                  productionPillar
                    ? 'brand-op-registry-partner-filter'
                    : 'brand-co-registry-partner-filter'
                }
                className="border-border-default min-w-[10rem] rounded-lg border bg-white px-3 py-2 text-sm"
              >
                <option value="all">Все партнёры</option>
                {partners.map((p) => (
                  <option key={p} value={p}>
                    {workshop2BuyerLabelRu(p)}
                  </option>
                ))}
              </select>
            </div>
            <Card>
              <CardContent className="pt-6">
                {w2LoadState === 'loading' ? (
                  <p className="text-text-secondary py-6 text-center text-sm">
                    Загрузка W2 B2B заказов…
                  </p>
                ) : null}
                {w2LoadState === 'error' ? (
                  <div
                    className="space-y-3 py-4 text-center text-sm"
                    data-testid="brand-b2b-orders-w2-error"
                  >
                    <p className="text-text-secondary">{PLATFORM_CORE_ORDERS_UNAVAILABLE_RU}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-[10px] normal-case"
                      data-testid="brand-b2b-registry-error-retry"
                      onClick={() => setListReloadNonce((n) => n + 1)}
                    >
                      Повторить загрузку
                    </Button>
                  </div>
                ) : null}
                {bulkHandoffMsg ? (
                  <p
                    className="text-text-secondary mb-3 text-xs"
                    data-testid="brand-b2b-bulk-handoff-msg"
                  >
                    {bulkHandoffMsg}
                  </p>
                ) : null}
                {w2LoadState === 'loading' || w2LoadState === 'error' ? null : (
                  <>
                    <div
                      className={cn(
                        coreMode && 'md:hidden lg:block',
                        coreMode && hubCabinet.workspaceTableScroll
                      )}
                      data-testid="brand-co-registry-table-scroll"
                    >
                      <Table>
                        <TableHeader
                          className={
                            coreMode
                              ? cn(hubCabinet.workspaceStickyHead, 'sticky top-0')
                              : undefined
                          }
                        >
                          <TableRow>
                            <TableHead className="w-10">
                              <span className="sr-only">Выбор</span>
                            </TableHead>
                            <TableHead className={cn(coreMode && hubCabinet.workspaceStickyCol)}>
                              Номер
                            </TableHead>
                            <TableHead>Партнёр</TableHead>
                            <TableHead>Окно</TableHead>
                            <TableHead>Дата</TableHead>
                            <TableHead>Сумма</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>ПЗ</TableHead>
                            <TableHead>Цепочка</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filtered.map((order) => {
                            const chain = chainSummaries[order.order];
                            const handedOff = chain?.handedOff === true;
                            const handoffEligible = isBrandB2bHandoffEligible({
                              status: order.status,
                              handedOff: chain?.handedOff,
                              orderId: order.order,
                            });
                            const orderDemo = getPlatformCoreDemoByOrderId(order.order);
                            const rowFocused = focusOrderId != null && order.order === focusOrderId;
                            return (
                              <TableRow
                                key={order.order}
                                ref={rowFocused ? focusRowRef : undefined}
                                data-order={order.order}
                                className={cn(
                                  rowFocused && 'bg-amber-50/60 ring-1 ring-amber-200/80'
                                )}
                                data-testid={
                                  rowFocused
                                    ? registryFocusRowTestId
                                    : order.order.startsWith('B2B-DEMO-')
                                      ? `brand-b2b-order-row-${order.order}`
                                      : undefined
                                }
                                data-audit-legacy={
                                  order.order.startsWith('B2B-DEMO-')
                                    ? `brand-b2b-order-row-${order.order}`
                                    : undefined
                                }
                              >
                                <TableCell>
                                  {handoffEligible ? (
                                    <Checkbox
                                      checked={selectedOrderIds.includes(order.order)}
                                      data-testid={`brand-b2b-order-select-${order.order}`}
                                      onCheckedChange={(checked) =>
                                        toggleOrderSelection(order.order, checked === true)
                                      }
                                      aria-label={`Выбрать заказ ${order.order}`}
                                    />
                                  ) : null}
                                </TableCell>
                                <TableCell
                                  className={cn(
                                    'font-medium',
                                    coreMode && hubCabinet.workspaceStickyCol
                                  )}
                                >
                                  <Link
                                    href={
                                      isIntegrationImportedWholesaleOrderId(order.order)
                                        ? brandB2bOrderHref(order.order)
                                        : handedOff
                                          ? brandB2bOrderChainContextHref(order.order)
                                          : brandB2bOrderHandoffContextHref(order.order)
                                    }
                                    className="text-accent-primary hover:underline"
                                    data-testid={`brand-b2b-order-detail-${order.order}`}
                                  >
                                    {formatWholesaleOrderDisplayId(order.order)}
                                  </Link>
                                  <B2bOrderIntegrationBadge
                                    wholesaleOrderId={order.order}
                                    integration={
                                      order.integration ??
                                      integrationOverlay.integrationByOrderId[order.order]
                                    }
                                  />
                                  {'collectionId' in order && order.collectionId ? (
                                    <span className="text-text-muted ml-2 text-[10px] font-bold uppercase">
                                      {order.collectionId}
                                    </span>
                                  ) : null}
                                </TableCell>
                                <TableCell>{order.shop}</TableCell>
                                <TableCell>
                                  <ShipWindowBadge orderMode={order.orderMode} />
                                </TableCell>
                                <TableCell>
                                  {new Date(order.date).toLocaleDateString('ru-RU')}
                                </TableCell>
                                <TableCell>{order.amount}</TableCell>
                                <TableCell>
                                  <Badge variant={getStatusVariant(order.status) as 'default'}>
                                    {order.status}
                                  </Badge>
                                </TableCell>
                                <TableCell
                                  className="text-[11px] tabular-nums"
                                  data-testid={`brand-b2b-order-po-${order.order}`}
                                >
                                  {chain?.productionOrderId ? (
                                    <Link
                                      href={factoryProductionOrdersOrderContextHref(order.order, {
                                        factoryId: orderDemo.factoryId,
                                      })}
                                      className="text-accent-primary font-medium hover:underline"
                                      data-testid={`brand-b2b-order-po-link-${order.order}`}
                                    >
                                      {chain.productionOrderId}
                                    </Link>
                                  ) : handedOff ? (
                                    <Link
                                      href={factoryHandoffQueueHrefForDemo(orderDemo)}
                                      className="text-emerald-700 hover:underline"
                                      data-testid={`brand-b2b-order-po-link-${order.order}`}
                                    >
                                      Передан
                                    </Link>
                                  ) : (
                                    <span className="text-text-muted">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <B2bChainPhaseBadge
                                    orderStatusLabel={order.status}
                                    chain={chain}
                                  />
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex flex-col items-end gap-0.5">
                                    <div className="flex flex-wrap justify-end gap-x-2 text-[10px] font-semibold uppercase">
                                      {handedOff ? (
                                        <Link
                                          className="text-accent-primary hover:underline"
                                          href={shopB2bTrackingOrderHref(order.order)}
                                          data-testid={`brand-b2b-order-tracking-${order.order}`}
                                        >
                                          Трекинг
                                        </Link>
                                      ) : null}
                                      {!coreMode ? (
                                        <Link
                                          className="text-accent-primary hover:underline"
                                          href={brandMessagesB2bOrderContextHref(order.order)}
                                          data-testid={`brand-b2b-order-chat-${order.order}`}
                                        >
                                          Чат
                                        </Link>
                                      ) : null}
                                      {!handedOff && order.status !== 'Черновик' ? (
                                        <Link
                                          className="text-accent-primary font-semibold hover:underline"
                                          href={brandB2bOrderHandoffContextHref(order.order)}
                                          data-testid={`brand-b2b-order-handoff-${order.order}`}
                                        >
                                          Передача
                                        </Link>
                                      ) : null}
                                    </div>
                                    {!coreMode ? (
                                      <B2bOrderThreadPreviewHint
                                        orderId={order.order}
                                        role="brand"
                                        preview={threadPreviews[order.order]}
                                      />
                                    ) : null}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    {coreMode && w2LoadState === 'ready' ? (
                      <div
                        className={cn('hidden md:grid lg:hidden', hubCabinet.workspaceCardGrid)}
                        data-testid="brand-co-registry-card-grid"
                      >
                        {filtered.length === 0 ? (
                          <p className="text-text-muted col-span-full text-center text-sm">
                            Нет заказов по выбранному фильтру.
                          </p>
                        ) : (
                          filtered.map((order) => {
                            const chain = chainSummaries[order.order];
                            const handedOff = chain?.handedOff === true;
                            const handoffEligible = isBrandB2bHandoffEligible({
                              status: order.status,
                              handedOff: chain?.handedOff,
                              orderId: order.order,
                            });
                            const orderDemo = getPlatformCoreDemoByOrderId(order.order);
                            const rowFocused = focusOrderId != null && order.order === focusOrderId;
                            return (
                              <div
                                key={order.order}
                                ref={rowFocused ? focusRowRef : undefined}
                                data-order={order.order}
                              >
                                <Card
                                  data-testid={
                                    rowFocused
                                      ? registryFocusRowTestId
                                      : order.order.startsWith('B2B-DEMO-')
                                        ? `brand-b2b-order-card-${order.order}`
                                        : undefined
                                  }
                                  className={cn(rowFocused && 'ring-1 ring-amber-200/80')}
                                >
                                  <CardContent className="space-y-2 p-3 text-xs">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <Link
                                          href={
                                            isIntegrationImportedWholesaleOrderId(order.order)
                                              ? brandB2bOrderHref(order.order)
                                              : handedOff
                                                ? brandB2bOrderChainContextHref(order.order)
                                                : brandB2bOrderHandoffContextHref(order.order)
                                          }
                                          className="text-accent-primary font-mono text-sm font-semibold hover:underline"
                                          data-testid={`brand-b2b-order-detail-${order.order}`}
                                        >
                                          {formatWholesaleOrderDisplayId(order.order)}
                                        </Link>
                                        <p className="text-text-muted mt-0.5 truncate">
                                          {order.shop}
                                        </p>
                                      </div>
                                      <Badge variant={getStatusVariant(order.status) as 'default'}>
                                        {order.status}
                                      </Badge>
                                    </div>
                                    <div className="text-text-secondary flex flex-wrap items-center gap-x-2 gap-y-1">
                                      <span>{order.amount}</span>
                                      <span aria-hidden>·</span>
                                      <span>
                                        {new Date(order.date).toLocaleDateString('ru-RU')}
                                      </span>
                                      <ShipWindowBadge orderMode={order.orderMode} />
                                    </div>
                                    <B2bChainPhaseBadge
                                      orderStatusLabel={order.status}
                                      chain={chain}
                                    />
                                    <div className="flex flex-wrap gap-2 pt-1">
                                      {!handedOff && order.status !== 'Черновик' ? (
                                        <Link
                                          className="text-accent-primary text-[10px] font-semibold uppercase hover:underline"
                                          href={brandB2bOrderHandoffContextHref(order.order)}
                                          data-testid={`brand-b2b-order-handoff-${order.order}`}
                                        >
                                          Передача
                                        </Link>
                                      ) : null}
                                      {handedOff ? (
                                        <Link
                                          className="text-accent-primary text-[10px] font-semibold uppercase hover:underline"
                                          href={shopB2bTrackingOrderHref(order.order)}
                                          data-testid={`brand-b2b-order-tracking-${order.order}`}
                                        >
                                          Трекинг
                                        </Link>
                                      ) : null}
                                      {chain?.productionOrderId ? (
                                        <Link
                                          href={factoryProductionOrdersOrderContextHref(
                                            order.order,
                                            {
                                              factoryId: orderDemo.factoryId,
                                            }
                                          )}
                                          className="text-accent-primary text-[10px] font-semibold uppercase hover:underline"
                                          data-testid={`brand-b2b-order-po-link-${order.order}`}
                                        >
                                          ПЗ {chain.productionOrderId}
                                        </Link>
                                      ) : null}
                                    </div>
                                    {handoffEligible ? (
                                      <label className="flex items-center gap-2 pt-1">
                                        <Checkbox
                                          checked={selectedOrderIds.includes(order.order)}
                                          data-testid={`brand-b2b-order-select-${order.order}`}
                                          onCheckedChange={(checked) =>
                                            toggleOrderSelection(order.order, checked === true)
                                          }
                                          aria-label={`Выбрать заказ ${order.order}`}
                                        />
                                        <span className="text-text-muted text-[10px]">
                                          В пакетную передачу
                                        </span>
                                      </label>
                                    ) : null}
                                  </CardContent>
                                </Card>
                              </div>
                            );
                          })
                        )}
                      </div>
                    ) : null}
                  </>
                )}
                {filtered.length === 0 && w2LoadState !== 'loading' && w2LoadState !== 'error' ? (
                  <div
                    className="space-y-2 py-8 text-center text-sm"
                    data-testid="brand-b2b-registry-filter-empty"
                  >
                    <p className="text-text-secondary">Нет заказов по выбранному фильтру.</p>
                    {showAwaitingHandoff || showInProductionOnly ? (
                      <button
                        type="button"
                        className="text-accent-primary text-xs font-medium hover:underline"
                        data-testid="brand-b2b-registry-filter-empty-clear"
                        onClick={() => {
                          setShowAwaitingHandoff(false);
                          setShowInProductionOnly(false);
                          replaceRegistryUrl({ awaitingHandoff: false, inProduction: false });
                        }}
                      >
                        Показать все заказы
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}
