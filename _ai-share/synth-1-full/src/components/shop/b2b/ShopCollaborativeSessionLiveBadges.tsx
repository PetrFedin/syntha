'use client';

import { Badge } from '@/components/ui/badge';
import { useShopCollaborativeSessionLive } from '@/hooks/use-shop-collaborative-session-live';
import {
  formatShopCollaborativeSessionLiveBadgeRu,
  shopCollaborativeApprovalStorageModeLabelRu,
  shopCollaborativeSessionLiveBadgeTestId,
  shopCollaborativeSessionStorageBadgeTestId,
} from '@/lib/shop/shop-collaborative-approval-feed';

type Props = {
  orderId: string;
  collectionId: string;
  buyerId: string;
  enabled?: boolean;
  /** Brand strip использует legacy testid для e2e core-60. */
  pgStorageTestId?: 'shop-collaborative-session-storage-pg' | 'brand-co-collaborative-storage-pg';
};

/** Live SSE/poll + PG storage badges · одна PG-сессия shop ↔ brand. */
export function ShopCollaborativeSessionLiveBadges({
  orderId,
  collectionId,
  buyerId,
  enabled = true,
  pgStorageTestId = 'shop-collaborative-session-storage-pg',
}: Props) {
  const live = useShopCollaborativeSessionLive({
    orderId,
    collectionId,
    buyerId,
    enabled: enabled && Boolean(orderId.trim()),
  });

  const storageLabelRu = shopCollaborativeApprovalStorageModeLabelRu(live.storageMode);
  const storageTestId =
    live.storageMode === 'pg' ? pgStorageTestId : shopCollaborativeSessionStorageBadgeTestId(live.storageMode);

  return (
    <>
      {storageLabelRu ? (
        <Badge
          variant="outline"
          className="text-[10px]"
          data-testid={storageTestId ?? undefined}
        >
          {storageLabelRu}
        </Badge>
      ) : null}
      {live.sessionPollTs ? (
        <Badge
          variant="outline"
          className="border-emerald-500/40 text-[10px] text-emerald-700"
          data-testid={shopCollaborativeSessionLiveBadgeTestId({
            sseConnected: live.sseConnected,
            pushEnabled: live.pushEnabled,
          })}
          data-session-poll-ts={live.sessionPollTs}
        >
          {formatShopCollaborativeSessionLiveBadgeRu({
            sseConnected: live.sseConnected,
            pushEnabled: live.pushEnabled,
          })}
        </Badge>
      ) : null}
    </>
  );
}
