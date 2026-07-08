'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { platformCoreSsePollIntervalMs } from '@/lib/platform-core-sse-poll-intervals';

const SSE_MAX_COLLECTION_IDS = 8;

function capCollectionIdsForSse(collectionIds: readonly string[]): string[] {
  const unique = [...new Set(collectionIds.map((id) => id.trim()).filter(Boolean))];
  const prioritized = [
    ...unique.filter((id) => id === 'SS27' || id === 'FW27'),
    ...unique.filter((id) => id !== 'SS27' && id !== 'FW27'),
  ];
  return [...new Set(prioritized)].slice(0, SSE_MAX_COLLECTION_IDS);
}

/** Тик для refetch development-status / pillar snapshot: SSE push + poll fallback. */
export function usePlatformCoreDevelopmentStatusPoll(
  enabled: boolean,
  collectionIds?: readonly string[],
  factoryId?: string
): {
  tick: number;
  refresh: () => void;
  sseConnected: boolean;
} {
  const [tick, setTick] = useState(0);
  const [sseConnected, setSseConnected] = useState(false);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const collectionIdsKey = useMemo(
    () =>
      capCollectionIdsForSse(collectionIds ?? [])
        .sort()
        .join(','),
    [collectionIds]
  );

  useEffect(() => {
    if (!enabled || !collectionIdsKey || typeof EventSource === 'undefined') {
      setSseConnected(false);
      return;
    }
    const sp = new URLSearchParams({ collectionIds: collectionIdsKey });
    if (factoryId?.trim()) sp.set('factoryId', factoryId.trim());
    const url = `/api/workshop2/collections/development-status-stream?${sp}`;
    const es = new EventSource(url);
    es.onopen = () => setSseConnected(true);
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as { type?: string };
        if (data.type === 'development_update') refresh();
      } catch {
        /* ignore */
      }
    };
    es.onerror = () => {
      setSseConnected(false);
      es.close();
    };
    return () => {
      setSseConnected(false);
      es.close();
    };
  }, [enabled, collectionIdsKey, factoryId, refresh]);

  useEffect(() => {
    if (!enabled) return;
    const onFocus = () => refresh();
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled) return;
    let timer: number | undefined;
    const schedule = () => {
      if (timer !== undefined) window.clearInterval(timer);
      const ms = platformCoreSsePollIntervalMs(sseConnected);
      timer = window.setInterval(() => setTick((t) => t + 1), ms);
    };
    schedule();
    document.addEventListener('visibilitychange', schedule);
    return () => {
      document.removeEventListener('visibilitychange', schedule);
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, [enabled, sseConnected]);

  return { tick, refresh, sseConnected };
}
