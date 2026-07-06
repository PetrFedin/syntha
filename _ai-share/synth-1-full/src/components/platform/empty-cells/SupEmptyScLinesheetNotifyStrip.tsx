'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import { ROUTES } from '@/lib/platform-core-routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  articleId?: string;
};

type NotificationEvent = {
  id: string;
  titleRu: string;
  bodyRu?: string;
  href?: string;
  createdAt: string;
  read: boolean;
};

/** Supplier empty SC · PG notification_events when brand adds articles to linesheet. */
export function SupEmptyScLinesheetNotifyStrip({ collectionId, articleId }: Props) {
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [storageMode, setStorageMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        role: 'supplier',
        collectionId,
        scopeKey: `linesheet:${collectionId}`,
      });
      const res = await fetch(`/api/platform-core/notification-events?${params}`, {
        headers: buildWorkshop2ApiRequestHeaders(),
        cache: 'no-store',
      });
      const json = (await res.json()) as {
        ok?: boolean;
        events?: NotificationEvent[];
        storageMode?: string;
      };
      if (res.ok && json.ok && Array.isArray(json.events)) {
        setEvents(json.events.slice(0, 3));
        setStorageMode(json.storageMode ?? null);
      } else {
        setEvents([]);
        setStorageMode(null);
      }
    } catch {
      setEvents([]);
      setStorageMode(null);
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const bomHref = `${ROUTES.factory.supplierCoreCabinet}?pillar=sample_collection&collection=${encodeURIComponent(collectionId)}${articleId ? `&article=${encodeURIComponent(articleId)}` : ''}`;

  return (
    <div
      className="border-border-subtle space-y-1.5 rounded-md border border-amber-200/50 bg-amber-50/30 px-3 py-2 text-xs"
      data-testid="sup-empty-sc-linesheet-notify-strip"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-muted text-[10px] font-semibold uppercase">Лайншит · BOM</span>
        {storageMode === 'postgres' ? (
          <Badge variant="outline" className="text-[9px]" data-testid="sup-empty-sc-linesheet-notify-pg">
            PG уведомление
          </Badge>
        ) : null}
      </div>
      {loading ? (
        <p className="text-text-muted text-[11px]">Загрузка уведомлений…</p>
      ) : events.length > 0 ? (
        <ul className="space-y-1" data-testid="sup-empty-sc-linesheet-notify-list">
          {events.map((event) => (
            <li key={event.id} className="text-text-secondary text-[11px] leading-snug">
              <span className="font-medium">{event.titleRu}</span>
              {event.bodyRu ? (
                <span className="text-text-muted block">{event.bodyRu}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-text-muted text-[11px]" data-testid="sup-empty-sc-linesheet-notify-empty">
          Пока нет событий — появится после добавления артикулов брендом в лайншит.
        </p>
      )}
      <Link
        href={eventHref(events[0]?.href, bomHref)}
        data-testid="sup-empty-sc-linesheet-bom-peer-link"
        className={hubGadget.goldenLink}
      >
        Превью BOM образца →
      </Link>
    </div>
  );
}

function eventHref(eventHrefValue: string | undefined, fallback: string): string {
  const href = eventHrefValue?.trim();
  return href && href.startsWith('/') ? href : fallback;
}
