'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { ShopShowroomCoverHeroSource } from '@/lib/b2b/shop-showroom-cover-hero';
import {
  SHOP_SHOWROOM_PARTNER_LOGO_DOSSIER_FALLBACK_RU,
  SHOP_SHOWROOM_PARTNER_LOGO_PG_RU,
} from '@/lib/b2b/shop-showroom-eligible-for-matrix';
import {
  resolveShopShowroomPartnerLogoBadgeKind,
  SHOP_SHOWROOM_PARTNER_LOGO_SOURCE_CATALOG_FALLBACK_TESTID,
  SHOP_SHOWROOM_PARTNER_LOGO_SOURCE_DOSSIER_FALLBACK_TESTID,
  SHOP_SHOWROOM_PARTNER_LOGO_SOURCE_PG_TESTID,
} from '@/lib/b2b/shop-showroom-wave-xh';

type Props = {
  partnerName?: string | null;
  partnerLogoUrl?: string | null;
  partnersSource?: 'pg' | 'fallback' | 'loading' | 'error' | string;
  dossierHeroUsed?: boolean;
  coverHeroSource?: ShopShowroomCoverHeroSource | null;
};

/** Wave XH — partner logo PG read vs dossier fallback badge honesty on shop showroom. */
export function ShopShowroomPartnerLogoSourceBadge({
  partnerName,
  partnerLogoUrl,
  partnersSource,
  dossierHeroUsed = false,
  coverHeroSource,
}: Props) {
  const logoUrl = partnerLogoUrl?.trim();
  const badgeKind = resolveShopShowroomPartnerLogoBadgeKind({
    partnerLogoUrl,
    partnersSource,
    coverHeroSource,
    dossierHeroUsed,
  });

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-testid="shop-sc-showroom-partner-logo-row"
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt=""
          width={20}
          height={20}
          className="rounded-full border object-cover"
          data-testid="shop-sc-showroom-partner-logo"
          data-audit-legacy="shop-showroom-partner-logo"
        />
      ) : null}
      {partnerName?.trim() ? (
        <span className="text-text-secondary min-w-0 truncate text-[10px] font-semibold">
          {partnerName}
        </span>
      ) : null}
      {badgeKind === 'pg' ? (
        <Badge
          variant="outline"
          className="border-emerald-200 bg-emerald-50 text-[9px] text-emerald-900"
          data-testid={SHOP_SHOWROOM_PARTNER_LOGO_SOURCE_PG_TESTID}
        >
          {SHOP_SHOWROOM_PARTNER_LOGO_PG_RU}
        </Badge>
      ) : badgeKind === 'dossier-fallback' ? (
        <Badge
          variant="outline"
          className="border-amber-200 bg-amber-50 text-[9px] text-amber-900"
          data-testid={SHOP_SHOWROOM_PARTNER_LOGO_SOURCE_DOSSIER_FALLBACK_TESTID}
        >
          {SHOP_SHOWROOM_PARTNER_LOGO_DOSSIER_FALLBACK_RU}
        </Badge>
      ) : badgeKind === 'catalog-fallback' ? (
        <Badge
          variant="outline"
          className="border-amber-200 bg-amber-50 text-[9px] text-amber-900"
          data-testid={SHOP_SHOWROOM_PARTNER_LOGO_SOURCE_CATALOG_FALLBACK_TESTID}
        >
          Лого · каталог (без PG)
        </Badge>
      ) : null}
    </div>
  );
}
