import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
/**
 * SoT: entity-links в Platform Core — скрытые href и core-safe getters.
 * `sanitizeEntityLinksForPlatformCore` в entity-links.ts применяет этот реестр.
 */

import { ROUTES } from '@/lib/platform-core-routes';

/** Side-path href — не показываем в RelatedModulesBlock в core mode. */
export const PLATFORM_CORE_ENTITY_LINK_HIDDEN_HREFS: readonly string[] = [
  ROUTES.brand.preOrders,
  LEGACY_ROUTES.shop.b2bPayment,
  LEGACY_ROUTES.shop.b2bShopifySync,
  LEGACY_ROUTES.shop.b2bWorkspaceMap,
  LEGACY_ROUTES.shop.b2bQuickOrder,
  LEGACY_ROUTES.shop.b2bOrderDrafts,
  LEGACY_ROUTES.shop.b2bOrderTemplates,
  ROUTES.shop.b2bCreateOrder,
  LEGACY_ROUTES.shop.b2bReorder,
  LEGACY_ROUTES.shop.b2bOrderMode,
  ROUTES.shop.b2bWorkingOrder,
  LEGACY_ROUTES.shop.b2bSelectionBuilder,
  LEGACY_ROUTES.shop.b2bWhiteboard,
  LEGACY_ROUTES.shop.b2bPassport,
  LEGACY_ROUTES.shop.b2bLookbooks,
  LEGACY_ROUTES.shop.b2bOrderByCollection,
  LEGACY_ROUTES.shop.b2bEzOrder,
  LEGACY_ROUTES.shop.b2bPreOrder,
  LEGACY_ROUTES.shop.b2bGridOrdering,
  LEGACY_ROUTES.shop.b2bCollaborativeOrder,
  LEGACY_ROUTES.shop.b2bAiSmartOrder,
  LEGACY_ROUTES.shop.b2bQuoteToOrder,
  LEGACY_ROUTES.shop.b2bDeliveryCalendar,
  LEGACY_ROUTES.shop.b2bStockMap,
  LEGACY_ROUTES.shop.b2bDocuments,
  LEGACY_ROUTES.shop.b2bTenders,
  LEGACY_ROUTES.shop.b2bAssortmentPlanning,
  LEGACY_ROUTES.shop.b2bCustomAssortments,
  LEGACY_ROUTES.shop.b2bAssortmentCuration,
] as const;

export function platformCoreEntityLinkHiddenSet(): ReadonlySet<string> {
  return new Set(PLATFORM_CORE_ENTITY_LINK_HIDDEN_HREFS);
}

/** Getters с веткой `isPlatformCoreMode()` — golden path only. */
export const PLATFORM_CORE_ENTITY_LINK_SAFE_GETTERS = [
  'getShopB2BHubLinks',
  'sanitizeEntityLinksForPlatformCore',
  'finalizeRelatedModuleLinks',
] as const;
