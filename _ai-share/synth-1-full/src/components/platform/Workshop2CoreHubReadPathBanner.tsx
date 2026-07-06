'use client';

import {
  shouldShowWorkshop2CoreHubReadPathBanner,
  WORKSHOP2_CORE_HUB_READPATH_BOOTSTRAP_CMD,
  WORKSHOP2_CORE_HUB_READPATH_LOCAL_BANNER_RU,
  WORKSHOP2_CORE_HUB_READPATH_LOCAL_BANNER_TESTID,
} from '@/lib/platform-core-ports/platform/wave-xs-brand-w2-readpath-banner';

/** Wave XS: explicit RU banner when core blocks readPath flip to localStorage. */
export function Workshop2CoreHubReadPathBanner({ pgAvailable }: { pgAvailable: boolean }) {
  if (!shouldShowWorkshop2CoreHubReadPathBanner(pgAvailable)) return null;
  return (
    <div
      className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-[12px] text-amber-950"
      role="status"
      data-testid={WORKSHOP2_CORE_HUB_READPATH_LOCAL_BANNER_TESTID}
    >
      {WORKSHOP2_CORE_HUB_READPATH_LOCAL_BANNER_RU} Запустите{' '}
      <code className="text-[11px]">{WORKSHOP2_CORE_HUB_READPATH_BOOTSTRAP_CMD}</code>.
    </div>
  );
}
