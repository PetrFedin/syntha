'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { brandScSyndicationWdAuditEventLabelRu } from '@/lib/production/brand-sc-syndication-wd';
import type { Workshop2DomainEventEnvelope } from '@/lib/production/workshop2-domain-event-types';

type Props = {
  collectionId: string;
  reloadNonce?: number;
};

function formatPublishEventRu(event: Workshop2DomainEventEnvelope): string {
  const campaign = String(event.payload.campaignName ?? '').trim();
  const source = String(event.payload.source ?? '').trim();
  const eventLabel = brandScSyndicationWdAuditEventLabelRu(
    String(event.type ?? 'showroom.published')
  );
  const parts = [`${event.articleId}`];
  if (eventLabel !== 'publish') parts.push(eventLabel);
  if (campaign) parts.push(campaign);
  if (source === 'bulk_showroom_publish') parts.push('batch');
  if (source === 'linesheet_syndicate' || source === 'release_syndication')
    parts.push('syndication');
  if (source === 'batch_unpublish') parts.push('unpublish');
  if (source === 'batch_unpublish_rollback') parts.push('rollback');
  return parts.join(' · ');
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Журнал showroom.published на linesheets (волна 9). */
export function BrandScPublishAuditLog({ collectionId, reloadNonce = 0 }: Props) {
  const cid = collectionId.trim();
  const [events, setEvents] = useState<Workshop2DomainEventEnvelope[]>([]);
  const [storageMode, setStorageMode] = useState<string>('memory');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!cid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/workshop2/collections/${encodeURIComponent(cid)}/publish-audit-log?limit=12`,
        { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
      );
      const json = (await res.json()) as {
        ok?: boolean;
        events?: Workshop2DomainEventEnvelope[];
        messageRu?: string;
        storageMode?: string;
      };
      if (!res.ok || !json.ok) {
        setError(json.messageRu ?? 'Не удалось загрузить журнал');
        setEvents([]);
        return;
      }
      setEvents(json.events ?? []);
      setStorageMode(json.storageMode ?? 'memory');
    } catch {
      setError('Ошибка сети');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [cid]);

  useEffect(() => {
    void load();
  }, [load, reloadNonce]);

  if (!cid) return null;

  return (
    <div
      className="border-border-subtle bg-bg-surface2/30 space-y-2 rounded-lg border px-3 py-2.5"
      data-testid="brand-sc-publish-audit-log"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-text-muted text-[10px] font-bold uppercase">Журнал публикаций</p>
        <span className="flex items-center gap-2">
          <span
            className="text-text-muted text-[9px] uppercase"
            data-testid={`brand-sc-publish-audit-storage-${storageMode === 'postgres' ? 'pg' : 'local'}`}
          >
            {storageMode === 'postgres' ? 'PG' : 'local'}
          </span>
          {loading ? (
            <Loader2 className="text-text-muted h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : null}
        </span>
      </div>
      {error ? (
        <p className="text-[10px] text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && events.length === 0 ? (
        <p className="text-text-muted text-[10px]" data-testid="brand-sc-publish-audit-empty">
          Нет записей
        </p>
      ) : null}
      {events.length > 0 ? (
        <ul
          className="max-h-36 space-y-1 overflow-y-auto"
          data-testid="brand-sc-publish-audit-list"
        >
          {events.map((ev) => (
            <li
              key={ev.id}
              className="text-text-secondary flex flex-wrap items-baseline gap-x-2 text-[10px]"
              data-testid={`brand-sc-publish-audit-row-${ev.articleId}`}
            >
              <time className="text-text-muted shrink-0 tabular-nums">
                {formatWhen(ev.createdAt)}
              </time>
              <span className="text-text-primary font-medium">{formatPublishEventRu(ev)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
