/** Wave UN · live dossier factory diff (client-safe API contract). */

import type { BrandDossierFactoryDiffRow } from '@/lib/fashion/brand-dossier-factory-diff-stub';

export const BRAND_DOSSIER_FACTORY_DIFF_API_PATH =
  '/api/brand/workshop2/dossier-factory-diff' as const;

export type BrandDossierFactoryDiffSnapshot = {
  ok: boolean;
  live: boolean;
  collectionId: string;
  articleId: string;
  dossierVersion?: number;
  summaryRu: string;
  rows: BrandDossierFactoryDiffRow[];
  storageMode?: 'pg' | 'file' | 'stub';
};

export function brandDossierFactoryDiffApiPath(collectionId: string, articleId: string): string {
  const params = new URLSearchParams({
    collectionId: collectionId.trim(),
    articleId: articleId.trim(),
  });
  return `${BRAND_DOSSIER_FACTORY_DIFF_API_PATH}?${params.toString()}`;
}
