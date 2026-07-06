'use client';

import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';
import { usePlatformCoreChainStatusPushEnabled } from '@/hooks/use-platform-core-chain-status-push-enabled';
import type { PlatformCoreCommsNotificationRole } from '@/lib/platform-core-comms-notification-prefs';

/** SSE + poll fallback для pillar cards (CollectionOrder / OrderProduction). */
export function usePlatformCorePillarChainStatusSse(
  role: PlatformCoreCommsNotificationRole,
  orderIds: readonly string[],
  hubChainBump = 0
) {
  const trimmed = orderIds.map((id) => id.trim()).filter(Boolean);
  const chainPushEnabled = usePlatformCoreChainStatusPushEnabled(role);
  const pollEnabled = chainPushEnabled && trimmed.length > 0;
  const { tick, refresh, sseConnected } = usePlatformCoreChainStatusPoll(pollEnabled, trimmed);
  const reloadNonce = tick + hubChainBump;

  return {
    chainPushEnabled,
    pollEnabled,
    tick,
    refresh,
    sseConnected,
    reloadNonce,
  };
}
