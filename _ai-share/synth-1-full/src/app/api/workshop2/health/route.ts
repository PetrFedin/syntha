import { NextResponse } from 'next/server';
import { getWorkshop2ServerDossierStoreMode } from '@/lib/server/workshop2-phase1-dossier-server-store';
import { isWorkshop2PostgresEnabled, getWorkshop2PgPool } from '@/lib/server/workshop2-pg-pool';
import { isWorkshop2RedisConfigured } from '@/lib/server/workshop2-redis-pubsub';
import { isWorkshop2VaultS3Configured } from '@/lib/server/workshop2-vault-s3';
import { workshop2DevBypassAuthEnabled } from '@/lib/server/workshop2-api-auth';
import { getWorkshop2GenkitApiKeyStatus } from '@/lib/server/workshop2-genkit-health';
import { isWorkshop2InternalWmsEnabled } from '@/lib/production/workshop2-internal-wms';
import { isWorkshop2MarkingApiConfigured } from '@/lib/production/workshop2-marking-honest-sign';
import { shouldPlatformCorePersistAuxiliaryToFile } from '@/lib/server/platform-core-pg-primary-file-policy';

export const dynamic = 'force-dynamic';

/** GET: healthcheck Postgres + режим store (без auth). */
export async function GET() {
  let postgres: 'ok' | 'down' | 'disabled' = 'disabled';
  if (isWorkshop2PostgresEnabled()) {
    try {
      await getWorkshop2PgPool().query('SELECT 1');
      postgres = 'ok';
    } catch {
      postgres = 'down';
    }
  }

  const genkit = getWorkshop2GenkitApiKeyStatus();
  const internalWms = isWorkshop2InternalWmsEnabled();
  const ok = postgres !== 'down';
  const calendarTasksStore =
    postgres === 'ok' ? 'postgres' : shouldPlatformCorePersistAuxiliaryToFile() ? 'file' : 'memory';
  return NextResponse.json(
    {
      ok,
      storeMode: getWorkshop2ServerDossierStoreMode(),
      postgres,
      auxiliaryStores: {
        calendarTasks: calendarTasksStore,
        brandKanban: postgres === 'ok' ? 'postgres' : 'unavailable',
      },
      internalWms: internalWms ? 'enabled' : 'disabled',
      redis: isWorkshop2RedisConfigured() ? 'configured' : 'off',
      vaultS3: isWorkshop2VaultS3Configured() ? 'configured' : 'off',
      genkit,
      ai: {
        dfm: `/api/brand/workshop2/ai/dfm-check`,
        matchmaker: `/api/brand/workshop2/ai/match-contractors`,
        genkitConfigured: genkit === 'configured',
      },
      devAuthBypass: workshop2DevBypassAuthEnabled(),
      integrations: {
        markingApiConfigured: isWorkshop2MarkingApiConfigured(),
      },
    },
    { status: ok ? 200 : 503 }
  );
}
