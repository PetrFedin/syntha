import type { Product } from '@/lib/types';

export type Workshop2PublishedMatrixArticle = {
  collectionId: string;
  articleId: string;
  name: string;
  sku?: string;
  wholesalePriceRub: number;
  msrpRub?: number;
  moq?: number;
  campaignName?: string;
  heroImageUrl?: string;
};

/** Локальный fallback, если в W2 досье нет vault/sketch preview. */
export const WORKSHOP2_B2B_MATRIX_FALLBACK_IMAGE = '/images/hero.svg';

/** Маппинг W2 published → строки WholesaleOrderMatrix (id = articleId для cart bridge). */
export function mapWorkshop2ArticlesToMatrixProducts(
  articles: Workshop2PublishedMatrixArticle[],
  collectionId: string
): Product[] {
  return articles.map((a) => {
    const id = a.articleId.trim();
    const sku = a.sku?.trim() || id;
    const name = a.name?.trim() || a.campaignName?.trim() || id;
    const imageUrl = a.heroImageUrl?.trim() || WORKSHOP2_B2B_MATRIX_FALLBACK_IMAGE;
    return {
      id,
      slug: id,
      name,
      brand: 'Syntha',
      price: a.wholesalePriceRub,
      originalPrice: a.msrpRub,
      description: `Workshop2 · ${collectionId} · ${id}`,
      images: [
        {
          id: `${id}-cover`,
          url: imageUrl,
          alt: name,
          hint: 'w2 matrix',
          isCover: true,
        },
      ],
      category: 'SS27 / W2',
      sustainability: [],
      outlet: false,
      hasAR: false,
      sku,
      color: 'Core',
      season: collectionId,
      tags: ['workshop2', 'b2b-matrix'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((name) => ({ name })),
      ...(a.moq != null ? { moq: a.moq } : {}),
    } as unknown as Product;
  });
}

export async function fetchWorkshop2MatrixProducts(collectionId: string): Promise<Product[]> {
  const cid = collectionId.trim();
  if (!cid) return [];
  const res = await fetch(
    `/api/workshop2/collections/${encodeURIComponent(cid)}/published-articles`
  );
  const json = (await res.json()) as {
    ok?: boolean;
    articles?: Workshop2PublishedMatrixArticle[];
  };
  if (!res.ok || !json.ok || !Array.isArray(json.articles) || json.articles.length === 0) {
    return [];
  }
  return mapWorkshop2ArticlesToMatrixProducts(json.articles, cid);
}
