'use client';

import { useCallback, useEffect, useState } from 'react';
import type { PlatformCoreCommsNotificationRole } from '@/lib/platform-core-comms-notification-prefs';
import { platformCoreSsePollIntervalMs } from '@/lib/platform-core-sse-poll-intervals';

/** Тик для refetch comms notification prefs: SSE push + poll fallback (Wave UK). */
export function usePlatformCoreCommsNotificationPrefsPoll(
  enabled: boolean,
  _role?: PlatformCoreCommsNotificationRole
): {
  tick: number;
  refresh: () => void;
  sseConnected: boolean;
} {
  const [tick, setTick] = useState(0);
  const [sseConnected, setSseConnected] = useState(false);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!enabled || typeof EventSource === 'undefined') {
      setSseConnected(false);
      return;
    }
    const es = new EventSource('/api/platform-core/comms/notification-prefs-stream');
    es.onopen = () => setSseConnected(true);
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as { type?: string };
        if (data.type === 'prefs_update') refresh();
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
  }, [enabled, refresh]);

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
