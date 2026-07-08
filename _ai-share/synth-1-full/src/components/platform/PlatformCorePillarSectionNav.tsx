'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  PLATFORM_CORE_PILLARS,
  getAdjacentPillars,
  getRoleAdjacentPillarWorkspaceHref,
} from '@/lib/platform-core-hub-matrix';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';

type Props = {
  roleId: CoreChainRoleId;
  pillarId: CoreHubPillarId;
  /** In-cabinet: кнопки без полной перезагрузки */
  onSelectPillar?: (pillarId: CoreHubPillarId) => void;
};

/** Предыдущий / следующий столп в цепочке для той же роли. */
export function PlatformCorePillarSectionNav({ roleId, pillarId, onSelectPillar }: Props) {
  const demo = usePlatformCoreDemoContext();
  const { prev, next } = getAdjacentPillars(pillarId);
  const prevTitle = prev ? PLATFORM_CORE_PILLARS.find((p) => p.id === prev)?.title : null;
  const nextTitle = next ? PLATFORM_CORE_PILLARS.find((p) => p.id === next)?.title : null;
  const prevHref = prev ? getRoleAdjacentPillarWorkspaceHref(roleId, pillarId, 'prev', demo) : null;
  const nextHref = next ? getRoleAdjacentPillarWorkspaceHref(roleId, pillarId, 'next', demo) : null;

  if (!prev && !next) return null;

  return (
    <nav
      data-testid="platform-core-pillar-section-nav"
      aria-label="Соседние столпы цепочки"
      className="flex flex-wrap items-center justify-between gap-2 border-t border-dashed pt-4"
    >
      {prev ? (
        onSelectPillar ? (
          <button
            type="button"
            data-testid={`pillar-section-prev-${prev}`}
            onClick={() => onSelectPillar(prev)}
            className="text-text-secondary hover:text-accent-primary inline-flex items-center gap-1 text-xs font-medium"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
            {prevTitle}
          </button>
        ) : prevHref ? (
          <Link
            href={prevHref}
            data-testid={`pillar-section-prev-${prev}`}
            className="text-text-secondary hover:text-accent-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
            {prevTitle}
          </Link>
        ) : (
          <span className="text-text-muted text-xs">{prevTitle}</span>
        )
      ) : (
        <span />
      )}

      {next ? (
        onSelectPillar ? (
          <button
            type="button"
            data-testid={`pillar-section-next-${next}`}
            onClick={() => onSelectPillar(next)}
            className="text-text-secondary hover:text-accent-primary inline-flex items-center gap-1 text-xs font-medium"
          >
            {nextTitle}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : nextHref ? (
          <Link
            href={nextHref}
            data-testid={`pillar-section-next-${next}`}
            className="text-text-secondary hover:text-accent-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
          >
            {nextTitle}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : (
          <span className="text-text-muted text-xs">{nextTitle}</span>
        )
      ) : null}
    </nav>
  );
}
