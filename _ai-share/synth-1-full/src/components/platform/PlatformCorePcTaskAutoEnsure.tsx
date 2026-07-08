'use client';

import { useEffect, useRef, useState } from 'react';
import type { Workshop2B2bCalendarEvent } from '@/lib/platform-core-ports/b2b-order-lifecycle';

type Props = {
  collectionId: string;
  orderId?: string;
  ownerRole: 'brand' | 'shop' | 'manufacturer' | 'supplier';
  focusTaskId?: string;
  events: Pick<Workshop2B2bCalendarEvent, 'id' | 'title'>[];
  onEnsured?: () => void;
  testIdPrefix?: string;
};

/** Wave WY · auto-create PG user-task from calendar event when pcTask deep-link is used. */
export function PlatformCorePcTaskAutoEnsure({
  collectionId,
  orderId,
  ownerRole,
  focusTaskId,
  events,
  onEnsured,
  testIdPrefix = 'mfr-cm-calendar-pc-task-auto-ensure',
}: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const attemptedRef = useRef<string | null>(null);

  useEffect(() => {
    const taskId = focusTaskId?.trim();
    if (!taskId || events.length === 0) return;
    const attemptKey = `${collectionId}:${taskId}:${events[0]?.id ?? ''}`;
    if (attemptedRef.current === attemptKey) return;
    attemptedRef.current = attemptKey;

    const event =
      events.find((e) => e.id === taskId.replace(/^pc-/, '')) ??
      events.find((e) => taskId.includes(e.id)) ??
      events[0];
    if (!event?.id) return;

    let cancelled = false;
    void fetch('/api/workshop2/platform-core/calendar-events/pc-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collectionId,
        eventId: event.id,
        ownerRole,
        orderId: orderId?.trim() || undefined,
        taskId,
      }),
    })
      .then(async (res) => {
        const json = (await res.json()) as {
          ok?: boolean;
          messageRu?: string;
          created?: boolean;
        };
        if (cancelled) return;
        if (json.ok) {
          setMessage(
            json.messageRu ?? (json.created ? 'Задача PG создана.' : 'Задача PG уже есть.')
          );
          onEnsured?.();
        }
      })
      .catch(() => {
        if (!cancelled) setMessage(null);
      });

    return () => {
      cancelled = true;
    };
  }, [collectionId, focusTaskId, events, onEnsured, orderId, ownerRole]);

  if (!focusTaskId?.trim() || !message) return null;

  return (
    <p className="text-text-muted text-[10px]" data-testid={testIdPrefix} role="status">
      {message}
    </p>
  );
}
