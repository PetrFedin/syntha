'use client';

import { useEffect, useState } from 'react';
import { usePlatformCoreB2bRegistryPoll } from '@/hooks/use-platform-core-b2b-registry-poll';
import { b2bV1SynthaActorRoleHeaders } from '@/lib/auth/b2b-v1-api-client-headers';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { isIntegrationImportedWholesaleOrderId } from '@/lib/integrations/spine/integration-ui-utils';
import { parseOperationalOrdersV1ListResponse } from '@/lib/order/operational-order-dto.schema';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  pickPreferredHandoffQueueOrderId,
  pickPreferredRegistryOrderId,
  resolveActiveWholesaleOrderId,
} from '@/lib/platform-core-spine-active-order-fallback';
import { fetchOperationalOrderBrandStatusMirror } from '@/lib/order/fetch-operational-order-brand-status.client';

export type SpineActiveOrderResolveFrom = 'w2_registry' | 'allocation' | 'operational' | 'handoff';

export type SpineActiveOrderMeta = {
  platform?: string;
  status?: string;
  source: SpineActiveOrderResolveFrom;
};

type Options = {
  fallbackOrderId: string;
  reloadNonce?: number;
  resolveFrom: readonly SpineActiveOrderResolveFrom[];
  actorRole?: 'brand' | 'shop';
  factoryId?: string;
  collectionId?: string;
  buyerId?: string;
  /** Brand hub: retailerId (shop1…) для multi-buyer registry spine. */
  partnerId?: string;
  enabled?: boolean;
};

type Result = {
  activeOrderId: string;
  isSpineOrder: boolean;
  spineMeta: SpineActiveOrderMeta | null;
  resolving: boolean;
};

type SpineHit = SpineActiveOrderMeta & { wholesaleOrderId: string };

async function enrichHitWithOperationalStatus(
  hit: SpineHit,
  actorRole: 'brand' | 'shop' | undefined
): Promise<SpineHit> {
  if (hit.status?.trim()) return hit;
  const role = actorRole ?? 'shop';
  const status = await fetchOperationalOrderBrandStatusMirror(hit.wholesaleOrderId, role);
  return status ? { ...hit, status } : hit;
}

async function fromW2Registry(input: {
  collectionId: string;
  actorRole?: 'brand' | 'shop';
  buyerId?: string;
  partnerId?: string;
}): Promise<{ hit: SpineHit | null; registryQueriedEmpty: boolean }> {
  const collectionId = input.collectionId.trim();
  if (!collectionId) return { hit: null, registryQueriedEmpty: false };

  if (input.actorRole === 'shop') {
    const headers: Record<string, string> = {
      ...b2bV1SynthaActorRoleHeaders('shop'),
    };
    if (input.buyerId?.trim()) {
      headers['x-w2-organization-id'] = input.buyerId.trim();
    }
    const res = await fetch('/api/shop/b2b/orders', { headers, cache: 'no-store' });
    if (!res.ok) return { hit: null, registryQueriedEmpty: false };
    const json = (await res.json()) as { orders?: Array<{ id?: string | null }> };
    const orders = json.orders ?? [];
    const preferred = pickPreferredRegistryOrderId(orders);
    if (!preferred) return { hit: null, registryQueriedEmpty: orders.length === 0 };
    return {
      hit: { wholesaleOrderId: preferred, source: 'w2_registry' },
      registryQueriedEmpty: false,
    };
  }

  const partner = input.partnerId?.trim();
  const brandQs = new URLSearchParams({ collectionId });
  if (partner) brandQs.set('partner', partner);
  const res = await fetch(`/api/brand/b2b/orders?${brandQs}`, { cache: 'no-store' });
  if (!res.ok) return { hit: null, registryQueriedEmpty: false };
  const json = (await res.json()) as { orders?: Array<{ id?: string | null }> };
  const orders = json.orders ?? [];
  const preferred = pickPreferredRegistryOrderId(orders);
  if (!preferred) return { hit: null, registryQueriedEmpty: orders.length === 0 };
  return {
    hit: { wholesaleOrderId: preferred, source: 'w2_registry' },
    registryQueriedEmpty: false,
  };
}

async function fromAllocationQueue(): Promise<SpineHit | null> {
  const res = await fetch('/api/integrations/v1/allocation/queue?limit=8', { cache: 'no-store' });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    data?: { items?: Array<{ wholesaleOrderId: string; status?: string; platform?: string }> };
  };
  const hit = (json.data?.items ?? []).find((i) =>
    isIntegrationImportedWholesaleOrderId(i.wholesaleOrderId)
  );
  if (!hit) return null;
  return {
    wholesaleOrderId: hit.wholesaleOrderId,
    platform: hit.platform,
    status: hit.status,
    source: 'allocation',
  };
}

async function fromOperationalList(actorRole: 'brand' | 'shop'): Promise<SpineHit | null> {
  const res = await fetch('/api/b2b/v1/operational-orders', {
    headers: { ...b2bV1SynthaActorRoleHeaders(actorRole) },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const parsed = parseOperationalOrdersV1ListResponse(await res.json());
  if (!parsed.success) return null;
  const hit = parsed.data.data.orders.find((o) =>
    isIntegrationImportedWholesaleOrderId(o.wholesaleOrderId)
  );
  if (!hit) return null;
  return {
    wholesaleOrderId: hit.wholesaleOrderId,
    platform: hit.integration?.sourcePlatform,
    status: hit.status,
    source: 'operational',
  };
}

async function fromHandoffQueue(factoryId: string): Promise<SpineHit | null> {
  const res = await fetch(
    `/api/workshop2/factory/production-handoff-queue?factoryId=${encodeURIComponent(factoryId)}`,
    { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
  );
  if (!res.ok) return null;
  const json = (await res.json()) as {
    ok?: boolean;
    items?: Array<{ b2bOrderId: string; status?: string }>;
  };
  const preferred = pickPreferredHandoffQueueOrderId(json.items ?? []);
  if (!preferred) return null;
  const row = (json.items ?? []).find((i) => i.b2bOrderId === preferred);
  return {
    wholesaleOrderId: preferred,
    status: row?.status,
    source: 'handoff',
  };
}

/** Resolves wholesale order id: PG registry → spine import → demo fallback. */
export function useSpineActiveWholesaleOrderId(options: Options): Result {
  const {
    fallbackOrderId,
    reloadNonce = 0,
    resolveFrom,
    actorRole,
    factoryId,
    collectionId,
    buyerId,
    partnerId,
    enabled = true,
  } = options;
  const [spineMeta, setSpineMeta] = useState<SpineHit | null>(null);
  const [registryQueriedEmpty, setRegistryQueriedEmpty] = useState(false);
  const [resolving, setResolving] = useState(true);

  const resolveFromIncludesRegistry = resolveFrom.includes('w2_registry');
  const { tick: registryTick } = usePlatformCoreB2bRegistryPoll(
    enabled && isPlatformCoreMode() && resolveFromIncludesRegistry
  );
  const platformCoreGoldenFallback =
    isPlatformCoreMode() &&
    fallbackOrderId.trim().startsWith('B2B-DEMO-') &&
    !resolveFromIncludesRegistry;

  useEffect(() => {
    if (!enabled) {
      setSpineMeta(null);
      setRegistryQueriedEmpty(false);
      setResolving(false);
      return;
    }
    if (platformCoreGoldenFallback) {
      setSpineMeta(null);
      setRegistryQueriedEmpty(false);
      setResolving(false);
      return;
    }
    let cancelled = false;
    setResolving(true);
    void (async () => {
      try {
        let registryEmpty = false;
        for (const source of resolveFrom) {
          let hit: SpineHit | null = null;
          if (source === 'w2_registry' && collectionId?.trim()) {
            const registry = await fromW2Registry({
              collectionId,
              actorRole,
              buyerId,
              partnerId,
            });
            registryEmpty = registry.registryQueriedEmpty;
            hit = registry.hit;
          } else if (source === 'allocation') {
            hit = await fromAllocationQueue();
          } else if (source === 'operational' && actorRole) {
            hit = await fromOperationalList(actorRole);
          } else if (source === 'handoff' && factoryId) {
            hit = await fromHandoffQueue(factoryId);
          }
          if (hit) {
            const enriched = await enrichHitWithOperationalStatus(hit, actorRole);
            if (!cancelled) {
              setSpineMeta(enriched);
              setRegistryQueriedEmpty(registryEmpty);
            }
            return;
          }
        }
        if (!cancelled) {
          setSpineMeta(null);
          setRegistryQueriedEmpty(registryEmpty);
        }
      } catch {
        if (!cancelled) {
          setSpineMeta(null);
          setRegistryQueriedEmpty(false);
        }
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    resolveFrom.join(','),
    actorRole,
    factoryId,
    collectionId,
    buyerId,
    partnerId,
    reloadNonce,
    registryTick,
    platformCoreGoldenFallback,
  ]);

  const activeOrderId = platformCoreGoldenFallback
    ? fallbackOrderId
    : resolveActiveWholesaleOrderId({
        spineWholesaleOrderId: spineMeta?.wholesaleOrderId ?? null,
        fallbackOrderId,
        registryQueriedEmpty,
        resolveFromIncludesRegistry,
      });
  const isSpineOrder = isIntegrationImportedWholesaleOrderId(activeOrderId);

  return {
    activeOrderId,
    isSpineOrder,
    spineMeta: spineMeta
      ? { platform: spineMeta.platform, status: spineMeta.status, source: spineMeta.source }
      : null,
    resolving,
  };
}
