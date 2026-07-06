'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchPgContextualThreads } from '@/lib/brand/brand-pg-contextual-chat-client';
import type { BrandPgThreadRow } from '@/lib/brand/brand-messages-pg-threads';
import type { PgContextualThreadsCabinet } from '@/lib/server/pg-contextual-message-threads-handler';
import { WORKSHOP2_B2B_ORDER_CONTEXT_TYPE } from '@/lib/production/workshop2-b2b-order-lifecycle';
import { mergeCommsHubInboxThreadRows } from '@/lib/communications/comms-hub-inbox-rows';
import type { CommsCabinetVariant } from '@/lib/communications/comms-cabinet-thread-nav';
import {
  usePlatformCoreB2bInboxOrderIds,
  type PlatformCoreB2bInboxCabinet,
} from '@/hooks/use-platform-core-b2b-inbox-order-ids';
import { useShopCoreBuyerId } from '@/hooks/use-shop-core-buyer-id';
import { usePlatformCoreB2bRegistryPoll } from '@/hooks/use-platform-core-b2b-registry-poll';
import { usePlatformCoreCommsInboxPoll } from '@/hooks/use-platform-core-comms-inbox-poll';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

function pgCabinet(variant: CommsCabinetVariant): PgContextualThreadsCabinet {
  return variant === 'shop' ? 'shop' : variant === 'brand' ? 'brand' : 'factory';
}

function inboxCabinet(variant: CommsCabinetVariant): PlatformCoreB2bInboxCabinet {
  if (variant === 'shop') return 'shop';
  if (variant === 'brand') return 'brand';
  if (variant === 'supplier') return 'supplier';
  return 'manufacturer';
}

export function useCommsHubMergedThreads(input: {
  variant: CommsCabinetVariant;
  collectionId: string;
  orderId: string;
  disabled?: boolean;
}) {
  const { variant, collectionId, orderId, disabled } = input;
  const demo = usePlatformCoreDemoContext();
  const { buyerId: shopBuyerId } = useShopCoreBuyerId();
  const cabinet = inboxCabinet(variant);
  const { orderIds: inboxOrderIds, ready: inboxReady } = usePlatformCoreB2bInboxOrderIds(
    disabled ? null : cabinet,
    cabinet === 'shop' ? shopBuyerId : undefined
  );
  const { tick: registryTick } = usePlatformCoreB2bRegistryPoll(!disabled);
  const { tick: inboxTick } = usePlatformCoreCommsInboxPoll(!disabled);
  const [pgThreads, setPgThreads] = useState<BrandPgThreadRow[]>([]);
  const [pgLoaded, setPgLoaded] = useState(false);
  const [poByOrderId, setPoByOrderId] = useState<Record<string, string>>({});

  useEffect(() => {
    if (disabled) {
      setPgThreads([]);
      setPgLoaded(true);
      return;
    }
    let cancelled = false;
    void fetchPgContextualThreads(pgCabinet(variant))
      .then(({ threads: rows }) => {
        if (!cancelled) setPgThreads(rows);
      })
      .finally(() => {
        if (!cancelled) setPgLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [variant, disabled, registryTick, inboxTick]);

  useEffect(() => {
    if (disabled || (variant !== 'manufacturer' && variant !== 'supplier')) {
      setPoByOrderId({});
      return;
    }
    let cancelled = false;
    void fetch(
      `/api/workshop2/factory/production-handoff-queue?factoryId=${encodeURIComponent(demo.factoryId)}`,
      { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
    )
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as {
          ok?: boolean;
          items?: Array<{ b2bOrderId?: string; productionOrderId?: string }>;
        };
      })
      .then((json) => {
        if (cancelled || !json?.ok || !Array.isArray(json.items)) return;
        const next: Record<string, string> = {};
        for (const item of json.items) {
          const b2b = item.b2bOrderId?.trim();
          const po = item.productionOrderId?.trim();
          if (b2b && po) next[b2b] = po;
        }
        setPoByOrderId(next);
      })
      .catch(() => {
        if (!cancelled) setPoByOrderId({});
      });
    return () => {
      cancelled = true;
    };
  }, [disabled, variant, demo.factoryId, registryTick]);

  const mergedThreads = useMemo(() => {
    if (disabled) return [];
    const orders =
      inboxOrderIds.length > 0 ? inboxOrderIds : orderId.trim() ? [orderId.trim()] : [];
    const rows = mergeCommsHubInboxThreadRows(pgThreads, orders, collectionId);
    const activeOrder = orderId.trim();
    return rows.filter((t) => {
      if (t.messageCount > 0 || Boolean(t.lastMessageAt?.trim())) return true;
      return (
        Boolean(activeOrder) &&
        t.contextType === WORKSHOP2_B2B_ORDER_CONTEXT_TYPE &&
        t.contextId?.trim() === activeOrder
      );
    });
  }, [disabled, pgThreads, inboxOrderIds, orderId, collectionId]);

  return {
    loaded: pgLoaded && inboxReady,
    mergedThreads,
    poByOrderId,
  };
}
