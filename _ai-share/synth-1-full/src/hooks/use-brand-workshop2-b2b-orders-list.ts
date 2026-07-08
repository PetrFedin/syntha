'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePlatformCoreB2bRegistryPoll } from '@/hooks/use-platform-core-b2b-registry-poll';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import type { Workshop2B2bOrderRecord } from '@/lib/production/workshop2-b2b-order-lifecycle';
import {
  BRAND_CORE_W2_COLLECTION_IDS,
  type BrandB2bOrderListRow,
  workshop2B2bOrderToBrandListRow,
} from '@/lib/order/brand-workshop2-b2b-order-ui';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

export function useBrandWorkshop2B2bOrdersList(
  enabled: boolean,
  reloadNonce = 0,
  partnerFilter: string | null = null
): {
  rows: BrandB2bOrderListRow[] | null;
  partnerIds: string[];
  loadState: LoadState;
} {
  const [rows, setRows] = useState<BrandB2bOrderListRow[] | null>(null);
  const [partnerIds, setPartnerIds] = useState<string[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const { tick: registryTick } = usePlatformCoreB2bRegistryPoll(enabled);

  useEffect(() => {
    if (!enabled) {
      setRows(null);
      setLoadState('idle');
      return;
    }

    let cancelled = false;
    setLoadState('loading');
    const partner =
      partnerFilter && partnerFilter.trim() && partnerFilter !== 'all'
        ? partnerFilter.trim()
        : null;

    (async () => {
      try {
        const headers = buildWorkshop2ApiRequestHeaders();
        const responses = await Promise.all(
          BRAND_CORE_W2_COLLECTION_IDS.map(async (collectionId) => {
            const params = new URLSearchParams({ collectionId });
            if (partner) params.set('partner', partner);
            const res = await fetch(`/api/brand/b2b/orders?${params.toString()}`, {
              headers,
              cache: 'no-store',
            });
            if (!res.ok)
              return { orders: [] as Workshop2B2bOrderRecord[], partnerIds: [] as string[] };
            const json = (await res.json()) as {
              ok?: boolean;
              orders?: Workshop2B2bOrderRecord[];
              partnerIds?: string[];
            };
            return {
              orders: json.ok && Array.isArray(json.orders) ? json.orders : [],
              partnerIds: json.ok && Array.isArray(json.partnerIds) ? json.partnerIds : [],
            };
          })
        );
        const mergedPartnerIds = new Set<string>();
        for (const r of responses) {
          for (const id of r.partnerIds) mergedPartnerIds.add(id);
        }
        const merged = responses
          .flatMap((r) => r.orders)
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
          .map(workshop2B2bOrderToBrandListRow);
        if (!cancelled) {
          setRows(merged);
          setPartnerIds([...mergedPartnerIds].sort());
          setLoadState('ready');
        }
      } catch {
        if (!cancelled) {
          setRows([]);
          setPartnerIds([]);
          setLoadState('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, reloadNonce, registryTick, partnerFilter]);

  return useMemo(() => ({ rows, partnerIds, loadState }), [rows, partnerIds, loadState]);
}
