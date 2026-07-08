'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Factory, FileText, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { B2bChainPhaseBadge } from '@/components/b2b/B2bChainPhaseBadge';
import { useWorkshop2B2bChainSummaries } from '@/hooks/use-workshop2-b2b-chain-summaries';
import { factoryProductionOrdersOrderContextHref, ROUTES } from '@/lib/routes';
import { usePlatformCoreB2bRegistryPoll } from '@/hooks/use-platform-core-b2b-registry-poll';
import { useFactoryHandoffQueueSse } from '@/hooks/use-factory-handoff-queue-sse';
import {
  canRetryFactoryHandoffErp,
  factoryHandoffErpBadgeLabel,
  factoryHandoffNeedsErpAttention,
  factoryHandoffPoStatusLabelRu,
} from '@/lib/production/workshop2-factory-handoff-po-status';
import { isPlatformCorePgB2bOrder } from '@/lib/platform-core-demo-order';
import { buildOrderSectionCommsMessagesHref } from '@/lib/platform-core-comms-section-groups';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { PlatformCoreErpRetryHint } from '@/components/platform/PlatformCoreErpRetryHint';
import {
  pickEarliestErpNextRetryAt,
  summarizeFactoryErpAttentionRu,
} from '@/lib/production/workshop2-erp-retry-hint';
import { MfrOpHandoffQueueCoSpinePeerStrip } from '@/components/factory/MfrOpHandoffQueueCoSpinePeerStrip';
import { MfrOpHandoffQueueRegistrySoTStrip } from '@/components/factory/MfrOpHandoffQueueRegistrySoTStrip';
import { MfrOpWipGanttSoTStrip } from '@/components/factory/manufacturer/MfrOpWipGanttSoTStrip';
import { MfrOpWipFloorTabletSoTStrip } from '@/components/factory/manufacturer/MfrOpWipFloorTabletSoTStrip';
import { MfrOpHandoffFailedPoFilterStrip } from '@/components/factory/manufacturer/MfrOpHandoffFailedPoFilterStrip';
import { PlatformAiTaskStrip } from '@/components/platform/PlatformAiTaskStrip';

type HandoffItem = {
  productionOrderId: string;
  b2bOrderId: string;
  collectionId: string;
  articleId: string;
  qty: number;
  status: string;
  erpExternalId?: string;
  erpNextRetryAt?: string;
  erpAutoRetryCount?: number;
  erpLastError?: string;
  buyerId?: string;
  dossierHref: string;
};

type Props = {
  factoryId?: string;
  collectionId?: string;
  orderId?: string;
  className?: string;
};

function isAcknowledgeable(status: string): boolean {
  return status === 'pending_erp';
}

/** Серии B2B → цех после подтверждения брендом (с досье W2). */
export function FactoryWorkshop2ProductionHandoffPanel({
  factoryId = 'fact-1',
  collectionId,
  orderId,
  className,
}: Props) {
  const [items, setItems] = useState<HandoffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [ackInFlight, setAckInFlight] = useState(false);
  const [ackMessage, setAckMessage] = useState<string | null>(null);
  const [erpRetryId, setErpRetryId] = useState<string | null>(null);
  const [bulkErpInFlight, setBulkErpInFlight] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const failedPoFilterActive = searchParams.get('failedPo') === '1';

  const orderIds = useMemo(() => items.map((i) => i.b2bOrderId).filter(Boolean), [items]);
  const { summaries: chainSummaries } = useWorkshop2B2bChainSummaries(orderIds, items.length > 0);
  const { tick: registryTick } = usePlatformCoreB2bRegistryPoll(items.length > 0 || loading);
  const { tick: handoffSseTick, sseConnected: handoffSseConnected } = useFactoryHandoffQueueSse(
    factoryId,
    items.length > 0 || loading
  );

  const erpAttentionRows = useMemo(
    () => items.filter((row) => factoryHandoffNeedsErpAttention(row.status, row.erpExternalId)),
    [items]
  );
  const visibleItems = useMemo(
    () => (failedPoFilterActive ? erpAttentionRows : items),
    [failedPoFilterActive, erpAttentionRows, items]
  );
  const spineCollectionId = collectionId?.trim() || items[0]?.collectionId || '';
  const spineOrderId = orderId?.trim() || items[0]?.b2bOrderId || undefined;

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

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/workshop2/factory/production-handoff-queue?factoryId=${encodeURIComponent(factoryId)}`,
        { headers: buildWorkshop2ApiRequestHeaders() }
      );
      const json = (await res.json()) as { ok?: boolean; items?: HandoffItem[] };
      if (json.ok && Array.isArray(json.items)) {
        setItems(json.items);
        setSelected((prev) => {
          const next: Record<string, boolean> = {};
          for (const item of json.items!) {
            if (prev[item.productionOrderId] && isAcknowledgeable(item.status)) {
              next[item.productionOrderId] = true;
            }
          }
          return next;
        });
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [factoryId]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue, registryTick, handoffSseTick]);

  const pendingItems = useMemo(() => items.filter((i) => isAcknowledgeable(i.status)), [items]);
  const selectedPending = useMemo(
    () => pendingItems.filter((i) => selected[i.productionOrderId]),
    [pendingItems, selected]
  );

  const toggleAllPending = (checked: boolean) => {
    setSelected((prev) => {
      const next = { ...prev };
      for (const item of pendingItems) {
        next[item.productionOrderId] = checked;
      }
      return next;
    });
  };

  const handleRetryErp = async (item: HandoffItem) => {
    setErpRetryId(item.productionOrderId);
    setAckMessage(null);
    try {
      const res = await fetch('/api/workshop2/factory/production-handoff-queue/retry-erp', {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          factoryId,
          productionOrderId: item.productionOrderId,
          collectionId: item.collectionId,
          articleId: item.articleId,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; messageRu?: string };
      setAckMessage(json.messageRu ?? (json.ok ? 'ERP sync выполнен.' : 'ERP sync не удался.'));
      await loadQueue();
    } catch {
      setAckMessage('Сеть недоступна — повторите ERP sync.');
    } finally {
      setErpRetryId(null);
    }
  };

  const handleBulkAcknowledge = async () => {
    if (selectedPending.length === 0) return;
    setAckInFlight(true);
    setAckMessage(null);
    try {
      const res = await fetch('/api/workshop2/factory/production-handoff-queue/bulk-acknowledge', {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          factoryId,
          items: selectedPending.map((i) => ({
            productionOrderId: i.productionOrderId,
            collectionId: i.collectionId,
            articleId: i.articleId,
          })),
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        messageRu?: string;
        acknowledged?: string[];
        errors?: Array<{ messageRu: string }>;
      };
      if (json.messageRu) setAckMessage(json.messageRu);
      else if (json.errors?.length) setAckMessage(json.errors[0]?.messageRu ?? 'Ошибка приёмки');
      await loadQueue();
      setSelected({});

      const acknowledgedIds = new Set(json.acknowledged ?? []);
      const navRow =
        selectedPending.find((row) => acknowledgedIds.has(row.productionOrderId)) ??
        selectedPending[0];
      if (navRow?.b2bOrderId && acknowledgedIds.size > 0) {
        router.push(factoryProductionOrdersOrderContextHref(navRow.b2bOrderId, { factoryId }));
      }
    } catch {
      setAckMessage('Сеть недоступна — повторите приёмку.');
    } finally {
      setAckInFlight(false);
    }
  };

  const handleBulkErpRetry = async () => {
    if (erpAttentionRows.length === 0 || bulkErpInFlight) return;
    setBulkErpInFlight(true);
    setAckMessage(null);
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
          actor: 'factory-handoff-panel',
        }),
      });
      const json = (await res.json()) as { ok?: boolean; messageRu?: string };
      setAckMessage(json.messageRu ?? (json.ok ? 'ERP sync выполнен.' : 'ERP sync не удался.'));
      await loadQueue();
    } catch {
      setAckMessage('Сеть недоступна — повторите ERP sync.');
    } finally {
      setBulkErpInFlight(false);
    }
  };

  return (
    <Card
      className={`scroll-mt-24 ${className ?? ''}`}
      data-testid="mfr-op-handoff-queue-panel"
      data-audit-legacy="factory-production-handoff-panel"
    >
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Factory className="h-4 w-4" aria-hidden />
              Входящие серии (B2B → цех)
            </CardTitle>
            <CardDescription className="text-xs">
              Быстрая bulk-приёмка здесь · MES, ERP и полный реестр —{' '}
              <Link
                href={ROUTES.factory.productionOrders}
                data-testid="mfr-op-handoff-queue-registry-link"
                className="text-accent-primary font-medium hover:underline"
              >
                производственные заказы
              </Link>
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="text-[10px]"
              data-testid={`mfr-op-handoff-queue-sse-${handoffSseConnected ? 'live' : 'poll'}`}
            >
              {handoffSseConnected ? 'SSE live' : 'SSE poll'}
            </Badge>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[10px]"
              disabled={loading || ackInFlight}
              onClick={() => void loadQueue()}
              data-testid="mfr-op-handoff-queue-refresh"
            >
              Обновить
            </Button>
            {pendingItems.length > 0 ? (
              <Button
                size="sm"
                variant="default"
                disabled={ackInFlight || selectedPending.length === 0}
                onClick={() => void handleBulkAcknowledge()}
                data-testid="factory-handoff-bulk-acknowledge"
              >
                {ackInFlight
                  ? 'Приёмка…'
                  : selectedPending.length > 0
                    ? `Принять выбранные (${selectedPending.length})`
                    : 'Выберите серии'}
              </Button>
            ) : null}
          </div>
        </div>
        <MfrOpHandoffQueueRegistrySoTStrip registryHref={ROUTES.factory.productionOrders} />
        <MfrOpWipGanttSoTStrip
          variant="handoff-owner"
          registryHref={ROUTES.factory.productionOrders}
        />
        <MfrOpWipFloorTabletSoTStrip
          variant="handoff-owner"
          registryHref={ROUTES.factory.productionOrders}
        />
        {spineCollectionId ? (
          <MfrOpHandoffQueueCoSpinePeerStrip
            factoryId={factoryId}
            collectionId={spineCollectionId}
            orderId={spineOrderId}
          />
        ) : null}
        <MfrOpHandoffFailedPoFilterStrip
          failedCount={erpAttentionRows.length}
          totalCount={items.length}
          active={failedPoFilterActive}
        />
        {erpAttentionRows.length > 0 ? (
          <div
            className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-200/80 bg-amber-50/80 px-2 py-1.5 text-[10px] text-amber-950"
            data-testid="mfr-op-handoff-queue-erp-alert"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <p>{summarizeFactoryErpAttentionRu(erpAttentionSummary)}</p>
              {erpAlertNextRetryAt ? (
                <PlatformCoreErpRetryHint
                  erpNextRetryAt={erpAlertNextRetryAt}
                  testId="mfr-op-handoff-queue-erp-backoff-hint"
                  className="text-[10px] text-amber-900/80"
                />
              ) : null}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-6 border-amber-300 bg-white px-2 text-[9px]"
              disabled={bulkErpInFlight || erpRetryId != null}
              onClick={() => void handleBulkErpRetry()}
              data-testid="factory-handoff-bulk-erp-retry"
            >
              {bulkErpInFlight
                ? 'ERP…'
                : erpAttentionRows.length === 1
                  ? 'Повтор ERP'
                  : `Повтор ERP для всех (${erpAttentionRows.length})`}
            </Button>
          </div>
        ) : null}
        {pendingItems.length > 1 ? (
          <label className="text-text-muted mt-2 flex cursor-pointer items-center gap-2 text-[10px]">
            <Checkbox
              checked={selectedPending.length === pendingItems.length && pendingItems.length > 0}
              onCheckedChange={(v) => toggleAllPending(v === true)}
              data-testid="factory-handoff-select-all"
            />
            Выбрать все в очереди ({pendingItems.length})
          </label>
        ) : null}
        {ackMessage ? (
          <p className="text-text-secondary mt-1 text-[10px]" role="status">
            {ackMessage}
          </p>
        ) : null}
      </CardHeader>
      {isPlatformCoreMode() ? (
        <div className="px-6 pb-2">
          <PlatformAiTaskStrip
            sectionId="mfr-op-handoff-queue"
            pillarId="order_production"
            roleId="manufacturer"
            task="factory-ack ERP sync delay and handoff queue anomalies"
            collectionId={collectionId}
            orderId={orderId}
            orders={items.slice(0, 12).map((i) => ({
              orderId: i.b2bOrderId,
              productionOrderId: i.productionOrderId,
              status: i.status,
              collectionId: i.collectionId,
              articleId: i.articleId,
            }))}
            testId="mfr-op-handoff-queue-ai-anomaly"
            buttonLabel="Аномалии handoff (AI)"
          />
        </div>
      ) : null}
      <CardContent className="space-y-2">
        {loading ? (
          <p className="text-text-muted text-xs">Загрузка…</p>
        ) : visibleItems.length === 0 ? (
          <p
            className="text-text-muted text-xs"
            data-testid="mfr-op-handoff-failed-po-filter-empty"
          >
            {failedPoFilterActive
              ? 'Нет серий с ошибкой ERP — снимите фильтр.'
              : 'Нет входящих серий.'}
          </p>
        ) : (
          visibleItems.map((item) => {
            const chain = item.b2bOrderId ? chainSummaries[item.b2bOrderId] : undefined;
            const ackable = isAcknowledgeable(item.status);
            return (
              <div
                key={item.productionOrderId}
                className="border-border-subtle flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
                data-testid={
                  item.b2bOrderId && isPlatformCorePgB2bOrder(item.b2bOrderId)
                    ? `factory-handoff-row-${item.b2bOrderId}`
                    : undefined
                }
              >
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  {ackable ? (
                    <Checkbox
                      className="mt-0.5"
                      checked={Boolean(selected[item.productionOrderId])}
                      onCheckedChange={(v) =>
                        setSelected((prev) => ({
                          ...prev,
                          [item.productionOrderId]: v === true,
                        }))
                      }
                      data-testid={`factory-handoff-check-${item.productionOrderId}`}
                    />
                  ) : (
                    <span className="w-4" aria-hidden />
                  )}
                  <div className="min-w-0">
                    <p className="text-text-primary truncate text-xs font-semibold">
                      {item.productionOrderId}
                    </p>
                    <p className="text-text-muted text-[10px]">
                      B2B {item.b2bOrderId} · {item.collectionId}/{item.articleId} · {item.qty} шт.
                      {item.buyerId ? ` · ${item.buyerId}` : ''}
                    </p>
                    {item.b2bOrderId ? (
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <B2bChainPhaseBadge
                          orderStatusLabel={chain?.orderStatusLabelRu ?? '—'}
                          chain={chain}
                          poQueueStatus={item.status}
                        />
                        {!isPlatformCoreMode() ? (
                          <Link
                            href={buildOrderSectionCommsMessagesHref({
                              roleId: 'manufacturer',
                              orderId: item.b2bOrderId,
                              collectionId: item.collectionId,
                              sectionId: 'mfr-op-handoff-queue',
                              pillarId: 'order_production',
                            })}
                            data-testid={`mfr-op-handoff-queue-chat-link-${item.b2bOrderId}`}
                            className="text-accent-primary text-[10px] font-medium hover:underline"
                          >
                            Чат
                          </Link>
                        ) : null}
                        {item.b2bOrderId.startsWith('B2B-DEMO-') ? (
                          <Link
                            href={factoryProductionOrdersOrderContextHref(item.b2bOrderId, {
                              factoryId,
                            })}
                            data-testid={`mfr-op-handoff-queue-orders-link-${item.b2bOrderId}`}
                            className="text-accent-primary text-[10px] font-medium hover:underline"
                          >
                            Реестр
                          </Link>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant={item.status === 'error' ? 'destructive' : 'outline'}
                    className="text-[9px] font-semibold normal-case"
                    data-testid={
                      item.b2bOrderId.startsWith('B2B-DEMO-')
                        ? `mfr-op-handoff-queue-status-${item.b2bOrderId}`
                        : undefined
                    }
                  >
                    {factoryHandoffPoStatusLabelRu(item.status)}
                  </Badge>
                  {factoryHandoffErpBadgeLabel(item.status, item.erpExternalId) ? (
                    <Badge
                      variant="secondary"
                      className="text-[9px] font-normal"
                      data-testid={`factory-handoff-erp-${item.productionOrderId}`}
                    >
                      {factoryHandoffErpBadgeLabel(item.status, item.erpExternalId)}
                    </Badge>
                  ) : null}
                  {canRetryFactoryHandoffErp(item.status, item.erpExternalId) ? (
                    <>
                      {item.status === 'error' && item.erpLastError ? (
                        <p
                          className="max-w-[14rem] text-right text-[9px] leading-snug text-rose-800"
                          data-testid={`factory-handoff-erp-error-${item.productionOrderId}`}
                        >
                          {item.erpLastError.length > 72
                            ? `${item.erpLastError.slice(0, 72)}…`
                            : item.erpLastError}
                        </p>
                      ) : null}
                      {item.status === 'error' ? (
                        <PlatformCoreErpRetryHint
                          erpNextRetryAt={item.erpNextRetryAt}
                          erpAutoRetryCount={item.erpAutoRetryCount}
                          testId={`factory-handoff-erp-retry-hint-${item.productionOrderId}`}
                          className="text-text-muted text-right text-[9px]"
                        />
                      ) : null}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-6 text-[9px]"
                        disabled={erpRetryId === item.productionOrderId}
                        onClick={() => void handleRetryErp(item)}
                        data-testid={`factory-handoff-erp-retry-${item.productionOrderId}`}
                      >
                        {erpRetryId === item.productionOrderId ? 'ERP…' : 'Повтор ERP'}
                      </Button>
                    </>
                  ) : null}
                  <Link
                    href={item.dossierHref}
                    className="text-accent-primary inline-flex items-center gap-1 text-[10px] font-medium hover:underline"
                  >
                    <FileText className="h-3 w-3" aria-hidden />
                    Досье
                  </Link>
                  {isPlatformCorePgB2bOrder(item.b2bOrderId) ? (
                    <a
                      href={`/api/workshop2/factory/dossier/${encodeURIComponent(item.articleId)}/shop-floor-bundle?collectionId=${encodeURIComponent(item.collectionId)}&orderId=${encodeURIComponent(item.b2bOrderId)}`}
                      download
                      data-testid={`mfr-op-handoff-shop-floor-bundle-${item.b2bOrderId}`}
                      className="text-accent-primary inline-flex items-center gap-1 text-[10px] font-medium hover:underline"
                    >
                      <Download className="h-3 w-3" aria-hidden />
                      Shop-floor
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
