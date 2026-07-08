'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import { shopCalendarB2bOrderContextHref } from '@/lib/platform-core-routes';
import { shopCoTrackingMaterialsPushTestId } from '@/lib/platform-core-shop-tracking-chain-mirror';
import { cn } from '@/lib/utils';

type Props = {
  orderId: string;
  materialsDone: boolean;
  materialsPending?: boolean;
  handedOff?: boolean;
  sseConnected: boolean;
  refreshTick: number;
};

type MaterialsEvent = {
  id: string;
  titleRu: string;
  bodyRu?: string;
};

/** Push materials_supplied из PG notification_events + live bump по chain SSE. */
export function ShopCoTrackingMaterialsPushStrip({
  orderId,
  materialsDone,
  materialsPending = false,
  handedOff = false,
  sseConnected,
  refreshTick,
}: Props) {
  const [event, setEvent] = useState<MaterialsEvent | null>(null);
  const [storageMode, setStorageMode] = useState<'postgres' | 'memory' | 'unknown'>('unknown');
  const [pushBump, setPushBump] = useState(false);
  const prevMaterialsDoneRef = useRef(materialsDone);

  useEffect(() => {
    if (materialsDone && !prevMaterialsDoneRef.current && refreshTick > 0) {
      setPushBump(true);
    }
    prevMaterialsDoneRef.current = materialsDone;
  }, [materialsDone, refreshTick]);

  useEffect(() => {
    const oid = orderId.trim();
    if (!oid) {
      setEvent(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/platform-core/notification-events?role=shop&orderId=${encodeURIComponent(oid)}&limit=6`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        if (!res.ok || cancelled) return;
        const json = (await res.json()) as {
          events?: Array<{
            id: string;
            kind: string;
            titleRu: string;
            bodyRu?: string;
          }>;
          storageMode?: string;
        };
        if (cancelled) return;
        setStorageMode(json.storageMode === 'postgres' ? 'postgres' : 'memory');
        const materials = (json.events ?? []).find((row) => row.kind === 'materials_supplied');
        if (materials) {
          setEvent({
            id: materials.id,
            titleRu: materials.titleRu,
            bodyRu: materials.bodyRu,
          });
          if (materialsDone) setPushBump(true);
        } else if (!materialsDone) {
          setEvent(null);
        }
      } catch {
        if (!cancelled) setEvent(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, refreshTick, materialsDone]);

  if (!materialsDone && !materialsPending && !event && !handedOff) return null;

  const testId = shopCoTrackingMaterialsPushTestId(orderId);
  const sseLive = Boolean(materialsDone && sseConnected);
  const showPushBadge = pushBump || (materialsDone && event?.id);

  return (
    <div
      className={cn(
        'mt-2 flex flex-wrap items-center gap-2 rounded-md border px-2 py-1.5 text-[10px]',
        materialsDone
          ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900'
          : 'border-amber-200 bg-amber-50/80 text-amber-900'
      )}
      data-testid={testId}
      data-materials-sse-live={sseLive ? '1' : '0'}
      data-materials-push-bump={showPushBadge ? '1' : '0'}
    >
      <Badge variant="outline" className="border-current/30 text-[9px]">
        {materialsDone ? 'Материалы · push' : 'Материалы · ожидание'}
      </Badge>
      {showPushBadge ? (
        <Badge
          variant="outline"
          className="border-emerald-400 bg-emerald-100/80 text-[8px] uppercase tracking-wide text-emerald-900"
          data-testid={`${testId}-materials-supplied-push`}
        >
          materials_supplied
        </Badge>
      ) : null}
      <span className="min-w-0 flex-1 font-medium">
        {event?.titleRu ??
          (materialsDone
            ? 'Материалы подтверждены поставщиком'
            : 'Ожидаем подтверждение материалов')}
      </span>
      {event?.bodyRu ? (
        <span className="text-text-secondary hidden max-w-[16rem] truncate sm:inline">
          {event.bodyRu}
        </span>
      ) : null}
      <Badge
        variant="outline"
        className="text-[8px] uppercase tracking-wide"
        data-testid={`${testId}-storage-${storageMode === 'postgres' ? 'pg' : 'local'}`}
      >
        {storageMode === 'postgres' ? 'PG' : 'local'}
      </Badge>
      <Link
        href={shopCalendarB2bOrderContextHref(orderId)}
        className="text-accent-primary font-semibold hover:underline"
        data-testid={`${testId}-calendar-link`}
      >
        Календарь
      </Link>
    </div>
  );
}
