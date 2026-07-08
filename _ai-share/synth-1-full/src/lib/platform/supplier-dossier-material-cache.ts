import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import {
  formatDossierMaterialPreviewLine,
  type Workshop2DossierMaterialPreview,
} from '@/lib/production/workshop2-dossier-material-preview';

const BATCH_API = '/api/factory/supplier/dossier-materials-batch';

const cache = new Map<string, Promise<Workshop2DossierMaterialPreview[]>>();

function cacheKey(collectionId: string, articleId: string): string {
  return `${collectionId}:${articleId}`;
}

async function loadMaterialPreviewsFromBatchApi(
  collectionId: string,
  articleIds: string[],
  limitPerArticle: number
): Promise<Map<string, Workshop2DossierMaterialPreview[]>> {
  try {
    const res = await fetch(BATCH_API, {
      method: 'POST',
      headers: {
        ...buildWorkshop2ApiRequestHeaders(),
        'content-type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify({ collectionId, articleIds, limitPerArticle }),
    });
    const json = (await res.json()) as {
      ok?: boolean;
      items?: Array<{
        articleId: string;
        materialNames?: string[];
        materials?: Workshop2DossierMaterialPreview[];
      }>;
    };
    if (!json.ok || !Array.isArray(json.items)) {
      return new Map(articleIds.map((id) => [id, []]));
    }
    const map = new Map<string, Workshop2DossierMaterialPreview[]>();
    for (const item of json.items) {
      const materials =
        item.materials ?? (item.materialNames ?? []).map((name) => ({ name, unitLabelRu: 'ед.' }));
      map.set(item.articleId, materials);
    }
    for (const id of articleIds) {
      if (!map.has(id)) map.set(id, []);
    }
    return map;
  } catch {
    return new Map(articleIds.map((id) => [id, []]));
  }
}

/** Cached dossier BOM previews (name + UoM) — batch API + in-flight dedupe per article. */
export async function fetchDossierMaterialPreviews(
  collectionId: string,
  articleId: string,
  limit = 4
): Promise<Workshop2DossierMaterialPreview[]> {
  const map = await fetchDossierMaterialPreviewsBatch(collectionId, [articleId], limit);
  return map.get(articleId) ?? [];
}

/** @deprecated Используйте fetchDossierMaterialPreviews — только имена без UoM. */
export async function fetchDossierMaterialNames(
  collectionId: string,
  articleId: string,
  limit = 4
): Promise<string[]> {
  const previews = await fetchDossierMaterialPreviews(collectionId, articleId, limit);
  return previews.map((p) => formatDossierMaterialPreviewLine(p));
}

export async function fetchDossierMaterialPreviewsBatch(
  collectionId: string,
  articleIds: string[],
  limitPerArticle = 4
): Promise<Map<string, Workshop2DossierMaterialPreview[]>> {
  const unique = [...new Set(articleIds.filter(Boolean))];
  const uncached: string[] = [];
  const result = new Map<string, Workshop2DossierMaterialPreview[]>();

  for (const articleId of unique) {
    const pending = cache.get(cacheKey(collectionId, articleId));
    if (pending) {
      result.set(articleId, await pending);
    } else {
      uncached.push(articleId);
    }
  }

  if (uncached.length) {
    const sharedBatch = loadMaterialPreviewsFromBatchApi(collectionId, uncached, limitPerArticle);
    for (const articleId of uncached) {
      cache.set(
        cacheKey(collectionId, articleId),
        sharedBatch.then((map) => (map.get(articleId) ?? []).slice(0, limitPerArticle))
      );
    }
    const loaded = await sharedBatch;
    for (const articleId of uncached) {
      result.set(articleId, (loaded.get(articleId) ?? []).slice(0, limitPerArticle));
    }
  }

  return result;
}

/** @deprecated Используйте fetchDossierMaterialPreviewsBatch. */
export async function fetchDossierMaterialNamesBatch(
  collectionId: string,
  articleIds: string[],
  limitPerArticle = 4
): Promise<Map<string, string[]>> {
  const previews = await fetchDossierMaterialPreviewsBatch(
    collectionId,
    articleIds,
    limitPerArticle
  );
  const out = new Map<string, string[]>();
  for (const [articleId, rows] of previews) {
    out.set(
      articleId,
      rows.map((p) => formatDossierMaterialPreviewLine(p))
    );
  }
  return out;
}
