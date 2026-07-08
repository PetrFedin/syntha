'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  PLATFORM_CORE_COLLECTION_PRESETS,
  getPlatformCoreCollectionLabel,
} from '@/lib/platform-core-demo-context';
import { isPlatformCoreEmptyChainCollection } from '@/lib/platform-core-hub-matrix';
import { ROUTES } from '@/lib/routes';

/** Сводная навигация по коллекциям сезона — multi-collection matrix (P1). */
export function ShopCoSeasonMatrixStrip({ activeCollectionId }: { activeCollectionId: string }) {
  const seasonCollections = PLATFORM_CORE_COLLECTION_PRESETS.filter(
    (p) => p.available && !isPlatformCoreEmptyChainCollection(p.id)
  );

  if (seasonCollections.length < 2) return null;

  return (
    <div
      className="border-border-subtle bg-bg-surface2/50 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2"
      data-testid="shop-co-season-matrix-strip"
    >
      <span className="text-text-muted text-[10px] font-bold uppercase tracking-wide">
        Сводная матрица сезона
      </span>
      {seasonCollections.map((preset) => {
        const active = preset.id === activeCollectionId;
        const href = `${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(preset.id)}`;
        return (
          <Link
            key={preset.id}
            href={href}
            className="inline-flex items-center gap-1"
            data-testid={`shop-co-season-matrix-link-${preset.id}`}
            aria-current={active ? 'page' : undefined}
          >
            <Badge
              variant={active ? 'default' : 'outline'}
              className={active ? 'text-[10px]' : 'text-[10px] font-normal'}
            >
              {getPlatformCoreCollectionLabel(preset.id)}
            </Badge>
          </Link>
        );
      })}
    </div>
  );
}
