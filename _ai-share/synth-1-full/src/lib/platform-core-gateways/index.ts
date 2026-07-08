/** Platform Core adapter read gateways (узкий слой, без lib/production UI). */
export { getPlatformCoreBomCostingForArticle } from './bom-costing-gateway';
export { getPlatformCoreRfqForArticle } from './rfq-gateway';
export { getPlatformCoreQcForArticle } from './qc-gateway';
export { getPlatformCoreDocumentsForArticle } from './documents-gateway';
export { getPlatformCoreDppForArticle } from './dpp-gateway';
export { getPlatformCoreCapacityForOrder } from './capacity-gateway';
export { getPlatformCoreShipmentForOrder } from './shipment-gateway';
export {
  getPlatformCoreCommsForArticle,
  getPlatformCoreCommsForOrder,
} from './entity-comms-gateway';
export { getPlatformCoreExceptionForOrder } from './exception-sla-gateway';
