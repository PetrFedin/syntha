'use client';

import { Badge } from '@/components/ui/badge';
import { PlatformCoreChainStatusRefreshBadge } from '@/components/platform/PlatformCoreChainStatusRefreshBadge';
import {
  shopCoTrackingChainStatusMirrorPollTestId,
  shopCoTrackingChainStatusMirrorSseTestId,
  shopCoTrackingChainStatusMirrorTestId,
} from '@/lib/platform-core-shop-tracking-chain-mirror';
import { cn } from '@/lib/utils';

type Props = {
  orderId: string;
  statusLabel: string;
  sseConnected: boolean;
  enabled?: boolean;
  mirrorTestId?: string;
  sseTestId?: string;
  pollTestId?: string;
};

/** Честное зеркало chain-status на карточке трекинга (SSE/poll dot + data-chain-sse-live). */
export function ShopCoTrackingChainStatusMirrorBadge({
  orderId,
  statusLabel,
  sseConnected,
  enabled = true,
  mirrorTestId: mirrorTestIdOverride,
  sseTestId: sseTestIdOverride,
  pollTestId: pollTestIdOverride,
}: Props) {
  const oid = orderId.trim();
  if (!oid || !statusLabel.trim()) return null;

  const mirrorTestId = mirrorTestIdOverride ?? shopCoTrackingChainStatusMirrorTestId(oid);
  const sseLive = Boolean(enabled && sseConnected);

  return (
    <div
      className="mt-2 flex flex-wrap items-center gap-2"
      data-testid={mirrorTestId}
      data-chain-sse-live={sseLive ? '1' : '0'}
    >
      <Badge variant="outline" className="border-indigo-200 text-[9px] text-indigo-900">
        {statusLabel}
      </Badge>
      <PlatformCoreChainStatusRefreshBadge
        variant="dot"
        sseConnected={sseConnected}
        enabled={enabled}
        sseTestId={sseTestIdOverride ?? shopCoTrackingChainStatusMirrorSseTestId(oid)}
        pollTestId={pollTestIdOverride ?? shopCoTrackingChainStatusMirrorPollTestId(oid)}
      />
    </div>
  );
}
