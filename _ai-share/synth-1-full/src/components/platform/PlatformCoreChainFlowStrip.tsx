'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { getChainStripPillarHref, PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  usePlatformCoreChainOverview,
  usePlatformCoreDemoContext,
} from '@/components/platform/usePlatformCoreChainOverview';

type Props = {
  /** Подсветить столпы, в которых участвует роль */
  highlightRole?: CoreChainRoleId;
  collectionId?: string;
  compact?: boolean;
};

export function PlatformCoreChainFlowStrip({
  highlightRole,
  collectionId = PLATFORM_CORE_DEMO.collectionId,
  compact = false,
}: Props) {
  const { overview } = usePlatformCoreChainOverview(collectionId);
  const demo = usePlatformCoreDemoContext();
  const pillars = overview?.pillars ?? [];

  return (
    <nav
      data-testid="platform-core-chain-flow-strip"
      aria-label="Цепочка пяти столпов"
      className={
        compact
          ? 'flex flex-wrap items-center gap-1.5'
          : 'border-border-subtle bg-bg-surface2/60 flex flex-wrap items-stretch gap-2 rounded-xl border p-3'
      }
    >
      {pillars.map((pillar, idx) => {
        const pillarId = pillar.id as CoreHubPillarId;
        const href = getChainStripPillarHref(pillarId, {
          highlightRole,
          primaryHref: pillar.primaryHref,
          demo,
        });
        return (
          <div
            key={pillar.id}
            id={`pillar-${pillarId}`}
            className="flex scroll-mt-24 items-center gap-1.5"
          >
            <Link
              href={href}
              data-testid={`chain-pillar-${pillar.id}`}
              className={
                compact
                  ? 'hover:bg-bg-surface inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors'
                  : 'hover:bg-bg-surface border-border-subtle min-w-[9rem] flex-1 rounded-lg border bg-white px-3 py-2 transition-colors'
              }
              title={pillar.detailRu}
            >
              {pillar.done ? (
                <CheckCircle2
                  className="h-3.5 w-3.5 shrink-0 text-emerald-600"
                  aria-hidden
                  data-testid={`chain-pillar-status-done-${pillar.id}`}
                />
              ) : (
                <Circle className="text-text-muted h-3.5 w-3.5 shrink-0" aria-hidden />
              )}
              <span className="text-text-primary leading-tight">
                <span className="block font-semibold">{pillar.title}</span>
                {!compact ? (
                  <span className="text-text-muted block text-[10px] font-normal">
                    {pillar.detailRu}
                  </span>
                ) : null}
              </span>
            </Link>
            {idx < pillars.length - 1 ? (
              <ArrowRight
                className="text-text-muted hidden h-3 w-3 shrink-0 sm:block"
                aria-hidden
              />
            ) : null}
          </div>
        );
      })}
      {highlightRole ? (
        <span className="text-text-muted ml-auto self-center text-[10px]">
          роль: {highlightRole}
        </span>
      ) : null}
    </nav>
  );
}
