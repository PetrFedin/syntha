'use client';

import { useEffect, useMemo, useState } from 'react';

import { usePgCommunicationsUnread } from '@/lib/communications/use-pg-communications-unread';
import {
  buildPgEventUnreadCountByOrderId,
  resolveUniversalInboxOrderTotalUnread,
} from '@/lib/platform/platform-core-universal-inbox-unread';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import type { PgContextualThreadsCabinet } from '@/lib/server/pg-contextual-message-threads-handler';
import type { PlatformCoreNotificationRole } from '@/lib/server/platform-core-notification-events-repository';
import { usePlatformCoreCommsInboxPoll } from '@/hooks/use-platform-core-comms-inbox-poll';

function cabinetForRole(role: PlatformCoreNotificationRole): PgContextualThreadsCabinet {
  if (role === 'shop') return 'shop';
  if (role === 'brand') return 'brand';
  return 'factory';
}

/** PG unread per order for universal inbox: threads + notification_events (S4). */
export function usePlatformCoreUniversalInboxOrderUnread(
  role: PlatformCoreNotificationRole,
  enabled: boolean
): {
  resolveOrderUnread: (orderId: string) => number;
  loading: boolean;
  sseConnected: boolean;
} {
  const cabinet = cabinetForRole(role);
  const {
    unreadByChat,
    loading: threadsLoading,
    sseConnected,
  } = usePgCommunicationsUnread(cabinet, enabled);
  const { tick: inboxTick } = usePlatformCoreCommsInboxPoll(enabled);
  const [pgEventUnreadByOrder, setPgEventUnreadByOrder] = useState<Record<string, number>>({});
  const [eventsLoaded, setEventsLoaded] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setPgEventUnreadByOrder({});
      setEventsLoaded(false);
      return;
    }
    let cancelled = false;
    setEventsLoaded(false);
    void fetch(`/api/platform-core/notification-events?role=${encodeURIComponent(role)}`, {
      headers: buildWorkshop2ApiRequestHeaders(),
      cache: 'no-store',
    })
      .then(async (res) => {
        if (!res.ok) return { events: [] as Array<{ orderId?: string; read?: boolean }> };
        return (await res.json()) as {
          events?: Array<{ orderId?: string; read?: boolean }>;
        };
      })
      .then((json) => {
        if (cancelled) return;
        setPgEventUnreadByOrder(buildPgEventUnreadCountByOrderId(json.events ?? []));
        setEventsLoaded(true);
      })
      .catch(() => {
        if (!cancelled) {
          setPgEventUnreadByOrder({});
          setEventsLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, role, inboxTick]);

  const resolveOrderUnread = useMemo(
    () => (orderId: string) =>
      resolveUniversalInboxOrderTotalUnread(orderId, unreadByChat, pgEventUnreadByOrder),
    [pgEventUnreadByOrder, unreadByChat]
  );

  return {
    resolveOrderUnread,
    loading: enabled && (threadsLoading || !eventsLoaded),
    sseConnected,
  };
}
