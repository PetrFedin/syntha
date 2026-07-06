import type { CartItem, Product } from '@/lib/types';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

function shopB2bCartJsonHeaders(): Record<string, string> {
  return buildWorkshop2ApiRequestHeaders({ 'Content-Type': 'application/json' });
}

export type LegacyCartBridgeLine = {
  collectionId: string;
  articleId: string;
  colorCode: string;
  size: string;
  qty: number;
  wholesalePriceRub?: number;
  deliveryDate?: string;
  lineNote?: string;
};

type CartLineResponse = {
  ok?: boolean;
  session?: { sessionId: string };
  messageRu?: string;
};

type CheckoutResponse = {
  ok?: boolean;
  order?: { id: string };
  messageRu?: string;
};

export type Workshop2CartSessionLine = {
  collectionId: string;
  articleId: string;
  colorCode: string;
  size: string;
  qty: number;
  wholesalePriceRub?: number;
};

type CartSessionGetResponse = {
  ok?: boolean;
  session?: {
    sessionId: string;
    lines: Workshop2CartSessionLine[];
  };
};

/** GET session + optional checkout preflight (MOQ / development gate). */
export async function fetchWorkshop2CartCheckoutPreflight(sessionId?: string): Promise<{
  ok: boolean;
  ready: boolean;
  messageRu: string;
  moqViolations: string[];
  packViolations: string[];
  sizeRunViolations: Array<{ articleId: string; messageRu: string }>;
  firstFailedSizeRunArticleId?: string;
  developmentBlocks: Array<{ articleId: string; messageRu: string }>;
}> {
  const qs = sessionId?.trim()
    ? `?sessionId=${encodeURIComponent(sessionId.trim())}&preflight=1`
    : '?preflight=1';
  try {
    const res = await fetch(`/api/shop/b2b/cart/lines${qs}`, {
      headers: shopB2bCartJsonHeaders(),
    });
    const json = (await res.json()) as {
      ok?: boolean;
      preflight?: {
        ready?: boolean;
        messageRu?: string;
        moqViolations?: string[];
        packViolations?: string[];
        sizeRunViolations?: Array<{ articleId: string; messageRu: string }>;
        firstFailedSizeRunArticleId?: string;
        developmentBlocks?: Array<{ articleId: string; messageRu: string }>;
      };
    };
    const preflight = json.preflight;
    return {
      ok: Boolean(res.ok && json.ok),
      ready: preflight?.ready === true,
      messageRu: preflight?.messageRu ?? 'Не удалось проверить корзину.',
      moqViolations: preflight?.moqViolations ?? [],
      packViolations: preflight?.packViolations ?? [],
      sizeRunViolations: preflight?.sizeRunViolations ?? [],
      firstFailedSizeRunArticleId: preflight?.firstFailedSizeRunArticleId,
      developmentBlocks: preflight?.developmentBlocks ?? [],
    };
  } catch {
    return {
      ok: false,
      ready: false,
      messageRu: 'Сеть недоступна — повторите проверку корзины.',
      moqViolations: [],
      packViolations: [],
      sizeRunViolations: [],
      developmentBlocks: [],
    };
  }
}

/** GET session из cookie `b2b_cart_session` или явного sessionId. */
export async function fetchWorkshop2CartSession(sessionId?: string): Promise<{
  ok: boolean;
  sessionId?: string;
  lines: Workshop2CartSessionLine[];
}> {
  const qs = sessionId?.trim() ? `?sessionId=${encodeURIComponent(sessionId.trim())}` : '';
  try {
    const res = await fetch(`/api/shop/b2b/cart/lines${qs}`, {
      headers: shopB2bCartJsonHeaders(),
    });
    const json = (await res.json()) as CartSessionGetResponse;
    if (!res.ok || !json.ok) return { ok: false, lines: [] };
    return {
      ok: true,
      sessionId: json.session?.sessionId,
      lines: json.session?.lines ?? [],
    };
  } catch {
    return { ok: false, lines: [] };
  }
}

/** Строки W2 session → legacy CartItem для UI матрицы. */
export function mapWorkshop2CartLinesToCartItems(
  lines: Workshop2CartSessionLine[],
  products: Product[],
  collectionId: string
): CartItem[] {
  const collKey = collectionId.trim().toUpperCase();
  const out: CartItem[] = [];
  for (const line of lines) {
    if (line.collectionId.trim().toUpperCase() !== collKey || line.qty <= 0) continue;
    const articleId = line.articleId.trim();
    const product =
      products.find((p) => p.id === articleId || p.sku?.trim() === articleId) ??
      ({
        id: articleId,
        name: articleId,
        sku: articleId,
        price: line.wholesalePriceRub ?? 0,
        images: [],
        category: 'apparel',
      } as unknown as Product);
    const colorCode = line.colorCode?.trim();
    out.push({
      ...product,
      quantity: line.qty,
      selectedSize: line.size?.trim() || 'M',
      price: line.wholesalePriceRub ?? product.price ?? 0,
      ...(colorCode && colorCode !== 'default'
        ? { color: colorCode, selectedColor: colorCode }
        : {}),
    } as CartItem);
  }
  return out;
}

/** Одна строка → POST upsert (persist между refresh до checkout). */
export async function upsertWorkshop2CartLine(input: {
  item: CartItem;
  collectionId: string;
  buyerId?: string;
  sessionId?: string;
  tier?: 'standard' | 'vip' | 'prebook';
}): Promise<{ ok: boolean; sessionId?: string }> {
  const qty = Math.max(0, Math.round(input.item.quantity ?? 0));
  if (qty <= 0 && !input.sessionId?.trim()) {
    return { ok: true, sessionId: input.sessionId };
  }
  const line = {
    ...mapLegacyB2bCartLine(input.item, input.collectionId),
    qty,
  };
  try {
    const res = await fetch('/api/shop/b2b/cart/lines', {
      method: 'POST',
      headers: shopB2bCartJsonHeaders(),
      body: JSON.stringify({
        action: 'upsert',
        sessionId: input.sessionId,
        buyerId: input.buyerId ?? 'buyer-demo',
        tier: input.tier ?? 'standard',
        line,
      }),
    });
    const json = (await res.json()) as CartLineResponse;
    return {
      ok: Boolean(res.ok && json.ok),
      sessionId: json.session?.sessionId ?? input.sessionId,
    };
  } catch {
    return { ok: false, sessionId: input.sessionId };
  }
}

const SS27_ARTICLE_ID_RE = /^demo-ss27-\d{2}$/i;

/** Нормализует id корзины → W2 articleId (SS27 demo / явный articleId). */
export function resolveWorkshop2CartArticleId(
  item: CartItem,
  collectionId: string
): string {
  const ext = item as CartItem & { articleId?: string; sku?: string };
  const fromField = ext.articleId?.trim() || ext.sku?.trim();
  if (fromField) return fromField;
  const id = item.id?.trim() ?? '';
  if (SS27_ARTICLE_ID_RE.test(id)) return id;
  if (collectionId.trim().toUpperCase() === 'SS27' && id.startsWith('demo-ss27')) return id;
  return id || 'demo-ss27-01';
}

export function mapLegacyB2bCartLine(item: CartItem, collectionId: string): LegacyCartBridgeLine {
  const ext = item as CartItem & {
    articleId?: string;
    sku?: string;
    selectedColor?: string;
    color?: string;
  };
  const articleId = resolveWorkshop2CartArticleId(item, collectionId);
  const rawColor = ext.selectedColor?.trim() || ext.color?.trim() || 'default';
  const colorCode = rawColor === 'Core' ? 'default' : rawColor;
  const extPrice = item as CartItem & { wholesalePriceRub?: number; originalPrice?: number };
  const priceRub = extPrice.wholesalePriceRub ?? item.price ?? extPrice.originalPrice;
  return {
    collectionId,
    articleId,
    colorCode,
    size: item.selectedSize?.trim() || 'M',
    qty: Math.max(1, Math.round(item.quantity ?? 1)),
    wholesalePriceRub: priceRub != null && priceRub > 0 ? Math.round(priceRub) : undefined,
    deliveryDate: item.deliveryDate?.trim() || undefined,
  };
}

/** Синхронизирует legacy NuOrder-корзину в W2 session (`/api/shop/b2b/cart/lines`). */
export async function syncLegacyCartToWorkshop2(input: {
  items: CartItem[];
  collectionId?: string;
  buyerId?: string;
  tier?: 'standard' | 'vip' | 'prebook';
  sessionId?: string;
}): Promise<{ ok: boolean; synced: number; failed: number; messageRu: string; sessionId?: string }> {
  const collectionId = input.collectionId?.trim() || 'SS27';
  let synced = 0;
  let failed = 0;
  let sessionId = input.sessionId;

  for (const item of input.items) {
    if (!item.quantity || item.quantity <= 0) continue;
    const line = mapLegacyB2bCartLine(item, collectionId);
    try {
      const res = await fetch('/api/shop/b2b/cart/lines', {
        method: 'POST',
        headers: shopB2bCartJsonHeaders(),
        body: JSON.stringify({
          action: 'upsert',
          sessionId,
          buyerId: input.buyerId ?? 'buyer-demo',
          tier: input.tier ?? 'standard',
          line,
        }),
      });
      const json = (await res.json()) as CartLineResponse;
      if (res.ok && json.ok) {
        synced += 1;
        sessionId = json.session?.sessionId ?? sessionId;
      } else {
        failed += 1;
      }
    } catch {
      failed += 1;
    }
  }

  return {
    ok: synced > 0,
    synced,
    failed,
    sessionId,
    messageRu: synced
      ? `Синхронизировано ${synced} строк в W2-корзину${failed ? `, ${failed} пропущено` : ''}.`
      : 'Не удалось синхронизировать корзину с Workshop2.',
  };
}

function countCartItemUnits(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + Math.max(0, Math.round(item.quantity ?? 0)), 0);
}

function countSessionLineUnits(lines: Workshop2CartSessionLine[]): number {
  return lines.reduce((sum, line) => sum + Math.max(0, Math.round(line.qty ?? 0)), 0);
}

/**
 * Checkout path: при live PG session (upsert на qty) не дублируем full legacy sync.
 */
export async function resolveCheckoutCartSession(input: {
  items: CartItem[];
  collectionId?: string;
  buyerId?: string;
  tier?: 'standard' | 'vip' | 'prebook';
  sessionId?: string;
  /** Platform Core: доверять persisted session, если units совпадают с UI cart. */
  preferPersistedSession?: boolean;
}): Promise<{ ok: boolean; sessionId?: string; messageRu: string }> {
  const sessionId = input.sessionId?.trim();
  if (input.preferPersistedSession && sessionId) {
    const session = await fetchWorkshop2CartSession(sessionId);
    if (session.ok && session.lines.length > 0) {
      const sessionUnits = countSessionLineUnits(session.lines);
      const cartUnits = countCartItemUnits(input.items);
      if (sessionUnits > 0 && (cartUnits === 0 || sessionUnits === cartUnits)) {
        return { ok: true, sessionId: session.sessionId ?? sessionId, messageRu: '' };
      }
    }
  }

  if (input.items.length === 0) {
    if (sessionId) {
      const session = await fetchWorkshop2CartSession(sessionId);
      if (session.ok && session.lines.length > 0) {
        return { ok: true, sessionId: session.sessionId ?? sessionId, messageRu: '' };
      }
    }
    return { ok: false, messageRu: 'Корзина пуста — добавьте позиции в матрице.' };
  }

  const sync = await syncLegacyCartToWorkshop2({
    items: input.items,
    collectionId: input.collectionId,
    buyerId: input.buyerId,
    tier: input.tier,
    sessionId,
  });
  return {
    ok: sync.ok,
    sessionId: sync.sessionId ?? sessionId,
    messageRu: sync.messageRu,
  };
}

export async function checkoutWorkshop2Cart(input: {
  sessionId?: string;
  buyerId?: string;
  orderId?: string;
}): Promise<{ ok: boolean; orderId?: string; messageRu: string }> {
  const res = await fetch('/api/shop/b2b/cart/lines', {
    method: 'POST',
    headers: shopB2bCartJsonHeaders(),
    body: JSON.stringify({
      action: 'checkout',
      sessionId: input.sessionId,
      buyerId: input.buyerId ?? 'buyer-demo',
      orderId: input.orderId,
    }),
  });
  const json = (await res.json()) as CheckoutResponse;
  return {
    ok: Boolean(res.ok && json.ok),
    orderId: json.order?.id,
    messageRu: json.messageRu ?? (json.ok ? 'Заказ создан.' : 'Ошибка оформления.'),
  };
}
