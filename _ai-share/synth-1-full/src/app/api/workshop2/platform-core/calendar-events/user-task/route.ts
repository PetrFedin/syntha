import { NextRequest, NextResponse } from 'next/server';

import { mapPlatformCoreB2bEventToCalendar } from '@/lib/platform-core-calendar-events-client';
import { resolvePlatformCoreCalendarThreadChatId } from '@/lib/platform-core-calendar-thread-link';
import {
  createPlatformCoreUserCalendarTask,
  listPlatformCoreUserCalendarTasks,
} from '@/lib/server/platform-core-user-calendar-task';
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import {
  guardWorkshop2Route,
  WORKSHOP2_READ_ROLES,
  WORKSHOP2_WRITE_ROLES,
} from '@/lib/server/workshop2-route-auth';
import type { UserRole } from '@/lib/types';

type Body = {
  collectionId?: string;
  ownerRole?: string;
  title?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  orderId?: string;
  articleId?: string;
  eventType?: string;
};

/** GET — PG/file user tasks для calendar strip (honest list, не spine merge). */
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

  const orderId = req.nextUrl.searchParams.get('orderId')?.trim() || undefined;
  const limit = Math.min(
    Math.max(Number.parseInt(req.nextUrl.searchParams.get('limit') ?? '5', 10) || 5, 1),
    20
  );

  const events = await listPlatformCoreUserCalendarTasks({ collectionId, orderId });
  const tasks = events.slice(0, limit).map((event) => ({
    id: event.id,
    title: event.title,
    startAt: event.startAt,
    endAt: event.endAt,
    orderId: event.b2bOrderId ?? null,
    articleId: event.articleId ?? null,
    targetChatId: resolvePlatformCoreCalendarThreadChatId(event) ?? null,
  }));

  return NextResponse.json({
    ok: true,
    collectionId,
    orderId: orderId ?? null,
    count: events.length,
    tasks,
    storageMode: isWorkshop2PostgresEnabled() ? 'pg' : 'file',
    messageRu:
      tasks.length > 0
        ? `${tasks.length} задач(и) в календаре.`
        : 'Задач пока нет — создайте слот в календаре.',
  });
}

/** POST — user task в Platform Core календаре + auto-thread (order/article). */
export async function POST(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }

  const collectionId = body.collectionId?.trim();
  const title = body.title?.trim();
  if (!collectionId || !title) {
    return NextResponse.json(
      { ok: false, messageRu: 'collectionId и title обязательны.' },
      { status: 400 }
    );
  }

  try {
    const { event, targetChatId } = await createPlatformCoreUserCalendarTask({
      collectionId,
      ownerRole: body.ownerRole?.trim() || 'brand',
      title,
      description: body.description?.trim(),
      startAt: body.startAt?.trim() || new Date().toISOString(),
      endAt: body.endAt?.trim() || new Date(Date.now() + 3600000).toISOString(),
      orderId: body.orderId?.trim(),
      articleId: body.articleId?.trim(),
      eventType: body.eventType?.trim(),
    });

    const ownerRole = (body.ownerRole?.trim() || 'brand') as UserRole;
    const calendarEvent = mapPlatformCoreB2bEventToCalendar(event, ownerRole);
    if (targetChatId) {
      calendarEvent.targetChatId = targetChatId;
    } else {
      calendarEvent.targetChatId = resolvePlatformCoreCalendarThreadChatId(event);
    }

    return NextResponse.json({
      ok: true,
      event: calendarEvent,
      b2bEvent: event,
      targetChatId: calendarEvent.targetChatId ?? null,
      messageRu: body.orderId?.trim()
        ? `Задача создана · тред по заказу ${body.orderId.trim()}.`
        : 'Задача создана в календаре.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ошибка создания задачи.';
    return NextResponse.json({ ok: false, messageRu: message }, { status: 500 });
  }
}
