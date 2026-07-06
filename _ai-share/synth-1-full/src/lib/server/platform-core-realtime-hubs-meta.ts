import 'server-only';

import { isPlatformCoreB2bRegistryRedisEnabled } from '@/lib/server/platform-core-b2b-registry-hub';
import { isPlatformCoreChainStatusRedisEnabled } from '@/lib/server/platform-core-chain-status-hub';
import { isPlatformCoreCommsInboxRedisEnabled } from '@/lib/server/platform-core-comms-inbox-hub';
import { isPlatformCoreDevelopmentStatusRedisEnabled } from '@/lib/server/platform-core-development-status-hub';
import { isWorkshop2RedisConfigured } from '@/lib/server/workshop2-redis-pubsub';

export type PlatformCoreRealtimeHubMeta = {
  id: string;
  redis: boolean;
  mode: 'poll+bump' | 'poll+bump+redis';
};

export function getPlatformCoreRealtimeHubsMeta(): {
  redisConfigured: boolean;
  chainStatusSseMode: 'poll+bump' | 'poll+bump+redis';
  sampleStatusSseMode: 'poll+bump' | 'poll+bump+redis';
  hubs: PlatformCoreRealtimeHubMeta[];
} {
  const redisConfigured = isWorkshop2RedisConfigured();
  const mode = redisConfigured ? 'poll+bump+redis' : 'poll+bump';

  return {
    redisConfigured,
    chainStatusSseMode: mode,
    sampleStatusSseMode: mode,
    hubs: [
      { id: 'chain-status', redis: isPlatformCoreChainStatusRedisEnabled(), mode },
      { id: 'b2b-registry', redis: isPlatformCoreB2bRegistryRedisEnabled(), mode },
      { id: 'development-status', redis: isPlatformCoreDevelopmentStatusRedisEnabled(), mode },
      { id: 'sample-status', redis: isPlatformCoreDevelopmentStatusRedisEnabled(), mode },
      { id: 'comms-inbox', redis: isPlatformCoreCommsInboxRedisEnabled(), mode },
    ],
  };
}
