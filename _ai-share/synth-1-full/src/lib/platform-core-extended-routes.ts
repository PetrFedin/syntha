/**
 * Platform Core · EXTENDED routes (manufacturer / supplier / factory).
 *
 * Единая точка входа для роутов расширенных ролей. Baseline-файлы
 * (`platform-core-hub-matrix-rows.ts`, `/brand/core`, `/shop/core`) НЕ импортируют
 * этот модуль — только extended-строки за флагом `NEXT_PUBLIC_PC_EXTENDED_ROLES=1`.
 *
 * Пока это фасад над каноническим `platform-core-routes.ts` (rule #9:
 * логическая изоляция сейчас, физический вынос factory-ключей — позже,
 * см. `_platform-core-v1/migration-notes/`).
 */
export {
  ROUTES as PLATFORM_CORE_ROUTES,
  type FactoryMessagesRole,
  factoryProductionDossierHref,
  factoryProductionDossierContextHref,
  factoryCoreOrderProductionCabinetHref,
  factoryProductionOrdersOrderContextHref,
  factoryProductionHandoffQueueHref,
  factoryMessagesB2bOrderContextHref,
  factoryMessagesWorkshop2ArticleContextHref,
  factoryMessagesRoleHref,
  factorySupplierRfqInboxHref,
  factorySupplierMessagesB2bOrderContextHref,
  factorySupplierMessagesWorkshop2ArticleContextHref,
  factoryCalendarB2bOrderContextHref,
  factorySupplierCalendarB2bOrderContextHref,
} from '@/lib/platform-core-routes';

/** Ключи `ROUTES.factory.*` — только для extended-кабинетов. */
export const PLATFORM_CORE_EXTENDED_ROUTE_KEYS = [
  'factory.production',
  'factory.productionCalendar',
  'factory.productionCatalog',
  'factory.productionCoreCabinet',
  'factory.productionMaterials',
  'factory.productionOrders',
  'factory.supplierCoreCabinet',
  'factory.supplierMessages',
  'factory.supplierRfqInbox',
] as const;
