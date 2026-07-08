/**
 * Bridge for readiness audit sections — baseline + extended routes without `@/lib/routes`.
 * Импортировать только из `platform-core-readiness-sections/*` и tests.
 */
export {
  ROUTES,
  brandB2bOrderChainContextHref,
  brandB2bOrderDossierContextHref,
  brandB2bOrderHandoffContextHref,
  brandB2bOrderHref,
  brandB2bOrdersAwaitingHandoffRegistryHref,
  brandB2bOrdersProductionRegistryHref,
  brandCoreOrderProductionCabinetHref,
  brandCalendarB2bOrderContextHref,
  brandDevelopmentCabinetHref,
  brandDevelopmentArticleHref,
  brandMessagesB2bOrderContextHref,
  brandMessagesWorkshop2ArticleContextHref,
  brandW2ProductionTzHref,
  shopB2bOrderHref,
  shopB2bOrderProductionContextHref,
  shopB2bOrdersProductionRegistryHref,
  shopB2bTrackingOrderHref,
  shopCalendarB2bOrderContextHref,
  shopMessagesB2bOrderContextHref,
} from '@/lib/platform-core-routes';

export {
  factoryCalendarB2bOrderContextHref,
  factoryCoreOrderProductionCabinetHref,
  factoryMessagesB2bOrderContextHref,
  factoryMessagesWorkshop2ArticleContextHref,
  factoryProductionDossierContextHref,
  factoryProductionDossierHref,
  factoryProductionOrdersOrderContextHref,
  factorySupplierCalendarB2bOrderContextHref,
  factorySupplierCoreOrderProductionCabinetHref,
  factorySupplierMessagesB2bOrderContextHref,
  factorySupplierMessagesWorkshop2ArticleContextHref,
  factorySupplierRfqInboxHref,
  ROUTES as EXTENDED_ROUTES,
} from '@/lib/platform-core-extended-routes';

export { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
