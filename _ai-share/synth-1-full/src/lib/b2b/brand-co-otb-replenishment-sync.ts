import type { BrandWssiMixFeedRow } from '@/lib/fashion/brand-wssi-otb-feed';
import { REPLENISHMENT_RULE_PRESETS } from '@/lib/shop/shop-replenishment-rules-presets';
import { shopReplenishmentTabHref } from '@/lib/b2b/shop-collection-order-hrefs';
import { brandWssiFeatureHref } from '@/lib/fashion/brand-wssi-plan';

export type BrandCoOtbReplenishmentSyncStatus = 'aligned' | 'review' | 'pending';

export type BrandCoOtbReplenishmentBuyerRow = {
  buyerId: string;
  buyerLabelRu: string;
  activePresetId: string | null;
  presetTitleRu: string | null;
  otbCategories: number;
  overAssorted: number;
  underAssorted: number;
  syncStatus: BrandCoOtbReplenishmentSyncStatus;
  rulesHref: string;
};

export type BrandCoOtbReplenishmentSyncSummary = {
  buyers: number;
  aligned: number;
  review: number;
  pending: number;
};

const BUYER_LABELS: Record<string, string> = {
  shop1: 'Магазин 1',
  shop2: 'Магазин 2',
};

export function resolveBrandCoOtbReplenishmentPresetTitle(
  activePresetId: string | null
): string | null {
  if (!activePresetId) return null;
  return (
    REPLENISHMENT_RULE_PRESETS.find((preset) => preset.id === activePresetId)?.titleRu ??
    activePresetId
  );
}

export function evaluateBrandCoOtbReplenishmentSync(input: {
  mix: readonly BrandWssiMixFeedRow[];
  activePresetId: string | null;
}): Pick<
  BrandCoOtbReplenishmentBuyerRow,
  'otbCategories' | 'overAssorted' | 'underAssorted' | 'syncStatus'
> {
  const overAssorted = input.mix.filter((row) => row.gap > 10).length;
  const underAssorted = input.mix.filter((row) => row.gap < -10).length;
  const otbCategories = input.mix.length;

  if (!input.activePresetId) {
    return { otbCategories, overAssorted, underAssorted, syncStatus: 'pending' };
  }

  if (input.activePresetId === 'fashion-eos') {
    return {
      otbCategories,
      overAssorted,
      underAssorted,
      syncStatus: overAssorted > 0 ? 'aligned' : underAssorted > 0 ? 'review' : 'aligned',
    };
  }

  if (input.activePresetId === 'basic-low-sold') {
    return {
      otbCategories,
      overAssorted,
      underAssorted,
      syncStatus: underAssorted > 0 ? 'aligned' : overAssorted > 0 ? 'review' : 'aligned',
    };
  }

  return { otbCategories, overAssorted, underAssorted, syncStatus: 'review' };
}

export function summarizeBrandCoOtbReplenishmentSync(
  rows: readonly BrandCoOtbReplenishmentBuyerRow[]
): BrandCoOtbReplenishmentSyncSummary {
  return {
    buyers: rows.length,
    aligned: rows.filter((row) => row.syncStatus === 'aligned').length,
    review: rows.filter((row) => row.syncStatus === 'review').length,
    pending: rows.filter((row) => row.syncStatus === 'pending').length,
  };
}

export function buildBrandCoOtbReplenishmentBuyerRow(input: {
  buyerId: string;
  collectionId: string;
  orderId?: string;
  mix: readonly BrandWssiMixFeedRow[];
  activePresetId: string | null;
}): BrandCoOtbReplenishmentBuyerRow {
  const sync = evaluateBrandCoOtbReplenishmentSync({
    mix: input.mix,
    activePresetId: input.activePresetId,
  });
  const buyerId = input.buyerId.trim() || 'shop1';
  return {
    buyerId,
    buyerLabelRu: BUYER_LABELS[buyerId] ?? buyerId,
    activePresetId: input.activePresetId,
    presetTitleRu: resolveBrandCoOtbReplenishmentPresetTitle(input.activePresetId),
    rulesHref: shopReplenishmentTabHref('rules', input.collectionId, input.orderId),
    ...sync,
  };
}

export function brandCoOtbReplenishmentSyncOtbHref(collectionId: string): string {
  return brandWssiFeatureHref('otb', collectionId);
}

export function brandCoOtbReplenishmentSyncRulesHref(
  collectionId: string,
  orderId?: string
): string {
  return shopReplenishmentTabHref('rules', collectionId, orderId);
}
