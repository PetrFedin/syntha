'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Workshop2B2bCalendarEvent } from '@/lib/production/workshop2-b2b-campaign-hub';
import type { CalendarEvent } from '@/lib/types/calendar';
import type { UserRole } from '@/lib/types';
import { mapPlatformCoreB2bEventToCalendar } from '@/lib/platform-core-calendar-events-client';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

type Options = {
  collectionId: string;
  orderId?: string;
  ownerRole?: UserRole;
  enabled?: boolean;
  /** SSR prefetch (brand calendar · ?order=) — без блокирующего client fetch. */
  initialEvents?: CalendarEvent[];
};

export function usePlatformCoreCalendarEvents({
  collectionId,
  orderId,
  ownerRole = 'shop',
  enabled = true,
  initialEvents,
}: Options) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents ?? []);
  const [loading, setLoading] = useState(!(initialEvents && initialEvents.length > 0));
  const [error, setError] = useState<string | null>(null);
  const lastLoadedKeyRef = useRef<string | null>(
    initialEvents?.length ? `${collectionId.trim()}\0${orderId?.trim() ?? ''}` : null
  );
  const loadedCountRef = useRef(initialEvents?.length ?? 0);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => {
    lastLoadedKeyRef.current = null;
    loadedCountRef.current = 0;
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !collectionId.trim()) {
      setEvents([]);
      setError(null);
      setLoading(false);
      lastLoadedKeyRef.current = null;
      loadedCountRef.current = 0;
      return;
    }
    const requestKey = `${collectionId.trim()}\0${orderId?.trim() ?? ''}`;
    const hasStaleEvents = lastLoadedKeyRef.current === requestKey && loadedCountRef.current > 0;
    let cancelled = false;
    if (!hasStaleEvents) setLoading(true);
    setError(null);
    void (async () => {
      try {
        const params = new URLSearchParams({ collectionId: collectionId.trim() });
        if (orderId?.trim()) params.set('orderId', orderId.trim());
        const controller = new AbortController();
        const timeoutMs = 45_000;
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        let res: Response;
        try {
          res = await fetch(`/api/workshop2/platform-core/calendar-events?${params.toString()}`, {
            headers: buildWorkshop2ApiRequestHeaders(),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }
        const json = (await res.json()) as {
          ok?: boolean;
          events?: Workshop2B2bCalendarEvent[];
          messageRu?: string;
        };
        if (cancelled) return;
        if (!res.ok || !json.ok || !Array.isArray(json.events)) {
          setEvents([]);
          setError(json.messageRu ?? 'Не удалось загрузить события календаря.');
          return;
        }
        const mapped = json.events.map((e) => mapPlatformCoreB2bEventToCalendar(e, ownerRole));
        setEvents(mapped);
        lastLoadedKeyRef.current = requestKey;
        loadedCountRef.current = mapped.length;
      } catch {
        if (!cancelled && !hasStaleEvents) {
          setEvents([]);
          setError('Ошибка сети при загрузке календаря.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId, orderId, ownerRole, enabled, reloadToken]);

  return { events, loading, error, count: events.length, refetch };
}
