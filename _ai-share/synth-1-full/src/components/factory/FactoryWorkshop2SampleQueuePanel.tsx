'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Shirt, AlertTriangle, ExternalLink, PackageCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { usePlatformCoreDevelopmentStatusPoll } from '@/hooks/use-platform-core-development-status-poll';
import { sortWorkshop2FactorySampleQueueItems } from '@/lib/production/workshop2-factory-sample-queue-utils';
import { MfrDevSampleQueueHandoffPeerStrip } from '@/components/factory/MfrDevSampleQueueHandoffPeerStrip';
import { MfrDevSamplePhotoDamStubStrip } from '@/components/factory/MfrDevSamplePhotoDamStubStrip';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  factorySampleQueueItemDomId,
  formatMfrSampleQueueStatusLabelRu,
  mfrSampleQueuePollLabelRu,
  parseFactorySampleQueueHash,
  WAVE_XC_FACTORY_SAMPLE_ACK_BTN_TESTID,
  WAVE_XC_FACTORY_SAMPLE_IN_PROGRESS_BTN_TESTID,
  WAVE_XC_FACTORY_SAMPLE_QUEUE_ITEM_TESTID,
  WAVE_XC_MFR_SAMPLE_QUEUE_COUNT_SUFFIX_RU,
  WAVE_XC_MFR_SAMPLE_QUEUE_EMPTY_RU,
  WAVE_XC_MFR_SAMPLE_QUEUE_LOADING_RU,
  WAVE_XC_MFR_SAMPLE_QUEUE_POLL_BADGE_TESTID,
  WAVE_XC_MFR_SAMPLE_QUEUE_SOURCE_PREFIX_RU,
} from '@/lib/platform/wave-xc-mfr-sample-status-patch';

type QueueItem = {
  orderId: string;
  collectionId: string;
  articleId: string;
  status: string;
  quantity: number;
  dueDate?: string;
  articleLabelRu?: string;
  qcStatusBadgeRu?: string;
  qcStatusTone?: 'emerald' | 'amber' | 'rose' | 'slate';
  dueOverdue?: boolean;
  workspaceFitQcHref: string;
};

type Props = {
  factoryId?: string;
  className?: string;
  /** Wave XC: shared poll tick — avoids duplicate EventSource when parent already polls. */
  devPollTick?: number;
  sseConnectedOverride?: boolean;
  suppressDevPollHook?: boolean;
};

/** Очередь образцов W2 → factory portal (не static MOCK). */
export function FactoryWorkshop2SampleQueuePanel({
  factoryId = 'fact-1',
  className,
  devPollTick: devPollTickProp,
  sseConnectedOverride,
  suppressDevPollHook = false,
}: Props) {
  const searchParams = useSearchParams();
  const collectionIds = useMemo(
    () => [searchParams.get('collection')?.trim() || 'SS27', 'FW27'],
    [searchParams]
  );
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>('');
  const [ackingId, setAckingId] = useState<string | null>(null);
  const [patchingId, setPatchingId] = useState<string | null>(null);
  const [focusOrderId, setFocusOrderId] = useState<string | undefined>();

  const internalPoll = usePlatformCoreDevelopmentStatusPoll(
    !suppressDevPollHook,
    collectionIds,
    factoryId
  );
  const devPollTick = devPollTickProp ?? internalPoll.tick;
  const sseConnected = sseConnectedOverride ?? internalPoll.sseConnected;

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/workshop2/factory/sample-queue?factoryId=${encodeURIComponent(factoryId)}&status=draft,sent,in_progress`,
        { headers: buildWorkshop2ApiRequestHeaders() }
      );
      const json = (await res.json()) as {
        ok?: boolean;
        items?: QueueItem[];
        source?: string;
      };
      if (json.ok && Array.isArray(json.items)) {
        setItems(sortWorkshop2FactorySampleQueueItems(json.items).slice(0, 6));
        setSource(json.source ?? '');
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
  }, [loadQueue, devPollTick]);

  useEffect(() => {
    const readHash = () => {
      const parsed = parseFactorySampleQueueHash(
        typeof window !== 'undefined' ? window.location.hash : ''
      );
      setFocusOrderId(parsed?.orderId);
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  useEffect(() => {
    if (!focusOrderId || loading) return;
    const scrollToItem = () => {
      const el = document.getElementById(factorySampleQueueItemDomId(focusOrderId));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return true;
      }
      return false;
    };
    if (scrollToItem()) return;
    let attempts = 0;
    const retry = window.setInterval(() => {
      attempts += 1;
      if (scrollToItem() || attempts >= 12) window.clearInterval(retry);
    }, 150);
    return () => window.clearInterval(retry);
  }, [focusOrderId, loading, items]);

  const patchSampleStatus = async (
    item: QueueItem,
    status: 'in_progress' | 'received',
    note: string
  ) => {
    const busyKey = `${item.orderId}:${status}`;
    setPatchingId(busyKey);
    try {
      const res = await fetch(
        `/api/workshop2/factory/sample-queue/${encodeURIComponent(item.orderId)}`,
        {
          method: 'PATCH',
          headers: {
            ...buildWorkshop2ApiRequestHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collectionId: item.collectionId,
            articleId: item.articleId,
            status,
            note,
          }),
        }
      );
      if (res.ok) {
        await loadQueue();
      }
    } finally {
      setPatchingId(null);
    }
  };

  const acknowledgeSample = async (item: QueueItem) => {
    setAckingId(item.orderId);
    try {
      await patchSampleStatus(item, 'received', 'Принят цехом (factory ack)');
    } finally {
      setAckingId(null);
    }
  };

  const pollLabelRu = mfrSampleQueuePollLabelRu(sseConnected);

  return (
    <Card
      data-testid="factory-w2-sample-queue"
      className={cn('border-border-subtle scroll-mt-24 rounded-xl shadow-sm', className)}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Shirt className="text-accent-primary h-4 w-4" />
              <span className="text-accent-primary text-[9px] font-black uppercase tracking-widest">
                Workshop2 · образцы
              </span>
            </div>
            <CardTitle className="text-sm font-black uppercase tracking-tight">
              Очередь образцов
            </CardTitle>
            <CardDescription className="text-xs">
              {WAVE_XC_MFR_SAMPLE_QUEUE_SOURCE_PREFIX_RU}:{' '}
              {source ? source : loading ? '…' : '—'}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className="text-[8px] font-black uppercase">
              {loading ? '…' : `${items.length} ${WAVE_XC_MFR_SAMPLE_QUEUE_COUNT_SUFFIX_RU}`}
            </Badge>
            <Badge
              variant="secondary"
              className="text-[8px] font-black uppercase"
              data-testid={WAVE_XC_MFR_SAMPLE_QUEUE_POLL_BADGE_TESTID}
            >
              {pollLabelRu}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <div className="space-y-2 px-4 pb-2">
        <MfrDevSampleQueueHandoffPeerStrip
          factoryId={factoryId}
          collectionId={items[0]?.collectionId ?? PLATFORM_CORE_DEMO.collectionId}
          articleId={items[0]?.articleId}
          orderId={items[0]?.orderId}
        />
        {items[0]?.articleId ? (
          <MfrDevSamplePhotoDamStubStrip
            collectionId={items[0].collectionId}
            articleId={items[0].articleId}
            orderId={items[0].orderId}
            factoryId={factoryId}
          />
        ) : null}
      </div>
      <CardContent className="space-y-2 p-4 pt-0">
        {loading ? (
          <p className="text-text-muted text-xs">{WAVE_XC_MFR_SAMPLE_QUEUE_LOADING_RU}</p>
        ) : items.length === 0 ? (
          <p className="text-text-muted text-xs">{WAVE_XC_MFR_SAMPLE_QUEUE_EMPTY_RU}</p>
        ) : (
          items.map((item) => {
            const statusRu = formatMfrSampleQueueStatusLabelRu(item.status);
            const isFocused = focusOrderId === item.orderId;
            return (
              <div
                key={item.orderId}
                id={factorySampleQueueItemDomId(item.orderId)}
                data-testid={WAVE_XC_FACTORY_SAMPLE_QUEUE_ITEM_TESTID}
                data-order-id={item.orderId}
                className={cn(
                  'border-border-subtle flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-white p-3',
                  isFocused && 'ring-accent-primary ring-2 ring-offset-1'
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold">
                    {item.articleLabelRu ?? item.articleId}
                  </p>
                  <p className="text-text-muted font-mono text-[10px]">
                    {item.collectionId} · {item.orderId} · ×{item.quantity}
                  </p>
                  {item.dueDate ? (
                    <p
                      className={cn(
                        'text-[10px] font-bold',
                        item.dueOverdue ? 'text-rose-600' : 'text-text-secondary'
                      )}
                    >
                      {item.dueOverdue ? (
                        <span className="inline-flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Просрочено: {item.dueDate}
                        </span>
                      ) : (
                        `Срок: ${item.dueDate}`
                      )}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  {item.qcStatusBadgeRu ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[8px] font-black uppercase',
                        item.qcStatusTone === 'emerald' && 'border-emerald-200 text-emerald-700',
                        item.qcStatusTone === 'amber' && 'border-amber-200 text-amber-700',
                        item.qcStatusTone === 'rose' && 'border-rose-200 text-rose-700'
                      )}
                    >
                      {item.qcStatusBadgeRu}
                    </Badge>
                  ) : null}
                  <Badge variant="secondary" className="text-[8px] font-black uppercase">
                    {statusRu}
                  </Badge>
                  {item.status === 'sent' ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-[9px] font-black"
                      disabled={patchingId === `${item.orderId}:in_progress`}
                      data-testid={WAVE_XC_FACTORY_SAMPLE_IN_PROGRESS_BTN_TESTID}
                      onClick={() =>
                        void patchSampleStatus(item, 'in_progress', 'В работе (factory PATCH)')
                      }
                    >
                      {patchingId === `${item.orderId}:in_progress` ? '…' : 'В работу'}
                    </Button>
                  ) : null}
                  {item.status === 'sent' || item.status === 'in_progress' ? (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="h-7 text-[9px] font-black"
                      disabled={ackingId === item.orderId}
                      data-testid={WAVE_XC_FACTORY_SAMPLE_ACK_BTN_TESTID}
                      onClick={() => void acknowledgeSample(item)}
                    >
                      <PackageCheck className="mr-1 h-3 w-3" aria-hidden />
                      {ackingId === item.orderId ? '…' : 'Принять'}
                    </Button>
                  ) : null}
                  <Button variant="outline" size="sm" className="h-7 text-[9px] font-black" asChild>
                    <Link href={item.workspaceFitQcHref}>
                      QC <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
