import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { shouldUseLocalStorageClientFallbackInCore } from '@/lib/production/workshop2-pg-read-path-policy';

export type ShopBuyerAssortmentWishlistEntry = {
  articleId: string;
  collectionId: string;
  note?: string;
  addedAt?: string;
};

const LS_KEY = 'syntha.shop.dev.assortmentWishlist.v1';

type LocalWishlistStore = Record<string, ShopBuyerAssortmentWishlistEntry[]>;

function scopeKey(buyerId: string, collectionId: string): string {
  return `${buyerId}::${collectionId}`;
}

function readLocalWishlist(
  buyerId: string,
  collectionId: string
): ShopBuyerAssortmentWishlistEntry[] {
  if (!shouldUseLocalStorageClientFallbackInCore() || typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const store = JSON.parse(raw) as LocalWishlistStore;
    return store[scopeKey(buyerId, collectionId)] ?? [];
  } catch {
    return [];
  }
}

function writeLocalWishlist(
  buyerId: string,
  collectionId: string,
  items: ShopBuyerAssortmentWishlistEntry[]
): void {
  if (!shouldUseLocalStorageClientFallbackInCore() || typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    const store = raw ? (JSON.parse(raw) as LocalWishlistStore) : {};
    store[scopeKey(buyerId, collectionId)] = items;
    window.localStorage.setItem(LS_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

export async function fetchShopBuyerAssortmentWishlist(input: {
  buyerId: string;
  collectionId: string;
}): Promise<{ items: ShopBuyerAssortmentWishlistEntry[]; storageMode?: string }> {
  const qs = new URLSearchParams({
    buyerId: input.buyerId,
    collectionId: input.collectionId,
  });
  const res = await fetch(`/api/shop/b2b/development/assortment-wishlist?${qs}`, {
    headers: buildWorkshop2ApiRequestHeaders(),
    cache: 'no-store',
  });
  const json = (await res.json()) as {
    items?: ShopBuyerAssortmentWishlistEntry[];
    storageMode?: string;
  };
  if (res.ok && json.items) {
    return {
      items: json.items.map((item) => ({
        articleId: item.articleId,
        collectionId: item.collectionId,
        note: item.note,
        addedAt: item.addedAt,
      })),
      storageMode: json.storageMode,
    };
  }
  return { items: readLocalWishlist(input.buyerId, input.collectionId) };
}

export async function addShopBuyerAssortmentWishlist(input: {
  buyerId: string;
  collectionId: string;
  articleId: string;
  note?: string;
}): Promise<{ ok: boolean; storageMode?: string }> {
  const res = await fetch('/api/shop/b2b/development/assortment-wishlist', {
    method: 'POST',
    headers: {
      ...buildWorkshop2ApiRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  const json = (await res.json()) as { ok?: boolean; storageMode?: string };
  if (res.ok && json.ok) {
    return { ok: true, storageMode: json.storageMode };
  }
  if (!shouldUseLocalStorageClientFallbackInCore()) {
    return { ok: false, storageMode: json.storageMode };
  }
  const items = readLocalWishlist(input.buyerId, input.collectionId);
  const next: ShopBuyerAssortmentWishlistEntry[] = [
    { articleId: input.articleId, collectionId: input.collectionId, note: input.note },
    ...items.filter((i) => i.articleId !== input.articleId),
  ];
  writeLocalWishlist(input.buyerId, input.collectionId, next);
  return { ok: true, storageMode: 'local' };
}

export async function removeShopBuyerAssortmentWishlist(input: {
  buyerId: string;
  collectionId: string;
  articleId: string;
}): Promise<{ ok: boolean }> {
  const qs = new URLSearchParams({
    buyerId: input.buyerId,
    collectionId: input.collectionId,
    articleId: input.articleId,
  });
  const res = await fetch(`/api/shop/b2b/development/assortment-wishlist?${qs}`, {
    method: 'DELETE',
    headers: buildWorkshop2ApiRequestHeaders(),
  });
  const json = (await res.json()) as { ok?: boolean };
  if (res.ok && json.ok) {
    return { ok: true };
  }
  if (!shouldUseLocalStorageClientFallbackInCore()) {
    return { ok: false };
  }
  const items = readLocalWishlist(input.buyerId, input.collectionId).filter(
    (i) => i.articleId !== input.articleId
  );
  writeLocalWishlist(input.buyerId, input.collectionId, items);
  return { ok: true };
}

export async function requestShopDevelopmentSample(input: {
  buyerId: string;
  collectionId: string;
  articleId: string;
  note?: string;
}): Promise<{ ok: boolean; messageRu?: string }> {
  const res = await fetch('/api/shop/b2b/development/request-sample', {
    method: 'POST',
    headers: {
      ...buildWorkshop2ApiRequestHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  const json = (await res.json()) as { ok?: boolean; messageRu?: string };
  return { ok: res.ok && json.ok === true, messageRu: json.messageRu };
}
