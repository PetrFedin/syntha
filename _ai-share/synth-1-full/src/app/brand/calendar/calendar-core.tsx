'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParamsNonNull } from '@/hooks/use-search-params-non-null';
import type { CalendarEvent } from '@/lib/types/calendar';

type BrandCalendarCoreMainProps = {
  initialB2bEvents?: CalendarEvent[];
};
import StyleCalendar from '@/components/user/style-calendar';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PlatformCoreCommsWorkspaceExtras } from '@/components/platform/PlatformCoreCommsWorkspaceExtras';
import { resolvePageCollectionId, getPlatformCoreDemo } from '@/lib/platform-core-hub-matrix';
import { usePlatformCoreCalendarEvents } from '@/hooks/use-platform-core-calendar-events';
import { usePlatformCoreCalendarTaskCreateEnabled } from '@/hooks/use-platform-core-calendar-task-create-enabled';
import { PlatformCoreCalendarUserTasksStrip } from '@/components/platform/PlatformCoreCalendarUserTasksStrip';
import { BrandCmCalendarContextPeerStrip } from '@/components/platform/BrandCmCalendarContextPeerStrip';
import { PlatformCoreCmCalendarEventTrackingStrip } from '@/components/platform/PlatformCoreCmCalendarEventTrackingStrip';
import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';
import { BrandDevTasksKanbanMiniPanel } from '@/components/platform/BrandDevTasksKanbanMiniPanel';

function BrandCalendarCoreMain({ initialB2bEvents }: BrandCalendarCoreMainProps) {
  const searchParams = useSearchParamsNonNull();
  const collectionId = resolvePageCollectionId({
    collection: searchParams.get('collection'),
    w2col: searchParams.get('w2col'),
    fallback: searchParams.get('collectionId'),
  });
  const orderId =
    searchParams.get('orderId')?.trim() || searchParams.get('order')?.trim() || undefined;
  const focusTaskId = searchParams.get('pcTask')?.trim() || undefined;
  const [w2Events, setW2Events] = useState<CalendarEvent[]>([]);
  const {
    events: b2bEvents,
    loading,
    error,
    refetch,
  } = usePlatformCoreCalendarEvents({
    collectionId,
    orderId,
    ownerRole: 'brand',
    enabled: true,
    initialEvents: initialB2bEvents,
  });
  const calendarTaskCreateEnabled = usePlatformCoreCalendarTaskCreateEnabled(true);
  const resolvedOrderId = orderId?.trim() || '';
  const { tick: chainTick } = usePlatformCoreChainStatusPoll(
    Boolean(resolvedOrderId),
    resolvedOrderId ? [resolvedOrderId] : []
  );

  useEffect(() => {
    if (!chainTick) return;
    refetch();
  }, [chainTick, refetch]);

  const contextSearchSeed = useMemo(() => {
    if (orderId) return undefined;
    const parts = [
      searchParams.get('collectionId')?.trim(),
      searchParams.get('collection')?.trim(),
    ].filter(Boolean) as string[];
    return [...new Set(parts)].join(' ') || undefined;
  }, [searchParams, orderId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const w2Url = `/api/brand/calendar/w2-events?collectionId=${encodeURIComponent(collectionId)}`;
        const w2Res = await fetch(w2Url);
        if (cancelled || !w2Res.ok) return;
        const w2Json = (await w2Res.json()) as { events?: CalendarEvent[] };
        if (Array.isArray(w2Json.events)) setW2Events(w2Json.events);
      } catch {
        if (!cancelled) setW2Events([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId]);

  const integrationEvents = useMemo(() => [...w2Events, ...b2bEvents], [w2Events, b2bEvents]);

  return (
    <>
      <BrandCmCalendarContextPeerStrip collectionId={collectionId} orderId={orderId} />
      <PlatformCoreCmCalendarEventTrackingStrip
        ownerRole="brand"
        collectionId={collectionId}
        orderId={resolvedOrderId || undefined}
        reloadNonce={chainTick}
      />
      {!loading && !error && b2bEvents.length > 0 ? (
        <p
          className="text-text-muted mb-1 text-[10px] tabular-nums"
          data-testid="brand-cm-calendar-events-badge"
          data-count={b2bEvents.length}
        >
          {b2bEvents.length} событий
        </p>
      ) : null}
      {!calendarTaskCreateEnabled ? (
        <p
          className="text-text-muted mb-1 text-[10px]"
          data-testid="brand-cm-calendar-pg-required-hint"
        >
          Слоты задач — после core:bootstrap
        </p>
      ) : null}
      <PlatformCoreCalendarUserTasksStrip
        collectionId={collectionId}
        orderId={orderId}
        ownerRole="brand"
        testIdPrefix="brand-cm-calendar-user-tasks"
        focusTaskId={focusTaskId}
        onTaskCreated={() => refetch()}
      />
      <div data-testid="brand-dev-tasks-kanban-calendar-strip">
        <BrandDevTasksKanbanMiniPanel collectionId={collectionId} variant="full" />
      </div>
      {loading ? <p className="text-text-secondary text-sm">Загрузка…</p> : null}
      {error ? <p className="text-sm text-amber-800">{error}</p> : null}
      <StyleCalendar
        initialRole="brand"
        variant="full"
        externalEvents={integrationEvents}
        externalEventsOnly
        contextSearchSeed={contextSearchSeed || undefined}
        platformCoreTaskContext={{
          collectionId,
          orderId,
          articleId: orderId ? undefined : getPlatformCoreDemo(collectionId).demoArticleId,
        }}
        onPlatformCoreTaskCreated={() => refetch()}
        platformCoreTaskCreateEnabled={calendarTaskCreateEnabled}
        calendarSearchTestId="brand-cm-calendar-search"
      />
    </>
  );
}

export function BrandCalendarCorePage({
  initialB2bEvents,
}: {
  initialB2bEvents?: CalendarEvent[];
}) {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
      <PlatformCoreListChrome highlightRole="brand" pillarId="comms">
        <PlatformCoreCommsWorkspaceExtras variant="brand" />
        <Suspense
          fallback={<div className="text-text-secondary py-10 text-sm">Загрузка календаря…</div>}
        >
          <BrandCalendarCoreMain initialB2bEvents={initialB2bEvents} />
        </Suspense>
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}
