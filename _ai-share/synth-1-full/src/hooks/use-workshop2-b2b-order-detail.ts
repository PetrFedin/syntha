'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePlatformCoreB2bRegistryPoll } from '@/hooks/use-platform-core-b2b-registry-poll';
import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';
import type { Workshop2B2bOrderRecord } from '@/lib/production/workshop2-b2b-order-lifecycle';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { b2bV1SynthaActorRoleHeaders } from '@/lib/auth/b2b-v1-api-client-headers';
import { parseOperationalOrderV1DetailResponse } from '@/lib/order/operational-order-dto.schema';
import { isIntegrationImportedWholesaleOrderId } from '@/lib/integrations/spine/integration-ui-utils';
import { mapOperationalOrderToW2DetailView } from '@/lib/integrations/spine/spine-operational-to-w2-order';

export type Workshop2B2bOrderDetailView = Workshop2B2bOrderRecord & {
  statusLabelRu: string;
  buyerLabelRu: string;
  paymentTermsLabelRu: string | null;
};

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

type FetchOutcome = { kind: 'ready'; order: Workshop2B2bOrderDetailView } | { kind: 'error' };

async function fetchWorkshop2B2bOrderDetail(
  id: string,
  collectionFallback: string
): Promise<FetchOutcome> {
  const res = await fetch(`/api/workshop2/b2b/orders/${encodeURIComponent(id)}`, {
    headers: buildWorkshop2ApiRequestHeaders(),
    cache: 'no-store',
  });
  const json = (await res.json()) as {
    ok?: boolean;
    order?: Workshop2B2bOrderDetailView;
  };
  if (res.ok && json.ok && json.order) {
    return { kind: 'ready', order: json.order };
  }
  if (isIntegrationImportedWholesaleOrderId(id)) {
    const opRes = await fetch(`/api/b2b/v1/operational-orders/${encodeURIComponent(id)}`, {
      headers: { ...b2bV1SynthaActorRoleHeaders('brand') },
      cache: 'no-store',
    });
    const parsed = parseOperationalOrderV1DetailResponse(await opRes.json());
    if (parsed.success) {
      return {
        kind: 'ready',
        order: mapOperationalOrderToW2DetailView(id, parsed.data.data.order, collectionFallback),
      };
    }
  }
  return { kind: 'error' };
}

export function useWorkshop2B2bOrderDetail(
  orderId: string,
  enabled: boolean,
  options?: { collectionFallback?: string }
): {
  order: Workshop2B2bOrderDetailView | null;
  loadState: LoadState;
} {
  const [order, setOrder] = useState<Workshop2B2bOrderDetailView | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const requestSeqRef = useRef(0);
  const hasLoadedOnceRef = useRef(false);
  const collectionFallback = options?.collectionFallback ?? 'SS27';
  const { tick: registryTick } = usePlatformCoreB2bRegistryPoll(enabled);
  const { tick: chainTick } = usePlatformCoreChainStatusPoll(enabled, [orderId]);

  const applyOutcome = useCallback((outcome: FetchOutcome, seq: number, showLoading: boolean) => {
    if (seq !== requestSeqRef.current) return;
    if (outcome.kind === 'ready') {
      setOrder(outcome.order);
      hasLoadedOnceRef.current = true;
      setLoadState('ready');
      return;
    }
    if (!hasLoadedOnceRef.current && showLoading) {
      setOrder(null);
      setLoadState('error');
    }
  }, []);

  const loadOrder = useCallback(
    async (id: string, showLoading: boolean) => {
      const seq = ++requestSeqRef.current;
      if (showLoading) {
        setLoadState('loading');
      }
      try {
        const outcome = await fetchWorkshop2B2bOrderDetail(id, collectionFallback);
        applyOutcome(outcome, seq, showLoading);
      } catch {
        if (seq === requestSeqRef.current && !hasLoadedOnceRef.current && showLoading) {
          setOrder(null);
          setLoadState('error');
        }
      }
    },
    [applyOutcome, collectionFallback]
  );

  useEffect(() => {
    const id = orderId.trim();
    if (!enabled || !id) {
      requestSeqRef.current += 1;
      hasLoadedOnceRef.current = false;
      setOrder(null);
      setLoadState('idle');
      return;
    }

    hasLoadedOnceRef.current = false;
    void loadOrder(id, true);
  }, [orderId, enabled, loadOrder]);

  useEffect(() => {
    const id = orderId.trim();
    if (!enabled || !id || !hasLoadedOnceRef.current) return;
    void loadOrder(id, false);
  }, [registryTick, chainTick, orderId, enabled, loadOrder]);

  return useMemo(() => ({ order, loadState }), [order, loadState]);
}
