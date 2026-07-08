'use client';

import { cn } from '@/lib/utils';
import type { ShopReplenishmentFilterSliceRecord } from '@/lib/shop/shop-replenishment-filter-slices-client';
import { Badge } from '@/components/ui/badge';

type Props = {
  slices: ShopReplenishmentFilterSliceRecord[];
  activeSliceId: string | null;
  storageMode: string | null;
  onSelect: (slice: ShopReplenishmentFilterSliceRecord) => void;
};

export function ShopReplenishmentFilterSlicesSidebar({
  slices,
  activeSliceId,
  storageMode,
  onSelect,
}: Props) {
  return (
    <aside
      className="border-border-subtle bg-bg-surface2/40 w-full shrink-0 space-y-2 rounded-lg border p-3 md:w-44"
      data-testid="shop-replenishment-filter-slices-sidebar"
    >
      <p className="text-text-muted text-[10px] font-medium uppercase tracking-wide">
        Срезы фильтра
      </p>
      <nav className="flex flex-col gap-1" aria-label="Сохранённые срезы пополнения">
        {slices.map((slice) => {
          const active = slice.sliceId === activeSliceId;
          return (
            <button
              key={slice.sliceId}
              type="button"
              onClick={() => onSelect(slice)}
              className={cn(
                'rounded-md border px-2 py-1.5 text-left text-[11px] font-medium transition-colors',
                active
                  ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                  : 'border-border-subtle text-text-secondary hover:bg-bg-surface'
              )}
              data-testid={`shop-replenishment-slice-${slice.seasonId}`}
            >
              {slice.labelRu}
            </button>
          );
        })}
      </nav>
      {storageMode === 'pg' ? (
        <Badge
          variant="outline"
          className="border-sky-500/40 text-sky-700"
          data-testid="shop-replenishment-slice-storage-pg"
        >
          Срезы · PG
        </Badge>
      ) : storageMode === 'unavailable' ? (
        <Badge
          variant="outline"
          className="border-amber-500/40 text-amber-700"
          data-testid="shop-replenishment-slice-storage-unavailable"
        >
          PG недоступен
        </Badge>
      ) : null}
    </aside>
  );
}
