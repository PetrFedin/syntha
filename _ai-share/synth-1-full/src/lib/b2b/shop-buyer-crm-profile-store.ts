import type { ShopBuyerCrmProfile } from '@/lib/b2b/shop-buyer-crm-profile';
import {
  SHOP_EMPTY27_BUYER_PROFILE_API,
  SHOP_EMPTY27_ONBOARDING_COLLECTION_ID,
  resolveShopEmpty27BuyerProfileSeedSegmentKey,
  shopEmpty27BuyerProfileSeedNoteRu,
} from '@/lib/b2b/shop-sc-empty27-buyer-profile-wave-ym';

export async function fetchShopBuyerCrmProfile(buyerId: string): Promise<{
  profile: ShopBuyerCrmProfile | null;
  storageMode: 'pg' | 'file' | 'memory' | 'demo';
}> {
  const qs = new URLSearchParams({ buyerId });
  const res = await fetch(`${SHOP_EMPTY27_BUYER_PROFILE_API}?${qs.toString()}`, {
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

/** Wave YM — EMPTY27 onboarding PG buyer profile seed (shop-side write). */
export async function postShopBuyerCrmProfileOnboardingSeed(input: {
  buyerId: string;
  collectionId?: string;
  segmentKey?: string;
}): Promise<{
  ok: boolean;
  profile: ShopBuyerCrmProfile | null;
  storageMode: 'pg' | 'file' | 'memory' | 'demo';
  messageRu?: string;
}> {
  const buyerId = input.buyerId.trim();
  const segmentKey =
    input.segmentKey?.trim() || resolveShopEmpty27BuyerProfileSeedSegmentKey(buyerId);
  const res = await fetch(SHOP_EMPTY27_BUYER_PROFILE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      buyerId,
      collectionId: input.collectionId?.trim() || SHOP_EMPTY27_ONBOARDING_COLLECTION_ID,
      action: 'seed',
      segmentKey,
      onboardingNoteRu: shopEmpty27BuyerProfileSeedNoteRu(buyerId),
    }),
  });
  const json = (await res.json()) as {
    ok?: boolean;
    profile?: ShopBuyerCrmProfile | null;
    storageMode?: 'pg' | 'file' | 'memory' | 'demo';
    messageRu?: string;
  };
  if (!res.ok || !json.ok) {
    return { ok: false, profile: null, storageMode: 'demo', messageRu: json.messageRu };
  }
  return {
    ok: true,
    profile: json.profile ?? null,
    storageMode: json.storageMode ?? 'demo',
    messageRu: json.messageRu,
  };
}
