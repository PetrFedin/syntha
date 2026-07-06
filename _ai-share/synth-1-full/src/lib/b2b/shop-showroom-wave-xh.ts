/** Wave XH · Shop SC showroom — partner logo PG honesty, eligible filter polish, hero dedupe. */

import type { ShopShowroomCoverHeroSource } from '@/lib/b2b/shop-showroom-cover-hero';
import {
  SHOP_SHOWROOM_ELIGIBLE_FILTER_LABEL_RU,
  shopShowroomEligibleForMatrixApiPath,
} from '@/lib/b2b/shop-showroom-eligible-for-matrix';

export type ShopShowroomPartnerLogoBadgeKind =
  | 'pg'
  | 'dossier-fallback'
  | 'catalog-fallback'
  | null;

export const SHOP_SHOWROOM_PARTNER_LOGO_SOURCE_PG_TESTID =
  'shop-sc-showroom-partner-logo-source-pg';

export const SHOP_SHOWROOM_PARTNER_LOGO_SOURCE_DOSSIER_FALLBACK_TESTID =
  'shop-sc-showroom-partner-logo-source-dossier-fallback';

export const SHOP_SHOWROOM_PARTNER_LOGO_SOURCE_CATALOG_FALLBACK_TESTID =
  'shop-sc-showroom-partner-logo-source-catalog-fallback';

export const SHOP_SHOWROOM_ELIGIBLE_FILTER_COUNTS_TESTID =
  'shop-sc-showroom-eligible-filter-counts';

/** Partner logo row badge — PG read vs dossier hero fallback (RU badges in eligible-for-matrix module). */
export function resolveShopShowroomPartnerLogoBadgeKind(input: {
  partnerLogoUrl?: string | null;
  partnersSource?: 'pg' | 'fallback' | 'loading' | 'error' | string | null;
  coverHeroSource?: ShopShowroomCoverHeroSource | null;
  dossierHeroUsed?: boolean;
}): ShopShowroomPartnerLogoBadgeKind {
  const logoUrl = input.partnerLogoUrl?.trim();
  const dossierWins =
    input.dossierHeroUsed === true || input.coverHeroSource === 'dossier';

  if (dossierWins) return 'dossier-fallback';
  if (!logoUrl && input.partnersSource === 'fallback') return 'catalog-fallback';
  if (logoUrl && input.partnersSource === 'pg') return 'pg';
  if (logoUrl) return 'dossier-fallback';
  return null;
}

/** Wave VC alignment — hide priority strip when cover hero strip already shows dossier badge. */
export function shouldShowShopShowroomCoverHeroPriorityStrip(
  activeSource?: ShopShowroomCoverHeroSource | null
): boolean {
  return activeSource != null && activeSource !== 'dossier';
}

export function buildShopShowroomEligibleFilterApiUrl(
  collectionId: string,
  buyerId?: string,
  opts?: { eligibleOnly?: boolean }
): string {
  const base = shopShowroomEligibleForMatrixApiPath(collectionId, buyerId);
  if (opts?.eligibleOnly) return `${base}&eligibleOnly=1`;
  return base;
}

export function shopShowroomEligibleFilterToggleLabel(input: {
  published?: number;
  eligible?: number;
  filterActive?: boolean;
}): string {
  const { published, eligible, filterActive } = input;
  if (published != null && eligible != null) {
    const suffix = filterActive ? ` · ${eligible}/${published}` : ` (${eligible}/${published})`;
    return `${SHOP_SHOWROOM_ELIGIBLE_FILTER_LABEL_RU}${suffix}`;
  }
  if (eligible != null) {
    return `${SHOP_SHOWROOM_ELIGIBLE_FILTER_LABEL_RU} (${eligible})`;
  }
  return SHOP_SHOWROOM_ELIGIBLE_FILTER_LABEL_RU;
}

export function shopShowroomEligibleFilterHintVisible(filterActive: boolean): boolean {
  return filterActive;
}
