/**
 * SoT: entity-links в Platform Core — скрытые href и core-safe getters.
 * `sanitizeEntityLinksForPlatformCore` в entity-links.ts применяет этот реестр.
 */

import { ROUTES } from '@/lib/platform-core-routes';

/** Side-path href — не показываем в RelatedModulesBlock в core mode. */
export const PLATFORM_CORE_ENTITY_LINK_HIDDEN_HREFS: readonly string[] = [
  ROUTES.brand.preOrders,
  ROUTES.shop.b2bPayment,
  ROUTES.shop.b2bShopifySync,
  ROUTES.shop.b2bWorkspaceMap,
  ROUTES.shop.b2bQuickOrder,
  ROUTES.shop.b2bOrderDrafts,
  ROUTES.shop.b2bOrderTemplates,
  ROUTES.shop.b2bCreateOrder,
  ROUTES.shop.b2bReorder,
  ROUTES.shop.b2bOrderMode,
  ROUTES.shop.b2bWorkingOrder,
  ROUTES.shop.b2bSelectionBuilder,
  ROUTES.shop.b2bWhiteboard,
  ROUTES.shop.b2bPassport,
  ROUTES.shop.b2bLookbooks,
  ROUTES.shop.b2bOrderByCollection,
  ROUTES.shop.b2bEzOrder,
  ROUTES.shop.b2bPreOrder,
  ROUTES.shop.b2bGridOrdering,
  ROUTES.shop.b2bCollaborativeOrder,
  ROUTES.shop.b2bAiSmartOrder,
  ROUTES.shop.b2bQuoteToOrder,
  ROUTES.shop.b2bDeliveryCalendar,
  ROUTES.shop.b2bStockMap,
  ROUTES.shop.b2bDocuments,
  ROUTES.shop.b2bTenders,
  ROUTES.shop.b2bAssortmentPlanning,
  ROUTES.shop.b2bCustomAssortments,
  ROUTES.shop.b2bAssortmentCuration,
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
