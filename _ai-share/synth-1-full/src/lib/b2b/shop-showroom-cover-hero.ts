import { WORKSHOP2_B2B_MATRIX_FALLBACK_IMAGE } from '@/lib/b2b/workshop2-b2b-matrix-catalog';

export type ShopShowroomCoverHeroSource = 'dossier' | 'partner-cover' | 'partner-logo' | 'fallback';

export type ShopShowroomCoverHero = {
  url: string;
  source: ShopShowroomCoverHeroSource;
  labelRu: string;
};

const SOURCE_LABEL: Record<ShopShowroomCoverHeroSource, string> = {
  dossier: 'Hero · dossier PG',
  'partner-cover': 'Hero · обложка партнёра',
  'partner-logo': 'Hero · лого партнёра',
  fallback: 'Hero · заглушка',
};

/** Dossier/published hero wins over partner stub (Platform Core cover hero policy). */
export function resolveShopShowroomCoverHero(input: {
  dossierHeroUrl?: string | null;
  partnerCoverUrl?: string | null;
  partnerLogoUrl?: string | null;
  fallbackUrl?: string;
}): ShopShowroomCoverHero | null {
  const dossier = input.dossierHeroUrl?.trim();
  if (dossier) {
    return { url: dossier, source: 'dossier', labelRu: SOURCE_LABEL.dossier };
  }
  const cover = input.partnerCoverUrl?.trim();
  if (cover) {
    return { url: cover, source: 'partner-cover', labelRu: SOURCE_LABEL['partner-cover'] };
  }
  const logo = input.partnerLogoUrl?.trim();
  if (logo) {
    return { url: logo, source: 'partner-logo', labelRu: SOURCE_LABEL['partner-logo'] };
  }
  const fallback = (input.fallbackUrl ?? WORKSHOP2_B2B_MATRIX_FALLBACK_IMAGE).trim();
  if (fallback) {
    return { url: fallback, source: 'fallback', labelRu: SOURCE_LABEL.fallback };
  }
  return null;
}
