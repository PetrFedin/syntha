'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { products } from '@/lib/products';
import { buildBrandTechPackReleaseGateRows } from '@/lib/fashion/brand-techpack-release-gate-rows';
import { getWorkshop2Phase1Dossier } from '@/lib/production/workshop2-phase1-dossier-storage';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { ROUTES } from '@/lib/routes';

type Props = {
  collectionId: string;
};

/** Auto-blockers from techpack release gate — actionable links, не только CSV table. */
export function BrandReleaseChecklistAutoBlockersStrip({ collectionId }: Props) {
  const rows = useMemo(
    () =>
      buildBrandTechPackReleaseGateRows({
        products,
        collectionId,
        resolveDossier: (articleId) => getWorkshop2Phase1Dossier(collectionId, articleId),
      }),
    [collectionId]
  );

  const blocked = rows.filter((row) => !row.ready);
  const topBlockers = blocked.slice(0, 4);
  const techpackGateHref = `${ROUTES.brand.launchReadiness}?${PILLAR_CAPABILITY_FEATURE_PARAM}=techpack-gate`;

  if (rows.length === 0) return null;

  return (
    <div
      className="border-border-subtle mb-4 space-y-2 rounded-md border border-amber-200/60 bg-amber-50/30 px-3 py-3 text-xs"
      data-testid="brand-release-checklist-auto-blockers-strip"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-[9px] uppercase">
          Auto-blockers
        </Badge>
        <Badge variant="secondary" data-testid="brand-release-checklist-auto-blockers-count">
          {blocked.length} / {rows.length} SKU blocked
        </Badge>
        <Button size="sm" variant="outline" className="ml-auto h-7 text-[10px]" asChild>
          <Link href={techpackGateHref} data-testid="brand-release-checklist-auto-blockers-gate-link">
            Гейт фабричного пакета
          </Link>
        </Button>
      </div>
      {blocked.length === 0 ? (
        <p className="text-text-secondary text-[10px]" data-testid="brand-release-checklist-auto-blockers-clear">
          Все SKU проходят techpack gate — можно syndication/publish.
        </p>
      ) : (
        <ul className="space-y-1.5" data-testid="brand-release-checklist-auto-blockers-list">
          {topBlockers.map((row) => (
            <li
              key={row.sku}
              className="flex flex-wrap items-start gap-2 rounded border border-amber-100 bg-white/80 px-2 py-1.5"
              data-testid={`brand-release-checklist-auto-blocker-${row.sku}`}
            >
              <span className="font-mono text-[10px] font-semibold">{row.sku}</span>
              <span className="text-text-muted min-w-0 flex-1 text-[10px]">
                {(row.blockersRu[0] ?? 'Pack incomplete').slice(0, 120)}
              </span>
              <Link
                href={row.factoryPackHref}
                className="text-accent-primary text-[10px] hover:underline"
                data-testid={`brand-release-checklist-auto-blocker-fix-${row.sku}`}
              >
                Fix pack
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
