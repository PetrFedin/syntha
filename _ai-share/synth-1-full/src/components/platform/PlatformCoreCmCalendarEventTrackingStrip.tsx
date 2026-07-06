'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Workshop2B2bCalendarEvent } from '@/lib/platform-core-ports/b2b-order-lifecycle';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import {
  platformCoreCmCalendarTrackingDeepLinkTestId,
  platformCorePillarChainStatusRolePrefix,
} from '@/lib/platform-core-chain-status-pillar-sse';
import { platformCoreCmCalendarTrackingHrefForRole } from '@/lib/platform-core-ports/platform/platform-core-comms-pctask-deeplinks';
import {
  platformCoreCommsNotificationDetailHref,
  WAVE_YX_NOTIFICATION_DETAIL_RU,
} from '@/lib/platform-core-ports/platform/wave-yt-notification-center-final';
import type { CoreChainRoleId } from '@/lib/platform-core-hub-matrix';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  ownerRole: CoreChainRoleId;
  collectionId: string;
  orderId?: string;
  reloadNonce?: number;
  factoryId?: string;
};

/** События PG-календаря с deep-link на карточку трекинга (Wave TW · все роли). */
export function PlatformCoreCmCalendarEventTrackingStrip({
  ownerRole,
  collectionId,
  orderId,
  reloadNonce = 0,
  factoryId,
}: Props) {
  const [events, setEvents] = useState<Workshop2B2bCalendarEvent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const rolePrefix = platformCorePillarChainStatusRolePrefix(ownerRole);
  const stripTestId =
    ownerRole === 'shop'
      ? 'shop-cm-calendar-event-tracking-strip'
      : `${rolePrefix}-cm-calendar-event-tracking-strip`;

  useEffect(() => {
    if (!collectionId.trim()) return;
    let cancelled = false;
    setLoaded(false);
    const qs = new URLSearchParams({ collectionId });
    if (orderId?.trim()) qs.set('orderId', orderId.trim());
    void fetch(`/api/workshop2/platform-core/calendar-events?${qs.toString()}`, {
      headers: buildWorkshop2ApiRequestHeaders(),
      cache: 'no-store',
    })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as { events?: Workshop2B2bCalendarEvent[] };
      })
      .then((json) => {
        if (cancelled) return;
        const rows = (json?.events ?? []).filter((e) => Boolean(e.b2bOrderId?.trim()));
        setEvents(rows.slice(0, 5));
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [collectionId, orderId, reloadNonce]);

  if (!loaded || events.length === 0) return null;

  return (
    <div
      className="border-border-subtle mb-2 space-y-1 rounded-md border bg-bg-surface2/40 px-3 py-2 text-xs"
      data-testid={stripTestId}
    >
      <p className="text-text-muted text-[10px] font-semibold uppercase">События · к трекингу</p>
      <ul className="space-y-0.5">
        {events.map((ev) => {
          const oid = ev.b2bOrderId!.trim();
          return (
            <li key={ev.id} className="flex flex-wrap items-center gap-2">
              <span className="text-text-secondary line-clamp-1 text-[10px]">{ev.title}</span>
              <Link
                href={platformCoreCmCalendarTrackingHrefForRole(ownerRole, oid, { factoryId })}
                className={hubGadget.goldenLink}
                data-testid={platformCoreCmCalendarTrackingDeepLinkTestId(rolePrefix, ev.id)}
              >
                К трекингу
              </Link>
              <Link
                href={platformCoreCommsNotificationDetailHref(ownerRole, collectionId, oid)}
                className={hubGadget.goldenLink}
                data-testid={`${rolePrefix}-cm-calendar-event-notification-detail-${ev.id}`}
              >
                {WAVE_YX_NOTIFICATION_DETAIL_RU}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** @deprecated use PlatformCoreCmCalendarEventTrackingStrip */
export function ShopCmCalendarEventTrackingStrip(props: Omit<Props, 'ownerRole'>) {
  return <PlatformCoreCmCalendarEventTrackingStrip ownerRole="shop" {...props} />;
}
