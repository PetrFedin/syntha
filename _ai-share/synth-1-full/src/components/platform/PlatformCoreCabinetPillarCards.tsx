'use client';

import type { CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { PLATFORM_CORE_PILLARS } from '@/lib/platform-core-hub-matrix';
import { PLATFORM_CORE_HUB_CARD_ROW_PILLARS } from '@/lib/platform-core-hub-carousel';
import { PLATFORM_CORE_PILLAR_ICONS } from '@/lib/platform-core-pillar-icons';
import { hubSectionLabelClassName } from '@/lib/platform-core-hub-layout';
import { PlatformCoreHubQuickCard } from '@/components/platform/PlatformCoreHubQuickCard';

type Props = {
  pillarIds: readonly CoreHubPillarId[];
  selectedPillarId: CoreHubPillarId;
  onSelect: (pillarId: CoreHubPillarId) => void;
};

/** Столпы кабинета роли — те же карточки, что «Столпы · быстрый вход» на /platform. */
export function PlatformCoreCabinetPillarCards({ pillarIds, selectedPillarId, onSelect }: Props) {
  return (
    <section
      data-testid="role-core-pillar-nav-horizontal"
      aria-label="Столпы роли"
      className="space-y-2"
    >
      <p className={hubSectionLabelClassName()}>Столпы · быстрый вход</p>
      <div className={PLATFORM_CORE_HUB_CARD_ROW_PILLARS}>
        {PLATFORM_CORE_PILLARS.filter((pillar) => pillarIds.includes(pillar.id)).map((pillar) => (
          <PlatformCoreHubQuickCard
            key={pillar.id}
            as="button"
            onSelect={() => onSelect(pillar.id)}
            testId={`role-pillar-${pillar.id}`}
            icon={PLATFORM_CORE_PILLAR_ICONS[pillar.id]}
            title={pillar.title}
            subtitle={pillar.subtitle}
            variant="role"
            selected={selectedPillarId === pillar.id}
          />
        ))}
      </div>
    </section>
  );
}
