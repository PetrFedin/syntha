'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { platformCoreSsePollIntervalMs } from '@/lib/platform-core-sse-poll-intervals';
/** Совпадает с MAX_ORDERS в chain-status-stream route — длинный query рвёт SSE при навигации. */
const SSE_MAX_ORDER_IDS = 16;

function capOrderIdsForSse(orderIds: readonly string[]): string[] {
  const unique = [...new Set(orderIds.map((id) => id.trim()).filter(Boolean))];
  const prioritized = [
    ...unique.filter((id) => id.startsWith('B2B-DEMO-')),
    ...unique.filter((id) => !id.startsWith('B2B-DEMO-')),
  ];
  return [...new Set(prioritized)].slice(0, SSE_MAX_ORDER_IDS);
}

/** Тик для refetch chain-status: SSE push (если есть orderIds) + poll fallback. */
export function usePlatformCoreChainStatusPoll(
  enabled: boolean,
  orderIds?: readonly string[]
): {
  tick: number;
  refresh: () => void;
  sseConnected: boolean;
} {
  const [tick, setTick] = useState(0);
  const [sseConnected, setSseConnected] = useState(false);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const orderIdsKey = useMemo(
    () => capOrderIdsForSse(orderIds ?? []).sort().join(','),
    [orderIds]
  );

  useEffect(() => {
    if (!enabled || !orderIdsKey || typeof EventSource === 'undefined') {
      setSseConnected(false);
      return;
    }
    const url = `/api/workshop2/b2b/orders/chain-status-stream?orderIds=${encodeURIComponent(orderIdsKey)}`;
    const es = new EventSource(url);
    es.onopen = () => setSseConnected(true);
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as { type?: string };
        if (data.type === 'chain_update') refresh();
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
  }, [enabled, orderIdsKey, refresh]);

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
