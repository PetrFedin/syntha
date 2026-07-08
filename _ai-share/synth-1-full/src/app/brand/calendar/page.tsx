import { BrandCalendarPageClient } from '@/app/brand/calendar/calendar-page-client';
import { mapPlatformCoreB2bEventToCalendar } from '@/lib/platform-core-calendar-events-client';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { resolvePageCollectionId } from '@/lib/platform-core-demo-context';
import { getPlatformCoreB2bCalendarEvents } from '@/lib/server/platform-core-calendar-events';

type SearchParams = Record<string, string | string[] | undefined>;

function pickSearchParam(searchParams: SearchParams, key: string): string | undefined {
  const raw = searchParams[key];
  if (typeof raw === 'string') return raw.trim() || undefined;
  if (Array.isArray(raw)) return raw[0]?.trim() || undefined;
  return undefined;
}

export default async function BrandCalendarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  let initialB2bEvents: ReturnType<typeof mapPlatformCoreB2bEventToCalendar>[] | undefined;

  if (isPlatformCoreMode()) {
    const collectionId = resolvePageCollectionId({
      collection: pickSearchParam(sp, 'collection'),
      w2col: pickSearchParam(sp, 'w2col'),
      fallback: pickSearchParam(sp, 'collectionId'),
    });
    const orderId = pickSearchParam(sp, 'orderId') ?? pickSearchParam(sp, 'order');
    const { events } = await getPlatformCoreB2bCalendarEvents({ collectionId, orderId });
    initialB2bEvents = events.map((e) => mapPlatformCoreB2bEventToCalendar(e, 'brand'));
  }

  return <BrandCalendarPageClient initialB2bEvents={initialB2bEvents} />;
}
