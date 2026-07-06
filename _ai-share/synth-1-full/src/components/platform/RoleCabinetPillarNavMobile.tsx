'use client';

import type { CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { PLATFORM_CORE_PILLARS } from '@/lib/platform-core-hub-matrix';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  pillarIds: readonly CoreHubPillarId[];
  selectedPillarId: CoreHubPillarId;
  onSelect: (pillarId: CoreHubPillarId) => void;
  /** Embedded workspace: столпы в шапке на всех breakpoints (aside — только разделы). */
  embeddedLayout?: boolean;
};

/** iPhone: segmented 2×N; md+: скрыт (rail в aside), кроме embeddedLayout. */
export function RoleCabinetPillarNavMobile({
  pillarIds,
  selectedPillarId,
  onSelect,
  embeddedLayout = false,
}: Props) {
  return (
    <nav
      data-testid="role-cabinet-pillar-nav-mobile"
      aria-label="Столпы роли"
      className={embeddedLayout ? hubCabinet.pillarNavEmbedded : hubCabinet.pillarNavMobile}
    >
      <div className={hubCabinet.pillarSegmentRow}>
        {PLATFORM_CORE_PILLARS.filter((p) => pillarIds.includes(p.id)).map((pillar) => {
          const active = selectedPillarId === pillar.id;
          return (
            <button
              key={pillar.id}
              type="button"
              data-testid={`role-pillar-segment-${pillar.id}`}
              aria-pressed={active}
              onClick={() => onSelect(pillar.id)}
              className={cn(
                hubCabinet.pillarSegmentBtn,
                active ? hubCabinet.pillarSegmentBtnActive : hubCabinet.pillarSegmentBtnIdle
              )}
            >
              {pillar.title}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
