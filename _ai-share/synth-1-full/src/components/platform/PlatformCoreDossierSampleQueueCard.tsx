'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Circle, Shirt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { usePlatformCoreDevelopmentStatusPoll } from '@/hooks/use-platform-core-development-status-poll';
import { manufacturerHandoffFeatureHref } from '@/lib/platform-core-ports/manufacturer-handoff';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';

type QueueItem = {
  orderId: string;
  collectionId: string;
  articleId: string;
  status: string;
  movementStatus?: string;
};

type Props = {
  articleId: string;
  factoryId?: string;
  orderId?: string;
};

/** Compact peer: dossier → handoff sample-queue tab (без дубля full card). */
export function PlatformCoreDossierSampleQueueCard({
  articleId,
  factoryId: factoryIdProp,
  orderId,
}: Props) {
  const { collectionId, factoryId: demoFactoryId } = usePlatformCoreDemoContext();
  const factoryId = factoryIdProp?.trim() || demoFactoryId;
  const [item, setItem] = useState<QueueItem | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
  const { tick: devPollTick } = usePlatformCoreDevelopmentStatusPoll(
    true,
    [collectionId],
    factoryId
  );

  const loadQueue = useCallback(async () => {
    setLoadState('loading');
    try {
      const res = await fetch(
        `/api/workshop2/factory/sample-queue?factoryId=${encodeURIComponent(factoryId)}`,
        { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
      );
      const json = (await res.json()) as { ok?: boolean; items?: QueueItem[] };
      if (json.ok && json.items) {
        const hit = json.items.find(
          (i) => i.articleId === articleId && i.collectionId === collectionId
        );
        setItem(hit ?? null);
        setLoadState(hit ? 'ready' : 'empty');
      } else {
        setLoadState('error');
      }
    } catch {
      setLoadState('error');
    }
  }, [articleId, collectionId, factoryId]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue, devPollTick]);

  const sampleQueueHref = manufacturerHandoffFeatureHref('sample-queue', {
    factoryId,
    collectionId,
    orderId: orderId ?? item?.orderId,
  });

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-md border border-sky-200/50 bg-sky-50/40 px-3 py-2 text-xs"
      data-testid="dossier-sample-queue-bridge"
    >
      <Shirt className="h-3.5 w-3.5 text-sky-700" aria-hidden />
      <Badge variant="outline" className="border-sky-300 text-[9px] text-sky-800">
        Очередь образцов
      </Badge>
      {loadState === 'loading' ? (
        <span className="text-text-muted">Загрузка…</span>
      ) : item ? (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
          <span className="font-mono text-[10px]">{item.orderId}</span>
          <Badge variant="outline" className="text-[9px]">
            {item.status}
          </Badge>
        </>
      ) : (
        <>
          <Circle className="text-text-muted h-3.5 w-3.5" aria-hidden />
          <span className="text-text-muted">Нет образца в очереди</span>
        </>
      )}
      <Button size="sm" variant="outline" className="ml-auto h-7 text-[10px]" asChild>
        <Link href={sampleQueueHref} data-testid="dossier-sample-queue-handoff-tab-link">
          Передача · очередь образцов
        </Link>
      </Button>
    </div>
  );
}
