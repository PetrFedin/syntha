'use client';

import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Circle, FileText, Package } from 'lucide-react';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PlatformCoreWmsReserveStrip } from '@/components/platform/PlatformCoreWmsReserveStrip';
import { PlatformCoreTerm } from '@/components/platform/PlatformCoreTerm';
import {
  PLATFORM_CORE_DEMO,
  factoryHandoffQueueHrefForDemo,
  factoryMaterialsHrefForDemo,
  factoryMaterialsProcurementHrefForDemo,
  resolvePlatformCoreCollectionId,
} from '@/lib/platform-core-hub-matrix';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { buildWorkshop2SupplierBulkConfirmIdempotencyKey } from '@/lib/production/workshop2-supplier-bulk-confirm-idempotency';
import { WAVE_WI_SUP_BULK_CONFIRM_DEDUP_HINT_RU } from '@/lib/platform/wave-wi-supplier-partial-ship';
import {
  WAVE_WP_SUP_BOM_PO_BULK_CONFIRM_DEDUP_HINT_RU,
  WAVE_WP_SUP_BOM_PO_BULK_CONFIRM_DEDUP_HINT_TESTID,
  WAVE_WP_SUP_BOM_PO_PROGRESS_TESTID,
  shouldShowSupOpBomPoBulkConfirmDedupHint,
  shouldShowSupOpBrandInventoryLedgerPeer,
} from '@/lib/platform/wave-wp-sup-bom-po-progress';
import {
  buildSupOpCommsTailHref,
  buildSupOpProcurementHonestChainSteps,
  buildSupOpTrackingTailHref,
} from '@/lib/platform/wave-yj-sup-op-procurement-chain';
import {
  ROUTES,
  brandB2bOrderHandoffContextHref,
  factoryCoreOrderProductionCabinetHref,
  factoryMessagesB2bOrderContextHref,
  factoryProductionDossierContextHref,
  factoryProductionHandoffQueueHref,
  factoryProductionOrdersOrderContextHref,
  factorySupplierCoreOrderProductionCabinetHref,
  factorySupplierMessagesB2bOrderContextHref,
  factorySupplierMessagesWorkshop2ArticleContextHref,
  shopB2bCheckoutCollectionHref,
  shopB2bTrackingOrderHref,
} from '@/lib/routes';
import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';
import { useWorkshop2B2bChainSummaries } from '@/hooks/use-workshop2-b2b-chain-summaries';
import { useWorkshop2B2bOrderDetail } from '@/hooks/use-workshop2-b2b-order-detail';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';
import { isIntegrationImportedWholesaleOrderId } from '@/lib/integrations/spine/integration-ui-utils';
import { fetchSpineOperationalOrderDetail } from '@/lib/integrations/spine/spine-production-forecast-lines';
import { uniqueArticleScopesFromB2bOrder } from '@/lib/production/workshop2-b2b-order-lifecycle';
import { workshop2ArticleHref } from '@/lib/production/workshop2-url';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { B2bChainPhaseBadge } from '@/components/b2b/B2bChainPhaseBadge';
import { SupplierAltMaterialsApprovalPanel } from '@/components/factory/supplier/SupplierAltMaterialsApprovalPanel';
import {
  buildBrandDevBomAltMaterialApprovalHref,
  buildMaterialsAltMaterialsCatalogHref,
  buildSupplierDevBomCabinetAltMaterialHref,
  WAVE_XW_ALT_MATERIALS_NOTE_RU,
} from '@/lib/platform/wave-xw-sup-alt-material-approval';
import { SupplierMaterialsPriceJournalHonestStrip } from '@/components/factory/supplier/SupplierMaterialsPriceJournalHonestStrip';
import { SupplierPriceDeltaAlertStrip } from '@/components/factory/supplier/SupplierPriceDeltaAlertStrip';
import { SupDevCompareSuppliersP2Strip } from '@/components/factory/supplier/SupDevCompareSuppliersP2Strip';
import { SupDevMaterialsCoPeerStrip } from '@/components/factory/supplier/SupDevMaterialsCoPeerStrip';
import { SupOpBomPoChainPeerStrip } from '@/components/factory/supplier/SupOpBomPoChainPeerStrip';
import { SupOpChainWorkspacePeerStrip } from '@/components/factory/supplier/SupOpChainWorkspacePeerStrip';
import { SupOpProcurementBrandInventoryLedgerPeerStrip } from '@/components/factory/supplier/SupOpProcurementBrandInventoryLedgerPeerStrip';
import { SupOpProcurementCoPeerStrip } from '@/components/factory/supplier/SupOpProcurementCoPeerStrip';
import { SupOpProcurementChainStepsStrip } from '@/components/factory/supplier/SupOpProcurementChainStepsStrip';
import { SupplierBulkConfirmProgressStrip } from '@/components/factory/supplier/SupplierBulkConfirmProgressStrip';
import { SupplierProcurementBrandNotifyStrip } from '@/components/factory/supplier/SupplierProcurementBrandNotifyStrip';
import { SupplierPartialShipConfirmStrip } from '@/components/factory/supplier/SupplierPartialShipConfirmStrip';
import { SupplierBackorderBadge } from '@/components/factory/supplier/SupplierBackorderBadge';
import { ManufacturerMaterialsBomPoPeerStrip } from '@/components/factory/ManufacturerMaterialsBomPoPeerStrip';
import { MfrOpMaterialsCoSpinePeerStrip } from '@/components/factory/MfrOpMaterialsCoSpinePeerStrip';
import { MfrOpMaterialsSupplierPatchStrip } from '@/components/factory/MfrOpMaterialsSupplierPatchStrip';
import { workshop2B2bOrderStatusLabelRu } from '@/lib/production/workshop2-b2b-order-lifecycle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlatformCoreChainStatusRefreshBadge } from '@/components/platform/PlatformCoreChainStatusRefreshBadge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SupplierProcurementSpineStrip } from '@/components/integrations/SupplierProcurementSpineStrip';
import {
  PLATFORM_CORE_BOM_UNAVAILABLE_RU,
  PLATFORM_CORE_HANDOFF_QUEUE_UNAVAILABLE_RU,
} from '@/lib/platform-core-user-messages';
import {
  computeSupplierBomFillRatePercent,
  computeSupplierBomWeightedFillRatePercent,
  extractSupplierAltMaterials,
  extractSupplierMaterialPricePoints,
  type SupplierBomLineInput,
} from '@/lib/platform-core-supplier-materials-reference';
import {
  extractSupplierMaterialPriceJournalFromDossierEvents,
  type SupplierMaterialPriceJournalEntry,
} from '@/lib/platform-core-supplier-material-price-journal';
import { factoryHandoffPoStatusLabelRu } from '@/lib/production/workshop2-factory-handoff-po-status';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type BomLine = {
  materialName?: string;
  quantity?: number;
  unit?: 'm' | 'm2' | 'kg' | 'pcs' | 'set';
  yieldPerUnit?: number;
  consumption?: number;
  unitCostNet?: number;
  currency?: string;
  supplier?: string;
  substitutes?: (string | { id: string; name: string })[];
};

type HandoffRow = {
  b2bOrderId: string;
  productionOrderId?: string;
  qty?: number;
  status?: string;
};

export function FactoryMaterialsCorePage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const view = searchParams.get('view') === 'procurement' ? 'procurement' : 'development';
  const collectionId = resolvePlatformCoreCollectionId(searchParams.get('collection'));
  const articleId = searchParams.get('article') ?? PLATFORM_CORE_DEMO.demoArticleId;
  const poId = searchParams.get('po') ?? PLATFORM_CORE_DEMO.productionOrderId;
  const factoryId = PLATFORM_CORE_DEMO.factoryId;
  const urlOrderId = searchParams.get('order')?.trim() ?? searchParams.get('orderId')?.trim() ?? '';
  const { activeOrderId: spineOrderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: urlOrderId,
    resolveFrom: ['handoff'],
    factoryId,
  });
  const orderId = urlOrderId || spineOrderId;
  const activeRole =
    searchParams.get('role') === 'supplier' ? ('supplier' as const) : ('manufacturer' as const);
  const highlightRole = activeRole;

  const [bomLines, setBomLines] = useState<BomLine[]>([]);
  const [bomState, setBomState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [handoff, setHandoff] = useState<HandoffRow | null>(null);
  const [handoffState, setHandoffState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [handoffReloadNonce, setHandoffReloadNonce] = useState(0);
  const [confirmState, setConfirmState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [supplyAlreadyConfirmed, setSupplyAlreadyConfirmed] = useState(false);
  const [bulkConfirmProgress, setBulkConfirmProgress] = useState<{
    confirmed: number;
    total: number;
  } | null>(null);
  const [partialShipMeta, setPartialShipMeta] = useState<{
    qty?: number;
    backorder?: boolean;
  } | null>(null);
  const [priceJournal, setPriceJournal] = useState<SupplierMaterialPriceJournalEntry[]>([]);
  const [priceJournalState, setPriceJournalState] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const chainOrderIds = useMemo(
    () => (view === 'procurement' && orderId ? [orderId] : []),
    [view, orderId]
  );
  const { order: b2bOrder } = useWorkshop2B2bOrderDetail(orderId, view === 'procurement', {
    collectionFallback: collectionId,
  });
  const orderArticleScopes = useMemo(
    () => (b2bOrder ? uniqueArticleScopesFromB2bOrder(b2bOrder) : []),
    [b2bOrder]
  );
  const multiArticleOrder = orderArticleScopes.length > 1;
  const { summaries: chainSummaries } = useWorkshop2B2bChainSummaries(
    chainOrderIds,
    view === 'procurement'
  );
  const {
    tick: chainPollTick,
    refresh: refreshChainStatus,
    sseConnected: chainSseConnected,
  } = usePlatformCoreChainStatusPoll(view === 'procurement' && Boolean(orderId), chainOrderIds);
  const [procurementChainSteps, setProcurementChainSteps] = useState<
    Array<{ id: string; labelRu: string; done: boolean }>
  >([]);

  useEffect(() => {
    if (view !== 'procurement' || !orderId) {
      setProcurementChainSteps([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/b2b/orders/${encodeURIComponent(orderId)}/chain-status`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as {
          ok?: boolean;
          chain?: { steps?: Array<{ id: string; labelRu: string; done: boolean }> };
        };
        if (!cancelled && json.ok && json.chain?.steps) {
          setProcurementChainSteps(json.chain.steps);
        } else if (!cancelled) {
          setProcurementChainSteps([]);
        }
      } catch {
        if (!cancelled) setProcurementChainSteps([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [view, orderId, chainPollTick]);

  useEffect(() => {
    if (!collectionId || !articleId) return;
    let cancelled = false;
    setBomState('loading');
    (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(articleId)}/dossier`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as {
          ok?: boolean;
          dossier?: { productionModel?: { materialLines?: BomLine[] } };
        };
        if (!cancelled) {
          if (json.ok && json.dossier) {
            setBomLines(json.dossier.productionModel?.materialLines ?? []);
            setBomState('ready');
          } else {
            setBomState('error');
          }
        }
      } catch {
        if (!cancelled) setBomState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId, articleId]);

  useEffect(() => {
    if (view !== 'procurement') return;
    let cancelled = false;
    setHandoffState('loading');
    (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/factory/production-handoff-queue?factoryId=${encodeURIComponent(factoryId)}`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as { ok?: boolean; items?: HandoffRow[] };
        if (!cancelled) {
          if (json.ok && json.items) {
            const hit =
              json.items.find((i) => i.b2bOrderId === orderId) ??
              json.items.find((i) => i.productionOrderId === poId) ??
              null;
            if (hit) {
              setHandoff(hit);
              setHandoffState('ready');
            } else if (isIntegrationImportedWholesaleOrderId(orderId)) {
              const spine = await fetchSpineOperationalOrderDetail(orderId);
              const lineQty = spine?.lines.find((l) => l.articleId === articleId)?.qty;
              if (spine && lineQty && lineQty > 0) {
                setHandoff({
                  b2bOrderId: orderId,
                  qty: lineQty,
                  status: spine.status,
                });
                setHandoffState('ready');
              } else {
                setHandoff(null);
                setHandoffState('ready');
              }
            } else {
              setHandoff(null);
              setHandoffState('ready');
            }
          } else {
            setHandoffState('error');
          }
        }
      } catch {
        if (!cancelled) setHandoffState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [view, factoryId, orderId, poId, handoffReloadNonce, chainPollTick, articleId]);

  useEffect(() => {
    if (view !== 'procurement' || !collectionId || !articleId) return;
    let cancelled = false;
    const reqBase = `/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(articleId)}/sample-material-request`;
    void (async () => {
      try {
        const res = await fetch(reqBase, {
          headers: buildWorkshop2ApiRequestHeaders(),
          cache: 'no-store',
        });
        const json = (await res.json()) as {
          ok?: boolean;
          requisitions?: Array<{ status: string }>;
        };
        if (cancelled || !json.ok) return;
        const reqs = json.requisitions ?? [];
        const confirmed = (s: string) =>
          s === 'supplier_confirmed' || s === 'confirmed' || s === 'supplier_rejected';
        const allDone = reqs.length > 0 && reqs.every((r) => confirmed(r.status));
        if (allDone) {
          setSupplyAlreadyConfirmed(true);
          setConfirmState('done');
        }
      } catch {
        /* optional preload */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [view, collectionId, articleId]);

  useEffect(() => {
    if (view !== 'development' || !collectionId || !articleId) return;
    let cancelled = false;
    setPriceJournalState('loading');
    void (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(articleId)}/events?limit=40`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as {
          ok?: boolean;
          events?: Array<{
            eventType: string;
            createdAt: string;
            eventPayload?: Record<string, unknown> | null;
          }>;
        };
        if (!cancelled) {
          if (json.ok && Array.isArray(json.events)) {
            setPriceJournal(extractSupplierMaterialPriceJournalFromDossierEvents(json.events));
            setPriceJournalState('ready');
          } else {
            setPriceJournal([]);
            setPriceJournalState('error');
          }
        }
      } catch {
        if (!cancelled) {
          setPriceJournal([]);
          setPriceJournalState('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [view, collectionId, articleId]);

  const poQty = handoff?.qty ?? 0;

  const supplierBomLines = useMemo((): readonly SupplierBomLineInput[] => {
    const out: SupplierBomLineInput[] = [];
    for (const line of bomLines) {
      const materialName = line.materialName?.trim();
      if (!materialName) continue;
      out.push({
        materialName,
        role: 'other',
        isPrimary: true,
        consumption: line.consumption,
        yieldPerUnit: line.yieldPerUnit,
        unit: line.unit,
        unitCostNet: line.unitCostNet,
        currency: line.currency,
        supplier: line.supplier,
        substitutes: line.substitutes,
      });
    }
    return out;
  }, [bomLines]);

  const bomFillRate = useMemo(
    () => computeSupplierBomFillRatePercent(supplierBomLines),
    [supplierBomLines]
  );
  const bomWeightedFillRate = useMemo(
    () => computeSupplierBomWeightedFillRatePercent(supplierBomLines),
    [supplierBomLines]
  );
  const bomFilledCount = useMemo(
    () =>
      bomLines.filter(
        (line) =>
          Boolean(line.materialName?.trim()) &&
          (line.yieldPerUnit ?? line.consumption ?? line.quantity ?? 0) > 0
      ).length,
    [bomLines]
  );
  const bomTotalCount = bomLines.length;
  const pricePoints = useMemo(
    () => extractSupplierMaterialPricePoints(supplierBomLines),
    [supplierBomLines]
  );
  const priceJournalActive = priceJournal.length > 0;
  const altMaterials = useMemo(
    () => extractSupplierAltMaterials(supplierBomLines),
    [supplierBomLines]
  );

  const procurementLines = useMemo(() => {
    if (view !== 'procurement' || poQty <= 0) return [];
    return bomLines.map((line) => {
      const perUnit = line.yieldPerUnit ?? line.consumption ?? line.quantity ?? 0;
      return {
        ...line,
        perUnit,
        required: perUnit * poQty,
      };
    });
  }, [view, bomLines, poQty]);

  const dossierHref =
    collectionId && articleId
      ? factoryProductionDossierContextHref(articleId, {
          collectionId,
          orderId,
        })
      : null;

  const pillarId = view === 'procurement' ? 'order_production' : 'development';
  const demoCtx = {
    ...PLATFORM_CORE_DEMO,
    collectionId,
    demoArticleId: articleId,
    demoOrderId: orderId,
    productionOrderId: poId,
  };
  const developmentHref = factoryMaterialsHrefForDemo(demoCtx);
  const procurementHref = factoryMaterialsProcurementHrefForDemo(
    demoCtx,
    activeRole === 'supplier' ? { role: 'supplier' } : undefined
  );
  const cabinetBackHref =
    activeRole === 'supplier'
      ? view === 'procurement'
        ? factorySupplierCoreOrderProductionCabinetHref(collectionId)
        : `${EXTENDED_ROUTES.factory.supplierCoreCabinet}?pillar=development&collection=${encodeURIComponent(collectionId)}`
      : view === 'procurement'
        ? factoryCoreOrderProductionCabinetHref(collectionId)
        : `${EXTENDED_ROUTES.factory.productionCoreCabinet}?pillar=development&collection=${encodeURIComponent(collectionId)}`;
  const cabinetBackLabel =
    activeRole === 'supplier'
      ? 'Кабинет · закупка'
      : view === 'procurement'
        ? 'Кабинет · выпуск'
        : 'Кабинет · производство';
  const chainMeta = chainSummaries[orderId];
  const materialsSuppliedDone =
    procurementChainSteps.find((s) => s.id === 'materials_supplied')?.done === true;
  const inventoryReservedDone =
    procurementChainSteps.find((s) => s.id === 'inventory_reserved')?.done === true;
  const supplierMaterialsConfirmed =
    materialsSuppliedDone || confirmState === 'done' || supplyAlreadyConfirmed;
  const showSupplierPartialShipStrip =
    isPlatformCoreMode() &&
    activeRole === 'supplier' &&
    handoffState === 'ready' &&
    Boolean(handoff) &&
    !supplierMaterialsConfirmed &&
    poQty > 0;
  const supplierChainSteps = useMemo(
    () =>
      buildSupOpProcurementHonestChainSteps({
        apiSteps: procurementChainSteps,
        inventoryReservedDone,
        materialsSuppliedDone,
        showPartialShipPath: showSupplierPartialShipStrip,
        partialShipDone:
          confirmState === 'done' || supplyAlreadyConfirmed || Boolean(partialShipMeta),
        bulkConfirmDone: confirmState === 'done' || supplyAlreadyConfirmed || materialsSuppliedDone,
      }),
    [
      procurementChainSteps,
      inventoryReservedDone,
      materialsSuppliedDone,
      showSupplierPartialShipStrip,
      confirmState,
      supplyAlreadyConfirmed,
      partialShipMeta,
    ]
  );
  const showSupOpBomPoBulkConfirmDedupHint = shouldShowSupOpBomPoBulkConfirmDedupHint({
    platformCoreMode: isPlatformCoreMode(),
    role: activeRole,
    showPartialShipStrip: showSupplierPartialShipStrip,
    materialsConfirmed: supplierMaterialsConfirmed,
    poQty,
    handoffReady: handoffState === 'ready' && Boolean(handoff),
  });
  const showSupOpBrandInventoryLedgerPeer = shouldShowSupOpBrandInventoryLedgerPeer({
    platformCoreMode: isPlatformCoreMode(),
    role: activeRole,
    view,
    materialsConfirmed: supplierMaterialsConfirmed,
  });

  function procurementHrefForArticle(scopeArticleId: string, scopeCollectionId?: string) {
    const params = new URLSearchParams();
    params.set('collection', scopeCollectionId ?? collectionId);
    params.set('article', scopeArticleId);
    params.set('view', 'procurement');
    params.set('po', poId);
    params.set('order', orderId);
    params.set('orderId', orderId);
    if (activeRole === 'supplier') params.set('role', 'supplier');
    return `${EXTENDED_ROUTES.factory.productionMaterials}?${params.toString()}`;
  }

  async function confirmMaterialSupply() {
    if (confirmState === 'loading') return;
    if (!multiArticleOrder && (!collectionId || !articleId)) return;
    setConfirmState('loading');
    setBulkConfirmProgress({ confirmed: 0, total: Math.max(bomTotalCount, 1) });
    const idempotencyKey = buildWorkshop2SupplierBulkConfirmIdempotencyKey({
      b2bOrderId: orderId,
      collectionId: multiArticleOrder ? undefined : collectionId,
      articleId: multiArticleOrder ? undefined : articleId,
      productionOrderId: poId,
      confirmAllArticles: multiArticleOrder,
    });
    const headers = {
      ...buildWorkshop2ApiRequestHeaders(),
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    };

    try {
      const res = await fetch('/api/workshop2/supplier/material-request/bulk-confirm', {
        method: 'POST',
        headers,
        body: JSON.stringify(
          multiArticleOrder
            ? {
                b2bOrderId: orderId,
                productionOrderId: poId,
                confirmAllArticles: true,
                idempotencyKey,
                updatedBy: 'supplier-procurement',
              }
            : {
                collectionId,
                articleId,
                b2bOrderId: orderId,
                productionOrderId: poId,
                idempotencyKey,
                updatedBy: 'supplier-procurement',
              }
        ),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        confirmed?: number;
        idempotent?: number;
        messageRu?: string;
      };
      if (!res.ok || !json.ok) {
        throw new Error('bulk_confirm_failed');
      }

      const allIdempotent = (json.confirmed ?? 0) === 0 && (json.idempotent ?? 0) > 0;
      setBulkConfirmProgress({
        confirmed: (json.confirmed ?? 0) + (json.idempotent ?? 0),
        total: Math.max(bomTotalCount, 1),
      });
      setConfirmState('done');
      setSupplyAlreadyConfirmed(true);
      refreshChainStatus();
      toast({
        title: allIdempotent ? 'Уже подтверждено' : 'Поставка подтверждена',
        description:
          json.messageRu ??
          (allIdempotent
            ? 'Повторное подтверждение не изменило статус в базе.'
            : 'Статус отражён в цепочке заказа.'),
      });
    } catch {
      setConfirmState('idle');
      toast({
        title: 'Не удалось подтвердить',
        description: PLATFORM_CORE_BOM_UNAVAILABLE_RU,
        variant: 'destructive',
      });
    }
  }

  return (
    <div
      className={cn(hubCabinet.listChrome, 'pb-safe overflow-x-clip p-3 md:p-4')}
      data-testid={view === 'procurement' ? 'materials-procurement-view' : 'factory-materials-core'}
      data-view={view}
    >
      <PlatformCoreListChrome
        highlightRole={highlightRole}
        pillarId={pillarId}
        backHref={cabinetBackHref}
        backLabel={cabinetBackLabel}
      >
        <nav
          aria-label="Срез материалов"
          className={cn(
            hubCabinet.workspacePillarStrip,
            hubCabinet.pillarNavPillRow,
            'w-full min-w-0'
          )}
          data-testid="materials-view-switcher"
        >
          <Link
            href={developmentHref}
            className={cn(
              hubCabinet.pillarPill,
              view === 'development'
                ? 'bg-accent-primary/10 text-accent-primary'
                : 'text-text-secondary hover:bg-bg-surface2'
            )}
            data-testid="materials-view-development"
          >
            BOM образца
          </Link>
          <Link
            href={procurementHref}
            className={cn(
              hubCabinet.pillarPill,
              view === 'procurement'
                ? 'bg-accent-primary/10 text-accent-primary'
                : 'text-text-secondary hover:bg-bg-surface2'
            )}
            data-testid="materials-view-procurement"
          >
            Закупка под PO
          </Link>
        </nav>

        {view === 'development' && isPlatformCoreMode() ? (
          <div
            className={cn(
              hubGadget.goldenPath,
              hubCabinet.workspaceTableScroll,
              'max-md:flex-nowrap'
            )}
            data-testid={
              activeRole === 'supplier'
                ? 'sup-dev-materials-context-strip'
                : 'mfr-dev-materials-context-strip'
            }
          >
            <Link
              href={cabinetBackHref}
              data-testid={
                activeRole === 'supplier'
                  ? 'sup-dev-materials-cabinet-link'
                  : 'mfr-dev-materials-cabinet-link'
              }
              className={hubGadget.goldenLink}
            >
              Кабинет
            </Link>
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
            {dossierHref ? (
              <>
                <Link
                  href={dossierHref}
                  data-testid={
                    activeRole === 'supplier'
                      ? 'sup-dev-materials-dossier-link'
                      : 'mfr-dev-materials-dossier-link'
                  }
                  className={hubGadget.goldenLink}
                >
                  Досье
                </Link>
                <span className={hubGadget.goldenSep} aria-hidden>
                  ·
                </span>
              </>
            ) : null}
            {activeRole === 'supplier' && collectionId && articleId ? (
              <Link
                href={workshop2ArticleHref(collectionId, articleId, { w2sec: 'materials' })}
                data-testid="sup-dev-materials-brand-bom-link"
                className={hubGadget.goldenLink}
              >
                BOM бренда
              </Link>
            ) : null}
          </div>
        ) : null}

        {view === 'development' &&
        activeRole === 'supplier' &&
        isPlatformCoreMode() &&
        collectionId &&
        articleId ? (
          <div className="mb-2">
            <SupDevMaterialsCoPeerStrip
              collectionId={collectionId}
              articleId={articleId}
              orderId={orderId || undefined}
            />
          </div>
        ) : null}

        {view === 'development' &&
        activeRole === 'supplier' &&
        priceJournalState === 'ready' &&
        !priceJournalActive &&
        collectionId &&
        articleId ? (
          <SupplierMaterialsPriceJournalHonestStrip
            collectionId={collectionId}
            articleId={articleId}
            orderId={orderId || undefined}
            hasUnitCostFallback={pricePoints.length > 0}
          />
        ) : null}

        {view === 'development' &&
        activeRole === 'supplier' &&
        isPlatformCoreMode() &&
        collectionId &&
        articleId ? (
          <div className="mb-2 space-y-2">
            <SupplierPriceDeltaAlertStrip collectionId={collectionId} articleId={articleId} />
            <SupDevCompareSuppliersP2Strip collectionId={collectionId} articleId={articleId} />
          </div>
        ) : null}

        {view === 'procurement' &&
        activeRole === 'supplier' &&
        supplierChainSteps.length > 0 &&
        isPlatformCoreMode() ? (
          <div className="mb-2 space-y-2">
            <SupOpProcurementChainStepsStrip
              steps={supplierChainSteps}
              orderId={orderId}
              collectionId={collectionId}
              articleId={articleId}
              productionOrderId={poId}
              sseConnected={chainSseConnected}
              pollEnabled={Boolean(orderId)}
            />
            <SupOpChainWorkspacePeerStrip
              collectionId={collectionId}
              articleId={articleId}
              orderId={orderId || undefined}
              productionOrderId={poId}
            />
          </div>
        ) : null}

        {view === 'procurement' &&
        activeRole === 'supplier' &&
        supplierChainSteps.length > 0 &&
        !isPlatformCoreMode() ? (
          <Card data-testid="sup-op-chain-workspace" className="border-emerald-200/50">
            <CardContent className="space-y-2 p-3">
              <PlatformCoreChainStatusRefreshBadge
                sseConnected={chainSseConnected}
                enabled={Boolean(orderId)}
                sseTestId="sup-op-chain-sse-live-badge"
                pollTestId="sup-op-chain-poll-badge"
                sseLegacyTestId="sup-op-chain-workspace-sse-badge"
              />
              <SupOpChainWorkspacePeerStrip
                collectionId={collectionId}
                articleId={articleId}
                orderId={orderId || undefined}
              />
              <ul className="space-y-1.5" data-testid="sup-op-chain-workspace-steps">
                {supplierChainSteps.map((step) => (
                  <li
                    key={step.id}
                    className="flex flex-wrap items-start gap-x-2 gap-y-0.5 text-xs"
                    data-testid={`platform-core-chain-step-${step.id}`}
                    data-done={step.done ? 'true' : 'false'}
                  >
                    {step.done ? (
                      <CheckCircle2
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"
                        aria-hidden
                      />
                    ) : (
                      <Circle className="text-text-muted mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    )}
                    <span>{step.labelRu}</span>
                    {step.id === 'materials_supplied' && step.done ? (
                      <>
                        <Link
                          href={buildSupOpTrackingTailHref({ orderId, productionOrderId: poId })}
                          data-testid="sup-op-procurement-materials-tracking-link"
                          data-comms-tail-po={poId}
                          className="text-accent-primary text-[10px] font-medium hover:underline"
                        >
                          Трекинг
                        </Link>
                        <Link
                          href={buildSupOpCommsTailHref({
                            orderId,
                            collectionId,
                            sectionId: 'sup-op-chain',
                            productionOrderId: poId,
                          })}
                          data-testid="sup-op-chain-workspace-brand-chat-link"
                          data-comms-tail-po={poId}
                          className="text-accent-primary text-[10px] font-medium hover:underline"
                        >
                          Чат бренду
                        </Link>
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        {view === 'procurement' && activeRole === 'supplier' && isPlatformCoreMode() && orderId ? (
          <div className="mb-2 space-y-2">
            <SupOpProcurementCoPeerStrip
              collectionId={collectionId}
              articleId={articleId}
              orderId={orderId}
              factoryId={factoryId}
            />
            <SupOpProcurementBrandInventoryLedgerPeerStrip
              collectionId={collectionId}
              articleId={articleId}
              orderId={orderId}
              productionOrderId={poId}
            />
          </div>
        ) : null}

        {view === 'procurement' && activeRole === 'supplier' ? (
          <div
            className={cn(
              isPlatformCoreMode()
                ? cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')
                : 'flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'
            )}
            data-testid="sup-op-procurement-context-strip"
          >
            <Link
              href={factorySupplierCoreOrderProductionCabinetHref(collectionId)}
              data-testid="sup-op-procurement-cabinet-link"
              className={
                isPlatformCoreMode()
                  ? hubGadget.goldenLink
                  : 'text-accent-primary font-medium hover:underline'
              }
            >
              {isPlatformCoreMode() ? 'Кабинет' : 'Кабинет · закупка'}
            </Link>
            {isPlatformCoreMode() ? (
              <span className={hubGadget.goldenSep} aria-hidden>
                ·
              </span>
            ) : null}
            <Link
              href={factoryHandoffQueueHrefForDemo(demoCtx)}
              data-testid="sup-op-procurement-handoff-link"
              className={
                isPlatformCoreMode()
                  ? hubGadget.goldenLink
                  : 'text-accent-primary font-medium hover:underline'
              }
            >
              {isPlatformCoreMode() ? 'Очередь' : 'Очередь передачи'}
            </Link>
            {dossierHref ? (
              <>
                {isPlatformCoreMode() ? (
                  <span className={hubGadget.goldenSep} aria-hidden>
                    ·
                  </span>
                ) : null}
                <Link
                  href={dossierHref}
                  data-testid="sup-op-procurement-dossier-link"
                  className={
                    isPlatformCoreMode()
                      ? hubGadget.goldenLink
                      : 'text-accent-primary font-medium hover:underline'
                  }
                >
                  {isPlatformCoreMode() ? 'Спецификация' : 'Досье · BOM'}
                </Link>
              </>
            ) : null}
            {!isPlatformCoreMode() ? (
              <>
                <Link
                  href={factorySupplierMessagesWorkshop2ArticleContextHref(collectionId, articleId)}
                  data-testid="sup-op-procurement-article-chat-link"
                  className="text-accent-primary font-medium hover:underline"
                >
                  Чат · артикул
                </Link>
                <Link
                  href={buildSupOpCommsTailHref({
                    orderId,
                    collectionId,
                    sectionId: 'sup-op-procurement',
                    productionOrderId: poId,
                  })}
                  data-testid="sup-op-procurement-brand-chat-link"
                  data-comms-tail-po={poId}
                  className="text-accent-primary font-medium hover:underline"
                >
                  Чат бренду
                </Link>
              </>
            ) : null}
            {isPlatformCoreMode() ? (
              <span className={hubGadget.goldenSep} aria-hidden>
                ·
              </span>
            ) : null}
            <Link
              href={buildSupOpTrackingTailHref({ orderId, productionOrderId: poId })}
              data-testid="sup-op-procurement-tracking-link"
              data-comms-tail-po={poId}
              className={
                isPlatformCoreMode()
                  ? hubGadget.goldenLink
                  : 'text-accent-primary font-medium hover:underline'
              }
            >
              Трекинг
            </Link>
          </div>
        ) : null}

        {view === 'procurement' && activeRole === 'manufacturer' && orderId ? (
          <ManufacturerMaterialsBomPoPeerStrip
            demo={{
              ...PLATFORM_CORE_DEMO,
              demoOrderId: orderId,
              collectionId,
              demoArticleId: articleId,
            }}
            orderId={orderId}
          />
        ) : null}

        {view === 'procurement' &&
        activeRole === 'manufacturer' &&
        orderId &&
        isPlatformCoreMode() ? (
          <MfrOpMaterialsCoSpinePeerStrip
            factoryId={factoryId}
            collectionId={collectionId}
            orderId={orderId}
            articleId={articleId}
          />
        ) : null}

        {view === 'procurement' && activeRole === 'manufacturer' && !isPlatformCoreMode() ? (
          <div
            className={cn(
              isPlatformCoreMode()
                ? cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')
                : 'flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'
            )}
            data-testid="mfr-op-materials-context-strip"
          >
            <Link
              href={factoryProductionOrdersOrderContextHref(orderId, { factoryId })}
              data-testid="mfr-op-materials-prod-orders-link"
              className={
                isPlatformCoreMode()
                  ? hubGadget.goldenLink
                  : 'text-accent-primary font-medium hover:underline'
              }
            >
              Заказы
            </Link>
            {isPlatformCoreMode() ? (
              <span className={hubGadget.goldenSep} aria-hidden>
                ·
              </span>
            ) : null}
            <Link
              href={factoryProductionHandoffQueueHref(orderId, { factoryId, collectionId })}
              data-testid="mfr-op-materials-handoff-link"
              className={
                isPlatformCoreMode()
                  ? hubGadget.goldenLink
                  : 'text-accent-primary font-medium hover:underline'
              }
            >
              Очередь
            </Link>
            {dossierHref ? (
              <>
                {isPlatformCoreMode() ? (
                  <span className={hubGadget.goldenSep} aria-hidden>
                    ·
                  </span>
                ) : null}
                <Link
                  href={dossierHref}
                  data-testid="mfr-op-materials-dossier-link"
                  className={
                    isPlatformCoreMode()
                      ? hubGadget.goldenLink
                      : 'text-accent-primary font-medium hover:underline'
                  }
                >
                  Досье
                </Link>
              </>
            ) : null}
            {isPlatformCoreMode() ? (
              <span className={hubGadget.goldenSep} aria-hidden>
                ·
              </span>
            ) : null}
            <Link
              href={shopB2bTrackingOrderHref(orderId)}
              data-testid="mfr-op-materials-tracking-link"
              className={
                isPlatformCoreMode()
                  ? hubGadget.goldenLink
                  : 'text-accent-primary font-medium hover:underline'
              }
            >
              Трекинг
            </Link>
            {!isPlatformCoreMode() ? (
              <Link
                href={factoryMessagesB2bOrderContextHref(orderId, { role: 'manufacturer' })}
                data-testid="mfr-op-materials-chat-link"
                className="text-accent-primary font-medium hover:underline"
              >
                Чат заказа
              </Link>
            ) : null}
          </div>
        ) : null}

        {view === 'procurement' && multiArticleOrder ? (
          <nav
            aria-label="Артикулы заказа · закупка"
            className={cn(
              hubCabinet.workspacePillarStrip,
              hubCabinet.pillarNavPillRow,
              hubCabinet.workspaceTableScroll,
              'border-border-default w-full min-w-0 border p-1 max-md:flex-nowrap'
            )}
            data-testid={
              activeRole === 'supplier'
                ? 'sup-op-procurement-article-wizard'
                : 'mfr-op-procurement-article-wizard'
            }
          >
            <span className="w-full shrink-0 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground max-md:basis-full">
              Артикулы заказа · {orderArticleScopes.length}
            </span>
            {orderArticleScopes.map((scope) => {
              const active = scope.articleId === articleId && scope.collectionId === collectionId;
              return (
                <Link
                  key={`${scope.collectionId}:${scope.articleId}`}
                  href={procurementHrefForArticle(scope.articleId, scope.collectionId)}
                  data-testid={
                    activeRole === 'supplier'
                      ? `sup-op-procurement-article-${scope.articleId}`
                      : `mfr-op-procurement-article-${scope.articleId}`
                  }
                  className={cn(
                    hubCabinet.pillarPill,
                    active
                      ? 'bg-accent-primary/10 text-accent-primary font-semibold'
                      : 'text-muted-foreground hover:bg-white'
                  )}
                >
                  {scope.articleId}
                </Link>
              );
            })}
          </nav>
        ) : null}

        {view === 'procurement' ? (
          <Card
            data-testid={
              activeRole === 'supplier'
                ? 'sup-op-procurement-panel'
                : 'materials-procurement-context'
            }
            data-audit-legacy={
              activeRole === 'supplier' ? 'materials-procurement-context' : undefined
            }
            className="border-emerald-200/60"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <Package className="h-4 w-4 text-emerald-600" aria-hidden />
                <PlatformCoreTerm term="PO" /> · {poId}
              </CardTitle>
              <CardDescription className="flex flex-col gap-2 text-xs">
                <span>
                  {isPlatformCoreMode()
                    ? `${orderId} · ${poId}`
                    : `Оптовый заказ ${orderId} · очередь передачи в производство`}
                </span>
                <SupplierProcurementSpineStrip orderId={orderId} reloadNonce={chainPollTick} />
                {activeRole === 'supplier' && isPlatformCoreMode() ? (
                  <PlatformCoreWmsReserveStrip
                    variant="supplier"
                    brandHandoffHref={brandB2bOrderHandoffContextHref(orderId)}
                    shopTrackingHref={shopB2bTrackingOrderHref(orderId)}
                  />
                ) : null}
                {activeRole === 'supplier' && isPlatformCoreMode() && orderId ? (
                  <SupplierProcurementBrandNotifyStrip
                    collectionId={collectionId}
                    articleId={articleId}
                    orderId={orderId}
                    productionOrderId={poId}
                    materialsConfirmed={supplierMaterialsConfirmed}
                  />
                ) : null}
                {activeRole === 'manufacturer' && isPlatformCoreMode() ? (
                  <PlatformCoreWmsReserveStrip
                    variant="workspace"
                    checkoutHref={shopB2bCheckoutCollectionHref(collectionId)}
                    trackingHref={shopB2bTrackingOrderHref(orderId)}
                    testId="mfr-op-materials-wms-reserve-strip"
                  />
                ) : null}
                {activeRole === 'manufacturer' && isPlatformCoreMode() && orderId ? (
                  <MfrOpMaterialsSupplierPatchStrip
                    orderId={orderId}
                    collectionId={collectionId}
                    articleId={articleId}
                    productionOrderId={poId}
                    materialsDone={materialsSuppliedDone}
                  />
                ) : null}
                {chainSummaries[orderId] ? (
                  <span data-testid="materials-procurement-chain-badge">
                    <B2bChainPhaseBadge
                      orderStatusLabel={
                        chainSummaries[orderId]?.orderStatusLabelRu ??
                        workshop2B2bOrderStatusLabelRu('confirmed')
                      }
                      chain={chainSummaries[orderId]}
                    />
                  </span>
                ) : null}
                {!isPlatformCoreMode() ? (
                  <Link
                    href={
                      activeRole === 'supplier'
                        ? factorySupplierMessagesB2bOrderContextHref(orderId)
                        : factoryMessagesB2bOrderContextHref(orderId, { role: 'manufacturer' })
                    }
                    className="text-accent-primary font-semibold hover:underline"
                    data-testid="materials-procurement-chat-link"
                  >
                    Чат · заказ
                  </Link>
                ) : null}
                {procurementChainSteps.some((s) => s.id === 'materials_supplied') &&
                (materialsSuppliedDone || activeRole === 'supplier') ? (
                  <Badge
                    variant="outline"
                    data-testid={
                      activeRole === 'supplier'
                        ? 'sup-op-procurement-materials-badge'
                        : 'mfr-op-materials-supplied-badge'
                    }
                    className={
                      materialsSuppliedDone
                        ? 'border-emerald-200 bg-emerald-50 text-[9px] text-emerald-800'
                        : 'border-amber-200 bg-amber-50 text-[9px] text-amber-800'
                    }
                  >
                    {materialsSuppliedDone
                      ? 'Материалы подтверждены'
                      : 'Ожидает подтверждение поставщика'}
                  </Badge>
                ) : null}
                {procurementChainSteps.some((s) => s.id === 'inventory_reserved') ? (
                  <Badge
                    variant="outline"
                    data-testid="mfr-op-materials-wms-badge"
                    className={
                      inventoryReservedDone
                        ? 'border-emerald-200 bg-emerald-50 text-[9px] text-emerald-800'
                        : 'border-amber-200 bg-amber-50 text-[9px] text-amber-800'
                    }
                  >
                    {inventoryReservedDone ? 'Резерв WMS оформлен' : 'Резерв WMS ожидается'}
                  </Badge>
                ) : null}
              </CardDescription>
            </CardHeader>
            <CardContent
              className="text-xs"
              data-testid="materials-procurement-handoff-status"
              data-state={handoffState}
            >
              {handoffState === 'loading' ? (
                <p
                  className="text-muted-foreground"
                  data-testid="materials-procurement-handoff-loading"
                >
                  Загрузка PO…
                </p>
              ) : null}
              {handoffState === 'error' ? (
                <div className="space-y-2" data-testid="materials-procurement-handoff-error">
                  <p className="text-muted-foreground">
                    {PLATFORM_CORE_HANDOFF_QUEUE_UNAVAILABLE_RU}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 min-h-11 text-[10px] max-md:min-h-11"
                    data-testid="materials-procurement-handoff-retry"
                    onClick={() => setHandoffReloadNonce((n) => n + 1)}
                  >
                    Повторить
                  </Button>
                </div>
              ) : null}
              {handoffState === 'ready' ? (
                handoff ? (
                  <p data-testid="materials-procurement-handoff-ready">
                    Серия: <strong>{poQty}</strong> ед. · статус:{' '}
                    {handoff.status
                      ? factoryHandoffPoStatusLabelRu(handoff.status)
                      : 'В очереди цеха'}
                  </p>
                ) : (
                  <p className="text-amber-800" data-testid="materials-procurement-handoff-pending">
                    Производственный заказ ещё не в очереди — ожидается передача от бренда.{' '}
                    <Link
                      href={
                        activeRole === 'supplier'
                          ? factoryHandoffQueueHrefForDemo(demoCtx)
                          : factoryProductionHandoffQueueHref(orderId, { factoryId, collectionId })
                      }
                      data-testid={
                        activeRole === 'supplier'
                          ? 'sup-op-procurement-handoff-pending-link'
                          : 'mfr-op-materials-handoff-pending-link'
                      }
                      className="text-accent-primary font-medium hover:underline"
                    >
                      Очередь передачи
                    </Link>
                  </p>
                )
              ) : null}
              {activeRole === 'supplier' ? (
                <>
                  {partialShipMeta?.backorder ? (
                    <SupplierBackorderBadge
                      active
                      partialShipQty={partialShipMeta.qty}
                      requestedQty={poQty}
                    />
                  ) : null}
                  {showSupplierPartialShipStrip ? (
                    <div className="mt-3" data-testid="sup-op-procurement-partial-ship-host">
                      <SupplierPartialShipConfirmStrip
                        collectionId={collectionId}
                        articleId={articleId}
                        orderId={orderId}
                        productionOrderId={poId}
                        defaultQty={poQty}
                        onConfirmed={(meta) => {
                          setConfirmState('done');
                          setSupplyAlreadyConfirmed(true);
                          if (meta?.backorder) {
                            setPartialShipMeta({ qty: meta.qty, backorder: meta.backorder });
                          }
                          refreshChainStatus();
                        }}
                      />
                    </div>
                  ) : null}
                  {supplyAlreadyConfirmed ? (
                    <Badge
                      variant="outline"
                      className="mt-3 border-emerald-300 text-[10px] text-emerald-800"
                      data-testid="sup-op-procurement-idempotent-badge"
                      data-audit-legacy="materials-procurement-idempotent-badge"
                    >
                      Поставка уже в базе — повтор не нужен
                    </Badge>
                  ) : null}
                  {confirmState === 'done' || materialsSuppliedDone ? (
                    <div
                      className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-medium"
                      data-testid="sup-op-procurement-success-strip"
                    >
                      <Link
                        href={buildSupOpTrackingTailHref({ orderId, productionOrderId: poId })}
                        data-testid="sup-op-procurement-success-tracking-link"
                        data-comms-tail-po={poId}
                        className="text-accent-primary hover:underline"
                      >
                        {isPlatformCoreMode() ? 'Трекинг' : 'Трекинг магазина'}
                      </Link>
                      {!isPlatformCoreMode() ? (
                        <Link
                          href={factorySupplierMessagesB2bOrderContextHref(orderId)}
                          data-testid="sup-op-procurement-success-brand-chat-link"
                          className="text-accent-primary hover:underline"
                        >
                          Чат бренду
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                  <div className={hubCabinet.workspaceStickyActions}>
                    {!showSupplierPartialShipStrip ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className={cn(hubCabinet.workspacePrimaryBtn, 'text-xs')}
                        data-testid={
                          multiArticleOrder
                            ? 'sup-op-procurement-confirm-all'
                            : 'sup-op-procurement-bulk-confirm'
                        }
                        data-audit-legacy="materials-procurement-bulk-confirm"
                        disabled={
                          confirmState === 'loading' ||
                          confirmState === 'done' ||
                          handoffState !== 'ready' ||
                          !handoff ||
                          poQty <= 0
                        }
                        onClick={() => void confirmMaterialSupply()}
                      >
                        {confirmState === 'loading'
                          ? 'Сохранение…'
                          : confirmState === 'done'
                            ? 'Поставка подтверждена'
                            : multiArticleOrder
                              ? `Подтвердить поставку · все артикулы (${orderArticleScopes.length})`
                              : 'Подтвердить поставку'}
                      </Button>
                    ) : (
                      <p
                        className="text-[10px] text-muted-foreground"
                        data-testid="sup-op-procurement-bulk-confirm-dedup-hint"
                      >
                        {WAVE_WI_SUP_BULK_CONFIRM_DEDUP_HINT_RU}
                      </p>
                    )}
                  </div>
                </>
              ) : activeRole === 'manufacturer' && !isPlatformCoreMode() ? (
                <MfrOpMaterialsSupplierPatchStrip
                  orderId={orderId}
                  collectionId={collectionId}
                  articleId={articleId}
                  productionOrderId={poId}
                  materialsDone={materialsSuppliedDone}
                />
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {view === 'development' && bomState === 'ready' && bomLines.length > 0 ? (
          <Card data-testid="materials-supplier-reference" className="border-sky-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Справочник BOM · PG</CardTitle>
              <CardDescription className="text-xs">
                Полнота норм и цены из ТЗ — только данные досье (замены — блок ниже).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p data-testid="materials-bom-fill-rate">
                Полнота норм расхода: <strong>{bomFillRate}%</strong>
                <span className="text-muted-foreground">
                  {' '}
                  ({bomLines.filter((l) => l.materialName?.trim()).length} строк)
                </span>
              </p>
              <p data-testid="materials-bom-weighted-fill-rate" className="text-muted-foreground">
                Взвешенная полнота (основа/подкладка выше этикетки):{' '}
                <strong className="text-foreground">{bomWeightedFillRate}%</strong>
              </p>
              {priceJournalActive ? (
                <div className={hubCabinet.workspaceTableScroll}>
                  <Table data-testid="materials-price-journal">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Дата</TableHead>
                        <TableHead>Материал</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead>Событие</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {priceJournal.map((row, i) => (
                        <TableRow key={`${row.materialName}-${row.recordedAt}-${i}`}>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {row.recordedAt.slice(0, 10)}
                          </TableCell>
                          <TableCell>{row.materialName}</TableCell>
                          <TableCell className="font-mono tabular-nums">
                            {row.unitCostNet} {row.currency}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{row.eventType}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : pricePoints.length > 0 ? (
                <div className={hubCabinet.workspaceTableScroll}>
                  <Table data-testid="materials-price-history">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Материал</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead>Источник</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pricePoints.map((row) => (
                        <TableRow key={row.materialName}>
                          <TableCell>{row.materialName}</TableCell>
                          <TableCell className="font-mono tabular-nums">
                            {row.unitCostNet} {row.currency}/{row.unitLabelRu}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {row.sourceLabelRu}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : priceJournalState === 'loading' ? (
                <p className="text-muted-foreground" data-testid="materials-price-journal-loading">
                  Загрузка журнала цен…
                </p>
              ) : (
                <p className="text-muted-foreground" data-testid="materials-price-history-empty">
                  В BOM нет unitCostNet — укажите цену в ТЗ бренда.
                </p>
              )}
            </CardContent>
          </Card>
        ) : null}

        {view === 'development' && bomState === 'ready' ? (
          <Card data-testid="materials-alt-materials-panel" className="border-violet-200/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Альтернативы материалов · PG</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div
                className={`${hubGadget.goldenPath} flex flex-wrap items-center gap-2`}
                data-testid="materials-alt-materials-nav"
              >
                <Link
                  href={buildMaterialsAltMaterialsCatalogHref({ collectionId, articleId })}
                  className={hubGadget.goldenLink}
                  data-testid="materials-alt-materials-catalog-link"
                >
                  Каталог →
                </Link>
                <span className={hubGadget.goldenSep} aria-hidden>
                  ·
                </span>
                <Link
                  href={buildSupplierDevBomCabinetAltMaterialHref({ collectionId, articleId })}
                  className={hubGadget.goldenLink}
                  data-testid="materials-alt-materials-cabinet-link"
                >
                  BOM кабинет →
                </Link>
                <span className={hubGadget.goldenSep} aria-hidden>
                  ·
                </span>
                <Link
                  href={buildBrandDevBomAltMaterialApprovalHref({ collectionId, articleId })}
                  className={hubGadget.goldenLink}
                  data-testid="materials-alt-materials-brand-bom-link"
                >
                  Согласование у бренда →
                </Link>
              </div>
              <p className="text-muted-foreground" data-testid="materials-alt-materials-note">
                {WAVE_XW_ALT_MATERIALS_NOTE_RU}
              </p>
              <SupplierAltMaterialsApprovalPanel
                collectionId={collectionId}
                articleId={articleId}
                rows={altMaterials}
              />
            </CardContent>
          </Card>
        ) : null}

        {view === 'procurement' && activeRole === 'supplier' && bomTotalCount > 0 ? (
          <Card
            data-testid={WAVE_WP_SUP_BOM_PO_PROGRESS_TESTID}
            data-bom-filled={bomFilledCount}
            data-bom-total={bomTotalCount}
            data-po-qty={poQty}
            className="border-amber-200/50"
          >
            <CardContent className="space-y-1.5 p-3">
              <SupOpBomPoChainPeerStrip
                collectionId={collectionId}
                articleId={articleId}
                orderId={orderId || undefined}
              />
              <div className="flex items-center justify-between text-xs font-medium">
                <span>
                  <PlatformCoreTerm term="BOM" /> под <PlatformCoreTerm term="PO" />
                </span>
                <span className="text-muted-foreground">
                  {poQty > 0 ? `${poQty} ед.` : 'без серии'} · {bomFilledCount}/{bomTotalCount}{' '}
                  строк
                </span>
              </div>
              <Progress value={bomWeightedFillRate} className="h-2 bg-slate-100" />
              {!showSupplierPartialShipStrip &&
              (confirmState === 'loading' || confirmState === 'done' || bulkConfirmProgress) ? (
                <SupplierBulkConfirmProgressStrip
                  confirmed={
                    bulkConfirmProgress?.confirmed ?? (confirmState === 'done' ? bomTotalCount : 0)
                  }
                  total={bulkConfirmProgress?.total ?? bomTotalCount}
                  busy={confirmState === 'loading'}
                />
              ) : null}
              {showSupplierPartialShipStrip ? (
                <p
                  className="text-[11px] text-muted-foreground"
                  data-testid={WAVE_WP_SUP_BOM_PO_BULK_CONFIRM_DEDUP_HINT_TESTID}
                >
                  {WAVE_WP_SUP_BOM_PO_BULK_CONFIRM_DEDUP_HINT_RU}
                </p>
              ) : null}
              <p className="text-[11px] text-muted-foreground">
                {poQty > 0 && bomFilledCount === bomTotalCount
                  ? 'BOM готов к расчёту потребности под серию'
                  : poQty > 0
                    ? 'Дозаполните спецификацию в досье'
                    : 'Ожидание передачи в производство от бренда'}
                {dossierHref ? (
                  <>
                    {' '}
                    <Link
                      href={dossierHref}
                      data-testid="sup-op-bom-po-dossier-link"
                      className="text-accent-primary font-semibold hover:underline"
                    >
                      Досье →
                    </Link>
                  </>
                ) : null}
                {collectionId && articleId ? (
                  <>
                    {' '}
                    <a
                      href={`/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(articleId)}/po-bundle.pdf?format=pdf&seriesQty=${encodeURIComponent(String(poQty))}${orderId ? `&b2bOrderId=${encodeURIComponent(orderId)}` : ''}`}
                      data-testid="sup-op-bom-po-bundle-pdf"
                      className="text-accent-primary font-semibold hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      PDF-комплект
                    </a>
                  </>
                ) : null}
              </p>
              {showSupOpBomPoBulkConfirmDedupHint ? (
                <p
                  className="text-[10px] text-muted-foreground"
                  data-testid={WAVE_WP_SUP_BOM_PO_BULK_CONFIRM_DEDUP_HINT_TESTID}
                >
                  {WAVE_WP_SUP_BOM_PO_BULK_CONFIRM_DEDUP_HINT_RU}
                </p>
              ) : null}
              {showSupOpBrandInventoryLedgerPeer && orderId ? (
                <SupOpProcurementBrandInventoryLedgerPeerStrip
                  collectionId={collectionId}
                  articleId={articleId}
                  orderId={orderId}
                  productionOrderId={poId}
                />
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <Card data-testid="materials-bom-context" className="border-amber-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <FileText className="h-4 w-4 text-amber-600" aria-hidden />
              BOM · {articleId}
              {collectionId ? (
                <Badge variant="outline" className="font-mono text-[10px]">
                  {collectionId}
                </Badge>
              ) : null}
            </CardTitle>
            <CardDescription className="text-xs">Спецификация из досье артикула.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {bomState === 'loading' ? (
              <p className="text-muted-foreground">Загрузка BOM…</p>
            ) : bomState === 'error' ? (
              <p className="text-muted-foreground">{PLATFORM_CORE_BOM_UNAVAILABLE_RU}</p>
            ) : view === 'procurement' && procurementLines.length > 0 ? (
              <div className={hubCabinet.workspaceTableScroll}>
                <Table data-testid="materials-procurement-bom-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Материал</TableHead>
                      <TableHead>На изделие</TableHead>
                      <TableHead className="text-right">Под PO ({poQty} ед.)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {procurementLines.map((line, i) => (
                      <TableRow key={`${line.materialName ?? 'line'}-${i}`}>
                        <TableCell className="font-medium">{line.materialName ?? '—'}</TableCell>
                        <TableCell>
                          {line.perUnit}
                          {line.unit ? ` ${line.unit}` : ''}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {line.required.toFixed(2)}
                          {line.unit ? ` ${line.unit}` : ''}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : bomLines.length > 0 ? (
              <ul className="list-inside list-disc">
                {bomLines.map((line, i) => (
                  <li key={`${line.materialName ?? 'line'}-${i}`}>
                    {line.materialName ?? '—'}
                    {line.quantity != null
                      ? ` · ${line.quantity}${line.unit ? ` ${line.unit}` : ''}`
                      : ''}
                  </li>
                ))}
              </ul>
            ) : view === 'procurement' ? (
              <p className="text-muted-foreground" data-testid="materials-procurement-bom-empty">
                В досье нет строк BOM для этого артикула.
              </p>
            ) : (
              <p className="text-muted-foreground">В досье нет строк BOM для этого артикула.</p>
            )}
            <div className="flex flex-wrap gap-3 pt-1">
              {dossierHref ? (
                <Link
                  href={dossierHref}
                  className="text-accent-primary font-medium hover:underline"
                  data-testid="materials-bom-dossier-link"
                >
                  Досье артикула →
                </Link>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </PlatformCoreListChrome>
    </div>
  );
}
