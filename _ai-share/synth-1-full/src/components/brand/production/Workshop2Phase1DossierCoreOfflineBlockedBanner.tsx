'use client';

import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  WORKSHOP2_PHASE1_DOSSIER_CORE_OFFLINE_BLOCKED_BANNER_RU,
  WORKSHOP2_PHASE1_DOSSIER_CORE_OFFLINE_BLOCKED_BANNER_TESTID,
} from '@/lib/platform/wave-xq-brand-dossier-dual-write-off';

type Props = {
  /** When persist failed because offline dual-write is off in core. */
  offlineBlocked?: boolean;
};

/** Wave XQ · RU banner: PG-only dossier persist in Platform Core (no localStorage offline cache). */
export function Workshop2Phase1DossierCoreOfflineBlockedBanner({ offlineBlocked }: Props) {
  if (!isPlatformCoreMode()) return null;
  const emphasized = offlineBlocked === true;
  return (
    <div
      className={
        emphasized
          ? 'rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-[12px] text-amber-950'
          : 'rounded-lg border border-sky-200 bg-sky-50/90 px-3 py-2 text-[12px] text-sky-950'
      }
      role="status"
      data-testid={WORKSHOP2_PHASE1_DOSSIER_CORE_OFFLINE_BLOCKED_BANNER_TESTID}
      data-offline-blocked={emphasized ? '1' : '0'}
    >
      {WORKSHOP2_PHASE1_DOSSIER_CORE_OFFLINE_BLOCKED_BANNER_RU}
    </div>
  );
}
