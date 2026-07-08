import 'server-only';

import type { Workshop2B2bCalendarEvent } from '@/lib/production/workshop2-b2b-campaign-hub';
import {
  createPlatformCoreUserCalendarTask,
  listPlatformCoreUserCalendarTasks,
} from '@/lib/server/platform-core-user-calendar-task';

/** Stable PG task id for a B2B calendar event (Wave UL · pcTask deep-link). */
export function platformCorePcTaskIdFromCalendarEventId(eventId: string): string {
  const slug = eventId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return slug ? `pc-${slug}` : `pc-task-${Date.now()}`;
}

export async function ensurePlatformCorePcTaskFromCalendarEvent(input: {
  collectionId: string;
  ownerRole: 'brand' | 'shop' | 'manufacturer' | 'supplier';
  event: Pick<
    Workshop2B2bCalendarEvent,
    'id' | 'title' | 'startAt' | 'endAt' | 'b2bOrderId' | 'articleId'
  >;
  taskId?: string;
}): Promise<{ taskId: string; created: boolean }> {
  const collectionId = input.collectionId.trim();
  const taskId = input.taskId?.trim() || platformCorePcTaskIdFromCalendarEventId(input.event.id);
  const existing = await listPlatformCoreUserCalendarTasks({ collectionId });
  if (existing.some((e) => e.id === taskId)) {
    return { taskId, created: false };
  }

  await createPlatformCoreUserCalendarTask({
    id: taskId,
    collectionId,
    ownerRole: input.ownerRole,
    title: input.event.title.trim() || 'Задача календаря',
    description: `Авто из события · ${input.event.id}`,
    startAt: input.event.startAt,
    endAt: input.event.endAt,
    orderId: input.event.b2bOrderId?.trim(),
    articleId: input.event.articleId?.trim(),
    eventType: 'event',
  });

  return { taskId, created: true };
}
