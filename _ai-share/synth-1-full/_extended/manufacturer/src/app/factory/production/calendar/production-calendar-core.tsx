'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import StyleCalendar from '@/components/user/style-calendar';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PlatformCoreCommsWorkspaceExtras } from '@/components/platform/PlatformCoreCommsWorkspaceExtras';
import { PlatformCoreFactoryCalendarOrderContextStrip } from '@/components/platform/PlatformCoreFactoryCalendarOrderContextStrip';
import { getPlatformCoreDemo, resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { usePlatformCoreCalendarEvents } from '@/hooks/use-platform-core-calendar-events';
import { usePlatformCoreCalendarTaskCreateEnabled } from '@/hooks/use-platform-core-calendar-task-create-enabled';
import { ManufacturerCalendarGanttBridgeStrip } from '@/components/factory/manufacturer/ManufacturerCalendarGanttBridgeStrip';
import { ManufacturerCalendarGanttBridgeWipStrip } from '@/components/factory/manufacturer/ManufacturerCalendarGanttBridgeWipStrip';
import { MfrCmCalendarAttachTzBwPeerStrip } from '@/components/factory/MfrCmCalendarAttachTzBwPeerStrip';
import { MfrCmCalendarContextPeerStrip } from '@/components/platform/MfrCmCalendarContextPeerStrip';
import { PlatformCoreCalendarUserTasksStrip } from '@/components/platform/PlatformCoreCalendarUserTasksStrip';
import { PlatformCoreCmCalendarEventTrackingStrip } from '@/components/platform/PlatformCoreCmCalendarEventTrackingStrip';
import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';
import { PlatformCorePcTaskAutoEnsure } from '@/components/platform/PlatformCorePcTaskAutoEnsure';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

export function FactoryProductionCalendarCorePage() {
  const searchParams = useSearchParams();
  const activeRole = (searchParams.get('role') as 'manufacturer' | 'supplier') || 'manufacturer';
  const highlightRole = activeRole === 'supplier' ? 'supplier' : 'manufacturer';
  const collectionId = resolvePageCollectionId({
    collection: searchParams.get('collection'),
    w2col: searchParams.get('w2col'),
  });
  const orderId =
    searchParams.get('orderId')?.trim() || searchParams.get('order')?.trim() || undefined;
  const focusTaskId = searchParams.get('pcTask')?.trim() || undefined;
  const { events, loading, error, refetch } = usePlatformCoreCalendarEvents({
    collectionId,
    orderId,
    ownerRole: highlightRole,
    enabled: true,
  });
  const demo = getPlatformCoreDemo(collectionId);
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

  return (
    <div className="space-y-4 p-4">
      <PlatformCoreListChrome highlightRole={highlightRole} pillarId="comms">
        <PlatformCoreCommsWorkspaceExtras variant={highlightRole} />
        {orderId ? (
          <PlatformCoreFactoryCalendarOrderContextStrip orderId={orderId} role="manufacturer" />
        ) : null}
        {isPlatformCoreMode() ? (
          <MfrCmCalendarContextPeerStrip
            collectionId={collectionId}
            factoryId={demo.factoryId}
            orderId={orderId}
          />
        ) : null}
        {!loading && !error && events.length > 0 ? (
          <p
            className="text-muted-foreground mb-2 text-[11px]"
            data-testid="mfr-cm-calendar-events-badge"
            data-count={events.length}
          >
            B2B-события: {events.length}
          </p>
        ) : null}
        <ManufacturerCalendarGanttBridgeStrip
          collectionId={collectionId}
          orderId={orderId}
          factoryId={demo.factoryId}
          articleId={demo.demoArticleId}
        />
        <ManufacturerCalendarGanttBridgeWipStrip
          factoryId={demo.factoryId}
          collectionId={collectionId}
          orderId={orderId}
          focusTaskId={focusTaskId}
        />
        {isPlatformCoreMode() ? (
          <MfrCmCalendarAttachTzBwPeerStrip
            collectionId={collectionId}
            articleId={demo.demoArticleId}
            orderId={orderId}
            factoryId={demo.factoryId}
          />
        ) : null}
        <PlatformCoreCmCalendarEventTrackingStrip
          ownerRole="manufacturer"
          collectionId={collectionId}
          orderId={resolvedOrderId || undefined}
          reloadNonce={chainTick}
        />
        <PlatformCorePcTaskAutoEnsure
          collectionId={collectionId}
          orderId={orderId}
          ownerRole="manufacturer"
          focusTaskId={focusTaskId}
          events={events}
          onEnsured={() => refetch()}
        />
        {loading ? <p className="text-text-secondary text-sm">Загрузка событий календаря…</p> : null}
        {error ? <p className="text-sm text-amber-800">{error}</p> : null}
        {!calendarTaskCreateEnabled ? (
          <p
            className="text-text-muted mb-1 text-[10px]"
            data-testid="mfr-cm-calendar-pg-required-hint"
          >
            Слоты задач — после core:bootstrap
          </p>
        ) : null}
        <PlatformCoreCalendarUserTasksStrip
          collectionId={collectionId}
          orderId={orderId}
          ownerRole="manufacturer"
          testIdPrefix="mfr-cm-calendar-user-tasks"
          focusTaskId={focusTaskId}
          onTaskCreated={() => refetch()}
        />
        <StyleCalendar
          initialRole={activeRole}
          externalEvents={events}
          externalEventsOnly
          contextSearchSeed={orderId}
          platformCoreTaskContext={{
            collectionId,
            orderId,
            articleId: orderId ? undefined : demo.demoArticleId,
          }}
          onPlatformCoreTaskCreated={() => refetch()}
          platformCoreTaskCreateEnabled={calendarTaskCreateEnabled}
          calendarSearchTestId="mfr-cm-calendar-search"
        />
      </PlatformCoreListChrome>
    </div>
  );
}
