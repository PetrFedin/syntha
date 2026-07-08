'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  PLATFORM_CORE_PILLARS,
  getActivePillarIdsForRole,
  getRolePillarWorkspaceHref,
  platformCoreRolePillarHref,
} from '@/lib/platform-core-hub-matrix';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { platformCoreHeaderHubTabClass } from '@/lib/platform-core-header-controls';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  roleId: CoreChainRoleId;
  activePillarId?: CoreHubPillarId;
  className?: string;
};

/** Навигация по столпам роли — pill как hub; swipe на iPhone, wrap на md, скрыт на lg+ в core. */
export function PlatformCoreRolePillarStrip({ roleId, activePillarId, className }: Props) {
  const demo = usePlatformCoreDemoContext();
  const pathname = usePathname();
  const activeIds = getActivePillarIdsForRole(roleId);
  const collectionParam = demo.collectionId !== 'SS27' ? demo.collectionId : undefined;
  const cabinetHref = platformCoreRolePillarHref(
    roleId,
    activePillarId ?? activeIds[0] ?? 'development',
    collectionParam
  );

  return (
    <nav
      data-testid="platform-core-role-pillar-strip"
      aria-label="Столпы роли"
      className={cn(hubCabinet.workspacePillarStrip, className)}
    >
      <div
        className={cn(hubCabinet.pillarNavPillRow, 'md:snap-none md:flex-wrap md:overflow-visible')}
      >
        {PLATFORM_CORE_PILLARS.filter((pillar) => activeIds.includes(pillar.id)).map((pillar) => {
          const href = getRolePillarWorkspaceHref(roleId, pillar.id, demo);
          const isActive =
            activePillarId === pillar.id ||
            (!activePillarId && pathname != null && href.split('?')[0] === pathname);

          return (
            <Link
              key={pillar.id}
              href={href}
              data-testid={`role-pillar-link-${pillar.id}`}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                hubCabinet.pillarPill,
                platformCoreHeaderHubTabClass(isActive),
                'border-0 no-underline'
              )}
            >
              {pillar.title}
            </Link>
          );
        })}
        <Link
          href={cabinetHref}
          data-testid="role-pillar-cabinet-link"
          className={cn(
            hubCabinet.pillarPill,
            platformCoreHeaderHubTabClass(false),
            'border-0 text-[9px] no-underline'
          )}
        >
          Кабинет
        </Link>
      </div>
    </nav>
  );
}
