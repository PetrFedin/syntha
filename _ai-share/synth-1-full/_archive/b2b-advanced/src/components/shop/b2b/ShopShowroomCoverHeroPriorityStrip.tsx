'use client';

import {
  SHOP_SHOWROOM_COVER_HERO_DOSSIER_WINS_RU,
  SHOP_SHOWROOM_COVER_HERO_PRIORITY_RU,
  SHOP_SHOWROOM_COVER_HERO_PRIORITY_STRIP_TESTID,
} from '@/lib/b2b/brand-sc-linesheet-readpath';
import type { ShopShowroomCoverHeroSource } from '@/lib/b2b/shop-showroom-cover-hero';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

type Props = {
  activeSource?: ShopShowroomCoverHeroSource | null;
  className?: string;
};

/** Wave VC — честная политика приоритета cover hero (dossier > partner). */
export function ShopShowroomCoverHeroPriorityStrip({ activeSource, className }: Props) {
  return (
    <p
      className={cn(
        hubGadget.muted,
        'text-[10px] leading-snug',
        className
      )}
      data-testid={SHOP_SHOWROOM_COVER_HERO_PRIORITY_STRIP_TESTID}
      data-runway-hero-priority={activeSource === 'dossier' ? 'dossier-first' : 'partner-fallback'}
    >
      {SHOP_SHOWROOM_COVER_HERO_PRIORITY_RU}
      {activeSource === 'dossier' ? ` · ${SHOP_SHOWROOM_COVER_HERO_DOSSIER_WINS_RU}` : null}
    </p>
  );
}
