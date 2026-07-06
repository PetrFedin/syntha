'use client';

import { PlatformCoreHubAuditLauncher } from '@/components/platform/PlatformCoreHubAuditLauncher';
import { PlatformCoreHubQuickEntry } from '@/components/platform/PlatformCoreHubQuickEntry';
import { platformCoreHubLayout } from '@/lib/platform-core-hub-layout';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  showRoles: boolean;
  showAudit: boolean;
};

/**
 * Hub: блок «Роли» (горизонтально, слева) · под ним «Оценка готовности».
 */
export function PlatformCoreHubRolesAuditPanel({ collectionId, showRoles, showAudit }: Props) {
  if (!showRoles && !showAudit) return null;

  return (
    <section
      data-testid="platform-core-hub-roles-audit-panel"
      aria-label="Роли и оценка готовности"
      className={cn(platformCoreHubLayout.quickEntryAfterBanner, platformCoreHubLayout.sectionStack)}
    >
      {showRoles ? <PlatformCoreHubQuickEntry layout="horizontal" /> : null}
      {showAudit ? (
        <PlatformCoreHubAuditLauncher collectionId={collectionId} className="min-w-0" />
      ) : null}
    </section>
  );
}
