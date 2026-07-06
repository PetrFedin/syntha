'use client';

import { PlatformCorePillarRoleScoreMatrix } from '@/components/platform/PlatformCorePillarRoleScoreMatrix';
import { PLATFORM_CORE_AUDIT_SECTION_TITLE } from '@/lib/platform-core-canonical-labels';
import { hubSectionLabelClassName, platformCoreHubLayout } from '@/lib/platform-core-hub-layout';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  className?: string;
};

/** Матрица готовности на hub — подпись как у «Роли», без lead-текста. */
export function PlatformCoreHubAuditLauncher({ collectionId, className }: Props) {
  return (
    <section
      data-testid="platform-core-hub-audit-launcher"
      aria-label={PLATFORM_CORE_AUDIT_SECTION_TITLE}
      className={cn(platformCoreHubLayout.sectionStack, className)}
    >
      <p className={hubSectionLabelClassName()}>{PLATFORM_CORE_AUDIT_SECTION_TITLE}</p>
      <PlatformCorePillarRoleScoreMatrix collectionId={collectionId} hideSectionHeader showModeLead={false} />
    </section>
  );
}
