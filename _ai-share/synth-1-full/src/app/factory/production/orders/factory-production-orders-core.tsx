'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { B2bChainPhaseBadge } from '@/components/b2b/B2bChainPhaseBadge';
import { useWorkshop2B2bChainSummaries } from '@/hooks/use-workshop2-b2b-chain-summaries';
import {
  factoryMessagesB2bOrderContextHref,
  factoryProductionDossierContextHref,
  factoryCoreOrderProductionCabinetHref,
  factoryProductionHandoffQueueHref,
} from '@/lib/routes';
import { cn } from '@/lib/utils';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { MfrOpOrdersBulkAckSoTStrip } from '@/components/factory/MfrOpOrdersBulkAckSoTStrip';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  PLATFORM_CORE_DEMO,
  factoryHandoffQueueHrefForDemo,
  factoryMaterialsProcurementHrefForDemo,
  resolvePageCollectionId,
} from '@/lib/platform-core-hub-matrix';
import { PLATFORM_CORE_HANDOFF_QUEUE_UNAVAILABLE_RU } from '@/lib/platform-core-user-messages';
import {
  canAcknowledgeFactoryHandoffPo,
  canRetryFactoryHandoffErp,
  factoryHandoffErpBadgeLabel,
  factoryHandoffNeedsErpAttention,
  factoryHandoffPoStatusLabelRu,
} from '@/lib/production/workshop2-factory-handoff-po-status';
import { useToast } from '@/hooks/use-toast';
import { FactoryMesReleaseStageStrip } from '@/components/factory/FactoryMesReleaseStageStrip';
import { MfrOpWipGanttStrip } from '@/components/factory/manufacturer/MfrOpWipGanttStrip';
import { MfrOpWipFloorTabletStrip } from '@/components/factory/manufacturer/MfrOpWipFloorTabletStrip';
import { MfrOpPoTzPdfPeerStrip } from '@/components/factory/MfrOpPoTzPdfPeerStrip';
import { IntegrationProductionWipStrip } from '@/components/integrations/IntegrationProductionWipStrip';
import { PlatformCoreErpRetryHint } from '@/components/platform/PlatformCoreErpRetryHint';
import {
  pickEarliestErpNextRetryAt,
  summarizeFactoryErpAttentionRu,
} from '@/lib/production/workshop2-erp-retry-hint';

type HandoffRow = {
  productionOrderId: string;
  b2bOrderId: string;
  collectionId: string;
  articleId: string;
  qty: number;
  status: string;
  mesReleaseStage?: string;
  wipStatus?: string;
  erpExternalId?: string;
  erpNextRetryAt?: string;
  erpAutoRetryCount?: number;
  erpLastError?: string;
  dossierHref?: string;
};

function demoCtxForRow(row: HandoffRow) {
  return {
    ...PLATFORM_CORE_DEMO,
    collectionId: row.collectionId,
    demoArticleId: row.articleId,
    demoOrderId: row.b2bOrderId,
    productionOrderId: row.productionOrderId,
  };
}

function resolveFocusOrderId(searchParams: URLSearchParams | null): string | null {
  const raw = searchParams?.get('order')?.trim() || searchParams?.get('orderId')?.trim();
  return raw || null;
}

/** Реестр производственных серий цеха из PG handoff queue + workflow принятия/ERP. */
export function FactoryProductionOrdersCorePage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const focusOrderId = resolveFocusOrderId(searchParams);
  const pageCollectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const factoryId = PLATFORM_CORE_DEMO.factoryId;
  const [items, setItems] = useState<HandoffRow[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [bulkInFlight, setBulkInFlight] = useState(false);
  const [actionPoId, setActionPoId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const focusRowRef = useRef<HTMLTableRowElement>(null);

  const loadItems = useCallback(async () => {
    setLoadState('loading');
    try {
      const res = await fetch(
        `/api/workshop2/factory/production-handoff-queue?factoryId=${encodeURIComponent(factoryId)}`,
        { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
      );
      const json = (await res.json()) as { ok?: boolean; items?: HandoffRow[] };
      if (json.ok && Array.isArray(json.items)) {
        setItems(json.items);
        setSelected((prev) => {
          const next: Record<string, boolean> = {};
          for (const item of json.items!) {
            if (prev[item.productionOrderId] && canAcknowledgeFactoryHandoffPo(item.status)) {
              next[item.productionOrderId] = true;
            }
          }
          return next;
        });
        setLoadState('ready');
      } else {
        setLoadState('error');
      }
    } catch {
      setLoadState('error');
    }
  }, [factoryId]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const scopedItems = useMemo(
    () => items.filter((row) => row.collectionId === pageCollectionId),
    [items, pageCollectionId]
  );

  const orderIds = useMemo(
    () => scopedItems.map((i) => i.b2bOrderId).filter(Boolean),
    [scopedItems]
  );
  const { summaries: chainSummaries } = useWorkshop2B2bChainSummaries(
    orderIds,
    scopedItems.length > 0
  );

  const pendingItems = useMemo(
    () => scopedItems.filter((row) => canAcknowledgeFactoryHandoffPo(row.status)),
    [scopedItems]
  );
  const selectedPending = useMemo(
    () => pendingItems.filter((row) => selected[row.productionOrderId]),
    [pendingItems, selected]
  );

  const erpAttentionRows = useMemo(
    () =>
      scopedItems.filter((row) => factoryHandoffNeedsErpAttention(row.status, row.erpExternalId)),
    [scopedItems]
  );

  const erpRetryTarget = useMemo(() => {
    if (focusOrderId) {
      const focused = erpAttentionRows.find((row) => row.b2bOrderId === focusOrderId);
      if (focused) return focused;
    }
    return erpAttentionRows[0] ?? null;
  }, [erpAttentionRows, focusOrderId]);

  const erpAttentionSummary = useMemo(() => {
    let errorCount = 0;
    let journalOnlyCount = 0;
    let pendingCount = 0;
    for (const row of erpAttentionRows) {
      if (row.status === 'error') errorCount += 1;
      else if (row.status === 'pending_erp') pendingCount += 1;
      else if (
        row.status === 'synced' &&
        String(row.erpExternalId ?? '').startsWith('FACTORY-ACK-')
      ) {
        journalOnlyCount += 1;
      }
    }
    return { errorCount, journalOnlyCount, pendingCount };
  }, [erpAttentionRows]);

  const erpAlertNextRetryAt = useMemo(
    () => pickEarliestErpNextRetryAt(erpAttentionRows.map((r) => r.erpNextRetryAt)),
    [erpAttentionRows]
  );

  useEffect(() => {
    if (loadState !== 'ready' || !focusOrderId) return;
    const timer = window.setTimeout(() => {
      focusRowRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [loadState, focusOrderId, scopedItems]);

  const toggleAllPending = (checked: boolean) => {
    setSelected((prev) => {
      const next = { ...prev };
      for (const row of pendingItems) {
        next[row.productionOrderId] = checked;
      }
      return next;
    });
  };

  async function acknowledgeRows(rows: HandoffRow[], opts?: { singleRow?: HandoffRow }) {
    if (rows.length === 0) return;
    const single = opts?.singleRow;
    if (single) {
      setActionPoId(single.productionOrderId);
    } else {
      setBulkInFlight(true);
    }
    setStatusMessage(null);
    try {
      const res = await fetch('/api/workshop2/factory/production-handoff-queue/bulk-acknowledge', {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          factoryId,
          items: rows.map((row) => ({
            productionOrderId: row.productionOrderId,
            collectionId: row.collectionId,
            articleId: row.articleId,
          })),
          actor: 'factory-production-orders',
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        acknowledged?: string[];
        skipped?: string[];
        errors?: Array<{ messageRu?: string }>;
        messageRu?: string;
      };
      if (!res.ok || !json.ok) {
        throw new Error(json.errors?.[0]?.messageRu ?? json.messageRu ?? 'accept_failed');
      }
      const msg =
        single != null
          ? json.acknowledged?.includes(single.productionOrderId)
            ? `Серия ${single.productionOrderId} принята цехом.`
            : json.skipped?.includes(single.productionOrderId)
              ? 'Серия уже была принята ранее.'
              : (json.messageRu ?? 'Статус обновлён.')
          : (json.messageRu ??
            `Принято: ${json.acknowledged?.length ?? 0} · пропущено: ${json.skipped?.length ?? 0}`);
      setStatusMessage(msg);
      toast({ title: 'Производственный заказ', description: msg });
      setSelected({});
      await loadItems();
    } catch (err) {
      const message =
        err instanceof Error && err.message !== 'accept_failed'
          ? err.message
          : 'Не удалось принять серии — повторите.';
      setStatusMessage(message);
      toast({ title: 'Ошибка', description: message, variant: 'destructive' });
    } finally {
      setActionPoId(null);
      setBulkInFlight(false);
    }
  }

  async function handleAcceptRow(row: HandoffRow) {
    if (!canAcknowledgeFactoryHandoffPo(row.status) || actionPoId || bulkInFlight) return;
    await acknowledgeRows([row], { singleRow: row });
  }

  async function handleBulkAccept() {
    if (selectedPending.length === 0 || bulkInFlight || actionPoId) return;
    await acknowledgeRows(selectedPending);
  }

  async function handleAdvanceMes(row: HandoffRow) {
    if (actionPoId) return;
    setActionPoId(row.productionOrderId);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/workshop2/factory/production-handoff-queue/advance-mes-stage', {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          factoryId,
          productionOrderId: row.productionOrderId,
          collectionId: row.collectionId,
          articleId: row.articleId,
          actor: 'factory-production-orders',
        }),
      });
      const json = (await res.json()) as { ok?: boolean; messageRu?: string; stage?: string };
      const msg = json.messageRu ?? (json.ok ? 'MES-этап обновлён.' : 'MES недоступен.');
      setStatusMessage(msg);
      toast({
        title: json.ok ? 'MES выпуск' : 'MES · ошибка',
        description: msg,
        variant: json.ok ? 'default' : 'destructive',
      });
      if (json.ok) await loadItems();
    } catch {
      const err = 'Не удалось обновить MES-этап — повторите.';
      setStatusMessage(err);
      toast({ title: 'Ошибка', description: err, variant: 'destructive' });
    } finally {
      setActionPoId(null);
    }
  }

  async function handleBulkErpRetry() {
    if (erpAttentionRows.length === 0 || bulkInFlight || actionPoId) return;
    setBulkInFlight(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/workshop2/factory/production-handoff-queue/bulk-retry-erp', {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          factoryId,
          items: erpAttentionRows.map((row) => ({
            productionOrderId: row.productionOrderId,
            collectionId: row.collectionId,
            articleId: row.articleId,
          })),
          actor: 'factory-production-orders',
        }),
      });
      const json = (await res.json()) as { ok?: boolean; messageRu?: string };
      const msg = json.messageRu ?? (json.ok ? 'ERP sync выполнен.' : 'ERP sync не удался.');
      setStatusMessage(msg);
      toast({
        title: json.ok ? 'ERP' : 'ERP · ошибка',
        description: msg,
        variant: json.ok ? 'default' : 'destructive',
      });
      await loadItems();
    } catch {
      const err = 'Сеть недоступна — повторите ERP sync.';
      setStatusMessage(err);
      toast({ title: 'Ошибка', description: err, variant: 'destructive' });
    } finally {
      setBulkInFlight(false);
    }
  }

  async function handleRetryErp(row: HandoffRow) {
    if (!canRetryFactoryHandoffErp(row.status, row.erpExternalId) || actionPoId) return;
    setActionPoId(row.productionOrderId);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/workshop2/factory/production-handoff-queue/retry-erp', {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          factoryId,
          productionOrderId: row.productionOrderId,
          collectionId: row.collectionId,
          articleId: row.articleId,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; messageRu?: string };
      const msg = json.messageRu ?? (json.ok ? 'ERP sync выполнен.' : 'ERP sync не удался.');
      setStatusMessage(msg);
      toast({
        title: json.ok ? 'ERP' : 'ERP · ошибка',
        description: msg,
        variant: json.ok ? 'default' : 'destructive',
      });
      await loadItems();
    } catch {
      const err = 'Сеть недоступна — повторите ERP sync.';
      setStatusMessage(err);
      toast({ title: 'Ошибка', description: err, variant: 'destructive' });
    } finally {
      setActionPoId(null);
    }
  }

  const coreMode = isPlatformCoreMode();
  const handoffQueueHref = focusOrderId
    ? factoryProductionHandoffQueueHref(focusOrderId, {
        factoryId,
        collectionId: pageCollectionId,
      })
    : factoryHandoffQueueHrefForDemo({ ...PLATFORM_CORE_DEMO, collectionId: pageCollectionId });
  const productionHubHref = factoryCoreOrderProductionCabinetHref(pageCollectionId);
  const focusedRow =
    focusOrderId != null
      ? scopedItems.find((row) => row.b2bOrderId === focusOrderId)
      : undefined;

  return (
    <Card data-testid="factory-production-orders-core">
      {focusOrderId ? (
        <div className="border-b px-4 py-2">
          <div
            className={cn(
              isPlatformCoreMode()
                ? cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')
                : 'flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'
            )}
            data-testid="factory-production-orders-order-context-strip"
          >
            <span className="text-text-muted font-mono text-[9px]">{focusOrderId}</span>
            <Link
              href={handoffQueueHref}
              data-testid="factory-production-orders-handoff-link"
              className={
                isPlatformCoreMode()
                  ? hubGadget.goldenLink
                  : 'text-accent-primary font-medium hover:underline'
              }
            >
              {isPlatformCoreMode() ? 'Очередь' : 'Очередь передачи'}
            </Link>
            {!isPlatformCoreMode() ? (
              <Link
                href={factoryMessagesB2bOrderContextHref(focusOrderId, { role: 'manufacturer' })}
                data-testid="factory-production-orders-chat-link"
                className="text-accent-primary font-medium hover:underline"
              >
                Чат
              </Link>
            ) : null}
            <Link
              href={factoryMaterialsProcurementHrefForDemo({
                ...PLATFORM_CORE_DEMO,
                demoOrderId: focusOrderId,
              })}
              data-testid="factory-production-orders-procurement-link"
              className={
                isPlatformCoreMode()
                  ? hubGadget.goldenLink
                  : 'text-accent-primary font-medium hover:underline'
              }
            >
              Закупка
            </Link>
            <Link
              href={productionHubHref}
              data-testid="factory-production-orders-hub-link"
              className={
                isPlatformCoreMode()
                  ? hubGadget.goldenLink
                  : 'text-accent-primary font-medium hover:underline'
              }
            >
              {isPlatformCoreMode() ? 'Кабинет' : 'Кабинет · производство'}
            </Link>
          </div>
          {isPlatformCoreMode() && focusedRow ? (
            <MfrOpWipFloorTabletStrip
              productionOrderId={focusedRow.productionOrderId}
              collectionId={focusedRow.collectionId}
              articleId={focusedRow.articleId}
              factoryId={factoryId}
              b2bOrderId={focusedRow.b2bOrderId}
              wipStatus={focusedRow.wipStatus ?? focusedRow.mesReleaseStage ?? 'queued'}
              poStatus={focusedRow.status}
              compact
              ganttHref="#mfr-op-wip-gantt-strip"
              hideHandoffPeer
            />
          ) : null}
          {isPlatformCoreMode() && focusedRow ? (
            <div className="mt-2">
              <MfrOpPoTzPdfPeerStrip
                orderId={focusedRow.b2bOrderId}
                collectionId={focusedRow.collectionId}
                articleId={focusedRow.articleId}
                productionOrderId={focusedRow.productionOrderId}
                factoryId={factoryId}
              />
            </div>
          ) : null}
        </div>
      ) : null}
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            <CardTitle className="text-sm font-bold">Производственные серии</CardTitle>
            <CardDescription className="text-xs">
              {isPlatformCoreMode()
                ? factoryId
                : `Полный реестр: MES, ERP, bulk-приёмка · на /production — быстрый ack очереди · ${factoryId}`}
            </CardDescription>
            {isPlatformCoreMode() ? (
              <MfrOpWipGanttStrip
                factoryId={factoryId}
                orderId={focusOrderId ?? undefined}
                maxRows={6}
                handoffQueueHref={handoffQueueHref}
                showSoTStrip
                showFloorSoTStrip
              />
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={handoffQueueHref}
              data-testid="factory-production-orders-toolbar-handoff-link"
              className="text-accent-primary text-[10px] font-semibold uppercase hover:underline"
            >
              Очередь
            </Link>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[10px]"
              disabled={loadState === 'loading' || bulkInFlight || actionPoId != null}
              onClick={() => void loadItems()}
              data-testid="factory-production-orders-refresh"
            >
              Обновить
            </Button>
            {pendingItems.length > 0 && !coreMode ? (
              <div
                className="flex flex-wrap items-center gap-2"
                data-testid="factory-production-orders-bulk-toolbar"
              >
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  disabled={bulkInFlight || selectedPending.length === 0}
                  onClick={() => void handleBulkAccept()}
                  data-testid="factory-production-orders-bulk-accept"
                >
                  {bulkInFlight
                    ? 'Приёмка…'
                    : selectedPending.length > 0
                      ? `Принять выбранные (${selectedPending.length})`
                      : 'Выберите серии'}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </CardHeader>
      {coreMode && pendingItems.length > 0 ? (
        <div className="px-4 pb-2">
          <MfrOpOrdersBulkAckSoTStrip
            handoffQueueHref={handoffQueueHref}
            pendingCount={pendingItems.length}
          />
        </div>
      ) : null}
      <CardContent>
        {loadState === 'ready' && erpAttentionRows.length > 0 ? (
          <div
            className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs"
            data-testid="factory-production-orders-erp-alert"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-amber-950">
                {summarizeFactoryErpAttentionRu(erpAttentionSummary)}
              </p>
              {erpAlertNextRetryAt ? (
                <PlatformCoreErpRetryHint
                  erpNextRetryAt={erpAlertNextRetryAt}
                  testId="factory-production-orders-erp-backoff-hint"
                  className="text-[10px] text-amber-900/80"
                />
              ) : null}
            </div>
            {erpRetryTarget ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 border-amber-300 bg-white px-2 text-[10px]"
                disabled={bulkInFlight || actionPoId != null}
                data-testid={
                  erpAttentionRows.length > 1
                    ? 'factory-production-orders-bulk-erp-retry'
                    : 'factory-production-orders-erp-alert-retry'
                }
                onClick={() =>
                  void (erpAttentionRows.length > 1
                    ? handleBulkErpRetry()
                    : handleRetryErp(erpRetryTarget))
                }
              >
                {erpAttentionRows.length > 1
                  ? `Повтор ERP для всех (${erpAttentionRows.length})`
                  : `Повторить ERP · ${erpRetryTarget.productionOrderId}`}
              </Button>
            ) : null}
          </div>
        ) : null}
        {statusMessage ? (
          <p
            className="text-text-secondary mb-3 text-xs"
            data-testid="factory-production-orders-status-message"
          >
            {statusMessage}
          </p>
        ) : null}
        {loadState === 'loading' ? (
          <p className="text-text-muted py-4 text-center text-sm">Загрузка серий…</p>
        ) : null}
        {loadState === 'error' ? (
          <div
            className="space-y-3 py-4 text-center text-sm"
            data-testid="factory-production-orders-error-state"
          >
            <p className="text-text-muted">{PLATFORM_CORE_HANDOFF_QUEUE_UNAVAILABLE_RU}</p>
            <div className="flex flex-wrap justify-center gap-3 text-[10px] font-semibold uppercase">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 px-2 text-[10px] normal-case"
                onClick={() => void loadItems()}
                data-testid="factory-production-orders-error-retry"
              >
                Повторить загрузку
              </Button>
              <Link
                href={handoffQueueHref}
                className="text-accent-primary inline-flex items-center hover:underline"
                data-testid="factory-production-orders-error-handoff-link"
              >
                Очередь передачи
              </Link>
            </div>
          </div>
        ) : null}
        {loadState === 'ready' && scopedItems.length === 0 ? (
          <div
            className="space-y-2 py-4 text-center text-sm"
            data-testid="factory-production-orders-empty-state"
          >
            <p className="text-text-muted">Нет производственных серий в очереди цеха.</p>
            <p className="text-text-muted text-xs">
              Серии появятся после передачи от бренда — проверьте очередь передачи или кабинет выпуска.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-[10px] font-semibold uppercase">
              <Link
                href={handoffQueueHref}
                className="text-accent-primary hover:underline"
                data-testid="factory-production-orders-empty-handoff-link"
              >
                Очередь передачи
              </Link>
              <Link
                href={productionHubHref}
                className="text-accent-primary hover:underline"
                data-testid="factory-production-orders-empty-hub-link"
              >
                Выпуск · кабинет
              </Link>
            </div>
          </div>
        ) : null}
        {loadState === 'ready' && scopedItems.length > 0 ? (
          <>
            <div
              className={cn(
                coreMode && 'md:hidden lg:block',
                coreMode && hubCabinet.workspaceTableScroll
              )}
              data-testid="mfr-op-prod-orders-table-scroll"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    {pendingItems.length > 0 ? (
                      <TableHead className="w-10">
                        <Checkbox
                          checked={
                            pendingItems.length > 0 &&
                            pendingItems.every((row) => selected[row.productionOrderId])
                          }
                          onCheckedChange={(v) => toggleAllPending(v === true)}
                          aria-label="Выбрать все серии в очереди"
                          data-testid="factory-production-orders-select-all"
                        />
                      </TableHead>
                    ) : null}
                    <TableHead>PO</TableHead>
                    <TableHead>B2B</TableHead>
                    <TableHead>Коллекция</TableHead>
                    <TableHead>Кол-во</TableHead>
                    <TableHead>PO / MES</TableHead>
                    <TableHead>Цепочка</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scopedItems.map((row) => {
                    const chain = chainSummaries[row.b2bOrderId];
                    const demo = demoCtxForRow(row);
                    const erpLabel = factoryHandoffErpBadgeLabel(row.status, row.erpExternalId);
                    const showAccept = canAcknowledgeFactoryHandoffPo(row.status);
                    const showRetry = canRetryFactoryHandoffErp(row.status, row.erpExternalId);
                    const busy = bulkInFlight || actionPoId === row.productionOrderId;
                    const demoRow = row.b2bOrderId.startsWith('B2B-DEMO-');
                    const rowPending = canAcknowledgeFactoryHandoffPo(row.status);

                    const rowFocused = focusOrderId != null && row.b2bOrderId === focusOrderId;

                    return (
                      <TableRow
                        key={row.productionOrderId}
                        ref={rowFocused ? focusRowRef : undefined}
                        data-order={row.b2bOrderId}
                        className={cn(rowFocused && 'bg-amber-50/60 ring-1 ring-amber-200/80')}
                        data-testid={
                          rowFocused
                            ? 'factory-production-orders-focus-row'
                            : demoRow
                              ? `factory-production-order-row-${row.b2bOrderId}`
                              : undefined
                        }
                        data-audit-legacy={
                          demoRow && !rowFocused
                            ? `factory-production-order-row-${row.b2bOrderId}`
                            : rowFocused
                              ? `factory-production-order-row-${row.b2bOrderId}`
                              : undefined
                        }
                      >
                        {pendingItems.length > 0 ? (
                          <TableCell>
                            {rowPending ? (
                              <Checkbox
                                checked={selected[row.productionOrderId] === true}
                                onCheckedChange={(v) =>
                                  setSelected((prev) => ({
                                    ...prev,
                                    [row.productionOrderId]: v === true,
                                  }))
                                }
                                aria-label={`Выбрать ${row.productionOrderId}`}
                                data-testid={
                                  demoRow
                                    ? `factory-production-order-select-${row.b2bOrderId}`
                                    : undefined
                                }
                              />
                            ) : null}
                          </TableCell>
                        ) : null}
                        <TableCell className="font-mono text-xs">{row.productionOrderId}</TableCell>
                        <TableCell className="font-mono text-xs">{row.b2bOrderId}</TableCell>
                        <TableCell className="text-xs">
                          {row.collectionId}/{row.articleId}
                        </TableCell>
                        <TableCell className="text-xs">{row.qty}</TableCell>
                        <TableCell className="space-y-1">
                          <Badge
                            variant={row.status === 'error' ? 'destructive' : 'outline'}
                            className="text-[9px] font-semibold normal-case"
                            data-testid={
                              demoRow
                                ? `factory-production-order-status-${row.b2bOrderId}`
                                : undefined
                            }
                          >
                            {factoryHandoffPoStatusLabelRu(row.status)}
                          </Badge>
                          {erpLabel ? (
                            <p className="text-text-muted text-[9px]">{erpLabel}</p>
                          ) : null}
                          <FactoryMesReleaseStageStrip
                            stage={row.mesReleaseStage ?? 'queued'}
                            poStatus={row.status}
                            busy={busy}
                            onAdvance={() => void handleAdvanceMes(row)}
                            testId={
                              demoRow ? `factory-production-order-mes-${row.b2bOrderId}` : undefined
                            }
                          />
                          <IntegrationProductionWipStrip
                            wholesaleOrderId={row.b2bOrderId}
                            productionOrderId={row.productionOrderId}
                            variant="factory"
                            allowAdvance
                          />
                        </TableCell>
                        <TableCell>
                          {chain ? (
                            <span data-testid={`factory-production-order-chain-${row.b2bOrderId}`}>
                              <B2bChainPhaseBadge
                                orderStatusLabel={chain.orderStatusLabelRu ?? '—'}
                                chain={chain}
                                poQueueStatus={row.status}
                              />
                            </span>
                          ) : (
                            <span className="text-text-muted text-[10px]">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-1.5">
                            <div className="flex flex-wrap justify-end gap-x-2 text-[10px] font-semibold">
                              {showAccept ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="default"
                                  className="h-7 px-2 text-[10px]"
                                  disabled={busy}
                                  data-testid={
                                    demoRow
                                      ? `factory-production-order-accept-${row.b2bOrderId}`
                                      : undefined
                                  }
                                  onClick={() => void handleAcceptRow(row)}
                                >
                                  {busy ? '…' : 'Принять'}
                                </Button>
                              ) : null}
                              {showRetry ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-[10px]"
                                  disabled={busy}
                                  data-testid={
                                    demoRow
                                      ? `factory-production-order-retry-erp-${row.b2bOrderId}`
                                      : undefined
                                  }
                                  onClick={() => void handleRetryErp(row)}
                                >
                                  Повтор ERP
                                </Button>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap justify-end gap-x-2 text-[10px] font-semibold uppercase">
                              <Link
                                href={factoryProductionDossierContextHref(row.articleId, {
                                  collectionId: row.collectionId,
                                  orderId: row.b2bOrderId,
                                })}
                                className="text-accent-primary hover:underline"
                                data-testid={
                                  demoRow
                                    ? `factory-production-order-dossier-${row.b2bOrderId}`
                                    : undefined
                                }
                              >
                                Досье
                              </Link>
                              <Link
                                href={factoryProductionHandoffQueueHref(row.b2bOrderId, {
                                  factoryId,
                                  collectionId: row.collectionId,
                                })}
                                className="text-accent-primary hover:underline"
                                data-testid={
                                  demoRow
                                    ? `factory-production-order-handoff-${row.b2bOrderId}`
                                    : undefined
                                }
                              >
                                Очередь
                              </Link>
                              <Link
                                href={factoryMaterialsProcurementHrefForDemo(demo)}
                                className="text-accent-primary hover:underline"
                                data-testid={
                                  demoRow
                                    ? `factory-production-order-procurement-${row.b2bOrderId}`
                                    : undefined
                                }
                              >
                                Закупка
                              </Link>
                              <Link
                                href={factoryMessagesB2bOrderContextHref(row.b2bOrderId, {
                                  role: 'manufacturer',
                                })}
                                className="text-accent-primary hover:underline"
                                data-testid={`factory-production-order-chat-${row.b2bOrderId}`}
                              >
                                Чат
                              </Link>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {coreMode ? (
              <div
                className={cn('hidden md:grid lg:hidden', hubCabinet.workspaceCardGrid)}
                data-testid="mfr-op-prod-orders-card-grid"
              >
                {scopedItems.map((row) => {
                  const chain = chainSummaries[row.b2bOrderId];
                  const demo = demoCtxForRow(row);
                  const showAccept = canAcknowledgeFactoryHandoffPo(row.status);
                  const showRetry = canRetryFactoryHandoffErp(row.status, row.erpExternalId);
                  const busy = bulkInFlight || actionPoId === row.productionOrderId;
                  const demoRow = row.b2bOrderId.startsWith('B2B-DEMO-');
                  const rowFocused = focusOrderId != null && row.b2bOrderId === focusOrderId;
                  const erpLabel = factoryHandoffErpBadgeLabel(row.status, row.erpExternalId);

                  return (
                    <div
                      key={`card-${row.productionOrderId}`}
                      ref={rowFocused ? focusRowRef : undefined}
                      data-order={row.b2bOrderId}
                    >
                      <Card
                        data-testid={
                          rowFocused
                            ? 'factory-production-orders-focus-row'
                            : demoRow
                              ? `factory-production-order-card-${row.b2bOrderId}`
                              : undefined
                        }
                        className={cn(rowFocused && 'ring-1 ring-amber-200/80')}
                      >
                        <CardContent className="space-y-2 p-3 text-xs">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 font-mono text-[11px]">
                              <p className="font-semibold">{row.productionOrderId}</p>
                              <p className="text-text-muted truncate">{row.b2bOrderId}</p>
                            </div>
                            <Badge
                              variant={row.status === 'error' ? 'destructive' : 'outline'}
                              className="shrink-0 text-[9px] font-semibold normal-case"
                            >
                              {factoryHandoffPoStatusLabelRu(row.status)}
                            </Badge>
                          </div>
                          <p className="text-text-muted text-[10px]">
                            {row.collectionId}/{row.articleId} · {row.qty} ед.
                          </p>
                          {erpLabel ? (
                            <p className="text-text-muted text-[9px]">{erpLabel}</p>
                          ) : null}
                          {chain ? (
                            <B2bChainPhaseBadge
                              orderStatusLabel={chain.orderStatusLabelRu ?? '—'}
                              chain={chain}
                              poQueueStatus={row.status}
                            />
                          ) : null}
                          <div className="flex flex-wrap gap-2 pt-1">
                            {showAccept ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="default"
                                className="min-h-11 text-[10px]"
                                disabled={busy}
                                data-testid={
                                  demoRow
                                    ? `factory-production-order-accept-${row.b2bOrderId}`
                                    : undefined
                                }
                                onClick={() => void handleAcceptRow(row)}
                              >
                                {busy ? '…' : 'Принять'}
                              </Button>
                            ) : null}
                            {showRetry ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="min-h-11 text-[10px]"
                                disabled={busy}
                                onClick={() => void handleRetryErp(row)}
                              >
                                Повтор ERP
                              </Button>
                            ) : null}
                          </div>
                          <div className={cn(hubGadget.goldenPath, 'text-[10px]')}>
                            <Link
                              href={factoryProductionDossierContextHref(row.articleId, {
                                collectionId: row.collectionId,
                                orderId: row.b2bOrderId,
                              })}
                              className={hubGadget.goldenLink}
                            >
                              Досье
                            </Link>
                            <span className={hubGadget.goldenSep} aria-hidden>
                              ·
                            </span>
                            <Link
                              href={factoryProductionHandoffQueueHref(row.b2bOrderId, {
                                factoryId,
                                collectionId: row.collectionId,
                              })}
                              className={hubGadget.goldenLink}
                            >
                              Очередь
                            </Link>
                            <span className={hubGadget.goldenSep} aria-hidden>
                              ·
                            </span>
                            <Link
                              href={factoryMaterialsProcurementHrefForDemo(demo)}
                              className={hubGadget.goldenLink}
                            >
                              Закупка
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
