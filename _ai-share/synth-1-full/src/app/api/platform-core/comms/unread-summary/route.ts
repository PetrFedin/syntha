import { NextRequest, NextResponse } from 'next/server';

import {
  summarizePerOrderPgUnread,
  summarizePgContextualUnreadForOrder,
} from '@/lib/platform/platform-core-comms-notification-center';
import { getPlatformCoreB2bCalendarEvents } from '@/lib/server/platform-core-calendar-events';
import {
  countUnreadPlatformCoreNotificationEventsByOrder,
  listPlatformCoreNotificationEvents,
  type PlatformCoreNotificationRole,
} from '@/lib/server/platform-core-notification-events-repository';
import {
  buildPgContextualThreadsResponse,
  type PgContextualThreadsCabinet,
} from '@/lib/server/pg-contextual-message-threads-handler';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

const ROLES: PlatformCoreNotificationRole[] = ['shop', 'brand', 'manufacturer', 'supplier'];

function resolveRole(raw: string | null): PlatformCoreNotificationRole {
  const v = raw?.trim() as PlatformCoreNotificationRole;
  return ROLES.includes(v) ? v : 'shop';
}

function cabinetForRole(role: PlatformCoreNotificationRole): PgContextualThreadsCabinet {
  if (role === 'shop') return 'shop';
  if (role === 'brand') return 'brand';
  return 'factory';
}

function parseOrderIds(raw: string | null): string[] {
  if (!raw?.trim()) return [];
  return [
    ...new Set(
      raw
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
    ),
  ];
}

/** GET — PG unread summary: single order or per-order batch (threads + notification_events). */
export async function GET(req: NextRequest) {
  const role = resolveRole(req.nextUrl.searchParams.get('role'));
  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() ?? '';
  const orderScoped = req.nextUrl.searchParams.get('orderScoped') !== '0';
  const batchOrderIds = parseOrderIds(req.nextUrl.searchParams.get('orderIds'));
  const orderId = req.nextUrl.searchParams.get('orderId')?.trim() ?? '';

  if (!collectionId) {
    return NextResponse.json({ ok: false, messageRu: 'Укажите collectionId.' }, { status: 400 });
  }

  if (!orderId && batchOrderIds.length === 0) {
    return NextResponse.json(
      { ok: false, messageRu: 'Укажите orderId или orderIds.' },
      { status: 400 }
    );
  }

  let scopeKey = req.nextUrl.searchParams.get('scopeKey')?.trim() ?? '';
  if (role === 'shop') {
    const checkoutAuth = await guardShopB2bCheckoutRoute(req);
    if (checkoutAuth instanceof NextResponse) return checkoutAuth;
    scopeKey =
      scopeKey ||
      resolveShopCoreBuyerIdFromRequest(
        req,
        req.nextUrl.searchParams.get('buyerId') ?? checkoutAuth.buyerId
      );
  } else {
    const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
    if (auth instanceof NextResponse) return auth;
    scopeKey = scopeKey || auth.organizationId || 'org-brand-001';
  }

  const cabinet = cabinetForRole(role);
  const threadsRes = await buildPgContextualThreadsResponse(cabinet, req);
  const threadsJson = (await threadsRes.json()) as {
    threads?: Array<{
      contextType: string;
      contextId: string;
      lastMessagePreview?: string | null;
      messageCount?: number;
      lastSeenMessageCount?: number | null;
    }>;
    source?: string;
  };
  const threads = (threadsJson.threads ?? []) as Parameters<
    typeof summarizePgContextualUnreadForOrder
  >[0]['threads'];

  if (batchOrderIds.length > 0) {
    const { byOrder: pgEventUnreadByOrder, storageMode: eventsStorageMode } =
      await countUnreadPlatformCoreNotificationEventsByOrder({
        role,
        scopeKey,
        orderIds: batchOrderIds,
      });
    const orders = summarizePerOrderPgUnread({
      threads,
      orderIds: batchOrderIds,
      pgEventUnreadByOrder,
    });
    const totalUnread = orders.reduce((sum, row) => sum + row.totalUnread, 0);

    return NextResponse.json({
      ok: true,
      mode: 'per_order',
      role,
      scopeKey,
      collectionId,
      orders,
      totalUnread,
      threadSource: threadsJson.source ?? 'empty',
      eventsStorageMode,
      messageRu:
        totalUnread > 0
          ? `${totalUnread} непрочитанных по ${orders.length} заказам`
          : `Нет непрочитанных по ${orders.length} заказам`,
    });
  }

  const threadSummary = summarizePgContextualUnreadForOrder({
    threads,
    orderId,
    orderScoped,
  });

  const { events, storageMode: eventsStorageMode } = await listPlatformCoreNotificationEvents({
    role,
    scopeKey,
    orderId,
    limit: 24,
  });
  const pgEventUnread = events.filter((e) => !e.read).length;

  const { count: calendarEventCount } = await getPlatformCoreB2bCalendarEvents({
    collectionId,
    orderId,
  });

  const totalUnread = threadSummary.totalUnread + pgEventUnread;

  return NextResponse.json({
    ok: true,
    mode: 'single_order',
    role,
    scopeKey,
    orderId,
    collectionId,
    threadUnread: threadSummary.totalUnread,
    unreadThreadCount: threadSummary.unreadThreads.length,
    pgEventUnread,
    pgEventTotal: events.length,
    calendarEventCount,
    totalUnread,
    orders: [
      {
        orderId,
        threadUnread: threadSummary.totalUnread,
        pgEventUnread,
        totalUnread,
      },
    ],
    threadSource: threadsJson.source ?? 'empty',
    eventsStorageMode,
    messageRu: `${totalUnread} непрочитанных · ${calendarEventCount} событий календаря`,
  });
}
