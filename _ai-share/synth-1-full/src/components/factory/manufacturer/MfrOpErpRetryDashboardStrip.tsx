'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import {
  summarizeFactoryErpAttentionRu,
  WORKSHOP2_ERP_AUTO_RETRY_MAX,
} from '@/lib/production/workshop2-erp-retry-hint';
import { factoryHandoffNeedsErpAttention } from '@/lib/production/workshop2-factory-handoff-po-status';
import {
  factoryHandoffQueueHrefForDemo,
  PLATFORM_CORE_DEMO,
} from '@/lib/platform-core-hub-matrix';
import { factoryProductionOrdersOrderContextHref, ROUTES } from '@/lib/routes';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';

type QueueItem = {
  productionOrderId: string;
  b2bOrderId: string;
  status: string;
  erpExternalId?: string;
  erpAutoRetryCount?: number;
  collectionId?: string;
  articleId?: string;
};

function handoffFailedPoFilterHref(factoryId: string, collectionId?: string): string {
  const sp = new URLSearchParams();
  sp.set('factoryId', factoryId);
  if (collectionId?.trim()) sp.set('collection', collectionId.trim());
  sp.set(PILLAR_CAPABILITY_FEATURE_PARAM, 'handoff');
  sp.set('failedPo', '1');
  return `${ROUTES.factory.production}?${sp.toString()}#handoff-queue`;
}

type Props = {
  factoryId: string;
  collectionId?: string;
};

/** Wave VD: ERP retry dashboard — сводка ошибок/journal + bulk retry + ссылки на очередь. */
export function MfrOpErpRetryDashboardStrip({ factoryId, collectionId }: Props) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/workshop2/factory/production-handoff-queue?factoryId=${encodeURIComponent(factoryId)}`,
        { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
      );
      const json = (await res.json()) as { items?: QueueItem[] };
      setItems(json.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoaded(true);
    }
  }, [factoryId]);

  useEffect(() => {
    void load();
  }, [load]);

  const attention = useMemo(() => {
    const retryItems = items.filter((i) =>
      factoryHandoffNeedsErpAttention(i.status, i.erpExternalId)
    );
    let errorCount = 0;
    let pendingCount = 0;
    let journalOnlyCount = 0;
    for (const row of retryItems) {
      if (row.status === 'error') errorCount += 1;
      else if (row.status === 'pending_erp') pendingCount += 1;
      else if (
        row.status === 'synced' &&
        String(row.erpExternalId ?? '').startsWith('FACTORY-ACK-')
      ) {
        journalOnlyCount += 1;
      }
    }
    return {
      retryItems,
      errorCount,
      pendingCount,
      journalOnlyCount,
      total: retryItems.length,
    };
  }, [items]);

  const bulkRetry = async () => {
    if (busy || attention.total === 0) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/workshop2/factory/production-handoff-queue/bulk-retry-erp', {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          factoryId,
          items: attention.retryItems.map((i) => ({
            productionOrderId: i.productionOrderId,
            collectionId: i.collectionId ?? collectionId ?? PLATFORM_CORE_DEMO.collectionId,
            articleId: i.articleId ?? PLATFORM_CORE_DEMO.demoArticleId,
          })),
          actor: 'mfr-op-erp-retry-dashboard',
        }),
      });
      const json = (await res.json()) as { ok?: boolean; messageRu?: string };
      setMsg(json.messageRu ?? (json.ok ? 'ERP повторён.' : 'Не удалось повторить ERP.'));
      await load();
    } catch {
      setMsg('Ошибка повторного ERP.');
    } finally {
      setBusy(false);
    }
  };

  if (!loaded || attention.total === 0) return null;

  const summary = summarizeFactoryErpAttentionRu(attention);
  const firstOrder = attention.retryItems.find((i) => i.b2bOrderId.trim())?.b2bOrderId;
  const spineCollectionId = collectionId ?? attention.retryItems[0]?.collectionId;

  return (
    <div
      className="space-y-2 rounded-md border border-rose-200/80 bg-rose-50/60 px-3 py-2"
      data-testid="mfr-op-erp-retry-dashboard-strip"
    >
      <div className="flex flex-wrap items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-rose-700" aria-hidden />
        <span className="text-xs font-semibold text-rose-950">ERP · панель повторов</span>
        <Badge
          variant="outline"
          className="border-rose-300 bg-white text-[9px] text-rose-900"
          data-testid="mfr-op-erp-retry-dashboard-count"
        >
          {attention.total}
        </Badge>
      </div>
      <p className="text-[10px] text-rose-900" data-testid="mfr-op-erp-retry-dashboard-summary">
        {summary}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {attention.errorCount > 0 ? (
          <Badge variant="outline" className="text-[9px]" data-testid="mfr-op-erp-retry-dashboard-error-count">
            Ошибки · {attention.errorCount}
          </Badge>
        ) : null}
        {attention.journalOnlyCount > 0 ? (
          <Badge variant="outline" className="text-[9px]" data-testid="mfr-op-erp-retry-dashboard-journal-count">
            Журнал · {attention.journalOnlyCount}
          </Badge>
        ) : null}
        {attention.pendingCount > 0 ? (
          <Badge variant="outline" className="text-[9px]" data-testid="mfr-op-erp-retry-dashboard-pending-count">
            Ожидает · {attention.pendingCount}
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-[10px]"
          disabled={busy}
          onClick={() => void bulkRetry()}
          data-testid="mfr-op-erp-retry-dashboard-bulk-retry-btn"
        >
          {busy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
          Повторить ERP ({attention.total})
        </Button>
        <Link
          href={handoffFailedPoFilterHref(factoryId, spineCollectionId)}
          className="text-accent-primary text-[10px] font-medium hover:underline"
          data-testid="mfr-op-erp-retry-dashboard-failed-filter-link"
        >
          Фильтр ошибок в очереди
        </Link>
        <Link
          href={factoryHandoffQueueHrefForDemo({ ...PLATFORM_CORE_DEMO, factoryId })}
          className="text-accent-primary text-[10px] hover:underline"
          data-testid="mfr-op-erp-retry-dashboard-handoff-link"
        >
          Очередь передачи
        </Link>
        {firstOrder ? (
          <Link
            href={`${factoryProductionOrdersOrderContextHref(firstOrder, { factoryId })}&erpFailed=1`}
            className="text-accent-primary text-[10px] hover:underline"
            data-testid="mfr-op-erp-retry-dashboard-orders-link"
          >
            Реестр · только ошибки
          </Link>
        ) : null}
      </div>
      {msg ? (
        <p className="text-[10px] text-rose-900" data-testid="mfr-op-erp-retry-dashboard-msg">
          {msg}
        </p>
      ) : null}
      <p className="text-text-muted text-[9px]" data-testid="mfr-op-erp-retry-dashboard-hint">
        Автоповтор до {WORKSHOP2_ERP_AUTO_RETRY_MAX}× (wave TG), затем ручной retry.
      </p>
    </div>
  );
}
