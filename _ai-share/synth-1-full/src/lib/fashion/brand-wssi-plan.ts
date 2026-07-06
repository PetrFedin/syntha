import type { AssortmentMixV1 } from '@/lib/fashion/types';
import { calculateAssortmentMix } from '@/lib/fashion/assortment-mix-logic';
import type { Product } from '@/lib/types';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { shopReplenishmentTabHref } from '@/lib/b2b/shop-collection-order-hrefs';
import { ROUTES, shopB2bCheckoutCollectionHref, shopB2bMatrixOrderContextHref } from '@/lib/routes';
import { workshop2ArticleHref } from '@/lib/production/workshop2-url';

export type BrandWssiCapacityRow = {
  id: string;
  labelRu: string;
  plannedUnits: number;
  capacityUnits: number;
  utilizationPct: number;
};

export function summarizeBrandWssiMix(rows: readonly AssortmentMixV1[]): {
  categories: number;
  overAssorted: number;
  underAssorted: number;
} {
  const overAssorted = rows.filter((r) => r.gap > 10).length;
  const underAssorted = rows.filter((r) => r.gap < -10).length;
  return { categories: rows.length, overAssorted, underAssorted };
}

export function buildBrandWssiMixRows(products: readonly Product[]): AssortmentMixV1[] {
  return calculateAssortmentMix([...products]);
}

export function buildBrandWssiCapacityRows(input?: {
  collectionId?: string;
}): BrandWssiCapacityRow[] {
  const seed = (input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId).length;
  const base = 1200 + seed * 40;
  return [
    {
      id: 'cut',
      labelRu: 'Cut · sewing',
      plannedUnits: base,
      capacityUnits: base + 180,
      utilizationPct: Math.round((base / (base + 180)) * 100),
    },
    {
      id: 'finish',
      labelRu: 'Finish · QC',
      plannedUnits: Math.round(base * 0.92),
      capacityUnits: base,
      utilizationPct: Math.round(((base * 0.92) / base) * 100),
    },
  ];
}

export function brandWssiShopMatrixHref(
  collectionId: string = PLATFORM_CORE_DEMO.collectionId,
  orderId?: string
): string {
  if (orderId?.trim()) {
    return shopB2bMatrixOrderContextHref(orderId.trim());
  }
  return `${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}`;
}

export function brandWssiSupplyHref(
  collectionId: string = PLATFORM_CORE_DEMO.collectionId,
  articleId: string = PLATFORM_CORE_DEMO.demoArticleId
): string {
  return workshop2ArticleHref(collectionId, articleId, { w2pane: 'supply' });
}

export function brandWssiMixCsvHref(): string {
  return ROUTES.brand.assortmentMix;
}

export function brandWssiOtbHref(): string {
  return `${ROUTES.brand.assortmentMixPlanner}?${PILLAR_CAPABILITY_FEATURE_PARAM}=otb`;
}

export function brandWssiFeatureHref(
  featureId: 'otb' | 'mix' | 'capacity',
  collectionId: string = PLATFORM_CORE_DEMO.collectionId
): string {
  return `${ROUTES.brand.assortmentMixPlanner}?${PILLAR_CAPABILITY_FEATURE_PARAM}=${featureId}&collection=${encodeURIComponent(collectionId)}`;
}

export function brandWssiShowroomHref(collectionId: string = PLATFORM_CORE_DEMO.collectionId): string {
  return `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(collectionId)}`;
}

export function brandWssiCheckoutHref(collectionId: string = PLATFORM_CORE_DEMO.collectionId): string {
  return shopB2bCheckoutCollectionHref(collectionId);
}

/** Wave VR · OTB/WSSI → shop replenishment rules (extend wave UC). */
export function brandWssiShopReplenishmentRulesHref(
  collectionId: string = PLATFORM_CORE_DEMO.collectionId,
  orderId?: string
): string {
  return shopReplenishmentTabHref('rules', collectionId, orderId);
}
