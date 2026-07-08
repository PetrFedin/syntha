/**
 * Platform Core horizontal services — pillar-agnostic infrastructure.
 * Import gateways/BFF from here in new code; do not embed service logic inside pillar cards.
 */
export {
  getPlatformCoreDocumentsForArticle,
  getPlatformCoreQcForArticle,
  getPlatformCoreShipmentForOrder,
  getPlatformCoreCommsForArticle,
  getPlatformCoreCommsForOrder,
  getPlatformCoreCapacityForOrder,
  getPlatformCoreExceptionForOrder,
  getPlatformCoreBomCostingForArticle,
  getPlatformCoreRfqForArticle,
  getPlatformCoreDppForArticle,
} from '@/lib/platform-core-gateways';

/** Documents — files, packing lists, closeout stages. */
export type { PlatformCoreDocumentKind, PlatformCoreDocumentStage } from '@/lib/platform-core-gateways/documents-gateway';

/** Comms — contextual threads (article | order). */
export type {
  PlatformCoreEntityType,
  PlatformCoreEntityRef,
  PlatformCoreEntityThreadSnapshot,
  PlatformCoreCalendarSnapshot,
} from '@/lib/platform-core-gateways/entity-comms-gateway';
