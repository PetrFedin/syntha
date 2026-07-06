'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  getPlatformCoreHubRow,
  resolvePlatformCoreCollectionId,
} from '@/lib/platform-core-hub-matrix';
import { buildSectionSubItems } from '@/lib/platform-core-readiness-sections';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { prefetchPlatformCoreW2FromHref } from '@/lib/platform-core-w2-prefetch';

type Props = {
  roleId: CoreChainRoleId;
  pillarId: CoreHubPillarId;
  collectionId: string;
  /** Скрыть пункт, ведущий на текущий кабинет этого же столпа. */
  hideSelfCabinet?: boolean;
  /** Внутри aside кабинета — без второй рамки. */
  flat?: boolean;
};

/** Разделы столпа — только active-участие; тот же канон, что в матрице «Оценка готовности». */
export function RoleCorePillarSectionLinks({
  roleId,
  pillarId,
  collectionId,
  hideSelfCabinet = true,
  flat = false,
}: Props) {
  const row = getPlatformCoreHubRow(roleId);
  const cell = row?.pillars[pillarId];
  const cid = resolvePlatformCoreCollectionId(collectionId);

  const visible = useMemo(() => {
    if (!row || cell?.kind !== 'active') return [];
    const subItems = buildSectionSubItems(roleId, pillarId, cid);
    return subItems.filter((sub) => {
      if (!hideSelfCabinet) return true;
      if (!sub.id.endsWith('-cabinet') && !sub.id.includes('-cabinet')) return true;
      return !sub.href.includes(`pillar=${pillarId}`);
    });
  }, [row, cell?.kind, roleId, pillarId, cid, hideSelfCabinet]);

  useEffect(() => {
    if (visible.length === 0) return;
    const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '';
    if (!hash) return;
    const el = document.querySelector(`[data-testid="role-pillar-section-${hash}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [pillarId, visible]);

  if (!row || cell?.kind !== 'active' || visible.length === 0) return null;

  return (
    <nav
      data-testid="role-pillar-section-links"
      aria-label="Разделы столпа"
      className={
        flat
          ? 'space-y-1.5'
          : 'border-border-subtle/80 space-y-1.5 rounded-lg border bg-slate-50/80 px-3 py-2.5'
      }
    >
      <p className="text-text-muted text-[11px] font-semibold uppercase tracking-wide">
        Разделы · {visible.length}
      </p>
      <ol className="space-y-1">
        {visible.map((sub) => (
          <li key={sub.id}>
            <Link
              href={sub.href}
              data-testid={`role-pillar-section-${sub.id}`}
              className="text-text-secondary hover:text-accent-primary flex items-baseline justify-between gap-2 text-[11px] leading-snug transition-colors"
              onMouseEnter={() => prefetchPlatformCoreW2FromHref(sub.href)}
              onFocus={() => prefetchPlatformCoreW2FromHref(sub.href)}
            >
              <span>
                {sub.label}
              </span>
              {!isPlatformCoreMode() ? (
                <span className="text-text-muted shrink-0 font-mono text-[11px]">
                  {sub.liveScore.toFixed(1)}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
