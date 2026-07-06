import { shopB2bCheckoutCollectionHref } from '@/lib/routes';

/** Wave XT — PG matrix draft autosave debounce (shop CO matrix 2.2). */
export const SHOP_MATRIX_DRAFT_AUTOSAVE_DEBOUNCE_MS = 800;

export const SHOP_MATRIX_DRAFT_AUTOSAVE_API_PATH = '/api/shop/b2b/matrix/draft' as const;

export const SHOP_MATRIX_DRAFT_CONFLICT_BANNER_TESTID =
  'shop-co-matrix-draft-conflict-banner' as const;
export const SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_LINK_TESTID =
  'shop-co-matrix-draft-autosave-fail-link' as const;
export const SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_CHECKOUT_TESTID =
  'shop-co-checkout-draft-autosave-fail-hint' as const;
export const SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_MATRIX_LINK_TESTID =
  'shop-co-checkout-draft-autosave-matrix-link' as const;

export const SHOP_MATRIX_DRAFT_CONFLICT_HINT_RU =
  'Конфликт черновика — другая вкладка или сессия обновила матрицу позже. Обновите экран или примите версию с сервера.';

export const SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_HINT_RU =
  'Не удалось сохранить черновик матрицы в PG — данные на checkout могут отличаться.';

export const SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_CHECKOUT_LINK_RU =
  'Проверить корзину на checkout';

export const SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_MATRIX_LINK_RU =
  'Вернуться в матрицу и пересохранить';

export const SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_SESSION_KEY =
  'syntha_shop_matrix_draft_autosave_fail' as const;

export type ShopMatrixDraftAutosaveOutcome =
  | 'saved'
  | 'conflict'
  | 'error'
  | 'validation';

export function isShopMatrixDraftUpdatedAtConflict(
  expectedUpdatedAt: string | undefined,
  serverUpdatedAt: string | Date | undefined
): boolean {
  const expected = expectedUpdatedAt?.trim();
  if (!expected || !serverUpdatedAt) return false;
  const expMs = Date.parse(expected);
  const srvMs =
    serverUpdatedAt instanceof Date
      ? serverUpdatedAt.getTime()
      : Date.parse(String(serverUpdatedAt));
  if (!Number.isFinite(expMs) || !Number.isFinite(srvMs)) return false;
  return srvMs > expMs;
}

export function resolveShopMatrixDraftAutosaveOutcome(input: {
  ok: boolean;
  conflict?: boolean;
  validationOk?: boolean;
}): ShopMatrixDraftAutosaveOutcome {
  if (input.conflict) return 'conflict';
  if (!input.ok) return 'error';
  if (input.validationOk === false) return 'validation';
  return 'saved';
}

export function shopMatrixDraftAutosaveFailCheckoutHref(
  collectionId: string,
  sessionId?: string
): string {
  const base = shopB2bCheckoutCollectionHref(collectionId);
  if (!sessionId?.trim()) return base;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}cartSession=${encodeURIComponent(sessionId.trim())}&draftAutosaveFail=1`;
}

export function shopMatrixDraftAutosaveFailMatrixHref(
  collectionId: string,
  articleId?: string
): string {
  const params = new URLSearchParams({ collection: collectionId.trim() });
  if (articleId?.trim()) params.set('article', articleId.trim());
  params.set('draftAutosaveFail', '1');
  return `/shop/b2b/matrix?${params.toString()}`;
}

export function markShopMatrixDraftAutosaveFail(sessionId: string): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_SESSION_KEY, sessionId.trim());
}

export function clearShopMatrixDraftAutosaveFail(sessionId?: string): void {
  if (typeof sessionStorage === 'undefined') return;
  if (!sessionId?.trim()) {
    sessionStorage.removeItem(SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_SESSION_KEY);
    return;
  }
  const current = sessionStorage.getItem(SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_SESSION_KEY);
  if (current === sessionId.trim()) {
    sessionStorage.removeItem(SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_SESSION_KEY);
  }
}

export function readShopMatrixDraftAutosaveFailSession(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  const value = sessionStorage.getItem(SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_SESSION_KEY);
  return value?.trim() || null;
}

export function mergeShopMatrixDraftValidationHintsRu(
  draftHints: string[],
  sizeRunMessageRu?: string | null
): string[] {
  const merged = [...draftHints];
  const sizeRunHint = sizeRunMessageRu?.trim();
  if (sizeRunHint && !merged.includes(sizeRunHint)) {
    merged.push(sizeRunHint);
  }
  return [...new Set(merged)];
}
