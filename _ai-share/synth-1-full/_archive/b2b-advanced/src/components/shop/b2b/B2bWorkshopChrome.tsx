'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';

import { W2_OPERATIONAL_PANEL_ROOT } from '@/components/brand/production/workshop2-operational-panel-chrome';
import { PlatformCoreShopB2bLegacyGuard } from '@/components/platform/PlatformCoreShopB2bLegacyGuard';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  /** Подпись режима для investor walkthrough (опционально). */
  modeLabelRu?: string;
  className?: string;
};

/**
 * Wave 41/58: единый chrome B2B investor path — W2 operational tokens + честный demo banner.
 */
export function B2bWorkshopChrome({ children, modeLabelRu, className }: Props) {
  const coreMode = isPlatformCoreMode();
  const demoMode =
    !coreMode &&
    typeof process !== 'undefined' &&
    String(process.env.NEXT_PUBLIC_WORKSHOP2_INVESTOR_DEMO_MODE ?? '').toLowerCase() === 'true';

  return (
    <div
      data-testid="b2b-workshop-chrome"
      className={cn(W2_OPERATIONAL_PANEL_ROOT, 'space-y-4', className)}
    >
      {(demoMode || modeLabelRu) && (
        <div
          className="border-amber-200 bg-amber-50 text-amber-950 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs"
          data-testid="b2b-workshop-chrome-demo-banner"
        >
          <span>
            {modeLabelRu ??
              'Режим демо инвестора: journal-only ACK где нет prod keys — не считать live success.'}
          </span>
          <Link
            href="/brand/production/workshop2/investor-brief"
            className="font-semibold underline underline-offset-2"
          >
            Brief →
          </Link>
        </div>
      )}
      <PlatformCoreShopB2bLegacyGuard>{children}</PlatformCoreShopB2bLegacyGuard>
    </div>
  );
}
