/**
 * GET — все Workshop2 calendar events для brand calendar (horizontal sync).
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  listAllWorkshop2BrandCalendarEvents,
  listWorkshop2BrandCalendarEventsForCollection,
} from '@/lib/server/workshop2-brand-calendar-repository';
import type { CalendarEvent } from '@/lib/types/calendar';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

function mapW2ToBrandCalendar(
  e: Awaited<ReturnType<typeof listAllWorkshop2BrandCalendarEvents>>[number]
): CalendarEvent {
  return {
    id: e.id,
    ownerId: 'workshop2',
    ownerRole: 'brand',
    ownerName: 'Workshop2 T&A',
    calendarId: 'workshop2',
    title: e.title,
    description: e.isBlocker
      ? `Gate blocker · ${e.blockerKind ?? 'milestone'} · ${e.collectionId}/${e.articleId}`
      : `T&A · ${e.collectionId}/${e.articleId}`,
    layer: 'production',
    visibility: 'internal',
    type: e.isBlocker ? 'reminder' : 'event',
    startAt: e.startAt,
    endAt: e.endAt,
    participants: [],
    importance: e.priority === 'high' ? 'high' : 'medium',
    sketchPageUrl: e.href,
  };
}

export async function GET(_req: NextRequest) {
  const auth = await guardWorkshop2Route(_req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const collectionId = _req.nextUrl.searchParams.get('collectionId')?.trim();
  const events = collectionId
    ? await listWorkshop2BrandCalendarEventsForCollection({ collectionId })
    : await listAllWorkshop2BrandCalendarEvents();
  const mapped = events.map(mapW2ToBrandCalendar);
  return NextResponse.json({
    ok: true,
    events: mapped,
    w2Events: events,
    count: mapped.length,
    collectionId: collectionId ?? null,
  });
}
