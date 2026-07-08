import 'server-only';

import { computeWorkshop2BomCostingRollup } from '@/lib/production/workshop2-bom-costing';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { getWorkshop2ServerDossierRecord } from '@/lib/platform-core-ports/dossier-store';

export type PlatformCoreBomCostingSnapshot = {
  collectionId: string;
  articleId: string;
  version: number;
  updatedAt: string;
  storeMode: ReturnType<
    typeof import('@/lib/platform-core-ports/dossier-store').getWorkshop2ServerDossierStoreMode
  >;
  rollup: ReturnType<typeof computeWorkshop2BomCostingRollup>;
  lineCount: number;
  completenessPct: number;
};

export type PlatformCoreBomCostingArticleResult =
  | { ok: true; costing: PlatformCoreBomCostingSnapshot }
  | {
      ok: false;
      reason: 'invalid_path' | 'not_found';
      collectionId?: string;
      articleId?: string;
    };

function completenessPct(dossier: Workshop2DossierPhase1): number {
  const model = dossier.productionModel;
  const materialCount = model?.materialLines?.length ?? 0;
  const trimCount = model?.trimLines?.length ?? 0;
  const opCount = model?.operations?.length ?? 0;
  const total = materialCount + trimCount + opCount;
  if (total === 0) return 0;
  const priced =
    (model?.materialLines?.filter((l) => (l.landedCost ?? l.unitCostNet ?? 0) > 0).length ?? 0) +
    (model?.trimLines?.filter((l) => (l.unitCostNet ?? 0) > 0).length ?? 0) +
    (model?.operations?.filter((l) => (l.costPerUnit ?? 0) > 0).length ?? 0);
  return Math.round((priced / total) * 100);
}

export async function getPlatformCoreBomCostingForArticle(input: {
  collectionId: string;
  articleId: string;
}): Promise<PlatformCoreBomCostingArticleResult> {
  const collectionId = input.collectionId?.trim();
  const articleId = input.articleId?.trim();
  if (!collectionId || !articleId) {
    return { ok: false, reason: 'invalid_path', collectionId, articleId };
  }

  const record = await getWorkshop2ServerDossierRecord(collectionId, articleId);
  if (!record?.dossier) {
    return { ok: false, reason: 'not_found', collectionId, articleId };
  }

  const dossier = record.dossier as Workshop2DossierPhase1;
  const rollup = computeWorkshop2BomCostingRollup(dossier);
  const lineCount = rollup.lineCosts.length;

  const { getWorkshop2ServerDossierStoreMode } =
    await import('@/lib/platform-core-ports/dossier-store');

  return {
    ok: true,
    costing: {
      collectionId,
      articleId,
      version: record.version ?? 0,
      updatedAt: record.updatedAt ?? new Date().toISOString(),
      storeMode: getWorkshop2ServerDossierStoreMode(),
      rollup,
      lineCount,
      completenessPct: completenessPct(dossier),
    },
  };
}
