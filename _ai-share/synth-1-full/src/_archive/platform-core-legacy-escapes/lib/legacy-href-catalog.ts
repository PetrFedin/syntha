/**
 * ARCHIVE ONLY — не импортировать в runtime Platform Core.
 * Снимок legacy href-паттернов до изоляции (2026-06).
 * Активный резолвер: `@/lib/platform-core-native-href`.
 */

/** Примеры href, которые раньше уводили из /platform в long-tail legacy UI. */
export const PLATFORM_CORE_LEGACY_HREF_EXAMPLES = {
  brandWorkshop2Hub: '/brand/production/workshop2?w2col=SS27',
  shopB2bMatrix: '/shop/b2b/matrix?collection=SS27',
  shopB2bShowroom: '/shop/b2b/showroom?collection=SS27',
  shopB2bCheckout: '/shop/b2b/checkout?collection=SS27',
  shopB2bOrdersRegistry: '/shop/b2b/orders',
  brandB2bOrdersRegistry: '/brand/b2b-orders',
  factoryProductionHome: '/factory/production',
  factorySupplierHome: '/factory/supplier',
} as const;

export type PlatformCoreLegacyHrefExampleKey = keyof typeof PLATFORM_CORE_LEGACY_HREF_EXAMPLES;
