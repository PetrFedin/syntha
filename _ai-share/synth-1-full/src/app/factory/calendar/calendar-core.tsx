'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import StyleCalendar from '@/components/user/style-calendar';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PlatformCoreCommsWorkspaceExtras } from '@/components/platform/PlatformCoreCommsWorkspaceExtras';
import { PlatformCoreFactoryCalendarOrderContextStrip } from '@/components/platform/PlatformCoreFactoryCalendarOrderContextStrip';
import { getPlatformCoreDemo, resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { usePlatformCoreCalendarEvents } from '@/hooks/use-platform-core-calendar-events';
import { usePlatformCoreCalendarTaskCreateEnabled } from '@/hooks/use-platform-core-calendar-task-create-enabled';
import { PlatformCoreCalendarUserTasksStrip } from '@/components/platform/PlatformCoreCalendarUserTasksStrip';
import { ManufacturerCalendarGanttBridgeStrip } from '@/components/factory/manufacturer/ManufacturerCalendarGanttBridgeStrip';
import { SupplierCalendarLogisticsPeerStrip } from '@/components/factory/supplier/SupplierCalendarLogisticsPeerStrip';
import { SupCmCalendarContextPeerStrip } from '@/components/factory/supplier/SupCmCalendarContextPeerStrip';
import { MfrCmCalendarContextPeerStrip } from '@/components/platform/MfrCmCalendarContextPeerStrip';
import { PlatformCoreCmCalendarEventTrackingStrip } from '@/components/platform/PlatformCoreCmCalendarEventTrackingStrip';
import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';

export function FactoryCalendarCorePage() {
  const searchParams = useSearchParams();
  const activeRole = (searchParams.get('role') as 'manufacturer' | 'supplier') || 'manufacturer';
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
    ownerRole: activeRole,
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
    <CabinetPageContent
      maxWidth="5xl"
      className={isPlatformCoreMode() ? 'space-y-6 pb-24' : 'space-y-6 px-4 py-6 pb-24 sm:px-6'}
    >
      <PlatformCoreListChrome highlightRole={activeRole} pillarId="comms">
        <PlatformCoreCommsWorkspaceExtras variant={activeRole} />
        {orderId ? (
          <PlatformCoreFactoryCalendarOrderContextStrip
            orderId={orderId}
            role={activeRole === 'supplier' ? 'supplier' : 'manufacturer'}
          />
        ) : null}
        {!loading && !error && events.length > 0 ? (
          <p
            className="text-text-muted mb-1 text-[10px] tabular-nums"
            data-testid={
              activeRole === 'supplier'
                ? 'sup-cm-calendar-events-badge'
                : 'mfr-cm-calendar-events-badge'
            }
            data-count={events.length}
          >
            B2B-события: {events.length}
          </p>
        ) : null}
        {activeRole === 'manufacturer' ? (
          <>
            <MfrCmCalendarContextPeerStrip
              collectionId={collectionId}
              factoryId={demo.factoryId}
              orderId={orderId}
            />
            <ManufacturerCalendarGanttBridgeStrip
              collectionId={collectionId}
              orderId={orderId}
              articleId={demo.demoArticleId}
              factoryId={demo.factoryId}
            />
          </>
        ) : null}
        {activeRole === 'supplier' ? (
          <SupCmCalendarContextPeerStrip
            collectionId={collectionId}
            articleId={demo.demoArticleId}
            factoryId={demo.factoryId}
            orderId={orderId}
          />
        ) : null}
        {activeRole === 'supplier' && orderId ? (
          <SupplierCalendarLogisticsPeerStrip
            collectionId={collectionId}
            articleId={demo.demoArticleId}
            orderId={orderId}
          />
        ) : null}
        <PlatformCoreCmCalendarEventTrackingStrip
          ownerRole={activeRole}
          collectionId={collectionId}
          orderId={resolvedOrderId || undefined}
          reloadNonce={chainTick}
        />
        <PlatformCoreCalendarUserTasksStrip
          collectionId={collectionId}
          orderId={orderId}
          ownerRole={activeRole}
          testIdPrefix={
            activeRole === 'supplier' ? 'sup-cm-calendar-user-tasks' : 'mfr-cm-calendar-user-tasks'
          }
          focusTaskId={focusTaskId}
          onTaskCreated={() => refetch()}
        />
        {loading ? (
          <p className="text-text-secondary text-sm">Загрузка событий календаря…</p>
        ) : null}
        {error ? <p className="text-sm text-amber-800">{error}</p> : null}
        {!calendarTaskCreateEnabled ? (
          <p
            className="text-text-muted mb-1 text-[10px]"
            data-testid="mfr-cm-calendar-pg-required-hint"
          >
            Слоты задач — после core:bootstrap
          </p>
        ) : null}
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
          calendarSearchTestId={
            activeRole === 'supplier' ? 'sup-cm-calendar-search' : 'mfr-cm-calendar-search'
          }
        />
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}
