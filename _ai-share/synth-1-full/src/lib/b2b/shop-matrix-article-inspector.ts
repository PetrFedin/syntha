import type { ShopMatrixArticleInspectorView } from '@/lib/b2b/shop-matrix-article-inspector.types';

export type {
  ShopMatrixArticleInspectorView,
  ShopMatrixArticleFabricLine,
} from '@/lib/b2b/shop-matrix-article-inspector.types';

export async function fetchShopMatrixArticleInspectorView(input: {
  collectionId: string;
  articleId: string;
}): Promise<
  | { ok: true; view: ShopMatrixArticleInspectorView }
  | {
      ok: false;
      messageRu: string;
      code?: 'factory_pack_gate_blocked';
      releaseGate?: {
        sheetsReady: number;
        sheetsTotal: number;
        qtyBridged: boolean;
        blockersRu: string[];
        brandFactoryPackHref: string;
        brandReleaseGateHref: string;
      };
    }
> {
  const collectionId = input.collectionId.trim();
  const articleId = input.articleId.trim();
  if (!collectionId || !articleId) {
    return { ok: false, messageRu: 'Выберите артикул в матрице.' };
  }

  const res = await fetch(
    `/api/shop/b2b/matrix/article-inspector?collectionId=${encodeURIComponent(collectionId)}&articleId=${encodeURIComponent(articleId)}`,
    { cache: 'no-store' }
  );
  const json = (await res.json()) as {
    ok?: boolean;
    view?: ShopMatrixArticleInspectorView;
    messageRu?: string;
    code?: 'factory_pack_gate_blocked';
    releaseGate?: {
      sheetsReady: number;
      sheetsTotal: number;
      qtyBridged: boolean;
      blockersRu: string[];
      brandFactoryPackHref: string;
      brandReleaseGateHref: string;
    };
  };

  if (!res.ok || !json.ok || !json.view) {
    return {
      ok: false,
      messageRu: json.messageRu ?? 'Inspector недоступен.',
      code: json.code,
      releaseGate: json.releaseGate,
    };
  }
  return { ok: true, view: json.view };
}
