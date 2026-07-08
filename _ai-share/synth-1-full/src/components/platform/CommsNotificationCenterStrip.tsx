'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, Calendar, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fetchPgContextualThreads } from '@/lib/platform-core-ports/brand/brand-pg-contextual-chat-client';
import type { PgContextualThreadsCabinet } from '@/lib/platform-core-ports/legacy/server/pg-contextual-message-threads-handler';
import { usePgContextualActorId } from '@/hooks/use-pg-contextual-actor-id';
import { usePlatformCoreCommsInboxPoll } from '@/hooks/use-platform-core-comms-inbox-poll';
import { usePlatformCoreB2bRegistryPoll } from '@/hooks/use-platform-core-b2b-registry-poll';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  buildPgUnreadCountByChat,
  pgThreadToChatId,
} from '@/lib/platform-core-ports/communications/pg-contextual-unread-metrics';
import { isPlatformCoreDemoPinOrderId } from '@/lib/platform-core-spine-active-order-fallback';
import { isPlatformCorePgB2bOrder } from '@/lib/platform-core-demo-order';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import {
  brandCalendarB2bOrderContextHref,
  brandMessagesB2bOrderContextHref,
  factoryCalendarB2bOrderContextHref,
  factoryMessagesB2bOrderContextHref,
  factorySupplierCalendarB2bOrderContextHref,
  factorySupplierMessagesB2bOrderContextHref,
  shopCalendarB2bOrderContextHref,
  shopMessagesB2bOrderContextHref,
  shopB2bTrackingOrderHref,
} from '@/lib/platform-core-routes';
import { PlatformCoreCommsNotificationPrefsStrip } from '@/components/platform/PlatformCoreShopCommsNotificationPrefsStrip';
import {
  platformCoreCalendarPcTaskHref,
  platformCoreCmCalendarTrackingHrefForRole,
} from '@/lib/platform-core-ports/platform/platform-core-comms-pctask-deeplinks';
import {
  platformCoreCmCalendarTrackingDeepLinkTestId,
  platformCorePillarChainStatusRolePrefix,
} from '@/lib/platform-core-chain-status-pillar-sse';
import type { CoreChainRoleId } from '@/lib/platform-core-hub-matrix';
import { usePlatformCoreAuditUi } from '@/hooks/use-platform-core-audit-ui';
import { pillarInsight } from '@/lib/platform-core-cabinet-chrome';
import { hubSectionLabelClassName } from '@/lib/platform-core-hub-layout';
import {
  platformCoreCommsNotificationDetailHref,
  WAVE_YX_NOTIFICATION_DETAIL_RU,
  WAVE_YX_TRACKING_CTA_RU,
} from '@/lib/platform-core-ports/platform/wave-yx-notification-center-final';
import { platformCoreCmNotificationTrackingLinkTestId } from '@/lib/platform-core-chain-status-pillar-sse';
import { cn } from '@/lib/utils';

type CalendarPreviewEvent = {
  id: string;
  title: string;
  kind: string;
  startAt: string;
};

type Props = {
  variant: 'shop' | 'brand' | 'manufacturer' | 'supplier';
  collectionId: string;
  orderId: string;
  disabled?: boolean;
  /** Hub pillar card — компактная строка без рамки. */
  compact?: boolean;
  /** Order comms workspace — только треды b2b_order для orderId. */
  orderScoped?: boolean;
  /** md+ aside в comms cabinet split. */
  panel?: boolean;
};

function cabinetForVariant(variant: Props['variant']): PgContextualThreadsCabinet {
  if (variant === 'shop') return 'shop';
  if (variant === 'brand') return 'brand';
  return 'factory';
}

function orderChatHref(variant: Props['variant'], orderId: string): string {
  if (variant === 'shop') return shopMessagesB2bOrderContextHref(orderId);
  if (variant === 'brand') return brandMessagesB2bOrderContextHref(orderId);
  if (variant === 'supplier') return factorySupplierMessagesB2bOrderContextHref(orderId);
  return factoryMessagesB2bOrderContextHref(orderId, { role: 'manufacturer' });
}

function threadLabel(contextType: string, contextId: string, preview?: string): string {
  if (contextType === 'b2b_order') {
    const id = contextId.trim();
    if (isPlatformCoreDemoPinOrderId(id)) return 'Оптовый заказ · демо';
    if (isPlatformCorePgB2bOrder(id)) return `Оптовый заказ · ${id.slice(-8)}`;
    return `Опт · ${id.slice(0, 24)}`;
  }
  return preview?.slice(0, 48) || contextId;
}

function calendarLinkHref(
  variant: Props['variant'],
  orderId: string,
  collectionId: string,
  taskId?: string
): string {
  const role = variantToChainRole(variant);
  if (taskId?.trim()) {
    return platformCoreCalendarPcTaskHref({
      role,
      collectionId,
      orderId,
      taskId: taskId.trim(),
    });
  }
  if (variant === 'shop') return shopCalendarB2bOrderContextHref(orderId);
  if (variant === 'brand') return brandCalendarB2bOrderContextHref(orderId);
  if (variant === 'supplier') return factorySupplierCalendarB2bOrderContextHref(orderId);
  return factoryCalendarB2bOrderContextHref(orderId);
}

function trackingHrefForVariant(variant: Props['variant'], orderId: string): string {
  return platformCoreCmCalendarTrackingHrefForRole(variantToChainRole(variant), orderId);
}

function variantToChainRole(variant: Props['variant']): CoreChainRoleId {
  if (variant === 'manufacturer') return 'manufacturer';
  if (variant === 'supplier') return 'supplier';
  if (variant === 'brand') return 'brand';
  return 'shop';
}

function trackingDeepLinkTestId(variant: Props['variant'], eventId: string): string {
  return platformCoreCmCalendarTrackingDeepLinkTestId(
    platformCorePillarChainStatusRolePrefix(variantToChainRole(variant)),
    eventId
  );
}

/** Компактный notification center: unread threads + ближайшие события календаря. */
export function CommsNotificationCenterStrip({
  variant,
  collectionId,
  orderId,
  disabled = false,
  compact = false,
  orderScoped = false,
  panel = false,
}: Props) {
  const auditUi = usePlatformCoreAuditUi();
  const operatorUi = isPlatformCoreMode() && !auditUi;
  const cabinet = cabinetForVariant(variant);
  const readerId = usePgContextualActorId(cabinet);
  const { tick: inboxTick, sseConnected: inboxSseConnected } = usePlatformCoreCommsInboxPoll(
    !disabled && Boolean(orderId.trim())
  );
  const { tick: registryTick, sseConnected: registrySseConnected } = usePlatformCoreB2bRegistryPoll(
    !disabled && Boolean(orderId.trim()) && isPlatformCoreMode()
  );
  const commsRefreshTick = inboxTick + registryTick;
  const commsSseLive = inboxSseConnected || registrySseConnected;
  const [unreadThreads, setUnreadThreads] = useState<
    Array<{ chatId: string; label: string; unread: number }>
  >([]);
  const [events, setEvents] = useState<CalendarPreviewEvent[]>([]);
  const [threadSource, setThreadSource] = useState<string>('empty');
  const [pgEvents, setPgEvents] = useState<
    Array<{ id: string; titleRu: string; href?: string; kind: string }>
  >([]);
  const [pgEventUnread, setPgEventUnread] = useState(0);
  const [eventsStorageMode, setEventsStorageMode] = useState<string>('memory');
  const [loaded, setLoaded] = useState(false);

  const testIdPrefix =
    variant === 'shop'
      ? 'shop-cm'
      : variant === 'brand'
        ? 'brand-cm'
        : variant === 'supplier'
          ? 'sup-cm'
          : 'mfr-cm';

  useEffect(() => {
    if (disabled || !orderId.trim()) {
      setUnreadThreads([]);
      setEvents([]);
      setLoaded(false);
      return;
    }
    let cancelled = false;
    setLoaded(false);
    void (async () => {
      try {
        const [threadsRes, calRes, ntfRes, unreadRes] = await Promise.all([
          fetchPgContextualThreads(cabinet, readerId),
          fetch(
            `/api/workshop2/platform-core/calendar-events?collectionId=${encodeURIComponent(collectionId)}&orderId=${encodeURIComponent(orderId)}`,
            { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
          ),
          fetch(
            `/api/platform-core/notification-events?role=${encodeURIComponent(variant)}&orderId=${encodeURIComponent(orderId)}&collectionId=${encodeURIComponent(collectionId)}`,
            { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
          ),
          fetch(
            `/api/platform-core/comms/unread-summary?role=${encodeURIComponent(variant)}&orderId=${encodeURIComponent(orderId)}&collectionId=${encodeURIComponent(collectionId)}&orderScoped=${orderScoped ? '1' : '0'}`,
            { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
          ),
        ]);
        if (cancelled) return;
        setThreadSource(threadsRes.source);
        const scopedThreads = orderScoped
          ? threadsRes.threads.filter(
              (t) => t.contextType === 'b2b_order' && t.contextId.trim() === orderId.trim()
            )
          : threadsRes.threads;
        const unreadByChat = buildPgUnreadCountByChat(scopedThreads);
        const unreadList = scopedThreads
          .map((t) => {
            const chatId = pgThreadToChatId(t);
            return {
              chatId,
              label: threadLabel(t.contextType, t.contextId, t.lastMessagePreview ?? undefined),
              unread: unreadByChat[chatId] ?? 0,
            };
          })
          .filter((t) => t.unread > 0)
          .slice(0, 3);
        setUnreadThreads(unreadList);

        if (calRes.ok) {
          const calJson = (await calRes.json()) as {
            events?: CalendarPreviewEvent[];
          };
          const sorted = (calJson.events ?? [])
            .slice()
            .sort((a, b) => a.startAt.localeCompare(b.startAt))
            .slice(0, 3);
          setEvents(sorted);
        } else {
          setEvents([]);
        }

        if (ntfRes.ok) {
          const ntfJson = (await ntfRes.json()) as {
            events?: Array<{ id: string; titleRu: string; href?: string; kind: string }>;
            storageMode?: string;
          };
          setPgEvents(ntfJson.events ?? []);
          setEventsStorageMode(ntfJson.storageMode ?? 'memory');
        } else {
          setPgEvents([]);
        }

        if (unreadRes.ok) {
          const unreadJson = (await unreadRes.json()) as { pgEventUnread?: number };
          setPgEventUnread(unreadJson.pgEventUnread ?? 0);
        } else {
          setPgEventUnread(0);
        }
      } catch {
        if (!cancelled) {
          setUnreadThreads([]);
          setEvents([]);
          setPgEvents([]);
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cabinet, collectionId, commsRefreshTick, disabled, orderId, orderScoped, readerId, variant]);

  const totalUnread = useMemo(
    () => unreadThreads.reduce((sum, t) => sum + t.unread, 0) + pgEventUnread,
    [pgEventUnread, unreadThreads]
  );

  if (disabled || !orderId.trim()) return null;

  if (compact && !panel) {
    return (
      <div
        className="flex flex-wrap items-center gap-2"
        data-testid={`${testIdPrefix}-notification-center-compact`}
        data-comms-sse-live={commsSseLive ? '1' : '0'}
      >
        <Bell className="text-text-muted h-3 w-3" aria-hidden />
        {!loaded ? (
          <span className="text-text-muted text-[11px]">Уведомления…</span>
        ) : totalUnread > 0 ? (
          <Link
            href={orderChatHref(variant, orderId)}
            className="text-accent-primary text-[11px] font-medium hover:underline"
            data-testid={`${testIdPrefix}-notification-center`}
          >
            Непрочитанных: {totalUnread}
          </Link>
        ) : (
          <span
            className="text-text-muted text-[11px]"
            data-testid={`${testIdPrefix}-notification-center`}
          >
            Нет непрочитанных
          </span>
        )}
        {events.length > 0 ? (
          <Link
            href={calendarLinkHref(variant, orderId, collectionId)}
            className="text-text-muted text-[11px] hover:underline"
            data-testid={`${testIdPrefix}-notification-events-compact`}
          >
            Календарь · {events.length}
          </Link>
        ) : null}
        <Link
          href={trackingHrefForVariant(variant, orderId)}
          className="text-accent-primary text-[11px] hover:underline"
          data-testid={platformCoreCmNotificationTrackingLinkTestId(testIdPrefix)}
        >
          {WAVE_YX_TRACKING_CTA_RU}
        </Link>
        <Link
          href={platformCoreCommsNotificationDetailHref(
            variantToChainRole(variant),
            collectionId,
            orderId
          )}
          className="text-accent-primary text-[11px] hover:underline"
          data-testid={`${testIdPrefix}-notification-detail-link`}
        >
          {WAVE_YX_NOTIFICATION_DETAIL_RU}
        </Link>
        {variant === 'shop' ? (
          <PlatformCoreCommsNotificationPrefsStrip role="shop" compact />
        ) : null}
        {variant === 'brand' ? (
          <PlatformCoreCommsNotificationPrefsStrip role="brand" compact />
        ) : null}
        {variant === 'manufacturer' ? (
          <PlatformCoreCommsNotificationPrefsStrip role="manufacturer" compact />
        ) : null}
        {variant === 'supplier' ? (
          <PlatformCoreCommsNotificationPrefsStrip role="supplier" compact />
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'space-y-2',
        panel
          ? 'border-border-subtle bg-bg-surface rounded-xl border p-3'
          : 'border-border-subtle rounded-lg border bg-slate-50/80 p-2.5'
      )}
      data-testid={`${testIdPrefix}-notification-center${panel ? '-panel' : ''}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Bell className="text-text-muted h-3.5 w-3.5" aria-hidden />
        <p
          className={
            panel
              ? hubSectionLabelClassName()
              : 'text-text-secondary text-[11px] font-semibold uppercase tracking-wide'
          }
        >
          Уведомления
        </p>
        {operatorUi ? (
          <span
            className="text-text-muted inline-flex items-center gap-1.5 text-[11px]"
            title={commsSseLive ? 'SSE онлайн' : 'Опрос'}
          >
            <span
              className={cn(
                pillarInsight.liveDot,
                commsSseLive ? pillarInsight.liveDotOn : pillarInsight.liveDotPoll
              )}
              aria-hidden
            />
          </span>
        ) : (
          <>
            <Badge
              variant="outline"
              className="text-[11px] uppercase"
              data-testid={`${testIdPrefix}-inbox-source-${threadSource === 'postgres' ? 'pg' : 'local'}`}
            >
              {threadSource === 'postgres' ? 'PG входящие' : threadSource}
            </Badge>
            <Badge
              variant="outline"
              className="text-[11px] uppercase"
              data-testid={`${testIdPrefix}-inbox-sse-${inboxSseConnected ? 'live' : 'poll'}`}
            >
              {inboxSseConnected ? 'SSE онлайн' : 'SSE опрос'}
            </Badge>
            <Badge
              variant="outline"
              className="text-[11px] uppercase"
              data-testid={`${testIdPrefix}-notification-events-storage-${eventsStorageMode === 'postgres' ? 'pg' : 'local'}`}
            >
              {eventsStorageMode === 'postgres' ? 'PG push' : 'push локально'}
            </Badge>
          </>
        )}
        {totalUnread > 0 ? (
          <span
            className="bg-accent-primary inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white"
            data-testid={`${testIdPrefix}-notification-unread-count`}
          >
            {totalUnread}
          </span>
        ) : null}
        {!loaded ? <span className="text-text-muted text-[11px]">Загрузка…</span> : null}
      </div>

      {unreadThreads.length > 0 ? (
        <ul className="space-y-1" data-testid={`${testIdPrefix}-notification-unread-list`}>
          {unreadThreads.map((row) => (
            <li key={row.chatId}>
              <Link
                href={orderChatHref(variant, orderId)}
                className="text-accent-primary inline-flex items-center gap-1 text-[11px] font-medium hover:underline"
                data-testid={`${testIdPrefix}-notification-thread-${row.chatId}`}
              >
                <MessageSquare className="h-3 w-3" aria-hidden />
                {row.label}
                <span className="font-mono tabular-nums">· {row.unread}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : loaded ? (
        <p
          className="text-text-muted text-[11px]"
          data-testid={`${testIdPrefix}-notification-empty`}
        >
          Нет непрочитанных тредов по заказу.
        </p>
      ) : null}

      {events.length > 0 ? (
        <ul
          className="space-y-1 border-t border-slate-200/80 pt-2"
          data-testid={`${testIdPrefix}-notification-events-list`}
        >
          {events.map((ev) => (
            <li key={ev.id} className="flex flex-wrap items-center gap-2">
              <Link
                href={calendarLinkHref(variant, orderId, collectionId, ev.id)}
                className="text-text-secondary inline-flex items-center gap-1 text-[11px] hover:underline"
                data-testid={`${testIdPrefix}-notification-event-${ev.id}`}
              >
                <Calendar className="h-3 w-3 shrink-0" aria-hidden />
                <span className="line-clamp-1">{ev.title}</span>
              </Link>
              <Link
                href={trackingHrefForVariant(variant, orderId)}
                className="text-accent-primary text-[11px] hover:underline"
                data-testid={trackingDeepLinkTestId(variant, ev.id)}
              >
                К трекингу
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {pgEvents.length > 0 ? (
        <ul
          className="space-y-1 border-t border-slate-200/80 pt-2"
          data-testid={`${testIdPrefix}-notification-pg-events-list`}
        >
          {pgEvents.slice(0, 4).map((ev) => (
            <li key={ev.id}>
              <Link
                href={
                  ev.href ??
                  (variant === 'shop'
                    ? shopB2bTrackingOrderHref(orderId)
                    : orderChatHref(variant, orderId))
                }
                className="text-text-secondary inline-flex items-center gap-1 text-[11px] hover:underline"
                data-testid={`${testIdPrefix}-notification-pg-event-${ev.id}`}
              >
                <Bell className="h-3 w-3 shrink-0" aria-hidden />
                <span className="line-clamp-1">{ev.titleRu}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {variant === 'shop' ? (
        <PlatformCoreCommsNotificationPrefsStrip role="shop" compact={panel} />
      ) : null}
      {variant === 'brand' ? (
        <PlatformCoreCommsNotificationPrefsStrip role="brand" compact={panel} />
      ) : null}
      {variant === 'manufacturer' ? (
        <PlatformCoreCommsNotificationPrefsStrip role="manufacturer" compact={panel} />
      ) : null}
      {variant === 'supplier' ? (
        <PlatformCoreCommsNotificationPrefsStrip role="supplier" compact={panel} />
      ) : null}
    </div>
  );
}
