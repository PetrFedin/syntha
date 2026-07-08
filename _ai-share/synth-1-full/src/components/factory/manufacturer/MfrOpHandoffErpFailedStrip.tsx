'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import {
  summarizeFactoryErpAttentionRu,
  WORKSHOP2_ERP_AUTO_RETRY_MAX,
} from '@/lib/production/workshop2-erp-retry-hint';
import { factoryHandoffQueueHrefForDemo, PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { factoryProductionOrdersOrderContextHref } from '@/lib/routes';

type QueueItem = {
  productionOrderId: string;
  b2bOrderId: string;
  status: string;
  erpExternalId?: string;
  erpLastError?: string;
  erpAutoRetryCount?: number;
};

function needsErpRetry(item: QueueItem): boolean {
  if (item.status === 'error' || item.status === 'pending_erp') return true;
  const ext = item.erpExternalId?.trim() ?? '';
  return item.status === 'synced' && ext.startsWith('FACTORY-ACK-');
}

type Props = {
  factoryId: string;
  compact?: boolean;
};

/** ERP retry dashboard: failed/pending PO filter + bulk retry (Wave SJ). */
export function MfrOpHandoffErpFailedStrip({ factoryId, compact = false }: Props) {
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
    const retryItems = items.filter(needsErpRetry);
    const errorCount = retryItems.filter((i) => i.status === 'error').length;
    const pendingCount = retryItems.filter((i) => i.status === 'pending_erp').length;
    const journalOnlyCount = retryItems.filter(
      (i) => i.status === 'synced' && (i.erpExternalId ?? '').startsWith('FACTORY-ACK-')
    ).length;
    return { retryItems, errorCount, pendingCount, journalOnlyCount, total: retryItems.length };
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
            collectionId: PLATFORM_CORE_DEMO.collectionId,
            articleId: PLATFORM_CORE_DEMO.demoArticleId,
          })),
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

  return (
    <div
      className={
        compact
          ? 'flex flex-wrap items-center gap-2 rounded-md border border-rose-200/80 bg-rose-50/50 px-2 py-1'
          : 'space-y-2 rounded-md border border-rose-200/80 bg-rose-50/50 px-2 py-1.5'
      }
      data-testid="mfr-op-handoff-erp-failed-filter"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <AlertTriangle className="h-3.5 w-3.5 text-rose-700" aria-hidden />
        <span
          className="text-[10px] font-semibold text-rose-900"
          data-testid="mfr-op-handoff-erp-failed-count"
        >
          ERP · {attention.total}
        </span>
        {!compact ? (
          <span className="text-[10px] text-rose-800">{summary}</span>
        ) : (
          <span className="text-text-muted line-clamp-1 text-[10px]">{summary}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-[10px]"
          disabled={busy}
          onClick={() => void bulkRetry()}
          data-testid="mfr-op-handoff-erp-bulk-retry-btn"
        >
          {busy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
          Повторить ERP ({attention.total})
        </Button>
        <Link
          href={factoryHandoffQueueHrefForDemo({ ...PLATFORM_CORE_DEMO, factoryId })}
          className="text-accent-primary text-[10px] font-medium hover:underline"
          data-testid="mfr-op-handoff-erp-queue-link"
        >
          Очередь
        </Link>
        {firstOrder ? (
          <Link
            href={`${factoryProductionOrdersOrderContextHref(firstOrder, { factoryId })}&erpFailed=1`}
            className="text-accent-primary text-[10px] hover:underline"
            data-testid="mfr-op-handoff-erp-failed-orders-link"
          >
            Только ошибки
          </Link>
        ) : null}
      </div>
      {msg ? (
        <p className="text-[10px] text-rose-900" data-testid="mfr-op-handoff-erp-retry-msg">
          {msg}
        </p>
      ) : null}
      {!compact ? (
        <p className="text-text-muted text-[9px]">
          Автоповтор до {WORKSHOP2_ERP_AUTO_RETRY_MAX}×, затем ручной retry.
        </p>
      ) : null}
    </div>
  );
}
