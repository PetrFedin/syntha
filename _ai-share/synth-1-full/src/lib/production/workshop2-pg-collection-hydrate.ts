'use client';

import {
  mergeWorkshop2HubDossierMapFromApi,
  type Workshop2HubArticleRef,
} from '@/lib/production/workshop2-hub-dossier-map';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import {
  emptyLocalCollectionInventory,
  type LocalCollectionInventory,
  type LocalOrderLine,
} from '@/lib/production/local-collection-inventory';
import { workshop2MergedItemsForCollectionList } from '@/lib/production/workshop2-articles';
import type { Workshop2PublishedArticlesReadPath } from '@/lib/production/workshop2-pg-source-stats';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  isWorkshop2CorePgReadPathOnly,
  resolveWorkshop2HubPublishedArticlesReadPath,
  shouldMirrorWorkshop2DossierToLocalStorage,
} from '@/lib/production/workshop2-pg-read-path-policy';
import {
  loadWorkshop2Phase1DossierMap,
  setWorkshop2Phase1Dossier,
  workshop2Phase1DossierStorageKey,
} from '@/lib/production/workshop2-phase1-dossier-storage';

export type Workshop2PgPublishedArticleRow = {
  articleId: string;
  sku?: string;
  name?: string;
};

/** GET published-articles для коллекции (showroom / W2 hydrate). */
export async function fetchWorkshop2PublishedArticlesFromApi(
  collectionId: string
): Promise<Workshop2PgPublishedArticleRow[]> {
  const cid = collectionId.trim();
  if (!cid) return [];
  const res = await fetch(
    `/api/workshop2/collections/${encodeURIComponent(cid)}/published-articles`,
    { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
  );
  const json = (await res.json()) as {
    ok?: boolean;
    articles?: { articleId: string; name?: string; sku?: string }[];
  };
  if (!res.ok || !json.ok || !Array.isArray(json.articles)) return [];
  return json.articles
    .map((a) => ({
      articleId: a.articleId.trim(),
      sku: a.sku?.trim(),
      name: a.name?.trim(),
    }))
    .filter((a) => a.articleId.length > 0);
}

/** Загружает досье опубликованных артикулов из PG API в localStorage (overlay). */
export async function hydrateWorkshop2PublishedDossiersFromApi(
  collectionId: string,
  articleIds: readonly string[]
): Promise<{ dossiersHydrated: number }> {
  const cid = collectionId.trim();
  const unique = [...new Set(articleIds.map((id) => id.trim()).filter(Boolean))];
  if (!cid || !unique.length) return { dossiersHydrated: 0 };

  const refs: Workshop2HubArticleRef[] = unique.map((articleId) => ({
    collectionId: cid,
    articleId,
  }));
  const local = loadWorkshop2Phase1DossierMap();
  const { map } = await mergeWorkshop2HubDossierMapFromApi(local, refs);

  let dossiersHydrated = 0;
  for (const { articleId } of refs) {
    const key = workshop2Phase1DossierStorageKey(cid, articleId);
    const dossier = map[key];
    if (!dossier?.hubPgOverlayAt) continue;
    if (!shouldMirrorWorkshop2DossierToLocalStorage(cid)) {
      dossiersHydrated += 1;
      continue;
    }
    if (setWorkshop2Phase1Dossier(cid, articleId, dossier)) {
      dossiersHydrated += 1;
    }
  }
  return { dossiersHydrated };
}

/** Опубликованные артикулы из localStorage overlay (канонические id, не local-*). */
export function listWorkshop2PublishedArticlesFromLocalOverlay(
  inv: LocalCollectionInventory,
  collectionId: string,
  seedLines: unknown[]
): Workshop2PgPublishedArticleRow[] {
  const merged = workshop2MergedItemsForCollectionList(collectionId, inv, seedLines);
  const rows: Workshop2PgPublishedArticleRow[] = [];
  for (const item of merged) {
    const line = item as LocalOrderLine & { id?: string; sku?: string; name?: string };
    const articleId = String(line.id ?? '').trim();
    if (!articleId || articleId.startsWith('local-')) continue;
    rows.push({
      articleId,
      sku: line.sku?.trim(),
      name: line.name?.trim(),
    });
  }
  return rows;
}

/** W2 hub: при PG предпочитаем API, иначе localStorage overlay. */
export async function resolveWorkshop2PublishedArticlesForHub(input: {
  collectionId: string;
  preferApi: boolean;
  localInventory: LocalCollectionInventory;
  seedLines: unknown[];
}): Promise<{
  articles: Workshop2PgPublishedArticleRow[];
  readPath: Workshop2PublishedArticlesReadPath;
}> {
  const cid = input.collectionId.trim();
  if (!cid) {
    return { articles: [], readPath: isPlatformCoreMode() ? 'api' : 'localStorage' };
  }
  const readPath = resolveWorkshop2HubPublishedArticlesReadPath({
    collectionId: cid,
    preferApi: input.preferApi,
  });
  if (readPath === 'api') {
    const articles = input.preferApi
      ? await fetchWorkshop2PublishedArticlesFromApi(cid)
      : isWorkshop2CorePgReadPathOnly(cid)
        ? []
        : await fetchWorkshop2PublishedArticlesFromApi(cid);
    return { articles, readPath: 'api' };
  }
  return {
    articles: listWorkshop2PublishedArticlesFromLocalOverlay(
      input.localInventory,
      cid,
      input.seedLines
    ),
    readPath: 'localStorage',
  };
}

/** Состав + досье из PG для golden-path коллекций (FW27 и др.). */
export async function hydrateWorkshop2PlatformCoreCollectionFromPg(
  collectionId: string,
  options?: {
    preferApi?: boolean;
    localInventory?: LocalCollectionInventory;
    seedLines?: unknown[];
  }
): Promise<{
  articles: Workshop2PgPublishedArticleRow[];
  dossiersHydrated: number;
  readPath: Workshop2PublishedArticlesReadPath;
}> {
  const preferApi = options?.preferApi !== false;
  const { articles, readPath } = await resolveWorkshop2PublishedArticlesForHub({
    collectionId,
    preferApi,
    localInventory: options?.localInventory ?? emptyLocalCollectionInventory(),
    seedLines: options?.seedLines ?? [],
  });
  const articleIds = articles.map((row) => row.articleId);
  const { dossiersHydrated } = await hydrateWorkshop2PublishedDossiersFromApi(
    collectionId,
    articleIds
  );
  return { articles, dossiersHydrated, readPath };
}
