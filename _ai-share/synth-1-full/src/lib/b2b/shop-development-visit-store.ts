import type { ShopDevelopmentProgressSnapshot } from '@/lib/server/shop-development-progress-server';

export type ShopDevelopmentVisitStore = {
  versionToken: string;
  snapshot: Pick<
    ShopDevelopmentProgressSnapshot,
    'articleCount' | 'sampleQueueCount' | 'steps'
  >;
  visitedAt: string;
};

function visitKey(collectionId: string): string {
  return `shop-dev-visit:${collectionId.trim()}`;
}

export function readShopDevelopmentVisitStore(
  collectionId: string
): ShopDevelopmentVisitStore | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(visitKey(collectionId));
    if (!raw) return null;
    return JSON.parse(raw) as ShopDevelopmentVisitStore;
  } catch {
    return null;
  }
}

export function writeShopDevelopmentVisitStore(
  collectionId: string,
  store: ShopDevelopmentVisitStore
): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(visitKey(collectionId), JSON.stringify(store));
  } catch {
    // ignore quota / private mode
  }
}
