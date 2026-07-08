import type { CartItem, Product } from '@/lib/types';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import type {
  ShopB2bMatrixDraftDoc,
  ShopB2bMatrixDraftLine,
} from '@/lib/server/shop-b2b-matrix-draft-repository';
import {
  clearShopMatrixDraftAutosaveFail,
  markShopMatrixDraftAutosaveFail,
  type ShopMatrixDraftAutosaveOutcome,
} from '@/lib/b2b/shop-matrix-draft-autosave-wave-xt';
import {
  mapLegacyB2bCartLine,
  mapWorkshop2CartLinesToCartItems,
  type Workshop2CartSessionLine,
} from '@/lib/b2b/workshop2-cart-bridge';

export function buildMatrixDraftDocFromCart(input: {
  collectionId: string;
  items: CartItem[];
}): ShopB2bMatrixDraftDoc {
  const lines = input.items
    .filter((item) => (item.quantity ?? 0) > 0)
    .map((item) => {
      const mapped = mapLegacyB2bCartLine(item, input.collectionId);
      return {
        articleId: mapped.articleId,
        colorCode: mapped.colorCode,
        size: mapped.size,
        qty: mapped.qty,
      };
    });
  return {
    v: 1,
    collectionId: input.collectionId.trim(),
    lines,
    updatedAt: new Date().toISOString(),
  };
}

/** PG draft lines → CartItem[] (core hydrate when cart session empty). */
export function mapMatrixDraftDocToCartItems(
  draft: ShopB2bMatrixDraftDoc,
  products: Product[],
  collectionId: string
): CartItem[] {
  const lines: Workshop2CartSessionLine[] = draft.lines.map((line: ShopB2bMatrixDraftLine) => ({
    collectionId: draft.collectionId.trim() || collectionId,
    articleId: line.articleId,
    colorCode: line.colorCode,
    size: line.size,
    qty: line.qty,
  }));
  return mapWorkshop2CartLinesToCartItems(lines, products, collectionId);
}

export async function hydrateShopMatrixDraftFromServer(input: {
  sessionId: string;
  collectionId: string;
  products: Product[];
}): Promise<{ items: CartItem[]; storageMode: 'pg' | null; updatedAt?: string }> {
  const draft = await fetchShopMatrixDraftFromServer({ sessionId: input.sessionId });
  if (!draft.draft?.lines.length) return { items: [], storageMode: null };
  const collKey = input.collectionId.trim().toUpperCase();
  if (draft.draft.collectionId.trim().toUpperCase() !== collKey) {
    return { items: [], storageMode: null };
  }
  return {
    items: mapMatrixDraftDocToCartItems(draft.draft, input.products, input.collectionId),
    storageMode: 'pg',
    updatedAt: draft.updatedAt,
  };
}

export async function persistShopMatrixDraftToServer(input: {
  sessionId: string;
  buyerId: string;
  collectionId: string;
  items: CartItem[];
  expectedUpdatedAt?: string;
}): Promise<{
  mode: 'pg' | 'local' | 'error' | 'conflict';
  outcome?: ShopMatrixDraftAutosaveOutcome;
  validationHintsRu?: string[];
  validationOk?: boolean;
  sizeRunOk?: boolean;
  sizeRunMessageRu?: string;
  messageRu?: string;
  updatedAt?: string;
  serverDraft?: ShopB2bMatrixDraftDoc | null;
  serverUpdatedAt?: string;
}> {
  const sessionId = input.sessionId.trim();
  if (!sessionId) return { mode: 'error', outcome: 'error' };
  try {
    const draft = buildMatrixDraftDocFromCart(input);
    const res = await fetch('/api/shop/b2b/matrix/draft', {
      method: 'PUT',
      headers: {
        ...buildWorkshop2ApiRequestHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        buyerId: input.buyerId,
        collectionId: input.collectionId,
        expectedUpdatedAt: input.expectedUpdatedAt,
        draft,
      }),
    });
    const json = (await res.json()) as {
      ok?: boolean;
      conflict?: boolean;
      storageMode?: string;
      validationHintsRu?: string[];
      validationOk?: boolean;
      sizeRunOk?: boolean;
      sizeRunMessageRu?: string;
      messageRu?: string;
      updatedAt?: string;
      serverDraft?: ShopB2bMatrixDraftDoc | null;
      serverUpdatedAt?: string;
    };

    if (res.status === 409 || json.conflict) {
      markShopMatrixDraftAutosaveFail(sessionId);
      return {
        mode: 'conflict',
        outcome: 'conflict',
        messageRu: json.messageRu,
        serverDraft: json.serverDraft ?? null,
        serverUpdatedAt: json.serverUpdatedAt,
      };
    }

    if (!res.ok || json.ok !== true) {
      markShopMatrixDraftAutosaveFail(sessionId);
      return {
        mode: 'error',
        outcome: 'error',
        messageRu: json.messageRu ?? 'Не удалось сохранить черновик.',
      };
    }

    clearShopMatrixDraftAutosaveFail(sessionId);
    const validationOk = json.validationOk !== false && json.sizeRunOk !== false;
    return {
      mode: json.storageMode === 'postgres' ? 'pg' : 'local',
      outcome: validationOk ? 'saved' : 'validation',
      validationHintsRu: json.validationHintsRu,
      validationOk: json.validationOk,
      sizeRunOk: json.sizeRunOk,
      sizeRunMessageRu: json.sizeRunMessageRu,
      messageRu: json.messageRu,
      updatedAt: json.updatedAt ?? draft.updatedAt,
    };
  } catch {
    markShopMatrixDraftAutosaveFail(sessionId);
    return {
      mode: 'error',
      outcome: 'error',
      messageRu: 'Сеть недоступна — черновик не сохранён.',
    };
  }
}

export async function fetchShopMatrixDraftFromServer(input: {
  sessionId: string;
}): Promise<{ draft: ShopB2bMatrixDraftDoc | null; updatedAt?: string }> {
  const sessionId = input.sessionId.trim();
  if (!sessionId) return { draft: null };
  try {
    const res = await fetch(
      `/api/shop/b2b/matrix/draft?sessionId=${encodeURIComponent(sessionId)}`,
      { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
    );
    const json = (await res.json()) as {
      draft?: ShopB2bMatrixDraftDoc | null;
      updatedAt?: string | null;
    };
    if (!res.ok || !json.draft) return { draft: null, updatedAt: json.updatedAt ?? undefined };
    return {
      draft: json.draft,
      updatedAt: json.updatedAt ?? json.draft.updatedAt,
    };
  } catch {
    return { draft: null };
  }
}

export async function validateShopMatrixSizeRunViaApi(input: {
  collectionId: string;
  articleId: string;
  qtyBySize: Record<string, number>;
}): Promise<{ ok: boolean; violations: string[]; messageRu: string }> {
  try {
    const res = await fetch('/api/shop/b2b/matrix/size-run-validate', {
      method: 'POST',
      headers: {
        ...buildWorkshop2ApiRequestHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    const json = (await res.json()) as {
      ok?: boolean;
      violations?: string[];
      messageRu?: string;
    };
    return {
      ok: json.ok === true,
      violations: json.violations ?? [],
      messageRu: json.messageRu ?? 'Не удалось проверить size run.',
    };
  } catch {
    return { ok: false, violations: [], messageRu: 'Сеть недоступна — size run не проверен.' };
  }
}

export async function validateShopMatrixCartSizeRunsViaApi(input: {
  collectionId: string;
  articles: Array<{ articleId: string; qtyBySize: Record<string, number> }>;
}): Promise<{
  ok: boolean;
  messageRu: string;
  firstFailedArticleId?: string;
  results: Array<{ articleId: string; ok: boolean; messageRu: string; violations: string[] }>;
}> {
  try {
    const res = await fetch('/api/shop/b2b/matrix/size-run-validate', {
      method: 'POST',
      headers: {
        ...buildWorkshop2ApiRequestHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    const json = (await res.json()) as {
      ok?: boolean;
      messageRu?: string;
      firstFailedArticleId?: string;
      results?: Array<{
        articleId: string;
        ok?: boolean;
        messageRu?: string;
        violations?: string[];
      }>;
    };
    return {
      ok: json.ok === true,
      messageRu: json.messageRu ?? 'Не удалось проверить size run корзины.',
      firstFailedArticleId: json.firstFailedArticleId,
      results: (json.results ?? []).map((r) => ({
        articleId: r.articleId,
        ok: r.ok === true,
        messageRu: r.messageRu ?? '',
        violations: r.violations ?? [],
      })),
    };
  } catch {
    return {
      ok: false,
      messageRu: 'Сеть недоступна — size run не проверен.',
      results: [],
    };
  }
}
