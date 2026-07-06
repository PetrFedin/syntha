import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

/** Wave XS · W2 hub readPath=api-only in Platform Core + explicit PG-unavailable banner. */

export const WORKSHOP2_CORE_HUB_READPATH_LOCAL_BANNER_RU =
  'Platform Core: PostgreSQL недоступен — состав коллекции только из API, без overlay localStorage.';

export const WORKSHOP2_CORE_HUB_READPATH_BOOTSTRAP_CMD = 'npm run core:bootstrap';

export const WORKSHOP2_CORE_HUB_READPATH_LOCAL_BANNER_TESTID =
  'workshop2-core-readpath-local-banner';

/** PG-offline в core обслуживается readPath=localStorage — без баннера bootstrap. */
export function shouldShowWorkshop2CoreHubReadPathBanner(_pgAvailable: boolean): boolean {
  return false;
}

/** Dedupe: readPath banner owns PG-off copy — hide pg-sync-hint / file-persist strip. */
export function shouldSuppressWorkshop2CorePgSyncHintForReadPathBanner(
  pgAvailable: boolean
): boolean {
  return shouldShowWorkshop2CoreHubReadPathBanner(pgAvailable);
}
