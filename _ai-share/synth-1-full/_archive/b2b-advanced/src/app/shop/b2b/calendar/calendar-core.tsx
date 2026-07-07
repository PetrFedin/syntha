'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import StyleCalendar from '@/components/user/style-calendar';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PlatformCoreCommsWorkspaceExtras } from '@/components/platform/PlatformCoreCommsWorkspaceExtras';
import { PlatformCoreCalendarUserTasksStrip } from '@/components/platform/PlatformCoreCalendarUserTasksStrip';
import { ShopCmCalendarContextPeerStrip } from '@/components/platform/ShopCmCalendarContextPeerStrip';
import { ShopCmCalendarEventTrackingStrip } from '@/components/platform/ShopCmCalendarEventTrackingStrip';
import { getPlatformCoreDemo, resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { usePlatformCoreCalendarEvents } from '@/hooks/use-platform-core-calendar-events';
import { usePlatformCoreCalendarTaskCreateEnabled } from '@/hooks/use-platform-core-calendar-task-create-enabled';
import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';

export function ShopB2bCalendarCorePage() {
  const searchParams = useSearchParams();
  const { activeOrderId: spineOrderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: '',
    resolveFrom: ['operational', 'allocation'],
    actorRole: 'shop',
  });
  const collectionId = resolvePageCollectionId({
    collection: searchParams.get('collection'),
    w2col: searchParams.get('w2col'),
  });
  const orderId =
    searchParams.get('orderId')?.trim() || searchParams.get('order')?.trim() || spineOrderId;
  const focusTaskId = searchParams.get('pcTask')?.trim() || undefined;
  const { events, loading, error, refetch } = usePlatformCoreCalendarEvents({
    collectionId,
    orderId,
    ownerRole: 'shop',
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
      className={isPlatformCoreMode() ? 'space-y-4 pb-24' : 'space-y-4 px-4 py-6 pb-24 sm:px-6'}
    >
      <PlatformCoreListChrome highlightRole="shop" pillarId="comms">
        <PlatformCoreCommsWorkspaceExtras variant="shop" />
        <ShopCmCalendarContextPeerStrip
          collectionId={collectionId}
          orderId={orderId || undefined}
        />
        <ShopCmCalendarEventTrackingStrip
          collectionId={collectionId}
          orderId={resolvedOrderId || undefined}
          reloadNonce={chainTick}
        />
        <PlatformCoreCalendarUserTasksStrip
          collectionId={collectionId}
          orderId={orderId || undefined}
          ownerRole="shop"
          testIdPrefix="shop-cm-calendar-user-tasks"
          focusTaskId={focusTaskId}
          onTaskCreated={() => refetch()}
        />
        {!loading && !error && events.length > 0 ? (
          <p
            className="text-text-muted mb-1 text-[10px] tabular-nums"
            data-testid="shop-cm-calendar-events-badge"
            data-count={events.length}
          >
            {events.length} событий
          </p>
        ) : null}
        {loading ? <p className="text-text-secondary text-sm">Загрузка…</p> : null}
        {error ? <p className="text-sm text-amber-800">{error}</p> : null}
        {!calendarTaskCreateEnabled ? (
          <p
            className="text-text-muted mb-1 text-[10px]"
            data-testid="shop-cm-calendar-pg-required-hint"
          >
            Слоты задач — после core:bootstrap
          </p>
        ) : null}
        <StyleCalendar
          initialRole="shop"
          externalEvents={events}
          externalEventsOnly
          contextSearchSeed={orderId}
          platformCoreTaskContext={{
            collectionId,
            orderId: orderId || undefined,
            articleId: orderId ? undefined : demo.demoArticleId,
          }}
          onPlatformCoreTaskCreated={() => refetch()}
          platformCoreTaskCreateEnabled={calendarTaskCreateEnabled}
          calendarSearchTestId="shop-cm-calendar-search"
        />
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}
