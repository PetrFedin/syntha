'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  appendShopRepOfflineDraft,
  fetchShopRepOfflineDrafts,
} from '@/lib/shop/shop-rep-offline-drafts-store';

type Props = {
  repId: string;
  campaignId?: string;
};

/** Offline drafts · PG/file honesty + explicit sync (не только localStorage mirror). */
export function ShopAgentRepOfflineDraftsHonestyStrip({ repId, campaignId = 'linesheet-share' }: Props) {
  const [draftCount, setDraftCount] = useState(0);
  const [storageMode, setStorageMode] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reload = async () => {
    const res = await fetchShopRepOfflineDrafts(repId);
    setDraftCount(res.config.drafts.length);
    setStorageMode(res.storageMode ?? null);
    if (res.messageRu) {
      setMessage(res.messageRu);
    }
  };

  useEffect(() => {
    void reload();
  }, [repId]);

  const handleSyncDraft = async () => {
    if (syncing) return;
    setSyncing(true);
    setMessage(null);
    try {
      const res = await appendShopRepOfflineDraft({
        repId,
        campaignId,
        payload: { source: 'shop-agent-rep-offline-sync', at: new Date().toISOString() },
      });
      setDraftCount(res.config.drafts.length);
      setStorageMode(res.storageMode ?? null);
      setMessage(
        res.messageRu ??
          (res.storageMode === 'postgres'
            ? `Черновик в PG (${res.config.drafts.length}).`
            : res.storageMode === 'unavailable'
              ? 'Очередь недоступна — нужен PostgreSQL (core fail-closed, без localStorage).'
              : res.storageMode === 'file'
                ? `Черновик сохранён (${res.storageMode}).`
                : 'Черновик в memory — проверьте PG bootstrap.')
      );
    } catch {
      setMessage('Не удалось синхронизировать draft.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div
      className="border-border-subtle flex flex-wrap items-center gap-2 rounded-md border bg-bg-surface2/50 px-3 py-2 text-xs"
      data-testid="shop-agent-rep-offline-drafts-honesty-strip"
    >
      <Badge variant="outline" className="text-[9px] uppercase">
        Офлайн-очередь
      </Badge>
      <Badge variant="secondary" data-testid="shop-agent-rep-offline-drafts-count">
        {draftCount} черновиков
      </Badge>
      <Badge variant="outline" data-testid="shop-agent-rep-offline-drafts-sync-queue-badge">
        Очередь синхр.: {draftCount}
      </Badge>
      {storageMode ? (
        <Badge
          variant={storageMode === 'postgres' ? 'secondary' : 'outline'}
          className="text-[9px]"
          data-testid={
            storageMode === 'postgres'
              ? 'shop-agent-rep-offline-drafts-storage-pg'
              : 'shop-agent-rep-offline-drafts-storage-mode'
          }
        >
          {storageMode === 'postgres'
            ? 'PG'
            : storageMode === 'unavailable'
              ? 'недоступно'
              : storageMode}
        </Badge>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 text-[10px]"
        disabled={syncing || storageMode === 'unavailable'}
        data-testid="shop-agent-rep-offline-drafts-sync-btn"
        onClick={() => void handleSyncDraft()}
      >
        {syncing ? 'Синхронизация…' : 'Синхронизировать в PG'}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 text-[10px]"
        data-testid="shop-agent-rep-offline-drafts-refresh-btn"
        onClick={() => void reload()}
      >
        Обновить
      </Button>
      {message ? (
        <span className="text-text-secondary" data-testid="shop-agent-rep-offline-drafts-message">
          {message}
        </span>
      ) : null}
    </div>
  );
}
