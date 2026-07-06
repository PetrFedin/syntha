import 'server-only';

import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  evaluateBrandMaterialPassportReleaseGateFromSummary,
  type BrandMaterialPassportReleaseGateResult,
} from '@/lib/production/brand-material-passport-release-gate';
import { listBrandMaterialPassportCertsServer } from '@/lib/server/brand-material-passport-certs-repository';
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

/** Server-side release gate for collection publish (linesheet / showroom). */
export async function evaluateBrandMaterialPassportReleaseGateForCollection(input: {
  collectionId: string;
}): Promise<BrandMaterialPassportReleaseGateResult> {
  const collectionId = input.collectionId.trim();
  const corePgOnly = isPlatformCoreMode();
  const pgUnavailable = corePgOnly && !isWorkshop2PostgresEnabled();

  if (pgUnavailable) {
    return evaluateBrandMaterialPassportReleaseGateFromSummary({
      summary: { total: 0, ready: 0, blocked: 0 },
      releaseBlocked: true,
      pgUnavailable: true,
    });
  }

  const listed = await listBrandMaterialPassportCertsServer({
    collectionId,
    seedIfEmpty: true,
    limit: 60,
  });

  return evaluateBrandMaterialPassportReleaseGateFromSummary({
    summary: listed.summary,
    releaseBlocked: listed.releaseBlocked,
    storageMode: listed.storageMode,
  });
}
