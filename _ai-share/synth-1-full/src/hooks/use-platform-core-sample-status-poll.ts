'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { platformCoreSsePollIntervalMs } from '@/lib/platform-core-sse-poll-intervals';

type ArticleScope = Array<{ collectionId: string; articleId: string }>;

/** Тик для refetch sample rollup на W2 hub: SSE push + poll fallback (не 30 с). */
export function usePlatformCoreSampleStatusPoll(
  enabled: boolean,
  collectionId?: string,
  articleScope?: ArticleScope
): {
  tick: number;
  refresh: () => void;
  sseConnected: boolean;
} {
  const [tick, setTick] = useState(0);
  const [sseConnected, setSseConnected] = useState(false);
  const refresh = useCallback(() => setTick((value) => value + 1), []);

  const scopeKey = useMemo(() => {
    const cid = collectionId?.trim();
    if (cid) return `col:${cid}`;
    if (articleScope?.length) {
      return articleScope.map((item) => `${item.collectionId}:${item.articleId}`).join(',');
    }
    return '';
  }, [collectionId, articleScope]);

  useEffect(() => {
    if (!enabled || !scopeKey || typeof EventSource === 'undefined') {
      setSseConnected(false);
      return;
    }

    const params = new URLSearchParams();
    const cid = collectionId?.trim();
    if (cid) {
      params.set('collectionId', cid);
    } else if (articleScope?.length) {
      params.set(
        'articles',
        articleScope.map((item) => `${item.collectionId}:${item.articleId}`).join(',')
      );
    }

    const es = new EventSource(`/api/workshop2/hub/sample-status-stream?${params.toString()}`);
    es.onopen = () => setSseConnected(true);
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as { type?: string };
        if (data.type === 'sample_update') refresh();
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
  }, [enabled, scopeKey, collectionId, articleScope, refresh]);

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
      timer = window.setInterval(() => setTick((value) => value + 1), ms);
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
