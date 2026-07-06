/**
 * GET /api/brand/calendar/b2b-events?collectionId=
 * События B2B (окна предзаказа / поставки) для brand calendar.
 */
import { NextRequest, NextResponse } from 'next/server';

import type { Workshop2B2bBuyerTier } from '@/lib/production/workshop2-b2b-campaign-hub';
import { resolvePlatformCoreCalendarThreadChatId } from '@/lib/platform-core-calendar-thread-link';
import { getPlatformCoreB2bCalendarEvents } from '@/lib/server/platform-core-calendar-events';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

export async function GET(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim();
  if (!collectionId) {
    return NextResponse.json(
      { ok: false, messageRu: 'Параметр collectionId обязателен.' },
      { status: 400 }
    );
  }

  const articleIdsParam = req.nextUrl.searchParams.get('articleIds')?.trim();
  const articleIds = articleIdsParam
    ? articleIdsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;
  const orderId = req.nextUrl.searchParams.get('orderId')?.trim() || undefined;
  const buyerTier = (req.nextUrl.searchParams.get('buyerTier')?.trim() ??
    'standard') as Workshop2B2bBuyerTier;

  const { events, count } = await getPlatformCoreB2bCalendarEvents({
    collectionId,
    orderId,
    buyerTier,
    articleIds,
  });

  const eventsWithThread = events.map((event) => ({
    ...event,
    targetChatId: resolvePlatformCoreCalendarThreadChatId(event) ?? null,
  }));

  return NextResponse.json({
    ok: true,
    collectionId,
    orderId: orderId ?? null,
    events: eventsWithThread,
    count,
    messageRu: `B2B календарь: ${count} событий.`,
  });
}
