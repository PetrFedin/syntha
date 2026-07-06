import { NextRequest, NextResponse } from 'next/server';

import { getPlatformCoreB2bCalendarEvents } from '@/lib/server/platform-core-calendar-events';
import { ensurePlatformCorePcTaskFromCalendarEvent } from '@/lib/server/platform-core-pc-task-from-calendar-event';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';

type Body = {
  collectionId?: string;
  eventId?: string;
  ownerRole?: string;
  orderId?: string;
  taskId?: string;
};

/** POST — auto-create PG user-task from calendar event id (Wave WY · pcTask factory task PG). */
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
  const eventId = body.eventId?.trim();
  if (!collectionId || !eventId) {
    return NextResponse.json(
      { ok: false, messageRu: 'collectionId и eventId обязательны.' },
      { status: 400 }
    );
  }

  const ownerRole = (body.ownerRole?.trim() || 'manufacturer') as
    | 'brand'
    | 'shop'
    | 'manufacturer'
    | 'supplier';
  const orderId = body.orderId?.trim() || undefined;

  const { events } = await getPlatformCoreB2bCalendarEvents({ collectionId, orderId });
  const event = events.find((e) => e.id === eventId);
  if (!event) {
    return NextResponse.json(
      { ok: false, messageRu: 'Событие календаря не найдено.' },
      { status: 404 }
    );
  }

  const { taskId, created } = await ensurePlatformCorePcTaskFromCalendarEvent({
    collectionId,
    ownerRole,
    event,
    taskId: body.taskId?.trim() || undefined,
  });

  return NextResponse.json({
    ok: true,
    taskId,
    pcTask: taskId,
    created,
    messageRu: created
      ? `Задача PG создана · pcTask=${taskId}.`
      : 'Задача уже есть в PG.',
  });
}
