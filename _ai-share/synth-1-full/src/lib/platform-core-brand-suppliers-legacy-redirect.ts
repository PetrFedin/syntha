import { ROUTES } from '@/lib/platform-core-routes';
import {
  factoryMaterialsHrefForDemo,
  getPlatformCoreDemo,
  resolvePageCollectionId,
} from '@/lib/platform-core-hub-matrix';

export const PLATFORM_CORE_BRAND_SUPPLIERS_LEGACY_REDIRECT = {
  path: ROUTES.brand.suppliers,
  messageRu: 'Устаревший реестр поставщиков → BOM материалов (PG)',
  testId: 'platform-core-brand-suppliers-legacy-redirect',
} as const;

export function resolveBrandSuppliersLegacyRedirect(collectionRaw?: string | null): {
  href: string;
  messageRu: string;
  testId: string;
} {
  const demo = getPlatformCoreDemo(resolvePageCollectionId({ collection: collectionRaw }));
  return {
    href: factoryMaterialsHrefForDemo(demo),
    messageRu: PLATFORM_CORE_BRAND_SUPPLIERS_LEGACY_REDIRECT.messageRu,
    testId: PLATFORM_CORE_BRAND_SUPPLIERS_LEGACY_REDIRECT.testId,
  };
}
