/**
 * Section-aware routing для brand/shop sample_collection в Platform Core cabinet.
 */
import type { BrandScGoldenPathOmitStep } from '@/components/brand/sample/BrandScCabinetGoldenPathStrip';
import type { ShopScGoldenPathOmitStep } from '@/components/platform/ShopScCabinetGoldenPathStrip';
import type { ArticleSpineGoldenStepId } from '@/lib/platform-core-article-spine-golden-path';
import { platformCoreCabinetSectionHref } from '@/lib/platform-core-cabinet-workspace';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-demo-context';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';
import { ROUTES } from '@/lib/platform-core-routes';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';

export const BRAND_SC_LINESHEETS_SECTION = 'brand-sc-linesheets';
export const BRAND_SC_SHOWROOM_SECTION = 'brand-sc-showroom';
export const BRAND_SC_PUBLISH_SECTION = 'brand-sc-publish';
export const SHOP_SC_SHOWROOM_SECTION = 'shop-sc-showroom';

export function resolveBrandScGoldenPathOmitStep(
  sectionId: string | null | undefined
): BrandScGoldenPathOmitStep | undefined {
  const section = sectionId?.trim();
  if (section === BRAND_SC_LINESHEETS_SECTION) return 'linesheets';
  if (section === BRAND_SC_SHOWROOM_SECTION) return 'showroom';
  return undefined;
}

export function resolveShopScGoldenPathOmitStep(
  sectionId: string | null | undefined
): ShopScGoldenPathOmitStep | undefined {
  if (sectionId?.trim() === SHOP_SC_SHOWROOM_SECTION) return 'showroom';
  return undefined;
}

export function resolveBrandScArticleSpineActiveStep(
  sectionId: string | null | undefined
): ArticleSpineGoldenStepId | undefined {
  const section = sectionId?.trim();
  if (section === BRAND_SC_LINESHEETS_SECTION) return 'brand-sc-linesheets';
  return undefined;
}

export function brandScPublishCabinetHref(
  demo: Pick<PlatformCoreDemoContext, 'collectionId' | 'demoOrderId' | 'demoArticleId'>
): string {
  return platformCoreCabinetSectionHref(
    'brand',
    'sample_collection',
    BRAND_SC_PUBLISH_SECTION,
    demo
  );
}

export function shopScShowroomMatrixQuickAddHref(
  collectionId: string,
  articleId: string,
  demo: Pick<PlatformCoreDemoContext, 'collectionId' | 'demoOrderId' | 'demoArticleId'>
): string {
  const base = `${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}&article=${encodeURIComponent(articleId)}`;
  return platformCoreUiHref(base, { ...PLATFORM_CORE_DEMO, ...demo, collectionId });
}
