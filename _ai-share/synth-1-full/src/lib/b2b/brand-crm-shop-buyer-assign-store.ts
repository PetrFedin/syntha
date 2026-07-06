import type { ShopBuyerCrmProfile } from '@/lib/b2b/shop-buyer-crm-profile';

export async function fetchBrandShopBuyerCrmAssignment(buyerId: string): Promise<{
  profile: ShopBuyerCrmProfile | null;
  storageMode: 'pg' | 'file' | 'memory' | 'demo';
}> {
  const qs = new URLSearchParams({ buyerId });
  const res = await fetch(`/api/brand/b2b/shop-buyer-crm-assign?${qs.toString()}`, {
    cache: 'no-store',
  });
  const json = (await res.json()) as {
    ok?: boolean;
    profile?: ShopBuyerCrmProfile | null;
    storageMode?: 'pg' | 'file' | 'memory' | 'demo';
  };
  if (!res.ok || !json.ok) {
    return { profile: null, storageMode: 'demo' };
  }
  return {
    profile: json.profile ?? null,
    storageMode: json.storageMode ?? 'demo',
  };
}

export type BrandShopBuyerTierSyncResult = {
  ok: boolean;
  tierId?: string;
  shopSynced?: boolean;
  syncedAt?: string;
  skipped?: boolean;
  reason?: string;
};

export async function assignBrandShopBuyerCrmSegment(input: {
  buyerId: string;
  segmentKey: string;
  collectionId?: string;
  syncTierToShop?: boolean;
}): Promise<{
  ok: boolean;
  profile: ShopBuyerCrmProfile | null;
  storageMode: 'pg' | 'file' | 'memory' | 'demo';
  messageRu?: string;
  tierSync?: BrandShopBuyerTierSyncResult;
}> {
  const res = await fetch('/api/brand/b2b/shop-buyer-crm-assign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const json = (await res.json()) as {
    ok?: boolean;
    profile?: ShopBuyerCrmProfile | null;
    storageMode?: 'pg' | 'file' | 'memory' | 'demo';
    messageRu?: string;
    tierSync?: BrandShopBuyerTierSyncResult;
  };
  if (!res.ok || !json.ok) {
    return { ok: false, profile: null, storageMode: 'demo' };
  }
  return {
    ok: true,
    profile: json.profile ?? null,
    storageMode: json.storageMode ?? 'demo',
    messageRu: json.messageRu,
    tierSync: json.tierSync,
  };
}
