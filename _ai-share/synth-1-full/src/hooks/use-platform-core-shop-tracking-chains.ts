'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';
import {
  applyShopBuyerChainVisibility,
  getShopProductionVisibilityPolicy,
  type ShopProductionVisibility,
} from '@/lib/platform-core-shop-production-visibility';

const CHAIN_STATUS_BATCH_MAX = 32;

async function fetchShopBuyerChainForOrder(
  orderId: string
): Promise<PlatformCoreShopTrackingChain | null> {
  const headers = buildWorkshop2ApiRequestHeaders();
  const chainRes = await fetch(
    `/api/workshop2/b2b/orders/${encodeURIComponent(orderId)}/chain-status`,
    { headers, cache: 'no-store' }
  );
  if (!chainRes.ok) return null;
  const chainJson = (await chainRes.json()) as {
    ok?: boolean;
    chain?: PlatformCoreShopTrackingChain;
  };
  if (!chainJson.ok || !chainJson.chain) return null;

  const visRes = await fetch(
    `/api/workshop2/b2b/orders/${encodeURIComponent(orderId)}/shop-production-visibility`,
    { headers, cache: 'no-store' }
  );
  if (!visRes.ok) return chainJson.chain;
  const visJson = (await visRes.json()) as { ok?: boolean; visibility?: ShopProductionVisibility };
  if (!visJson.ok || !visJson.visibility) return chainJson.chain;
  return applyShopBuyerChainVisibility(
    chainJson.chain,
    getShopProductionVisibilityPolicy(visJson.visibility)
  );
}

export type PlatformCoreShopTrackingChain = {
  orderId: string;
  status: string;
  handedOff: boolean;
  productionOrderId?: string;
  poStatusLabelRu?: string;
  inventoryReserved: boolean;
  inventoryReservedQty?: number;
  inventoryReserveReason?: string;
  materialsSupplied?: boolean;
  buyerDeliveryAcknowledgedAt?: string;
  steps: Array<{ id: string; labelRu: string; done: boolean }>;
};

export function usePlatformCoreShopTrackingChains(
  orderIds: string[],
  options?: { enabled?: boolean }
): {
  chains: Record<string, PlatformCoreShopTrackingChain | null>;
  loading: boolean;
  lastFetchedAt: string | null;
  refresh: () => void;
  sseConnected: boolean;
  chainPollTick: number;
} {
  const enabled = options?.enabled !== false;
  const [chains, setChains] = useState<Record<string, PlatformCoreShopTrackingChain | null>>({});
  const [loading, setLoading] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const idsKey = [...new Set(orderIds.map((id) => id.trim()).filter(Boolean))].sort().join(',');

  const orderIdList = useMemo(() => (idsKey ? idsKey.split(',') : []), [idsKey]);
  const { tick, refresh, sseConnected } = usePlatformCoreChainStatusPoll(
    enabled && Boolean(idsKey),
    orderIdList
  );

  useEffect(() => {
    if (!enabled || !idsKey) {
      setChains({});
      setLoading(false);
      return;
    }

    const ids = [
      ...idsKey.split(',').filter((id) => id.startsWith('B2B-DEMO-')),
      ...idsKey.split(',').filter((id) => !id.startsWith('B2B-DEMO-')),
    ];
    const uniqueIds = [...new Set(ids)];
    let cancelled = false;
    const backgroundRefresh = tick > 0;
    if (!backgroundRefresh) setLoading(true);

    void (async () => {
      const merged: Record<string, PlatformCoreShopTrackingChain | null> = {};
      try {
        for (let offset = 0; offset < uniqueIds.length; offset += CHAIN_STATUS_BATCH_MAX) {
          const chunk = uniqueIds.slice(offset, offset + CHAIN_STATUS_BATCH_MAX);
          try {
            const res = await fetch('/api/workshop2/b2b/orders/chain-status-batch', {
              method: 'POST',
              headers: {
                ...buildWorkshop2ApiRequestHeaders(),
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ orderIds: chunk, buyerView: true }),
              cache: 'no-store',
            });
            const json = (await res.json()) as {
              ok?: boolean;
              chains?: Record<string, PlatformCoreShopTrackingChain>;
            };
            if (!json.ok || !json.chains) {
              for (const id of chunk) merged[id] = null;
              continue;
            }
            for (const id of chunk) {
              merged[id] = json.chains[id] ?? null;
            }
          } catch {
            for (const id of chunk) merged[id] = merged[id] ?? null;
          }
        }
        for (const id of uniqueIds) {
          if (merged[id]?.steps?.length) continue;
          const fallback = await fetchShopBuyerChainForOrder(id);
          if (fallback) merged[id] = fallback;
        }
      } finally {
        if (!cancelled) {
          setChains((prev) => {
            const next = Object.fromEntries(
              uniqueIds.map((id) => [id, merged[id] ?? prev[id] ?? null])
            );
            return next;
          });
          if (Object.values(merged).some(Boolean)) {
            setLastFetchedAt(new Date().toISOString());
          }
          if (!backgroundRefresh) setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, idsKey, tick]);

  return { chains, loading, lastFetchedAt, refresh, sseConnected, chainPollTick: tick };
}
