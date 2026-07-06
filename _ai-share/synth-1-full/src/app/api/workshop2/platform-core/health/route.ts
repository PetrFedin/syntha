import { NextResponse } from 'next/server';

import { probePlatformCoreDemoSeeded } from '@/lib/server/platform-core-bootstrap-probe';
import { probePlatformStackEnv } from '@/lib/platform-stack-integration';
import { isSpineOperationalPgPrimary } from '@/lib/integrations/spine/spine-pg-hydrate-guards';
import { getIntegrationsSpineHubMeta } from '@/lib/integrations/spine/integration-status.service';
import { isPlatformCoreChainStatusRedisEnabled } from '@/lib/server/platform-core-chain-status-hub';
import { getPlatformCoreRealtimeHubsMeta } from '@/lib/server/platform-core-realtime-hubs-meta';
import {
  buildPlatformCoreSpineStoreMatrix,
  isPlatformCoreSpinePgPrimary,
} from '@/lib/server/platform-core-spine-pg.server';
import {
  isWorkshop2PostgresEnabled,
  probeWorkshop2PgReachable,
} from '@/lib/server/workshop2-pg-pool';

/** GET /api/workshop2/platform-core/health — детектор dev:core для скриптов verify/status. */
export async function GET() {
  const coreMode =
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE === '1' ||
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE === 'true';
  const pgConfigured = isWorkshop2PostgresEnabled();
  const pgReachable = pgConfigured ? await probeWorkshop2PgReachable() : false;
  const demoSeeded = pgReachable ? await probePlatformCoreDemoSeeded() : false;
  const redisConfigured = isPlatformCoreChainStatusRedisEnabled();
  const realtimeHubs = getPlatformCoreRealtimeHubsMeta();
  const chainStatusSseMode = realtimeHubs.chainStatusSseMode;
  const sampleStatusSseMode = realtimeHubs.sampleStatusSseMode;

  const spineOperationalPgPrimary = isSpineOperationalPgPrimary();
  const platformCoreSpinePgPrimary = isPlatformCoreSpinePgPrimary();
  const spineStores = buildPlatformCoreSpineStoreMatrix();
  const spineHub = getIntegrationsSpineHubMeta();
  const platformStack = probePlatformStackEnv(process.env);

  let messageRu = 'Обычный Next dev (не core mode)';
  if (coreMode) {
    if (!pgConfigured) {
      messageRu = 'Platform Core dev — WORKSHOP2_DATABASE_URL не задан';
    } else if (!pgReachable) {
      messageRu = 'Platform Core dev — PG :5433 недоступен (npm run db:core:up)';
    } else if (!demoSeeded) {
      messageRu =
        'Platform Core dev + PG без seed — npm run db:core:bootstrap или npm run core:bootstrap';
    } else {
      messageRu = 'Platform Core dev + PG + demo seed';
    }
  }

  return NextResponse.json({
    ok: true,
    coreMode,
    pgConfigured,
    pgReachable,
    demoSeeded,
    redisConfigured,
    chainStatusSseMode,
    sampleStatusSseMode,
    realtimeHubs,
    spineOperationalPgPrimary,
    platformCoreSpinePgPrimary,
    spineStores,
    operationalOrdersSource: spineHub.operationalOrdersSource,
    platformStack,
    messageRu,
  });
}
