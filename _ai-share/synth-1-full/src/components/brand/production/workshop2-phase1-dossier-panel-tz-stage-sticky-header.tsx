'use client';

import { Workshop2SectionStageBoard } from '@/components/brand/production/Workshop2SectionStageBoard';
import { W2_TZ_SECTION_STAGE_DOM_ID } from '@/lib/production/workshop2-construction-dossier-anchors';
import { cn } from '@/lib/utils';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';

export function Workshop2DossierTzStageStickyHeader({
  stageBoardWarnings,
  tzRevokeDeniedHint,
  onJumpToVisualBrandNotes,
}: {
  stageBoardWarnings: string[];
  tzRevokeDeniedHint: string | null | undefined;
  onJumpToVisualBrandNotes: () => void;
}) {
  return (
    <div
      id={W2_TZ_SECTION_STAGE_DOM_ID}
      className={cn(
        'scroll-mt-24 space-y-2 max-md:sticky max-md:top-0 max-md:z-20',
        hubCabinet.workspaceStickyHead,
        'md:sticky md:top-4 md:z-20 md:bg-transparent md:backdrop-blur-none'
      )}
    >
      <Workshop2SectionStageBoard
        warnings={stageBoardWarnings}
        onJumpToVisualBrandNotes={onJumpToVisualBrandNotes}
      />
      {tzRevokeDeniedHint ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-[11px] text-amber-900">
          {tzRevokeDeniedHint}
        </p>
      ) : null}
    </div>
  );
}
