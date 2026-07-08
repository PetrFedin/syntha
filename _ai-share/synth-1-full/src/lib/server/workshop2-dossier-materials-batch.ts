import 'server-only';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import {
  extractWorkshop2DossierMaterialPreviews,
  type Workshop2DossierMaterialPreview,
} from '@/lib/production/workshop2-dossier-material-preview';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

export type Workshop2DossierMaterialsBatchItemResult = {
  articleId: string;
  materialNames: string[];
  materials: Workshop2DossierMaterialPreview[];
};

export function extractWorkshop2DossierMaterialNames(
  dossier: Workshop2DossierPhase1 | null | undefined,
  limit?: number
): string[] {
  return extractWorkshop2DossierMaterialPreviews(dossier, limit).map((m) => m.name);
}

function previewsForDossier(
  dossier: Workshop2DossierPhase1 | null | undefined,
  limitPerArticle: number
): Workshop2DossierMaterialPreview[] {
  return extractWorkshop2DossierMaterialPreviews(dossier, limitPerArticle);
}

async function batchWorkshop2DossierMaterialNamesFromPg(
  collectionId: string,
  articleIds: string[],
  limitPerArticle: number
): Promise<Workshop2DossierMaterialsBatchItemResult[]> {
  const res = await getWorkshop2PgPool().query<{
    article_id: string;
    dossier_json: Workshop2DossierPhase1;
  }>(
    `SELECT article_id, dossier_json
     FROM workshop2_dossiers
     WHERE collection_id = $1 AND article_id = ANY($2::text[])`,
    [collectionId, articleIds]
  );
  const byArticle = new Map(
    res.rows.map((row) => [row.article_id, previewsForDossier(row.dossier_json, limitPerArticle)])
  );
  return articleIds.map((articleId) => {
    const materials = byArticle.get(articleId) ?? [];
    return {
      articleId,
      materials,
      materialNames: materials.map((m) => m.name),
    };
  });
}

/** BOM material names for many articles — one PG round-trip when Postgres is enabled. */
export async function batchWorkshop2DossierMaterialNames(input: {
  collectionId: string;
  articleIds: string[];
  limitPerArticle?: number;
}): Promise<Workshop2DossierMaterialsBatchItemResult[]> {
  const collectionId = input.collectionId.trim();
  const unique = [...new Set(input.articleIds.map((id) => id.trim()).filter(Boolean))].slice(
    0,
    200
  );
  const limitPerArticle = input.limitPerArticle ?? 4;
  if (!collectionId || !unique.length) return [];

  if (isWorkshop2PostgresEnabled()) {
    return batchWorkshop2DossierMaterialNamesFromPg(collectionId, unique, limitPerArticle);
  }

  const out: Workshop2DossierMaterialsBatchItemResult[] = [];
  for (const articleId of unique) {
    const record = await getWorkshop2ServerDossierRecord(collectionId, articleId);
    const materials = previewsForDossier(record?.dossier ?? null, limitPerArticle);
    out.push({
      articleId,
      materials,
      materialNames: materials.map((m) => m.name),
    });
  }
  return out;
}
