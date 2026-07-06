'use client';

import { Badge } from '@/components/ui/badge';
import type { ShopShowroomCoverHero } from '@/lib/platform-core-ports/b2b/shop-showroom-cover-hero';
import { cn } from '@/lib/utils';

type Props = {
  hero: ShopShowroomCoverHero;
  testId?: string;
  className?: string;
  heightClass?: string;
};

/** Collection cover strip — dossier PG hero preferred over partner stub (native platform/showroom). */
export function ShopShowroomCoverHeroStrip({
  hero,
  testId = 'shop-showroom-cover-hero',
  className,
  heightClass = 'h-12 md:h-20',
}: Props) {
  return (
    <div
      className={cn(
        'relative w-full min-w-0 overflow-hidden rounded-lg border border-border-subtle',
        className
      )}
      data-testid={testId}
    >
      <div
        className={cn('bg-bg-surface2 w-full bg-cover bg-center', heightClass)}
        style={{ backgroundImage: `url(${hero.url})` }}
        data-testid={`${testId}-image`}
      />
      <Badge
        variant="outline"
        className="absolute right-2 top-2 border-white/40 bg-black/40 text-[9px] text-white backdrop-blur-sm"
        data-testid={`${testId}-source-${hero.source}`}
      >
        {hero.labelRu}
      </Badge>
    </div>
  );
}
