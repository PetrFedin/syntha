import {
  summarizeBrandCoOtbReplenishmentSync,
  type BrandCoOtbReplenishmentBuyerRow,
  type BrandCoOtbReplenishmentSyncSummary,
} from '@/lib/b2b/brand-co-otb-replenishment-sync';
import { BRAND_CO_OTB_PLAN_SYNC_API } from '@/lib/b2b/brand-co-otb-wave-xv';

export type BrandCoOtbPlanSyncResponse = {
  ok: boolean;
  collectionId?: string;
  rows?: BrandCoOtbReplenishmentBuyerRow[];
  summary?: BrandCoOtbReplenishmentSyncSummary;
  planSync?: {
    otbStorageMode?: string;
    rulesStorageMode?: string;
    linkedPresetIds?: string[];
    buyersWithRules?: number;
  };
  otbStorageMode?: string;
  rulesStorageMode?: string;
  messageRu?: string;
};

export async function fetchBrandCoOtbPlanSync(
  collectionId?: string,
  buyerId?: string
): Promise<BrandCoOtbPlanSyncResponse> {
  const params = new URLSearchParams();
  if (collectionId?.trim()) params.set('collectionId', collectionId.trim());
  if (buyerId?.trim()) params.set('buyerId', buyerId.trim());
  const res = await fetch(`${BRAND_CO_OTB_PLAN_SYNC_API}?${params.toString()}`, {
    cache: 'no-store',
  });
  const json = (await res.json()) as BrandCoOtbPlanSyncResponse;
  if (!res.ok || !json.ok) {
    return {
      ok: false,
      rows: [],
      summary: summarizeBrandCoOtbReplenishmentSync([]),
    };
  }
  return json;
}
