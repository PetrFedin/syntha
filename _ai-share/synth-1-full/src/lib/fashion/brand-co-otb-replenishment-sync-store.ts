import {
  summarizeBrandCoOtbReplenishmentSync,
  type BrandCoOtbReplenishmentBuyerRow,
  type BrandCoOtbReplenishmentSyncSummary,
} from '@/lib/b2b/brand-co-otb-replenishment-sync';

export type BrandCoOtbReplenishmentSyncResponse = {
  ok: boolean;
  collectionId?: string;
  rows?: BrandCoOtbReplenishmentBuyerRow[];
  summary?: BrandCoOtbReplenishmentSyncSummary;
  otbStorageMode?: string;
  rulesStorageMode?: string;
  messageRu?: string;
};

export async function fetchBrandCoOtbReplenishmentSync(
  collectionId?: string,
  buyerId?: string
): Promise<BrandCoOtbReplenishmentSyncResponse> {
  const params = new URLSearchParams();
  if (collectionId?.trim()) params.set('collectionId', collectionId.trim());
  if (buyerId?.trim()) params.set('buyerId', buyerId.trim());
  const res = await fetch(`/api/brand/b2b/otb/replenishment-sync?${params.toString()}`, {
    cache: 'no-store',
  });
  const json = (await res.json()) as BrandCoOtbReplenishmentSyncResponse;
  if (!res.ok || !json.ok) {
    return {
      ok: false,
      rows: [],
      summary: summarizeBrandCoOtbReplenishmentSync([]),
    };
  }
  return json;
}
