import 'server-only';

import { resolveEligibleForCollection } from '@/lib/integrations/spine/eligible-gate';
import type { ShopShowroomEligibleForMatrixArticle } from '@/lib/b2b/shop-showroom-eligible-for-matrix';
import { SHOP_SHOWROOM_ELIGIBLE_FILTER_HINT_RU } from '@/lib/b2b/shop-showroom-eligible-for-matrix';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';
import {
  listWorkshop2PublishedShowroomArticles,
  type Workshop2PublishedShowroomArticle,
} from '@/lib/server/workshop2-showroom-repository';
import {
  appendShopShowroomEligibleForMatrixJournal,
  shopShowroomEligibleForMatrixStorageMode,
} from '@/lib/server/shop-showroom-eligible-for-matrix-repository';

function mapPublishedArticle(
  article: Workshop2PublishedShowroomArticle,
  gate: ReturnType<typeof resolveEligibleForCollection>
): ShopShowroomEligibleForMatrixArticle {
  return {
    collectionId: article.collectionId,
    articleId: article.articleId,
    name: article.name,
    wholesalePriceRub: article.wholesalePriceRub,
    moq: article.moq,
    heroImageUrl: article.heroImageUrl,
    eligibleForMatrix: gate.eligibleForCollection,
    eligibleSources: gate.sources,
    eligibleReasonsRu: gate.reasons.map((reason) =>
      reason.replace(
        'No signoff, Centric approval, or handoff lifecycle',
        'Нет signoff / Centric / handoff'
      )
    ),
  };
}

/** Wave TL — published articles filtered by F-ELIGIBLE gate for shop matrix. */
export async function getShopShowroomEligibleForMatrixServer(input: {
  buyerId: string;
  collectionId: string;
  eligibleOnly?: boolean;
}): Promise<{
  buyerId: string;
  collectionId: string;
  publishedCount: number;
  eligibleCount: number;
  articles: ShopShowroomEligibleForMatrixArticle[];
  articleIds: string[];
  skus: Array<{ articleId: string; sku: string; name?: string }>;
  storageMode: string;
  filterActive: boolean;
  messageRu: string;
}> {
  const collectionId = input.collectionId.trim();
  const buyerId = input.buyerId.trim() || 'shop1';
  const published = await listWorkshop2PublishedShowroomArticles(collectionId);

  const mapped: ShopShowroomEligibleForMatrixArticle[] = [];
  for (const article of published) {
    let dossier = null;
    try {
      const record = await getWorkshop2ServerDossierRecord(collectionId, article.articleId);
      dossier = record?.dossier ?? null;
    } catch {
      dossier = null;
    }
    const gate = resolveEligibleForCollection({
      collectionId,
      articleId: article.articleId,
      dossier,
    });
    mapped.push(mapPublishedArticle(article, gate));
  }

  const eligible = mapped.filter((row) => row.eligibleForMatrix);
  const filterActive = Boolean(input.eligibleOnly);
  const articles = filterActive ? eligible : mapped;
  const storageMode = shopShowroomEligibleForMatrixStorageMode();

  await appendShopShowroomEligibleForMatrixJournal({
    buyerId,
    collectionId,
    publishedCount: published.length,
    eligibleCount: eligible.length,
    filterActive,
  });

  return {
    buyerId,
    collectionId,
    publishedCount: published.length,
    eligibleCount: eligible.length,
    articles,
    articleIds: articles.map((a) => a.articleId),
    skus: articles.map((a) => ({
      articleId: a.articleId,
      sku: a.articleId,
      name: a.name,
    })),
    storageMode,
    filterActive,
    messageRu:
      eligible.length > 0
        ? SHOP_SHOWROOM_ELIGIBLE_FILTER_HINT_RU
        : 'Eligible-фильтр: опубликованные артикулы без signoff пока недоступны в матрице.',
  };
}

/** @deprecated use getShopShowroomEligibleForMatrixServer */
export async function listShopShowroomEligibleForMatrix(input: {
  collectionId: string;
  buyerId?: string;
  eligibleOnly?: boolean;
}) {
  return getShopShowroomEligibleForMatrixServer({
    buyerId: input.buyerId ?? 'shop1',
    collectionId: input.collectionId,
    eligibleOnly: input.eligibleOnly,
  });
}
