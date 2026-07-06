'use client';

import { useEffect, useState } from 'react';
import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';
import { fetchOperationalOrderBrandStatusMirror } from '@/lib/order/fetch-operational-order-brand-status.client';

/** Poll v1 detail so shop UI mirrors brand PATCH operational status without reload. */
export function useOperationalOrderBrandStatusMirror(
  orderId: string,
  enabled: boolean,
  options?: { actorRole?: 'brand' | 'shop'; reloadNonce?: number }
): string | null {
  const [status, setStatus] = useState<string | null>(null);
  const { tick: chainPollTick } = usePlatformCoreChainStatusPoll(enabled, [orderId]);
  const reloadNonce = options?.reloadNonce ?? 0;
  const actorRole = options?.actorRole ?? 'shop';

  useEffect(() => {
    const id = orderId.trim();
    if (!enabled || !id) {
      setStatus(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      const next = await fetchOperationalOrderBrandStatusMirror(id, actorRole);
      if (!cancelled) setStatus(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId, enabled, actorRole, chainPollTick, reloadNonce]);

  return status;
}
