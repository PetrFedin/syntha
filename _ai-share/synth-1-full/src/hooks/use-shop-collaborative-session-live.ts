'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePlatformCoreChainStatusPushEnabled } from '@/hooks/use-platform-core-chain-status-push-enabled';
import { platformCoreSsePollIntervalMs } from '@/lib/platform-core-sse-poll-intervals';
import { SHOP_COLLABORATIVE_SESSION_POLL_MS } from '@/lib/shop/shop-collaborative-approval-feed';

type SessionPollJson = {
  ok?: boolean;
  storageMode?: string;
  sessionRevision?: string;
};

/** SSE push (chainStatusPush pref) + poll fallback для collaborative session badge. */
export function useShopCollaborativeSessionLive(input: {
  orderId: string;
  collectionId: string;
  buyerId: string;
  enabled?: boolean;
}): {
  sessionPollTs: string | null;
  sseConnected: boolean;
  pushEnabled: boolean;
  storageMode: string | null;
  refresh: () => Promise<void>;
} {
  const enabled = input.enabled !== false;
  const pushEnabled = usePlatformCoreChainStatusPushEnabled('shop');
  const [sessionPollTs, setSessionPollTs] = useState<string | null>(null);
  const [sseConnected, setSseConnected] = useState(false);
  const [storageMode, setStorageMode] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!input.orderId.trim()) return;
    try {
      const qs = new URLSearchParams({
        orderId: input.orderId,
        collection: input.collectionId,
        buyerId: input.buyerId,
      });
      const res = await fetch(`/api/shop/b2b/collaborative/session?${qs}`, { cache: 'no-store' });
      const json = (await res.json()) as SessionPollJson;
      if (res.ok && json.ok) {
        setSessionPollTs(new Date().toISOString());
        if (json.storageMode) setStorageMode(json.storageMode);
      }
    } catch {
      /* best-effort */
    }
  }, [input.buyerId, input.collectionId, input.orderId]);

  useEffect(() => {
    if (!enabled || !pushEnabled || !input.orderId.trim() || typeof EventSource === 'undefined') {
      setSseConnected(false);
      return;
    }
    const qs = new URLSearchParams({
      orderId: input.orderId,
      collection: input.collectionId,
      buyerId: input.buyerId,
    });
    const es = new EventSource(`/api/shop/b2b/collaborative/session/stream?${qs}`);
    es.addEventListener('session_update', (ev) => {
      try {
        const data = JSON.parse((ev as MessageEvent).data) as { type?: string };
        if (data.type === 'session_update' || data.type === 'ping') {
          setSessionPollTs(new Date().toISOString());
          void refresh();
        }
      } catch {
        /* ignore */
      }
    });
    es.onopen = () => setSseConnected(true);
    es.onerror = () => {
      setSseConnected(false);
      es.close();
    };
    return () => {
      setSseConnected(false);
      es.close();
    };
  }, [enabled, pushEnabled, input.buyerId, input.collectionId, input.orderId, refresh]);

  useEffect(() => {
    if (!enabled || !input.orderId.trim()) return;
    void refresh();
    const pollMs =
      pushEnabled && sseConnected
        ? platformCoreSsePollIntervalMs(true)
        : SHOP_COLLABORATIVE_SESSION_POLL_MS;
    const timer = window.setInterval(() => void refresh(), pollMs);
    return () => window.clearInterval(timer);
  }, [enabled, input.orderId, pushEnabled, sseConnected, refresh]);

  return {
    sessionPollTs,
    sseConnected: pushEnabled && sseConnected,
    pushEnabled,
    storageMode,
    refresh,
  };
}
