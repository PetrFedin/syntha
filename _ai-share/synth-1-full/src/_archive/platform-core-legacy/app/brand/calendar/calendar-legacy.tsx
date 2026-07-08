'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

import { useSearchParamsNonNull } from '@/hooks/use-search-params-non-null';
import { Suspense, useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { getAllCalendarEvents } from '@/lib/live-process/calendar-sync';
import { getCalendarEvents } from '@/lib/collaboration/calendar-store';
import type { CalendarEvent } from '@/lib/types/calendar';
import StyleCalendar from '@/components/user/style-calendar';
import { CollaborationCalendarSection } from '@/components/collaboration/CollaborationCalendarSection';
import { CommunicationsNavBar } from '@/components/brand/communications/CommunicationsNavBar';
import { CommunicationsOperationalStrip } from '@/components/brand/communications/CommunicationsOperationalStrip';
import { CommunicationsUpcomingStrip } from '@/components/brand/communications/CommunicationsUpcomingStrip';
import { demoCalendarEventsForProductionStage } from '@/lib/production/stages-comm-demo';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getCommLinks } from '@/lib/data/entity-links';
import { CommunicationsEntityContextBanner } from '@/components/brand/communications/CommunicationsEntityContextBanner';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { mapPlatformCoreB2bEventToCalendar } from '@/lib/platform-core-calendar-events-client';
import type { Workshop2B2bCalendarEvent } from '@/lib/production/workshop2-b2b-campaign-hub';

/** Преобразовать LIVE process события в CalendarEvent */
function mapLiveToCalendarEvent(e: {
  id: string;
  processId: string;
  contextId: string;
  stageId: string;
  title: string;
  startAt: string;
  endAt: string;
}): CalendarEvent {
  return {
    id: e.id,
    ownerId: 'live',
    ownerRole: 'brand',
    ownerName: 'LIVE process',
    calendarId: 'live',
    title: e.title,
    description: `${e.processId} · ${e.contextId}`,
    layer: 'production',
    visibility: 'internal',
    type: 'event',
    startAt: e.startAt,
    endAt: e.endAt,
    participants: [],
    importance: 'high',
  };
}

function BrandCalendarMain({ coreMode }: { coreMode?: boolean }) {
  const { user } = useAuth();
  const searchParams = useSearchParamsNonNull();
  const collectionId = resolvePageCollectionId({
    collection: searchParams.get('collection'),
    w2col: searchParams.get('w2col'),
    fallback: searchParams.get('collectionId'),
  });
  const orderId =
    searchParams.get('orderId')?.trim() || searchParams.get('order')?.trim() || undefined;
  const [liveEvents, setLiveEvents] = useState<ReturnType<typeof getAllCalendarEvents>>([]);
  const [collabEvents, setCollabEvents] = useState<CalendarEvent[]>([]);
  const [integrationEvents, setIntegrationEvents] = useState<CalendarEvent[]>([]);

  /** Без stagesStep в строке поиска — слоты матрицы содержат sku/сезон/заказ/этап в описании */
  const contextSearchSeed = useMemo(() => {
    const parts = [
      searchParams.get('q')?.trim(),
      searchParams.get('sku')?.trim(),
      searchParams.get('season')?.trim(),
      searchParams.get('order')?.trim(),
      searchParams.get('orderId')?.trim(),
      searchParams.get('stagesStep')?.trim(),
      searchParams.get('collectionId')?.trim(),
      searchParams.get('po')?.trim(),
    ].filter(Boolean) as string[];
    return parts.join(' ');
  }, [searchParams]);

  useEffect(() => {
    if (coreMode) return;
    setLiveEvents(getAllCalendarEvents());
  }, [coreMode]);

  useEffect(() => {
    if (coreMode) return;
    const uid = user?.uid ?? 'guest';
    setCollabEvents(getCalendarEvents(uid));
  }, [user?.uid, coreMode]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const w2Url = coreMode
          ? `/api/brand/calendar/w2-events?collectionId=${encodeURIComponent(collectionId)}`
          : '/api/brand/calendar/w2-events';
        const b2bParams = new URLSearchParams({ collectionId });
        if (orderId) b2bParams.set('orderId', orderId);
        const [w2Res, b2bRes] = await Promise.all([
          fetch(w2Url),
          fetch(`/api/brand/calendar/b2b-events?${b2bParams.toString()}`),
        ]);
        if (cancelled) return;
        const merged: CalendarEvent[] = [];
        if (w2Res.ok) {
          const w2Json = (await w2Res.json()) as { events?: CalendarEvent[] };
          if (Array.isArray(w2Json.events)) merged.push(...w2Json.events);
        }
        if (b2bRes.ok) {
          const b2bJson = (await b2bRes.json()) as { events?: Workshop2B2bCalendarEvent[] };
          if (Array.isArray(b2bJson.events)) {
            merged.push(
              ...b2bJson.events.map((e) => mapPlatformCoreB2bEventToCalendar(e, 'brand'))
            );
          }
        }
        setIntegrationEvents(merged);
      } catch {
        if (!cancelled) setIntegrationEvents([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId, orderId, coreMode]);

  const stageDemoCalendar = useMemo(() => {
    if (coreMode) return [] as CalendarEvent[];
    const step = searchParams.get('stagesStep')?.trim();
    if (!step) return [] as CalendarEvent[];
    return demoCalendarEventsForProductionStage(step, {
      sku: searchParams.get('sku'),
      season: searchParams.get('season'),
      order: searchParams.get('order'),
    });
  }, [searchParams, coreMode]);

  const externalEvents = useMemo(() => {
    if (coreMode) return integrationEvents;
    const mapped = liveEvents.map(mapLiveToCalendarEvent);
    return [...stageDemoCalendar, ...mapped, ...collabEvents, ...integrationEvents];
  }, [liveEvents, collabEvents, stageDemoCalendar, integrationEvents, coreMode]);

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <StyleCalendar
        initialRole="brand"
        variant="full"
        externalEvents={externalEvents}
        externalEventsOnly={coreMode}
        contextSearchSeed={contextSearchSeed || undefined}
      />
      {coreMode ? null : <CollaborationCalendarSection />}
      {coreMode ? null : (
        <RelatedModulesBlock title="Связанные операции" links={getCommLinks()} className="mt-2" />
      )}
    </CabinetPageContent>
  );
}

export function BrandCalendarLegacyPage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
      <div className="border-border-subtle bg-bg-surface2/90 supports-[backdrop-filter]:bg-bg-surface2/75 sticky top-0 z-30 -mx-4 space-y-2 border-b px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <CommunicationsNavBar currentPath="/brand/calendar" />
        <CommunicationsUpcomingStrip />
        <CommunicationsOperationalStrip variant="brand" className="-mx-1 mt-1" />
        <Suspense fallback={null}>
          <CommunicationsEntityContextBanner variant="brand" className="-mx-1 mt-2 rounded-lg" />
        </Suspense>
      </div>
      <Suspense
        fallback={<div className="text-text-secondary py-10 text-sm">Загрузка календаря…</div>}
      >
        <BrandCalendarMain />
      </Suspense>
    </CabinetPageContent>
  );
}
