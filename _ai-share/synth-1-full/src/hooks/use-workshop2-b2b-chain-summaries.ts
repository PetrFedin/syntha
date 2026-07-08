'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';
import { workshop2B2bOrderStatusLabelRu } from '@/lib/production/workshop2-b2b-order-lifecycle';

export type B2bChainSummary = {
  orderId: string;
  handedOff: boolean;
  poStatusLabelRu?: string;
  productionOrderId?: string;
  factoryId?: string;
  inventoryReserved?: boolean;
  /** RU-лейбл статуса заказа для B2bChainPhaseBadge. */
  orderStatusLabelRu?: string;
};

type LoadState = 'idle' | 'loading' | 'ready';

/** Core: chain-status для строк реестра B2B (параллельно, мало заказов в demo). */
export function useWorkshop2B2bChainSummaries(
  orderIds: string[],
  enabled: boolean,
  reloadNonce = 0
): {
  summaries: Record<string, B2bChainSummary>;
  loadState: LoadState;
} {
  const [summaries, setSummaries] = useState<Record<string, B2bChainSummary>>({});
  const [loadState, setLoadState] = useState<LoadState>('idle');

  const idsKey = useMemo(
    () => [...new Set(orderIds.map((id) => id.trim()).filter(Boolean))].sort().join(','),
    [orderIds]
  );

  const orderIdList = useMemo(() => (idsKey ? idsKey.split(',') : []), [idsKey]);
  const { tick } = usePlatformCoreChainStatusPoll(enabled && Boolean(idsKey), orderIdList);

  useEffect(() => {
    if (!enabled || !idsKey) {
      setSummaries({});
      setLoadState('idle');
      return;
    }

    const ids = idsKey.split(',');
    let cancelled = false;
    setLoadState('loading');

    void (async () => {
      try {
        const res = await fetch('/api/workshop2/b2b/orders/chain-status-batch', {
          method: 'POST',
          headers: {
            ...buildWorkshop2ApiRequestHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderIds: ids }),
          cache: 'no-store',
        });
        const json = (await res.json()) as {
          ok?: boolean;
          chains?: Record<
            string,
            {
              orderId?: string;
              status?: string;
              handedOff?: boolean;
              poStatusLabelRu?: string;
              productionOrderId?: string;
              factoryId?: string;
              inventoryReserved?: boolean;
            }
          >;
        };
        if (!cancelled && json.ok && json.chains) {
          const entries = ids.map((orderId) => {
            const chain = json.chains?.[orderId];
            if (chain) {
              return [
                orderId,
                {
                  orderId,
                  handedOff: chain.handedOff === true,
                  poStatusLabelRu: chain.poStatusLabelRu,
                  productionOrderId: chain.productionOrderId,
                  factoryId: chain.factoryId,
                  inventoryReserved: chain.inventoryReserved === true,
                  orderStatusLabelRu: chain.status
                    ? workshop2B2bOrderStatusLabelRu(
                        chain.status as Parameters<typeof workshop2B2bOrderStatusLabelRu>[0]
                      )
                    : undefined,
                } satisfies B2bChainSummary,
              ] as const;
            }
            return [orderId, { orderId, handedOff: false }] as const;
          });
          setSummaries(Object.fromEntries(entries));
          setLoadState('ready');
        } else if (!cancelled) {
          setSummaries({});
          setLoadState('ready');
        }
      } catch {
        if (!cancelled) {
          setSummaries({});
          setLoadState('ready');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, idsKey, tick, reloadNonce]);

  return useMemo(() => ({ summaries, loadState }), [summaries, loadState]);
}
