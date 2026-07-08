import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import type { PriceList } from '@/lib/b2b/price-lists';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { ROUTES, shopB2bMatrixOrderContextHref } from '@/lib/routes';

export function summarizeBrandPricelistVersions(lists: readonly PriceList[]): {
  total: number;
  active: number;
  channels: number;
} {
  const today = new Date().toISOString().slice(0, 10);
  const active = lists.filter((pl) => pl.validFrom <= today && pl.validTo >= today).length;
  const channels = new Set(lists.map((pl) => pl.channel)).size;
  return { total: lists.length, active, channels };
}

export function brandPricelistShopMatrixHref(
  collectionId: string = PLATFORM_CORE_DEMO.collectionId,
  orderId?: string
): string {
  if (orderId?.trim()) {
    return shopB2bMatrixOrderContextHref(orderId.trim());
  }
  return `${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}`;
}

export function brandPricelistLandedMarginHref(): string {
  return `${LEGACY_ROUTES.shop.b2bMarginAnalysis}?${PILLAR_CAPABILITY_FEATURE_PARAM}=pricelist`;
}

export function brandPricelistTiersHref(): string {
  return `${LEGACY_ROUTES.brand.priceLists}?${PILLAR_CAPABILITY_FEATURE_PARAM}=tiers`;
}
