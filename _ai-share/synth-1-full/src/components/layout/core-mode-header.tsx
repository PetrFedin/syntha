'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlatformCoreHubViewToggle } from '@/components/platform/PlatformCoreHubViewToggle';
import { usePlatformCoreHubViews } from '@/hooks/use-platform-core-hub-views';
import { PLATFORM_CORE_HUB_TITLE } from '@/lib/platform-core-canonical-labels';
import { isPlatformCoreB2cHubPath } from '@/lib/platform-core-mode-surfaces';
import { PLATFORM_CORE_HORIZONTAL_SCROLL } from '@/lib/platform-core-header-controls';
import { cn } from '@/lib/utils';

function CoreModeHeaderHubControls() {
  const { hubViews, onHubViewsChange } = usePlatformCoreHubViews();
  return <PlatformCoreHubViewToggle value={hubViews} onChange={onHubViewsChange} />;
}

/** Минимальный header для Platform Core — hub-вкладки на `/platform`. B2B toggle скрыт до v2. */
export function CoreModeHeader() {
  const pathname = usePathname();
  const isHub = isPlatformCoreB2cHubPath(pathname);

  return (
    <header
      data-testid="platform-core-mode-header"
      className="border-border-default bg-bg-surface sticky top-0 z-40 flex h-10 min-h-10 items-center justify-between gap-2 border-b px-3 sm:gap-3 sm:px-4"
    >
      <Link
        href="/platform"
        data-testid="platform-core-hub-title"
        className="text-text-muted hover:text-text-primary min-w-0 flex-1 truncate text-[10px] font-black uppercase tracking-widest transition-colors sm:flex-none sm:overflow-visible"
      >
        {PLATFORM_CORE_HUB_TITLE}
      </Link>

      <div
        className={cn(
          PLATFORM_CORE_HORIZONTAL_SCROLL,
          'ml-auto max-w-[min(72vw,20rem)] shrink-0 sm:max-w-none'
        )}
      >
        {isHub ? (
          <Suspense fallback={<div className="h-9 w-24 shrink-0 sm:h-8" aria-hidden />}>
            <CoreModeHeaderHubControls />
          </Suspense>
        ) : null}
      </div>
    </header>
  );
}
