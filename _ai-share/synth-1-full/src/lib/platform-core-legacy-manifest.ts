/**
 * Инвентарь legacy-файлов Platform Core (non-core path).
 * В `NEXT_PUBLIC_PLATFORM_CORE_MODE=1` page-split рендерит *-core.tsx; legacy остаётся для full app.
 * Side-paths в core → guards (`platform-core-side-paths-registry.ts`).
 */

export type PlatformCoreLegacyEntryKind = 'page-split' | 'tail-guard' | 'redirect-component';

export type PlatformCoreLegacyManifestEntry = {
  /** Относительно `src/` */
  path: string;
  kind: PlatformCoreLegacyEntryKind;
};

/** Page-split legacy (51 файлов *-legacy.tsx под src/app). */
export const PLATFORM_CORE_LEGACY_PAGE_SPLITS: readonly PlatformCoreLegacyManifestEntry[] = [
  {
    path: '_archive/platform-core-legacy/app/brand/b2b-orders/b2b-orders-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/brand/b2b-orders/[orderId]/brand-order-detail-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/brand/calendar/calendar-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/brand/factories/[id]/factory-detail-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/brand/linesheets/linesheets-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/brand/messages/messages-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/brand/pre-orders/pre-orders-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/brand/production/workshop2/workshop2-hub-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/brand/profile/brand-profile-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/brand/range-planner/range-planner-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/brand/retailers/retailers-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/brand/retailers/[id]/retailer-detail-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/brand/showroom/showroom-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/factory/calendar/calendar-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/factory/production/calendar/production-calendar-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/factory/production/materials/materials-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/factory/production/messages/messages-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/factory/production/production-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/factory/supplier/supplier-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/ai-smart-order/ai-smart-order-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/catalog/catalog-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/calendar/calendar-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/checkout/checkout-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/collaborative-order/collaborative-order-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/create-order/create-order-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/discover/discover-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/ez-order/ez-order-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/grid-ordering/grid-ordering-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/lookbooks/lookbooks-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/order-by-collection/order-by-collection-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/order-mode/order-mode-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/orders/orders-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/orders/[orderId]/shop-order-detail-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/partners/discover/partners-discover-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/partners/partners-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/partners/[brandId]/partner-brand-detail-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/passport/passport-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/payment/payment-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/pre-order/pre-order-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/quick-order/quick-order-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/quote-to-order/quote-to-order-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/reorder/reorder-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/selection-builder/selection-builder-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/shopify-sync/shopify-sync-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/showroom/showroom-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/tracking/tracking-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/whiteboard/whiteboard-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/working-order/working-order-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b/workspace-map/workspace-map-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b-orders/orders-legacy-list.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/b2b-orders/[orderId]/shop-b2b-orders-order-detail-legacy.tsx',
    kind: 'page-split',
  },
  {
    path: '_archive/platform-core-legacy/app/shop/messages/messages-legacy.tsx',
    kind: 'page-split',
  },
] as const;

/** Не смонтированные hub/UI компоненты — вынесены из `components/platform/`. */
export const PLATFORM_CORE_LEGACY_UNMOUNTED_COMPONENTS: readonly PlatformCoreLegacyManifestEntry[] =
  [
    {
      path: '_archive/platform-core-legacy/components/platform/PlatformCoreReadinessScorecard.tsx',
      kind: 'redirect-component',
    },
    {
      path: '_archive/platform-core-legacy/components/platform/PlatformCoreDemoTrail.tsx',
      kind: 'redirect-component',
    },
    {
      path: '_archive/platform-core-legacy/components/platform/PlatformHubDemoContext.tsx',
      kind: 'redirect-component',
    },
    {
      path: '_archive/platform-core-legacy/components/platform/PlatformCorePillarRoleMap.tsx',
      kind: 'redirect-component',
    },
    {
      path: '_archive/platform-core-legacy/components/platform/PlatformCoreInvestorWalkthrough.tsx',
      kind: 'redirect-component',
    },
    {
      path: '_archive/platform-core-legacy/components/platform/SupplierRfqReadonlyPanel.tsx',
      kind: 'redirect-component',
    },
  ] as const;

export const PLATFORM_CORE_LEGACY_REDIRECT_COMPONENTS: readonly PlatformCoreLegacyManifestEntry[] =
  [
    { path: 'components/platform/PlatformCoreLegacyPathRedirect.tsx', kind: 'redirect-component' },
    { path: 'components/platform/PlatformCoreLegacyTailPage.tsx', kind: 'redirect-component' },
    {
      path: 'components/platform/PlatformCoreLegacyB2bOrderRedirect.tsx',
      kind: 'redirect-component',
    },
    { path: 'components/platform/PlatformCoreShopB2bLegacyGuard.tsx', kind: 'redirect-component' },
    { path: 'components/platform/PlatformCoreBrandB2bLegacyGuard.tsx', kind: 'redirect-component' },
    { path: 'app/shop/b2b/shop-b2b-legacy-tail-core.tsx', kind: 'tail-guard' },
    { path: 'app/factory/supplier/supplier-legacy-gate.tsx', kind: 'tail-guard' },
  ] as const;

export function platformCoreLegacyManifestStats(): {
  pageSplitCount: number;
  redirectComponentCount: number;
  unmountedComponentCount: number;
  total: number;
} {
  const pageSplitCount = PLATFORM_CORE_LEGACY_PAGE_SPLITS.length;
  const redirectComponentCount = PLATFORM_CORE_LEGACY_REDIRECT_COMPONENTS.length;
  const unmountedComponentCount = PLATFORM_CORE_LEGACY_UNMOUNTED_COMPONENTS.length;
  return {
    pageSplitCount,
    redirectComponentCount,
    unmountedComponentCount,
    total: pageSplitCount + redirectComponentCount + unmountedComponentCount,
  };
}
